// Test stub: replaces lib/firebase.js so the app's real data-layer code talks to the
// Firestore EMULATOR as whichever user globalThis.__TEST_UID names (null = signed out).
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const uid = globalThis.__TEST_UID;
const app = initializeApp({ projectId: 'demo-srh' }, `t-${uid}-${Math.random()}`);
export const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8085, uid ? { mockUserToken: { sub: uid, user_id: uid } } : {});
export const auth = null;
export const storage = null;
