import { useState, useRef, useEffect } from 'react';
import { Lightbulb, ArrowRight, ArrowLeft, RotateCcw, Sparkles, Zap, Key, Eye, EyeOff, Loader2, Send, User, Bot, Settings, X, ChevronDown } from 'lucide-react';
import { questions } from './data/questions';
import { calculateRecommendations, Category, Technology } from './data/technologies';
import { 
  AIProvider, 
  AIModel,
  Message, 
  AIRecommendation, 
  sendChatMessage, 
  getApiKey, 
  saveApiKey, 
  clearApiKey,
  getSelectedModel,
  saveSelectedModel,
  defaultModels,
  fetchOpenAIModels,
  fetchGeminiModels
} from './services/ai';
import './index.css';

// Simple markdown renderer
const renderMarkdown = (text: string): JSX.Element => {
  // Split by double newlines for paragraphs
  const parts = text.split(/\n\n+/);
  
  return (
    <>
      {parts.map((part, i) => {
        // Check if it's a numbered list
        if (/^\d+\.\s/.test(part.trim())) {
          const items = part.split(/\n/).filter(item => item.trim());
          return (
            <ol key={i} className="md-list">
              {items.map((item, j) => (
                <li key={j}>{formatInlineMarkdown(item.replace(/^\d+\.\s*/, ''))}</li>
              ))}
            </ol>
          );
        }
        
        // Check if it's a bullet list
        if (/^[-*]\s/.test(part.trim())) {
          const items = part.split(/\n/).filter(item => item.trim());
          return (
            <ul key={i} className="md-list">
              {items.map((item, j) => (
                <li key={j}>{formatInlineMarkdown(item.replace(/^[-*]\s*/, ''))}</li>
              ))}
            </ul>
          );
        }
        
        // Regular paragraph
        return <p key={i}>{formatInlineMarkdown(part)}</p>;
      })}
    </>
  );
};

// Format inline markdown (bold, italic, code)
const formatInlineMarkdown = (text: string): JSX.Element => {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let key = 0;
  
  // Process bold (**text**)
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    
    if (boldMatch && boldMatch.index !== undefined) {
      // Add text before the match
      if (boldMatch.index > 0) {
        parts.push(remaining.substring(0, boldMatch.index));
      }
      // Add the bold text
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
    } else {
      // No more matches, add remaining text
      parts.push(remaining);
      break;
    }
  }
  
  return <>{parts}</>;
};

type Mode = 'static' | 'ai';

