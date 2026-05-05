import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Состояния для нового клиента
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const getClients = async () => {
    const res = await api.get('/clients');
    setClients(res.data);
  };

  useEffect(() => {
    getClients();
  }, []);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', { name: newName, phone: newPhone, email: newEmail });
      toast.success('Клиент создан!');
      setNewName(''); setNewPhone(''); setNewEmail('');
      getClients(); // Обновляем список
    } catch (err) {
      // Ошибка обработается интерцептором
    }
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>База клиентов</h1>
      
      {/* ФОРМА СОЗДАНИЯ (Восстановлено) */}
      <form onSubmit={handleCreateClient} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Добавить нового клиента</h3>
        <input placeholder="ФИО" value={newName} onChange={e => setNewName(e.target.value)} required style={{ marginRight: '10px' }} />
        <input placeholder="Телефон" value={newPhone} onChange={e => setNewPhone(e.target.value)} required style={{ marginRight: '10px' }} />
        <input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{ marginRight: '10px' }} />
        <button type="submit">Создать клиента</button>
      </form>

      <input 
        type="text" 
        placeholder="Быстрый поиск..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px', padding: '10px', width: '300px' }}
      />

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>ID</th><th>Имя</th><th>Телефон</th><th>Email</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.phone}</td><td>{c.email}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsPage;