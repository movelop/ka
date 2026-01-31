import React, { useState } from 'react';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { testimonials } from '../../Data/dummy';
import './Testimonials.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(
      currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(
      currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <div className="testimonials">
      <div className="testimonialsContainer">
        <h1>Testimonials</h1>
        <div className="testimonialsText">
          <h5>{`"${testimonials[currentIndex].testimony}"`}</h5>
          <p>{testimonials[currentIndex].name}</p>
        </div>
        <div className="testimonialsButtons">
          <button onClick={handlePrev}>
            <IoIosArrowBack />
          </button>
          <button onClick={handleNext}>
            <IoIosArrowForward />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
