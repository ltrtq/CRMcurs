import React, { useState } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
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
      background: 'var(--bg)'
    }}>
      <div className="card" style={{ width: '360px', padding: '30px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--text-heading)', marginBottom: '20px' }}>
          ClientFlow
        </h2>
        <h3 style={{ textAlign: 'center', marginBottom: '25px' }}>Вход в систему</h3>
        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: 500 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '15px', marginTop: '5px' }}
          />
          <label style={{ fontWeight: 500 }}>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '20px', marginTop: '5px' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Войти</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Нет аккаунта? <a href="/register" style={{ color: 'var(--accent)' }}>Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
};

export default Login;