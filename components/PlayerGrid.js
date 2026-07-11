'use client';

import { useState } from 'react';
import Playercard from './Playercard';

export default function PlayerGrid({ players }) {
    const [query, setQuery] = useState('');

    const capture = (event) => setQuery(event.target.value);

    return (
        <>
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
                        height: 'clamp(35px, 5vw, 45px)',
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
                    {players.filter(player => player.role.includes(query)).map((player, index) => (
                        <div
                            style={{ display: 'flex', justifyContent: 'center' }}
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
        </>
    );
}
