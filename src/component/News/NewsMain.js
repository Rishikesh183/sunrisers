import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import '../../Styles/NewsMain.css'
import Loader from "../Loader"
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../firebase.config';
const NewsMain = () => {
    const [loader, setloader] = useState(true)
    const [News, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const newsCollection = collection(db, "news");
                const q = query(newsCollection, orderBy("timestamp", "desc"));
                const querySnapshot = await getDocs(q);

                const newsList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setNews(newsList);
            }
            catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setloader(false); // Stop loading once data is fetched
            }
        }  
        fetchNews();
    }, []);
    if (loader) {
        return <Loader />
    }
    return (
        <div className="news-main-container">
            <div className="news-header w-full">
                <h2 className="news-title">Orange Chronicles: Keeping Up with the Risers</h2>
                <p className="news-subtitle">Stay updated with the latest news on SRH</p>
            </div>
            <div className="news-grid">
                {News.map(item => (
                    <NewsCard key={item.id} data={item} />
                ))}
            </div>
        </div>
    );
}

export default NewsMain;