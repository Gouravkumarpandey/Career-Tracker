import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PlaceholderPage from './pages/PlaceholderPage';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import AIFeatures from './pages/AIFeatures';
import Planner from './pages/Planner';
import Certifications from './pages/Certifications';
import ResumeBuilder from './pages/ResumeBuilder';
import LearningTracker from './pages/LearningTracker';
import Jobs from './pages/Jobs';
import Internships from './pages/Internships';
import CookieBanner from './components/CookieBanner';


const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        
        <Route path="/signup" element={
          <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
            <Signup />
          </GoogleReCaptchaProvider>
        } />
        
        <Route path="/login" element={
          <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
            <Login />
          </GoogleReCaptchaProvider>
        } />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="learning" element={<LearningTracker />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="internships" element={<Internships />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="ai" element={<AIFeatures />} />
          <Route path="goals" element={<PlaceholderPage title="Goal Management" description="Set and track your daily to long-term goals." />} />
          <Route path="planner" element={<Planner />} />
          <Route path="resume-builder" element={<ResumeBuilder />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" description="Visualize your career data and learning statistics." />} />
          <Route path="notifications" element={<PlaceholderPage title="Notifications" description="Manage your alerts and reminders." />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <CookieBanner />
    </>
  );
}

export default App;
