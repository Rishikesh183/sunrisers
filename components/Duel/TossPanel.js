'use client';

export default function TossPanel({ room, myUid, onChoose }) {
    const iWonToss = room.tossWinnerUid === myUid;
    const winnerName = room.tossWinnerUid === room.hostUid ? room.hostName : room.guestName;

    if (!iWonToss) {
        return (
            <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-xl p-6 sm:p-10">
                <p className="font-display text-text uppercase tracking-wide text-sm">Toss</p>
                <p className="text-text text-center">{winnerName} won the toss — waiting for their choice…</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 bg-surface border border-border rounded-xl p-6 sm:p-10">
            <p className="font-display text-text uppercase tracking-wide text-sm">You won the toss!</p>
            <p className="text-textMuted text-sm text-center">Draft first, or let your opponent go first?</p>
            <div className="flex gap-3">
                <button
                    onClick={() => onChoose(myUid)}
                    className="py-2 px-5 rounded-lg text-white bg-accent hover:bg-accentHover transition-colors font-semibold"
                >
                    I'll pick first
                </button>
                <button
                    onClick={() => onChoose(room.hostUid === myUid ? room.guestUid : room.hostUid)}
                    className="py-2 px-5 rounded-lg text-text border border-border hover:bg-surfaceHover transition-colors font-semibold"
                >
                    Opponent picks first
                </button>
            </div>
        </div>
    );
}
