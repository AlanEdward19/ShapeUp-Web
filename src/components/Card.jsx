import React from 'react';
import './Card.css';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`su-card ${className}`} {...props}>
            {children}
        </div>
    );
};

export default Card;
