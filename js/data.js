/* Vasilisa World — каталоги: цвета, наряды, питомцы, наборы, миры, сцены, фразы */
(function (VW) {
  'use strict';

  const D = (VW.Data = {});

  // Цвета человечка (палитра сверху в меню персонажа)
  D.colors = [
    { id: 'brown', hex: '#8B5A2B', name: 'Коричневый', price: 0 },
    { id: 'pink', hex: '#FF4F9A', name: 'Розовый', price: 0 },
    { id: 'blue', hex: '#2FA8F0', name: 'Голубой', price: 0 },
    { id: 'green', hex: '#2FBF55', name: 'Зелёный', price: 0 },
    { id: 'orange', hex: '#FF8C1A', name: 'Оранжевый', price: 0 },
    { id: 'purple', hex: '#9A55E8', name: 'Фиолетовый', price: 5 },
    { id: 'red', hex: '#EE3A3A', name: 'Красный', price: 8 },
    { id: 'yellow', hex: '#FFC21A', name: 'Жёлтый', price: 12 },
    { id: 'teal', hex: '#14BFA8', name: 'Бирюзовый', price: 15 },
    { id: 'rainbow', hex: '#FF4F9A', name: 'Радужный', price: 40, rainbow: true },
  ];

  // Скины / аксессуары (лента слева). slot: head — на голову, body — одежда
  D.skins = [
    { id: 'crown', slot: 'head', name: 'Корона', price: 0 },
    { id: 'hat', slot: 'head', name: 'Шапочка', price: 0 },
    { id: 'bow', slot: 'head', name: 'Бантик', price: 0 },
    { id: 'skirt', slot: 'body', name: 'Юбочка', price: 10 },
    { id: 'dress', slot: 'body', name: 'Платьице', price: 20 },
    { id: 'cape', slot: 'body', name: 'Плащ', price: 30 },
  ];

  // Питомцы — отдельная категория внизу («Питомцы»): бегают рядом с героем
  D.pets = [
    { id: 'cat', name: 'Котик', price: 10 },
    { id: 'robot', name: 'Робот', price: 11 },
    { id: 'turtle', name: 'Черепашка', price: 12 },
    { id: 'capy', name: 'Капибарка', price: 10 },
    { id: 'owl', name: 'Совёнок', price: 40 },
  ];

  // Наборы героев (категории внизу). Каждый набор стоит 10 звёзд и открывает всех своих героев
  D.sets = [
    { id: 'wizard', name: 'Волшебники', price: 10 },
    { id: 'robot', name: 'Домашний робот', price: 10 },
    { id: 'fairy', name: 'Феи', price: 10 },
    { id: 'hero', name: 'Супергерои', price: 10 },
    { id: 'animal', name: 'Животные', price: 10 },
    { id: 'god', name: 'Боги', price: 10 },
  ];

  // Герои наборов — все собственного дизайна (p — детали внешности, см. hero.js)
  D.heroes = [
    // Волшебники
    { id: 'w_gosha', set: 'wizard', name: 'Гоша', p: { hair: 'messy', hairColor: '#4A2C14', hat: 'wizard', hatColor: '#3F4FC4', lower: 'robe', lowerColor: '#34409E', stars: true, hand: 'wand', tip: '#FFD84A' } },
    { id: 'w_masha', set: 'wizard', name: 'Маша', p: { hair: 'longWavy', hairColor: '#8A4B22', hat: 'witch', hatColor: '#7B3FC4', band: '#FFC928', lower: 'robe', lowerColor: '#5E2FA0', hand: 'book', item: '#E0533F' } },
    { id: 'w_tema', set: 'wizard', name: 'Тёма', p: { hair: 'short', hairColor: '#E8742A', freckles: true, hat: 'wizard', hatColor: '#2E8B57', lower: 'robe', lowerColor: '#2A6E48', stars: true, hand: 'wand', tip: '#7CFF6A' } },
    { id: 'w_miron', set: 'wizard', name: 'Дедушка Мирон', p: { beard: '#F4F4F4', hat: 'wizardTall', hatColor: '#28328C', lower: 'robe', lowerColor: '#1E2A78', stars: true, hand: 'staff', tip: '#7FE3FF' } },
    { id: 'w_liza', set: 'wizard', name: 'Лиза', p: { hair: 'ponytail', hairColor: '#2B1A10', hat: 'witch', hatColor: '#E0469A', band: '#FFE066', back: 'cape', backColor: '#FF6FB5', lower: 'dress', lowerColor: '#3A2A5A', pattern: 'stars', hand: 'broom' } },
    // Домашние роботы
    { id: 'r_robik', set: 'robot', name: 'Робик', p: { robotHead: 'box', robotBody: 'box', metal: '#D8E0E8', antenna: 'ball' } },
    { id: 'r_pylik', set: 'robot', name: 'Пылик', p: { robotHead: 'dome', robotBody: 'round', metal: '#BFE3FF', eye: '#FF5A5A' } },
    { id: 'r_bublik', set: 'robot', name: 'Бублик', p: { robotHead: 'box', robotBody: 'box', metal: '#FFE2B8', hat: 'chef', lower: 'apron', hand: 'spatula' } },
    { id: 'r_romashka', set: 'robot', name: 'Ромашка', p: { robotHead: 'round', robotBody: 'round', metal: '#FFD0E6', antenna: 'flower', screen: 'heart' } },
    { id: 'r_tosha', set: 'robot', name: 'Тоша', p: { robotHead: 'box', robotBody: 'box', metal: '#C8F0C0', antenna: 'leaf', hand: 'can' } },
    // Феи
    { id: 'f_roza', set: 'fairy', name: 'Роза', p: { hair: 'bun', hairColor: '#C2185B', tiara: 'rose', back: 'wings', wings: 'butterfly', wingColors: ['#FFB3D9', '#FFD6EC'], lower: 'tutu', lowerColor: '#FF7EB6', hand: 'wand', tip: '#FF7EC8' } },
    { id: 'f_kapelka', set: 'fairy', name: 'Капелька', p: { hair: 'long', hairColor: '#3F8FE0', tiara: 'drop', back: 'wings', wings: 'butterfly', wingColors: ['#BFE9FF', '#DDF6FF'], lower: 'dress', lowerColor: '#5AB7F5', pattern: 'waves', hand: 'wand', tip: '#7FD3FF' } },
    { id: 'f_iskorka', set: 'fairy', name: 'Искорка', p: { hair: 'curly', hairColor: '#F2A900', tiara: 'star', back: 'wings', wings: 'star', wingColors: ['#FFF1A8', '#FFE066'], lower: 'tutu', lowerColor: '#FFD23F', hand: 'wand', tip: '#FFD84A' } },
    { id: 'f_listochek', set: 'fairy', name: 'Листочек', p: { hair: 'braids', hairColor: '#6B8E23', crown: 'leaves', back: 'wings', wings: 'leaf', wingColors: ['#A8E6A0', '#CFF5C8'], lower: 'dress', lowerColor: '#4CB944', pattern: 'leaves', hand: 'flower' } },
    { id: 'f_snezhinka', set: 'fairy', name: 'Снежинка', p: { hair: 'long', hairColor: '#DCEBFF', tiara: 'snow', back: 'wings', wings: 'butterfly', wingColors: ['#E0F2FF', '#FFFFFF'], lower: 'dress', lowerColor: '#BFE0FF', pattern: 'snow', hand: 'wand', tip: '#BFE9FF' } },
    // Супергерои (свои, без героев из комиксов)
    { id: 'h_grisha', set: 'hero', name: 'Паучок Гриша', p: { mask: 'spider', suit: 'web', emblem: 'spider' } },
    { id: 'h_lena', set: 'hero', name: 'Ракета Лена', p: { hair: 'ponytail', hairColor: '#F2C94C', hat: 'helmet', hatColor: '#FF8C1A', suit: 'plain', back: 'jetpack', emblem: 'star' } },
    { id: 'h_mila', set: 'hero', name: 'Мила-Сердечко', p: { hair: 'long', hairColor: '#7A3B1A', mask: 'eye', maskColor: '#C2185B', suit: 'plain', back: 'cape', backColor: '#FF4F9A', emblem: 'heart' } },
    { id: 'h_nochka', set: 'hero', name: 'Ночка', p: { hair: 'short', hairColor: '#1E1433', mask: 'eye', maskColor: '#1E2A78', suit: 'plain', back: 'cape', backColor: '#2B2D6E', emblem: 'moon' } },
    { id: 'h_kostya', set: 'hero', name: 'Костя-Молния', p: { hair: 'messy', hairColor: '#8A5A2B', mask: 'eye', maskColor: '#2B6FD6', suit: 'plain', back: 'cape', backColor: '#2FA8F0', emblem: 'bolt' } },
    // Животные
    { id: 'a_cat', set: 'animal', name: 'Котик Барсик', p: { ears: 'cat', snout: 'cat', tail: 'cat' } },
    { id: 'a_turtle', set: 'animal', name: 'Черепашка Тиша', p: { back: 'shell', snout: 'turtle', tail: 'turtle' } },
    { id: 'a_capy', set: 'animal', name: 'Капибара Капа', p: { ears: 'capy', snout: 'capy', topper: 'mandarin' } },
    { id: 'a_bunny', set: 'animal', name: 'Зайка Пуша', p: { ears: 'bunny', snout: 'bunny', tail: 'bunny' } },
    { id: 'a_fox', set: 'animal', name: 'Лисичка Рыжик', p: { ears: 'fox', snout: 'fox', tail: 'fox' } },
    { id: 'a_bear', set: 'animal', name: 'Мишка Топа', p: { ears: 'bear', snout: 'bear', tail: 'bear' } },
    // Боги
    { id: 'g_yarik', set: 'god', name: 'Бог солнца Ярик', p: { hair: 'curly', hairColor: '#F2A900', crown: 'sun', aura: '#FFE066', lower: 'toga', lowerColor: '#FFB347', hand: 'sunstaff' } },
    { id: 'g_marina', set: 'god', name: 'Богиня моря Марина', p: { hair: 'longWavy', hairColor: '#14BFA8', crown: 'sea', aura: '#9BE7FF', lower: 'dress', lowerColor: '#1E88E5', pattern: 'waves', hand: 'trident' } },
    { id: 'g_grom', set: 'god', name: 'Бог грома Громыш', p: { beard: '#C9D3E8', hair: 'messy', hairColor: '#C9D3E8', crown: 'thunder', aura: '#B9C6FF', lower: 'toga', lowerColor: '#3D5AFE', hand: 'bolt' } },
    { id: 'g_lusha', set: 'god', name: 'Богиня луны Луша', p: { hair: 'long', hairColor: '#E6E6FA', crown: 'moon', aura: '#DCD6FF', lower: 'dress', lowerColor: '#2B2D6E', pattern: 'stars' } },
    { id: 'g_vesna', set: 'god', name: 'Богиня весны Весна', p: { hair: 'braids', hairColor: '#C98B4F', crown: 'flowers', aura: '#C8F7C5', lower: 'dress', lowerColor: '#66CC7E', pattern: 'flowers', hand: 'flower' } },
  ];
  D.heroById = {};
  for (const h of D.heroes) D.heroById[h.id] = h;
  D.heroesOf = (setId) => D.heroes.filter((h) => h.set === setId);
  // Какой герой соответствует старому «набору-костюму» (для старых сохранений)
  D.heroForOldSet = { wizard: 'w_gosha', robot: 'r_robik', fairy: 'f_roza', hero: 'h_kostya', animal: 'a_bunny', god: 'g_yarik' };

  // Миры (эскиз 2). Играбельный пока один
  D.worlds = [
    { id: 'magic', name: 'Волшебная школа', say: 'Мир волшебной школы!', icon: 'wand', color: '#9B7BFF', playable: true },
    { id: 'spider', name: 'Герой-паук', say: 'Мир героя-паука.', icon: 'web', color: '#FF7A7A' },
    { id: 'robots', name: 'Роботы', say: 'Вселенная роботов.', icon: 'robot', color: '#7FA8E0' },
    { id: 'plants', name: 'Растения', say: 'Мир растений.', icon: 'flower', color: '#66CC7E' },
    { id: 'elves', name: 'Эльфы и жучки', say: 'Эльфы с насекомыми.', icon: 'bug', color: '#F5B041' },
    { id: 'kitchen', name: 'Кухня', say: 'Кухня.', icon: 'pot', color: '#F78FB8' },
    { id: 'forest', name: 'Лес', say: 'Лес.', icon: 'tree', color: '#4DB35E' },
    { id: 'city', name: 'Город', say: 'Город.', icon: 'city', color: '#8C9BB5' },
    { id: 'internet', name: 'Интернет', say: 'Интернет.', icon: 'net', color: '#3CC0E0' },
  ];

  // Сцены мира волшебной школы
  D.scenes = [
    {
      id: 'tree',
      name: 'Волшебное дерево',
      artifact: 'wand',
      artName: 'Волшебная палочка',
      intro: 'Волшебное дерево. Найди волшебную палочку!',
      hint: 'Палочка в домике на дереве. Залезай по лестнице!',
      found: 'Ура! Ты нашла волшебную палочку!',
      music: 0,
    },
    {
      id: 'house',
      name: 'Домик под лестницей',
      artifact: 'glasses',
      artName: 'Очки',
      intro: 'Домик под лестницей. Найди очки!',
      hint: 'Очки спрятались в каморке под лестницей. Зайди туда из комнаты слева!',
      found: 'Ура! Ты нашла очки!',
      music: 1,
    },
    {
      id: 'library',
      name: 'Библиотека',
      artifact: 'book',
      artName: 'Книга заклинаний',
      intro: 'Волшебная библиотека. Найди книгу заклинаний!',
      hint: 'Книга лежит на самой верхней полке. Прыгай на летающие книжки!',
      found: 'Ура! Ты нашла книгу заклинаний!',
      music: 2,
    },
    {
      id: 'potions',
      name: 'Класс зелий',
      artifact: 'potion',
      artName: 'Радужное зелье',
      intro: 'Класс зелий. Найди радужное зелье!',
      hint: 'Прыгай в котлы, они подбрасывают вверх! Зелье на верхней полке справа.',
      found: 'Ура! Ты нашла радужное зелье!',
      music: 3,
    },
    {
      id: 'tower',
      name: 'Звёздная башня',
      artifact: 'star',
      artName: 'Звезда желаний',
      intro: 'Звёздная башня. Найди звезду желаний!',
      hint: 'Звезда на самой вершине башни. Поднимайся всё выше!',
      found: 'Ура! Ты нашла звезду желаний! Загадай желание!',
      music: 4,
    },
  ];

  D.sceneIndex = function (id) {
    return D.scenes.findIndex((s) => s.id === id);
  };

  // Награды
  D.ARTIFACT_BONUS = 20; // за артефакт в первый раз
  D.ARTIFACT_BONUS_AGAIN = 5; // за повторное прохождение
  D.ALL_COINS_BONUS = 10; // если собраны все монетки сцены
  D.WORLD_BONUS = 50; // за весь мир в первый раз

  // Фразы для озвучки
  D.say = {
    hello: 'Привет, Василиса! Давай играть!',
    character: 'Выбери, какой ты будешь! Нажимай на цвета, наряды и героев внизу.',
    characterAgain: 'Какой ты будешь сегодня?',
    worlds: 'Выбери мир!',
    worldLocked: 'Этот мир скоро откроется!',
    moreWorlds: 'Скоро миров будет очень много. Тысяча!',
    map: 'Куда пойдём?',
    sceneLocked: 'Сначала пройди прошлую сцену!',
    hallLocked: 'Праздник будет в самом конце! Пройди все сцены.',
    needStars: 'Нужно больше звёздочек! Собирай монетки в мирах.',
    bought: 'Ура! Теперь это твоё!',
    allCoins: 'Ты собрала все монетки!',
    hall: 'Праздник в честь Василисы! Ты прошла мир волшебной школы!',
    hallCount: 'Посмотри, сколько звёздочек!',
    pause: 'Пауза. Отдохни немножко!',
    tapHero: ['Хи-хи!', 'Привет!', 'Я готова!', 'Ура!'],
    praise: ['Молодец, Василиса!', 'Здорово!', 'Отлично!', 'Супер!'],
  };
})(window.VW);
