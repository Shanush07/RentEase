import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";

import AppNavbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import UserDashboard from "./pages/User/UserDashboard/UserDashboard";
import ActiveRidesPage from "./pages/User/ActiveRide/ActiveRide";
import PreviousRidesPage from "./pages/User/RideSummary/RideSummary";
import EndRide from "./pages/User/EndRide/EndRide";
import BookRide from "./pages/User/BookRide/BookRide";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function BookRideWrapper({ onStartRide }) {
  const navigate = useNavigate();
  return (
    <BookRide
      onStartRide={(rideData) => {
        onStartRide(rideData);
        navigate("/active");
      }}
    />
  );
}

export default function App() {
  const [activeRide, setActiveRide] = useState(null);

  const handleStartRide = (rideData) => {
    setActiveRide(rideData);
  };

  return (
    <Router>
      <ScrollToTop />
      <AppNavbar />

      <Routes>
        {/* ✅ Accessible to everyone */}
        <Route path="/" element={<UserDashboard />} />
        <Route
          path="/book"
          element={<BookRideWrapper onStartRide={handleStartRide} />}
        />

        {/* 🧍 Protected routes (only for signed-in users) */}
        <Route
          path="/active"
          element={
            <SignedIn>
              <ActiveRidesPage ride={activeRide} />
            </SignedIn>
          }
        />
        <Route
          path="/end-ride/:id"
          element={
            <SignedIn>
              <EndRide />
            </SignedIn>
          }
        />
        <Route
          path="/summary"
          element={
            <SignedIn>
              <PreviousRidesPage />
            </SignedIn>
          }
        />

        {/* 🔐 Auth pages */}
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

        {/* 404 */}
        <Route path="*" element={<h2>404 Page Not Found</h2>} />
      </Routes>

      <Footer />
    </Router>
  );
}
