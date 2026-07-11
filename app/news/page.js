import NewsCard from '../../components/News/NewsCard';
import { getNews } from '../../lib/data/news';
import '../../styles/NewsMain.css';

export default async function NewsMain() {
    const news = await getNews();

    return (
        <div className="news-main-container">
            <div className="news-header w-full">
                <h2 className="news-title">Orange Chronicles: Keeping Up with the Risers</h2>
                <p className="news-subtitle">Stay updated with the latest news on SRH</p>
            </div>
            <div className="news-grid">
                {news.map(item => (
                    <NewsCard key={item.id} data={item} />
                ))}
            </div>
        </div>
    );
}
