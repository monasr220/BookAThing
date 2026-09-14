import MovieCarousel from "./MovieCarousel";

export default function UpcomingMovies() {
  return <MovieCarousel title="Upcoming" anchorId="upcoming-movies" endpoint="/movies/upcoming" />;
}
