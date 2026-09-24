/* Vasilisa World — оформление сцен: небо, стены, декор, стили площадок.
   Каждая тема описывает, как выглядит сцена; генератор (gen.js) строит площадки,
   а Themes.dress() раскрашивает их и добавляет фон. */
(function (VW) {
  'use strict';

  const U = VW.U;
  const Th = (VW.Themes = {});
  const T = {};
  Th.list = T;
  Th.get = (id) => T[id];

  // Слова для подсказок по умолчанию
  const WORDS = { pad: 'батут', mover: 'ездящем мостике', lift: 'лифт', plats: 'ступенькам', blocks: 'кубикам' };

  // ================= Волшебная школа (следующие круги) =================
  T.magicForest = {
    name: 'Зачарованный лес', layout: 'wide',
    sky: ['#56B4FF', '#A6DCFF', '#E4F6FF'], sun: { x: 0.85, y: 110, r: 52, color: '#FFE45C', glow: '#FFF3A0' },
    clouds: { n: 4 }, far: [{ kind: 'mountains', color: '#B7C6F5', base: 240, amp: 170, f: 0.12 }, { kind: 'roundTrees', color: '#9FD69A', base: 120, amp: 70, f: 0.3 }],
    styles: { ground: 'grass', plat: 'mushCap', walk: 'mushCap', top: 'mushCap', perch: 'mushCap', pad: 'mushroom', mover: 'cloud', lift: 'cloud', block: 'stoneBlock', stone: 'rock' },
    palette: ['#FF6FA8', '#B983FF', '#5AC8FA', '#FFB347'], ladder: 'wood', column: 'trunk', water: '#8FDBFF',
    deco: ['bigTree', 'flowers', 'sparkleFlower'], front: 'sparkles', friend: 'owl',
    words: { pad: 'гриб-батут', mover: 'облачке', lift: 'облачко', plats: 'грибным шляпкам' },
    music: { song: 'level', transpose: 2 },
  };
  T.magicLibrary = {
    name: 'Волшебная библиотека', layout: 'wide', indoor: true,
    wall: { kind: 'planks', base: '#7A4A2A', line: '#5E3820', light: '#8C5A34' },
    styles: { ground: 'floor', plat: 'shelf', walk: 'shelf', top: 'shelf', perch: 'shelf', pad: 'cushion', mover: 'book', lift: 'book', block: 'bookStack', stone: 'bookStack' },
    palette: ['#E0533F', '#3F8FE0', '#2FBF55', '#B983FF', '#FFB347'], ladder: 'brass', column: 'bookColumn',
    deco: ['bookcase', 'globe', 'candle'], front: 'dust', friend: 'owl',
    words: { pad: 'подушку-прыгушку', mover: 'летающей книге', lift: 'летающую книгу', plats: 'полкам', blocks: 'стопкам книг' },
    music: { song: 'level', transpose: -3 },
  };
  T.magicPotions = {
    name: 'Класс зелий', layout: 'wide', indoor: true,
    wall: { kind: 'stones', base: '#5E5478', line: '#473E5E', light: '#6E6490' },
    styles: { ground: 'stonefloor', plat: 'stone', walk: 'stone', top: 'stone', perch: 'stone', pad: 'cauldron', mover: 'carpet', lift: 'carpet', block: 'stoneBlock', stone: 'stoneBlock' },
    palette: ['#7CFF6A', '#FF7EC8', '#6AD8FF', '#FFD23F', '#B983FF'], ladder: 'wood', column: 'stoneColumn',
    deco: ['torch', 'flaskShelf', 'bigCauldron'], front: 'bubbles', friend: 'frog',
    words: { pad: 'котёл', mover: 'ковре-самолёте', lift: 'ковёр-самолёт', plats: 'камням', blocks: 'камням' },
    music: { song: 'level', transpose: 5 },
  };
  T.magicCastle = {
    name: 'Ночной замок', layout: 'tall',
    sky: ['#1B1646', '#3A2A7A', '#6B4FB0', '#A77BD8'], moon: { x: 0.82, y: 120, r: 44 }, stars: 70,
    far: [{ kind: 'mountains', color: '#4B3A8A', base: 200, amp: 150, f: 0.1 }],
    tallBack: 'castleWall',
    styles: { ground: 'grassNight', floor: 'balcony', plat: 'balcony', top: 'balcony', perch: 'balcony', pad: 'cauldron', mover: 'carpet', lift: 'carpet', block: 'stoneBlock' },
    palette: ['#B983FF', '#6AD8FF', '#FFD23F'], ladder: 'metal', column: 'stoneColumn',
    deco: [], front: 'fireflies', friend: 'owl',
    words: { pad: 'котёл', lift: 'ковёр-самолёт', plats: 'балкончикам' },
    connect: { ladder: 3, stairs: 2, lift: 2, bounce: 1 },
    music: { song: 'level', transpose: -1 },
  };

  // ================= Герой-паук =================
  T.roofs = {
    name: 'Крыши города', layout: 'wide',
    sky: ['#6A5ACD', '#C86FB0', '#FF9A7A', '#FFD49A'], sun: { x: 0.78, y: 470, r: 70, color: '#FFB36B', glow: '#FFE0A0' },
    clouds: { n: 4, color: 'rgba(255,214,230,0.85)', shadow: 'rgba(160,90,150,0.3)' },
    far: [{ kind: 'skyline', color: '#A77BB8', base: 330, amp: 220, f: 0.08, lit: 0.12, win: '#FFD98A' }, { kind: 'skyline', color: '#7E568F', base: 190, amp: 150, f: 0.22, lit: 0.3, win: '#FFE08A' }],
    styles: { ground: 'street', plat: 'roof', walk: 'roof', top: 'roof', perch: 'ledge', pad: 'awning', mover: 'cradle', lift: 'cradle', block: 'boxes', stone: 'boxes' },
    palette: ['#E57373', '#64B5F6', '#FFB74D', '#81C784', '#BA68C8', '#4DD0E1', '#F06292', '#A1887F'],
    ladder: 'metal', column: 'pole', deco: ['lamp', 'hydrant', 'bench', 'web'], friend: 'spider',
    features: { stairs: 4, ladder: 2, bounce: 2, mover: 1, lift: 2, column: 0, blocks: 1 },
    words: { pad: 'навес-батут', mover: 'люльке', lift: 'люльку', plats: 'крышам', blocks: 'ящикам' },
    music: { song: 'city', transpose: 0 },
  };
  T.webpark = {
    name: 'Паутинный парк', layout: 'wide',
    sky: ['#1B1B4B', '#2E2A6B', '#4A3F8F', '#6B5AAE'], moon: { x: 0.8, y: 110, r: 46 }, stars: 60,
    far: [{ kind: 'skyline', color: '#3A3570', base: 300, amp: 160, f: 0.07, lit: 0.25, win: '#FFE08A' }, { kind: 'roundTrees', color: '#2A2F66', base: 200, amp: 90, f: 0.16 }, { kind: 'roundTrees', color: '#23284F', base: 110, amp: 70, f: 0.3 }],
    styles: { ground: 'grassNight', plat: 'webBridge', walk: 'webBridge', top: 'webBridge', perch: 'webBridge', pad: 'webPad', mover: 'swing', lift: 'swing', block: 'boxes', stone: 'rock' },
    palette: ['#F4F4FF'], ladder: 'web', column: 'darkTrunk', water: '#4A6FD0',
    deco: ['parkTree', 'lampOn', 'bench', 'web'], front: 'fireflies', friend: 'spider',
    features: { stairs: 3, ladder: 2, bounce: 3, mover: 1, lift: 1, column: 2, blocks: 0 },
    words: { pad: 'паутинку-батут', mover: 'качелях', lift: 'качели', plats: 'паутинкам' },
    music: { song: 'city', transpose: -3, bpm: 108 },
  };
  T.skyscraper = {
    name: 'Ночной небоскрёб', layout: 'tall',
    sky: ['#0F1A3D', '#1E2F6B', '#3A4F9A', '#5E6FB8'], moon: { x: 0.85, y: 100, r: 40 }, stars: 60,
    far: [{ kind: 'skyline', color: '#2A3A70', base: 320, amp: 220, f: 0.06, lit: 0.3, win: '#FFE08A' }, { kind: 'skyline', color: '#1E2A55', base: 180, amp: 150, f: 0.16, lit: 0.4, win: '#8FE8FF' }],
    tallBack: 'facade',
    styles: { ground: 'street', floor: 'ledge', plat: 'ledge', top: 'ledge', perch: 'ledge', pad: 'awning', mover: 'cradle', lift: 'cradle', block: 'boxes' },
    palette: ['#3E4A7A'], ladder: 'metal', column: 'antenna', friend: 'spider',
    words: { pad: 'навес-батут', lift: 'люльку', plats: 'балкончикам' },
    connect: { ladder: 3, stairs: 2, lift: 2, bounce: 1 },
    music: { song: 'city', transpose: 2 },
  };

  // ================= Роботы =================
  T.factory = {
    name: 'Фабрика роботов', layout: 'wide', indoor: true,
    wall: { kind: 'panels', base: '#5E7494', line: '#4A5E7C', light: '#6F87A8' },
    styles: { ground: 'metalFloor', plat: 'girder', walk: 'girder', top: 'girder', perch: 'girder', pad: 'spring', mover: 'hover', lift: 'hover', block: 'metalBox', stone: 'metalBox' },
    palette: ['#3D7BD9', '#FF9A3C', '#2FBF55'], ladder: 'metal', column: 'pipe',
    deco: ['gear', 'pipes', 'lampRed', 'robotBack'], front: 'sparks', friend: 'robot',
    features: { stairs: 3, ladder: 2, bounce: 2, mover: 2, lift: 2, column: 1, blocks: 1 },
    words: { pad: 'пружину', mover: 'летающей платформе', lift: 'летающую платформу', plats: 'балкам', blocks: 'ящикам' },
    music: { song: 'tech', transpose: 0 },
  };
  T.warehouse = {
    name: 'Склад запчастей', layout: 'wide', indoor: true,
    wall: { kind: 'corrugated', base: '#7F8FA6', line: '#6A7A92', light: '#92A2B8' },
    styles: { ground: 'concrete', plat: 'crate', walk: 'crate', top: 'crate', perch: 'crate', pad: 'spring', mover: 'hook', lift: 'hook', block: 'crate', stone: 'crate' },
    palette: ['#D9A35F', '#C98B4F', '#E0B070'], ladder: 'metal', column: 'lattice',
    deco: ['rack', 'hangLamp', 'barrel'], friend: 'robot',
    features: { stairs: 3, ladder: 2, bounce: 2, mover: 2, lift: 2, column: 0, blocks: 2 },
    words: { pad: 'пружину', mover: 'подвеске', lift: 'подвеску', plats: 'ящикам', blocks: 'ящикам' },
    music: { song: 'tech', transpose: -2, bpm: 112 },
  };
  T.spaceport = {
    name: 'Космодром', layout: 'tall',
    sky: ['#0B0B2A', '#1A1A4A', '#2E2A6E', '#4B3F8F'], stars: 110, planet: true,
    far: [{ kind: 'hills', color: '#2A2560', base: 120, amp: 50, f: 0.12 }],
    tallBack: 'rocketTower',
    styles: { ground: 'concrete', floor: 'girder', plat: 'girder', top: 'girder', perch: 'girder', pad: 'spring', mover: 'hover', lift: 'hover', block: 'metalBox' },
    palette: ['#E0533F', '#3D7BD9'], ladder: 'metal', column: 'lattice', front: 'sparkles', friend: 'robot',
    words: { pad: 'пружину', lift: 'летающую платформу', plats: 'балкам' },
    connect: { ladder: 3, stairs: 1, lift: 3, bounce: 2 },
    music: { song: 'tech', transpose: 3 },
  };

  // ================= Растения =================
  T.garden = {
    name: 'Огород', layout: 'wide',
    sky: ['#7CC8FF', '#B5E2FF', '#E8F7FF'], sun: { x: 0.14, y: 110, r: 50, color: '#FFE45C', glow: '#FFF3A0' }, clouds: { n: 4 },
    far: [{ kind: 'hills', color: '#A8D98A', base: 200, amp: 70, f: 0.12 }, { kind: 'hills', color: '#8CCB6E', base: 120, amp: 50, f: 0.28 }],
    styles: { ground: 'soil', plat: 'leaf', walk: 'leaf', top: 'leaf', perch: 'leaf', pad: 'pumpkin', mover: 'bee', lift: 'bee', block: 'potBlock', stone: 'potBlock' },
    palette: ['#5FBF4A', '#7CD35A', '#4FAF6A'], ladder: 'vine', column: 'stalk', water: '#8FDBFF',
    deco: ['fence', 'sunflower', 'cabbage', 'scarecrow'], front: 'butterflies', friend: 'snail',
    features: { stairs: 3, ladder: 2, bounce: 2, mover: 1, lift: 1, column: 2, blocks: 1 },
    words: { pad: 'тыкву', mover: 'листике с пчёлкой', lift: 'листик с пчёлкой', plats: 'листикам', blocks: 'горшочкам' },
    music: { song: 'nature', transpose: 0 },
  };
  T.greenhouse = {
    name: 'Теплица', layout: 'wide', indoor: true,
    wall: { kind: 'glass', base: '#CFF2E0', line: '#FFFFFF', light: '#E6FFF2', sky: ['#9EDBFF', '#D8F4FF'] },
    styles: { ground: 'floor', plat: 'potShelf', walk: 'potShelf', top: 'potShelf', perch: 'potShelf', pad: 'pumpkin', mover: 'hangPot', lift: 'hangPot', block: 'potBlock', stone: 'potBlock' },
    palette: ['#E07A4F', '#F2A65A', '#D96C4A'], ladder: 'bamboo', column: 'stalk',
    deco: ['bigPlant', 'hangVine', 'canDeco'], front: 'butterflies', friend: 'snail',
    words: { pad: 'тыкву', mover: 'подвесной корзинке', lift: 'подвесную корзинку', plats: 'полочкам', blocks: 'горшочкам' },
    music: { song: 'nature', transpose: 3 },
  };
  T.giantflowers = {
    name: 'Сад великанов', layout: 'tall',
    sky: ['#6FC0FF', '#A8DCFF', '#E4F6FF'], sun: { x: 0.18, y: 100, r: 50, color: '#FFE45C', glow: '#FFF3A0' }, clouds: { n: 5 },
    far: [{ kind: 'hills', color: '#A8D98A', base: 160, amp: 60, f: 0.1 }],
    tallBack: 'giantStalks',
    styles: { ground: 'grass', floor: 'vineFloor', plat: 'leaf', top: 'flowerTop', perch: 'leaf', pad: 'flowerPad', mover: 'bee', lift: 'bee', block: 'potBlock' },
    palette: ['#5FBF4A', '#7CD35A'], ladder: 'vine', column: 'stalk', front: 'butterflies', friend: 'snail',
    words: { pad: 'цветок-батут', lift: 'листик с пчёлкой', plats: 'листикам' },
    connect: { ladder: 3, stairs: 2, lift: 1, bounce: 2 },
    music: { song: 'nature', transpose: 5 },
  };

  // ================= Эльфы и жучки =================
  T.mushrooms = {
    name: 'Грибная поляна', layout: 'wide',
    sky: ['#8FCBFF', '#C6E6FF', '#FFF1CC'], sun: { x: 0.8, y: 120, r: 54, color: '#FFD45C', glow: '#FFF0A0' }, clouds: { n: 3 },
    far: [{ kind: 'roundTrees', color: '#9FD08A', base: 190, amp: 80, f: 0.12 }, { kind: 'mushroomsFar', color: '#E7A0C0', base: 110, amp: 70, f: 0.27 }],
    styles: { ground: 'grass', plat: 'mushCap', walk: 'mushCap', top: 'mushCap', perch: 'mushCap', pad: 'mushroom', mover: 'ladybug', lift: 'ladybug', block: 'stumpBlock', stone: 'rock' },
    palette: ['#F0433A', '#B5651D', '#9A55E8', '#FF8C1A', '#E85D9A'], ladder: 'vine', column: 'mushStem', water: '#8FDBFF',
    deco: ['mushBig', 'elfHouse', 'flowers', 'grassTuft'], front: 'butterflies', friend: 'elf',
    features: { stairs: 4, ladder: 1, bounce: 3, mover: 1, lift: 1, column: 1, blocks: 1 },
    words: { pad: 'гриб-батут', mover: 'божьей коровке', lift: 'божью коровку', plats: 'шляпкам грибов', blocks: 'пенёчкам' },
    music: { song: 'nature', transpose: 2, bpm: 104 },
  };
  T.bugtown = {
    name: 'Жучиный городок', layout: 'wide',
    sky: ['#9AD8FF', '#CFEFFF', '#F2FFF0'], sun: { x: 0.2, y: 100, r: 46, color: '#FFE45C', glow: '#FFF3A0' },
    far: [{ kind: 'grassFar', color: '#9BD37E', base: 260, amp: 200, f: 0.12 }, { kind: 'grassFar', color: '#7CC364', base: 150, amp: 160, f: 0.26 }],
    styles: { ground: 'grass', plat: 'leafFlat', walk: 'twig', top: 'leafFlat', perch: 'leafFlat', pad: 'flowerPad', mover: 'dragonfly', lift: 'dragonfly', block: 'pebble', stone: 'pebble' },
    palette: ['#6CC24A', '#8AD35A', '#4FAF4A'], ladder: 'vine', column: 'grassStem', water: '#8FDBFF',
    deco: ['grassBlade', 'snailHouse', 'dandelion', 'beetleHouse'], front: 'pollen', friend: 'ant',
    features: { stairs: 3, ladder: 2, bounce: 2, mover: 1, lift: 1, column: 2, blocks: 1 },
    words: { pad: 'цветок-батут', mover: 'стрекозе', lift: 'стрекозу', plats: 'листикам', blocks: 'камушкам' },
    music: { song: 'nature', transpose: -2 },
  };
  T.fireflies = {
    name: 'Светлячковая ночь', layout: 'tall',
    sky: ['#141A45', '#26306E', '#3E4A9A', '#5A5AB8'], moon: { x: 0.2, y: 110, r: 48 }, stars: 80,
    far: [{ kind: 'roundTrees', color: '#1E2A5A', base: 180, amp: 80, f: 0.1 }],
    tallBack: 'glowTree',
    styles: { ground: 'grassNight', floor: 'branch', plat: 'glowCap', top: 'glowCap', perch: 'glowCap', pad: 'mushroom', mover: 'ladybug', lift: 'ladybug', block: 'stumpBlock' },
    palette: ['#5AE0FF', '#B983FF', '#7CFFB0', '#FF9EE0'], ladder: 'vine', column: 'darkTrunk', front: 'fireflies', friend: 'elf',
    words: { pad: 'гриб-батут', lift: 'божью коровку', plats: 'светящимся грибам' },
    connect: { ladder: 3, stairs: 2, lift: 1, bounce: 2 },
    music: { song: 'nature', transpose: -4, bpm: 96 },
  };

  // ================= Кухня =================
  T.cupboard = {
    name: 'Буфет', layout: 'wide', indoor: true,
    wall: { kind: 'wallpaper', base: '#FFF1C9', line: '#FFB8C8', light: '#FFE3A0', wainscot: '#E8B88A' },
    styles: { ground: 'kitchenFloor', plat: 'kshelf', walk: 'kshelf', top: 'kshelf', perch: 'kshelf', pad: 'jelly', mover: 'tray', lift: 'tray', block: 'tin', stone: 'tin' },
    palette: ['#FF8FB8', '#8FD3FF', '#FFD23F', '#9BE08A'], ladder: 'wood', column: 'rollingPin',
    deco: ['jar', 'plates', 'cups', 'clock', 'kWindow'], friend: 'mouse',
    features: { stairs: 4, ladder: 2, bounce: 2, mover: 1, lift: 1, column: 1, blocks: 2 },
    words: { pad: 'желе-батут', mover: 'подносе', lift: 'поднос', plats: 'полочкам', blocks: 'баночкам' },
    music: { song: 'bouncy', transpose: 0 },
  };
  T.stove = {
    name: 'Плита и кастрюли', layout: 'wide', indoor: true,
    wall: { kind: 'tiles', base: '#E8F4FF', line: '#9CC8EE', light: '#FFFFFF' },
    styles: { ground: 'kitchenFloor', plat: 'pan', walk: 'kshelf', top: 'kshelf', perch: 'pan', pad: 'kpot', mover: 'lid', lift: 'lid', block: 'tin', stone: 'tin' },
    palette: ['#5A6378', '#E0533F', '#3F8FE0'], ladder: 'wood', column: 'ladle',
    deco: ['stoveBody', 'kettle', 'utensils', 'kWindow'], front: 'steam', friend: 'mouse',
    features: { stairs: 3, ladder: 2, bounce: 3, mover: 1, lift: 2, column: 0, blocks: 1 },
    words: { pad: 'кастрюлю-прыгалку', mover: 'крышке', lift: 'крышку', plats: 'сковородкам', blocks: 'баночкам' },
    music: { song: 'bouncy', transpose: -3 },
  };
  T.cake = {
    name: 'Торт-гора', layout: 'tall', indoor: true,
    wall: { kind: 'sprinkles', base: '#FFE0EC', line: '#FFB8D4', light: '#FFF4F8' },
    tallBack: 'cakeTiers',
    styles: { ground: 'kitchenFloor', floor: 'cakeTier', plat: 'cupcake', top: 'cupcake', perch: 'cupcake', pad: 'jelly', mover: 'macaron', lift: 'macaron', block: 'tin' },
    palette: ['#FF8FB8', '#8FD3FF', '#FFD23F', '#9BE08A', '#C49BFF'], ladder: 'candy', column: 'candle', friend: 'mouse',
    words: { pad: 'желе-батут', lift: 'печеньку', plats: 'кексикам' },
    connect: { ladder: 3, stairs: 2, lift: 1, bounce: 2 },
    music: { song: 'bouncy', transpose: 4 },
  };

  // ================= Лес =================
  T.birches = {
    name: 'Берёзовая роща', layout: 'wide',
    sky: ['#8ECFFF', '#C2E6FF', '#EAF7FF'], sun: { x: 0.82, y: 110, r: 48, color: '#FFE45C', glow: '#FFF3A0' }, clouds: { n: 3 },
    far: [{ kind: 'pines', color: '#9CC7A6', base: 220, amp: 120, f: 0.1 }, { kind: 'roundTrees', color: '#78B884', base: 120, amp: 70, f: 0.25 }],
    styles: { ground: 'grass', plat: 'forestPlat', walk: 'log', top: 'forestPlat', perch: 'forestPlat', pad: 'mushroom', mover: 'swing', lift: 'swing', block: 'stumpBlock', stone: 'rock' },
    palette: ['#B5651D'], ladder: 'rope', column: 'birch', water: '#8FDBFF',
    deco: ['birch', 'bush', 'fern', 'mushSmall'], front: 'leaves', friend: 'hedgehog',
    features: { stairs: 3, ladder: 2, bounce: 2, mover: 1, lift: 1, column: 2, blocks: 1 },
    words: { pad: 'гриб-батут', mover: 'качелях', lift: 'качели', plats: 'веточкам', blocks: 'пенёчкам' },
    music: { song: 'nature', transpose: 0, bpm: 100 },
  };
  T.berries = {
    name: 'Ягодная поляна', layout: 'wide',
    sky: ['#79C4FF', '#B8E2FF', '#FFF6D8'], sun: { x: 0.16, y: 110, r: 54, color: '#FFE45C', glow: '#FFF3A0' }, clouds: { n: 4 },
    far: [{ kind: 'pines', color: '#A3CFA0', base: 200, amp: 100, f: 0.12 }, { kind: 'hills', color: '#8FD27A', base: 110, amp: 45, f: 0.28 }],
    styles: { ground: 'grass', plat: 'log', walk: 'log', top: 'log', perch: 'log', pad: 'mushroom', mover: 'swing', lift: 'swing', block: 'stumpBlock', stone: 'rock' },
    palette: ['#F0433A'], ladder: 'rope', column: 'trunk', water: '#8FDBFF',
    deco: ['berryBush', 'bigStrawberry', 'flowers', 'fern'], front: 'butterflies', friend: 'hedgehog',
    features: { stairs: 4, ladder: 2, bounce: 2, mover: 1, lift: 1, column: 1, blocks: 1 },
    words: { pad: 'гриб-батут', mover: 'качелях', lift: 'качели', plats: 'брёвнышкам', blocks: 'пенёчкам' },
    music: { song: 'nature', transpose: 4 },
  };
  T.oak = {
    name: 'Старый дуб', layout: 'tall',
    sky: ['#FFB38A', '#FFD3A8', '#BFE3FF', '#8ECFFF'], sun: { x: 0.8, y: 130, r: 50, color: '#FFD45C', glow: '#FFF0A0' }, clouds: { n: 3 },
    far: [{ kind: 'pines', color: '#9CC7A6', base: 200, amp: 110, f: 0.08 }],
    tallBack: 'oakTrunk',
    styles: { ground: 'grass', floor: 'branch', plat: 'branch', top: 'branch', perch: 'branch', pad: 'mushroom', mover: 'swing', lift: 'swing', block: 'stumpBlock' },
    palette: ['#B5651D'], ladder: 'rope', column: 'trunk', front: 'leaves', friend: 'owl',
    words: { pad: 'гриб-батут', lift: 'качели', plats: 'веточкам' },
    connect: { ladder: 3, stairs: 2, lift: 1, bounce: 2 },
    music: { song: 'nature', transpose: -2 },
  };

  // ================= Город =================
  T.street = {
    name: 'Улица', layout: 'wide',
    sky: ['#8FD3FF', '#C6EBFF', '#F0FAFF'], sun: { x: 0.86, y: 100, r: 48, color: '#FFE45C', glow: '#FFF3A0' }, clouds: { n: 4 },
    far: [{ kind: 'skyline', color: '#C2CEE6', base: 330, amp: 230, f: 0.08, lit: 0 }, { kind: 'skyline', color: '#A6B4D2', base: 200, amp: 160, f: 0.22, lit: 0 }],
    styles: { ground: 'street', plat: 'roof', walk: 'roof', top: 'roof', perch: 'ledge', pad: 'awning', mover: 'balloons', lift: 'balloons', block: 'boxes', stone: 'boxes' },
    palette: ['#FFB74D', '#81C784', '#64B5F6', '#E57373', '#F06292', '#FFD54F', '#A1887F'],
    ladder: 'metal', column: 'pole', deco: ['shop', 'lamp', 'trafficLight', 'planter'], friend: 'puppy',
    features: { stairs: 4, ladder: 2, bounce: 2, mover: 1, lift: 2, column: 0, blocks: 1 },
    words: { pad: 'навес-батут', mover: 'шариках', lift: 'площадку на шариках', plats: 'крышам', blocks: 'коробкам' },
    music: { song: 'city', transpose: 2, bpm: 124 },
  };
  T.park = {
    name: 'Парк с фонтаном', layout: 'wide',
    sky: ['#86CCFF', '#BFE6FF', '#EEF9FF'], sun: { x: 0.2, y: 110, r: 50, color: '#FFE45C', glow: '#FFF3A0' }, clouds: { n: 4 },
    far: [{ kind: 'skyline', color: '#C9D4EA', base: 300, amp: 160, f: 0.07, lit: 0 }, { kind: 'ferris', color: '#E08AB8', base: 150, f: 0.12 }, { kind: 'roundTrees', color: '#86C77A', base: 110, amp: 70, f: 0.28 }],
    styles: { ground: 'grass', plat: 'playground', walk: 'playground', top: 'playground', perch: 'playground', pad: 'trampoline', mover: 'swing', lift: 'swing', block: 'boxes', stone: 'rock' },
    palette: ['#FF6B6B', '#4FC3F7', '#FFD54F', '#81C784', '#BA68C8'], ladder: 'rope', column: 'pole', water: '#7FD0FF',
    deco: ['parkTree', 'bench', 'lampOn', 'flowerbed', 'fountain'], front: 'butterflies', friend: 'puppy',
    features: { stairs: 3, ladder: 2, bounce: 3, mover: 1, lift: 1, column: 1, blocks: 1 },
    words: { pad: 'батут', mover: 'качелях', lift: 'качели', plats: 'горкам', blocks: 'кубикам' },
    music: { song: 'city', transpose: -2 },
  };
  T.construction = {
    name: 'Стройка', layout: 'tall',
    sky: ['#79C4FF', '#B0DDFF', '#E6F6FF'], sun: { x: 0.15, y: 110, r: 46, color: '#FFE45C', glow: '#FFF3A0' }, clouds: { n: 4 },
    far: [{ kind: 'skyline', color: '#C2CEE6', base: 280, amp: 200, f: 0.07, lit: 0 }],
    tallBack: 'craneSite',
    styles: { ground: 'concrete', floor: 'scaffold', plat: 'girder', top: 'girder', perch: 'girder', pad: 'trampoline', mover: 'hook', lift: 'hook', block: 'boxes' },
    palette: ['#FFB300', '#FF7043'], ladder: 'metal', column: 'lattice', friend: 'puppy',
    words: { pad: 'сетку-батут', lift: 'крюк крана', plats: 'балкам' },
    connect: { ladder: 3, stairs: 2, lift: 2, bounce: 1 },
    music: { song: 'city', transpose: 4 },
  };

  // ================= Интернет =================
  T.cloudpics = {
    name: 'Облако картинок', layout: 'wide',
    sky: ['#6E6EF0', '#9E9CFF', '#C8D6FF', '#E6F4FF'], clouds: { n: 5, color: 'rgba(255,255,255,0.9)', shadow: 'rgba(120,120,220,0.35)' },
    far: [{ kind: 'icons', color: 'rgba(255,255,255,0.35)', base: 400, f: 0.1 }],
    styles: { ground: 'pixelGround', plat: 'window', walk: 'window', top: 'window', perch: 'window', pad: 'smiley', mover: 'loadBar', lift: 'loadBar', block: 'pixelBlock', stone: 'pixelBlock' },
    palette: ['#FF6FA8', '#4FC3F7', '#FFD54F', '#7CD35A', '#B983FF'], ladder: 'pixel', column: 'cable',
    deco: ['winFloat', 'loader'], front: 'iconsUp', friend: 'smile',
    features: { stairs: 4, ladder: 2, bounce: 2, mover: 2, lift: 1, column: 1, blocks: 1 },
    words: { pad: 'смайлик-батут', mover: 'полоске загрузки', lift: 'полоску загрузки', plats: 'окошкам', blocks: 'кубикам' },
    music: { song: 'tech', transpose: 5, bpm: 128 },
  };
  T.pixel = {
    name: 'Пиксельная страна', layout: 'wide',
    sky: ['#5CC8FF', '#8FDCFF', '#C8F0FF'], pixelSun: true,
    far: [{ kind: 'pixelHills', color: '#7FD36A', base: 190, amp: 90, f: 0.12 }, { kind: 'pixelHills', color: '#5FBF4A', base: 110, amp: 60, f: 0.26 }],
    styles: { ground: 'pixelGround', plat: 'pixelBlock', walk: 'pixelBlock', top: 'pixelBlock', perch: 'pixelBlock', pad: 'pixelSpring', mover: 'pixelMover', lift: 'pixelMover', block: 'pixelBlock', stone: 'pixelBlock' },
    palette: ['#E0533F', '#FFB300', '#3F8FE0', '#9A55E8', '#2FBF55'], ladder: 'pixel', column: 'pixelCol',
    deco: ['pixelTree', 'pixelFlower', 'pixelCloud'], friend: 'smile',
    features: { stairs: 4, ladder: 2, bounce: 2, mover: 2, lift: 1, column: 1, blocks: 2 },
    words: { pad: 'пружинку', mover: 'ездящем кубике', lift: 'ездящий кубик', plats: 'кубикам', blocks: 'кубикам' },
    music: { song: 'tech', transpose: 0, bpm: 136 },
  };
  T.servers = {
    name: 'Башня серверов', layout: 'tall', indoor: true,
    wall: { kind: 'grid', base: '#1B2440', line: '#27345C', light: '#33447A' },
    tallBack: 'serverRacks',
    styles: { ground: 'rackFloor', floor: 'rackFloor', plat: 'rack', top: 'rack', perch: 'rack', pad: 'smiley', mover: 'dataLift', lift: 'dataLift', block: 'pixelBlock' },
    palette: ['#4FD1FF', '#7CFFB0', '#FF9EE0'], ladder: 'cable', column: 'cable', front: 'iconsUp', friend: 'smile',
    words: { pad: 'смайлик-батут', lift: 'светящийся лифт', plats: 'полочкам' },
    connect: { ladder: 3, stairs: 2, lift: 2, bounce: 1 },
    music: { song: 'tech', transpose: -3 },
  };

  for (const id of Object.keys(T)) {
    T[id].id = id;
    T[id].words = Object.assign({}, WORDS, T[id].words || {});
  }

  // ---------- «одеть» уровень ----------
  const FALLBACK = { ground: 'grass', floor: 'balcony', plat: 'plank', walk: 'plank', top: 'plank', perch: 'plank', pad: 'mushroom', mover: 'cloud', lift: 'cloud', block: 'stone', stone: 'rock', hidden: 'none' };

  Th.dress = function (L, theme, desc) {
    const r = U.rng((L.seed ^ 0x5bd1e995) >>> 0);
    const ST = VW.Art.styles;
    const pal = theme.palette || ['#E57373'];
    L.theme = theme;
    L.night = !!(theme.moon || theme.stars > 40);
    for (const p of L.platforms) {
      let st = p.kind === 'hidden' ? 'none' : (theme.styles && theme.styles[p.kind]) || (theme.styles && theme.styles.plat);
      if (st !== 'none' && !ST[st]) st = FALLBACK[p.kind] || 'plank';
      p.style = st;
      p.color = pal[Math.floor(r() * pal.length)];
      p.seed = Math.floor(r() * 100000);
      p.night = L.night;
      if (p.bounce) {
        p.bounceColor = theme.bounceColor || '#FFF3A0';
      }
    }
    for (const l of L.ladders) l.style = theme.ladder || 'wood';
    if (VW.Scenery) VW.Scenery.build(L, theme, r, desc);
    else {
      L.paintSky = function (ctx, cam, SW, SH) {
        VW.G.sky(ctx, SW, SH, theme.sky || ['#9EDBFF', '#E4F6FF']);
      };
    }
  };
})(window.VW);
