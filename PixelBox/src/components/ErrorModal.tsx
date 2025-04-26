import React from 'react';
import '../App.css';

interface ErrorModalProps {
    message: string;
    onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {

    return (
        <div className="error-overlay">
            <div className="error-content">
                <h1>Error</h1>
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default ErrorModal;