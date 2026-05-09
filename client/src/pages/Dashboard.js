import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [reqRes, cliRes] = await Promise.all([
        api.get('/requests'),
        api.get('/clients')
      ]);
      setRequests(reqRes.data);
      setClients(cliRes.data);
    } catch (err) {
      toast.error('Ошибка загрузки данных');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!clientId) return toast.warning('Выберите клиента');
    if (!title.trim()) return toast.warning('Введите заголовок');
    try {
      await api.post('/requests', {
        title,
        clientId: Number(clientId),
        description
      });
      setTitle('');
      setDescription('');
      setClientId('');
      loadData();
      toast.success('Заявка создана');
    } catch (err) {
      toast.error('Ошибка при создании');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить заявку?')) {
      try {
        await api.delete(`/requests/${id}`);
        setRequests(requests.filter(r => r.id !== id));
        toast.success('Заявка удалена');
      } catch (err) {
        toast.error('Ошибка удаления');
      }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      NEW: 'badge-new',
      IN_PROGRESS: 'badge-progress',
      DONE: 'badge-done',
      CANCELLED: 'badge-cancelled'
    };
    return `badge ${map[status] || 'badge-new'}`;
  };

  return (
    <div>
      <h1 style={{ fontSize: '26px', color: 'var(--text-heading)', marginBottom: '20px' }}>
        Управление заявками
      </h1>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-number">{requests.length}</span>
          <span className="stat-label">Всего заявок</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{requests.filter(r => r.status === 'IN_PROGRESS').length}</span>
          <span className="stat-label">В работе</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{requests.filter(r => r.status === 'DONE').length}</span>
          <span className="stat-label">Завершено</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '15px' }}>Новая заявка</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            placeholder="Заголовок заявки"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ flex: 2 }}
          />
          <select value={clientId} onChange={e => setClientId(e.target.value)} required style={{ flex: 1 }}>
            <option value="">Выберите клиента</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea
            placeholder="Описание проблемы"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ flex: 3, padding: '10px 12px' }}
          />
          <button type="submit" className="btn-primary" style={{ flex: '0 0 auto' }}>
            Создать заявку
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Поиск по заявкам..." />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Заголовок</th>
              <th>Клиент</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.title}</td>
                <td>
                  <strong>{req.client?.name || `ID: ${req.clientId}`}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {req.client?.email}
                  </div>
                </td>
                <td><span className={getStatusBadge(req.status)}>{req.status}</span></td>
                <td>
                  <Link to={`/requests/${req.id}`} style={{ marginRight: '12px', color: 'var(--accent)', textDecoration: 'none' }}>
                    👁️
                  </Link>
                  <button onClick={() => handleDelete(req.id)} style={{ background: 'none', color: 'var(--badge-red)', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;