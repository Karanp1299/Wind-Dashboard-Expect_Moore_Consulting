import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const chatIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const closeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const sendIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

function generateSessionId() {
  return 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36)
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(generateSessionId)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'No response received.' }])
    } catch (err) {
      console.error('Chat API error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to reach AI service. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f87171, #ef4444)',
            border: 'none', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(248, 113, 113, 0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          title="AI Assistant"
        >
          {chatIcon}
        </button>
      )}

      {/* Chat Popup */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 400, height: 540, maxHeight: 'calc(100vh - 56px)',
          background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: 16, display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid #1e293b',
            background: '#020617',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#34d399', boxShadow: '0 0 6px #34d399',
              }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffffeb' }}>AI Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', color: '#64748b',
                cursor: 'pointer', padding: 4, display: 'flex',
                borderRadius: 6, transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              {closeIcon}
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {messages.length === 0 && !loading && (
              <div style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 40 }}>
                Ask anything about the wind turbine dashboard data.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
              }}>
                <div style={{
                  background: m.role === 'user' ? '#1e293b' : '#020617',
                  border: m.role === 'user' ? 'none' : '1px solid #1e293b',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '10px 14px', fontSize: 13, color: '#e2e8f0',
                  lineHeight: 1.5,
                }}>
                  {m.role === 'assistant' ? (
                    <div className="md-chat">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '88%' }}>
                <div style={{
                  background: '#020617', border: '1px solid #1e293b',
                  borderRadius: '14px 14px 14px 4px', padding: '12px 18px',
                  color: '#64748b', fontSize: 13,
                }}>
                  <span style={{ animation: 'pulse 1.5s infinite' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', gap: 8, padding: '12px 14px',
            borderTop: '1px solid #1e293b', background: '#020617',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this dashboard..."
              style={{
                flex: 1, background: '#1e293b', border: '1px solid #334155',
                borderRadius: 10, padding: '10px 14px', color: '#e2e8f0',
                fontSize: 13, outline: 'none',
              }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? '#f87171' : '#334155',
                border: 'none', borderRadius: 10, padding: '0 14px',
                color: '#fff', cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              {sendIcon}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}
