import { NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { getAdminDb } from '../../../../lib/firebaseAdmin';

// Mirrors every Clerk sign-up into Firestore's `users` collection, so the 1v1 duel opponent
// list has something to query without ever calling Clerk's Backend API from a request handler.
// Configure this endpoint's URL in the Clerk Dashboard -> Webhooks, listening for `user.created`.
export async function POST(request) {
    let event;
    try {
        event = await verifyWebhook(request);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    if (event.type !== 'user.created') {
        return NextResponse.json({ skipped: event.type }, { status: 200 });
    }

    const user = event.data;
    const displayName =
        [user.first_name, user.last_name].filter(Boolean).join(' ') ||
        user.username ||
        user.email_addresses?.[0]?.email_address ||
        'Anonymous';

    await getAdminDb()
        .collection('users')
        .doc(user.id)
        .set({
            displayName,
            displayNameLower: displayName.toLowerCase(),
            photoURL: user.image_url || null,
            createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        });

    return NextResponse.json({ ok: true }, { status: 200 });
}
