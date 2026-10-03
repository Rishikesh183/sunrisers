// Rewrites each Firestore `users/{uid}` doc's displayName from Clerk, username-first
// (username -> full name -> email prefix), and stores the raw `username` too. Non-destructive:
// merges only username/displayName/displayNameLower/photoURL; createdAt and everything else stays.
// Also creates docs for Clerk users that never got one (e.g. sign-ups before the webhook was set up).
//
// Usage (reads .env.local):
//   node scripts/backfill-usernames.mjs            # dry run - prints what would change
//   node scripts/backfill-usernames.mjs --apply    # writes to Firestore

import nextEnv from '@next/env';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { pickDisplayName } from '../lib/userName.js';

nextEnv.loadEnvConfig(process.cwd()); // same .env.local parsing Next.js itself uses

const apply = process.argv.includes('--apply');
const db = getFirestore(
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n'),
        }),
    })
);

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

const users = await fetchAllClerkUsers();
let changed = 0;
for (const u of users) {
    const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address || u.email_addresses?.[0]?.email_address;
    const displayName = pickDisplayName({ username: u.username, firstName: u.first_name, lastName: u.last_name, email });
    const ref = db.collection('users').doc(u.id);
    const snap = await ref.get();
    const before = snap.exists ? snap.data().displayName : '(no doc)';
    if (before === displayName && snap.data()?.username === (u.username || null)) continue;
    changed++;
    console.log(`${u.id}: ${before} -> ${displayName}`);
    if (apply) {
        await ref.set(
            {
                username: u.username || null,
                displayName,
                displayNameLower: displayName.toLowerCase(),
                photoURL: u.image_url || null,
                ...(snap.exists ? {} : { createdAt: new Date(u.created_at) }),
            },
            { merge: true }
        );
    }
}
console.log(`${users.length} Clerk users, ${changed} ${apply ? 'updated' : 'would change (dry run - add --apply to write)'}`);
