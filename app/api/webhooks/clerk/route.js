import { NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { getAdminDb } from '../../../../lib/firebaseAdmin';
import { pickDisplayName } from '../../../../lib/userName';

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
    const primaryEmail =
        user.email_addresses?.find((e) => e.id === user.primary_email_address_id)?.email_address ||
        user.email_addresses?.[0]?.email_address;
    const displayName = pickDisplayName({
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        email: primaryEmail,
    });

    await getAdminDb()
        .collection('users')
        .doc(user.id)
        .set({
            username: user.username || null,
            displayName,
            displayNameLower: displayName.toLowerCase(),
            photoURL: user.image_url || null,
            createdAt: user.created_at ? new Date(user.created_at) : new Date(),
        });

    return NextResponse.json({ ok: true }, { status: 200 });
}
