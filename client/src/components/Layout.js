import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex' }}>
      <div className="sidebar">
        <div className="sidebar-logo">ClientFlow</div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
              📋 Заявки
            </Link>
          </li>
          <li>
            <Link to="/clients" className={isActive('/clients') ? 'active' : ''}>
              👥 Клиенты
            </Link>
          </li>
          <li>
            <Link to="/login" onClick={handleLogout} style={{ marginTop: 'auto' }}>
              🚪 Выход
            </Link>
          </li>
        </ul>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;