import React from 'react'

const NewsHomeMobile = () => {
    return (
        <>
            <div className='flex border-b-1 border-gray-200 '>
                <div className='flex justify-between p-2 w-full'>Top Stories</div>
            </div>
            <div className='flex w-full'>
                <div className='flex flex-col p-4 pt-6 gap-6 w-full border-2 border-gray-100'>
                    <div className='w-full'>
                        <img className='w-[90vw] m-auto rounded-xl object-cover items-center justify-center' src="https://static.tnn.in/thumb/msid-109168042,thumbsize-43388,width-1280,height-720,resizemode-75/109168042.jpg?quality=100" alt="" />
                    </div>
                    <div className='flex flex-col pb-3'>
                        <div>
                            <h1 className='text-balance font-bold text-lg uppercase text-orange-600'>surprising Retentions for srh</h1>
                        </div>
                        <div className='flex gap-1 text-sm flex-col font-normal overflow-auto '>
                            <p>Klassen will be Retained at SRH at 23cr</p>
                            <p>Captain Pat will be retained at 18cr </p>
                            <p>Abhishek is all set for 14cr </p>
                        </div>
                    </div>
                </div>
            </div>


            <div className='flex border-b-1 border-gray-200'>
                <div className='flex justify-between p-2 w-full'>Risers News For You</div>
            </div>

            <div className='flex flex-col'>
                <div className='flex flex-col p-6 pt-2 gap-2 border-2 border-gray-100 bg-slate-50 w-full'>
                    <div className='w-full h-[20vh]'>
                        <img className='w-[90vw] h-[20vh] m-auto rounded-xl object-cover object-[0_30%] items-center justify-center' src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_800,q_50/lsci/db/PICTURES/CMS/388700/388751.jpg" alt="" />
                    </div>
                    <div className=' gap-0 flex flex-col overflow-auto'>
                        <div>
                            <h1 className=' font-bold text-lg uppercase text-orange-600'>NKR to australia</h1>
                        </div>
                        <div className='flex gap-1 flex-col font-medium text-sm'>
                            <p>NKR likely to travel to Australia as pace bowling all rounder</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex flex-col '>
                <div className='flex flex-col p-6 pt-2 gap-2 border-2 border-gray-100 bg-slate-50 w-full'>
                    <div className='w-full h-[20vh]'>
                        <img className='w-[90vw] h-[20vh] m-auto rounded-xl object-cover object-[0_30%] items-center justify-center' src="https://media.ahmedabadmirror.com/am/uploads/mediaGallery/image/1616855803220.jpg-org" alt="" />
                    </div>
                    <div className=' gap-0 flex flex-col'>
                        <div>
                            <h1 className=' font-bold text-lg uppercase text-orange-600'>Lone Warrior Washi</h1>
                        </div>
                        <div className='flex gap-1 flex-col font-medium text-sm'>
                            <p>11 Wickets in the match! Sundar proves his worth a steller performance</p>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default NewsHomeMobile






