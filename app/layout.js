import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthProvider } from '../lib/auth/AuthProvider';
import ProfileGate from '../components/Auth/ProfileGate';
import Navbar from '../components/Navbar';
import PageLoader from '../components/PageLoader';
import FollowUs from '../components/Follow/FollowUs';
import Footer from '../components/Follow/Footer';
import PendingScoreSaver from '../components/Game/PendingScoreSaver';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Srh',
  description: 'Sunrisers Hyderabad fan site',
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className="bg-bg text-text">
          <div className="app min-h-screen bg-bg">
            <PageLoader />
            <ProfileGate />
            <PendingScoreSaver />
            <FollowUs />
            <Navbar />
            {children}
            <Footer />
          </div>
          <Analytics />
        </body>
      </html>
    </AuthProvider>
  );
}
