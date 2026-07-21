const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
const stateLine = "  const [renamingSpriteId, setRenamingSpriteId] = useState<number | null>(null);";
content = content.replace(
  "  const [expandedSprites, setExpandedSprites] = useState<{ [key: number]: boolean }>({ 1: true });",
  "  const [expandedSprites, setExpandedSprites] = useState<{ [key: number]: boolean }>({ 1: true });\n" + stateLine
);

// 2. Change collapsed block title & add edit button
const replacementTitle = `<div className="min-w-0 flex-1 leading-tight" onClick={(e) => {
                                if (renamingSpriteId === sprite.id) {
                                  e.stopPropagation();
                                }
                              }}>
                              <span className="font-mono text-purple-400 block text-[10px] uppercase font-bold mb-0.5">#{idx + 1}</span>
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
                                <span className="text-xs text-[#ebd6f7] font-bold block leading-snug break-words hyphens-auto line-clamp-2">
                                  {sprite.description ? sprite.description : (lang === 'ru' ? activeCat.nameRu : activeCat.nameEn)}
                                </span>
                              )}
                            </div>`;

content = content.replace(
  /<div className="min-w-0 flex-1 leading-tight">[\s\S]*?<\/div>/,
  replacementTitle
);

// 3. Add rename button to the actions
const actionsReplacement = `<button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingSpriteId(sprite.id);
                              }}
                              className="px-2 text-stone-400 hover:text-white hover:bg-purple-900/50 border-r border-[#3d1a56]/80 transition-all cursor-pointer self-stretch flex items-center justify-center active:scale-90"
                              title={lang === 'ru' ? 'Переименовать' : 'Rename'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSpriteBlock(sprite.id);`;

content = content.replace(
  /<button\s+type="button"\s+onClick=\{\(e\) => \{\s+e\.stopPropagation\(\);\s+duplicateSpriteBlock\(sprite\.id\);/,
  actionsReplacement
);

fs.writeFileSync('src/App.tsx', content);
console.log('Renaming logic added');
