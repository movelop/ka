import React from 'react';
import './Loading.css';

const Loading = ({ text = 'Loading' }) => {
  return (
    <div className="loader">
      <div className="ldsRoller">
        <div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div>
      </div>
      <span className="loader__text">{text}</span>
    </div>
  );
};

export default Loading;