import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import api from '../config/api';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);

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

  return (
    <div className="dashboard-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header userProfile={userProfile} onLogout={handleLogout} />
      <main className="dashboard-content" style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet context={{ userProfile, refreshProfile: fetchProfile }} />
      </main>
    </div>
  );
};

export default DashboardLayout;
