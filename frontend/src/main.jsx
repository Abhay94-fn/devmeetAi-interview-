import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import AuthContext from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder'}>
      <BrowserRouter>
        <AuthContext>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15,15,30,0.97)',
                color: '#fff',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                backdropFilter: 'blur(16px)',
              },
            }}
          />
        </AuthContext>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
