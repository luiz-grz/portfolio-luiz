import { useState, useEffect, useRef, useCallback } from "react";
import InteractiveCursor from "./InteractiveCursor.jsx";

/* ─── CSS VARIABLES & GLOBAL STYLES ────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  :root {
    --bg:           #050C1A;
    --bg2:          #07101F;
    --surface:      #0C1828;
    --surface2:     #0F1D30;
    --elec:         #38B6FF;
    --elec-dim:     rgba(56,182,255,0.12);
    --elec-glow:    rgba(56,182,255,0.06);
    --border:       rgba(56,182,255,0.10);
    --border-h:     rgba(56,182,255,0.32);
    --text:         #E8F0FF;
    --text-dim:     rgba(232,240,255,0.50);
    --muted:        #4A6A8A;
    --cyan:         #00D4FF;
    --navy:         #1A3A5C;
    --font-head:    'Syne', sans-serif;
    --font-body:    'Inter', sans-serif;
    --font-mono:    'DM Mono', monospace;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  ::selection { background: rgba(56,182,255,0.25); color: var(--text); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--navy); border-radius: 2px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(56,182,255,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(56,182,255,0); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-8px) rotate(1deg); }
    66%       { transform: translateY(-4px) rotate(-1deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
`;

/* ─── INLINE ICON COMPONENT ────────────────────────────────────────── */
const ICONS = {
  monitor:   ["M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18","M3 15h18"],
  server:    ["M2 9a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2z","M2 15a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2z","M6 9v.01","M6 15v.01"],
  cloud:     ["M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"],
  network:   ["M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 1 1 0 4H4m5-4v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 1 1 0-4h4m0 4v-4","M14 13l4 4m0 0l4-4m-4 4V9"],
  tool:      ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"],
  globe:     ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  github:    ["M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"],
  linkedin:  ["M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z","M2 9h4v12H2z","M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  phone:     ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
  arrow:     ["M5 12h14","M12 5l7 7-7 7"],
  external:  ["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6","M15 3h6v6","M10 14L21 3"],
  code:      ["M16 18l6-6-6-6","M8 6l-6 6 6 6"],
  chevdown:  ["M6 9l6 6 6-6"],
  zap:       ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  star:      ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  users:     ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  book:      ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"],
  cpu:       ["M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 0 1 2 2v4m-6-6v18m0 0h-6m6 0h4a2 2 0 0 0 2-2v-4M3 9v6m18-6v6M3 15h6m12 0h-6M9 3v4m6-4v4M9 17v4m6-4v4","M9 9h6v6H9z"],
  wifi:      ["M5 12.55a11 11 0 0 1 14.08 0","M1.42 9a16 16 0 0 1 21.16 0","M8.53 16.11a6 6 0 0 1 6.95 0","M12 20h.01"],
  db:        ["M12 2a9 3 0 1 0 0 6A9 3 0 0 0 12 2z","M3 5v14a9 3 0 0 0 18 0V5","M3 12a9 3 0 0 0 18 0"],
};

function Icon({ d, size = 20, color = "currentColor", strokeWidth = 1.7 }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

/* ─── HOOKS ─────────────────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCounter(target, duration = 1400, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

/* ─── REVEAL WRAPPER ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}>
      {children}
    </div>
  );
}

/* ─── NAV ────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = ["Skills", "Projetos", "Sobre", "Contato"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 clamp(1.25rem,5vw,3rem)",
      background: scrolled ? "rgba(5,12,26,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(56,182,255,0.08)" : "1px solid transparent",
      transition: "all 0.4s ease",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 64,
    }}>
      <a href="#" style={{
        fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.2rem",
        color: "var(--elec)", textDecoration: "none", letterSpacing: "0.04em",
      }}>LEG.</a>

      {/* Desktop links */}
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}
        className="nav-desktop">
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`}
            style={{
              fontFamily: "var(--font-body)", fontSize: "0.85rem",
              color: "var(--text-dim)", textDecoration: "none", fontWeight: 500,
              letterSpacing: "0.06em", textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--elec)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>
            {l}
          </a>
        ))}
        <a href="mailto:leduardorgarcez@gmail.com"
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.78rem",
            color: "var(--elec)", textDecoration: "none", fontWeight: 500,
            padding: "6px 16px", border: "1px solid rgba(56,182,255,0.3)",
            borderRadius: "6px", letterSpacing: "0.04em",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,182,255,0.08)"; e.currentTarget.style.borderColor = "var(--elec)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(56,182,255,0.3)"; }}>
          Hire Me
        </a>
      </div>

      {/* Hamburger */}
      <button onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none" }}
        className="nav-mobile-btn" aria-label="Menu">
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 22, height: 2, background: "var(--text)", marginBottom: i < 2 ? 5 : 0,
            borderRadius: 2, transition: "all 0.3s",
            transform: open ? (i === 0 ? "rotate(45deg) translate(5px,5px)" : i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "scaleX(0)") : "none",
            opacity: open && i === 1 ? 0 : 1,
          }} />
        ))}
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0,
          background: "rgba(5,12,26,0.97)", backdropFilter: "blur(20px)",
          padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem",
          borderBottom: "1px solid var(--border)",
        }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
              style={{ color: "var(--text)", textDecoration: "none", fontSize: "1.1rem",
                fontWeight: 600, fontFamily: "var(--font-head)" }}>
              {l}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}

/* ─── STAT CARD ─────────────────────────────────────────────────────── */
function StatCard({ value, label, suffix = "", icon }) {
  const [ref, inView] = useInView();
  const count = useCounter(value, 1400, inView);
  return (
    <div ref={ref} style={{
      padding: "1.25rem 1.5rem",
      background: "rgba(56,182,255,0.04)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      display: "flex", alignItems: "center", gap: "1rem",
      transition: "border-color 0.3s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(56,182,255,0.25)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "rgba(56,182,255,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon d={icon} size={18} color="var(--elec)" />
      </div>
      <div>
        <div style={{
          fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.6rem",
          color: "var(--elec)", lineHeight: 1,
        }}>{count}{suffix}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem",
          color: "var(--muted)", marginTop: 3, letterSpacing: "0.06em" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="hero" style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "clamp(5rem,10vh,8rem) clamp(1.25rem,5vw,3rem) clamp(3rem,6vh,5rem)",
      position: "relative", overflow: "hidden",
    }}>
      {/* BG Grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(56,182,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,182,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }} />
      {/* BG Radial glow */}
      <div style={{
        position: "absolute", top: "30%", left: "20%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(56,182,255,0.06) 0%, transparent 70%)",
        zIndex: 0, borderRadius: "50%",
        animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "20%", right: "10%", width: 300, height: 300,
        background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
        zIndex: 0, borderRadius: "50%",
        animation: "float 11s ease-in-out infinite reverse",
      }} />

      <div style={{
        position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", width: "100%",
        display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "center",
      }} className="hero-grid">

        {/* LEFT */}
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px",
            background: "rgba(56,182,255,0.08)", border: "1px solid rgba(56,182,255,0.2)",
            borderRadius: 100, marginBottom: "1.5rem",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: "#00FF88",
              animation: "pulse-glow 2s ease-in-out infinite",
            }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem",
              color: "var(--elec)", letterSpacing: "0.08em" }}>
              Disponível para Oportunidades!
            </span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 600,
            fontSize: "clamp(1.5rem, 4vw, 2.8rem)",
            lineHeight: 1.05, letterSpacing: "-0.02em",
            color: "var(--text)", marginBottom: "1.5rem",
          }}><span style={{ display: "block" }}>Luiz</span>
            <span style={{
              display: "block",
              background: "linear-gradient(90deg, var(--elec), var(--cyan))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Eduardo</span>
            <span style={{ display: "block" }}>Garcez</span>
            </h2>
          <h1 style={{
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
            lineHeight: 1.05, letterSpacing: "-0.02em",
            color: "var(--text)", marginBottom: "1.5rem",
          }}>
            <span style={{ display: "block" }}>Fullstack</span>
            <span style={{
              display: "block",
              background: "linear-gradient(90deg, var(--elec), var(--cyan))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Developer</span>
            <span style={{ display: "block" }}>+ Infra</span>
          </h1>
          
          {/* Subheadline */}
          <p style={{
            fontFamily: "var(--font-body)", fontWeight: 300,
            fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
            color: "var(--text-dim)", maxWidth: 520, lineHeight: 1.8,
            marginBottom: "2.5rem",
          }}>
            Desenvolvo interfaces de alta performance com React e TypeScript, 
            unindo excelência no front-end a uma infraestrutura de redes robusta. 
            Responsável por todas as etapas do projeto, garantindo estabilidade e 
            escalabilidade do cliente ao servidor. Baseado em Niterói, RJ.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a href="#projetos"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px",
                background: "var(--elec)", color: "#050C1A",
                textDecoration: "none", borderRadius: 10,
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9rem",
                transition: "all 0.2s", letterSpacing: "0.02em",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(56,182,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              Ver Projetos <Icon d={ICONS.arrow} size={16} color="#050C1A" />
            </a>
            <a href="https://github.com/luiz-grz" target="_blank" rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px",
                background: "transparent", color: "var(--text)",
                textDecoration: "none", borderRadius: 10,
                border: "1px solid var(--border)",
                fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,182,255,0.4)"; e.currentTarget.style.background = "rgba(56,182,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}>
              <Icon d={ICONS.github} size={16} color="var(--elec)" /> GitHub
            </a>
          </div>

          {/* Stack pills */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "2rem" }}>
            {["React","TypeScript","Supabase","PostgreSQL","Zabbix","Tailwind"].map(s => (
              <span key={s} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                color: "var(--muted)", padding: "4px 10px",
                border: "1px solid rgba(56,182,255,0.08)",
                borderRadius: 6, letterSpacing: "0.04em",
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* RIGHT — Stats */}
        <div style={{
          display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 220,
        }} className="hero-stats">
          <StatCard value={5} label="PROJETOS ENTREGUES" icon={ICONS.star} />
          <StatCard value={3} label="ANOS DE EXPERIÊNCIA" suffix="+" icon={ICONS.zap} />
          <StatCard value={2} label="IDIOMAS FLUENTES" icon={ICONS.globe} />
          <StatCard value={7} label="CURSOS COMPLEMENTARES" icon={ICONS.book} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        animation: "bounce 2.5s ease-in-out infinite",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem",
          color: "var(--muted)", letterSpacing: "0.12em" }}>SCROLL</span>
        <Icon d={ICONS.chevdown} size={16} color="var(--muted)" />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-stats { display: grid !important; grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          .hero-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── BENTO CARD ────────────────────────────────────────────────────── */
function BentoCard({ children, wide = false, tall = false, accent = false, className = "" }) {
  const style = {
    padding: "clamp(1.25rem,3vw,1.75rem)",
    background: accent
      ? "linear-gradient(135deg, rgba(56,182,255,0.10) 0%, rgba(13,24,41,0.95) 60%)"
      : "linear-gradient(135deg, rgba(12,24,40,0.7) 0%, rgba(15,29,48,0.9) 100%)",
    border: `1px solid ${accent ? "rgba(56,182,255,0.22)" : "var(--border)"}`,
    borderRadius: 18, height: "100%",
    backdropFilter: "blur(4px)",
    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
    cursor: "default",
  };
  return (
    <div className={`bento-cell ${wide ? "bento-wide" : ""} ${tall ? "bento-tall" : ""} ${className}`}
      style={style}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(56,182,255,0.35)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(56,182,255,0.10)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = accent ? "rgba(56,182,255,0.22)" : "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}>
      {children}
    </div>
  );
}

/* ─── SKILLS ────────────────────────────────────────────────────────── */
const SKILL_CARDS = [
  {
    icon: ICONS.monitor, title: "Frontend", wide: true,
    desc: "Interfaces reativas e acessíveis com foco em performance e experiência do usuário.",
    tags: ["React 18","TypeScript","Tailwind CSS","Vite","HTML5","CSS3","JavaScript"],
    color: "var(--elec)",
  },
  {
    icon: ICONS.db, title: "Backend & Cloud",
    desc: "Infra escalável, lógica de servidor serverless e segurança granular de dados.",
    tags: ["Supabase","PostgreSQL","Edge Functions","Deno","RLS/RBAC"],
    color: "#7B61FF",
  },
  {
    icon: ICONS.wifi, title: "Infraestrutura",
    desc: "Monitoramento de redes, alertas em tempo real e documentação técnica.",
    tags: ["Zabbix","Grafana","GPON","Switches L2VPN","HTTP","Redes Wireless"],
    color: "#00D4FF",
  },
  {
    icon: ICONS.tool, title: "Ferramentas",
    desc: "Fluxo de trabalho profissional com versionamento, design e produtividade.",
    tags: ["Git/GitHub","Pacote Office","Design Gráfico","VS Code"],
    color: "#00FF88",
  },
  {
    icon: ICONS.globe, title: "Idiomas",
    desc: "Comunicação técnica fluente em ambiente global.",
    tags: ["Português Nativo","English Fluent"],
    color: "#FFB347",
  },
  {
    icon: ICONS.book, title: "Formação",
    desc: "Graduação em andamento com base sólida em computação e sistemas.",
    tags: ["Sistemas de Informação","Unilasalle-RJ","3° Período — 2025"],
    color: "#FF6B9D",
  },
];

function Skills() {
  return (
    <section id="skills" style={{
      padding: "clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)",
      maxWidth: 1200, margin: "0 auto",
    }}>
      <Reveal>
        <div style={{ marginBottom: "3rem" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.72rem",
            color: "var(--elec)", letterSpacing: "0.14em", textTransform: "uppercase",
          }}>Stack & Habilidades</span>
          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)",
            marginTop: "0.5rem", letterSpacing: "-0.02em",
          }}>O que eu domino</h2>
        </div>
      </Reveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
      }} className="bento-grid">
        {SKILL_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.07}
            className={card.wide ? "bento-wide" : ""}>
            <BentoCard accent={i === 0}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${card.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem",
                border: `1px solid ${card.color}30`,
              }}>
                <Icon d={card.icon} size={20} color={card.color} />
              </div>
              <h3 style={{
                fontFamily: "var(--font-head)", fontWeight: 700,
                fontSize: "1.05rem", color: "var(--text)", marginBottom: "0.5rem",
              }}>{card.title}</h3>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.83rem",
                color: "var(--text-dim)", lineHeight: 1.7, marginBottom: "1rem",
              }}>{card.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {card.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.66rem",
                    color: card.color, padding: "3px 9px",
                    background: `${card.color}10`,
                    border: `1px solid ${card.color}25`,
                    borderRadius: 5, letterSpacing: "0.03em",
                  }}>{t}</span>
                ))}
              </div>
            </BentoCard>
          </Reveal>
        ))}
      </div>

      <style>{`
        .bento-grid { grid-template-columns: repeat(3, 1fr); }
        .bento-wide { grid-column: span 2; }
        .bento-tall { grid-row: span 2; }
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bento-wide { grid-column: span 2; }
        }
        @media (max-width: 560px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-wide { grid-column: span 1 !important; }
        }
        .bento-cell { height: 100%; }
      `}</style>
    </section>
  );
}

/* ─── PROJECTS ──────────────────────────────────────────────────────── */
const PROJECTS = [
  {
    num: "01", featured: true,
    tags: ["React","TypeScript","Vite","Supabase","PostgreSQL","RLS","RBAC"],
    title: "Gestão Clínica — Espaço CuidadosMente",
    desc: "Solução fullstack robusta que digitalizou completamente a operação da clínica, automatizando agendamentos, controle financeiro e gestão de pacientes.",
    problem: "Processos 100% manuais em papel",
    result: "Operação totalmente digitalizada",
    link: "https://github.com/luiz-grz/sistemaespacocuidadosamente",
    color: "var(--elec)",
  },
  {
    num: "02", featured: false,
    tags: ["HTML","CSS","JavaScript"],
    title: "Site Institucional — CuidadosMente",
    desc: "Site institucional integrando identidade visual da clínica com funcionalidades de suporte interno e atendimento ao cliente.",
    problem: "Presença digital inexistente",
    result: "Identidade digital completa",
    link: "https://github.com/luiz-grz/espa-o-cuidadosamente",
    color: "#FFB347",
  },
  {
    num: "03", featured: false,
    tags: ["HTML","CSS","JavaScript"],
    title: "Calculadora de IP",
    desc: "Ferramenta para cálculo de sub-redes, máscaras e intervalos de IP, focada em eficiência operacional para profissionais de infraestrutura.",
    problem: "Cálculos manuais lentos",
    result: "Ferramenta ágil e precisa",
    link: "https://github.com/luiz-grz/calculadora-ip",
    color: "#00D4FF",
  },
  {
    num: "04", featured: false,
    tags: ["HTML","CSS","JavaScript"],
    title: "DOGO-WORLD",
    desc: "Jogo 2D com animações de personagens e cenário, demonstrando domínio em estruturação de layout e design moderno.",
    problem: "Aprendizado via projeto prático",
    result: "Jogo publicado e funcional",
    link: "https://github.com/luiz-grz/DOGO-WORLD",
    color: "#7B61FF",
  },
  {
    num: "05", featured: false,
    tags: ["HTML","CSS","JavaScript"],
    title: "Study Math",
    desc: "Plataforma educacional para reforço escolar com design responsivo e elementos interativos, voltada ao aprendizado de matemática.",
    problem: "Ausência de material interativo",
    result: "Site educacional responsivo",
    link: "https://github.com/luiz-grz/StudyMath",
    color: "#00FF88",
  },
];

function ProjectCard({ project, featured }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: featured ? "span 2" : "span 1",
        padding: "clamp(1.5rem,3vw,2rem)",
        background: "linear-gradient(135deg, rgba(12,24,40,0.8) 0%, rgba(8,15,32,0.95) 100%)",
        border: `1px solid ${hovered ? "rgba(56,182,255,0.3)" : "var(--border)"}`,
        borderRadius: 20, position: "relative", overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 24px 60px rgba(56,182,255,0.12)" : "none",
        cursor: "default",
      }}
      className={featured ? "project-featured" : ""}>

      {/* Gradient accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
        opacity: hovered ? 1 : 0, transition: "opacity 0.4s",
      }} />

      {/* Big number BG */}
      <div style={{
        position: "absolute", right: -10, top: -20,
        fontFamily: "var(--font-head)", fontWeight: 800,
        fontSize: "7rem", color: "rgba(56,182,255,0.04)",
        lineHeight: 1, userSelect: "none", transition: "opacity 0.3s",
        opacity: hovered ? 0.6 : 0.3,
      }}>{project.num}</div>

      <div style={{ position: "relative" }}>
        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}>
          {project.tags.map(t => (
            <span key={t} style={{
              fontFamily: "var(--font-mono)", fontSize: "0.63rem",
              color: project.color, padding: "2px 8px",
              background: `${project.color}12`,
              border: `1px solid ${project.color}25`,
              borderRadius: 4,
            }}>{t}</span>
          ))}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: "var(--font-head)", fontWeight: 700,
          fontSize: featured ? "clamp(1.2rem,2.5vw,1.55rem)" : "1.05rem",
          color: "var(--text)", marginBottom: "0.75rem", lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}>{project.title}</h3>

        {/* Desc */}
        <p style={{
          fontFamily: "var(--font-body)", fontSize: "0.85rem",
          color: "var(--text-dim)", lineHeight: 1.7, marginBottom: "1.25rem",
          maxWidth: 540,
        }}>{project.desc}</p>

        {/* Problem → Result */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "1.5rem", flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.72rem",
            color: "var(--muted)", padding: "4px 10px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 6,
          }}>{project.problem}</span>
          <Icon d={ICONS.arrow} size={14} color="var(--muted)" />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.72rem",
            color: project.color, padding: "4px 10px",
            background: `${project.color}0D`,
            border: `1px solid ${project.color}20`,
            borderRadius: 6,
          }}>{project.result}</span>
        </div>

        {/* GitHub link */}
        <a href={project.link} target="_blank" rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-mono)", fontSize: "0.75rem",
            color: project.color, textDecoration: "none",
            padding: "6px 14px",
            border: `1px solid ${project.color}30`,
            borderRadius: 8,
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${project.color}10`;
            e.currentTarget.style.transform = "translateX(3px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateX(0)";
          }}>
          <Icon d={ICONS.github} size={13} color={project.color} />
          Ver no GitHub
          <Icon d={ICONS.external} size={12} color={project.color} />
        </a>
      </div>
      
    </div>
  );
}

