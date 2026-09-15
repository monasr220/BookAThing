import { useState } from "react";
import "./BookingFlow.css";
import ProgressBar from "./ProgressBar";
import DaySelector from "./DaySelector";
import TimeSelector from "./TimeSelector";
import SeatSelector from "./SeatSelector";
import CustomerInfo from "./CustomerInfo";
import Confirmation from "./Confirmation";

export default function BookingFlow({ movie }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [payMethod, setPayMethod] = useState("fawry");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("7:00 PM");
  const fawryCode = "88" + Math.floor(Math.random()*10000000);
  const days = [0,1,2].map(i => { const d = new Date(); d.setDate(new Date().getDate()+i); return d.toLocaleDateString("ar-EG", {weekday: "short", day: "numeric", month: "short"}); });
  const times = ["12:00 PM", "3:00 PM", "7:00 PM", "10:00 PM"];
  const rows = ["A","B","C","D","E","F"];
  const cols = [1,2,3,4,5,6,7,8];
  const bookedSeats = ["A1","A2","B5","C3","F8"];
  const toggleSeat = (s) => {
    if (bookedSeats.includes(s)) return;
    if (selectedSeats.includes(s)) setSelectedSeats(selectedSeats.filter(x=>x!==s));
    else if (selectedSeats.length < 6) setSelectedSeats([...selectedSeats, s]);
  };
  const total = selectedSeats.length * (movie?.price || 120);
  const canContinue = name.trim() !== "" && phone.length === 11 && selectedSeats.length > 0 && day !== "";
  return (
    <div className="booking-container">
      <ProgressBar step={step} />
      {step === 1 && <>
        <h3 className="movie-title">{movie.title}</h3>
        <DaySelector days={days} day={day} setDay={setDay} />
        <TimeSelector times={times} time={time} setTime={setTime} />
        <SeatSelector rows={rows} cols={cols} bookedSeats={bookedSeats} selectedSeats={selectedSeats} toggleSeat={toggleSeat} />
        <CustomerInfo name={name} setName={setName} phone={phone} setPhone={setPhone} />
        <button disabled={!canContinue} onClick={() => setStep(2)} className="btn-primary">متابعة - {total} جنيه</button>
      </>}
      {step === 2 && <>
        <h3>طريقة الدفع</h3>
        <div className="pay-grid">
          <div onClick={() => setPayMethod("fawry")} className={payMethod === "fawry" ? "pay-card selected" : "pay-card"}>فوري</div>
          <div onClick={() => setPayMethod("visa")} className={payMethod === "visa" ? "pay-card selected" : "pay-card"}>فيزا</div>
          <div onClick={() => setPayMethod("wallet")} className={payMethod === "wallet" ? "pay-card selected" : "pay-card"}>محفظة</div>
        </div>
        {payMethod === "fawry" && <div className="box-dashed">كود فوري: {fawryCode}</div>}
        <div className="summary-box">{day} - {time} - {selectedSeats.join(", ")} - {total} جنيه</div>
        <div className="actions">
          <button onClick={() => setStep(1)} className="btn-secondary">رجوع</button>
          <button onClick={() => setStep(3)} className="btn-primary flex2">تأكيد الدفع</button>
        </div>
      </>}
      {step === 3 && <Confirmation movie={movie} day={day} time={time} selectedSeats={selectedSeats} name={name} phone={phone} payMethod={payMethod} />}
    </div>
  );
}
