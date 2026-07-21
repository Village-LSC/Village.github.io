const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const generateTZStart = '  const generateTZ = (autoScroll: boolean = false, isExplicit: boolean = false) => {';
const generateTZEnd = '    setTzOutput(tzText);';

const startIndex = content.indexOf(generateTZStart);
const endIndex = content.indexOf(generateTZEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `  const generateTZ = (autoScroll: boolean = false, isExplicit: boolean = false) => {
    // Check descriptions
    let hasErrors = false;
    sprites.forEach(s => {
      if (!s.description.trim()) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setTzOutput('');
      setValidationError(true);
      if (isExplicit) {
        triggerToast(
          lang === 'ru'
            ? 'Пожалуйста, заполните описание всех задач перед генерацией ТЗ!'
            : 'Please fill in descriptions for all tasks before generating the spec!',
          'error'
        );
      }
      if (autoScroll) {
        const firstInvalidElement = document.getElementById('calc-anchored-form');
        if (firstInvalidElement) {
          firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    let hasSizeErrors = sprites.some(s => s.categoryId !== '7' && (s.width > 1000 || s.height > 1000));
    if (hasSizeErrors) {
      if (autoScroll) {
        triggerToast(
          lang === 'ru' 
            ? 'Превышен максимальный размер (1000px)! Пожалуйста, исправьте значения.' 
            : 'Maximum size exceeded (1000px)! Please correct the values.',
          'error'
        );
      }
      return;
    }

    setValidationError(false);
    let tzText = \`\`;
    const isRu = lang === 'ru';
    const dateStr = new Date().toLocaleDateString(isRu ? 'ru-RU' : 'en-US');

    tzText += isRu ? \`=== ТЕХНИЧЕСКОЕ ЗАДАНИЕ ===\\n\\n\` : \`=== TECHNICAL SPECIFICATION ===\\n\\n\`;
    tzText += isRu ? \`Исполнитель: Village_ (errorsbills@gmail.com)\\n\` : \`Artist: Village_ (errorsbills@gmail.com)\\n\`;
    tzText += isRu ? \`Дата: \${dateStr}\\n\\n\` : \`Date: \${dateStr}\\n\\n\`;
    
    tzText += isRu ? \`[ ИТОГОВЫЙ БЮДЖЕТ ]\\n\` : \`[ FINAL BUDGET ]\\n\`;
    tzText += isRu ? \`• Итого: \${formatPrice(orderCalculations.finalPriceRub)}\\n\` : \`• Total: \${formatPrice(orderCalculations.finalPriceRub)}\\n\`;
    tzText += isRu ? \`• Предоплата (\${orderCalculations.prepayPercent}%): \${formatPrice(orderCalculations.prepayAmountRub)}\\n\` : \`• Prepayment (\${orderCalculations.prepayPercent}%): \${formatPrice(orderCalculations.prepayAmountRub)}\\n\`;
    tzText += isRu ? \`• Позиций: \${orderCalculations.totalSpritesCount} шт.\\n\\n\` : \`• Items: \${orderCalculations.totalSpritesCount} pcs.\\n\\n\`;

    tzText += isRu ? \`[ СОСТАВ ЗАКАЗА ]\\n\\n\` : \`[ ORDER CONTENTS ]\\n\\n\`;

    orderCalculations.rawItems.forEach(item => {
      tzText += isRu ? \`[№\${item.index}] \${item.categoryName}\\n\` : \`[#\${item.index}] \${item.categoryName}\\n\`;
      tzText += \`  \${isRu ? 'ТЗ' : 'Task'}: \${item.description}\\n\`;
      tzText += \`  \${isRu ? 'Разрешение' : 'Resolution'}: \${item.sizeInfo}\\n\`;
      tzText += \`  \${isRu ? 'Параметры' : 'Parameters'}: \${item.frames} \${isRu ? 'кадр(ов)' : 'frame(s)'}, \${item.countOrig} \${isRu ? 'ориг.' : 'orig.'}, \${item.countVar} \${isRu ? 'вариаций' : 'vars'}\\n\`;
      tzText += \`  \${isRu ? 'Цена' : 'Price'}: \${formatPrice(item.itemFinalPrice)}\\n\\n\`;
    });

    tzText += isRu ? \`[ КОД СИДА ДЛЯ ВОССТАНОВЛЕНИЯ ]\\n\` : \`[ RECOVERY SEED CODE ]\\n\`;
    tzText += \`\${generatedSeed}\\n\\n\`;
`;

  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced generateTZ in App.tsx");
} else {
  console.error("Could not find generateTZ in App.tsx", startIndex, endIndex);
}
