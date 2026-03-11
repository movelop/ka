import React from 'react';
import { Link } from 'react-router-dom';

import { Footer, HeadingSmall } from '../../components';
import { images } from '../../Data/dummy';
import './NoPage.css';

const NoPage = () => {
  return (
    <div>
      <HeadingSmall text="Page Not Found" img={images.nopage} />

      <div className="nopage">
        <div className="nopageContainer">

          {/* Faded 404 number */}
          <div className="nopage__code">404</div>

          {/* Gold rule */}
          <div className="nopage__rule" />

          {/* Heading */}
          <h2>Sorry, this page doesn't exist</h2>

          {/* Subtext */}
          <p>
            The page you're looking for may have been moved, renamed, or is
            temporarily unavailable. Let us take you back home.
          </p>

          {/* Back to home */}
          <Link to="/" className="nopage__back">
            <span>← Back to Home</span>
          </Link>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NoPage;