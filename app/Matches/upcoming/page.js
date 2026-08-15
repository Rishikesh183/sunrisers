import Link from 'next/link';

const UpcomingSchedule = () => {
    return (
        <div className="min-h-screen bg-bg">
            <div className="w-full border-b border-border bg-surface">
                <ul className="flex mx-auto max-w-2xl gap-2 p-3 px-4 justify-around text-base font-semibold">
                    <li className="px-4 py-1.5 rounded-full text-textMuted hover:text-accent transition-colors"><Link href="/Matches/live">Live</Link></li>
                    <li className="px-4 py-1.5 rounded-full bg-accent text-white"><Link href="/Matches/upcoming">Upcoming</Link></li>
                    <li className="px-4 py-1.5 rounded-full text-textMuted hover:text-accent transition-colors"><Link href="/Matches">Recent</Link></li>
                </ul>
            </div>

            <div className="flex flex-col items-center gap-2 text-xl font-semibold text-textMuted text-center max-h-screen justify-center pt-24 px-6 lg:text-2xl">
                <p>Wait for the IPL 2026 .... chinnaswamy lo cup manade &#128513;</p>
                <p className="text-accent font-display text-lg">#10 Year Challenge &#128170;</p>
            </div>
        </div>
    );
};

export default UpcomingSchedule;
