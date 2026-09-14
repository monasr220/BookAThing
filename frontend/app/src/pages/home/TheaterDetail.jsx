import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import { getTheaterById, getScreensByTheater, getShowtimesByTheater } from "./theatersApi";
import { getErrorMessage } from "../../lib/api";

export default function TheaterDetail() {
  const { theaterId } = useParams();
  const [theater, setTheater] = useState(null);
  const [screens, setScreens] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      getTheaterById(theaterId),
      getScreensByTheater(theaterId),
      getShowtimesByTheater(theaterId),
    ])
      .then(([theaterData, screensData, showtimesData]) => {
        if (cancelled) return;
        setTheater(theaterData);
        setScreens(Array.isArray(screensData) ? screensData : screensData?.screens || []);
        setShowtimes(Array.isArray(showtimesData) ? showtimesData : showtimesData?.showtimes || []);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load this theater"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [theaterId]);

  return (
    <div className="App">
      <Nav />
      <div className="slider-wrapper pt-5 px-5" style={{ marginTop: "70px", minHeight: "60vh" }}>
        {loading && <div className="text-light text-center py-5">جاري التحميل...</div>}
        {!loading && error && <div className="alert alert-danger text-center my-3">{error}</div>}

        {!loading && !error && theater && (
          <>
            <h3 className="fw-bold text-light mb-1">{theater.name}</h3>
            <p className="text-secondary mb-1">
              <i className="fa-solid fa-location-dot me-2"></i>
              {theater.location?.address}, {theater.location?.city}
            </p>
            <p className="text-secondary mb-4">
              <i className="fa-solid fa-phone me-2"></i>
              {theater.phone}
            </p>

            {theater.amenities?.length > 0 && (
              <div className="mb-4">
                {theater.amenities.map((a) => (
                  <span key={a} className="badge bg-secondary me-2 mb-2">
                    {a}
                  </span>
                ))}
              </div>
            )}

            <h5 className="fw-bold text-light mb-3">Screens</h5>
            {screens.length === 0 ? (
              <p className="text-secondary">No screens listed yet.</p>
            ) : (
              <div className="row g-3 mb-5">
                {screens.map((screen) => {
                  const id = screen._id || screen.id;
                  return (
                    <div className="col-md-4" key={id}>
                      <div className="card bg-dark text-light border-secondary p-3">
                        <strong>{screen.screenName}</strong>
                        <span className="text-secondary">{screen.screenType}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h5 className="fw-bold text-light mb-3">Showtimes</h5>
            {showtimes.length === 0 ? (
              <p className="text-secondary">No upcoming showtimes at this theater.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Movie</th>
                      <th>Screen</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {showtimes.map((s) => {
                      const id = s._id || s.id;
                      const start = s.start_time ? new Date(s.start_time) : null;
                      const movieId = s.movie_id?._id || s.movie_id;
                      return (
                        <tr key={id}>
                          <td>{s.movie_id?.title || "—"}</td>
                          <td>{s.screen_id?.screenName || "—"}</td>
                          <td>{start ? start.toLocaleDateString() : "—"}</td>
                          <td>
                            {start
                              ? start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td>
                            {movieId && (
                              <Link to={`/movie/${movieId}`} className="btn btn-outline-warning btn-sm">
                                Book
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
