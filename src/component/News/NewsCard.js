import React from 'react'

const NewsCard = ({ data }) => {
    return (
        <>  
            <div className='flex h-[16vh] pl-8 pt-4 gap-6 w-full m-auto bg-slate-50 border-2 border-gray-100'>
                <div className='w-[10vw]'>
                    <img className='w-[12vw] h-[12vh] rounded-xl object-cover items-center justify-center' src={data.Image} alt="Logo" />
                </div>
                <div className=' text-lg gap-3 flex flex-col'>
                    <div>
                        <h1 className='font-bold text-xl overflow-auto uppercase text-orange-600'>{data.Title || "News Title"}</h1>
                    </div>
                    <div className='flex gap-1 overflow-auto flex-col font-medium text-xl'>
                        <p>{data.Desc || "News Description"} </p>
                    </div>
                </div>
            </div>
        </>

    )
}

export default NewsCard
