import Link from 'next/link';

const LiveSchedule = () => {
    return (
        <div className="min-h-screen bg-bg">
            <div className="w-full border-b border-border bg-surface">
                <ul className="flex mx-auto max-w-2xl gap-2 p-3 px-4 justify-around text-base font-semibold">
                    <li className="px-4 py-1.5 rounded-full bg-accent text-white"><Link href="/Matches/live">Live</Link></li>
                    <li className="px-4 py-1.5 rounded-full text-textMuted hover:text-accent transition-colors"><Link href="/Matches/upcoming">Upcoming</Link></li>
                    <li className="px-4 py-1.5 rounded-full text-textMuted hover:text-accent transition-colors"><Link href="/Matches">Recent</Link></li>
                </ul>
            </div>

            <div className="flex items-center text-xl font-semibold text-textMuted text-center max-h-screen justify-center pt-24 px-6 lg:text-2xl">
                There are no live matches currently, please head to recent or upcoming matches &#9785;
            </div>
        </div>
    );
};

export default LiveSchedule;
