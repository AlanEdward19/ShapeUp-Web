import React from 'react';
import './Input.css';

const Input = ({
    label,
    id,
    type = 'text',
    error,
    trailing,
    ...props
}) => {
    const field = (
        <input
            id={id}
            name={props.name || id}
            type={type}
            className={`su-input ${error ? 'su-input-error' : ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
        />
    );

    return (
        <div className="su-input-group">
            {label && (
                <label htmlFor={id} className="su-input-label">
                    {label}
                </label>
            )}
            {trailing ? (
                <div className={`su-input-row ${error ? 'is-error' : ''}`}>
                    {field}
                    {trailing}
                </div>
            ) : (
                field
            )}
            {error && <span id={`${id}-error`} className="su-input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
