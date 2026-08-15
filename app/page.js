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
            <div className="px-2 pt-4">
                <h2 className="font-display text-xl text-text tracking-wide px-3 pb-1">Recent Matches</h2>
                <div className="scrolling-wrapper-flexbox">
                    {matches.map((item) => (
                        <MatchCard key={item.id} data={item} variant="home" />
                    ))}
                </div>
            </div>
            {/* <div className="flex justify-center py-6">
                <Link
                    href="/Matches"
                    className="px-6 py-2 text-white bg-accent rounded-lg shadow-md hover:bg-accentHover transition duration-300 font-semibold"
                >
                    View more matches
                </Link>
            </div> */}
            <NewsHome />
            <BottomSection />
        </>
    );
}
