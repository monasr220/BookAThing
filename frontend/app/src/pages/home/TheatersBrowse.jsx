import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import { getAllTheaters } from "./theatersApi";
import { getErrorMessage } from "../../lib/api";

export default function TheatersBrowse() {
  const [theaters, setTheaters] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (cityFilter) => {
    setLoading(true);
    setError("");
    getAllTheaters(cityFilter)
      .then((data) => setTheaters(Array.isArray(data) ? data : data?.theaters || []))
      .catch((err) => setError(getErrorMessage(err, "Could not load theaters")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const cities = [...new Set(theaters.map((t) => t.location?.city).filter(Boolean))];

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    load(value || undefined);
  };

  return (
    <div className="App">
      <Nav />
      <div className="slider-wrapper pt-5 px-5" style={{ marginTop: "70px" }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 px-2">
          <h5
            className="fw-bold m-0"
            style={{ borderLeft: "3px solid #ded22d", letterSpacing: "1px", paddingLeft: "8px" }}
          >
            Theaters
          </h5>

          <select className="form-select" style={{ maxWidth: 220 }} value={city} onChange={handleCityChange}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="text-light text-center py-4">جاري التحميل...</div>}
        {!loading && error && <div className="alert alert-danger text-center my-3">{error}</div>}
        {!loading && !error && theaters.length === 0 && (
          <div className="alert alert-warning text-center my-3">No theaters found.</div>
        )}

        {!loading && !error && theaters.length > 0 && (
          <div className="row g-4 px-2">
            {theaters.map((theater) => {
              const id = theater._id || theater.id;
              return (
                <div className="col-md-6 col-lg-4" key={id}>
                  <div className="card bg-dark text-light rounded-3 p-3 h-100 border-secondary">
                    <h5 className="fw-bold">{theater.name}</h5>
                    <p className="text-secondary mb-1">
                      <i className="fa-solid fa-location-dot me-2"></i>
                      {theater.location?.address}, {theater.location?.city}
                    </p>
                    <p className="text-secondary mb-3">
                      <i className="fa-solid fa-phone me-2"></i>
                      {theater.phone}
                    </p>
                    <Link to={`/theaters/${id}`} className="btn btn-outline-warning mt-auto">
                      View Theater
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
