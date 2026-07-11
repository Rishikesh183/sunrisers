'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import '../styles/Loader.css';

const Loader = () => {
    const [portalNode, setPortalNode] = useState(null);

    useEffect(() => {
        setPortalNode(document.getElementById('portal-root'));
    }, []);

    if (!portalNode) return null;

    return createPortal(
        <div className="loader-class">
            <img
                src="https://www.sunrisershyderabad.in/dist/img/srh-logo.gif"
                alt="Loading"
                className="img-responsive"
            />
        </div>,
        portalNode
    );
};

export default Loader;
