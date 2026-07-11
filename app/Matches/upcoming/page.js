import Link from 'next/link';
import '../../../styles/Schedule.css';
import '../../../styles/Matches.css';

const UpcomingSchedule = () => {
    return (
        <div>
            <div className='bg-orange-500 w-full '>
                <ul className='flex text-white mx-3 p-1 px-4 justify-around text-xl'>
                    <Link href="/Matches/live">Live</Link>
                    <Link href="/Matches/upcoming">Upcoming</Link>
                    <Link href="/Matches">recent</Link>
                </ul>
            </div>

            <div className='flex items-center text-2xl font-bold text-center max-h-screen justify-center pt-20 lg:text-xl'>Wait for the IPL 2026 .... chinnaswamy lo cup manade 😁

                <p className='text-orange-500'>
                    #10 Year Challenge 💪
                </p>
            </div>
        </div>
    );
};

export default UpcomingSchedule;
