import MatchCard from '../components/MatchCard';
import NewsHome from '../components/News/NewsHome';
import BottomSection from '../components/BottomSection';
import { getRecentMatches } from '../lib/data/matches';
import '../styles/Matches.css';

export default async function Home() {
    let matches = [];
    let error = null;

    try {
        matches = await getRecentMatches();
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
            <NewsHome />
            <BottomSection />
        </>
    );
}
