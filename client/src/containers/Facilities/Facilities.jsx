import React, { useEffect } from 'react';

import { Heading, Testimonials, Footer, Header, Loading } from '../../components';
import { images } from '../../Data/dummy';
import useFetch from '../../hooks/useFetch';
import './Facilities.css';

const desc = "At K.A. Hotel & Suites, we strive to make your stay truly unforgettable. Every detail is designed with your comfort in mind, ensuring a uniquely personalized experience. Our hotel offers a serene setting with stunning views, ideal for relaxation and leisure, while our modern luxury facilities provide everything you need to enjoy the very best of hospitality.";

const Facility = ({ item }) => (
  <div className="facility"
    style={{
      background: ` no-repeat center/cover url(${item.image}) `,
    }}
  >
    <div className='overlay'/>
    <div className="facilityName">
      <h4>{item.title}</h4>
    </div>
  </div>
)
const Facilities = () => {
  const { data, loading } = useFetch('/facilities');
  
    useEffect(() => {
    document.title = "K.A HOTEL AND SUITES||FACILITIES";
  }, []);
  return (
    <div>
        <Heading img = {images.facilitiesImg}  />
        <Header name= 'FACILITIES' desc={ desc } />
        <div className="facilities">
            <div className="facilitiesContainer">
                {loading ? (<Loading text={'Loading ...'} />) : (
              <>
                {data?.facilities?.map((item) => (
                  <Facility key={item._id} item={item} />
                ))}
              </>
            )}
            </div>
        </div>
        <Testimonials />
        <Footer />
    </div>
  )
}

export default Facilities;