import Link from 'next/link';
import MatchCard from '../../components/MatchCard';
import { getAllMatches } from '../../lib/data/matches';
import '../../styles/Schedule.css';
import '../../styles/Matches.css';

export default async function Schedule() {
    const matches = await getAllMatches();

    return (
        <div className="matches-main-container">
            <div className="w-full border-b border-border bg-surface">
                <ul className="flex mx-auto max-w-2xl gap-2 p-3 px-4 justify-around text-base font-semibold">
                    <li className="px-4 py-1.5 rounded-full text-textMuted hover:text-accent transition-colors"><Link href="/Matches/live">Live</Link></li>
                    <li className="px-4 py-1.5 rounded-full text-textMuted hover:text-accent transition-colors"><Link href="/Matches/upcoming">Upcoming</Link></li>
                    <li className="px-4 py-1.5 rounded-full bg-accent text-white"><Link href="/Matches">Recent</Link></li>
                </ul>
            </div>
            <div className="matches-header">
                <h2 className="matches-title">SRH 2026 Results - schedule & results</h2>
                <p className="matches-subtitle">Stay updated with the latest matches of SRH</p>
            </div>
            <div className="matches-grid">
                {matches.map(item => (
                    <MatchCard key={item.id} data={item} variant="schedule" />
                ))}
            </div>
        </div>
    );
}
