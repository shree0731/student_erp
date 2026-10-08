import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  User,
  GraduationCap
} from 'lucide-react';

const QUICK_PROMPTS = [
  "Why is my risk level flagged?",
  "Which subjects am I currently failing?",
  "How can I improve my attendance to clear criteria?"
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

export default function ChatbotWidget({ studentId, studentName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${studentName || 'Student'}! 👋 I am your **Context-Aware Academic Advisor** powered by Astra Retain AI.\n\nI have verified access to your active course marks, CIA internal assessments, Anna University attendance trends, and assigned mentor contact. How can I guide you today?`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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

      const res = await api.sendAdvisorChat(studentId || 'STU_EEC_CSE_Y1_0003', userMsg, history);
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || 'I am reviewing your academic records with your faculty mentor.'
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
        text: `Conversation refreshed. Hello ${studentName || 'Student'}! Feel free to ask about your CIA marks, arrear recovery strategies, or Anna University condonation criteria.`
      }
    ]);
  };

  return (
    <div className="chatbot-widget-container">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Bot size={20} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                  AI Academic Advisor
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={11} /> Gemini 2.5 Flash • Context Active
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={handleResetChat}
                style={{ color: 'white', padding: '4px', opacity: 0.85 }}
                title="Restart Chat"
              >
                <RefreshCw size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: 'white', padding: '4px' }}
                title="Close"
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
              <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', fontSize: '0.825rem' }}>
                <Bot size={16} color="var(--primary)" />
                <span>Analyzing student marks & Anna University regulations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3 Quick Prompts Bar */}
          <div style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Academic Prompts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--primary-light)',
                    border: '1px solid var(--primary-border)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                    e.currentTarget.style.color = 'var(--primary)';
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
              placeholder="Ask about marks, backlogs, attendance..."
              value={inputVal}
              disabled={loading}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.5rem 0.85rem' }}
            >
              <Send size={15} />
            </button>
          </form>

          {/* Safety Disclaimer Banner */}
          <div style={{
            padding: '5px 12px',
            background: 'var(--surface, #f8fafc)',
            borderTop: '1px solid var(--border, #e2e8f0)',
            fontSize: '0.66rem',
            color: 'var(--text-muted, #64748b)',
            textAlign: 'center',
            lineHeight: '1.25'
          }}>
            🛡️ AI academic assistant. Not a substitute for professional counseling or official academic advice.
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="chatbot-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Academic Advisor"
      >
        <Bot size={22} />
        <span>Gemini Advisor</span>
      </button>
    </div>
  );
}
