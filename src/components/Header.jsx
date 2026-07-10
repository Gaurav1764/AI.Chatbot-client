import { Menu, FileDown, Download, X } from "lucide-react";

function Header({ title, messagesCount, onExportChat, onOpenSidebar, onClose }) {
  return (
    <header className="chat-header-bar">
      <div className="header-left">
        <button
          className="action-btn menu-toggle-btn"
          onClick={onOpenSidebar}
          aria-label="Open Sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="chat-header-info">
          <h3>{title}</h3>
          <p>{messagesCount} messages • Aethera Core Engine</p>
        </div>
      </div>

      <div className="header-right">
        {messagesCount > 0 && (
          <>
            <button
              className="action-btn"
              onClick={() => onExportChat("md")}
              title="Export Markdown"
            >
              <FileDown size={18} />
            </button>
            <button
              className="action-btn"
              onClick={() => onExportChat("json")}
              title="Export JSON"
            >
              <Download size={18} />
            </button>
          </>
        )}

        {onClose && (
          <button
            className="action-btn header-close-btn"
            onClick={onClose}
            title="Back to Home"
            aria-label="Close chat and return to home"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
