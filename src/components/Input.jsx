import React from 'react';
import './Input.css';

const Input = ({
    label,
    id,
    type = 'text',
    error,
    ...props
}) => {
    return (
        <div className="su-input-group">
            {label && (
                <label htmlFor={id} className="su-input-label">
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                className={`su-input ${error ? 'su-input-error' : ''}`}
                {...props}
            />
            {error && <span className="su-input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
