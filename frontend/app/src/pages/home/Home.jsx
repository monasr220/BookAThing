import "./home.css";
import "./App.css";

import Nav from "./Nav";
import Hero from "./HeroSection";
import NowShowing from "./NowShowing";
import PopularMovies from "./PopularMovies";
import ComingSoon from "./ComingSoon";
import UpcomingMovies from "./UpcomingMovies";
import Details from "./Details";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="App">
      <Nav />
      <Hero />
      <NowShowing />
      <PopularMovies />
      <ComingSoon />
      <UpcomingMovies />
      <Details />
      <Footer />
    </div>
  );
}
