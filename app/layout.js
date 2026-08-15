import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Srh',
  description: 'Sunrisers Hyderabad fan site',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className="bg-bg text-text">
          <div className="app min-h-screen bg-bg">
            <Navbar />
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
