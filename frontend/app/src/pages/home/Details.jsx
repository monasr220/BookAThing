export default function Details() {
  return (
    <>
      <div
        className="container-fluid bg-dark mt-5 mb-5 py-5 px-5 rounded-2 "
        style={{ width: "95%", boxShadow: "1px 2px 3px 2px #878787a9" }}
      >
        <div className="row px-2 gap-4 gap-md-0">
          <div className="col-md-6 col-lg-3 d-flex align-items-center gap-4 justify-content-center justify-content-md-start">
            <div>
              <i
                className="fa-solid fa-ticket"
                style={{ color: "#edc278df", fontSize: "2rem" }}
              ></i>
            </div>
            <div
              className=""
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "justify",
              }}
            >
              <h6 className="text-light fw-bold">Easy Booking</h6>
              <p style={{ color: "#c5c2c2", width: "150px" }}>
                Book your tickets in just a few steps
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 d-flex align-items-center gap-4 justify-content-center justify-content-md-start">
            <div>
              <i
                className="fa-solid fa-tag"
                style={{ color: "#edc278df", fontSize: "2rem" }}
              ></i>
            </div>
            <div
              className=""
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "justify",
              }}
            >
              <h6 className="text-light fw-bold">Best Prices</h6>
              <p style={{ color: "#c5c2c2", width: "150px" }}>
                Get the best offers and discounts
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 d-flex align-items-center gap-4  justify-content-center justify-content-md-start">
            <div>
              <i
                className="fa-solid fa-users-line"
                style={{ color: "#edc278df", fontSize: "2rem" }}
              ></i>
            </div>
            <div
              className=""
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "justify",
              }}
            >
              <h6 className="text-light fw-bold">Wide Selection</h6>
              <p style={{ color: "#c5c2c2", width: "150px" }}>
                Choose from a wide range of movies
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 d-flex align-items-center gap-4  justify-content-center justify-content-md-start">
            <div>
              <i
                className="fa-solid fa-shield-halved"
                style={{ color: "#edc278df", fontSize: "2rem" }}
              ></i>
            </div>
            <div
              className=""
              style={{
                display: "flex",
                flexDirection: "column",
                textAlign: "justify",
              }}
            >
              <h6 className="text-light fw-bold">Secure Payment</h6>
              <p style={{ color: "#c5c2c2", width: "150px" }}>
                Your payment is safe and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
