import React from 'react';
import ReactDOM from 'react-dom';
import '../Styles/Loader.css';

const Loader = () => {
    return ReactDOM.createPortal(
        <div className="loader-class">
            <img
                src="https://www.sunrisershyderabad.in/dist/img/srh-logo.gif"
                alt="Loading"
                className="img-responsive"
            />
        </div>,
        document.getElementById('portal-root') // Ensure this matches your HTML element
    );
};

export default Loader;
