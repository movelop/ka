import React from 'react';

const Button = ({
  icon,
  bgColor,
  color,
  bgHoverColor,
  size = 'sm',
  text,
  borderRadius = '10px',
  width,
  handleClick,
  disabled = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      style={{
        backgroundColor: bgColor,
        color,
        borderRadius,
        width: width === 'full' ? '100%' : width,
        fontSize: size === '2xl' ? '1.5rem'
                : size === 'xl'  ? '1.25rem'
                : size === 'lg'  ? '1.125rem'
                : size === 'md'  ? '1rem'
                :                  '0.875rem',
      }}
      className="
        inline-flex items-center justify-center gap-1.5
        px-4 py-2.5
        font-medium
        transition-all duration-200
        hover:opacity-90 hover:shadow-md
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-1
      "
    >
      {icon && <span className="flex-shrink-0 text-[1em]">{icon}</span>}
      {text && <span>{text}</span>}
    </button>
  );
};

export default Button;