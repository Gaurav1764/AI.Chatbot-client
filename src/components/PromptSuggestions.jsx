import { Image, Mail, BookOpen, Code } from "lucide-react";

function PromptSuggestions({ onSelectPrompt }) {
  const suggestions = [
    {
      id: "img-gen",
      title: "Generate Image",
      desc: "Use /imagine to generate art. Example: '/imagine a neon cybernetic cat'",
      icon: <Image size={18} />,
      prompt: "/imagine a neon cybernetic cat"
    },
    {
      id: "draft-mail",
      title: "Draft an Email",
      desc: "Ask the assistant to draft a professional email to request project feedback.",
      icon: <Mail size={18} />,
      prompt: "Write a polite and professional email requesting feedback on a recently completed web design project."
    },
    {
      id: "explain-quantum",
      title: "Explain Concepts",
      desc: "Get simple explanations for complex ideas: 'Explain quantum computing...'",
      icon: <BookOpen size={18} />,
      prompt: "Explain quantum computing in simple terms so that a 10-year old can understand it."
    },
    {
      id: "debug-code",
      title: "Optimize Code",
      desc: "Send code snippet to optimize: 'How do I optimize this React render?'",
      icon: <Code size={18} />,
      prompt: "How can I optimize a React component to avoid unnecessary re-renders? Give some clear code examples."
    }
  ];

  return (
    <div className="empty-chat-state">
      <div className="glowing-orb-container">
        <div className="glowing-orb"></div>
        <div className="glowing-orb-ring"></div>
      </div>
      <h1 className="greeting-title">Aethera AI</h1>
      <p className="greeting-subtitle">
        Experience next-generation intelligence. Chat, analyze files, generate stunning artwork with <strong>/imagine [prompt]</strong>, or dictate voice commands.
      </p>

      <div className="suggestions-grid">
        {suggestions.map((s) => (
          <button
            key={s.id}
            className="suggestion-card"
            onClick={() => onSelectPrompt(s.prompt)}
          >
            <div className="suggestion-card-header">
              {s.icon}
              <span>{s.title}</span>
            </div>
            <p>{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PromptSuggestions;