function Projects() {
  return (
    <section id="projetos" style={{
      padding: "clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)",
      maxWidth: 1200, margin: "0 auto",
    }}>
      <Reveal>
        <div style={{ marginBottom: "3rem" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.72rem",
            color: "var(--elec)", letterSpacing: "0.14em", textTransform: "uppercase",
          }}>Projetos</span>
          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)",
            marginTop: "0.5rem", letterSpacing: "-0.02em",
          }}>O que eu construí</h2>
        </div>
      </Reveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem",
      }} className="projects-grid">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.num} delay={i * 0.08}
            className={p.featured ? "project-featured-wrap" : ""}>
            <ProjectCard project={p} featured={p.featured} />
          </Reveal>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .projects-grid { grid-template-columns: 1fr !important; }
          .project-featured { grid-column: span 1 !important; }
          .project-featured-wrap { grid-column: span 1 !important; }
        }
        .project-featured-wrap { grid-column: span 2; }
      `}</style>
    </section>
  );
}

/* ─── ABOUT ─────────────────────────────────────────────────────────── */
const TIMELINE = [
  { date: "2025 – Atual", role: "Estagiário CGR", where: "Leste Telecom", desc: "Monitoramento Zabbix/Grafana, escalonamento de incidentes e documentação técnica." },
  { date: "2025 – Atual", role: "Bacharelado em SI", where: "Unilasalle-RJ", desc: "3° Período em Sistemas de Informação, com foco em engenharia de software." },
  { date: "2022 – 2025", role: "Aux. Administrativo", where: "Espaço CuidadosMente", desc: "Suporte administrativo, atendimento e comunicação visual. Projeto de digitalização da clínica." },
  { date: "2021 – 2024", role: "Inglês Completo", where: "Fisk", desc: "Formação completa em inglês, alcançando fluência em contextos técnicos e cotidianos." },
  { date: "2024", role: "Ensino Médio", where: "Colégio Miranda Barroso", desc: "Conclusão do ensino médio com participação em projetos sociais." },
];

function About() {
  return (
    <section id="sobre" style={{
      padding: "clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)",
      maxWidth: 1200, margin: "0 auto",
    }}>
      <Reveal>
        <div style={{ marginBottom: "3rem" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.72rem",
            color: "var(--elec)", letterSpacing: "0.14em", textTransform: "uppercase",
          }}>Sobre Mim</span>
          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 800,
            fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)",
            marginTop: "0.5rem", letterSpacing: "-0.02em",
          }}>Trajetória & Valores</h2>
        </div>
      </Reveal>

      <div style={{
        display: "grid", gridTemplateColumns: "3fr 2fr", gap: "3rem", alignItems: "start",
      }} className="about-grid">
        {/* Text */}
        <div>
          {[
            { label: "Quem sou", text: "Sou um desenvolvedor fullstack em formação, movido pela curiosidade de entender sistemas de ponta a ponta — desde a interface que o usuário toca até a infraestrutura que suporta tudo por baixo. Atualmente estagiário na Leste Telecom e estudante de Sistemas de Informação." },
            { label: "O que me diferencia", text: "Tenho uma rara combinação entre desenvolvimento web moderno (React, TypeScript, Supabase) e conhecimento prático de infraestrutura de redes (Zabbix, GPON, Switches L2VPN). Isso me permite pensar em soluções que vão além da tela." },
            { label: "O que busco", text: "Busco minha primeira vaga como desenvolvedor junior ou estágio técnico onde possa crescer rápido, contribuir com produtos reais e evoluir com um time que valoriza qualidade de código e impacto real." },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div style={{ marginBottom: "1.75rem" }}>
                <span style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                  color: "var(--elec)", letterSpacing: "0.1em",
                  marginBottom: "0.5rem",
                }}>{p.label.toUpperCase()}</span>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.93rem",
                  color: "var(--text-dim)", lineHeight: 1.85,
                }}>{p.text}</p>
              </div>
            </Reveal>
          ))}

          {/* Research */}
          <Reveal delay={0.36}>
            <div style={{
              padding: "1.25rem 1.5rem",
              background: "rgba(56,182,255,0.04)",
              border: "1px solid var(--border)",
              borderRadius: 14, marginTop: "0.5rem",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                color: "var(--elec)", letterSpacing: "0.1em",
                display: "block", marginBottom: "0.75rem",
              }}>PROJETOS SOCIAIS & EXTENSÃO</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  { name: "Inspira Letras", desc: "Ensino de redação para escola pública + artigos científicos" },
                  { name: "Barreira em Foco", desc: "Conscientização sobre racismo ambiental em comunidades vulneráveis" },
                ].map(r => (
                  <div key={r.name} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--elec)", marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--text)", fontWeight: 600 }}>{r.name}</strong>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text-dim)" }}> — {r.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Gradient line */}
          <div style={{
            position: "absolute", left: 11, top: 0, bottom: 0, width: 2,
            background: "linear-gradient(180deg, var(--elec) 0%, rgba(56,182,255,0.1) 100%)",
          }} />

          {TIMELINE.map((item, i) => (
            <Reveal key={i} delay={i * 0.09}>
              <div style={{
                display: "flex", gap: "1.25rem",
                marginBottom: i < TIMELINE.length - 1 ? "1.75rem" : 0,
              }}>
                {/* Dot */}
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "2px solid var(--elec)",
                  background: "var(--bg)",
                  flexShrink: 0, zIndex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 2,
                  transition: "all 0.3s",
                  cursor: "default",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--elec)";
                    e.currentTarget.style.boxShadow = "0 0 0 6px rgba(56,182,255,0.15)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--elec)" }} />
                </div>

                {/* Content */}
                <div>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                    color: "var(--elec)", letterSpacing: "0.08em",
                  }}>{item.date}</span>
                  <div style={{
                    fontFamily: "var(--font-head)", fontWeight: 700,
                    fontSize: "0.92rem", color: "var(--text)", margin: "2px 0",
                  }}>{item.role}</div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: "0.78rem",
                    color: "var(--elec)", marginBottom: "0.35rem",
                  }}>{item.where}</div>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.78rem",
                    color: "var(--text-dim)", lineHeight: 1.6,
                  }}>{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── CONTACT ────────────────────────────────────────────────────────── */
const CONTACTS = [
  { icon: ICONS.mail, label: "Email", value: "leduardorgarcez@gmail.com", href: "mailto:leduardorgarcez@gmail.com", color: "var(--elec)" },
  { icon: ICONS.linkedin, label: "LinkedIn", value: "/in/luizeduardorgarcez", href: "https://www.linkedin.com/in/luizeduardorgarcez/", color: "#0A66C2" },
  { icon: ICONS.github, label: "GitHub", value: "github.com/luiz-grz", href: "https://github.com/luiz-grz", color: "#E8F0FF" },
  { icon: ICONS.phone, label: "WhatsApp", value: "(21) 98426-3590", href: "tel:+5521984263590", color: "#25D366" },
];

function Contact() {
  return (
    <section id="contato" style={{
      padding: "clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background effect */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 0%, rgba(56,182,255,0.025) 50%, transparent 100%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.72rem",
              color: "var(--elec)", letterSpacing: "0.14em", textTransform: "uppercase",
            }}>Contato</span>
            <h2 style={{
              fontFamily: "var(--font-head)", fontWeight: 800,
              fontSize: "clamp(2rem,4vw,3rem)", color: "var(--text)",
              marginTop: "0.5rem", letterSpacing: "-0.02em",
            }}>Vamos construir juntos</h2>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem",
              color: "var(--text-dim)", marginTop: "1rem", maxWidth: 480, margin: "1rem auto 0",
              lineHeight: 1.75,
            }}>
              Estou disponível para estágio, vaga júnior ou colaboração em projetos.
              Entre em contato pelo canal que preferir.
            </p>
          </div>
        </Reveal>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem", maxWidth: 700, margin: "0 auto",
        }} className="contact-grid">
          {CONTACTS.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.08}>
              <a href={c.href} target="_blank" rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1.25rem 1.5rem",
                  background: "rgba(12,24,40,0.8)",
                  border: "1px solid var(--border)",
                  borderRadius: 16, textDecoration: "none",
                  transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateX(6px)";
                  e.currentTarget.style.borderColor = `${c.color}50`;
                  e.currentTarget.style.background = `${c.color}06`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "rgba(12,24,40,0.8)";
                }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${c.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  border: `1px solid ${c.color}25`,
                }}>
                  <Icon d={c.icon} size={20} color={c.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                    color: "var(--muted)", letterSpacing: "0.1em",
                    marginBottom: 3,
                  }}>{c.label.toUpperCase()}</div>
                  <div style={{
                    fontFamily: "var(--font-body)", fontSize: "0.82rem",
                    color: "var(--text)", fontWeight: 500,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{c.value}</div>
                </div>
                <Icon d={ICONS.external} size={14} color="var(--muted)" style={{ marginLeft: "auto", flexShrink: 0 }} />
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── FOOTER ────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      padding: "2rem clamp(1.25rem,5vw,3rem)",
      borderTop: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: "1rem",
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--muted)",
      }}>
        © 2026 Luiz Eduardo Garcez
      </span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--muted)",
        display: "flex", alignItems: "center", gap: "0.5rem",
      }}>
        React · TypeScript · Tailwind
        <span style={{ color: "rgba(56,182,255,0.4)" }}>•</span>
        Niterói, RJ
      </span>
    </footer>
  );
}

/* ─── APP ROOT ──────────────────────────────────────────────────────── */
export default function App() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <InteractiveCursor />
      <Nav />
      <Hero />
      <Skills />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}