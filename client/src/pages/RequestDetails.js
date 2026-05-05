import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';

const RequestDetails = () => {
  const { id } = useParams();
  console.log("ID из URL:", id);
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const loadData = async () => {
  try {
    // Number(id) уберет любые лишние символы, если они вдруг прилетели из URL
    const cleanId = Number(id); 
    
    const res = await api.get(`/requests/${cleanId}`);
    setRequest(res.data);
    
    const resCom = await api.get(`/requests/${cleanId}/comments`);
    setComments(resCom.data);
  } catch (e) {
    console.error("Ошибка в loadData:", e);
  }
  };

  useEffect(() => { loadData(); }, [id]);

  const addComment = async () => {
    if(!text) return;
    await api.post('/requests/comments', { text, request_id: id });
    setText('');
    loadData();
    toast.success("Комментарий добавлен");
  };

  if (!request) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)}>← Назад</button>
      <h2>Заявка #{request.id}</h2>
      <p><b>Тема:</b> {request.title}</p>
      <p><b>Клиент:</b> {request.client?.name}</p>
      <p><b>Статус:</b> {request.status}</p>
      <hr />
      <h3>История / Комментарии</h3>
      {comments.map(c => (
        <div key={c.id} style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
          <small>{new Date(c.created_at).toLocaleString()}</small>
          <p>{c.text}</p>
        </div>
      ))}
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Напишите что-нибудь..." />
      <br />
      <button onClick={addComment}>Отправить</button>
    </div>
  );
};

export default RequestDetails;