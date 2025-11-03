import "./UserDashboard.css";
import BookRide from "../BookRide/BookRide";
import { sliderImages } from "../../../assets/assets";
import { useState, useEffect } from "react";
import ContactUs from "../../../components/ContactUs/ContactUs";
import { useUser, useAuth } from "@clerk/clerk-react"; // ✅ Added useAuth

export default function UserDashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [studentData, setStudentData] = useState(null);
  const { user } = useUser();
  const { getToken } = useAuth(); // ✅ Clerk auth hook
  const BASE_URL = import.meta.env.VITE_API_URL;

  // 🔁 Carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 📡 Fetch student info from backend
  useEffect(() => {
    const fetchStudent = async () => {
      if (!user) return;

      try {
        // ✅ Get Clerk JWT token for authentication
        const token = await getToken({ template: "default" });

        const res = await fetch(`${BASE_URL}/api/students/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch student data");
        const data = await res.json();
        setStudentData(data);
      } catch (err) {
        console.error("❌ Error fetching student:", err);
      }
    };

    fetchStudent();
  }, [user, getToken]);

  return (
    <div className="user-dashboard">
      {/* 🏞️ Landing Carousel Section */}
      <section id="landing" className="landing-section">
        <div className="spark-overlay"></div>

        {[...Array(12)].map((_, idx) => (
          <div
            key={idx}
            className="particle"
            style={{ animationDelay: `${idx * 0.4}s` }}
          ></div>
        ))}

        <div
          className="carousel-container"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {sliderImages.map((img, index) => (
            <div className="carousel-slide" key={index}>
              <img src={img} alt={`slide-${index}`} />
            </div>
          ))}
        </div>

        <div className="gradient-sweep"></div>

        <div className="text-overlay">
          <h1 className="fade-in">RentEace</h1>

          {studentData ? (
            <>
              <p className="fade-in delay-1">
                Welcome, <strong>{studentData.name}</strong> 👋
              </p>
              <p className="fade-in delay-2">
                Current dues: ₹{studentData.dues ?? 0}
              </p>
            </>
          ) : (
            <p className="fade-in delay-1">Fetching your account details...</p>
          )}

          <p className="tagline fade-in delay-2">
            Effortless cycle rentals designed for speed, comfort, and reliability.
          </p>
          <p className="tagline fade-in delay-3">Simple • Fast • Reliable</p>

          <button
            className="scroll-button fade-in delay-4"
            onClick={() =>
              document.getElementById("book").scrollIntoView({ behavior: "smooth" })
            }
          >
            Book a Ride
          </button>
        </div>

        <div className="carousel-dots">
          {sliderImages.map((_, index) => (
            <div
              key={index}
              className={`carousel-dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </section>

      {/* 🚲 Book Ride Section */}
      <section id="book">
        <BookRide />
      </section>

      {/* 📞 Contact Section */}
      <section id="contact">
        <ContactUs />
      </section>
    </div>
  );
}
