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

// A year is "playable" if at least one of its players can still legally be picked
// (not already drafted, has an empty eligible slot, and isn't blocked by the foreigner cap).
// Landing on an unplayable year would strand the draft with a turn showing zero pickable
// players and no way forward, so year selection always filters down to playable years first.
function yearIsPlayable(squad, pickedNames, filledSlots, foreignersLocked) {
    return squad.some(
        (p) => !pickedNames.has(p.name) && isPlayerPickable(p, filledSlots) && !(p.country !== 'India' && foreignersLocked)
    );
}

function pickPlayableYear(years, seasonSquads, pickedNames, filledSlots, foreignersLocked, exclude) {
    const pool = exclude != null && years.length > 1 ? years.filter((y) => y !== exclude) : years;
    const playable = pool.filter((y) => yearIsPlayable(seasonSquads[String(y)] || [], pickedNames, filledSlots, foreignersLocked));
    const source = playable.length ? playable : pool;
    return source[Math.floor(Math.random() * source.length)];
}

export default function DraftGame({ teams, seasonSquadsByTeam }) {
    const { isSignedIn } = useUser();

    const [teamCode, setTeamCode] = useState(teams.length === 1 ? teams[0].code : null);
    const seasonSquads = teamCode ? seasonSquadsByTeam[teamCode] : {};
    const years = useMemo(() => Object.keys(seasonSquads).map(Number).sort(), [seasonSquads]);
    const team = teams.find((t) => t.code === teamCode);

    const [currentYear, setCurrentYear] = useState(null);
    const [filled, setFilled] = useState({});
    const [pickedNames, setPickedNames] = useState(new Set());
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [phase, setPhase] = useState('drafting');
    const [simResult, setSimResult] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [skipUsed, setSkipUsed] = useState(false);

    useEffect(() => {
        if (teamCode && years.length) {
            setCurrentYear(pickPlayableYear(years, seasonSquads, new Set(), new Set(), false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamCode]);

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
        const nextPickedNames = new Set([...pickedNames, selectedPlayer.name]);
        setFilled(nextFilled);
        setPickedNames(nextPickedNames);
        setSelectedPlayer(null);

        if (Object.keys(nextFilled).length < TOTAL_SLOTS) {
            const nextFilledSlots = new Set(Object.keys(nextFilled).map(Number));
            const nextForeignersPicked = Object.values(nextFilled).filter((f) => f.player.country !== 'India').length;
            const nextForeignersLocked = nextForeignersPicked >= MAX_FOREIGNERS;
            setCurrentYear(pickPlayableYear(years, seasonSquads, nextPickedNames, nextFilledSlots, nextForeignersLocked));
        }
    }

    function runSimulationAndSave(order) {
        const result = simulateChase(order);
        setSimResult(result);
        saveResult({
            score: result.finalScore,
            wickets: result.wickets,
            won: result.won,
            team: teamCode,
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
        setCurrentYear(pickPlayableYear(years, seasonSquads, pickedNames, filledSlots, foreignersLocked, currentYear));
    }

    function resetDraft() {
        setFilled({});
        setPickedNames(new Set());
        setSelectedPlayer(null);
        setSimResult(null);
        setPhase('drafting');
        setSkipUsed(false);
    }

    function handlePlayAgain() {
        resetDraft();
        setCurrentYear(pickPlayableYear(years, seasonSquads, new Set(), new Set(), false));
    }

    function handleChangeTeam() {
        resetDraft();
        setCurrentYear(null);
        setTeamCode(null);
    }

    if (!teamCode) {
        return (
            <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10 max-w-md mx-auto">
                <p className="font-display text-text text-lg uppercase tracking-wide">Choose a franchise</p>
                <select
                    onChange={(e) => setTeamCode(e.target.value)}
                    defaultValue=""
                    className="form-select bg-accent text-white border-none rounded-lg px-4 py-2 text-base font-medium cursor-pointer transition-colors hover:bg-accentHover w-full"
                >
                    <option value="" disabled>Select a team…</option>
                    {teams.map((t) => (
                        <option key={t.code} value={t.code}>{t.name} ({t.founded}-{t.lastYear})</option>
                    ))}
                </select>
            </div>
        );
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
                <div className="flex items-center gap-3">
                    <p className="font-display text-text text-sm sm:text-base">
                        {team.name} · {draftComplete ? 'Squad complete' : `Turn ${pickedCount + 1} / ${TOTAL_SLOTS}`}
                    </p>
                    {teams.length > 1 && (
                        <button
                            onClick={handleChangeTeam}
                            className="text-xs px-3 py-1 rounded-lg border border-border text-textMuted hover:text-text hover:border-accent transition-colors font-semibold"
                        >
                            Change Team
                        </button>
                    )}
                </div>
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
