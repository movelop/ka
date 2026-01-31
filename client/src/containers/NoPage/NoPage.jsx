import React from 'react'

import { Footer, HeadingSmall } from '../../components'
import './NoPage.css';
import { images } from '../../Data/dummy';

const NoPage = () => {
  return (
    <div>
      <HeadingSmall text={'PAGE NOT FOUND'} img={images.nopage} />
      <div className="nopage">
        <div className="nopageContainer">
          <h2 style={{ minHeight: "50vh" }}>
            Sorry, the page you're looking for doesn't exist
          </h2>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default NoPage