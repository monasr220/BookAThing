import "./home.css";
import "./App.css";

import Nav from "./Nav";
import Hero from "./HeroSection";
import NowShowing from "./NowShowing";
import ComingSoon from "./ComingSoon";
import Details from "./Details";
import Footer from "./Footer";

export default function Home() {
  return (
    <div className="App">
      <Nav />
      <Hero />
      <NowShowing />
      <ComingSoon />
      <Details />
      <Footer />
    </div>
  );
}
