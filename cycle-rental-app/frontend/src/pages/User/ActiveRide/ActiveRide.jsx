import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiDollarSign, FiPlayCircle } from "react-icons/fi";
import { useStudent } from "../../../context/AuthSyncContext"; // ✅ use context instead of localStorage
import "./ActiveRide.css";

export default function ActiveRide() {
  const navigate = useNavigate();
  const { student, loading: studentLoading } = useStudent(); // ✅ from AuthSyncContext

  const [fade, setFade] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [currentFare, setCurrentFare] = useState(0);

  // 🔹 Fetch active ride when student is available
  useEffect(() => {
    if (studentLoading) return; // wait until student data finishes loading

    if (!student || !student.student_id) {
      console.warn("⚠️ No valid student found in context");
      setLoading(false);
      return;
    }

    const studentId =
      student.student_id || student.id || student.user_id || student.userId;
    console.log("🎓 Loaded student:", student);
    console.log("🎯 Using studentId:", studentId);

    const fetchActiveRide = async () => {
      try {
        const url = `http://localhost:4000/api/rental/active/${studentId}`;
        console.log("🚀 Fetching Active Ride from:", url);

        const res = await fetch(url);
        const data = await res.json();
        console.log("📦 Active ride API response:", data);

        if (res.ok && data.ride) {
          setActiveRide(data.ride);
        } else {
          setActiveRide(null);
        }
      } catch (err) {
        console.error("❌ Error fetching active ride:", err);
        setActiveRide(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRide();
  }, [student, studentLoading]);

  // 🔹 Timer + Fare updater
  useEffect(() => {
    if (!activeRide?.start_time) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(activeRide.start_time);
      const diffMs = now - start;

      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);

      setElapsedTime(
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );

      // 💰 Dynamic fare update
      const ratePerMin = 2; // should match backend
      const fare = ratePerMin * Math.max(1, mins);
      setCurrentFare(fare);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [activeRide?.start_time]);

  // 🔹 End ride handler
  const handleEndRide = () => {
    if (!activeRide) return;
    setFade(true);
    setTimeout(() => {
      navigate(`/end-ride/${activeRide.session_id}`, {
        state: { ride: activeRide, currentFare },
      });
    }, 400);
  };

  // 🔹 Loading view
  if (loading || studentLoading) {
    return (
      <div className="page-wrapper">
        <div className="active-ride-container">
          <p>Loading your active ride...</p>
        </div>
      </div>
    );
  }

  // 🔹 No active ride view
  if (!activeRide) {
    return (
      <div className="page-wrapper no-ride-page">
        <div className="no-ride-card">
          <div className="cycle-hologram"></div>
          <h2 className="no-ride-title">No Active Ride Found</h2>
          <p className="no-ride-subtitle">
            Looks like you haven’t started a ride yet. 🚴‍♂️
          </p>
          <button className="book-ride-btn" onClick={() => navigate("/book")}>
            Start a New Ride
          </button>
        </div>
      </div>
    );
  }

  // 🔹 Active ride card
  return (
    <div className={`page-wrapper ${fade ? "fade-out" : ""}`}>
      <div className="active-ride-container">
        <div className="ride-card futuristic-card">
          <h1 className="cycle-type">
            🚲 Ride from {activeRide.startStation?.name || "Unknown Station"}
          </h1>

          <div className="ride-info-grid">
            <div className="ride-section started">
              <FiClock className="icon" />
              <h4>Started</h4>
              <p>
                {activeRide.start_time
                  ? new Date(activeRide.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </p>
            </div>

            <div className="ride-section elapsed">
              <FiPlayCircle className="icon" />
              <h4>Elapsed</h4>
              <p className="timer">{elapsedTime}</p>
            </div>

            <div className="ride-section fare">
              <FiDollarSign className="icon" />
              <h4>Fare</h4>
              <p className="timer">₹{currentFare}</p>
            </div>

            <div className="ride-section status">
              <h4>Status</h4>
              <p
                className={
                  activeRide.status === "ONGOING"
                    ? "status-active"
                    : "status-pending"
                }
              >
                {activeRide.status}
              </p>
            </div>
          </div>

          <button className="end-ride-btn" onClick={handleEndRide}>
            End Ride ⏹️
          </button>

          <div className="spark-overlay"></div>
        </div>
      </div>
    </div>
  );
}
