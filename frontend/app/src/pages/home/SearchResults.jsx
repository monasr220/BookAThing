import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import "./NowShowing.css";

// GET /movies/search?query= بترجع أراي أفلام مباشرة (زي كل endpoints الأفلام
// التانية) - مش لفّافة { data }.
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [inputValue, setInputValue] = useState(query);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setInputValue(query);
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErrorMsg("");

    fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/movies/search?query=${encodeURIComponent(query)}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`خطأ في السيرفر: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setMovies(Array.isArray(data) ? data : data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(inputValue.trim() ? { query: inputValue.trim() } : {});
  };

  return (
    <div className="App">
      <Nav />
      <div className="slider-wrapper pt-5 px-5" style={{ marginTop: "70px" }}>
        <h5
          className="text-start ps-2 mb-3 fw-bold"
          style={{ borderLeft: "3px solid #ded22d", letterSpacing: "1px" }}
        >
          Search Movies
        </h5>

        <form onSubmit={handleSubmit} className="d-flex gap-2 px-2 mb-4" style={{ maxWidth: 480 }}>
          <input
            className="form-control"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by title..."
          />
          <button type="submit" className="btn btn-outline-warning">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>

        {!query.trim() && (
          <div className="text-light text-center py-4">Type a title above to search.</div>
        )}

        {loading && <div className="text-light text-center py-4">جاري البحث...</div>}
        {errorMsg && <div className="alert alert-danger text-center my-3">فشل الاتصال: {errorMsg}</div>}
        {!loading && !errorMsg && query.trim() && movies.length === 0 && (
          <div className="alert alert-warning text-center my-3">لا توجد نتائج لـ "{query}"</div>
        )}

        {movies.length > 0 && (
          <div className="row g-4 px-2">
            {movies.map((item) => {
              const id = item.id || item._id;
              const rawPoster = item.poster || item.posterUrl || item.poster_path || item.poster_url;
              const finalPoster =
                rawPoster && typeof rawPoster === "string"
                  ? rawPoster.startsWith("http")
                    ? rawPoster
                    : `https://image.tmdb.org/t/p/w500${rawPoster.startsWith("/") ? rawPoster : `/${rawPoster}`}`
                  : `https://picsum.photos/seed/${encodeURIComponent(item.title || "movie")}/500/750`;

              return (
                <div className="col-6 col-md-3 col-lg-2" key={id}>
                  <div className="card filmCard text-start bg-dark text-light rounded-3 overflow-hidden h-100">
                    <div style={{ height: "260px", overflow: "hidden" }}>
                      <img
                        src={finalPoster}
                        className="card-img-top"
                        alt={item.title}
                        style={{ height: "100%", width: "100%" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://picsum.photos/seed/${encodeURIComponent(item.title || "movie")}/500/750`;
                        }}
                      />
                    </div>
                    <div className="card-body pb-3">
                      <h6 title={item.title} className="card-title overflow-hidden fw-bold fs-6">
                        {item.title}
                      </h6>
                      <Link
                        to={`/movie/${id}`}
                        className="btn btn-outline-warning btn-sm w-100 d-flex justify-content-center fw-bold"
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
      <Footer />
    </div>
  );
}
