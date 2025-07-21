import React, { useState } from 'react';
import './Chatbot.css';
import { FaRobot, FaMicrophone, FaPaperclip, FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { type: 'user', text: input, timestamp: currentTime };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/post-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });

      const data = await response.json();
      const botResponse = data.response || 'Sorry, something went wrong.';
      const botMessage = {
        type: 'model',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: '⚠️ Failed to connect to the AI assistant. Please try again later.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="header">
        <FaRobot className="icon" />
        <div>
          <h2>FinanceAI Assistant</h2>
          <p>Online • Financial Advisory AI</p>
        </div>
      </div>

      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <p>{msg.text}</p>
            <span>{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="message bot">
            <p>Thinking...</p>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        <div className="quick-actions">
          <button onClick={() => setInput('Give me a market analysis')}>📈 Market Analysis</button>
          <button onClick={() => setInput('Review my portfolio')}>💼 Portfolio Review</button>
          <button onClick={() => setInput('Assess my investment risk')}>📊 Risk Assessment</button>
          <button onClick={() => setInput('Suggest asset allocation')}>⏱️ Asset Allocation</button>
        </div>
      </div>

      <div className="input-area">
        <FaPaperclip className="input-icon" />
        <FaMicrophone className="input-icon" />
        <input
          type="text"
          placeholder="Ask me anything about finance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;