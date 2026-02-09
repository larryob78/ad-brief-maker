import { useState, useRef, useEffect } from 'react';
import { analyzeBrief } from '../api/client';

export default function ChatStep({
  characterDescription,
  worldType,
  styleType,
  onProduceReady,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Great choices! Your character is locked, world is set to **${worldType?.replace('_', ' ')}**, and style is **${styleType}**.\n\nTell me about your ad — what's the product, the mood, the story? I'll craft a cinematic shot list for your 30-second spot.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await analyzeBrief(
        userMsg,
        characterDescription,
        worldType,
        styleType,
        history
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: res.content }]);

      // Check if response contains a shot list
      if (
        res.content.toLowerCase().includes('shot 1') ||
        res.content.toLowerCase().includes('shot list')
      ) {
        onProduceReady(userMsg, res.content);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Connection issue — let me try that again. What's your ad concept?",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="step-container chat-container fade-in">
      <div className="step-header">
        <span className="step-number">04</span>
        <h2>Brief Your Director</h2>
        <span className="agent-badge">Claude Opus 4.6</span>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="chat-message-header">
              {msg.role === 'assistant' ? '🎬 Director' : '👤 You'}
            </div>
            <div className="chat-message-content">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="chat-message-header">🎬 Director</div>
            <div className="chat-message-content typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Describe your ad concept..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={loading}
        />
        <button className="btn btn-send" onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
