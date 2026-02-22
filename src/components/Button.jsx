import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  icon = null,
  className = '',
  ...props 
}) => {
  const classes = [
    'su-btn',
    `su-btn-${variant}`,
    fullWidth ? 'su-btn-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {icon && <span className="su-btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
