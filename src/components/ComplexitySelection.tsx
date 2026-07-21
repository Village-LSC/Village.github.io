import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getQualityPoints } from '../types';

interface Particle {
  id: number;
  x: number; // percentage width of button
  y: number; // percentage height of button
  size: number;
  color: string;
  xDist: number;
  yDist: number;
  duration: number;
}

export function PixelParticles({ active, rate, color }: { active: boolean; rate: 'rare' | 'frequent'; color: string }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const intervalTime = rate === 'rare' ? 450 : 150;

    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      const side = Math.random() > 0.5 ? 'bottom' : (Math.random() > 0.5 ? 'left' : 'right');
      let x = Math.random() * 100;
      let y = Math.random() * 100;

      if (side === 'bottom') {
        y = 110;
        x = 10 + Math.random() * 80;
      } else if (side === 'left') {
        x = -10;
        y = 10 + Math.random() * 80;
      } else {
        x = 110;
        y = 10 + Math.random() * 80;
      }

      const size = Math.random() > 0.6 ? 6 : 4;
      const duration = 1.0 + Math.random() * 0.8;

      const angle = -45 - Math.random() * 90;
      const angleRad = (angle * Math.PI) / 180;
      const distance = 25 + Math.random() * 30;

      const xDist = Math.cos(angleRad) * distance;
      const yDist = Math.sin(angleRad) * distance;

      const newParticle: Particle = {
        id,
        x,
        y,
        size,
        color,
        xDist,
        yDist,
        duration,
      };

      setParticles((prev) => [...prev, newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, duration * 1000);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [active, rate, color]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      <style>{`
        @keyframes pixelFloat {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.95;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            transform: translate(var(--x-dist), var(--y-dist)) scale(0.2) rotate(180deg);
            opacity: 0;
          }
        }
        .pixel-square-particle {
          animation: pixelFloat var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pixel-square-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 8px ${p.color}, 0 0 3px #ffffff`,
            borderRadius: '1px',
            '--x-dist': `${p.xDist}px`,
            '--y-dist': `${p.yDist}px`,
            '--dur': `${p.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function MiniDitherNebula({ value }: { value: 'simple' | 'moderate' | 'detailed' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const PIXEL_SCALE = 4; // Smaller pixel scale for smaller button size

    let width = 0;
    let height = 0;

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        width = Math.max(1, Math.ceil(rect.width / PIXEL_SCALE));
        height = Math.max(1, Math.ceil(rect.height / PIXEL_SCALE));
        canvas.width = width;
        canvas.height = height;
      }
    };
    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const BAYER_4X4 = [
      [0,  8,  2,  10],
      [12, 4,  14, 6],
      [3,  11, 1,  9],
      [15, 7,  13, 5]
    ];

    let time = 0;

    const render = () => {
      if (!canvas || !ctx) return;
      time += 0.015;

      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      let rMax = 217, gMax = 70, bMax = 239; // detailed
      if (value === 'simple') {
        rMax = 16; gMax = 185; bMax = 129;
      } else if (value === 'moderate') {
        rMax = 245; gMax = 158; bMax = 11;
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;

          const nx = x / width;
          const ny = y / height;

          const wave1 = Math.sin(nx * 3.5 - time * 0.8 + ny * 1.5) * 0.15;
          const wave2 = Math.cos(ny * 4.0 + time * 0.5 - nx * 2.0) * 0.1;
          const density = nx + wave1 + wave2;

          const bayerValue = BAYER_4X4[y % 4][x % 4] / 16;

          if (density > bayerValue * 1.1) {
            const intensity = Math.min(1, (density - bayerValue * 1.1) * 2.5);
            data[idx] = Math.floor(rMax * intensity * 0.15);
            data[idx + 1] = Math.floor(gMax * intensity * 0.15);
            data[idx + 2] = Math.floor(bMax * intensity * 0.15);
            data[idx + 3] = Math.floor(180 * intensity);
          } else {
            data[idx] = 0;
            data[idx + 1] = 0;
            data[idx + 2] = 0;
            data[idx + 3] = 0;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-xl z-0 transition-opacity duration-700"
      style={{
        imageRendering: 'pixelated',
        opacity: value === 'detailed' ? 0.45 : value === 'moderate' ? 0.15 : 0,
      }}
    />
  );
}

interface ComplexitySelectionProps {
  value: 'simple' | 'moderate' | 'detailed';
  onChange: (val: 'simple' | 'moderate' | 'detailed') => void;
  lang: 'ru' | 'en';
  spriteId: string;
  categoryId?: string;
}

export function ComplexitySelection({ value, onChange, lang, spriteId, categoryId }: ComplexitySelectionProps) {
  const [justUpgraded, setJustUpgraded] = useState(false);

  const catId = categoryId || '1';
  const simplePts = getQualityPoints(catId, 'simple');
  const moderatePts = getQualityPoints(catId, 'moderate');
  const detailedPts = getQualityPoints(catId, 'detailed');

  const levels = {
    simple: {
      id: 'simple' as const,
      nextId: 'moderate' as const,
      labelRu: 'Оптимальное качество',
      labelEn: 'Optimal Quality',
      descRu: 'Базовый уровень пиксель-арта, чистые формы',
      descEn: 'Base level pixel art with clean shapes',
      points: simplePts === 0 ? '0' : `+${simplePts}`,
      color: '#10b981',
      glowColor: 'rgba(16,185,129,0.4)',
      glowBorder: 'rgba(16,185,129,0.5)',
      glowBorderActive: '#34d399',
      borderClass: 'border-emerald-500/50 hover:border-emerald-400',
      bgClass: 'bg-emerald-950/20 hover:bg-emerald-950/30',
      activeLampClass: 'bg-emerald-400 shadow-[0_0_8px_#10b981]',
      textClass: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      lamps: [true, false, false],
    },
    moderate: {
      id: 'moderate' as const,
      nextId: 'detailed' as const,
      labelRu: 'Умеренное качество',
      labelEn: 'Moderate Quality',
      descRu: 'Улучшенные текстуры, глубина, дополнительные тени',
      descEn: 'Enhanced textures, depth, and richer shadowing',
      points: `+${moderatePts}`,
      color: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.4)',
      glowBorder: 'rgba(245,158,11,0.5)',
      glowBorderActive: '#fbbf24',
      borderClass: 'border-amber-500/50 hover:border-amber-400',
      bgClass: 'bg-amber-950/20 hover:bg-amber-950/30',
      activeLampClass: 'bg-amber-400 shadow-[0_0_8px_#f59e0b]',
      textClass: 'text-amber-400',
      badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      lamps: [true, true, false],
    },
    detailed: {
      id: 'detailed' as const,
      nextId: 'simple' as const,
      labelRu: 'Максимальное качество',
      labelEn: 'Advanced Quality',
      descRu: 'Попиксельная прорисовка, кинематографичный свет, шедевр',
      descEn: 'Pixel-perfect rendering, cinematic light, a true masterpiece',
      points: `+${detailedPts}`,
      color: '#d946ef',
      glowColor: 'rgba(217,70,239,0.45)',
      glowBorder: 'rgba(217,70,239,0.5)',
      glowBorderActive: '#f472b6',
      borderClass: 'border-fuchsia-500/50 hover:border-fuchsia-400',
      bgClass: 'bg-fuchsia-950/20 hover:bg-fuchsia-950/30',
      activeLampClass: 'bg-fuchsia-400 shadow-[0_0_10px_#d946ef]',
      textClass: 'text-fuchsia-400',
      badgeClass: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20',
      lamps: [true, true, true],
    },
  };

  const current = levels[value];

  const handleUpgrade = () => {
    setJustUpgraded(true);
    onChange(current.nextId);
    setTimeout(() => {
      setJustUpgraded(false);
    }, 400);
  };

  return (
    <div className="w-full">
      <style>{`
        @keyframes subtleButtonGlow {
          0%, 100% {
            box-shadow: 0 0 var(--glow-size-1) var(--glow-color), inset 0 0 var(--glow-size-2) var(--glow-color);
            border-color: var(--glow-border);
          }
          50% {
            box-shadow: 0 0 var(--glow-size-3) var(--glow-color), inset 0 0 var(--glow-size-4) var(--glow-color);
            border-color: var(--glow-border-active);
          }
        }
        .animate-subtle-glow {
          animation: subtleButtonGlow 2.5s ease-in-out infinite;
        }
        @keyframes sheenSweep {
          0%, 15% {
            transform: translateX(-180%) rotate(25deg);
          }
          75%, 100% {
            transform: translateX(250%) rotate(25deg);
          }
        }
        .sheen-effect {
          position: relative;
          overflow: hidden;
        }
        .sheen-effect::after {
          content: '';
          position: absolute;
          top: -60%;
          left: 0;
          width: 50%;
          height: 220%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.08) 30%,
            rgba(255, 255, 255, 0.22) 50%,
            rgba(255, 255, 255, 0.08) 70%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: sheenSweep 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          pointer-events: none;
        }
        @keyframes miniNebulaMove1 {
          0%, 100% {
            transform: translate(-12%, -12%) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(12%, 12%) scale(1.15) rotate(180deg);
          }
        }
        @keyframes miniNebulaMove2 {
          0%, 100% {
            transform: translate(12%, 12%) scale(1.1) rotate(0deg);
          }
          50% {
            transform: translate(-12%, -12%) scale(0.9) rotate(-180deg);
          }
        }
        .animate-mini-nebula-1 {
          animation: miniNebulaMove1 10s ease-in-out infinite;
        }
        .animate-mini-nebula-2 {
          animation: miniNebulaMove2 12s ease-in-out infinite;
        }
      `}</style>
 
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-1.5">
        <label className="text-sm font-bold uppercase tracking-wider text-purple-300">
          {lang === 'ru' ? 'Уровень сложности / деталей:' : 'Complexity / Detail Level:'}
        </label>
        
        <span className="text-[10.5px] font-medium text-purple-300/60 font-mono">
          {lang === 'ru' ? 'Нажмите для изменения уровня' : 'Click to change quality level'}
        </span>
      </div>
 
      <div className="relative overflow-visible">
        {/* Main Upgrade Terminal Button */}
        <button
          type="button"
          onClick={handleUpgrade}
          style={{ 
            '--glow-color': current.glowColor,
            '--glow-border': current.glowBorder,
            '--glow-border-active': current.glowBorderActive,
            '--glow-size-1': value === 'simple' ? '8px' : value === 'moderate' ? '18px' : '30px',
            '--glow-size-2': value === 'simple' ? '4px' : value === 'moderate' ? '8px' : '12px',
            '--glow-size-3': value === 'simple' ? '16px' : value === 'moderate' ? '30px' : '52px',
            '--glow-size-4': value === 'simple' ? '8px' : value === 'moderate' ? '14px' : '22px',
          } as React.CSSProperties}
          className={`w-full text-left p-4 rounded-xl border-2 font-semibold select-none cursor-pointer relative overflow-hidden transition-all duration-500 active:scale-[0.98] animate-subtle-glow sheen-effect ${current.borderClass} ${current.bgClass}`}
        >
          {/* Decorative Corner Borders */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20 pointer-events-none z-20" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-white/20 pointer-events-none z-20" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-white/20 pointer-events-none z-20" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20 pointer-events-none z-20" />
 
          {/* Smooth dynamic gradient stretching from right to left based on complexity */}
          {/* Emerald Gradient for Simple */}
          <div 
            className="absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-700 ease-out z-0"
            style={{
              width: value === 'simple' ? '30%' : '15%',
              opacity: value === 'simple' ? 1 : 0,
              background: 'linear-gradient(270deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.05) 60%, transparent 100%)',
            }}
          />

          {/* Amber Gradient for Moderate */}
          <div 
            className="absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-700 ease-out z-0"
            style={{
              width: value === 'moderate' ? '55%' : value === 'simple' ? '20%' : '35%',
              opacity: value === 'moderate' ? 1 : 0,
              background: 'linear-gradient(270deg, rgba(245, 158, 11, 0.28) 0%, rgba(245, 158, 11, 0.08) 60%, transparent 100%)',
            }}
          />

          {/* Fuchsia/Purple Gradient for Detailed */}
          <div 
            className="absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-700 ease-out z-0"
            style={{
              width: value === 'detailed' ? '85%' : value === 'moderate' ? '45%' : '20%',
              opacity: value === 'detailed' ? 1 : 0,
              background: 'linear-gradient(270deg, rgba(217, 70, 239, 0.35) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(217, 70, 239, 0.04) 75%, transparent 100%)',
            }}
          />

          {/* Mini dithered nebula canvas overlay inside the button */}
          <MiniDitherNebula value={value} />

          {/* Upgrade Flash Overlay */}
          <AnimatePresence>
            {justUpgraded && (
              <motion.div
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 0, scale: 1.02 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white/10 rounded-xl pointer-events-none z-30"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 12, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -12, filter: 'blur(3px)' }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex items-center justify-between gap-4 relative z-10 w-full"
            >
              {/* Left Info Column */}
              <div className="space-y-1 z-10">
                <div className="flex items-center gap-2.5">
                  {/* 3-Dot Status Indicator Lamps */}
                  <div className="flex items-center gap-2 bg-[#0f051c] px-2.5 py-1.5 rounded-lg border border-white/10">
                    {current.lamps.map((lit, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          lit ? current.activeLampClass : 'bg-stone-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Level Title Badge */}
                  <span className={`text-base sm:text-lg font-black uppercase tracking-wider ${current.textClass}`}>
                    {lang === 'ru' ? current.labelRu : current.labelEn}
                  </span>
                </div>
              </div>

              {/* Right Status Column */}
              <div className="flex flex-col items-end justify-center gap-1 z-10 shrink-0 select-none">
                <span className={`text-xs font-black font-mono px-2 py-1 rounded-md ${current.badgeClass}`}>
                  {current.points} PTS
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Particles floating on active states */}
          <PixelParticles
            active={true}
            rate={value === 'moderate' ? 'rare' : 'frequent'}
            color={current.color}
          />
        </button>
      </div>
    </div>
  );
}