function App() {
  // Mode & Tab state
  const [mode, setMode] = useState<Mode>('static');
  
  // Static mode state
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  // AI mode state
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Model selection state
  const [availableModels, setAvailableModels] = useState<AIModel[]>(defaultModels[aiProvider]);
  const [selectedModel, setSelectedModel] = useState<string>(getSelectedModel(aiProvider));
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  // Settings panel state
  const [showSettings, setShowSettings] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const savedApiKey = getApiKey(aiProvider);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch models when provider changes or API key is saved
  useEffect(() => {
    const fetchModels = async () => {
      const key = savedApiKey;
      if (!key) {
        setAvailableModels(defaultModels[aiProvider]);
        setSelectedModel(getSelectedModel(aiProvider));
        return;
      }

      setIsLoadingModels(true);
      try {
        let models: AIModel[];
        if (aiProvider === 'openai') {
          models = await fetchOpenAIModels(key);
        } else {
          models = await fetchGeminiModels(key);
        }
        setAvailableModels(models);
        
        const savedModel = getSelectedModel(aiProvider);
        if (models.some(m => m.id === savedModel)) {
          setSelectedModel(savedModel);
        } else {
          setSelectedModel(models[0]?.id || defaultModels[aiProvider][0].id);
        }
      } catch {
        setAvailableModels(defaultModels[aiProvider]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [aiProvider, savedApiKey]);

  // Auto-scroll page when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setMessages([]);
    setAiError(null);
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(aiProvider, apiKeyInput.trim());
      setApiKeyInput('');
      setShowSettings(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey(aiProvider);
    setApiKeyInput('');
    setAvailableModels(defaultModels[aiProvider]);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    saveSelectedModel(aiProvider, modelId);
    setShowModelDropdown(false);
  };

  const handleSendMessage = async () => {
    const key = savedApiKey || apiKeyInput.trim();
    if (!key) {
      setAiError('Please configure your API key first');
      setShowSettings(true);
      return;
    }
    if (!inputMessage.trim()) return;

    const userMessage: Message = { role: 'user', content: inputMessage.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setAiError(null);
    setIsLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    try {
      const response = await sendChatMessage(newMessages, { 
        provider: aiProvider, 
        apiKey: key,
        model: selectedModel
      });
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        recommendations: response.recommendations || undefined,
        suggestions: response.suggestions || undefined
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const recommendations = showResults && mode === 'static' ? calculateRecommendations(answers) : null;

  const categoryLabels: Record<Category, string> = {
    frontend: '🌐 Frontend',
    backend: '⚡ Backend',
    database: '🗄️ Database',
    hosting: '☁️ Hosting'
  };

  const providerInfo: Record<AIProvider, { name: string; placeholder: string }> = {
    openai: { name: 'OpenAI', placeholder: 'sk-...' },
    gemini: { name: 'Gemini', placeholder: 'AIza...' },
  };

  const currentModelName = availableModels.find(m => m.id === selectedModel)?.name || selectedModel;

  // Get suggestions from the last AI message
  const getSuggestions = (): string[] => {
    if (messages.length === 0 || isLoading) return [];
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return [];
    
    // Use AI-provided suggestions if available
    if (lastMessage.suggestions && lastMessage.suggestions.length > 0) {
      return lastMessage.suggestions;
    }
    
    return [];
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Clear input and send the suggestion
    setInputMessage('');
    
    const key = savedApiKey;
    if (!key) {
      setAiError('Please configure your API key first');
      setShowSettings(true);
      return;
    }
    
    const userMessage: Message = { role: 'user', content: suggestion };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setAiError(null);
    setIsLoading(true);
    
    sendChatMessage(newMessages, { provider: aiProvider, apiKey: key, model: selectedModel })
      .then(response => {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.content,
          recommendations: response.recommendations || undefined,
          suggestions: response.suggestions || undefined
        };
        setMessages([...newMessages, assistantMessage]);
      })
      .catch(err => {
        setAiError(err instanceof Error ? err.message : 'Failed to get response');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const suggestions = getSuggestions();

  // Render recommendation cards from AI
  const renderAIRecommendations = (recs: AIRecommendation) => (
    <div className="ai-recommendations">
      <div className="results-grid compact">
        {(['frontend', 'backend', 'database', 'hosting'] as const).map(category => {
          const rec = recs[category];
          if (!rec) return null;
          return (
            <div key={category} className="category-card ai-card compact">
              <div className="category-header compact">
                {categoryLabels[category]}
              </div>
              <div className="tech-item recommended">
                <div className="tech-header">
                  <span className="tech-name">{rec.name}</span>
                </div>
                <p className="tech-reason">{rec.reason}</p>
                {rec.alternatives && rec.alternatives.length > 0 && (
                  <div className="alternatives">
                    <span className="alt-label">Also consider:</span>
                    {rec.alternatives.map(alt => (
                      <span key={alt} className="alt-tag">{alt}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {recs.followUp && (
        <p className="follow-up-prompt">{recs.followUp}</p>
      )}
    </div>
  );

  return (
    <div className="container">
      <header className="header">
        <div className="header-badge">
          <Lightbulb size={14} />
          <span>Free Tool</span>
        </div>
        <h1>Tech Stack Advisor</h1>
        <p>
          Get personalized technology recommendations for your project.
        </p>
      </header>

      {/* Mode Tabs */}
      <div className="mode-tabs">
        <button 
          className={`mode-tab ${mode === 'static' ? 'active' : ''}`}
          onClick={() => { setMode('static'); handleRestart(); }}
        >
          <Zap size={16} />
          Quick Mode
        </button>
        <button 
          className={`mode-tab ${mode === 'ai' ? 'active' : ''}`}
          onClick={() => { setMode('ai'); handleRestart(); }}
        >
          <Sparkles size={16} />
          AI Chat
        </button>
      </div>

      {mode === 'static' ? (
        /* STATIC MODE */
        !showResults ? (
          <>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-text">
                Question {currentStep + 1} of {questions.length}
              </div>
            </div>

            <div className="question-card">
              <h2 className="question-title">{currentQuestion.title}</h2>
              <p className="question-description">{currentQuestion.description}</p>

              <div className="options-grid">
                {currentQuestion.options.map(option => (
                  <button
                    key={option.value}
                    className={`option-btn ${answers[currentQuestion.id] === option.value ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="option-icon">{option.icon}</span>
                    <span className="option-label">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="nav-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
                >
                  <ArrowLeft size={18} />
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                >
                  {currentStep === questions.length - 1 ? 'See Results' : 'Next'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="results-container">
            <div className="results-grid">
              {recommendations && (Object.keys(recommendations) as Category[]).map(category => (
                <div key={category} className="category-card">
                  <div className="category-header">
                    {categoryLabels[category]}
                  </div>
                  {recommendations[category].map((tech: Technology, index: number) => (
                    <div key={tech.id} className={`tech-item ${index === 0 ? 'recommended' : ''}`}>
                      <div className="tech-header">
                        <span className="tech-logo">{tech.logo}</span>
                        <span className="tech-name">{tech.name}</span>
                        {index === 0 && <span className="recommended-badge">Best Match</span>}
                      </div>
                      <p className="tech-description">{tech.description}</p>
                      <div className="tech-tags">
                        {tech.pros.slice(0, 2).map(pro => (
                          <span key={pro} className="tech-tag pro">✓ {pro}</span>
                        ))}
                        {tech.cons.slice(0, 1).map(con => (
                          <span key={con} className="tech-tag con">✗ {con}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="restart-section">
              <button className="btn btn-secondary" onClick={handleRestart}>
                <RotateCcw size={16} />
                Start Over
              </button>
            </div>
          </div>
        )
      ) : (
        /* AI CHAT MODE */
        <div className="chat-container">
          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <Sparkles size={32} />
                <h3>Hi! Tell me about your project</h3>
                <p>Describe what you're building and I'll recommend the best tech stack for you.</p>
                <div className="example-prompts">
                  <button onClick={() => setInputMessage("I want to build a SaaS dashboard for small businesses")}>
                    "I want to build a SaaS dashboard..."
                  </button>
                  <button onClick={() => setInputMessage("I'm a beginner building my first full-stack app")}>
                    "I'm a beginner building my first app..."
                  </button>
                  <button onClick={() => setInputMessage("I need a fast, SEO-friendly e-commerce site")}>
                    "I need a fast e-commerce site..."
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="message-content">
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : <p>{msg.content}</p>}
                  {msg.recommendations && renderAIRecommendations(msg.recommendations)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {aiError && (
              <div className="chat-error">
                ⚠️ {aiError}
              </div>
            )}

            {/* Suggestion Chips */}
            {suggestions.length > 0 && !isLoading && (
              <div className="suggestion-chips">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className="chat-input-box">
            {/* Top Row: Model Selector + Settings */}
            <div className="input-top-row">
              {/* Model Dropdown */}
              <div className="model-dropdown-wrapper" ref={modelDropdownRef}>
                <button 
                  className="model-selector-btn"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  disabled={isLoadingModels}
                >
                  <Sparkles size={14} />
                  <span className="provider-label">{providerInfo[aiProvider].name}</span>
                  <span className="model-label">{currentModelName}</span>
                  <ChevronDown size={14} className={showModelDropdown ? 'rotate' : ''} />
                </button>
                
                {showModelDropdown && (
                  <div className="model-dropdown">
                    <div className="dropdown-header">Select Model</div>
                    {availableModels.map(model => (
                      <button
                        key={model.id}
                        className={`dropdown-item ${selectedModel === model.id ? 'active' : ''}`}
                        onClick={() => handleModelChange(model.id)}
                      >
                        {model.name}
                        {selectedModel === model.id && <span className="check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings Button */}
              <div className="settings-wrapper" ref={settingsRef}>
                <button 
                  className={`settings-btn ${!savedApiKey ? 'needs-setup' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  title="AI Settings"
                >
                  <Settings size={16} />
                </button>

                {showSettings && (
                  <div className="settings-panel">
                    <div className="settings-header">
                      <Key size={16} />
                      <span>AI Configuration</span>
                      <button className="close-btn" onClick={() => setShowSettings(false)}>
                        <X size={16} />
                      </button>
                    </div>

                    <div className="settings-content">
                      <div className="settings-row">
                        <label>Provider</label>
                        <div className="provider-buttons">
                          {(['openai', 'gemini'] as AIProvider[]).map(provider => (
                            <button
                              key={provider}
                              className={`provider-btn ${aiProvider === provider ? 'active' : ''}`}
                              onClick={() => setAiProvider(provider)}
                            >
                              {providerInfo[provider].name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="settings-row">
                        <label>API Key</label>
                        {savedApiKey ? (
                          <div className="key-saved">
                            <span>✓ Configured</span>
                            <button onClick={handleClearApiKey}>Remove</button>
                          </div>
                        ) : (
                          <div className="key-input-row">
                            <div className="key-input-wrapper">
                              <input
                                type={showApiKey ? 'text' : 'password'}
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder={providerInfo[aiProvider].placeholder}
                              />
                              <button onClick={() => setShowApiKey(!showApiKey)}>
                                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <button 
                              className="save-btn"
                              onClick={handleSaveApiKey}
                              disabled={!apiKeyInput.trim()}
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="settings-note">
                        🔒 Your key is stored locally and only sent to server.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Text Input + Send */}
            <div className="input-bottom-row">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={savedApiKey ? "Describe your project..." : "Configure API key to start chatting..."}
                className="chat-input"
                rows={1}
                disabled={isLoading}
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="restart-section">
              <button className="btn btn-secondary" onClick={handleRestart}>
                <RotateCcw size={16} />
                New Chat
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>
          Built by <a href="https://kartikeykumar.com" target="_blank" rel="noopener noreferrer">Kartikey Kumar</a> · 
          More tools at <a href="https://kartikeykumar.com/tools" target="_blank" rel="noopener noreferrer">kartikeykumar.com/tools</a>
        </p>
        <a href="https://github.com/kartikeykumar09/tech-stack-advisor" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          View Source Code
        </a>
      </footer>
    </div>
  );
}

export default App;
