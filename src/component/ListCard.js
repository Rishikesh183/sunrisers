import React from "react";
import "../Styles/ListCard.css"

function ListCard() {
  return (
    <div className="matchCard">
      <div className="matchName">
        ipl finals
      </div>
      <div className="TeamOne">
        <div>SRH</div>
        <div>113-10 [18.4]</div>
      </div>
      <div className="TeamTwo">
        <div>KKR</div>
        <div>114-2 [12.2]</div>
      </div>
      <div className="result">
        <div>KKR won by 8 wickets</div>
      </div>
      <div className="Bottom">
        <div><a href="https://www.iplt20.com/videos/highlights">Higlights</a></div>
      </div>
    </div>
  );
}

export default ListCard;

