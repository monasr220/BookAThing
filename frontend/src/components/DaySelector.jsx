export default function DaySelector({ days, day, setDay }) {
  return (
    <>
      <p className="label">اختر اليوم</p>
      <div className="days-grid">
        {days.map((d, i) => (
          <div key={i} onClick={() => setDay(d)} className={day === d ? "day-card selected" : "day-card"}>{d}</div>
        ))}
      </div>
    </>
  );
}
