import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Layers, Flame, Settings } from 'lucide-react';
import { TotalComplexityDitherNebula } from './TotalComplexityDitherNebula';
import { PixelParticles } from './AnimationComplexitySelection';
import { getQualityPoints } from '../types';

interface CalculatedState {
  totalComplexity: number;
  complexityCategory: string;
  detailLevel: 'simple' | 'moderate' | 'detailed';
  dimensionalComplexity: number;
  animComplexity: 'simple' | 'medium' | 'complex';
  baseTotalComplexity: number;
  totalComplexityMultiplier: number;
  framePoints?: number;
  frames?: number;
}

interface SpriteState {
  id: number;
  hasAnimation: boolean;
  designMode?: 'reference' | 'scratch';
  styleMode?: 'free' | 'specific';
  styleName?: string;
  isometry?: boolean;
  categoryId: string;
  skinType?: string;
}

interface TotalComplexityCardProps {
  calculated: CalculatedState;
  sprite: SpriteState;
  lang: 'ru' | 'en';
}

export function TotalComplexityCard({ calculated, sprite, lang }: TotalComplexityCardProps) {
  const complexity = calculated.totalComplexity;

  // Determine complexity ranges & configuration dynamically
  const getConfig = (comp: number) => {
    if (comp > 100) {
      return {
        barColor: 'from-red-600 via-rose-500 to-red-500 animate-pulse',
        bgGlow: 'rgba(239, 68, 68, 0.35)',
        glowColor: 'rgba(239, 68, 68, 0.45)',
        glowBorder: 'rgba(239, 68, 68, 0.4)',
        glowBorderActive: 'rgba(248, 113, 113, 0.7)',
        textColor: 'text-red-400 font-black tracking-widest uppercase animate-pulse',
        labelEn: 'Maximum',
        labelRu: 'Максимальная',
        descEn: 'You have exceeded complexity limits! Now each complexity point adds 100% to the order cost! It is strongly discouraged to order above 100 complexity!',
        descRu: 'Вы превысили лимиты сложности, теперь каждое очко сложности прибавляет 100% к стоимости заказа! Крайне не рекомендуется заказывать выше 100 сложности!',
        IconComponent: Settings,
        gradientBg: 'linear-gradient(270deg, rgba(239, 68, 68, 0.45) 0%, rgba(244, 63, 94, 0.22) 50%, rgba(239, 68, 68, 0.05) 80%, transparent 100%)',
        colorHex: '#ef4444',
        glowSizes: { s1: '28px', s2: '8px', s3: '64px', s4: '16px' },
      };
    } else if (comp > 85) {
      return {
        barColor: 'from-violet-600 via-fuchsia-500 to-pink-500',
        bgGlow: 'rgba(168, 85, 247, 0.25)',
        glowColor: 'rgba(139, 92, 246, 0.3)',
        glowBorder: 'rgba(139, 92, 246, 0.3)',
        glowBorderActive: 'rgba(217, 70, 239, 0.65)',
        textColor: 'text-violet-400 font-extrabold',
        labelEn: 'Extreme',
        labelRu: 'Экстремальная',
        descEn: 'Maximum density professional rendering.',
        descRu: 'Премиальный уровень детализации высокой плотности.',
        IconComponent: Flame,
        gradientBg: 'linear-gradient(270deg, rgba(139, 92, 246, 0.38) 0%, rgba(217, 70, 239, 0.18) 50%, rgba(139, 92, 246, 0.03) 75%, transparent 100%)',
        colorHex: '#8b5cf6',
        glowSizes: { s1: '22px', s2: '7px', s3: '50px', s4: '14px' },
      };
    } else if (comp > 70) {
      return {
        barColor: 'from-fuchsia-500 to-pink-500',
        bgGlow: 'rgba(217, 70, 239, 0.22)',
        glowColor: 'rgba(217, 70, 239, 0.25)',
        glowBorder: 'rgba(217, 70, 239, 0.25)',
        glowBorderActive: 'rgba(244, 114, 182, 0.55)',
        textColor: 'text-fuchsia-400',
        labelEn: 'Complex',
        labelRu: 'Сложная',
        descEn: 'High-fidelity cinematic shading & shapes.',
        descRu: 'Высокодетализированные тени и формы.',
        IconComponent: Flame,
        gradientBg: 'linear-gradient(270deg, rgba(217, 70, 239, 0.3) 0%, rgba(168, 85, 247, 0.12) 50%, rgba(217, 70, 239, 0.03) 75%, transparent 100%)',
        colorHex: '#d946ef',
        glowSizes: { s1: '16px', s2: '6px', s3: '38px', s4: '10px' },
      };
    } else if (comp > 50) {
      return {
        barColor: 'from-amber-500 to-orange-500',
        bgGlow: 'rgba(245, 158, 11, 0.15)',
        glowColor: 'rgba(245, 158, 11, 0.18)',
        glowBorder: 'rgba(245, 158, 11, 0.2)',
        glowBorderActive: 'rgba(251, 191, 36, 0.45)',
        textColor: 'text-amber-400',
        labelEn: 'Moderate',
        labelRu: 'Умеренная',
        descEn: 'Detailed volume, shapes, and textures.',
        descRu: 'Проработка объёма, формы и текстуры.',
        IconComponent: Layers,
        gradientBg: 'linear-gradient(270deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 60%, transparent 100%)',
        colorHex: '#f59e0b',
        glowSizes: { s1: '12px', s2: '4px', s3: '26px', s4: '8px' },
      };
    } else if (comp > 30) {
      return {
        barColor: 'from-yellow-500 to-amber-400',
        bgGlow: 'rgba(234, 179, 8, 0.15)',
        glowColor: 'rgba(234, 179, 8, 0.18)',
        glowBorder: 'rgba(234, 179, 8, 0.2)',
        glowBorderActive: 'rgba(250, 204, 21, 0.45)',
        textColor: 'text-yellow-400',
        labelEn: 'Medium',
        labelRu: 'Средняя',
        descEn: 'Medium volume and shading.',
        descRu: 'Средняя проработка объёма и теней.',
        IconComponent: Layers,
        gradientBg: 'linear-gradient(270deg, rgba(234, 179, 8, 0.25) 0%, rgba(234, 179, 8, 0.05) 60%, transparent 100%)',
        colorHex: '#eab308',
        glowSizes: { s1: '10px', s2: '3px', s3: '22px', s4: '7px' },
      };
    } else if (comp > 15) {
      return {
        barColor: 'from-cyan-500 to-sky-400',
        bgGlow: 'rgba(6, 182, 212, 0.12)',
        glowColor: 'rgba(6, 182, 212, 0.14)',
        glowBorder: 'rgba(6, 182, 212, 0.15)',
        glowBorderActive: 'rgba(34, 211, 238, 0.35)',
        textColor: 'text-cyan-400',
        labelEn: 'Optimal',
        labelRu: 'Оптимальная',
        descEn: 'Standard professional detailing.',
        descRu: 'Стандартная профессиональная детализация.',
        IconComponent: Layers,
        gradientBg: 'linear-gradient(270deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.04) 60%, transparent 100%)',
        colorHex: '#06b6d4',
        glowSizes: { s1: '8px', s2: '3px', s3: '18px', s4: '6px' },
      };
    } else {
      return {
        barColor: 'from-emerald-500 to-teal-400',
        bgGlow: 'rgba(16, 185, 129, 0.08)',
        glowColor: 'rgba(16, 185, 129, 0.1)',
        glowBorder: 'rgba(16, 185, 129, 0.12)',
        glowBorderActive: 'rgba(52, 211, 153, 0.28)',
        textColor: 'text-emerald-400',
        labelEn: 'Low',
        labelRu: 'Низкая',
        descEn: 'Optimized and clean pixel detailing.',
        descRu: 'Оптимальная и чистая пиксельная детализация.',
        IconComponent: Sparkles,
        gradientBg: 'linear-gradient(270deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.03) 60%, transparent 100%)',
        colorHex: '#10b981',
        glowSizes: { s1: '6px', s2: '2px', s3: '12px', s4: '4px' },
      };
    }
  };

  const config = getConfig(complexity);
  const percentage = Math.min(100, (complexity / 100) * 100);

  // Dynamic stretch from right to left based on complexity
  const gradientWidthPercent = Math.min(100, 20 + (complexity / 100) * 80);

  const label = lang === 'ru' ? config.labelRu : config.labelEn;
  const desc = lang === 'ru' ? config.descRu : config.descEn;
  const IconComponent = config.IconComponent;

  const isImpossible = complexity > 100;
  const cardBgClass = isImpossible 
    ? 'bg-black border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.25)]' 
    : 'bg-[#12051d]/45 border-purple-500/20';

  return (
    <div id="tour-pts-bar" className="w-full relative">
      <style>{`
        @keyframes complexityCardPulseGlow {
          0%, 100% {
            box-shadow: 0 4px var(--g-size-1) var(--g-color), inset 0 1px 1px 0 rgba(255,255,255,0.04);
            border-color: var(--g-border);
          }
          50% {
            box-shadow: 0 8px var(--g-size-3) var(--g-color), inset 0 1px 2px 0 rgba(255,255,255,0.07);
            border-color: var(--g-border-active);
          }
        }
        .animate-complexity-card-glow {
          animation: complexityCardPulseGlow 3.5s ease-in-out infinite;
        }
      `}</style>

      <div
        style={{
          '--g-color': config.glowColor,
          '--g-border': config.glowBorder,
          '--g-border-active': config.glowBorderActive,
          '--g-size-1': config.glowSizes.s1,
          '--g-size-2': config.glowSizes.s2,
          '--g-size-3': config.glowSizes.s3,
          '--g-size-4': config.glowSizes.s4,
        } as React.CSSProperties}
        className={`mt-5 p-5 rounded-2xl border transition-all duration-700 relative overflow-hidden w-full animate-complexity-card-glow ${cardBgClass}`}
      >
        {/* Decorative micro corners for grid style terminal look */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-white/10 pointer-events-none z-10" />
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-white/10 pointer-events-none z-10" />
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-white/10 pointer-events-none z-10" />
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-white/10 pointer-events-none z-10" />

        {/* Dynamic sliding color gradient from the right */}
        <div
          className="absolute right-0 top-0 bottom-0 pointer-events-none transition-all duration-1000 ease-out z-0"
          style={{
            width: `${gradientWidthPercent}%`,
            background: config.gradientBg,
          }}
        />

        {/* Dynamic real-time canvas retro dither shader */}
        <TotalComplexityDitherNebula complexity={complexity} />

        {/* Interactive Transition Layout */}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-950/45 border border-purple-400/30 text-purple-200">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-black uppercase tracking-widest text-purple-100 block drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
                      {lang === 'ru' ? 'Степень сложности' : 'Complexity Degree'}
                    </span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={label}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className={`font-display font-black text-sm uppercase tracking-wider block drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.9)] ${config.textColor}`}
                      >
                        {label}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                <div id="tour-pts-value" className="text-left sm:text-right shrink-0">
                  <span className="font-mono font-black text-2xl text-white leading-none block drop-shadow-[0_2px_6px_rgba(0,0,0,1)]">
                    {complexity} <span className="text-xs font-bold text-purple-100">{lang === 'ru' ? 'очков' : 'pts'}</span>
                  </span>
                </div>
              </div>

              {/* Glowing pixel progress bar */}
              <div className="mt-4">
                <div className="h-2.5 bg-[#090210]/95 rounded-full border border-purple-500/20 relative overflow-hidden shadow-inner w-full">
                  <div
                    className={`h-full bg-gradient-to-r ${config.barColor} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 px-0.5 gap-2">
                  <span className="shrink-0 text-white font-mono font-black text-xs bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-400/30 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">0</span>
                  <span className="text-center font-sans font-bold text-xs sm:text-sm text-white leading-normal drop-shadow-[0_1.5px_3px_rgba(0,0,0,1)] max-w-[80%]">
                    {desc}
                  </span>
                  <span className="shrink-0 text-white font-mono font-black text-xs bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-400/30 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">100</span>
                </div>
              </div>

              {/* Breakdown pill tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3.5 border-t border-[#ebd6f7]/15">
                {sprite.categoryId === '7' && (
                  <span className="text-xs font-mono font-extrabold bg-purple-950/90 text-purple-100 border border-purple-400/60 px-2.5 py-1 rounded-full shadow-[0_2px_12px_rgba(168,85,247,0.25)] transition-all drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                    {lang === 'ru' ? `Скин ${sprite.skinType === '2' ? '128x128 HD' : '64x64'}` : `Skin ${sprite.skinType === '2' ? '128x128 HD' : '64x64'}`}
                  </span>
                )}
                {getQualityPoints(sprite.categoryId, calculated.detailLevel) > 0 && (
                  <span className="text-xs font-mono font-extrabold bg-emerald-950/90 text-emerald-100 border border-emerald-400/60 px-2.5 py-1 rounded-full shadow-[0_2px_12px_rgba(16,185,129,0.25)] transition-all drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                    {lang === 'ru' ? `Детализация: +${getQualityPoints(sprite.categoryId, calculated.detailLevel)}` : `Detailing: +${getQualityPoints(sprite.categoryId, calculated.detailLevel)}`}
                  </span>
                )}
                {sprite.hasAnimation && (
                  <span className="text-xs font-mono font-extrabold bg-cyan-950/90 text-cyan-100 border border-cyan-400/60 px-2.5 py-1 rounded-full shadow-[0_2px_12px_rgba(6,182,212,0.25)] transition-all drop-shadow-[0_2px_12px_rgba(6,182,212,0.25)] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                    {lang === 'ru'
                      ? `Анимация (${calculated.animComplexity === 'complex' ? '1.0' : calculated.animComplexity === 'medium' ? '0.5' : '0.25'} pts/кадр): +${calculated.framePoints ?? 0}`
                      : `Animation (${calculated.animComplexity === 'complex' ? '1.0' : calculated.animComplexity === 'medium' ? '0.5' : '0.25'} pts/frame): +${calculated.framePoints ?? 0}`}
                  </span>
                )}
                {calculated.dimensionalComplexity > 0 && (
                  <span className="text-xs font-mono font-extrabold bg-sky-950/90 text-sky-100 border border-sky-400/60 px-2.5 py-1 rounded-full shadow-[0_2px_12px_rgba(14,165,233,0.25)] transition-all drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                    {lang === 'ru' ? `Размеры: +${calculated.dimensionalComplexity}` : `Dimensions: +${calculated.dimensionalComplexity}`}
                  </span>
                )}
                {sprite.styleMode === 'specific' && (
                  <span className="text-xs font-mono font-extrabold bg-purple-950/90 text-purple-100 border border-purple-400/60 px-2.5 py-1 rounded-full shadow-[0_2px_12px_rgba(168,85,247,0.25)] transition-all drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                    {lang === 'ru' ? `Стиль (+25% сложн.): ${sprite.styleName || 'Определённый'}` : `Style (+25% comp.): ${sprite.styleName || 'Specific'}`}
                  </span>
                )}
                {sprite.designMode === 'scratch' && (
                  <span className="text-xs font-mono font-extrabold bg-amber-950/90 text-amber-100 border border-amber-400/60 px-2.5 py-1 rounded-full shadow-[0_2px_12px_rgba(245,158,11,0.25)] transition-all drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                    {lang === 'ru' ? 'Дизайн с нуля (+25% к цене)' : 'Scratch (+25% price)'}
                  </span>
                )}
                {sprite.isometry && (
                  <span className="text-xs font-mono font-extrabold bg-fuchsia-950/90 text-fuchsia-100 border border-fuchsia-400/60 px-2.5 py-1 rounded-full shadow-[0_2px_12px_rgba(217,70,239,0.25)] transition-all drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]">
                    {lang === 'ru' ? 'Объёмная перспектива (+50% сложн.)' : 'Volumetric Perspective (+50% comp.)'}
                  </span>
                )}
              </div>
        </div>

        {/* Ambient floating pixels matching current theme color */}
        <PixelParticles
          active={true}
          rate={complexity > 50 ? 'frequent' : 'rare'}
          color={config.colorHex}
        />
      </div>
    </div>
  );
}
