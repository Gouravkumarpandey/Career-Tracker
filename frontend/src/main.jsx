import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from './App.jsx'
import './index.css'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleReCaptchaProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
