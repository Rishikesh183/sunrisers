'use client';

import { useState } from 'react';
import Spinner from './Spinner';

export default function TossPanel({ room, myUid, onChoose }) {
    const [choosing, setChoosing] = useState(false);
    const iWonToss = room.tossWinnerUid === myUid;
    const winnerName = room.tossWinnerUid === room.hostUid ? room.hostName : room.guestName;

    if (!iWonToss) {
        return (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="font-display text-text uppercase tracking-wide text-sm">Toss</p>
                <p className="text-text text-center">{winnerName} won the toss — waiting for their choice…</p>
                <Spinner className="text-textMuted" />
            </div>
        );
    }

    async function choose(uid) {
        setChoosing(true);
        try {
            await onChoose(uid);
        } finally {
            setChoosing(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
            <p className="font-display text-text uppercase tracking-wide text-sm">You won the toss!</p>
            <p className="text-textMuted text-sm text-center">
                Whoever drafts first also bats first in the simulation. Bat first, or bowl first?
            </p>
            <div className="flex gap-3">
                <button
                    onClick={() => choose(myUid)}
                    disabled={choosing}
                    className="py-2 px-5 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    I'll bat first
                </button>
                <button
                    onClick={() => choose(room.hostUid === myUid ? room.guestUid : room.hostUid)}
                    disabled={choosing}
                    className="py-2 px-5 rounded-lg text-text border border-border hover:bg-surfaceHover transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    I'll bowl first
                </button>
            </div>
            {choosing && <Spinner label="Starting the draft…" className="text-sm text-textMuted" />}
        </div>
    );
}
