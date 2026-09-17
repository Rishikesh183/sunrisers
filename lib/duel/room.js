import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { TOTAL_SLOTS } from '../game/positions';

const TOTAL_TURNS = TOTAL_SLOTS * 2; // 22 - each player drafts their own 11
export const ROOM_TTL_MS = 5 * 60 * 1000;

export function turnUid(turnIndex, firstPickerUid, otherUid) {
    return turnIndex % 2 === 0 ? firstPickerUid : otherUid;
}

export function otherPlayerUid(room, uid) {
    return room.hostUid === uid ? room.guestUid : room.hostUid;
}

export function isRoomExpired(room) {
    return room.status === 'waiting' && Date.now() > room.expiresAt.toMillis();
}

export async function createRoom({ hostUid, hostName, team }) {
    const ref = await addDoc(collection(db, 'duelRooms'), {
        hostUid,
        hostName,
        guestUid: null,
        guestName: null,
        team,
        status: 'waiting',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + ROOM_TTL_MS),
        tossWinnerUid: null,
        firstPickerUid: null,
        currentTurnIndex: 0,
        resultHost: null,
        resultGuest: null,
        winnerUid: null,
        completedAt: null,
    });
    return ref.id;
}

export function subscribeToRoom(roomId, onChange) {
    return onSnapshot(doc(db, 'duelRooms', roomId), (snap) => {
        onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
}

export function subscribeToPicks(roomId, onChange) {
    const q = query(collection(db, 'duelRooms', roomId, 'picks'), orderBy('turnIndex'));
    return onSnapshot(q, (snap) => {
        onChange(snap.docs.map((d) => d.data()));
    });
}

// Guest joining and the coin-flip happen in one transaction so two guests racing to open the
// same link can't both "win" the toss, and so the toss result can't be recomputed/tampered
// with by re-running the join.
export async function joinRoom(roomId, { guestUid, guestName }) {
    const ref = doc(db, 'duelRooms', roomId);
    return runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('Room not found.');
        const room = snap.data();

        if (room.hostUid === guestUid) throw new Error('You cannot join your own room.');
        if (Date.now() > room.expiresAt.toMillis() && room.status === 'waiting') {
            throw new Error('This invite has expired.');
        }
        if (room.status !== 'waiting') {
            throw new Error('This room already has two players.');
        }

        const tossWinnerUid = Math.random() < 0.5 ? room.hostUid : guestUid;
        tx.update(ref, {
            guestUid,
            guestName,
            status: 'toss',
            tossWinnerUid,
        });
        return tossWinnerUid;
    });
}

export async function chooseFirstPicker(roomId, firstPickerUid) {
    const ref = doc(db, 'duelRooms', roomId);
    await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('Room not found.');
        const room = snap.data();
        if (room.status !== 'toss') throw new Error('Toss already resolved.');
        tx.update(ref, { status: 'drafting', firstPickerUid, currentTurnIndex: 0 });
    });
}

// One transaction per pick: verifies it's genuinely this uid's turn and this turn hasn't
// already been submitted (guards double-clicks/duplicate turns), writes the pick doc, and
// advances the room to the next turn (or to 'simulating' after the 22nd).
export async function submitPick(roomId, { uid, turnIndex, year, playerName, slot }) {
    const roomRef = doc(db, 'duelRooms', roomId);
    const pickRef = doc(db, 'duelRooms', roomId, 'picks', String(turnIndex));

    await runTransaction(db, async (tx) => {
        const roomSnap = await tx.get(roomRef);
        if (!roomSnap.exists()) throw new Error('Room not found.');
        const room = roomSnap.data();
        if (room.status !== 'drafting') throw new Error('Draft is not active.');
        if (room.currentTurnIndex !== turnIndex) throw new Error('Not this turn.');

        const other = otherPlayerUid(room, room.firstPickerUid);
        const expectedUid = turnUid(turnIndex, room.firstPickerUid, other);
        if (expectedUid !== uid) throw new Error("It isn't your turn.");

        const pickSnap = await tx.get(pickRef);
        if (pickSnap.exists()) throw new Error('This turn was already played.');

        tx.set(pickRef, { uid, turnIndex, year, playerName, slot, pickedAt: Date.now() });

        const nextTurn = turnIndex + 1;
        tx.update(roomRef, {
            currentTurnIndex: nextTurn,
            status: nextTurn >= TOTAL_TURNS ? 'simulating' : 'drafting',
        });
    });
}

// Guarded so that whichever client notices "simulating" first is the only one that finalizes -
// the transaction re-checks status === 'simulating' before writing, so a race between both
// players' browsers can't double-submit or overwrite the result.
export async function finalizeResult(roomId, { hostResult, guestResult, winnerUid, hostUid, guestUid, team }) {
    const roomRef = doc(db, 'duelRooms', roomId);
    const didFinalize = await runTransaction(db, async (tx) => {
        const snap = await tx.get(roomRef);
        if (!snap.exists()) throw new Error('Room not found.');
        const room = snap.data();
        if (room.status !== 'simulating') return false;

        tx.update(roomRef, {
            resultHost: hostResult,
            resultGuest: guestResult,
            winnerUid,
            status: 'complete',
            completedAt: serverTimestamp(),
        });
        return true;
    });

    if (didFinalize) {
        await addDoc(collection(db, 'duelResults'), {
            participants: [hostUid, guestUid],
            hostUid,
            guestUid,
            hostScore: hostResult.finalScore,
            guestScore: guestResult.finalScore,
            winnerUid,
            team,
            roomId,
            completedAt: serverTimestamp(),
        });
    }
}

export async function getRoomOnce(roomId) {
    const snap = await getDoc(doc(db, 'duelRooms', roomId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
