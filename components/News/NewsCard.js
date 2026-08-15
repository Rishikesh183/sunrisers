import Link from 'next/link';

const NewsCard = ({ data }) => {
    return (
        <Link
            href={`/news/${encodeURIComponent(data.title)}`}
            className="block bg-surface border border-border rounded-xl hover:border-accent/40 hover:bg-surfaceHover transition-colors duration-300 cursor-pointer overflow-hidden
                       w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl
                       mx-auto mb-4 sm:mb-6"
        >
            <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                <img
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src={data.imageUrl}
                    alt="News thumbnail"
                />
            </div>

            <div className="p-4 sm:p-5 md:p-6">
                <h1 className="font-display text-lg sm:text-xl md:text-2xl text-text mb-2 sm:mb-3
                              line-clamp-2 hover:text-accent transition-colors duration-200">
                    {data.title || "News Title"}
                </h1>

                <p className="text-sm sm:text-base text-textMuted leading-relaxed line-clamp-3">
                    {data.description || "News Description"}
                </p>
            </div>
        </Link>
    );
};

export default NewsCard;
