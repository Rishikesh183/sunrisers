import React from 'react'
import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';

const NewsMain = () => {
    const [News, setNews] = useState([]);

    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await fetch('https://newssrh-default-rtdb.firebaseio.com/.json');
                const data = await response.json();


                // Check if Detail is defined and an array
                if (!data || !Array.isArray(data.Detail)) {
                    console.warn('Detail not found or not an array:', data);
                    return;
                }

                const transformedData = data.Detail.map((item, index) => ({
                    ...item,
                    id: index,
                }));

                setNews(transformedData);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
        fetchItems();
    }, []);

    return (
        <div className=''> 
            <div className='flex border-b-1 border-gray-200 pl-2 pt-1'>
                <div className='flex justify-between  font-bold text-2xl p-2 w-full'>Top Stories For You Today</div>
            </div>
            <div >
                {News.map(item => (
                    <NewsCard key={item.id} data={item} />
                ))}
            </div>
        </div>
    )
}

export default NewsMain
