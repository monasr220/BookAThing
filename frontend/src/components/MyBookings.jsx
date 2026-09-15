import { useEffect, useState } from "react";
import "./MyBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/bookings/my", {
      headers: { Authorization: Bearer  }
    })
    .then(res => res.json())
    .then(data => { setBookings(data); setLoading(false); })
    .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="my-bookings">
      <h2>حجوزاتي</h2>
      {bookings.length === 0 ? <p>لا يوجد حجوزات</p> : 
        bookings.map(b => (
          <div key={b._id} className="booking-card">
            <h4>{b.movie?.title}</h4>
            <p>{b.day} - {b.time}</p>
            <p>كراسي: {b.seats?.join(", ")}</p>
          </div>
        ))
      }
    </div>
  );
}
