import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';

const STUDENT_QUICK_PROMPTS = [
  "Why is my risk level flagged?",
  "Which subjects am I currently failing?",
  "How can I improve my attendance to clear criteria?",
  "Can you schedule a meeting with my faculty mentor?"
];

const MENTOR_QUICK_PROMPTS = [
  "Which students in my cohort have <75% attendance?",
  "Show my upcoming and pending mentee meetings",
  "Summarize high-risk students needing support",
  "How do I schedule a counseling session?"
];

// Helper to render basic markdown (bold, lists, paragraphs) cleanly without heavy external deps
function formatMarkdown(text) {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Bold replacement: **text** -> <strong>text</strong>
    const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <li
          key={idx}
          style={{ marginLeft: '1.25rem', marginBottom: '0.25rem' }}
          dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s+/, '') }}
        />
      );
    }
    if (/^\d+\.\s+/.test(line.trim())) {
      return (
        <div
          key={idx}
          style={{ marginLeft: '0.5rem', marginBottom: '0.35rem' }}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    }
    if (!line.trim()) {
      return <div key={idx} style={{ height: '0.5rem' }} />;
    }
    return (
      <p
        key={idx}
        style={{ marginBottom: '0.35rem', lineHeight: '1.55' }}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

export default function ChatbotWidget({ studentId, studentName, role, user }) {
  const isMentor = role === 'mentor' || role === 'faculty';
  const quickPrompts = isMentor ? MENTOR_QUICK_PROMPTS : STUDENT_QUICK_PROMPTS;

  const getGreeting = () => isMentor
    ? `Hello ${user?.name || 'Professor'}! 👋 I am Baymate, your AI Faculty & Mentorship Copilot.\n\nI can help you review your mentee roster, identify students with <75% attendance or backlogs, check your upcoming counseling meetings and schedules, and summarize cohort health. How can I assist you today?`
    : `Hello ${studentName || user?.name || 'Student'}! 👋 I am Baymate, your AI academic advisor.\n\nI have verified access to your active course marks, CIA internal assessments, Anna University attendance trends, and assigned mentor contact. How can I guide you today?`;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: getGreeting()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Resizable & Adjustable Dimensions State
  const [dimensions, setDimensions] = useState(() => {
    try {
      const saved = localStorage.getItem('baymate_widget_size');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.width && parsed.height) return parsed;
      }
    } catch (e) {}
    return { width: 400, height: 560 };
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 400, height: 560, handle: 'corner' });

  const handleResizeStart = (e, handleType = 'corner') => {
    e.preventDefault();
    e.stopPropagation();
    if (isMaximized) return;
    isResizingRef.current = true;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
      handle: handleType
    };
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const deltaX = resizeStartRef.current.x - moveEvent.clientX; // moving left expands width
      const deltaY = resizeStartRef.current.y - moveEvent.clientY; // moving up expands height

      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;

      if (resizeStartRef.current.handle === 'corner' || resizeStartRef.current.handle === 'left') {
        newWidth = Math.min(Math.max(340, resizeStartRef.current.width + deltaX), window.innerWidth - 48);
      }
      if (resizeStartRef.current.handle === 'corner' || resizeStartRef.current.handle === 'top') {
        newHeight = Math.min(Math.max(420, resizeStartRef.current.height + deltaY), window.innerHeight - 80);
      }

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        setDimensions(latest => {
          try {
            localStorage.setItem('baymate_widget_size', JSON.stringify(latest));
          } catch (e) {}
          return latest;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Update greeting when role or user changes
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: getGreeting()
      }
    ]);
  }, [role, user?.name, studentName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSendMessage = async (textToSend) => {
    const userMsg = (textToSend || inputVal).trim();
    if (!userMsg || loading) return;

    // Append user message
    const updatedMessages = [...messages, { sender: 'user', text: userMsg }];
    setMessages(updatedMessages);
    setInputVal('');
    setLoading(true);

    try {
      // Build conversation history for API
      const history = updatedMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const targetId = isMentor ? null : (studentId || 'STU_EEC_CSE_Y1_0003');
      const res = await api.sendAdvisorChat(targetId, userMsg, history);
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || (isMentor ? 'I am analyzing your cohort data and schedules.' : 'I am reviewing your academic records with your faculty mentor.')
        }
      ]);
    } catch (err) {
      console.error('Chatbot request failed:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **Advisory Notice:** Unable to contact the advisor engine temporarily (${err.message}). Please ensure your backend and Gemini credentials are active.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: isMentor
          ? `Conversation refreshed. Hello Professor! Feel free to ask about your upcoming meetings, attendance alerts (<75%), or cohort risk summaries.`
          : `Conversation refreshed. Hello ${studentName || 'Student'}! Feel free to ask about your CIA marks, arrear recovery strategies, or Anna University condonation criteria.`
      }
    ]);
  };

  return (
    <div className="chatbot-widget-container">
      {isOpen && (
        <div
          className="chatbot-window"
          style={{
            width: isMaximized ? 'min(860px, calc(100vw - 36px))' : `${dimensions.width}px`,
            maxWidth: 'calc(100vw - 32px)',
            height: isMaximized ? 'min(840px, calc(100vh - 90px))' : `${dimensions.height}px`,
            maxHeight: 'calc(100vh - 90px)',
            position: 'relative'
          }}
        >
          {/* Resize handles */}
          {!isMaximized && (
            <>
              {/* Top-Left Corner Drag Handle */}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'corner')}
                title="Drag to resize Baymate chat"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '24px',
                  height: '24px',
                  cursor: 'nwse-resize',
                  zIndex: 25,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: '4px',
                  opacity: 0.75,
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.75'}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="2.5" cy="2.5" r="1.5" fill="#ffffff" />
                  <circle cx="7" cy="2.5" r="1.5" fill="#ffffff" />
                  <circle cx="2.5" cy="7" r="1.5" fill="#ffffff" />
                  <line x1="2" y1="10" x2="10" y2="2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                </svg>
              </div>

              {/* Left Edge Resize Handle */}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'left')}
                title="Drag to resize width"
                style={{
                  position: 'absolute',
                  top: '24px',
                  left: 0,
                  bottom: 0,
                  width: '6px',
                  cursor: 'ew-resize',
                  zIndex: 20
                }}
              />

              {/* Top Edge Resize Handle */}
              <div
                onMouseDown={(e) => handleResizeStart(e, 'top')}
                title="Drag to resize height"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '24px',
                  right: 0,
                  height: '6px',
                  cursor: 'ns-resize',
                  zIndex: 20
                }}
              />
            </>
          )}

          {/* Header with Gradient Band & 64px Mascot Ring */}
          <div
            className="chatbot-header"
            onDoubleClick={() => setIsMaximized(!isMaximized)}
            title="Double-click header to maximize or restore"
            style={{ cursor: 'pointer', padding: '1.15rem 1.25rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                border: '3px solid #ffffff',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.22)',
                flexShrink: 0
              }}>
                <img
                  src="/baymate.png"
                  alt="Baymate"
                  style={{ width: '92%', height: '92%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Baymate <span style={{ fontSize: '0.78rem', fontWeight: '600', opacity: 0.9 }}>{isMentor ? 'Faculty Copilot' : 'AI Advisor'}</span>
                </div>
                <div style={{ fontSize: '0.74rem', opacity: 0.92, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', color: '#FAF5FF' }}>
                  <Sparkles size={12} /> {isMentor ? 'Gemini 2.5 Flash • Faculty Mode Active' : 'Gemini 2.5 Flash • Academic Mode Active'}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleResetChat}
                style={{ color: 'white', padding: '5px', opacity: 0.9, background: 'transparent', border: 'none', cursor: 'pointer' }}
                title="Restart Chat"
                aria-label="Restart Chat"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                style={{ color: 'white', padding: '5px', opacity: 0.9, background: 'transparent', border: 'none', cursor: 'pointer' }}
                title={isMaximized ? "Restore Default Size" : "Maximize Chat"}
                aria-label={isMaximized ? "Restore Default Size" : "Maximize Chat"}
              >
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ color: 'white', padding: '5px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                title="Close Baymate"
                aria-label="Close Baymate"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="chatbot-body">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={m.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}
              >
                {formatMarkdown(m.text)}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mute)', fontSize: '0.825rem' }}>
                <img
                  src="/baymate.png"
                  alt="Baymate"
                  style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'contain' }}
                />
                <span>{isMentor ? 'Baymate is analyzing mentee records, meeting schedules & cohort metrics...' : 'Baymate is reviewing your academic records with Anna University statutes...'}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar with Ghost Buttons */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isMentor ? 'Quick Faculty Advisory Prompts' : 'Quick Academic Prompts'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSendMessage(prompt)}
                  className="btn btn-ghost"
                  style={{
                    textAlign: 'left',
                    borderRadius: 'var(--radius-pill)',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    color: 'var(--primary)',
                    borderColor: 'var(--line)',
                    background: 'var(--soft)'
                  }}
                >
                  ⚡ {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chatbot-footer"
          >
            <input
              type="text"
              className="input-control"
              style={{ flex: 1, fontSize: '0.85rem' }}
              placeholder={isMentor ? 'Ask about mentee risk, upcoming meetings, attendance alerts, schedules...' : 'Ask about marks, backlogs, attendance, mentor meetings...'}
              value={inputVal}
              disabled={loading}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.5rem 0.85rem' }}
              aria-label="Send message to Baymate"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Safety Disclaimer Banner */}
          <div style={{
            padding: '5px 12px',
            background: 'var(--bg)',
            borderTop: '1px solid var(--line)',
            fontSize: '0.66rem',
            color: 'var(--mute)',
            textAlign: 'center',
            lineHeight: '1.25'
          }}>
            🛡️ AI academic assistant. Not a substitute for professional counseling or official academic advice. Immediate crisis support: Tele-MANAS (14416) | KIRAN (1800-599-0019).
          </div>
        </div>
      )}

      {/* Floating Action Launcher Pill (Hidden while chat view is open) */}
      {!isOpen && (
        <button
          className="chatbot-launcher-pill"
          onClick={() => setIsOpen(true)}
          title="Open Baymate Chat"
          aria-label="Open Baymate Chat"
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.16)',
            flexShrink: 0
          }}>
            <img
              src="/baymate.png"
              alt="Baymate"
              style={{ width: '92%', height: '92%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#FFFFFF' }}>Baymate</div>
            <div style={{ fontSize: '0.7rem', color: '#F3E8FF', opacity: 0.95 }}>
              Ask me anything
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
