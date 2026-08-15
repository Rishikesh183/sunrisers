import DraftGame from '../../components/Game/DraftGame';
import { getSeasonSquads } from '../../lib/data/seasonSquads';

export const metadata = {
    title: '300 Par | SRH',
    description: 'Draft an SRH XI across 2013-2026 and chase an impossible 300.',
};

export default function ThreeHundredPar() {
    const seasonSquads = getSeasonSquads();

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10 bg-bg min-h-screen">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-text text-center uppercase tracking-wide mb-2">
                300 Par
            </h1>
            <p className="text-center text-textMuted text-sm sm:text-base mb-6 max-w-2xl mx-auto">
                Draft your SRH XI from across 2013-2026, one random season at a time.
                Fill all 11 spots, then simulate the chase. No team has ever scored 300 in a T20 innings — can yours?
            </p>

            <DraftGame seasonSquads={seasonSquads} />
        </div>
    );
}
