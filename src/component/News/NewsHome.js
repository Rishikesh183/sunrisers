import React from 'react';

const NewsHome = () => {
    return (
        <>
            <div className="bg-gradient-to-r from-orange-100 to-orange-300 p-4 border-r border-white">
                {/* News Heading */}
                <div className="flex border-b-2 w-full border-white mb-2">
                    <div className="flex text-2xl w-[60vw] font-bold text-black p-2 px-8 border-r border-white">
                        Top Stories
                    </div>
                    <div className="flex text-2xl w-[41vw] font-bold text-black p-2 px-6">
                        Risers News For You
                    </div>
                </div>

                {/* News Section */}
                <div className="flex flex-wrap rounded-xl p-4">
                    {/* Main News Card */}
                    <div className="flex flex-1 h-[30vh] p-6 gap-4 border-r border-white">
                        <div className="w-[16vw] h-[22vh]">
                            <img
                                className="w-full h-full rounded-xl object-cover shadow-md"
                                src="https://static.tnn.in/thumb/msid-109168042,thumbsize-43388,width-1280,height-720,resizemode-75/109168042.jpg?quality=100"
                                alt=""
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-black uppercase">
                                Abki baar 300 paar?
                            </h1>
                            <div className="text-lg font-medium text-gray-700 space-y-2">
                                <p>Srh aiming for 300 this year </p>
                                <p>With the explosive batting this year srh are looking more solid</p>
                                <p>Additon of ishan Kishan makes our batting more explosive</p>
                                <p>Young guns like Aniket and Abhinav spice up our batting more</p>
                            </div>
                        </div>
                    </div>

                    {/* Side News Cards */}
                    <div className="flex flex-col w-[38vw] gap-4 pl-4">
                        <div className="flex gap-4 p-2">
                            <div className="w-[14vw] h-[12vh]">
                                <img
                                    className="w-full h-full rounded-xl object-cover shadow-md"
                                    src="https://images.mykhel.com/img/2025/03/ishan-kishan-srh-ft-1742092253.jpg"
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h1 className="font-bold text-xl uppercase text-black">
                                    Ishan Mania in Srh
                                </h1>
                                <p className="text-gray-700 text-base font-medium">
                                    Ishan kishan's starts with firey knocks in practice matches , Adds more power to risers batting
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4bg-gradient-to-r from-orange-100 to-orange-300">
                            <div className="w-[12vw] h-[12vh]">
                                <img
                                    className="w-full h-full rounded-xl object-cover shadow-md"
                                    src="https://images.mykhel.com/fit-in/320x180/img/2025/02/pat-cummins-injury-update-ft-1740122017.jpg"
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h1 className="font-bold text-xl uppercase text-black">
                                    Meet & Greet with SRH  
                                </h1>
                                <p className="text-gray-700 text-base font-medium">
                                    Risers are all set to meet with fans on 22nd march at Daspally convention 
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsHome;
