import React, { useState } from 'react';

const LearningBot = ({ userEmail }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello ${userEmail ? userEmail.split('@')[0] : 'there'}! I'm your AI learning assistant. I'm here to help you with your studies! 🤖💡`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response for now
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm still learning and developing my capabilities. This is a placeholder response while the full AI integration is being implemented. Soon I'll be able to help you with coding questions, explain concepts, and provide personalized learning guidance!"
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Learning Bot 🤖
        </h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
          Your AI-powered learning companion
        </p>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        background: '#f8fafc'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '12px 16px',
              borderRadius: '18px',
              background: message.type === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'white',
              color: message.type === 'user' ? 'white' : '#374151',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px',
              background: 'white',
              color: '#6b7280',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about programming, math, or your studies..."
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '120px',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '22px',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: '1.5'
            }}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              padding: '12px 20px',
              background: inputMessage.trim() && !isLoading
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#e5e7eb',
              color: inputMessage.trim() && !isLoading ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '22px',
              cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Send
          </button>
        </div>
        
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          💡 Tip: Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LearningBot;
