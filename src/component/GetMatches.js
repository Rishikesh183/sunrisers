import React, { useEffect } from 'react'
import { useState } from 'react';
import axios from "axios";
import ListCard from './ListCard';
import '../Styles/Matches.css'
const GetMatches = () => {

    const [Matches, setMatches] = useState([]);
    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await axios.get(`https://react-guide-2024-9c920-default-rtdb.firebaseio.com/`)
                const data = response.data

                if(!data){
                    return;
                }
                const transformedData = data.map((item, index) => {
                    return {
                        ...item,
                        id: index
                    }
                })
                setMatches(transformedData)
            }
            catch (error) {
                console.log(error);
            }
        }
        fetchItems();
        return () => {
            setMatches([])
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <>
            <div className="scrolling-wrapper-flexbox">
                <div className="card"><ListCard/></div>
                <div className="card"><ListCard/></div>
                <div className="card"><ListCard/></div>
                <div className="card"><ListCard/></div>
                <div className="card"><ListCard/></div>
                <div className="card"><ListCard/></div>
            </div>
        </>
    )
}

export default GetMatches
