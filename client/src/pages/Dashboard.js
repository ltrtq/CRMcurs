import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const resReq = await api.get(`/requests?status=${status}&search=${search}`);
      setRequests(resReq.data);
      const resCl = await api.get('/clients');
      setClients(resCl.data);
    } catch (e) {}
  }, [status, search]); // Зависимости функции

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if(!selectedClientId) return toast.error("Выберите клиента!");
    try {
      await api.post('/requests', { title: newTitle, client_id: selectedClientId });
      toast.success("Заявка создана");
      setNewTitle('');
      fetchData();
    } catch (err) {}
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Панель управления</h1>
      
      <form onSubmit={handleCreateRequest} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>Создать новую заявку</h3>
        <input placeholder="Что нужно сделать?" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
        <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} required>
          <option value="">-- Выберите клиента --</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit">Добавить</button>
      </form>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={fetchData}>Найти</button>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      </div>

      <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>ID</th><th>Заголовок</th><th>Клиент</th><th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td><Link to={`/requests/${req.id}`}>{req.title}</Link></td>
              <td>{req.client?.name}</td>
              <td>{req.status}</td>
              <td style={{ display: 'flex', gap: '10px' }}>
  <Link to={`/requests/${req.id}`} className="btn-view">Открыть</Link>
  <button 
    onClick={async () => {
      if (window.confirm('Удалить заявку?')) {
        await api.delete(`/requests/${req.id}`);
        window.location.reload(); // Простой способ обновить список
      }
    }}
    style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px' }}
  >
    Удалить
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;