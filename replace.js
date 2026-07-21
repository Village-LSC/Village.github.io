const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `    let tzText = \`\`;
    const isRu = lang === 'ru';
    const dateStr = new Date().toLocaleDateString(isRu ? 'ru-RU' : 'en-US');
    
    tzText += \`==================================================\\n\`;
    tzText += isRu ? \`        ОФИЦИАЛЬНОЕ ТЕХНИЧЕСКОЕ ЗАДАНИЕ\\n\` : \`          OFFICIAL TECHNICAL SPECIFICATION\\n\`;
    tzText += \`==================================================\\n\`;
    tzText += isRu ? \`Исполнитель: Village_ (errorsbills@gmail.com)\\n\` : \`Artist: Village_ (errorsbills@gmail.com)\\n\`;
    tzText += isRu ? \`Дата: \${dateStr}\\n\\n\` : \`Date: \${dateStr}\\n\\n\`;
    
    tzText += \`--------------------------------------------------\\n\`;
    tzText += isRu ? \`[ БЮДЖЕТ И ИТОГИ ]\\n\` : \`[ TOTAL BUDGET & SUMMARY ]\\n\`;
    tzText += \`--------------------------------------------------\\n\`;
    tzText += isRu ? \`• Итоговая стоимость: \${formatPrice(orderCalculations.finalPriceRub)}\\n\` : \`• Grand Total: \${formatPrice(orderCalculations.finalPriceRub)}\\n\`;
    tzText += isRu ? \`• Предоплата (\${orderCalculations.prepayPercent}%): \${formatPrice(orderCalculations.prepayAmountRub)}\\n\` : \`• Prepayment (\${orderCalculations.prepayPercent}%): \${formatPrice(orderCalculations.prepayAmountRub)}\\n\`;
    tzText += isRu ? \`• Всего позиций (спрайтов): \${orderCalculations.totalSpritesCount} шт.\\n\\n\` : \`• Total Assets: \${orderCalculations.totalSpritesCount} pcs.\\n\\n\`;

    tzText += \`--------------------------------------------------\\n\`;
    tzText += isRu ? \`[ СПИСОК ПОЗИЦИЙ ДЛЯ РАЗРАБОТКИ ]\\n\` : \`[ DEVELOPMENT ITEM LIST ]\\n\`;
    tzText += \`--------------------------------------------------\\n\\n\`;

    orderCalculations.rawItems.forEach(item => {
      tzText += isRu ? \`Позиция №\${item.index} | Категория: \${item.categoryName}\\n\` : \`Item #\${item.index} | Category: \${item.categoryName}\\n\`;
      tzText += \`  - \${isRu ? 'ТЗ / Описание' : 'Description'}: \${item.description || (isRu ? 'Без описания' : 'No description')}\\n\`;
      tzText += \`  - \${isRu ? 'Разрешение' : 'Resolution'}: \${item.sizeInfo}\\n\`;
      tzText += \`  - \${isRu ? 'Параметры' : 'Parameters'}: \${item.frames} \${isRu ? 'кадров' : 'frames'}, \${item.countOrig} \${isRu ? 'ориг.' : 'orig.'}\${item.countVar > 0 ? \`, \${item.countVar} \` + (isRu ? 'вариаций' : 'vars.') : ''}\\n\`;
      tzText += \`  - \${isRu ? 'Стоимость' : 'Price'}: \${formatPrice(item.itemFinalPrice)}\\n\\n\`;
    });

    tzText += \`--------------------------------------------------\\n\`;
    tzText += isRu ? \`[ СИД ВОССТАНОВЛЕНИЯ ЗАКАЗА ]\\n\` : \`[ ORDER RECOVERY SEED ]\\n\`;
    tzText += \`--------------------------------------------------\\n\`;
    tzText += \`\${generatedSeed}\\n\\n\`;
    
    tzText += \`==================================================\\n\`;
    tzText += \`\${t.tzUrlNote}\\n\`;
    tzText += \`==================================================\\n\`;

    setTzOutput(tzText);`;

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('let tzText = ``;'));
const end = lines.findIndex(l => l.includes('setTzOutput(tzText);'));

if(start !== -1 && end !== -1) {
  lines.splice(start, end - start + 1, replacement);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log('Replaced');
} else {
  console.log('Not found');
}
