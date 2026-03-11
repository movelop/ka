import React, { useState } from 'react';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { testimonials } from '../../Data/dummy';
import './Testimonials.css';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="testimonials">
      <div className="testimonialsContainer">

        {/* Label */}
        <span className="testimonials__label">What our guests say</span>

        {/* Heading */}
        <h1>Testimonials</h1>
        <div className="testimonials__rule" />

        {/* Quote */}
        <div className="testimonialsText">
          <div className="testimonials__quote">"</div>
          <h5>{testimonials[currentIndex].testimony}</h5>
          <p>{testimonials[currentIndex].name}</p>
        </div>

        {/* Dot indicators */}
        <div className="testimonials__dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`testimonials__dot${index === currentIndex ? ' active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="testimonialsButtons">
          <button onClick={handlePrev} aria-label="Previous testimonial">
            <IoIosArrowBack />
          </button>
          <button onClick={handleNext} aria-label="Next testimonial">
            <IoIosArrowForward />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Testimonials;