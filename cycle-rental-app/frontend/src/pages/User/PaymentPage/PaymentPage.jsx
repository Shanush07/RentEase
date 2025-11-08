import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState("");

  // ✅ Fetch unpaid payments for the current student
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-checkout-session`,
          { student_id: paymentInfo.student_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );


        const student = res.data;
        const unpaid = student.rentalSessions?.filter(
          (r) => !r.payment || r.payment.status === "PENDING"
        );

        const totalAmount = unpaid.reduce(
          (sum, r) => sum + Number(r.payment?.amount || 0),
          0
        );

        setPaymentInfo({
          student_id: student.student_id,
          unpaidCount: unpaid.length,
          totalAmount,
        });
      } catch (err) {
        console.error("❌ Error fetching payment info:", err);
        setError("Failed to fetch payment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [getToken]);

  // ✅ Handle “Proceed to Pay”
  const handlePay = async () => {
    try {
      if (!paymentInfo?.student_id) return;
      const token = await getToken();

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-checkout-session`,
        { student_id: paymentInfo.student_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe Checkout
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      setError("Unable to initiate payment. Please try again later.");
    }
  };

  // ✅ UI Rendering
  if (loading) return <div className="payment-page"><p>Loading payment details...</p></div>;
  if (error) return <div className="payment-page"><p className="error">{error}</p></div>;

  return (
    <div className="payment-page">
      <div className="spark-overlay"></div>
      <div className="gradient-sweep"></div>

      <div className="payment-card fade-in">
        <h1 className="fade-in delay-1">Complete Your Payment</h1>
        {paymentInfo?.unpaidCount > 0 ? (
          <>
            <p className="fade-in delay-2">
              You have <strong>{paymentInfo.unpaidCount}</strong> unpaid ride(s).
            </p>

            <div className="payment-summary fade-in delay-3">
              <div className="summary-row">
                <span>Unpaid Rides</span>
                <span>{paymentInfo.unpaidCount}</span>
              </div>
              <div className="summary-row">
                <span>Amount</span>
                <span>₹{paymentInfo.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{paymentInfo.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button className="pay-button fade-in delay-3" onClick={handlePay}>
              Proceed to Pay
            </button>
          </>
        ) : (
          <p className="fade-in delay-2">🎉 No pending payments! All rides are paid.</p>
        )}
      </div>

      {[...Array(15)].map((_, i) => (
        <div key={i} className="particle" style={{ "--random": Math.random() }}></div>
      ))}
    </div>
  );
};

export default PaymentPage;
