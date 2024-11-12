import React from 'react'

const NewsHome = () => {
    return (
        <>
            {/*News haeding*/}
            <div className='flex border-b-2 border-gray-200'>
                <div className='flex justify-between p-2 px-8 w-[62vw]'>Top Stories</div>
                <div className='flex justify-between p-2 px-8'>Risers News For You</div>
            </div>
            {/* news */}
            <div className='flex bg-red-50 h-[30vh]'>
                <div className='flex h-[30vh]  pl-8 pt-6 gap-6 bg-slate-50 w-[62vw] border-2 border-gray-100'>
                    <div className='w-[20vw] h-[22vh]'>
                        <img className='w-[30vw] h-[22vh] rounded-xl object-cover items-center justify-center' src="https://static.tnn.in/thumb/msid-109168042,thumbsize-43388,width-1280,height-720,resizemode-75/109168042.jpg?quality=100" alt="" />
                    </div>
                    <div className=' text-lg gap-3 flex flex-col'>
                        <div>
                            <h1 className='text-center font-bold text-3xl uppercase text-orange-600'>surprising Retentions for srh</h1>
                        </div>
                        <div className='flex gap-1 flex-col font-medium text-xl'>
                            <p>Klassen will be the first Retention For SRH at 23cr</p>
                            <p>Captain Pat will be retained at 18cr </p>
                            <p>Abhishek is all set for 14cr </p>
                            <p>Head and NKR Could be Remaining 2 Retentions</p>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col'>
                    <div className='flex h-[16vh] pl-8 pt-2 gap-2 border-2 border-gray-100 bg-slate-50 w-[38vw]'>
                        <div className='w-[10vw] h-[10vh]'>
                            <img className='w-[10vw] h-[12vh] rounded-xl object-cover items-center justify-center' src="https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_800,q_50/lsci/db/PICTURES/CMS/388700/388751.jpg" alt="" />
                        </div>
                        <div className=' text-lg gap-0 flex flex-col'>
                            <div>
                                <h1 className=' font-bold text-xl uppercase text-orange-600'>NKR to australia</h1>
                            </div>
                            <div className='flex gap-1 flex-col font-medium text-xl'>
                                <p>NKR likely to travel to Australia as pace bowling all rounder</p>
                            </div>
                        </div>
                    </div>
                    <div className='flex h-[14vh] pl-8 pt-2 gap-2 border-2 border-gray-100 bg-slate-50 w-[38vw]'>
                        <div className='w-[10vw] h-[10vh]'>
                            <img className='w-[10vw] h-[12vh] rounded-xl object-cover items-center justify-center' src="https://media.ahmedabadmirror.com/am/uploads/mediaGallery/image/1616855803220.jpg-org" alt="" />
                        </div>
                        <div className=' text-lg gap-0 flex flex-col'>
                            <div>
                                <h1 className=' font-bold text-xl uppercase text-orange-600'>Sundar for Remaining Tests</h1>
                            </div>
                            <div className='flex gap-1 flex-col font-medium text-xl'>
                                <p>Washington sundar has been added to the 2nd and 3rd test vs nz</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewsHome
