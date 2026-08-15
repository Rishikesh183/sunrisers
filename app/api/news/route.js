import { NextResponse } from 'next/server';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export async function POST(request) {
    const body = await request.json();
    const { title, description, imageUrl, longDesc } = body;

    if (!title || !description || !imageUrl || !longDesc) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'news'), {
        title,
        description,
        imageUrl,
        longDesc,
        timestamp: Timestamp.now(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
}
