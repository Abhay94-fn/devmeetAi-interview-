// frontend/src/components/ui/Particles.jsx
import React, { useRef, useEffect, useState } from "react";

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export default function Particles({
  className = "",
  quantity = 80,
  staticity = 50,
  ease = 50,
  color = "#ffffff",
  refresh = false,
}) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const contextRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 });

  useEffect(() => {
    const parsed = hexToRgb(color);
    if (parsed) setRgb(parsed);
  }, [color]);

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, [rgb, refresh]);

  // Track mouse coordinates relative to canvas
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - canvasSizeRef.current.w / 2;
        const y = e.clientY - rect.top - canvasSizeRef.current.h / 2;
        mouseRef.current = { x, y };
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && contextRef.current) {
      particlesRef.current = [];
      const { offsetWidth, offsetHeight } = canvasContainerRef.current;
      canvasSizeRef.current.w = offsetWidth;
      canvasSizeRef.current.h = offsetHeight;

      canvasRef.current.width = offsetWidth * dpr;
      canvasRef.current.height = offsetHeight * dpr;
      canvasRef.current.style.width = `${offsetWidth}px`;
      canvasRef.current.style.height = `${offsetHeight}px`;

      contextRef.current.scale(dpr, dpr);
    }
  };

  const createParticle = (i) => {
    const x = Math.random() * canvasSizeRef.current.w;
    const y = Math.random() * canvasSizeRef.current.h;
    const translateX = 0;
    const translateY = 0;
    const size = Math.random() * 2 + 1;
    const alpha = 0;
    const targetAlpha = Math.random() * 0.6 + 0.1;
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;

    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const drawParticles = () => {
    particlesRef.current = [];
    for (let i = 0; i < quantity; i++) {
      particlesRef.current.push(createParticle(i));
    }
  };

  const drawCircle = (p, update = false) => {
    if (contextRef.current) {
      const { x, y, size, alpha, translateX, translateY } = p;
      contextRef.current.beginPath();
      contextRef.current.arc(x + translateX, y + translateY, size, 0, 2 * Math.PI);
      contextRef.current.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      contextRef.current.fill();

      if (!update) {
        p.alpha = alpha;
      }
    }
  };

  const clearCanvas = () => {
    if (contextRef.current) {
      contextRef.current.clearRect(
        0,
        0,
        canvasSizeRef.current.w,
        canvasSizeRef.current.h
      );
    }
  };

  const animate = () => {
    clearCanvas();
    particlesRef.current.forEach((p, i) => {
      // Fade in effect
      if (p.alpha < p.targetAlpha) {
        p.alpha += 0.01;
      }

      // Physics/Interactions
      // Translate towards mouse pointer relative to magnetic strength
      const mouseDistanceX = mouseRef.current.x - (p.x - canvasSizeRef.current.w / 2);
      const mouseDistanceY = mouseRef.current.y - (p.y - canvasSizeRef.current.h / 2);

      p.translateX += (mouseDistanceX * (p.magnetism / 100) - p.translateX) / ease;
      p.translateY += (mouseDistanceY * (p.magnetism / 100) - p.translateY) / ease;

      // Base translation drift
      p.x += p.dx;
      p.y += p.dy;

      // Boundary reset checks
      if (
        p.x < 0 ||
        p.x > canvasSizeRef.current.w ||
        p.y < 0 ||
        p.y > canvasSizeRef.current.h
      ) {
        particlesRef.current[i] = createParticle(i);
        // Start from edge
        particlesRef.current[i].alpha = 0;
      } else {
        drawCircle(p, true);
      }
    });

    requestAnimationFrame(animate);
  };

  return (
    <div
      ref={canvasContainerRef}
      className={`${className} pointer-events-none`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
