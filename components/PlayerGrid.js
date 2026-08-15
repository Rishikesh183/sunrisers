'use client';

import { useState } from 'react';
import Playercard from './Playercard';

export default function PlayerGrid({ players }) {
    const [query, setQuery] = useState('');

    const capture = (event) => setQuery(event.target.value);

    return (
        <>
            <div className="flex justify-center mb-4 sm:mb-5 w-full">
                <select
                    className="form-select bg-accent text-white border-none rounded-lg px-3 py-2 text-sm sm:text-base font-medium cursor-pointer transition-colors hover:bg-accentHover h-[38px] sm:h-[45px] w-[200px] sm:w-[260px]"
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
                <div className="grid gap-4 sm:gap-5 justify-center mx-auto grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
                    {players.filter(player => player.role.includes(query)).map((player, index) => (
                        <div
                            className="flex justify-center"
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
