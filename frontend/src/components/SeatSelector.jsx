export default function SeatSelector({ rows, cols, bookedSeats, selectedSeats, toggleSeat }) {
  return (
    <div className="seats-wrapper">
      {rows.map((row) => (
        <div key={row} className="seat-row">
          <b className="row-label">{row}</b>
          {cols.map((col) => {
            const id = row + col;
            const isSelected = selectedSeats.includes(id);
            const isBooked = bookedSeats.includes(id);
            let cls = "seat";
            if (isSelected) cls = "seat selected";
            if (isBooked) cls = "seat booked";
            return <div key={id} onClick={() => toggleSeat(id)} className={cls}>{isBooked ? "X" : col}</div>;
          })}
        </div>
      ))}
    </div>
  );
}
