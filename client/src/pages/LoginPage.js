import React, { useState } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      toast.success('Вход выполнен');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Неверный email или пароль');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#fcf7f8'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        width: '360px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#36283b', marginBottom: '20px' }}>ClientFlow</h2>
        <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>Вход в систему</h3>
        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '15px', marginTop: '5px', padding: '10px 12px' }}
          />
          <label style={{ fontWeight: 500 }}>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '20px', marginTop: '5px', padding: '10px 12px' }}
          />
          <button type="submit" style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#d49ea0',
            color: '#2c1e31',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>Войти</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;