'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import Panel from '../Game/Panel';
import Spinner from './Spinner';
import SquadPanel from '../Game/SquadPanel';
import BattingOrderStrip from '../Game/BattingOrderStrip';
import {
    TOTAL_SLOTS,
    eligibleEmptySlots,
    isPlayerPickable,
    pickPlayableYear,
    slotLabel,
} from '../../lib/game/positions';
import { NO_KEEPER_PENALTY } from '../../lib/game/simulate';
import { turnUid, otherPlayerUid, teamOf, isSameTeam } from '../../lib/duel/room';

const MAX_FOREIGNERS = 4;

function findPlayer(seasonSquads, year, name) {
    return (seasonSquads[String(year)] || []).find((p) => p.name === name);
}

function buildFilled(picks, uid, seasonSquads) {
    const filled = {};
    for (const pick of picks) {
        if (pick.uid !== uid) continue;
        const player = findPlayer(seasonSquads, pick.year, pick.playerName);
        if (player) filled[pick.slot] = { player, year: pick.year };
    }
    return filled;
}

export default function DuelDraftBoard({ room, myUid, hostSeasonSquads, guestSeasonSquads, picks, onSubmitPick }) {
    const opponentUid = room.hostUid === myUid ? room.guestUid : room.hostUid;
    const opponentName = room.hostUid === myUid ? room.guestName : room.hostName;
    const myName = room.hostUid === myUid ? room.hostName : room.guestName;
    const myTeam = teamOf(room, myUid);
    const opponentTeam = teamOf(room, opponentUid);
    const mySeasonSquads = myUid === room.hostUid ? hostSeasonSquads : guestSeasonSquads;
    const opponentSeasonSquads = myUid === room.hostUid ? guestSeasonSquads : hostSeasonSquads;
    const sameTeam = isSameTeam(room);

    const years = useMemo(() => Object.keys(mySeasonSquads).map(Number).sort(), [mySeasonSquads]);
    const otherUid = otherPlayerUid(room, room.firstPickerUid);
    const isMyTurn = turnUid(room.currentTurnIndex, room.firstPickerUid, otherUid) === myUid;

    // Optimistic pick: applied to the local view the instant you click a slot, before the
    // Firestore transaction round-trip confirms it - reconciled away once the real `picks`
    // subcollection reflects this turnIndex, or rolled back if the submit fails. This is what
    // makes your own board/turn update feel instant instead of waiting out the network latency.
    const [optimisticPick, setOptimisticPick] = useState(null);
    useEffect(() => {
        if (optimisticPick && picks.some((p) => p.turnIndex === optimisticPick.turnIndex)) {
            setOptimisticPick(null);
        }
    }, [picks, optimisticPick]);
    const effectivePicks = useMemo(
        () => (optimisticPick ? [...picks, optimisticPick] : picks),
        [picks, optimisticPick]
    );
    const isMyTurnDisplay = isMyTurn && !optimisticPick;

    const myFilled = useMemo(() => buildFilled(effectivePicks, myUid, mySeasonSquads), [effectivePicks, myUid, mySeasonSquads]);
    const opponentFilled = useMemo(
        () => buildFilled(effectivePicks, opponentUid, opponentSeasonSquads),
        [effectivePicks, opponentUid, opponentSeasonSquads]
    );
    // Picks only need to stay exclusive when both players drafted the SAME franchise - if they
    // picked different teams, the rosters are already disjoint, so cross-checking names would
    // wrongly block, say, a player who appears in both franchises' histories in different years.
    const allPickedNames = useMemo(() => {
        const names = effectivePicks.filter((p) => sameTeam || p.uid === myUid).map((p) => p.playerName);
        return new Set(names);
    }, [effectivePicks, sameTeam, myUid]);
    const myFilledSlots = useMemo(() => new Set(Object.keys(myFilled).map(Number)), [myFilled]);
    const myForeignersPicked = Object.values(myFilled).filter((f) => f.player.country !== 'India').length;
    const myForeignersLocked = myForeignersPicked >= MAX_FOREIGNERS;

    const [currentYear, setCurrentYear] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        if (isMyTurn) {
            setCurrentYear(pickPlayableYear(years, mySeasonSquads, allPickedNames, myFilledSlots, myForeignersLocked));
            setSelectedPlayer(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMyTurn, room.currentTurnIndex]);

    const currentSquad = currentYear ? mySeasonSquads[String(currentYear)] || [] : [];
    const eligibleSlotsForSelection = selectedPlayer ? eligibleEmptySlots(selectedPlayer, myFilledSlots) : [];

    function isForeignLocked(player) {
        return player.country !== 'India' && myForeignersLocked;
    }

    function handleSelectPlayer(player) {
        if (allPickedNames.has(player.name) || isForeignLocked(player)) return;
        setSelectedPlayer((prev) => (prev?.name === player.name ? null : player));
    }

    async function handleSlotClick(slot) {
        if (!isMyTurnDisplay || !selectedPlayer || myFilled[slot]) return;
        if (!selectedPlayer.slots.includes(slot)) return;
        const payload = {
            uid: myUid,
            turnIndex: room.currentTurnIndex,
            year: currentYear,
            playerName: selectedPlayer.name,
            slot,
        };
        setOptimisticPick(payload);
        setSelectedPlayer(null);
        try {
            await onSubmitPick(payload);
        } catch {
            setOptimisticPick(null); // roll back - the pick didn't actually go through
        }
    }

    function getCardState(player) {
        const alreadyPicked = allPickedNames.has(player.name);
        const noSlot = !isPlayerPickable(player, myFilledSlots);
        const foreignLocked = isForeignLocked(player);
        let reason = null;
        if (foreignLocked && !alreadyPicked && !noSlot) {
            reason = `Foreigner limit reached (${MAX_FOREIGNERS}/${MAX_FOREIGNERS})`;
        } else if (alreadyPicked) {
            reason = 'Already drafted this match';
        }
        return { disabled: alreadyPicked || noSlot || foreignLocked, reason };
    }

    const myKeeperPicked = Object.values(myFilled).some((f) => f.player.isKeeper);
    const statPills = [`Keeper: ${myKeeperPicked ? 'Yes' : 'No'}`, `Foreigners ${myForeignersPicked}/${MAX_FOREIGNERS}`];
    const turnLabel = optimisticPick ? 'Saving your pick…' : isMyTurnDisplay ? 'Your pick' : `${opponentName}'s pick`;

    return (
        <div className="flex flex-col gap-5">
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

            <div className="flex flex-wrap justify-between items-center gap-2 bg-surface/85 backdrop-blur-sm border border-border rounded-2xl px-4 py-3">
                <p className="font-display text-text text-sm">
                    Turn {room.currentTurnIndex + 1} / {TOTAL_SLOTS * 2}
                </p>
                <p className={`font-display text-sm flex items-center gap-2 ${isMyTurnDisplay ? 'text-accent' : 'text-textMuted'}`}>
                    {(optimisticPick || !isMyTurnDisplay) && <Spinner />}
                    {turnLabel}
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:h-[calc(100vh-15rem)] lg:min-h-[540px]">
                <Panel title={`${myName}'s ${myTeam}`} badge={`${myFilledSlots.size} / ${TOTAL_SLOTS}`}>
                    <div className="flex flex-wrap gap-2">
                        {statPills.map((label) => (
                            <span key={label} className="px-3 py-1 rounded-full border border-border bg-bg/50 text-xs text-textMuted">
                                {label}
                            </span>
                        ))}
                    </div>
                    {!myKeeperPicked && (
                        <p className="text-[13px] text-amber-300">
                            No wicketkeeper yet — an XI without one is docked {NO_KEEPER_PENALTY} runs.
                        </p>
                    )}
                    <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto no-scrollbar">
                        <BattingOrderStrip
                            filled={myFilled}
                            eligibleSlots={isMyTurnDisplay ? eligibleSlotsForSelection : []}
                            onSlotClick={handleSlotClick}
                        />
                    </div>
                </Panel>

                <div className="flex flex-col gap-4 min-h-0">
                    {isMyTurnDisplay ? (
                        <Panel
                            title={
                                <>
                                    Pick from <span className="text-accent">{myTeam}</span> Players
                                </>
                            }
                            className="lg:flex-1"
                        >
                            {currentYear && (
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-1.5 rounded-full bg-accentMuted border border-accent/40 text-accent font-display">
                                        {currentYear} Squad
                                    </span>
                                </div>
                            )}
                            <SquadPanel
                                squad={currentSquad}
                                year={currentYear}
                                selectedPlayer={selectedPlayer}
                                getState={getCardState}
                                onSelect={handleSelectPlayer}
                            />
                        </Panel>
                    ) : (
                        <Panel title="Waiting for the other pick">
                            <div className="flex flex-col items-center gap-3 py-6 text-sm text-textMuted text-center">
                                <Spinner size={22} label={optimisticPick ? 'Saving your pick…' : `Waiting for ${opponentName}…`} />
                                {!optimisticPick && <p>You can watch their XI fill up below.</p>}
                            </div>
                        </Panel>
                    )}

                    <Panel title={`${opponentName}'s ${opponentTeam}`} badge={`${Object.keys(opponentFilled).length} / ${TOTAL_SLOTS}`}>
                        <BattingOrderStrip filled={opponentFilled} eligibleSlots={[]} onSlotClick={() => {}} compact />
                    </Panel>
                </div>
            </div>
        </div>
    );
}
