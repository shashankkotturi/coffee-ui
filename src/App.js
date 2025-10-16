import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertCircle, TrendingDown, Brain } from 'lucide-react';

const CoffeeAgentDemo = () => {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: "Hey! I'm your AI agent powered by COFFEE and Gemini. I'll intelligently analyze your query and find exactly the right tools you need.",
      withVisualization: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [allToolDefs, setAllToolDefs] = useState([]);
  const messagesEndRef = useRef(null);

  // Your Railway backend URL
  const BACKEND_URL = 'https://coffee-router-production.up.railway.app';

  useEffect(() => {
    const fetchAllTools = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/all-tools`);
        const data = await response.json();
        setAllToolDefs(data.tools || []);
      } catch (err) {
        console.error('Failed to fetch all tools:', err);
      }
    };
    fetchAllTools();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const calculateTokens = (returnedTools) => {
    const CHARS_PER_TOKEN = 4;
    
    const withoutCoffee = allToolDefs.reduce((sum, tool) => {
      return sum + (tool.description.length / CHARS_PER_TOKEN);
    }, 0);
    
    const withCoffee = returnedTools.reduce((sum, tool) => {
      return sum + (tool.description.length / CHARS_PER_TOKEN);
    }, 0);
    
    const savings = withoutCoffee - withCoffee;
    const savingsPercent = withoutCoffee > 0 ? ((savings / withoutCoffee) * 100).toFixed(1) : 0;
    
    return { 
      withoutCoffee: Math.round(withoutCoffee), 
      withCoffee: Math.round(withCoffee), 
      savings: Math.round(savings), 
      savingsPercent 
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      // Call the backend agent endpoint
      const response = await fetch(`${BACKEND_URL}/agent-route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      if (!response.ok) {
        throw new Error(`Agent error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.tools || data.tools.length === 0) {
        throw new Error('No relevant tools found');
      }

      const tokenMetrics = calculateTokens(data.tools);

      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.explanation,
        withVisualization: true,
        tools: data.tools,
        tokens: tokenMetrics,
        agentReasoning: data.reasoning,
        intentSummary: data.intent_summary
      }]);
    } catch (err) {
      console.error('Agent error:', err);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `Error: ${err.message}. Please try again or rephrase your query.`,
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
    agentThinking: {
      background: '#fef3c7',
      border: '1px solid #fbbf24',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      marginTop: '1rem',
      fontSize: '0.875rem',
      color: '#92400e',
    },
    thinkingTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
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
    },
    hint: {
      color: '#fcd34d',
      fontSize: '0.75rem',
      marginTop: '0.75rem',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ fontSize: '2rem' }}>☕</div>
          <div>
            <div style={styles.headerTitle}>COFFEE Framework + Gemini AI</div>
            <div style={styles.headerSubtitle}>Intelligent Context Offloading with Google Gemini</div>
          </div>
        </div>
      </div>

      <div style={styles.chatContainer}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{...styles.messageGroup, ...(msg.type === 'user' ? styles.userMessage : styles.assistantMessage)}}>
            <div style={{...styles.messageBubble, ...(msg.type === 'user' ? styles.userBubble : msg.isError ? styles.errorBubble : styles.assistantBubble)}}>
              {msg.isError && <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <AlertCircle size={20} />
              </div>}
              <p style={{marginBottom: msg.withVisualization ? '1rem' : 0}}>{msg.content}</p>

              {msg.intentSummary && (
                <div style={styles.agentThinking}>
                  <div style={styles.thinkingTitle}>
                    <Brain size={16} />
                    Gemini Agent Analysis
                  </div>
                  <div><strong>Intent:</strong> {msg.intentSummary}</div>
                  <div style={{marginTop: '0.5rem', fontSize: '0.75rem', color: '#78350f'}}>
                    {msg.agentReasoning}
                  </div>
                </div>
              )}

              {msg.withVisualization && msg.tokens && (
                <div style={styles.tokensSection}>
                  <div style={styles.tokenBar}>
                    <div style={{...styles.tokenLabel, color: '#dc2626'}}>
                      <span>Without COFFEE</span>
                      <span>{msg.tokens.withoutCoffee} tokens</span>
                    </div>
                    <div style={styles.barContainer}>
                      <div style={{...styles.barFill, background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', width: '100%'}} />
                    </div>
                  </div>

                  <div style={styles.tokenBar}>
                    <div style={{...styles.tokenLabel, color: '#16a34a'}}>
                      <span>With COFFEE + Gemini</span>
                      <span>{msg.tokens.withCoffee} tokens</span>
                    </div>
                    <div style={styles.barContainer}>
                      <div style={{...styles.barFill, background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', width: `${(msg.tokens.withCoffee / msg.tokens.withoutCoffee) * 100}%`}} />
                    </div>
                  </div>

                  <div style={styles.savingsBadge}>
                    <div style={styles.savingsIcon}>
                      <TrendingDown size={24} />
                    </div>
                    <div>
                      <div style={{fontSize: '0.875rem', color: '#4b5563'}}>Token Savings</div>
                      <div style={styles.savingsText}>{msg.tokens.savingsPercent}%</div>
                      <div style={{fontSize: '0.875rem', color: '#047857', marginTop: '0.5rem'}}>
                        <strong>{msg.tokens.savings} fewer tokens</strong> with intelligent routing
                      </div>
                    </div>
                  </div>

                  <div style={styles.toolsList}>
                    <div style={styles.toolsTitle}>Selected Tools (Gemini-Filtered)</div>
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
              <span>Gemini is analyzing your request...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything - Gemini will intelligently find the right tools..."
              style={styles.input}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{...styles.button, opacity: (loading || !input.trim()) ? 0.5 : 1, cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer'}}
            >
              <Send size={16} />
            </button>
          </div>
          <div style={styles.hint}>Try: "I need to analyze customer feedback from Slack and search for related GitHub issues"</div>
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

export default CoffeeAgentDemo;