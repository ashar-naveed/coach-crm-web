import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Messages() {
  const { userId }              = useParams();
  const { user }                = useAuth();
  const navigate                = useNavigate();
  const [messages, setMessages] = useState([]);
  const [clientInfo, setClientInfo] = useState(null);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState('');
  const bottomRef               = useRef(null);

  const load = () =>
    api.get(`/messages/thread.php?user_id=${userId}`)
      .then(res => setMessages(res.data))
      .catch(err => setError(err.message));

  // Load client info for the profile header
  useEffect(() => {
    api.get('/clients/index.php')
      .then(res => {
        const client = res.data.find(c => String(c.user_id) === String(userId));
        setClientInfo(client || null);
      });
  }, [userId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [userId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError('');
    try {
      await api.post('/messages/send.php', {
        receiver_id:  parseInt(userId),
        message_text: trimmed,
      });
      setText('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-SA', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-SA', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.sent_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  if (loading) return <div className="page-loading">Loading messages…</div>;

  return (
    <div className="messages-page">
      {/* Profile header — clickable to open client */}
      <div
        className="messages-profile-header"
        onClick={() => clientInfo && navigate(`/clients/${clientInfo.id}`)}
        style={{ cursor: clientInfo ? 'pointer' : 'default' }}
      >
        <div className="messages-profile-avatar">
          {clientInfo ? clientInfo.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="messages-profile-info">
          <span className="messages-profile-name">{clientInfo?.name || 'Client'}</span>
          {clientInfo && (
            <span className="messages-profile-meta">
              {[clientInfo.job_title, clientInfo.organization].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
        {clientInfo && (
          <span className="messages-profile-link">View Profile →</span>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="messages-thread">
        {Object.keys(grouped).length === 0 && (
          <p className="empty-state empty-state--centered">No messages yet. Send the first one.</p>
        )}

        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="messages-date-divider">{date}</div>
            {msgs.map(msg => {
              const isMine = msg.sender_id === user.id;
              return (
                <div
                  key={msg.id}
                  className={`message-bubble ${isMine ? 'message-bubble--mine' : 'message-bubble--theirs'}`}
                >
                  <p className="message-bubble__text">{msg.message_text}</p>
                  <span className="message-bubble__time">
                    {formatTime(msg.sent_at)}
                    {isMine && (
                      <span className="message-bubble__read">
                        {msg.is_read ? ' ✓✓' : ' ✓'}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="messages-input">
        <textarea
          rows={2}
          placeholder="Write a message… (Enter to send)"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={2000}
          disabled={sending}
        />
        <button
          className="btn btn-primary"
          onClick={send}
          disabled={sending || !text.trim()}
        >
          {sending ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
