import PlayerGrid from '../../components/PlayerGrid';
import { getPlayers } from '../../lib/data/players';

export default function Players() {
    const players = getPlayers();

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 bg-bg min-h-screen">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display text-text text-center uppercase tracking-wide mb-2">
                Sunrisers Hyderabad
            </h1>

            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-accent mt-6 mb-4 pb-2 border-b border-border">
                The Risers of 2024 Class
            </h2>

            <div className="flex flex-col bg-surface border border-border p-3 sm:p-5 rounded-xl mb-5">
                <PlayerGrid players={players} />
            </div>
        </div>
    );
}
