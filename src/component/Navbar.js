import React from 'react';
import '../Styles/Navbar.css'
// import srhLogo from '../Assets/srhLogo.jpg';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <ul className="navbar-menu">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#news">News</a></li>
                    <li><a href="#Matches">Matches</a></li>
                    <li><a href="#players">Players</a></li>
                </ul>
                <div className='left-div'>
                    {/* <img src={srhLogo} alt="logo" className="navbar-logo" /> */}
                    <button className="login-btn">Login</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
