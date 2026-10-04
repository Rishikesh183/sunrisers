'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import {
    subscribeToRoom,
    subscribeToPicks,
    joinRoom,
    chooseFirstPicker,
    submitPick,
    finalizeResult,
    closeRoom,
    isRoomExpired,
    ROOM_TTL_MS,
} from '../../../../lib/duel/room';
import { getSeasonSquads, getTeams } from '../../../../lib/data/seasonSquads';
import { displayNameFromClerkUser } from '../../../../lib/userName';
import { simulateChase, bowlingStrength } from '../../../../lib/game/simulate';
import { TOTAL_SLOTS } from '../../../../lib/game/positions';
import { TEAMS } from '../../../../data/teams';
import { friendlyError } from '../../../../lib/firebaseErrors';
import Spinner from '../../../../components/Duel/Spinner';
import TossPanel from '../../../../components/Duel/TossPanel';
import DuelDraftBoard from '../../../../components/Duel/DuelDraftBoard';
import DuelResult from '../../../../components/Duel/DuelResult';

function buildBattingOrder(picks, uid, seasonSquads) {
    const bySlot = {};
    for (const pick of picks) {
        if (pick.uid !== uid) continue;
        const player = (seasonSquads[String(pick.year)] || []).find((p) => p.name === pick.playerName);
        if (player) bySlot[pick.slot] = player;
    }
    return Array.from({ length: TOTAL_SLOTS }, (_, i) => bySlot[i + 1]).filter(Boolean);
}

function teamName(code) {
    return TEAMS.find((t) => t.code === code)?.name || code;
}

