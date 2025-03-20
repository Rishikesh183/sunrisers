import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
import '../Styles/Schedule.css'
import '../Styles/Matches.css'
import UpcomingMatchCard from './UpcomingMatchCard';
import Loader from './Loader';
const Schedule = () => {
    const [loader, setLoader] = useState(true)
    const [Matches, setMatches] = useState([]);
    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await fetch('https://upcoming-matches-25ec3-default-rtdb.firebaseio.com/.json');
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
            finally {
                setLoader(false)
            }
        }
        fetchItems();
    }, []);
    if (loader) return <Loader />;
    return (
        <>
            <div className='w-full'>
                <div className='bg-orange-500 w-full'>
                    <ul className='flex text-white mx-3 p-1 px-4 justify-around text-xl'>
                        <NavLink to={`/Matches/live`} className=''>Live</NavLink>
                        <NavLink to={`/Matches/upcoming`} className=''>Upcoming</NavLink>
                        <NavLink to={`/Matches`} className=''>recent</NavLink>
                    </ul>
                </div>
                <div className="matches-main-container">
                    <div className="matches-header w-screen ">
                        <h2 className="matches-title">SRH SCHEDULE 2025 - Upcoming Matches</h2>
                        <p className="matches-subtitle">Stay updated with the latest matches of SRH</p>
                    </div>
                    <div className="matches-grid">
                        {Matches.map(item => (
                            <UpcomingMatchCard key={item.id} data={item} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Schedule