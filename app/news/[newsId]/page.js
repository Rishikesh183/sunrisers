import { getNewsByTitle } from '../../../lib/data/news';

export default async function NewsDetails({ params }) {
    const newsId = decodeURIComponent(params.newsId);
    const newsItem = await getNewsByTitle(newsId);

    if (!newsItem) {
        return <div className="min-h-screen bg-bg text-text flex items-center justify-center">News not found</div>;
    }

    return (
        <div className="w-full min-h-screen bg-bg">
            <div className="bg-surface border-b border-border">
                <h1 className="p-4 font-display text-xl md:text-2xl text-text max-w-3xl mx-auto">{newsItem.title}</h1>
            </div>
            <div className="p-3 w-full md:w-4/5 lg:w-2/5 mx-auto font-medium">
                <img
                    className="h-[30vh] w-full object-cover object-top mb-6 mt-6 rounded-lg shadow-md border border-border"
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                />
                <p className="text-base leading-relaxed text-text">
                    {newsItem.longDesc}
                </p>
            </div>
        </div>
    );
}
