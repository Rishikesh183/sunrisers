import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// Fetches the user directory once (see app/300par/README.md's "1v1 Duel" section for why this is
// fetch-once + client-side filter rather than a query-per-keystroke: cheap at this app's scale,
// and Firestore has no substring search to query against anyway).
export async function getOpponentCandidates() {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}

// Current display names (username-first) for a set of uids, so old saved duels show the player's
// present name without rewriting history. Returns { uid: displayName }; unknown uids are omitted.
export async function getDisplayNames(uids) {
    const unique = [...new Set(uids.filter(Boolean))];
    const entries = await Promise.all(
        unique.map(async (uid) => {
            try {
                const snap = await getDoc(doc(db, 'users', uid));
                return [uid, snap.exists() ? snap.data().displayName : null];
            } catch {
                return [uid, null];
            }
        })
    );
    return Object.fromEntries(entries.filter(([, name]) => name));
}
