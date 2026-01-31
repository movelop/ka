import React from 'react';

const Button = ({  icon, bgColor, color, bgHoverColor, size, text, borderRadius, width, handleClick }) => {
  return (
    <button
      type="button"
      onClick={handleClick}
      style={{ backgroundColor: bgColor, color, borderRadius }}
      className= {`text-${size} p-3 w-${width} hover:drop-shadow-xl hover:bg-${bgHoverColor} flex items-center justify-center gap-1`}
    >
      {icon} {text}
    </button>
  )
}

export default Button;