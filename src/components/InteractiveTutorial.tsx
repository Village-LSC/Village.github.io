import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Box,
  Palette,
  Zap,
  Plus,
  Settings,
  FileText,
  CheckCircle2,
  Sliders,
  HelpCircle,
  Calculator,
  MousePointerClick,
  Check,
  Flame,
  Clock,
  Play,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward
} from 'lucide-react';

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ru' | 'en';
  onCollapseCard?: (collapsed: boolean) => void;
}

interface SubStepDefinition {
  id: string;
  targetId: string;
  titleRu: string;
  titleEn: string;
  contentRu: string;
  contentEn: string;
  actionHintRu: string;
  actionHintEn: string;
}

interface StepDefinition {
  id: string;
  icon: React.ElementType;
  titleRu: string;
  titleEn: string;
  badgeRu: string;
  badgeEn: string;
  subSteps: SubStepDefinition[];
}

const STEPS: StepDefinition[] = [
  {
    id: 'category',
    icon: Layers,
    titleRu: '1. Выбор категории ассета',
    titleEn: '1. Asset Category Selection',
    badgeRu: 'Категория',
    badgeEn: 'Category',
    subSteps: [
      {
        id: 'cat-select',
        targetId: 'tour-category-select',
        titleRu: '1.1 Выбор типа категории',
        titleEn: '1.1 Select Category Type',
        contentRu: 'Выберите тип создаваемой графики (Спрайты персонажей/мобов, Иконки, Элементы GUI, Тайлсеты или Скины Minecraft). Категория задает базовые расценки и формулу.',
        contentEn: 'Select asset category type (Sprites, Icons, GUI Elements, Tilesets, or Minecraft Skins). Category determines base rate and calculation formula.',
        actionHintRu: 'Нажмите на категорию, чтобы сменить её, или продолжите',
        actionHintEn: 'Click category to switch, or continue'
      },
      {
        id: 'cat-info',
        targetId: 'tour-category-info',
        titleRu: '1.2 Шоукейс и примеры',
        titleEn: '1.2 Showcase & Standards',
        contentRu: 'В этом блоке наглядно демонстрируются примеры пиксель-арта выбранной категории, каноничные стандарты разрешения и уровень детализации.',
        contentEn: 'This showcase displays visual pixel-art benchmarks, canonical resolution rules, and detail standards for the selected category.',
        actionHintRu: 'Ознакомьтесь с примерами и стандартами',
        actionHintEn: 'Review the showcase benchmarks'
      },
      {
        id: 'cat-formula',
        targetId: 'tour-category-formula',
        titleRu: '1.3 Тарифная формула категории',
        titleEn: '1.3 Category Pricing Formula',
        contentRu: 'Кнопка «Формула расчета ?» открывает подробные расценки, базовые коэффициенты и рекомендации по подбору размеров под игровой движок.',
        contentEn: 'Click "Formula ?" to inspect base prices, multipliers, and resolution recommendations for game engines.',
        actionHintRu: 'Кликните по кнопке формулы или перейдите дальше',
        actionHintEn: 'Click formula button or proceed'
      }
    ]
  },
  {
    id: 'dimensions',
    icon: Box,
    titleRu: '2. Разрешение и Количество (Оригиналы vs Доп. варианты)',
    titleEn: '2. Resolution & Quantities (Originals vs Additional Variants)',
    badgeRu: 'Размер & Копии',
    badgeEn: 'Size & Copies',
    subSteps: [
      {
        id: 'dim-presets',
        targetId: 'tour-dim-presets',
        titleRu: '2.1 Выбор пресетов разрешения',
        titleEn: '2.1 Preset Resolution Pick',
        contentRu: 'Выберите нужное разрешение холста (16x16, 32x32, 64x64, 128x128 и т.д.). Чем меньше размер относительно стандарта категории, тем дешевле базовая стоимость.',
        contentEn: 'Select canvas resolution preset (16x16, 32x32, 64x64, 128x128). Smaller sizes relative to standard receive base price discounts.',
        actionHintRu: 'Кликните любой размерный пресет',
        actionHintEn: 'Click any dimension preset'
      },
      {
        id: 'dim-custom',
        targetId: 'tour-dim-custom',
        titleRu: '2.2 Произвольные размеры W × H',
        titleEn: '2.2 Custom Canvas Dimensions',
        contentRu: 'Вы можете вводить любые индивидуальные размеры холста (вплоть до 1024×1024 пикселей). Калькулятор мгновенно пересчитает размерный фактор.',
        contentEn: 'Enter custom pixel dimensions up to 1024x1024. The calculator automatically computes dimensional complexity factors.',
        actionHintRu: 'Кликните на поле ввода ширины/высоты',
        actionHintEn: 'Click on width/height input field'
      },
      {
        id: 'qty-orig-var',
        targetId: 'tour-qty-variants',
        titleRu: '2.3 Оригиналы и Доп. варианты (Вариации 50%)',
        titleEn: '2.3 Originals & Additional Variants (50% Cost)',
        contentRu: 'Оригинал рисуется с нуля. Доп. варианты — это альтернативные версии готового спрайта (перекрас палитры, альтернативная броня, другое оружие). Вариации стоят ровно 50% от цены оригинала!',
        contentEn: 'Originals are drawn from scratch. Additional variants are alternate styles of the base sprite (palette changes, gear swaps). Variants cost exactly 50% of original price!',
        actionHintRu: 'Нажмите кнопки «+» / «-» для изменения количества доп. вариантов',
        actionHintEn: 'Click "+" or "-" buttons to adjust variant count'
      }
    ]
  },
  {
    id: 'concept',
    icon: Palette,
    titleRu: '3. Концепт, Стиль и 3D Перспектива',
    titleEn: '3. Concept, Style & 3D Perspective',
    badgeRu: 'Концепт & Стиль',
    badgeEn: 'Concept & Style',
    subSteps: [
      {
        id: 'concept-mode',
        targetId: 'tour-concept-mode',
        titleRu: '3.1 По референсу vs Дизайн с нуля',
        titleEn: '3.1 From Reference vs Scratch Design',
        contentRu: 'Если у вас есть готовый арт/скриншот — выберите "По референсу" (1.0x). Если художнику нужно придумывать внешний вид с нуля — выберите "Дизайн с нуля" (+25% к цене).',
        contentEn: 'Provide references for standard pricing (1.0x) or select "Scratch Design" (+25% price) if unique visual development is required.',
        actionHintRu: 'Кликните на переключатель "Дизайн с нуля"',
        actionHintEn: 'Click on "Scratch Design" toggle'
      },
      {
        id: 'style-select',
        targetId: 'tour-style-select',
        titleRu: '3.2 Специфический стиль / Палитра',
        titleEn: '3.2 Target Style & Specific Palette',
        contentRu: 'При необходимости попадания в строгий стиль проекта (например, стилистика Terraria, Stardew Valley, Hotline Miami) выберите "Определённый стиль" (+25% к очкам сложности).',
        contentEn: 'If matching a strict external game style (e.g. Terraria, Stardew Valley) is required, select "Specific Style" (+25% score boost).',
        actionHintRu: 'Кликните карточку выбора стиля',
        actionHintEn: 'Click on style selection card'
      },
      {
        id: 'perspective-3d',
        targetId: 'tour-3d-toggle',
        titleRu: '3.3 Объёмная 3D / Изометрическая перспектива',
        titleEn: '3.3 Volumetric 3D / Isometric Perspective',
        contentRu: 'Рисование в изометрии (3/4, top-down 3D) требует точного построения объёма и сетки. Включение этой опции добавляет +50% к очкам сложности.',
        contentEn: 'Isometric or top-down 3D views require complex spatial grid alignment. Toggling this adds +50% to total complexity score.',
        actionHintRu: 'Кликните переключатель объёмной перспективы',
        actionHintEn: 'Click the volumetric perspective toggle'
      }
    ]
  },
  {
    id: 'animation',
    icon: Zap,
    titleRu: '4. Параметры пиксельной анимации',
    titleEn: '4. Pixel Animation Options',
    badgeRu: 'Анимация',
    badgeEn: 'Animation',
    subSteps: [
      {
        id: 'anim-toggle',
        targetId: 'tour-anim-toggle',
        titleRu: '4.1 Включение анимации',
        titleEn: '4.1 Enable Animation Mode',
        contentRu: 'Активируйте флажок анимации, если спрайту требуется покадровая динамика (атака, бег, idle, эффект магии, взрыв).',
        contentEn: 'Toggle animation mode if sprite requires frame-by-frame movement (walk cycle, attack, idle loop, magic effect).',
        actionHintRu: 'Включите переключатель анимации',
        actionHintEn: 'Toggle the animation switch'
      },
      {
        id: 'anim-frames',
        targetId: 'tour-anim-frames',
        titleRu: '4.2 Количество кадров',
        titleEn: '4.2 Frame Count',
        contentRu: 'Укажите нужное число кадров в анимации. Каждая анимация высчитывается с высокой точностью: очки сложности начисляются за каждый кадр в зависимости от его динамики.',
        contentEn: 'Specify frame count. Complexity points are calculated per frame depending on movement complexity.',
        actionHintRu: 'Измените количество кадров анимации',
        actionHintEn: 'Adjust the frame count field'
      },
      {
        id: 'anim-complexity',
        targetId: 'tour-anim-complexity',
        titleRu: '4.3 Тип сложности движения (0.25 / 0.5 / 1.0 pts)',
        titleEn: '4.3 Motion Complexity (0.25 / 0.5 / 1.0 pts)',
        contentRu: 'Простое движение (0.25 pts/кадр) — лёгкий покачивающийся idle. Среднее (0.5 pts) — бег/атака. Сложное (1.0 pts) — разворот тела, спецэффекты и динамика одежды.',
        contentEn: 'Simple (0.25 pts/fr) — idle swaying. Medium (0.5 pts) — run/attack. Complex (1.0 pts) — full body rotation, cloth dynamics, particle FX.',
        actionHintRu: 'Кликните выбор сложности движения',
        actionHintEn: 'Click on motion complexity selector'
      }
    ]
  },
  {
    id: 'complexity-card',
    icon: Flame,
    titleRu: '5. Шкала сложности (PTS) и Оценка стоимости',
    titleEn: '5. Complexity Bar (PTS) & Pricing',
    badgeRu: 'Сложность & Цена',
    badgeEn: 'Complexity & Cost',
    subSteps: [
      {
        id: 'pts-bar',
        targetId: 'tour-pts-bar',
        titleRu: '5.1 Интерактивный бар сложности (PTS)',
        titleEn: '5.1 Interactive Complexity Bar (PTS)',
        contentRu: 'Это главный индикатор трудоёмкости! Он суммирует все параметры (размер, детализация, стиль, кадры) в единое число баллов сложности (от 0 до 100+ PTS).',
        contentEn: 'The core effort metric! Combines canvas size, detail, style, and frames into unified Complexity Points (0 to 100+ PTS).',
        actionHintRu: 'Изучите виджет шкалы сложности',
        actionHintEn: 'Inspect the complexity score bar widget'
      },
      {
        id: 'pts-value',
        targetId: 'tour-pts-value',
        titleRu: '5.2 Категория сложности (Низкая / Оптимальная / Экстремальная)',
        titleEn: '5.2 Difficulty Tier (Low / Optimal / Extreme)',
        contentRu: 'В зависимости от набранных PTS определяется категория (Низкая, Оптимальная, Средняя, Умеренная, Сложная, Экстремальная). При превышении 100 PTS включается лимит!',
        contentEn: 'PTS range dictates tier level (Low, Optimal, Moderate, Complex, Extreme). Going over 100 PTS triggers over-limit warnings.',
        actionHintRu: 'Посмотрите текущие очки сложности',
        actionHintEn: 'Observe the complexity score'
      },
      {
        id: 'item-price',
        targetId: 'tour-item-price',
        titleRu: '5.3 Стоимость текущей позиции',
        titleEn: '5.3 Current Position Price Breakdown',
        contentRu: 'Здесь отображается итоговая стоимость текущей выбранной позиции с учётом всех выбранных модификаторов, сложности, количества оригиналов и доп. вариантов.',
        contentEn: 'Shows exact price for the currently edited asset position accounting for all active multipliers, complexity points, and quantities.',
        actionHintRu: 'Посмотрите на итоговую цену этой позиции',
        actionHintEn: 'Observe the subtotal price of this position'
      }
    ]
  },
  {
    id: 'card-controls',
    icon: Plus,
    titleRu: '6. Управление позициями ТЗ',
    titleEn: '6. Spec Position Management',
    badgeRu: 'Позиции',
    badgeEn: 'Positions',
    subSteps: [
      {
        id: 'card-header',
        targetId: 'tour-card-header',
        titleRu: '6.1 Сворачивание и заголовок карточки',
        titleEn: '6.1 Card Header & Collapse Toggle',
        contentRu: 'Вы можете кликнуть по шапке карточки, чтобы свернуть её в компактный плашка-вид для удобного обзора крупного заказа.',
        contentEn: 'Click card header to collapse asset card into compact mini-badge view for clean overview of large orders.',
        actionHintRu: 'Кликните шапку карточки для сворачивания/разворачивания',
        actionHintEn: 'Click card header to expand/collapse'
      },
      {
        id: 'card-controls-sub',
        targetId: 'tour-card-collapsed',
        titleRu: '6.2 Свёрнутое окно позиции и сводка',
        titleEn: '6.2 Collapsed Position Window & Summary',
        contentRu: 'Вот так выглядит карточка позиции в свёрнутом виде! В ней наглядно отображаются все ключевые параметры (разрешение, тип анимации, кол-во вариантов и комментарий) без загромождения интерфейса.',
        contentEn: 'This is what the collapsed position window looks like! It neatly displays key specs (resolution, animation, quantities, note) without cluttering the screen.',
        actionHintRu: 'Ознакомьтесь со свёрнутым видом позиции',
        actionHintEn: 'Review the collapsed position view'
      },
      {
        id: 'add-btn',
        targetId: 'tour-add-btn',
        titleRu: '6.3 Добавление новой позиции в ТЗ',
        titleEn: '6.3 Add New Asset Position',
        contentRu: 'Нажмите «+ Добавить ещё позицию», чтобы добавить в общий заказ другой спрайт (например, персонажа + иконки + элементы меню).',
        contentEn: 'Click "+ Add another asset" to include multiple items in one order (e.g. character + icons + GUI elements).',
        actionHintRu: 'Кликните кнопку добавления позиции',
        actionHintEn: 'Click add position button'
      }
    ]
  },
  {
    id: 'deadlines',
    icon: Clock,
    titleRu: '7. Сроки исполнения и Режим "Без дедлайна"',
    titleEn: '7. Timelines & "No Deadline" Discount',
    badgeRu: 'Сроки & Наценки',
    badgeEn: 'Schedules',
    subSteps: [
      {
        id: 'priority-toggle',
        targetId: 'tour-priority-toggle',
        titleRu: '7.1 Приоритетный / Срочный заказ',
        titleEn: '7.1 Priority / Urgent Order',
        contentRu: 'Если вам требуются готовые ассеты в сжатые сроки — переключите приоритетный режим (+50% к стоимости за наивысший приоритет в очереди).',
        contentEn: 'Need sprites urgently? Enable priority deadline (+50% cost for top queue priority execution).',
        actionHintRu: 'Кликните кнопку приоритетного заказа',
        actionHintEn: 'Click priority order toggle'
      },
      {
        id: 'no-deadline',
        targetId: 'tour-no-deadline',
        titleRu: '7.2 Режим "Без дедлайна" (Гибкий график)',
        titleEn: '7.2 "No Deadline" Mode',
        contentRu: 'Если заказ не горит по срокам, режим без дедлайна даёт художнику гибкость и убирает временное давление.',
        contentEn: 'When time is not tight, flexible schedule allows comfortable execution without rush pressure.',
        actionHintRu: 'Кликните на карточку "Без дедлайна"',
        actionHintEn: 'Click "No deadline" option card'
      }
    ]
  },
  {
    id: 'calculation-log',
    icon: Calculator,
    titleRu: '8. Лог расчётов и Справочник формул',
    titleEn: '8. Price Calculation Log & Formula Manual',
    badgeRu: 'Лог & Математика',
    badgeEn: 'Math Log',
    subSteps: [
      {
        id: 'log-terminal',
        targetId: 'tour-log-terminal',
        titleRu: '8.1 Терминал математического лога',
        titleEn: '8.1 Mathematical Calculation Terminal',
        contentRu: 'Нажмите «Лог расчётов стоимости», чтобы открыть подробнейшую выкладку всех формул, множителей, базовых ставок и скидок по каждому спрайту!',
        contentEn: 'Click "Price Calculation Log" to reveal detailed formula mathematical breakdowns, base rates, and exact multipliers.',
        actionHintRu: 'Кликните на кнопку раскрытия лога расчётов',
        actionHintEn: 'Click button to open calculation log'
      },
      {
        id: 'log-rules',
        targetId: 'tour-log-rules',
        titleRu: '8.2 Справочник правил и таблиц надбавок',
        titleEn: '8.2 Rules Reference & Surcharge Tables',
        contentRu: 'Внутри лога доступен полнейший справочник: таблица шкалы предоплаты (от 50% до 10%), таблица очков сложности (PTS) и правила оптовых скидок.',
        contentEn: 'Inside log lies full manual: prepayment scale table (50% down to 10%), complexity score ranges, and volume discount rules.',
        actionHintRu: 'Нажмите на справочник правил внутри лога',
        actionHintEn: 'Click rules reference drawer'
      }
    ]
  },
  {
    id: 'summary-spec',
    icon: FileText,
    titleRu: '9. Итоговая цена, Предоплата и Генерация ТЗ',
    titleEn: '9. Total Price, Prepayment & Spec Generator',
    badgeRu: 'Итог & Генератор ТЗ',
    badgeEn: 'Summary & Spec',
    subSteps: [
      {
        id: 'summary-price',
        targetId: 'tour-summary-price',
        titleRu: '9.1 Виджет итоговой стоимости и Предоплаты',
        titleEn: '9.1 Total Price & Prepayment Widget',
        contentRu: 'Здесь видна общая сумма заказа и размер предоплаты. Процент предоплаты снижается автоматически (от 50% до 10%) при увеличении бюджета заказа!',
        contentEn: 'Shows total order budget and required deposit. Deposit percentage drops automatically (from 50% down to 10%) as order budget grows!',
        actionHintRu: 'Посмотрите на виджет итоговой стоимости',
        actionHintEn: 'Inspect total price summary widget'
      },
      {
        id: 'summary-discount',
        targetId: 'tour-summary-discount',
        titleRu: '9.2 Накопительная оптовая скидка (до -50%)',
        titleEn: '9.2 Cumulative Volume Discount (up to -50%)',
        contentRu: 'Шкала опта отслеживает общее число спрайтов в заказе: от 11 до 50 шт (-25%), свыше 50 шт (-50% на последующие оригиналы)!',
        contentEn: 'Volume tracker monitors total sprites: 11 to 50 pcs (-25%), 50+ pcs (-50% discount on additional originals)!',
        actionHintRu: 'Посмотрите на прогресс-бар оптовой скидки',
        actionHintEn: 'Check volume discount progress bar'
      },
      {
        id: 'summary-spec',
        targetId: 'tour-summary-spec',
        titleRu: '9.3 Генерация готового ТЗ для художника',
        titleEn: '9.3 Export Ready Specification for Artist',
        contentRu: 'Нажмите «Сформировать ТЗ», чтобы скопировать красиво оформленный текстовый документ или сгенерировать PNG-карточку ТЗ для отправки в Telegram/Discord!',
        contentEn: 'Click "Generate Spec" to copy formatted text specification or export PNG document to send directly in Telegram/Discord!',
        actionHintRu: 'Кликните кнопку «Сформировать ТЗ»',
        actionHintEn: 'Click "Generate Spec" button'
      }
    ]
  }
];

