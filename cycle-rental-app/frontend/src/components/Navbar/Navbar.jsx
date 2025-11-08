import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const onDashboard = location.pathname === "/";

  const handleLinkClick = () => setMenuOpen(false);

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* ========== When user is signed OUT ========== */}
      <SignedOut>
        <ul className="nav-items signedout">
          <li>
            <Link to="/" onClick={handleLinkClick}>Home</Link>
          </li>

          {/* ✅ Book Ride is open to everyone now */}
          <li>
            <Link to="/book" onClick={handleLinkClick}>Book a Ride</Link>
          </li>

          {onDashboard && (
            <li>
              <a href="#contact" onClick={scrollToSection("contact")}>
                Contact Us
              </a>
            </li>
          )}

          {/* Login Button opens Clerk modal */}
          <li>
            <SignInButton mode="modal">
              <button className="auth-btn">Login / Sign Up</button>
            </SignInButton>
          </li>
        </ul>
      </SignedOut>

      {/* ========== When user is signed IN ========== */}
      <SignedIn>
        <ul className="nav-items signedin desktop-only">
          <li>
            <Link to="/" onClick={handleLinkClick}>Home</Link>
          </li>
          <li>
            <Link to="/book" onClick={handleLinkClick}>Book a Ride</Link>
          </li>
          <li>
            <Link to="/active" onClick={handleLinkClick}>Active Rides</Link>
          </li>
          <li>
            <Link to="/summary" onClick={handleLinkClick}>Previous Rides</Link>
          </li>
          <li>
            <Link to="/payment" onClick={handleLinkClick}>Payment</Link>
          </li>
          {onDashboard && (
            <li>
              <a href="#contact" onClick={scrollToSection("contact")}>
                Contact Us
              </a>
            </li>
          )}
        </ul>

        <div className="profile-desktop desktop-only">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "user-avatar",
                userButtonBox: "cl-userButton-root",
              },
            }}
          />
        </div>

        {/* Mobile Hamburger */}
        <div
          className={`hamburger mobile-only ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <div className="profile-section">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "user-avatar",
                  userButtonBox: "cl-userButton-root",
                },
              }}
            />
            <span className="profile-text">Profile</span>
          </div>

          <Link to="/" onClick={handleLinkClick}>Home</Link>
          <Link to="/book" onClick={handleLinkClick}>Book a Ride</Link>
          <Link to="/active" onClick={handleLinkClick}>Active Rides</Link>
          <Link to="/summary" onClick={handleLinkClick}>Previous Rides</Link>
          <Link to="/payment" onClick={handleLinkClick}>Payment</Link>
          {onDashboard && (
            <a href="#contact" onClick={scrollToSection("contact")}>
              Contact Us
            </a>
          )}
        </div>
      </SignedIn>

      {menuOpen && <div className="mobile-backdrop" onClick={() => setMenuOpen(false)}></div>}
    </nav>
  );
}
