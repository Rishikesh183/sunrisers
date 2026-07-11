import '../styles/ListCard.css';

function ListCard({ data }) {
  // console.log("Data passed to ListCard:", JSON.stringify(data, null, 2)); // Check what data is being passed

  return (
      <div className="matchCard">
          <div className="matchName font-bold">IPL 2025</div>
          <div className="TeamOne">
              <div>{data.teamOne || 'Unknown Team 1'}</div>
              <div>{data.scoreOne || 'N/A'}</div>
          </div>
          <div className="TeamTwo">
              <div>{data.teamTwo || 'Unknown Team 2'}</div>
              <div>{data.scoreTwo || 'N/A'}</div>
          </div>
          <div className="result">
              <div>{data.result || 'No Result Yet'}</div>
          </div>
          <div className="line"></div>
          <div className="Bottom">
              <div className="Depth">
                  <a href="https://www.iplt20.com/videos/highlights" style={{ textDecoration: 'none', color: "brown" }}>Highlights</a>
                  <div style={{ borderLeft: '3px solid black', height: '20px', margin: '0 10px' }}></div>
                  <a href="https://www.iplt20.com/matches/results" style={{ textDecoration: 'none', color: "brown" }}>Schedule</a>
              </div>
          </div>
      </div>
  );
}



export default ListCard;



