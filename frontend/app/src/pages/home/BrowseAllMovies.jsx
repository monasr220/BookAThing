import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./NowShowing.css";

export default function BrowseAllMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    fetch(`${base}/movies`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`خطأ في السيرفر: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const extracted = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setMovies(extracted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-5">
      <h2
        className="text-start ps-2 mb-4 fw-bold"
        style={{ borderLeft: "3px solid #ded22d", letterSpacing: "1px", color: "#fff" }}
      >
        All Movies
      </h2>

      {loading && (
        <div className="text-light text-center py-4">جاري تحميل الأفلام...</div>
      )}

      {errorMsg && (
        <div className="alert alert-danger text-center my-3">
          فشل الاتصال: {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && movies.length === 0 && (
        <div className="alert alert-warning text-center my-3">
          لا توجد أفلام حالياً
        </div>
      )}

      {!loading && !errorMsg && movies.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
          {movies.map((item, index) => {
            const rawPoster = item.poster_url || item.poster || item.posterUrl || item.poster_path;
            let finalPoster = "";

            if (rawPoster && typeof rawPoster === "string") {
              if (
                rawPoster.startsWith("http://") ||
                rawPoster.startsWith("https://")
              ) {
                finalPoster = rawPoster;
              } else {
                const path = rawPoster.startsWith("/")
                  ? rawPoster
                  : `/${rawPoster}`;
                finalPoster = `https://image.tmdb.org/t/p/w500${path}`;
              }
            } else {
              finalPoster = `https://picsum.photos/seed/${encodeURIComponent(item.title || "movie")}/500/750`;
            }

            return (
              <div className="col" key={item.id || item._id || index}>
                <div
                  className="card filmCard text-start bg-dark text-light rounded-3 overflow-hidden h-100"
                >
                  <div style={{ height: "300px", overflow: "hidden" }}>
                    <img
                      src={finalPoster}
                      className="card-img-top"
                      alt={item.title || "Movie"}
                      style={{
                        height: "100%",
                        width: "100%",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.title || "movie")}/500/750`;
                      }}
                    />
                  </div>
                  <div className="card-body pb-3">
                    <h6
                      title={item.title}
                      className="card-title overflow-hidden fw-bold fs-5"
                      style={{ textOverflow: "ellipsis", textWrap: "nowrap" }}
                    >
                      {item.title || "Untitled"}
                    </h6>

                    <p
                      className="card-text w-100 overflow-hidden text-secondary fw-bold"
                      style={{ textOverflow: "ellipsis" }}
                    >
                      <span style={{ width: "100%", textWrap: "nowrap" }}>
                        {Array.isArray(item.genre)
                          ? item.genre.join(", ")
                          : item.genre || "Action"}
                      </span>
                    </p>
                    <p className="text-secondary fw-bold">
                      <i className="fa-regular fa-clock"></i>{" "}
                      {item.duration || item.durationMinutes || "120"} min
                    </p>
                    <Link
                      to={`/movie/${item.id || item._id}`}
                      className="btn btn-outline-warning px-4 d-flex justify-content-center fw-bold"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
