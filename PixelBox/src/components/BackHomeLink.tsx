import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const BackHomeLink: React.FC = () => {
    return (
        <Link to="/" className="back-to-home">Home</Link>
    );
};

export default BackHomeLink;