import "./HeroSection.css"

export default function Hero () {
    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 heroSection d-flex justify-content-start align-items-center align-baseline text-light ps-0 ps-sm-5 " style={{alignItems : "baseline"}}>  
                <div className="contentDiv d-flex flex-column align-items-center align-items-sm-start ps-3 text-center w-100 ">
                    <h1 className="text-center text-sm-start text-break head1" style={{ fontWeight : "700" , letterSpacing : "1.5px"}}>The Best Movie <span className="d-block">Experience</span></h1>
                    <h2 className="text-break head2" style={{color : "#DBB15B" , letterSpacing : "2px" , wordSpacing : "2px" , marginBottom : "2rem"}}>Book Your Tickets Easy</h2>
                    <p className="text-break" style={{fontSize : "1.125rem" , color : "#ffffffcf" , letterSpacing : "0.5px" , marginBottom : "10px"}}>Choose your movie, showtime and seats.</p>
                    <p className="text-break" style={{fontSize : "1.125rem" , color : "#ffffffcf" , letterSpacing : "0.5px"}}>Enjoy the best cinema experience.</p>
                    <div className="d-flex gap-3 mt-5 btnsdiv1">
                        <a href="#" className=" btn btn1 fw-bold py-2 px-3 py-sm-3 px-sm-5">Book Now</a >
                        <a href="#" className=" btn btn2 fw-bold py-2 px-3 py-sm-3 px-sm-5">Explore Movies</a >
                    </div>
                </div>
            </div>
                </div>
            </div>
        </>
    );
}