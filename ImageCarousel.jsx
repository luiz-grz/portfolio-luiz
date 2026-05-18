import { useState, useEffect, useRef, useCallback } from "react";

/* ─── MOCK DATA ─────────────────────────────────────────────────────── */
const CAROUSEL_ITEMS = [
  {
    id: 1,
    title: "Dashboard Principal",
    description: "Visão geral completa do sistema com métricas em tempo real",
    category: "Dashboard",
    imagePath: "./imagens/prints/{175343BD-D7BA-4782-B308-ED7F13C47B95}.png",
  },
  {
    id: 2,
    title: "Agendamentos",
    description: "Gerenciamento intuitivo de consultas e horários",
    category: "Agendamentos",
    imagePath: "./imagens/prints/{47F46787-8565-43DB-8C4F-69443C2EA45F}.png",
  },
  {
    id: 3,
    title: "Pacientes",
    description: "Base de dados completa e organizada dos pacientes",
    category: "Gerenciamento",
    imagePath: "./imagens/prints/{544F146B-2388-45AC-8DB2-C4504EE20FFA}.png",
  },
  {
    id: 4,
    title: "Controle Financeiro",
    description: "Dashboard financeiro com relatórios detalhados",
    category: "Financeiro",
    imagePath: "./imagens/prints/{5DDBF175-5D1B-4CAC-B766-B95EE94213B0}.png",
  },
  {
    id: 5,
    title: "Segurança & RBAC",
    description: "Sistema de permissões granulares e segurança de dados",
    category: "Segurança / RBAC",
    imagePath: "./imagens/prints/{9391D8C3-3F05-4125-BB0B-AB777F38DA7D}.png",
  },
  {
    id: 6,
    title: "Relatórios",
    description: "Geração de relatórios customizados em tempo real",
    category: "Dashboard",
    imagePath: "./imagens/prints/{B267B5B3-6180-47D3-B504-BEC623016562}.png",
  },
  {
    id: 7,
    title: "Configurações",
    description: "Painel completo de configurações do sistema",
    category: "Admin",
    imagePath: "./imagens/prints/{EA15BEBA-DBBD-4FE5-A294-2729F404DB6D}.png",
  },
  {
    id: 8,
    title: "Notificações",
    description: "Sistema de alertas e notificações em tempo real",
    category: "Dashboard",
    imagePath: "./imagens/prints/{F554BDF3-6696-408F-98D5-7472D2DE0FB7}.png",
  },
];

const CATEGORIES = [
  { label: "Todas", value: "all" },
  { label: "Dashboard", value: "Dashboard" },
  { label: "Agendamentos", value: "Agendamentos" },
  { label: "Financeiro", value: "Financeiro" },
  { label: "Segurança", value: "Segurança / RBAC" },
  { label: "Admin", value: "Admin" },
];

/* ─── CATEGORY COLOR MAP ─────────────────────────────────────────────── */
const CAT_COLORS = {
  "Dashboard":      "#38B6FF",
  "Agendamentos":   "#00D4FF",
  "Gerenciamento":  "#7B61FF",
  "Financeiro":     "#00FF88",
  "Segurança / RBAC": "#FF6B9D",
  "Admin":          "#FFB347",
};

/* ─── ICONS ──────────────────────────────────────────────────────────── */
const IconChevLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconChevRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconPlay = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const IconPause = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);
const IconExpand = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

