import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import "./GuardCheck.css";

export default function GuardCheck() {
  const navigate = useNavigate();

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setFade(true); // fade in on mount
  }, []);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setConfirmed(true);
      setLoading(false);
    }, 1200);
  };

  const handleBack = () => {
    setFade(false);
    setTimeout(() => navigate("/"), 400);
  };

  return (
    <div className={`page-wrapper ${fade ? "fade-in" : "fade-out"}`}>
      <div className="guard-check-container">
        <div className={`guard-card ${confirmed ? "verified" : ""}`}>
          <h1 className="guard-title">Borrow Cycle</h1>

          {!confirmed ? (
            <>
              <div className="qr-section">
                <div className="qr-placeholder">QR CODE</div>
                <p className="instruction">
                  Show this QR to the user to scan and borrow a cycle
                </p>
              </div>

              <button
                className="verify-btn"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Confirming..." : "Confirm Borrow"}
              </button>
            </>
          ) : (
            <div className="confirmation-section">
              <FiCheckCircle className="icon-success" />
              <h2>Cycle Borrow Confirmed!</h2>
              <p className="instruction">The user can now use the cycle</p>
              <button className="back-btn" onClick={handleBack}>
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
