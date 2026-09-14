import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPaymentByBooking, getErrorMessage } from "./bookingApi";

// GET /payments/booking/:bookingId بيطلب تسجيل دخول (authenticateJWT) - نفس
// العميل اللي عمل الحجز والدفع، فمفيش مشكلة إنه يكون لسه login وهو بيشوف
// الإيصال ده بعد الدفع مباشرة أو من لينك محفوظ عنده.
export default function Receipt() {
  const { bookingId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getPaymentByBooking(bookingId)
      .then((data) => {
        if (!cancelled) setPayment(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not find a receipt for this booking"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {loading && <p style={styles.status}>جاري تحميل الإيصال...</p>}
        {!loading && error && <p style={{ ...styles.status, color: "#ff6b6b" }}>{error}</p>}

        {!loading && !error && payment && (
          <>
            <i className="fa-solid fa-circle-check" style={styles.icon}></i>
            <h4 style={styles.title}>Payment {payment.status}</h4>

            <div style={styles.row}>
              <span>Transaction ref</span>
              <span>{payment.transactionRef}</span>
            </div>
            <div style={styles.row}>
              <span>Amount</span>
              <span>
                {payment.amount} {payment.currency}
              </span>
            </div>
            <div style={styles.row}>
              <span>Payment method</span>
              <span>{payment.paymentMethod}</span>
            </div>
            <div style={styles.row}>
              <span>Date</span>
              <span>{payment.createdAt ? new Date(payment.createdAt).toLocaleString() : "—"}</span>
            </div>

            <Link to="/" className="btn btn-outline-warning w-100 mt-4">
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d0d12",
    padding: "20px",
  },
  card: {
    backgroundColor: "#1e1e2f",
    borderRadius: "16px",
    padding: "40px 30px",
    maxWidth: "420px",
    width: "100%",
    color: "#fff",
    textAlign: "center",
    border: "1px solid #333",
  },
  icon: {
    fontSize: "48px",
    color: "#3cba92",
    marginBottom: "12px",
  },
  title: {
    marginBottom: "24px",
    textTransform: "capitalize",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #333",
    fontSize: "0.95rem",
  },
  status: {
    color: "#bbb",
    fontSize: "1.05rem",
  },
};
