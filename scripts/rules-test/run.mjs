// Security-rules test against the Firestore EMULATOR (nothing touches your real project).
// Part 1 runs the app's REAL data layer through a whole duel as legitimate users; part 2 attacks the
// rules as a hostile signed-in user (third person, out-of-turn picks, forged results, leaderboard
// spam, profile/username tampering, news defacement, directory scraping ...).
//
// Usage (Java 11+ needed for the emulator; firebase.json at the repo root points at firestore.rules):
//   npx firebase-tools emulators:exec --only firestore --project demo-srh "node scripts/rules-test/run.mjs"
// Re-run it after ANY change to firestore.rules or lib/duel/room.js, lib/data/*.
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { initializeApp } from 'firebase/app';
import {
    getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, getDocs, collection, query, limit, updateDoc, deleteDoc,
    addDoc, serverTimestamp, Timestamp, onSnapshot, where, orderBy,
} from 'firebase/firestore';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

// Bundle the real lib code once, with lib/firebase.js swapped for the emulator stub.
execSync(
    `node "${path.join(here, 'build.mjs')}" "${path.join(here, 'entry.mjs')}" "${path.join(here, 'stub-firebase.mjs')}" "${path.join(here, 'bundle.mjs')}"`,
    { cwd: root, stdio: 'inherit' }
);

const asUser = new Map();
async function lib(uid) {
    if (!asUser.has(uid)) {
        globalThis.__TEST_UID = uid;
        asUser.set(uid, await import(pathToFileURL(path.join(here, 'bundle.mjs')).href + `?u=${uid ?? 'anon'}`));
    }
    return asUser.get(uid);
}
// Raw modular client as a given user (null = signed out), for attacks that bypass the app's lib.
const rawCache = new Map();
function raw(uid) {
    if (!rawCache.has(uid)) {
        const app = initializeApp({ projectId: 'demo-srh' }, `raw-${uid}-${Math.random()}`);
        const db = getFirestore(app);
        connectFirestoreEmulator(db, '127.0.0.1', 8085, uid ? { mockUserToken: { sub: uid, user_id: uid } } : {});
        rawCache.set(uid, db);
    }
    return rawCache.get(uid);
}
const owner = (() => {
    const app = initializeApp({ projectId: 'demo-srh' }, 'owner');
    const db = getFirestore(app);
    connectFirestoreEmulator(db, '127.0.0.1', 8085, { mockUserToken: 'owner' });
    return db;
})();

await fetch('http://127.0.0.1:8085/emulator/v1/projects/demo-srh/databases/(default)/documents', { method: 'DELETE' }); // fresh database every run
let pass = 0, fail = 0;
const failures = [];
const ok = async (name, fn) => {
    try { await fn(); pass++; console.log(`  ok    ${name}`); } catch (e) { fail++; failures.push(`${name} -> ${e.code || ''} ${e.message.slice(0, 90)}`); console.log(`  FAIL  ${name} -> ${e.code || ''} ${e.message.slice(0, 90)}`); }
};
const denied = async (name, fn) => {
    try { await fn(); fail++; failures.push(`ATTACK SUCCEEDED: ${name}`); console.log(`  !!!   ATTACK SUCCEEDED: ${name}`); }
    catch (e) { if (e.code === 'permission-denied' || /permission|PERMISSION|insufficient/i.test(e.message)) { pass++; console.log(`  blocked ${name}`); } else { fail++; failures.push(`${name} -> unexpected ${e.code} ${e.message.slice(0, 80)}`); console.log(`  ???   ${name} -> unexpected ${e.code} ${e.message.slice(0, 80)}`); } }
};

const A = 'host_a', B = 'guest_b', C = 'intruder_c', D = 'newbie_d';
const seedUser = async (uid, username) => {
    await setDoc(doc(owner, 'users', uid), { username, usernameLower: username.toLowerCase(), displayName: username, displayNameLower: username.toLowerCase(), photoURL: 'https://img.example.com/x', createdAt: Timestamp.now() });
    await setDoc(doc(owner, 'usernames', username.toLowerCase()), { uid, username });
};
await seedUser(A, 'HostA'); await seedUser(B, 'GuestB'); await seedUser(C, 'IntruderC');

