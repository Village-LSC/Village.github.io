const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = '{/* Reveal math logs button placed cleanly at the bottom */}';
const endStr = '{/* End of log component */}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `<div className="mt-10 mb-8 border-t border-[#ebd6f7]/10 pt-10 relative z-10">
              <CalculationLog 
                lang={lang} 
                orderCalculations={orderCalculations} 
                CATEGORIES_LIST={CATEGORIES_LIST} 
                formatPrice={formatPrice} 
              />
            </div>
            {/* End of log component */}`;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex + endStr.length);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced calculation log in App.tsx");
} else {
  console.error("Could not find calculation log block in App.tsx", startIndex, endIndex);
}
