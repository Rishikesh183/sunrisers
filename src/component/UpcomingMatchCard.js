import React from "react";
import '../Styles/ScheduleCard.css'

function UpcomingMatchCard({ data }) {

    return (
        <div className="matchCardS">
            <div className="matchNameS font-bold">IPL 2025</div>
            <div className="TeamOneS">
                <div>{data.teamOne || 'Unknown Team 1'}</div>
                <div>{data.scoreOne || 'N/A'}</div>
            </div>
            <div className="TeamTwoS">
                <div>{data.teamTwo || 'Unknown Team 2'}</div>
                <div>{data.scoreTwo || 'N/A'}</div>
            </div>
            <div className="resultS">
                <div>{data.venueDate || 'No Result Yet'}</div>
            </div>
            <div className="lineS"></div>
            <div className="BottomS">
                <div className="DepthS">
                    <a href="https://www.district.in/events/sunrisers-hyderabad-team">Book tickets</a>
                    <div style={{ borderLeft: '3px solid black', height: '20px', margin: '0 10px' }}></div>
                    <p  style={{ textDecoration: 'none', color: "brown" }}>{data.HomeAway}</p>
                </div>
            </div>
        </div>
    );
}


// style={{ textDecoration: 'none', color: "brown" }}
export default UpcomingMatchCard;