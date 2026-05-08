import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [reqRes, comRes] = await Promise.all([
                    api.get(`/requests/${id}`),
                    api.get(`/requests/${id}/comments`)
                ]);
                setRequest(reqRes.data);
                setComments(comRes.data);
            } catch (err) {
                toast.error('Заявка не найдена');
                navigate('/dashboard');
            }
        };
        loadData();
    }, [id, navigate]);

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/requests/${id}`, { status: newStatus });
            setRequest({ ...request, status: newStatus });
            toast.success('Статус изменен');
        } catch (err) {
            toast.error('Ошибка обновления статуса');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/requests/comments', { request_id: id, content: newComment });
            setComments([...comments, res.data]);
            setNewComment('');
            toast.success('Комментарий добавлен');
        } catch (err) {
            toast.error('Ошибка комментария');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Удалить этот комментарий?')) {
            try {
                await api.delete(`/requests/comments/${commentId}`);
                // Фильтруем список комментариев в стейте
                setComments(comments.filter(com => com.id !== commentId));
                toast.success('Комментарий удален');
            } catch (err) {
                toast.error('Не удалось удалить комментарий');
            }
        }
    };
    
    const handleEditComment = async (comment) => {
        const newContent = prompt("Редактировать комментарий:", comment.content);
        if (!newContent || newContent === comment.content) return;
    
        try {
            const res = await api.put(`/requests/comments/${comment.id}`, { content: newContent });
            setComments(comments.map(com => com.id === comment.id ? res.data : com));
            toast.success('Комментарий изменен');
        } catch (err) {
            toast.error('Ошибка при редактировании');
        }
    };

    if (!request) return <div>Загрузка...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate('/dashboard')}>← Назад к списку</button>
            <h1>Заявка №{request.id}</h1>
            <h2>{request.title}</h2>
            
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
                <p><strong>Клиент:</strong> {request.client?.name} ({request.client?.email})</p>
                <p><strong>Описание:</strong> {request.description || 'Описания нет'}</p>
                <p><strong>Текущий статус:</strong> 
                    <select 
                        value={request.status} 
                        onChange={(e) => handleStatusChange(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="NEW">Новая</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="COMPLETED">Завершена</option>
                        <option value="CANCELLED">Отменена</option>
                    </select>
                </p>
            </div>

            <hr />
            <h3>История (Комментарии)</h3>
            <div style={{ marginBottom: '20px' }}>
                {comments.map(c => (
                    <div className="comments-list">
                        {comments.map(comment => (
                            <div key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                <p>{comment.content}</p>
                                <small>{new Date(comment.created_at).toLocaleString()}</small>
                                <div style={{ marginTop: '5px' }}>
                                    <button 
                                        onClick={() => handleEditComment(comment)}
                                        style={{ fontSize: '12px', marginRight: '10px' }}
                                    >
                                        Изменить
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteComment(comment.id)}
                                        style={{ fontSize: '12px', color: 'red' }}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <form onSubmit={handleAddComment}>
                <textarea 
                    style={{ width: '100%', height: '80px' }} 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)} 
                    placeholder="Введите текст комментария..."
                    required
                />
                <button type="submit">Отправить комментарий</button>
            </form>
        </div>
    );
};

export default RequestDetails;