console.log('\n=== PART 1: legitimate flow through the real app code ===');
const la = await lib(A), lb = await lib(B), lc = await lib(C);
let roomId;
await ok('A creates a room for B (ground chennai)', async () => { roomId = await la.createRoom({ hostUid: A, hostName: 'HostA', hostTeam: 'SRH', opponentUid: B, opponentName: 'GuestB', ground: 'chennai' }); });
await ok('invited B can read the room', async () => { const r = await lb.getRoomOnce(roomId); if (!r || r.ground !== 'chennai') throw new Error('bad room'); });
let toss;
await ok('B joins', async () => { toss = await lb.joinRoom(roomId, { guestUid: B, guestName: 'GuestB', guestTeam: 'RCB' }); });
await ok('B joining again is harmless', async () => { await lb.joinRoom(roomId, { guestUid: B, guestName: 'GuestB', guestTeam: 'RCB' }); });
const first = toss, second = toss === A ? B : A;
const lf = await lib(first);
await ok('toss winner chooses first picker', async () => { await lf.chooseFirstPicker(roomId, first); });
for (let i = 0; i < 22; i++) {
    const uid = i % 2 === 0 ? first : second;
    await ok(`pick ${i} by the right player`, async () => { await (await lib(uid)).submitPick(roomId, { uid, turnIndex: i, year: 2020, playerName: 'P' + i, slot: (i >> 1) + 1 }); });
}
const res = (s) => ({ finalScore: s, wickets: 3, ballsFaced: 120, batsmen: [{ name: 'x' }], ballLog: [] });
const fin = (l) => l.finalizeResult(roomId, { hostResult: res(250), guestResult: res(240), winnerUid: A, hostUid: A, guestUid: B, hostTeam: 'SRH', guestTeam: 'RCB', hostName: 'HostA', guestName: 'GuestB', battedFirstUid: A, ground: 'chennai' });
await ok('guest finishes the duel (room + result + picks deleted in one step)', async () => { await fin(lb); });
await ok('host finishing again is a quiet no-op', async () => { await fin(la); });
await ok('both players check in; room is cleaned up', async () => { await la.markResultSeen(roomId, A); await lb.markResultSeen(roomId, B); });
await ok('room is gone after cleanup', async () => { const r = await la.getRoomOnce(roomId).catch(() => null); if (r) throw new Error('still there'); });
await ok('dashboard: A sees the finished duel + counts', async () => {
    const p = await la.getDuelPage(A); if (p.items.length !== 1) throw new Error('history ' + p.items.length);
    const s = await la.getDuelStats(A); if (s.played !== 1 || s.won !== 1) throw new Error(JSON.stringify(s));
});
await ok('dashboard name lookup (batched)', async () => { const n = await la.getDisplayNames([A, B]); if (n[B] !== 'GuestB') throw new Error(JSON.stringify(n)); });
await ok('opponent search by username prefix', async () => { const r = await la.searchUsersByUsername('guest'); if (!r.length) throw new Error('none'); });
await ok('A saves a 312 to the leaderboard (all-time + daily)', async () => { await la.submitScore({ uid: A, name: 'HostA', difficulty: 'hard', team: 'SRH', score: 312, wickets: 4, balls: 120 }); });
await ok('leaderboard page reads', async () => { const p = await (await lib(null)).getLeaderboardPage({ range: 'all', sort: 'score', difficulty: 'hard' }); if (p.rows.length !== 1) throw new Error('rows ' + p.rows.length); });
await ok('new user D claims a username (profile + reservation together)', async () => { const ld = await lib(D); await ld.claimUsername(D, 'NewbieD', { photoURL: 'https://img.example.com/d' }); });
await ok('D cannot take a name another user owns (app refuses)', async () => { const ld = await lib(D); try { await ld.claimUsername(D, 'HostA'); } catch (e) { if (e.message === 'USERNAME_TAKEN') return; throw e; } throw new Error('took it'); });
await ok('close an open invite (host)', async () => { const id = await la.createRoom({ hostUid: A, hostName: 'HostA', hostTeam: 'SRH', opponentUid: B, opponentName: 'GuestB' }); await la.closeRoom(id, A); });

