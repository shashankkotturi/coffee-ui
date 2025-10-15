import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertCircle, TrendingDown } from 'lucide-react';

const CoffeeDemo = () => {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hey there! I'm your AI agent powered by COFFEE. Ask me anything about tools you need, and I'll show you how much we save on tokens.",
      withVisualization: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const calculateTokens = (tools) => {
    const toolDetailsSize = 350;
    const basicDescSize = 50;
    
    const withoutCoffee = tools.length * toolDetailsSize;
    const withCoffee = tools.length * basicDescSize;
    const savings = withoutCoffee - withCoffee;
    const savingsPercent = ((savings / withoutCoffee) * 100).toFixed(1);
    
    return { withoutCoffee, withCoffee, savings, savingsPercent };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://coffee-router-production.up.railway.app/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, top_k: 5 })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const tools = data.tools || [];
      
      if (tools.length === 0) throw new Error('No tools found');
      const tokenMetrics = calculateTokens(tools);

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `I found ${tools.length} relevant tools for your query. Here's the efficiency breakdown:`,
        withVisualization: true,
        tools,
        tokens: tokenMetrics
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `Error: ${err.message}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #78350f 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    header: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderBottom: '1px solid rgba(217, 119, 6, 0.3)',
      padding: '1rem 1.5rem',
      backdropFilter: 'blur(10px)',
    },
    headerContent: {
      maxWidth: '56rem',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#fef3c7',
    },
    headerSubtitle: {
      fontSize: '0.875rem',
      color: '#fcd34d',
    },
    chatContainer: {
      flex: 1,
      overflowY: 'auto',
      maxWidth: '56rem',
      margin: '0 auto',
      width: '100%',
      padding: '2rem 1.5rem',
    },
    messageGroup: {
      marginBottom: '1.5rem',
      display: 'flex',
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    assistantMessage: {
      justifyContent: 'flex-start',
    },
    messageBubble: {
      maxWidth: '32rem',
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    },
    userBubble: {
      background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      color: 'white',
      borderBottomRightRadius: '0.25rem',
    },
    assistantBubble: {
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#78350f',
      borderBottomLeftRadius: '0.25rem',
    },
    errorBubble: {
      background: '#fee2e2',
      color: '#7f1d1d',
      border: '1px solid #fca5a5',
      borderBottomLeftRadius: '0.25rem',
    },
    tokensSection: {
      marginTop: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    tokenBar: {
      marginBottom: '1rem',
    },
    tokenLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '600',
    },
    barContainer: {
      width: '100%',
      height: '0.75rem',
      background: '#d1d5db',
      borderRadius: '9999px',
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: '9999px',
      transition: 'width 0.8s ease-out',
    },
    savingsBadge: {
      background: 'linear-gradient(135deg, #dcfce7 0%, #ccfbf1 100%)',
      border: '2px solid #10b981',
      borderRadius: '0.75rem',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    savingsIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '9999px',
      background: 'linear-gradient(135deg, #4ade80 0%, #14b8a6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
    },
    savingsText: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#059669',
    },
    toolsList: {
      marginTop: '1.5rem',
    },
    toolsTitle: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#4b5563',
      marginBottom: '0.75rem',
    },
    toolItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#f9fafb',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      marginBottom: '0.5rem',
    },
    toolName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
    },
    toolScore: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    loadingBubble: {
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#78350f',
      borderBottomLeftRadius: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    inputArea: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderTop: '1px solid rgba(217, 119, 6, 0.3)',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
    },
    inputWrapper: {
      maxWidth: '56rem',
      margin: '0 auto',
      width: '100%',
    },
    inputGroup: {
      display: 'flex',
      gap: '0.75rem',
    },
    input: {
      flex: 1,
      background: 'rgba(255, 255, 255, 0.9)',
      color: '#78350f',
      border: 'none',
      borderRadius: '1rem',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      outline: 'none',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    },
    inputFocus: {
      outline: '2px solid #fbbf24',
    },
    button: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '1rem',
      padding: '0.75rem 1.5rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s',
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      }
    },
    hint: {
      color: '#fcd34d',
      fontSize: '0.75rem',
      marginTop: '0.75rem',
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ fontSize: '2rem' }}>☕</div>
          <div>
            <div style={styles.headerTitle}>COFFEE Framework</div>
            <div style={styles.headerSubtitle}>Context Offloading for Efficient Enterprise</div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div style={styles.chatContainer}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{...styles.messageGroup, ...(msg.type === 'user' ? styles.userMessage : styles.assistantMessage)}}>
            <div style={{...styles.messageBubble, ...(msg.type === 'user' ? styles.userBubble : msg.isError ? styles.errorBubble : styles.assistantBubble)}}>
              {msg.isError && <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <AlertCircle size={20} />
              </div>}
              <p style={{marginBottom: msg.withVisualization ? '1rem' : 0}}>{msg.content}</p>

              {msg.withVisualization && msg.tokens && (
                <div style={styles.tokensSection}>
                  {/* Without COFFEE */}
                  <div style={styles.tokenBar}>
                    <div style={{...styles.tokenLabel, color: '#dc2626'}}>
                      <span>Without COFFEE</span>
                      <span>{msg.tokens.withoutCoffee} tokens</span>
                    </div>
                    <div style={styles.barContainer}>
                      <div style={{...styles.barFill, background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', width: '100%'}} />
                    </div>
                  </div>

                  {/* With COFFEE */}
                  <div style={styles.tokenBar}>
                    <div style={{...styles.tokenLabel, color: '#16a34a'}}>
                      <span>With COFFEE</span>
                      <span>{msg.tokens.withCoffee} tokens</span>
                    </div>
                    <div style={styles.barContainer}>
                      <div style={{...styles.barFill, background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', width: `${(msg.tokens.withCoffee / msg.tokens.withoutCoffee) * 100}%`}} />
                    </div>
                  </div>

                  {/* Savings Badge */}
                  <div style={styles.savingsBadge}>
                    <div style={styles.savingsIcon}>
                      <TrendingDown size={24} />
                    </div>
                    <div>
                      <div style={{fontSize: '0.875rem', color: '#4b5563'}}>Token Savings</div>
                      <div style={styles.savingsText}>{msg.tokens.savingsPercent}%</div>
                      <div style={{fontSize: '0.875rem', color: '#047857', marginTop: '0.5rem'}}>
                        <strong>{msg.tokens.savings} fewer tokens</strong> required
                      </div>
                    </div>
                  </div>

                  {/* Tools */}
                  <div style={styles.toolsList}>
                    <div style={styles.toolsTitle}>Top Tools Found</div>
                    {msg.tools.map(tool => (
                      <div key={tool.id} style={styles.toolItem}>
                        <span style={styles.toolName}>{tool.name}</span>
                        <div style={styles.toolScore}>
                          <div style={{width: '5rem', height: '0.5rem', background: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden'}}>
                            <div style={{background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', height: '100%', width: `${tool.score * 100}%`}} />
                          </div>
                          <span style={{fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', width: '2.5rem', textAlign: 'right'}}>
                            {(tool.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{...styles.messageGroup, ...styles.assistantMessage}}>
            <div style={{...styles.messageBubble, ...styles.loadingBubble}}>
              <Loader size={16} style={{animation: 'spin 1s linear infinite'}} />
              <span>Processing your query with COFFEE...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me about the tools you need..."
              style={styles.input}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{...styles.button, ...(loading || !input.trim() ? styles.button.disabled : {})}}
            >
              <Send size={16} />
            </button>
          </div>
          <div style={styles.hint}>Try asking: "I need to search for code repositories"</div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CoffeeDemo;