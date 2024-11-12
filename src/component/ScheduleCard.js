import React from "react";
import "../Styles/ScheduleCard.css"

function ScheduleCard({ data }) {

  return (
      <div className="matchCardS">
          <div className="matchNameS font-bold">IPL 2024</div>
          <div className="TeamOneS">
              <div>{data.teamOne || 'Unknown Team 1'}</div>
              <div>{data.scoreOne || 'N/A'}</div>
          </div>
          <div className="TeamTwoS">
              <div>{data.teamTwo || 'Unknown Team 2'}</div>
              <div>{data.scoreTwo || 'N/A'}</div>
          </div>
          <div className="resultS">
              <div>{data.result || 'No Result Yet'}</div>
          </div>
          <div className="lineS"></div>
          <div className="BottomS">
              <div className="DepthS">
                  <a href="https://www.iplt20.com/videos/highlights" style={{ textDecoration: 'none', color: "brown" }}>Highlights</a>
                  <div style={{ borderLeft: '3px solid black', height: '20px', margin: '0 10px' }}></div>
                  <a href="https://www.iplt20.com/matches/results" style={{ textDecoration: 'none', color: "brown" }}>Schedule</a>
              </div>
          </div>
      </div>
  );
}



export default ScheduleCard;



