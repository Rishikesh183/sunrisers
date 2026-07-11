// Replaces the Firestore 'matches' collection with data/matches-2026.json.
// Usage: node scripts/seed-matches.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

for (const line of readFileSync('.env.local', 'utf-8').split(/\r?\n/)) {
    const match = line.match(/^([\w.]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const matches = JSON.parse(readFileSync('data/matches-2026.json', 'utf-8'));

const matchesCollection = collection(db, 'matches');
const existing = await getDocs(matchesCollection);
console.log(`Deleting ${existing.size} existing matches...`);
for (const docSnap of existing.docs) {
    await deleteDoc(docSnap.ref);
}

console.log(`Inserting ${matches.length} matches...`);
for (const [index, match] of matches.entries()) {
    await addDoc(matchesCollection, { ...match, order: index });
    console.log(`  added: ${match.teamOne} vs ${match.teamTwo}`);
}

console.log('Done.');
process.exit(0);
