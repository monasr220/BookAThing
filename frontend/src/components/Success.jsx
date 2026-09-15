export default function Success({ onReset }) {
  return (
    <div style={{textAlign: "center", marginTop: "100px"}}>
      <h1 style={{fontSize: "60px"}}>✓</h1>
      <h2>تم الحجز بنجاح!</h2>
      <p>Booking ID: #BKG-{Math.floor(Math.random()*10000)}</p>
      <button onClick={onReset} style={{marginTop: "20px", padding: "10px 20px", background: "white", color: "black", border: "none", cursor: "pointer"}}>حجز جديد</button>
    </div>
  )
}