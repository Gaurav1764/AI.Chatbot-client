import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: "⚡",
    label: "Instant",
    title: "Lightning-Fast Responses",
    desc: "Powered by Gemini 2.5 Flash — get intelligent answers in under 2 seconds, every time.",
    color: "#6366f1",
  },
  {
    icon: "🎨",
    label: "Creative",
    title: "AI Image Generation",
    desc: "Type /imagine [prompt] to create stunning artwork on demand with Pollinations AI.",
    color: "#ec4899",
  },
  {
    icon: "📎",
    label: "Analytical",
    title: "File & Image Analysis",
    desc: "Upload documents, images, or code. Aethera reads, understands, and answers.",
    color: "#8b5cf6",
  },
  {
    icon: "🎙️",
    label: "Vocal",
    title: "Voice Input & Read-Aloud",
    desc: "Speak your messages and listen to replies — full hands-free AI interaction.",
    color: "#06b6d4",
  },
];

const STEPS = [
  { num: "01", title: "Click 'Launch Aethera'", desc: "One click opens the full AI workspace instantly." },
  { num: "02", title: "Ask Anything", desc: "Type, attach a file, or use your mic — Aethera understands it all." },
  { num: "03", title: "Explore & Create", desc: "Chat, generate images, export conversations, and do more." },
];

export default function LandingPage({ onOpenChat }) {
  const orbRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Subtle parallax on orb
  useEffect(() => {
    const onMove = (e) => {
      if (!orbRef.current) return;
      const cx = (e.clientX / window.innerWidth - 0.5) * 24;
      const cy = (e.clientY / window.innerHeight - 0.5) * 24;
      orbRef.current.style.transform = `translate(${cx}px, ${cy}px)`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Nav shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-cycle features
  useEffect(() => {
    const id = setInterval(() => setActiveFeature((p) => (p + 1) % FEATURES.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="lp-root">
      {/* ─── Ambient background blobs ─── */}
      <div className="lp-ambient lp-a1" />
      <div className="lp-ambient lp-a2" />
      <div className="lp-ambient lp-a3" />

      {/* ─── NAVBAR ─── */}
      <nav className={`lp-nav${scrolled ? " lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-logo">
          <div className="lp-nav-orb" />
          <span>Aethera AI</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how" className="lp-nav-link">How it works</a>
        </div>
        <button className="lp-nav-btn" onClick={onOpenChat}>
          Launch App
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section className="lp-hero">
        {/* Animated hero orb */}
        <div className="lp-hero-orb-wrap" ref={orbRef}>
          <div className="lp-hero-orb" />
          <div className="lp-hero-ring lp-hero-ring-1" />
          <div className="lp-hero-ring lp-hero-ring-2" />
          <div className="lp-hero-ring lp-hero-ring-3" />
        </div>

        <div className="lp-hero-content">
          <div className="lp-pill-badge">
            <span className="lp-pill-dot" />
            Now powered by Gemini 2.5 Flash
          </div>

          <h1 className="lp-hero-h1">
            The AI that thinks,
            <br />
            <span className="lp-gradient-text">creates & listens</span>
          </h1>

          <p className="lp-hero-sub">
            Aethera is your always-on intelligent assistant. Ask questions, generate images,
            analyze files, and talk — all in one beautiful workspace.
          </p>

          <div className="lp-hero-btns">
            <button className="lp-cta-primary" onClick={onOpenChat}>
              <span>Start for free</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <div className="lp-hero-note">No sign-up · No credit card · Instant access</div>
          </div>

          {/* Floating feature pills */}
          <div className="lp-floating-pills">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={`lp-f-pill${i === activeFeature ? " active" : ""}`}
                onClick={() => setActiveFeature(i)}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <div className="lp-stats-strip">
        {[["Gemini 2.5 Flash", "AI Model"], ["< 2s", "Avg Response"], ["Voice + Files", "Input Modes"], ["100%", "Private & Local"]].map(([v, l]) => (
          <div key={l} className="lp-stat">
            <span className="lp-stat-val">{v}</span>
            <span className="lp-stat-lbl">{l}</span>
          </div>
        ))}
      </div>

      {/* ─── FEATURES ─── */}
      <section className="lp-features" id="features">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Capabilities</span>
          <h2 className="lp-section-h2">
            Built for <span className="lp-gradient-text">every kind of thinker</span>
          </h2>
          <p className="lp-section-sub">From casual questions to complex creative tasks — Aethera handles it all.</p>
        </div>

        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`lp-feat-card${i === activeFeature ? " lp-feat-active" : ""}`}
              style={{ "--feat-color": f.color }}
              onMouseEnter={() => setActiveFeature(i)}
            >
              <div className="lp-feat-icon-wrap">
                <span className="lp-feat-icon">{f.icon}</span>
              </div>
              <div className="lp-feat-label">{f.label}</div>
              <h3 className="lp-feat-title">{f.title}</h3>
              <p className="lp-feat-desc">{f.desc}</p>
              <div className="lp-feat-glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="lp-how" id="how">
        <div className="lp-section-head">
          <span className="lp-section-eyebrow">Simple as 1-2-3</span>
          <h2 className="lp-section-h2">
            How it <span className="lp-gradient-text">works</span>
          </h2>
        </div>

        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <div key={s.num} className="lp-step">
              <div className="lp-step-num">{s.num}</div>
              {i < STEPS.length - 1 && <div className="lp-step-line" />}
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="lp-bottom-cta">
        <div className="lp-cta-card">
          <div className="lp-cta-glow" />
          <div className="lp-cta-orb-mini" />
          <h2 className="lp-cta-h2">
            Ready to meet <span className="lp-gradient-text">Aethera?</span>
          </h2>
          <p className="lp-cta-p">Your intelligent AI workspace — one click away.</p>
          <button className="lp-cta-primary lp-cta-primary--lg" onClick={onOpenChat}>
            <span>Launch Aethera AI</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="lp-footer">
        <div className="lp-nav-logo" style={{ justifyContent: "center" }}>
          <div className="lp-nav-orb" />
          <span>Aethera AI</span>
        </div>
        <p className="lp-footer-sub">Built with React · Google Gemini · Node.js</p>
      </footer>
    </div>
  );
}
