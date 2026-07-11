import Link from 'next/link';
import MatchCard from '../components/MatchCard';
import NewsHome from '../components/News/NewsHome';
import BottomSection from '../components/BottomSection';
import { getRecentMatches } from '../lib/data/matches';
import '../styles/Matches.css';

export default async function Home() {
    let matches = [];
    let error = null;

    try {
        matches = await getRecentMatches(6);
    } catch (err) {
        error = 'Failed to fetch matches. Please try again later.';
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <>
            <div className="scrolling-wrapper-flexbox">
                {matches.map((item) => (
                    <MatchCard key={item.id} data={item} variant="home" />
                ))}
            </div>
            <div className="flex justify-center py-4">
                <Link
                    href="/Matches"
                    className="px-6 py-2 text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition duration-300 font-semibold"
                >
                    View more matches
                </Link>
            </div>
            <NewsHome />
            <BottomSection />
        </>
    );
}
