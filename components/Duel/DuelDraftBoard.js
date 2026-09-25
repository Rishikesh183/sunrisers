'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import SeasonPlayerCard from '../Game/SeasonPlayerCard';
import BattingOrderStrip from '../Game/BattingOrderStrip';
import {
    TOTAL_SLOTS,
    eligibleEmptySlots,
    isPlayerPickable,
    pickPlayableYear,
} from '../../lib/game/positions';
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

    const myFilled = useMemo(() => buildFilled(picks, myUid, mySeasonSquads), [picks, myUid, mySeasonSquads]);
    const opponentFilled = useMemo(
        () => buildFilled(picks, opponentUid, opponentSeasonSquads),
        [picks, opponentUid, opponentSeasonSquads]
    );
    // Picks only need to stay exclusive when both players drafted the SAME franchise - if they
    // picked different teams, the rosters are already disjoint, so cross-checking names would
    // wrongly block, say, a player who appears in both franchises' histories in different years.
    const allPickedNames = useMemo(() => {
        const names = picks.filter((p) => sameTeam || p.uid === myUid).map((p) => p.playerName);
        return new Set(names);
    }, [picks, sameTeam, myUid]);
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

    function handleSlotClick(slot) {
        if (!isMyTurn || !selectedPlayer || myFilled[slot]) return;
        if (!selectedPlayer.slots.includes(slot)) return;
        onSubmitPick({
            uid: myUid,
            turnIndex: room.currentTurnIndex,
            year: currentYear,
            playerName: selectedPlayer.name,
            slot,
        });
        setSelectedPlayer(null);
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 bg-surface border border-border rounded-xl p-3 sm:p-4">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <p className="font-display text-text text-sm">
                        Turn {room.currentTurnIndex + 1} / {TOTAL_SLOTS * 2}
                    </p>
                    <p className={`font-display text-sm ${isMyTurn ? 'text-accent' : 'text-textMuted'}`}>
                        {isMyTurn ? 'Your pick' : `${opponentName}'s pick`}
                    </p>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2">
                    {isMyTurn && currentYear ? (
                        <p className="text-accent font-display text-base sm:text-lg">{currentYear} Squad</p>
                    ) : (
                        <div />
                    )}
                    <p className="text-xs text-textMuted">
                        {myName}: {myFilledSlots.size}/{TOTAL_SLOTS} · Foreigners: {myForeignersPicked}/{MAX_FOREIGNERS}
                    </p>
                </div>
            </div>

            <div>
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{myName}'s {myTeam}</p>
                <BattingOrderStrip
                    filled={myFilled}
                    eligibleSlots={isMyTurn ? eligibleSlotsForSelection : []}
                    onSlotClick={handleSlotClick}
                />
            </div>

            {selectedPlayer && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 bg-surface border border-accent rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-[92vw]">
                    <p className="text-sm text-text">
                        Select a position to place <span className="text-accent font-semibold">{selectedPlayer.name}</span>
                    </p>
                    <button
                        onClick={() => setSelectedPlayer(null)}
                        className="text-textMuted hover:text-text transition-colors shrink-0"
                        aria-label="Cancel selection"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {isMyTurn && (
                <div className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                    {currentSquad.map((player) => {
                        const alreadyPicked = allPickedNames.has(player.name);
                        const noSlot = !isPlayerPickable(player, myFilledSlots);
                        const foreignLocked = isForeignLocked(player);
                        let disabledReason = null;
                        if (foreignLocked && !alreadyPicked && !noSlot) {
                            disabledReason = `Foreigner limit reached (${MAX_FOREIGNERS}/${MAX_FOREIGNERS})`;
                        } else if (alreadyPicked) {
                            disabledReason = 'Already drafted this match';
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

            <div>
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{opponentName}'s {opponentTeam}</p>
                <BattingOrderStrip filled={opponentFilled} eligibleSlots={[]} onSlotClick={() => {}} />
            </div>
        </div>
    );
}
