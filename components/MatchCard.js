const STYLE_BY_VARIANT = {
    home: {
        wrapper: 'min-w-[80vw] xs:min-w-[70vw] sm:min-w-[50vw] md:min-w-[25vw] mt-5 mb-5 ml-5 mr-2.5',
        compact: true,
    },
    schedule: {
        wrapper: 'w-full',
        compact: false,
    },
};

function resultTone(resultText) {
    if (!resultText) return 'neutral';
    const text = resultText.toLowerCase();
    if (text.startsWith('srh won')) return 'win';
    if (text.includes('won')) return 'loss';
    return 'neutral';
}

function CardLinks({ variant, data }) {
    const linkClasses = 'text-textMuted hover:text-accent transition-colors text-sm';
    if (variant === 'upcoming') {
        return (
            <>
                <a href="https://www.district.in/events/sunrisers-hyderabad-team" className={linkClasses}>Book tickets</a>
                <div className="border-l border-border h-5 mx-2.5"></div>
                <p className="text-accent text-sm m-0">{data.HomeAway}</p>
            </>
        );
    }
    return (
        <>
            <a href="https://www.iplt20.com/videos/highlights" className={linkClasses}>Highlights</a>
            <div className="border-l border-border h-5 mx-2.5"></div>
            <a href="https://www.iplt20.com/matches/results" className={linkClasses}>Schedule</a>
        </>
    );
}

export default function MatchCard({ data, variant = 'home' }) {
    const s = STYLE_BY_VARIANT[variant === 'home' ? 'home' : 'schedule'];
    const resultText = variant === 'upcoming' ? data.venueDate : data.result;
    const tone = variant === 'upcoming' ? 'neutral' : resultTone(resultText);

    const pillClasses = {
        win: 'bg-win/15 text-win',
        loss: 'bg-loss/15 text-loss',
        neutral: 'bg-accentMuted text-accent',
    }[tone];

    return (
        <div className={`${s.wrapper} flex-shrink-0 bg-surface border border-border rounded-xl p-4 box-border transition-colors hover:border-accent/40 hover:bg-surfaceHover capitalize`}>
            <div className="font-display text-xs tracking-wide text-textMuted text-center mb-3">IPL 2026</div>

            <div className="flex items-center justify-between py-1.5">
                <span className="font-semibold text-text truncate pr-2">{data.teamOne || 'Unknown Team 1'}</span>
                <span className="font-display tabular-nums text-lg text-text">{data.scoreOne || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
                <span className="font-semibold text-text truncate pr-2">{data.teamTwo || 'Unknown Team 2'}</span>
                <span className="font-display tabular-nums text-lg text-text">{data.scoreTwo || 'N/A'}</span>
            </div>

            <div className={`mt-3 mb-3 rounded-lg px-3 py-2 text-sm font-semibold text-center ${pillClasses}`}>
                {resultText || 'No Result Yet'}
            </div>

            <div className="h-px bg-border my-3"></div>

            <div className="flex items-center justify-center gap-2">
                <CardLinks variant={variant} data={data} />
            </div>
        </div>
    );
}
