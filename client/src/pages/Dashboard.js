import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEye, FiTrash2, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const statusLabels = {
    NEW: 'Новая',
    IN_PROGRESS: 'В работе',
    DONE: 'Завершена',
    CANCELLED: 'Отменена'
  };

  const statusOrder = ['NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

  const filteredRequests = requests.filter(req =>
    (req.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRequests = useMemo(() => {
    if (!sortConfig.key) return filteredRequests;
    const sorted = [...filteredRequests].sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'client') {
        aValue = (a.client?.name || '').toLowerCase();
        bValue = (b.client?.name || '').toLowerCase();
      } else if (sortConfig.key === 'status') {
        aValue = statusOrder.indexOf(a.status);
        bValue = statusOrder.indexOf(b.status);
      } else if (sortConfig.key === 'id') {
        aValue = a.id;
        bValue = b.id;
      } else {
        aValue = (a[sortConfig.key] || '').toLowerCase();
        bValue = (b[sortConfig.key] || '').toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredRequests, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />;
    }
    return null;
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
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            placeholder="Заголовок заявки"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ flex: 2, minWidth: 0 }}
          />
          <select value={clientId} onChange={e => setClientId(e.target.value)} required style={{ flex: 1, minWidth: 0 }}>
            <option value="">Выберите клиента</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea
            placeholder="Описание проблемы"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ flex: 3, minWidth: 0, padding: '10px 12px' }}
          />
          <button type="submit" className="btn-primary" style={{ flex: '0 0 auto' }}>
            Создать заявку
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div className="search-box">
          <FiSearch className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Поиск по заявкам..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px', cursor: 'pointer' }} onClick={() => requestSort('id')}>
                ID {getSortIcon('id')}
              </th>
              <th style={{ width: '35%', cursor: 'pointer' }} onClick={() => requestSort('title')}>
                Заголовок {getSortIcon('title')}
              </th>
              <th style={{ width: '30%', cursor: 'pointer' }} onClick={() => requestSort('client')}>
                Клиент {getSortIcon('client')}
              </th>
              <th style={{ width: '100px', cursor: 'pointer' }} onClick={() => requestSort('status')}>
                Статус {getSortIcon('status')}
              </th>
              <th style={{ width: '80px', textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map(req => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td title={req.title}>{req.title}</td>
                <td title={req.client?.name || `ID: ${req.clientId}`}>
                  <strong>{req.client?.name || `ID: ${req.clientId}`}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {req.client?.email}
                  </div>
                </td>
                <td><span className={getStatusBadge(req.status)}>{statusLabels[req.status] || req.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <Link to={`/requests/${req.id}`} title="Просмотреть" style={{ marginRight: '12px', color: '#7e5a83' }}>
                    <FiEye size={16} />
                  </Link>
                  <button onClick={() => handleDelete(req.id)} title="Удалить" style={{ background: 'none', color: 'var(--badge-red)', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <FiTrash2 size={16} />
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