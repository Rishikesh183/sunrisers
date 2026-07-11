import Link from 'next/link';

const LiveSchedule = () => {
    return (
        <div>
            <div className='bg-orange-500 w-full '>
                <ul className='flex text-white mx-3 p-1 px-4 justify-around text-xl'>
                    <Link href="/Matches/live">Live</Link>
                    <Link href="/Matches/upcoming">Upcoming</Link>
                    <Link href="/Matches">recent</Link>
                </ul>
            </div>

            <div className='flex items-center text-2xl font-bold text-center max-h-screen justify-center pt-20 lg:text-xl'>There are no live matches currently please head to recent or upcoming matches ☹️</div>
        </div>
    );
};

export default LiveSchedule;
