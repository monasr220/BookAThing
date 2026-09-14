import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Autoplay,
  FreeMode,
  Keyboard,
  Mousewheel,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ComingSoon.css";

// قائمة استبعاد الأفلام غير المناسبة بالكامل
const BLOCKED_MOVIES = ["i want your sex"];

export default function ComingSoon() {
  // GET /api/movies/coming-soon returns movies with a future releaseDate
  // that don't have any showtimes scheduled yet (see movieService.js).
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/movies/coming-soon`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const extracted = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.movies)
          ? data.movies
          : [];
        setMovies(extracted);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Coming Soon fetch error:", err);
        setErrorMsg(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // فلترة البيانات قبل عرضها
  const filteredData = (movies || []).filter((item) => {
    const title = (item.title || "").toLowerCase().trim();
    return !BLOCKED_MOVIES.includes(title);
  });

  return (
    <div id="coming-soon" className="slider-wrapper pt-5 px-5">
      <h5
        className="text-start ps-2 mb-3 fw-bold"
        style={{ borderLeft: "3px solid #ded22d", letterSpacing: "1px" }}
      >
        Coming Soon
      </h5>

      {loading && (
        <div className="text-light text-center py-4">جاري تحميل الأفلام...</div>
      )}

      {errorMsg && (
        <div className="alert alert-danger text-center my-3">
          فشل الاتصال: {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && filteredData.length === 0 && (
        <div className="alert alert-warning text-center my-3">
          لا توجد أفلام قادمة حالياً
        </div>
      )}

      {!loading && !errorMsg && filteredData.length > 0 && (
        <Swiper
          className="swiperRow pb-5"
          modules={[
            Navigation,
            Pagination,
            Autoplay,
            Mousewheel,
            Keyboard,
            FreeMode,
          ]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          mousewheel={{ forceToAxis: true }}
          freeMode={true}
          loop={filteredData.length > 5}
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
        {filteredData.map((item, index) => {
          const rawPoster = item.poster_url || item.src || item.poster || item.poster_path;
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
            <SwiperSlide key={item.id || index}>
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

                  <p className="text-secondary fw-bold mb-0">
                    <i className="fa-regular fa-clock me-1"></i>
                    {item.duration || "Coming Soon"}
                  </p>
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
