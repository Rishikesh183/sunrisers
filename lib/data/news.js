import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function getNews() {
    const newsCollection = collection(db, 'news');
    const q = query(newsCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : null,
        };
    });
}

export async function getNewsByTitle(title) {
    const news = await getNews();
    return news.find((item) => item.title === title) ?? null;
}
