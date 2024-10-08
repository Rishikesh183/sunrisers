import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './component/Navbar';
import GetMatches from './component/GetMatches';
import './index.css';

function App() {
  return (
    <div className="app">
      <Navbar/>
      <Router>
        <Routes> 
          <Route path="/" element={<GetMatches />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
