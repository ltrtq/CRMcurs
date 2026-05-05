import React, { useState } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      alert('Вход выполнен!');
      navigate('/dashboard'); // Переходим на главную после входа
    } catch (error) {
      alert('Ошибка входа: ' + (error.response?.data?.error || 'Сервер недоступен'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <h2>ClientFlow CRM</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Войти</button>
      </form>
    </div>
  );
};

export default LoginPage;