import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '../../../lib/firebaseAdmin';

// Adding news is an ADMIN action. Before, this route (and the open Firestore rule behind it) let
// anyone on the internet publish or overwrite news. Now the caller must send a Firebase ID token
// (Authorization: Bearer <token>) belonging to a uid listed in the ADMIN_UIDS env var
// (comma-separated). With ADMIN_UIDS unset the route is closed to everyone.
const LIMITS = { title: 200, description: 600, longDesc: 20000, imageUrl: 500 };

function adminUids() {
    return (process.env.ADMIN_UIDS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

export async function POST(request) {
    const header = request.headers.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    let uid;
    try {
        ({ uid } = await getAdminAuth().verifyIdToken(token));
    } catch {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    if (!adminUids().includes(uid)) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
    const { title, description, imageUrl, longDesc } = body || {};
    for (const [key, max] of Object.entries(LIMITS)) {
        const v = body?.[key];
        if (typeof v !== 'string' || !v.trim() || v.length > max) {
            return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 });
        }
    }
    if (!/^https:\/\//i.test(imageUrl)) return NextResponse.json({ error: 'imageUrl must be https' }, { status: 400 });

    const ref = await getAdminDb().collection('news').add({
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        longDesc,
        timestamp: Timestamp.now(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
}
