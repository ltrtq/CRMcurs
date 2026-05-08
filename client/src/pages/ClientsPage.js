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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cliRes, reqRes] = await Promise.all([
                api.get('/clients'),
                api.get('/requests')
            ]);
            setClients(cliRes.data);
            setAllRequests(reqRes.data);
        } catch (err) {
            toast.error('Ошибка загрузки данных');
        }
    };

    const stats = {
        total: clients.length,
        withEmail: clients.filter(c => c.email && c.email.includes('@')).length,
        withPhone: clients.filter(c => c.phone && c.phone.length > 5).length
    };

    const cardStyle = {
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#f9f9f9'
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
                toast.success('Клиент удален');
            } catch (err) {
                toast.error('Ошибка удаления');
            }
        }
    };

    const handleEditClient = async (client) => {
        const newName = prompt("Новое ФИО:", client.name);
        if (!newName) return;
        try {
            const res = await api.put(`/clients/${client.id}`, { ...client, name: newName });
            setClients(clients.map(c => c.id === client.id ? res.data : c));
            toast.success('Обновлено');
        } catch (err) {
            toast.error('Ошибка обновления');
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <h1>База клиентов</h1>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={cardStyle}>Всего клиентов: {stats.total}</div>
                <div style={{...cardStyle, color: '#007bff'}}>С почтой: {stats.withEmail}</div>
                <div style={{...cardStyle, color: '#28a745'}}>С телефоном: {stats.withPhone}</div>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px' }}>
                <h3>Добавить нового клиента</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
                    <input placeholder="ФИО" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <input placeholder="+375XXXXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <button type="submit">Создать клиента</button>
                </form>
            </div>

            <input
                type="text" placeholder="Поиск по имени или email..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ marginBottom: '15px', padding: '8px', width: '300px' }}
            />

            <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th width="40"></th>
                        <th width="50">ID</th>
                        <th style={{ padding: '10px' }}>Имя</th>
                        <th>Телефон</th>
                        <th>Email</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredClients.map(c => {
                        const clientRequests = allRequests.filter(r => r.clientId === c.id);  // <-- ИСПРАВЛЕНО
                        const isExpanded = expandedClientId === c.id;

                        return (
                            <React.Fragment key={c.id}>
                                <tr>
                                    <td onClick={() => toggleExpand(c.id)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                                        {isExpanded ? '▼' : '▶'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{c.id}</td>
                                    <td style={{ padding: '10px' }}>{c.name}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.email}</td>
                                    <td>
                                        <button onClick={() => handleEditClient(c)} style={{ marginRight: '5px' }}>Ред.</button>
                                        <button onClick={() => handleDelete(c.id, c.name)} style={{ color: 'red' }}>Удалить</button>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr style={{ backgroundColor: '#fff9e6' }}>
                                        <td colSpan="6" style={{ padding: '15px 40px' }}>
                                            <strong>История заявок:</strong>
                                            {clientRequests.length === 0 ? <p>Заявок не найдено</p> : (
                                                <ul>
                                                    {clientRequests.map(req => (
                                                        <li key={req.id} style={{ marginBottom: '8px' }}>
                                                            #{req.id} {req.title} — <strong>{req.status}</strong>
                                                            <button onClick={() => navigate(`/requests/${req.id}`)} style={{ marginLeft: '15px', fontSize: '10px' }}>
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
    );
};

export default Clients;