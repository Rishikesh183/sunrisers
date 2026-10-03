import { collection, doc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// 300 Par leaderboard. Only scores of 300+ are recorded, one small doc per player:
//   leaderboard/{difficulty}/entries/{uid}                       - all-time best + number of 300s
//   leaderboardDaily/{date}_{difficulty}/entries/{uid}           - the same, for one calendar day
// A new 300+ is two tiny transactions (one per doc) and a leaderboard view is one query of at
// most LIMIT docs, so cost stays flat no matter how many games are played. Every query orders by
// a single field on one collection, so no composite index is needed. Nothing here sits on the
// game's own path - it is never called while drafting or simulating.

export const PAR = 300;
const MAX_SCORE = 800; // sanity cap - rules are open (client-trusted), this just drops garbage
const LIMIT = 25;

// Day boundary is India time so "today" matches the audience, not the server's clock.
export function dateKey(date = new Date()) {
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
}

function bump(ref, entry) {
    return runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const now = serverTimestamp();
        if (!snap.exists()) {
            tx.set(ref, {
                uid: entry.uid,
                name: entry.name,
                team: entry.team,
                bestScore: entry.score,
                bestWickets: entry.wickets,
                bestBalls: entry.balls,
                count300: 1,
                updatedAt: now,
            });
            return;
        }
        const cur = snap.data();
        const better = entry.score > cur.bestScore || (entry.score === cur.bestScore && entry.balls < cur.bestBalls);
        tx.update(ref, {
            name: entry.name,
            count300: (cur.count300 || 0) + 1,
            updatedAt: now,
            ...(better ? { bestScore: entry.score, bestWickets: entry.wickets, bestBalls: entry.balls, team: entry.team } : {}),
        });
    });
}

// entry: { uid, name, difficulty, team, score, wickets, balls, dateKey? }
export async function submitScore(entry) {
    if (!entry.uid || entry.score < PAR || entry.score > MAX_SCORE) return false;
    const day = entry.dateKey || dateKey();
    await Promise.all([
        bump(doc(db, 'leaderboard', entry.difficulty, 'entries', entry.uid), entry),
        bump(doc(db, 'leaderboardDaily', `${day}_${entry.difficulty}`, 'entries', entry.uid), entry),
    ]);
    return true;
}

// range: 'today' | 'all'   sort: 'score' | 'count'   difficulty: 'hard' | 'easy'
export async function getLeaderboard({ range, sort, difficulty }) {
    const entries =
        range === 'today'
            ? collection(db, 'leaderboardDaily', `${dateKey()}_${difficulty}`, 'entries')
            : collection(db, 'leaderboard', difficulty, 'entries');
    const snapshot = await getDocs(query(entries, orderBy(sort === 'count' ? 'count300' : 'bestScore', 'desc'), limit(LIMIT)));
    const rows = snapshot.docs.map((d) => d.data());
    // Ties: higher score (or more 300s) first, then the faster innings (fewer balls).
    const key = sort === 'count' ? 'count300' : 'bestScore';
    return rows.sort((a, b) => b[key] - a[key] || b.bestScore - a.bestScore || a.bestBalls - b.bestBalls);
}
