import React from "react";
import "./ContactUs.css";

export default function ContactUs() {
  return (
    <section id="contact-us" className="contact-us-container">
      {/* Animated overlay */}
      <div className="overlay"></div>

      {/* Inner content container without overlay */}
      <div className="contact-us-content-wrapper">
        <div className="contact-us-content">
          <h1 className="contact-us-title">Get in Touch</h1>
          <p>Email: support@renteace.com | Call: +91 98765 43210</p>
        </div>
      </div>
    </section>
  );
}
