// Copies every Clerk user into Firebase Auth, KEEPING THE SAME UID (the Clerk id, e.g.
// "user_3JV..."), so every duel result / leaderboard row / user record that already points at
// that id keeps working with no rewriting. Also reserves each username in `usernames/{lower}`
// and makes sure `users/{uid}` carries `username` + `usernameLower`.
//
//   - Google accounts are imported as Google-linked, so "Continue with Google" lands on the
//     same account.
//   - Password accounts keep their password IF you pass the Clerk dashboard CSV export
//     (Settings -> "Export all users"; it holds the bcrypt hashes). Without it those users are
//     imported without a password and can set one with "Forgot password".
//   - Nothing in Clerk is changed or deleted.
//
// Usage (reads .env.local):
//   node scripts/import-clerk-users.mjs [--csv path/to/clerk-export.csv]          # dry run
//   node scripts/import-clerk-users.mjs [--csv path/to/clerk-export.csv] --apply  # writes

import fs from 'node:fs';
import nextEnv from '@next/env';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

nextEnv.loadEnvConfig(process.cwd());

const USERNAME_EMAIL_DOMAIN = 'srh-username.local'; // keep in sync with lib/auth/actions.js
const apply = process.argv.includes('--apply');
const csvIdx = process.argv.indexOf('--csv');
const csvPath = csvIdx > -1 ? process.argv[csvIdx + 1] : null;

const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});
const auth = getAuth(app);
const db = getFirestore(app);

// Minimal RFC-4180 CSV parser (handles quoted fields, commas and newlines inside quotes).
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (ch === '"') quoted = false;
            else field += ch;
        } else if (ch === '"') quoted = true;
        else if (ch === ',') { row.push(field); field = ''; }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(field); field = '';
            if (row.length > 1 || row[0] !== '') rows.push(row);
            row = [];
        } else field += ch;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    const [head, ...body] = rows;
    return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ''])));
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

const hashes = new Map(); // clerk id -> { digest, hasher }
if (csvPath) {
    for (const r of parseCsv(fs.readFileSync(csvPath, 'utf8'))) {
        if (r.id && r.password_digest) hashes.set(r.id, { digest: r.password_digest, hasher: (r.password_hasher || 'bcrypt').toLowerCase() });
    }
    console.log(`CSV: ${hashes.size} users with a password hash`);
}

const clerkUsers = await fetchAllClerkUsers();
const records = [];
const notes = [];
for (const u of clerkUsers) {
    const primary = u.email_addresses?.find((e) => e.id === u.primary_email_address_id) || u.email_addresses?.[0];
    const google = u.external_accounts?.find((a) => /google/.test(a.provider));
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
    const rec = {
        uid: u.id,
        // Clerk allowed username + password sign-ups with no email. Firebase needs an email, so those
        // accounts get a placeholder one derived from the username; the sign-in form turns a
        // typed username into the same placeholder (see lib/auth/actions.js USERNAME_EMAIL_DOMAIN).
        email: primary?.email_address || (u.username ? `${u.username.toLowerCase()}@${USERNAME_EMAIL_DOMAIN}` : undefined),
        emailVerified: primary ? primary?.verification?.status === 'verified' : false,
        displayName: u.username || name || undefined,
        photoURL: u.image_url || undefined,
        disabled: !!u.banned,
        metadata: { creationTime: new Date(u.created_at).toUTCString() },
        providerData: [],
    };
    if (google) {
        rec.providerData.push({
            uid: google.provider_user_id,
            providerId: 'google.com',
            email: google.email_address || primary?.email_address,
            displayName: name || undefined,
            photoURL: u.image_url || undefined,
        });
    }
    const h = hashes.get(u.id);
    if (h) {
        if (h.hasher === 'bcrypt') rec.passwordHash = Buffer.from(h.digest);
        else notes.push(`${u.id}: unsupported hasher "${h.hasher}" - no password imported`);
    }
    if (!rec.email) notes.push(`${u.id}: no email - skipped`);
    else records.push({ rec, username: u.username, hasPassword: !!rec.passwordHash, google: !!google });
}

console.log(`\nClerk users: ${clerkUsers.length}`);
console.log(`  with a placeholder email (username-only accounts): ${records.filter((r) => r.rec.email.endsWith('@' + USERNAME_EMAIL_DOMAIN)).length}`);
console.log(`  importable: ${records.length}  (google-linked: ${records.filter((r) => r.google).length}, with password: ${records.filter((r) => r.hasPassword).length})`);
console.log(`  password users WITHOUT a hash (will use "Forgot password"): ${
    clerkUsers.filter((u) => u.password_enabled && !hashes.has(u.id)).length
}`);
notes.forEach((n) => console.log(`  note: ${n}`));

// Already in Firebase Auth? (never overwrite an account someone has since created/changed)
const existing = new Set();
for (let i = 0; i < records.length; i += 100) {
    const batch = records.slice(i, i + 100).map((r) => ({ uid: r.rec.uid }));
    const res = await auth.getUsers(batch);
    res.users.forEach((u) => existing.add(u.uid));
}
const toImport = records.filter((r) => !existing.has(r.rec.uid));
console.log(`  already in Firebase Auth (left untouched): ${existing.size}`);
console.log(`  to import now: ${toImport.length}`);

if (!apply) {
    console.log('\nDry run - nothing written. Re-run with --apply.');
    process.exit(0);
}

// 1) Auth users. Password hashes need an options block; import password and passwordless
// users in separate calls so one group's options never touch the other.
const withPw = toImport.filter((r) => r.hasPassword).map((r) => r.rec);
const withoutPw = toImport.filter((r) => !r.hasPassword).map((r) => r.rec);
let ok = 0;
let failed = 0;
for (const [group, options] of [[withPw, { hash: { algorithm: 'BCRYPT' } }], [withoutPw, undefined]]) {
    for (let i = 0; i < group.length; i += 100) {
        const res = await auth.importUsers(group.slice(i, i + 100), options);
        ok += res.successCount;
        failed += res.failureCount;
        res.errors.forEach((e) => console.log(`  FAILED ${group[i + e.index].uid}: ${e.error.message}`));
    }
}
console.log(`\nAuth import: ${ok} imported, ${failed} failed`);

// 2) Reserve usernames + stamp usernameLower on the user docs.
let reserved = 0;
for (const { rec, username } of records) {
    if (!username) continue;
    const lower = username.toLowerCase();
    await db.collection('usernames').doc(lower).set({ uid: rec.uid, username }, { merge: true });
    await db.collection('users').doc(rec.uid).set({ username, usernameLower: lower }, { merge: true });
    reserved++;
}
console.log(`Usernames reserved: ${reserved}`);
