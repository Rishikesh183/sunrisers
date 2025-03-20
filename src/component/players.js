import React, { useState, useEffect } from 'react';
import playersData from '../data/PlayerDetails';
import Playercard from './Playercard';

export default function Players(props) {
    const [text, setText] = useState("");
    const [query, setQuery] = useState("");
    // eslint-disable-next-line
    const [Players, setPlayers] = useState(playersData.Players);
    
    useEffect(() => {
        document.body.style.backgroundColor = '#e67e22';
        return () => {
            // Clean up the body style when component unmounts
            document.body.style.backgroundColor = '';
        };
    }, []);

    useEffect(() => {
        setQuery(text);
    }, [text]);

    const capture = (input) => {
        if (typeof input === 'string') {
            setText(input);
        }
        else if (input && input.target) {
            setText(input.target.value);
        }
    }

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
                textAlign: "center",
                fontSize: 'clamp(18px, 4vw, 24px)',
                fontWeight: '600',
                marginTop: 'clamp(15px, 3vw, 30px)',
                marginBottom: 'clamp(10px, 1.5vw, 15px)',
                color: 'black',
                borderBottom: `3px solid black`,
                paddingBottom: 'clamp(5px, 1vw, 10px)',
            }}>THE RISERS OF 2024 CLASS</h2>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffab73',
                padding: 'clamp(10px, 2vw, 20px)',
                borderRadius: 'clamp(5px, 1vw, 10px)',
                marginBottom: 'clamp(10px, 2vw, 20px)',
                borderLeft: `5px solid black`,
                borderRight: `5px solid black`,
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 'clamp(10px, 2vw, 20px)',
                    width: '100%'
                }}>
                    <select 
                        style={{
                            backgroundColor: '#FF4B33',
                            color: 'BLACK',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            height: "clamp(35px, 5vw, 45px)",
                            width: 'clamp(200px, 50%, 300px)',
                        }} 
                        className="form-select" 
                        onChange={capture}
                    >
                        <option value="">All Players</option>
                        <option value="Batsman">Batters</option>
                        <option value="Bowler">Bowlers</option>
                        <option value="All-rounder">All-rounders</option>
                        <option value="Wicketkeeper">Wicketkeepers</option>
                    </select>
                </div>
                
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 80%, 300px), 1fr))',
                        gap: 'clamp(10px, 2vw, 20px)',
                        justifyContent: 'center',
                        margin: '0 auto'
                    }}>
                        {Players.filter(player => player.role.includes(query)).map((player, index) => (
                            <div 
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center'
                                }} 
                                key={index}
                            >
                                <Playercard
                                    title={player.name}
                                    captain={player.Duty}
                                    role={player.role}
                                    imgurl={player.url}
                                    Age={player.Age}
                                    debut={player.debut}
                                    batting={player.batting}
                                    bowling={player.bowling}
                                    country={player.country}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}