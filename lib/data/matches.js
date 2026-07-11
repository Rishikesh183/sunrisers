const RECENT_MATCHES_URL = 'https://sunrisers-8841a-default-rtdb.firebaseio.com/.json';

function normalize(details) {
    return details.map((match, index) => ({ ...match, id: index }));
}

export async function getRecentMatches() {
    const res = await fetch(RECENT_MATCHES_URL, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Failed to fetch matches: ${res.status}`);
    const data = await res.json();
    if (!data || !data.Details) return [];
    return normalize(data.Details);
}
