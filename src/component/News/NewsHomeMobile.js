import React from 'react'

const NewsHomeMobile = () => {
    return (
        <>
            <div className='flex border-b-1 border-gray-200 '>
                <div className='flex font-bold text-2xl justify-between p-2 w-full'>Top Stories</div>
            </div>
            <div className='flex w-full'>
                <div className='flex flex-col p-4 pt-6 gap-6 w-full border-2 border-gray-100'>
                    <div className='w-full'>
                        <img className='w-[90vw] m-auto rounded-xl object-cover items-center justify-center' src="https://static.cricketaddictor.com/images/SRH.jpg?q=80" alt="" />
                    </div>
                    <div className='flex flex-col pb-3'>
                        <div>
                            <h1 className="font-bold text-lg uppercase text-orange-600">
                                Bowling Failure or Batting?
                            </h1>
                        </div>
                        <div className='flex gap-1 text-sm flex-col font-semibold overflow-auto '>
                            <p>Shami , Nitish have been a minus this season</p>
                            <p>Batting looked confused after LSG's Second Game</p>
                            <p>Risers made a great comeback at the end</p>
                        </div>
                    </div>
                </div>
            </div>


            <div className='flex border-b-1 border-gray-200'>
                <div className='flex font-bold text-2xl justify-between p-2 w-full'>Risers News For You</div>
            </div>

            <div className='flex flex-col'>
                <div className='flex flex-col p-6 pt-2 gap-2 border-2 border-gray-100 bg-slate-50 w-full'>
                    <div className='w-full h-[20vh]'>
                        <img
                            className="w-full h-full rounded-xl object-cover shadow-md"
                            src="https://images.mykhel.com/img/2025/03/ishan-kishan-srh-ft-1742092253.jpg"
                            alt=""
                        />
                    </div>
                    <div className=' gap-0 flex flex-col overflow-auto'>
                        <div>
                            <h1 className="font-bold text-lg uppercase text-orange-600">
                                Ishan & Nitish misfired
                            </h1>
                        </div>
                        <div className='flex gap-1 flex-col font-medium'>
                            <p className="text-black text-base font-medium">
                                After Ishan kishan's century in the first game ishan looked clueless till RCB's Game and Nitish was low in confidence
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex flex-col '>
                <div className='flex flex-col p-6 pt-2 gap-2 border-2 border-gray-100 bg-slate-50 w-full'>
                    <div className='w-full h-[20vh]'>
                        <img className='w-[90vw] h-[20vh] m-auto rounded-xl object-cover object-[0_30%] items-center justify-center' src="https://akm-img-a-in.tosshub.com/indiatoday/images/story/202505/mohammed-shami-ap-photo-12265746-16x9_0.jpg?VersionId=Lomk8lqptOVFE5tjEpjqNxK0d4mPrJYx&size=690:388" alt="" />
                    </div>
                    <div className=' gap-0 flex flex-col'>
                        <div>
                            <h1 className=' font-bold text-lg uppercase text-orange-600'>Shami's Future Doubtful in ornage ?</h1>
                        </div>
                        <div className='flex gap-1 flex-col font-medium text-sm'>
                            <p>With the kind of form shami is having and the price tag he carries it looks difficult to retain shami for next year</p>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default NewsHomeMobile






