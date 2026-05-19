// ===================== i18n Translation Engine =====================
// Drop this script at the bottom of index.html, before </body>

(function() {
  'use strict';

  const TRANSLATIONS = {
    en: {},

    ua: {
      // ─── Navbar ───
      'nav.howItWorks': 'Як це працює',
      'nav.features': 'Можливості',
      'nav.pricing': 'Тарифи',
      'nav.talkToSales': "Зв'язатися з відділом продажу",
      'nav.bookDemo': 'Замовити демо',

      // ─── Hero ───
      'hero.label': 'Для готелів · юридичних фірм · нерухомості · медицини',
      'hero.line1': 'Ваш бізнес ',
      'hero.line2': 'завжди ',
      'hero.line2Accent': 'на звʼязку',
      'hero.sub': 'Для сервісного бізнесу, який не може дозволити собі втрачати клієнтів. Ваш ШІ-представник приймає дзвінки, веде чати та оформлює бронювання — поки ви займаєтеся справою.',
      'hero.ctaDemo': 'Замовити демо-дзвінок →',
      'hero.ctaHear': 'Подивитись, як це працює',
      'hero.chipAlways': 'Цілодобово',
      'hero.chipResponse': 'Час відповіді',
      'hero.chipLanguages': 'Мови',

      // ─── Demo ───
      'demo.scribble': 'спробуйте наживо ↓',
      'demo.title': 'Поговоріть з Elite Concierge — наживо',
      'demo.sub': 'Справжній діалог з нашим ШІ-агентом. Без форм. Без очікування.',
      'demo.startBtn': 'Розпочати голосове демо',

      // ─── Founding Offer ───
      'founding.label': 'Обмежена пропозиція для перших клієнтів',
      'founding.title': 'Лише 10 місць для перших клієнтів',
      'founding.sub': 'Ваш ШІ-агент — налаштований, інтегрований та запущений менш ніж за тиждень. Під особистим контролем нашої команди.',
      'founding.pill1': '✓ Повне налаштування під ключ',
      'founding.pill2': '✓ Запуск менш ніж за 1 тиждень',
      'founding.pill3': '✓ 4 з 5 пропущених дзвінків повертаються',
      'founding.spots': '⚡ 7 з 10 місць зайнято — залишилось 3',
      'founding.cta': 'Зайняти своє місце →',

      // ─── Who It's For ───
      'who.title': 'Знайоме?',
      'who.sub': 'Оберіть свою галузь — побачте, як це вирішується.',
      // Restaurant
      'who.r': 'Ресторан',
      'who.rProblem': 'Під час вечері телефон дзвонить, а всі зайняті — дзвінки йдуть на голосову пошту.',
      'who.rOutcome': '«Кожен запит на бронювання отримує відповідь — навіть у розпал сервісу.»',
      'who.rCta': 'Як це працює для ресторанів →',
      // Law
      'who.law': 'Юридична фірма',
      'who.lawProblem': 'Нові клієнти телефонують у вихідні — і не отримують відповіді.',
      'who.lawOutcome': '«Кожне потенційне звернення отримує реальну відповідь — цілодобово.»',
      'who.lawCta': 'Як це працює для юридичних фірм →',
      // Real Estate
      'who.re': 'Агентство нерухомості',
      'who.reProblem': 'Ліди остигають за лічені хвилини, якщо не відповісти одразу.',
      'who.reOutcome': '«Агент кваліфікує ліди та призначає покази — поки ви на іншому обʼєкті.»',
      'who.reCta': 'Як це працює для агентств нерухомості →',
      // Beauty
      'who.beauty': 'Салон краси',
      'who.beautyProblem': 'Клієнти телефонують, поки ви з клієнтом, і йдуть записуватися до конкурентів.',
      'who.beautyOutcome': '«Запис іде повним ходом — навіть коли ваші руки зайняті.»',
      'who.beautyCta': 'Як це працює для салонів краси →',

      // ─── How It Works ───
      'how.title': 'Запуск за дні, а не за місяці',
      'how.when1': 'День 1',
      'how.step1Title': 'День 1 · Аналіз і план',
      'how.step1Desc': 'За 30 хвилин ми розбираємо ваш поточний процес: сценарії дзвінків, часті запитання, системи бронювання. На виході — чіткий план агента: кожен намір, кожен запасний варіант, кожне передавання.',
      'how.when2': 'Дні 2–5',
      'how.step2Title': 'Дні 2–5 · Розробка та інтеграція',
      'how.step2Desc': 'Наша команда прописує голос агента, підключає вашу CRM і календар, налаштовує існуючий номер телефону. Готового агента ви побачите вже через 3–5 робочих днів.',
      'how.when3': 'День 6+',
      'how.step3Title': 'День 6 і далі · Запуск і вдосконалення',
      'how.step3Desc': 'Спочатку — тестовий режим, потім — повний запуск. Кожен дзвінок автоматично транскрибується, оцінюється й щотижня оптимізується. Агент покращується сам — без вашої участі.',

      // ─── Features ───
      'feat.label': 'Можливості',
      'feat.title': 'Інфраструктура за кожною Elite-розмовою',
      'feat.sub': 'Голосовий ШІ корпоративного рівня — для бізнесу, де кожна розмова — це можливість доходу.',
      'feat.inboundTitle': 'Вхідні та вихідні',
      'feat.inboundDesc': 'Приймайте дзвінки та запускайте зворотні дзвінки з одного агента — без додаткових налаштувань, без додаткової ліцензії.',
      'feat.chatTitle': 'Веб-чат',
      'feat.chatDesc': 'Додайте один скрипт на ваш сайт — і ваш агент підхоплює чати з тим самим мозком.',
      'feat.crmTitle': 'CRM-синхронізація',
      'feat.crmDesc': 'HubSpot, Salesforce, Pipedrive, GoHighLevel — кожен дзвінок стає повним контактом.',
      'feat.calendarTitle': 'Бронювання в календарі',
      'feat.calendarDesc': 'Зчитує доступність та бронює прямо в Google, Outlook або Calendly — підтверджено.',
      'feat.languagesTitle': '31+ мов',
      'feat.languagesDesc': 'Нативні голоси для кожного ринку з авто-визначенням мови під час дзвінка.',
      'feat.phoneTitle': 'Ваш номер телефону',
      'feat.phoneDesc': 'Збережіть існуючу лінію через SIP або оберіть новий локальний чи безкоштовний номер за хвилини.',
      'feat.transferTitle': 'Розумний теплий трансфер',
      'feat.transferDesc': 'Коли потрібна людина, агент підготовлює репер перед зʼєднанням — без «давайте повторю».',
      'feat.transcriptTitle': 'Транскрипти та зведення',
      'feat.transcriptDesc': 'Кожен дзвінок транскрибується, резюмується та тегається з наступними діями автоматично.',
      'feat.smsTitle': 'SMS-нагадування',
      'feat.smsDesc': 'Автоматичні тексти після кожного дзвінка — нагадування, посилання, відновлення після неявки.',
      'feat.complianceTitle': 'SOC 2 / HIPAA / GDPR',
      'feat.complianceDesc': 'Комплаєнс корпоративного рівня вбудований. Регіональне резидентство даних за запитом.',
      'feat.latencyTitle': '600 мс затримка',
      'feat.latencyDesc': 'Реакція менше секунди, що відчувається як реальна розмова — не робот-пауза.',
      'feat.qaTitle': 'Авто QA',
      'feat.qaDesc': 'Кожен дзвінок оцінюється за вашим плейбуком, щоб ви бачили дрифт до клієнтів.',

      // ─── Calculator ───
      'calc.label': 'Калькулятор відновлення доходу',
      'calc.title': 'Подивіться, що ви втрачаєте<br/>через пропущені дзвінки.',
      'calc.sub': 'Введіть ваші числа. Ми покажемо гроші, що виходять щомісяця — і скільки з цього Elite Concierge повертає.',
      'calc.industryLabel': 'Я працюю в…',
      'calc.industryPlaceholder': 'Оберіть вашу індустрію',
      'calc.industry.realEstate': 'Агентство нерухомості',
      'calc.industry.dental': 'Стоматологічна клініка',
      'calc.industry.homeServices': 'Домашні послуги',
      'calc.industry.law': 'Юридична фірма',
      'calc.industry.ecommerce': 'Електронна комерція',
      'calc.industry.healthcare': 'Медична клініка',
      'calc.industry.insurance': 'Страховий брокер',
      'calc.industry.restaurant': 'Ресторан / Кафе',
      'calc.industry.beauty': 'Салон краси / Спа',
      'calc.industry.gym': 'Тренажерний зал',
      'calc.industry.property': 'Управління нерухомістю',
      'calc.industry.car': 'Автодилер',
      'calc.missedLabel': 'Пропущені дзвінки на тиждень',
      'calc.valueLabel': 'Середня цінність клієнта',
      'calc.closeLabel': 'Рівень закриття',
      'calc.assumption': 'Elite Concierge відновлює <b>80%</b> пропущених дзвінків — наш середній показник по активних клієнтах.',
      'calc.resultLabel': 'Ви залишаєте на столі',
      'calc.resultUnit': '/ рік',
      'calc.resultSub': 'Це приблизно <b><span id="calc-monthly"></span></b> на місяць проходить повз ваші двері.',
      'calc.cta': 'Припиніть втрачати гроші щодня',

      // ─── Pricing ───
      'pricing.label': 'Тарифи',
      'pricing.title': 'Побудовано навколо вашого бізнесу,<br/>а не типового плану.',
      'pricing.sub': 'Кожен бізнес обробляє дзвінки по-різному. Оберіть поверхню, яку ваші клієнти реально використовують — ми цінуємо за обʼєм, який відповідає вашій стадії.',
      'pricing.voiceBadge': 'Найпопулярніший',
      'pricing.voicePlan': 'Голосовий агент',
      'pricing.voiceTag': 'Ніколи більше не пропустіть продажний дзвінок.',
      'pricing.voicePrice': 'Від $499/міс + разова плата за налаштування',
      'pricing.voiceNote': 'Плата за налаштування покриває діскавері, розробку та інтеграцію — зроблено під ключ.',
      'pricing.voiceDesc': 'Ваш ШІ-представник відповідає на кожен вхідний дзвінок, кваліфікує ліда та бронює зустріч — день і ніч.',
      'pricing.voiceCta': 'Замовити демо',
      'pricing.chatBadge': 'Найбільше можливостей',
      'pricing.chatPlan': 'Чат-агент',
      'pricing.chatTag': 'Відповідайте на кожному каналі, миттєво — 24/7.',
      'pricing.chatPrice': 'Від $249/міс',
      'pricing.chatNote': 'Цінується на основі обʼєму повідомлень та каналів.',
      'pricing.chatDesc': 'Перетворіть ваш сайт та соціальні канали на машину лідів, яка ніколи не спить.',
      'pricing.chatCta': 'Отримати пропозицію',
      'pricing.fullBadge': 'Все включено',
      'pricing.fullPlan': 'Повний пакет',
      'pricing.fullTag': 'Голос + чат, один спільний мозок.',
      'pricing.fullPrice': 'Від $999/міс — все включено',
      'pricing.fullNote': 'Одна ціна. Голос, чат, комплаєнс та виділений інженер успіху.',
      'pricing.fullCta': 'Давайте будувати',
      'pricing.note': 'Всі плани включають онбординг. Довгострокові контракти не потрібні.',

      // ─── CTA Strip ───
      'cta.title': 'Завжди на звʼязку. Ніколи на утриманні.<br/>Ніколи в штаті.',
      'cta.sub': 'Приєднуйтесь до бізнесів, які скорочують витрати на обробку дзвінків на 80%, відповідаючи на кожен вхідний — голос, чат, після годин, 31 мовами.',
      'cta.ctaStrategy': 'Замовити стратегічний дзвінок',
      'cta.ctaMessage': 'Надіслати повідомлення',

      // ─── Founding Bottom ───
      'founding.bottomTitle': 'Досі тут? Пропозиція для перших — не буде.',
      'founding.bottomSub': '3 місця залишилось. Без блокування. Скасуйте будь-коли.',
      'founding.bottomCta': 'Зайняти своє місце →',

      // ─── Footer ───
      'footer.features': 'Можливості',
      'footer.voice': 'Голосові агенти',
      'footer.chat': 'Веб-чат',
      'footer.integrations': 'CRM-інтеграції',
      'footer.calendar': 'Бронювання календаря',
      'footer.multilingual': 'Багатомовність',
      'footer.compliance': 'Комплаєнс',
      'footer.company': 'Компанія',
      'footer.about': 'Про нас',
      'footer.contact': 'Контакт',
      'footer.email': 'hello@eliteai.space',
      'footer.location': 'Базиємось в Лісабоні, Португалія. Обслуговуємо клієнтів глобально.',
      'footer.copyright': '© 2026 Elite AI',
      'footer.privacy': 'Конфіденційність',
      'footer.terms': 'Умови',

      // ─── Modal ───
      'modal.title': 'Давайте поговоримо.',
      'modal.sub': 'Розкажіть трохи про ваш бізнес, і ми звʼяжемося протягом одного робочого дня.',
      'modal.name': "Ім'я",
      'modal.namePlaceholder': 'Ваше імʼя',
      'modal.email': 'Email',
      'modal.emailPlaceholder': 'you@company.com',
      'modal.company': 'Компанія',
      'modal.companyPlaceholder': 'Назва компанії',
      'modal.phone': 'Телефон',
      'modal.phonePlaceholder': '+380 50 000 1234',
      'modal.message': 'Повідомлення',
      'modal.messagePlaceholder': 'Які дзвінки ви намагаєтесь покрити?',
      'modal.submit': 'Надіслати повідомлення',
      'modal.noSpam': 'Без спаму. Ніколи.',
      'modal.ok': 'Дякуємо — ми звʼяжемося найближчим часом.',
      'modal.errName': 'Будь ласка, додайте ваше імʼя та email.',
      'modal.err': 'Не вдалося надіслати:',

      // ─── Demo Status (JS) ───
      'demo.statusConnecting': 'Запит мікрофона…',
      'demo.statusStarting': 'Запуск безпечної сесії…',
      'demo.statusLoading': 'Завантаження агента…',
      'demo.statusConnected': "З'єднання з агентом…",
      'demo.statusLive': 'На звʼязку — говоріть природно.',
      'demo.statusSpeaking': 'Агент говорить…',
      'demo.statusError': 'Помилка:',
      'demo.statusEnded': 'Дзвінок завершено.',
      'demo.statusCouldNotStart': 'Не вдалося запустити демо:',
      'demo.endCall': 'Завершити дзвінок',
      'demo.connecting': "З'єднання…",
    }
  };

  // ─── Translation helper (for JS strings) ───
  function t(key) {
    const lang = localStorage.getItem('elite-lang') || 'en';
    return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || key;
  }
  // Expose globally so inline JS can use it
  window.i18n = t;

  // ─── Engine ───
  let currentLang = localStorage.getItem('elite-lang') || 'en';

  function applyTranslations(lang) {
    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = dict[key];
      if (translation) {
        el.innerHTML = translation;
      }
    });

    // Update html lang
    document.documentElement.lang = lang === 'ua' ? 'uk' : 'en';

    // Update toggle buttons
    const toggles = [document.getElementById('lang-toggle'), document.getElementById('lang-toggle-mobile')];
    toggles.forEach(btn => {
      if (btn) {
        btn.textContent = lang === 'ua' ? '🇺🇦 UA' : '🇬🇧 EN';
      }
    });

    // Update calculator industry options
    const industrySelect = document.getElementById('calc-industry');
    if (industrySelect) {
      const opts = industrySelect.querySelectorAll('option');
      const labels = {
        '': dict['calc.industryPlaceholder'] || 'Select your industry',
        'real-estate': dict['calc.industry.realEstate'] || 'Real Estate Agency',
        'dental': dict['calc.industry.dental'] || 'Dental Practice',
        'home-services': dict['calc.industry.homeServices'] || 'Home Services',
        'law': dict['calc.industry.law'] || 'Law Firm',
        'ecommerce': dict['calc.industry.ecommerce'] || 'E-Commerce',
        'healthcare': dict['calc.industry.healthcare'] || 'Healthcare Clinic',
        'insurance': dict['calc.industry.insurance'] || 'Insurance Broker',
        'restaurant': dict['calc.industry.restaurant'] || 'Restaurant / Cafe',
        'beauty': dict['calc.industry.beauty'] || 'Beauty Salon / Spa',
        'gym': dict['calc.industry.gym'] || 'Gym / Fitness Studio',
        'property': dict['calc.industry.property'] || 'Property Management',
        'car-dealership': dict['calc.industry.car'] || 'Car Dealership',
      };
      opts.forEach(opt => {
        const label = labels[opt.value];
        if (label) opt.textContent = label;
      });
    }

    // Re-run calculator to update labels
    if (typeof recompute === 'function') recompute();
  }

  // ─── Toggle buttons ───
  function setupToggles() {
    const toggles = [document.getElementById('lang-toggle'), document.getElementById('lang-toggle-mobile')];
    toggles.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          currentLang = currentLang === 'en' ? 'ua' : 'en';
          localStorage.setItem('elite-lang', currentLang);
          applyTranslations(currentLang);
        });
      }
    });
  }

  // ─── Init ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTranslations(currentLang);
      setupToggles();
    });
  } else {
    applyTranslations(currentLang);
    setupToggles();
  }
})();
