import { useState, useEffect, useRef } from "react";
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
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  @media (max-width: 768px) {
    body { -webkit-user-select: text; user-select: text; }
  }

  ::selection { background: rgba(56,182,255,0.25); color: var(--text); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--navy); border-radius: 2px; }

  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50%       { transform: translateX(-50%) translateY(-6px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(56,182,255,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(56,182,255,0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-8px) rotate(1deg); }
    66%       { transform: translateY(-4px) rotate(-1deg); }
  }
`;

/* ─── ICONS ──────────────────────────────────────────────────────────── */
const ICONS = {
  monitor:  ["M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18","M3 15h18"],
  tool:     ["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"],
  globe:    ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],
  github:   ["M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"],
  linkedin: ["M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z","M2 9h4v12H2z","M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  mail:     ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  phone:    ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"],
  arrow:    ["M5 12h14","M12 5l7 7-7 7"],
  external: ["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6","M15 3h6v6","M10 14L21 3"],
  chevdown: ["M6 9l6 6 6-6"],
  zap:      ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  star:     ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  book:     ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"],
  wifi:     ["M5 12.55a11 11 0 0 1 14.08 0","M1.42 9a16 16 0 0 1 21.16 0","M8.53 16.11a6 6 0 0 1 6.95 0","M12 20h.01"],
  db:       ["M12 2a9 3 0 1 0 0 6A9 3 0 0 0 12 2z","M3 5v14a9 3 0 0 0 18 0V5","M3 12a9 3 0 0 0 18 0"],
  play:     ["M5 3l14 9-14 9V3z"],
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

/* ─── GLOBAL BACKGROUND CANVAS ──────────────────────────────────────── */
function GlobalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    const ELEC = "56,182,255";
    const CYAN = "0,212,255";
    const COUNT = window.innerWidth < 768 ? 35 : 65;
    const MAX_DIST = window.innerWidth < 768 ? 80 : 120;
    const IS_MOBILE = window.innerWidth < 768;
    const DPR = Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2);

    let W, H, animId, scanY = 200, t = 0;
    let pts = [];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(DPR, DPR);
    }

    function initPts() {
      pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        r: Math.random() * 1.6 + 0.5,
        ph: Math.random() * Math.PI * 2,
      }));
    }

    function drawGrid() {
      const sz = 80;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${ELEC},0.022)`;
      for (let x = 0; x <= W; x += sz) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += sz) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let x = 0; x <= W; x += sz) {
        for (let y = 0; y <= H; y += sz) {
          const dist = Math.abs(y - scanY);
          const g = Math.max(0, 1 - dist / 90);
          ctx.beginPath();
          ctx.arc(x, y, 1.1 + g * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ELEC},${0.045 + g * 0.22})`;
          ctx.fill();
        }
      }
    }

    function drawScan() {
      const grad = ctx.createLinearGradient(0, scanY - 55, 0, scanY + 55);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, `rgba(${ELEC},0.032)`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 55, W, 110);
      ctx.strokeStyle = `rgba(${ELEC},0.055)`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(W, scanY); ctx.stroke();
    }

    function drawParticles() {
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d >= MAX_DIST) continue;
          const alpha = (1 - d / MAX_DIST) * 0.28;
          const midY = (a.y + b.y) / 2;
          const nearScan = Math.abs(midY - scanY) < 70;
          ctx.strokeStyle = `rgba(${nearScan ? CYAN : ELEC},${alpha + (nearScan ? 0.14 : 0)})`;
          ctx.lineWidth = nearScan ? 0.85 : 0.45;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (const p of pts) {
        const pulse = Math.sin(t * 2.2 + p.ph) * 0.5 + 0.5;
        const nearScan = Math.abs(p.y - scanY) < 70;
        const alpha = 0.32 + pulse * 0.38 + (nearScan ? 0.28 : 0);
        if (nearScan) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${CYAN},0.055)`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 + pulse * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nearScan ? CYAN : ELEC},${alpha})`;
        ctx.fill();
      }
    }

    function drawGlows() {
      const glows = [
        { x: 0.78, y: 0.22, r: 260, c: CYAN,  a: 0.038 },
        { x: 0.18, y: 0.62, r: 300, c: ELEC,  a: 0.028 },
        { x: 0.55, y: 0.85, r: 220, c: CYAN,  a: 0.022 },
      ];
      for (const g of glows) {
        const gx = W * g.x, gy = H * g.y;
        const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, g.r);
        gr.addColorStop(0, `rgba(${g.c},${g.a})`);
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      }
    }

    function tick() {
      t += IS_MOBILE ? 0.005 : 0.007;
      scanY += IS_MOBILE ? 0.45 : 0.65;
      if (scanY > H + 70) scanY = -70;

      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      }

      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawScan();
      drawGlows();
      drawParticles();
      animId = requestAnimationFrame(tick);
    }

    resize();
    initPts();
    tick();

    const onResize = () => {
      cancelAnimationFrame(animId);
      resize();
      pts.forEach(p => {
        if (p.x > W) p.x = Math.random() * W;
        if (p.y > H) p.y = Math.random() * H;
      });
      tick();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
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

/* ─── REVEAL ────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "", style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s,
                   transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      ...style,
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
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      padding: "0 clamp(1.25rem,5vw,3rem)",
      background: scrolled ? "rgba(5,12,26,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(56,182,255,0.08)" : "1px solid transparent",
      transition: "all 0.4s ease",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 64,
    }}>
      <a href="#" style={{
        fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "1.2rem",
        color: "var(--elec)", textDecoration: "none", letterSpacing: "0.04em",
      }}>L\GRZ.</a>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }} className="nav-desktop">
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{
            fontFamily: "var(--font-body)", fontSize: "0.85rem",
            color: "var(--text-dim)", textDecoration: "none", fontWeight: 500,
            letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--elec)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-dim)"}>
            {l}
          </a>
        ))}
      </div>

      <button onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "none" }}
        className="nav-mobile-btn" aria-label="Menu">
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 22, height: 2, background: "var(--text)", marginBottom: i < 2 ? 5 : 0,
            borderRadius: 2, transition: "all 0.3s",
            transform: open
              ? i === 0 ? "rotate(45deg) translate(5px,5px)"
              : i === 2 ? "rotate(-45deg) translate(5px,-5px)" : "scaleX(0)"
              : "none",
            opacity: open && i === 1 ? 0 : 1,
          }} />
        ))}
      </button>

      {open && (
        <div style={{
          position: "fixed", top: 64, left: 0, right: 0,
          background: "rgba(5,12,26,0.97)", backdropFilter: "blur(20px)",
          padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem",
          borderBottom: "1px solid var(--border)", zIndex: 200,
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
        @media (max-width: 480px) {
          .nav-mobile-btn { padding: 12px !important; }
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
      background: "rgba(5,12,26,0.75)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      display: "flex", alignItems: "center", gap: "1rem",
      backdropFilter: "blur(12px)",
      transition: "border-color 0.3s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(56,182,255,0.28)"}
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
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "0.7rem",
          color: "var(--muted)", marginTop: 3, letterSpacing: "0.06em",
        }}>{label}</div>
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
      <div style={{
        position: "absolute", top: "30%", left: "20%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(56,182,255,0.07) 0%, transparent 70%)",
        zIndex: 1, borderRadius: "50%", pointerEvents: "none",
        animation: "float 8s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", top: "20%", right: "10%", width: 300, height: 300,
        background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)",
        zIndex: 1, borderRadius: "50%", pointerEvents: "none",
        animation: "float 11s ease-in-out infinite reverse",
      }} />

      <div style={{
        position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", width: "100%",
        display: "grid", gridTemplateColumns: "1fr auto", gap: "3rem", alignItems: "center",
        overflow: "hidden",
      }} className="hero-grid">
        <div style={{ minWidth: 0 }}>

          <h2 style={{
            fontFamily: "var(--font-head)", fontWeight: 600,
            fontSize: "clamp(1.3rem, 4vw, 2.8rem)",
            lineHeight: 1.05, letterSpacing: "-0.02em",
            color: "var(--text)", marginBottom: "1.5rem",
            wordBreak: "break-word", overflowWrap: "break-word",
          }}>
            <span style={{ display: "block" }}>Luiz</span>
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
            fontSize: "clamp(1.8rem, 5.5vw, 5.2rem)",
            lineHeight: 1.05, letterSpacing: "-0.02em",
            color: "var(--text)", marginBottom: "1.5rem",
            wordBreak: "break-word", overflowWrap: "break-word",
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

          <p style={{
            fontFamily: "var(--font-body)", fontWeight: 300,
            fontSize: "clamp(0.85rem, 2vw, 1.15rem)",
            color: "var(--text-dim)", maxWidth: "100%", lineHeight: 1.8,
            marginBottom: "2.5rem",
          }}>
            Desenvolvo interfaces de alta performance com React e TypeScript,
            unindo excelência no front-end a uma infraestrutura de redes robusta.
            Responsável por todas as etapas do projeto, garantindo estabilidade e
            escalabilidade do cliente ao servidor. Baseado em Niterói, RJ.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a href="#projetos" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px",
              background: "var(--elec)", color: "#050C1A",
              textDecoration: "none", borderRadius: 10,
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9rem",
              transition: "all 0.2s", letterSpacing: "0.02em",
              minHeight: "44px", minWidth: "44px",
              WebkitTapHighlightColor: "transparent",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(56,182,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              Ver Projetos <Icon d={ICONS.arrow} size={16} color="#050C1A" />
            </a>
            <a href="https://github.com/luiz-grz" target="_blank" rel="noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px",
              background: "transparent", color: "var(--text)",
              textDecoration: "none", borderRadius: 10,
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.9rem",
              transition: "all 0.2s",
              minHeight: "44px", minWidth: "44px",
              WebkitTapHighlightColor: "transparent",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(56,182,255,0.4)"; e.currentTarget.style.background = "rgba(56,182,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "transparent"; }}>
              <Icon d={ICONS.github} size={16} color="var(--elec)" /> GitHub
            </a>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "2rem" }}>
            {["React", "TypeScript", "Supabase", "PostgreSQL", "Zabbix", "Tailwind"].map(s => (
              <span key={s} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                color: "var(--muted)", padding: "4px 10px",
                border: "1px solid rgba(56,182,255,0.08)",
                borderRadius: 6, letterSpacing: "0.04em",
                background: "rgba(5,12,26,0.5)",
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", gap: "0.75rem", minWidth: 220,
        }} className="hero-stats">
          <StatCard value={5}  label="PROJETOS ENTREGUES"   suffix="+" icon={ICONS.star} />
          <StatCard value={1}  label="ANO DE EXPERIÊNCIA"   suffix="+" icon={ICONS.zap} />
          <StatCard value={2}  label="IDIOMAS FLUENTES"              icon={ICONS.globe} />
          <StatCard value={7}  label="CURSOS COMPLEMENTARES"         icon={ICONS.book} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-stats { display: grid !important; grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          .hero-stats { grid-template-columns: 1fr !important; }
          .hero-badge { display: none !important; }
          #hero { padding-top: 7rem !important; }
        }
        @media (max-width: 480px) {
          .hero-grid { gap: 1.5rem !important; }
          #hero { padding-top: 6.5rem !important; }
        }
        @media (max-width: 375px) {
          #hero { padding: 6rem 1rem 2rem !important; }
        }
      `}</style>
    </section>
  );
}

