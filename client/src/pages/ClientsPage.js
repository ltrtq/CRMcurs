import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit2, FiTrash2, FiArrowRight, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cliRes, reqRes] = await Promise.all([
        api.get('/clients'),
        api.get('/requests')
      ]);
      setClients(cliRes.data);
      setAllRequests(reqRes.data);
    } catch (err) { toast.error('Ошибка загрузки данных'); }
  };

  const stats = {
    total: clients.length,
    withEmail: clients.filter(c => c.email && c.email.includes('@')).length,
    withPhone: clients.filter(c => c.phone && c.phone.length > 5).length
  };

  const toggleExpand = (id) => {
    setExpandedClientId(expandedClientId === id ? null : id);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const { name, phone, email } = formData;
    if (name.trim().length < 2) return toast.error('Введите корректное ФИО');
    if (!/^\+375\d{9}$/.test(phone)) return toast.error('Формат: +375XXXXXXXXX');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error('Некорректный Email');
    try {
      await api.post('/clients', formData);
      setFormData({ name: '', phone: '', email: '' });
      loadData();
      toast.success('Клиент добавлен');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Удалить клиента "${name}" и его заявки?`)) {
      try {
        await api.delete(`/clients/${id}`);
        setClients(clients.filter(c => c.id !== id));
        toast.success('Клиент удалён');
      } catch (err) { toast.error('Ошибка удаления'); }
    }
  };

  const handleEditClient = async (client) => {
    const newName = prompt("Новое ФИО:", client.name);
    if (!newName) return;
    try {
      const res = await api.put(`/clients/${client.id}`, { ...client, name: newName });
      setClients(clients.map(c => c.id === client.id ? res.data : c));
      toast.success('Обновлено');
    } catch (err) { toast.error('Ошибка обновления'); }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedClients = useMemo(() => {
    if (!sortConfig.key) return filteredClients;
    const sorted = [...filteredClients].sort((a, b) => {
      let aValue, bValue;
      if (sortConfig.key === 'id') {
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
  }, [filteredClients, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />;
    }
    return null;
  };

  return (
    <div>
      <h1 style={{ fontSize: '26px', color: 'var(--text-heading)', marginBottom: '20px' }}>База клиентов</h1>

      <div className="stat-cards">
        <div className="stat-card"><span className="stat-number">{stats.total}</span><span className="stat-label">Всего клиентов</span></div>
        <div className="stat-card"><span className="stat-number">{stats.withEmail}</span><span className="stat-label">С почтой</span></div>
        <div className="stat-card"><span className="stat-number">{stats.withPhone}</span><span className="stat-label">С телефоном</span></div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>Добавить нового клиента</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input placeholder="ФИО" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ flex: 2 }} />
          <input placeholder="+375XXXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ flex: 1 }} />
          <input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ flex: 1 }} />
          <button type="submit" className="btn-primary">Создать клиента</button>
        </form>
      </div>

      <div className="search-box" style={{ marginBottom: '20px'}}>
        <FiSearch className="search-icon" size={16} />
        <input type="text" placeholder="Поиск по имени или email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '30px' }}></th>
              <th style={{ cursor: 'pointer' }} onClick={() => requestSort('id')}>
                ID {getSortIcon('id')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => requestSort('name')}>
                Имя {getSortIcon('name')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => requestSort('phone')}>
                Телефон {getSortIcon('phone')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => requestSort('email')}>
                Email {getSortIcon('email')}
              </th>
              <th style={{ width: '80px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.map(client => {
              const clientRequests = allRequests.filter(r => r.clientId === client.id);
              const isExpanded = expandedClientId === client.id;
              return (
                <React.Fragment key={client.id}>
                  <tr>
                    <td onClick={() => toggleExpand(client.id)} style={{ cursor: 'pointer', textAlign: 'center', fontSize: '0.8rem' }}>
                      {isExpanded ? '▼' : '▶'}
                    </td>
                    <td>{client.id}</td>
                    <td style={{ fontWeight: 500 }}>{client.name}</td>
                    <td>{client.phone}</td>
                    <td>{client.email}</td>
                    <td>
                      <button
                        onClick={() => handleEditClient(client)}
                        title="Редактировать"
                        style={{ background: 'none', border: 'none', color: '#7e5a83', cursor: 'pointer', marginRight: '8px', padding: '4px' }}
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        title="Удалить"
                        style={{ background: 'none', border: 'none', color: '#c96b6b', cursor: 'pointer', padding: '4px' }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ backgroundColor: '#fdf5f7' }}>
                      <td colSpan="6" style={{ padding: '20px 30px' }}>
                        <strong style={{ display: 'block', marginBottom: '12px' }}>История заявок:</strong>
                        {clientRequests.length === 0 ? (
                          <p style={{ color: '#999', fontStyle: 'italic' }}>Заявок не найдено</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {clientRequests.map(req => (
                              <div key={req.id} style={{ background: 'white', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>#{req.id}</span>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.title}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                  <span className={getStatusBadge(req.status)}>{statusLabels[req.status] || req.status}</span>
                                  <button
                                    onClick={() => navigate(`/requests/${req.id}`)}
                                    title="Перейти к заявке"
                                    style={{ fontSize: '0.8rem', color: '#7e5a83', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
                                  >
                                    <FiArrowRight size={14} /> Перейти
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsPage;