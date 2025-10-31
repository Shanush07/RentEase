import { Link } from "react-router-dom";
import { FaQrcode, FaPlusSquare } from "react-icons/fa";
import ContactUs from "../../components/ContactUs/ContactUs";
import "./GuardLanding.css";

export default function GuardLanding() {
  return (
    <div className="landing-container">
      {/* Animated overlay */}
      <div className="landing-overlay"></div>

      {/* Inner content */}
      <div className="landing-content-wrapper">
        <h1 className="landing-title">Cycle Rental Guard</h1>

        <div className="action-buttons">
          <Link to="/scan-qr" className="action-card">
            <FaQrcode size={50} />
            <span>Scan QR</span>
          </Link>

          <Link to="/guard-check" className="action-card">
            <FaPlusSquare size={50} />
            <span>Generate QR</span>
          </Link>
        </div>
      </div>

      {/* Contact Us */}
      <section id="contact">
        <ContactUs />
      </section>
    </div>
  );
}
