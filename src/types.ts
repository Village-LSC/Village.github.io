export type Language = 'ru' | 'en';
export type Currency = 'rub' | 'usd';

export interface CategoryData {
  id: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  pointsRu: string[];
  pointsEn: string[];
  noteRu?: string;
  noteEn?: string;
  basePrice: number;
  pixelPrice: number;
  maxBaseSize: number;
  supportsAnimation: boolean;
  useCasesRu: string[];
  useCasesEn: string[];
  formulaHelpRu: string;
  formulaHelpEn: string;
  examplesRu: { size: string; price: string }[];
  examplesEn: { size: string; price: string }[];
  imagePath?: string;
}

export interface SpriteItemState {
  id: number;
  categoryId: string;
  width: number;
  height: number;
  skinType: '1' | '2'; // 1 = standard, 2 = HD
  countOrig: number;
  countVar: number;
  hasAnimation: boolean;
  frameMode: 'direct' | 'calc';
  framesDirect: number;
  animDuration: number;
  animDelay: number;
  description: string;
  templateSize: string; // 'custom' or preset sizes
  quality: 'optimal' | 'medium' | 'best';
}

export const CATEGORIES_LIST: CategoryData[] = [
  {
    id: '1',
    nameRu: 'Предметы / Тайлы / Окружение',
    nameEn: 'Items / Tiles / Environment',
    descriptionRu: 'Разработка внутриигровых графических ассетов и элементов локаций.',
    descriptionEn: 'Development of in-game graphic assets and location elements.',
    pointsRu: [
      'Игровые предметы: Оружие, экипировка, расходные материалы, квестовые объекты и лут.',
      'Объекты окружения: Интерактивные элементы карт, сундуки, источники света, декорации.',
      'Тайлы (Tilesets): Бесшовные текстуры поверхностей, блоков и платформ для сборки уровней.',
      'Анимация ассетов: Разработка покадровой анимации для предметов (взмахи, свечение) и тайлов (жидкие среды, интерактивные элементы).'
    ],
    pointsEn: [
      'Game Items: Weapons, equipment, consumables, quest objects, and loot.',
      'Environment Objects: Interactive map elements, chests, light sources, decorations.',
      'Tiles (Tilesets): Seamless textures of surfaces, blocks, and platforms for assembling levels.',
      'Asset Animation: Frame-by-frame animation for items (swings, glowing) and tiles (fluid mediums, interactive elements).'
    ],
    basePrice: 150,
    pixelPrice: 3,
    maxBaseSize: 128,
    supportsAnimation: true,
    useCasesRu: ['оружие и щиты', 'броня', 'зелья', 'блоки окружения', 'деревья и трава', 'мебель'],
    useCasesEn: ['weapons and shields', 'armor', 'potions', 'environment blocks', 'trees and grass', 'furniture'],
    formulaHelpRu: 'Базовая ставка 150 ₽ + 3 ₽ за каждый пиксель виртуального холста.',
    formulaHelpEn: 'Base rate 150 ₽ + 3 ₽ per pixel of the virtual canvas.',
    examplesRu: [
      { size: '16x16', price: '198 ₽' },
      { size: '32x32', price: '246 ₽' },
      { size: '64x64', price: '342 ₽' }
    ],
    examplesEn: [
      { size: '16x16', price: '198 ₽' },
      { size: '32x32', price: '246 ₽' },
      { size: '64x64', price: '342 ₽' }
    ],
    imagePath: '/images/cat1.gif'
  },
  {
    id: '2',
    nameRu: 'Текстурирование моделей',
    nameEn: 'Model Texturing',
    descriptionRu: 'Создание текстурных карт для низкополигональных трехмерных объектов.',
    descriptionEn: 'Creation of texture maps for low-poly three-dimensional objects.',
    pointsRu: [
      'Текстуры простых моделей: Разработка разверток и пиксельных текстур для готовых 3D-моделей (оружие, простая мебель, элементы окружения).'
    ],
    pointsEn: [
      'Simple Model Textures: UV unwrapping and pixel textures for complete 3D models (weapons, simple furniture, landscape elements).'
    ],
    noteRu: 'Расчет стоимости ведется строго по размеру исходной текстуры, а не по сложности визуальной модели.',
    noteEn: 'Cost calculation is strictly based on the size of the source texture, not on the complexity of the 3D model.',
    basePrice: 400,
    pixelPrice: 5,
    maxBaseSize: 256,
    supportsAnimation: true,
    useCasesRu: ['кубические модели', 'персонажи Blockbench', 'оружие', 'техника'],
    useCasesEn: ['blocky models', 'Blockbench characters', 'weapons', 'machinery'],
    formulaHelpRu: 'Базовая ставка 400 ₽ + 5 ₽ за пиксель размера.',
    formulaHelpEn: 'Base rate 400 ₽ + 5 ₽ per pixel of size.',
    examplesRu: [
      { size: '16x16', price: '480 ₽' },
      { size: '32x32', price: '560 ₽' }
    ],
    examplesEn: [
      { size: '16x16', price: '480 ₽' },
      { size: '32x32', price: '560 ₽' }
    ],
    imagePath: '/images/cat2.gif'
  },
  {
    id: '3',
    nameRu: 'UI: Базовые элементы',
    nameEn: 'UI: Basic Elements',
    descriptionRu: 'Компоненты интерфейса для обеспечения базового функционала и навигации.',
    descriptionEn: 'Interface components providing basic functionality and navigation.',
    pointsRu: [
      'Кнопки: Элементы управления для главного и внутриигровых меню (включая разработку состояний Hover/Pressed).',
      'Иконки: Графические обозначения навыков, эффектов, баффов/дебаффов или ячеек инвентаря.',
      'Индикаторы (Bars): Шкалы состояния персонажа (здоровье, мана, опыт, выносливость).'
    ],
    pointsEn: [
      'Buttons: Controls for main and in-game menus (including Hover/Pressed states).',
      'Icons: Graphical skill badges, effects, buffs/debuffs, or inventory slots.',
      'Indicators (Bars): Character status bars (health, mana, experience, stamina).'
    ],
    basePrice: 250,
    pixelPrice: 4,
    maxBaseSize: 128,
    supportsAnimation: true,
    useCasesRu: ['кнопки меню', 'иконки предметов', 'бары здоровья (HP / MP)', 'маленькие рамки'],
    useCasesEn: ['menu buttons', 'item icons', 'health bars (HP / MP)', 'small frames'],
    formulaHelpRu: 'Базовая ставка 250 ₽ + 4 ₽ за пиксель размера.',
    formulaHelpEn: 'Base rate 250 ₽ + 4 ₽ per pixel of size.',
    examplesRu: [
      { size: '16x16', price: '314 ₽' },
      { size: '32x32', price: '378 ₽' }
    ],
    examplesEn: [
      { size: '16x16', price: '314 ₽' },
      { size: '32x32', price: '378 ₽' }
    ],
    imagePath: '/images/cat3.gif'
  },
  {
    id: '4',
    nameRu: 'UI: Окна, шрифты, статичные фоны',
    nameEn: 'UI: Windows, Fonts, Static Backgrounds',
    descriptionRu: 'Крупные графические элементы и структуры интерфейса.',
    descriptionEn: 'Large graphical elements and interface structures.',
    pointsRu: [
      'Интерфейсные окна: Макеты инвентарей, экранов характеристик, меню настроек и игровых магазинов.',
      'Типографика: Разработка стилизованных пиксельных шрифтов под общую стилистику проекта.',
      'Логотипы и подложки: Базовые вывески, эмблемы и статичные фоны для экранов загрузки или меню.'
    ],
    pointsEn: [
      'Interface Windows: Inventory layouts, character stats, settings panels, and in-game stores.',
      'Typography: Custom stylized pixel fonts designed for the project’s aesthetics.',
      'Logos & Backplates: Main titles, badges, and static loading screens or menu backgrounds.'
    ],
    basePrice: 500,
    pixelPrice: 6,
    maxBaseSize: 320,
    supportsAnimation: true,
    useCasesRu: ['сетка инвентаря', 'окна крафта', 'панели настроек', 'алфавитные шрифты'],
    useCasesEn: ['inventory slots grid', 'crafting windows', 'settings panels', 'custom fonts'],
    formulaHelpRu: 'Базовая ставка 500 ₽ + 6 ₽ за пиксель размера.',
    formulaHelpEn: 'Base rate 500 ₽ + 6 ₽ per pixel of size.',
    examplesRu: [
      { size: '64x64', price: '884 ₽' },
      { size: '128x128', price: '1268 ₽' }
    ],
    examplesEn: [
      { size: '64x64', price: '884 ₽' },
      { size: '128x128', price: '1268 ₽' }
    ],
    imagePath: '/images/cat4.gif'
  },
  {
    id: '5',
    nameRu: 'UI: Сложные фоны и логотипы',
    nameEn: 'UI: Complex Backgrounds & Logos',
    descriptionRu: 'Высокодетализированные художественные фоны и титульные логотипы для вашей игры.',
    descriptionEn: 'Highly detailed artistic backgrounds and main title logos for your game.',
    pointsRu: [
      'Художественные фоны: Сложные детализированные панорамы, пейзажи и сюжетные задники.',
      'Комплексные логотипы: Главные титульные логотипы игры с глубокой проработкой текстур.'
    ],
    pointsEn: [
      'Artistic Backgrounds: Intricate full-scale panoramas, landscapes, and menu backdrops.',
      'Complex Logos: Premium main title logo art with elaborate texture work.'
    ],
    basePrice: 800,
    pixelPrice: 8,
    maxBaseSize: 352,
    supportsAnimation: true,
    useCasesRu: ['главные экраны', 'высокодетализированные заставки', 'логотипы игры'],
    useCasesEn: ['main menu backdrops', 'high-detail cutscene art', 'game title logos'],
    formulaHelpRu: 'Базовая ставка 800 ₽ + 8 ₽ за пиксель размера.',
    formulaHelpEn: 'Base rate 800 ₽ + 8 ₽ per pixel of size.',
    examplesRu: [
      { size: '128x128', price: '1824 ₽' },
      { size: '256x256', price: '2848 ₽' }
    ],
    examplesEn: [
      { size: '128x128', price: '1824 ₽' },
      { size: '256x256', price: '2848 ₽' }
    ],
    imagePath: '/images/cat5.gif'
  },
  {
    id: '6',
    nameRu: 'Портреты / Спрайты диалогов',
    nameEn: 'Portraits / Dialogue Sprites',
    descriptionRu: 'Графическое оформление персонажей для текстовых и интерфейсных модулей.',
    descriptionEn: 'Character graphic design for textual dialogues and interface elements.',
    pointsRu: [
      'Диалоговые портреты: Аватары персонажей для кат-сцен, диалоговых окон и квестов.',
      'Иконки профиля: Изображения профиля игрока, фракций или боссов.'
    ],
    pointsEn: [
      'Dialogue Portraits: Character headshots for cutscenes, story boxes, and quest logs.',
      'Profile Icons: Avatars for players, factions, guilds, or epic bosses.'
    ],
    noteRu: 'Работа ведется исключительно в формате портрета (голова и плечевой пояс). Полные модели персонажей и спрайты во весь рост в данной категории не разрабатываются.',
    noteEn: 'Work is performed exclusively in a portrait format (head and shoulders). Full-body character models or full-length sprites are not created in this category.',
    basePrice: 600,
    pixelPrice: 6,
    maxBaseSize: 256,
    supportsAnimation: true,
    useCasesRu: ['портреты NPC', 'спрайты эмоций', 'аватары профилей', 'карточки героев'],
    useCasesEn: ['NPC dialogue expressions', 'emote icons', 'player profile photos', 'hero cards'],
    formulaHelpRu: 'Базовая ставка 600 ₽ + 6 ₽ за пиксель размера.',
    formulaHelpEn: 'Base rate 600 ₽ + 6 ₽ per pixel of size.',
    examplesRu: [
      { size: '32x32', price: '792 ₽' },
      { size: '64x64', price: '984 ₽' }
    ],
    examplesEn: [
      { size: '32x32', price: '792 ₽' },
      { size: '64x64', price: '984 ₽' }
    ],
    imagePath: '/images/cat6.gif'
  },
  {
    id: '7',
    nameRu: 'Minecraft-скины',
    nameEn: 'Minecraft Skins',
    descriptionRu: 'Разработка текстур персонажей для интеграции в Minecraft-серверы и проекты.',
    descriptionEn: 'Character texture development for direct integration into Minecraft servers and accounts.',
    pointsRu: [
      'Кастомные скины: Создание уникального скина с нуля по техническому заданию, описанию или референсам.',
      'Модификации и вариации: Тематические изменения уже готового скина (добавление альтернативной одежды, аксессуаров, брони).'
    ],
    pointsEn: [
      'Custom Skins: Bespoke skins built completely from scratch based on descriptions, mood boards, or artwork.',
      'Skins Modifications: Seasonal or theme changes to existing skins (adding hats, alternative outfits, armor, or capes).'
    ],
    basePrice: 400,
    pixelPrice: 0,
    maxBaseSize: 512,
    supportsAnimation: false,
    useCasesRu: ['Скины игроков (64x64 / 128x128)', 'Скины мобов'],
    useCasesEn: ['Player Skins (64x64 / 128x128)', 'Mob textures'],
    formulaHelpRu: 'Стандартный скин: 400 ₽. HD скин (повышенная детализация): 800 ₽.',
    formulaHelpEn: 'Standard Skin: 400 ₽. HD Skin (enhanced details): 800 ₽.',
    examplesRu: [
      { size: 'Стандартный', price: '400 ₽' },
      { size: 'HD-текстура', price: '800 ₽' }
    ],
    examplesEn: [
      { size: 'Standard Skin', price: '400 ₽' },
      { size: 'HD Texture', price: '800 ₽' }
    ],
    imagePath: '/images/cat7.gif'
  },
  {
    id: '8',
    nameRu: 'Иное (Нестандартные задачи)',
    nameEn: 'Other (Non-standard tasks)',
    descriptionRu: 'Любые нестандартные, специфические или комплексные арт-задачи.',
    descriptionEn: 'Any non-standard, highly specific, or complex pixel art requests.',
    pointsRu: [
      'Разработка кастомных графических форматов, эффектов частиц, Картин и концепт-арта.'
    ],
    pointsEn: [
      'Custom graphic configurations, particle effects, Paintings, and pixel concepts.'
    ],
    basePrice: 1000,
    pixelPrice: 8,
    maxBaseSize: 512,
    supportsAnimation: true,
    useCasesRu: ['Картины', 'эффекты частиц', 'кастомные концепты'],
    useCasesEn: ['Paintings', 'particle states', 'custom pixel concepts'],
    formulaHelpRu: 'Базовая ставка 1000 ₽ + 8 ₽ за пиксель размера.',
    formulaHelpEn: 'Base rate 1000 ₽ + 8 ₽ per pixel of size.',
    examplesRu: [
      { size: '32x32', price: '1256 ₽' }
    ],
    examplesEn: [
      { size: '32x32', price: '1256 ₽' }
    ],
    imagePath: '/images/cat8.gif' // reuse items as fallback
  }
];

