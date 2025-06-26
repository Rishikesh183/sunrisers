import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <BrowserRouter>  {/* ✅ Move Router here */}
      <App />
    </BrowserRouter>
  </ClerkProvider>
);

reportWebVitals();