console.log('\n=== PART 2: attacks ===');
// fresh room for the attacks, taken to different states by the owner (security off) or by legit calls
const mk = async () => la.createRoom({ hostUid: A, hostName: 'HostA', hostTeam: 'SRH', opponentUid: B, opponentName: 'GuestB' });
const r1 = await mk();
console.log(' -- while the invite is open');
await denied('3rd person C reads the room', async () => { await getDoc(doc(raw(C), 'duelRooms', r1)); });
await denied('3rd person C lists all rooms', async () => { await getDocs(query(collection(raw(C), 'duelRooms'), limit(10))); });
await denied('signed-out visitor reads a room', async () => { await getDoc(doc(raw(null), 'duelRooms', r1)); });
await denied('3rd person C joins the invite', async () => { await updateDoc(doc(raw(C), 'duelRooms', r1), { guestUid: C, guestName: 'C', guestTeam: 'MI', status: 'toss', tossWinnerUid: C }); });
await denied('host re-points the invite to C', async () => { await updateDoc(doc(raw(A), 'duelRooms', r1), { opponentUid: C }); });
await denied('host skips the join and starts drafting alone', async () => { await updateDoc(doc(raw(A), 'duelRooms', r1), { status: 'drafting' }); });
await denied('invited B joins but rigs the toss to a third uid', async () => { await updateDoc(doc(raw(B), 'duelRooms', r1), { guestUid: B, guestName: 'B', guestTeam: 'RCB', status: 'toss', tossWinnerUid: C }); });
await denied('invited B joins and ALSO edits the ground / opponent', async () => { await updateDoc(doc(raw(B), 'duelRooms', r1), { guestUid: B, guestName: 'B', guestTeam: 'RCB', status: 'toss', tossWinnerUid: B, ground: 'chennai', opponentUid: C }); });
await denied('3rd person closes the invite', async () => { await updateDoc(doc(raw(C), 'duelRooms', r1), { status: 'closed' }); });
await denied('3rd person deletes the room', async () => { await deleteDoc(doc(raw(C), 'duelRooms', r1)); });
await ok('(control) the real invited B can still join', async () => { await lb.joinRoom(r1, { guestUid: B, guestName: 'GuestB', guestTeam: 'RCB' }); });
await denied('3rd person C tries to join AFTER the match started', async () => { await updateDoc(doc(raw(C), 'duelRooms', r1), { guestUid: C }); });
await denied('3rd person C listens to the room (would burn reads)', async () => { await new Promise((res, rej) => { const un = onSnapshot(doc(raw(C), 'duelRooms', r1), () => { un(); res(); }, (e) => rej(e)); }); });
await denied('3rd person reads picks', async () => { await getDocs(collection(raw(C), 'duelRooms', r1, 'picks')); });

console.log(' -- drafting');
const room1 = await la.getRoomOnce(r1);
const w = room1.tossWinnerUid;
await denied('non-winner picks who goes first', async () => { await updateDoc(doc(raw(w === A ? B : A), 'duelRooms', r1), { status: 'drafting', firstPickerUid: w === A ? B : A, currentTurnIndex: 0 }); });
await (await lib(w)).chooseFirstPicker(r1, w);
const other = w === A ? B : A;
const nowT = Timestamp.now();
const pickDoc = (uid, i, extra = {}) => ({ uid, turnIndex: i, year: 2020, playerName: 'X', slot: 1, pickedAt: Date.now(), deleteAt: nowT, ...extra });
await denied('out-of-turn pick (the other player picks turn 0)', async () => { await setDoc(doc(raw(other), 'duelRooms', r1, 'picks', '0'), pickDoc(other, 0)); });
await denied('pick that skips ahead (turn 5)', async () => { await setDoc(doc(raw(w), 'duelRooms', r1, 'picks', '5'), pickDoc(w, 5)); });
await denied('pick for someone else', async () => { await setDoc(doc(raw(w), 'duelRooms', r1, 'picks', '0'), pickDoc(other, 0)); });
await denied('pick with an impossible year', async () => { await setDoc(doc(raw(w), 'duelRooms', r1, 'picks', '0'), pickDoc(w, 0, { year: 3000 })); });
await denied('pick with an impossible slot', async () => { await setDoc(doc(raw(w), 'duelRooms', r1, 'picks', '0'), pickDoc(w, 0, { slot: 99 })); });
await denied('pick with an extra field', async () => { await setDoc(doc(raw(w), 'duelRooms', r1, 'picks', '0'), pickDoc(w, 0, { bonus: 1000 })); });
await denied('advance the turn counter without a pick', async () => { await updateDoc(doc(raw(w), 'duelRooms', r1), { currentTurnIndex: 1 }); });
await denied('jump the turn counter ahead by 5', async () => { await updateDoc(doc(raw(w), 'duelRooms', r1), { currentTurnIndex: 5 }); });
await denied('force the room to simulating', async () => { await updateDoc(doc(raw(w), 'duelRooms', r1), { status: 'simulating', currentTurnIndex: 22 }); });
await denied('write results / winner during the draft', async () => { await updateDoc(doc(raw(other), 'duelRooms', r1), { winnerUid: other, resultHost: { finalScore: 999 } }); });
await denied('forge a duelResults record for this room mid-draft', async () => { await setDoc(doc(raw(other), 'duelResults', r1), { participants: [A, B], hostUid: A, guestUid: B, hostScore: 300, guestScore: 1, hostWickets: 0, guestWickets: 10, hostBalls: 1, guestBalls: 1, hostName: 'a', guestName: 'b', battedFirstUid: A, winnerUid: other, hostTeam: 'SRH', guestTeam: 'RCB', ground: null, roomId: r1, completedAt: serverTimestamp() }); });
await ok('(control) the right player makes the right pick', async () => { await (await lib(w)).submitPick(r1, { uid: w, turnIndex: 0, year: 2020, playerName: 'Real', slot: 1 }); });
await denied('replay the same turn (pick 0 again)', async () => { await setDoc(doc(raw(w), 'duelRooms', r1, 'picks', '0'), pickDoc(w, 0)); });

