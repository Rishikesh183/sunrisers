'use client';

import { useEffect, useState } from 'react';
import ListCard from '../components/ListCard';
import '../styles/Matches.css';
import NewsHome from '../components/News/NewsHome';
import NewsHomeMobile from '../components/News/NewsHomeMobile';
import BottomSection from '../components/BottomSection';
import Loader from '../components/Loader';

const GetMatches = () => {
    const [Matches, setMatches] = useState([]);
    const [width, setWidth] = useState(0);
    const [loader, setLoader] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchItems() {
            setLoader(true);
            try {
                const response = await fetch('https://sunrisers-8841a-default-rtdb.firebaseio.com/.json');
                const data = await response.json();

                if (!data || !data.Details) {
                    throw new Error('No data or Details field found');
                }
                const transformedData = data.Details.map((match, index) => ({
                    ...match,
                    id: index,
                }));

                setMatches(transformedData);
            } catch (error) {
                console.error('Fetch error:', error);
                setError('Failed to fetch matches. Please try again later.');
            } finally {
                setLoader(false);
            }
        }
        fetchItems();
    }, []);

    useEffect(() => {
        setWidth(window.innerWidth);
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loader) return <Loader />;

    if (error) {
        return <div className="error-message">{error}</div>;
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
