import { useState } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit3,
  Sun,
  Moon,
  Settings,
  Check,
  X
} from "lucide-react";

function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  theme,
  onToggleTheme,
  onOpenSettings,
  isOpen,
  onCloseSidebar,
  userSettings
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleSaveRename(e, id);
    } else if (e.key === "Escape") {
      handleCancelRename(e);
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="sidebar-logo-orb"></div>
          <h2>Aethera AI</h2>
        </div>
        {isOpen && (
          <button className="action-btn menu-toggle-btn" onClick={onCloseSidebar}>
            <X size={18} />
          </button>
        )}
      </div>

      <button className="new-chat-btn" onClick={() => { onNewChat(); if (isOpen) onCloseSidebar(); }}>
        <Plus size={18} />
        New Chat
      </button>

      <div className="search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="chats-list-container">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
            onClick={() => { onSelectChat(chat.id); if (isOpen) onCloseSidebar(); }}
          >
            <div className="chat-title-wrapper">
              <MessageSquare size={16} style={{ flexShrink: 0 }} />
              {editingId === chat.id ? (
                <input
                  type="text"
                  className="chat-rename-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={(e) => handleSaveRename(e, chat.id)}
                  onKeyDown={(e) => handleKeyDown(e, chat.id)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span className="chat-title-text">{chat.title}</span>
              )}
            </div>

            {editingId !== chat.id && (
              <div className="chat-actions">
                <button
                  className="action-btn"
                  onClick={(e) => handleStartRename(e, chat)}
                  title="Rename"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
        {filteredChats.length === 0 && (
          <div className="no-chats-message">
            No chats found
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="theme-toggle-container">
          <button
            className={`theme-tab ${theme === "light" ? "active" : ""}`}
            onClick={() => onToggleTheme("light")}
          >
            <Sun size={14} />
            Light
          </button>
          <button
            className={`theme-tab ${theme === "dark" ? "active" : ""}`}
            onClick={() => onToggleTheme("dark")}
          >
            <Moon size={14} />
            Dark
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {(userSettings?.userName || "U")[0].toUpperCase()}
          </div>
          <div className="profile-info">
            <h4 className="profile-name">{userSettings?.userName || "User Account"}</h4>
            <div className="profile-status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>
          <button className="action-btn" onClick={onOpenSettings} title="Settings">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
