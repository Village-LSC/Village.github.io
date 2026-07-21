const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = '{/* Header Title */}';
const endStr = '{/* Footer URL Note */}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{/* Header Title */}
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
                          <div className="text-[10px] uppercase font-bold text-purple-300/70 mb-1">{lang === 'ru' ? 'Сумма заказа' : 'Total Budget'}</div>
                          <div className="text-lg font-black text-fuchsia-300 font-mono">{formatPrice(orderCalculations.finalPriceRub)}</div>
                        </div>
                        <div className="bg-[#1b0a2a]/80 p-4 rounded-xl border border-emerald-500/20">
                          <div className="text-[10px] uppercase font-bold text-emerald-400/70 mb-1">{lang === 'ru' ? 'Предоплата' : 'Prepayment'}</div>
                          <div className="text-lg font-black text-emerald-400 font-mono">
                            {formatPrice(orderCalculations.prepayAmountRub)}
                          </div>
                        </div>
                        <div className="bg-[#1b0a2a]/80 p-4 rounded-xl border border-purple-500/20">
                          <div className="text-[10px] uppercase font-bold text-purple-300/70 mb-1">{lang === 'ru' ? 'Всего позиций' : 'Total Items'}</div>
                          <div className="text-lg font-bold text-white font-mono">{orderCalculations.totalSpritesCount} шт.</div>
                        </div>
                        <div className="bg-[#1b0a2a]/80 p-4 rounded-xl border border-purple-500/20">
                          <div className="text-[10px] uppercase font-bold text-purple-300/70 mb-1">{lang === 'ru' ? 'Сроки' : 'Timeline'}</div>
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

                                  <div className="space-y-1 text-xs font-mono text-[#ebd6f7]/80">
                                    <div className="flex justify-between">
                                      <span className="text-[#ebd6f7]/50">{lang === 'ru' ? 'Кол-во:' : 'Qty:'}</span>
                                      <span className="font-bold text-white">{item.countOrig} ор. {item.countVar > 0 && \`+ \${item.countVar} вар.\`}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-[#ebd6f7]/50">{lang === 'ru' ? 'Размер:' : 'Size:'}</span>
                                      <span className="font-bold text-white">{item.sizeInfo}</span>
                                    </div>
                                    {item.frames > 1 && (
                                      <div className="flex justify-between">
                                        <span className="text-[#ebd6f7]/50">{lang === 'ru' ? 'Анимация:' : 'Anim:'}</span>
                                        <span className="font-bold text-white">{item.frames} {lang === 'ru' ? 'кадров' : 'frames'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right Side: Description */}
                                <div className="w-full md:w-2/3">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300/50 mb-1.5">
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

                      `;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced visual TZ in App.tsx");
} else {
  console.error("Could not find visual TZ in App.tsx", startIndex, endIndex);
}
