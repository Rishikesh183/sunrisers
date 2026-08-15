import { collection, query, orderBy, limit as fbLimit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function getAllMatches() {
    const matchesCollection = collection(db, 'matches');
    const q = query(matchesCollection, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getRecentMatches(count = 6) {
    const matchesCollection = collection(db, 'matches');
    const q = query(matchesCollection, orderBy('order', 'desc'), fbLimit(count));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .reverse();
}
