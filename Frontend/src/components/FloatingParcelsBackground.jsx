// src/components/FloatingParcelsBackground.jsx
import React, { useEffect, useRef } from "react";

export default function FloatingParcelsBackground() {
  const canvasRef = useRef(null);
  const parcelsRef = useRef([]);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const hoveredParcelRef = useRef(null);

  const PARCEL_COUNT = 20;
  const MIN_SIZE = 18;
  const MAX_SIZE = 52;
  const MAX_SPEED = 0.35;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    const parcels = [];

    for (let i = 0; i < PARCEL_COUNT; i++) {
      const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
      parcels.push({
        id: i,
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * MAX_SPEED,
        vy: (Math.random() - 0.5) * MAX_SPEED,
        size,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        colorSeed: Math.random(),
      });
    }

    parcelsRef.current = parcels;
    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const parcels = parcelsRef.current;

    parcels.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      if (p.x < -p.size) p.x = w + p.size;
      if (p.x > w + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = h + p.size;
      if (p.y > h + p.size) p.y = -p.size;

      drawParcel(ctx, p);
    });

    drawConnections(ctx);

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawParcel = (ctx, p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    const hue = 210 + p.colorSeed * 50;
    const sat = 65;
    const light = 70;

    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 8;

    ctx.fillStyle = `hsl(${hue}deg ${sat}% ${light}%)`;
    roundRect(ctx, -p.size / 2, -p.size / 2, p.size, p.size * 0.6, 6);
    ctx.fill();

    ctx.restore();
  };

  const drawConnections = (ctx) => {
    const parcels = parcelsRef.current;
    const mouse = mouseRef.current;

    let nearest = null;
    let nearestDist = Infinity;

    for (const p of parcels) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = p;
      }
    }

    if (!nearest || nearestDist > 120) return;

    hoveredParcelRef.current = nearest;

    const others = parcels.filter((p) => p.id !== nearest.id);
    others.sort((a, b) => distance(a, nearest) - distance(b, nearest));

    const target3 = others.slice(0, 3);

    target3.forEach((n) => {
      ctx.beginPath();
      ctx.moveTo(nearest.x, nearest.y);
      ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = "rgba(90,45,200,0.35)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(140,100,250,0.4)";
      ctx.shadowBlur = 12;
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
  };

  const distance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    const move = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseleave", () => {
      mouseRef.current = { x: -1000, y: -1000 };
    });

    return () => {
      canvas.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
