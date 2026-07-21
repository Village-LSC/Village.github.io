import React, { useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';
import {
  ArrowUp,
  ArrowDown,
  Edit2,
  Globe,
  Coins,
  Plus,
  Copy,
  Trash2,
  Clipboard,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Layers,
  Flame,
  FileText,
  User,
  Settings,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Send,
  ArrowUpCircle,
  Mail,
  X,
  EyeOff,
  Clock,
  Sword,
  Box,
  Layout,
  Tv,
  Gamepad2,
  Image as ImageIcon
} from 'lucide-react';
import {
  Language,
  Currency,
  CategoryData,
  SpriteItemState,
  CATEGORIES_LIST,
  TRANSLATIONS,
  getQualityPoints
} from './types';
import { CURRENT_LOAD_STATUS } from './loadStatus';
import { PixelMorphAnimation } from './components/PixelMorphAnimation';
import { CategoryShowcaseAnimation } from './components/CategoryShowcaseAnimation';
import { CanvasSizePreview } from './components/CanvasSizePreview';
import { ComplexitySelection } from './components/ComplexitySelection';
import { AnimationComplexitySelection } from './components/AnimationComplexitySelection';
import { TotalComplexityCard } from './components/TotalComplexityCard';
import { CalculationLog } from './components/CalculationLog';

function DitherNebula({ isExpanded }: { isExpanded: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hStartRef = useRef<number | null>(null);
  const targetYRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const PIXEL_SCALE = 8;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (canvas) {
        width = Math.max(1, Math.ceil(window.innerWidth / PIXEL_SCALE));
        height = Math.max(1, Math.ceil(window.innerHeight / PIXEL_SCALE));
        canvas.width = width;
        canvas.height = height;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const BAYER_4X4 = [
      [0,  8,  2,  10],
      [12, 4,  14, 6],
      [3,  11, 1,  9],
      [15, 7,  13, 5]
    ];

    // Gorgeous pixel-art nebula colors blending into #1c0d2b
    const bgWaveR = 0x24, bgWaveG = 0x0a, bgWaveB = 0x3d; // #240a3d
    const fgWaveR = 0x0a, fgWaveG = 0x03, fgWaveB = 0x14; // #0a0314 (deep rich dark void)

    let time = 0;
    let mFactor = 0;

    interface NebulaStar {
      xRatio: number;
      yRatio: number;
      baseAlpha: number;
      speed: number;
      phase: number;
    }
    const stars: NebulaStar[] = [];
    for (let i = 0; i < 75; i++) {
      stars.push({
        xRatio: Math.random(),
        yRatio: 0.1 + Math.random() * 0.9,
        baseAlpha: 0.08 + Math.random() * 0.25, // Barely visible stars as requested
        speed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }

    const starColors = [
      'rgba(235, 214, 247, ALPHA)', // Soft violet-white
      'rgba(253, 244, 201, ALPHA)', // Soft warm white/yellow
      'rgba(192, 132, 252, ALPHA)'  // Soft purple
    ];

    interface DitherParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
    }
    const ditherParticles: DitherParticle[] = [];

    interface DitherChunk {
      x: number;
      y: number;
      vx: number;
      vy: number;
      width: number;
      height: number;
      alpha: number;
      life: number;
      maxLife: number;
      pixels: boolean[][];
    }
    const ditherChunks: DitherChunk[] = [];

    const generateBlob = (w: number, h: number): boolean[][] => {
      const grid: boolean[][] = [];
      for (let y = 0; y < h; y++) {
        grid[y] = [];
        for (let x = 0; x < w; x++) {
          const dx = x - (w - 1) / 2;
          const dy = y - (h - 1) / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt((w / 2) * (w / 2) + (h / 2) * (h / 2));
          grid[y][x] = Math.random() > (dist / (maxDist || 1)) * 0.75;
        }
      }
      return grid;
    };

    const spawnParticle = (x: number, y: number, stateScale: number) => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 0.4 + Math.random() * 1.5;
      ditherParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed * (0.8 + stateScale * 0.4),
        vy: Math.sin(angle) * speed * (0.8 + stateScale * 0.4) - 0.3,
        size: Math.random() < 0.3 ? 1 : 2,
        alpha: 0.8 + Math.random() * 0.2,
        life: 0,
        maxLife: 20 + Math.floor(Math.random() * 30)
      });
    };

    const spawnChunk = (x: number, y: number, isRising: boolean) => {
      const cw = 3 + Math.floor(Math.random() * 5);
      const ch = 3 + Math.floor(Math.random() * 5);
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = isRising ? 0.4 + Math.random() * 0.6 : 0.1 + Math.random() * 0.3;
      ditherChunks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.1,
        vy: Math.sin(angle) * speed - (isRising ? 0.2 : 0.05),
        width: cw,
        height: ch,
        alpha: 0.9 + Math.random() * 0.1,
        life: 0,
        maxLife: 50 + Math.floor(Math.random() * 60),
        pixels: generateBlob(cw, ch)
      });
    };

    // Initialize wave position
    const arrowEl = document.getElementById('expand-arrow');
    let arrowYInitial = Math.ceil(height * 0.55);
    if (arrowEl && canvas) {
      const arrowRect = arrowEl.getBoundingClientRect();
      arrowYInitial = Math.ceil((arrowRect.bottom + 20) / PIXEL_SCALE);
    }
    if (hStartRef.current === null) {
      hStartRef.current = isExpanded ? (height + 40) : arrowYInitial;
    }
    if (targetYRef.current === null) {
      targetYRef.current = hStartRef.current;
    }

    const render = () => {
      time += 0.35;

      ctx.clearRect(0, 0, width, height);

      // Dynamically align the nebula top to meet exactly below the toggle button
      const currentArrowEl = document.getElementById('expand-arrow');
      let arrowY = Math.ceil(height * 0.55);

      if (currentArrowEl) {
        const arrowRect = currentArrowEl.getBoundingClientRect();
        arrowY = Math.ceil((arrowRect.bottom + 20) / PIXEL_SCALE);
      }

      const scrollY = window.scrollY || window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;
      const distanceToBottom = maxScroll - scrollY;

      // Sits near bottom when expanded (leaving a dithered strip at the very end of the site), meets arrow button when collapsed
      let targetWaveY = height + 40; // fully offscreen by default when expanded

      if (!isExpanded) {
        // Collapsed state: align exactly below the arrow button
        targetWaveY = arrowY;
      } else {
        // Expanded state: only show when scrolled to the very bottom of the page
        const footerTriggerHeight = 350; // trigger distance in pixels from the bottom of the page
        if (distanceToBottom < footerTriggerHeight) {
          // Normalize to a 0..1 factor of how far we are into the footer trigger zone
          const factor = 1 - (Math.max(0, distanceToBottom) / footerTriggerHeight); // 0 at footer start, 1 at absolute bottom
          
          // Rise from offscreen (height + 40) to a thin, elegant 20 CSS pixels dithered strip at the very bottom edge of space
          const minWaveY = height + 40;
          const maxWaveY = height - Math.ceil(20 / PIXEL_SCALE); // lowered to stay at the absolute bottom
          targetWaveY = minWaveY - (minWaveY - maxWaveY) * factor;
        }
      }

      // Smoothly interpolate targetYRef towards targetWaveY to buffer any scroll-wheel increments
      if (targetYRef.current === null) {
        targetYRef.current = targetWaveY;
      } else {
        targetYRef.current += (targetWaveY - targetYRef.current) * 0.08;
      }

      const diff = targetYRef.current - hStartRef.current!;
      // Slower spring-like animation (0.025) for beautiful physics
      hStartRef.current! += diff * 0.025;
      const hStart = hStartRef.current!;

      if (width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      // Calculate a continuous, smooth movement factor (0..1) to transition fluidly between rest and motion states
      const targetMFactor = Math.min(1, Math.abs(diff) / 12.0);
      mFactor += (targetMFactor - mFactor) * 0.04; // silky smooth trailing transition with no binary pops

      const transitionWidth = 14;
      const waveAmplitude = 5;

      for (let x = 0; x < width; x++) {
        const wave1 = hStart + Math.sin(x * 0.08 + time * 0.04) * waveAmplitude + Math.cos(x * 0.035 - time * 0.03) * (waveAmplitude + 1);
        const wave2 = wave1 - 6 - Math.sin(x * 0.05 - time * 0.025) * 2.5;

        const startY = Math.max(0, Math.floor(wave2 - transitionWidth));

        for (let y = startY; y < height; y++) {
          const idx = (y * width + x) * 4;
          const threshold = BAYER_4X4[y % 4][x % 4] / 16;

          let r = 0, g = 0, b = 0, a = 0;

          if (y >= wave1 + transitionWidth) {
            r = fgWaveR; g = fgWaveG; b = fgWaveB; a = 255;
          } else if (y >= wave1) {
            const d1 = (y - wave1) / transitionWidth;
            if (d1 > threshold) {
              r = fgWaveR; g = fgWaveG; b = fgWaveB; a = 255;
            } else {
              const d2 = (y - wave2 + transitionWidth) / transitionWidth;
              if (d2 > threshold) {
                r = bgWaveR; g = bgWaveG; b = bgWaveB; a = 255;
              }
            }
          } else if (y >= wave2 - transitionWidth) {
            const d2 = (y - wave2 + transitionWidth) / transitionWidth;
            if (d2 > threshold) {
              r = bgWaveR; g = bgWaveG; b = bgWaveB; a = 255;
            }
          }

          if (a > 0) {
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Draw subtle twinkling stars inside the dithered nebula region (below the waves)
      stars.forEach((star, index) => {
        const sx = Math.floor(star.xRatio * width);
        const sy = Math.floor(star.yRatio * height);

        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const waveHeight = hStart + Math.sin(sx * 0.08 + time * 0.04) * waveAmplitude + Math.cos(sx * 0.035 - time * 0.03) * (waveAmplitude + 1);
          if (sy >= waveHeight) {
            const blink = Math.sin(time * star.speed + star.phase);
            const alpha = Math.max(0.03, star.baseAlpha + blink * 0.08);
            
            const threshold = BAYER_4X4[sy % 4][sx % 4] / 16;
            if (alpha > threshold * 0.35) {
              const baseColor = starColors[index % starColors.length];
              ctx.fillStyle = baseColor.replace('ALPHA', String(alpha));
              ctx.fillRect(sx, sy, 1, 1);
            }
          }
        }
      });

      // Spawn custom atmospheric rising smoke particles and dither chunks during transition
      if (ditherParticles.length < 180) {
        const spawnProbability = 0.08 + 0.67 * mFactor;
        if (Math.random() < spawnProbability) {
          const spawnCount = mFactor > 0.35 ? (Math.random() < 0.5 ? 2 : 1) : 1;
          for (let i = 0; i < spawnCount; i++) {
            const rx = Math.floor(Math.random() * width);
            const waveHeight = hStart + Math.sin(rx * 0.08 + time * 0.04) * waveAmplitude + Math.cos(rx * 0.035 - time * 0.03) * (waveAmplitude + 1);
            spawnParticle(rx, waveHeight, mFactor);
          }
        }
      }

      // Spawn chunky pieces when transitioning (especially when collapsing/appearing or expanding/receding)
      if (mFactor > 0.15 && ditherChunks.length < 35) {
        const chunkProbability = 0.35 * mFactor;
        if (Math.random() < chunkProbability) {
          const rx = Math.floor(Math.random() * width);
          const waveHeight = hStart + Math.sin(rx * 0.08 + time * 0.04) * waveAmplitude + Math.cos(rx * 0.035 - time * 0.03) * (waveAmplitude + 1);
          spawnChunk(rx, waveHeight, true);
        }
      }

      // Draw custom dither particles on top to make transition dissolve stunningly
      ditherParticles.forEach((part, index) => {
        part.x += part.vx;
        part.y += part.vy;
        part.life++;

        if (part.life >= part.maxLife) {
          ditherParticles.splice(index, 1);
        } else {
          const ratio = 1 - part.life / part.maxLife;
          const currentAlpha = part.alpha * ratio;
          
          const px = Math.floor(part.x);
          const py = Math.floor(part.y);
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const threshold = BAYER_4X4[py % 4][px % 4] / 16;
            if (currentAlpha > threshold) {
              ctx.fillStyle = `rgb(${fgWaveR}, ${fgWaveG}, ${fgWaveB})`;
              ctx.fillRect(px, py, part.size, part.size);
            }
          }
        }
      });

      // Draw custom pixel chunks on top of everything!
      for (let i = ditherChunks.length - 1; i >= 0; i--) {
        const chunk = ditherChunks[i];
        chunk.x += chunk.vx;
        chunk.y += chunk.vy;
        chunk.life++;

        if (chunk.life >= chunk.maxLife) {
          ditherChunks.splice(i, 1);
        } else {
          const ratio = 1 - chunk.life / chunk.maxLife;
          const currentAlpha = chunk.alpha * ratio;

          for (let cy = 0; cy < chunk.height; cy++) {
            for (let cx = 0; cx < chunk.width; cx++) {
              if (chunk.pixels[cy][cx]) {
                const px = Math.floor(chunk.x + cx);
                const py = Math.floor(chunk.y + cy);

                if (px >= 0 && px < width && py >= 0 && py < height) {
                  const threshold = BAYER_4X4[py % 4][px % 4] / 16;
                  if (currentAlpha > threshold) {
                    const isBgColor = (cx + cy) % 2 === 0;
                    const r = isBgColor ? bgWaveR : fgWaveR;
                    const g = isBgColor ? bgWaveG : fgWaveG;
                    const b = isBgColor ? bgWaveB : fgWaveB;
                    
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(px, py, 1, 1);
                  }
                }
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isExpanded]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-5"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

function SeedParticleBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = Math.max(1, canvas.offsetWidth));
    let height = (canvas.height = Math.max(1, canvas.offsetHeight));

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = Math.max(1, canvas.offsetWidth);
        height = canvas.height = Math.max(1, canvas.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    interface SparkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      sparkleSpeed: number;
      sparklePhase: number;
    }

    const particles: SparkParticle[] = [];
    const count = 75;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = height + 10 - Math.random() * 30; // start near bottom
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3; // vertical cone
      const speed = 1.5 + Math.random() * 4.5;
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 2.5,
        alpha: 0.9 + Math.random() * 0.1,
        decay: 0.008 + Math.random() * 0.012,
        sparkleSpeed: 0.05 + Math.random() * 0.1,
        sparklePhase: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      let active = false;
      particles.forEach((p) => {
        if (p.alpha > 0) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.035; // anti-gravity float up faster
          p.vx *= 0.97;  // friction
          p.alpha -= p.decay;

          if (p.alpha < 0) p.alpha = 0;

          const currentAlpha = p.alpha * (0.5 + Math.sin(frame * p.sparkleSpeed + p.sparklePhase) * 0.5);

          // Outer glowing shadow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(235, 214, 247, ${currentAlpha * 0.35})`;
          ctx.fill();

          // Core bright white sparkle particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.fill();
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />;
}

interface SquareFrameProps {
  cat: CategoryData;
  imagePath: string;
  lang: string;
  formatPrice: (val: number) => string;
}

function SquareFrame({ cat, imagePath, lang, formatPrice }: SquareFrameProps) {
  const preferredSize = lang === 'ru' ? cat.preferredSizeRu : cat.preferredSizeEn;
  const popularResText = lang === 'ru' ? cat.popularResRu : cat.popularResEn;

  return (
    <div className="flex flex-col items-center shrink-0 w-full xl:w-auto group">
      {/* Square Frame (1.5 times larger: w-64 to w-96 responsive grid) with thick border and double outline on hover */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-[350px] xl:h-[350px] bg-[#1e0a2b] rounded-2xl overflow-hidden border-4 border-[#3d1a56] shadow-2xl transition-all duration-300 group-hover:scale-[1.03] group-hover:border-purple-300 group-hover:outline group-hover:outline-4 group-hover:outline-purple-300/60 group-hover:shadow-[0_0_35px_rgba(192,132,252,0.4)]">
        {/* Inner Highlight line */}
        <div className="absolute inset-1 border-2 border-[#dcc5f5] rounded-xl pointer-events-none z-10 opacity-30 group-hover:opacity-70 transition-opacity"></div>
        
        {/* Full-size container stretching across the entire frame */}
        <div className="absolute inset-0 bg-[#1c0827] overflow-hidden flex flex-col items-center justify-center bg-[radial-gradient(#4a206a_2px,transparent_2px)] [background-size:16px_16px] w-full h-full">
          
          {/* Shaded bottom-half */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/5 pointer-events-none z-10"></div>

          {['1', '2', '3', '4', '5', '6', '7'].includes(cat.id) ? (
            <PixelMorphAnimation catId={cat.id} className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none" />
          ) : (
            imagePath && (
              <img
                src={imagePath}
                alt=""
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-none"
              />
            )
          )}

          {/* Scanline overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent bg-[length:100%_4px] pointer-events-none opacity-25 z-10"></div>
        </div>
      </div>

      {/* Pricing info situated directly UNDER the square picture frame */}
      <div className="mt-4 w-64 sm:w-72 lg:w-80 xl:w-[350px] bg-[#2d143f] rounded-2xl border-2 border-[#3d1a56] p-4 text-xs sm:text-sm space-y-2.5 text-[#ebd6f7] shadow-inner transition-all duration-300 group-hover:border-purple-300 group-hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]">
        
        {/* 1. Начальная ставка */}
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold transition-all duration-300">
          <span className="text-[#ebd6f7]/70 group-hover:text-white/90 uppercase tracking-wider text-left">
            {lang === 'ru' ? 'Начальная ставка:' : 'Starting rate:'}
          </span>
          <span className="font-bold font-mono text-purple-300 group-hover:text-white transition-all text-xs sm:text-sm shrink-0">
            {formatPrice(cat.basePrice)}
          </span>
        </div>

        {/* 2. Предпочтительный размер */}
        <div className="flex justify-between items-center border-t border-[#3d1a56] pt-2 text-xs sm:text-sm font-bold transition-all duration-300">
          <span className="text-[#ebd6f7]/70 group-hover:text-white/90 uppercase tracking-wider text-left max-w-[60%] leading-tight">
            {lang === 'ru' ? 'Предпочтительный размер:' : 'Preferred size:'}
          </span>
          <span className="font-bold font-mono text-[#f1e5f8] group-hover:text-white transition-colors shrink-0 text-xs sm:text-sm">
            {preferredSize}
          </span>
        </div>

        {/* 3. Примерная цена (популярное разрешение и среднее качество) */}
        <div className="flex justify-between items-start border-t border-[#3d1a56] pt-2 text-xs sm:text-sm font-bold transition-all duration-300">
          <div className="flex flex-col text-left max-w-[62%] pr-1">
            <span className="text-[#ebd6f7]/70 group-hover:text-white/90 uppercase tracking-wider leading-tight">
              {lang === 'ru' ? 'Примерная цена:' : 'Approx. price:'}
            </span>
            <span className="text-xs sm:text-sm text-purple-300 font-medium normal-case leading-tight mt-0.5">
              {popularResText}
            </span>
          </div>
          <span className="font-bold font-mono text-emerald-400 group-hover:text-emerald-300 transition-colors shrink-0 text-xs sm:text-sm mt-0.5">
            ~{formatPrice(cat.popularPriceNum)}
          </span>
        </div>

      </div>
    </div>
  );
}

interface InteractiveDitherProps {
  mousePos: { x: number; y: number };
}

function InteractiveDitherBackground({ mousePos }: InteractiveDitherProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let shimmerPhase = 0;

    // Smoothly animated properties for firefly clustering (stored in SCREEN coordinates)
    let currentCX = window.innerWidth / 2;
    let currentCY = window.innerHeight / 2;
    let currentRadius = Math.sqrt(currentCX * currentCX + currentCY * currentCY) * 0.85;
    let currentIntensity = 0.0; // 0.0 (ambient idle gold) to 1.0 (vibrant bright firefly green-gold)
    let currentAvatarIntensity = 0.0; // special black hole effect around avatar

    // Low-resolution render scale factor.
    // Scales down the canvas dimensions, reducing the pixel grid calculations by 64x,
    // while image-rendering: pixelated ensures it scales back up with beautiful crispy retro pixels!
    let scale = 8;

    interface Star {
      x: number;
      y: number;
      phase: number;
      speed: number;
      maxOpacity: number;
    }
    const stars: Star[] = [];
    const numStars = 40;

    const generateStars = (width: number, height: number) => {
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.floor(Math.random() * width),
          y: Math.floor(Math.random() * height),
          phase: Math.random() * Math.PI * 2,
          speed: 0.03 + Math.random() * 0.05,
          maxOpacity: 0.3 + Math.random() * 0.7
        });
      }
    };
    
    const resizeCanvas = () => {
      // Fixed pixel scale for all devices to prevent mobile lag and maintain pixel-art consistency
      scale = 8;

      canvas.width = Math.max(1, Math.ceil(window.innerWidth / scale));
      canvas.height = Math.max(1, Math.ceil(window.innerHeight / scale));
      
      // Keep center coordinate in sync on resize
      currentCX = window.innerWidth / 2;
      currentCY = window.innerHeight / 2;
      currentRadius = Math.sqrt(currentCX * currentCX + currentCY * currentCY) * 0.85;

      generateStars(canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 4x4 classic Bayer ordered dither matrix, pre-divided by 16 for blistering performance
    const bayer = [
      [0 / 16, 8 / 16, 2 / 16, 10 / 16],
      [12 / 16, 4 / 16, 14 / 16, 6 / 16],
      [3 / 16, 11 / 16, 1 / 16, 9 / 16],
      [15 / 16, 7 / 16, 13 / 16, 5 / 16]
    ];

    let isHovered = false;
    let isAvatarHovered = false;
    let hoveredRect: DOMRect | null = null;

    // Track active hovered interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const interactive = target.closest('button, a, input, select, textarea, [role="button"], .group, .rounded-2xl, .rounded-3xl, .clickable, .avatar-black-hole');
      if (interactive) {
        hoveredRect = interactive.getBoundingClientRect();
        isHovered = true;
        isAvatarHovered = !!interactive.closest('.avatar-black-hole') || interactive.classList.contains('avatar-black-hole');
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const interactive = target.closest('button, a, input, select, textarea, [role="button"], .group, .rounded-2xl, .rounded-3xl, .clickable, .avatar-black-hole');
      if (interactive) {
        const related = e.relatedTarget as HTMLElement;
        const nextInteractive = related ? related.closest('button, a, input, select, textarea, [role="button"], .group, .rounded-2xl, .rounded-3xl, .clickable, .avatar-black-hole') : null;
        if (!nextInteractive) {
          hoveredRect = null;
          isHovered = false;
          isAvatarHovered = false;
        } else {
          isAvatarHovered = !!nextInteractive.closest('.avatar-black-hole') || nextInteractive.classList.contains('avatar-black-hole');
        }
      }
    };

    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);

    const draw = () => {
      const cols = canvas.width;
      const rows = canvas.height;
      
      // Idle target position (center of screen, in screen coordinates)
      let targetCX = window.innerWidth / 2;
      let targetCY = window.innerHeight / 2;
      const maxDist = Math.sqrt(targetCX * targetCX + targetCY * targetCY);
      let targetRadius = maxDist * 0.85;
      let targetIntensity = 0.0;

      if (isHovered && hoveredRect) {
        // Find center of the hovered element relative to viewport
        const elCX = hoveredRect.left + hoveredRect.width / 2;
        const elCY = hoveredRect.top + hoveredRect.height / 2;
        
        targetCX = elCX;
        targetCY = elCY;
        
        // Fireflies cluster tightly around the hovered flower element
        targetRadius = Math.max(130, Math.min(hoveredRect.width, hoveredRect.height) * 1.5);
        targetIntensity = 1.0;
      }

      // Smooth interpolation for inertia and high-fidelity physics feel
      currentCX += (targetCX - currentCX) * 0.08;
      currentCY += (targetCY - currentCY) * 0.08;
      currentRadius += (targetRadius - currentRadius) * 0.08;
      currentIntensity += (targetIntensity - currentIntensity) * 0.08;

      let targetAvatarIntensity = isAvatarHovered ? 1.0 : 0.0;
      currentAvatarIntensity += (targetAvatarIntensity - currentAvatarIntensity) * 0.08;

      // Animate shimmer speed - slightly faster and more energetic when clustered
      shimmerPhase += 0.008 + (0.012 * currentIntensity) + (0.02 * currentAvatarIntensity);

      // Fill rich cozy deep space-purple background (no clearRect needed, fillRect completely overwrites)
      ctx.fillStyle = '#0d0614'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Twinkling Space Stars as perfect 1x1 pixel cells matching scaled resolution
      stars.forEach(star => {
        star.phase += star.speed;
        
        // Relocate star when it fades out to a minimum in its sine cycle (different locations)
        if (Math.sin(star.phase) < -0.98) {
          star.x = Math.floor(Math.random() * canvas.width);
          star.y = Math.floor(Math.random() * canvas.height);
          star.speed = 0.03 + Math.random() * 0.05;
          star.maxOpacity = 0.3 + Math.random() * 0.7;
          star.phase = -Math.PI / 2 + 0.3; // Start fade back in, avoiding immediate relocation re-trigger
        }

        const opacity = Math.max(0.0, star.maxOpacity * (0.5 + 0.5 * Math.sin(star.phase)));
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(star.x, star.y, 1, 1);
      });

      // Add a subtle organic breathing jitter to the center point so it feels like living fireflies!
      const jitterX = Math.sin(shimmerPhase * 2.2) * (15 * currentIntensity);
      const jitterY = Math.cos(shimmerPhase * 1.6) * (15 * currentIntensity);
      
      // Convert screen coordinate values to the low-res scaled canvas grid
      const activeCX = (currentCX + jitterX) / scale;
      const activeCY = (currentCY + jitterY) / scale;
      const currentRadiusScaled = currentRadius / scale;

      const maxDistToCalculateRadialSq = (currentRadiusScaled * 1.15) * (currentRadiusScaled * 1.15);

      for (let r = 0; r < rows; r++) {
        const y = r;
        const bayerRow = bayer[r % 4];
        const isRowEven = r % 2 === 0;
        const dy = y - activeCY;
        const dySq = dy * dy;

        for (let c = 0; c < cols; c++) {
          const x = c;
          
          // Distance from the active swarm center
          const dx = x - activeCX;
          const distSq = dx * dx + dySq;

          const threshold = bayerRow[c % 4];
          const texture = (isRowEven ? 0.03 : 0) + ((c & 1) === 0 ? 0.03 : 0);

          const isOutside = distSq > maxDistToCalculateRadialSq;
          
          // Optimization: If outside active radius, max possible value is 0.12 (from wave ripple max).
          // If threshold >= 0.18, this cell can never exceed the threshold. Skip immediately.
          if (isOutside && threshold >= 0.18) {
            continue;
          }

          let dist = 0;
          let radialVal = 0;
          if (!isOutside) {
            // Fast octagonal distance approximation (No Math.sqrt inside hot path!)
            const absX = dx < 0 ? -dx : dx;
            const absY = dy < 0 ? -dy : dy;
            dist = absX > absY ? absX + 0.4 * absY : absY + 0.4 * absX;
            radialVal = Math.max(0, Math.min(1.1, 1.15 - (dist / currentRadiusScaled)));
          }
          
          // Slow diagonal wave ripple (matching the classic Discord quest style)
          const diagonalIndex = c - r;
          const wave = Math.sin(diagonalIndex * 0.045 - shimmerPhase) * 0.12;
          
          const val = Math.max(0, Math.min(1, radialVal + wave));

          if (val + texture > threshold) {
            // Determine cell color
            const hoverInfluence = isOutside ? 0 : currentIntensity * Math.max(0, 1 - dist / (currentRadiusScaled * 1.2));
            const avatarInfluence = isOutside ? 0 : currentAvatarIntensity * Math.max(0, 1 - dist / (currentRadiusScaled * 1.1));
            let aVal = 0.07 + (0.22 - 0.07) * currentIntensity;
            
            let rVal = 139;
            let gVal = 92;
            let bVal = 246;

            if (hoverInfluence > 0) {
              if ((c + r) % 2 === 0) {
                // Classic warm golden-amber ("старый оттенок")
                rVal = Math.round(251 * hoverInfluence + 139 * (1 - hoverInfluence));
                gVal = Math.round(191 * hoverInfluence + 92 * (1 - hoverInfluence));
                bVal = Math.round(36 * hoverInfluence + 246 * (1 - hoverInfluence));
              } else {
                // Vibrant retro purple
                rVal = Math.round(192 * hoverInfluence + 139 * (1 - hoverInfluence));
                gVal = Math.round(132 * hoverInfluence + 92 * (1 - hoverInfluence));
                bVal = Math.round(252 * hoverInfluence + 246 * (1 - hoverInfluence));
              }
            }

            if (avatarInfluence > 0) {
              const blackHoleCycle = Math.sin(shimmerPhase * 2.5);
              const blackHoleBlend = 0.5 + 0.5 * blackHoleCycle; // 0 to 1
              
              const holeR = Math.round(216 * blackHoleBlend + 10 * (1 - blackHoleBlend));
              const holeG = Math.round(180 * blackHoleBlend + 3 * (1 - blackHoleBlend));
              const holeB = Math.round(254 * blackHoleBlend + 20 * (1 - blackHoleBlend));

              rVal = Math.round(holeR * avatarInfluence + rVal * (1 - avatarInfluence));
              gVal = Math.round(holeG * avatarInfluence + gVal * (1 - avatarInfluence));
              bVal = Math.round(holeB * avatarInfluence + bVal * (1 - avatarInfluence));

              const targetA = 0.12 + 0.45 * blackHoleBlend; 
              aVal = aVal * (1 - avatarInfluence) + targetA * avatarInfluence;
            }

            ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${aVal})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

interface RegularTextboxProps {
  children: ReactNode;
  className?: string;
}

function RegularTextbox({ children, className = "" }: RegularTextboxProps) {
  return (
    <div className={`relative ${className} bg-[#2d143f] rounded-2xl border-4 border-[#3d1a56] p-5 sm:p-6 shadow-2xl text-[#ebd6f7] transition-all duration-300 hover:border-purple-300 hover:outline hover:outline-4 hover:outline-purple-300/60 hover:shadow-[0_0_35px_rgba(192,132,252,0.3)] group flex flex-col justify-center`}>
      {/* Inner highlight line for retro RPG style */}
      <div className="absolute inset-1 border border-[#ebd6f7]/10 rounded-xl pointer-events-none"></div>
      <div className="relative z-10 w-full text-left">
        {children}
      </div>
    </div>
  );
}

/**
 * Calculates the final prepayment percentage based on the total order price.
 * Follows the prepayment scale table:
 * 0 - 2,000 RUB: 50%
 * 2,001 - 4,000 RUB: 45%
 * 4,001 - 6,000 RUB: 40%
 * 6,001 - 8,000 RUB: 35%
 * 8,001 - 10,000 RUB: 30%
 * 10,001 - 15,000 RUB: 25%
 * 15,001 - 20,000 RUB: 20%
 * Over 20,000 RUB: 10%
 */
function calculatePrepaymentPercent(basePercent: number, totalPrice: number): number {
  const checkedPrice = Math.max(0, totalPrice);
  if (checkedPrice <= 2000) return 50;
  if (checkedPrice <= 4000) return 45;
  if (checkedPrice <= 6000) return 40;
  if (checkedPrice <= 8000) return 35;
  if (checkedPrice <= 10000) return 30;
  if (checkedPrice <= 15000) return 25;
  if (checkedPrice <= 20000) return 20;
  return 10;
}

export default function App() {
  // Mouse position tracking for cursor glow effect
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Localization and Currency State
  const [lang, setLang] = useState<Language>('ru');
  const [currency, setCurrency] = useState<Currency>('rub');
  const [usdRate, setUsdRate] = useState<number>(92); // Editable exchange rate, pre-populated with 92 RUB per USD

  // Animated Background Enable State
  const [isBgEnabled, setIsBgEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('isBgEnabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Collapse / Expand state for the content below the header
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleBg = () => {
    setIsBgEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('isBgEnabled', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Sprite Items State in Calculator
  const [sprites, setSprites] = useState<SpriteItemState[]>([
    {
      id: 1,
      categoryId: '1',
      width: 16,
      height: 16,
      skinType: '1',
      countOrig: 1,
      countVar: 0,
      hasAnimation: false,
      frameMode: 'direct',
      framesDirect: 1,
      animDuration: 3,
      animDelay: 0.5,
      description: '',
      templateSize: '16',
      quality: 'optimal'
    }
  ]);

  // Global settings
  const [speedRate, setSpeedRate] = useState<number>(1.0); // 1.0 Moderate, 1.25 Priority
  const [noDeadline, setNoDeadline] = useState<boolean>(CURRENT_LOAD_STATUS === 2);

  useEffect(() => {
    if (CURRENT_LOAD_STATUS === 2) {
      setNoDeadline(true);
    }
  }, [CURRENT_LOAD_STATUS]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [showLog, setShowLog] = useState<boolean>(false);
  const [activeLogTab, setActiveLogTab] = useState<'stepByStep' | 'items'>('stepByStep');
  const [showDiscountHelp, setShowDiscountHelp] = useState<boolean>(false);
  const [showQualityHelp, setShowQualityHelp] = useState<boolean>(false);
  const [tzOutput, setTzOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<boolean>(false);
  const [spriteCounter, setSpriteCounter] = useState<number>(1);
  const [expandedSprites, setExpandedSprites] = useState<{ [key: number]: boolean }>({ 1: true });
  const [renamingSpriteId, setRenamingSpriteId] = useState<number | null>(null);
  const [activeSpecTab, setActiveSpecTab] = useState<'visual' | 'text' | 'guide'>('visual');
  const [showPrepaymentBrackets, setShowPrepaymentBrackets] = useState<boolean>(false);
  const [openStepTooltip, setOpenStepTooltip] = useState<number | null>(null);

  // Active expanded help cards per sprite block to show formulas
  const [activeHelp, setActiveHelp] = useState<{ [key: string]: boolean }>({});
  const [detailHelp, setDetailHelp] = useState<{ [key: string]: boolean }>({});
  const [designHelp, setDesignHelp] = useState<{ [key: string]: boolean }>({});
  const [isometryHelp, setIsometryHelp] = useState<{ [key: string]: boolean }>({});

  // Interactive Terms of Collaboration states
  const [attributionCopied, setAttributionCopied] = useState<boolean>(false);

  const collapsedSprites = useMemo(() => sprites.filter(s => expandedSprites[s.id] === false), [sprites, expandedSprites]);
  const expandedSpritesList = useMemo(() => sprites.filter(s => expandedSprites[s.id] !== false), [sprites, expandedSprites]);

  // Scroll & Social states
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
  const [showScrollToHomeBtn, setShowScrollToHomeBtn] = useState<boolean>(false);
  const [showSocialsDropdown, setShowSocialsDropdown] = useState<boolean>(false);
  const [showVisualSocialsDropdown, setShowVisualSocialsDropdown] = useState<boolean>(false);

  // Configuration seed states
  const [pastedSeed, setPastedSeed] = useState<string>('');
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false);
  const [seedCopied, setSeedCopied] = useState<boolean>(false);
  const [justLoadedFromSeedIds, setJustLoadedFromSeedIds] = useState<number[]>([]);
  const [isNoteExpanded, setIsNoteExpanded] = useState<boolean>(false);

  // Generate configuration seed dynamically on state change
  const generatedSeed = useMemo(() => {
    try {
      const data = {
        v: 1,
        s: speedRate,
        items: sprites.map(s => ({
          c: s.categoryId,
          w: s.width,
          h: s.height,
          st: s.skinType || '1',
          co: s.countOrig,
          cv: s.countVar,
          f: s.framesDirect,
          q: s.quality || 'optimal',
          ha: s.hasAnimation,
          d: s.description,
          iso: s.isometry ? 1 : 0,
          dl: s.detailLevel || 'simple',
          ac: s.animComplexity || 'simple',
          dm: s.designMode || 'reference'
        }))
      };
      const json = JSON.stringify(data);
      const utf8Safe = unescape(encodeURIComponent(json));
      return btoa(utf8Safe);
    } catch (e) {
      console.error('Error generating seed:', e);
      return '';
    }
  }, [sprites, speedRate]);

  // Decode and apply a configuration seed to the calculator state
  const applySeed = (seedStr: string) => {
    setSeedError(null);
    setSeedSuccess(false);
    if (!seedStr || !seedStr.trim()) {
      setSeedError(lang === 'ru' ? 'Введите код сида.' : 'Please enter a seed code.');
      return;
    }
    try {
      const trimmed = seedStr.trim();
      const decodedUtf8 = decodeURIComponent(escape(atob(trimmed)));
      const data = JSON.parse(decodedUtf8);
      
      if (data.v !== 1) {
        setSeedError(lang === 'ru' ? 'Неверная версия сида.' : 'Invalid seed version.');
        return;
      }
      
      if (typeof data.s === 'number') {
        setSpeedRate(data.s);
      }
      
      if (Array.isArray(data.items)) {
        const loadedSprites: SpriteItemState[] = data.items.map((item: any, idx: number) => {
          const detailLvl = item.dl || (item.q === 'best' ? 'detailed' : item.q === 'medium' ? 'moderate' : 'simple');
          const animComp = item.ac || 'simple';
          const designMd = item.dm || 'reference';
          const isIsometric = item.iso === 1;

          return {
            id: Date.now() + idx, // unique id
            categoryId: String(item.c || '1'),
            width: Number(item.w ?? 32),
            height: Number(item.h ?? 32),
            skinType: (item.st === '2' ? '2' : '1'),
            countOrig: Number(item.co ?? 1),
            countVar: Number(item.cv ?? 0),
            hasAnimation: Boolean(item.ha),
            frameMode: 'direct',
            framesDirect: Number(item.f ?? 1),
            animDuration: 3,
            animDelay: 0.5,
            description: String(item.d || ''),
            templateSize: '',
            quality: item.q === 'best' ? 'best' : item.q === 'medium' ? 'medium' : 'optimal',
            isometry: isIsometric,
            detailLevel: detailLvl as 'simple' | 'moderate' | 'detailed',
            animComplexity: animComp as 'simple' | 'medium' | 'complex',
            designMode: designMd as 'reference' | 'scratch'
          };
        });
        
        if (loadedSprites.length > 0) {
          const loadedIds = loadedSprites.map(s => s.id);
          setJustLoadedFromSeedIds(loadedIds);
          
          // Auto-expand all loaded sprites
          const expandedMap: { [key: number]: boolean } = {};
          loadedIds.forEach(id => {
            expandedMap[id] = true;
          });
          setExpandedSprites(expandedMap);

          setSprites(loadedSprites);
          setSeedSuccess(true);
          setPastedSeed('');
          
          setTimeout(() => setSeedSuccess(false), 3000);
          setTimeout(() => {
            setJustLoadedFromSeedIds([]);
          }, 3500);
        } else {
          setSeedError(lang === 'ru' ? 'В сиде нет позиций ассетов.' : 'Seed has no assets.');
        }
      } else {
        setSeedError(lang === 'ru' ? 'Неверный формат сида.' : 'Invalid seed format.');
      }
    } catch (e) {
      console.error(e);
      setSeedError(lang === 'ru' ? 'Ошибка декодирования сида. Проверьте правильность кода.' : 'Error decoding seed. Please check the code.');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!isExpanded) {
        setShowScrollBtn(false);
        setShowScrollToHomeBtn(false);
        return;
      }
      const calcEl = document.getElementById('calc-anchored-form');
      if (!calcEl) {
        setShowScrollBtn(false);
        setShowScrollToHomeBtn(false);
        return;
      }
      const rect = calcEl.getBoundingClientRect();
      
      // Show button if the top of the calculator is below the bottom of the viewport
      if (rect.top > window.innerHeight) {
        setShowScrollBtn(true);
        setShowScrollToHomeBtn(false);
      } else {
        setShowScrollBtn(false);
        // Show To Home button if the top of the calculator is scrolled above the viewport or near the top
        if (rect.top <= 100) {
          setShowScrollToHomeBtn(true);
        } else {
          setShowScrollToHomeBtn(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isExpanded]);

  const scrollToCalc = () => {
    const calcEl = document.getElementById('calc-anchored-form');
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSocialClick = (platform: 'telegram' | 'discord' | 'email') => {
    if (platform === 'telegram') {
      window.open('https://t.me/Village_Village', '_blank');
    } else if (platform === 'discord') {
      navigator.clipboard.writeText('villagelsc_');
      triggerToast(
        lang === 'ru' ? 'Никнейм Дискорд @villagelsc_ скопирован!' : 'Discord username @villagelsc_ copied!',
        'success'
      );
      window.open('https://discord.com', '_blank');
    } else if (platform === 'email') {
      const subject = encodeURIComponent('Pixel Art Order - TZ');
      const body = encodeURIComponent(tzOutput || '');
      window.open(`mailto:errorsbills@gmail.com?subject=${subject}&body=${body}`, '_blank');
    }
  };

  // Audio Player State & Playlist (Contains only the lobby track from project assets)
  const PLAYLIST = useMemo(() => [
    {
      title: 'lobby',
      url: '/lobby.mp3'
    }
  ], []);

  const [currentTrackIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.25); // Soft by default
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const volumeRef = React.useRef(volume);
  const isPlayingRef = React.useRef(isPlaying);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const audio = new Audio(PLAYLIST[currentTrackIdx].url);
    audio.loop = true; // Simple natural looping instead of complex interval crossfade
    audio.volume = volumeRef.current;
    audioRef.current = audio;

    let fallbackToRemote = false;

    const useRemoteFallback = () => {
      if (fallbackToRemote) return;
      fallbackToRemote = true;
      console.log('Local lobby.mp3 is empty or unplayable. Switching to remote ambient stream.');
      audio.src = 'https://archive.org/download/minecraft_ost/08%20-%20Sweden.mp3';
      if (isPlayingRef.current) {
        audio.play().catch(err => {
          console.log('Playback error on remote fallback stream:', err);
        });
      }
    };

    audio.addEventListener('error', useRemoteFallback);

    const tryPlay = () => {
      if (!audioRef.current) return;
      if (!isPlayingRef.current) return;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          cleanupListeners();
        })
        .catch(err => {
          console.log('Autoplay blocked initially or empty file:', err);
        });
    };

    // Try to play immediately when page is loaded (mount)
    tryPlay();

    // Trigger on standard user interaction if initially blocked by browser autoplay policy
    const handleUserInteraction = () => {
      tryPlay();
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('mousedown', handleUserInteraction);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('wheel', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousedown', handleUserInteraction);
      document.removeEventListener('pointerdown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
      document.removeEventListener('wheel', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('mousedown', handleUserInteraction, { passive: true });
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    document.addEventListener('click', handleUserInteraction, { passive: true });
    document.addEventListener('keydown', handleUserInteraction, { passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('mousedown', handleUserInteraction, { passive: true });
    document.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    document.addEventListener('scroll', handleUserInteraction, { passive: true });
    document.addEventListener('wheel', handleUserInteraction, { passive: true });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audio.removeEventListener('error', useRemoteFallback);
      cleanupListeners();
      audioRef.current = null;
    };
  }, [currentTrackIdx]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Playback error:', err);
      });
    }
  };

  const handleExpandToggle = () => {
    setIsExpanded(prev => !prev);
  };

  const [openDropdownSpriteId, setOpenDropdownSpriteId] = useState<number | null>(null);

  const t = TRANSLATIONS[lang];

  // Map generated images properly to categories for standard or safe rendering
  const getCategoryImage = (catId: string) => {
    switch (catId) {
      case '1': return '/images/cat1.gif';
      case '2': return '/images/cat2.gif';
      case '3': return '/images/cat3.gif';
      case '4': return '/images/cat4.gif';
      case '5': return '/images/cat5.gif';
      case '6': return '/images/cat6.gif';
      case '7': return '/images/cat7.gif';
      default: return '/images/cat8.gif';
    }
  };

  // Helper to format currency
  const formatPrice = (rubValue: number) => {
    if (currency === 'usd') {
      const usdValue = rubValue / usdRate;
      return `$${usdValue.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${rubValue.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US')} ₽`;
  };

  // Pixel step table based on General Complexity (GC) and preferred size limit (maxBaseSize)
  const getPixelStepForGeneralComplexity = (gc: number, maxBaseSize: number): number => {
    const maxStep = maxBaseSize / 8;
    const minStep = Math.max(4, Math.min(8, Math.round(maxStep * 0.15)));
    
    if (gc < 4) return Math.round(maxStep);
    if (gc >= 24) return Math.round(minStep);
    
    // Linear interpolation factor between 0.0 (at gc = 3) and 1.0 (at gc = 24)
    const ratio = (gc - 3) / 21;
    const stepValue = maxStep - ratio * (maxStep - minStep);
    return Math.round(stepValue);
  };

  // Complexity Category name
  const getComplexityCategory = (complexity: number, currentLang: 'ru' | 'en'): string => {
    if (complexity > 100) return currentLang === 'ru' ? 'Максимальная' : 'Maximum';
    if (complexity <= 15) return currentLang === 'ru' ? 'Низкая' : 'Low';
    if (complexity <= 30) return currentLang === 'ru' ? 'Оптимальная' : 'Optimal';
    if (complexity <= 50) return currentLang === 'ru' ? 'Средняя' : 'Medium';
    if (complexity <= 70) return currentLang === 'ru' ? 'Умеренная' : 'Moderate';
    if (complexity <= 85) return currentLang === 'ru' ? 'Сложная' : 'Complex';
    if (complexity <= 100) return currentLang === 'ru' ? 'Экстремальная' : 'Extreme';
    return currentLang === 'ru' ? 'Максимальная' : 'Maximum';
  };

  // Helper to calculate a single sprite position
  const calculateSpritePrice = (sprite: SpriteItemState) => {
    const cat = CATEGORIES_LIST.find(c => c.id === sprite.categoryId) || CATEGORIES_LIST[0];
    
    const isInvalidSize = sprite.categoryId !== '7' && (sprite.width > 1000 || sprite.height > 1000);
    
    let baseCalculatedPrice = cat.basePrice;
    let sizeFactor = 0;
    let sizeInfo = '';
    let baseDiscountPercent = 0;
    
    if (sprite.categoryId === '7') {
      // Minecraft Skin specific pricing (stays fixed at standard/HD rate)
      const skinMult = sprite.skinType === '2' ? 2 : 1;
      baseCalculatedPrice = cat.basePrice * skinMult;
      sizeInfo = sprite.skinType === '2' ? t.hdText : t.standardText;
      sizeFactor = sprite.skinType === '2' ? 128 : 64;
    } else {
      // Standard resolution sizing size factor
      const w = Math.max(1, sprite.width);
      const h = Math.max(1, sprite.height);
      sizeFactor = Math.round(Math.sqrt(w * h));
      sizeInfo = `${w}×${h} px`;
      
      // If the selected size is strictly less than the category minimum size, the base price is reduced dynamically:
      // The smaller the size, the bigger the discount (up to 80% max discount)
      if (cat.minBaseSize && sizeFactor < cat.minBaseSize) {
        const discountRatio = 1 - (sizeFactor / cat.minBaseSize);
        baseDiscountPercent = Math.max(0, Math.min(80, Math.round(discountRatio * 80)));
        baseCalculatedPrice = Math.round(cat.basePrice * (1 - baseDiscountPercent / 100));
      }
    }

    // Complexity score calculation
    let generalComplexity = 0;
    let baseGeneralComplexity = 0;
    let detailLevel: 'simple' | 'moderate' | 'detailed' = 'simple';
    let animComplexity: 'simple' | 'medium' | 'complex' = 'simple';
    let designMode: 'reference' | 'scratch' = 'reference';
    let isometry = false;
    let frames = 1;
    let animModeLogText = t.standardText;

    if (sprite.categoryId !== '7') {
      isometry = sprite.isometry || false;

      detailLevel = sprite.detailLevel || (sprite.quality === 'best' ? 'detailed' : sprite.quality === 'medium' ? 'moderate' : 'simple');
      const detailPoints = getQualityPoints(sprite.categoryId, detailLevel);

      designMode = sprite.designMode || 'reference';

      let animPoints = 0;
      let framePoints = 0;

      if (sprite.hasAnimation && cat.supportsAnimation) {
        if (sprite.frameMode === 'direct') {
          frames = Math.max(1, sprite.framesDirect);
          animModeLogText = `${t.animMethodDirect}: ${frames} ${t.tzFrames}`;
        } else {
          const duration = sprite.animDuration || 0.1;
          const delay = Math.max(0.01, sprite.animDelay || 0.1);
          frames = Math.max(1, Math.round(duration / delay));
          animModeLogText = `${t.animMethodCalc}: ${duration}s / ${delay}s = ${frames} ${t.tzFrames}`;
        }

        animComplexity = sprite.animComplexity || 'simple';
        animPoints = animComplexity === 'complex' ? 10 : animComplexity === 'medium' ? 5 : 0;
        
        if (animComplexity === 'complex') {
          framePoints = Math.ceil(frames / 2);
        } else if (animComplexity === 'medium') {
          framePoints = Math.ceil(frames / 4);
        } else {
          framePoints = Math.ceil(frames / 6);
        }
      }

      baseGeneralComplexity = detailPoints + animPoints + framePoints;
      
      let generalMultiplier = 1.0;
      if (designMode === 'scratch') generalMultiplier += 0.5;
      if (isometry) generalMultiplier += 0.5;
      generalComplexity = Math.round(baseGeneralComplexity * generalMultiplier);
    }

    let dimensionalComplexity = 0;
    let step = 16;
    if (sprite.categoryId !== '7') {
      step = getPixelStepForGeneralComplexity(baseGeneralComplexity, cat.maxBaseSize);
      dimensionalComplexity = Math.floor(sizeFactor / step);
    }

    const baseTotalComplexity = baseGeneralComplexity + dimensionalComplexity;
    let totalComplexityMultiplier = 1.0;
    if (sprite.categoryId !== '7') {
      if (designMode === 'scratch') totalComplexityMultiplier += 0.5;
      if (isometry) totalComplexityMultiplier += 0.5;
    }
    const totalComplexity = sprite.categoryId === '7' ? 0 : Math.round(baseTotalComplexity * totalComplexityMultiplier);
    const isImpossible = totalComplexity > 100;
    
    // Each complexity point (quality bracket) adds progressive percentages:
    // 0-10: +10% per point
    // 10-20: +15% per point
    // 20-30: +20% per point
    // 30-40: +25% per point
    // 40-50: +30% per point
    // 50+: +35% per point
    let animatedSinglePrice = baseCalculatedPrice;
    if (sprite.categoryId !== '7') {
      let surchargePercent = 0;
      if (totalComplexity <= 10) {
        surchargePercent = totalComplexity * 0.10;
      } else if (totalComplexity <= 20) {
        surchargePercent = (10 * 0.10) + (totalComplexity - 10) * 0.15;
      } else if (totalComplexity <= 30) {
        surchargePercent = (10 * 0.10) + (10 * 0.15) + (totalComplexity - 20) * 0.20;
      } else if (totalComplexity <= 40) {
        surchargePercent = (10 * 0.10) + (10 * 0.15) + (10 * 0.20) + (totalComplexity - 30) * 0.25;
      } else if (totalComplexity <= 50) {
        surchargePercent = (10 * 0.10) + (10 * 0.15) + (10 * 0.20) + (10 * 0.25) + (totalComplexity - 40) * 0.30;
      } else if (totalComplexity <= 100) {
        surchargePercent = (10 * 0.10) + (10 * 0.15) + (10 * 0.20) + (10 * 0.25) + (10 * 0.30) + (totalComplexity - 50) * 0.35;
      } else {
        surchargePercent = (10 * 0.10) + (10 * 0.15) + (10 * 0.20) + (10 * 0.25) + (10 * 0.30) + (50 * 0.35) + (totalComplexity - 100) * 1.00;
      }
      animatedSinglePrice = Math.round(baseCalculatedPrice * (1 + surchargePercent));
    }

    // Dynamic size limit surcharge:
    // If resolution exceeds cat.maxBaseSize by 1px -> +0.5%
    // If resolution exceeds cat.maxBaseSize by 100px -> +40%
    // Up to +50% max surcharge
    let sizeSurplusModifier = 1.0;
    if (sprite.categoryId !== '7' && cat.maxBaseSize) {
      const maxDim = Math.max(sprite.width, sprite.height);
      const excess = Math.max(0, maxDim - cat.maxBaseSize);
      if (excess > 0) {
        let extraPercent = 0;
        if (excess === 1) {
          extraPercent = 0.5;
        } else if (excess <= 100) {
          extraPercent = 0.5 + (excess - 1) * ((40 - 0.5) / 99);
        } else {
          extraPercent = Math.min(50, 40 + (excess - 100) * 0.4);
        }
        sizeSurplusModifier = 1.0 + (extraPercent / 100);
      }
    }

    if (sizeSurplusModifier > 1.0) {
      animatedSinglePrice = Math.round(animatedSinglePrice * sizeSurplusModifier);
    }

    // Variant calculation (50% value of full animated cost)
    const singleVarPrice = Math.round(animatedSinglePrice * 0.5);
    const blockOrigTotal = animatedSinglePrice * sprite.countOrig;
    const blockVarTotal = singleVarPrice * sprite.countVar;
    const totalBlockPrice = isInvalidSize ? 0 : (blockOrigTotal + blockVarTotal);

    return {
      totalPrice: totalBlockPrice,
      isInvalidSize,
      baseCalculatedPrice,
      baseDiscountPercent,
      animatedSinglePrice,
      singleVarPrice,
      blockOrigTotal,
      blockVarTotal,
      sizeInfo,
      sizeFactor,
      maxBaseSize: cat.maxBaseSize,
      sizeSurplusModifier,
      frames,
      animModeLogText,
      categoryName: lang === 'ru' ? cat.nameRu : cat.nameEn,
      countOrig: sprite.countOrig,
      countVar: sprite.countVar,
      description: sprite.description.trim(),
      generalComplexity,
      dimensionalComplexity,
      totalComplexity,
      baseGeneralComplexity: sprite.categoryId === '7' ? 0 : baseGeneralComplexity,
      baseTotalComplexity: sprite.categoryId === '7' ? 0 : baseTotalComplexity,
      totalComplexityMultiplier,
      isImpossible,
      complexityStep: step,
      complexityCategory: getComplexityCategory(totalComplexity, lang),
      detailLevel,
      animComplexity,
      designMode,
      isometry,
      quality: sprite.quality || 'optimal',
      qualitySurchargePercent: 0
    };
  };

  // Memoized global calculations
  const orderCalculations = useMemo(() => {
    let rawTotal = 0;
    let cumulativeSprites = 0;
    let surchargeAmount = 0;
    let totalRawDiscount = 0;
    const itemsLogs: string[] = [];
    const rawItems: any[] = [];

    const actualSpeedRate = noDeadline ? 1.0 : speedRate;

    const totalSpritesCount = sprites.reduce((sum, s) => sum + s.countOrig + s.countVar, 0);
    const isLargeSpecification = totalSpritesCount > 100;

    sprites.forEach((s, idx) => {
      const res = calculateSpritePrice(s);
      rawTotal += res.totalPrice;

      // Track surcharge and progressive discounts specifically for this sprite item based on running count
      let itemSurcharge = 0;
      let surchargeBreakdownOrig = 0;
      let surchargeBreakdownVar = 0;

      let itemOrigDiscount = 0;
      let itemVarDiscount = 0;

      // Originals
      for (let i = 0; i < s.countOrig; i++) {
        cumulativeSprites++;
        if (cumulativeSprites > 100) {
          surchargeBreakdownOrig += Math.round(res.animatedSinglePrice * actualSpeedRate * 1);
        }
        if (!isLargeSpecification) {
          let discountPercent = 0;
          if (cumulativeSprites > 50) {
            discountPercent = 50;
          } else if (cumulativeSprites > 10) {
            discountPercent = 25;
          }
          if (discountPercent > 0) {
            itemOrigDiscount += res.animatedSinglePrice * (discountPercent / 100);
          }
        }
      }

      // Variations
      for (let i = 0; i < s.countVar; i++) {
        cumulativeSprites++;
        if (cumulativeSprites > 100) {
          surchargeBreakdownVar += Math.round(res.singleVarPrice * actualSpeedRate * 1);
        }
        if (!isLargeSpecification) {
          let discountPercent = 0;
          if (cumulativeSprites > 50) {
            discountPercent = 50;
          } else if (cumulativeSprites > 10) {
            discountPercent = 25;
          }
          if (discountPercent > 0) {
            itemVarDiscount += res.singleVarPrice * (discountPercent / 100);
          }
        }
      }

      itemSurcharge = surchargeBreakdownOrig + surchargeBreakdownVar;
      surchargeAmount += itemSurcharge;

      const itemDiscountAmount = itemOrigDiscount + itemVarDiscount;
      totalRawDiscount += itemDiscountAmount;

      const itemPriceBeforeDiscount = Math.round(res.totalPrice * actualSpeedRate);
      const itemBulkDiscountAmount = Math.round(itemDiscountAmount * actualSpeedRate);
      const itemSubtotalPrice = itemPriceBeforeDiscount - itemBulkDiscountAmount + itemSurcharge;
      
      const itemLoadMarkupAmount = CURRENT_LOAD_STATUS === 1 
        ? Math.round(itemSubtotalPrice * 0.20) 
        : CURRENT_LOAD_STATUS === 2 
        ? Math.round(itemSubtotalPrice * 0.35) 
        : 0;
        
      const itemNoDeadlineDiscountAmount = (noDeadline && CURRENT_LOAD_STATUS !== 2) 
        ? Math.round((itemSubtotalPrice + itemLoadMarkupAmount) * 0.25) 
        : 0;
        
      const itemFinalPrice = Math.max(0, itemSubtotalPrice + itemLoadMarkupAmount - itemNoDeadlineDiscountAmount);

      rawItems.push({
        index: idx + 1,
        ...res,
        itemPriceBeforeDiscount,
        itemBulkDiscountAmount,
        itemSubtotalPrice,
        itemSurcharge,
        itemLoadMarkupAmount,
        itemNoDeadlineDiscountAmount,
        itemFinalPrice
      });

      // Assemble detailed formula log
      let itemLog = `${idx + 1}. [${res.categoryName}] (Size: ${res.sizeInfo})\n`;
      const baseCategoryPrice = CATEGORIES_LIST.find(c => c.id === s.categoryId)?.basePrice || 0;
      itemLog += `   • Base category rate: ${formatPrice(baseCategoryPrice)}\n`;

      if (s.categoryId === '7') {
        itemLog += `   • Minecraft Skin Type: ${res.sizeInfo}\n`;
        itemLog += `   • Price per skin: ${formatPrice(res.animatedSinglePrice)}\n`;
      } else {
        itemLog += `   • Base General Complexity (Details + Animation): ${res.baseGeneralComplexity}\n`;
        
        const qPts = getQualityPoints(s.categoryId, res.detailLevel);
        const detailLabel = `${res.detailLevel === 'detailed' ? 'Detailed' : res.detailLevel === 'moderate' ? 'Moderate' : 'Optimal'} (+${qPts})`;
        itemLog += `     - Detail Level: ${detailLabel}\n`;
        
        if (s.hasAnimation) {
          const animLvlLabel = res.animComplexity === 'complex' ? 'Complex (+10)' : res.animComplexity === 'medium' ? 'Medium (+5)' : 'Simple (0)';
          const animMultiplier = res.animComplexity === 'complex' ? 1.5 : res.animComplexity === 'medium' ? 1.0 : 0.5;
          const animDivider = res.animComplexity === 'complex' ? 2 : res.animComplexity === 'medium' ? 4 : 6;
          itemLog += `     - Animation Style: ${animLvlLabel}\n`;
          itemLog += `     - Frame count: ${res.frames} frames / ${animDivider} = +${Math.ceil(res.frames / animDivider)}\n`;
        }
        
        itemLog += `   • Dimensional Complexity: sqrt(${s.width}×${s.height}) = ${res.sizeFactor} px size factor\n`;
        itemLog += `     - Pixel step for GC ${res.baseGeneralComplexity} is ${res.complexityStep} px\n`;
        itemLog += `     - Dimensional Complexity = floor(${res.sizeFactor} / ${res.complexityStep}) = +${res.dimensionalComplexity}\n`;
        
        itemLog += `   • Base Total Complexity: ${res.baseGeneralComplexity} + ${res.dimensionalComplexity} = ${res.baseTotalComplexity}\n`;
        
        let multText = '1.0 (Standard)';
        if (res.designMode === 'scratch' && res.isometry) {
          multText = '2.0 (+50% from scratch design, +50% isometric view)';
        } else if (res.designMode === 'scratch') {
          multText = '1.5 (+50% from scratch design)';
        } else if (res.isometry) {
          multText = '1.5 (+50% isometric view)';
        }
        itemLog += `   • Complexity Multiplier: ${multText}\n`;
        itemLog += `   • Total Complexity: Math.round(${res.baseTotalComplexity} * ${res.totalComplexityMultiplier}) = ${res.totalComplexity} (${res.complexityCategory})\n`;
        
        if (res.totalComplexity <= 100) {
          const surchargePct = Math.round((res.animatedSinglePrice / baseCategoryPrice - 1) * 100);
          itemLog += `   • Наценка за сложность: +${surchargePct}% к базовой стоимости\n`;
          itemLog += `   • Стоимость оригинала: ${formatPrice(res.animatedSinglePrice)}\n`;
        } else {
          const surchargePct = Math.round((res.animatedSinglePrice / baseCategoryPrice - 1) * 100);
          itemLog += `   • Наценка за сверхсложность (>100): +${surchargePct}% к базовой стоимости (+100% за каждое очко выше 100)\n`;
          itemLog += `   • Стоимость оригинала: ${formatPrice(res.animatedSinglePrice)}\n`;
        }

        if (res.sizeSurplusModifier > 1.0) {
          const surplusPct = ((res.sizeSurplusModifier - 1.0) * 100).toFixed(1).replace('.0', '');
          itemLog += `   • Size limit surcharge: +${surplusPct}% (resolution exceeds max size ${res.maxBaseSize}px)\n`;
        }
      }

      if (s.countVar > 0) {
        itemLog += `   • Price per variant (50%): ${formatPrice(res.singleVarPrice)}\n`;
      }
      
      itemLog += `   • Subtotal (base): (${formatPrice(res.animatedSinglePrice)} × ${s.countOrig} original) + (${formatPrice(res.singleVarPrice)} × ${s.countVar} variants) = ${formatPrice(res.totalPrice)}\n`;
      
      if (itemDiscountAmount > 0) {
        if (lang === 'ru') {
          itemLog += `   • Оптовая скидка для этой позиции (с учётом лимитов >10 и >50 ассетов): -${formatPrice(Math.round(itemDiscountAmount * actualSpeedRate))}\n`;
        } else {
          itemLog += `   • Progressive wholesale discount for this item (with limits >10 and >50 assets): -${formatPrice(Math.round(itemDiscountAmount * actualSpeedRate))}\n`;
        }
      }

      if (itemSurcharge > 0) {
        if (lang === 'ru') {
          itemLog += `   • НАЦЕНКА (+1000% превышение 100 спрайтов): +${formatPrice(itemSurcharge)}\n`;
        } else {
          itemLog += `   • SURCHARGE (+1000% limit of 100 sprites exceeded): +${formatPrice(itemSurcharge)}\n`;
        }
      }

      itemsLogs.push(itemLog);
    });

    const baseTotalRounded = Math.round(rawTotal);
    const priceBeforeDiscount = Math.round(baseTotalRounded * actualSpeedRate);

    const bulkDiscountAmount = Math.round(totalRawDiscount * actualSpeedRate);
    const hasBulkDiscount = bulkDiscountAmount > 0;
    
    // Subtotal before load surcharges or "no deadline" discounts
    const subtotalPrice = priceBeforeDiscount - bulkDiscountAmount + surchargeAmount;
    
    // Load markup: +20% if CURRENT_LOAD_STATUS === 1 (Medium), +35% if CURRENT_LOAD_STATUS === 2 (Full)
    const loadMarkupAmount = CURRENT_LOAD_STATUS === 1 
      ? Math.round(subtotalPrice * 0.20) 
      : CURRENT_LOAD_STATUS === 2 
      ? Math.round(subtotalPrice * 0.35) 
      : 0;
    
    // "No deadline" discount: -25% if noDeadline is ON, and load status is NOT 2 (Full)
    const noDeadlineDiscountAmount = (noDeadline && CURRENT_LOAD_STATUS !== 2) 
      ? Math.round((subtotalPrice + loadMarkupAmount) * 0.25) 
      : 0;

    const finalPriceRub = Math.max(0, subtotalPrice + loadMarkupAmount - noDeadlineDiscountAmount);
    
    // The true base price of the order WITHOUT the wholesale discount (including load markup and no-deadline option if active)
    const rawPriceBeforeDiscountTotal = priceBeforeDiscount + surchargeAmount;
    const loadMarkupBeforeDiscount = CURRENT_LOAD_STATUS === 1 
      ? Math.round(rawPriceBeforeDiscountTotal * 0.20) 
      : CURRENT_LOAD_STATUS === 2 
      ? Math.round(rawPriceBeforeDiscountTotal * 0.35) 
      : 0;
    const noDeadlineDiscountBeforeDiscount = (noDeadline && CURRENT_LOAD_STATUS !== 2) 
      ? Math.round((rawPriceBeforeDiscountTotal + loadMarkupBeforeDiscount) * 0.25) 
      : 0;
    const priceBeforeDiscountTotal = rawPriceBeforeDiscountTotal + loadMarkupBeforeDiscount - noDeadlineDiscountBeforeDiscount;

    // Prepayment percentage calculated according to the progressive scale
    const prepayPercent = calculatePrepaymentPercent(50, finalPriceRub);

    const prepayAmountRub = Math.round(finalPriceRub * (prepayPercent / 100));

    const isImpossible = rawItems.some(item => item.isImpossible);

    return {
      finalPriceRub,
      prepayAmountRub,
      prepayPercent,
      itemsLogs,
      rawItems,
      baseTotalRounded,
      hasBulkDiscount,
      bulkDiscountAmount,
      priceBeforeDiscount,
      priceBeforeDiscountTotal,
      totalSpritesCount,
      surchargeAmount,
      actualSpeedRate,
      loadMarkupAmount,
      noDeadlineDiscountAmount,
      subtotalPrice,
      isImpossible
    };
  }, [sprites, speedRate, noDeadline, lang, currency, usdRate]);

  // Handle preset templates in dropdown
  const applyPresetSize = (id: number, val: string) => {
    setSprites(prev => prev.map(s => {
      if (s.id === id) {
        if (val === 'custom') {
          return { ...s, templateSize: 'custom' };
        }
        const numericSize = parseInt(val) || 16;
        return {
          ...s,
          templateSize: val,
          width: numericSize,
          height: numericSize
        };
      }
      return s;
    }));
  };

  // Add Sprite block
  const addSpriteBlock = () => {
    const nextId = spriteCounter + 1;
    setSpriteCounter(nextId);
    setSprites(prev => [
      ...prev,
      {
        id: nextId,
        categoryId: '1',
        width: 16,
        height: 16,
        skinType: '1',
        countOrig: 1,
        countVar: 0,
        hasAnimation: false,
        frameMode: 'direct',
        framesDirect: 1,
        animDuration: 3,
        animDelay: 0.5,
        description: '',
        templateSize: '16',
        quality: 'optimal'
      }
    ]);
    setExpandedSprites(prev => ({ ...prev, [nextId]: true }));
  };

  // Add Sprite block with preselected Category
  const addSpriteBlockWithCategory = (catId: string) => {
    const nextId = spriteCounter + 1;
    setSpriteCounter(nextId);
    
    // Choose appropriate defaults for category
    let defaultWidth = 16;
    let defaultHeight = 16;
    if (catId === '2') {
      defaultWidth = 32;
      defaultHeight = 32;
    } else if (catId === '4') {
      defaultWidth = 320;
      defaultHeight = 180;
    } else if (catId === '6') {
      defaultWidth = 256;
      defaultHeight = 144;
    } else if (catId === '7') {
      defaultWidth = 64;
      defaultHeight = 64;
    }

    setSprites(prev => [
      ...prev,
      {
        id: nextId,
        categoryId: catId,
        width: defaultWidth,
        height: defaultHeight,
        skinType: '1',
        countOrig: 1,
        countVar: 0,
        hasAnimation: false,
        frameMode: 'direct',
        framesDirect: 1,
        animDuration: 3,
        animDelay: 0.5,
        description: '',
        templateSize: String(defaultWidth),
        quality: 'optimal'
      }
    ]);
    setExpandedSprites(prev => ({ ...prev, [nextId]: true }));
  };

  // Add completely random sprite block for fun!
  const addRandomSprite = () => {
    const nextId = spriteCounter + 1;
    setSpriteCounter(nextId);

    // 1. Choose a random category ID from '1' to '7'
    const catIds = ['1', '2', '3', '4', '5', '6', '7'];
    const randomCatId = catIds[Math.floor(Math.random() * catIds.length)];

    // 2. Choose a random description based on category and lang
    const randomDescriptions: { [key: string]: { ru: string[]; en: string[] } } = {
      '1': {
        ru: [
          'Посох хаоса со светящимся кристаллом',
          'Стальной щит паладина',
          'Пиксельный куст черники',
          'Сундук с золотыми монетами',
          'Бесшовная текстура раскаленной лавы',
          'Железная руда в темном камне',
          'Светящийся гриб в пещере',
          'Деревянный стул таверны'
        ],
        en: [
          'Chaos staff with glowing crystal',
          'Paladin steel shield',
          'Pixel blueberry bush',
          'Chest full of gold coins',
          'Seamless hot lava texture',
          'Iron ore block in dark stone',
          'Glowing mushroom in a cave',
          'Wooden tavern chair'
        ]
      },
      '2': {
        ru: [
          'Текстура для низкополигональной гоночной машины',
          'Blockbench модель грозного дракона',
          'Скин меча для 3D-модели',
          'Текстура дубовой бочки для RPG',
          'Пиксельная текстура космического корабля'
        ],
        en: [
          'Texture for a low-poly racing car',
          'Blockbench model of a fearsome dragon',
          'Sword texture for Minecraft 3D model',
          'Oak barrel texture for RPG',
          'Pixel texture for a spaceshuttle'
        ]
      },
      '3': {
        ru: [
          'Красное сердечко здоровья для HUD',
          'Иконка книги древних заклинаний',
          'Кнопка главного меню «Начать игру»',
          'Золотая рамка для слота инвентаря',
          'Иконка кубка победителя турнира'
        ],
        en: [
          'Red health heart icon for HUD',
          'Ancient spell book icon',
          'Main menu button "Start Game"',
          'Golden inventory slot frame',
          'Winner tournament cup icon'
        ]
      },
      '4': {
        ru: [
          'Панель настроек звука и графики',
          'Окно кузнечного ремесла и плавки',
          'Сетка инвентаря игрока 9х9',
          'Диалоговое окно таинственного торговца',
          'Экран книги рецептов'
        ],
        en: [
          'Audio & graphics settings panel',
          'Blacksmith crafting and smelting window',
          'Player inventory 9x9 slots grid',
          'Mysterious merchant dialogue box',
          'Recipe book screen layout'
        ]
      },
      '5': {
        ru: [
          'Эпический закат над пиксельными горами',
          'Мрачное глубокое подземелье с факелами',
          'Главный экран космической станции будущего',
          'Катсцена прибытия пиратского корабля',
          'Задний фон заснеженной таежной деревни'
        ],
        en: [
          'Epic sunset over pixel mountains',
          'Gloomy deep dungeon with torches',
          'Future space station backdrop',
          'Pirate ship arrival cutscene backdrop',
          'Snowy taiga village backdrop'
        ]
      },
      '6': {
        ru: [
          'Портрет эльфа-лучника в лесу',
          'Эмоция испуга для диалогового спрайта',
          'Аватарка свирепого орочьего вождя',
          'Карточка легендарного героя пустоты',
          'Лицо мудрого старца-волшебника'
        ],
        en: [
          'Elf archer portrait in the woods',
          'Scared expression for dialogue sprite',
          'Ferocious orc chieftain profile avatar',
          'Legendary void hero card portrait',
          'Wise old wizard portrait'
        ]
      },
      '7': {
        ru: [
          'Скин стильного крипера в деловом костюме',
          'HD-скин рыцаря Края',
          'Новогодний праздничный скин Алекса',
          'Скин зомби-бизнесмена с часами',
          'Скин секретного агента спецслужб'
        ],
        en: [
          'Stylish creeper skin in a business suit',
          'HD Enderman knight skin',
          'New Year festive Alex skin',
          'Zombie businessman skin with watch',
          'Secret agency special agent skin'
        ]
      }
    };

    const descList = randomDescriptions[randomCatId];
    const ruDesc = descList.ru[Math.floor(Math.random() * descList.ru.length)];
    const enDesc = descList.en[Math.floor(Math.random() * descList.en.length)];
    const description = lang === 'ru' ? ruDesc : enDesc;

    // 3. Choose templateSize and width/height
    const targetCat = CATEGORIES_LIST.find(c => c.id === randomCatId) || CATEGORIES_LIST[0];
    let templateSize = '32';
    let width = 32;
    let height = 32;
    let skinType = '1';

    if (randomCatId === '7') {
      skinType = Math.random() > 0.5 ? '2' : '1';
      templateSize = skinType === '2' ? '128' : '64';
      width = skinType === '2' ? 128 : 64;
      height = skinType === '2' ? 128 : 64;
    } else {
      const sizes = ['16', '32', '48', '64', '128', '256'];
      const availableSizes = sizes.filter(s => parseInt(s) <= targetCat.maxBaseSize * 1.5);
      const chosenSizeStr = availableSizes.length > 0 
        ? availableSizes[Math.floor(Math.random() * availableSizes.length)]
        : '32';
      
      templateSize = chosenSizeStr;
      width = parseInt(chosenSizeStr);
      height = parseInt(chosenSizeStr);
    }

    // 4. Counts
    const countOrig = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const countVar = Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0; // 0 to 2

    // 5. Animation
    const hasAnimation = targetCat.supportsAnimation && Math.random() > 0.6;
    const frameMode = Math.random() > 0.5 ? 'direct' : 'calc';
    const framesDirect = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const animDuration = [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)];
    const animDelay = [0.1, 0.2, 0.3, 0.5][Math.floor(Math.random() * 4)];

    // 6. Append new block
    setSprites(prev => [
      ...prev,
      {
        id: nextId,
        categoryId: randomCatId,
        width,
        height,
        skinType,
        countOrig,
        countVar,
        hasAnimation,
        frameMode,
        framesDirect,
        animDuration,
        animDelay,
        description,
        templateSize,
        quality: 'optimal'
      }
    ]);
    setExpandedSprites(prev => ({ ...prev, [nextId]: true }));
  };

  // Remove Sprite Block
  const removeSpriteBlock = (id: number) => {
    if (sprites.length <= 1) {
      // Keep at least one
      return;
    }
    setSprites(prev => prev.filter(s => s.id !== id));
  };

  const moveSpriteUp = (id: number) => {
    setSprites(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx <= 0) return prev;
      const newSprites = [...prev];
      [newSprites[idx - 1], newSprites[idx]] = [newSprites[idx], newSprites[idx - 1]];
      return newSprites;
    });
  };

  const moveSpriteDown = (id: number) => {
    setSprites(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const newSprites = [...prev];
      [newSprites[idx + 1], newSprites[idx]] = [newSprites[idx], newSprites[idx + 1]];
      return newSprites;
    });
  };

  // Duplicate Sprite Block
  const duplicateSpriteBlock = (id: number) => {
    const target = sprites.find(s => s.id === id);
    if (!target) return;
    const nextId = spriteCounter + 1;
    setSpriteCounter(nextId);
    const duplicated: SpriteItemState = {
      ...target,
      id: nextId
    };
    setSprites(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx + 1, 0, duplicated);
        return copy;
      }
      return [...prev, duplicated];
    });
    setExpandedSprites(prev => ({ ...prev, [nextId]: prev[id] ?? false }));
  };

  // Update Sprite fields
  const updateSpriteField = (id: number, key: keyof SpriteItemState, value: any) => {
    setSprites(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [key]: value };
      }
      return s;
    }));
  };

  // Toggle Category Help panel in spec block
  const toggleHelpState = (key: string) => {
    setActiveHelp(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate Technical Specification
  const generateTZ = (autoScroll: boolean = false, isExplicit: boolean = false) => {
    // Check descriptions
    let hasErrors = false;
    sprites.forEach(s => {
      if (!s.description.trim()) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setTzOutput('');
      setValidationError(true);
      if (isExplicit) {
        triggerToast(
          lang === 'ru'
            ? 'Пожалуйста, заполните описание всех задач перед генерацией ТЗ!'
            : 'Please fill in descriptions for all tasks before generating the spec!',
          'error'
        );
      }
      if (autoScroll) {
        const firstInvalidElement = document.getElementById('calc-anchored-form');
        if (firstInvalidElement) {
          firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    let hasSizeErrors = sprites.some(s => s.categoryId !== '7' && (s.width > 1000 || s.height > 1000));
    if (hasSizeErrors) {
      if (autoScroll) {
        triggerToast(
          lang === 'ru' 
            ? 'Превышен максимальный размер (1000px)! Пожалуйста, исправьте значения.' 
            : 'Maximum size exceeded (1000px)! Please correct the values.',
          'error'
        );
      }
      return;
    }

    setValidationError(false);
    let tzText = ``;
    const isRu = lang === 'ru';
    const dateStr = new Date().toLocaleDateString(isRu ? 'ru-RU' : 'en-US');

    tzText += isRu ? `=== ТЕХНИЧЕСКОЕ ЗАДАНИЕ (ПАСПОРТ ЗАКАЗА) ===\n\n` : `=== TECHNICAL SPECIFICATION (ORDER PASSPORT) ===\n\n`;
    tzText += isRu ? `Исполнитель: Village_ (errorsbills@gmail.com)\n` : `Artist: Village_ (errorsbills@gmail.com)\n`;
    tzText += isRu ? `Дата: ${dateStr}\n` : `Date: ${dateStr}\n`;
    tzText += isRu ? `Режим сроков: ${noDeadline ? 'Без дедлайна (-25%)' : 'Стандартный'}\n` : `Deadline Mode: ${noDeadline ? 'No Deadline (-25%)' : 'Standard'}\n`;
    tzText += isRu 
      ? `Загруженность: ${speedRate === 1.35 ? 'Высокая (+35%)' : speedRate === 1.20 ? 'Средняя (+20%)' : 'Стандартная'}\n\n`
      : `Queue Load: ${speedRate === 1.35 ? 'High (+35%)' : speedRate === 1.20 ? 'Medium (+20%)' : 'Standard'}\n\n`;
    
    tzText += isRu ? `[ ИТОГОВЫЙ БЮДЖЕТ И ПРЕДОПЛАТА ]\n` : `[ FINAL BUDGET & PREPAYMENT ]\n`;
    tzText += isRu ? `• Итоговая стоимость: ${formatPrice(orderCalculations.finalPriceRub)}\n` : `• Total Cost: ${formatPrice(orderCalculations.finalPriceRub)}\n`;
    tzText += isRu ? `• Предоплата (${orderCalculations.prepayPercent}%): ${formatPrice(orderCalculations.prepayAmountRub)}\n` : `• Prepayment Amount (${orderCalculations.prepayPercent}%): ${formatPrice(orderCalculations.prepayAmountRub)}\n`;
    tzText += isRu ? `• Всего позиций в заказе: ${orderCalculations.totalSpritesCount} шт.\n` : `• Total Items in Order: ${orderCalculations.totalSpritesCount} pcs.\n`;
    if (orderCalculations.bulkDiscountAmount > 0) {
      tzText += isRu ? `• Оптовая скидка: -${formatPrice(orderCalculations.bulkDiscountAmount)}\n` : `• Volume Discount: -${formatPrice(orderCalculations.bulkDiscountAmount)}\n`;
    }
    tzText += `\n`;

    tzText += isRu ? `[ СОСТАВ ЗАКАЗА И ПАРАМЕТРЫ ]\n\n` : `[ ORDER CONTENTS & SPECIFICATIONS ]\n\n`;

    orderCalculations.rawItems.forEach(item => {
      const designModeLabel = item.designMode === 'scratch'
        ? (isRu ? 'С нуля (+50% к сложности)' : 'From Scratch (+50% multiplier)')
        : (isRu ? 'По готовому референсу' : 'From Reference');
      
      const projectionLabel = item.isometry
        ? (isRu ? 'Изометрическая проекция (+50% к сложности)' : 'Isometric Projection (+50% multiplier)')
        : (isRu ? 'Стандартный 2D вид' : 'Standard 2D View');

      const detailLabel = item.detailLevel === 'detailed' 
        ? (isRu ? 'Высокая (Detailed)' : 'High (Detailed)')
        : item.detailLevel === 'moderate' 
        ? (isRu ? 'Средняя (Moderate)' : 'Medium (Moderate)')
        : (isRu ? 'Оптимальная (Optimal)' : 'Optimal');

      tzText += isRu ? `[№${item.index}] Категория: ${item.categoryName}\n` : `[#${item.index}] Category: ${item.categoryName}\n`;
      tzText += `  • ${isRu ? 'ТЗ / Описание' : 'Task Description'}: ${item.description}\n`;
      tzText += `  • ${isRu ? 'Разрешение' : 'Resolution'}: ${item.sizeInfo}\n`;
      tzText += `  • ${isRu ? 'Разработка' : 'Design Mode'}: ${designModeLabel}\n`;
      tzText += `  • ${isRu ? 'Проекция' : 'Projection'}: ${projectionLabel}\n`;
      tzText += `  • ${isRu ? 'Детализация' : 'Detail Level'}: ${detailLabel}\n`;
      tzText += `  • ${isRu ? 'Сложность' : 'Complexity'}: ${item.complexityCategory} (${item.totalComplexity} pts, ×${item.totalComplexityMultiplier})\n`;
      tzText += `  • ${isRu ? 'Анимация' : 'Animation'}: ${item.hasAnimation ? `${item.frames} ${isRu ? 'кадр(ов)' : 'frame(s)'} (${item.animComplexity})` : (isRu ? 'Статичный спрайт' : 'Static sprite')}\n`;
      tzText += `  • ${isRu ? 'Количество' : 'Quantity'}: ${item.countOrig} ${isRu ? 'ориг.' : 'orig.'}${item.countVar > 0 ? `, ${item.countVar} ${isRu ? 'вар.' : 'vars'}` : ''}\n`;
      tzText += `  • ${isRu ? 'Стоимость позиции' : 'Item Cost'}: ${formatPrice(item.itemFinalPrice)}\n\n`;
    });

    tzText += isRu ? `[ КОД СИДА ДЛЯ ВОССТАНОВЛЕНИЯ РАСЧЁТА ]\n` : `[ RECOVERY SEED CODE ]\n`;
    tzText += `${generatedSeed}\n\n`;
    setTzOutput(tzText);
    
    if (autoScroll) {
      // Auto scroll down to the text area
      setTimeout(() => {
        const outputArea = document.getElementById('tz-output-area');
        if (outputArea) {
          outputArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Copy TZ to Clipboard
  const copyTZ = () => {
    if (!tzOutput) {
      triggerToast(t.generateAlert, 'error');
      return;
    }
    navigator.clipboard.writeText(tzOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download TZ as .txt file
  const downloadTZFile = () => {
    if (!tzOutput) {
      triggerToast(t.generateAlert, 'error');
      return;
    }

    const blob = new Blob([tzOutput], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TZ_PixelArt_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Export Visual TZ as high-res PNG image
  const exportAsImage = async () => {
    const el = document.getElementById('visual-tz-document');
    if (!el) {
      triggerToast(lang === 'ru' ? 'Сначала сформируйте визуальное ТЗ!' : 'Please generate the Visual TZ first!', 'error');
      return;
    }
    try {
      triggerToast(lang === 'ru' ? 'Рендеринг изображения...' : 'Rendering image...', 'info');
      const dataUrl = await htmlToImage.toPng(el, {
        cacheBust: true,
        backgroundColor: '#150624',
        style: {
          transform: 'scale(1)',
          borderRadius: '16px'
        },
        filter: (node) => {
          if (node && (node as HTMLElement).classList && (node as HTMLElement).classList.contains('no-export')) {
            return false;
          }
          return true;
        }
      });
      
      // Append seed to the image code
      const response = await fetch(dataUrl);
      const imageBlob = await response.blob();
      const seedText = `\n\n=== VILLAGE PIXEL ART CALCULATOR SEED ===\n${generatedSeed}\n=========================================\n`;
      const textBlob = new Blob([seedText], { type: 'text/plain' });
      const combinedBlob = new Blob([imageBlob, textBlob], { type: 'image/png' });
      const combinedUrl = URL.createObjectURL(combinedBlob);
      
      const link = document.createElement('a');
      link.download = `TZ_PixelArt_Order_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = combinedUrl;
      link.click();
      URL.revokeObjectURL(combinedUrl);
      
      triggerToast(lang === 'ru' ? 'Изображение успешно сохранено!' : 'Image saved successfully!', 'success');
    } catch (error) {
      console.error('Image export failed:', error);
      triggerToast(lang === 'ru' ? 'Ошибка экспорта изображения!' : 'Failed to export image!', 'error');
    }
  };

  // Export Visual TZ as PDF using jsPDF
  const exportAsPDF = async () => {
    const el = document.getElementById('visual-tz-document');
    if (!el) {
      triggerToast(lang === 'ru' ? 'Сначала сформируйте визуальное ТЗ!' : 'Please generate the Visual TZ first!', 'error');
      return;
    }
    try {
      triggerToast(lang === 'ru' ? 'Генерация PDF документа...' : 'Generating PDF document...', 'info');
      const dataUrl = await htmlToImage.toPng(el, {
        cacheBust: true,
        backgroundColor: '#150624',
        style: {
          transform: 'scale(1)',
          borderRadius: '16px'
        },
        filter: (node) => {
          if (node && (node as HTMLElement).classList && (node as HTMLElement).classList.contains('no-export')) {
            return false;
          }
          return true;
        }
      });

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`TZ_PixelArt_Order_${new Date().toISOString().slice(0, 10)}.pdf`);
      triggerToast(lang === 'ru' ? 'PDF успешно сохранен!' : 'PDF saved successfully!', 'success');
    } catch (error) {
      console.error('PDF export failed:', error);
      triggerToast(lang === 'ru' ? 'Ошибка экспорта PDF!' : 'Failed to export PDF!', 'error');
    }
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    // Keep specification in sync if previously generated
    if (tzOutput) {
      generateTZ(false);
    }
  }, [sprites, speedRate, currency, usdRate, lang]);

  return (
    <div className="min-h-screen bg-[#1c0d2b] text-[#fbf7ff] font-sans antialiased pb-20 selection:bg-[#c084fc] selection:text-[#1c0d2b] relative overflow-x-hidden">
      {/* Dynamic Pixel Dithered Nebula Fog Overlay */}
      <DitherNebula isExpanded={isExpanded} />

      {/* Interactive Cursor Glow with Retro Dithering */}
      {isBgEnabled && <InteractiveDitherBackground mousePos={mousePos} />}

      {/* Top Controls / Nav Bar */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6 flex flex-wrap justify-between items-center gap-4">
        {/* Active Currency Exchange Info (Only shown if USD) */}
        <div className="flex items-center gap-3 bg-[#2d143f] text-[#ebd6f7] px-4 py-2.5 rounded-xl border-2 border-[#180a24] shadow-md text-sm font-mono">
          <Coins className="w-4.5 h-4.5 text-purple-300 animate-pulse" />
          <span>{t.exchangeRateNote.replace('{rate}', usdRate.toString())}</span>
        </div>

        {/* Simplified BGM Toggle Widget */}
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 bg-[#2d143f] text-[#ebd6f7] px-4 py-2 rounded-xl border-2 border-[#180a24] shadow-md text-sm font-semibold cursor-pointer transition-all active:scale-95 hover:border-purple-400 select-none`}
          title={isPlaying ? 'Turn BGM Off' : 'Turn BGM On'}
        >
          {isPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span className="font-bold">BGM: {lang === 'ru' ? 'ВКЛ' : 'ON'}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-bold text-purple-400/80">BGM: {lang === 'ru' ? 'ВЫКЛ' : 'OFF'}</span>
            </>
          )}
        </button>

        {/* Animated Background Toggle Widget */}
        <button
          onClick={toggleBg}
          className={`flex items-center gap-2 bg-[#2d143f] text-[#ebd6f7] px-4 py-2 rounded-xl border-2 border-[#180a24] shadow-md text-sm font-semibold cursor-pointer transition-all active:scale-95 hover:border-purple-400 select-none`}
          title={isBgEnabled ? (lang === 'ru' ? 'Выключить анимацию фона' : 'Turn Background Animation Off') : (lang === 'ru' ? 'Включить анимацию фона' : 'Turn Background Animation On')}
        >
          {isBgEnabled ? (
            <>
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse shrink-0" />
              <span className="font-bold">{lang === 'ru' ? 'ФОН: ВКЛ' : 'BG: ON'}</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-bold text-purple-400/80">{lang === 'ru' ? 'ФОН: ВЫКЛ' : 'BG: OFF'}</span>
            </>
          )}
        </button>

        {/* Translation and Currency Toggles */}
        <div className="flex items-center gap-4">
          {/* Currency Toggle */}
          <div className="flex items-center gap-2 bg-[#2d143f] rounded-xl p-1 border-2 border-[#180a24] shadow-md text-sm font-semibold">
            <button
              onClick={() => setCurrency('rub')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currency === 'rub' ? 'bg-[#c084fc] text-[#1e0a2b] font-bold shadow' : 'text-[#ebd6f7] hover:bg-white/5'
              }`}
            >
              RUB (₽)
            </button>
            <button
              onClick={() => setCurrency('usd')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currency === 'usd' ? 'bg-[#c084fc] text-[#1e0a2b] font-bold shadow' : 'text-[#ebd6f7] hover:bg-white/5'
              }`}
            >
              USD ($)
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-2 bg-[#2d143f] rounded-xl p-1 border-2 border-[#180a24] shadow-md text-sm font-semibold">
            <button
              onClick={() => setLang('ru')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lang === 'ru' ? 'bg-[#c084fc] text-[#1e0a2b] font-bold shadow' : 'text-[#ebd6f7] hover:bg-white/5'
              }`}
            >
              РУС
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                lang === 'en' ? 'bg-[#c084fc] text-[#1e0a2b] font-bold shadow' : 'text-[#ebd6f7] hover:bg-white/5'
              }`}
            >
              ENG
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden w-full max-w-4xl mx-auto rounded-3xl mt-6 px-4">
        <header className="relative z-10 text-center py-8 flex flex-col items-center select-none">
          {/* Avatar Area */}
          <div className="relative group avatar-black-hole transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-105 cursor-pointer">
            <div className="absolute -inset-2 bg-purple-400 rounded-3xl blur-md opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
            <div className="absolute -inset-1.5 bg-[#3d1a56] rounded-2xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div className={`relative bg-[#2d143f] p-2 rounded-2xl border-4 border-[#180a24] group-hover:border-purple-300 transition-all duration-500 flex items-center justify-center overflow-hidden shadow-2xl ${
              isExpanded ? 'w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44' : 'w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56'
            }`}>
              <img
                src="/images/avatar.jpg"
                alt="Village_ Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-all duration-500"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className={`mt-5 font-display font-bold tracking-tight text-[#fbf7ff] drop-shadow-[0_2px_10px_rgba(192,132,252,0.3)] transition-all duration-500 ${
            isExpanded ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-4xl sm:text-5xl md:text-6xl'
          }`}>
            Village_
          </h1>
          {/* PriceList Subtitle with a nice RPG styled frame */}
          <div className={`mt-2 bg-[#220d33] text-[#ebd6f7] px-6 py-1.5 rounded-lg font-mono tracking-widest uppercase shadow-sm border border-[#180a24] transition-all duration-500 ${
            isExpanded ? 'text-lg px-6 py-1.5' : 'text-xl px-7 py-2'
          }`}>
            {t.subtitle}
          </div>

          {/* Beautiful Pixel Artist Description Box */}
          <div className={`mt-5 bg-[#2d143f]/90 rounded-2xl border-2 border-[#3d1a56] p-5 text-[#ebd6f7] relative shadow-md group transition-all duration-500 hover:border-purple-300 hover:shadow-[0_0_25px_rgba(192,132,252,0.15)] transition-all duration-500 ${
            isExpanded ? 'max-w-xl text-sm sm:text-base text-purple-200/90' : 'max-w-2xl text-base sm:text-lg'
          }`}>
            <div className="absolute inset-0.5 border border-[#ebd6f7]/5 rounded-xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <p className="leading-relaxed font-sans text-center whitespace-pre-line">
                {t.artistDescription}
              </p>

              {/* Website link inside description box (only when collapsed) */}
              <AnimatePresence>
                {!isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex justify-center pt-2 overflow-hidden"
                  >
                    <a
                      href="https://village-lsc.github.io/socials/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl border-2 border-[#180a24] shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-white animate-spin-slow" />
                      <span>{lang === 'ru' ? 'Мой сайт' : 'My Website'}: village-lsc.github.io/socials</span>
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
      </div>

      {/* Expand / Collapse Interactive Panel - Just a beautiful simple arrow */}
      <div className="max-w-4xl mx-auto px-4 mb-16 flex flex-col items-center relative z-30">
        <button
          id="expand-arrow"
          onClick={handleExpandToggle}
          className="group flex flex-col items-center justify-center p-3 text-purple-400 hover:text-purple-300 transition-all duration-300 transform active:scale-90 cursor-pointer select-none"
          title={isExpanded ? (lang === 'ru' ? 'Свернуть' : 'Collapse') : (lang === 'ru' ? 'Развернуть' : 'Expand')}
        >
          <motion.div
            animate={{ y: isExpanded ? [0, -4, 0] : [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400/80 group-hover:text-purple-300 transition-colors">
              {isExpanded ? (lang === 'ru' ? 'Свернуть' : 'Collapse') : (lang === 'ru' ? 'Развернуть' : 'Expand')}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-10 h-10 text-purple-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="w-10 h-10 text-purple-400 group-hover:text-white transition-colors animate-pulse" />
            )}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >

      {/* Categories Showcase - fully adaptive page-width layout */}
      <section className="w-full max-w-none px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 mb-20 relative z-10">
        <div className="flex items-center gap-3 border-b-4 border-[#3d1a56] pb-3 mb-10">
          <div className="bg-[#2d143f] text-[#ebd6f7] p-2 rounded-lg border border-[#ebd6f7]/15">
            <Layers className="w-6 h-6 text-[#c084fc]" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight uppercase text-[#ebd6f7]">
            {t.categoryTitle}
          </h2>
        </div>

        <div className="space-y-16">
          {CATEGORIES_LIST.map((cat, index) => {
            // Skip Category 8 (Other) in main showcase as it's a calculator fallback, unless user wants it
            if (cat.id === '8') return null;

            const name = lang === 'ru' ? cat.nameRu : cat.nameEn;
            const desc = lang === 'ru' ? cat.descriptionRu : cat.descriptionEn;
            const points = lang === 'ru' ? cat.pointsRu : cat.pointsEn;
            const note = lang === 'ru' ? cat.noteRu : cat.noteEn;
            const image = getCategoryImage(cat.id);

            // Determine alternating alignment (even index: image left, odd index: image right)
            const isEven = index % 2 === 0;
            const example = lang === 'ru' ? cat.examplesRu[0] : cat.examplesEn[0];

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex flex-col xl:flex-row ${
                  isEven ? 'xl:flex-row' : 'xl:flex-row-reverse'
                } items-center xl:items-start justify-center gap-8 xl:gap-14 w-full`}
              >
                {/* Square work example + pricing beneath column */}
                <SquareFrame
                  cat={cat}
                  imagePath={image}
                  lang={lang}
                  formatPrice={formatPrice}
                />

                {/* Plain Textbox that wraps snugly under the size of its text content */}
                <RegularTextbox className="max-w-xl lg:max-w-2xl h-fit w-fit">
                  <h3 className="font-display text-base sm:text-lg lg:text-xl font-black text-purple-300 tracking-tight mb-1 transition-all duration-300 group-hover:text-white uppercase">
                    {name}
                  </h3>
                  <p className="text-[#ebd6f7] text-sm sm:text-base leading-relaxed mb-2 max-w-xl transition-all duration-300 group-hover:text-white font-bold">
                    {desc}
                  </p>

                  {/* Unified specifications description without bullet lists or lists */}
                  <p className="text-[#ebd6f7]/90 text-sm leading-relaxed max-w-xl transition-all duration-300 group-hover:text-white font-medium">
                    {points.map(pt => pt.trim().endsWith('.') ? pt.trim() : pt.trim() + '.').join(' ')}
                  </p>

                  {/* Shaded/Highlighted Note */}
                  {note && (
                    <div className="mt-2 text-sm sm:text-base text-purple-200 leading-relaxed border-l-2 border-purple-400 pl-2 italic transition-all duration-300 group-hover:text-white font-bold">
                      {note}
                    </div>
                  )}
                </RegularTextbox>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Terms and Working Guidelines Section */}
      <section className="max-w-4xl mx-auto px-4 mb-16 relative z-10 select-none">
        <div className="bg-[#241135] text-[#ebd6f7] rounded-3xl border-4 border-[#140620] p-6 sm:p-8 shadow-[0_0_40px_rgba(192,132,252,0.1)] relative overflow-hidden transition-all duration-300 hover:border-purple-300 hover:shadow-[0_0_45px_rgba(192,132,252,0.2)]">
          <div className="absolute inset-1.5 border border-[#ebd6f7]/5 rounded-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebd6f7]/15 pb-4 mb-6 relative z-10">
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-purple-300">
              {t.termsTitle}
            </h2>
          </div>

          {/* Highlighted Execution Times Notification */}
          <div className="mb-6 bg-purple-950/40 border-2 border-purple-500/30 rounded-2xl p-4 sm:p-5 relative z-10 flex flex-col sm:flex-row items-start gap-4 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-purple-300 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-purple-300 uppercase tracking-wider">
                {lang === 'ru' ? 'Сроки выполнения заказа (Важная информация)' : 'Order Execution Deadlines (Important Info)'}
              </h4>
              <p className="text-sm sm:text-base text-[#ebd6f7]/90 font-semibold leading-relaxed">
                {lang === 'ru' ? (
                  <>
                    Сроки работы определяются <strong>строго индивидуально</strong> для каждого проекта. Указывать свои собственные желаемые сроки выполнения в ТЗ <strong>нельзя</strong>. Обратите внимание: <strong>минимальный срок выполнения любого заказа составляет 14 дней</strong>.
                  </>
                ) : (
                  <>
                    Turnaround times are determined <strong>strictly on an individual basis</strong> for each project. Specifying your own desired deadlines in the specification is <strong>not allowed</strong>. Please note: the <strong>absolute minimum execution time for any order is 14 days</strong>.
                  </>
                )}
              </p>
            </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* Left Column: What I Offer */}
            <div className="space-y-4">
              <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{t.termsWhatIOffer}</span>
              </h3>
              <div className="space-y-2 leading-relaxed font-semibold">
                {[t.offer1, t.offer2, t.offer3, t.offer4, t.offer5, t.offer6].map((offerText, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-2xl border border-purple-500/10 bg-[#12051d]/20 text-[#ebd6f7]/90 ${
                      i === 5 ? 'bg-purple-950/15 border-purple-500/25 border-dashed shadow-sm' : ''
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                    </div>
                    <div className="flex-1 text-sm sm:text-base">
                      <span className="font-mono text-sm opacity-50 mr-1.5">0{i + 1}.</span>
                      <span>{offerText}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Right Column: Forbidden Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{t.termsWhatIsForbidden}</span>
                </h3>
                <div className="space-y-2 font-bold">
                  {[t.forbid1, t.forbid2, t.forbid3, t.forbid4].map((forbidText, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-rose-500/10 bg-rose-500/5 text-[#ebd6f7]/90"
                    >
                      <div className="w-4 h-4 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                        <X className="w-2.5 h-2.5 text-rose-400 stroke-[3]" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold">{forbidText}</span>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Attribution Requirement */}
              <div className="bg-[#12051d] p-4 rounded-2xl border-2 border-[#3d1a56] shadow-inner relative">
                <h4 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                  <span>{t.termsCredits}</span>
                  <span className="text-xs font-mono text-purple-300 font-bold bg-[#1d0c2c] px-2 py-0.5 rounded border border-[#3d1a56]/80">
                    {lang === 'ru' ? 'Буфер обмена' : 'Clipboard'}
                  </span>
                </h4>
                <p className="text-sm leading-relaxed text-[#ebd6f7]/90 font-semibold italic mb-3">
                  {t.termsCreditsText}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('Sprite Artist: Village_');
                    setAttributionCopied(true);
                    setTimeout(() => setAttributionCopied(false), 2000);
                  }}
                  className={`w-full py-2.5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    attributionCopied
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-[#1e0a2b] border-[#3d1a56] text-purple-300 hover:border-purple-300 hover:text-white active:scale-[0.98]'
                  }`}
                >
                  {attributionCopied ? <Check className="w-3.5 h-3.5 text-emerald-400 animate-bounce" /> : <Clipboard className="w-3.5 h-3.5 text-purple-400" />}
                  <span>
                    {attributionCopied
                      ? (lang === 'ru' ? 'Скопировано!' : 'Copied!')
                      : (lang === 'ru' ? 'Скопировать шаблон' : 'Copy Template')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section - HIGHLIGHTED in cozy retro purple panel theme */}
      <section
        id="calc-anchored-form"
        className="max-w-7xl mx-auto px-4 animate-glow"
      >
        <div className="bg-[#241135] text-[#fbf7ff] rounded-3xl border-4 border-[#140620] p-6 sm:p-10 shadow-[0_0_50px_rgba(192,132,252,0.15)] relative overflow-hidden transition-all duration-300 hover:border-purple-300 hover:shadow-[0_0_55px_rgba(192,132,252,0.25)]">
          {/* Inner purple highlight line */}
          <div className="absolute inset-1.5 border border-purple-500/15 rounded-2xl pointer-events-none"></div>

          {/* Calculator Title Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebd6f7]/15 pb-6 mb-8 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-purple-300">
                  {t.calculatorTitle}
                </h2>
              </div>
              <p className="text-[#ebd6f7]/75 text-sm max-w-xl font-semibold">
                {t.calculatorSubtitle}
              </p>
            </div>

            {/* Top Right Controls: Currency selector */}
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <div className="bg-[#12051d] px-4 py-2 rounded-xl border-2 border-[#3d1a56] flex items-center gap-3 shadow-inner">
                <span className="text-sm font-mono tracking-wider uppercase text-[#ebd6f7]/60">
                  {t.currencySelect}
                </span>
                <span className="font-bold text-purple-300 text-sm font-mono">
                  {currency === 'rub' ? t.rub : t.usd}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Banner */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-950/80 border-2 border-red-500 text-red-200 p-4 rounded-xl mb-6 font-semibold text-sm flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                <div>{t.validationBanner}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Sprite Blocks */}
          <div className="space-y-6">
            {/* Collapsed Assets Grid (Clean responsive card layout) */}
            <AnimatePresence>
              {collapsedSprites.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#190729] border-2 border-[#3d1a56] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0.5 border border-[#ebd6f7]/5 rounded-xl pointer-events-none"></div>
                  
                  {/* Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#3d1a56]/80">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-300 animate-pulse" />
                      <span>{lang === 'ru' ? 'Свернутые позиции' : 'Collapsed items'}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-white font-mono text-xs">
                        {collapsedSprites.length}
                      </span>
                    </div>

                    {/* Expand All / Collapse All controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Expand all collapsed sprites
                          setExpandedSprites(prev => {
                            const next = { ...prev };
                            collapsedSprites.forEach(s => { next[s.id] = true; });
                            return next;
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                        <span>{lang === 'ru' ? 'Раскрыть все' : 'Expand all'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Responsive grid for collapsed items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {collapsedSprites.map((sprite) => {
                      const idx = sprites.findIndex(s => s.id === sprite.id);
                      const activeCat = CATEGORIES_LIST.find(c => c.id === sprite.categoryId) || CATEGORIES_LIST[0];
                      const calc = calculateSpritePrice(sprite);
                      
                      let IconComponent = Plus;
                      if (activeCat.id === '1') IconComponent = Sword;
                      else if (activeCat.id === '2') IconComponent = Box;
                      else if (activeCat.id === '3') IconComponent = Layout;
                      else if (activeCat.id === '4') IconComponent = Tv;
                      else if (activeCat.id === '5') IconComponent = Gamepad2;
                      else if (activeCat.id === '6') IconComponent = ImageIcon;
                      else if (activeCat.id === '7') IconComponent = User;
                      else if (activeCat.id === '8') IconComponent = Layers;

                      return (
                        <motion.div
                          key={sprite.id}
                          layout
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          className="bg-[#261036] hover:bg-[#2e1342] border border-[#3d1a56] hover:border-purple-400/80 rounded-xl p-3 shadow-md transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div 
                              onClick={() => setExpandedSprites(prev => ({ ...prev, [sprite.id]: true }))}
                              className="flex items-start gap-2.5 flex-1 cursor-pointer min-w-0"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#190729] flex items-center justify-center border border-[#3d1a56] group-hover:border-purple-400/40 shrink-0 mt-0.5">
                                <IconComponent className="w-4 h-4 text-purple-300" />
                              </div>
                              
                              <div className="min-w-0 flex-1" onClick={(e) => {
                                if (renamingSpriteId === sprite.id) {
                                  e.stopPropagation();
                                }
                              }}>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded text-xs uppercase font-black border border-purple-500/30">
                                    #{idx + 1}
                                  </span>
                                  <span className="text-xs uppercase font-mono text-purple-300/70 truncate">
                                    {lang === 'ru' ? activeCat.nameRu : activeCat.nameEn}
                                  </span>
                                </div>

                                {renamingSpriteId === sprite.id ? (
                                  <input 
                                    type="text" 
                                    autoFocus
                                    value={sprite.description}
                                    onChange={(e) => updateSpriteField(sprite.id, 'description', e.target.value)}
                                    onBlur={() => setRenamingSpriteId(null)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setRenamingSpriteId(null); }}
                                    className="w-full bg-[#12051d] border border-purple-500/50 text-white text-xs px-2 py-1 rounded focus:outline-none"
                                    placeholder={lang === 'ru' ? 'Введите название...' : 'Enter name...'}
                                  />
                                ) : (
                                  <span className="text-xs text-white font-bold block leading-snug line-clamp-2">
                                    {sprite.description ? sprite.description : (lang === 'ru' ? activeCat.nameRu : activeCat.nameEn)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price Pill */}
                            <div className="text-right shrink-0 font-mono">
                              <span className="text-xs font-black text-fuchsia-300 block">
                                {formatPrice(calc.totalPrice)}
                              </span>
                              <span className="text-xs text-[#ebd6f7]/60 block">
                                {sprite.categoryId === '7' ? sprite.skinType === '2' ? '128x128' : '64x64' : `${sprite.width}x${sprite.height}`}
                              </span>
                            </div>
                          </div>

                          {/* Action Toolbar Footer */}
                          <div className="flex items-center justify-between border-t border-[#3d1a56]/80 pt-2 font-mono text-xs text-[#ebd6f7]/80">
                            <div className="flex items-center gap-1 overflow-hidden">
                              <span className="truncate text-xs">
                                {sprite.countOrig} {lang === 'ru' ? 'ор.' : 'orig'} {sprite.countVar > 0 && `+ ${sprite.countVar} вар.`}
                              </span>
                              {sprite.designMode === 'scratch' && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 text-xs uppercase font-bold shrink-0">
                                  0
                                </span>
                              )}
                              {sprite.isometry && (
                                <span className="px-1.5 py-0.5 rounded bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/30 text-xs uppercase font-bold shrink-0">
                                  3D
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveSpriteUp(sprite.id)}
                                disabled={idx === 0}
                                className="p-1 text-stone-400 hover:text-white hover:bg-purple-900/50 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={lang === 'ru' ? 'Вверх' : 'Move Up'}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSpriteDown(sprite.id)}
                                disabled={idx === sprites.length - 1}
                                className="p-1 text-stone-400 hover:text-white hover:bg-purple-900/50 rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={lang === 'ru' ? 'Вниз' : 'Move Down'}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRenamingSpriteId(sprite.id)}
                                className="p-1 text-stone-400 hover:text-white hover:bg-purple-900/50 rounded transition-all cursor-pointer"
                                title={lang === 'ru' ? 'Переименовать' : 'Rename'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => duplicateSpriteBlock(sprite.id)}
                                className="p-1 text-purple-300 hover:text-white hover:bg-purple-900/50 rounded transition-all cursor-pointer"
                                title={lang === 'ru' ? 'Дублировать' : 'Duplicate'}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Always prominent delete button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (sprites.length <= 1) {
                                    triggerToast(
                                      lang === 'ru' 
                                        ? 'Нельзя удалить последнюю позицию!' 
                                        : 'Cannot delete the last item!',
                                      'error'
                                    );
                                    return;
                                  }
                                  removeSpriteBlock(sprite.id);
                                }}
                                className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/60 rounded transition-all cursor-pointer"
                                title={lang === 'ru' ? 'Удалить' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setExpandedSprites(prev => ({ ...prev, [sprite.id]: true }))}
                                className="p-1 text-purple-400 hover:text-white hover:bg-purple-900/50 rounded transition-all cursor-pointer ml-1"
                                title={lang === 'ru' ? 'Раскрыть' : 'Expand'}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {sprites.map((sprite, idx) => {
                const isExpanded = expandedSprites[sprite.id] !== false;
                if (!isExpanded) return null;

                const calculated = calculateSpritePrice(sprite);
                const blockKey = `sprite-${sprite.id}`;
                const helpOpen = activeHelp[blockKey] || false;
                const activeCat = CATEGORIES_LIST.find(c => c.id === sprite.categoryId) || CATEGORIES_LIST[0];

                const isLoadedFromSeed = justLoadedFromSeedIds.includes(sprite.id);

                return (
                  <motion.div
                    key={sprite.id}
                    initial={isLoadedFromSeed ? { opacity: 0, y: 50, scale: 0.93 } : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={isLoadedFromSeed ? { type: "spring", stiffness: 70, damping: 15, delay: idx * 0.1 } : { duration: 0.2 }}
                    className={`bg-[#2d143f] border-4 ${isLoadedFromSeed ? 'border-purple-300 shadow-[0_0_35px_rgba(192,132,252,0.3)] animate-glow' : 'border-[#140620]'} rounded-2xl p-5 sm:p-6 shadow-xl hover:border-purple-300 hover:shadow-[0_0_25px_rgba(192,132,252,0.15)] transition-all duration-300 relative overflow-hidden group`}
                  >
                    {/* Particle burst of white sparks when loaded from seed */}
                    {isLoadedFromSeed && <SeedParticleBurst />}

                    {/* Inner highlight line inside sprite block */}
                    <div className="absolute inset-1 border border-[#ebd6f7]/5 rounded-xl pointer-events-none"></div>

                    {/* Block Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#ebd6f7]/10 pb-4 mb-5 relative z-10 select-none">
                      <div 
                        onClick={() => {
                          const isExpanded = expandedSprites[sprite.id] !== false;
                          setExpandedSprites(prev => ({ ...prev, [sprite.id]: !isExpanded }));
                        }}
                        className="flex flex-wrap items-center gap-2.5 flex-1 cursor-pointer group/header"
                      >
                        {/* Collapse Toggle Icon */}
                        <div className="w-8 h-8 rounded-lg bg-[#12051d] hover:bg-purple-950 border border-[#3d1a56] flex items-center justify-center text-purple-300 transition-colors">
                          {expandedSprites[sprite.id] !== false ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        <span className="font-mono text-sm sm:text-base font-bold bg-[#12051d] text-purple-300 px-2.5 py-1 rounded-lg border-2 border-[#3d1a56] shadow-inner group-hover/header:border-purple-400/50 transition-colors">
                          {t.assetCardTitle}{idx + 1}
                        </span>

                        <span className="text-base font-bold text-purple-100 tracking-tight group-hover/header:text-purple-300 transition-colors">
                          {lang === 'ru' ? activeCat.nameRu : activeCat.nameEn}
                        </span>

                        {/* Collapsed Mini Summary Badge */}
                        {expandedSprites[sprite.id] === false && (
                          <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200/80 font-semibold bg-[#12051d]/40 px-2.5 py-1 rounded-lg border border-[#3d1a56]/50">
                            <span>{sprite.width}×{sprite.height} px</span>
                            <span className="opacity-40">•</span>
                            <span>
                              {sprite.hasAnimation 
                                ? (lang === 'ru' ? `Аним. (${calculated.frames} к.)` : `Anim (${calculated.frames} fr.)`) 
                                : (lang === 'ru' ? 'Статичный' : 'Static')}
                            </span>
                            <span className="opacity-40">•</span>
                            <span>
                              {lang === 'ru' 
                                ? `${sprite.countOrig} ориг. / ${sprite.countVar} подв.` 
                                : `${sprite.countOrig} orig. / ${sprite.countVar} var.`}
                            </span>
                            {sprite.description.trim() && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="text-purple-300/70 italic max-w-[180px] truncate">
                                  "{sprite.description}"
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Subtotal badge */}
                        <div className="text-xs sm:text-sm font-bold text-[#f7f5ef] bg-[#12051d] px-3.5 py-1.5 rounded-xl border border-purple-500/20 shadow-inner font-mono">
                          {calculated.isInvalidSize ? (
                            <span className="text-red-400 animate-pulse">! SIZE</span>
                          ) : (
                            <span className="text-purple-300 font-extrabold">
                              {formatPrice(calculated.totalPrice)}
                            </span>
                          )}
                        </div>

                        {sprites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpriteBlock(sprite.id)}
                            className="flex items-center gap-1.5 text-sm font-bold text-red-300 hover:text-red-200 bg-[#3a0c14] hover:bg-[#521320] border-2 border-[#140620] px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t.deleteBtn}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Collapsible Form Body Wrapper */}
                    {expandedSprites[sprite.id] !== false && (
                      <div className="space-y-5">

                    {/* Inputs Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                      {/* Column 1: Category Selection & Description */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/70 mb-1.5 flex items-center justify-between">
                            <span>{t.categoryLabel}</span>
                            <button
                              type="button"
                              onClick={() => toggleHelpState(blockKey)}
                              className="text-xs sm:text-sm font-bold text-purple-200 hover:text-white flex items-center gap-1.5 bg-[#1f0933] hover:bg-[#331152] px-3.5 py-1.5 rounded-xl border-2 border-purple-400/40 hover:border-purple-300 cursor-pointer transition-all active:scale-95 shadow-sm"
                            >
                              <Info className="w-4 h-4 text-purple-300 stroke-[2.5]" />
                              <span>{lang === 'ru' ? 'Формула расчета ?' : 'Formula ?'}</span>
                            </button>
                          </label>

                          {/* Beautiful Custom Dropdown Select replacing the crammed grid */}
                          <div className="relative mt-1.5">
                            <button
                              type="button"
                              onClick={() => setOpenDropdownSpriteId(openDropdownSpriteId === sprite.id ? null : sprite.id)}
                              className="w-full bg-[#12051d] text-[#ebd6f7] hover:bg-[#1a0729] px-3 py-2.5 rounded-xl border-2 border-[#3d1a56] font-bold text-sm sm:text-base flex items-center justify-between transition-all shadow-inner relative z-20 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                                <span className="whitespace-normal text-left break-words">{lang === 'ru' ? activeCat.nameRu : activeCat.nameEn}</span>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-purple-300 transition-transform duration-200 shrink-0 ml-1 ${openDropdownSpriteId === sprite.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Options List */}
                            <AnimatePresence>
                              {openDropdownSpriteId === sprite.id && (
                                <>
                                  {/* Backdrop overlay to close dropdown */}
                                  <div 
                                    className="fixed inset-0 z-20" 
                                    onClick={() => setOpenDropdownSpriteId(null)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-0 right-0 mt-1.5 bg-[#170825] border-2 border-[#5b2b7a] rounded-xl shadow-2xl overflow-y-auto max-h-60 z-30 divide-y divide-[#ebd6f7]/5 divide-dashed"
                                  >
                                    {CATEGORIES_LIST.map(c => {
                                      const isActive = sprite.categoryId === c.id;
                                      return (
                                        <button
                                          key={c.id}
                                          type="button"
                                          onClick={() => {
                                            updateSpriteField(sprite.id, 'categoryId', c.id);
                                            setOpenDropdownSpriteId(null);
                                          }}
                                          className={`w-full text-left px-3.5 py-3 text-sm font-bold transition-all flex items-center justify-between select-none cursor-pointer ${
                                            isActive
                                              ? 'bg-[#c084fc]/20 text-purple-200'
                                              : 'text-[#ebd6f7]/85 hover:bg-[#280f3e] hover:text-white'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-purple-300' : 'bg-purple-300/30'}`} />
                                            <span className="whitespace-normal text-left break-words">{lang === 'ru' ? c.nameRu : c.nameEn}</span>
                                          </div>
                                          <span className="text-xs font-mono bg-[#12051d] px-1.5 py-0.5 rounded border border-[#3d1a56] text-purple-300 uppercase shrink-0 font-black">
                                            CAT #0{c.id}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Animated Category Showcase with Black Hole Transition */}
                          <div className="mt-3.5">
                            <CategoryShowcaseAnimation
                              catId={sprite.categoryId}
                              lang={lang}
                            />
                          </div>
                        </div>

                        {/* Expandable Category Help & Info inside this Sprite Block */}
                        <AnimatePresence>
                          {helpOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-[#12051d] rounded-xl p-3.5 border border-purple-500/30 text-sm space-y-2 overflow-hidden"
                            >
                              <div className="font-bold text-purple-300">
                                {lang === 'ru' ? activeCat.nameRu : activeCat.nameEn}
                              </div>
                              <p className="text-[#ebd6f7]/90 leading-relaxed text-xs">
                                {lang === 'ru' ? activeCat.descriptionRu : activeCat.descriptionEn}
                              </p>
                              <div>
                                <strong className="text-purple-200 text-xs">{t.useCasesTitle}</strong>
                                <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-[#ebd6f7]/80 text-xs">
                                  {(lang === 'ru' ? activeCat.useCasesRu : activeCat.useCasesEn).map((uc, ucIdx) => (
                                    <li key={ucIdx}>{uc}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#1a0729] p-2.5 rounded-lg border border-purple-500/20 text-xs">
                                <div>
                                  <div className="text-purple-300/80 font-bold uppercase tracking-wider text-xs">
                                    {lang === 'ru' ? 'Начальная ставка:' : 'Starting rate:'}
                                  </div>
                                  <div className="font-mono font-bold text-purple-200 mt-0.5">
                                    {formatPrice(activeCat.basePrice)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-purple-300/80 font-bold uppercase tracking-wider text-xs">
                                    {lang === 'ru' ? 'Предпочт. размер:' : 'Preferred size:'}
                                  </div>
                                  <div className="font-mono font-bold text-stone-200 mt-0.5">
                                    {lang === 'ru' ? activeCat.preferredSizeRu : activeCat.preferredSizeEn}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-purple-300/80 font-bold uppercase tracking-wider text-xs">
                                    {lang === 'ru' ? 'Примерная цена:' : 'Approx. price:'}
                                  </div>
                                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                                    ~{formatPrice(activeCat.popularPriceNum)} <span className="text-xs text-purple-300 font-normal">({lang === 'ru' ? activeCat.popularResRu : activeCat.popularResEn})</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs bg-black/20 p-2.5 rounded leading-relaxed border border-[#ebd6f7]/15 text-stone-200 font-mono">
                                <strong>{t.howCalculatedTitle}</strong><br />
                                {lang === 'ru' ? activeCat.formulaHelpRu : activeCat.formulaHelpEn}
                                {activeCat.id !== '7' && (
                                  <div className="mt-1 text-red-400 font-sans">
                                    {t.sizeThresholdLimit} {activeCat.maxBaseSize}px. {t.overLimitPriceWarning}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Column 2: Dimensions & Predefined Presets */}
                      <div className="space-y-4">
                        {sprite.categoryId === '7' ? (
                          // Minecraft-skins specific fields
                          <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/70 mb-2">
                              {t.skinTypeLabel}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { value: '1', label: t.standardSkin },
                                { value: '2', label: t.hdSkin }
                              ].map(sOption => {
                                const isSelected = sprite.skinType === sOption.value;
                                return (
                                  <button
                                    key={sOption.value}
                                    type="button"
                                    onClick={() => updateSpriteField(sprite.id, 'skinType', sOption.value as '1' | '2')}
                                    className={`text-left px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? 'bg-purple-500 text-white border-purple-300 shadow-md scale-[1.01]'
                                        : 'bg-[#12051d] text-[#ebd6f7]/80 border-[#3d1a56] hover:bg-[#1a0729]'
                                    }`}
                                  >
                                    <span>{sOption.label}</span>
                                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#12051d] text-purple-300' : 'bg-[#1a0729] text-[#ebd6f7]/60'}`}>
                                      {sOption.value === '2' ? 'HD' : '64px'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          // Standard Dimensions (Width/Height)
                          <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/90 mb-1.5 flex justify-between">
                              <span>{t.resolutionLabel}</span>
                              {calculated.isInvalidSize ? (
                                <span className="text-xs font-mono text-red-400 font-bold animate-pulse">
                                  {lang === 'ru' ? 'недопустимое значение' : 'invalid value'}
                                </span>
                              ) : (
                                <span className="text-xs font-mono text-[#ebd6f7]/70">
                                  Factor: {calculated.sizeFactor}px
                                </span>
                              )}
                            </label>

                            {/* Presets row selector */}
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-2.5 w-full">
                              {[
                                { value: '16', label: '16' },
                                { value: '32', label: '32' },
                                { value: '48', label: '48' },
                                { value: '64', label: '64' },
                                { value: '128', label: '128' },
                                { value: '256', label: '256' },
                                { value: 'custom', label: 'Custom' }
                              ].map(p => {
                                const isSelected = sprite.templateSize === p.value;
                                return (
                                  <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => applyPresetSize(sprite.id, p.value)}
                                    className={`px-1 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center w-full ${
                                      isSelected
                                        ? 'bg-purple-500 text-white border-purple-300 shadow-sm'
                                        : 'bg-[#12051d] text-[#ebd6f7]/80 border-[#3d1a56] hover:bg-[#1a0729] hover:text-white'
                                    }`}
                                  >
                                    {p.label === 'Custom' ? (lang === 'ru' ? 'Свой' : 'Custom') : `${p.label}²`}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Tactile input step controls */}
                            <div className="grid grid-cols-2 gap-3 mt-2.5">
                              <div>
                                <span className="block text-xs uppercase font-bold text-[#ebd6f7]/80 mb-1 font-mono">Width</span>
                                <div className={`flex items-center bg-[#12051d] border-2 rounded-xl overflow-hidden focus-within:border-purple-300 transition-colors h-10 ${sprite.width > 1000 ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#3d1a56]'}`}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = Math.max(1, sprite.width - 8);
                                      updateSpriteField(sprite.id, 'width', val);
                                      updateSpriteField(sprite.id, 'templateSize', 'custom');
                                    }}
                                    className="px-2.5 text-purple-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold font-mono text-sm cursor-pointer select-none"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={sprite.width === 0 ? '' : sprite.width}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                      updateSpriteField(sprite.id, 'width', val);
                                      updateSpriteField(sprite.id, 'templateSize', 'custom');
                                    }}
                                    onBlur={() => {
                                      if (sprite.width < 1) {
                                        updateSpriteField(sprite.id, 'width', 1);
                                      }
                                    }}
                                    className="w-full bg-transparent text-purple-300 text-center font-bold font-mono focus:outline-none border-0 text-sm py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = sprite.width + 8;
                                      updateSpriteField(sprite.id, 'width', val);
                                      updateSpriteField(sprite.id, 'templateSize', 'custom');
                                    }}
                                    className="px-2.5 text-purple-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold font-mono text-sm cursor-pointer select-none"
                                  >
                                    +
                                  </button>
                                </div>
                                {sprite.width > 1000 && (
                                  <span className="text-xs font-bold text-red-400 mt-1 block leading-tight">
                                    {lang === 'ru' ? 'недопустимое значение' : 'invalid value'}
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className="block text-xs uppercase font-bold text-[#ebd6f7]/80 mb-1 font-mono">Height</span>
                                <div className={`flex items-center bg-[#12051d] border-2 rounded-xl overflow-hidden focus-within:border-purple-300 transition-colors h-10 ${sprite.height > 1000 ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#3d1a56]'}`}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = Math.max(1, sprite.height - 8);
                                      updateSpriteField(sprite.id, 'height', val);
                                      updateSpriteField(sprite.id, 'templateSize', 'custom');
                                    }}
                                    className="px-2.5 text-purple-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold font-mono text-sm cursor-pointer select-none"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={sprite.height === 0 ? '' : sprite.height}
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                      updateSpriteField(sprite.id, 'height', val);
                                      updateSpriteField(sprite.id, 'templateSize', 'custom');
                                    }}
                                    onBlur={() => {
                                      if (sprite.height < 1) {
                                        updateSpriteField(sprite.id, 'height', 1);
                                      }
                                    }}
                                    className="w-full bg-transparent text-purple-300 text-center font-bold font-mono focus:outline-none border-0 text-sm py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const val = sprite.height + 8;
                                      updateSpriteField(sprite.id, 'height', val);
                                      updateSpriteField(sprite.id, 'templateSize', 'custom');
                                    }}
                                    className="px-2.5 text-purple-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold font-mono text-sm cursor-pointer select-none"
                                  >
                                    +
                                  </button>
                                </div>
                                {sprite.height > 1000 && (
                                  <span className="text-xs font-bold text-red-400 mt-1 block leading-tight">
                                    {lang === 'ru' ? 'недопустимое значение' : 'invalid value'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {sprite.categoryId !== '7' && calculated.sizeFactor > activeCat.maxBaseSize && (
                              <div className="mt-2 text-xs text-amber-400 font-bold leading-relaxed border border-amber-500/20 bg-amber-500/5 px-3 py-2 rounded-lg flex items-center gap-2">
                                <Info className="w-4 h-4 shrink-0 text-amber-400" />
                                <span>
                                  {lang === 'ru' 
                                    ? `Превышен рекомендуемый лимит (${activeCat.maxBaseSize}px) для данной категории. Взимается дополнительная плата за повышенный размер.` 
                                    : `Exceeded the recommended limit (${activeCat.maxBaseSize}px) for this category. An additional size surcharge is charged.`
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Canvas Size Dynamic Preview */}
                        <CanvasSizePreview 
                          width={sprite.width} 
                          height={sprite.height} 
                          lang={lang} 
                        />
                      </div>

                      {/* Column 3: Quantity Volumes & Quality Selection */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/90 mb-1.5 flex justify-between">
                            <span>{t.quantityLabel}</span>
                          </label>
                          <div className="bg-[#12051d] rounded-2xl p-3.5 border-2 border-[#3d1a56] space-y-3 shadow-inner">
                            {/* Original sprite count */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-[#ebd6f7]/90 font-bold">
                                {t.mainSprites}
                              </span>
                              <div className="flex items-center bg-[#1a0729] border border-[#3d1a56] rounded-lg overflow-hidden h-8 w-28 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateSpriteField(sprite.id, 'countOrig', Math.max(1, sprite.countOrig - 1))}
                                  className="w-8 h-full flex items-center justify-center text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer shrink-0"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={sprite.countOrig === 0 ? '' : sprite.countOrig}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                    updateSpriteField(sprite.id, 'countOrig', val);
                                  }}
                                  onBlur={() => {
                                    if (sprite.countOrig < 1) {
                                      updateSpriteField(sprite.id, 'countOrig', 1);
                                    }
                                  }}
                                  className="flex-1 min-w-0 bg-transparent text-center text-sm text-purple-300 font-bold font-mono focus:outline-none border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSpriteField(sprite.id, 'countOrig', sprite.countOrig + 1)}
                                  className="w-8 h-full flex items-center justify-center text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            {/* Variation sprite count */}
                            <div className="flex items-center justify-between gap-2 border-t border-[#ebd6f7]/10 pt-3">
                              <span className="text-sm text-[#ebd6f7]/90 font-bold">
                                {t.variantsSprites}
                              </span>
                              <div className="flex items-center bg-[#1a0729] border border-[#3d1a56] rounded-lg overflow-hidden h-8 w-28 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateSpriteField(sprite.id, 'countVar', Math.max(0, sprite.countVar - 1))}
                                  className="w-8 h-full flex items-center justify-center text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer shrink-0"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={sprite.countVar === 0 ? '' : sprite.countVar}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                    updateSpriteField(sprite.id, 'countVar', val);
                                  }}
                                  onBlur={() => {
                                    if (sprite.countVar < 0) {
                                      updateSpriteField(sprite.id, 'countVar', 0);
                                    }
                                  }}
                                  className="flex-1 min-w-0 bg-transparent text-center text-sm text-purple-300 font-bold font-mono focus:outline-none border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSpriteField(sprite.id, 'countVar', sprite.countVar + 1)}
                                  className="w-8 h-full flex items-center justify-center text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Design & Isometry Complexity Options (Moved to Column 3 for optimal balanced visual layout) */}
                        {sprite.categoryId !== '7' && (
                          <div className="pt-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                              {/* Design Creation Card */}
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => updateSpriteField(sprite.id, 'designMode', sprite.designMode === 'scratch' ? 'reference' : 'scratch')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    updateSpriteField(sprite.id, 'designMode', sprite.designMode === 'scratch' ? 'reference' : 'scratch');
                                  }
                                }}
                                className="bg-[#12051d]/40 backdrop-blur-md border border-[#3d1956] rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:border-purple-500/50 hover:bg-[#180727]/50 relative overflow-hidden flex flex-col justify-between min-h-[96px] sm:min-h-[110px] cursor-pointer active:scale-[0.99] select-none text-left"
                              >
                                <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-300">
                                        {lang === 'ru' ? 'Дизайн' : 'Design'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDesignHelp(prev => ({ ...prev, [sprite.id]: !prev[sprite.id] }));
                                        }}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#270d3c] hover:bg-purple-800/80 border-2 border-purple-400/50 hover:border-purple-300 text-purple-200 hover:text-white flex items-center justify-center text-xs sm:text-sm font-black transition-all hover:scale-110 active:scale-95 cursor-pointer select-none shrink-0 shadow-md"
                                        title={lang === 'ru' ? 'Справка' : 'Help'}
                                      >
                                        i
                                      </button>
                                    </div>
                                  </div>

                                  {/* Custom Switch Toggle */}
                                  <div
                                    className={`relative w-11 h-6 sm:w-14 sm:h-8 rounded-full transition-all duration-300 shrink-0 ${
                                      sprite.designMode === 'scratch'
                                        ? 'bg-purple-600 shadow-[0_0_14px_rgba(147,51,234,0.5)]'
                                        : 'bg-[#0f0418] border border-purple-500/15'
                                    }`}
                                  >
                                    <div
                                      className={`absolute top-1 left-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white transition-transform duration-300 shadow-md ${
                                        sprite.designMode === 'scratch' 
                                          ? 'translate-x-5 sm:translate-x-6' 
                                          : 'translate-x-0'
                                      }`}
                                    />
                                  </div>
                                </div>

                                <div className="mt-2 sm:mt-3.5 pt-1.5 sm:pt-2.5 border-t border-purple-500/5 flex items-center justify-between text-xs sm:text-sm font-mono">
                                  <span className="text-[#ebd6f7]/40 uppercase tracking-wider font-bold truncate max-w-[70px] sm:max-w-none">
                                    {sprite.designMode === 'scratch' ? (lang === 'ru' ? 'С нуля' : 'From Scratch') : (lang === 'ru' ? 'Референс' : 'Reference')}
                                  </span>
                                  <span className={`font-black shrink-0 ${sprite.designMode === 'scratch' ? 'text-purple-400' : 'text-stone-500'}`}>
                                    {sprite.designMode === 'scratch' ? '+50%' : '0%'}
                                  </span>
                                </div>
                              </div>

                              {/* Isometric View Card */}
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => updateSpriteField(sprite.id, 'isometry', !sprite.isometry)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    updateSpriteField(sprite.id, 'isometry', !sprite.isometry);
                                  }
                                }}
                                className="bg-[#12051d]/40 backdrop-blur-md border border-[#3d1956] rounded-2xl p-2.5 sm:p-4 transition-all duration-300 hover:border-purple-500/50 hover:bg-[#180727]/50 relative overflow-hidden flex flex-col justify-between min-h-[96px] sm:min-h-[110px] cursor-pointer active:scale-[0.99] select-none text-left"
                              >
                                <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                      <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-300">
                                        {lang === 'ru' ? 'Изометрия' : 'Isometry'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsometryHelp(prev => ({ ...prev, [sprite.id]: !prev[sprite.id] }));
                                        }}
                                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#270d3c] hover:bg-purple-800/80 border-2 border-purple-400/50 hover:border-purple-300 text-purple-200 hover:text-white flex items-center justify-center text-xs sm:text-sm font-black transition-all hover:scale-110 active:scale-95 cursor-pointer select-none shrink-0 shadow-md"
                                        title={lang === 'ru' ? 'Справка' : 'Help'}
                                      >
                                        i
                                      </button>
                                    </div>
                                  </div>

                                  {/* Custom Switch Toggle */}
                                  <div
                                    className={`relative w-11 h-6 sm:w-14 sm:h-8 rounded-full transition-all duration-300 shrink-0 ${
                                      sprite.isometry
                                        ? 'bg-purple-600 shadow-[0_0_14px_rgba(147,51,234,0.5)]'
                                        : 'bg-[#0f0418] border border-purple-500/15'
                                    }`}
                                  >
                                    <div
                                      className={`absolute top-1 left-1 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white transition-transform duration-300 shadow-md ${
                                        sprite.isometry 
                                          ? 'translate-x-5 sm:translate-x-6' 
                                          : 'translate-x-0'
                                      }`}
                                    />
                                  </div>
                                </div>

                                <div className="mt-2 sm:mt-3.5 pt-1.5 sm:pt-2.5 border-t border-purple-500/5 flex items-center justify-between text-xs sm:text-sm font-mono">
                                  <span className="text-[#ebd6f7]/40 uppercase tracking-wider font-bold truncate max-w-[70px] sm:max-w-none">
                                    {sprite.isometry ? (lang === 'ru' ? 'Изо: Да' : 'Iso: Yes') : (lang === 'ru' ? 'Изо: Нет' : 'Iso: No')}
                                  </span>
                                  <span className={`font-black shrink-0 ${sprite.isometry ? 'text-purple-400' : 'text-stone-500'}`}>
                                    {sprite.isometry ? '+50%' : '0%'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Design creation help popover */}
                            <AnimatePresence>
                              {designHelp[sprite.id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 bg-[#12051d]/90 rounded-xl p-3 border border-purple-500/20 text-xs sm:text-sm space-y-2 overflow-hidden text-[#ebd6f7]/90 leading-relaxed shadow-lg text-left"
                                >
                                  <div>
                                    <strong className="text-purple-300">{lang === 'ru' ? 'По референсу:' : 'From Reference:'}</strong> {lang === 'ru' ? 'Художник работает по вашему готовому эскизу, скриншоту или подробному референсу.' : 'The artist works based on your ready concept art, sketch, or visual references.'}
                                  </div>
                                  <div>
                                    <strong className="text-indigo-400">{lang === 'ru' ? 'С нуля (+50% сложности):' : 'From Scratch (+50% complexity):'}</strong> {lang === 'ru' ? 'Разработка концепта и дизайна художником полностью с нуля по вашему текстовому описанию.' : 'Concept and visual design created entirely from scratch based on your text ideas.'}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Isometry help popover */}
                            <AnimatePresence>
                              {isometryHelp[sprite.id] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 bg-[#12051d]/90 rounded-xl p-3 border border-purple-500/20 text-xs sm:text-sm overflow-hidden text-[#ebd6f7]/90 leading-relaxed shadow-lg text-left"
                                >
                                  {lang === 'ru' 
                                    ? 'Активируйте для построения 2.5D проекции (диагональный вид). Дает +50% к сложности из-за необходимости точной стыковки пикселей под углом 26.565° и сложного трехмерного затенения сторон.' 
                                    : 'Activate for 2.5D projection (diagonal perspective). Adds +50% complexity due to precise pixel alignment at 26.565° and complex 3D-like shading of multiple sides.'}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Sprite Complexity Options */}
                        {sprite.categoryId === '7' && (
                          // Minecraft-skins: standard skin model selection
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/90">
                                {t.skinTypeLabel}
                              </label>
                            </div>
                            <select
                              value={sprite.skinType || '1'}
                              onChange={(e) => updateSpriteField(sprite.id, 'skinType', e.target.value as '1' | '2')}
                              className="w-full bg-[#12051d] text-[#ebd6f7]/95 border-2 border-[#3d1a56] hover:border-purple-500/50 rounded-xl px-4 py-3 text-sm font-extrabold focus:outline-none focus:border-purple-400 transition-all cursor-pointer"
                            >
                              <option value="1" className="bg-[#1c0827]">
                                {t.standardSkin}
                              </option>
                              <option value="2" className="bg-[#1c0827]">
                                {t.hdSkin}
                              </option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Animation Controls (If Category Supports It) */}
                    {activeCat.supportsAnimation && (
                      <div className="mt-5 border-t border-[#ebd6f7]/10 pt-4">
                        <button
                          type="button"
                          onClick={() => updateSpriteField(sprite.id, 'hasAnimation', !sprite.hasAnimation)}
                          className="flex items-center gap-2 mb-3 select-none text-left cursor-pointer group"
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            sprite.hasAnimation 
                              ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                              : 'bg-[#12051d] border-[#3d1a56] text-purple-400/80 group-hover:text-white group-hover:border-purple-500/40'
                          }`}>
                            <Plus size={12} className={`stroke-[3] transition-transform ${sprite.hasAnimation ? 'rotate-90' : ''}`} />
                          </div>
                          <span className="text-sm font-bold text-[#ebd6f7] group-hover:text-white transition-colors">
                            {t.addAnimationLabel}
                          </span>
                        </button>

                        {/* Animation inputs section */}
                        <AnimatePresence>
                          {sprite.hasAnimation && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-[#12051d] rounded-xl p-4 border-2 border-[#3d1a56] space-y-4 text-sm">
                                {/* Beautiful Animated Custom Component for Animation Complexity */}
                                <AnimationComplexitySelection
                                  value={sprite.animComplexity || 'simple'}
                                  onChange={(val) => updateSpriteField(sprite.id, 'animComplexity', val)}
                                  lang={lang}
                                  spriteId={sprite.id}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#3d1a56]/50">
                                  <div>
                                    <span className="block text-[#ebd6f7] mb-1 font-semibold text-sm">{t.animCalcMethod}</span>
                                    <select
                                      value={sprite.frameMode}
                                      onChange={(e) => updateSpriteField(sprite.id, 'frameMode', e.target.value)}
                                      className="w-full bg-[#1a0729] border border-[#3d1a56] rounded-lg px-2.5 py-1.5 text-sm text-[#ebd6f7] font-bold focus:outline-none focus:border-purple-300 cursor-pointer"
                                    >
                                      <option value="direct">{t.animMethodDirect}</option>
                                      <option value="calc">{t.animMethodCalc}</option>
                                    </select>
                                  </div>

                                  {sprite.frameMode === 'direct' ? (
                                    <div>
                                      <span className="block text-[#ebd6f7] mb-1 font-semibold text-sm">{t.animFramesCount}</span>
                                      <div className="flex items-center bg-[#1a0729] border border-[#3d1a56] rounded-lg overflow-hidden h-8">
                                        <button
                                          type="button"
                                          onClick={() => updateSpriteField(sprite.id, 'framesDirect', Math.max(1, sprite.framesDirect - 1))}
                                          className="px-2 text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer"
                                        >
                                          -
                                        </button>
                                        <input
                                          type="number"
                                          value={sprite.framesDirect === 0 ? '' : sprite.framesDirect}
                                          onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                                            updateSpriteField(sprite.id, 'framesDirect', val);
                                          }}
                                          onBlur={() => {
                                            if (sprite.framesDirect < 1) {
                                              updateSpriteField(sprite.id, 'framesDirect', 1);
                                            }
                                          }}
                                          className="w-full bg-transparent text-center text-sm text-purple-300 font-bold font-mono focus:outline-none border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => updateSpriteField(sprite.id, 'framesDirect', sprite.framesDirect + 1)}
                                          className="px-2 text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div>
                                        <span className="block text-[#ebd6f7] mb-1 font-semibold text-sm">{t.animDurationLabel}</span>
                                        <div className="flex items-center bg-[#1a0729] border border-[#3d1a56] rounded-lg overflow-hidden h-8">
                                          <button
                                            type="button"
                                            onClick={() => updateSpriteField(sprite.id, 'animDuration', Math.max(0.1, Math.round((sprite.animDuration - 0.1) * 10) / 10))}
                                            className="px-2 text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer"
                                          >
                                            -
                                          </button>
                                          <input
                                            type="number"
                                            value={sprite.animDuration === 0 ? '' : sprite.animDuration}
                                            step={0.1}
                                            onChange={(e) => {
                                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                              updateSpriteField(sprite.id, 'animDuration', val);
                                            }}
                                            onBlur={() => {
                                              if (sprite.animDuration < 0.1) {
                                                updateSpriteField(sprite.id, 'animDuration', 0.1);
                                              }
                                            }}
                                            className="w-full bg-transparent text-center text-sm text-purple-300 font-bold font-mono focus:outline-none border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => updateSpriteField(sprite.id, 'animDuration', Math.round((sprite.animDuration + 0.1) * 10) / 10)}
                                            className="px-2 text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div>
                                        <span className="block text-[#ebd6f7] mb-1 font-semibold text-sm">{t.animDelayLabel}</span>
                                        <div className="flex items-center bg-[#1a0729] border border-[#3d1a56] rounded-lg overflow-hidden h-8">
                                          <button
                                            type="button"
                                            onClick={() => updateSpriteField(sprite.id, 'animDelay', Math.max(0.01, Math.round((sprite.animDelay - 0.05) * 100) / 100))}
                                            className="px-2 text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer"
                                          >
                                            -
                                          </button>
                                          <input
                                            type="number"
                                            value={sprite.animDelay === 0 ? '' : sprite.animDelay}
                                            step={0.01}
                                            onChange={(e) => {
                                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                                              updateSpriteField(sprite.id, 'animDelay', val);
                                            }}
                                            onBlur={() => {
                                              if (sprite.animDelay < 0.01) {
                                                updateSpriteField(sprite.id, 'animDelay', 0.01);
                                              }
                                            }}
                                            className="w-full bg-transparent text-center text-sm text-purple-300 font-bold font-mono focus:outline-none border-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => updateSpriteField(sprite.id, 'animDelay', Math.round((sprite.animDelay + 0.05) * 100) / 100)}
                                            className="px-2 text-purple-300 hover:text-white hover:bg-white/5 transition-all font-bold font-mono text-sm active:scale-90 select-none cursor-pointer"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              <div className="text-xs text-[#ebd6f7]/60 leading-relaxed border-t border-[#3d1a56]/60 pt-2.5 font-medium flex items-start gap-1.5">
                                <Info className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                                <span>
                                  {lang === 'ru' 
                                    ? 'Сложность анимации определяет характер покадровых изменений. Простая: перемещение или поворот готового объекта. Средняя: циклическая деформация, бег, атака или взмах крыльев. Сложная: полноценное покадровое рисование динамических эффектов (взрывы, магия, потоки воды, искры) полностью вручную.' 
                                    : 'Animation complexity defines the nature of frame-by-frame changes. Simple: motion or rotation of an existing asset. Medium: cyclic deformation, running cycles, attacks, or wing flaps. Complex: full hand-drawn frame-by-frame dynamic special effects (explosions, magic spells, fluid streams, sparks) entirely from scratch.'}
                                </span>
                              </div>
                            </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Complexity selection moved before description and styled to fit the site style */}
                    {sprite.categoryId !== '7' && (
                      <div className="mt-5 pt-4 border-t border-[#ebd6f7]/10">
                        <ComplexitySelection
                          value={sprite.detailLevel || 'simple'}
                          onChange={(val) => updateSpriteField(sprite.id, 'detailLevel', val)}
                          lang={lang}
                          spriteId={sprite.id}
                          categoryId={sprite.categoryId}
                        />
                      </div>
                    )}

                    {/* Sprite Complexity Progress Bar (Positioned BEFORE description) */}
                    {sprite.categoryId !== '7' && (
                      <TotalComplexityCard
                        calculated={calculated}
                        sprite={sprite}
                        lang={lang}
                      />
                    )}

                    {/* Task Description input (Mandatory) */}
                    <div className="mt-5 pt-4 border-t border-[#ebd6f7]/10">
                      <label className="block text-sm font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex justify-between items-center">
                        <span>{t.taskDescriptionLabel}</span>
                        <span className="text-xs font-mono opacity-70 lowercase">*{t.descRequiredError.split(' ')[0]}</span>
                      </label>
                      <textarea
                        rows={4}
                        value={sprite.description}
                        onChange={(e) => {
                          updateSpriteField(sprite.id, 'description', e.target.value);
                          if (validationError && e.target.value.trim() !== '') {
                            // Clear error banner if now filled
                            setValidationError(false);
                          }
                        }}
                        className={`w-full bg-[#12051d] border-2 rounded-xl px-4 py-3 text-sm text-[#fbf7ff] placeholder-[#ebd6f7]/40 focus:outline-none focus:border-purple-300 focus:bg-[#1c082c] transition-all duration-200 resize-y min-h-[96px] ${
                          validationError && !sprite.description.trim() ? 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-[#3d1a56]'
                        }`}
                        placeholder={t.taskDescPlaceholder}
                      />
                      {validationError && !sprite.description.trim() && (
                        <span className="text-xs font-bold text-red-400 mt-1 block">
                          {t.descRequiredError}
                        </span>
                      )}
                    </div>

                    {/* Individual sprite cost box */}
                    <div className="mt-5 bg-[#12051d]/60 p-3.5 rounded-xl border border-[#3d1a56] flex flex-wrap justify-between items-center gap-2">
                      <span className="text-xs text-[#ebd6f7]/80 font-mono">
                        {t.spriteAutoCalcNote}
                      </span>
                      <div className="text-sm font-bold text-[#f7f5ef] bg-purple-950/30 px-3.5 py-1.5 rounded-lg border border-purple-500/20 shadow-inner">
                        {t.positionPriceLabel}{' '}
                        {calculated.isInvalidSize ? (
                          <span className="text-red-400 text-sm font-mono font-black uppercase animate-pulse">
                            {lang === 'ru' ? 'недопустимое значение' : 'invalid value'}
                          </span>
                        ) : (
                          <span className="text-purple-300 text-base font-mono font-black">
                            {formatPrice(calculated.totalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Add block button */}
          <div className="mt-8 relative z-10">
            <button
              type="button"
              onClick={addSpriteBlock}
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-sm uppercase py-4 rounded-2xl border-4 border-[#140620] shadow-[0_4px_15px_rgba(192,132,252,0.25)] hover:shadow-[0_4px_25px_rgba(192,132,252,0.45)] hover:scale-[1.005] transition-all active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 animate-bounce" />
              <span>{t.addAssetBtn}</span>
            </button>
          </div>

          {/* Global Order parameters */}
          <div className="mt-12 bg-[#1a0729] rounded-2xl p-6 border-4 border-[#140620] relative overflow-hidden shadow-lg z-10">
            {/* Subtle internal grid border for global parameters */}
            <div className="absolute inset-1 border border-[#ebd6f7]/5 rounded-xl pointer-events-none"></div>

            <h3 className="font-display text-lg font-bold tracking-tight text-purple-300 mb-6 flex items-center gap-2 relative z-10">
              <Settings className="w-5 h-5 text-purple-300" />
              <span>{t.globalParamsTitle}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative z-10">
              {/* Queue Urgency Control */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/75 mb-2 flex items-center gap-1">
                  <span>{t.queueUrgency}</span>
                </label>
                <button
                  type="button"
                  disabled={noDeadline}
                  onClick={() => setSpeedRate(prev => prev === 1.0 ? 1.25 : 1.0)}
                  className={`w-full px-5 py-4 rounded-xl font-bold transition-all flex items-center justify-between gap-3 shadow-lg border-2 ${
                    noDeadline
                      ? 'bg-[#12051d]/40 text-[#ebd6f7]/40 border-[#3d1a56]/40 cursor-not-allowed opacity-50'
                      : speedRate === 1.25
                      ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-400 shadow-[0_0_22px_rgba(192,132,252,0.45)] scale-[1.01] cursor-pointer active:scale-95'
                      : 'bg-[#12051d] hover:bg-[#1d0b2e] text-[#ebd6f7] border-[#3d1a56] hover:border-purple-400 cursor-pointer active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className={`w-4.5 h-4.5 ${!noDeadline && speedRate === 1.25 ? 'text-yellow-300 animate-spin-slow' : 'text-purple-500/55'}`} />
                    <span className="text-xs sm:text-sm uppercase tracking-widest font-black">
                      {lang === 'ru' ? 'Приоритет' : 'Priority'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase px-2.5 py-1 rounded border ${
                      !noDeadline && speedRate === 1.25 
                        ? 'bg-[#12051d] text-purple-300 border-purple-400/40' 
                        : 'bg-purple-950 text-purple-300/40 border-purple-400/10'
                    }`}>
                      +25%
                    </span>
                    {!noDeadline && speedRate === 1.25 ? (
                      <span className="text-xs font-black uppercase bg-[#12051d] text-green-400 px-2.5 py-1 rounded border-2 border-green-400/80 animate-pulse">
                        {lang === 'ru' ? 'АКТИВЕН' : 'ACTIVE'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase bg-purple-950/60 text-purple-400/60 px-2 py-1 rounded border border-purple-500/10">
                        {lang === 'ru' ? 'ВЫКЛ' : 'OFF'}
                      </span>
                    )}
                  </div>
                </button>

                <div className="mt-3 bg-black/20 p-3 rounded-xl border border-white/5 text-xs sm:text-sm text-[#ebd6f7]/70 leading-relaxed font-medium min-h-[90px]">
                  <strong className="text-purple-300">{t.speedHelpTitle}</strong>
                  <p className="mt-1 font-sans text-[#ebd6f7]/90 font-semibold">
                    {noDeadline 
                      ? (lang === 'ru' ? 'Сроки недоступны: выбран заказ без дедлайна (долгосрочное ожидание).' : 'Timeframes locked: "No Deadline" long-term expectation selected.')
                      : (speedRate === 1.0 ? t.speedHelpModerate : t.speedHelpPriority)
                    }
                  </p>
                </div>
              </div>

              {/* No Deadline Toggle Control */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/75 mb-2 flex items-center gap-1">
                  <span>{t.noDeadlineBtn}</span>
                </label>
                <button
                  type="button"
                  disabled={CURRENT_LOAD_STATUS === 2}
                  onClick={() => setNoDeadline(prev => !prev)}
                  className={`w-full px-5 py-4 rounded-xl font-bold transition-all flex items-center justify-between gap-3 shadow-lg border-2 ${
                    CURRENT_LOAD_STATUS === 2
                      ? 'bg-rose-950/30 text-rose-300/80 border-rose-500/20 cursor-not-allowed opacity-90'
                      : noDeadline
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-[0_0_22px_rgba(52,211,153,0.3)] scale-[1.01] cursor-pointer active:scale-95'
                      : 'bg-[#12051d] hover:bg-[#1d0b2e] text-[#ebd6f7] border-[#3d1a56] hover:border-emerald-400 cursor-pointer active:scale-95'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className={`w-4.5 h-4.5 ${noDeadline ? 'text-emerald-300 animate-pulse' : 'text-stone-500'}`} />
                    <span className="text-xs sm:text-sm uppercase tracking-widest font-black">
                      {t.noDeadlineBtn}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {CURRENT_LOAD_STATUS !== 2 && (
                      <span className={`text-xs font-black uppercase px-2.5 py-1 rounded border ${
                        noDeadline 
                          ? 'bg-[#12051d] text-emerald-300 border-emerald-400/40' 
                          : 'bg-emerald-950/20 text-emerald-300/60 border-emerald-500/10'
                      }`}>
                        -25%
                      </span>
                    )}
                    {noDeadline ? (
                      <span className={`text-xs font-black uppercase px-2.5 py-1 rounded border-2 animate-pulse ${
                        CURRENT_LOAD_STATUS === 2
                          ? 'bg-[#12051d] text-rose-400 border-rose-500/40'
                          : 'bg-[#12051d] text-emerald-400 border-emerald-400/80'
                      }`}>
                        {lang === 'ru' ? 'АКТИВЕН' : 'ACTIVE'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase bg-purple-950/60 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
                        {lang === 'ru' ? 'ВЫКЛ' : 'OFF'}
                      </span>
                    )}
                  </div>
                </button>

                <div className="mt-3 bg-black/20 p-3 rounded-xl border border-white/5 text-xs sm:text-sm text-[#ebd6f7]/70 leading-relaxed font-medium min-h-[90px]">
                  <strong className={CURRENT_LOAD_STATUS === 2 ? 'text-rose-400' : 'text-emerald-300'}>
                    {CURRENT_LOAD_STATUS === 2 ? (lang === 'ru' ? 'Режим обязателен' : 'Enforced mode') : t.noDeadlineBtn}
                  </strong>
                  <p className="mt-1 font-sans text-[#ebd6f7]/90 font-semibold">
                    {t.noDeadlineDesc}
                    {CURRENT_LOAD_STATUS === 2 && (
                      <span className="block mt-1 text-rose-400 font-bold">
                        {t.noDeadlineSurchargeNote}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

                        <div className="mt-10 mb-8 border-t border-[#ebd6f7]/10 pt-10 relative z-10">
              <CalculationLog 
                lang={lang} 
                orderCalculations={orderCalculations} 
                CATEGORIES_LIST={CATEGORIES_LIST} 
                formatPrice={formatPrice} 
              />
            </div>
            {/* End of log component */}
            {/* Limit Warning Alert */}
            {orderCalculations.totalSpritesCount > 100 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-[#2d0f19] border-2 border-rose-500/30 rounded-2xl p-5 text-left relative overflow-hidden z-10 flex items-start gap-3.5 shadow-lg"
              >
                <div className="bg-rose-500/20 text-rose-400 p-2.5 rounded-xl border border-rose-500/30 animate-pulse shrink-0">
                  <Info className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-rose-400 font-bold text-sm uppercase tracking-wider mb-1">
                    {lang === 'ru' ? 'Слишком много, сократите ТЗ!' : 'Too much, shorten the specification!'}
                  </h4>
                  <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-sans">
                    {lang === 'ru' 
                      ? `Внимание: Вы превысили оптимальный лимит в 100 спрайтов (всего в ТЗ: ${orderCalculations.totalSpritesCount}). На все последующие позиции взимается дополнительная плата +100% (+${formatPrice(orderCalculations.surchargeAmount)}).`
                      : `Notice: You have exceeded the optimal limit of 100 sprites (total in spec: ${orderCalculations.totalSpritesCount}). An extra fee of +100% is charged for all subsequent positions (+${formatPrice(orderCalculations.surchargeAmount)}).`
                    }
                  </p>
                </div>
              </motion.div>
            )}

            {/* Workload Status Indicators near prices */}
            <div className={`mt-8 p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg relative overflow-hidden z-10 ${
              CURRENT_LOAD_STATUS === 0
                ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-300'
                : CURRENT_LOAD_STATUS === 1
                ? 'bg-yellow-950/25 border-yellow-500/30 text-yellow-300'
                : 'bg-rose-950/25 border-rose-500/30 text-rose-300'
            }`}>
              {/* background subtle glow */}
              <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${
                CURRENT_LOAD_STATUS === 0 ? 'bg-emerald-400' : CURRENT_LOAD_STATUS === 1 ? 'bg-yellow-400' : 'bg-rose-400'
              }`} />
              
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full shrink-0 ${
                  CURRENT_LOAD_STATUS === 0
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]'
                    : CURRENT_LOAD_STATUS === 1
                    ? 'bg-yellow-400 animate-pulse shadow-[0_0_10px_#fbbf24]'
                    : 'bg-rose-400 animate-pulse shadow-[0_0_10px_#f87171]'
                }`}></span>
                <div className="text-left">
                  <span className="block text-xs font-black uppercase tracking-widest text-[#ebd6f7]/60">
                    {lang === 'ru' ? 'Активный статус исполнителя:' : 'Artist Load Status:'}
                  </span>
                  <span className="text-sm font-extrabold uppercase tracking-wide">
                    {CURRENT_LOAD_STATUS === 0
                      ? t.loadStatusFree
                      : CURRENT_LOAD_STATUS === 1
                      ? t.loadStatusMedium
                      : t.loadStatusFull}
                  </span>
                </div>
              </div>

              <div className="text-xs sm:text-right font-sans font-semibold text-[#ebd6f7]/85 max-w-sm">
                {CURRENT_LOAD_STATUS === 0 && (
                  lang === 'ru' 
                    ? 'Очередь свободна. Заказы выполняются в стандартном темпе.' 
                    : 'The queue is free. Orders are processed at standard pace.'
                )}
                {CURRENT_LOAD_STATUS === 1 && (
                  lang === 'ru' 
                    ? 'Умеренная нагрузка. К стоимости применяется наценка +20%.' 
                    : 'Moderate workload. A +20% markup is applied to the order.'
                )}
                {CURRENT_LOAD_STATUS === 2 && (
                  lang === 'ru' 
                    ? 'Очередь заполнена (+35% наценка). Доступен только заказ «Без дедлайна».' 
                    : 'Queue is full (+35% surcharge). Only "No Deadline" orders accepted.'
                )}
              </div>
            </div>

            {/* Results widgets box */}
            <div className="mt-8 pt-6 border-t border-[#ebd6f7]/15 grid grid-cols-1 sm:grid-cols-2 gap-5 text-center relative z-10">
              <div className="bg-[#12051d] p-5 rounded-2xl border-2 border-[#3d1a56] shadow-inner relative overflow-hidden flex flex-col justify-center items-center">
                <div className="text-sm font-bold text-[#ebd6f7]/70 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 justify-center">
                  <span>{t.totalPriceLabel}</span>
                  {orderCalculations.hasBulkDiscount && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-sm font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 tracking-normal animate-pulse">
                      {lang === 'ru' ? 'Скидка за опт' : 'Bulk discount'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center justify-center">
                  {orderCalculations.hasBulkDiscount && (
                    <div className="text-sm sm:text-base text-stone-300 font-extrabold mb-1.5 font-mono flex items-center gap-1.5">
                      <span>{lang === 'ru' ? 'До скидки:' : 'Before discount:'}</span>
                      <span className="line-through decoration-rose-500/80 decoration-2">{formatPrice(orderCalculations.priceBeforeDiscountTotal)}</span>
                    </div>
                  )}
                  <div className={`text-4xl font-display font-black font-mono tracking-tight ${orderCalculations.hasBulkDiscount ? 'text-emerald-400' : 'text-purple-300'}`}>
                    {formatPrice(orderCalculations.finalPriceRub)}
                  </div>
                </div>
              </div>

              <div className="bg-[#12051d] p-5 rounded-2xl border-2 border-[#3d1a56] shadow-inner relative overflow-hidden flex flex-col justify-center items-center">
                <div className="text-sm font-bold text-[#ebd6f7]/70 uppercase tracking-widest mb-1.5">
                  {t.prepaymentLabel} ({orderCalculations.prepayPercent}%)
                </div>
                <div className="text-3xl font-display font-black text-fuchsia-300 font-mono">
                  {formatPrice(orderCalculations.prepayAmountRub)}
                </div>
              </div>
            </div>

            {/* Bulk discount progress bar */}
            <div className="mt-6 bg-[#12051d] p-5 rounded-2xl border-2 border-[#3d1a56] shadow-inner relative overflow-hidden text-left z-10">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-bold text-[#ebd6f7]/90 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      orderCalculations.totalSpritesCount >= 10 ? 'bg-emerald-400' : 'bg-purple-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      orderCalculations.totalSpritesCount >= 10 ? 'bg-emerald-500' : 'bg-purple-500'
                    }`}></span>
                  </span>
                  <span>
                    {orderCalculations.totalSpritesCount >= 10 
                      ? (lang === 'ru' ? 'Скидка улучшена до 50%' : 'Discount Upgraded to 50%')
                      : (lang === 'ru' ? 'Прогресс оптовой скидки 25%' : 'Wholesale Discount Progress 25%')
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDiscountHelp(!showDiscountHelp)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2a0e42] hover:bg-purple-700/80 border-2 border-purple-400/50 hover:border-purple-300 text-purple-200 hover:text-white flex items-center justify-center text-sm font-black shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                    title={lang === 'ru' ? 'Информация о скидках' : 'Discount Information'}
                  >
                    ?
                  </button>
                </span>
                <span className={`text-sm font-bold font-mono ${
                  orderCalculations.totalSpritesCount >= 10 ? 'text-emerald-400' : 'text-purple-300'
                }`}>
                  {orderCalculations.totalSpritesCount} / {orderCalculations.totalSpritesCount >= 10 ? 50 : 10}
                </span>
              </div>
              
              <div className="w-full bg-[#241135] h-3.5 rounded-full border border-[#3d1a56] p-0.5 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${orderCalculations.totalSpritesCount >= 10 
                      ? Math.min(100, (orderCalculations.totalSpritesCount / 50) * 100) 
                      : (orderCalculations.totalSpritesCount / 10) * 100
                    }%` 
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    orderCalculations.totalSpritesCount >= 10 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                      : 'bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]'
                  }`}
                />
              </div>

              {/* Minimal Status Text under the progress bar */}
              <div className="mt-3 text-sm font-bold text-center">
                {orderCalculations.surchargeAmount > 0 ? (
                  <span className="text-rose-400">
                    {lang === 'ru' ? 'Скидка отключена (превышен лимит 100)' : 'Discount disabled (exceeded limit 100)'}
                  </span>
                ) : orderCalculations.totalSpritesCount >= 50 ? (
                  <span className="text-emerald-400 font-extrabold">
                    {lang === 'ru' ? 'Скидка улучшена до 50%!' : 'Discount upgraded to 50%!'}
                  </span>
                ) : orderCalculations.totalSpritesCount >= 10 ? (
                  <div className="space-y-1">
                    <span className="text-emerald-400 font-extrabold">
                      {lang === 'ru' ? 'Скидка 25% успешно применена!' : 'Discount 25% successfully applied!'}
                    </span>
                    <span className="text-stone-400 text-xs block font-normal">
                      {lang === 'ru'
                        ? `До скидки 50% нужно еще ${50 - orderCalculations.totalSpritesCount} ассетов.`
                        : `Need ${50 - orderCalculations.totalSpritesCount} more assets to reach 50% discount.`
                      }
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-purple-300 font-bold">
                      {lang === 'ru' ? 'Скидка не активна' : 'Discount inactive'}
                    </span>
                    <span className="text-stone-400 text-xs block font-normal">
                      {lang === 'ru'
                        ? `До скидки 25% нужно еще ${10 - orderCalculations.totalSpritesCount} ассетов.`
                        : `Need ${10 - orderCalculations.totalSpritesCount} more assets to reach 25% discount.`
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Info Panel Popover */}
              <AnimatePresence>
                {showDiscountHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-[#1a0729] rounded-xl p-4 border border-[#ebd6f7]/15 text-xs text-[#ebd6f7]/85 space-y-2.5 overflow-hidden font-sans font-medium"
                  >
                    <div className="font-bold text-purple-300 text-xs uppercase tracking-wider">
                      {lang === 'ru' ? 'Условия оптовой скидки' : 'Wholesale Discount Rules'}
                    </div>
                    <p className="leading-relaxed text-stone-300">
                      {lang === 'ru'
                        ? 'Скидка является накопительной, действует исключительно на последующие позиции и не распространяется задним числом на ранее добавленные:'
                        : 'The discount is cumulative, applies strictly to subsequent items, and does not apply retroactively to previous ones:'}
                    </p>
                    <ul className="list-disc pl-4 space-y-1.5 leading-relaxed text-stone-300">
                      <li>
                        <strong>{lang === 'ru' ? 'Первые 10 ассетов:' : 'First 10 assets:'}</strong>{' '}
                        {lang === 'ru' ? 'Выполняются по стандартному тарифу без скидки.' : 'Executed at standard rate without discount.'}
                      </li>
                      <li>
                        <strong>{lang === 'ru' ? 'От 11 до 50 ассетов:' : '11 to 50 assets:'}</strong>{' '}
                        {lang === 'ru' ? 'Скидка 25% действует на каждый последующий ассет.' : 'A 25% discount applies to each subsequent asset.'}
                      </li>
                      <li>
                        <strong>{lang === 'ru' ? 'Свыше 50 ассетов:' : 'Over 50 assets:'}</strong>{' '}
                        {lang === 'ru' ? 'Улучшенная скидка 50% действует на каждый последующий ассет.' : 'An upgraded 50% discount applies to each subsequent asset.'}
                      </li>
                    </ul>
                    <div className="pt-2 border-t border-white/10 text-sm text-stone-300 font-mono">
                      {lang === 'ru'
                        ? 'При превышении лимита в 100 позиций скидка отключается из-за наценки за объем.'
                        : 'If the 100-position limit is exceeded, the wholesale discount is disabled in favor of the volume surcharge.'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Technical specification output area */}
          <div className="mt-12 pt-8 border-t-2 border-[#ebd6f7]/10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#ead6cd] flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-300" />
                <span>{t.specificationTitle}</span>
              </h3>

              {/* Compact Important Note Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsNoteExpanded(!isNoteExpanded)}
                  className="px-3.5 py-1.5 text-xs font-bold text-amber-400 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-500/30 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Info className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                  <span>{lang === 'ru' ? 'Важное примечание' : 'Important Note'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isNoteExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

              {/* Collapsible Important Note Box */}
            <AnimatePresence>
              {isNoteExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-950/25 border-2 border-amber-500/40 rounded-2xl p-5 mb-6 overflow-hidden shadow-lg shadow-amber-950/20"
                >
                  <p className="text-sm sm:text-base text-amber-200/90 font-bold leading-relaxed">
                    {lang === 'ru' ? (
                      <>
                        Данный инструмент является <strong>всего лишь калькулятором</strong> и не является формой оформления заказа, всё будет <strong>обговариваться отдельно</strong>. Также обратите внимание: <strong>нельзя заказать отдельно 10 разных ТЗ</strong>; все они в конечном итоге всё равно <strong>будут объединяться в один общий заказ</strong>.
                      </>
                    ) : (
                      <>
                        This tool is <strong>strictly a calculator</strong> and does not constitute order placement; everything will be <strong>discussed separately</strong>. Also note: <strong>you cannot order 10 separate specifications</strong>; they will all ultimately <strong>be merged into a single cumulative order</strong>.
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {CURRENT_LOAD_STATUS === 2 && (
              <div className="bg-rose-950/40 border-2 border-rose-500/30 rounded-2xl p-5 mb-6 text-left relative overflow-hidden z-10 flex items-start gap-3.5 shadow-lg">
                <div className="bg-rose-500/20 text-rose-400 p-2 rounded-xl border border-rose-500/30 shrink-0">
                  <Flame className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-rose-400 font-bold text-sm uppercase tracking-wider mb-1">
                    {lang === 'ru' ? 'Режим полной загрузки' : 'Full Queue Enforced'}
                  </h4>
                  <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-sans font-semibold">
                    {lang === 'ru' 
                      ? 'В связи с высокой нагрузкой новые заказы принимаются исключительно в режиме «Без дедлайна» (долгосрочное ожидание) со скидкой -25%. Опция приоритета и стандартные сроки временно отключены.'
                      : 'Due to extreme load, new orders are accepted exclusively under the "No Deadline" (long-term queue) policy with a -25% discount. Priority option and standard timeframes are temporarily locked.'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Elegant Tab Headers */}
              <div className="flex border-b border-[#3d1a56] mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSpecTab('visual')}
                  className={`px-4 py-2.5 font-bold uppercase text-xs tracking-wider border-t-2 border-x-2 rounded-t-xl transition-all cursor-pointer ${
                    activeSpecTab === 'visual'
                      ? 'bg-[#12051d] text-fuchsia-300 border-[#c084fc]/30 border-b-[#12051d]'
                      : 'bg-transparent text-[#ebd6f7]/60 border-transparent hover:text-white hover:bg-[#12051d]/40'
                  }`}
                >
                  {lang === 'ru' ? 'Визуальный ТЗ' : 'Visual TZ'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSpecTab('text')}
                  className={`px-4 py-2.5 font-bold uppercase text-xs tracking-wider border-t-2 border-x-2 rounded-t-xl transition-all cursor-pointer ${
                    activeSpecTab === 'text'
                      ? 'bg-[#12051d] text-fuchsia-300 border-[#c084fc]/30 border-b-[#12051d]'
                      : 'bg-transparent text-[#ebd6f7]/60 border-transparent hover:text-white hover:bg-[#12051d]/40'
                  }`}
                >
                  {lang === 'ru' ? 'Текст ТЗ' : 'Text TZ'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSpecTab('guide')}
                  className={`px-4 py-2.5 font-bold uppercase text-xs tracking-wider border-t-2 border-x-2 rounded-t-xl transition-all cursor-pointer ${
                    activeSpecTab === 'guide'
                      ? 'bg-[#12051d] text-fuchsia-300 border-[#c084fc]/30 border-b-[#12051d]'
                      : 'bg-transparent text-[#ebd6f7]/60 border-transparent hover:text-white hover:bg-[#12051d]/40'
                  }`}
                >
                  {lang === 'ru' ? 'Справочник' : 'Handbook'}
                </button>
              </div>

              {/* Tab 1: Visual Spec Tab */}
              {activeSpecTab === 'visual' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Visual Document Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full font-sans">
                    <button
                      type="button"
                      onClick={() => generateTZ(false, true)}
                      className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm uppercase px-4 py-3 rounded-xl border-2 border-[#140620] transition-all cursor-pointer active:scale-95 shadow flex items-center justify-center gap-1.5 h-12 font-sans"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.generateTzBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportAsImage}
                      disabled={!tzOutput}
                      className={`w-full font-bold text-sm uppercase px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 active:scale-95 h-12 font-sans ${
                        !tzOutput
                          ? 'bg-[#12051d] text-purple-900/60 border-[#3d1a56] cursor-not-allowed opacity-50'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white border-[#140620] shadow'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Сохранить как картинку' : 'Save as Image'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportAsPDF}
                      disabled={!tzOutput}
                      className={`w-full font-bold text-sm uppercase px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 active:scale-95 h-12 font-sans ${
                        !tzOutput
                          ? 'bg-[#12051d] text-purple-900/60 border-[#3d1a56] cursor-not-allowed opacity-50'
                          : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-[#140620] shadow'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'ru' ? 'Сохранить как PDF' : 'Save as PDF'}</span>
                    </button>

                    {/* Send to Socials dropdown */}
                    <div className="relative w-full no-export">
                      <button
                        type="button"
                        onClick={() => setShowVisualSocialsDropdown(!showVisualSocialsDropdown)}
                        className="w-full bg-[#c084fc] hover:bg-[#a855f7] text-[#1c0d2b] font-bold text-sm uppercase px-4 py-3 rounded-xl border-2 border-[#140620] transition-all cursor-pointer active:scale-95 shadow flex items-center justify-center gap-1.5 h-12 font-sans"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.sendToSocialsBtn}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showVisualSocialsDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showVisualSocialsDropdown && (
                        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-full min-w-[280px] bg-[#210c30] border-2 border-[#542575] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleSocialClick('telegram');
                                setShowVisualSocialsDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-purple-100 hover:bg-[#3d1956] transition-colors flex items-center gap-2.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                              <span>{t.telegram}: <span className="text-[#c084fc] select-all font-mono lowercase">@Village_Village</span></span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSocialClick('discord');
                                setShowVisualSocialsDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-[#ebd6f7] hover:bg-[#3d1956] transition-colors flex items-center gap-2.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                              <span>{t.discord}: <span className="text-[#c084fc] select-all font-mono lowercase">@villagelsc_</span></span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSocialClick('email');
                                setShowVisualSocialsDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-[#ebd6f7] hover:bg-[#3d1956] transition-colors flex items-center gap-2.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                              <span className="truncate">{t.email}: <span className="text-[#c084fc] select-all font-mono">errorsbills@gmail.com</span></span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {tzOutput ? (
                    /* The beautiful client contract document sheet */
                    <div
                      id="visual-tz-document"
                      className="bg-[#150624] border-4 border-[#3d1a56] rounded-2xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden shadow-2xl font-sans"
                    >
                      {/* Dither border background inside the paper */}
                      <div className="absolute inset-1 border border-purple-500/10 rounded-xl pointer-events-none"></div>

                      {/* Header Title */}
                      <div className="border-b border-purple-500/30 pb-5 text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                          <div className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {lang === 'ru' ? 'Спецификация к разработке' : 'Development Specification'}
                          </div>
                          <h4 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight leading-none">
                            {lang === 'ru' ? 'ПАСПОРТ ЗАКАЗА' : 'ORDER PASSPORT'}
                          </h4>
                        </div>
                        <div className="text-left sm:text-right font-mono text-xs text-[#ebd6f7]/60 space-y-1">
                          <div className="font-bold text-white">{lang === 'ru' ? 'Исполнитель' : 'Artist'}: <span className="text-purple-300">Village_</span></div>
                          <div>{lang === 'ru' ? 'Контакты' : 'Contact'}: errorsbills@gmail.com</div>
                          <div>{lang === 'ru' ? 'Дата формирования' : 'Created'}: {new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</div>
                        </div>
                      </div>

                      {/* Summary Pricing Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-[#1b0a2a]/80 p-4 rounded-xl border border-purple-500/20">
                          <div className="text-xs uppercase font-bold text-purple-300/80 mb-1">{lang === 'ru' ? 'Сумма заказа' : 'Total Budget'}</div>
                          <div className="text-lg font-black text-fuchsia-300 font-mono">{formatPrice(orderCalculations.finalPriceRub)}</div>
                        </div>
                        <div className="bg-[#1b0a2a]/80 p-4 rounded-xl border border-emerald-500/20">
                          <div className="text-xs uppercase font-bold text-emerald-400/80 mb-1">{lang === 'ru' ? 'Предоплата' : 'Prepayment'}</div>
                          <div className="text-lg font-black text-emerald-400 font-mono">
                            {formatPrice(orderCalculations.prepayAmountRub)}
                          </div>
                        </div>
                        <div className="bg-[#1b0a2a]/80 p-4 rounded-xl border border-purple-500/20">
                          <div className="text-xs uppercase font-bold text-purple-300/80 mb-1">{lang === 'ru' ? 'Всего позиций' : 'Total Items'}</div>
                          <div className="text-lg font-bold text-white font-mono">{orderCalculations.totalSpritesCount} шт.</div>
                        </div>
                        <div className="bg-[#1b0a2a]/80 p-4 rounded-xl border border-purple-500/20">
                          <div className="text-xs uppercase font-bold text-purple-300/80 mb-1">{lang === 'ru' ? 'Сроки' : 'Timeline'}</div>
                          <div className="text-sm font-bold text-white uppercase mt-1">
                            {noDeadline ? (lang === 'ru' ? 'БЕЗ ДЕДЛАЙНА' : 'NO DEADLINE') : (lang === 'ru' ? 'СТАНДАРТ' : 'STANDARD')}
                          </div>
                        </div>
                      </div>

                      {/* Items ticket list */}
                      <div className="space-y-4 pt-2">
                        <div className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                          {lang === 'ru' ? 'СОСТАВ РАБОТ' : 'WORK CONTENTS'}
                          <div className="h-px bg-purple-500/30 flex-1 ml-2"></div>
                        </div>
                        
                        <div className="space-y-3">
                          {orderCalculations.rawItems.map((item, i) => (
                            <div key={i} className="bg-[#12051d] border border-[#3d1a56] rounded-xl p-4 sm:p-5 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-500 to-purple-600"></div>
                              
                              <div className="flex flex-col md:flex-row gap-4">
                                {/* Left Side: Item Specs */}
                                <div className="w-full md:w-1/3 space-y-3 border-b md:border-b-0 md:border-r border-[#3d1a56]/50 pb-3 md:pb-0 md:pr-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-black text-purple-300 bg-purple-900/40 px-1.5 py-0.5 rounded">#{String(item.index).padStart(2, '0')}</span>
                                      <span className="text-sm font-bold text-white leading-tight">{item.categoryName}</span>
                                    </div>
                                    <div className="text-lg font-black font-mono text-fuchsia-300 mt-2">
                                      {formatPrice(item.itemFinalPrice)}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 text-xs font-mono text-[#ebd6f7]/90">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#ebd6f7]/60">{lang === 'ru' ? 'Сложность:' : 'Complexity:'}</span>
                                      <span className="font-bold text-fuchsia-300 bg-fuchsia-950/80 px-2 py-0.5 rounded text-xs border border-fuchsia-500/30">
                                        {item.complexityCategory} ({item.totalComplexity} pts)
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#ebd6f7]/60">{lang === 'ru' ? 'Разработка:' : 'Design:'}</span>
                                      <span className={`font-bold px-1.5 py-0.5 rounded text-xs ${item.designMode === 'scratch' ? 'text-amber-300 bg-amber-950/60 border border-amber-500/30' : 'text-stone-300'}`}>
                                        {item.designMode === 'scratch' ? (lang === 'ru' ? 'С нуля (+50%)' : 'Scratch (+50%)') : (lang === 'ru' ? 'По рефереру' : 'Reference')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#ebd6f7]/60">{lang === 'ru' ? 'Проекция:' : 'Projection:'}</span>
                                      <span className={`font-bold px-1.5 py-0.5 rounded text-xs ${item.isometry ? 'text-purple-300 bg-purple-900/60 border border-purple-500/30' : 'text-stone-300'}`}>
                                        {item.isometry ? (lang === 'ru' ? 'Изометрия (+50%)' : 'Isometric (+50%)') : (lang === 'ru' ? '2D Вид' : '2D View')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#ebd6f7]/60">{lang === 'ru' ? 'Детализация:' : 'Detail:'}</span>
                                      <span className="font-bold text-purple-200">
                                        {item.detailLevel === 'detailed' ? (lang === 'ru' ? 'Высокая' : 'High') : item.detailLevel === 'moderate' ? (lang === 'ru' ? 'Средняя' : 'Medium') : (lang === 'ru' ? 'Оптимальная' : 'Optimal')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#ebd6f7]/60">{lang === 'ru' ? 'Разрешение:' : 'Resolution:'}</span>
                                      <span className="font-bold text-white">{item.sizeInfo}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#ebd6f7]/60">{lang === 'ru' ? 'Количество:' : 'Qty:'}</span>
                                      <span className="font-bold text-white">{item.countOrig} ор. {item.countVar > 0 && `+ ${item.countVar} вар.`}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[#ebd6f7]/60">{lang === 'ru' ? 'Анимация:' : 'Anim:'}</span>
                                      <span className="font-bold text-white">
                                        {item.hasAnimation ? `${item.frames} кадр. (${item.animComplexity})` : (lang === 'ru' ? 'Статика' : 'Static')}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Side: Description */}
                                <div className="w-full md:w-2/3">
                                  <div className="text-xs font-bold uppercase tracking-wider text-purple-300/70 mb-1.5">
                                    {lang === 'ru' ? 'ТЕХНИЧЕСКОЕ ЗАДАНИЕ (ТЗ)' : 'TASK DESCRIPTION'}
                                  </div>
                                  <div className="text-sm text-stone-200 leading-relaxed font-sans whitespace-pre-wrap">
                                    {item.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Seed code banner for document verification */}
                      <div className="bg-[#12051d] p-3 rounded-xl border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono min-w-0 overflow-hidden">
                        <div className="text-purple-300 font-bold uppercase text-xs shrink-0">
                          {lang === 'ru' ? 'КОД СИДА ДЛЯ ВОССТАНОВЛЕНИЯ ЗАКАЗА:' : 'RECOVERY SEED CODE:'}
                        </div>
                        <div className="text-fuchsia-300 bg-[#1b082a] px-3 py-1 rounded border border-fuchsia-500/30 text-xs font-bold tracking-wider select-all break-all max-w-full overflow-hidden">
                          {generatedSeed}
                        </div>
                      </div>

                      {/* Footer URL Note */}
                      <div className="pt-4 border-t border-purple-500/15 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-stone-400">
                        <span>{t.tzUrlNote}</span>
                        <span>{lang === 'ru' ? 'Сгенерировано автоматически' : 'Automatically compiled'} - {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#12051d] border-2 border-[#3d1a56] border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center font-sans">
                      <Sparkles className="w-10 h-10 text-purple-400/40 animate-pulse mb-3" />
                      <p className="text-sm text-[#ebd6f7]/50 max-w-sm">
                        {lang === 'ru'
                          ? 'Нажмите кнопку «Сгенерировать ТЗ» выше, чтобы автоматически построить красивый визуальный контракт с детализацией позиций.'
                          : 'Click the "Generate TZ" button above to automatically compile a beautiful visual specification sheet.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Text Spec Tab */}
              {activeSpecTab === 'text' && (
                <div className="space-y-4">
                  {/* Copy and download spec btns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full font-sans">
                    <button
                      type="button"
                      onClick={() => generateTZ(true, true)}
                      className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm uppercase px-4 py-3 rounded-xl border-2 border-[#140620] transition-all cursor-pointer active:scale-95 shadow flex items-center justify-center gap-1.5 h-12"
                    >
                      <span>{t.generateTzBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyTZ}
                      disabled={!tzOutput}
                      className={`w-full font-bold text-sm uppercase px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 active:scale-95 h-12 ${
                        !tzOutput
                          ? 'bg-[#12051d] text-purple-900/60 border-[#3d1a56] cursor-not-allowed opacity-50'
                          : copied
                          ? 'bg-emerald-600 text-white border-transparent'
                          : 'bg-purple-500 hover:bg-purple-400 text-white border-[#140620]'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : t.copyTzBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadTZFile}
                      disabled={!tzOutput}
                      className={`w-full font-bold text-sm uppercase px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-2 active:scale-95 h-12 ${
                        !tzOutput
                          ? 'bg-[#12051d] text-purple-900/60 border-[#3d1a56] cursor-not-allowed opacity-50'
                          : 'bg-[#12051d] hover:bg-[#1a0729] text-[#ebd6f7] border-[#3d1a56]'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadTzBtn}</span>
                    </button>

                    {/* Send to Socials dropdown */}
                    <div className="relative w-full no-export">
                      <button
                        type="button"
                        onClick={() => setShowSocialsDropdown(!showSocialsDropdown)}
                        className="w-full bg-[#c084fc] hover:bg-[#a855f7] text-[#1c0d2b] font-bold text-sm uppercase px-4 py-3 rounded-xl border-2 border-[#140620] transition-all cursor-pointer active:scale-95 shadow flex items-center justify-center gap-1.5 h-12"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.sendToSocialsBtn}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showSocialsDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showSocialsDropdown && (
                        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-full min-w-[280px] bg-[#210c30] border-2 border-[#542575] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleSocialClick('telegram');
                                setShowSocialsDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-purple-100 hover:bg-[#3d1956] transition-colors flex items-center gap-2.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                              <span>{t.telegram}: <span className="text-[#c084fc] select-all font-mono lowercase">@Village_Village</span></span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSocialClick('discord');
                                setShowSocialsDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-purple-100 hover:bg-[#3d1956] transition-colors flex items-center gap-2.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                              <span>{t.discord}: <span className="text-[#c084fc] select-all font-mono lowercase">@villagelsc_</span></span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSocialClick('email');
                                setShowSocialsDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-purple-100 hover:bg-[#3d1956] transition-colors flex items-center gap-2.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                              <span className="truncate">{t.email}: <span className="text-[#c084fc] select-all font-mono">errorsbills@gmail.com</span></span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spec Output Area Box */}
                  <div className="relative">
                    <textarea
                      id="tz-output-area"
                      readOnly
                      value={tzOutput}
                      placeholder={t.tzPlaceholder}
                      className="w-full h-72 bg-[#12051d] text-[#ebd6f7] font-mono text-sm leading-relaxed p-5 rounded-2xl border-2 border-[#3d1a56] shadow-inner focus:outline-none focus:border-purple-300 transition-all resize-none"
                    />
                    {!tzOutput && (
                      <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/20 pointer-events-none rounded-2xl border border-[#3d1a56]">
                        <div className="text-center text-[#ebd6f7]/40 max-w-sm">
                          <Sparkles className="w-8 h-8 mx-auto mb-2.5 text-purple-300/40" />
                          <p className="text-xs leading-normal font-medium">{t.tzPlaceholder}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Guide Tab */}
              {activeSpecTab === 'guide' && (
                <div className="bg-[#12051d] border-2 border-[#3d1a56] rounded-2xl p-5 sm:p-6 space-y-5 text-stone-300 leading-relaxed text-sm sm:text-base font-sans">
                  <div className="space-y-2">
                    <h4 className="text-purple-300 font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>{lang === 'ru' ? 'Как правильно составить ТЗ?' : 'How to Compile a Specification?'}</span>
                    </h4>
                    <p>
                      {lang === 'ru'
                        ? 'Чтобы художник идеально воплотил вашу задумку, описание должно быть максимально подробным и конкретным. Избегайте размытых фраз.'
                        : 'For the artist to bring your idea to life flawlessly, descriptions must be as detailed and specific as possible. Avoid vague phrasing.'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="bg-rose-950/20 border border-rose-500/25 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1 text-rose-400 font-bold text-xs uppercase">
                          <X className="w-4 h-4 shrink-0" />
                          <span>{lang === 'ru' ? 'Плохой пример:' : 'Bad Example:'}</span>
                        </div>
                        <span className="italic text-stone-400">"Нужен меч 32х32"</span>
                      </div>
                      <div className="bg-[#101b15] border border-emerald-500/25 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-bold text-xs uppercase">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{lang === 'ru' ? 'Хороший пример:' : 'Good Example:'}</span>
                        </div>
                        <span className="text-[#ebd6f7]/90">
                          {lang === 'ru'
                            ? '"Меч древнего рыцаря, золотая узорчатая гарда, треснувшее стальное лезвие с бирюзовым магическим руническим свечением."'
                            : '"Ancient knight sword, ornate golden hilt, cracked steel blade emitting a turquoise runic magical glow."'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-purple-500/10 space-y-2">
                    <h4 className="text-purple-300 font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2">
                      <span>💸</span>
                      <span>{lang === 'ru' ? 'Логарифмическая сетка предоплаты' : 'Logarithmic Prepayment Scale'}</span>
                    </h4>
                    <p>
                      {lang === 'ru'
                        ? 'Мы ценим доверие наших клиентов. Для небольших заказов до 2 000 руб. действует базовая предоплата 50%. С увеличением бюджета проекта процент предоплаты планомерно снижается до 10%.'
                        : 'We appreciate the trust of our clients. For small orders up to 2,000 RUB, a baseline 50% prepayment is required. As the total budget expands, the percentage is reduced down to 10%.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-purple-500/10 space-y-2">
                    <h4 className="text-purple-300 font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center gap-2">
                      <span>📉</span>
                      <span>{lang === 'ru' ? 'Как работают скидки?' : 'How Do Discounts Apply?'}</span>
                    </h4>
                    <p>
                      {lang === 'ru'
                        ? 'Оптовые скидки применяются автоматически. Первые 10 ассетов рассчитываются по базовому тарифу, позиции с 11 по 50 получают скидку 25%, а после 50 ассета скидка увеличивается до 50%!'
                        : 'Wholesale discounts apply automatically. The first 10 assets are calculated at the basic rate, positions 11 to 50 receive a 25% discount, and beyond 50 assets the discount increases to 50%!'}
                    </p>
                  </div>
                </div>
              )}

                {/* Seed Import/Export Section */}
                <div className="mt-8 pt-6 border-t border-[#ebd6f7]/10">
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#ead6cd] flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-purple-300" />
                    <span>{lang === 'ru' ? 'Сид Конфигурации Калькулятора (Импорт / Экспорт)' : 'Calculator Configuration Seed (Import / Export)'}</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Export / Current Seed */}
                    <div className="space-y-2.5 bg-[#12051d] p-4 rounded-2xl border border-[#3d1a56]/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                          {lang === 'ru' ? 'Текущий сид вашего заказа:' : 'Your current order seed:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedSeed);
                            setSeedCopied(true);
                            setTimeout(() => setSeedCopied(false), 2000);
                          }}
                          disabled={!generatedSeed}
                          className={`px-3 py-1 text-xs font-bold uppercase rounded border transition-all cursor-pointer ${
                            seedCopied
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-purple-950/50 text-purple-300 border-purple-500/20 hover:border-purple-400 hover:text-white'
                          }`}
                        >
                          {seedCopied ? (lang === 'ru' ? 'Скопировано!' : 'Copied!') : (lang === 'ru' ? 'Копировать сид' : 'Copy Seed')}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={generatedSeed}
                        placeholder={lang === 'ru' ? 'Сид генерируется автоматически...' : 'Seed generates automatically...'}
                        className="w-full h-20 bg-[#0c0314] text-stone-300 font-mono text-xs sm:text-sm leading-normal p-3 rounded-xl border border-[#3d1a56]/50 resize-none focus:outline-none select-all"
                      />
                      <p className="text-xs text-stone-300 font-medium leading-normal">
                        {lang === 'ru' 
                          ? 'Этот код содержит все выбранные параметры и описания. Вы можете сохранить его или переслать исполнителю, чтобы он мгновенно загрузил вашу конфигурацию на сайт.'
                          : 'This code stores all chosen parameters and descriptions. You can save it or send it to the artist so they can instantly load your configuration on the site.'}
                      </p>
                    </div>

                    {/* Import Seed */}
                    <div className="space-y-2.5 bg-[#12051d] p-4 rounded-2xl border border-[#3d1a56]/80 flex flex-col justify-between">
                      <div className="space-y-2 flex-1">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wide block">
                          {lang === 'ru' ? 'Загрузить / Импортировать сид:' : 'Load / Import seed:'}
                        </span>
                        <input
                          type="text"
                          value={pastedSeed}
                          onChange={(e) => setPastedSeed(e.target.value)}
                          placeholder={lang === 'ru' ? 'Вставьте код сида сюда...' : 'Paste seed code here...'}
                          className="w-full bg-[#0c0314] text-purple-200 font-mono text-xs p-3 rounded-xl border border-[#3d1a56]/50 focus:outline-none focus:border-purple-400"
                        />
                        
                        {seedError && (
                          <p className="text-xs font-semibold text-rose-400 mt-1">
                            {seedError}
                          </p>
                        )}
                        {seedSuccess && (
                          <p className="text-xs font-semibold text-emerald-400 mt-1">
                            ✓ {lang === 'ru' ? 'Конфигурация успешно загружена!' : 'Configuration successfully loaded!'}
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => applySeed(pastedSeed)}
                          className="w-full py-2.5 bg-[#3d1a56] hover:bg-purple-800 text-[#ebd6f7] font-bold text-xs uppercase rounded-xl border border-purple-500/30 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                        >
                          <span>{lang === 'ru' ? 'Применить код сида' : 'Apply Seed Code'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
      </section>

      {/* Edge of Space Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 pt-44 pb-3 text-center relative z-30 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-ping"></div>
          <p className="font-mono text-xs tracking-[0.25em] text-purple-400/60 uppercase">
            {lang === 'ru' ? 'Вы достигли края космоса' : 'You have reached the edge of space'}
          </p>
          <span className="font-mono text-xs text-purple-400/50 uppercase">
            Village_ LSC • 2026
          </span>
        </div>
      </footer>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Scroll Buttons */}
      <AnimatePresence>
        {showScrollBtn && isExpanded && (
          <motion.button
            key="scroll-btn"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={scrollToCalc}
            className="fixed bottom-6 left-1/2 z-50 bg-[#c084fc] hover:bg-[#a855f7] text-[#1c0d2b] font-display font-extrabold text-sm sm:text-base uppercase tracking-wider px-6 py-3.5 rounded-full border-4 border-[#140620] shadow-[0_0_20px_rgba(192,132,252,0.6)] flex items-center gap-2 cursor-pointer select-none active:scale-95 font-sans"
          >
            <ArrowUpCircle className="w-4 h-4 rotate-180 animate-bounce" />
            <span>{t.scrollToCalcBtn}</span>
          </motion.button>
        )}
        {showScrollToHomeBtn && isExpanded && (
          <motion.button
            key="scroll-home-btn"
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={scrollToHome}
            className="fixed top-6 left-1/2 z-50 bg-[#c084fc] hover:bg-[#a855f7] text-[#1c0d2b] font-display font-extrabold text-sm sm:text-base uppercase tracking-wider px-6 py-3.5 rounded-full border-4 border-[#140620] shadow-[0_0_20px_rgba(192,132,252,0.6)] flex items-center gap-2 cursor-pointer select-none active:scale-95 font-sans"
          >
            <ArrowUpCircle className="w-4 h-4 animate-bounce" />
            <span>{lang === 'ru' ? 'На главную' : 'To Main Page'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Elegant Custom Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`fixed bottom-12 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-300 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                : 'bg-purple-950/90 border-purple-500/50 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.3)]'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500/20' : toast.type === 'error' ? 'bg-rose-500/20' : 'bg-purple-500/20'
            }`}>
              {toast.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : toast.type === 'error' ? (
                <X className="w-5 h-5" />
              ) : (
                <Info className="w-5 h-5" />
              )}
            </div>
            <p className="font-sans text-sm font-semibold leading-relaxed">
              {toast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