/* ─── SECTION WRAPPER ───────────────────────────────────────────────── */
function Section({ id, style = {}, children }) {
  return (
    <section id={id} style={{ position: "relative", zIndex: 1, ...style }}>
      {children}
    </section>
  );
}

/* ─── BENTO CARD ────────────────────────────────────────────────────── */
function BentoCard({ children, accent = false }) {
  return (
    <div style={{
      padding: "clamp(1.25rem,3vw,1.75rem)",
      background: accent ? "rgba(12,22,38,0.82)" : "rgba(8,15,28,0.78)",
      border: `1px solid ${accent ? "rgba(56,182,255,0.22)" : "var(--border)"}`,
      borderRadius: 18, height: "100%",
      backdropFilter: "blur(14px)",
      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
      cursor: "default",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(56,182,255,0.35)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(56,182,255,0.08)";
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
    tags: ["React 18", "TypeScript", "Tailwind CSS", "Vite", "HTML5", "CSS3", "JavaScript"],
    color: "var(--elec)",
  },
  {
    icon: ICONS.db, title: "Backend & Cloud",
    desc: "Infra escalável, lógica de servidor serverless e segurança granular de dados.",
    tags: ["Supabase", "PostgreSQL", "Edge Functions", "Deno", "RLS/RBAC"],
    color: "#7B61FF",
  },
  {
    icon: ICONS.tool, title: "Ferramentas", 
    desc: "Fluxo de trabalho profissional com versionamento, design e produtividade.",
    tags: ["Git/GitHub", "Pacote Office", "Design Gráfico", "VS Code"],
    color: "#00FF88",
  },
  {
    icon: ICONS.wifi, title: "Infraestrutura", wide: true,
    desc: "Monitoramento de redes, alertas em tempo real e documentação técnica.",
    tags: ["Zabbix", "Grafana", "GPON", "Switches L2VPN", "HTTP", "Redes Wireless"],
    color: "#00D4FF",
  },
  
  {
    icon: ICONS.book, title: "Formação", wide: true,
    desc: "Graduação em andamento com base sólida em computação e sistemas.",
    tags: ["Sistemas de Informação", "Unilasalle-RJ", "3° Período — 2026"],
    color: "#FF6B9D",
  },
  {
    icon: ICONS.globe, title: "Idiomas", 
    desc: "Comunicação técnica fluente em ambiente global.",
    tags: ["Português Nativo", "English Fluent"],
    color: "#FFB347",
  },
  
];

function Skills() {
  return (
    <Section id="skills" style={{
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
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bento-wide { grid-column: span 2; }
        }
        @media (max-width: 560px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-wide { grid-column: span 1 !important; }
        }
        @media (max-width: 360px) {
          .bento-grid { gap: 0.5rem !important; }
        }
      `}</style>
    </Section>
  );
}

/* ─── PROJECTS ──────────────────────────────────────────────────────── */

/*
  ── COMO ADICIONAR VÍDEO ──────────────────────────────────────────────
  Adicione a propriedade `videoUrl` em qualquer projeto abaixo.
  Coloque o arquivo em /public/videos/ e referencie como "/videos/nome.mp4".
  Projetos sem videoUrl continuam funcionando normalmente.

  Exemplo:
    videoUrl: "/videos/cuidadosamente-demo.mp4",

  Recomendações para o vídeo:
  - Formato: MP4 (H.264)
  - Resolução: 400×700px (vertical) ou proporcional
  - Tamanho: até 10MB (comprime com HandBrake ou ffmpeg)
  - Duração: 30–90 segundos em loop
*/
const PROJECTS = [
  {
    num: "01",
    tags: ["React", "TypeScript", "Vite", "Supabase", "PostgreSQL", "RLS", "RBAC"],
    title: "Gestão Clínica — Espaço CuidadosaMente",
    desc: "Solução fullstack robusta que digitalizou completamente a operação da clínica, automatizando agendamentos, controle financeiro e gestão de pacientes.",
    problem: "Processos 100% manuais em papel",
    result: "Operação totalmente digitalizada",
    link: "https://github.com/luiz-grz/sistemaespacocuidadosamente",
    color: "var(--elec)",
    videoUrl: "/videos/sistema_espaco.mp4",
  },
  {
    num: "02",
    tags: ["HTML", "CSS", "JavaScript"],
    title: "Study Math",
    desc: "Plataforma educacional para reforço escolar com design responsivo e elementos interativos, voltada ao aprendizado de matemática.",
    problem: "Falta de material interativo",
    result: "Site educacional responsivo",
    link: "https://github.com/luiz-grz/StudyMath",
    liveUrl: "https://reforcostudymath.netlify.app/",
    color: "#00FF88",
    videoUrl: "/videos/Study_math (1).mp4",
  },
  {
    num: "03",
    tags: ["HTML", "CSS", "JavaScript"],
    title: "Site Institucional — CuidadosaMente",
    desc: "Site institucional integrando identidade visual da clínica com funcionalidades de suporte interno e atendimento ao cliente.",
    problem: "Presença digital inexistente",
    result: "Identidade digital completa",
    link: "https://github.com/luiz-grz/espa-o-cuidadosamente",
    liveUrl: "https://espacocuidadosamentesite.netlify.app/",
    color: "#FFB347",
    videoUrl: "/videos/site_espaco.mp4",
  },
  {
    num: "04",
    tags: ["HTML", "CSS", "JavaScript"],
    title: "DOGO-WORLD",
    desc: "Jogo 2D com animações de personagens e cenário, demonstrando domínio em estruturação de layout e design moderno.",
    problem: "Aprendizado via projeto prático",
    result: "Jogo publicado e funcional",
    link: "https://github.com/luiz-grz/DOGO-WORLD",
    liveUrl: "https://the-dogo-world.netlify.app/",
    color: "#7B61FF",
    videoUrl: "/videos/dogo_world.mp4",
  },
  {
    num: "05",
    tags: ["HTML", "CSS", "JavaScript"],
    title: "Calculadora de IP",
    desc: "Ferramenta para cálculo de sub-redes, máscaras e intervalos de IP, focada em eficiência operacional para profissionais de infraestrutura.",
    problem: "Cálculos manuais lentos",
    result: "Ferramenta ágil e precisa",
    link: "https://github.com/luiz-grz/calculadora-ip",
    color: "#00D4FF",
    videoUrl: "/videos/calculadora_ip.mp4",
  },
];

function LinkButton({ href, icon, label, color }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--font-mono)", fontSize: "0.75rem",
      color, textDecoration: "none",
      padding: "8px 14px",
      border: `1px solid ${color}30`,
      borderRadius: 8,
      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      minHeight: "36px",
      minWidth: "36px",
      WebkitTapHighlightColor: "transparent",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.transform = "translateX(3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}>
      <Icon d={icon} size={13} color={color} />
      {label}
      <Icon d={ICONS.external} size={12} color={color} />
    </a>
  );
}

/* ─── VIDEO PANEL ────────────────────────────────────────────────────── */
function VideoPanel({ videoUrl, color, hovered }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [hovered]);

  const corners = [
    { top: 8,    left: 8,  borderWidth: "1px 0 0 1px" },
    { top: 8,    right: 8, borderWidth: "1px 1px 0 0" },
    { bottom: 8, left: 8,  borderWidth: "0 0 1px 1px" },
    { bottom: 8, right: 8, borderWidth: "0 1px 1px 0" },
  ];

  return (
    <div style={{
      position: "relative",
      width: "100%",
      aspectRatio: "16/9",
      borderRadius: 14,
      overflow: "hidden",
      border: `1px solid ${color}30`,
      background: "rgba(5,12,26,0.9)",
      opacity: hovered ? 1 : 0,
      transform: hovered ? "translateX(0) scale(1)" : "translateX(16px) scale(0.97)",
      transition: "opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          borderRadius: 14,
        }}
      />

      {/* scanlines overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 14, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px)",
      }} />

      {/* label DEMO */}
      <div style={{
        position: "absolute", top: 12, left: 12,
        display: "flex", alignItems: "center", gap: 5,
        background: "rgba(5,12,26,0.75)",
        backdropFilter: "blur(8px)",
        padding: "3px 8px", borderRadius: 5,
        border: `1px solid ${color}25`,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
          animation: hovered ? "pulse-glow 1.5s ease-in-out infinite" : "none",
        }} />
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.58rem",
          color, letterSpacing: "0.08em",
        }}>DEMO</span>
      </div>

      {/* cantos decorativos */}
      {corners.map((s, i) => (
        <div key={i} style={{
          position: "absolute", width: 12, height: 12,
          borderColor: color, borderStyle: "solid",
          opacity: 0.5, ...s,
        }} />
      ))}
    </div>
  );
}

/* ─── PROJECT CARD ───────────────────────────────────────────────────── */
function ProjectCard({ project }) {
  const [hovered, setHovered] = useState(false);
  const hasVideo = !!project.videoUrl;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        /* ── FLEXBOX em vez de grid: o filho de vídeo anima width sem
           quebrar o layout ── */
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        padding: "clamp(1.5rem,3vw,2rem)",
        background: "rgba(8,14,28,0.82)",
        border: `1px solid ${hovered ? "rgba(56,182,255,0.3)" : "var(--border)"}`,
        borderRadius: 20,
        position: "relative",
        /* overflow: hidden removido do card — estava cortando a animação
           do painel de vídeo antes da transição terminar               */
        backdropFilter: "blur(14px)",
        transition: "border-color 0.4s, transform 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 24px 60px rgba(56,182,255,0.10)" : "none",
        cursor: "default",
      }}>

      {/* linha topo colorida */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        borderRadius: "20px 20px 0 0",
        background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s",
      }} />

      {/* número decorativo */}
      <div style={{
        position: "absolute", right: hasVideo ? 300 : -10, top: -20,
        fontFamily: "var(--font-head)", fontWeight: 800,
        fontSize: "7rem", color: "rgba(56,182,255,0.04)",
        lineHeight: 1, userSelect: "none",
        opacity: hovered ? 0.6 : 0.3,
        transition: "opacity 0.3s, right 0.5s cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: "none",
      }}>{project.num}</div>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
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

        <h3 style={{
          fontFamily: "var(--font-head)", fontWeight: 700,
          fontSize: "clamp(1.1rem,2.5vw,1.45rem)",
          color: "var(--text)", marginBottom: "0.75rem",
          lineHeight: 1.3, letterSpacing: "-0.01em",
        }}>{project.title}</h3>

        <p style={{
          fontFamily: "var(--font-body)", fontSize: "0.85rem",
          color: "var(--text-dim)", lineHeight: 1.7,
          marginBottom: "1.25rem", maxWidth: 540,
        }}>{project.desc}</p>

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

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <LinkButton href={project.link} icon={ICONS.github} label="Ver no GitHub" color={project.color} />
          {project.liveUrl && (
            <LinkButton href={project.liveUrl} icon={ICONS.globe} label="Ver Site" color={project.color} />
          )}
          {hasVideo && !hovered && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "0.62rem",
              color: "var(--muted)", letterSpacing: "0.06em",
              display: "flex", alignItems: "center", gap: 4,
              opacity: 0.6,
            }}>
              <Icon d={ICONS.play} size={10} color="var(--muted)" />
              hover para demo
            </span>
          )}
        </div>
      </div>

      {/* ── PAINEL DE VÍDEO ──
          width anima de 0 → 296px (280 + 16 de gap).
          overflow:hidden no wrapper garante que o conteúdo interno
          não vaze enquanto ainda está colapsado.                      */}
      {hasVideo && (
        <div style={{
          flexShrink: 0,
          width: hovered ? 436 : 0,
          paddingLeft: hovered ? 16 : 0,
          overflow: "hidden",
          transition: "width 0.5s cubic-bezier(0.16,1,0.3,1), padding-left 0.5s cubic-bezier(0.16,1,0.3,1)",
          alignSelf: "center",
        }}>
          <div style={{ width: 420 }}>
            <VideoPanel
              videoUrl={project.videoUrl}
              color={project.color}
              hovered={hovered}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PROJECTS SECTION ───────────────────────────────────────────────── */
function Projects() {
  return (
    <Section id="projetos" style={{
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

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {PROJECTS.map((p, i) => (
          <Reveal key={p.num} delay={i * 0.08}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </Section>
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
    <Section id="sobre" style={{
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
        <div>
         {/* ── FOTO DE PERFIL ── */}
          <Reveal>
            <div style={{
              display: "flex", alignItems: "center", gap: "1.25rem",
              marginBottom: "2rem", paddingBottom: "2rem",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src="/videos/imagens/eu/1768396144456.jpg"
                  alt="Luiz Eduardo Garcez"
                  style={{
                    width: 190, height: 190,
                    borderRadius: "70%",
                    border: "4px solid var(--elec)",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <span style={{
                  position: "absolute", bottom: 5, right: 19,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#00FF88",
                  border: "2px solid var(--bg)",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }} />
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-head)", fontWeight: 700,
                  fontSize: "1rem", color: "var(--text)", marginBottom: 3,
                }}>Luiz Eduardo Garcez</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                  color: "var(--elec)", marginBottom: 5,
                }}>Fullstack Developer + Infra</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  color: "var(--muted)",
                }}>Niterói, RJ</div>
              </div>
            </div>
          </Reveal>

          {[
            { label: "Quem sou", text: "Sou um desenvolvedor fullstack em formação, movido pela curiosidade de entender sistemas de ponta a ponta — desde a interface que o usuário toca até a infraestrutura que suporta tudo por baixo. Atualmente estagiário na Leste Telecom e estudante de Sistemas de Informação." },
            { label: "O que me diferencia", text: "Tenho uma rara combinação entre desenvolvimento web moderno e conhecimento prático de infraestrutura de redes. Isso me permite pensar em soluções que vão além da tela." },
            { label: "O que busco", text: "Sou movido por desafios reais e pela vontade de construir coisas que fazem diferença. Estou sempre aberto a novas oportunidades, colaborações e conversas sobre tecnologia. Se tiver um projeto ou uma ideia, pode me chamar." },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div style={{ marginBottom: "1.75rem" }}>
                <span style={{
                  display: "inline-block",
                  fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                  color: "var(--elec)", letterSpacing: "0.1em", marginBottom: "0.5rem",
                }}>{p.label.toUpperCase()}</span>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.93rem",
                  color: "var(--text-dim)", lineHeight: 1.85,
                }}>{p.text}</p>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.36}>
            <div style={{
              padding: "1.25rem 1.5rem",
              background: "rgba(8,14,28,0.75)",
              border: "1px solid var(--border)",
              borderRadius: 14, marginTop: "0.5rem",
              backdropFilter: "blur(12px)",
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
          <div style={{
            position: "absolute", left: 11, top: 0, bottom: 0, width: 2,
            background: "linear-gradient(180deg, var(--elec) 0%, rgba(56,182,255,0.08) 100%)",
          }} />

          {TIMELINE.map((item, i) => (
            <Reveal key={i} delay={i * 0.09}>
              <div style={{
                display: "flex", gap: "1.25rem",
                marginBottom: i < TIMELINE.length - 1 ? "1.75rem" : 0,
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "2px solid var(--elec)",
                  background: "var(--bg)",
                  flexShrink: 0, zIndex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginTop: 2, transition: "all 0.3s", cursor: "default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--elec)"; e.currentTarget.style.boxShadow = "0 0 0 6px rgba(56,182,255,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--elec)" }} />
                </div>
                <div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--elec)", letterSpacing: "0.08em" }}>{item.date}</span>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.92rem", color: "var(--text)", margin: "2px 0" }}>{item.role}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--elec)", marginBottom: "0.35rem" }}>{item.where}</div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--text-dim)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
        @media (max-width: 480px) {
          .about-grid { gap: 1.5rem !important; }
        }
      `}</style>
    </Section>
  );
}

/* ─── CONTACT ────────────────────────────────────────────────────────── */
const CONTACTS = [
  { icon: ICONS.mail,     label: "Email",    value: "luizeduardogrz@gmail.com",    href: "mailto:luizeduardogrz@gmail.com",               color: "var(--elec)" },
  { icon: ICONS.linkedin, label: "LinkedIn", value: "/in/luizeduardorgarcez",      href: "https://www.linkedin.com/in/luizeduardorgarcez/", color: "#0A66C2" },
  { icon: ICONS.github,   label: "GitHub",   value: "github.com/luiz-grz",         href: "https://github.com/luiz-grz",                   color: "#E8F0FF" },
  { icon: ICONS.phone,    label: "WhatsApp", value: "(21) 98426-3590",             href: "tel:+5521984263590",                             color: "#25D366" },
];

function Contact() {
  return (
    <Section id="contato" style={{
      padding: "clamp(4rem,8vw,7rem) clamp(1.25rem,5vw,3rem)",
      position: "relative", overflow: "hidden",
    }}>
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
              Estou aberto a novas conexões, projetos e oportunidades que me desafiem a crescer. 
              Se quiser conversar sobre tecnologia, colaborar em algo ou apenas trocar uma ideia.
            </p>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: "0.95rem",
              color: "var(--text-dim)", marginTop: "1rem", maxWidth: 480, margin: "1rem auto 0",
              lineHeight: 1.75,
            }}>
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
              <a href={c.href} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1.25rem 1.5rem",
                background: "rgba(8,14,28,0.80)",
                border: "1px solid var(--border)",
                borderRadius: 16, textDecoration: "none",
                backdropFilter: "blur(14px)",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                minHeight: "80px",
                WebkitTapHighlightColor: "transparent",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.borderColor = `${c.color}50`; e.currentTarget.style.background = `${c.color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "rgba(8,14,28,0.80)"; }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${c.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, border: `1px solid ${c.color}25`,
                }}>
                  <Icon d={c.icon} size={20} color={c.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 3 }}>{c.label.toUpperCase()}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.value}</div>
                </div>
                <Icon d={ICONS.external} size={14} color="var(--muted)" style={{ marginLeft: "auto", flexShrink: 0 }} />
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 0.75rem !important; }
        }
        @media (max-width: 360px) {
          .contact-grid { gap: 0.5rem !important; }
        }
      `}</style>
    </Section>
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
      position: "relative", zIndex: 1,
      background: "rgba(5,12,26,0.6)",
      backdropFilter: "blur(12px)",
    }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--muted)" }}>
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
    <>
      <GlobalBackground />
      <InteractiveCursor />
      <div style={{ minHeight: "100vh", position: "relative" }}>
        <Nav />
        <Hero />
        <Skills />
        <Projects />
        <About />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
