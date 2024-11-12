import React, { useState, useEffect } from 'react';
import playersData from '../data/PlayerDetails';
import Playercard from './Playercard';

export default function Players(props) {
    const [text, setText] = useState("");
    const [query, setQuery] = useState("");
    // eslint-disable-next-line
    const [Players, setPlayers] = useState(playersData.Players);
    document.body.style.backgroundColor = '#e67e22';

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

    const styles = {
        container: {
            maxWidth: '95vw',
            margin: '0 auto',
            padding: '3vw',
            fontFamily: 'Roboto, sans-serif',
            backgroundColor: '#e67e22',
            color: '#333',
            borderRadius: '2vw',
            animation: 'fadeIn 1s ease-in-out'
        },
        heading: {
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'black',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '3px',
        },
        subHeading: {
            textAlign: "center",
            fontSize: '24px',
            fontWeight: '600',
            marginTop: '30px',
            marginBottom: '15px',
            color: 'black',
            borderBottom: `3px solid black`,
            paddingBottom: '10px',
        },
        selectContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginRight: '1vw',
            flexWrap: 'wrap',
            gap: '5px',
        },
        select: {
            backgroundColor: '#FF4B33',
            color: 'BLACK',
            border: 'none',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            margin: '0 7px',
            minWidth: '300px',
            height: "45px",
            width: 'auto',
            marginRight: '15px'
        },
        highlights: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffab73',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            borderLeft: `5px solid black`,
            borderRight: `5px solid black`,
        },
        cardContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '15px',
            justifyContent: 'space-around',
        },
        cardWrapper: {
            flex: '0 1 23%',
            maxWidth: '23%',
        },
        '@media(max-width: 1200px)': {
            cardWrapper: {
                flex: '0 1 30%',
                maxWidth: '30%',
            }
        },
        '@media(max-width: 768px)': {
            cardWrapper: {
                flex: '0 1 45%',
                maxWidth: '45%',
            }
        },
        '@media(max-width: 576px)': {
            cardWrapper: {
                flex: '0 1 100%',
                maxWidth: '100%',
            },
            heading: {
                fontSize: '24px',
            },
            subHeading: {
                fontSize: '18px',
            },
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Sunrisers Hyderabad</h1>
            <h2 style={styles.subHeading}>THE RISERS OF 2024 CLASS</h2>

            <div style={styles.highlights}>
                <div style={styles.selectContainer}>
                    <select style={styles.select} className="form-select me-2" onChange={capture}>
                        <option value="">All Players</option>
                        <option value="Batsman">Batters</option>
                        <option value="Bowler">Bowlers</option>
                        <option value="All-rounder">All-rounders</option>
                        <option value="Wicketkeeper">Wicketkeepers</option>
                    </select>
                </div>
                <div className="container my-3">
                    <div style={styles.cardContainer}>
                        {Players.filter(player => player.role.includes(query)).map((player, index) => (
                            <div style={styles.cardWrapper} key={index}>
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
