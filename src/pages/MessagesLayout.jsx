import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const POLL_INTERVAL = 3000;

export default function MessagesLayout() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [convos, setConvos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const selectedRef = useRef(null);
  const pollRef = useRef(null);

  const isCoach = user?.role === "coach" || user?.role === "admin";

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // Load conversation list (with last message + unread counts)
  const loadConvos = useCallback(() => {
    return api.get("/messages/conversations.php").then((res) => {
      const list = res.data || [];
      setConvos(list);
      return list;
    });
  }, []);

  // Load messages for the selected conversation
  const loadMessages = useCallback((uid) => {
    return api
      .get(`/messages/thread.php?user_id=${uid}`)
      .then((res) => setMessages(res.data || []));
  }, []);

  // Initial load
  useEffect(() => {
    loadConvos()
      .then((list) => {
        if (userId) {
          const found = list.find((c) => String(c.user_id) === String(userId));
          if (found) {
            setSelected(found);
            selectedRef.current = found;
          }
        } else if (!isCoach && list.length > 0) {
          setSelected(list[0]);
          selectedRef.current = list[0];
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Load messages when selection changes
  useEffect(() => {
    if (!selected) return;
    navigate(`/messages/${selected.user_id}`, { replace: true });
    // Instantly clear the badge
    window.dispatchEvent(new Event("messages-read"));
    api.get(`/messages/thread.php?user_id=${selected.user_id}`).then((res) => {
      setMessages(res.data || []);
      // Mark as read in DB in background
      api
        .post("/messages/mark-read.php", { sender_id: selected.user_id })
        .catch(() => {});
    });
  }, [selected]);

  // Polling — refresh convos + active thread
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadConvos();
      if (selectedRef.current) {
        loadMessages(selectedRef.current.user_id);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [loadConvos, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConvo = (convo) => {
    setSelected(convo);
    selectedRef.current = convo;
    setMessages([]);
  };

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !selected) return;
    setSending(true);
    try {
      await api.post("/messages/send.php", {
        receiver_id: parseInt(selected.user_id),
        message_text: trimmed,
      });
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      await Promise.all([loadMessages(selected.user_id), loadConvos()]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (dt) =>
    new Date(dt).toLocaleTimeString("en-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatSidebarTime = (dt) => {
    if (!dt) return "";
    const d = new Date(dt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString("en-SA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-SA", { month: "short", day: "numeric" });
  };

  const formatDate = (dt) => {
    const d = new Date(dt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-SA", { month: "short", day: "numeric" });
  };

  const filtered = convos.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.organization || "").toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = messages.reduce((acc, msg) => {
    const date = formatDate(msg.sent_at);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const totalUnread = convos.reduce(
    (sum, c) => sum + (parseInt(c.unread_count) || 0),
    0,
  );

  return (
    <div className="msg-layout">
      {/* Left sidebar */}
      <div className="msg-sidebar">
        <div className="msg-sidebar__header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3>Messages</h3>
            {totalUnread > 0 && (
              <span className="msg-unread-badge">{totalUnread}</span>
            )}
          </div>
        </div>
        <div className="msg-sidebar__search">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="msg-sidebar__list">
          {loading && <div className="msg-sidebar__loading">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="msg-sidebar__empty">No conversations found.</div>
          )}
          {filtered.map((convo) => {
            const unread = parseInt(convo.unread_count) || 0;
            const isActive = selected?.user_id === convo.user_id;
            return (
              <div
                key={convo.user_id}
                className={`msg-convo-row ${isActive ? "msg-convo-row--active" : ""}`}
                onClick={() => selectConvo(convo)}
              >
                <div className="msg-convo-avatar">
                  {convo.name.charAt(0).toUpperCase()}
                </div>
                <div className="msg-convo-info">
                  <div className="msg-convo-top">
                    <span
                      className={`msg-convo-name ${unread > 0 ? "msg-convo-name--unread" : ""}`}
                    >
                      {convo.name}
                    </span>
                    <span className="msg-convo-time">
                      {formatSidebarTime(convo.last_message_at)}
                    </span>
                  </div>
                  <div className="msg-convo-bottom">
                    <span
                      className={`msg-convo-preview ${unread > 0 ? "msg-convo-preview--unread" : ""}`}
                    >
                      {convo.last_message ||
                        [convo.job_title, convo.organization]
                          .filter(Boolean)
                          .join(" · ") ||
                        "No messages yet"}
                    </span>
                    {unread > 0 && (
                      <span className="msg-unread-count">{unread}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right chat area */}
      {selected ? (
        <div className="msg-chat">
          <div
            className="msg-chat__header"
            onClick={() => isCoach && navigate(`/clients/${selected.id}`)}
            style={{ cursor: isCoach ? "pointer" : "default" }}
          >
            <div className="msg-convo-avatar msg-convo-avatar--lg">
              {selected.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="msg-chat__name">{selected.name}</div>
              <div className="msg-chat__meta">
                {[selected.job_title, selected.organization]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            {isCoach && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.8rem",
                  color: "var(--primary)",
                }}
              >
                View Profile →
              </span>
            )}
          </div>

          <div className="msg-chat__body">
            {Object.keys(grouped).length === 0 && (
              <div className="msg-empty">No messages yet. Say hello 👋</div>
            )}
            {Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <div className="msg-date-divider">{date}</div>
                {msgs.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`msg-row ${isMine ? "msg-row--mine" : "msg-row--theirs"}`}
                    >
                      {!isMine && (
                        <div className="msg-bubble-avatar">
                          {selected.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="msg-bubble-wrap">
                        <div
                          className={`msg-bubble ${isMine ? "msg-bubble--mine" : "msg-bubble--theirs"}`}
                        >
                          {msg.message_text}
                        </div>
                        <div
                          className={`msg-time ${isMine ? "msg-time--mine" : ""}`}
                        >
                          {formatTime(msg.sent_at)}
                          {isMine && (
                            <span
                              className={
                                msg.is_read
                                  ? "msg-tick msg-tick--read"
                                  : "msg-tick"
                              }
                            >
                              {msg.is_read ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                      {isMine && (
                        <div className="msg-bubble-avatar msg-bubble-avatar--mine">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="msg-chat__input">
            <textarea
              ref={textareaRef}
              placeholder="Write a message… (Enter to send, Shift+Enter for newline)"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKey}
              rows={1}
              disabled={sending}
            />
            <button
              className="msg-send-btn"
              onClick={send}
              disabled={sending || !text.trim()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="msg-empty-state">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-muted)" }}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
}
