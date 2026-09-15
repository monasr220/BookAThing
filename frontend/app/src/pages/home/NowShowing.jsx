import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  FreeMode,
  Keyboard,
  Mousewheel,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./NowShowing.css";

//  قائمة عناوين الأفلام المراد إخفاؤها واستبعادها نهائيا
const BLOCKED_MOVIES = ["i want your sex"];

export default function NowShowing() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    // GET /movies/now-in-cinemas بترجع الأفلام اللي عندها showtimes فعلاً دلوقتي،
    // بس من غير ?city= بيفلتر على أساس مسرح بمدينة undefined - يعني ممكن يرجع
    // مصفوفة فاضية لو مفيش city محدد (راجع fetchNowInCinemas في movieService.js).
    // عشان الهوم بيدج الرئيسية متفضلش فاضية في الحالة دي، بنرجع لـ GET /movies
    // العادي (كل الأفلام) لو الـ endpoint الأدق رجع مفيش نتائج.
    const extract = (data) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.movies)) return data.movies;
      if (data?.data && Array.isArray(data.data.movies)) return data.data.movies;
      return [];
    };

    fetch(`${base}/movies/now-in-cinemas`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`خطأ في السيرفر: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const nowShowing = extract(data);
        if (nowShowing.length > 0) return nowShowing;

        // Fallback: no city filter matched anything - show the full catalog
        // instead of an empty homepage.
        return fetch(`${base}/movies`)
          .then((res) => (res.ok ? res.json() : []))
          .then((allData) => extract(allData));
      })
      .then((extractedMovies) => {

        // فلترة وإخفاء الأفلام الغير مرغوب فيها 
        const filteredMovies = extractedMovies.filter((movie) => {
          const title = (movie.title || "").toLowerCase().trim();
          return !BLOCKED_MOVIES.includes(title);
        });

        setMovies(filteredMovies);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div id="now-showing" className="slider-wrapper pt-5 px-5">
      <h5
        className="text-start ps-2 mb-3 fw-bold"
        style={{ borderLeft: "3px solid #ded22d", letterSpacing: "1px" }}
      >
        Now Showing
      </h5>

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
          تم الاتصال بالباك إند ولكن لم يتم إرجاع أي مصفوفة أفلام.
        </div>
      )}

      {movies.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination, Mousewheel, Keyboard, FreeMode]}
          keyboard={{ enabled: true, onlyInViewport: true }}
          mousewheel={{ forceToAxis: true }}
          freeMode={true}
          loop={movies.length > 5}
          pagination={{ clickable: true }}
          slidesPerView={1}
          spaceBetween={15}
          slidesPerGroup={1}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 10 },
            1280: { slidesPerView: 5, spaceBetween: 10 },
          }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
        >
          {movies.map((item, index) => {
            const rawPoster = item.poster_url || item.poster || item.posterUrl || item.poster_path;
            const movieTitle = (item.title || "").toLowerCase().trim();

            let finalPoster = "";

            // Use the TMDB poster_url from database
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
              <SwiperSlide key={item.id || item._id || index}>
                <div
                  className="card filmCard text-start bg-dark text-light rounded-3 overflow-hidden"
                  style={{ width: "100%" }}
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
              </SwiperSlide>
            );
          })}

          <div className="slider-controls gap-2 d-flex justify-content-center mt-2 ms-1">
            <button
              className="custom-prev btn btn-primary rounded-circle"
              style={{ width: "50px", height: "50px" }}
            >
              <i className="fa-solid fa-angle-left"></i>
            </button>
            <button
              className="custom-next btn btn-primary rounded-circle"
              style={{ width: "50px", height: "50px" }}
            >
              <i className="fa-solid fa-angle-right"></i>
            </button>
          </div>
        </Swiper>
      )}
    </div>
  );
}
