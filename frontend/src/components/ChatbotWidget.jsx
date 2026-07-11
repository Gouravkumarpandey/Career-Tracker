import React, { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';
import api from '../config/api';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! 👋 I'm your Careerflow Assistant. I can tell you about our platform's tools, features, and how it can supercharge your job search. What would you like to know?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: "What is Careerflow?", query: "what is careerflow" },
    { label: "AI Resume Builder", query: "tell me about the resume builder" },
    { label: "Job Tracker", query: "tell me about the job tracker" },
    { label: "Is it free?", query: "is this website free" }
  ];

  const getBotResponse = (text) => {
    const query = text.toLowerCase();
    
    if (query.includes('what') || query.includes('careerflow') || query.includes('website') || query.includes('used for') || query.includes('purpose') || query.includes('about')) {
      return "Careerflow.ai is an all-in-one Career Tracker designed to replace messy job search spreadsheets. We help you manage job applications, optimize your resume for ATS scanners, track learning progression, and plan your career path with AI-driven insights.";
    }
    if (query.includes('resume') || query.includes('ats') || query.includes('builder') || query.includes('cv')) {
      return "Our AI Resume Builder analyzes your resume structure and content against industry standards. It provides an ATS compatibility score, quantifiable metrics audit, and actionable tips (like adding strong action verbs) to help you secure interviews.";
    }
    if (query.includes('tracker') || query.includes('job') || query.includes('track') || query.includes('application')) {
      return "The Job Tracker helps you save, organize, and monitor all your job applications in one central Kanban-style board. You can track progress from saved to applied, interviewing, and offer stages.";
    }
    if (query.includes('learning') || query.includes('skill') || query.includes('cert') || query.includes('progress')) {
      return "The Learning Tracker logs your study courses, checklist tasks, and certification milestones, ensuring your skills stay aligned with your dream career path.";
    }
    if (query.includes('planner') || query.includes('calendar') || query.includes('task') || query.includes('notion') || query.includes('notes')) {
      return "The Planner offers Kanban workflow boards and Notion-style note editing to manage your daily tasks, schedule application deadlines, and save study notes.";
    }
    if (query.includes('free') || query.includes('cost') || query.includes('pay') || query.includes('price') || query.includes('premium')) {
      return "Yes! Careerflow offers a highly robust free tier so you can manage your applications, track learning progress, use the planner, and build resumes at absolutely no cost.";
    }
    
    return "I can help you with questions about: 'What is this website?', 'AI Resume Builder', 'Job Tracker', 'Learning Tracker', 'Planner', or 'Pricing'. What would you like to learn about?";
  };

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/ai/public-chat', {
        message: textToSend
      });
      
      const responseText = response.data.data.message;
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn("Grok AI public chat error, falling back to local assistant:", err);
      const responseText = getBotResponse(textToSend);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(inputText);
    }
  };

  return (
    <div className="chatbot-widget-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)} title="Careerflow AI Assistant">
          <FiMessageSquare size={24} />
          <span className="pulse-dot"></span>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">C</div>
              <div>
                <h4>Careerflow Assistant</h4>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)} title="Minimize chat">
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chatbot-bubble-row ${msg.sender}`}>
                <div className={`chatbot-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-bubble-row bot">
                <div className="chatbot-bubble bot typing">
                  <div className="dot-typing"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions if user is starting */}
          {messages.length === 1 && !isTyping && (
            <div className="chatbot-quick-prompts">
              {quickPrompts.map((prompt, idx) => (
                <button 
                  key={idx} 
                  className="quick-prompt-btn" 
                  onClick={() => handleSend(prompt.label)}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="chatbot-footer">
            <input
              type="text"
              placeholder="Ask me what this site is for..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isTyping}
            />
            <button 
              className="chatbot-send-btn" 
              onClick={() => handleSend(inputText)}
              disabled={!inputText.trim() || isTyping}
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
