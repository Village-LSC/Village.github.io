const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /return \(\s*<motion\.div\s*key=\{sprite\.id\}[\s\S]*?<\/motion\.div>\s*\);/;
// Wait, regex with map will just match the first one?
// Let's just find the exact block from: `return (\n                        <motion.div\n                          key={sprite.id}`
// to `</motion.div>\n                      );`
