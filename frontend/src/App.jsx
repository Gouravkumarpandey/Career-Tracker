import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PlaceholderPage from './pages/PlaceholderPage';

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
        <Route path="profile" element={<PlaceholderPage title="User Profile" description="Manage your personal information and resume." />} />
        <Route path="learning" element={<PlaceholderPage title="Learning Tracker" description="Track your courses, notes, and learning hours." />} />
        <Route path="jobs" element={<PlaceholderPage title="Job Tracker" description="Manage your job applications and interviews." />} />
        <Route path="internships" element={<PlaceholderPage title="Internship Tracker" description="Manage your internship applications." />} />
        <Route path="certifications" element={<PlaceholderPage title="Certifications" description="Track and verify your professional certificates." />} />
        <Route path="ai" element={<PlaceholderPage title="AI Features" description="Leverage AI for resume review and career chat." />} />
        <Route path="goals" element={<PlaceholderPage title="Goal Management" description="Set and track your daily to long-term goals." />} />
        <Route path="planner" element={<PlaceholderPage title="Planner" description="Organize your schedule with calendars and to-do lists." />} />
        <Route path="gamification" element={<PlaceholderPage title="Gamification" description="View your XP, levels, and achievements." />} />
        <Route path="analytics" element={<PlaceholderPage title="Analytics" description="Visualize your career data and learning statistics." />} />
        <Route path="notifications" element={<PlaceholderPage title="Notifications" description="Manage your alerts and reminders." />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" description="Configure your dashboard preferences and account." />} />
      </Route>
    </Routes>
  );
}

export default App;
