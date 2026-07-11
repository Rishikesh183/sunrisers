import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function getRecentMatches() {
    const matchesCollection = collection(db, 'matches');
    const q = query(matchesCollection, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
