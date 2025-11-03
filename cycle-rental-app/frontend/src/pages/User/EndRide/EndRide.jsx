import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import "./EndRide.css";

export default function EndRide() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // ride data passed from ActiveRide page or URL param
  const ride = location.state?.ride || { session_id: id || "unknown" };
  const fare = location.state?.currentFare || 0;

  const [rideEnded, setRideEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFade(true);
  }, []);

  const handleEndRide = async () => {
    setLoading(true);
    setMessage("");

    try {
      // 🧩 Simulation constants (same as backend)
      const HARDCODE_GUARD = "34f61b72-b463-4e88-abab-011ca0ecea17";
      const HARDCODE_STATION = "82684c80-c1ac-4253-9fac-514d8049491f";
      const BASE_URL = import.meta.env.VITE_API_URL;

      // ✅ Step 1: Generate new QR for end guard/station
      const qrRes = await fetch(`${BASE_URL}/api/guard/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guard_id: HARDCODE_GUARD,
          station_id: HARDCODE_STATION,
        }),
      });

      const qrData = await qrRes.json();
      if (!qrRes.ok || !qrData.qr?.qr_id) {
        throw new Error(qrData.message || "Failed to generate end QR");
      }

      // ✅ Step 2: End the ride
      const endRes = await fetch(`${BASE_URL}/api/rental/end`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: ride.session_id,
          end_guard_id: HARDCODE_GUARD,
          end_station_id: HARDCODE_STATION,
          end_qr_id: qrData.qr.qr_id,
        }),
      });

      const endData = await endRes.json();

      if (!endRes.ok) {
        throw new Error(endData.message || "Failed to end ride");
      }

      console.log("✅ Ride ended successfully:", endData);
      setRideEnded(true);
      setMessage("Ride Ended Successfully!");
    } catch (err) {
      console.error("❌ End Ride Error:", err);
      setMessage(err.message || "Error ending ride");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setFade(false);
    setTimeout(() => navigate("/"), 400);
  };

  return (
    <div className={`page-wrapper ${fade ? "fade-in" : "fade-out"}`}>
      <div className="end-ride-container">
        <div className={`end-ride-card ${rideEnded ? "ended" : ""}`}>
          <h1 className="cycle-type">
            Ending Ride: {ride.startStation?.name || "Unknown Station"}
          </h1>

          {!rideEnded ? (
            <>
              <div className="qr-section">
                <p className="instruction">
                  Press below to end your ride and calculate fare
                </p>
              </div>

              <button
                className="end-btn"
                onClick={handleEndRide}
                disabled={loading}
              >
                {loading ? "Processing..." : "End Ride ⏹️"}
              </button>

              {message && <p className="message">{message}</p>}
            </>
          ) : (
            <div className="confirmation-section">
              <FiCheckCircle className="icon-success" />
              <h2>{message}</h2>
              <p>Total Fare: ₹{fare}</p>
              <button className="back-btn" onClick={handleBackToDashboard}>
                Back to Dashboard
              </button>
            </div>
          )}

          <div className="spark-overlay"></div>
        </div>
      </div>
    </div>
  );
}
