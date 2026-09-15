export default function Confirmation({ movie, day, time, selectedSeats, name }) {
  const bookingId = "BKG-" + Math.floor(Math.random()*100000);
  
  return (
    <div className="success-wrapper" style={{textAlign: "center", maxWidth: "400px", margin: "0 auto"}}>
      <div className="success-icon" style={{fontSize: "60px", color: "gold"}}>✓</div>
      <h2 className="success-title">تم الحجز بنجاح</h2>
      <p>شكرا {name} - تم تأكيد حجزك</p>
      
      <div className="ticket-card" style={{background: "#1a1a1a", padding: "20px", borderRadius: "12px", marginTop: "20px", textAlign: "right"}}>
        <p className="ticket-movie" style={{fontWeight: "bold", fontSize: "18px", textAlign: "center"}}>{movie.title}</p>
        <div className="divider" style={{borderTop: "1px dashed #555", margin: "15px 0"}}></div>
        <div className="ticket-row" style={{display: "flex", justifyContent: "space-between", margin: "8px 0"}}><span>رقم الحجز:</span><span>{bookingId}</span></div>
        <div className="ticket-row" style={{display: "flex", justifyContent: "space-between", margin: "8px 0"}}><span>اليوم:</span><span>{day}</span></div>
        <div className="ticket-row" style={{display: "flex", justifyContent: "space-between", margin: "8px 0"}}><span>الوقت:</span><span>{time}</span></div>
        <div className="ticket-row" style={{display: "flex", justifyContent: "space-between", margin: "8px 0"}}><span>الكراسي:</span><span>{selectedSeats.join(", ")}</span></div>
      </div>

      <button 
        onClick={() => window.location.reload()} 
        style={{marginTop: "25px", padding: "12px", width: "100%", background: "gold", color: "black", border: "none", cursor: "pointer", borderRadius: "8px", fontWeight: "bold", fontSize: "16px"}}
      >
        حجز جديد
      </button>
      
      <p style={{marginTop: "15px", fontSize: "12px", color: "#888"}}>خد سكرين شوت للتذكرة</p>
    </div>
  );
}