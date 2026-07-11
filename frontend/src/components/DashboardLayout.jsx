import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../config/api';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await api.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        userProfile={userProfile} 
        onLogout={handleLogout}
      />
      <div className="dashboard-main">
        <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />
        <main className="dashboard-content">
          <Outlet context={{ userProfile, refreshProfile: fetchProfile }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
