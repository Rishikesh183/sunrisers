import React, { useEffect, useState } from 'react';
import ListCard from './ListCard';
import '../Styles/Matches.css';
// import '../srh-bg.jpg';
import NewsHome from './News/NewsHome';
import NewsHomeMobile from './News/NewsHomeMobile';

const GetMatches = () => {
    const [Matches, setMatches] = useState([]);
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await fetch('https://sunrisers-8841a-default-rtdb.firebaseio.com/.json');
                const data = await response.json();

                if (!data || !data.Details) return; // Ensure data and Details are available

                const transformedData = data.Details.map((match, index) => ({
                    ...match, 
                    id: index, 
                }));

                setMatches(transformedData);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
        fetchItems();
    }, []);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <div className="scrolling-wrapper-flexbox">
                {Matches.map(item => (
                    <ListCard key={item.id} data={item} />
                ))}
            </div>
            {width > 1200 && <NewsHome />} 
            {width<1200 && <NewsHomeMobile/>} 
            
        </>
    );
}

export default GetMatches;