/* ─── PROGRESS BAR ───────────────────────────────────────────────────── */
function ProgressBar({ active, duration = 5000, isPaused }) {
  const [width, setWidth] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const pausedAtRef = useRef(null);

  useEffect(() => {
    setWidth(0);
    startRef.current = null;
    cancelAnimationFrame(rafRef.current);
    if (!active) return;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setWidth(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, duration]);

  return (
    <div style={{ height: 2, background: "rgba(56,182,255,0.12)", borderRadius: 1, overflow: "hidden", flex: 1 }}>
      <div style={{
        height: "100%", width: `${width}%`,
        background: "linear-gradient(90deg, var(--elec), var(--cyan))",
        borderRadius: 1,
        transition: isPaused ? "none" : undefined,
        boxShadow: "0 0 8px rgba(56,182,255,0.6)",
      }} />
    </div>
  );
}

/* ─── LIGHTBOX ───────────────────────────────────────────────────────── */
function Lightbox({ item, onClose, onPrev, onNext }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2,6,14,0.94)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "lbFadeIn 0.25s ease",
      }}>
      <style>{`
        @keyframes lbFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lbScaleIn { from { transform: scale(0.93); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>

      {/* Close */}
      <button onClick={onClose} style={{
        position: "absolute", top: 24, right: 24,
        width: 40, height: 40, borderRadius: "50%",
        background: "rgba(56,182,255,0.1)",
        border: "1px solid rgba(56,182,255,0.25)",
        color: "var(--elec)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, zIndex: 10,
      }}>✕</button>

      {/* Prev */}
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{
        position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
        width: 48, height: 48, borderRadius: "50%",
        background: "rgba(56,182,255,0.1)",
        border: "1px solid rgba(56,182,255,0.25)",
        color: "var(--elec)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}><IconChevLeft /></button>

      {/* Image */}
      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: "88vw", maxHeight: "85vh",
        animation: "lbScaleIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        position: "relative",
      }}>
        <img src={item.imagePath} alt={item.title} style={{
          maxWidth: "88vw", maxHeight: "80vh",
          objectFit: "contain", borderRadius: 12,
          border: "1px solid rgba(56,182,255,0.2)",
          boxShadow: "0 40px 120px rgba(56,182,255,0.15)",
          display: "block",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: 0, right: 0,
          textAlign: "center",
          fontFamily: "var(--font-mono)", fontSize: "0.75rem",
          color: "var(--text-dim)",
        }}>
          <span style={{ color: "var(--elec)", marginRight: 8 }}>{item.title}</span>
          {item.description}
        </div>
      </div>

      {/* Next */}
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{
        position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
        width: 48, height: 48, borderRadius: "50%",
        background: "rgba(56,182,255,0.1)",
        border: "1px solid rgba(56,182,255,0.25)",
        color: "var(--elec)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}><IconChevRight /></button>
    </div>
  );
}

/* ─── MAIN CAROUSEL ──────────────────────────────────────────────────── */
export default function ImageCarousel() {
  const [activeIndex, setActiveIndex]       = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isPlaying, setIsPlaying]           = useState(true);
  const [prevIndex, setPrevIndex]           = useState(null);
  const [direction, setDirection]           = useState(1); // 1=fwd, -1=back
  const [isAnimating, setIsAnimating]       = useState(false);
  const [lightboxOpen, setLightboxOpen]     = useState(false);
  const [spotlight, setSpotlight]           = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart]         = useState(null);
  const timerRef   = useRef(null);
  const stageRef   = useRef(null);
  const tickerRef  = useRef(0);

  const filtered = activeCategory === "all"
    ? CAROUSEL_ITEMS
    : CAROUSEL_ITEMS.filter(i => i.category === activeCategory);

  const safeIndex = Math.min(activeIndex, filtered.length - 1);
  const current   = filtered[safeIndex] ?? filtered[0];
  const accentColor = CAT_COLORS[current?.category] ?? "var(--elec)";

  /* ── navigation ── */
  const goTo = useCallback((idx, dir = 1) => {
    if (isAnimating || filtered.length <= 1) return;
    setIsAnimating(true);
    setPrevIndex(safeIndex);
    setDirection(dir);
    setTimeout(() => {
      setActiveIndex(((idx % filtered.length) + filtered.length) % filtered.length);
      setIsAnimating(false);
      setPrevIndex(null);
    }, 420);
  }, [isAnimating, filtered.length, safeIndex]);

  const goPrev = useCallback(() => goTo(safeIndex - 1, -1), [goTo, safeIndex]);
  const goNext = useCallback(() => goTo(safeIndex + 1,  1), [goTo, safeIndex]);

  /* ── autoplay ── */
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isPlaying || filtered.length <= 1) return;
    timerRef.current = setInterval(() => goNext(), 5000);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, goNext, filtered.length, activeIndex]);

  /* ── category change ── */
  const changeCategory = (cat) => {
    setActiveCategory(cat);
    setActiveIndex(0);
    setPrevIndex(null);
  };

  /* ── mouse spotlight on stage ── */
  const handleMouseMove = (e) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  /* ── touch ── */
  const onTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchEnd   = (e) => {
    if (touchStart === null) return;
    const d = touchStart - e.changedTouches[0].clientX;
    if (d > 50) goNext();
    else if (d < -50) goPrev();
    setTouchStart(null);
  };

  /* ── keyboard ── */
  useEffect(() => {
    const fn = (e) => {
      if (lightboxOpen) return;
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [goPrev, goNext, lightboxOpen]);

  if (!current) return null;

  return (
    <>
      {/* ── STYLES ───────────────────────────────────────────────── */}
      <style>{`
        .ic-root { width: 100%; font-family: var(--font-body); }

        /* ── category tabs ── */
        .ic-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .ic-tab {
          padding: 5px 14px; border-radius: 100px; cursor: pointer;
          font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.06em;
          border: 1px solid; white-space: nowrap;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ic-tab:hover { transform: translateY(-1px); }

        /* ── stage ── */
        .ic-stage {
          position: relative; border-radius: 16px; overflow: hidden;
          aspect-ratio: 16/9; cursor: crosshair;
          background: #020810;
          border: 1px solid rgba(56,182,255,0.12);
        }

        /* ── slide transitions ── */
        .ic-slide {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(12px,2.5vw,24px);
        }
        .ic-slide-enter-fwd  { animation: slideEnterFwd  0.42s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ic-slide-exit-fwd   { animation: slideExitFwd   0.42s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ic-slide-enter-back { animation: slideEnterBack 0.42s cubic-bezier(0.16,1,0.3,1) forwards; }
        .ic-slide-exit-back  { animation: slideExitBack  0.42s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes slideEnterFwd  { from { transform: translateX(6%) scale(0.97); opacity: 0; filter: blur(4px); } to { transform: none; opacity: 1; filter: none; } }
        @keyframes slideExitFwd   { from { transform: none; opacity: 1; filter: none; } to { transform: translateX(-4%) scale(0.97); opacity: 0; filter: blur(4px); } }
        @keyframes slideEnterBack { from { transform: translateX(-6%) scale(0.97); opacity: 0; filter: blur(4px); } to { transform: none; opacity: 1; filter: none; } }
        @keyframes slideExitBack  { from { transform: none; opacity: 1; filter: none; } to { transform: translateX(4%) scale(0.97); opacity: 0; filter: blur(4px); } }

        /* ── nav buttons ── */
        .ic-nav {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(5,12,26,0.7);
          border: 1px solid rgba(56,182,255,0.25);
          color: var(--elec); cursor: pointer; z-index: 20;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px);
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          opacity: 0;
        }
        .ic-stage:hover .ic-nav { opacity: 1; }
        .ic-nav:hover {
          background: rgba(56,182,255,0.18) !important;
          border-color: rgba(56,182,255,0.55) !important;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 20px rgba(56,182,255,0.25);
        }
        .ic-nav-l { left: 14px; }
        .ic-nav-r { right: 14px; }

        /* ── expand btn ── */
        .ic-expand {
          position: absolute; top: 12px; right: 12px; z-index: 20;
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(5,12,26,0.7); backdrop-filter: blur(10px);
          border: 1px solid rgba(56,182,255,0.2);
          color: var(--text-dim); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; opacity: 0;
        }
        .ic-stage:hover .ic-expand { opacity: 1; }
        .ic-expand:hover { color: var(--elec); border-color: rgba(56,182,255,0.5); background: rgba(56,182,255,0.12); }

        /* ── counter chip ── */
        .ic-counter {
          position: absolute; top: 12px; left: 12px; z-index: 20;
          padding: 4px 10px; border-radius: 100px;
          background: rgba(5,12,26,0.75); backdrop-filter: blur(10px);
          border: 1px solid rgba(56,182,255,0.15);
          font-family: var(--font-mono); font-size: 0.65rem;
          color: var(--text-dim); letter-spacing: 0.08em;
          opacity: 0; transition: opacity 0.2s;
        }
        .ic-stage:hover .ic-counter { opacity: 1; }

        /* ── progress bar row ── */
        .ic-progress-row { display: flex; gap: 4px; margin-bottom: 14px; }

        /* ── thumbnails ── */
        .ic-thumbs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .ic-thumbs::-webkit-scrollbar { height: 3px; }
        .ic-thumbs::-webkit-scrollbar-thumb { background: rgba(56,182,255,0.2); border-radius: 2px; }
        .ic-thumb {
          flex-shrink: 0; width: 72px; height: 46px; border-radius: 8px;
          overflow: hidden; cursor: pointer; position: relative;
          border: 1.5px solid transparent;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .ic-thumb:hover { transform: translateY(-2px); }
        .ic-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .ic-thumb-overlay {
          position: absolute; inset: 0;
          background: rgba(2,6,14,0.45);
          transition: opacity 0.2s;
        }
        .ic-thumb:hover .ic-thumb-overlay,
        .ic-thumb.active .ic-thumb-overlay { opacity: 0; }

        /* ── meta row ── */
        .ic-meta { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-top: 14px; }
        .ic-meta-text { flex: 1; min-width: 0; }
        .ic-meta-title { font-family: var(--font-head); font-weight: 700; font-size: 1rem; color: var(--text); margin-bottom: 4px; }
        .ic-meta-desc  { font-family: var(--font-body); font-size: 0.8rem; color: var(--text-dim); line-height: 1.5; }
        .ic-meta-badge {
          flex-shrink: 0; font-family: var(--font-mono); font-size: 0.62rem;
          padding: 3px 10px; border-radius: 100px; letter-spacing: 0.06em;
          border: 1px solid; margin-top: 2px;
        }
        .ic-controls { display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .ic-play-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 100px; cursor: pointer;
          background: rgba(56,182,255,0.08); border: 1px solid rgba(56,182,255,0.2);
          color: var(--text-dim); font-family: var(--font-mono); font-size: 0.65rem;
          letter-spacing: 0.06em; transition: all 0.2s;
        }
        .ic-play-btn:hover { background: rgba(56,182,255,0.15); color: var(--elec); border-color: rgba(56,182,255,0.4); }

        @media (max-width: 600px) {
          .ic-thumbs { display: none; }
          .ic-meta { flex-direction: column; }
          .ic-nav { opacity: 1; }
          .ic-counter { opacity: 1; }
        }
      `}</style>

      <div className="ic-root">
        {/* ── CATEGORY TABS ─────────────────────────────────────── */}
        <div className="ic-tabs">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.value;
            const col = CAT_COLORS[cat.value] ?? "var(--elec)";
            return (
              <button key={cat.value} className="ic-tab" onClick={() => changeCategory(cat.value)}
                style={{
                  color:       isActive ? "#050C1A" : "var(--text-dim)",
                  background:  isActive ? col : "rgba(56,182,255,0.05)",
                  borderColor: isActive ? col : "rgba(56,182,255,0.15)",
                  boxShadow:   isActive ? `0 0 14px ${col}50` : "none",
                }}>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── PROGRESS BARS ─────────────────────────────────────── */}
        <div className="ic-progress-row">
          {filtered.map((_, i) => (
            <ProgressBar
              key={`${activeCategory}-${i}`}
              active={i === safeIndex && isPlaying}
              duration={5000}
              isPaused={!isPlaying}
            />
          ))}
        </div>

        {/* ── STAGE ─────────────────────────────────────────────── */}
        <div
          className="ic-stage"
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}>

          {/* Dynamic spotlight that follows mouse */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: `radial-gradient(circle 280px at ${spotlight.x}% ${spotlight.y}%, ${accentColor}0E 0%, transparent 70%)`,
            transition: "background 0.1s",
          }} />

          {/* Ambient glow matching current slide category */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
            background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${accentColor}08 0%, transparent 70%)`,
            transition: "background 0.6s ease",
          }} />

          {/* Scan line effect */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none", overflow: "hidden",
            borderRadius: "inherit",
          }}>
            <div style={{
              position: "absolute", left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`,
              animation: "ic-scan 6s linear infinite",
              top: 0,
            }} />
          </div>
          <style>{`
            @keyframes ic-scan {
              0%   { top: -1px; opacity: 0.7; }
              40%  { opacity: 0.3; }
              100% { top: 101%; opacity: 0; }
            }
          `}</style>

          {/* Exiting slide */}
          {isAnimating && prevIndex !== null && filtered[prevIndex] && (
            <div className={`ic-slide ic-slide-exit-${direction > 0 ? "fwd" : "back"}`} style={{ zIndex: 2 }}>
              {/* BG blur */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url('${filtered[prevIndex].imagePath}')`,
                backgroundSize: "cover", backgroundPosition: "center",
                filter: "blur(12px) brightness(0.2)", zIndex: 0,
              }} />
              <img src={filtered[prevIndex].imagePath} alt=""
                style={{ position: "relative", zIndex: 1, maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 10 }} />
            </div>
          )}

          {/* Active slide */}
          <div
            className={`ic-slide ${isAnimating ? `ic-slide-enter-${direction > 0 ? "fwd" : "back"}` : ""}`}
            style={{ zIndex: 3 }}>
            {/* BG blur */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url('${current.imagePath}')`,
              backgroundSize: "cover", backgroundPosition: "center",
              filter: "blur(14px) brightness(0.18)", zIndex: 0,
            }} />
            {/* Edge vignette */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
              background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(2,6,14,0.7) 100%)",
            }} />
            <img
              src={current.imagePath}
              alt={current.title}
              style={{
                position: "relative", zIndex: 2,
                maxWidth: "94%", maxHeight: "92%",
                objectFit: "contain", borderRadius: 10,
                boxShadow: `0 16px 60px ${accentColor}22, 0 4px 24px rgba(0,0,0,0.6)`,
                border: `1px solid ${accentColor}30`,
                transition: "box-shadow 0.6s, border-color 0.6s",
                display: "block",
              }}
            />
          </div>

          {/* Counter */}
          <div className="ic-counter">{safeIndex + 1} / {filtered.length}</div>

          {/* Expand */}
          <button className="ic-expand" onClick={() => setLightboxOpen(true)} title="Ampliar">
            <IconExpand />
          </button>

          {/* Nav arrows */}
          <button className="ic-nav ic-nav-l" onClick={goPrev} aria-label="Anterior">
            <IconChevLeft />
          </button>
          <button className="ic-nav ic-nav-r" onClick={goNext} aria-label="Próximo">
            <IconChevRight />
          </button>

          {/* Bottom gradient fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 64,
            background: "linear-gradient(transparent, rgba(2,6,14,0.5))",
            zIndex: 4, pointerEvents: "none",
          }} />
        </div>

        {/* ── META ──────────────────────────────────────────────── */}
        <div className="ic-meta">
          <div className="ic-meta-text">
            <div className="ic-meta-title">{current.title}</div>
            <div className="ic-meta-desc">{current.description}</div>
          </div>
          <div className="ic-meta-badge" style={{
            color: accentColor,
            borderColor: `${accentColor}40`,
            background: `${accentColor}10`,
            boxShadow: `0 0 12px ${accentColor}20`,
          }}>
            {current.category}
          </div>
        </div>

        {/* ── CONTROLS + THUMBNAILS ROW ─────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 12, flexWrap: "wrap" }}>
          {/* Play / pause */}
          <button className="ic-play-btn" onClick={() => setIsPlaying(p => !p)}>
            {isPlaying ? <IconPause /> : <IconPlay />}
            {isPlaying ? "Pausar" : "Reproduzir"}
          </button>

          {/* Dot indicators */}
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {filtered.map((_, i) => (
              <button key={i} onClick={() => goTo(i, i > safeIndex ? 1 : -1)}
                style={{
                  width: i === safeIndex ? 22 : 6,
                  height: 6, borderRadius: 3, padding: 0,
                  background: i === safeIndex ? accentColor : "rgba(56,182,255,0.18)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow: i === safeIndex ? `0 0 8px ${accentColor}70` : "none",
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ── THUMBNAILS ────────────────────────────────────────── */}
        <div className="ic-thumbs" style={{ marginTop: 12 }}>
          {filtered.map((item, i) => {
            const isActive = i === safeIndex;
            const col = CAT_COLORS[item.category] ?? "var(--elec)";
            return (
              <div key={item.id}
                className={`ic-thumb${isActive ? " active" : ""}`}
                onClick={() => goTo(i, i > safeIndex ? 1 : -1)}
                style={{
                  borderColor: isActive ? col : "transparent",
                  boxShadow: isActive ? `0 0 12px ${col}50` : "none",
                }}>
                <img src={item.imagePath} alt={item.title}
                  style={{ filter: isActive ? "none" : "brightness(0.55) saturate(0.6)", transition: "filter 0.3s" }} />
                <div className="ic-thumb-overlay" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LIGHTBOX ──────────────────────────────────────────────── */}
      {lightboxOpen && (
        <Lightbox
          item={current}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => { goPrev(); }}
          onNext={() => { goNext(); }}
        />
      )}
    </>
  );
}