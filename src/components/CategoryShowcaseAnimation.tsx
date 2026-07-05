import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES_LIST } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';

// 4x4 Bayer Dither Matrix for retro transitions
const bayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

interface CategoryShowcaseAnimationProps {
  catId: string;
  lang: 'ru' | 'en';
}

export function CategoryShowcaseAnimation({ catId, lang }: CategoryShowcaseAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [images, setImages] = useState<HTMLCanvasElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return localStorage.getItem(`showcase_visible_${catId}`) !== 'false';
    } catch {
      return true;
    }
  });

  const activeCat = CATEGORIES_LIST.find(c => c.id === catId) || CATEGORIES_LIST[0];

  // Store transition start time to reset the black hole animation when catId changes
  const [animId, setAnimId] = useState(0);

  const toggleVisibility = () => {
    setIsVisible(prev => {
      const next = !prev;
      try {
        localStorage.setItem(`showcase_visible_${catId}`, String(next));
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);

    const loadImageOnly = (src: string): Promise<HTMLCanvasElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          if (!active) return resolve(null);
          
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(null);
            return;
          }
          
          ctx.imageSmoothingEnabled = false;
          
          try {
            const origW = img.width || 128;
            const origH = img.height || 128;
            const maxDim = 110; // slightly smaller so it stays inside showcase nicely
            let drawW = origW;
            let drawH = origH;
            
            if (origW > maxDim || origH > maxDim) {
              const scale = Math.min(maxDim / origW, maxDim / origH);
              drawW = Math.round(origW * scale);
              drawH = Math.round(origH * scale);
            }
            
            const dx = Math.round((128 - drawW) / 2);
            const dy = Math.round((128 - drawH) / 2);
            
            ctx.drawImage(img, dx, dy, drawW, drawH);
            resolve(canvas);
          } catch (e) {
            resolve(null);
          }
        };

        img.onerror = () => {
          resolve(null);
        };

        img.src = src;
      });
    };

    // Determine target files based on category selection
    let sources: string[] = [];
    if (catId === '2') {
      sources = ['/images/model_p1.png', '/images/model_p2.png'];
    } else if (catId === '7') {
      sources = ['/images/skin_p1.png', '/images/skin_p2.png'];
    } else if (catId === '3') {
      sources = [
        '/images/pricelist_uib1.png',
        '/images/pricelist_uib2.png',
        '/images/pricelist_uib3.png',
        '/images/pricelist_uib4.png'
      ];
    } else if (catId === '4') {
      sources = [
        '/images/pricelist_uim1.png',
        '/images/pricelist_uim2.png',
        '/images/pricelist_uim3.png'
      ];
    } else if (catId === '5') {
      sources = ['/images/pricelist_uih1.png', '/images/pricelist_uih2.png'];
    } else if (catId === '6') {
      sources = ['/images/pricelist_p1.png', '/images/pricelist_p2.png'];
    } else if (catId === '8') {
      // Procedural nebula question mark, no images to load
      if (active) {
        setImages([document.createElement('canvas')]);
        setLoading(false);
        setAnimId(prev => prev + 1);
      }
      return () => {
        active = false;
      };
    } else {
      sources = ['/images/cat1.png', '/images/cat2.png', '/images/cat3.png'];
    }

    const loadAll = sources.map((src) => loadImageOnly(src));

    Promise.all(loadAll).then((loadedCanvases) => {
      if (active) {
        const validImages = loadedCanvases.filter((c): c is HTMLCanvasElement => c !== null);
        setImages(validImages);
        setLoading(false);
        setAnimId(prev => prev + 1);
      }
    });

    return () => {
      active = false;
    };
  }, [catId]);

  useEffect(() => {
    if (images.length === 0 || !isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();

    // Create temporary offscreen buffers
    const buffer1 = document.createElement('canvas');
    buffer1.width = 128;
    buffer1.height = 128;
    const bCtx1 = buffer1.getContext('2d', { willReadFrequently: true });

    const buffer2 = document.createElement('canvas');
    buffer2.width = 128;
    buffer2.height = 128;
    const bCtx2 = buffer2.getContext('2d', { willReadFrequently: true });

    const bufferHole = document.createElement('canvas');
    bufferHole.width = 128;
    bufferHole.height = 128;
    const bCtxHole = bufferHole.getContext('2d', { willReadFrequently: true });

    if (!bCtx1 || !bCtx2 || !bCtxHole) return;

    // Fast birth and dither durations for snappy initialization
    const birthDuration = 250; 
    const birthDitherDuration = 350;

    // Helper to warp/float the category graphic
    const drawWarped = (
      srcCanvas: HTMLCanvasElement, 
      destCtx: CanvasRenderingContext2D, 
      intensity: number, 
      now: number,
      floatOffset: number
    ) => {
      destCtx.clearRect(0, 0, 128, 128);
      destCtx.imageSmoothingEnabled = false;

      for (let y = 0; y < 128; y++) {
        const waveX = Math.sin(y * 0.08 + now * 0.01) * intensity * 12;
        destCtx.drawImage(
          srcCanvas,
          0, y, 128, 1,
          waveX, y + floatOffset, 128, 1
        );
      }
    };

    // Filter to apply transition colors / white flash
    const applyWhiteFlashFilter = (destCtx: CanvasRenderingContext2D, factor: number, forceWhite = false) => {
      if (factor <= 0 && !forceWhite) return;
      const imgData = destCtx.getImageData(0, 0, 128, 128);
      const data = imgData.data;

      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const idx = (y * 128 + x) * 4;
          const a = data[idx + 3];
          if (a > 20) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const threshold = bayerMatrix[y % 4][x % 4] * 16;
            
            let targetR = 140;
            let targetG = 140;
            let targetB = 140;

            if (lum > 110 || threshold < 110) {
              targetR = 255;
              targetG = 255;
              targetB = 255;
            }

            if (forceWhite) {
              targetR = 255;
              targetG = 255;
              targetB = 255;
            }

            data[idx] = Math.round(r + (targetR - r) * factor);
            data[idx + 1] = Math.round(g + (targetG - g) * factor);
            data[idx + 2] = Math.round(b + (targetB - b) * factor);
          }
        }
      }
      destCtx.putImageData(imgData, 0, 0);
    };

    // Sparks (white particles) system
    const sparks: { x: number; y: number; vx: number; vy: number; life: number; size: number }[] = [];

    const updateAndDrawSparks = (destCtx: CanvasRenderingContext2D, shouldEmit: boolean) => {
      if (shouldEmit && Math.random() < 0.4) {
        sparks.push({
          x: 40 + Math.random() * 48,
          y: 40 + Math.random() * 48,
          vx: (Math.random() - 0.5) * 4.0,
          vy: (Math.random() - 0.5) * 4.0 - 0.5,
          life: 1.0,
          size: Math.random() * 2.2 + 1.0
        });
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.05; // dissolve fast

        if (s.life <= 0 || s.x < 2 || s.x > 126 || s.y < 2 || s.y > 126) {
          sparks.splice(i, 1);
          continue;
        }

        // Clean white/glowing sparks
        destCtx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
        destCtx.fillRect(Math.round(s.x), Math.round(s.y), Math.round(s.size), Math.round(s.size));
      }
    };

    // Accretion particles for background gravitational core
    const dustParticles: { angle: number; radius: number; speed: number; size: number; color: string }[] = [];
    for (let i = 0; i < 30; i++) {
      dustParticles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 20 + Math.random() * 40,
        speed: 0.05 + Math.random() * 0.1,
        size: 1 + Math.random() * 1.5,
        color: '#ffffff' // Pure white space particles
      });
    }

    // Custom Question Mark Nebula Particle System
    const qMarkPoints = [
      // Dot at bottom
      { x: 64, y: 104 },
      { x: 64, y: 100 },
      // Stem
      { x: 64, y: 84 },
      { x: 64, y: 76 },
      // Curve up & right & around
      { x: 64, y: 64 },
      { x: 68, y: 56 },
      { x: 74, y: 50 },
      { x: 80, y: 44 },
      { x: 82, y: 36 },
      { x: 78, y: 28 },
      { x: 70, y: 24 },
      { x: 60, y: 24 },
      { x: 52, y: 28 },
      { x: 46, y: 36 },
      { x: 44, y: 44 }
    ];

    const qParticles: {
      baseX: number;
      baseY: number;
      targetX: number;
      targetY: number;
      angleOffset: number;
      speed: number;
      size: number;
      opacity: number;
      noiseFreq: number;
    }[] = [];

    // Create 180 white particles
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 15 + Math.random() * 45;
      
      const targetPt = qMarkPoints[i % qMarkPoints.length];
      const localNoiseX = (Math.random() - 0.5) * 5;
      const localNoiseY = (Math.random() - 0.5) * 5;

      qParticles.push({
        baseX: 64 + Math.cos(angle) * r,
        baseY: 64 + Math.sin(angle) * r,
        targetX: targetPt.x + localNoiseX,
        targetY: targetPt.y + localNoiseY,
        angleOffset: Math.random() * 100,
        speed: 0.05 + Math.random() * 0.05,
        size: Math.random() < 0.25 ? 2.5 : Math.random() < 0.7 ? 1.5 : 1,
        opacity: 0.25 + Math.random() * 0.65,
        noiseFreq: 0.002 + Math.random() * 0.004
      });
    }

    const drawQuestionMarkNebula = (destCtx: CanvasRenderingContext2D) => {
      destCtx.clearRect(0, 0, 128, 128);

      // Subtly draw space background grid (pure white lines for a clean nebular grid)
      destCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      destCtx.lineWidth = 1;
      const gridSpacing = 16;
      for (let i = 0; i <= 128; i += gridSpacing) {
        destCtx.beginPath();
        destCtx.moveTo(i, 0);
        destCtx.lineTo(i, 128);
        destCtx.stroke();
        destCtx.beginPath();
        destCtx.moveTo(0, i);
        destCtx.lineTo(128, i);
        destCtx.stroke();
      }

      // Question mark always remains assembled as a nebula
      const assembleProgress = 1.0;

      // Draw particles
      qParticles.forEach(p => {
        const now = performance.now();
        // Floating noise
        const noiseX = Math.sin(now * p.noiseFreq + p.angleOffset) * 2.5;
        const noiseY = Math.cos(now * p.noiseFreq * 0.8 + p.angleOffset) * 2.5;

        // Position is always assembled in the shape of a question mark
        const x = p.targetX + noiseX;
        const y = p.targetY + noiseY + Math.sin(now * 0.0015 + p.angleOffset) * 2.0;

        // Breath opacity
        const breath = Math.sin(now * 0.002 + p.angleOffset) * 0.15;
        const opacity = Math.max(0.1, Math.min(1.0, p.opacity + breath));
        
        destCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        destCtx.fillRect(Math.round(x), Math.round(y), Math.round(p.size), Math.round(p.size));
      });
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.imageSmoothingEnabled = false;

      const elapsed = time - startTime;

      // Draw stellar background with white gravity dust
      const drawGridAndBlackHole = (destCtx: CanvasRenderingContext2D, holeRadius: number, accretionGlow: number, swirlForce: number) => {
        destCtx.clearRect(0, 0, 128, 128);
        
        // Curving space blueprint lines
        destCtx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        destCtx.lineWidth = 1;
        const gridSpacing = 16;
        const cx = 64;
        const cy = 64;

        for (let i = 0; i <= 128; i += gridSpacing) {
          destCtx.beginPath();
          for (let y = 0; y <= 128; y += 4) {
            const dx = i - cx;
            const dy = y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let drawX = i;
            if (dist > 5 && swirlForce > 0) {
              const pull = (swirlForce * 1800) / (dist * dist + 100);
              drawX -= (dx / dist) * Math.min(dist, pull);
            }
            if (y === 0) destCtx.moveTo(drawX, y);
            else destCtx.lineTo(drawX, y);
          }
          destCtx.stroke();

          destCtx.beginPath();
          for (let x = 0; x <= 128; x += 4) {
            const dx = x - cx;
            const dy = i - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let drawY = i;
            if (dist > 5 && swirlForce > 0) {
              const pull = (swirlForce * 1800) / (dist * dist + 100);
              drawY -= (dy / dist) * Math.min(dist, pull);
            }
            if (x === 0) destCtx.moveTo(x, drawY);
            else destCtx.lineTo(x, drawY);
          }
          destCtx.stroke();
        }

        // Swirling dust particles (white particles)
        dustParticles.forEach(p => {
          p.angle -= p.speed * (1 + swirlForce * 1.5);
          if (holeRadius > 0) {
            p.radius -= 0.2 * (p.radius / 30);
            if (p.radius < holeRadius - 1) {
              p.radius = 40 + Math.random() * 20;
            }
          }
          const px = cx + Math.cos(p.angle) * p.radius;
          const py = cy + Math.sin(p.angle) * p.radius;
          if (px >= 0 && px < 128 && py >= 0 && py < 128) {
            destCtx.fillStyle = p.color;
            destCtx.fillRect(Math.round(px), Math.round(py), Math.round(p.size), Math.round(p.size));
          }
        });

        // Event Horizon
        if (holeRadius > 0.5) {
          destCtx.fillStyle = '#100314';
          destCtx.beginPath();
          destCtx.arc(cx, cy, holeRadius, 0, Math.PI * 2);
          destCtx.fill();
          destCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          destCtx.lineWidth = 1;
          destCtx.stroke();
        }
      };

      const floatOffset = Math.sin(time * 0.0018) * 3.0;

      if (elapsed < birthDuration) {
        // --- BLACK HOLE BIRTH (FAST) ---
        const progress = elapsed / birthDuration;
        const radius = Math.round(progress * 28);
        const swirlForce = progress * 2.0;
        const glow = progress * 1.0;

        drawGridAndBlackHole(bCtxHole, radius, glow, swirlForce);
        ctx.drawImage(bufferHole, 0, 0);

      } else if (elapsed >= birthDuration && elapsed < birthDuration + birthDitherDuration) {
        // --- BAYER DITHER INTO IMAGE (FAST) ---
        const ditherProgress = (elapsed - birthDuration) / birthDitherDuration;
        const swirlForce = (1 - ditherProgress) * 2.0;
        const radius = Math.round((1 - ditherProgress) * 28);
        const glow = (1 - ditherProgress) * 1.0;

        drawGridAndBlackHole(bCtxHole, radius, glow, swirlForce);

        if (catId === '8') {
          drawQuestionMarkNebula(bCtx1);
        } else {
          const currentImg = images[0];
          if (currentImg) {
            drawWarped(currentImg, bCtx1, 0, time, floatOffset);
          } else {
            bCtx1.clearRect(0, 0, 128, 128);
          }
        }

        const hData = bCtxHole.getImageData(0, 0, 128, 128);
        const iData = bCtx1.getImageData(0, 0, 128, 128);
        const dest = hData.data;
        const src = iData.data;

        for (let y = 0; y < 128; y++) {
          for (let x = 0; x < 128; x++) {
            const idx = (y * 128 + x) * 4;
            const threshold = bayerMatrix[y % 4][x % 4] / 16;
            if (ditherProgress >= threshold) {
              const alpha = src[idx + 3];
              if (alpha > 20) {
                dest[idx] = src[idx];
                dest[idx + 1] = src[idx + 1];
                dest[idx + 2] = src[idx + 2];
                dest[idx + 3] = alpha;
              }
            }
          }
        }
        bCtxHole.putImageData(hData, 0, 0);
        ctx.drawImage(bufferHole, 0, 0);
        updateAndDrawSparks(ctx, true);

      } else {
        // --- STEADY SPRITE CYCLE WITH MORPHING TRANSITIONS (FAST, NO SWAYING) ---
        const activeElapsed = elapsed - (birthDuration + birthDitherDuration);
        const cycleDuration = 3000; // 3 seconds per image frame (faster)
        const timeInCycle = activeElapsed % cycleDuration;

        const currentIdx = Math.floor((activeElapsed / cycleDuration) % images.length);
        const nextIdx = (currentIdx + 1) % images.length;

        const currentImg = images[currentIdx];
        const nextImg = images[nextIdx];

        if (!currentImg) {
          animationFrameId = requestAnimationFrame(render);
          return;
        }

        let isTransitioning = false;

        // If there is only one image, render it flat and steady
        if (images.length === 1) {
          if (catId === '8') {
            drawQuestionMarkNebula(bCtx1);
          } else {
            drawWarped(currentImg, bCtx1, 0, time, floatOffset);
          }
          ctx.drawImage(buffer1, 0, 0);
          updateAndDrawSparks(ctx, false);
          animationFrameId = requestAnimationFrame(render);
          return;
        }

        // Fast transition phase matching the services morph animation but steady!
        if (timeInCycle < 2100) {
          // Normal display state
          drawWarped(currentImg, bCtx1, 0, time, floatOffset);
          ctx.drawImage(buffer1, 0, 0);

        } else if (timeInCycle >= 2100 && timeInCycle < 2350) {
          // Phase 2a: Flash white
          const progress = (timeInCycle - 2100) / 250;
          isTransitioning = true;
          drawWarped(currentImg, bCtx1, progress * 0.7, time, floatOffset);
          applyWhiteFlashFilter(bCtx1, progress);
          ctx.drawImage(buffer1, 0, 0);

        } else if (timeInCycle >= 2350 && timeInCycle < 2750) {
          // Phase 2b: Dither crossfade
          const progress = (timeInCycle - 2350) / 400;
          isTransitioning = true;

          drawWarped(currentImg, bCtx1, (1 - progress) * 0.7, time, 0);
          applyWhiteFlashFilter(bCtx1, 1, true);

          drawWarped(nextImg, bCtx2, progress * 0.7, time, 0);
          applyWhiteFlashFilter(bCtx2, 1, true);

          const dData1 = bCtx1.getImageData(0, 0, 128, 128);
          const dData2 = bCtx2.getImageData(0, 0, 128, 128);
          const raw1 = dData1.data;
          const raw2 = dData2.data;

          for (let y = 0; y < 128; y++) {
            for (let x = 0; x < 128; x++) {
              const idx = (y * 128 + x) * 4;
              const threshold = bayerMatrix[y % 4][x % 4] / 16;
              if (progress >= threshold) {
                raw1[idx] = raw2[idx];
                raw1[idx + 1] = raw2[idx + 1];
                raw1[idx + 2] = raw2[idx + 2];
                raw1[idx + 3] = raw2[idx + 3];
              }
            }
          }
          bCtx1.putImageData(dData1, 0, 0);
          ctx.drawImage(buffer1, 0, 0);

        } else {
          // Phase 2c: Flash fade-out
          const progress = (timeInCycle - 2750) / 250;
          drawWarped(nextImg, bCtx1, 0, time, floatOffset);
          applyWhiteFlashFilter(bCtx1, 1 - progress);
          ctx.drawImage(buffer1, 0, 0);
        }

        // Draw active transition sparks (white sparks)
        updateAndDrawSparks(ctx, isTransitioning);
      }

      // Pixelated retro CRT filter scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let y = 0; y < 128; y += 2) {
        ctx.fillRect(0, y, 128, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [images, animId, isVisible]);

  // If hidden, show an elegant, extremely compact and highly styled restore badge
  if (!isVisible) {
    return (
      <motion.div 
        layout
        className="flex items-center justify-between bg-[#12051d]/90 border border-purple-500/20 px-4 py-2.5 rounded-xl text-xs select-none shadow-[0_0_10px_rgba(139,92,246,0.1)] transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
          <span className="font-bold text-[#ebd6f7]/80">
            {lang === 'ru' ? 'Предпросмотр скрыт' : 'Preview hidden'} ({lang === 'ru' ? activeCat.nameRu : activeCat.nameEn})
          </span>
        </div>
        <button
          type="button"
          onClick={toggleVisibility}
          className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/60 border border-purple-400/40 rounded-lg text-xs font-bold text-purple-300 hover:text-white hover:bg-purple-900/60 active:scale-95 transition-all cursor-pointer"
        >
          <Eye size={12} className="stroke-[3]" />
          <span>{lang === 'ru' ? 'Показать' : 'Show'}</span>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-[#12051d]/90 border-2 border-purple-500/30 p-4 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-fade-in select-none">
      
      {/* Eye hide button on Left Side */}
      <div className="absolute top-2.5 left-2.5 z-35">
        <button
          type="button"
          onClick={toggleVisibility}
          className="p-1.5 rounded-lg bg-black/40 hover:bg-purple-950/60 text-purple-300 hover:text-white border border-purple-500/20 active:scale-90 transition-all cursor-pointer"
          title={lang === 'ru' ? 'Скрыть предпросмотр' : 'Hide preview'}
        >
          <EyeOff size={13} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Frame on Left */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-[#1c0827] rounded-xl overflow-hidden border-2 border-purple-500/40 shrink-0 mx-auto sm:mx-0 shadow-lg flex items-center justify-center">
        {/* Subtle radial blueprint dots */}
        <div className="absolute inset-0 bg-[#1c0827] bg-[radial-gradient(#4a206a_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-10"></div>
        
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#c084fc] border-t-transparent animate-spin"></div>
            <span className="text-xs text-[#ebd6f7]/60 font-mono mt-2 tracking-wider">CREATING VORTEX...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={128}
            height={128}
            className="w-full h-full object-contain z-20 relative"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
      </div>

      {/* Info on Right */}
      <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left pl-2 sm:pl-0 mt-3 sm:mt-0">
        <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
          <span className="px-1.5 py-0.5 bg-purple-950/80 border border-purple-500/40 rounded text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
            CAT #0{activeCat.id}
          </span>
        </div>

        <h4 className="font-display text-[#ebd6f7] text-sm sm:text-base font-black uppercase tracking-tight leading-tight">
          {lang === 'ru' ? activeCat.nameRu : activeCat.nameEn}
        </h4>
        
        <p className="text-[#ebd6f7]/80 text-xs mt-1 leading-relaxed font-bold">
          {lang === 'ru' ? activeCat.descriptionRu : activeCat.descriptionEn}
        </p>

        {/* Short bullet tags for compact representation */}
        <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
          {(lang === 'ru' ? activeCat.useCasesRu : activeCat.useCasesEn).slice(0, 3).map((uc, i) => (
            <span key={i} className="text-xs bg-purple-950/40 text-purple-200 border border-purple-500/20 px-2 py-0.5 rounded-md font-semibold capitalize">
              {uc}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
