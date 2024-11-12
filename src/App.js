import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './component/Navbar';
import GetMatches from './component/GetMatches';
import './index.css';
import About from './component/About';
import Schedule from './component/Schedule';
import NewsMain from './component/News/NewsMain';

function App() {
  return (
    <div className="app">
      <Navbar/>
      <Router>
        <Routes> 
          <Route path="/" element={<GetMatches />} />
          <Route path="/about" element={<About/>}/>
          <Route path="/Matches" element={<Schedule/>}/>
          <Route path="/news" element={<NewsMain/>}/>
          </Routes>
      </Router>
    </div>
  );
}

export default App;
