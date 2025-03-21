import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../Loader';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from '../../../firebase.config';
const NewsDetails = () => {
    const params = useParams();
    const [News, setNews] = useState([]);
    const [loader, setLoader] = useState(true); // State to track loading

    useEffect(() => {
        async function fetchItems() {
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
                setLoader(false); // Stop loading once data is fetched
            }
        }
        fetchItems();
    }, []);

    // Wait for loading to finish
    if (loader) {
        return <Loader />;
    }

    // Find the news item
    const NewsPage = News.find(item => params.newsId === item.title);
    // console.log(NewsPage)
    // If news item is not found
    if (!NewsPage) {
        return <div>News not found</div>;
    }

    return (
        <div className="w-full">
    <div className="bg-orange-500">
        <h1 className="p-2 font-bold text-xl md:text-2xl text-white">{NewsPage.title}</h1>
    </div>
    <div className="p-3 w-full md:w-4/5 lg:w-2/5 mx-auto font-semibold">
        <img 
            className="h-[30vh] w-full objectcenter object-cover object-top mb-6 rounded-lg shadow-md" 
            src={NewsPage.imageUrl} 
            alt={NewsPage.title} 
        />
        <p className="text-base leading-relaxed">
            {NewsPage.longDesc}
        </p>
    </div>
</div>
    );
}

export default NewsDetails;
