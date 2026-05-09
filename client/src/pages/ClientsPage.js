import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClientId, setExpandedClientId] = useState(null);

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
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
          <input placeholder="ФИО" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ flex: 2 }} />
          <input placeholder="+375XXXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ flex: 1 }} />
          <input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ flex: 1 }} />
          <button type="submit" className="btn-primary">Создать клиента</button>
        </form>
      </div>

      <div className="search-box" style={{ marginBottom: '20px' }}>
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Поиск по имени или email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '30px' }}></th>
              <th>ID</th>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => {
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
                      <button onClick={() => handleEditClient(client)} className="btn-outline" style={{ marginRight: '6px', padding: '4px 10px', fontSize: '0.8rem' }}>Ред.</button>
                      <button onClick={() => handleDelete(client.id, client.name)} className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Удалить</button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ backgroundColor: '#fdf5f7' }}>
                      <td colSpan="6" style={{ padding: '15px 30px' }}>
                        <strong>История заявок:</strong>
                        {clientRequests.length === 0 ? (
                          <p style={{ color: '#999', fontStyle: 'italic', marginTop: '8px' }}>Заявок не найдено</p>
                        ) : (
                          <ul style={{ listStyle: 'none', marginTop: '8px' }}>
                            {clientRequests.map(req => (
                              <li key={req.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>#{req.id} {req.title} — <span className={getStatusBadge(req.status)}>{req.status}</span></span>
                                <button onClick={() => navigate(`/requests/${req.id}`)} style={{ fontSize: '11px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                  Перейти к заявке →
                                </button>
                              </li>
                            ))}
                          </ul>
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

export default Clients;