export const TRANSLATIONS = {
  ru: {
    title: 'Village_',
    subtitle: 'PriceList',
    categoryTitle: 'Категории услуг / Pixel Art',
    currencySelect: 'Валюта:',
    languageSelect: 'Язык / Language:',
    rub: 'Рубль (₽)',
    usd: 'Доллар ($)',
    calculatorTitle: 'Калькулятор стоимости Pixel Art',
    calculatorSubtitle: 'Интерактивный конструктор стоимости и генератор технического задания для художника.',
    addAssetBtn: '+ Добавить новый ассет в спецификацию',
    globalParamsTitle: 'Глобальные параметры заказа',
    queueUrgency: 'Сроки и приоритет выполнения заказа:',
    moderateQueue: 'Умеренно (Базовый приоритет)',
    priorityQueue: 'Приоритет в очереди (+25% к цене)',
    speedHelpTitle: 'Режимы распределения задач:',
    speedHelpModerate: 'Разработка проходит в стандартном порядке очереди. Без наценок.',
    speedHelpPriority: 'Задача помещается в начало очереди разработки. Наценка составляет 25%.',
    calculationLogBtn: 'Лог расчетов',
    totalPriceLabel: 'Итоговая стоимость заказа',
    prepaymentLabel: 'Размер предоплаты',
    calculationLogTitle: 'Лог математических калькуляций:',
    calculationLogEmpty: 'Добавьте ассеты для запуска калькуляций...',
    validationBanner: 'Заполните обязательные описания всех ассетов в списке выше, чтобы сформировать корректное ТЗ.',
    specificationTitle: 'Готовое техническое задание',
    generateTzBtn: 'Сгенерировать ТЗ',
    copyTzBtn: 'Копировать в буфер',
    downloadTzBtn: 'Скачать .TXT',
    tzPlaceholder: 'Заполните характеристики выше и нажмите кнопку «Сгенерировать ТЗ» для создания чистого технического файла для автора...',
    assetCardTitle: 'Спрайт №',
    deleteBtn: 'Удалить',
    categoryLabel: 'Категория графики:',
    resolutionLabel: 'Разрешение холста (px):',
    customResolution: 'Свое разрешение...',
    quantityLabel: 'Количественный объем:',
    mainSprites: 'Основные спрайты:',
    variantsSprites: 'Дополнительные варианты (50% стоимости):',
    variantsHelpTitle: 'Объемы заказа и вариации:',
    variantsHelpInfo: 'Создание уникальных графических сущностей требует разработки с нуля. Дополнительные варианты оцениваются дешевле.',
    variantsHelpDef: 'Дополнительные варианты (подвиды) — это модификации основного спрайта (перекрас, небольшая модификация формы, смена свечения). Они стоят ровно 50% от расчетной стоимости оригинального спрайта.',
    addAnimationLabel: 'Добавить анимацию к ассету',
    animHelpTitle: 'Как рассчитывается анимация:',
    animHelpP1: 'Первый кадр уже включен в базовую стоимость ассета.',
    animHelpP2: 'Каждый последующий кадр повышает стоимость исходного спрайта на +20%.',
    animCalcMethod: 'Метод расчета кадров:',
    animMethodDirect: 'Указать точное число кадров вручную',
    animMethodCalc: 'Рассчитать по длительности и задержке',
    animFramesCount: 'Количество кадров анимации:',
    animDurationLabel: 'Длительность анимации (сек):',
    animDelayLabel: 'Задержка между кадрами (сек):',
    taskDescriptionLabel: '* Описание задачи (Обязательное поле):',
    taskDescPlaceholder: 'Например: Посох Некроманта с зеленым светящимся кристаллом',
    descRequiredError: 'Поле обязательно для генерации итогового ТЗ!',
    spriteAutoCalcNote: 'Стоимость рассчитывается автоматически на основе параметров',
    positionPriceLabel: 'Стоимость этой позиции:',
    copiedSuccess: 'ТЗ скопировано в буфер обмена!',
    generateAlert: 'Сначала сгенерируйте ТЗ!',
    specEmptyAlert: 'Спецификация пуста!',
    standardSkin: 'Стандартный скин (64x64 / 64x32)',
    hdSkin: 'HD Скин (Цена умножается на 2)',
    skinTypeLabel: 'Тип скина:',
    skinHelpTitle: 'Minecraft Текстуры:',
    skinHelpP1: 'Стандартная: Базовая ванильная модель.',
    skinHelpP2: 'Увеличенная (HD): Модель повышенной четкости (Цена х2).',
    canvasResolutionHelpTitle: 'Размер холста:',
    canvasResolutionHelpInfo: 'Линейное разрешение напрямую влияет на возможную детализацию изображения. Для экстремально больших разрешений, превышающих установленный лимит категории, включается прогрессивный штрафной коэффициент (+0.5% за каждый пиксель превышения), так как сложность отрисовки растет нелинейно.',
    sizeThresholdLimit: 'Лимит размера этой категории:',
    overLimitPriceWarning: 'При превышении: +0.5% к цене за каждый лишний пиксель габарита!',
    baseSizeThresholdInfo: 'Штрафной порог:',
    standardText: 'Стандартный',
    hdText: 'HD-текстура',
    useCasesTitle: 'Используется для:',
    howCalculatedTitle: 'Как рассчитывается:',
    approxStaticPriceTitle: 'Примерная стоимость статики:',
    exchangeRateNote: '* Курс доллара: 1 $ ≈ {rate} ₽',
    tzIntro: 'ЗДРАВСТВУЙТЕ! Я СФОРМИРОВАЛ ТЗ ЧЕРЕЗ КАЛЬКУЛЯТОР.\n',
    tzPosition: 'ПОЗИЦИЯ №',
    tzCategory: 'Категория',
    tzSize: 'Размер',
    tzAnimation: 'Анимация',
    tzFrames: 'кадр(ов)',
    tzQuantity: 'Количество',
    tzOriginals: 'Оригиналов',
    tzVariants: 'Подвидов',
    tzDescription: 'Описание',
    tzPriority: 'ПРИОРИТЕТ СРОКОВ',
    tzTotalPrice: 'ИТОГОВАЯ СТОИМОСТЬ',
    tzPrepayment: 'ПРЕДОПЛАТА',
    tzUrlNote: 'Ссылка на калькулятор автора: Village_',
    tzQueuePriority: 'Приоритет (наценка 25%)',
    tzQueueModerate: 'Умеренно',
    calculationLogHeader: 'Лог математических калькуляций:',
    artistDescription: 'Пиксельный художник со стажем 5+ лет.\nРисую в различных стилях: от простого пиксель арта, до стиля Terraria или Calamity.\nПредпочтительнее к цветному, детальному, разнообразному стилю.',
    termsTitle: 'Условия сотрудничества & Правила',
    termsCredits: 'Указание авторства:',
    termsCreditsText: 'Размещение моего имени либо ссылки в ваших проектах. Например: Sprite Artist: Village_',
    termsWhatIOffer: 'Что предоставляю я:',
    offer1: 'Бесплатную корректировку заказа в процессе работы (в разумных пределах)',
    offer2: 'Показ процесса работы на каждом этапе (по желанию заказчика)',
    offer3: 'Полную конфиденциальность',
    offer4: 'Аккуратную организацию и подготовку файлов',
    offer5: 'Консультацию по внедрению в проект (при необходимости)',
    offer6: 'Соблюдение сроков. Гарантирую своевременное информирование и согласование в случае корректировки графика. При задержке сдачи по вине исполнителя предоставляется компенсационная скидка 10% (за исключением форс-мажоров и задержек со стороны заказчика).',
    termsWhatIsForbidden: 'Что НЕЛЬЗЯ заказывать:',
    forbid1: 'NSFW контент / Эротика',
    forbid2: 'Кровь и чрезмерное насилие',
    forbid3: 'Жестокость',
    forbid4: 'Современная военная тематика',
    scrollToCalcBtn: 'Переместиться на Калькулятор',
    sendToSocialsBtn: 'Отправить в соц. сети',
    telegram: 'Телеграм',
    discord: 'Дискорд',
    email: 'Почта',
    noDeadlineBtn: 'Без дедлайна',
    noDeadlineDesc: 'Убирает все будущие дедлайны и ставит заказ на долгосрочное ожидание. Предоставляет скидку 15% на весь заказ.',
    noDeadlineSurchargeNote: '(Скидка 15% не действует при полной загруженности очереди)',
    loadStatusLabel: 'Загруженность очереди:',
    loadStatusFree: 'Свободный',
    loadStatusMedium: 'Средний (+20% на весь заказ)',
    loadStatusFull: 'Полный (+35% на весь заказ)',
    loadStatusFullNoDeadline: 'Полный (+35%, только без дедлайна)',
    orderBlockedWarning: 'Внимание! Прием стандартных заказов временно приостановлен из-за полной загруженности исполнителя. Размещение заказа возможно только с опцией «Без дедлайна» (действует наценка +35%, скидка 15% отключена).'
  },
  en: {
    title: 'Village_',
    subtitle: 'PriceList',
    categoryTitle: 'Service Categories / Pixel Art',
    currencySelect: 'Currency:',
    languageSelect: 'Language / Язык:',
    rub: 'Ruble (₽)',
    usd: 'US Dollar ($)',
    calculatorTitle: 'Pixel Art Price Calculator',
    calculatorSubtitle: 'Interactive price builder and technical specification generator for clients.',
    addAssetBtn: '+ Add a new asset to specification',
    globalParamsTitle: 'Global Order Parameters',
    queueUrgency: 'Project timeframe & execution priority:',
    moderateQueue: 'Moderate (Standard queue)',
    priorityQueue: 'Priority queue (+25% price rate)',
    speedHelpTitle: 'Task queue modes:',
    speedHelpModerate: 'The work is done in standard queue order. No extra fees.',
    speedHelpPriority: 'Task is moved to the top of the queue. Extra rate of +25% is applied.',
    calculationLogBtn: 'Calculation Log',
    totalPriceLabel: 'Total Order Price',
    prepaymentLabel: 'Required Prepayment',
    calculationLogTitle: 'Mathematical Calculation Log:',
    calculationLogEmpty: 'Add assets to launch calculators...',
    validationBanner: 'Please fill in required descriptions for all assets in the list to generate correct Technical Specification.',
    specificationTitle: 'Generated Technical Specification (TZ)',
    generateTzBtn: 'Generate TZ',
    copyTzBtn: 'Copy to Clipboard',
    downloadTzBtn: 'Download .TXT',
    tzPlaceholder: 'Fill in the options above and click "Generate TZ" to create a clean text specification for the artist...',
    assetCardTitle: 'Sprite #',
    deleteBtn: 'Delete',
    categoryLabel: 'Graphic Category:',
    resolutionLabel: 'Canvas Resolution (px):',
    customResolution: 'Custom resolution...',
    quantityLabel: 'Quantity & Volume:',
    mainSprites: 'Original sprites:',
    variantsSprites: 'Additional variants (50% cost):',
    variantsHelpTitle: 'Volumes and Variations:',
    variantsHelpInfo: 'Creating completely unique graphical objects requires crafting them from scratch. Additional variations are cheaper.',
    variantsHelpDef: 'Additional variations (recolors/minor edits) are modifications of the original sprite (recoloring, small shape edits, glow toggles). They cost exactly 50% of the calculated cost of the original sprite.',
    addAnimationLabel: 'Add animation to asset',
    animHelpTitle: 'Animation pricing logic:',
    animHelpP1: 'The first frame is already included in the base sprite price.',
    animHelpP2: 'Each subsequent frame increases the price of the original sprite by +20%.',
    animCalcMethod: 'Frame Count Calculation Method:',
    animMethodDirect: 'Specify exact frame count manually',
    animMethodCalc: 'Calculate based on duration and frame delay',
    animFramesCount: 'Number of Animation Frames:',
    animDurationLabel: 'Animation Duration (seconds):',
    animDelayLabel: 'Delay Between Frames (seconds):',
    taskDescriptionLabel: '* Task Description (Required Field):',
    taskDescPlaceholder: 'Example: Necromancer Staff with a glowing green crystal',
    descRequiredError: 'This field is required to generate the final specification!',
    spriteAutoCalcNote: 'Price is calculated automatically based on configuration',
    positionPriceLabel: 'Cost of this item:',
    copiedSuccess: 'TZ successfully copied to clipboard!',
    generateAlert: 'Please generate the TZ first!',
    specEmptyAlert: 'The asset list is empty!',
    standardSkin: 'Standard Skin (64x64 / 64x32)',
    hdSkin: 'HD Skin (Price is doubled)',
    skinTypeLabel: 'Skin Type:',
    skinHelpTitle: 'Minecraft Textures:',
    skinHelpP1: 'Standard: Vanilla player model skin layout.',
    skinHelpP2: 'Enhanced (HD): Double-resolution skin layout (Price x2).',
    canvasResolutionHelpTitle: 'Canvas Size:',
    canvasResolutionHelpInfo: 'Linear resolution directly impacts detail level. For extremely large sizes exceeding the category limit, a progressive penalty of +0.5% is applied for each additional pixel of dimensions, as complex artwork scaling is non-linear.',
    sizeThresholdLimit: 'Size limit for this category:',
    overLimitPriceWarning: 'When exceeded: +0.5% rate for each pixel over the threshold!',
    baseSizeThresholdInfo: 'Penalty threshold:',
    standardText: 'Standard',
    hdText: 'HD Texture',
    useCasesTitle: 'Used for:',
    howCalculatedTitle: 'How it is calculated:',
    approxStaticPriceTitle: 'Approximate static sprite price:',
    exchangeRateNote: '* Exchange rate: 1 $ ≈ {rate} ₽',
    tzIntro: 'HELLO! I HAVE CREATED A TECHNICAL SPECIFICATION VIA CALCULATOR.\n',
    tzPosition: 'ITEM #',
    tzCategory: 'Category',
    tzSize: 'Size',
    tzAnimation: 'Animation',
    tzFrames: 'frame(s)',
    tzQuantity: 'Quantity',
    tzOriginals: 'Originals',
    tzVariants: 'Variants',
    tzDescription: 'Description',
    tzPriority: 'QUEUE TIMEFRAME',
    tzTotalPrice: 'TOTAL PRICE',
    tzPrepayment: 'PREPAYMENT',
    tzUrlNote: 'Link to author\'s calculator: Village_',
    tzQueuePriority: 'Priority (extra +25% rate)',
    tzQueueModerate: 'Moderate',
    calculationLogHeader: 'Mathematical Calculation Log:',
    artistDescription: 'Pixel artist with 5+ years of experience.\nI draw in various styles: from simple pixel art to Terraria or Calamity styles.\nPreferring a colorful, detailed, and diverse style.',
    termsTitle: 'Working Terms & Guidelines',
    termsCredits: 'Attribution:',
    termsCreditsText: 'Including my name or a link in your projects. Example: Sprite Artist: Village_',
    termsWhatIOffer: 'What I Provide:',
    offer1: 'Free order adjustments during the workflow (within reasonable limits)',
    offer2: 'Demonstration of progress at every stage (upon client\'s request)',
    offer3: 'Complete confidentiality / NDA compliance',
    offer4: 'Neat file organization and structuring',
    offer5: 'Integration consultation (by request)',
    offer6: 'Strict Adherence to Deadlines. I guarantee timely notification and mutual agreement in case of schedule adjustments. If delivery is delayed due to my sole responsibility, a 10% compensatory discount is applied (excluding force majeure or client-side delays).',
    termsWhatIsForbidden: 'What is FORBIDDEN to order:',
    forbid1: 'NSFW content / Erotica',
    forbid2: 'Blood & gore',
    forbid3: 'Violence',
    forbid4: 'Modern military themes',
    scrollToCalcBtn: 'Go to Calculator',
    sendToSocialsBtn: 'Send to Socials',
    telegram: 'Telegram',
    discord: 'Discord',
    email: 'Email',
    noDeadlineBtn: 'No Deadline',
    noDeadlineDesc: 'Removes all future deadlines and sets the order to long-term waiting. Provides a 15% discount on the entire order.',
    noDeadlineSurchargeNote: '(15% discount is deactivated under full load status)',
    loadStatusLabel: 'Queue Load Status:',
    loadStatusFree: 'Free',
    loadStatusMedium: 'Medium (+20% on entire order)',
    loadStatusFull: 'Full (+35% on entire order)',
    loadStatusFullNoDeadline: 'Full (+35%, only No Deadline allowed)',
    orderBlockedWarning: 'Notice! Standard orders are temporarily suspended due to full workload. Ordering is only available with the "No Deadline" option selected (+35% surcharge applies, 15% discount is deactivated).'
  }
};
