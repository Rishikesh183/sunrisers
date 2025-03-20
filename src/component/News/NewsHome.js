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
                <div className="flex flex-wrap bg-gradient-to-r from-orange-100 to-orange-300 rounded-xl p-4">
                    {/* Main News Card */}
                    <div className="flex flex-1 h-[30vh] p-6 gap-4 border-r border-white">
                        <div className="w-[16vw] h-[22vh]">
                            <img
                                className="w-full h-full rounded-xl object-cover shadow-md"
                                src="https://static.tnn.in/thumb/msid-109168042,thumbsize-43388,width-1280,height-720,resizemode-75/109168042.jpg?quality=100"
                                alt=""
                            />
                        </div>
                        <div className="flex flex-col justify-between">
                            <h1 className="text-3xl font-bold text-black uppercase">
                                Surprising Retentions for SRH
                            </h1>
                            <div className="text-lg font-medium text-gray-700 space-y-2">
                                <p>Klassen will be the first Retention For SRH at 23cr</p>
                                <p>Captain Pat will be retained at 18cr</p>
                                <p>Abhishek is all set for 14cr</p>
                                <p>Head and NKR could be Remaining 2 Retentions</p>
                            </div>
                        </div>
                    </div>

                    {/* Side News Cards */}
                    <div className="flex flex-col w-[38vw] gap-4 pl-4">
                        <div className="flex gap-4 p-2">
                            <div className="w-[10vw] h-[12vh]">
                                <img
                                    className="w-full h-full rounded-xl object-cover shadow-md"
                                    src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_800,q_50/lsci/db/PICTURES/CMS/388700/388751.jpg"
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col justify-between">
                                <h1 className="font-bold text-xl uppercase text-black">
                                    NKR to Australia
                                </h1>
                                <p className="text-gray-700 text-base font-medium">
                                    NKR likely to travel to Australia as a pace bowling all-rounder.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4bg-gradient-to-r from-orange-100 to-orange-300">
                            <div className="w-[10vw] h-[12vh]">
                                <img
                                    className="w-full h-full rounded-xl object-cover shadow-md"
                                    src="https://media.ahmedabadmirror.com/am/uploads/mediaGallery/image/1616855803220.jpg-org"
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col justify-between">
                                <h1 className="font-bold text-xl uppercase text-black">
                                    Sundar for Remaining Tests
                                </h1>
                                <p className="text-gray-700 text-base font-medium">
                                    Washington Sundar has been added to the 2nd and 3rd Test vs NZ.
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
