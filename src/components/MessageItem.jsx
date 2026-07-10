import { useState } from "react";
import { marked } from "marked";
import {
  Copy,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Download,
  FileText,
  Image,
  Check
} from "lucide-react";

// Configure marked to translate breaks and parse standard GFM
marked.setOptions({
  breaks: true,
  gfm: true
});

// Custom renderer to add copy buttons and file headers to code blocks
const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  const codeString = typeof code === "object" ? code.text : code;
  const lang = language || "code";
  const escapedCode = encodeURIComponent(codeString);
  
  return `
    <div class="code-block-container">
      <div class="code-block-header">
        <span>${lang.toUpperCase()}</span>
        <button 
          class="code-copy-btn" 
          onclick="
            navigator.clipboard.writeText(decodeURIComponent('${escapedCode}'));
            const btn = this;
            btn.innerHTML = '✓ Copied';
            btn.style.color = 'var(--success-color)';
            setTimeout(() => {
              btn.innerHTML = 'Copy';
              btn.style.color = '';
            }, 2000);
          "
        >
          Copy
        </button>
      </div>
      <pre><code class="language-${lang}">${codeString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
    </div>
  `;
};

marked.use({ renderer });

function MessageItem({
  message,
  onSpeak,
  onStopSpeaking,
  currentlySpeakingId
}) {
  const { id, role, text, file, generatedImageUrl, isImageGeneration, feedback } = message;
  const [copied, setCopied] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState(feedback || null);

  const isModel = role === "model";
  const isSpeaking = currentlySpeakingId === id;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    const nextFeedback = activeFeedback === type ? null : type;
    setActiveFeedback(nextFeedback);
    // In a production app, we would sync this feedback to the backend here.
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      onStopSpeaking();
    } else {
      onSpeak(id, text);
    }
  };

  const handleDownloadGeneratedImage = async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download image. Please try right-clicking the image to save it.");
    }
  };

  const renderFileAttachment = () => {
    if (!file) return null;

    if (file.isImage) {
      return (
        <div className="msg-attachment-card image-card">
          <img src={file.url || file.data} alt={file.name} className="msg-attachment-img" />
          <div className="msg-attachment-info">
            <Image size={14} style={{ color: "var(--primary-color)" }} />
            <span className="badge-name" title={file.name}>{file.name}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="msg-attachment-card">
        <FileText size={16} style={{ color: "var(--primary-color)", flexShrink: 0 }} />
        <div className="msg-attachment-info">
          <span className="badge-name" title={file.name}>{file.name}</span>
          {file.size && (
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`message-row ${role}`}>
      <div className={`message-avatar ${role}`}>
        {isModel ? "🤖" : "U"}
      </div>

      <div className="message-content-wrapper">
        <div className="message-bubble">
          {renderFileAttachment()}

          {/* Render standard or generated image content */}
          {isImageGeneration && generatedImageUrl ? (
            <div className="generated-image-container">
              <img src={generatedImageUrl} alt="AI Generated" className="generated-image" />
              <div className="image-actions-overlay">
                <button className="img-btn" onClick={handleDownloadGeneratedImage}>
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{
                __html: isModel ? marked.parse(text) : text.replace(/\n/g, "<br />")
              }}
            />
          )}
        </div>

        <div className="message-meta">
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

          {isModel && (
            <>
              <button
                className="meta-action-btn"
                onClick={handleCopyMessage}
                title="Copy message"
              >
                {copied ? <Check size={14} style={{ color: "var(--success-color)" }} /> : <Copy size={14} />}
              </button>

              <button
                className={`meta-action-btn ${isSpeaking ? "active" : ""}`}
                onClick={handleToggleSpeech}
                title={isSpeaking ? "Stop speaking" : "Read message aloud"}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <div className="feedback-actions">
                <button
                  className={`meta-action-btn ${activeFeedback === "up" ? "active" : ""}`}
                  onClick={() => handleFeedback("up")}
                  title="Thumbs up"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  className={`meta-action-btn ${activeFeedback === "down" ? "active-down" : ""}`}
                  onClick={() => handleFeedback("down")}
                  title="Thumbs down"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