export function InteractiveTutorial({ isOpen, onClose, lang, onCollapseCard }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentSubStep, setCurrentSubStep] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // 5-second observation delay state
  const [isDelaying, setIsDelaying] = useState<boolean>(false);
  const [delayProgress, setDelayProgress] = useState<number>(5.0); // seconds
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const delayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Highlight spotlight element positioning ref
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const activeStep = STEPS[currentStep] || STEPS[0];
  const activeSubStep = activeStep.subSteps[currentSubStep] || activeStep.subSteps[0];
  const isRu = lang === 'ru';

  const onCollapseCardRef = useRef(onCollapseCard);
  useEffect(() => {
    onCollapseCardRef.current = onCollapseCard;
  });

  // Clear timers helper
  const clearDelayTimers = () => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (delayIntervalRef.current) {
      clearInterval(delayIntervalRef.current);
      delayIntervalRef.current = null;
    }
  };

  // Reset delay on step/substep change
  useEffect(() => {
    clearDelayTimers();
    setIsDelaying(false);
    setDelayProgress(5.0);
  }, [currentStep, currentSubStep, isOpen]);

  // Handle auto-collapsing card on step 6 sub-step 2
  useEffect(() => {
    if (!isOpen) return;

    if (activeSubStep.id === 'card-controls-sub') {
      onCollapseCardRef.current?.(true);
    } else {
      onCollapseCardRef.current?.(false);
    }
  }, [isOpen, activeSubStep.id]);

  // Handle advancing to next substep
  const proceedToNextSubStep = () => {
    clearDelayTimers();
    setIsDelaying(false);
    setDelayProgress(5.0);

    if (currentSubStep < activeStep.subSteps.length - 1) {
      setCurrentSubStep(prev => prev + 1);
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCurrentSubStep(0);
    } else {
      onClose();
    }
  };

  // Start 5-second countdown when user clicks target
  const startFiveSecondCountdown = () => {
    if (isDelaying) return; // already delaying

    clearDelayTimers();
    setIsDelaying(true);
    setDelayProgress(5.0);

    const startTime = Date.now();
    const DURATION_MS = 5000;

    delayIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (DURATION_MS - elapsed) / 1000);
      setDelayProgress(remaining);

      if (remaining <= 0) {
        clearDelayTimers();
        proceedToNextSubStep();
      }
    }, 100);
  };

  const prevRectRef = useRef<{ top: number; left: number; width: number; height: number } | null>(null);

  const getResolvedTargetElement = (targetId: string): HTMLElement | null => {
    let el = document.getElementById(targetId);
    if (!el && targetId === 'tour-card-collapsed') {
      el = document.getElementById('tour-collapsed-section') || document.getElementById('tour-card-header');
    }
    if (!el) {
      el = document.getElementById('calc-anchored-form');
    }
    return el;
  };

  // Continuously track target element on screen
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;

    const updateTargetPosition = () => {
      const el = getResolvedTargetElement(activeSubStep.targetId);
      
      if (el) {
        const rect = el.getBoundingClientRect();
        const prev = prevRectRef.current;
        if (
          !prev ||
          Math.abs(prev.top - rect.top) > 0.5 ||
          Math.abs(prev.left - rect.left) > 0.5 ||
          Math.abs(prev.width - rect.width) > 0.5 ||
          Math.abs(prev.height - rect.height) > 0.5
        ) {
          prevRectRef.current = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
          setTargetRect(rect);
        }
      } else {
        if (prevRectRef.current !== null) {
          prevRectRef.current = null;
          setTargetRect(null);
        }
      }

      animId = requestAnimationFrame(updateTargetPosition);
    };

    updateTargetPosition();

    // Smooth scroll target element into center view when substep changes
    const targetEl = getResolvedTargetElement(activeSubStep.targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, currentStep, currentSubStep, activeSubStep.targetId]);

  // Auto-recenter on scroll when user scrolls away during tutorial
  useEffect(() => {
    if (!isOpen) return;

    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScrollOrWheel = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const targetEl = getResolvedTargetElement(activeSubStep.targetId);

        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          const vh = window.innerHeight;
          // If element is scrolled out of view bounds, smoothly scroll back
          if (rect.top < 60 || rect.bottom > vh - 60) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 500); // 500ms delay after scroll stops to return view to target
    };

    window.addEventListener('scroll', handleScrollOrWheel, { capture: true, passive: true });
    window.addEventListener('wheel', handleScrollOrWheel, { capture: true, passive: true });

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScrollOrWheel, { capture: true });
      window.removeEventListener('wheel', handleScrollOrWheel, { capture: true });
    };
  }, [isOpen, activeSubStep.targetId]);

  // Listen for clicks on target element to trigger 5-second delay
  useEffect(() => {
    if (!isOpen) return;

    const targetEl = getResolvedTargetElement(activeSubStep.targetId);

    if (!targetEl) return;

    const handleTargetClick = (e: MouseEvent) => {
      // Don't intercept UI buttons inside tutorial modal itself
      if ((e.target as HTMLElement)?.closest('.tutorial-guide-window')) return;
      startFiveSecondCountdown();
    };

    targetEl.addEventListener('click', handleTargetClick, true);

    return () => {
      targetEl.removeEventListener('click', handleTargetClick, true);
    };
  }, [isOpen, activeSubStep.targetId, isDelaying]);

  if (!isOpen) return null;

  // Calculate overall progress percentage
  const totalSubSteps = STEPS.reduce((acc, step) => acc + step.subSteps.length, 0);
  let completedSubSteps = 0;
  for (let i = 0; i < currentStep; i++) {
    completedSubSteps += STEPS[i].subSteps.length;
  }
  completedSubSteps += currentSubStep + 1;
  const overallProgressPct = Math.round((completedSubSteps / totalSubSteps) * 100);

  // Dynamically position tutorial guide window so it never obscures the highlighted element or widgets
  const getWindowPositionClass = () => {
    if (!targetRect) return "bottom-4 right-4 sm:bottom-6 sm:right-6";

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Is the highlighted target inside or close to the bottom-right region (where tutorial window normally lives)?
    const isNearBottomRight = targetRect.right > vw - 540 && targetRect.bottom > vh - 460;
    const isNearBottomLeft = targetRect.left < 540 && targetRect.bottom > vh - 460;

    if (isNearBottomRight) {
      if (isNearBottomLeft) {
        // Spans bottom edge, move to top-right
        return "top-4 right-4 sm:top-6 sm:right-6";
      }
      // Target is on the right, move window to bottom-left!
      return "bottom-4 left-4 sm:bottom-6 sm:left-6";
    }

    return "bottom-4 right-4 sm:bottom-6 sm:right-6";
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] pointer-events-none font-sans select-none">
        
        {/* NON-OBSTRUCTIVE GLOWING SPOTLIGHT FRAME around target element */}
        {targetRect && targetRect.width > 0 && (
          <motion.div
            ref={spotlightRef}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              layout: { type: 'spring', stiffness: 300, damping: 28 },
              duration: 0.25,
              ease: 'easeOut'
            }}
            className="fixed pointer-events-none z-[9992] rounded-2xl border-2 border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.8),inset_0_0_15px_rgba(217,70,239,0.25)] bg-fuchsia-500/5 ring-4 ring-fuchsia-400/30"
            style={{
              top: `${Math.max(10, targetRect.top - 8)}px`,
              left: `${Math.max(10, targetRect.left - 8)}px`,
              width: `${targetRect.width + 16}px`,
              height: `${targetRect.height + 16}px`,
            }}
          >
            {/* Corner Bracket Accents for Retro Grid Aesthetic */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white rounded-tl" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white rounded-br" />

            {/* Target Click Badge attached to top of highlighted element */}
            <motion.div
              initial={{ y: -5 }}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 text-white font-mono text-xs font-black uppercase px-3 py-1 rounded-full border border-fuchsia-300 shadow-[0_4px_15px_rgba(217,70,239,0.6)] flex items-center gap-1.5 whitespace-nowrap z-20 pointer-events-none"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
              <span>
                {isRu 
                  ? `🎯 ШАГ ${currentStep + 1}.${currentSubStep + 1}: НАЖМИТЕ ЗДЕСЬ` 
                  : `🎯 STEP ${currentStep + 1}.${currentSubStep + 1}: CLICK HERE`}
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* DEDICATED TUTORIAL GUIDE WINDOW (ОКНО ОБУЧЕНИЯ) */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{
            layout: { type: 'spring', stiffness: 260, damping: 28 },
            opacity: { duration: 0.25 },
            scale: { duration: 0.25 },
            y: { duration: 0.25 }
          }}
          className={`tutorial-guide-window pointer-events-auto fixed ${getWindowPositionClass()} z-[9995] w-[92vw] max-w-md sm:max-w-lg bg-[#160626]/95 backdrop-blur-xl border-2 border-fuchsia-500/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(217,70,239,0.3)] text-white overflow-hidden`}
        >
          {/* Header Bar */}
          <div className="bg-[#240a3c] px-4 py-3 sm:px-5 sm:py-3.5 border-b border-fuchsia-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-md border border-fuchsia-300/40">
                <Sparkles className="w-4 h-4 text-fuchsia-200" />
              </div>
              <div className="text-left">
                <div className="font-mono text-xs font-black uppercase tracking-wider text-fuchsia-300 flex items-center gap-1.5">
                  <span>{isRu ? 'Окно Обучения' : 'Tutorial Guide Window'}</span>
                  <span className="text-[#ebd6f7]/40">•</span>
                  <span className="text-purple-200">
                    {completedSubSteps}/{totalSubSteps} ({overallProgressPct}%)
                  </span>
                </div>
                <div className="text-xs font-bold text-stone-200 mt-0.5">
                  {isRu ? activeStep.titleRu : activeStep.titleEn}
                </div>
              </div>
            </div>

            {/* Minimize & Close controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMinimized(prev => !prev)}
                className="p-1.5 rounded-lg bg-[#12051d] hover:bg-purple-900/60 text-purple-300 hover:text-white border border-purple-500/30 transition-colors cursor-pointer"
                title={isRu ? 'Свернуть/Развернуть окно' : 'Minimize/Maximize window'}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#3d0e19] hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/30 transition-colors cursor-pointer"
                title={isRu ? 'Закрыть обучение' : 'Close tutorial'}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Expanded Window Body */}
          <AnimatePresence mode="wait">
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 sm:p-5 space-y-4"
              >
                {/* Step & Substep Badge bar */}
                <div className="flex items-center justify-between text-xs font-mono font-extrabold gap-2">
                  <span className="px-3 py-1 rounded-full bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 shadow-inner">
                    {isRu ? activeSubStep.titleRu : activeSubStep.titleEn}
                  </span>
                  <span className="text-[#ebd6f7]/60">
                    {isRu ? `Шаг ${currentStep + 1} из ${STEPS.length}` : `Step ${currentStep + 1} of ${STEPS.length}`}
                  </span>
                </div>

                {/* Substep Detailed Description */}
                <p className="text-xs sm:text-sm text-[#ebd6f7] leading-relaxed font-sans font-medium text-left bg-[#12051d]/60 p-3.5 rounded-2xl border border-purple-500/20 shadow-inner">
                  {isRu ? activeSubStep.contentRu : activeSubStep.contentEn}
                </p>

                {/* Action Instruction Box */}
                <div className="bg-[#210938] border border-purple-400/40 p-3 rounded-2xl text-left flex items-start gap-2.5 shadow-md">
                  <div className="p-1.5 bg-fuchsia-500/20 text-fuchsia-300 rounded-lg shrink-0 border border-fuchsia-400/30 mt-0.5">
                    <MousePointerClick className="w-4 h-4 text-fuchsia-300" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-black uppercase text-fuchsia-300 block">
                      {isRu ? '🎯 Ваше действие:' : '🎯 Your Action:'}
                    </span>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {isRu ? activeSubStep.actionHintRu : activeSubStep.actionHintEn}
                    </p>
                  </div>
                </div>

                {/* 5-SECOND DELAY PROGRESS BAR (Runs when user interacts) */}
                <AnimatePresence>
                  {isDelaying && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      className="bg-gradient-to-r from-purple-950 via-fuchsia-950 to-indigo-950 p-3.5 rounded-2xl border-2 border-fuchsia-400/80 shadow-[0_0_20px_rgba(217,70,239,0.3)] space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-black">
                        <span className="text-fuchsia-300 flex items-center gap-1.5 uppercase">
                          <Clock className="w-4 h-4 text-fuchsia-400 animate-spin-slow" />
                          <span>{isRu ? 'Ожидание 5 сек • Изучите расчёт' : '5s Delay • Review Changes'}</span>
                        </span>
                        <span className="text-white text-sm font-mono font-extrabold bg-fuchsia-900/60 px-2 py-0.5 rounded border border-fuchsia-400/40">
                          {delayProgress.toFixed(1)}s
                        </span>
                      </div>

                      {/* Animated Fill Bar */}
                      <div className="h-2.5 bg-[#0d0317] rounded-full border border-fuchsia-500/40 overflow-hidden relative shadow-inner">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 rounded-full"
                          style={{ width: `${(delayProgress / 5) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#ebd6f7]/80 font-medium">
                          {isRu ? 'Задержка даёт время увидеть изменения значений' : 'Delay allows reviewing updated values'}
                        </span>
                        <button
                          type="button"
                          onClick={proceedToNextSubStep}
                          className="px-2.5 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono text-[11px] font-bold uppercase rounded-lg border border-fuchsia-300 transition-all flex items-center gap-1 cursor-pointer shadow-md"
                        >
                          <span>{isRu ? 'Пропустить 5s' : 'Skip 5s'}</span>
                          <FastForward className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Overall Step Progress Dots */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {STEPS.map((step, sIdx) => {
                    const isActive = sIdx === currentStep;
                    const isPassed = sIdx < currentStep;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          setCurrentStep(sIdx);
                          setCurrentSubStep(0);
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          isActive
                            ? 'w-6 bg-fuchsia-400 shadow-[0_0_10px_#e879f9]'
                            : isPassed
                            ? 'w-2 bg-purple-500'
                            : 'w-2 bg-purple-950 border border-purple-800'
                        }`}
                        title={isRu ? step.titleRu : step.titleEn}
                      />
                    );
                  })}
                </div>

                {/* Navigation Bar */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-purple-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentSubStep > 0) {
                        setCurrentSubStep(prev => prev - 1);
                      } else if (currentStep > 0) {
                        setCurrentStep(prev => prev - 1);
                        setCurrentSubStep(STEPS[currentStep - 1].subSteps.length - 1);
                      }
                    }}
                    disabled={currentStep === 0 && currentSubStep === 0}
                    className="px-3 py-2 rounded-xl text-xs font-black uppercase font-mono transition-all flex items-center gap-1 cursor-pointer bg-[#12051d] hover:bg-purple-900/50 text-[#ebd6f7] border border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{isRu ? 'Назад' : 'Back'}</span>
                  </button>

                  <div className="text-xs font-mono font-bold text-purple-300">
                    {currentSubStep + 1} / {activeStep.subSteps.length}
                  </div>

                  <button
                    type="button"
                    onClick={proceedToNextSubStep}
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase font-mono transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white border border-fuchsia-400/40 shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:scale-105 active:scale-95"
                  >
                    <span>
                      {currentStep === STEPS.length - 1 && currentSubStep === activeStep.subSteps.length - 1
                        ? (isRu ? 'Завершить' : 'Finish')
                        : (isRu ? 'Дальше' : 'Next')}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </AnimatePresence>
  );
}

