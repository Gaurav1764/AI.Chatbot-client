import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar.jsx";
import MessageItem from "./MessageItem.jsx";
import PromptSuggestions from "./PromptSuggestions.jsx";
import { sendMessage } from "../services/chatApi.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { speakText, stopSpeaking } from "../hooks/useSpeechSynthesis.js";
import {
  Menu,
  Send,
  Mic,
  Paperclip,
  X,
  FileDown,
  Download,
  AlertCircle
} from "lucide-react";

function ChatDashboard() {
  // 1. Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ai_chatbot_theme") || "dark";
  });

  // 2. Chat history State
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("ai_chatbot_chats");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "chat-welcome",
        title: "Introduction",
        messages: [
          {
            id: "msg-init",
            role: "model",
            text: "Welcome! I am **Aethera AI**, your next-generation assistant. Ask me anything, generate custom artwork using `/imagine [prompt]`, or upload files to get started.",
            timestamp: Date.now()
          }
        ]
      }
    ];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return chats[0]?.id || "chat-welcome";
  });

  // 3. User Settings & Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem("ai_chatbot_settings");
    return saved
      ? JSON.parse(saved)
      : {
          userName: "Creative Explorer",
          systemInstruction: "You are a helpful, creative assistant.",
          voicePitch: 1.0,
          voiceRate: 1.0
        };
  });

  // 4. Input & File Upload State
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync chats to localStorage
  useEffect(() => {
    localStorage.setItem("ai_chatbot_chats", JSON.stringify(chats));
  }, [chats]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("ai_chatbot_settings", JSON.stringify(userSettings));
  }, [userSettings]);

  // Apply theme to container
  useEffect(() => {
    localStorage.setItem("ai_chatbot_theme", theme);
  }, [theme]);

  // Auto-scroll messages list on new additions
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0] || { messages: [] };
  const messages = activeChat.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-grow input text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.style.scrollHeight || textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleToggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Add a new chat
  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: `New Session ${chats.length + 1}`,
      messages: []
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setInput("");
    setAttachedFile(null);
    setErrorMessage("");
    stopSpeaking();
    setCurrentlySpeakingId(null);
  };

  // Delete a chat session
  const handleDeleteChat = (chatId) => {
    const updatedChats = chats.filter((c) => c.id !== chatId);
    setChats(updatedChats);

    if (updatedChats.length === 0) {
      // Re-initialize with a default chat
      const defaultId = "chat-welcome";
      setChats([
        {
          id: defaultId,
          title: "Welcome Session",
          messages: [
            {
              id: "msg-init",
              role: "model",
              text: "Hi! I'm your AI assistant. Ask me anything, generate artwork with `/imagine [prompt]`, or upload files to get started.",
              timestamp: Date.now()
            }
          ]
        }
      ]);
      setActiveChatId(defaultId);
    } else if (activeChatId === chatId) {
      setActiveChatId(updatedChats[0].id);
    }
    stopSpeaking();
    setCurrentlySpeakingId(null);
  };

  // Rename a chat session
  const handleRenameChat = (chatId, newTitle) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
    );
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File limit check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    setErrorMessage("");
    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();

    if (isImage) {
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          mimeType: file.type,
          data: event.target.result, // base64 url
          isImage: true,
          url: URL.createObjectURL(file),
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Read documents as text
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          mimeType: file.type,
          textContent: event.target.result,
          isImage: false,
          size: file.size
        });
      };
      reader.readAsText(file);
    }
    // Clear input so same file can be selected again
    e.target.value = "";
  };

  // Build simple Gemini-compatible history for standard messages
  const buildHistoryPayload = (msgs) => {
    const firstUserIndex = msgs.findIndex((m) => m.role === "user");
    if (firstUserIndex === -1) return [];
    
    // Filter out image generation logs because Gemini chats shouldn't mix those prompts
    return msgs
      .slice(firstUserIndex)
      .filter((m) => !m.isImageGeneration)
      .map((m) => ({
        role: m.role,
        text: m.text,
        file: m.file ? {
          mimeType: m.file.mimeType,
          data: m.file.data,
          isImage: m.file.isImage,
          name: m.file.name
        } : null
      }));
  };

  // Send Message
  const handleSend = async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if (!text && !attachedFile) return;

    // Stop speaking any active message
    stopSpeaking();
    setCurrentlySpeakingId(null);
    setErrorMessage("");

    const currentChatId = activeChatId;
    const msgTimestamp = Date.now();

    // 1. Intercept Image Generation command (/imagine or image mode)
    if (text.toLowerCase().startsWith("/imagine ")) {
      const promptText = text.substring(9).trim();
      if (!promptText) return;

      const userMsg = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        text: text,
        timestamp: msgTimestamp
      };

      const seed = Math.floor(Math.random() * 1000000);
      // Construct pollinations URL
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        promptText
      )}?width=1024&height=1024&nologo=true&seed=${seed}`;

      const aiMsg = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        text: `Prompt: ${promptText}`,
        generatedImageUrl: imageUrl,
        isImageGeneration: true,
        timestamp: Date.now() + 50
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                // Update title automatically if it was the first query
                title: c.title.startsWith("New Session") ? `Artwork: ${promptText.substring(0, 15)}...` : c.title,
                messages: [...c.messages, userMsg, aiMsg]
              }
            : c
        )
      );

      setInput("");
      setAttachedFile(null);
      return;
    }

    // 2. Standard Chat Message Flow
    const userMsg = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      text: text,
      timestamp: msgTimestamp
    };

    if (attachedFile) {
      userMsg.file = {
        name: attachedFile.name,
        isImage: attachedFile.isImage,
        size: attachedFile.size,
        url: attachedFile.url,
        data: attachedFile.isImage ? attachedFile.data : null
      };
    }

    // Add user message to active chat layout immediately
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              title: c.title.startsWith("New Session") ? (text.length > 20 ? `${text.substring(0, 20)}...` : text) : c.title,
              messages: [...c.messages, userMsg]
            }
          : c
        )
    );

    setInput("");
    setAttachedFile(null);
    setIsLoading(true);

    try {
      // Build the formatted prompt (append file text contents to prompt if uploading doc)
      let finalPrompt = text;
      if (userMsg.file && !userMsg.file.isImage && attachedFile?.textContent) {
        finalPrompt = `[Uploaded document: ${userMsg.file.name}]\n---\n${attachedFile.textContent}\n---\nQuestion/Request: ${text || "Please analyze this file."}`;
      }

      // Reconstruct the history payload up to before this message
      const chatTarget = chats.find((c) => c.id === currentChatId);
      const priorHistory = buildHistoryPayload(chatTarget ? chatTarget.messages : []);

      const apiFilePayload = userMsg.file && userMsg.file.isImage ? {
        mimeType: attachedFile.mimeType,
        data: attachedFile.data,
        isImage: true,
        name: attachedFile.name
      } : null;

      // Inject Settings System instruction to prompt if needed (Gemini handles it, or we append it)
      const messageResponse = await sendMessage(
        `${userSettings.systemInstruction}\n\nUser Message: ${finalPrompt}`,
        priorHistory,
        apiFilePayload
      );

      const aiMsg = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        text: messageResponse,
        timestamp: Date.now()
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId ? { ...c, messages: [...c.messages, aiMsg] } : c
        )
      );

      if (voiceReplyEnabled) {
        handleSpeak(aiMsg.id, messageResponse);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: `msg-${Date.now()}-model`,
        role: "model",
        text: "Could not fetch reply. Please make sure the backend server is running on http://localhost:8000 and your Gemini API key is configured.",
        timestamp: Date.now()
      };
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId ? { ...c, messages: [...c.messages, errorMsg] } : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Recognition hook integration
  const { startListening, stopListening: stopListeningMic, isListening, isSupported } = useSpeechRecognition(
    (transcript) => {
      setInput(transcript);
      handleSend(transcript);
    }
  );

  const handleMicClick = () => {
    if (isListening) {
      stopListeningMic();
    } else {
      startListening();
    }
  };

  // Text-To-Speech triggers
  const handleSpeak = (msgId, text) => {
    setCurrentlySpeakingId(msgId);
    speakText(text, () => {
      setCurrentlySpeakingId(null);
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setCurrentlySpeakingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Export conversations
  const handleExportChat = (format) => {
    if (!messages.length) return;

    let content = "";
    let mimeType = "";
    let extension = "";

    if (format === "json") {
      content = JSON.stringify(activeChat, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else {
      // Export markdown
      content = `# Chat Session: ${activeChat.title}\n\n`;
      messages.forEach((m) => {
        const date = new Date(m.timestamp).toLocaleString();
        content += `### **${m.role === "user" ? "User" : "AI Assistant"}** (${date})\n`;
        if (m.file) {
          content += `*Attachment: ${m.file.name}*\n\n`;
        }
        if (m.isImageGeneration && m.generatedImageUrl) {
          content += `![Generated image](${m.generatedImageUrl})\n\n`;
        } else {
          content += `${m.text}\n\n`;
        }
        content += `---\n\n`;
      });
      mimeType = "text/markdown";
      extension = "md";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeChat.title.toLowerCase().replace(/\s+/g, "-")}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Prefill suggestions click callback
  const handleSelectPrompt = (prompt) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className={`app-container ${sidebarOpen ? "sidebar-open" : ""}`} data-theme={theme}>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      <main className="main-chat-container">
        {/* Top Header Bar */}
        <header className="chat-header-bar">
          <div className="header-left">
            <button className="action-btn menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="chat-header-info">
              <h3>{activeChat.title}</h3>
              <p>{messages.length} messages • Aethera Core Engine</p>
            </div>
          </div>

          <div className="header-right">
            {messages.length > 0 && (
              <>
                <button
                  className="action-btn"
                  onClick={() => handleExportChat("md")}
                  title="Export Markdown"
                >
                  <FileDown size={18} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => handleExportChat("json")}
                  title="Export JSON"
                >
                  <Download size={18} />
                </button>
              </>
            )}
          </div>
        </header>

        {/* Scrollable chat body */}
        <div className="chat-scroll-area">
          {messages.length === 0 ? (
            <PromptSuggestions onSelectPrompt={handleSelectPrompt} />
          ) : (
            messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onSpeak={handleSpeak}
                onStopSpeaking={handleStopSpeaking}
                currentlySpeakingId={currentlySpeakingId}
              />
            ))
          )}

          {isLoading && (
            <div className="message-row model">
              <div className="message-avatar model">🤖</div>
              <div className="message-content-wrapper">
                <div className="message-bubble">
                  <div className="thinking-bubble-content">
                    <div className="thinking-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    <span className="thinking-text">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Console */}
        <div className="chat-input-panel">
          {errorMessage && (
            <div
              style={{
                color: "var(--error-color)",
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px"
              }}
            >
              <AlertCircle size={14} />
              {errorMessage}
            </div>
          )}

          <div className="input-container-wrapper">
            {/* Attachment preview if any */}
            {attachedFile && (
              <div className="file-preview-bar">
                <div className={`preview-badge ${attachedFile.isImage ? "is-img" : ""}`}>
                  {attachedFile.isImage ? (
                    <img src={attachedFile.url} alt="Attached Preview" className="preview-badge-img" />
                  ) : (
                    <Paperclip size={12} style={{ flexShrink: 0 }} />
                  )}
                  <div className="badge-info">
                    <span className="badge-name" title={attachedFile.name}>{attachedFile.name}</span>
                    <button className="remove-file-btn" onClick={() => setAttachedFile(null)}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Row */}
            <div className="input-row">
              <button
                className="input-icon-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image or text file"
                disabled={isLoading}
              >
                <Paperclip size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*,.txt,.json,.csv,.md,.js,.jsx,.css,.html,.ts,.tsx"
              />

              <textarea
                ref={textareaRef}
                className="chat-textarea"
                rows="1"
                placeholder={isListening ? "Listening..." : "Type a message or /imagine to generate art..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              <button
                className={`input-icon-btn mic-btn ${isListening ? "active" : ""}`}
                onClick={handleMicClick}
                disabled={isLoading || !isSupported}
                title={isSupported ? "Record message" : "Microphone not supported in this browser"}
              >
                <Mic size={18} />
              </button>

              <button
                className="send-message-btn"
                onClick={() => handleSend()}
                disabled={isLoading || (!input.trim() && !attachedFile)}
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          <div className="input-meta-bar">
            <label className="voice-reply-checkbox-label">
              <input
                type="checkbox"
                checked={voiceReplyEnabled}
                onChange={(e) => setVoiceReplyEnabled(e.target.checked)}
              />
              Read replies aloud
            </label>
            <span className="char-counter">{input.length} characters</span>
          </div>
        </div>
      </main>

      {/* Settings Modal Dialog */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Settings Console</h3>
              <button className="action-btn" onClick={() => setIsSettingsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="setting-row">
                <div className="setting-label">
                  <span className="setting-title">User Name</span>
                  <span className="setting-desc">Rename user profile handle</span>
                </div>
                <div className="setting-control">
                  <input
                    type="text"
                    value={userSettings.userName}
                    onChange={(e) =>
                      setUserSettings({ ...userSettings, userName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-label">
                  <span className="setting-title">System Role / Instruction</span>
                  <span className="setting-desc">Define behavior guide for Gemini</span>
                </div>
                <div className="setting-control">
                  <select
                    value={userSettings.systemInstruction}
                    onChange={(e) =>
                      setUserSettings({ ...userSettings, systemInstruction: e.target.value })
                    }
                  >
                    <option value="You are a helpful, creative assistant.">Creative Assistant</option>
                    <option value="You are a precise developer assistant, reply strictly in clean markdown code blocks with clear explanations.">Developer Coach</option>
                    <option value="You are a funny assistant that replies using lots of emojis and sarcasm.">Sarcastic Bot</option>
                    <option value="You are a concise expert tutor, keeping responses to under 2 sentences unless requested.">Speed Tutor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button className="btn-secondary" onClick={() => setIsSettingsOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatDashboard;
