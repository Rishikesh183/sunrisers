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
                                src="https://static.cricketaddictor.com/images/SRH.jpg?q=80"
                                alt=""
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-black uppercase">
                                Bowling Failure or Batting?
                            </h1>
                            <div className="text-lg font-medium text-gray-700 space-y-2">
                                <p>Shami , Nitish have been a minus this season</p>
                                <p>Batting looked confused after LSG's Second Game</p>
                                <p>Risers made a great comeback at the end</p>
                                <p>Harsh , Aniket , Zeeshan , Malinga are find of the season</p>
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
                                    Ishan & Nitish misfired
                                </h1>
                                <p className="text-gray-700 text-base font-medium">
                                    After Ishan kishan's century in the first game ishan looked clueless till RCB's Game and Nitish was low in confidence 
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4bg-gradient-to-r from-orange-100 to-orange-300">
                            <div className="w-[12vw] h-[12vh]">
                                <img
                                    className="w-full h-full rounded-xl object-cover shadow-md"
                                    src="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202505/mohammed-shami-ap-photo-12265746-16x9_0.jpg?VersionId=Lomk8lqptOVFE5tjEpjqNxK0d4mPrJYx&size=690:388"
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h1 className="font-bold text-xl uppercase text-black">
                                    Shami's Future Doubtful in ornage ?  
                                </h1>
                                <p className="text-gray-700 text-base font-medium">
                                    With the kind of form shami is having and the price tag he carries it looks difficult to retain shami for next year  
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
