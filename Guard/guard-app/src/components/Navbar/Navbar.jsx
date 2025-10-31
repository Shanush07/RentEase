import { Link } from "react-router-dom";
import "./Navbar.css";

export default function GuardNavbar() {
  return (
    <nav className="guard-navbar">
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/scan-qr">Scan QR</Link>
        <Link to="/guard-check">Generate QR</Link>
        <a href="#contact">Contact Us</a>
      </div>
    </nav>
  );
}
