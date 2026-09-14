import "./Footer.css";

export default function Footer() {
  return (
    <>
      <div className="container-fluid bg-dark h-100 pt-4 pb-1">
        <div className="row px-5 py-2 d-flex gap-4 gap-md-0" style={{borderBottom : "2px solid #8a8a8a5a"}}>
          <div
            className="col-md-6 col-lg-3 d-flex flex-column  "
            style={{ textAlign: "justify" }}
          >
            <div className="ps-0">
              <a
                className="navbar-brand ms-0 d-flex align-items-end gap-2 fw-bold"
                href="#"
                style={{
                  color: "#ffe96f",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  fontFamily:
                    "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                  letterSpacing: "1px",
                }}
              >
                {" "}
                <img
                  src="/home/popcorn.png"
                  style={{ width: "50px", marginLeft: "0", paddingLeft: "0" }}
                />{" "}
                CINEMA
              </a>
            </div>

            <p
              className=" pt-3"
              style={{ textAlign: "justify", width: "200px" , color : "#d8d5d5" }}
            >
              Book your tickets anytime, anywhere.Enjoy the show!
            </p>

            <div className="d-flex gap-3 ps-3">
              <a href="#">
                {" "}
                <i className="fa-brands fa-facebook footIcon"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-instagram footIcon"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-twitter footIcon"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-youtube footIcon"></i>
              </a>
            </div>
          </div>
          <div className="col-md-6 col-lg-3 " style={{textAlign : "justify"}}>
            <h5 className="text-light fw-bold pb-2">Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{fontWeight : "500"}} >
                
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Movies
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Cinemas
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Offers
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  My Bookings
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-6 col-lg-3 " style={{textAlign : "justify"}}>
            <h5 className="text-light fw-bold pb-2">Support</h5>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{fontWeight : "500"}} >
                
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none">
                    FAQs
                </a>
              </li>
            </ul>
          </div>

          <div className="col-md-6 col-lg-3 " style={{textAlign : "justify"}}>
            <h5 className="text-light fw-bold pb-2">Contact</h5>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{fontWeight : "500"}} >
                
              <li>

                <a href="#" className="text-light text-decoration-none ">
                  <i className="fa-solid fa-phone pe-4 footerIcons2"></i>
                  +20 122 054 1770
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none ">
                    <i className="fa-regular fa-envelope-open pe-4 footerIcons2"></i>
                  sdm418012@gmail.com
                </a>
              </li>
              <li>
                <a href="#" className="text-light text-decoration-none ">
                    <i className="fa-solid fa-location-dot pe-4 footerIcons2"></i>
                  Cairo, Egypt
                </a>
              </li>
              
            </ul>
          </div>

        </div>
        <p style={{color: "#c5c2c2" , paddingTop : "10px" , textAlign : "center"}}>
            @ 2026 Cinema Booking System. All rights reserved.
        </p>
        
      </div>
    </>
  );
}
