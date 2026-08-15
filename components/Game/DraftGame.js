'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import SeasonPlayerCard from './SeasonPlayerCard';
import BattingOrderStrip from './BattingOrderStrip';
import ScoreBoard from './ScoreBoard';
import LoginNudgeModal from './LoginNudgeModal';
import { TOTAL_SLOTS, eligibleEmptySlots, isPlayerPickable } from '../../lib/game/positions';
import { simulateChase } from '../../lib/game/simulate';
import { getBestScore, hasShownLoginPrompt, markLoginPromptShown, saveResult } from '../../lib/game/localHistory';

const MAX_FOREIGNERS = 4;

function randomYear(years, exclude) {
    const pool = exclude != null && years.length > 1 ? years.filter((y) => y !== exclude) : years;
    return pool[Math.floor(Math.random() * pool.length)];
}

export default function DraftGame({ seasonSquads }) {
    const { isSignedIn } = useUser();
    const years = useMemo(() => Object.keys(seasonSquads).map(Number).sort(), [seasonSquads]);

    const [currentYear, setCurrentYear] = useState(years[0]);
    const [filled, setFilled] = useState({});
    const [pickedNames, setPickedNames] = useState(new Set());
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [phase, setPhase] = useState('drafting');
    const [simResult, setSimResult] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [skipUsed, setSkipUsed] = useState(false);

    useEffect(() => {
        setCurrentYear(randomYear(years));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pickedCount = Object.keys(filled).length;
    const currentSquad = seasonSquads[String(currentYear)] || [];
    const filledSlots = useMemo(() => new Set(Object.keys(filled).map(Number)), [filled]);
    const battingOrder = useMemo(
        () => Array.from({ length: TOTAL_SLOTS }, (_, i) => filled[i + 1]?.player).filter(Boolean),
        [filled]
    );
    const bowlersPicked = battingOrder.filter((p, i) => i >= 7).length;
    const keeperPicked = Object.values(filled).some((f) => f.player.isKeeper);
    const foreignersPicked = battingOrder.filter((p) => p.country !== 'India').length;
    const foreignersLocked = foreignersPicked >= MAX_FOREIGNERS;

    function isForeignLocked(player) {
        return player.country !== 'India' && foreignersLocked;
    }

    function handleSelectPlayer(player) {
        if (pickedNames.has(player.name) || isForeignLocked(player)) return;
        setSelectedPlayer(selectedPlayer?.name === player.name ? null : player);
    }

    function handleSlotClick(slot) {
        if (!selectedPlayer) return;
        if (filled[slot]) return;
        if (!selectedPlayer.slots.includes(slot)) return;

        const nextFilled = { ...filled, [slot]: { player: selectedPlayer, year: currentYear } };
        setFilled(nextFilled);
        setPickedNames(new Set([...pickedNames, selectedPlayer.name]));
        setSelectedPlayer(null);

        if (Object.keys(nextFilled).length < TOTAL_SLOTS) {
            setCurrentYear(randomYear(years));
        }
    }

    function runSimulationAndSave(order) {
        const result = simulateChase(order);
        setSimResult(result);
        saveResult({
            score: result.finalScore,
            wickets: result.wickets,
            won: result.won,
            xi: order.map((p) => p.name),
        });
        if (!hasShownLoginPrompt() && !isSignedIn) {
            setShowLoginModal(true);
            markLoginPromptShown();
        }
    }

    function handleSimulate() {
        runSimulationAndSave(battingOrder);
        setPhase('result');
    }

    function handleSkipYear() {
        if (skipUsed) return;
        setSkipUsed(true);
        setSelectedPlayer(null);
        setCurrentYear(randomYear(years, currentYear));
    }

    function handlePlayAgain() {
        setFilled({});
        setPickedNames(new Set());
        setSelectedPlayer(null);
        setSimResult(null);
        setPhase('drafting');
        setSkipUsed(false);
        setCurrentYear(randomYear(years));
    }

    if (phase === 'result' && simResult) {
        return (
            <>
                {showLoginModal && <LoginNudgeModal onDismiss={() => setShowLoginModal(false)} />}
                <ScoreBoard
                    battingOrder={battingOrder}
                    result={simResult}
                    bestScore={getBestScore()}
                    onPlayAgain={handlePlayAgain}
                />
            </>
        );
    }

    const eligibleSlotsForSelection = selectedPlayer ? eligibleEmptySlots(selectedPlayer, filledSlots) : [];
    const draftComplete = pickedCount === TOTAL_SLOTS;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-surface border border-border rounded-xl p-3 sm:p-4">
                <p className="font-display text-text text-sm sm:text-base">
                    {draftComplete ? 'Squad complete' : `Turn ${pickedCount + 1} / ${TOTAL_SLOTS}`}
                </p>
                {!draftComplete && (
                    <div className="flex items-center gap-3">
                        <p className="text-accent font-display text-lg sm:text-xl">{currentYear} Squad</p>
                        <button
                            onClick={handleSkipYear}
                            disabled={skipUsed}
                            className={`text-xs px-3 py-1 rounded-lg border transition-colors font-semibold
                                ${skipUsed ? 'border-border text-textMuted opacity-40 cursor-not-allowed' : 'border-accent text-accent hover:bg-accentMuted cursor-pointer'}`}
                        >
                            {skipUsed ? 'Skip Used' : 'Skip Year'}
                        </button>
                    </div>
                )}
                <p className="text-xs text-textMuted">
                    Bowlers: {bowlersPicked}/4 · Keeper: {keeperPicked ? 'Yes' : 'No'} · Foreigners: {foreignersPicked}/{MAX_FOREIGNERS}
                </p>
            </div>

            <BattingOrderStrip filled={filled} eligibleSlots={eligibleSlotsForSelection} onSlotClick={handleSlotClick} />

            {selectedPlayer && (
                <p className="text-center text-sm text-textMuted">
                    Pick an open, highlighted slot above for <span className="text-accent font-semibold">{selectedPlayer.name}</span>.
                </p>
            )}

            {!draftComplete && (
                <div className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                    {currentSquad.map((player) => {
                        const alreadyPicked = pickedNames.has(player.name);
                        const noSlot = !isPlayerPickable(player, filledSlots);
                        const foreignLocked = isForeignLocked(player);
                        let disabledReason = null;
                        if (foreignLocked && !alreadyPicked && !noSlot) {
                            disabledReason = `Foreigner limit reached (${MAX_FOREIGNERS}/${MAX_FOREIGNERS})`;
                        }
                        return (
                            <SeasonPlayerCard
                                key={player.name}
                                player={player}
                                selected={selectedPlayer?.name === player.name}
                                disabled={alreadyPicked || noSlot || foreignLocked}
                                disabledReason={disabledReason}
                                onSelect={handleSelectPlayer}
                            />
                        );
                    })}
                </div>
            )}

            {draftComplete && (
                <div className="flex justify-center">
                    <button
                        onClick={handleSimulate}
                        className="py-3 px-8 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold text-lg"
                    >
                        Simulate the Chase
                    </button>
                </div>
            )}
        </div>
    );
}