console.log(' -- stats / records');
await denied('forge a duelResults record for a room that never existed (frame victim B)', async () => { await setDoc(doc(raw(C), 'duelResults', 'fake1'), { participants: [C, B], hostUid: C, guestUid: B, hostScore: 300, guestScore: 1, hostWickets: 0, guestWickets: 10, hostBalls: 1, guestBalls: 1, hostName: 'c', guestName: 'b', battedFirstUid: C, winnerUid: C, hostTeam: 'SRH', guestTeam: 'RCB', ground: null, roomId: 'fake1', completedAt: serverTimestamp() }); });
await denied('edit an existing finished-duel record', async () => { const id = (await la.getDuelPage(A)).items[0].id; await updateDoc(doc(raw(A), 'duelResults', id), { winnerUid: A, hostScore: 999 }); });
await denied('delete a finished-duel record', async () => { const id = (await la.getDuelPage(A)).items[0].id; await deleteDoc(doc(raw(A), 'duelResults', id)); });
await denied('3rd person reads someone else\'s duel history', async () => { await getDocs(query(collection(raw(C), 'duelResults'), where('participants', 'array-contains', A), limit(10))); });

console.log(' -- creating rooms');
const roomBase = (over = {}) => ({ hostUid: A, hostName: 'HostA', hostTeam: 'SRH', guestUid: null, guestName: null, guestTeam: null, opponentUid: B, opponentName: 'GuestB', ground: null, status: 'waiting', createdAt: serverTimestamp(), expiresAt: Timestamp.fromMillis(Date.now() + 300000), deleteAt: Timestamp.fromMillis(Date.now() + 86400000), tossWinnerUid: null, firstPickerUid: null, currentTurnIndex: 0, resultHost: null, resultGuest: null, winnerUid: null, completedAt: null, ...over });
await ok('(control) a well-formed room is accepted', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase()); });
await denied('room hosted as someone else', async () => { await addDoc(collection(raw(C), 'duelRooms'), roomBase()); });
await denied('room against a user that does not exist', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ opponentUid: 'ghost' })); });
await denied('room against yourself', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ opponentUid: A })); });
await denied('room created already "complete"', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ status: 'complete' })); });
await denied('room with a pre-set winner', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ winnerUid: A })); });
await denied('room with a made-up ground', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ ground: 'mars' })); });
await denied('room that never expires (junk)', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ expiresAt: Timestamp.fromMillis(Date.now() + 9e9) })); });
await denied('room with an extra payload field', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ junk: 'x'.repeat(1000) })); });
await denied('room with a giant name', async () => { await addDoc(collection(raw(A), 'duelRooms'), roomBase({ hostName: 'x'.repeat(5000) })); });

