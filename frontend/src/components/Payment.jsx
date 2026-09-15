export default function Payment({ onNext, onBack }) {
  return (
    <div style={{maxWidth: "400px", margin: "50px auto", background: "#1a1a1a", padding: "20px", borderRadius: "10px"}}>
      <h2>Payment Details</h2>
      <input className="form-control" placeholder="Card Number" style={{width: "100%", padding: "10px", margin: "10px 0"}} />
      <input className="form-control" placeholder="Name" style={{width: "100%", padding: "10px", margin: "10px 0"}} />
      <div style={{display: "flex", gap: "10px"}}>
        <button onClick={onBack} style={{flex: 1, padding: "10px"}}>Back</button>
        <button onClick={onNext} style={{flex: 1, padding: "10px", background: "gold", border: "none", cursor: "pointer"}}>Pay Now</button>
      </div>
    </div>
  )
}