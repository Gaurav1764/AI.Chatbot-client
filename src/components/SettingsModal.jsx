import { X } from "lucide-react";

function SettingsModal({ isOpen, onClose, userSettings, setUserSettings }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings Console</h3>
          <button className="action-btn" onClick={onClose} aria-label="Close settings">
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

          <div className="settings-modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
