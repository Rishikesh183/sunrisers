'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Firebase Auth behind the same small surface the app used from Clerk (useUser / SignedIn /
// SignedOut), so pages read the same way. The user's public profile lives in users/{uid}
// (username, displayName, photoURL) and is kept live with a snapshot listener.
const AuthContext = createContext({ isLoaded: false, isSignedIn: false, user: null, profile: null });

export function AuthProvider({ children }) {
    const [fbUser, setFbUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileReady, setProfileReady] = useState(false);

    useEffect(
        () =>
            onAuthStateChanged(auth, (u) => {
                setFbUser(u);
                setProfileReady(!u); // nobody signed in -> nothing to wait for
                if (!u) setProfile(null);
                setAuthReady(true);
            }),
        []
    );

    useEffect(() => {
        if (!fbUser) return undefined;
        return onSnapshot(
            doc(db, 'users', fbUser.uid),
            (snap) => {
                setProfile(snap.exists() ? snap.data() : null);
                setProfileReady(true);
            },
            () => setProfileReady(true) // rules / network problem: don't hang the app on it
        );
    }, [fbUser?.uid]);

    const value = useMemo(() => {
        const isLoaded = authReady && profileReady;
        const isSignedIn = isLoaded && !!fbUser;
        const username = profile?.username || null;
        const user = fbUser
            ? {
                  id: fbUser.uid,
                  username,
                  firstName: null,
                  lastName: null,
                  fullName: profile?.displayName || fbUser.displayName || null,
                  imageUrl: profile?.photoURL || fbUser.photoURL || null,
                  primaryEmailAddress: fbUser.email ? { emailAddress: fbUser.email } : null,
              }
            : null;
        return { isLoaded, isSignedIn, user, profile };
    }, [fbUser, authReady, profile, profileReady]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useUser() {
    return useContext(AuthContext);
}

export function SignedIn({ children }) {
    const { isLoaded, isSignedIn } = useUser();
    return isLoaded && isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }) {
    const { isLoaded, isSignedIn } = useUser();
    return isLoaded && !isSignedIn ? <>{children}</> : null;
}
