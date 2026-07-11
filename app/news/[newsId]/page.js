import { getNewsByTitle } from '../../../lib/data/news';

export default async function NewsDetails({ params }) {
    const newsId = decodeURIComponent(params.newsId);
    const newsItem = await getNewsByTitle(newsId);

    if (!newsItem) {
        return <div>News not found</div>;
    }

    return (
        <div className="w-full">
            <div className="bg-orange-500">
                <h1 className="p-2 font-bold text-xl md:text-2xl text-white">{newsItem.title}</h1>
            </div>
            <div className="p-3 w-full md:w-4/5 lg:w-2/5 mx-auto font-semibold">
                <img
                    className="h-[30vh] w-full objectcenter object-cover object-top mb-6 rounded-lg shadow-md"
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                />
                <p className="text-base leading-relaxed">
                    {newsItem.longDesc}
                </p>
            </div>
        </div>
    );
}
