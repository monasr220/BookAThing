import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Nav.css";
import { isLoggedIn, clearSession } from "../../lib/api";

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const handleLogout = () => {
    clearSession();
    setLoggedIn(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark position-fixed w-100 py-3 z-3"
        style={{ backgroundColor: "#040202e2" }}
      >
        <div className="container-fluid">
          <Link
            className="navbar-brand fw-bold"
            to="/"
            style={{
              color: "#ffe96f",
              fontSize: "1.2rem",
              fontFamily:
                "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
              letterSpacing: "2px",
            }}
          >
            {" "}
            <img src="/home/screen.png" alt="" style={{ width: "50px" }} className="ms-sm-1 ms-md-5 " /> CINEMA
          </Link>
          <button
            className="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <div className="d-flex m-auto">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex justify-content-center">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#now-showing">
                    Movies
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#coming-soon">
                    Cinemas
                  </a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/offers">
                    Offers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/theaters">
                    Theaters
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings">
                    My Bookings
                  </Link>
                </li>
              </ul>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="d-flex align-items-center me-3"
              style={{ maxWidth: "220px" }}
            >
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Search movies..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>

            <div
              className="navBtns"
              style={{ display: "flex", justifyContent: "end", gap: "1rem", paddingRight: "2rem" }}
            >
              {loggedIn ? (
                <button
                  className="btn btn-outline-light"
                  style={{ fontWeight: "500" }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/auth" className="btn btn-outline-light" style={{ fontWeight: "500" }}>
                    Login
                  </Link>
                  <Link to="/auth?mode=signup" className="btn signBtn" style={{ fontWeight: "600" }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
