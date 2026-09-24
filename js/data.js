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

  // Питомцы (лента справа). Цены 10, 11, 12 — как на эскизе Василисы
  D.pets = [
    { id: 'cat', name: 'Котик', price: 10 },
    { id: 'robot', name: 'Робот', price: 11 },
    { id: 'turtle', name: 'Черепашка', price: 12 },
    { id: 'owl', name: 'Совёнок', price: 40 },
  ];

  // Наборы персонажей (лента снизу). Цены — с эскиза Василисы
  D.sets = [
    { id: 'wizard', name: 'Волшебники', price: 1000 },
    { id: 'robot', name: 'Домашний робот', price: 200 },
    { id: 'fairy', name: 'Феи', price: 12 },
    { id: 'hero', name: 'Супергерои', price: 10 },
    { id: 'animal', name: 'Животные', price: 102 },
    { id: 'god', name: 'Боги', price: 231 },
  ];

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
    character: 'Выбери, какой ты будешь! Нажимай на цвета и наряды.',
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
