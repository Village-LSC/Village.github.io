import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Coins,
  Layers,
  Flame,
  HelpCircle,
  Percent,
  Calculator,
  Clock,
  Sparkles,
  Zap,
  Box,
  Palette
} from 'lucide-react';

interface CalculationLogProps {
  lang: 'ru' | 'en';
  orderCalculations: any;
  CATEGORIES_LIST: any[];
  formatPrice: (val: number) => string;
}

export function CalculationLog({ lang, orderCalculations, CATEGORIES_LIST, formatPrice }: CalculationLogProps) {
  // Main toggle for collapsing/expanding the entire log container
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  
  // Internal view mode: 'simple' (brief) vs 'detailed' (full step-by-step breakdown)
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('detailed');
  
  // Accordion expanded state per item in simple mode
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});
  
  // Toggle rule info drawer
  const [showRulesExplanation, setShowRulesExplanation] = useState<boolean>(false);

  const toggleItem = (idx: number) => {
    setExpandedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isRu = lang === 'ru';

  return (
    <div className="w-full space-y-4">
      {/* Main Trigger Button: Collapsed by Default as requested */}
      <div className="flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={() => setIsLogOpen(prev => !prev)}
          className={`w-full max-w-2xl px-6 py-4.5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer shadow-xl active:scale-[0.99] group ${
            isLogOpen
              ? 'bg-[#240b36] border-purple-400 text-white shadow-[0_0_25px_rgba(192,132,252,0.3)]'
              : 'bg-[#1a0729] border-[#3d1a56] hover:border-purple-400/60 text-[#ebd6f7] hover:bg-[#220a35]'
          }`}
        >
          <div className="flex items-center gap-3.5 text-left">
            <div className={`p-3 rounded-xl border transition-colors ${
              isLogOpen 
                ? 'bg-purple-600 text-white border-purple-300' 
                : 'bg-purple-950/60 text-purple-300 border-purple-500/30 group-hover:bg-purple-900/50'
            }`}>
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-white flex items-center gap-2">
                <span>{isRu ? 'Лог расчётов стоимости' : 'Price Calculation Log'}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#ebd6f7]/80 mt-0.5 font-medium">
                {isRu 
                  ? 'Подробная математика, формулы и коэффициенты по каждой позиции ТЗ' 
                  : 'Detailed math, formulas, and multipliers for every specification item'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-[#ebd6f7]/60 block font-mono">{isRu ? 'Итого:' : 'Total:'}</span>
              <span className="font-black font-mono text-purple-200 text-base sm:text-lg">
                {formatPrice(orderCalculations.finalPriceRub)}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl bg-[#12051d] border border-[#3d1a56] text-purple-300 transition-transform duration-300 ${isLogOpen ? 'rotate-180 bg-purple-900/40 text-white' : ''}`}>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </button>
      </div>

      {/* Expanded Log Content */}
      <AnimatePresence>
        {isLogOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-[#140620] border-2 border-[#3d1a56] rounded-3xl p-4 sm:p-7 shadow-2xl space-y-6 mt-2 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

              {/* View Mode Toggle Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#3d1a56] pb-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-fuchsia-400" />
                    <span>{isRu ? 'Математическая расшифровка расчёта' : 'Full Mathematical Breakdown'}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#ebd6f7]/80 mt-1">
                    {isRu 
                      ? 'Полная выкладка формул, очков сложности и наценок' 
                      : 'Complete breakdown of formulas, complexity points, and markups'}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#12051d] p-1.5 rounded-2xl border border-[#3d1a56] w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode('simple')}
                    className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      viewMode === 'simple'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-[#ebd6f7]/70 hover:text-white hover:bg-purple-900/30'
                    }`}
                  >
                    {isRu ? 'Упрощённый' : 'Simple'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('detailed')}
                    className={`flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      viewMode === 'detailed'
                        ? 'bg-fuchsia-600 text-white shadow-lg'
                        : 'text-[#ebd6f7]/70 hover:text-white hover:bg-fuchsia-900/30'
                    }`}
                  >
                    {isRu ? 'Проработанный' : 'Detailed'}
                  </button>
                </div>
              </div>

              {/* Toggle Logic & Rules Guide Banner */}
              <div className="bg-[#1c082b] border border-[#3d1a56] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-4">
                <button
                  type="button"
                  onClick={() => setShowRulesExplanation(prev => !prev)}
                  className="w-full flex items-center justify-between text-left text-purple-200 font-bold hover:text-white transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-5 h-5 text-fuchsia-400 shrink-0" />
                    <span>{isRu ? 'Справочник правил, формул и таблиц (Изометрия, Дизайн с нуля, Предоплата)' : 'Rules, Formulas & Reference Tables (Isometric, Scratch Design, Prepayment)'}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showRulesExplanation ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showRulesExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-[#3d1a56] space-y-6 text-[#ebd6f7]/90 font-sans leading-relaxed text-xs sm:text-sm"
                    >
                      {/* 1. Core Principles Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="bg-[#12051d] p-3.5 rounded-xl border border-[#3d1a56]/80 space-y-1.5">
                          <span className="font-bold text-fuchsia-300 text-xs sm:text-sm flex items-center gap-1.5">
                            <Box className="w-4 h-4 text-fuchsia-400" />
                            {isRu ? '1. Базовая цена и размеры' : '1. Base Price & Resolution'}
                          </span>
                          <p>{isRu ? 'У каждой категории (Оружие, Персонажи, Иконки) есть минимальный базовый тариф. При разрешении меньше стандартного цена снижается до -80%.' : 'Each category has a base rate. Resolutions smaller than standard receive dynamic discounts up to -80%.'}</p>
                        </div>

                        <div className="bg-[#12051d] p-3.5 rounded-xl border border-[#3d1a56]/80 space-y-1.5">
                          <span className="font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-1.5">
                            <Palette className="w-4 h-4 text-amber-400" />
                            {isRu ? '2. Дизайн с нуля и Изометрия (+50%)' : '2. Scratch Design & Isometric (+50%)'}
                          </span>
                          <p>{isRu ? 'Разработка нового дизайна без референсов (+50%) и Изометрический вид (+50%) умножают итоговые очки сложности в 1.5–2.0 раза.' : 'Creating design without reference (+50%) and Isometric projection (+50%) apply 1.5x–2.0x multipliers to complexity score.'}</p>
                        </div>

                        <div className="bg-[#12051d] p-3.5 rounded-xl border border-[#3d1a56]/80 space-y-1.5">
                          <span className="font-bold text-purple-300 text-xs sm:text-sm flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-purple-400" />
                            {isRu ? '3. Детализация и кадры анимации' : '3. Detail Level & Animation'}
                          </span>
                          <p>{isRu ? 'Очки сложности зависят от проработки деталей (до +20 pts), стиля анимации (до +10 pts) и деления количества кадров (каждые 2/4/6 кадров = +1 pt).' : 'Complexity points account for details (up to +20 pts), animation style (up to +10 pts), and frame dividers.'}</p>
                        </div>

                        <div className="bg-[#12051d] p-3.5 rounded-xl border border-[#3d1a56]/80 space-y-1.5">
                          <span className="font-bold text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                            <Coins className="w-4 h-4 text-emerald-400" />
                            {isRu ? '4. Вариации (50%) и Опт' : '4. Variations (50%) & Bulk'}
                          </span>
                          <p>{isRu ? 'Вариации стоят ровно 50% от стоимости оригинала. Накопительные скидки на заказ: 1-10 шт (0%), 11-50 шт (-25%), >50 шт (-50%).' : 'Variations cost 50% of original. Progressive volume discounts: 1-10 (0%), 11-50 (-25%), 50+ (-50%).'}</p>
                        </div>
                      </div>

                      {/* 2. Task Multipliers Table */}
                      <div className="bg-[#12051d] p-4 rounded-2xl border border-[#3d1a56] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#3d1a56] pb-2">
                          <span className="font-extrabold text-amber-300 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            {isRu ? 'Множители типа задачи (Дизайн с нуля / Изометрия)' : 'Task Mode Multipliers (Scratch / Isometric)'}
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-[#3d1a56] text-purple-300 font-bold uppercase text-xs">
                                <th className="p-2.5">{isRu ? 'Параметр' : 'Parameter'}</th>
                                <th className="p-2.5">{isRu ? 'Настройка' : 'Setting'}</th>
                                <th className="p-2.5">{isRu ? 'Коэффициент' : 'Multiplier'}</th>
                                <th className="p-2.5">{isRu ? 'Эффект' : 'Effect'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3d1a56]/40 text-[#ebd6f7]">
                              <tr className="hover:bg-purple-900/20">
                                <td className="p-2.5 font-bold">{isRu ? 'Разработка' : 'Design Mode'}</td>
                                <td className="p-2.5 text-stone-300">{isRu ? 'По референсу' : 'From Reference'}</td>
                                <td className="p-2.5 text-purple-300 font-bold">1.0×</td>
                                <td className="p-2.5 text-stone-400">{isRu ? 'Базовый расчёт' : 'Standard rate'}</td>
                              </tr>
                              <tr className="hover:bg-purple-900/20">
                                <td className="p-2.5 font-bold">{isRu ? 'Разработка' : 'Design Mode'}</td>
                                <td className="p-2.5 text-amber-300 font-bold">{isRu ? 'Дизайн с нуля' : 'From Scratch'}</td>
                                <td className="p-2.5 text-amber-300 font-bold">1.5× (+50%)</td>
                                <td className="p-2.5 text-amber-200/80">{isRu ? 'Разработка концепта и формы' : 'Concept creation'}</td>
                              </tr>
                              <tr className="hover:bg-purple-900/20">
                                <td className="p-2.5 font-bold">{isRu ? 'Проекция' : 'Projection'}</td>
                                <td className="p-2.5 text-purple-300 font-bold">{isRu ? 'Изометрия (3D view)' : 'Isometric'}</td>
                                <td className="p-2.5 text-purple-300 font-bold">1.5× (+50%)</td>
                                <td className="p-2.5 text-purple-200/80">{isRu ? 'Перспектива и 3 плоскости' : '3D plane perspective'}</td>
                              </tr>
                              <tr className="bg-fuchsia-950/30 hover:bg-fuchsia-900/40 font-bold">
                                <td className="p-2.5 text-fuchsia-300">{isRu ? 'Комбо' : 'Combo'}</td>
                                <td className="p-2.5 text-fuchsia-300">{isRu ? 'С нуля + Изометрия' : 'Scratch + Isometric'}</td>
                                <td className="p-2.5 text-fuchsia-300 font-black">2.0× (+100%)</td>
                                <td className="p-2.5 text-fuchsia-200">{isRu ? 'Удвоение очков сложности' : 'Doubled complexity score'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 3. Prepayment Scale Table */}
                      <div className="bg-[#12051d] p-4 rounded-2xl border border-[#3d1a56] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#3d1a56] pb-2">
                          <span className="font-extrabold text-amber-300 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                            <Percent className="w-4 h-4 text-amber-400" />
                            {isRu ? 'Таблица шкалы предоплаты' : 'Prepayment Scale Table'}
                          </span>
                          <span className="text-xs sm:text-sm font-mono text-purple-300">
                            {isRu ? 'Текущий процент:' : 'Current Rate:'} <strong className="text-amber-300 font-bold">{orderCalculations.prepayPercent}%</strong>
                          </span>
                        </div>

                        <p className="text-xs text-[#ebd6f7]/80">
                          {isRu 
                            ? 'Предоплата снижается на 5% за каждые 2000 ₽ суммы заказа по следующей шкале (чтобы крупные заказы требовали меньший начальный взнос):'
                            : 'Prepayment drops by 5% per 2000 RUB order value according to this scale:'}
                        </p>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-[#3d1a56] text-purple-300 font-bold uppercase text-xs">
                                <th className="p-2.5">{isRu ? 'Сумма заказа' : 'Order Total'}</th>
                                <th className="p-2.5">{isRu ? '% Предоплаты' : 'Prepay %'}</th>
                                <th className="p-2.5">{isRu ? 'Взнос с 10 000 ₽' : 'Deposit per 10k'}</th>
                                <th className="p-2.5 text-right">{isRu ? 'Статус' : 'Status'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3d1a56]/40 text-[#ebd6f7]">
                              {[
                                { rangeRu: '0 ₽ – 2 000 ₽', rangeEn: '0 – 2k RUB', pct: 50, min: 0, max: 2000 },
                                { rangeRu: '2 001 ₽ – 4 000 ₽', rangeEn: '2k – 4k RUB', pct: 45, min: 2001, max: 4000 },
                                { rangeRu: '4 001 ₽ – 6 000 ₽', rangeEn: '4k – 6k RUB', pct: 40, min: 4001, max: 6000 },
                                { rangeRu: '6 001 ₽ – 8 000 ₽', rangeEn: '6k – 8k RUB', pct: 35, min: 6001, max: 8000 },
                                { rangeRu: '8 001 ₽ – 10 000 ₽', rangeEn: '8k – 10k RUB', pct: 30, min: 8001, max: 10000 },
                                { rangeRu: '10 001 ₽ – 15 000 ₽', rangeEn: '10k – 15k RUB', pct: 25, min: 10001, max: 15000 },
                                { rangeRu: '15 001 ₽ – 20 000 ₽', rangeEn: '15k – 20k RUB', pct: 20, min: 15001, max: 20000 },
                                { rangeRu: 'Свыше 20 000 ₽', rangeEn: 'Over 20k RUB', pct: 10, min: 20001, max: Infinity }
                              ].map((row, rIdx) => {
                                const isCurrent = orderCalculations.prepayPercent === row.pct || (orderCalculations.finalPriceRub >= row.min && orderCalculations.finalPriceRub <= row.max);
                                return (
                                  <tr key={rIdx} className={`hover:bg-purple-900/20 transition-colors ${isCurrent ? 'bg-amber-950/50 font-bold border-l-4 border-amber-400' : ''}`}>
                                    <td className="p-2.5">{isRu ? row.rangeRu : row.rangeEn}</td>
                                    <td className="p-2.5 text-amber-300 font-bold">{row.pct}%</td>
                                    <td className="p-2.5 text-stone-300">{formatPrice(10000 * (row.pct / 100))}</td>
                                    <td className="p-2.5 text-right">
                                      {isCurrent ? (
                                        <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                                          {isRu ? 'Ваш уровень' : 'Current Order'}
                                        </span>
                                      ) : (
                                        <span className="text-stone-500">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 4. Complexity Score & Surcharge Table */}
                      <div className="bg-[#12051d] p-4 rounded-2xl border border-[#3d1a56] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#3d1a56] pb-2">
                          <span className="font-extrabold text-fuchsia-300 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                            <Layers className="w-4 h-4 text-fuchsia-400" />
                            {isRu ? 'Таблица очков сложности и процентных надбавок' : 'Complexity Score & Surcharge Markup Table'}
                          </span>
                        </div>

                        <p className="text-xs text-[#ebd6f7]/80">
                          {isRu 
                            ? 'Каждая позиция рассчитывает итоговые очки сложности (General Complexity). Ниже показано соответствие очков категории сложности и процентной надбавке к базовой стоимости:'
                            : 'Each item computes General Complexity points. Below is how points convert to difficulty levels and percent markups over category base price:'}
                        </p>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-mono text-xs sm:text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-[#3d1a56] text-purple-300 font-bold uppercase text-xs">
                                <th className="p-2.5">{isRu ? 'Очки (Score)' : 'Points Range'}</th>
                                <th className="p-2.5">{isRu ? 'Категория сложности' : 'Complexity Tier'}</th>
                                <th className="p-2.5">{isRu ? 'Надбавка к базе' : 'Base Surcharge'}</th>
                                <th className="p-2.5">{isRu ? 'Пример (база 1000 ₽)' : 'Example (1000 RUB base)'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3d1a56]/40 text-[#ebd6f7]">
                              {[
                                { pts: '0 – 15 pts', nameRu: 'Низкая', nameEn: 'Low', markup: '+0%', ex: '1 000 ₽' },
                                { pts: '16 – 30 pts', nameRu: 'Оптимальная', nameEn: 'Optimal', markup: '+15%', ex: '1 150 ₽' },
                                { pts: '31 – 50 pts', nameRu: 'Средняя', nameEn: 'Medium', markup: '+35%', ex: '1 350 ₽' },
                                { pts: '51 – 70 pts', nameRu: 'Умеренная', nameEn: 'Moderate', markup: '+55%', ex: '1 550 ₽' },
                                { pts: '71 – 85 pts', nameRu: 'Сложная', nameEn: 'Complex', markup: '+75%', ex: '1 750 ₽' },
                                { pts: '86 – 100 pts', nameRu: 'Экстремальная', nameEn: 'Extreme', markup: '+95%', ex: '1 950 ₽' },
                                { pts: '> 100 pts', nameRu: 'Максимальная', nameEn: 'Maximum', markup: '+100% (+1%/pt)', ex: '2 000 ₽+' }
                              ].map((row, cIdx) => (
                                <tr key={cIdx} className="hover:bg-purple-900/20 transition-colors">
                                  <td className="p-2.5 font-bold text-fuchsia-300">{row.pts}</td>
                                  <td className="p-2.5 text-white">{isRu ? row.nameRu : row.nameEn}</td>
                                  <td className="p-2.5 text-emerald-300 font-bold">{row.markup}</td>
                                  <td className="p-2.5 text-purple-200">{row.ex}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="bg-[#1c082b] p-3 rounded-xl border border-[#3d1a56]/80 text-xs sm:text-sm font-mono text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span>{isRu ? 'Формула надбавки оригинала:' : 'Original Markup Formula:'}</span>
                          <span className="text-amber-300 font-bold">Цена = База × (1 + % Надбавки) × МножительРазработки</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {orderCalculations.rawItems.length === 0 ? (
                  <div className="text-center py-10 text-base text-[#ebd6f7]/50 font-medium">
                    {isRu ? 'В заказе нет позиций.' : 'No items in the order.'}
                  </div>
                ) : (
                  orderCalculations.rawItems.map((item: any, idx: number) => {
                    const isExpanded = expandedItems[idx] || viewMode === 'detailed';
                    const baseCat = CATEGORIES_LIST.find(c => c.id === item.categoryId);
                    const basePrice = baseCat?.basePrice || 0;
                    const hasDiscounts = item.itemBulkDiscountAmount > 0;
                    const hasSurcharges = item.itemSurcharge > 0;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-[#180726] border border-[#3d1a56] rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all shadow-md"
                      >
                        {/* Header Item Banner */}
                        <div
                          onClick={() => viewMode === 'simple' && toggleItem(idx)}
                          className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center ${
                            viewMode === 'simple' ? 'cursor-pointer hover:bg-[#200933]' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="bg-purple-900/60 text-purple-200 font-black text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-purple-500/30 font-mono">
                              #{item.index}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-white font-extrabold text-base sm:text-lg">{item.categoryName}</h4>
                                <span className="text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                                  {item.complexityCategory}
                                </span>
                                {item.designMode === 'scratch' && (
                                  <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                                    {isRu ? 'С нуля (+50%)' : 'Scratch (+50%)'}
                                  </span>
                                )}
                                {item.isometry && (
                                  <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30">
                                    {isRu ? 'Изометрия (+50%)' : 'Isometric (+50%)'}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-[#ebd6f7]/70 font-mono mt-1">
                                {item.countOrig} {isRu ? 'ориг.' : 'orig.'} {item.countVar > 0 && `+ ${item.countVar} ${isRu ? 'вар.' : 'var.'}`}
                                {item.frames > 1 && ` • ${item.frames} ${isRu ? 'кадров' : 'frames'}`}
                                {item.sizeInfo && ` • ${item.sizeInfo}`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[#3d1a56]/50 pt-3 sm:pt-0">
                            <div className="text-right font-mono">
                              {hasDiscounts && (
                                <span className="text-emerald-400 text-xs sm:text-sm font-bold block">
                                  -{formatPrice(item.itemBulkDiscountAmount)} ({isRu ? 'скидка' : 'discount'})
                                </span>
                              )}
                              {hasSurcharges && (
                                <span className="text-rose-400 text-xs sm:text-sm font-bold block">
                                  +{formatPrice(item.itemSurcharge)} ({isRu ? 'наценка' : 'surcharge'})
                                </span>
                              )}
                              <span className="text-lg sm:text-xl font-black text-purple-200">
                                {formatPrice(item.itemFinalPrice)}
                              </span>
                            </div>

                            {viewMode === 'simple' && (
                              <button
                                type="button"
                                className="text-purple-400 hover:text-white transition-colors bg-[#2d143f] p-2.5 rounded-xl"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Detailed Formula Breakdown Drawer */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[#3d1a56]/80 bg-[#11041b]"
                            >
                              <div className="p-4 sm:p-6 space-y-6 text-xs sm:text-sm font-sans">
                                
                                {/* Step-by-Step Explicit Calculation Flow */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  
                                  {/* Left Box: Unit Pricing & Complexity Math */}
                                  <div className="space-y-4 bg-[#1a082b] p-4.5 rounded-xl border border-[#3d1a56]">
                                    <h5 className="text-xs sm:text-sm font-black text-fuchsia-300 uppercase tracking-widest flex items-center gap-2">
                                      <Layers className="w-4 h-4 text-fuchsia-400" />
                                      <span>{isRu ? '1. Расчёт стоимости 1 штуки (Оригинал)' : '1. Unit Math & Complexity Points'}</span>
                                    </h5>

                                    <div className="space-y-2.5 text-[#ebd6f7]/90 text-xs sm:text-sm">
                                      <div className="flex justify-between items-center border-b border-[#3d1a56]/60 pb-1.5">
                                        <span>{isRu ? 'Базовая ставка категории:' : 'Category Base Rate:'}</span>
                                        <span className="font-mono text-white font-bold">{formatPrice(basePrice)}</span>
                                      </div>

                                      {item.baseDiscountPercent > 0 && (
                                        <div className="flex justify-between items-center text-emerald-300 border-b border-[#3d1a56]/60 pb-1.5">
                                          <span>{isRu ? 'Скидка за малый размер:' : 'Small Size Discount:'}</span>
                                          <span className="font-mono font-bold">-{item.baseDiscountPercent}%</span>
                                        </div>
                                      )}

                                      {item.categoryId !== '7' ? (
                                        <div className="space-y-2 pt-1">
                                          <div className="font-bold text-purple-200 flex justify-between items-center">
                                            <span>{isRu ? 'Сумма очков сложности (Score):' : 'Total Complexity Score:'}</span>
                                            <span className="font-mono text-fuchsia-300 font-black text-sm">{item.totalComplexity} pts</span>
                                          </div>

                                          <div className="pl-3.5 space-y-1.5 border-l-2 border-purple-500/40 font-mono text-xs text-[#ebd6f7]/80">
                                            <div className="flex justify-between">
                                              <span>• {isRu ? 'Детализация' : 'Details'} ({item.detailLevel}):</span>
                                              <span>+{item.baseGeneralComplexity - (item.hasAnimation ? (item.animComplexity === 'complex' ? 10 : item.animComplexity === 'medium' ? 5 : 0) + Math.ceil(item.frames / (item.animComplexity === 'complex' ? 2 : item.animComplexity === 'medium' ? 4 : 6)) : 0)} pts</span>
                                            </div>

                                            {item.hasAnimation && (
                                              <div className="flex justify-between text-amber-300">
                                                <span>• {isRu ? 'Анимация' : 'Anim'} ({item.frames} {isRu ? 'кадров' : 'frames'}, {item.animComplexity}):</span>
                                                <span>+{(item.animComplexity === 'complex' ? 10 : item.animComplexity === 'medium' ? 5 : 0) + Math.ceil(item.frames / (item.animComplexity === 'complex' ? 2 : item.animComplexity === 'medium' ? 4 : 6))} pts</span>
                                              </div>
                                            )}

                                            <div className="flex justify-between">
                                              <span>• {isRu ? 'Размерный фактор' : 'Size Factor'} ({item.sizeFactor}px / step {item.complexityStep}px):</span>
                                              <span>+{item.dimensionalComplexity} pts</span>
                                            </div>

                                            {item.totalComplexityMultiplier > 1.0 && (
                                              <div className="flex justify-between text-fuchsia-300 font-bold">
                                                <span>• {isRu ? 'Множитель (С нуля / Изометрия)' : 'Multiplier (Scratch/Iso)'}:</span>
                                                <span>×{item.totalComplexityMultiplier}</span>
                                              </div>
                                            )}
                                          </div>

                                          <div className="bg-[#12051d] p-3 rounded-lg border border-[#3d1a56] flex justify-between items-center mt-2">
                                            <span className="font-bold text-purple-200">
                                              {isRu ? 'Итоговая наценка за сложность:' : 'Total Complexity Markup:'}
                                            </span>
                                            <span className="font-mono font-black text-fuchsia-300">
                                              +{Math.round((item.animatedSinglePrice / (item.baseCalculatedPrice || basePrice) - 1) * 100)}%
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-center text-purple-300 pt-1">
                                          <span>{isRu ? 'Тип скина Minecraft:' : 'Minecraft Skin Type:'}</span>
                                          <span className="font-mono font-bold">{item.sizeInfo}</span>
                                        </div>
                                      )}

                                      <div className="pt-2.5 border-t border-[#3d1a56] flex justify-between items-center font-bold text-white text-sm">
                                        <span>{isRu ? 'Цена 1 оригинала:' : 'Price per 1 Original:'}</span>
                                        <span className="font-mono text-purple-200 font-black">{formatPrice(item.animatedSinglePrice)}</span>
                                      </div>

                                      {item.countVar > 0 && (
                                        <div className="flex justify-between items-center text-xs text-[#ebd6f7]/70 font-mono">
                                          <span>{isRu ? 'Цена 1 вариации (50%):' : 'Price per 1 Variation (50%):'}</span>
                                          <span className="font-bold text-stone-200">{formatPrice(item.singleVarPrice)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right Box: Quantity Total & Wholesale Progress */}
                                  <div className="space-y-4 bg-[#1a082b] p-4.5 rounded-xl border border-[#3d1a56]">
                                    <h5 className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-widest flex items-center gap-2">
                                      <Coins className="w-4 h-4 text-emerald-400" />
                                      <span>{isRu ? '2. Итог позиции с оптом и наценками' : '2. Volume, Wholesale & Item Total'}</span>
                                    </h5>

                                    <div className="space-y-2.5 text-[#ebd6f7]/90 text-xs sm:text-sm">
                                      <div className="flex justify-between items-center border-b border-[#3d1a56]/60 pb-1.5">
                                        <span>{isRu ? 'Оригиналы' : 'Originals'} ({item.countOrig} {isRu ? 'шт.' : 'pcs'}):</span>
                                        <span className="font-mono text-white font-bold">{formatPrice(item.animatedSinglePrice * item.countOrig)}</span>
                                      </div>

                                      {item.countVar > 0 && (
                                        <div className="flex justify-between items-center border-b border-[#3d1a56]/60 pb-1.5">
                                          <span>{isRu ? 'Вариации' : 'Variations'} ({item.countVar} {isRu ? 'шт.' : 'pcs'}):</span>
                                          <span className="font-mono text-white font-bold">{formatPrice(item.singleVarPrice * item.countVar)}</span>
                                        </div>
                                      )}

                                      <div className="flex justify-between items-center text-stone-300">
                                        <span>{isRu ? 'Сумма без скидки:' : 'Item Subtotal (Gross):'}</span>
                                        <span className="font-mono font-bold">{formatPrice(item.itemPriceBeforeDiscount)}</span>
                                      </div>

                                      {hasDiscounts && (
                                        <div className="flex justify-between items-center text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/60">
                                          <div>
                                            <span className="font-bold block text-xs">{isRu ? 'Накопительная оптовая скидка:' : 'Wholesale Volume Discount:'}</span>
                                            <span className="text-xs opacity-80">{isRu ? 'С учётом позиции в общем заказе' : 'Based on cumulative count'}</span>
                                          </div>
                                          <span className="font-mono font-black text-base">-{formatPrice(item.itemBulkDiscountAmount)}</span>
                                        </div>
                                      )}

                                      {hasSurcharges && (
                                        <div className="flex justify-between items-center text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60">
                                          <div>
                                            <span className="font-bold block text-xs">{isRu ? 'Наценка за перегруз (>100 спрайтов):' : 'Limit Exceeded Surcharge (>100):'}</span>
                                            <span className="text-xs opacity-80">+100% {isRu ? 'за превышение очереди' : 'for queue limit'}</span>
                                          </div>
                                          <span className="font-mono font-black text-base">+{formatPrice(item.itemSurcharge)}</span>
                                        </div>
                                      )}

                                      <div className="pt-3 border-t border-[#3d1a56] flex justify-between items-center font-black text-purple-200 text-sm sm:text-base">
                                        <span className="uppercase tracking-wider">{isRu ? 'Итого за позицию:' : 'Item Final Price:'}</span>
                                        <span className="font-mono text-xl text-fuchsia-300">{formatPrice(item.itemFinalPrice)}</span>
                                      </div>
                                    </div>
                                  </div>

                                </div>

                                {/* Text formula summary line */}
                                <div className="bg-[#180524] p-3.5 rounded-xl border border-[#3d1a56]/80 font-mono text-xs sm:text-sm text-[#ebd6f7]/80 space-y-1.5">
                                  <span className="text-purple-300 font-bold block">{isRu ? 'Текстовый лог математики:' : 'Formula log string:'}</span>
                                  <p className="whitespace-pre-wrap leading-relaxed text-stone-200">
                                    {orderCalculations.itemsLogs[idx] || `${item.categoryName}: ${formatPrice(item.itemFinalPrice)}`}
                                  </p>
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Global Order Modifiers & Prepayment Calculation Summary */}
              <div className="bg-gradient-to-br from-[#210933] to-[#12041c] border-2 border-purple-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
                <div className="text-center border-b border-purple-500/20 pb-4">
                  <h4 className="text-sm sm:text-base font-black text-purple-200 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    <span>{isRu ? 'Глобальный итог заказа и расчёт предоплаты' : 'Global Totals & Prepayment Formula'}</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm font-mono">
                  
                  {/* Left Column: Order Global Modifiers */}
                  <div className="space-y-3.5 bg-[#13051e] p-4.5 rounded-xl border border-purple-500/20">
                    <div className="text-xs font-bold text-[#ebd6f7]/70 uppercase tracking-wider border-b border-[#3d1a56] pb-2">
                      {isRu ? 'Модификаторы стоимости заказа' : 'Order Level Modifiers'}
                    </div>

                    <div className="flex justify-between items-center text-[#ebd6f7]">
                      <span>{isRu ? 'Сумма всех позиций (брутто):' : 'Sum of all items (gross):'}</span>
                      <span className="font-bold text-white">{formatPrice(orderCalculations.baseTotalRounded)}</span>
                    </div>

                    {orderCalculations.bulkDiscountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 font-bold">
                        <span>{isRu ? 'Суммарная оптовая скидка:' : 'Total Wholesale Discount:'}</span>
                        <span>-{formatPrice(orderCalculations.bulkDiscountAmount)}</span>
                      </div>
                    )}

                    {orderCalculations.surchargeAmount > 0 && (
                      <div className="flex justify-between items-center text-rose-400 font-bold">
                        <span>{isRu ? 'Наценка за >100 спрайтов:' : 'Over-100 Surcharge:'}</span>
                        <span>+{formatPrice(orderCalculations.surchargeAmount)}</span>
                      </div>
                    )}

                    {orderCalculations.loadMarkupAmount > 0 && (
                      <div className="flex justify-between items-center text-amber-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span>{isRu ? 'Наценка за загруженность:' : 'Artist Queue Load Markup:'}</span>
                        </span>
                        <span>+{formatPrice(orderCalculations.loadMarkupAmount)}</span>
                      </div>
                    )}

                    {orderCalculations.noDeadlineDiscountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <span>{isRu ? 'Скидка «Без дедлайна» (-25%):' : '"No Deadline" Discount (-25%):'}</span>
                        </span>
                        <span>-{formatPrice(orderCalculations.noDeadlineDiscountAmount)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-purple-500/30 flex justify-between items-center font-sans font-black text-white text-base sm:text-lg">
                      <span className="uppercase tracking-wider">{isRu ? 'ИТОГОВАЯ СУММА:' : 'FINAL TOTAL:'}</span>
                      <span className="text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-200 font-mono">
                        {formatPrice(orderCalculations.finalPriceRub)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Prepayment Formula Explanation */}
                  <div className="space-y-3.5 bg-[#13051e] p-4.5 rounded-xl border border-purple-500/20">
                    <div className="text-xs font-bold text-[#ebd6f7]/70 uppercase tracking-wider border-b border-[#3d1a56] pb-2 flex items-center justify-between">
                      <span>{isRu ? 'Расчёт взноса предоплаты' : 'Prepayment Deposit Formula'}</span>
                      <span className="text-fuchsia-300 font-black text-sm">{orderCalculations.prepayPercent}%</span>
                    </div>

                    <p className="text-xs sm:text-sm font-sans text-[#ebd6f7]/90 leading-relaxed">
                      {isRu 
                        ? `Базовый процент предоплаты снижается на 5% за каждые 2000 ₽ суммы заказа по логарифмической шкале (вплоть до 10%), чтобы сделать большие ТЗ максимально доступными.`
                        : `Prepayment percent scales down by 5% per 2000 RUB order value down to 10% to reduce barrier to entry for large orders.`
                      }
                    </p>

                    <div className="bg-[#1e0a2e] p-3.5 rounded-lg border border-[#3d1a56] space-y-1.5 text-xs sm:text-sm">
                      <div className="flex justify-between text-[#ebd6f7]/80">
                        <span>{isRu ? 'Процент вашей предоплаты:' : 'Your Prepayment Rate:'}</span>
                        <span className="font-bold text-white font-mono">{orderCalculations.prepayPercent}%</span>
                      </div>
                      <div className="flex justify-between text-[#ebd6f7]/80">
                        <span>{isRu ? 'Формула взноса:' : 'Deposit Formula:'}</span>
                        <span className="font-bold text-purple-300 font-mono">
                          {formatPrice(orderCalculations.finalPriceRub)} × {orderCalculations.prepayPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-purple-500/30 flex justify-between items-center font-sans font-black text-emerald-400 text-base sm:text-lg">
                      <span className="uppercase tracking-wider">{isRu ? 'К ПРЕДОПЛАТЕ:' : 'PREPAYMENT DEPOSIT:'}</span>
                      <span className="text-2xl sm:text-3xl font-mono text-emerald-300">
                        {formatPrice(orderCalculations.prepayAmountRub)}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
