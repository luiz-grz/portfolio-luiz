import { useEffect, useRef } from "react";

export default function InteractiveCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const followerRef_pos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);

  // Constantes de configuração
  const FOLLOWER_DELAY = 0.25; // Quanto menor, mais responsivo (0-1)
  const CURSOR_SIZE = 8; // Tamanho do ponto central em px
  const FOLLOWER_SIZE = 32; // Tamanho do círculo que segue em px
  const HIDE_DELAY = 1500; // Tempo em ms para esconder cursor quando inativo

  // Estilo do cursor customizado (aplicado ao body)
  const cursorStyles = `
    * {
      cursor: none !important;
    }
    body {
      cursor: none !important;
    }
  `;

  // Atualizar posição do mouse
  const handleMouseMove = (e) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;

    // Mostrar cursor quando mouse se move
    if (cursorRef.current && followerRef.current) {
      cursorRef.current.style.opacity = "1";
      followerRef.current.style.opacity = "1";
    }

    // Resetar timer de inatividade
    if (animationFrameRef.current) {
      clearTimeout(animationFrameRef.current.hideTimeout);
    }
    animationFrameRef.current.hideTimeout = setTimeout(() => {
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.opacity = "0";
        followerRef.current.style.opacity = "0";
      }
    }, HIDE_DELAY);
  };

  // Quando mouse sai da janela
  const handleMouseLeave = () => {
    if (cursorRef.current && followerRef.current) {
      cursorRef.current.style.opacity = "0";
      followerRef.current.style.opacity = "0";
    }
  };

  // Quando mouse volta pra janela
  const handleMouseEnter = () => {
    if (cursorRef.current && followerRef.current) {
      cursorRef.current.style.opacity = "1";
      followerRef.current.style.opacity = "1";
    }
  };

  // Loop de animação com requestAnimationFrame
  const animate = () => {
    // Atualizar posição do ponto central (segue exatamente o mouse)
    if (cursorRef.current) {
      cursorRef.current.style.transform = `
        translate(
          calc(-50% + ${mouseRef.current.x}px),
          calc(-50% + ${mouseRef.current.y}px)
        )
      `;
    }

    // Atualizar posição do círculo com delay suave (easing)
    if (followerRef.current) {
      followerRef_pos.current.x += (mouseRef.current.x - followerRef_pos.current.x) * FOLLOWER_DELAY;
      followerRef_pos.current.y += (mouseRef.current.y - followerRef_pos.current.y) * FOLLOWER_DELAY;

      followerRef.current.style.transform = `
        translate(
          calc(-50% + ${followerRef_pos.current.x}px),
          calc(-50% + ${followerRef_pos.current.y}px)
        )
      `;
    }

    animationFrameRef.current.id = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Iniciar loop de animação
    animationFrameRef.current = { id: null, hideTimeout: null };
    animationFrameRef.current.id = requestAnimationFrame(animate);

    // Event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Injetar estilos de cursor no head
    const styleTag = document.createElement("style");
    styleTag.textContent = cursorStyles;
    document.head.appendChild(styleTag);

    // Cleanup
    return () => {
      if (animationFrameRef.current?.id) {
        cancelAnimationFrame(animationFrameRef.current.id);
      }
      if (animationFrameRef.current?.hideTimeout) {
        clearTimeout(animationFrameRef.current.hideTimeout);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <>
      {/* Ponto central fixo */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${CURSOR_SIZE}px`,
          height: `${CURSOR_SIZE}px`,
          borderRadius: "50%",
          backgroundColor: "rgba(56, 182, 255, 0.8)",
          pointerEvents: "none",
          zIndex: 9999,
          transition: "opacity 0.3s ease-out",
          opacity: 0,
          boxShadow: "0 0 8px rgba(56, 182, 255, 0.6)",
        }}
      />

      {/* Círculo que segue com delay */}
      <div
        ref={followerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${FOLLOWER_SIZE}px`,
          height: `${FOLLOWER_SIZE}px`,
          borderRadius: "50%",
          border: "1.5px solid rgba(56, 182, 255, 0.4)",
          pointerEvents: "none",
          zIndex: 9998,
          transition: "opacity 0.3s ease-out",
          opacity: 0,
          boxShadow: "0 0 16px rgba(56, 182, 255, 0.2) inset",
        }}
      />
    </>
  );
}
