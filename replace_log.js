const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = "{/* Reveal math logs button placed cleanly at the bottom */}";
const endStr = "{/* End of log component */}";

const replacement = `            {/* Reveal math logs button placed cleanly at the bottom */}
            <div className="mt-6 pt-5 border-t border-[#ebd6f7]/10 flex justify-center sm:justify-end relative z-10">
              <button
                type="button"
                onClick={() => setShowLog(!showLog)}
                className="w-full sm:w-auto bg-[#c084fc]/10 hover:bg-[#c084fc]/20 text-[#c084fc] hover:text-[#d8b4fe] text-base font-sans border-2 border-[#c084fc]/30 hover:border-[#c084fc]/60 px-8 py-3.5 rounded-2xl transition-all cursor-pointer font-black uppercase tracking-wider active:scale-95 shadow-[0_4px_20px_rgba(192,132,252,0.15)] flex items-center justify-center gap-2"
              >
                <span>{lang === 'ru' ? 'Лог расчётов' : 'Calculation Log'}</span>
                <span className="text-xs transition-transform duration-300">{showLog ? '▲' : '▼'}</span>
              </button>
            </div>

            {/* Price Calculations output breakdown logs */}
            <AnimatePresence>
              {showLog && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 border-t border-[#ebd6f7]/10 pt-5 space-y-4 overflow-hidden relative z-10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="text-purple-300 font-display font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                      <Settings className="w-5 h-5 animate-spin-slow" />
                      {lang === 'ru' ? 'ПОДРОБНЫЙ РАСЧЁТ' : 'DETAILED CALCULATION'}
                    </div>
                    <div className="flex bg-[#12051d] border border-[#3d1a56] rounded-xl p-1 text-xs font-sans self-start sm:self-auto shadow-inner">
                      <button
                        type="button"
                        onClick={() => setActiveLogTab('stepByStep')}
                        className={\`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer \${
                          activeLogTab === 'stepByStep'
                            ? 'bg-[#3d1a56] text-white shadow-md'
                            : 'text-purple-300/60 hover:text-purple-300'
                        }\`}
                      >
                        {lang === 'ru' ? 'Упрощённая' : 'Simple'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLogTab('items')}
                        className={\`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer \${
                          activeLogTab === 'items'
                            ? 'bg-[#3d1a56] text-white shadow-md'
                            : 'text-purple-300/60 hover:text-purple-300'
                        }\`}
                      >
                        {lang === 'ru' ? 'Проработанная' : 'Detailed'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#1c082d]/80 rounded-2xl p-5 border border-[#3d1a56] text-[#ebd6f7]/90 max-h-[600px] overflow-y-auto shadow-2xl backdrop-blur-md custom-scrollbar">
                    {activeLogTab === 'stepByStep' ? (
                      // SIMPLE TAB
                      <div className="space-y-6 font-sans">
                        <div className="text-sm font-bold text-[#ebd6f7]/80">
                          {lang === 'ru' ? 'Краткая сводка формирования итоговой стоимости заказа.' : 'A brief summary of how the final order price is formed.'}
                        </div>
                        
                        <div className="bg-[#12051d] rounded-xl border border-[#3d1a56] overflow-hidden">
                          <div className="bg-[#241135]/60 px-4 py-3 border-b border-[#3d1a56] font-bold text-purple-300 uppercase tracking-wider text-xs">
                            {lang === 'ru' ? '1. БАЗОВАЯ СТОИМОСТЬ' : '1. BASE COST'}
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center font-bold text-lg text-stone-200">
                              <span>{lang === 'ru' ? 'Сумма за все позиции:' : 'Sum of all items:'}</span>
                              <span className="text-purple-300">{formatPrice(orderCalculations.baseTotalRounded)}</span>
                            </div>
                            <div className="text-xs text-[#ebd6f7]/50 font-medium leading-relaxed">
                              {lang === 'ru' 
                                ? 'Включает в себя базовую цену каждой категории, помноженную на коэффициенты сложности, детализации и анимации для каждого отдельного спрайта.'
                                : 'Includes the base price of each category, multiplied by complexity, detailing, and animation factors for each individual sprite.'}
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#12051d] rounded-xl border border-[#3d1a56] overflow-hidden">
                          <div className="bg-[#241135]/60 px-4 py-3 border-b border-[#3d1a56] font-bold text-purple-300 uppercase tracking-wider text-xs">
                            {lang === 'ru' ? '2. ГЛОБАЛЬНЫЕ МОДИФИКАТОРЫ' : '2. GLOBAL MODIFIERS'}
                          </div>
                          <div className="p-4 space-y-2 text-sm font-semibold text-stone-300">
                            {orderCalculations.actualSpeedRate > 1 && (
                              <div className="flex justify-between text-yellow-400">
                                <span>{lang === 'ru' ? 'Приоритет (Срочность):' : 'Priority (Urgency):'}</span>
                                <span>+25%</span>
                              </div>
                            )}
                            {orderCalculations.hasBulkDiscount && (
                              <div className="flex justify-between text-emerald-400">
                                <span>{lang === 'ru' ? 'Оптовая скидка:' : 'Bulk discount:'}</span>
                                <span>-{formatPrice(orderCalculations.bulkDiscountAmount)}</span>
                              </div>
                            )}
                            {orderCalculations.surchargeAmount > 0 && (
                              <div className="flex justify-between text-rose-400">
                                <span>{lang === 'ru' ? 'Наценка за объем (>100):' : 'Volume Surcharge (>100):'}</span>
                                <span>+{formatPrice(orderCalculations.surchargeAmount)}</span>
                              </div>
                            )}
                            {orderCalculations.loadMarkupAmount > 0 && (
                              <div className="flex justify-between text-amber-400">
                                <span>{lang === 'ru' ? 'Загруженность очереди:' : 'Queue workload:'}</span>
                                <span>+{formatPrice(orderCalculations.loadMarkupAmount)}</span>
                              </div>
                            )}
                            {orderCalculations.noDeadlineDiscountAmount > 0 && (
                              <div className="flex justify-between text-emerald-400">
                                <span>{lang === 'ru' ? 'Скидка без дедлайна:' : 'No deadline discount:'}</span>
                                <span>-{formatPrice(orderCalculations.noDeadlineDiscountAmount)}</span>
                              </div>
                            )}
                            {!(orderCalculations.actualSpeedRate > 1) && !orderCalculations.hasBulkDiscount && !(orderCalculations.surchargeAmount > 0) && !(orderCalculations.loadMarkupAmount > 0) && !(orderCalculations.noDeadlineDiscountAmount > 0) && (
                              <div className="text-[#ebd6f7]/40 font-medium italic">
                                {lang === 'ru' ? 'Нет активных глобальных модификаторов' : 'No active global modifiers'}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-[#170924] border-2 border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                          <div className="p-5 flex items-center justify-between">
                            <span className="font-display font-black uppercase text-emerald-400 text-lg tracking-wider">
                              {lang === 'ru' ? 'ИТОГ:' : 'TOTAL:'}
                            </span>
                            <span className="text-2xl font-mono font-black text-emerald-300">
                              {formatPrice(orderCalculations.finalPriceRub)}
                            </span>
                          </div>
                          <div className="bg-emerald-950/40 px-5 py-3 border-t border-emerald-500/20 text-xs text-emerald-200/80 font-medium flex justify-between">
                            <span>{lang === 'ru' ? 'Обязательная предоплата:' : 'Required prepayment:'}</span>
                            <span className="font-bold">{formatPrice(orderCalculations.prepayAmountRub)} ({orderCalculations.prepayPercent}%)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // DETAILED TAB
                      <div className="space-y-6 font-sans">
                        <div className="text-sm font-bold text-[#ebd6f7]/80">
                          {lang === 'ru' 
                            ? 'Прозрачный расчет стоимости каждой позиции с учетом всех наценок и коэффициентов.' 
                            : 'Transparent cost calculation for each item, including all markups and coefficients.'}
                        </div>
                        
                        {orderCalculations.rawItems.map((item: any, i: number) => {
                          const baseCategoryPrice = CATEGORIES_LIST.find(c => c.id === item.categoryId)?.basePrice || 0;
                          const complexityMarkup = Math.round((item.animatedSinglePrice / baseCategoryPrice - 1) * 100);

                          return (
                            <div key={i} className="bg-[#12051d] border border-[#3d1a56] rounded-xl overflow-hidden text-sm">
                              <div className="bg-[#241135]/80 px-4 py-3 border-b border-[#3d1a56] flex justify-between items-center">
                                <div className="font-bold text-fuchsia-300 uppercase tracking-wider text-xs">
                                  {lang === 'ru' ? \`ПОЗИЦИЯ #\${item.index}\` : \`ITEM #\${item.index}\`} - {item.categoryName}
                                </div>
                                <div className="font-mono text-stone-200 font-bold bg-[#170924] px-2 py-1 rounded border border-[#3d1a56]">
                                  {formatPrice(item.itemFinalPrice)}
                                </div>
                              </div>
                              <div className="p-4 space-y-3 font-mono text-xs text-[#ebd6f7]/70">
                                <div className="flex justify-between border-b border-[#3d1a56]/50 pb-2">
                                  <span>{lang === 'ru' ? 'Базовая стоимость категории:' : 'Category base cost:'}</span>
                                  <span className="text-stone-300 font-semibold">{formatPrice(baseCategoryPrice)}</span>
                                </div>
                                
                                {item.categoryId !== '7' && (
                                  <div className="space-y-2 border-b border-[#3d1a56]/50 pb-2">
                                    <div className="text-purple-300/80 font-bold uppercase">{lang === 'ru' ? 'РАСЧЁТ СЛОЖНОСТИ:' : 'COMPLEXITY MATH:'}</div>
                                    <div className="flex justify-between">
                                      <span>• {lang === 'ru' ? 'Базовая сложность' : 'Base complexity'} ({item.detailLevel}):</span>
                                      <span>{item.baseGeneralComplexity}</span>
                                    </div>
                                    {item.hasAnimation && (
                                      <div className="flex justify-between text-amber-300/80">
                                        <span>• {lang === 'ru' ? 'Кадры анимации' : 'Animation frames'} ({item.frames}):</span>
                                        <span>+{Math.ceil(item.frames / (item.animComplexity === 'complex' ? 2 : item.animComplexity === 'medium' ? 4 : 6))}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span>• {lang === 'ru' ? 'Размерный фактор' : 'Size factor'} ({item.sizeFactor}px / {item.complexityStep}px):</span>
                                      <span>+{item.dimensionalComplexity}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-purple-200 mt-1">
                                      <span>{lang === 'ru' ? 'ИТОГО ОЧКОВ СЛОЖНОСТИ:' : 'TOTAL COMPLEXITY POINTS:'}</span>
                                      <span>{item.totalComplexity}</span>
                                    </div>
                                    <div className="text-[10px] text-stone-400 italic">
                                      {item.totalComplexity <= 100 
                                        ? (lang === 'ru' ? \`Каждое очко прибавляет стоимость по формуле. Итоговая наценка: +\${complexityMarkup}%\` : \`Each point adds cost based on formula. Total markup: +\${complexityMarkup}%\`)
                                        : (lang === 'ru' ? \`ШТРАФ! Сложность >100! Каждое очко сверх лимита дает +100% наценки. Итоговая наценка: +\${complexityMarkup}%\` : \`PENALTY! Complexity >100! Each point above limit adds +100%. Total markup: +\${complexityMarkup}%\`)}
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2 pb-2">
                                  <div className="text-purple-300/80 font-bold uppercase">{lang === 'ru' ? 'ПОДИТОГ:' : 'SUBTOTAL:'}</div>
                                  <div className="flex justify-between">
                                    <span>{lang === 'ru' ? 'Оригиналы' : 'Originals'} ({item.countOrig} шт × {formatPrice(item.animatedSinglePrice)}):</span>
                                    <span className="text-stone-300 font-semibold">{formatPrice(item.animatedSinglePrice * item.countOrig)}</span>
                                  </div>
                                  {item.countVar > 0 && (
                                    <div className="flex justify-between">
                                      <span>{lang === 'ru' ? 'Вариации' : 'Variations'} ({item.countVar} шт × {formatPrice(item.singleVarPrice)}):</span>
                                      <span className="text-stone-300 font-semibold">{formatPrice(item.singleVarPrice * item.countVar)}</span>
                                    </div>
                                  )}
                                  
                                  {item.itemSurcharge > 0 && (
                                    <div className="flex justify-between text-rose-400 font-bold">
                                      <span>{lang === 'ru' ? 'Штраф (>100 спрайтов в спецификации):' : 'Penalty (>100 sprites in spec):'}</span>
                                      <span>+{formatPrice(item.itemSurcharge)}</span>
                                    </div>
                                  )}
                                  
                                  {item.itemBulkDiscountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400 font-bold">
                                      <span>{lang === 'ru' ? 'Оптовая скидка:' : 'Wholesale discount:'}</span>
                                      <span>-{formatPrice(item.itemBulkDiscountAmount)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="bg-[#170924] border-2 border-[#3d1a56] rounded-xl p-5 text-center mt-4 shadow-xl">
                          <div className="text-xs text-[#ebd6f7]/60 font-bold uppercase tracking-wider mb-2">
                            {lang === 'ru' ? 'ФИНАЛЬНАЯ СТОИМОСТЬ С УЧЁТОМ ГЛОБАЛЬНЫХ МОДИФИКАТОРОВ' : 'FINAL COST INCLUDING GLOBAL MODIFIERS'}
                          </div>
                          <div className="text-2xl font-mono font-black text-purple-300">
                            {formatPrice(orderCalculations.finalPriceRub)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* End of log component */}`;

let startIdx = content.indexOf(startStr);
// The end string doesn't exist yet, so we need to find where the old log component ends.
// Looking at my grep output, the old AnimatePresence ends around line 4410, and right after it is `{/* Additional warning for extreme totals */}` or `</motion.div>`.
// Let's find the closing tags.
let oldLogEndStr = "            {/* End of calculation math block */}\n";
// Actually, let's just use regex to replace everything from `            {/* Reveal math logs button placed cleanly at the bottom */}` to `</AnimatePresence>` right before `{/* Mobile Quick Summary sticky bar */}` or whatever is next.

let regex = /\{\/\* Reveal math logs button placed cleanly at the bottom \*\/\}[\s\S]*?<\/AnimatePresence>/;
if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully replaced log UI');
} else {
  console.log('Regex did not match');
}
