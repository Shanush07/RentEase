import { useState, useEffect, useRef } from "react";
import {
  FaUniversity,
  FaUtensils,
  FaBook,
  FaRunning,
  FaDoorOpen,
  FaQrcode,
} from "react-icons/fa";
import { cycleImages } from "../../../assets/assets";
import { useAuth, SignInButton } from "@clerk/clerk-react";
import { useApi } from "../../../api";
import { useStudent } from "../../../context/AuthSyncContext";
import "./BookRide.css";

export default function BookRide({ onStartRide }) {
  const [cycle, setCycle] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const popupRef = useRef(null);
  const { isSignedIn } = useAuth();
  const api = useApi();
  const { student } = useStudent();

  // ✅ Scroll popup into view
  useEffect(() => {
    if (showPopup && popupRef.current) {
      popupRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showPopup]);

  // ✅ Simulate scanning guard QR (mock simulation)
  const simulateScan = async () => {
    setIsScanning(true);
    setStatus("⏳ Generating guard QR...");

    try {
      // 🧩 Default simulation data
      const guard_id = "34f61b72-b463-4e88-abab-011ca0ecea17";
      const station_id = "82684c80-c1ac-4253-9fac-514d8049491f";

      // 🧠 This simulates backend QR generation
      const payload = { guard_id, station_id };
      const res = await api.post("/api/guard/generate-qr", payload);

      // Save QR to UI (simulated JSON)
      setQrCode(JSON.stringify(res.data, null, 2));
      setStatus("✅ Guard QR generated successfully!");
    } catch (err) {
      setStatus(err.response?.data?.message || "❌ Failed to generate guard QR");
    } finally {
      setIsScanning(false);
    }
  };

  // ✅ Book + Start Ride combined flow
// ✅ Book + Start Ride (matches backend expectations)
const handleStartRide = async () => {
  if (!cycle || !qrCode) {
    alert("Please select a cycle and scan QR before starting the ride!");
    return;
  }

  try {
    setStatus("⏳ Booking your ride...");

    const HARDCODE_GUARD = "34f61b72-b463-4e88-abab-011ca0ecea17";
    const HARDCODE_STATION = "82684c80-c1ac-4253-9fac-514d8049491f";

    let qrData = {};
    try {
      qrData = JSON.parse(qrCode);
    } catch (e) {}

    const guard_id = qrData.guard?.guard_id || HARDCODE_GUARD;
    const station_id = qrData.guard?.station_id || HARDCODE_STATION;

    if (!student?.student_id) {
      alert("Student data not loaded yet. Try reloading after login.");
      return;
    }

    // Step 1️⃣ Book ride
    const bookRes = await api.post("/api/rental/book", {
      student_id: student.student_id,
      guard_id,
      station_id,
      cycle_type: cycle,
    });

    const bookedSession = bookRes.data.session;
    if (!bookedSession?.session_id) {
      setStatus("❌ Booking failed — no session ID returned");
      return;
    }

    setStatus("✅ Ride booked! Starting now...");

    // Step 2️⃣ Start ride — backend REQUIRES guard_id
    const startRes = await api.patch("/api/rental/start", {
      session_id: bookedSession.session_id,
      guard_id,
    });

    const updatedSession =
      startRes.data.updated || startRes.data.session || bookedSession;

    setStatus(startRes.data.message || "✅ Ride started successfully!");
    onStartRide?.(updatedSession);

    // Reset UI
    setCycle("");
    setQrCode("");
  } catch (err) {
    const msg = err.response?.data?.message || "❌ Error starting ride";
    setStatus(msg);
    if (msg.toLowerCase().includes("active ride")) setShowPopup(true);
  }
};


  const locations = [
    { name: "Main Gate", icon: <FaDoorOpen /> },
    { name: "Library", icon: <FaBook /> },
    { name: "Food Court", icon: <FaUtensils /> },
    { name: "Men's Hostel", icon: <FaUniversity /> },
    { name: "Ladies' Hostel", icon: <FaUniversity /> },
    { name: "Main Ground", icon: <FaRunning /> },
  ];

  const infiniteLocations = [...locations, ...locations, ...locations];

  return (
    <div className="book-ride-container">
      <div className="book-ride-content">
        <h2 className="book-ride-title">🚴‍♂️ Book Your Ride</h2>

        {/* Step 1: Explore Locations */}
        <div className="step-section">
          <h3><span className="step-number">1</span> Explore Locations</h3>
          <div className="location-scroller">
            <div className="location-track">
              {infiniteLocations.map((loc, idx) => (
                <div key={idx} className="location-item">
                  <span className="icon">{loc.icon}</span>
                  <p>{loc.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Choose Cycle */}
        <div className="step-section">
          <h3><span className="step-number">2</span> Choose Your Cycle</h3>
          <div className="cycle-row">
            {Object.keys(cycleImages).map((type) => (
              <div
                key={type}
                className={`cycle-vertical-card ${cycle === type ? "selected" : ""}`}
                onClick={() => setCycle(type)}
              >
                <img src={cycleImages[type]} alt={type} className="cycle-vertical-img" />
                <div className="cycle-overlay">
                  <span>{type}</span>
                  {cycle === type && <div className="selected-badge">✓ Selected</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Scan Guard QR */}
        <div className="step-section">
          <h3><span className="step-number">3</span> Scan Guard QR</h3>
          <div className="qr-section">
            <div className="qr-input-group">
              <FaQrcode className="qr-icon" />
              <input
                type="text"
                placeholder="QR data will appear here..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                className="qr-input"
              />
            </div>
            <button
              className={`simulate-btn ${isScanning ? "scanning" : ""}`}
              onClick={simulateScan}
              disabled={isScanning}
            >
              {isScanning ? "⏳ Generating..." : "🔍 Simulate Guard QR"}
            </button>
          </div>
        </div>

        {/* Step 4: Start Ride */}
        <div className="start-ride-section">
          {cycle && qrCode ? (
            isSignedIn ? (
              <button className="start-ride-btn ready" onClick={handleStartRide}>
                🚴‍♂️ Start Your Adventure!
              </button>
            ) : (
              <SignInButton mode="modal" afterSignInUrl="/book" afterSignUpUrl="/book">
                <button className="start-ride-btn ready">🔒 Sign in to Start Ride</button>
              </SignInButton>
            )
          ) : (
            <button className="start-ride-btn disabled" disabled>
              ⏳ Complete All Steps
            </button>
          )}
          {status && <p className="mt-3 text-yellow-400">{status}</p>}
        </div>
      </div>

      {/* Popup for Active Ride */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box" ref={popupRef}>
            <h3>🚴 Active Ride Detected</h3>
            <p>You already have a ride in progress. Please end it before starting a new one.</p>
            <button
              onClick={() => {
                setShowPopup(false);
                setStatus("");
              }}
            >
              Okay 😊
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
