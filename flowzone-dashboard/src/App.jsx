import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upgrade from './pages/Upgrade';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const AuthSyncListener = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data) return;
      const type = e.data.type;
      
      if (type === 'FLOWZONE_SYNC_SESSION_DONE' || type === 'TABFLOW_SYNC_SESSION_DONE') {
        const token = localStorage.getItem('token');
        if (token && (location.pathname === '/login' || location.pathname === '/register')) {
          navigate('/dashboard');
        }
      }

      if (type === 'FLOWZONE_LOGOUT_EVENT' || type === 'TABFLOW_LOGOUT_EVENT' || type === 'FLOWZONE_LOGOUT_DONE') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (location.pathname === '/dashboard' || location.pathname === '/upgrade') {
          navigate('/login');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, location]);

  return null;
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to='/login'/>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthSyncListener />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }/>
        <Route path="/upgrade" element={
          <PrivateRoute>
            <Upgrade />
          </PrivateRoute>
        }/>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}