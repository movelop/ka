import React, { useEffect } from 'react';

import { Footer, HeadingSmall } from '../../components';
import { images } from '../../Data/dummy';
import './Contact.css';

const Contact = () => {
  useEffect(() => {
    document.title = "K.A HOTEL AND SUITES||CONTACT-US";
  }, []);
  return (
    <div>
        <HeadingSmall text={'CONTACT-US'} img={images.queen}/>
        <div className="contact">
          <div className="contactContainer">
            <div className="contactTop">
              <h3>WE ARE HERE FOR YOU</h3>
              <p>At K.A. Hotel & Suites, our guests are our top priority. Should you have any enquiries, complaints, or special requests, please 
                contact our support desk, and our team will attend to you promptly to ensure a pleasant and seamless experience.
              </p>
            </div>
            <div className="contactBottom">
              <div className="contactAddress">
                <h2>50, Ige Daramola Street, Iyana Iyesi, Ota, Ogun State.</h2>
                <div className="contactInfo">
                  <p>Phone: 08057891111, 08039886484, 08167495769, 08140266486</p>
                  <p>Email: info@kuregbeanimashaun.com</p>
                </div>
              </div>
              <div className="contactSub">
                <h2>Send us a message</h2>
                <form className="form">
                  <div className="formInput">
                    <label >Name</label>
                    <input type="text" />
                  </div>
                  <div className="formInput">
                    <label >Email Address</label>
                    <input type="email" />
                  </div>
                  <div className="formInput">
                    <label >Message</label>
                    <textarea />
                  </div>
                  <div className="contactButton">
                    <button type="submit">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <Footer />
    </div>
  )
}

export default Contact;