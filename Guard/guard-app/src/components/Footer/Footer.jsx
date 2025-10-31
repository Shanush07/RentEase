import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-glow"></div>
      <div className="footer-content">
        <h2>RentEace</h2>
        <p>Fast. Reliable. Stylish cycle rentals at your fingertips.</p>
        <p>© {new Date().getFullYear()} RentEace. All rights reserved.</p>
      </div>
    </footer>
  );
}
