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
    markResultSeen,
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
import { saveLocalResult, loadLocalResult, pruneLocalResults } from '../../../../lib/duel/localResults';
import Spinner from '../../../../components/Duel/Spinner';
import TossPanel from '../../../../components/Duel/TossPanel';
import DuelDraftBoard from '../../../../components/Duel/DuelDraftBoard';
import DuelResult from '../../../../components/Duel/DuelResult';
import TeamPicker from '../../../../components/Duel/TeamPicker';

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
    const [liveRoom, setRoom] = useState(undefined); // Firestore copy: undefined = loading, null = not found
    // A finished room is deleted from Firestore once both players have it, so the result screen
    // falls back to the copy kept in memory this visit, then to this browser's localStorage copy.
    const [finishedRoom, setFinishedRoom] = useState(null);
    const [cachedRoom, setCachedRoom] = useState(null);
    const room = liveRoom || finishedRoom || cachedRoom || liveRoom;
    const seenReported = useRef(false);
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
        pruneLocalResults();
        setCachedRoom(loadLocalResult(roomId));
    }, [roomId]);

    const myUid = user?.id;

    // Once this player has the finished room, keep a local copy and tell Firestore - the second
    // player to do so deletes the room (the dashboard's duelResults summary stays).
    useEffect(() => {
        if (!liveRoom || liveRoom.status !== 'complete' || !myUid) return;
        if (myUid !== liveRoom.hostUid && myUid !== liveRoom.guestUid) return;
        setFinishedRoom(liveRoom);
        saveLocalResult(liveRoom);
        if (seenReported.current) return;
        seenReported.current = true;
        markResultSeen(roomId, myUid).catch(() => {
            // cleanup only - the room's deleteAt TTL removes it later if this fails
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveRoom?.status, myUid]);

    const hostSeasonSquads = room ? getSeasonSquads(room.hostTeam) : {};
    const guestSeasonSquads = room && room.guestTeam ? getSeasonSquads(room.guestTeam) : {};
    const myTeamCode = room ? (myUid === room.hostUid ? room.hostTeam : room.guestTeam) : null;
    // Before joining, a guest's page takes the colour of the franchise they've just tapped.
    const teamInfo = TEAMS.find((t) => t.code === (myTeamCode || guestTeamChoice || room?.hostTeam));
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
        // 'duel' scoring sits a little below solo Hard - the aim here is to win, not to reach 300.
        const firstResult = simulateChase(firstOrder, Math.random, null, 'duel', false, bowlingStrength(secondOrder));
        // Must beat (not just match) the first innings - target is score + 1, and the chase ends the ball it's reached.
        const secondResult = simulateChase(secondOrder, Math.random, firstResult.finalScore + 1, 'duel', true, bowlingStrength(firstOrder));
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
        if (!guestTeamChoice) return;
        setJoining(true);
        try {
            await joinRoom(roomId, {
                guestUid: myUid,
                guestName: displayNameFromClerkUser(user),
                guestTeam: guestTeamChoice,
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
        body = (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10 text-center">
                <p className="text-text">This room doesn't exist, or it's a finished duel whose replay has been cleared.</p>
                <p className="text-sm text-textMuted">Finished duels stay on your dashboard.</p>
                <Link href="/dashboard" className="text-accent text-sm underline">Go to dashboard</Link>
            </div>
        );
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
                    <div className="w-full">
                        <TeamPicker teams={teams} value={guestTeamChoice} onChange={setGuestTeamChoice} />
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={joining || !guestTeamChoice}
                        className="py-2 px-6 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold disabled:bg-border disabled:text-textMuted disabled:cursor-not-allowed"
                    >
                        {joining ? 'Joining…' : guestTeamChoice ? 'Join Duel' : 'Pick a franchise to join'}
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
