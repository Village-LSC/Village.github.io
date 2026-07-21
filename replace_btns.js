const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = '<div className="flex items-center border-l border-[#3d1a56]/80 self-stretch shrink-0">';
const endStr = '</motion.div>';

let startIdx = content.indexOf(startStr);
// We want the end of the div, which is before </motion.div>
let nextDivIdx = content.indexOf('</motion.div>', startIdx);

if (startIdx !== -1 && nextDivIdx !== -1) {
  const replacement = `<div className="flex items-center border-l border-[#3d1a56]/80 self-stretch shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSpriteUp(sprite.id);
                              }}
                              className="px-2 text-stone-400 hover:text-white hover:bg-purple-900/50 transition-all cursor-pointer self-stretch flex items-center justify-center active:scale-90"
                              title={lang === 'ru' ? 'Вверх' : 'Move Up'}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSpriteDown(sprite.id);
                              }}
                              className="px-2 text-stone-400 hover:text-white hover:bg-purple-900/50 border-r border-[#3d1a56]/80 transition-all cursor-pointer self-stretch flex items-center justify-center active:scale-90"
                              title={lang === 'ru' ? 'Вниз' : 'Move Down'}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSpriteBlock(sprite.id);
                              }}
                              className="px-2.5 text-purple-300 hover:text-white hover:bg-purple-900/50 transition-all cursor-pointer self-stretch flex items-center justify-center active:scale-90"
                              title={lang === 'ru' ? 'Дублировать' : 'Duplicate'}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {sprites.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSpriteBlock(sprite.id);
                                }}
                                className="px-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 border-l border-[#3d1a56]/80 transition-all cursor-pointer self-stretch flex items-center justify-center active:scale-90"
                                title={lang === 'ru' ? 'Удалить' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        `;
  content = content.substring(0, startIdx) + replacement + content.substring(nextDivIdx);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Done replacement');
}
