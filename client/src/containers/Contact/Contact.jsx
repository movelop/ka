import React, { useEffect } from 'react';
import { IoIosArrowForward } from 'react-icons/io';

import { Footer, HeadingSmall } from '../../components';
import { images } from '../../Data/dummy';
import './Contact.css';

const Contact = () => {
  useEffect(() => {
    document.title = "K.A Hotel & Suites — Contact Us";
  }, []);

  return (
    <div>
      <HeadingSmall text="Contact Us" img={images.queen} />

      <div className="contact">
        <div className="contactContainer">

          {/* ── Intro ── */}
          <div className="contactTop">
            <span className="contactTop__eyebrow">Get in Touch</span>
            <h3>We Are Here For You</h3>
            <p>
              At K.A. Hotel &amp; Suites, our guests are our top priority. Should
              you have any enquiries, complaints, or special requests, please
              contact our support desk and our team will attend to you promptly
              to ensure a pleasant and seamless experience.
            </p>
          </div>

          {/* ── Bottom Grid ── */}
          <div className="contactBottom">

            {/* Address Column */}
            <div className="contactAddress">
              <div>
                <span className="contactAddress__label">Our Location</span>
                <h2>50, Ige Daramola Street, Iyana Iyesi, Ota, Ogun State.</h2>
              </div>

              <div className="contactInfo">
                <p>Phone: 08057891111, 08039886484, 08167495769, 08140266486</p>
                <p>Email: info@kuregbeanimashaun.com</p>
              </div>

              <a
                className="viewMap"
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
              >
                <span className="text">View on Map</span>
                <IoIosArrowForward className="arrow" />
              </a>
            </div>

            {/* Form Column */}
            <div className="contactSub">
              <div>
                <span className="contactSub__label">Message Us</span>
                <h2>Send us a message</h2>
              </div>

              <form className="form">
                <div className="formInput">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your full name"
                  />
                </div>
                <div className="formInput">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="formInput">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    placeholder="How can we help you?"
                  />
                </div>
                <div className="contactButton">
                  <button type="submit">
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;