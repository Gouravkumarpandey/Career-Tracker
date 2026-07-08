import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
      
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="learning" element={<PlaceholderPage title="Learning Tracker" description="Track your courses, notes, and learning hours." />} />
        <Route path="jobs" element={<PlaceholderPage title="Job Tracker" description="Manage your job applications and interviews." />} />
        <Route path="internships" element={<PlaceholderPage title="Internship Tracker" description="Manage your internship applications and statuses." />} />
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
  );
}

export default App;
