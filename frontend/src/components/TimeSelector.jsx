export default function TimeSelector({ times, time, setTime }) {
  return (
    <>
      <p className="label">اختر الوقت</p>
      <div className="times-grid">
        {times.map((t) => (
          <div key={t} onClick={() => setTime(t)} className={time === t ? "time-card selected" : "time-card"}>{t}</div>
        ))}
      </div>
    </>
  );
}
