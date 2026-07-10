import { useState, useCallback } from "react";
import LandingPage from "./components/LandingPage.jsx";
import ChatDashboard from "./components/ChatDashboard.jsx";

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  const openChat = useCallback(() => {
    setChatOpen(true);
    setAnimatingOut(false);
  }, []);

  const closeChat = useCallback(() => {
    // Trigger exit animation, then unmount
    setAnimatingOut(true);
    setTimeout(() => {
      setChatOpen(false);
      setAnimatingOut(false);
    }, 350);
  }, []);

  return (
    <>
      {/* Landing page always mounted underneath */}
      <LandingPage onOpenChat={openChat} />

      {/* Chat dashboard slides in over landing page */}
      {chatOpen && (
        <div className={`app-view${animatingOut ? " app-view--exit" : ""}`}>
          <ChatDashboard onClose={closeChat} />
        </div>
      )}
    </>
  );
}

export default App;
