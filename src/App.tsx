import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Coins,
  Plus,
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
  X
} from 'lucide-react';
import {
  Language,
  Currency,
  CategoryData,
  SpriteItemState,
  CATEGORIES_LIST,
  TRANSLATIONS
} from './types';
import { PixelMorphAnimation } from './components/PixelMorphAnimation';

interface SquareFrameProps {
  imagePath: string;
  catId: string;
  lang: string;
  basePrice: number;
  pixelPrice: number;
  maxBaseSize: number;
  formatPrice: (val: number) => string;
  exampleSize: string;
  examplePrice: string;
  isMinecraft?: boolean;
}

function SquareFrame({
  imagePath,
  catId,
  lang,
  basePrice,
  pixelPrice,
  maxBaseSize,
  formatPrice,
  exampleSize,
  examplePrice,
  isMinecraft
}: SquareFrameProps) {
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

          {['1', '2', '3', '4', '5', '6', '7'].includes(catId) ? (
            <PixelMorphAnimation catId={catId} className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none" />
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

      {/* Pricing info situated directly UNDER the square picture frame - widened to match 1.5x dimensions */}
      <div className="mt-4 w-64 sm:w-72 lg:w-80 xl:w-[350px] bg-[#2d143f] rounded-2xl border-2 border-[#3d1a56] p-4 text-xs sm:text-sm space-y-2.5 text-[#ebd6f7] shadow-inner transition-all duration-300 group-hover:border-purple-300 group-hover:shadow-[0_0_20px_rgba(192,132,252,0.25)]">
        <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold transition-all duration-300">
          <span className="text-[#ebd6f7]/60 group-hover:text-white/80 uppercase tracking-wider">
            {lang === 'ru' ? 'Цена:' : 'Price:'}
          </span>
          <span className="font-bold font-mono text-purple-300 group-hover:text-white transition-all">
            {isMinecraft ? (
              `${formatPrice(basePrice)}`
            ) : (
              `${formatPrice(basePrice)} + ${formatPrice(pixelPrice)}/px`
            )}
          </span>
        </div>

        {!isMinecraft && (
          <div className="flex justify-between items-center border-t border-[#3d1a56] pt-2 text-[11px] sm:text-xs font-bold transition-all duration-300">
            <span className="text-[#ebd6f7]/60 group-hover:text-white/80 uppercase tracking-wider text-left max-w-[70%] leading-tight">
              {lang === 'ru' ? 'Максимальный предпочтительный размер:' : 'Maximum preferred size:'}
            </span>
            <span className="font-bold font-mono text-[#f1e5f8] group-hover:text-white transition-colors shrink-0">
              {maxBaseSize}px
            </span>
          </div>
        )}

        <div className="flex justify-between items-center border-t border-[#3d1a56] pt-2 text-[11px] sm:text-xs text-purple-300 font-bold uppercase tracking-wider transition-all duration-300">
          <span className="group-hover:text-purple-200">{lang === 'ru' ? 'Пример:' : 'Example:'}</span>
          <span className="font-mono text-xs sm:text-sm text-[#f1e5f8] group-hover:text-white transition-colors">
            {exampleSize} ≈ {examplePrice}
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

    const cellSize = 4; // High-density fine grid matching the pixel-perfect Discord Quest look

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
        const gridX = Math.floor(Math.random() * (width / cellSize)) * cellSize;
        const gridY = Math.floor(Math.random() * (height / cellSize)) * cellSize;
        stars.push({
          x: gridX,
          y: gridY,
          phase: Math.random() * Math.PI * 2,
          speed: 0.03 + Math.random() * 0.05,
          maxOpacity: 0.3 + Math.random() * 0.7
        });
      }
    };
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateStars(canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 4x4 classic Bayer ordered dither matrix
    const bayer = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];

    // Smoothly animated properties for firefly clustering
    let currentCX = window.innerWidth / 2;
    let currentCY = window.innerHeight / 2;
    let currentRadius = Math.sqrt(currentCX * currentCX + currentCY * currentCY) * 0.85;
    let currentIntensity = 0.0; // 0.0 (ambient idle gold) to 1.0 (vibrant bright firefly green-gold)
    let currentAvatarIntensity = 0.0; // special black hole effect around avatar

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cols = Math.ceil(canvas.width / cellSize);
      const rows = Math.ceil(canvas.height / cellSize);
      
      // Idle target position (center of screen)
      let targetCX = canvas.width / 2;
      let targetCY = canvas.height / 2;
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

      // Fill rich cozy deep space-purple background
      ctx.fillStyle = '#0d0614'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Twinkling Space Stars as perfect white pixel cells matching dither cellSize
      stars.forEach(star => {
        star.phase += star.speed;
        
        // Relocate star when it fades out to a minimum in its sine cycle (different locations)
        if (Math.sin(star.phase) < -0.98) {
          star.x = Math.floor(Math.random() * (canvas.width / cellSize)) * cellSize;
          star.y = Math.floor(Math.random() * (canvas.height / cellSize)) * cellSize;
          star.speed = 0.03 + Math.random() * 0.05;
          star.maxOpacity = 0.3 + Math.random() * 0.7;
          star.phase = -Math.PI / 2 + 0.3; // Start fade back in, avoiding immediate relocation re-trigger
        }

        const opacity = Math.max(0.0, star.maxOpacity * (0.5 + 0.5 * Math.sin(star.phase)));
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(star.x, star.y, cellSize, cellSize);
      });

      // Add a subtle organic breathing jitter to the center point so it feels like living fireflies!
      const jitterX = Math.sin(shimmerPhase * 2.2) * (15 * currentIntensity);
      const jitterY = Math.cos(shimmerPhase * 1.6) * (15 * currentIntensity);
      
      const activeCX = currentCX + jitterX;
      const activeCY = currentCY + jitterY;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cellSize;
          const y = r * cellSize;
          
          // Distance from the active swarm center
          const dx = (x + cellSize / 2) - activeCX;
          const dy = (y + cellSize / 2) - activeCY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Radial value calculation
          const radialVal = Math.max(0, Math.min(1.1, 1.15 - (dist / currentRadius)));
          
          // Slow diagonal wave ripple (matching the classic Discord quest checkin/checkpoint animation style)
          const diagonalIndex = c - r;
          const wave = Math.sin(diagonalIndex * 0.045 - shimmerPhase) * 0.12;
          
          const val = Math.max(0, Math.min(1, radialVal + wave));

          // Bayer 4x4 threshold lookup
          const threshold = bayer[r % 4][c % 4] / 16;
          
          // Halftone-like screen scanlines (very subtle retro touch)
          const texture = ((r % 2 === 0) ? 0.03 : 0) + ((c % 2 === 0) ? 0.03 : 0);

          if (val + texture > threshold) {
            // Determine cell color
            // Ambient base color: beautiful mystic purple (139, 92, 246)
            // On hover, we blend the bright neon fuchsia/purple with the original golden-yellow (251, 191, 36)
            const hoverInfluence = currentIntensity * Math.max(0, 1 - dist / (currentRadius * 1.2));
            const avatarInfluence = currentAvatarIntensity * Math.max(0, 1 - dist / (currentRadius * 1.1));
            let aVal = 0.07 + (0.22 - 0.07) * currentIntensity;
            
            let rVal = 139;
            let gVal = 92;
            let bVal = 246;

            if (hoverInfluence > 0) {
              // Checkerboard pattern blends the new bright purple and the old gold hue
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
              // Shimmer between light purple (225, 180, 255) and pitch black (10, 3, 20), like a black hole
              const blackHoleCycle = Math.sin(shimmerPhase * 2.5);
              const blackHoleBlend = 0.5 + 0.5 * blackHoleCycle; // 0 to 1
              
              const holeR = Math.round(216 * blackHoleBlend + 10 * (1 - blackHoleBlend));
              const holeG = Math.round(180 * blackHoleBlend + 3 * (1 - blackHoleBlend));
              const holeB = Math.round(254 * blackHoleBlend + 20 * (1 - blackHoleBlend));

              rVal = Math.round(holeR * avatarInfluence + rVal * (1 - avatarInfluence));
              gVal = Math.round(holeG * avatarInfluence + gVal * (1 - avatarInfluence));
              bVal = Math.round(holeB * avatarInfluence + bVal * (1 - avatarInfluence));

              // Accretion disk opacity fluctuations: heavy dark to glowing purple dither
              const targetA = 0.12 + 0.45 * blackHoleBlend; 
              aVal = aVal * (1 - avatarInfluence) + targetA * avatarInfluence;
            }

            ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${aVal})`;
            ctx.fillRect(x, y, cellSize, cellSize);
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
      className="fixed inset-0 pointer-events-none z-0"
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
 * Calculates the final prepayment percentage based on the total order price and base prepayment percentage.
 * Uses a logarithmic function to avoid if-else or switch threshold chains.
 */
function calculatePrepaymentPercent(basePercent: number, totalPrice: number): number {
  const threshold = 2000;
  const reductionStep = 5;
  const minPercent = 10;

  const checkedPrice = Math.max(0, totalPrice);
  const factor = checkedPrice / threshold;
  const logTerm = factor > 0 ? Math.floor(Math.log2(factor)) + 1 : 0;
  const reductions = Math.max(0, logTerm);

  const calculatedPercent = basePercent - (reductions * reductionStep);
  return Math.max(minPercent, calculatedPercent);
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
      templateSize: '16'
    }
  ]);

  // Global settings
  const [speedRate, setSpeedRate] = useState<number>(1.0); // 1.0 Moderate, 1.25 Priority
  const [showLog, setShowLog] = useState<boolean>(false);
  const [tzOutput, setTzOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<boolean>(false);
  const [spriteCounter, setSpriteCounter] = useState<number>(1);

  // Active expanded help cards per sprite block to show formulas
  const [activeHelp, setActiveHelp] = useState<{ [key: string]: boolean }>({});

  // Interactive Terms of Collaboration states
  const [attributionCopied, setAttributionCopied] = useState<boolean>(false);

  // Scroll & Social states
  const [showScrollBtn, setShowScrollBtn] = useState<boolean>(false);
  const [showSocialsDropdown, setShowSocialsDropdown] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const calcEl = document.getElementById('calc-anchored-form');
      if (!calcEl) return;
      const rect = calcEl.getBoundingClientRect();
      
      // Show button if the top of the calculator is below the bottom of the viewport
      if (rect.top > window.innerHeight) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCalc = () => {
    const calcEl = document.getElementById('calc-anchored-form');
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSocialClick = (platform: 'telegram' | 'discord' | 'email') => {
    if (platform === 'telegram') {
      window.open('https://t.me/Village_Village', '_blank');
    } else if (platform === 'discord') {
      navigator.clipboard.writeText('villagelsc_');
      alert(lang === 'ru' ? 'Никнейм Дискорд @villagelsc_ скопирован!' : 'Discord username @villagelsc_ copied!');
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
      url: '/src/assets/lobby.mp3'
    }
  ], []);

  const [currentTrackIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.25); // Soft by default
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(PLAYLIST[currentTrackIdx].url);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const useRemoteFallback = () => {
      console.log('Local lobby.mp3 is empty or unplayable. Switching to remote ambient stream.');
      audio.src = 'https://archive.org/download/minecraft_ost/08%20-%20Sweden.mp3';
      if (isPlaying) {
        audio.play().catch(err => {
          console.log('Playback error on remote fallback stream:', err);
        });
      }
    };

    audio.addEventListener('error', useRemoteFallback);

    // Try to play immediately on mount
    audio.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(err => {
        console.log('Autoplay blocked initially or empty file:', err);
        // It might be blocked or empty. If empty, the error listener will trigger fallback.
      });

    // Fallback: trigger playback on first user interaction if blocked
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            cleanupListeners();
          })
          .catch(err => {
            console.log('Interaction play blocked:', err);
          });
      }
    };

    const cleanupListeners = () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('mousedown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('mousedown', handleUserInteraction);

    return () => {
      audio.pause();
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
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Playback error:', err);
      });
    }
  };

  const [openDropdownSpriteId, setOpenDropdownSpriteId] = useState<number | null>(null);

  const t = TRANSLATIONS[lang];

  // Map generated images properly to categories for standard or safe rendering
  const getCategoryImage = (catId: string) => {
    switch (catId) {
      case '1': return '/src/assets/images/cat1.gif';
      case '2': return '/src/assets/images/cat2.gif';
      case '3': return '/src/assets/images/cat3.gif';
      case '4': return '/src/assets/images/cat4.gif';
      case '5': return '/src/assets/images/cat5.gif';
      case '6': return '/src/assets/images/cat6.gif';
      case '7': return '/src/assets/images/cat7.gif';
      default: return '/src/assets/images/cat8.gif';
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

  // Helper to calculate a single sprite position
  const calculateSpritePrice = (sprite: SpriteItemState) => {
    const cat = CATEGORIES_LIST.find(c => c.id === sprite.categoryId) || CATEGORIES_LIST[0];
    
    const isInvalidSize = sprite.categoryId !== '7' && (sprite.width > 2000 || sprite.height > 2000);
    
    let baseCalculatedPrice = 0;
    let sizeFactor = 0;
    let sizeInfo = '';
    let sizeSurplusModifier = 1.0;

    if (sprite.categoryId === '7') {
      // Minecraft Skin specific pricing
      const skinMult = sprite.skinType === '2' ? 2 : 1;
      baseCalculatedPrice = cat.basePrice * skinMult;
      sizeInfo = sprite.skinType === '2' ? t.hdText : t.standardText;
      sizeFactor = sprite.skinType === '2' ? 512 : 64;
      
      if (sizeFactor > cat.maxBaseSize) {
        const extraPixels = sizeFactor - cat.maxBaseSize;
        sizeSurplusModifier = 1.0 + (extraPixels * 0.005);
      }
    } else {
      // Standard resolution sizing
      const w = Math.max(1, sprite.width);
      const h = Math.max(1, sprite.height);
      sizeFactor = Math.round(Math.sqrt(w * h));
      baseCalculatedPrice = cat.basePrice + (sizeFactor * cat.pixelPrice);
      sizeInfo = `${w}×${h} px`;

      if (sizeFactor > cat.maxBaseSize) {
        const extraPixels = sizeFactor - cat.maxBaseSize;
        sizeSurplusModifier = 1.0 + (extraPixels * 0.005);
      }
    }

    // Animation frame calculations
    let frames = 1;
    let animModeLogText = t.standardText;

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
    }

    // Base animated frame additions (+20% for each extra frame)
    let animatedSinglePrice = baseCalculatedPrice;
    if (frames > 1) {
      const extraFrames = frames - 1;
      animatedSinglePrice = baseCalculatedPrice + (baseCalculatedPrice * 0.2 * extraFrames);
    }

    // Apply linear canvas overflow penalty
    if (sizeSurplusModifier > 1.0) {
      animatedSinglePrice = animatedSinglePrice * sizeSurplusModifier;
    }

    // Final rounding
    animatedSinglePrice = Math.round(animatedSinglePrice);

    // Variant calculation (50% value of full animated cost)
    const singleVarPrice = Math.round(animatedSinglePrice * 0.5);
    const blockOrigTotal = animatedSinglePrice * sprite.countOrig;
    const blockVarTotal = singleVarPrice * sprite.countVar;
    const totalBlockPrice = isInvalidSize ? 0 : (blockOrigTotal + blockVarTotal);

    return {
      totalPrice: totalBlockPrice,
      isInvalidSize,
      baseCalculatedPrice,
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
      description: sprite.description.trim()
    };
  };

  // Memoized global calculations
  const orderCalculations = useMemo(() => {
    let rawTotal = 0;
    let cumulativeSprites = 0;
    let surchargeAmount = 0;
    const itemsLogs: string[] = [];
    const rawItems: any[] = [];

    sprites.forEach((s, idx) => {
      const res = calculateSpritePrice(s);
      rawTotal += res.totalPrice;
      rawItems.push({
        index: idx + 1,
        ...res
      });

      // Track surcharge specifically for this sprite item based on running count
      let itemSurcharge = 0;
      let surchargeBreakdownOrig = 0;
      let surchargeBreakdownVar = 0;

      // Originals
      for (let i = 0; i < s.countOrig; i++) {
        cumulativeSprites++;
        if (cumulativeSprites > 100) {
          surchargeBreakdownOrig += Math.round(res.animatedSinglePrice * speedRate * 10);
        }
      }
      // Variations
      for (let i = 0; i < s.countVar; i++) {
        cumulativeSprites++;
        if (cumulativeSprites > 100) {
          surchargeBreakdownVar += Math.round(res.singleVarPrice * speedRate * 10);
        }
      }
      itemSurcharge = surchargeBreakdownOrig + surchargeBreakdownVar;
      surchargeAmount += itemSurcharge;

      // Assemble detailed formula log
      let itemLog = `${idx + 1}. [${res.categoryName}] (Size: ${res.sizeInfo})\n`;
      const baseCategoryPrice = CATEGORIES_LIST.find(c => c.id === s.categoryId)?.basePrice || 0;
      itemLog += `   • Base category rate: ${formatPrice(baseCategoryPrice)}\n`;
      if (s.categoryId !== '7') {
        const pixelPriceVal = CATEGORIES_LIST.find(c => c.id === s.categoryId)?.pixelPrice || 0;
        const rateAddition = res.sizeFactor * pixelPriceVal;
        itemLog += `   • Size factor calculation: √(${s.width}×${s.height}) = ${res.sizeFactor} pixels\n`;
        itemLog += `   • Rate addition: ${res.sizeFactor}px × ${formatPrice(pixelPriceVal)}/px = +${formatPrice(rateAddition)}\n`;
      }
      itemLog += `   • Base Static Price: ${formatPrice(res.baseCalculatedPrice)}\n`;
      if (res.frames > 1) {
        itemLog += `   • Animation frames: ${res.frames} (${res.animModeLogText})\n`;
        const animatedRateVal = Math.round(res.baseCalculatedPrice * (1 + 0.2 * (res.frames - 1)));
        itemLog += `   • Animated rate: ${formatPrice(res.baseCalculatedPrice)} + 20% × ${res.frames - 1} extra frames = ${formatPrice(animatedRateVal)}\n`;
      }
      if (res.sizeSurplusModifier > 1.0) {
        const excessPercent = Math.round((res.sizeSurplusModifier - 1.0) * 100);
        itemLog += `   • OVERFLOW PENALTY (Threshold ${res.maxBaseSize}px exceeded): +${excessPercent}% rate applied\n`;
      }
      itemLog += `   • Price per original sprite: ${formatPrice(res.animatedSinglePrice)}\n`;
      if (s.countVar > 0) {
        itemLog += `   • Price per variant (50%): ${formatPrice(res.singleVarPrice)}\n`;
      }
      itemLog += `   • Subtotal: (${formatPrice(res.animatedSinglePrice)} × ${s.countOrig} original) + (${formatPrice(res.singleVarPrice)} × ${s.countVar} variants) = ${formatPrice(res.totalPrice)}\n`;
      
      if (itemSurcharge > 0) {
        if (lang === 'ru') {
          itemLog += `   • ⚠️ НАЦЕНКА (+1000% превышение 100 спрайтов): +${formatPrice(itemSurcharge)}\n`;
        } else {
          itemLog += `   • ⚠️ SURCHARGE (+1000% limit of 100 sprites exceeded): +${formatPrice(itemSurcharge)}\n`;
        }
      }

      itemsLogs.push(itemLog);
    });

    const baseTotalRounded = Math.round(rawTotal);
    const priceBeforeDiscount = Math.round(baseTotalRounded * speedRate);

    const totalSpritesCount = sprites.reduce((sum, s) => sum + s.countOrig + s.countVar, 0);
    const isLargeSpecification = surchargeAmount > 0;
    const hasBulkDiscount = totalSpritesCount >= 10 && !isLargeSpecification;
    const bulkDiscountAmount = hasBulkDiscount ? Math.round(priceBeforeDiscount * 0.25) : 0;
    const finalPriceRub = priceBeforeDiscount - bulkDiscountAmount + surchargeAmount;

    // Prepayment bracket rules: calculated using a logarithmic function, but is exactly 50% on large specifications.
    const prepayPercent = isLargeSpecification ? 50 : calculatePrepaymentPercent(50, finalPriceRub);

    const prepayAmountRub = Math.round(finalPriceRub * (prepayPercent / 100));

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
      totalSpritesCount,
      surchargeAmount
    };
  }, [sprites, speedRate, lang, currency, usdRate]);

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
        templateSize: '16'
      }
    ]);
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
        templateSize
      }
    ]);
  };

  // Remove Sprite Block
  const removeSpriteBlock = (id: number) => {
    if (sprites.length <= 1) {
      // Keep at least one
      return;
    }
    setSprites(prev => prev.filter(s => s.id !== id));
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
  const generateTZ = (autoScroll: boolean = false) => {
    // Check descriptions
    let hasErrors = false;
    sprites.forEach(s => {
      if (!s.description.trim()) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      if (autoScroll) {
        setValidationError(true);
        const firstInvalidElement = document.getElementById('calc-anchored-form');
        if (firstInvalidElement) {
          firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    let hasSizeErrors = sprites.some(s => s.categoryId !== '7' && (s.width > 2000 || s.height > 2000));
    if (hasSizeErrors) {
      if (autoScroll) {
        alert(lang === 'ru' 
          ? 'Превышен максимальный размер (2000px)! Пожалуйста, исправьте значения.' 
          : 'Maximum size exceeded (2000px)! Please correct the values.'
        );
      }
      return;
    }

    setValidationError(false);

    let tzText = t.tzIntro;
    tzText += `==================================================\n\n`;

    orderCalculations.rawItems.forEach(item => {
      if (lang === 'ru') {
        tzText += `Позиция №${item.index}: Категория «${item.categoryName}», размер ${item.sizeInfo}, анимация ${item.frames} ${t.tzFrames}. Количество оригиналов — ${item.countOrig} шт., подвидов — ${item.countVar} шт. Описание задачи: ${item.description}\n\n`;
      } else {
        tzText += `Item #${item.index}: Category is "${item.categoryName}", size is ${item.sizeInfo}, animation consists of ${item.frames} ${t.tzFrames}. Quantity: ${item.countOrig} pcs. of originals, ${item.countVar} pcs. of variants. Project description: ${item.description}\n\n`;
      }
    });

    const queueLabelText = speedRate === 1.25 ? t.tzQueuePriority : t.tzQueueModerate;
    
    tzText += `==================================================\n`;
    if (lang === 'ru') {
      if (orderCalculations.totalSpritesCount > 100) {
        tzText += `Внимание: Слишком много, сократите ТЗ! (Превышен лимит в 100 спрайтов, начислена наценка +1000% на излишек: +${formatPrice(orderCalculations.surchargeAmount)})\n`;
      }
      if (orderCalculations.hasBulkDiscount) {
        tzText += `Внимание: Применена скидка за опт (25%): -${formatPrice(orderCalculations.bulkDiscountAmount)} (уже учтено в итоговой стоимости)\n`;
      }
      tzText += `Условия выполнения заказа: приоритет сроков — «${queueLabelText}». Итоговая стоимость составляет ${formatPrice(orderCalculations.finalPriceRub)}, размер предоплаты (${orderCalculations.prepayPercent}%) равен ${formatPrice(orderCalculations.prepayAmountRub)}.\n`;
    } else {
      if (orderCalculations.totalSpritesCount > 100) {
        tzText += `Warning: Too much, shorten the specification! (Limit of 100 sprites exceeded, a +1000% surcharge has been applied to the excess: +${formatPrice(orderCalculations.surchargeAmount)})\n`;
      }
      if (orderCalculations.hasBulkDiscount) {
        tzText += `Notice: Wholesale discount applied (25%): -${formatPrice(orderCalculations.bulkDiscountAmount)} (already included in the total cost)\n`;
      }
      tzText += `Order terms: queue priority is "${queueLabelText}". The total cost is ${formatPrice(orderCalculations.finalPriceRub)}, with a prepayment (${orderCalculations.prepayPercent}%) of ${formatPrice(orderCalculations.prepayAmountRub)}.\n`;
    }
    tzText += `==================================================\n`;
    tzText += `${t.tzUrlNote}`;

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
      alert(t.generateAlert);
      return;
    }
    navigator.clipboard.writeText(tzOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download TZ as .txt file
  const downloadTZFile = () => {
    if (!tzOutput) {
      alert(t.generateAlert);
      return;
    }

    const blob = new Blob([tzOutput], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TZ_PixelArt_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
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
      {/* Interactive Cursor Glow with Retro Dithering */}
      <InteractiveDitherBackground mousePos={mousePos} />

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
      <header className="max-w-4xl mx-auto text-center px-4 pt-10 pb-12 flex flex-col items-center">
        {/* Avatar Area */}
        <div className="relative group avatar-black-hole transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) hover:scale-115 cursor-pointer">
          <div className="absolute -inset-2 bg-purple-400 rounded-3xl blur-md opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
          <div className="absolute -inset-1.5 bg-[#3d1a56] rounded-2xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-[#2d143f] p-2 rounded-2xl border-4 border-[#180a24] group-hover:border-purple-300 transition-all duration-500 w-36 h-36 flex items-center justify-center overflow-hidden shadow-2xl">
            <img
              src="/src/assets/images/avatar.jpg"
              alt="Village_ Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-all duration-500"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-6 font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#fbf7ff] drop-shadow-[0_2px_10px_rgba(192,132,252,0.3)]">
          Village_
        </h1>
        {/* PriceList Subtitle with a nice RPG styled frame */}
        <div className="mt-2 bg-[#220d33] text-[#ebd6f7] px-6 py-1.5 rounded-lg text-lg font-mono tracking-widest uppercase shadow-sm border border-[#180a24]">
          {t.subtitle}
        </div>

        {/* Beautiful Pixel Artist Description Box */}
        <div className="mt-5 max-w-lg bg-[#2d143f] rounded-2xl border-2 border-[#3d1a56] p-4 text-[#ebd6f7] text-xs sm:text-sm font-semibold relative shadow-md group transition-all duration-300 hover:border-purple-300 hover:shadow-[0_0_25px_rgba(192,132,252,0.15)] select-none">
          <div className="absolute inset-0.5 border border-[#ebd6f7]/5 rounded-xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <p className="leading-relaxed font-sans text-[#ebd6f7] text-center whitespace-pre-line">
              {t.artistDescription}
            </p>
          </div>
        </div>
      </header>

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
                  imagePath={image}
                  catId={cat.id}
                  lang={lang}
                  basePrice={cat.basePrice}
                  pixelPrice={cat.pixelPrice}
                  maxBaseSize={cat.maxBaseSize}
                  formatPrice={formatPrice}
                  exampleSize={example.size}
                  examplePrice={formatPrice(cat.basePrice + (cat.id === '7' ? 0 : 16 * cat.pixelPrice))}
                  isMinecraft={cat.id === '7'}
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
                    <div className="mt-2 text-xs sm:text-sm text-purple-200 leading-relaxed border-l-2 border-purple-400 pl-2 italic transition-all duration-300 group-hover:text-white font-bold">
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
                  <span className="text-[10px] font-mono text-purple-400 font-bold bg-[#1d0c2c] px-1.5 py-0.5 rounded border border-[#3d1a56]/80">
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

            {/* Top Right Controls: Random button & Currency selector */}
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={addRandomSprite}
                className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black text-sm uppercase px-4 py-2.5 rounded-xl border-2 border-[#140620] shadow-[0_2px_8px_rgba(192,132,252,0.2)] hover:shadow-[0_4px_16px_rgba(192,132,252,0.45)] hover:scale-[1.03] transition-all active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{lang === 'ru' ? 'План Сьюзи 🎲' : "Susie's Idea 🎲"}</span>
              </button>

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
            <AnimatePresence initial={false}>
              {sprites.map((sprite, idx) => {
                const calculated = calculateSpritePrice(sprite);
                const blockKey = `sprite-${sprite.id}`;
                const helpOpen = activeHelp[blockKey] || false;
                const activeCat = CATEGORIES_LIST.find(c => c.id === sprite.categoryId) || CATEGORIES_LIST[0];

                return (
                  <motion.div
                    key={sprite.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#2d143f] border-4 border-[#140620] rounded-2xl p-5 sm:p-6 shadow-xl hover:border-purple-300 hover:shadow-[0_0_25px_rgba(192,132,252,0.15)] transition-all duration-300 relative overflow-hidden group"
                  >
                    {/* Inner highlight line inside sprite block */}
                    <div className="absolute inset-1 border border-[#ebd6f7]/5 rounded-xl pointer-events-none"></div>

                    {/* Block Header */}
                    <div className="flex justify-between items-center border-b border-[#ebd6f7]/10 pb-4 mb-5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-bold bg-[#12051d] text-purple-300 px-2.5 py-1 rounded-lg border-2 border-[#3d1a56] shadow-inner">
                          {t.assetCardTitle}{idx + 1}
                        </span>
                        <span className="text-base font-bold text-purple-100 tracking-tight">
                          {lang === 'ru' ? activeCat.nameRu : activeCat.nameEn}
                        </span>
                      </div>
                      
                      {sprites.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpriteBlock(sprite.id)}
                          className="flex items-center gap-1.5 text-sm font-bold text-red-300 hover:text-red-200 bg-[#3a0c14] hover:bg-[#521320] border-2 border-[#140620] px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t.deleteBtn}</span>
                        </button>
                      )}
                    </div>

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
                              className="text-sm font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-[#12051d] hover:bg-[#1c082c] px-2.5 py-1 rounded-lg border border-[#ebd6f7]/15 cursor-pointer transition-all active:scale-95"
                            >
                              <Info className="w-3 h-3" />
                              <span>Formula ?</span>
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
                                        ? 'bg-purple-500 text-white border border-purple-300 shadow-sm'
                                        : 'bg-[#12051d] text-[#ebd6f7]/80 border border-[#3d1a56] hover:bg-[#1a0729] hover:text-white'
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
                                <div className={`flex items-center bg-[#12051d] border-2 rounded-xl overflow-hidden focus-within:border-purple-300 transition-colors h-10 ${sprite.width > 2000 ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#3d1a56]'}`}>
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
                                {sprite.width > 2000 && (
                                  <span className="text-xs font-bold text-red-400 mt-1 block leading-tight">
                                    {lang === 'ru' ? 'недопустимое значение' : 'invalid value'}
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className="block text-xs uppercase font-bold text-[#ebd6f7]/80 mb-1 font-mono">Height</span>
                                <div className={`flex items-center bg-[#12051d] border-2 rounded-xl overflow-hidden focus-within:border-purple-300 transition-colors h-10 ${sprite.height > 2000 ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#3d1a56]'}`}>
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
                                {sprite.height > 2000 && (
                                  <span className="text-xs font-bold text-red-400 mt-1 block leading-tight">
                                    {lang === 'ru' ? 'недопустимое значение' : 'invalid value'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Column 3: Quantity Volumes (Original vs Variation) */}
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
                    </div>

                    {/* Animation Controls (If Category Supports It) */}
                    {activeCat.supportsAnimation && (
                      <div className="mt-5 border-t border-[#ebd6f7]/10 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer mb-3 select-none">
                          <input
                            type="checkbox"
                            checked={sprite.hasAnimation}
                            onChange={(e) => updateSpriteField(sprite.id, 'hasAnimation', e.target.checked)}
                            className="rounded bg-[#12051d] border-[#3d1a56] text-purple-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-[#ebd6f7] hover:text-white transition-colors">
                            {t.addAnimationLabel}
                          </span>
                        </label>

                        {/* Animation inputs section */}
                        <AnimatePresence>
                          {sprite.hasAnimation && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-[#12051d] rounded-xl p-4 border-2 border-[#3d1a56] grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Task Description input (Mandatory) */}
                    <div className="mt-5 pt-4 border-t border-[#ebd6f7]/10">
                      <label className="block text-sm font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex justify-between items-center">
                        <span>{t.taskDescriptionLabel}</span>
                        <span className="text-xs font-mono opacity-70 lowercase">*{t.descRequiredError.split(' ')[0]}</span>
                      </label>
                      <input
                        type="text"
                        value={sprite.description}
                        onChange={(e) => {
                          updateSpriteField(sprite.id, 'description', e.target.value);
                          if (validationError && e.target.value.trim() !== '') {
                            // Clear error banner if now filled
                            setValidationError(false);
                          }
                        }}
                        className={`w-full bg-[#12051d] border-2 rounded-xl px-4 py-2.5 text-sm text-[#fbf7ff] placeholder-[#ebd6f7]/40 focus:outline-none focus:border-purple-300 focus:bg-[#1c082c] transition-all duration-200 ${
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
                      <span className="text-[11px] text-[#ebd6f7]/60 font-mono">
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
              className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black text-sm uppercase py-4 rounded-2xl border-4 border-[#140620] shadow-[0_4px_15px_rgba(192,132,252,0.25)] hover:shadow-[0_4px_25px_rgba(192,132,252,0.45)] hover:scale-[1.005] transition-all active:translate-y-0.5 cursor-pointer animate-pulse-subtle"
            >
              {t.addAssetBtn}
            </button>
          </div>

          {/* Global Order parameters */}
          <div className="mt-12 bg-[#1a0729] rounded-2xl p-6 border-4 border-[#140620] relative overflow-hidden shadow-lg z-10">
            {/* Subtle internal grid border for global parameters */}
            <div className="absolute inset-1 border border-[#ebd6f7]/5 rounded-xl pointer-events-none"></div>

            <h3 className="font-display text-lg font-bold tracking-tight text-purple-300 mb-4 flex items-center gap-2 relative z-10">
              <Settings className="w-5 h-5 text-purple-300" />
              <span>{t.globalParamsTitle}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end relative z-10">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-[#ebd6f7]/75 mb-1.5 flex items-center gap-1">
                  <span>{t.queueUrgency}</span>
                </label>
                <select
                  value={speedRate.toString()}
                  onChange={(e) => setSpeedRate(parseFloat(e.target.value) || 1.0)}
                  className="w-full bg-[#12051d] border-2 border-[#3d1a56] rounded-xl px-4 py-3 text-sm text-[#fbf7ff] font-bold focus:outline-none focus:border-purple-300 cursor-pointer"
                >
                  <option value="1.0">{t.moderateQueue}</option>
                  <option value="1.25">{t.priorityQueue}</option>
                </select>

                <div className="mt-3 bg-black/20 p-3 rounded-xl border border-white/5 text-xs sm:text-sm text-[#ebd6f7]/70 leading-relaxed font-medium">
                  <strong className="text-purple-300">{t.speedHelpTitle}</strong>
                  <p className="mt-1 font-sans text-[#ebd6f7]/90 font-semibold">
                    {speedRate === 1.0 ? t.speedHelpModerate : t.speedHelpPriority}
                  </p>
                </div>
              </div>

              {/* Reveal math logs btn */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowLog(!showLog)}
                  className="bg-[#12051d] hover:bg-[#1a0729] text-purple-300 text-sm font-mono border border-[#3d1a56] px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold shadow-inner"
                >
                  {t.calculationLogBtn} {showLog ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Price Calculations output breakdown logs */}
            <AnimatePresence>
              {showLog && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 border-t border-[#ebd6f7]/10 pt-5 text-sm font-mono space-y-4 overflow-hidden"
                >
                  <div className="text-purple-300 font-bold uppercase text-xs tracking-wider mb-2">
                    {t.calculationLogHeader}
                  </div>
                  <div className="bg-[#12051d] rounded-xl p-4 border border-[#3d1a56] text-[#ebd6f7]/90 max-h-72 overflow-y-auto leading-relaxed space-y-3 shadow-inner">
                    {orderCalculations.itemsLogs.map((logLine, logIdx) => (
                      <div key={logIdx} className="border-b border-white/5 pb-3 last:border-0 last:pb-0 whitespace-pre-wrap">
                        {logLine}
                      </div>
                    ))}
                    <div className="pt-3 border-t border-white/10 text-purple-300 font-bold space-y-1">
                      <div>{lang === 'ru' ? 'Сумма позиций:' : 'Sum of items:'} {formatPrice(orderCalculations.baseTotalRounded)}</div>
                      <div>{lang === 'ru' ? 'Множитель очереди:' : 'Queue rate multiplier:'} ×{speedRate}</div>
                      {orderCalculations.hasBulkDiscount && (
                        <div className="text-emerald-400 font-extrabold animate-pulse">
                          {lang === 'ru' ? 'Скидка за опт (25%):' : 'Wholesale discount (25%):'} -{formatPrice(orderCalculations.bulkDiscountAmount)}
                        </div>
                      )}
                      {orderCalculations.surchargeAmount > 0 && (
                        <div className="text-rose-400 font-extrabold animate-pulse">
                          {lang === 'ru' ? 'Наценка за превышение лимита (+1000%):' : 'Over-limit surcharge (+1000%):'} +{formatPrice(orderCalculations.surchargeAmount)}
                        </div>
                      )}
                      <div>{lang === 'ru' ? 'Итого:' : 'Grand Total:'} {formatPrice(orderCalculations.finalPriceRub)}</div>
                      {currency === 'usd' && (
                        <div className="text-stone-400 mt-1.5 font-semibold text-xs leading-relaxed border-t border-white/5 pt-1.5">
                          {lang === 'ru' ? 'Конвертация:' : 'Conversion:'} {orderCalculations.finalPriceRub} RUB / {usdRate} = {formatPrice(orderCalculations.finalPriceRub)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Limit Warning Alert */}
            {orderCalculations.totalSpritesCount > 100 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 bg-[#2d0f19] border-2 border-rose-500/30 rounded-2xl p-5 text-left relative overflow-hidden z-10 flex items-start gap-3.5 shadow-lg"
              >
                <div className="bg-rose-500/20 text-rose-400 p-2.5 rounded-xl border border-rose-500/30 animate-pulse shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div>
                  <h4 className="text-rose-400 font-bold text-sm uppercase tracking-wider mb-1">
                    {lang === 'ru' ? 'Слишком много, сократите ТЗ!' : 'Too much, shorten the specification!'}
                  </h4>
                  <p className="text-stone-300 text-xs leading-relaxed font-sans">
                    {lang === 'ru' 
                      ? `Внимание: Вы превысили оптимальный лимит в 100 спрайтов (всего в ТЗ: ${orderCalculations.totalSpritesCount}). На все последующие позиции действует наценка в +1000% (+${formatPrice(orderCalculations.surchargeAmount)}).`
                      : `Notice: You have exceeded the optimal limit of 100 sprites (total in spec: ${orderCalculations.totalSpritesCount}). A +1000% surcharge is active for all subsequent positions (+${formatPrice(orderCalculations.surchargeAmount)}).`
                    }
                  </p>
                </div>
              </motion.div>
            )}

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
                <div className="flex items-baseline gap-2.5 justify-center">
                  {orderCalculations.hasBulkDiscount && (
                    <span className="text-base font-bold text-[#ebd6f7]/50 line-through font-mono">
                      {formatPrice(orderCalculations.priceBeforeDiscount)}
                    </span>
                  )}
                  <div className="text-3xl font-display font-black text-purple-300 font-mono">
                    {formatPrice(orderCalculations.finalPriceRub)}
                  </div>
                </div>
              </div>

              <div className="bg-[#12051d] p-5 rounded-2xl border-2 border-[#3d1a56] shadow-inner relative overflow-hidden">
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                  </span>
                  {lang === 'ru' ? 'Прогресс оптовой скидки (25%):' : 'Wholesale Discount Progress (25%):'}
                </span>
                <span className="text-sm font-bold font-mono text-purple-300">
                  {orderCalculations.totalSpritesCount} / 10 {lang === 'ru' ? 'ассетов' : 'assets'}
                </span>
              </div>
              
              <div className="w-full bg-[#241135] h-3.5 rounded-full border border-[#3d1a56] p-0.5 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (orderCalculations.totalSpritesCount / 10) * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full shadow-[0_0_10px_rgba(192,132,252,0.5)]"
                />
              </div>

              <div className="mt-3 text-sm font-bold text-center">
                {orderCalculations.hasBulkDiscount ? (
                  <span className="text-emerald-400 font-extrabold flex items-center justify-center gap-1">
                    🎉 {lang === 'ru' ? 'Максимальная скидка 25% успешно применена!' : 'Maximum 25% discount successfully applied!'}
                  </span>
                ) : orderCalculations.surchargeAmount > 0 ? (
                  <span className="text-rose-400">
                    ⚠️ {lang === 'ru' ? 'Оптовая скидка отключена при превышении лимита 100 спрайтов!' : 'Wholesale discount is disabled when exceeding the limit of 100 sprites!'}
                  </span>
                ) : (
                  <span className="text-purple-300">
                    {lang === 'ru' 
                      ? `До скидки нужно ещё ${10 - orderCalculations.totalSpritesCount} спрайтов/категорий` 
                      : `You need ${10 - orderCalculations.totalSpritesCount} more sprites/categories to get the discount`
                    }
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Technical specification output area */}
          <div className="mt-12 pt-8 border-t-2 border-[#ebd6f7]/10 relative z-10">
            <div className="flex flex-col gap-4 mb-6">
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#ead6cd] flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-300" />
                <span>{t.specificationTitle}</span>
              </h3>

              {/* Copy and download spec btns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => generateTZ(true)}
                  className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm uppercase px-4 py-3 rounded-xl border-2 border-[#140620] transition-all cursor-pointer active:scale-95 shadow flex items-center justify-center gap-1.5 h-12 animate-none"
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
                <div className="relative w-full">
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
        </div>
      </section>

      {/* Floating Scroll to Calculator Button */}
      <AnimatePresence>
        {showScrollBtn && (
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
      </AnimatePresence>
    </div>
  );
}
