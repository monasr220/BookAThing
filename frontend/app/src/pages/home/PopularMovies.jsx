import MovieCarousel from "./MovieCarousel";

export default function PopularMovies() {
  return <MovieCarousel title="Popular" anchorId="popular-movies" endpoint="/movies/popular" />;
}
