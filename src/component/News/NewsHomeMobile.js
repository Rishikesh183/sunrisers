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
                        <img className='w-[90vw] m-auto rounded-xl object-cover items-center justify-center' src="https://static.tnn.in/thumb/msid-109168042,thumbsize-43388,width-1280,height-720,resizemode-75/109168042.jpg?quality=100" alt="" />
                    </div>
                    <div className='flex flex-col pb-3'>
                        <div>
                            <h1 className="font-bold text-lg uppercase text-orange-600">
                                Abki baar 300 paar?
                            </h1>
                        </div>
                        <div className='flex gap-1 text-sm flex-col font-semibold overflow-auto '>
                            <p>Srh aiming for 300 this year </p>
                            <p>Kishan makes batting more explosive</p>
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
                                Ishan Mania in Srh
                            </h1>
                        </div>
                        <div className='flex gap-1 flex-col font-medium'>
                            <p className="text-black text-base font-medium">
                                Ishan kishan's starts with firey knocks in practice matches , Adds more power to risers batting
                            </p>
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
                            <h1 className=' font-bold text-lg uppercase text-orange-600'>Meet & Greet with SRH </h1>
                        </div>
                        <div className='flex gap-1 flex-col font-medium text-sm'>
                            <p>Risers are all set to meet with fans on 22nd march at Daspally convention</p>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default NewsHomeMobile






