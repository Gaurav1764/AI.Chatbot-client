import { useRef, useEffect } from "react";
import { Paperclip, X, Mic, Send, AlertCircle } from "lucide-react";

function ChatInput({
  input,
  setInput,
  attachedFile,
  setAttachedFile,
  isLoading,
  isListening,
  isSupported,
  voiceReplyEnabled,
  setVoiceReplyEnabled,
  errorMessage,
  setErrorMessage,
  onSend,
  onMicClick,
  textareaRef
}) {
  const fileInputRef = useRef(null);

  // Auto-grow input text area when typing
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input, textareaRef]);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input-panel">
      {errorMessage && (
        <div className="chat-error-banner">
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
                <span className="badge-name" title={attachedFile.name}>
                  {attachedFile.name}
                </span>
                <button
                  className="remove-file-btn"
                  onClick={() => setAttachedFile(null)}
                  aria-label="Remove attached file"
                >
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
            aria-label="Attach file"
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
            placeholder={
              isListening ? "Listening..." : "Type a message or /imagine to generate art..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="Chat input"
          />

          <button
            className={`input-icon-btn mic-btn ${isListening ? "active" : ""}`}
            onClick={onMicClick}
            disabled={isLoading || !isSupported}
            title={
              isSupported ? "Record message" : "Microphone not supported in this browser"
            }
            aria-label="Use voice dictation"
          >
            <Mic size={18} />
          </button>

          <button
            className="send-message-btn"
            onClick={() => onSend()}
            disabled={isLoading || (!input.trim() && !attachedFile)}
            title="Send message"
            aria-label="Send message"
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
  );
}

export default ChatInput;
