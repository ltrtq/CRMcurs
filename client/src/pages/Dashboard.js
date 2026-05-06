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

    useEffect(() => {
        loadData();
    }, []);

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
    try {
        // Отправляем title, client_id И description
        await api.post('/requests', { 
            title, 
            client_id: clientId, 
            description 
        });
        setTitle('');
        setDescription(''); // Очищаем поле после создания
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
                toast.success('Удалено');
            } catch (err) {
                toast.error('Ошибка удаления');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Управление заявками</h2>
            
            <form onSubmit={handleCreate} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input 
                    placeholder="Заголовок заявки" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    style={{ flex: 2 }}
                />
                <select 
                    value={clientId} 
                    onChange={(e) => setClientId(e.target.value)} 
                    required
                    style={{ flex: 1 }}
                >
                    <option value="">-- Выберите клиента --</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <textarea 
                  placeholder="Описание проблемы" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ flex: 3, padding: '5px' }}
                />
                <button type="submit">Создать заявку</button>
            </form>

            <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
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
                            <td><strong>{req.client?.name || `ID: ${req.client_id}`}</strong></td>
                            <td>{req.status}</td>
                            <td>
                                <Link to={`/requests/${req.id}`} style={{ marginRight: '10px' }}>Открыть</Link>
                                <button onClick={() => handleDelete(req.id)} style={{ color: 'red', cursor: 'pointer' }}>Удалить</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;