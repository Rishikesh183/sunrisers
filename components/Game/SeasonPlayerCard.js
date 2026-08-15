import images from '../images.js';

function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function ratingGlow(value) {
    if (value >= 90) return 'text-accent';
    if (value >= 75) return 'text-win';
    return 'text-text';
}

export default function SeasonPlayerCard({ player, selected, disabled, disabledReason, onSelect }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(player)}
            className={`text-left card bg-surface border rounded-xl p-3 sm:p-4 flex flex-col gap-2 transition-colors w-full
                ${disabled ? 'opacity-40 cursor-not-allowed border-border' : 'cursor-pointer hover:border-accent/40 hover:bg-surfaceHover'}
                ${selected ? 'border-accent bg-surfaceHover' : 'border-border'}`}
        >
            <div className="flex items-center gap-3">
                <div className="relative shrink-0 w-12 h-12 rounded-full bg-accentMuted text-accent font-display flex items-center justify-center text-sm">
                    {initials(player.name)}
                    {player.country !== 'India' && (
                        <img src={images.foreign} alt="" className="absolute -top-1 -right-1 w-4 h-4" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-text truncate">{player.name}</p>
                    <p className="text-xs text-textMuted truncate">{player.role}</p>
                </div>
            </div>

            <div className="flex gap-4 text-xs sm:text-sm">
                <span className={`font-display ${ratingGlow(player.BAT)}`}>BAT {player.BAT}</span>
                <span className={`font-display ${ratingGlow(player.POW)}`}>POW {player.POW}</span>
                {player.BWL > 0 && <span className={`font-display ${ratingGlow(player.BWL)}`}>BWL {player.BWL}</span>}
            </div>

            {disabled && (
                <p className="text-[11px] text-loss">{disabledReason || 'No open slot left for this role'}</p>
            )}
        </button>
    );
}
