import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { toast } from 'react-toastify';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (err) {
            toast.error('Ошибка загрузки клиентов');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const { name, phone, email } = formData;
        
        // 1. Проверка имени (не пустое)
        if (name.trim().length < 2) {
            return toast.error('Введите корректное ФИО');
        }
    
        // 2. Проверка телефона (+375 и далее цифры, всего 12-13 символов)
        const phoneRegex = /^\+375\d{9}$/; 
        if (!phoneRegex.test(phone)) {
            return toast.error('Телефон должен быть в формате +375XXXXXXXXX (9 цифр после кода)');
        }
    
        // 3. Проверка Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return toast.error('Введите корректный Email адрес');
        }
    
        try {
            await api.post('/clients', formData);
            setFormData({ name: '', phone: '', email: '' });
            loadClients();
            toast.success('Клиент успешно добавлен');
        } catch (err) {
            // Если бэкенд вернет ошибку (например, такой email уже есть)
            toast.error(err.response?.data?.error || 'Ошибка при сохранении');
        }
    };

    const handleDelete = async (id, name) => {
        // Формируем сообщение для пользователя
        const confirmMessage = `ВНИМАНИЕ! Вы хотите удалить клиента "${name}".\n\n` + 
                               `Это действие ПРИВЕДЕТ К УДАЛЕНИЮ всех его заявок и истории переписки.\n` +
                               `Вы уверены, что хотите продолжить?`;

        if (window.confirm(confirmMessage)) {
            try {
                await api.delete(`/clients/${id}`);
                setClients(clients.filter(c => c.id !== id));
                toast.success('Клиент и все связанные данные удалены');
            } catch (err) {
                toast.error('Ошибка при удалении');
            }
        }
    };

    const handleEditClient = async (client) => {
        const newName = prompt("Введите новое ФИО:", client.name);
        if (!newName) return;

        try {
            const res = await api.put(`/clients/${client.id}`, { ...client, name: newName });
            setClients(clients.map(c => c.id === client.id ? res.data : c));
            toast.success('Данные обновлены');
        } catch (err) {
            toast.error('Ошибка обновления');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>База клиентов</h1>
            
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>Добавить нового клиента</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px' }}>
                    <input placeholder="ФИО" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    <input placeholder="Телефон" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <button type="submit">Создать клиента</button>
                </form>
            </div>

            <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Телефон</th>
                        <th>Email</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(c => (
                        <tr key={c.id}>
                            <td>{c.id}</td>
                            <td>{c.name}</td>
                            <td>{c.phone}</td>
                            <td>{c.email}</td>
                            <td>
                                <button onClick={() => handleEditClient(c)} style={{marginRight: '5px'}}>
                                    Редактировать
                                </button>
                                
                                <button onClick={() => handleDelete(c.id, c.name)}>
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

export default Clients;