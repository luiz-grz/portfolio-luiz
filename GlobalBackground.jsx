import { useEffect, useRef } from "react";

export default function InteractiveCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const hideRef = useRef(null);
  const isHovering = useRef(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    // Esconder cursor nativo
    const style = document.createElement("style");
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      dot.style.opacity = "1";
      ringEl.style.opacity = "1";
      clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => {
        dot.style.opacity = "0";
        ringEl.style.opacity = "0";
      }, 2000);
    };

    const onLeave = () => {
      dot.style.opacity = "0";
      ringEl.style.opacity = "0";
    };

    const onEnter = () => {
      dot.style.opacity = "1";
      ringEl.style.opacity = "1";
    };

    // Detecta elementos interativos para expandir o anel
    const onMouseOver = (e) => {
      const el = e.target.closest("a, button, [data-cursor]");
      if (el) {
        isHovering.current = true;
        ringEl.style.width = "52px";
        ringEl.style.height = "52px";
        ringEl.style.borderColor = "rgba(56,182,255,0.7)";
        ringEl.style.background = "rgba(56,182,255,0.06)";
        dot.style.transform = `translate(calc(-50% + ${mouse.current.x}px), calc(-50% + ${mouse.current.y}px)) scale(1.5)`;
      }
    };

    const onMouseOut = (e) => {
      const el = e.target.closest("a, button, [data-cursor]");
      if (el) {
        isHovering.current = false;
        ringEl.style.width = "32px";
        ringEl.style.height = "32px";
        ringEl.style.borderColor = "rgba(56,182,255,0.35)";
        ringEl.style.background = "transparent";
      }
    };

    const animate = () => {
      // Dot segue o mouse imediatamente
      dot.style.transform = `translate(calc(-50% + ${mouse.current.x}px), calc(-50% + ${mouse.current.y}px))`;

      // Ring segue com easing suave
      ring.current.x += (mouse.current.x - ring.current.x) * 0.18;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.18;
      ringEl.style.transform = `translate(calc(-50% + ${ring.current.x}px), calc(-50% + ${ring.current.y}px))`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(hideRef.current);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Ponto central */}
      <div ref={dotRef} style={{
        position: "fixed", top: 0, left: 0,
        width: 7, height: 7, borderRadius: "50%",
        background: "rgba(56,182,255,0.95)",
        boxShadow: "0 0 10px rgba(56,182,255,0.8), 0 0 20px rgba(56,182,255,0.3)",
        pointerEvents: "none", zIndex: 99999,
        opacity: 0,
        transition: "opacity 0.3s, transform 0.05s",
        willChange: "transform",
      }} />

      {/* Anel que segue */}
      <div ref={ringRef} style={{
        position: "fixed", top: 0, left: 0,
        width: 32, height: 32, borderRadius: "50%",
        border: "1.5px solid rgba(56,182,255,0.35)",
        background: "transparent",
        pointerEvents: "none", zIndex: 99998,
        opacity: 0,
        transition: "opacity 0.3s, width 0.3s, height 0.3s, border-color 0.3s, background 0.3s",
        willChange: "transform",
      }} />
    </>
  );
}