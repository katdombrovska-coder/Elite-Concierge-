// ===================== i18n Translation Engine =====================

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
      'hero.line1': 'Ваш бізнес',
      'hero.line2': 'завжди ',
      'hero.line2Accent': 'на звʼязку',
      'hero.sub': 'Для сервісного бізнесу, який не може дозволити собі втрачати клієнтів. Ваш ШІ-представник приймає дзвінки, веде чати та оформлює бронювання — поки ви займаєтеся справою.',
      'hero.ctaDemo': 'Замовити демо-дзвінок →',
      'hero.ctaHear': 'Подивитись, як це працює',
      'hero.chipAlways': 'Цілодобово · 24/7',
      'hero.chipResponse': 'Час відповіді · 600 мс',
      'hero.chipLanguages': 'Мови · 31+',

      // ─── Demo ───
      'demo.scribble': 'спробуйте наживо ↓',
      'demo.title': 'Поговоріть з Elite Concierge — наживо',
      'demo.sub': 'Справжній діалог з нашим ШІ-агентом. Без форм. Без очікування.',
      'demo.startBtn': 'Розпочати голосове демо',

      // ─── Founding Offer ───
      'founding.label': 'Обмежена пропозиція для перших клієнтів',
      'founding.title': 'Лише 10 місць для перших клієнтів.',
      'founding.sub': 'Ваш ШІ-агент — налаштований, інтегрований і запущений менш ніж за тиждень. Під особистим контролем нашої команди засновників.',
      'founding.pill1': '✓ Повне налаштування під ключ',
      'founding.pill2': '✓ Запуск менш ніж за 1 тиждень',
      'founding.pill3': '✓ 4 з 5 пропущених дзвінків повертаються',
      'founding.spots': '⚡ 7 з 10 місць зайнято — залишилось 3',
      'founding.cta': 'Зайняти своє місце →',

      // ─── Who It's For ───
      'who.title': 'Знайоме?',
      'who.sub': 'Оберіть свою галузь — і побачте, як це вирішується.',
      // Restaurant
      'who.r': 'Ресторан',
      'who.rProblem': 'Під час вечірнього сервісу телефон дзвонить, а всі зайняті — дзвінки йдуть на голосову пошту.',
      'who.rOutcome': '«Кожен запит на бронювання отримує відповідь — навіть у розпал вечері.»',
      'who.rCta': 'Як це працює для ресторанів →',
      // Law
      'who.law': 'Юридична фірма',
      'who.lawProblem': 'Нові клієнти телефонують у вихідні — і не отримують жодної відповіді.',
      'who.lawOutcome': '«Кожне потенційне звернення отримує реальну відповідь — цілодобово, без вихідних.»',
      'who.lawCta': 'Як це працює для юридичних фірм →',
      // Real Estate
      'who.re': 'Агентство нерухомості',
      'who.reProblem': 'Ліди остигають за лічені хвилини, якщо їм не відповісти одразу.',
      'who.reOutcome': '«Агент кваліфікує звернення та призначає покази — поки ви на іншому обʼєкті.»',
      'who.reCta': 'Як це працює для агентств нерухомості →',
      // Beauty
      'who.beauty': 'Салон краси',
      'who.beautyProblem': 'Клієнти телефонують, поки ви з іншим клієнтом, і йдуть записуватися до конкурентів.',
      'who.beautyOutcome': '«Запис іде повним ходом — навіть коли ваші руки зайняті.»',
      'who.beautyCta': 'Як це працює для салонів краси →',

      // ─── How It Works ───
      'how.label': 'Як це працює',
      'how.title': 'Запуск за дні, а не за місяці.',
      'how.step1Title': 'Аналіз і план',
      'how.step1Desc': 'За 30 хвилин ми детально розбираємо ваш поточний процес: сценарії дзвінків, типові запитання, системи бронювання. Результат — чіткий односторінковий план агента: кожен сценарій, кожен запасний варіант, кожне передавання.',
      'how.step2Title': 'Розробка та інтеграція',
      'how.step2Desc': 'Наша команда прописує голос агента, підключає вашу CRM і календар, налаштовує існуючий номер телефону. Готового робочого агента ви побачите вже через 3–5 робочих днів.',
      'how.step3Title': 'Запуск і вдосконалення',
      'how.step3Desc': 'Спочатку — тихий тестовий режим, потім — повноцінний запуск. Кожен дзвінок автоматично транскрибується, оцінюється та щотижня оптимізується. Агент стає кращим — без вашої участі.',

      // ─── Features ───
      'feat.label': 'Можливості',
      'feat.title': 'Технологія за кожною розмовою.',
      'feat.sub': 'Корпоративний голосовий ШІ — для бізнесу, де кожна розмова є джерелом доходу.',
      'feat.inboundTitle': 'Вхідні й вихідні дзвінки',
      'feat.inboundDesc': 'Один агент приймає дзвінки та здійснює зворотні — без додаткових налаштувань і ліцензій.',
      'feat.chatTitle': 'Веб-чат',
      'feat.chatDesc': 'Один рядок коду на вашому сайті — і агент відповідає на чати з тією ж базою знань.',
      'feat.crmTitle': 'Синхронізація з CRM',
      'feat.crmDesc': 'HubSpot, Salesforce, Pipedrive, GoHighLevel — кожен дзвінок потрапляє в систему як повноцінний контакт.',
      'feat.calendarTitle': 'Бронювання в календарі',
      'feat.calendarDesc': 'Агент перевіряє доступність і одразу записує в Google, Outlook або Calendly — підтверджено.',
      'feat.languagesTitle': '31+ мова',
      'feat.languagesDesc': 'Природне звучання на всіх ключових ринках з автоматичним визначенням мови під час розмови.',
      'feat.phoneTitle': 'Ваш номер телефону',
      'feat.phoneDesc': 'Залишіть існуючий номер через SIP або швидко підключіть новий — місцевий або безкоштовний.',
      'feat.transferTitle': 'Розумне передавання',
      'feat.transferDesc': "Коли потрібна людина — агент вводить колегу в курс справи перед з'єднанням. Без «розкажіть ще раз».",
      'feat.transcriptTitle': 'Транскрипти й підсумки',
      'feat.transcriptDesc': 'Кожен дзвінок транскрибується, узагальнюється й позначається наступними кроками — автоматично.',
      'feat.smsTitle': 'SMS після дзвінка',
      'feat.smsDesc': 'Автоматичні повідомлення після кожного дзвінка: нагадування, посилання, повернення клієнтів — за чіткими правилами.',
      'feat.complianceTitle': 'SOC 2 / HIPAA / GDPR',
      'feat.complianceDesc': 'Корпоративний рівень відповідності. Регіональне зберігання даних — за запитом.',
      'feat.latencyTitle': 'Затримка 600 мс',
      'feat.latencyDesc': 'Відповідь швидше за секунду — відчуття живої розмови, а не робота.',
      'feat.qaTitle': 'Автоматичний контроль якості',
      'feat.qaDesc': 'Кожен дзвінок оцінюється за вашим сценарієм — ви бачите відхилення раніше, ніж їх помітять клієнти.',

      // ─── Calculator ───
      'calc.label': 'Калькулятор відновлення доходу',
      'calc.title': 'Дізнайтеся, скільки ви втрачаєте через пропущені дзвінки.',
      'calc.sub': 'Введіть свої показники — і ми покажемо, скільки грошей щомісяця проходить повз вас, і скільки з них повертає Elite Concierge.',
      'calc.industryLabel': 'Тип мого бізнесу...',
      'calc.industryPlaceholder': 'Оберіть вашу індустрію',
      'calc.industry.realEstate': 'Агентство нерухомості',
      'calc.industry.dental': 'Стоматологічна клініка',
      'calc.industry.homeServices': 'Домашній сервіс',
      'calc.industry.law': 'Юридична фірма',
      'calc.industry.ecommerce': 'Інтернет-магазин',
      'calc.industry.healthcare': 'Медична клініка',
      'calc.industry.insurance': 'Страховий брокер',
      'calc.industry.restaurant': 'Ресторан / Кафе',
      'calc.industry.beauty': 'Салон краси / СПА',
      'calc.industry.gym': 'Тренажерний зал / Фітнес-студія',
      'calc.industry.property': 'Управління нерухомістю',
      'calc.industry.car': 'Автосалон',
      'calc.missedLabel': 'Пропущених дзвінків на тиждень',
      'calc.valueLabel': 'Середня цінність клієнта',
      'calc.closeLabel': 'Рівень конверсії',
      'calc.assumption': 'Розрахунок базується на тому, що Elite Concierge повертає <b>80%</b> пропущених дзвінків — середній показник серед наших активних клієнтів.',
      'calc.resultLabel': 'Ви залишаєте на столі',
      'calc.resultUnit': '/ на рік',
      'calc.resultSub': 'Це приблизно <b><span id="calc-monthly"></span></b> на місяць, які проходять повз ваш бізнес.',
      'calc.cta': 'Припиніть втрачати гроші щодня',

      // ─── Pricing ───
      'pricing.label': 'Тарифи',
      'pricing.title': 'Рішення під ваш бізнес,<br/>а не стандартний пакет.',
      'pricing.sub': 'Кожен бізнес по-своєму обробляє звернення клієнтів. Оберіть канал, яким користуються ваші клієнти — тариф формується під ваш обсяг.',
      // Plan 1 — Voice
      'pricing.voiceBadge': 'Найпопулярніший',
      'pricing.voicePlan': 'Голосовий агент',
      'pricing.voiceTag': 'Жодного пропущеного дзвінка з продажу.',
      'pricing.voicePrice': 'Від $499/міс + разовий внесок за налаштування',
      'pricing.voiceNote': 'Внесок покриває аналіз, розробку та інтеграцію — повністю під ключ.',
      'pricing.voiceDesc': 'Ваш ШІ-представник відповідає на кожен вхідний дзвінок, кваліфікує ліда та бронює зустріч — вдень і вночі.',
      'pricing.voiceF1': 'Вхідні та вихідні дзвінки',
      'pricing.voiceF2': 'Збереження вашого існуючого номера',
      'pricing.voiceF3': 'Кваліфікація лідів і бронювання наживо',
      'pricing.voiceF4': 'Інтеграція з CRM і календарем',
      'pricing.voiceF5': 'Транскрипти, підсумки та SMS-повідомлення',
      'pricing.voiceF6': 'Автоматичний контроль якості + щотижневе налаштування',
      'pricing.voiceCta': 'Замовити демо',
      // Plan 2 — Chat
      'pricing.chatBadge': 'Найбільше функцій',
      'pricing.chatPlan': 'Чат-агент',
      'pricing.chatTag': 'Відповідь на кожному каналі — миттєво, 24/7.',
      'pricing.chatPrice': 'Від $249/міс',
      'pricing.chatNote': 'Ціна залежить від обсягу повідомлень і каналів.',
      'pricing.chatDesc': 'Перетворіть сайт і соціальні мережі на машину для залучення клієнтів, яка ніколи не спить.',
      'pricing.chatF1': 'Агент у веб-чаті, SMS та WhatsApp',
      'pricing.chatF2': 'База знань автоматично навчається на вашому сайті',
      'pricing.chatF3': 'Захоплення лідів, оцінка та синхронізація з CRM',
      'pricing.chatF4': 'Бронювання в календарі через чат',
      'pricing.chatF5': '31+ мова з єдиним тоном і термінологією',
      'pricing.chatF6': "Розумне передавання людині, коли бот досяг межі",
      'pricing.chatCta': 'Отримати комерційну пропозицію',
      // Plan 3 — Full
      'pricing.fullBadge': 'Все включено',
      'pricing.fullPlan': 'Повний комплекс',
      'pricing.fullTag': 'Голос і чат — одна спільна система.',
      'pricing.fullPrice': 'Від $999/міс — повний комплекс',
      'pricing.fullNote': 'Єдина ціна. Голос, чат, відповідність стандартам і персональний менеджер з підтримки.',
      'pricing.fullF1': "Все, що є у тарифах «Голос» і «Чат»",
      'pricing.fullF2': 'Єдина історія розмов по всіх каналах',
      'pricing.fullF3': 'Розумне передавання дзвінка людині',
      'pricing.fullF4': 'Персональний менеджер з підтримки',
      'pricing.fullF5': 'Аналіз настроїв клієнтів і правила ескалації',
      'pricing.fullCta': 'Побудуємо разом',
      'pricing.note': 'Усі тарифи включають онбординг. Довгострокові контракти не потрібні.',

      // ─── CTA Strip ───
      'cta.title': 'Завжди на звʼязку. Ніколи не в очікуванні.<br/>Без зарплатних витрат.',
      'cta.sub': 'Приєднуйтесь до компаній, які скорочують витрати на обробку дзвінків на 80% — відповідаючи на кожен вхідний запит голосом і чатом, цілодобово, 31 мовою.',
      'cta.ctaStrategy': 'Замовити стратегічний дзвінок',
      'cta.ctaMessage': 'Написати нам',

      // ─── Urgency ───
      'founding.banner': '⚡ Залишилось лише 3 місця для перших клієнтів — Займіть своє, поки не пізно →',
      'founding.bottomTitle': 'Ще тут? Пропозиція для перших клієнтів не вічна.',
      'founding.bottomSub': 'Залишилось 3 місця. Без зобовʼязань. Скасування в будь-який момент.',
      'founding.bottomCta': 'Зайняти місце зараз →',

      // ─── Footer ───
      'footer.features': 'Голосові агенти',
      'footer.voice': 'Голосові агенти',
      'footer.chat': 'Веб-чат',
      'footer.integrations': 'Інтеграції з CRM',
      'footer.calendar': 'Бронювання в календарі',
      'footer.multilingual': 'Багатомовність',
      'footer.compliance': 'Відповідність стандартам',
      'footer.company': 'Компанія',
      'footer.about': 'Про нас',
      'footer.contact': 'Контакти',
      'footer.email': 'hello@eliteai.space',
      'footer.location': 'Базуємося в Лісабоні, Португалія. Працюємо з клієнтами по всьому світу.',
      'footer.copyright': '© 2026 Elite AI',
      'footer.privacy': 'Політика конфіденційності',
      'footer.terms': 'Умови використання',

      // ─── Modal ───
      'modal.title': "Зв'яжіться з нами.",
      'modal.sub': 'Розкажіть трохи про ваш бізнес — і ми відповімо протягом одного робочого дня.',
      'modal.name': "Ім'я",
      'modal.namePlaceholder': 'Ваше імʼя',
      'modal.email': 'Електронна пошта',
      'modal.emailPlaceholder': 'you@company.com',
      'modal.company': 'Компанія',
      'modal.companyPlaceholder': 'Назва компанії',
      'modal.phone': 'Телефон',
      'modal.phonePlaceholder': '+380 50 000 1234',
      'modal.message': 'Повідомлення',
      'modal.messagePlaceholder': 'Які дзвінки ви намагаєтесь покрити?',
      'modal.submit': 'Надіслати повідомлення',
      'modal.noSpam': 'Жодного спаму. Ніколи.',
      'modal.ok': 'Дякуємо — незабаром ми з вами звʼяжемося.',
      'modal.errName': 'Будь ласка, додайте ваше імʼя та email.',
      'modal.err': 'Не вдалося надіслати:',

      // ─── Page Meta ───
      'page.title': 'Elite AI — Ваш бізнес завжди на звʼязку',
      'page.description': 'Elite AI — голосові й чат-агенти, які відповідають на кожен дзвінок, фіксують кожен лід і оформлюють кожне бронювання. Цілодобово, без вихідних.',

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