export default function DuelRoomPage({ params }) {
    const { roomId } = params;
    const { user, isSignedIn, isLoaded } = useUser();
    const [room, setRoom] = useState(undefined); // undefined = loading, null = not found
    const [picks, setPicks] = useState([]);
    const [actionError, setActionError] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [guestTeamChoice, setGuestTeamChoice] = useState(null);
    const [copied, setCopied] = useState(false);
    const [closing, setClosing] = useState(false);
    const [joining, setJoining] = useState(false);
    const simulateAttempted = useRef(false);
    const teams = getTeams();

    useEffect(() => {
        const onListenError = (err) => setLoadError(friendlyError(err));
        const unsubRoom = subscribeToRoom(roomId, setRoom, onListenError);
        const unsubPicks = subscribeToPicks(roomId, setPicks, onListenError);
        return () => {
            unsubRoom();
            unsubPicks();
        };
    }, [roomId]);

    useEffect(() => {
        if (room && room.hostTeam && guestTeamChoice === null) {
            setGuestTeamChoice(room.hostTeam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.hostTeam]);

    const myUid = user?.id;
    const hostSeasonSquads = room ? getSeasonSquads(room.hostTeam) : {};
    const guestSeasonSquads = room && room.guestTeam ? getSeasonSquads(room.guestTeam) : {};
    const myTeamCode = room ? (myUid === room.hostUid ? room.hostTeam : room.guestTeam) : null;
    const teamInfo = TEAMS.find((t) => t.code === (myTeamCode || room?.hostTeam));
    const themeStyle = teamInfo
        ? { '--accent': teamInfo.color, '--accent-hover': teamInfo.colorHover, '--accent-muted': teamInfo.colorMuted }
        : undefined;

    useEffect(() => {
        if (!room || room.status !== 'simulating' || simulateAttempted.current) return;
        simulateAttempted.current = true;

        // Whoever won the toss and chose to draft first also bats first here - the two are the
        // same decision, not independently host-vs-guest (a real bug this fixes: it used to
        // always simulate the host's innings first regardless of who actually picked first).
        const firstUid = room.firstPickerUid;
        const isHostFirst = firstUid === room.hostUid;
        const secondUid = isHostFirst ? room.guestUid : room.hostUid;
        const firstSeasonSquads = isHostFirst ? hostSeasonSquads : guestSeasonSquads;
        const secondSeasonSquads = isHostFirst ? guestSeasonSquads : hostSeasonSquads;

        const firstOrder = buildBattingOrder(picks, firstUid, firstSeasonSquads);
        const secondOrder = buildBattingOrder(picks, secondUid, secondSeasonSquads);
        // No target for the first innings - it just sets the score the second side has to beat.
        const firstResult = simulateChase(firstOrder, Math.random, null, 'hard', false, bowlingStrength(secondOrder));
        // Must beat (not just match) the first innings - target is score + 1, and the chase ends the ball it's reached.
        const secondResult = simulateChase(secondOrder, Math.random, firstResult.finalScore + 1, 'hard', true, bowlingStrength(firstOrder));
        const winnerUid = secondResult.won ? secondUid : firstUid;

        const hostResult = isHostFirst ? firstResult : secondResult;
        const guestResult = isHostFirst ? secondResult : firstResult;

        finalizeResult(roomId, {
            hostResult,
            guestResult,
            winnerUid,
            hostUid: room.hostUid,
            guestUid: room.guestUid,
            hostTeam: room.hostTeam,
            guestTeam: room.guestTeam,
            hostName: room.hostName,
            guestName: room.guestName,
            battedFirstUid: firstUid,
        }).catch((err) => setActionError(friendlyError(err)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room?.status]);

    async function handleJoin() {
        setJoining(true);
        try {
            await joinRoom(roomId, {
                guestUid: myUid,
                guestName: displayNameFromClerkUser(user),
                guestTeam: guestTeamChoice || room.hostTeam,
            });
        } catch (err) {
            setActionError(friendlyError(err));
        } finally {
            setJoining(false);
        }
    }

    async function handleChooseFirstPicker(uid) {
        try {
            await chooseFirstPicker(roomId, uid);
        } catch (err) {
            setActionError(friendlyError(err));
        }
    }

    async function handleSubmitPick(payload) {
        try {
            await submitPick(roomId, payload);
        } catch (err) {
            setActionError(friendlyError(err));
            throw err; // let DuelDraftBoard roll back its optimistic pick on failure
        }
    }

    async function handleCloseRoom() {
        setClosing(true);
        try {
            await closeRoom(roomId, myUid);
        } catch (err) {
            setActionError(friendlyError(err));
            setClosing(false);
        }
    }

    function handleCopyLink() {
        const link = typeof window !== 'undefined' ? window.location.href : '';
        navigator.clipboard?.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    let body;

    if (loadError) {
        body = <p className="text-sm text-loss text-center">{loadError}</p>;
    } else if (!isLoaded || room === undefined) {
        body = <Spinner label="Loading room…" className="text-sm text-textMuted justify-center w-full" />;
    } else if (room === null) {
        body = <p className="text-sm text-loss text-center">This room doesn't exist.</p>;
    } else if (room.status === 'closed') {
        body = (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="text-text text-center">This invite was closed by the host.</p>
                <Link href="/300par/duel" className="text-accent text-sm underline">Start a new duel</Link>
            </div>
        );
    } else if (room.status === 'waiting' && isRoomExpired(room)) {
        body = <p className="text-sm text-loss text-center">This invite has expired (invites last {ROOM_TTL_MS / 60000} minutes).</p>;
    } else if (room.status === 'waiting') {
        const link = typeof window !== 'undefined' ? window.location.href : '';
        body =
            myUid === room.hostUid ? (
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">
                        This is the link to play with <span className="text-accent font-semibold">{room.opponentName || 'your opponent'}</span>. Share it to start.
                    </p>
                    <div className="flex w-full max-w-md gap-2">
                        <input
                            readOnly
                            value={link}
                            onFocus={(e) => e.target.select()}
                            className="flex-1 min-w-0 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-textMuted"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="shrink-0 text-xs px-3 py-2 rounded-lg bg-accent hover:bg-accentHover text-white font-semibold transition-colors"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <button
                        onClick={handleCloseRoom}
                        disabled={closing}
                        className="text-xs text-loss underline hover:text-loss/80 transition-colors disabled:opacity-40"
                    >
                        {closing ? 'Closing…' : 'Close this invite'}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">
                        {room.hostName} has challenged you to a 1v1 duel — {room.hostName} picked {teamName(room.hostTeam)}.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-textMuted">
                        Your franchise:
                        <select
                            value={guestTeamChoice || room.hostTeam}
                            onChange={(e) => setGuestTeamChoice(e.target.value)}
                            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text"
                        >
                            {teams.map((t) => (
                                <option key={t.code} value={t.code}>{t.name}</option>
                            ))}
                        </select>
                    </label>
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="py-2 px-6 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {joining ? 'Joining…' : 'Join Duel'}
                    </button>
                </div>
            );
    } else if (room.status === 'toss') {
        body = <TossPanel room={room} myUid={myUid} onChoose={handleChooseFirstPicker} />;
    } else if (room.status === 'drafting') {
        body = (
            <DuelDraftBoard
                room={room}
                myUid={myUid}
                hostSeasonSquads={hostSeasonSquads}
                guestSeasonSquads={guestSeasonSquads}
                picks={picks}
                onSubmitPick={handleSubmitPick}
            />
        );
    } else if (room.status === 'simulating') {
        body = <Spinner label="Both squads are set — Lets start the game…" className="text-sm text-textMuted justify-center w-full" />;
    } else if (room.status === 'complete') {
        body = <DuelResult room={room} myUid={myUid} />;
    }

    return (
        <div
            className={`mx-auto bg-bg min-h-screen ${
                room?.status === 'complete' ? 'px-4 sm:px-6 md:px-10 pt-3 pb-6' : 'p-4 sm:p-6 md:p-10'
            } ${room?.status === 'drafting' ? 'max-w-3xl lg:max-w-7xl' : 'max-w-3xl'}`}
            style={themeStyle}
        >
            {room?.status !== 'complete' && (
                <h1 className="text-2xl sm:text-3xl font-display text-text text-center uppercase tracking-wide mb-2">
                    1v1 Duel
                </h1>
            )}
            {room && room.hostName && room.guestName && room.status !== 'complete' && (
                <p className="text-sm text-textMuted text-center mb-6">
                    {room.hostName}'s {room.hostTeam} vs {room.guestName}'s {room.guestTeam}
                </p>
            )}

            <SignedOut>
                <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
                    <p className="text-text text-center">Sign in to join this duel.</p>
                    <Link
                        href={`/signin?redirect_url=/300par/duel/${roomId}`}
                        className="py-2 px-6 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                    >
                        Sign In
                    </Link>
                </div>
            </SignedOut>

            <SignedIn>
                {body}
                {actionError && <p className="text-xs text-loss text-center mt-3">{actionError}</p>}
            </SignedIn>
        </div>
    );
}
