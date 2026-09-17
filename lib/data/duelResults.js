import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export async function getDuelHistory(uid) {
    const q = query(
        collection(db, 'duelResults'),
        where('participants', 'array-contains', uid),
        orderBy('completedAt', 'desc'),
        limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
