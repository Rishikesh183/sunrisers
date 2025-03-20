import React from 'react';
import '../../Styles/NewsCard.css'
import { useNavigate } from 'react-router-dom';
const NewsCard = ({ data }) => {
    // const Heading = (data.Title).split(" ")
    // const title = Heading[1]+Heading[2]+Heading[3];
    // console.log(title) 
    const navigate = useNavigate();
    const handleClick = ()=>{
        navigate(`/news/${data.title}`);
    }
    return (
        <div className="news-card" onClick={handleClick}>
            <div className="news-image-container">
                <img className="news-image" src={data.imageUrl} alt="Logo" />
            </div>
            <div className="news-content">
                <h1 className="news-card-title">
                    {data.title || "News Title"}
                </h1>
                <p className="news-card-description">
                    {data.description || "News Description"}
                </p>
            </div>
        </div>
    );
};

export default NewsCard;