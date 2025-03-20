import React, { useEffect, useState } from 'react';
import ListCard from './ListCard';
import '../Styles/Matches.css';
import NewsHome from './News/NewsHome';
import NewsHomeMobile from './News/NewsHomeMobile';
import BottomSection from './BottomSection';
import Loader from './Loader';

const GetMatches = () => {
    const [Matches, setMatches] = useState([]); // For match data
    const [width, setWidth] = useState(window.innerWidth); // For responsiveness
    const [loader, setLoader] = useState(true); // Loader state
    const [error, setError] = useState(null); // Error state

    // Fetch match data
    useEffect(() => {
        async function fetchItems() {
            setLoader(true); // Show loader when fetch starts
            try {
                const response = await fetch('https://sunrisers-8841a-default-rtdb.firebaseio.com/.json');
                const data = await response.json();

                if (!data || !data.Details) {
                    throw new Error('No data or Details field found'); // Error for invalid data
                }

                const transformedData = data.Details.map((match, index) => ({
                    ...match,
                    id: index,
                }));

                setMatches(transformedData); // Set match data
            } catch (error) {
                console.error('Fetch error:', error);
                setError('Failed to fetch matches. Please try again later.'); // Set error state
            } finally {
                setLoader(false); // Hide loader after fetch
            }
        }
        fetchItems();
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Conditional rendering
    if (loader) return <Loader />; // Show loader if fetching data

    if (error) {
        return <div className="error-message">{error}</div>; // Show error message if fetch fails
    }

    return (
        <>
            <div className="scrolling-wrapper-flexbox">
                {Matches.map((item) => (
                    <ListCard key={item.id} data={item} />
                ))}
            </div>
            {width > 1200 ? <NewsHome /> : <NewsHomeMobile />}
            <BottomSection />
        </>
    );
};

export default GetMatches;
