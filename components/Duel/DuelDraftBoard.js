'use client';

import { useEffect, useMemo, useState } from 'react';
import SeasonPlayerCard from '../Game/SeasonPlayerCard';
import BattingOrderStrip from '../Game/BattingOrderStrip';
import {
    TOTAL_SLOTS,
    eligibleEmptySlots,
    isPlayerPickable,
    pickPlayableYear,
} from '../../lib/game/positions';
import { turnUid, otherPlayerUid } from '../../lib/duel/room';

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

export default function DuelDraftBoard({ room, myUid, seasonSquads, picks, onSubmitPick }) {
    const years = useMemo(() => Object.keys(seasonSquads).map(Number).sort(), [seasonSquads]);
    const otherUid = otherPlayerUid(room, room.firstPickerUid);
    const isMyTurn = turnUid(room.currentTurnIndex, room.firstPickerUid, otherUid) === myUid;
    const opponentUid = room.hostUid === myUid ? room.guestUid : room.hostUid;
    const opponentName = room.hostUid === myUid ? room.guestName : room.hostName;
    const myName = room.hostUid === myUid ? room.hostName : room.guestName;

    const myFilled = useMemo(() => buildFilled(picks, myUid, seasonSquads), [picks, myUid, seasonSquads]);
    const opponentFilled = useMemo(() => buildFilled(picks, opponentUid, seasonSquads), [picks, opponentUid, seasonSquads]);
    // Picks are exclusive across the whole room - once either player has a player-season, the
    // other can't also draft it. Keeps both sides watching each other's picks matter strategically.
    const allPickedNames = useMemo(() => new Set(picks.map((p) => p.playerName)), [picks]);
    const myFilledSlots = useMemo(() => new Set(Object.keys(myFilled).map(Number)), [myFilled]);
    const myForeignersPicked = Object.values(myFilled).filter((f) => f.player.country !== 'India').length;
    const myForeignersLocked = myForeignersPicked >= MAX_FOREIGNERS;

    const [currentYear, setCurrentYear] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        if (isMyTurn) {
            setCurrentYear(pickPlayableYear(years, seasonSquads, allPickedNames, myFilledSlots, myForeignersLocked));
            setSelectedPlayer(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMyTurn, room.currentTurnIndex]);

    const currentSquad = currentYear ? seasonSquads[String(currentYear)] || [] : [];
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-surface border border-border rounded-xl p-3 sm:p-4">
                <p className="font-display text-text text-sm sm:text-base">
                    Turn {room.currentTurnIndex + 1} / {TOTAL_SLOTS * 2}
                </p>
                <p className={`font-display text-sm sm:text-base ${isMyTurn ? 'text-accent' : 'text-textMuted'}`}>
                    {isMyTurn ? 'Your pick' : `${opponentName}'s pick`}
                </p>
                {isMyTurn && currentYear && (
                    <p className="text-accent font-display text-lg sm:text-xl">{currentYear} Squad</p>
                )}
                <p className="text-xs text-textMuted">
                    {myName}: {myFilledSlots.size}/{TOTAL_SLOTS} · Foreigners: {myForeignersPicked}/{MAX_FOREIGNERS}
                </p>
            </div>

            <div>
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{myName}'s {room.team}</p>
                <BattingOrderStrip
                    filled={myFilled}
                    eligibleSlots={isMyTurn ? eligibleSlotsForSelection : []}
                    onSlotClick={handleSlotClick}
                />
            </div>

            {selectedPlayer && (
                <p className="text-center text-sm text-textMuted">
                    Pick an open, highlighted slot above for <span className="text-accent font-semibold">{selectedPlayer.name}</span>.
                </p>
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
                <p className="text-xs text-textMuted uppercase tracking-wide mb-2">{opponentName}'s {room.team}</p>
                <BattingOrderStrip filled={opponentFilled} eligibleSlots={[]} onSlotClick={() => {}} />
            </div>
        </div>
    );
}
