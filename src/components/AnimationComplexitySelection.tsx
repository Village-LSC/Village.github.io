import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X, Calculator, Zap, Sparkles, Layers } from 'lucide-react';

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
        @keyframes pixelFloatAnim {
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
        .pixel-square-particle-anim {
          animation: pixelFloatAnim var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pixel-square-particle-anim"
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

function MiniDitherNebula({ value }: { value: 'simple' | 'medium' | 'complex' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const PIXEL_SCALE = 4;

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

      let rMax = 217, gMax = 70, bMax = 239; // complex
      if (value === 'simple') {
        rMax = 16; gMax = 185; bMax = 129;
      } else if (value === 'medium') {
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
        opacity: value === 'complex' ? 0.45 : value === 'medium' ? 0.15 : 0,
      }}
    />
  );
}

interface AnimationComplexitySelectionProps {
  value: 'simple' | 'medium' | 'complex';
  onChange: (val: 'simple' | 'medium' | 'complex') => void;
  lang: 'ru' | 'en';
  spriteId: number;
  frames?: number;
  totalComplexity?: number;
}

export function AnimationComplexitySelection({ 
  value, 
  onChange, 
  lang, 
  spriteId,
  frames = 1,
  totalComplexity
}: AnimationComplexitySelectionProps) {
  const [justUpgraded, setJustUpgraded] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const levels = {
    simple: {
      id: 'simple' as const,
      nextId: 'medium' as const,
      labelRu: 'Простая анимация',
      labelEn: 'Simple Animation',
      descRu: 'Смещение, покачивание или поворот готового объекта',
      descEn: 'Offset, sway, or rotation of an existing asset',
      points: '0.25',
      rateVal: 0.25,
      framesForOnePt: 4,
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
    medium: {
      id: 'medium' as const,
      nextId: 'complex' as const,
      labelRu: 'Средняя анимация',
      labelEn: 'Medium Animation',
      descRu: 'Циклическая деформация, бег, атака или взмах крыльев',
      descEn: 'Cyclic deformation, running cycles, attacks, or wing flaps',
      points: '0.5',
      rateVal: 0.5,
      framesForOnePt: 2,
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
    complex: {
      id: 'complex' as const,
      nextId: 'simple' as const,
      labelRu: 'Сложная анимация',
      labelEn: 'Complex Animation',
      descRu: 'Полноценные динамические спецэффекты (взрывы, магия, огонь, искры)',
      descEn: 'Full hand-drawn dynamic special effects (explosions, magic, fire, sparks)',
      points: '1.0',
      rateVal: 1.0,
      framesForOnePt: 1,
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
  const safeFrames = Math.max(1, frames);
  const currentEarnedPts = Math.floor(safeFrames * current.rateVal);
  const remainder = (safeFrames * current.rateVal) - currentEarnedPts;
  const framesNeededForNext = current.framesForOnePt === 1 
    ? 0 
    : (current.framesForOnePt - (safeFrames % current.framesForOnePt)) % current.framesForOnePt;

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
        @keyframes subtleAnimButtonGlow {
          0%, 100% {
            box-shadow: 0 0 var(--glow-size-1) var(--glow-color), inset 0 0 var(--glow-size-2) var(--glow-color);
            border-color: var(--glow-border);
          }
          50% {
            box-shadow: 0 0 var(--glow-size-3) var(--glow-color), inset 0 0 var(--glow-size-4) var(--glow-color);
            border-color: var(--glow-border-active);
          }
        }
        .animate-subtle-anim-glow {
          animation: subtleAnimButtonGlow 3s ease-in-out infinite;
        }
        @keyframes sheenSweepAnim {
          0%, 15% {
            transform: translateX(-180%) rotate(25deg);
          }
          75%, 100% {
            transform: translateX(250%) rotate(25deg);
          }
        }
        .sheen-effect-anim {
          position: relative;
          overflow: hidden;
        }
        .sheen-effect-anim::after {
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
          animation: sheenSweepAnim 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-2">
        <div className="flex items-center gap-2.5">
          <label className="text-sm font-bold uppercase tracking-wider text-purple-300">
            {lang === 'ru' ? 'Сложность анимации:' : 'Animation Complexity:'}
          </label>

          {/* Info Button */}
          <button
            type="button"
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.2)] ${
              showInfoPanel 
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-400/50 text-cyan-200 hover:text-white'
            }`}
            title={lang === 'ru' ? 'Показать/скрыть таблицу расчёта кадров' : 'Toggle frame calculation table'}
          >
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{showInfoPanel ? (lang === 'ru' ? 'Скрыть инфо' : 'Hide info') : (lang === 'ru' ? 'Информация' : 'Info')}</span>
          </button>
        </div>

        <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
          {lang === 'ru' ? 'Нажмите для изменения сложности' : 'Click to change complexity'}
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
            '--glow-size-1': value === 'simple' ? '8px' : value === 'medium' ? '18px' : '30px',
            '--glow-size-2': value === 'simple' ? '4px' : value === 'medium' ? '8px' : '12px',
            '--glow-size-3': value === 'simple' ? '16px' : value === 'medium' ? '30px' : '52px',
            '--glow-size-4': value === 'simple' ? '8px' : value === 'medium' ? '14px' : '22px',
          } as React.CSSProperties}
          className={`w-full text-left p-4 rounded-xl border-2 font-semibold select-none cursor-pointer relative overflow-hidden transition-all duration-500 active:scale-[0.98] animate-subtle-anim-glow sheen-effect-anim ${current.borderClass} ${current.bgClass}`}
        >
          {/* Decorative Corner Borders */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/20 pointer-events-none z-20" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-white/20 pointer-events-none z-20" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-white/20 pointer-events-none z-20" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/20 pointer-events-none z-20" />

          {/* Smooth dynamic gradient stretching from right to left based on complexity */}
          <div 
            className="absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-700 ease-out z-0"
            style={{
              width: value === 'simple' ? '30%' : '15%',
              opacity: value === 'simple' ? 1 : 0,
              background: 'linear-gradient(270deg, rgba(16, 185, 129, 0.22) 0%, rgba(16, 185, 129, 0.05) 60%, transparent 100%)',
            }}
          />

          <div 
            className="absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-700 ease-out z-0"
            style={{
              width: value === 'medium' ? '55%' : value === 'simple' ? '20%' : '35%',
              opacity: value === 'medium' ? 1 : 0,
              background: 'linear-gradient(270deg, rgba(245, 158, 11, 0.28) 0%, rgba(245, 158, 11, 0.08) 60%, transparent 100%)',
            }}
          />

          <div 
            className="absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-700 ease-out z-0"
            style={{
              width: value === 'complex' ? '85%' : value === 'medium' ? '45%' : '20%',
              opacity: value === 'complex' ? 1 : 0,
              background: 'linear-gradient(270deg, rgba(217, 70, 239, 0.35) 0%, rgba(168, 85, 247, 0.15) 50%, rgba(217, 70, 239, 0.04) 75%, transparent 100%)',
            }}
          />

          {/* Mini dithered nebula canvas overlay inside the button */}
          <MiniDitherNebula value={value} />

          {/* Upgrade Flash Overlay */}
          <AnimatePresence>
            {justUpgraded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white pointer-events-none z-10"
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
                  <div className="flex items-center gap-1.5 bg-[#0f051c] px-2 py-1 rounded-md border border-white/5">
                    {current.lamps.map((lit, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          lit ? current.activeLampClass : 'bg-stone-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Level Title Badge */}
                  <span className={`text-sm font-black uppercase tracking-wider ${current.textClass}`}>
                    {lang === 'ru' ? current.labelRu : current.labelEn}
                  </span>
                </div>

                {/* Explanatory description */}
                <p className="text-stone-300 text-[11px] leading-relaxed font-sans pr-4">
                  {lang === 'ru' ? current.descRu : current.descEn}
                </p>
              </div>

              {/* Right Status Column */}
              <div className="flex flex-col items-end justify-center gap-1 z-10 shrink-0 select-none">
                <span className={`text-xs font-black font-mono px-2 py-1 rounded-md ${current.badgeClass}`}>
                  {current.points} {lang === 'ru' ? 'pts/кадр' : 'pts/frame'}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Particles floating on active states */}
          <PixelParticles
            active={true}
            rate={value === 'medium' ? 'rare' : 'frequent'}
            color={current.color}
          />
        </button>
      </div>

      {/* Inline Info Accordion Panel */}
      <AnimatePresence>
        {showInfoPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-[#130722] border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-5 text-[#ebd6f7] shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-400/40 text-purple-300">
                    <Calculator className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      {lang === 'ru' ? 'Расчёт баллов анимации' : 'Animation Frame Calculation'}
                    </h3>
                    <p className="text-[11px] text-purple-300/80 font-mono">
                      {lang === 'ru' ? 'Накопительная система целых чисел (без дробей)' : 'Whole-integer accumulation system'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInfoPanel(false)}
                  className="p-1.5 rounded-lg bg-stone-900/80 hover:bg-rose-950 text-stone-400 hover:text-rose-300 border border-stone-800 transition-all cursor-pointer active:scale-90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Accumulator Rule Box */}
              <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 mb-4 space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span>{lang === 'ru' ? 'Правило накопительного расчёта' : 'Integer Accumulation Rule'}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">
                  {lang === 'ru' 
                    ? 'Баллы за анимацию всегда прибавляются строго целыми числами (без дробных значений). Кадры накапливают прогресс, и при достижении каждых полных 1.0 баллов начисляется +1 к сложности.'
                    : 'Animation points are strictly added as whole integers (no fractional values). Frames accumulate progress, and every full 1.0 points earned awards +1 to complexity.'}
                </p>
              </div>

              {/* Current Active Live Summary Card */}
              <div className="bg-[#1c0a32] border border-purple-500/30 rounded-xl p-3.5 mb-4 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between text-xs font-bold text-purple-200 uppercase tracking-wider pb-2 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'ru' ? 'Текущий расчёт для данного спрайта' : 'Current Sprite Calculation'}</span>
                  </div>
                  <span className="font-mono text-cyan-300">{safeFrames} {lang === 'ru' ? 'кадров' : 'frames'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-[#12051d] p-2 rounded-lg border border-purple-500/20">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                      {lang === 'ru' ? 'Сложность' : 'Complexity'}
                    </span>
                    <span className={`text-xs font-black uppercase ${current.textClass}`}>
                      {lang === 'ru' ? current.labelRu : current.labelEn}
                    </span>
                  </div>

                  <div className="bg-[#12051d] p-2 rounded-lg border border-purple-500/20">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                      {lang === 'ru' ? 'Ставка' : 'Rate'}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {current.rateVal} {lang === 'ru' ? 'pts/кадр' : 'pts/frame'}
                    </span>
                  </div>

                  <div className="bg-[#12051d] p-2 rounded-lg border border-purple-500/20">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                      {lang === 'ru' ? 'Начислено' : 'Earned'}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400">
                      +{currentEarnedPts} pts
                    </span>
                  </div>

                  <div className="bg-[#12051d] p-2 rounded-lg border border-purple-500/20">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 mb-0.5">
                      {lang === 'ru' ? 'До +1 балла' : 'To Next +1 Pt'}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {framesNeededForNext === 0 
                        ? (lang === 'ru' ? 'Ровно' : 'Exact') 
                        : `${framesNeededForNext} ${lang === 'ru' ? 'кадр(а)' : 'frame(s)'}`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar for Current Pt */}
                {current.framesForOnePt > 1 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-stone-300">
                      <span>{lang === 'ru' ? 'Прогресс накопления балла:' : 'Point accumulation progress:'}</span>
                      <span className="font-bold text-cyan-300">
                        {safeFrames % current.framesForOnePt} / {current.framesForOnePt} {lang === 'ru' ? 'кадров' : 'frames'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-900 overflow-hidden border border-purple-500/20 p-0.5">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 shadow-[0_0_8px_#38bdf8]"
                        style={{ width: `${((safeFrames % current.framesForOnePt) / current.framesForOnePt) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Comparative Table */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>{lang === 'ru' ? 'Динамическая таблица норм кадров' : 'Dynamic Frame Rates Table'}</span>
                </h4>

                <div className="overflow-x-auto rounded-xl border border-purple-500/25 bg-[#0e0417]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1a0729] text-stone-300 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-2 sm:p-2.5 border-b border-purple-500/20">{lang === 'ru' ? 'Сложность' : 'Level'}</th>
                        <th className="p-2 sm:p-2.5 border-b border-purple-500/20">{lang === 'ru' ? 'Ставка/кадр' : 'Rate/frame'}</th>
                        <th className="p-2 sm:p-2.5 border-b border-purple-500/20">{lang === 'ru' ? 'Кадров для 1 балла' : 'Frames for 1 pt'}</th>
                        <th className="p-2 sm:p-2.5 border-b border-purple-500/20">{lang === 'ru' ? `Итого (${safeFrames} кадров)` : `Score (${safeFrames} frames)`}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10 font-sans">
                      {/* Simple */}
                      <tr className={value === 'simple' ? 'bg-emerald-950/40 font-bold border-l-4 border-l-emerald-400' : 'hover:bg-purple-950/20'}>
                        <td className="p-2 sm:p-2.5 text-emerald-400 font-bold">
                          {lang === 'ru' ? 'Простая' : 'Simple'}
                        </td>
                        <td className="p-2 sm:p-2.5 font-mono">0.25 pts</td>
                        <td className="p-2 sm:p-2.5 font-mono font-extrabold text-white">4 {lang === 'ru' ? 'кадра' : 'frames'}</td>
                        <td className="p-2 sm:p-2.5 font-mono text-emerald-300">
                          +{Math.floor(safeFrames * 0.25)} pts
                        </td>
                      </tr>

                      {/* Medium */}
                      <tr className={value === 'medium' ? 'bg-amber-950/40 font-bold border-l-4 border-l-amber-400' : 'hover:bg-purple-950/20'}>
                        <td className="p-2 sm:p-2.5 text-amber-400 font-bold">
                          {lang === 'ru' ? 'Средняя' : 'Medium'}
                        </td>
                        <td className="p-2 sm:p-2.5 font-mono">0.50 pts</td>
                        <td className="p-2 sm:p-2.5 font-mono font-extrabold text-white">2 {lang === 'ru' ? 'кадра' : 'frames'}</td>
                        <td className="p-2 sm:p-2.5 font-mono text-amber-300">
                          +{Math.floor(safeFrames * 0.50)} pts
                        </td>
                      </tr>

                      {/* Complex */}
                      <tr className={value === 'complex' ? 'bg-fuchsia-950/40 font-bold border-l-4 border-l-fuchsia-400' : 'hover:bg-purple-950/20'}>
                        <td className="p-2 sm:p-2.5 text-fuchsia-400 font-bold">
                          {lang === 'ru' ? 'Сложная' : 'Complex'}
                        </td>
                        <td className="p-2 sm:p-2.5 font-mono">1.00 pt</td>
                        <td className="p-2 sm:p-2.5 font-mono font-extrabold text-white">1 {lang === 'ru' ? 'кадр' : 'frame'}</td>
                        <td className="p-2 sm:p-2.5 font-mono text-fuchsia-300">
                          +{Math.floor(safeFrames * 1.00)} pts
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Threshold Milestones Table for Active Level */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  {lang === 'ru' 
                    ? `Пороги накопления для «${current.labelRu}» (${current.rateVal} pts/кадр):` 
                    : `Threshold milestones for "${current.labelEn}" (${current.rateVal} pts/frame):`}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                  {[1, 2, 3, 4].map((pts) => {
                    const reqFrames = pts * current.framesForOnePt;
                    const isReached = safeFrames >= reqFrames;
                    return (
                      <div 
                        key={pts} 
                        className={`p-2 rounded-xl border transition-all ${
                          isReached 
                            ? 'bg-purple-900/40 border-purple-400/60 text-white shadow-sm' 
                            : 'bg-stone-900/40 border-stone-800 text-stone-400'
                        }`}
                      >
                        <span className="block text-[10px] text-stone-400 uppercase">
                          +{pts} {pts === 1 ? (lang === 'ru' ? 'балл' : 'pt') : (lang === 'ru' ? 'балла' : 'pts')}
                        </span>
                        <strong className={isReached ? 'text-emerald-400 text-xs' : 'text-stone-300 text-xs'}>
                          {reqFrames} {lang === 'ru' ? 'кадров' : 'frames'}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
