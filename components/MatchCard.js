import '../styles/ListCard.css';
import '../styles/ScheduleCard.css';

const STYLE_BY_VARIANT = {
    home: {
        card: 'matchCard', name: 'matchName', teamOne: 'TeamOne', teamTwo: 'TeamTwo',
        result: 'result', line: 'line', bottom: 'Bottom', depth: 'Depth',
    },
    schedule: {
        card: 'matchCardS', name: 'matchNameS', teamOne: 'TeamOneS', teamTwo: 'TeamTwoS',
        result: 'resultS', line: 'lineS', bottom: 'BottomS', depth: 'DepthS',
    },
};

function CardLinks({ variant, data }) {
    if (variant === 'upcoming') {
        return (
            <>
                <a href="https://www.district.in/events/sunrisers-hyderabad-team">Book tickets</a>
                <div style={{ borderLeft: '3px solid black', height: '20px', margin: '0 10px' }}></div>
                <p style={{ textDecoration: 'none', color: 'brown' }}>{data.HomeAway}</p>
            </>
        );
    }
    return (
        <>
            <a href="https://www.iplt20.com/videos/highlights" style={{ textDecoration: 'none', color: 'brown' }}>Highlights</a>
            <div style={{ borderLeft: '3px solid black', height: '20px', margin: '0 10px' }}></div>
            <a href="https://www.iplt20.com/matches/results" style={{ textDecoration: 'none', color: 'brown' }}>Schedule</a>
        </>
    );
}

export default function MatchCard({ data, variant = 'home' }) {
    const s = STYLE_BY_VARIANT[variant === 'home' ? 'home' : 'schedule'];
    const resultText = variant === 'upcoming' ? data.venueDate : data.result;

    return (
        <div className={s.card}>
            <div className={`${s.name} font-bold`}>IPL 2025</div>
            <div className={s.teamOne}>
                <div>{data.teamOne || 'Unknown Team 1'}</div>
                <div>{data.scoreOne || 'N/A'}</div>
            </div>
            <div className={s.teamTwo}>
                <div>{data.teamTwo || 'Unknown Team 2'}</div>
                <div>{data.scoreTwo || 'N/A'}</div>
            </div>
            <div className={s.result}>
                <div>{resultText || 'No Result Yet'}</div>
            </div>
            <div className={s.line}></div>
            <div className={s.bottom}>
                <div className={s.depth}>
                    <CardLinks variant={variant} data={data} />
                </div>
            </div>
        </div>
    );
}
