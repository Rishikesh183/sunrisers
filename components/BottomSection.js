import Marquee from "react-fast-marquee";
const BottomSection = () => {
    return (
        <div className="bg-bg border-t border-border">

            {/* Player Spotlight Section */}

            <div className="text-center mb-12 pt-10">
                <h3 className="text-2xl sm:text-3xl font-display text-text mb-6">
                    Records Etched in <span className="text-accent">Orange</span> &#129505;
                </h3>
                <div>
                    <Marquee pauseOnHover >
                    <div className="bg-surface border border-border shadow-md w-72 flex-shrink-0 rounded-lg overflow-hidden mx-4 my-4">
                        <img
                            src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/385000/385003.3.jpg"
                            alt="Nitish Reddy"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-accent">Nitish Reddy</p>
                            <p className="text-textMuted">Emerging player of 2024</p>
                        </div>
                    </div>

                    <div className="bg-surface border border-border shadow-md w-72 flex-shrink-0 rounded-lg mx-4 my-4 overflow-hidden">
                        <img
                            src="https://img.etimg.com/thumb/width-420,height-315,imgsize-92402,resizemode-75,msid-120241000/news/sports/abhishek-sharmas-incredible-ton-powers-srh-to-eight-wicket-win-over-pbks/hyderabad-apr-12-ani-sunrisers-hyderabads-abhishek-sharma-celebrates-his-ma-.jpg"
                            alt="Abhishek Sharma"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-accent">Abhishek Sharma</p>
                            <p className="text-textMuted">Most sixes(IND) - 42</p>
                        </div>
                    </div>

                    <div className="bg-surface border border-border shadow-md w-72 flex-shrink-0 rounded-lg mx-4 my-4 overflow-hidden">
                        <img
                            src="https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1Fs0GX.img?w=1280&h=720&m=4&q=70"
                            alt="Henrich Klassen"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-accent">Henrich Klassen</p>
                            <p className="text-textMuted">Most Runs For SRH(2025) - 487</p>
                        </div>
                    </div>

                    <div className="bg-surface border border-border shadow-md w-72 flex-shrink-0 rounded-lg mx-4 my-4 overflow-hidden">
                        <img
                            src="https://www.hindustantimes.com/ht-img/img/2025/03/23/550x309/India-IPL-Cricket-7_1715190579507_1742716375086.jpg"
                            alt="Pat Cummins"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-accent">Pat Cummins</p>
                            <p className="text-textMuted">Most wickets For SRH(2025) - 16</p>
                        </div>
                    </div>
                    <div className="bg-surface border border-border shadow-md w-72 flex-shrink-0 rounded-lg mx-4 my-4 overflow-hidden">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq0AoM2k3bzjoShYjoCWDj7u0cXiAdq9miKQ&s"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-accent">Highest Score</p>
                            <p className="text-textMuted">287-3 [20] vs RCB</p>
                        </div>
                    </div>
                    <div className="bg-surface border border-border shadow-md w-72 flex-shrink-0 rounded-lg mx-4 my-4 overflow-hidden">
                        <img
                            src="https://images.indianexpress.com/2024/04/New-Project-2024-04-15T201813.476.jpg?w=414"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-accent">Highest Powerplay score</p>
                            <p className="text-textMuted">125-0 [6] vs DC </p>
                        </div>
                    </div>
                    <div className="bg-surface border border-border shadow-md w-72 flex-shrink-0 rounded-lg mx-4 my-4 overflow-hidden">
                        <img
                            src="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202405/abhishek-sharma-and-travis-head-085120347-16x9_0.jpg?VersionId=PlyCU2H.yuMUlBV7n6tJ9e7ob79lqRFd&size=690:388"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-accent">Fastest chase [min 150]</p>
                            <p className="text-textMuted">167-0 [9.4] vs LSG</p>
                        </div>
                    </div>
                    </Marquee>
                </div>
            </div>


            {/* Footer Section */}
            <div className="bg-surface border-t border-border text-text py-6">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        {/* Copyright Section */}
                        <div className="text-center sm:text-left mb-4 sm:mb-0">
                            <p className="text-sm text-textMuted">&#169; 2025 Bleed Orangism. Developed By cricmawa</p>
                        </div>

                        {/* Social Links Section */}
                        <div className="text-center">
                            <h4 className="text-lg font-semibold text-text">Follow Us</h4>
                            <div className="flex justify-center space-x-4 mt-2">
                                <a
                                    href="https://www.facebook.com/sunrisershyderabad/" target="blank"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-border text-accent hover:bg-accent hover:text-white transition-colors"
                                >
                                    <i className="fab fa-facebook"></i>
                                </a>
                                <a
                                    href="https://x.com/SunRisers?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="blank"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-border text-accent hover:bg-accent hover:text-white transition-colors"
                                >
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a
                                    href="https://www.instagram.com/sunrisershyd/?hl=en" target="blank"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-border text-accent hover:bg-accent hover:text-white transition-colors"
                                >
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BottomSection;


// className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-72 flex-shrink-0 mx-auto px-4"
