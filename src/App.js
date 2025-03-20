import './App.css';
import { Routes, Route } from "react-router-dom";
import Navbar from './component/Navbar';
import GetMatches from './component/GetMatches';
import About from './component/About';
import Schedule from './component/Schedule';
import NewsMain from './component/News/NewsMain';
import Players from './component/players';
import NewsDetails from './component/News/NewsDetails';
import LiveSchedule from './component/LiveSchedule';
import UpcomingMatches from './component/upcomingMatches';
import AddNews from './component/AddNews';
import { SignInPage } from './routes/sign-in';
import { SignUpPage } from './routes/sign-up';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<GetMatches />} />
        <Route path="/about" element={<About />} />
        <Route path="/Matches" element={<Schedule />} />
        <Route path="/news" element={<NewsMain />} />
        <Route path="/players" element={<Players />} />
        <Route path="/news/:newsId" element={<NewsDetails />} />
        <Route path="/Matches/live" element={<LiveSchedule />} />
        <Route path="/Matches/upcoming" element={<UpcomingMatches />} />
        <Route path="/addNews" element={<AddNews />} />
        <Route path="/signin/*" element={<SignInPage />} />
        <Route path="/signup/*" element={<SignUpPage />} />
      </Routes>
    </div>
  );
}

export default App;
