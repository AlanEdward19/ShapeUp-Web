import React, { useState } from 'react';
import './CreditCardUI.css';

const CreditCardUI = ({ cardData, isFlipped }) => {
    const { number, name, expiry, cvv } = cardData;

    const formatCardNumber = (num) => {
        if (!num) return '#### #### #### ####';
        const padded = num.padEnd(16, '#');
        return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
    };

    const formatExpiry = (exp) => {
        if (!exp) return 'MM/YY';
        return exp;
    };

    return (
        <div className={`su-cc-scene`}>
            <div className={`su-cc-card ${isFlipped ? 'is-flipped' : ''}`}>
                {/* Front */}
                <div className="su-cc-face su-cc-front">
                    <div className="su-cc-chip"></div>
                    <div className="su-cc-type">
                        {number.startsWith('4') && <span className="su-cc-logo-visa">VISA</span>}
                        {number.startsWith('5') && <span className="su-cc-logo-mc">MasterCard</span>}
                    </div>
                    <div className="su-cc-number">{formatCardNumber(number)}</div>
                    <div className="su-cc-details">
                        <div className="su-cc-col">
                            <span className="su-cc-label">Cardholder Name</span>
                            <span className="su-cc-val">{name || 'YOUR NAME'}</span>
                        </div>
                        <div className="su-cc-col su-cc-col-right">
                            <span className="su-cc-label">Expires</span>
                            <span className="su-cc-val">{formatExpiry(expiry)}</span>
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div className="su-cc-face su-cc-back">
                    <div className="su-cc-magstripe"></div>
                    <div className="su-cc-cvv-strip">
                        <span className="su-cc-cvv-label">CVV</span>
                        <div className="su-cc-cvv-box">{cvv || '***'}</div>
                    </div>
                    <div className="su-cc-back-desc">
                        Mock credit card for ShapeUp Platform. Not valid for real transactions.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditCardUI;
