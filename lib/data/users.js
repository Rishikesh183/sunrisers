import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// Fetches the user directory once (see app/300par/README.md's "1v1 Duel" section for why this is
// fetch-once + client-side filter rather than a query-per-keystroke: cheap at this app's scale,
// and Firestore has no substring search to query against anyway).
export async function getOpponentCandidates() {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}
