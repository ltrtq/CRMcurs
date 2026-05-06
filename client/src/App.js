import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage'; 
import RequestDetails from './pages/RequestDetails';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ children }) => (
  <div>
    <nav style={{ padding: '10px', background: '#222', color: '#fff', display: 'flex', gap: '20px' }}>
      <Link to="/dashboard" style={{ color: '#fff' }}>Заявки</Link>
      <Link to="/clients" style={{ color: '#fff' }}>Клиенты</Link>
      <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Выход</button>
    </nav>
    {children}
  </div>
);

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/clients" element={<Layout><ClientsPage /></Layout>} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
      </Routes>
    </Router>
  );
}

export default App;