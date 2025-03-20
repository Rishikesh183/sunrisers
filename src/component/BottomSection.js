import Marquee from "react-fast-marquee";
const BottomSection = () => {
    return (
        <div className="bg-gradient-to-b from-orange-100 to-orange-400 ">

            {/* Player Spotlight Section */}
            
            <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-orange-800 mb-6 pt-4">
                    Records Etched in Orange 🧡
                </h3>
                <div >
                    <Marquee pauseOnHover >
                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg overflow-hidden mx-8 my-8">
                        <img
                            src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/385000/385003.3.jpg"
                            alt="Nitish Reddy"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">Nitish Reddy</p>
                            <p className="text-gray-600">Emerging player of 2024</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg mx-8 my-8 overflow-hidden">
                        <img
                            src="https://images-cricketcom.imgix.net/news-1711607833937"
                            alt="Abhishek Sharma"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">Abhishek Sharma</p>
                            <p className="text-gray-600">Most sixes - 42</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg mx-8 my-8 overflow-hidden">
                        <img
                            src="https://cdn.shopify.com/s/files/1/0278/4565/6649/files/WhatsApp_Image_2024-04-27_at_14.07.36.webp?v=1714207244"
                            alt="Travis Head"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">Travis Head</p>
                            <p className="text-gray-600">Most Runs - 567</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg mx-8 my-8 overflow-hidden">
                        <img
                            src="https://d3lzcn6mbbadaf.cloudfront.net/media/details/ANI-20240406044225.jpg"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">T Natarajan</p>
                            <p className="text-gray-600">Most wickets - 19</p>
                        </div>
                    </div>
                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg mx-8 my-8 overflow-hidden">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq0AoM2k3bzjoShYjoCWDj7u0cXiAdq9miKQ&s"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">Highest Score</p>
                            <p className="text-gray-600">287-3 [20] vs RCB</p>
                        </div>
                    </div>
                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg mx-8 my-8 overflow-hidden">
                        <img
                            src="https://images.indianexpress.com/2024/04/New-Project-2024-04-15T201813.476.jpg?w=414"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">Highest Powerplay score</p>
                            <p className="text-gray-600">125-0 [6] vs DC </p>
                        </div>
                    </div>
                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg mx-8 my-8 overflow-hidden">
                        <img
                            src="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202405/abhishek-sharma-and-travis-head-085120347-16x9_0.jpg?VersionId=PlyCU2H.yuMUlBV7n6tJ9e7ob79lqRFd&size=690:388"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">Fastest chase [min 150]</p>
                            <p className="text-gray-600">167-0 [9.4] vs LSG</p>
                        </div>
                    </div>
                    <div className="bg-white shadow-md w-72 flex-shrink-0 rounded-lg mx-8 my-8 overflow-hidden">
                        <img
                            src="https://images.firstpost.com/uploads/2024/03/Pat-Cummins-IPL-SRH-Sportzpics-2024-03-c34f3532f2aa677d59767c5552cd9425-1200x675.jpeg?im=FitAndFill=(1200,675)"
                            alt="T Natarajan"
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-4 text-center">
                            <p className="text-xl font-semibold text-orange-800">Best Captain</p>
                            <p className="text-gray-600">Pat Cummins</p>
                        </div>
                    </div>
                    </Marquee>
                </div>
            </div>
            

            {/* Footer Section */}
            <div className="bg-orange-700 text-white py-3">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                        {/* Copyright Section */}
                        <div className="text-center sm:text-left mb-4 sm:mb-0">
                            <p className="text-sm">© 2025 Bleed Orangism. Developed By cricmawa</p>
                        </div>

                        {/* Social Links Section */}
                        <div className="text-center">
                            <h4 className="text-lg font-semibold">Follow Us</h4>
                            <div className="flex justify-center space-x-4 mt-2">
                                <a
                                    href="https://facebook.com" target="blank"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-orange-700 hover:bg-orange-500 hover:text-white transition"
                                >
                                    <i className="fab fa-whatsapp"></i>
                                </a>
                                <a
                                    href="https://x.com/cricmawa?t=goRbu8TnVV3QSHFlMfjCwg&s=09" target="blank"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-orange-700 hover:bg-orange-500 hover:text-white transition"
                                >
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a
                                    href="...." target="blank"
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-orange-700 hover:bg-orange-500 hover:text-white transition"
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