console.log(' -- leaderboard');
const lbDoc = (over = {}) => ({ uid: C, name: 'IntruderC', team: 'SRH', bestScore: 320, bestWickets: 3, bestBalls: 120, count300: 1, updatedAt: serverTimestamp(), ...over });
await ok('(control) C posts an honest-looking 320', async () => { await setDoc(doc(raw(C), 'leaderboard', 'hard', 'entries', C), lbDoc()); });
await denied('C posts 800', async () => { await setDoc(doc(raw(C), 'leaderboard', 'easy', 'entries', C), lbDoc({ bestScore: 800 })); });
await denied('C posts a row for another player', async () => { await setDoc(doc(raw(C), 'leaderboard', 'hard', 'entries', A), lbDoc({ uid: A })); });
await denied('C starts with count300 = 500', async () => { await setDoc(doc(raw(C), 'leaderboard', 'easy', 'entries', C), lbDoc({ count300: 500 })); });
await denied('C posts in a made-up difficulty bucket', async () => { await setDoc(doc(raw(C), 'leaderboard', 'godmode', 'entries', C), lbDoc()); });
await denied('C posts into a made-up daily bucket', async () => { await setDoc(doc(raw(C), 'leaderboardDaily', 'anything-goes', 'entries', C), lbDoc()); });
await denied('C adds an extra field / giant name', async () => { await setDoc(doc(raw(C), 'leaderboard', 'easy', 'entries', C), lbDoc({ name: 'x'.repeat(9999) })); });
await denied('C bumps his own count by +1 again immediately (spam)', async () => { await setDoc(doc(raw(C), 'leaderboard', 'hard', 'entries', C), lbDoc({ count300: 2 })); });
await denied('C jumps his count by +50', async () => { await setDoc(doc(raw(C), 'leaderboard', 'hard', 'entries', C), lbDoc({ count300: 51 })); });
await denied('C lowers someone else\'s row', async () => { await setDoc(doc(raw(C), 'leaderboard', 'hard', 'entries', A), lbDoc({ uid: A, bestScore: 301 })); });
await denied('unauthenticated leaderboard write', async () => { await setDoc(doc(raw(null), 'leaderboard', 'hard', 'entries', 'x'), lbDoc({ uid: 'x' })); });
await denied('leaderboard read with no limit (full dump)', async () => { await getDocs(collection(raw(null), 'leaderboard', 'hard', 'entries')); });
await ok('(control) leaderboard read with the page limit', async () => { await getDocs(query(collection(raw(null), 'leaderboard', 'hard', 'entries'), limit(21))); });

console.log(' -- profiles, usernames, directory');
await denied('C rewrites own profile to take over GuestB\'s name', async () => { await setDoc(doc(raw(C), 'users', C), { username: 'GuestB', usernameLower: 'guestb', displayName: 'GuestB', createdAt: Timestamp.now() }); });
await denied('C overwrites A\'s profile', async () => { await setDoc(doc(raw(C), 'users', A), { username: 'pwn', usernameLower: 'pwn', displayName: 'pwn', createdAt: Timestamp.now() }); });
await denied('C squats a second username for himself', async () => { await setDoc(doc(raw(C), 'usernames', 'admin'), { uid: C, username: 'admin' }); });
await denied('C steals A\'s reserved name document', async () => { await setDoc(doc(raw(C), 'usernames', 'hosta'), { uid: C, username: 'HostA' }); });
await denied('C deletes A\'s username reservation', async () => { await deleteDoc(doc(raw(C), 'usernames', 'hosta')); });
await denied('profile with a tracking-pixel (http) photo URL', async () => { await setDoc(doc(raw(D), 'users', D), { username: 'NewbieD', usernameLower: 'newbied', displayName: 'NewbieD', photoURL: 'http://evil.example/p.gif', createdAt: Timestamp.now() }); });
await denied('profile with an extra field', async () => { await setDoc(doc(raw(D), 'users', D), { username: 'NewbieD', usernameLower: 'newbied', displayName: 'NewbieD', admin: true, createdAt: Timestamp.now() }); });
await denied('dump the whole user directory (no limit)', async () => { await getDocs(collection(raw(C), 'users')); });
await denied('dump the user directory with a big limit', async () => { await getDocs(query(collection(raw(C), 'users'), limit(500))); });
await ok('(control) directory search page is fine', async () => { await getDocs(query(collection(raw(C), 'users'), limit(10))); });
await denied('list all usernames', async () => { await getDocs(query(collection(raw(null), 'usernames'), limit(10))); });
await ok('(control) single username lookup (sign-up availability) works signed out', async () => { await getDoc(doc(raw(null), 'usernames', 'hosta')); });
await denied('signed-out visitor reads the user directory', async () => { await getDocs(query(collection(raw(null), 'users'), limit(10))); });

console.log(' -- site content');
await denied('anonymous visitor publishes news', async () => { await addDoc(collection(raw(null), 'news'), { title: 'hacked' }); });
await denied('signed-in user publishes news', async () => { await addDoc(collection(raw(C), 'news'), { title: 'hacked' }); });
await denied('signed-in user deletes news', async () => { await deleteDoc(doc(raw(C), 'news', 'n1')); });
await ok('(control) anyone can read news', async () => { await getDocs(query(collection(raw(null), 'news'), limit(5))); });
await denied('signed-in user writes matches', async () => { await setDoc(doc(raw(C), 'matches', 'm1'), { x: 1 }); });
await denied('write to an unlisted collection', async () => { await setDoc(doc(raw(C), 'anything', 'x'), { x: 1 }); });

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (failures.length) console.log(failures.join('\n'));
process.exit(fail ? 1 : 0);
