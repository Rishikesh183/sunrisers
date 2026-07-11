import PlayerGrid from '../../components/PlayerGrid';
import { getPlayers } from '../../lib/data/players';

export default function Players() {
    const players = getPlayers();

    return (
        <div className="players-container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'clamp(15px, 3vw, 40px)',
            fontFamily: 'Roboto, sans-serif',
            backgroundColor: '#e67e22',
            color: '#333',
            borderRadius: 'clamp(10px, 2vw, 25px)',
            animation: 'fadeIn 1s ease-in-out'
        }}>
            <h1 style={{
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: '700',
                marginBottom: 'clamp(10px, 2vw, 20px)',
                color: 'black',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: 'clamp(1px, 0.3vw, 3px)',
            }}>Sunrisers Hyderabad</h1>

            <h2 style={{
                textAlign: 'center',
                fontSize: 'clamp(18px, 4vw, 24px)',
                fontWeight: '600',
                marginTop: 'clamp(15px, 3vw, 30px)',
                marginBottom: 'clamp(10px, 1.5vw, 15px)',
                color: 'black',
                borderBottom: '3px solid black',
                paddingBottom: 'clamp(5px, 1vw, 10px)',
            }}>THE RISERS OF 2024 CLASS</h2>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffab73',
                padding: 'clamp(10px, 2vw, 20px)',
                borderRadius: 'clamp(5px, 1vw, 10px)',
                marginBottom: 'clamp(10px, 2vw, 20px)',
                borderLeft: '5px solid black',
                borderRight: '5px solid black',
            }}>
                <PlayerGrid players={players} />
            </div>
        </div>
    );
}
