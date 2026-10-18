// Read-only snapshot of everything that matters before the Clerk -> Firebase Auth migration:
//   - every Firestore document (all collections, recursing into subcollections)
//   - every Clerk user (profile, emails, linked Google accounts - NOT passwords; those come from
//     the Clerk dashboard CSV export)
// Writes to backups/<timestamp>/ (git-ignored: it contains personal data). Changes nothing.
//
// Usage: node scripts/backup-data.mjs

import fs from 'node:fs';
import path from 'node:path';
import nextEnv from '@next/env';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

nextEnv.loadEnvConfig(process.cwd());

const db = getFirestore(
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    })
);

function serialize(value) {
    if (value instanceof Timestamp) return { __timestamp: value.toDate().toISOString() };
    if (Array.isArray(value)) return value.map(serialize);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
    }
    return value;
}

let docCount = 0;
async function dumpCollection(colRef) {
    const snapshot = await colRef.get();
    const out = {};
    for (const doc of snapshot.docs) {
        docCount++;
        const subs = await doc.ref.listCollections();
        const entry = { data: serialize(doc.data()) };
        if (subs.length) {
            entry.subcollections = {};
            for (const sub of subs) entry.subcollections[sub.id] = await dumpCollection(sub);
        }
        out[doc.id] = entry;
    }
    // Documents that exist only as parents of subcollections (e.g. leaderboard/hard) have no
    // data of their own and don't show up in .get(); pick them up through listDocuments().
    const refs = await colRef.listDocuments();
    for (const ref of refs) {
        if (out[ref.id]) continue;
        const subs = await ref.listCollections();
        if (!subs.length) continue;
        const entry = { data: null, subcollections: {} };
        for (const sub of subs) entry.subcollections[sub.id] = await dumpCollection(sub);
        out[ref.id] = entry;
    }
    return out;
}

async function fetchAllClerkUsers() {
    const all = [];
    for (let offset = 0; ; offset += 100) {
        const res = await fetch(`https://api.clerk.com/v1/users?limit=100&offset=${offset}&order_by=created_at`, {
            headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
        });
        if (!res.ok) throw new Error(`Clerk API ${res.status}: ${await res.text()}`);
        const page = await res.json();
        all.push(...page);
        if (page.length < 100) return all;
    }
}

const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
const dir = path.join(process.cwd(), 'backups', stamp);
fs.mkdirSync(dir, { recursive: true });

const firestore = {};
for (const col of await db.listCollections()) {
    firestore[col.id] = await dumpCollection(col);
    console.log(`firestore/${col.id}: ${Object.keys(firestore[col.id]).length} top-level docs`);
}
fs.writeFileSync(path.join(dir, 'firestore.json'), JSON.stringify(firestore, null, 2));

const clerkUsers = await fetchAllClerkUsers();
fs.writeFileSync(path.join(dir, 'clerk-users.json'), JSON.stringify(clerkUsers, null, 2));
console.log(`clerk: ${clerkUsers.length} users`);
console.log(`\nSaved ${docCount} Firestore docs + ${clerkUsers.length} Clerk users to ${dir}`);
