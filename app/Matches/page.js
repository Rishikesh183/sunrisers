import Link from 'next/link';
import MatchCard from '../../components/MatchCard';
import { getAllMatches } from '../../lib/data/matches';
import '../../styles/Schedule.css';
import '../../styles/Matches.css';

export default async function Schedule() {
    const matches = await getAllMatches();

    return (
        <div className="matches-main-container">
            <div className='bg-orange-500 w-full '>
                <ul className='flex text-white mx-3 p-1 px-4 justify-around text-xl'>
                    <Link href="/Matches/live">Live</Link>
                    <Link href="/Matches/upcoming">Upcoming</Link>
                    <Link href="/Matches">recent</Link>
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
