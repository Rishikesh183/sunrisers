'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import SeasonPlayerCard from './SeasonPlayerCard';
import BattingOrderStrip from './BattingOrderStrip';
import ScoreBoard from './ScoreBoard';
import LivePlayback from './LivePlayback';
import {
    TOTAL_SLOTS,
    eligibleEmptySlots,
    isPlayerPickable,
    pickPlayableYear,
    slotLabel,
} from '../../lib/game/positions';
import { simulateChase } from '../../lib/game/simulate';
import { getBestScore, saveResult } from '../../lib/game/localHistory';

const MAX_FOREIGNERS = 4;

export default function DraftGame({ teams, seasonSquadsByTeam }) {
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
    const [skipUsed, setSkipUsed] = useState(false);
    const [difficulty, setDifficulty] = useState('hard');
    const [pendingDifficulty, setPendingDifficulty] = useState(null);

    const themeStyle = team
        ? { '--accent': team.color, '--accent-hover': team.colorHover, '--accent-muted': team.colorMuted }
        : undefined;

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

    function handleSimulate() {
        const result = simulateChase(battingOrder, Math.random, 300, difficulty);
        setSimResult(result);
        saveResult({
            score: result.finalScore,
            wickets: result.wickets,
            won: result.won,
            team: teamCode,
            xi: battingOrder.map((p) => p.name),
        });
        setPhase('playback');
    }

    function handlePlaybackDone() {
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

    function handleDifficultyChange(next) {
        if (next === difficulty) return;
        if (pickedCount === 0) {
            setDifficulty(next);
        } else {
            setPendingDifficulty(next);
        }
    }

    function confirmDifficultyChange() {
        setDifficulty(pendingDifficulty);
        setPendingDifficulty(null);
        resetDraft();
        setCurrentYear(pickPlayableYear(years, seasonSquads, new Set(), new Set(), false));
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

    if (phase === 'playback' && simResult) {
        return (
            <div style={themeStyle}>
                <LivePlayback
                    result={simResult}
                    battingOrder={battingOrder}
                    teamName={team.name}
                    onDone={handlePlaybackDone}
                />
            </div>
        );
    }

    if (phase === 'result' && simResult) {
        return (
            <div style={themeStyle}>
                <ScoreBoard
                    battingOrder={battingOrder}
                    result={simResult}
                    bestScore={getBestScore()}
                    onPlayAgain={handlePlayAgain}
                />
            </div>
        );
    }

    const eligibleSlotsForSelection = selectedPlayer ? eligibleEmptySlots(selectedPlayer, filledSlots) : [];
    const draftComplete = pickedCount === TOTAL_SLOTS;

    return (
        <div className="flex flex-col gap-5" style={themeStyle}>
            <div className="flex flex-col gap-3 bg-surface border border-border rounded-xl p-3 sm:p-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-3">
                        <p className="font-display text-text text-sm">
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
                    <label className="flex items-center gap-2 text-xs text-textMuted">
                        Difficulty:
                        <select
                            value={difficulty}
                            onChange={(e) => handleDifficultyChange(e.target.value)}
                            className="bg-bg border border-border rounded-lg px-2 py-1 text-xs text-text font-semibold capitalize cursor-pointer"
                        >
                            <option value="hard">Hard</option>
                            <option value="easy">Easy</option>
                        </select>
                    </label>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2">
                    {!draftComplete ? (
                        <div className="flex items-center gap-3">
                            <p className="text-accent font-display text-base sm:text-lg">{currentYear} Squad</p>
                            <button
                                onClick={handleSkipYear}
                                disabled={skipUsed}
                                className={`text-xs px-3 py-1 rounded-lg border transition-colors font-semibold
                                    ${skipUsed ? 'border-border text-textMuted opacity-40 cursor-not-allowed' : 'border-accent text-accent hover:bg-accentMuted cursor-pointer'}`}
                            >
                                {skipUsed ? 'Skip Used' : 'Skip Year'}
                            </button>
                        </div>
                    ) : (
                        <div />
                    )}
                    <p className="text-xs text-textMuted">
                        Bowlers: {bowlersPicked}/4 · Keeper: {keeperPicked ? 'Yes' : 'No'} · Foreigners: {foreignersPicked}/{MAX_FOREIGNERS}
                    </p>
                </div>
            </div>

            <BattingOrderStrip filled={filled} eligibleSlots={eligibleSlotsForSelection} onSlotClick={handleSlotClick} />

            {selectedPlayer && (
                <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 sm:pb-6 pointer-events-none">
                    <div className="pointer-events-auto w-full max-w-md bg-surface border-2 border-accent rounded-xl shadow-2xl px-4 py-3 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3 w-full">
                            <p className="text-sm text-text flex-1">
                                Select a position for <span className="text-white font-semibold">{selectedPlayer.name}</span>
                            </p>
                            <button
                                onClick={() => setSelectedPlayer(null)}
                                className="text-textMuted hover:text-text transition-colors shrink-0"
                                aria-label="Cancel selection"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {eligibleSlotsForSelection.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => handleSlotClick(slot)}
                                    className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accentHover transition-colors"
                                >
                                    <span className="font-display text-sm">{slot}</span>
                                    <span className="text-[10px] leading-none">{slotLabel(slot)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {pendingDifficulty && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface border border-border rounded-xl p-5 max-w-sm w-full flex flex-col gap-3">
                        <p className="text-text text-sm">
                            Switching difficulty will start a new draft and discard your current picks. Continue?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPendingDifficulty(null)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-border text-textMuted hover:text-text transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDifficultyChange}
                                className="text-xs px-3 py-1.5 rounded-lg bg-accent hover:bg-accentHover text-white transition-colors font-semibold"
                            >
                                Start New Draft
                            </button>
                        </div>
                    </div>
                </div>
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
