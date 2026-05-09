import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdAssignment, MdPeople } from 'react-icons/md';
import { FiLogOut, FiMenu } from 'react-icons/fi';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex' }}>
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <FiMenu size={20} />
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">ClientFlow</div>
        <ul className="sidebar-menu">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <MdAssignment size={18} /> Заявки
            </Link>
          </li>
          <li>
            <Link to="/clients" className={isActive('/clients') ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <MdPeople size={18} /> Клиенты
            </Link>
          </li>
          {/* Выход прижат к низу через CSS li:last-child { margin-top: auto } */}
          <li>
            <Link to="/login" onClick={handleLogout}>
              <FiLogOut size={18} /> Выход
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