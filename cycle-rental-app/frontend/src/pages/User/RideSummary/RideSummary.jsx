import React, { useState } from "react";
import {
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiCheckCircle,
  FiHash,
} from "react-icons/fi";
import "./RideSummary.css";

export default function RideSummary() {
  const [rides] = useState([
    {
      id: "RID001",
      cycleType: "Standard 🚵‍♂️",
      startTime: "2025-09-08T10:30:00",
      duration: 25,
      fare: 50,
      status: "Completed",
    },
    {
      id: "RID002",
      cycleType: "Gear 🚴",
      startTime: "2025-09-10T16:00:00",
      duration: 40,
      fare: 80,
      status: "Completed",
    },
    {
      id: "RID003",
      cycleType: "ECycle 🚲",
      startTime: "2025-09-10T09:15:00",
      duration: 15,
      fare: 30,
      status: "Completed",
    },
  ]);

  // Group rides by date
  const groupedRides = rides.reduce((acc, ride) => {
    const date = new Date(ride.startTime).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(ride);
    return acc;
  }, {});

  return (
    <div className="summary-container">
      <div className="dots-overlay"></div>
      <div className="summary-overlay"></div>

      <div className="summary-inner">
        <h1 className="page-title">Previous Rides</h1>
        {Object.keys(groupedRides).map((date) => (
          <div key={date} className="ride-day-section">
            <h2 className="day-title">{date}</h2>
            <div className="rides-grid">
              {groupedRides[date].map((ride) => (
                <div key={ride.id} className="ride-summary-card">
                  <div className="spark-overlay"></div>
                  <div className="card-overlay"></div>

                  <h3 className="cycle-type">{ride.cycleType}</h3>

                  <div className="summary-info">
                    <div className="summary-item">
                      <FiHash className="icon" />
                      <p>ID: {ride.id}</p>
                    </div>
                    <div className="summary-item">
                      <FiClock className="icon" />
                      <p>
                        Start:{" "}
                        {new Date(ride.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="summary-item">
                      <FiClock className="icon" />
                      <p>
                        End:{" "}
                        {new Date(
                          new Date(ride.startTime).getTime() +
                            ride.duration * 60000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="summary-item">
                      <FiDollarSign className="icon" />
                      <p>₹{ride.fare}</p>
                    </div>
                    <div className="summary-item status">
                      <FiCheckCircle className="icon success" />
                      <p>{ride.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
