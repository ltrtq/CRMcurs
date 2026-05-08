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
    const [commentSearch, setCommentSearch] = useState(''); // Для поиска по истории

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
                // Обработка случая, когда сервер недоступен или заявка удалена
                if (!err.response) {
                    toast.error('Сервер недоступен. Проверьте Docker-контейнеры');
                } else {
                    toast.error('Заявка не найдена');
                }
                navigate('/dashboard');
            }
        };
        loadData();
    }, [id, navigate]);

    // Аналитика для конкретной заявки
    const stats = {
        commentCount: comments.length,
        daysOpen: request ? Math.floor((new Date() - new Date(request.created_at || Date.now())) / (1000 * 60 * 60 * 24)) : 0
    };

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
            // Используем 'content', так как это поле теперь в схеме Prisma
            const res = await api.post('/requests/comments', { 
                request_id: Number(id), 
                content: newComment 
            });
            setComments([...comments, res.data]);
            setNewComment('');
            toast.success('Комментарий добавлен');
        } catch (err) {
            toast.error('Ошибка добавления. Проверьте связь с базой');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Удалить этот комментарий?')) {
            try {
                await api.delete(`/requests/comments/${commentId}`);
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

    // Фильтрация комментариев
    const filteredComments = comments.filter(c => 
        c.content.toLowerCase().includes(commentSearch.toLowerCase())
    );

    if (!request) return <div style={{ padding: '20px' }}>Загрузка данных заявки...</div>;

    const cardStyle = { padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', textAlign: 'center' };

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
                ← Назад к списку заявок
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Заявка №{request.id}</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={cardStyle}>Дней в работе: {stats.daysOpen}</div>
                    <div style={cardStyle}>Всего заметок: {stats.commentCount}</div>
                </div>
            </div>

            <h2 style={{ color: '#333' }}>{request.title}</h2>
            
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <p><strong>Клиент:</strong> {request.client?.name || 'Не указан'} ({request.client?.email || 'нет email'})</p>
                <p><strong>Описание:</strong> {request.description || 'Описания нет'}</p>
                <p><strong>Изменить статус:</strong> 
                    <select 
                        value={request.status} 
                        onChange={(e) => handleStatusChange(e.target.value)}
                        style={{ marginLeft: '10px', padding: '8px', borderRadius: '4px' }}
                    >
                        <option value="NEW">Новая</option>
                        <option value="IN_PROGRESS">В работе</option>
                        <option value="COMPLETED">Завершена</option>
                        <option value="CANCELLED">Отменена</option>
                    </select>
                </p>
            </div>

            <hr style={{ margin: '30px 0', border: '0', borderTop: '2px solid #eee' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>История взаимодействия</h3>
                <input 
                    type="text" 
                    placeholder="Поиск по комментариям..." 
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>
            
            <div style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {filteredComments.length === 0 ? (
                    <p style={{ color: '#888', fontStyle: 'italic' }}>Комментариев не найдено</p>
                ) : (
                    <div className="comments-list">
                        {filteredComments.map(comment => (
                            <div key={comment.id} style={{ borderBottom: '1px solid #eee', padding: '15px 0', backgroundColor: '#fff' }}>
                                <p style={{ margin: '0 0 8px 0', whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <small style={{ color: '#888' }}>
                                        {new Date(comment.created_at).toLocaleString()}
                                    </small>
                                    <div>
                                        <button 
                                            onClick={() => handleEditComment(comment)}
                                            style={{ fontSize: '11px', marginRight: '8px', background: 'none', border: '1px solid #ccc', cursor: 'pointer' }}
                                        >
                                            Изменить
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteComment(comment.id)}
                                            style={{ fontSize: '11px', color: 'red', background: 'none', border: '1px solid #ffcccc', cursor: 'pointer' }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleAddComment} style={{ marginTop: '30px', background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
                <textarea 
                    style={{ width: '100%', height: '100px', padding: '12px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }} 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)} 
                    placeholder="Добавьте новую заметку к этой заявке..."
                    required
                />
                <button 
                    type="submit" 
                    style={{ 
                        marginTop: '12px', 
                        padding: '10px 20px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Сохранить комментарий
                </button>
            </form>
        </div>
    );
};

export default RequestDetails;