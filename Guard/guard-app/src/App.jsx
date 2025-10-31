import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import GuardNavbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

// Guard Pages
import GuardLanding from "./Pages/GuardLanding/GuardLanding";
import GuardCheck from "./Pages/GuardCheck/GuardCheck";

import "./App.css";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-wrapper">
        <GuardNavbar />
        <main className="app-content">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<GuardLanding />} />

            {/* Guard Check Page */}
            <Route path="/guard-check" element={<GuardCheck />} />

            {/* Guard Dashboard (placeholder for now) */}
            <Route path="/guard-dashboard" element={<h2>Guard Dashboard</h2>} />

            {/* Catch all */}
            <Route path="*" element={<h2>404 - Page Not Found</h2>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
