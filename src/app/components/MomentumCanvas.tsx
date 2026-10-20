'use client';

import React, { useEffect, useRef } from 'react';

interface MomentumCanvasProps {
  cohortId: 'forum' | 'cloud' | 'accelerator';
  className?: string;
  width?: number;
  height?: number;
}

export const MomentumCanvas: React.FC<MomentumCanvasProps> = ({ 
  cohortId, 
  className = '',
  width = 1080,
  height = 1350
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    canvas.width = width;
    canvas.height = height;

    const render = () => {
      t += 0.015;
      ctx.fillStyle = '#121317';
      ctx.fillRect(0, 0, width, height);

      if (cohortId === 'forum') {
        const originX = width * 0.95;
        const originY = height * 0.08;

        const glowRadius = Math.max(width, height) * 0.65;
        const glow = ctx.createRadialGradient(originX, originY, 40, originX, originY, glowRadius);
        glow.addColorStop(0, 'rgba(66, 133, 244, 0.45)');
        glow.addColorStop(0.4, 'rgba(36, 193, 224, 0.2)');
        glow.addColorStop(1, 'rgba(18, 19, 23, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < 7; i++) {
          const radius = (width * 0.22) + i * (width * 0.085) + Math.sin(t + i * 0.4) * 20;
          ctx.beginPath();
          ctx.arc(originX, originY, radius, Math.PI * 0.5, Math.PI * 1.05);
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(66, 133, 244, 0.5)' : 'rgba(78, 205, 196, 0.4)';
          ctx.lineWidth = 3 + (i % 3) * 2;
          ctx.stroke();

          const nodeAngle = Math.PI * 0.55 + ((t * 0.5 + i * 0.6) % (Math.PI * 0.45));
          const nx = originX + Math.cos(nodeAngle) * radius;
          const ny = originY + Math.sin(nodeAngle) * radius;

          ctx.beginPath();
          ctx.arc(nx, ny, 7 + (i % 3) * 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#4285F4';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (cohortId === 'cloud') {
        const originX = width * 1.0;
        const originY = height * 0.5;

        const glowRadius = Math.max(width, height) * 0.6;
        const glow = ctx.createRadialGradient(originX, originY, 30, originX, originY, glowRadius);
        glow.addColorStop(0, 'rgba(66, 133, 244, 0.5)');
        glow.addColorStop(0.5, 'rgba(92, 107, 192, 0.25)');
        glow.addColorStop(1, 'rgba(18, 19, 23, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < 9; i++) {
          const stepOffset = (height * 0.065);
          const offsetY = originY - (height * 0.25) + i * stepOffset + Math.sin(t * 1.2 + i) * 14;
          const beamWidth = (width * 0.4) + Math.cos(t + i * 0.5) * 80 + i * 25;
          const startX = width - beamWidth;

          const grad = ctx.createLinearGradient(startX, offsetY, width, offsetY);
          grad.addColorStop(0, 'rgba(66, 133, 244, 0)');
          grad.addColorStop(0.4, i % 3 === 0 ? 'rgba(66, 133, 244, 0.6)' : 'rgba(92, 107, 192, 0.5)');
          grad.addColorStop(1, 'rgba(142, 68, 173, 0.3)');

          ctx.fillStyle = grad;
          ctx.fillRect(startX, offsetY, beamWidth, 28);

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#4285F4';
          ctx.shadowBlur = 12;
          ctx.fillRect(startX, offsetY + 6, 8, 16);
          ctx.shadowBlur = 0;
        }
      } else {
        const originX = width * 0.98;
        const originY = height * 0.96;

        const glowRadius = Math.max(width, height) * 0.75;
        const glow = ctx.createRadialGradient(originX, originY, 50, originX, originY, glowRadius);
        glow.addColorStop(0, 'rgba(66, 133, 244, 0.45)');
        glow.addColorStop(0.3, 'rgba(234, 67, 53, 0.25)');
        glow.addColorStop(0.6, 'rgba(251, 188, 4, 0.15)');
        glow.addColorStop(1, 'rgba(18, 19, 23, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#ffffff'];

        for (let i = 0; i < 8; i++) {
          const power = 2.4 + i * 0.12;
          const shift = Math.sin(t * 1.5 + i * 0.5) * (height * 0.026);
          ctx.beginPath();
          ctx.moveTo(0, height * 0.94 - shift);

          for (let x = 0; x <= width; x += 15) {
            const normalizedX = x / width;
            const curveY = height * 0.94 - Math.pow(normalizedX, power) * (height * 0.78 + shift);
            ctx.lineTo(x, curveY);
          }

          ctx.strokeStyle = colors[i % colors.length];
          ctx.lineWidth = 3 + (i % 4) * 2;
          ctx.shadowColor = colors[i % colors.length];
          ctx.shadowBlur = 16;
          ctx.globalAlpha = 0.55 + Math.sin(t + i) * 0.2;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cohortId, width, height]);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};