import React, { useEffect } from 'react'
import { useState } from 'react';
import ScheduleCard from './ScheduleCard';
import { NavLink } from 'react-router-dom';
import '../Styles/Schedule.css'
import '../Styles/Matches.css'
import Loader from './Loader';

const Schedule = () => {
    const [loader, setloader] = useState(true)
    const [Matches, setMatches] = useState([]);
    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await fetch('https://sunrisers-8841a-default-rtdb.firebaseio.com/.json');
                const data = await response.json();

                if (!data || !data.Details) return; 

                // Use the Details array directly
                const transformedData = data.Details.map((match, index) => ({
                    ...match,
                    id: index,
                }));

                setMatches(transformedData);
            } catch (error) {
                console.error('Fetch error:', error);
            }
            finally{
                setloader(false)
            }
        }
        fetchItems();
    }, []);
    if (loader) return <Loader />; 
    return (
        <>
            <div className="matches-main-container">
                <div className='bg-orange-500 w-full '>
                    <ul className='flex text-white mx-3 p-1 px-4 justify-around text-xl'>
                        <NavLink to={`/Matches/live`} className=''>Live</NavLink>
                        <NavLink to={`/Matches/upcoming`} className=''>Upcoming</NavLink>
                        <NavLink to={`/Matches`} className=''>recent</NavLink>
                    </ul>
                </div>
                <div className="matches-header">
                    <h2 className="matches-title">SRH 2025 Results - schedule & results</h2>
                    <p className="matches-subtitle">Stay updated with the latest matches of SRH</p>
                </div>
                <div className="matches-grid">
                    {Matches.map(item => (
                        <ScheduleCard key={item.id} data={item} />
                    ))}
                </div>
            </div>
        </>
    )
}

export default Schedule