export function FloatingTutorialPrompt({
  lang,
  onStart,
  onDismiss
}: {
  lang: 'ru' | 'en';
  onStart: () => void;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="fixed bottom-5 right-5 z-[9990] max-w-sm bg-[#1b082d] border border-purple-500/40 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(168,85,247,0.25)] text-left text-white"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-purple-600/30 rounded-lg text-fuchsia-300 font-bold border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-fuchsia-400 animate-spin-slow" />
          </span>
          <span className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
            {lang === 'ru' ? 'Нужно обучение по калькулятору?' : 'Need Help With Calculator?'}
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-stone-200 mb-3 leading-relaxed font-sans font-medium">
        {lang === 'ru'
          ? 'Пройдите наглядный интерактивный гид с микро-шагами (9 шагов): узнайте, как рассчитывается стоимость, зачем нужны баллы сложности (PTS), что такое лог и как составить ТЗ.'
          : 'Take an interactive step-by-step walkthrough with micro-steps (9 steps): learn pricing math, work points (PTS), formula log, and spec generation.'}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-mono text-xs font-bold uppercase py-2.5 px-3 rounded-xl border border-purple-400/40 shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
          <span>{lang === 'ru' ? 'Пройти обучение' : 'Start Tour'}</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-2.5 bg-[#12051d] hover:bg-[#230938] text-stone-400 hover:text-stone-200 font-mono text-xs font-bold rounded-xl border border-purple-500/20 transition-all cursor-pointer"
        >
          {lang === 'ru' ? 'Позже' : 'Later'}
        </button>
      </div>
    </motion.div>
  );
}
