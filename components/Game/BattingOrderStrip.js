import { TOTAL_SLOTS, slotLabel } from '../../lib/game/positions';

export default function BattingOrderStrip({ filled, eligibleSlots, onSlotClick }) {
    const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i + 1);
    const eligible = new Set(eligibleSlots || []);

    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2">
            {slots.map((slot) => {
                const pick = filled[slot];
                const isEligible = eligible.has(slot) && !pick;
                return (
                    <button
                        key={slot}
                        type="button"
                        disabled={!isEligible}
                        onClick={() => onSlotClick(slot)}
                        className={`flex flex-col items-center justify-center rounded-lg border p-2 min-h-[64px] text-center transition-colors
                            ${pick ? 'border-accent bg-accentMuted' : 'border-border bg-surface'}
                            ${isEligible ? 'cursor-pointer border-win hover:bg-surfaceHover' : ''}
                            ${!isEligible && !pick ? 'opacity-50' : ''}`}
                    >
                        <span className="text-[10px] text-textMuted">#{slot} {slotLabel(slot)}</span>
                        <span className="text-xs font-semibold text-text truncate w-full">
                            {pick ? pick.player.name : '—'}
                        </span>
                        {pick && <span className="text-[10px] text-textMuted">{pick.year}</span>}
                    </button>
                );
            })}
        </div>
    );
}
