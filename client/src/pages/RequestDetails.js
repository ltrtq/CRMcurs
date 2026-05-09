import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import { FiSearch, FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSearch, setCommentSearch] = useState('');

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

  const stats = {
    commentCount: comments.length,
    daysOpen: request ? Math.floor((new Date() - new Date(request.createdAt || Date.now())) / (1000 * 60 * 60 * 24)) : 0
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/requests/${id}`, { status: newStatus });
      setRequest({ ...request, status: newStatus });
      toast.success('Статус изменён');
    } catch (err) { toast.error('Ошибка обновления статуса'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post('/requests/comments', {
        text: newComment,
        requestId: Number(id)
      });
      setComments([...comments, res.data]);
      setNewComment('');
      toast.success('Комментарий добавлен');
    } catch (err) { toast.error('Ошибка добавления комментария'); }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Удалить комментарий?')) {
      try {
        await api.delete(`/requests/comments/${commentId}`);
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Комментарий удалён');
      } catch (err) { toast.error('Не удалось удалить'); }
    }
  };

  const handleEditComment = async (comment) => {
    const newText = prompt('Редактировать:', comment.text);
    if (!newText || newText === comment.text) return;
    try {
      const res = await api.put(`/requests/comments/${comment.id}`, { text: newText });
      setComments(comments.map(c => c.id === comment.id ? res.data : c));
      toast.success('Комментарий изменён');
    } catch (err) { toast.error('Ошибка редактирования'); }
  };

  const filteredComments = comments.filter(c =>
    c.text.toLowerCase().includes(commentSearch.toLowerCase())
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

  if (!request) return <div style={{ padding: '30px' }}>Загрузка...</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-outline" style={{ marginBottom: '20px', padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FiArrowLeft size={14} /> Назад
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--text-heading)' }}>Заявка №{request.id}</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="stat-card"><span className="stat-number">{stats.daysOpen}</span><span className="stat-label">Дней в работе</span></div>
          <div className="stat-card"><span className="stat-number">{stats.commentCount}</span><span className="stat-label">Всего заметок</span></div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '12px', color: 'var(--text-heading)' }}>{request.title}</h2>
        <p><strong>Клиент:</strong> {request.client?.name || 'Не указан'} ({request.client?.email})</p>
        <p><strong>Описание:</strong> {request.description || 'Описания нет'}</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong>Изменить статус:</strong>
          <select value={request.status} onChange={e => handleStatusChange(e.target.value)}>
            <option value="NEW">Новая</option>
            <option value="IN_PROGRESS">В работе</option>
            <option value="DONE">Завершена</option>
            <option value="CANCELLED">Отменена</option>
          </select>
          <span className={getStatusBadge(request.status)}>{statusLabels[request.status] || request.status}</span>
        </p>
      </div>

      <hr style={{ margin: '25px 0', border: '0', borderTop: '1px solid var(--border)' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: 'var(--text-heading)' }}>История взаимодействия</h3>
        <div className="search-box">
          <FiSearch className="search-icon" size={16} />
          <input type="text" placeholder="Поиск по комментариям..." value={commentSearch} onChange={e => setCommentSearch(e.target.value)} />
        </div>
      </div>

      {filteredComments.length === 0 && <p style={{ color: '#999', fontStyle: 'italic' }}>Комментариев не найдено</p>}
      {filteredComments.map(comment => (
        <div key={comment.id} className="card" style={{ padding: '15px', marginBottom: '10px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <small style={{ color: 'var(--text-muted)' }}>{new Date(comment.createdAt).toLocaleString()}</small>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleEditComment(comment)}
                title="Редактировать"
                style={{ background: 'none', border: 'none', color: '#7e5a83', cursor: 'pointer', padding: '2px' }}
              >
                <FiEdit2 size={18} />
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                title="Удалить"
                style={{ background: 'none', border: 'none', color: '#c96b6b', cursor: 'pointer', padding: '2px' }}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{comment.text}</p>
        </div>
      ))}

      <form onSubmit={handleAddComment} className="card" style={{ marginTop: '20px' }}>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Добавьте новую заметку..."
          required
          style={{ width: '100%', marginBottom: '12px' }}
        />
        <button type="submit" className="btn-primary">Сохранить комментарий</button>
      </form>
    </div>
  );
};

export default RequestDetails;