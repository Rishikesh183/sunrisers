import React from 'react'
import { NavLink } from 'react-router-dom'
const LiveSchedule = () => {
    return (
        <div >
            <div className='bg-orange-500 w-full '>
                <ul className='flex text-white mx-3 p-1 px-4 justify-around text-xl'>
                    <NavLink to={`/Matches/live`} className=''>Live</NavLink>
                    <NavLink to={`/Matches/upcoming`} className=''>Upcoming</NavLink>
                    <NavLink to={`/Matches`} className=''>recent</NavLink>
                </ul>
            </div>
            
            <div className='flex items-center text-2xl font-bold text-center max-h-screen justify-center pt-20 lg:text-xl'>There are no live matches currently please head to recent or upcoming matches ☹️</div>
        </div>
    )
}

export default LiveSchedule
