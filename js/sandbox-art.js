/* Vasilisa World — «Создай свой мир»: данные и рисование (местности, детали домов,
   мебель, природа, животные, продукты и блюда). Сам экран — в sandbox.js. */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, Art = VW.Art;
  const TAU = Math.PI * 2;
  const fs = Art.fs;
  const SB = (VW.SandboxArt = {});

  const C = 60; // размер клетки
  SB.C = C;

  // =========================================================
  // Местности
  // =========================================================
  SB.terrains = [
    { id: 'meadow', name: 'Поляна', say: 'Поляна с деревьями!', sky: ['#6FC0FF', '#A8DCFF', '#E4F6FF'], ground: 'grass', far: [{ kind: 'hills', color: '#A8D98A', base: 210, amp: 80, f: 0.12, seed: 3 }, { kind: 'roundTrees', color: '#86C77A', base: 120, amp: 70, f: 0.3, seed: 5 }], deco: 'trees', sun: true },
    { id: 'forest', name: 'Лес', say: 'Густой лес!', sky: ['#8ECFFF', '#C2E6FF', '#EAF7FF'], ground: 'grass', far: [{ kind: 'pines', color: '#9CC7A6', base: 240, amp: 130, f: 0.1, seed: 7 }, { kind: 'pines', color: '#6FAE7A', base: 130, amp: 110, f: 0.28, seed: 9 }], deco: 'pines', sun: true },
    { id: 'desert', name: 'Пустыня', say: 'Жаркая пустыня!', sky: ['#FFC86B', '#FFE3A0', '#FFF6D8'], ground: 'sand', far: [{ kind: 'hills', color: '#F2C27A', base: 200, amp: 70, f: 0.12, seed: 11 }, { kind: 'hills', color: '#E8A95A', base: 110, amp: 50, f: 0.3, seed: 13 }], deco: 'cacti', sun: true, hot: true },
    { id: 'mountains', name: 'Горы', say: 'Высокие горы!', sky: ['#7FB8F0', '#B8DAFF', '#E8F4FF'], ground: 'rockGround', far: [{ kind: 'mountains', color: '#B7C6F5', base: 300, amp: 230, f: 0.1, seed: 2 }, { kind: 'mountains', color: '#9AA8D8', base: 170, amp: 150, f: 0.26, seed: 6 }], deco: 'rocks', sun: true, snowcaps: true },
    { id: 'winter', name: 'Зима', say: 'Снежная зима!', sky: ['#A8C8E8', '#D0E4F4', '#F2F8FF'], ground: 'snow', far: [{ kind: 'mountains', color: '#DDE8F5', base: 250, amp: 160, f: 0.1, seed: 4 }, { kind: 'pines', color: '#8FB0C8', base: 130, amp: 110, f: 0.28, seed: 8 }], deco: 'snowy', front: 'snow' },
    { id: 'clouds', name: 'Облака', say: 'Облачная страна!', sky: ['#B8A8FF', '#D8C8FF', '#FFE0F0'], ground: 'cloudGround', far: [{ kind: 'cloudsFar', color: 'rgba(255,255,255,0.7)', base: 240, amp: 80, f: 0.12 }], deco: 'rainbow', front: 'sparkles' },
    { id: 'space', name: 'Космос', say: 'Космос! Здесь прыгаешь высоко-высоко!', sky: ['#0B0B2A', '#1A1A4A', '#2E2A6E'], ground: 'moon', far: [], deco: 'craters', space: true, lowGrav: true },
  ];
  SB.terrainById = {};
  for (const t of SB.terrains) SB.terrainById[t.id] = t;

  // =========================================================
  // Детали и инструменты
  // =========================================================
  SB.wallColors = ['#E57373', '#C98D52', '#A9AFC2', '#FF9EC8', '#8FD3FF', '#FFD54F'];
  SB.frameColors = ['#FFFFFF', '#FFD23F', '#5B8DEF', '#FF6FA8'];
  SB.doorColors = ['#8B5A2B', '#E0533F', '#3F8FE0', '#2FBF55'];
  SB.roofColors = ['#E85D5D', '#5B8DEF', '#4CAE48', '#9A55E8', '#FF9A3C'];
  SB.furniture = [
    { id: 'table', name: 'Стол' },
    { id: 'chair', name: 'Стул' },
    { id: 'bed', name: 'Кровать' },
    { id: 'sofa', name: 'Диван' },
    { id: 'wardrobe', name: 'Шкаф' },
    { id: 'lamp', name: 'Лампа' },
  ];
  SB.nature = [
    { id: 'tree', name: 'Дерево' },
    { id: 'bush', name: 'Кустик' },
    { id: 'flowers', name: 'Цветы' },
    { id: 'mushroom', name: 'Грибок' },
    { id: 'fence', name: 'Заборчик' },
    { id: 'streetlamp', name: 'Фонарь' },
  ];
  SB.tools = [
    { id: 'wall', name: 'Стена', variants: SB.wallColors.length },
    { id: 'window', name: 'Окно', variants: SB.frameColors.length },
    { id: 'door', name: 'Дверь', variants: SB.doorColors.length },
    { id: 'roof', name: 'Крыша', variants: SB.roofColors.length },
    { id: 'furn', name: 'Мебель', variants: SB.furniture.length },
    { id: 'ladder', name: 'Лестница', variants: 0 },
    { id: 'cloud', name: 'Облачко', variants: 0 },
    { id: 'nature', name: 'Природа', variants: SB.nature.length },
    { id: 'food', name: 'Еда', variants: -1 }, // варианты — приготовленные блюда
    { id: 'erase', name: 'Стёрка', variants: 0 },
  ];
  SB.toolById = {};
  for (const t of SB.tools) SB.toolById[t.id] = t;
  // по какой детали можно стоять (верх — площадка)
  SB.solid = { wall: 1, window: 1, door: 1, roof: 1, cloud: 1 };
  SB.houseLike = { wall: 1, window: 1, door: 1 };

  // =========================================================
  // Животные
  // =========================================================
  SB.animals = [
    { k: 'cat', name: 'Котик', acc: 'котика', sfx: 'meow' },
    { k: 'capy', name: 'Капибара', acc: 'капибару', sfx: 'giggle' },
    { k: 'turtle', name: 'Черепашка', acc: 'черепашку', sfx: 'giggle' },
    { k: 'bunny', name: 'Зайчик', acc: 'зайчика', sfx: 'giggle' },
    { k: 'puppy', name: 'Щенок', acc: 'щенка', sfx: 'giggle' },
    { k: 'hedgehog', name: 'Ёжик', acc: 'ёжика', sfx: 'giggle' },
  ];
  SB.animalByK = {};
  for (const a of SB.animals) SB.animalByK[a.k] = a;

  function drawBunny(ctx, x, y, t, face, s, moving) {
    const hop = moving ? Math.abs(Math.sin(t * 8)) * 10 : 0;
    ctx.save();
    ctx.translate(x, y - hop * s);
    ctx.scale(face * s, s);
    // хвостик
    G.circle(ctx, -22, -18, 8);
    fs(ctx, '#FFFFFF', '#B8B0C8', 1.5);
    G.ellipse(ctx, 0, -18, 24, 17);
    fs(ctx, '#F4F0FA', '#9A92B0', 2);
    G.ellipse(ctx, -8, -2, 10, 5);
    fs(ctx, '#E8E0F0', '#9A92B0', 1.5);
    G.ellipse(ctx, 14, -2, 8, 5);
    fs(ctx, '#E8E0F0', '#9A92B0', 1.5);
    G.circle(ctx, 20, -34, 14);
    fs(ctx, '#F4F0FA', '#9A92B0', 2);
    for (const dx of [12, 24]) {
      G.ellipse(ctx, dx, -58, 5, 15, dx === 12 ? -0.2 : 0.25);
      fs(ctx, '#F4F0FA', '#9A92B0', 2);
      G.ellipse(ctx, dx, -58, 2.5, 10, dx === 12 ? -0.2 : 0.25);
      ctx.fillStyle = '#FFB3CE';
      ctx.fill();
    }
    G.circle(ctx, 25, -37, 2.4);
    ctx.fillStyle = '#222';
    ctx.fill();
    G.circle(ctx, 33, -31, 2.5);
    ctx.fillStyle = '#FF7AA0';
    ctx.fill();
    ctx.restore();
  }

  // Нарисовать животное: x, y — лапки на земле
  SB.drawAnimal = function (ctx, k, x, y, t, face, s, moving) {
    s = s || 1;
    face = face || 1;
    const FR = VW.Scenery && VW.Scenery.FRIENDS;
    if (k === 'cat' || k === 'capy' || k === 'turtle') VW.Pets.draw(ctx, k, x, y, { t: t, facing: face, moving: moving, scale: s * 1.05 });
    else if (k === 'bunny') drawBunny(ctx, x, y, t, face, s, moving);
    else if (FR && FR[k]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(face * s * 0.9, s * 0.9);
      FR[k].draw(ctx, { cx: 0, cy: 0 }, moving && k !== 'hedgehog' ? t : 0, 0);
      ctx.restore();
    }
  };

  // =========================================================
  // Продукты и блюда
  // =========================================================
  SB.ingredients = [
    { id: 'egg', name: 'Яйцо' },
    { id: 'flour', name: 'Мука' },
    { id: 'milk', name: 'Молоко' },
    { id: 'berries', name: 'Ягоды' },
    { id: 'apple', name: 'Яблоко' },
    { id: 'cheese', name: 'Сыр' },
    { id: 'bread', name: 'Хлеб' },
    { id: 'tomato', name: 'Помидор' },
    { id: 'cucumber', name: 'Огурец' },
    { id: 'carrot', name: 'Морковка' },
    { id: 'sugar', name: 'Сахар' },
    { id: 'chocolate', name: 'Шоколад' },
  ];
  SB.ingById = {};
  for (const g of SB.ingredients) SB.ingById[g.id] = g;
  SB.recipes = [
    { id: 'pancakes', name: 'Блинчики', acc: 'блинчики', ing: ['flour', 'milk', 'egg'] },
    { id: 'omelet', name: 'Омлет', acc: 'омлет', ing: ['egg', 'milk'] },
    { id: 'sandwich', name: 'Бутерброд', acc: 'бутерброд', ing: ['bread', 'cheese'] },
    { id: 'salad', name: 'Салат', acc: 'салат', ing: ['tomato', 'cucumber'] },
    { id: 'pizza', name: 'Пицца', acc: 'пиццу', ing: ['bread', 'tomato', 'cheese'] },
    { id: 'porridge', name: 'Каша с ягодами', acc: 'кашу с ягодами', ing: ['milk', 'berries'] },
    { id: 'cake', name: 'Шоколадный торт', acc: 'шоколадный торт', ing: ['flour', 'egg', 'chocolate'] },
    { id: 'applepie', name: 'Яблочный пирог', acc: 'яблочный пирог', ing: ['flour', 'apple', 'sugar'] },
    { id: 'juice', name: 'Сок', acc: 'сок', ing: ['apple', 'carrot'] },
    { id: 'cocoa', name: 'Какао', acc: 'какао', ing: ['milk', 'chocolate'] },
    { id: 'jam', name: 'Варенье', acc: 'варенье', ing: ['berries', 'sugar'] },
    { id: 'compote', name: 'Компот', acc: 'компот', ing: ['berries', 'apple'] },
  ];
  SB.surprise = { id: 'surprise', name: 'Суп-сюрприз', acc: 'суп-сюрприз' };
  SB.dishById = { surprise: SB.surprise };
  for (const r of SB.recipes) SB.dishById[r.id] = r;
  // Что получится из продуктов (порядок не важен). Не угадала — «суп-сюрприз», тоже вкусно!
  SB.cook = function (bowl) {
    const key = bowl.slice().sort().join('+');
    for (const r of SB.recipes) if (r.ing.slice().sort().join('+') === key) return r;
    return SB.surprise;
  };

  const ING = {};
  ING.egg = (ctx) => {
    G.ellipse(ctx, 0, 0.05, 0.55, 0.72);
    fs(ctx, '#FFF8EE', '#C9B89A', 0.05);
    G.ellipse(ctx, -0.18, -0.25, 0.12, 0.2, -0.3);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
  };
  ING.flour = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-0.55, -0.45);
    ctx.lineTo(0.55, -0.45);
    ctx.lineTo(0.62, 0.8);
    ctx.lineTo(-0.62, 0.8);
    ctx.closePath();
    fs(ctx, '#F4EAD8', '#B8A078', 0.05);
    ctx.beginPath();
    ctx.moveTo(-0.55, -0.45);
    ctx.lineTo(-0.4, -0.75);
    ctx.lineTo(0.4, -0.75);
    ctx.lineTo(0.55, -0.45);
    ctx.closePath();
    fs(ctx, '#E8D8B8', '#B8A078', 0.05);
    // колосок
    ctx.beginPath();
    ctx.moveTo(0, 0.6);
    ctx.lineTo(0, -0.1);
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = '#C98A2A';
    ctx.stroke();
    for (let k = 0; k < 3; k++) {
      G.ellipse(ctx, -0.08, 0.35 - k * 0.18, 0.06, 0.1, -0.5);
      ctx.fillStyle = '#E0A840';
      ctx.fill();
      G.ellipse(ctx, 0.08, 0.35 - k * 0.18, 0.06, 0.1, 0.5);
      ctx.fill();
    }
  };
  ING.milk = (ctx) => {
    G.rr(ctx, -0.42, -0.35, 0.84, 1.2, 0.1);
    fs(ctx, '#FFFFFF', '#8FA8C8', 0.05);
    ctx.beginPath();
    ctx.moveTo(-0.42, -0.35);
    ctx.lineTo(0, -0.75);
    ctx.lineTo(0.42, -0.35);
    ctx.closePath();
    fs(ctx, '#E8F0FA', '#8FA8C8', 0.05);
    G.rr(ctx, -0.42, 0.05, 0.84, 0.4, 0.02);
    ctx.fillStyle = '#5B8DEF';
    ctx.fill();
    G.circle(ctx, 0, 0.25, 0.12);
    ctx.fillStyle = '#fff';
    ctx.fill();
  };
  ING.berries = (ctx) => {
    for (const [x, y, c] of [[-0.3, 0.2, '#E0305A'], [0.3, 0.2, '#3A4AD0'], [0, -0.2, '#E0305A'], [-0.1, 0.55, '#6A2AA0'], [0.35, 0.55, '#E0305A']]) {
      G.circle(ctx, x, y, 0.28);
      fs(ctx, c, U.shade(c, -0.4), 0.04);
      G.circle(ctx, x - 0.08, y - 0.08, 0.07);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
    }
    G.ellipse(ctx, 0.15, -0.55, 0.2, 0.09, -0.5);
    fs(ctx, '#62C24F', '#2F7A2C', 0.03);
  };
  ING.apple = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(0, -0.4);
    ctx.bezierCurveTo(0.7, -0.75, 0.95, 0.4, 0.3, 0.8);
    ctx.quadraticCurveTo(0, 0.9, -0.3, 0.8);
    ctx.bezierCurveTo(-0.95, 0.4, -0.7, -0.75, 0, -0.4);
    ctx.closePath();
    fs(ctx, '#F0433A', '#8E1A1A', 0.05);
    ctx.beginPath();
    ctx.moveTo(0, -0.4);
    ctx.lineTo(0.05, -0.75);
    ctx.lineWidth = 0.07;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6A4520';
    ctx.stroke();
    G.ellipse(ctx, 0.25, -0.65, 0.2, 0.09, -0.4);
    fs(ctx, '#62C24F', '#2F7A2C', 0.03);
    G.ellipse(ctx, -0.35, -0.1, 0.1, 0.18, 0.3);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();
  };
  ING.cheese = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-0.8, 0.55);
    ctx.lineTo(0.8, 0.55);
    ctx.lineTo(0.8, -0.1);
    ctx.lineTo(-0.8, 0.15);
    ctx.closePath();
    fs(ctx, '#FFD23F', '#B88A00', 0.05);
    ctx.beginPath();
    ctx.moveTo(-0.8, 0.15);
    ctx.lineTo(0.8, -0.1);
    ctx.lineTo(0.2, -0.55);
    ctx.closePath();
    fs(ctx, '#FFE680', '#B88A00', 0.05);
    ctx.fillStyle = '#E0A800';
    for (const [x, y, r] of [[-0.4, 0.35, 0.1], [0.2, 0.25, 0.13], [0.55, 0.4, 0.07]]) {
      G.circle(ctx, x, y, r);
      ctx.fill();
    }
  };
  ING.bread = (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-0.85, 0.5);
    ctx.lineTo(-0.85, -0.05);
    ctx.bezierCurveTo(-0.85, -0.65, 0.85, -0.65, 0.85, -0.05);
    ctx.lineTo(0.85, 0.5);
    ctx.closePath();
    fs(ctx, '#E0A868', '#8A5A2B', 0.05);
    ctx.beginPath();
    for (const x of [-0.4, 0, 0.4]) {
      ctx.moveTo(x - 0.15, -0.3);
      ctx.lineTo(x + 0.15, -0.1);
    }
    ctx.lineWidth = 0.06;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#B8763A';
    ctx.stroke();
  };
  ING.tomato = (ctx) => {
    G.ellipse(ctx, 0, 0.1, 0.75, 0.62);
    fs(ctx, '#F0433A', '#8E1A1A', 0.05);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU - Math.PI / 2;
      G.ellipse(ctx, Math.cos(a) * 0.18, -0.45 + Math.sin(a) * 0.1, 0.14, 0.05, a);
      ctx.fillStyle = '#3E9E36';
      ctx.fill();
    }
    G.ellipse(ctx, -0.35, -0.05, 0.12, 0.2, 0.4);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();
  };
  ING.cucumber = (ctx) => {
    ctx.save();
    ctx.rotate(-0.5);
    G.rr(ctx, -0.9, -0.28, 1.8, 0.56, 0.28);
    fs(ctx, '#4CAE48', '#2A6A2A', 0.05);
    ctx.fillStyle = '#8FD36A';
    for (let k = 0; k < 6; k++) {
      G.circle(ctx, -0.65 + k * 0.26, (k % 2 ? 0.08 : -0.08), 0.04);
      ctx.fill();
    }
    ctx.restore();
  };
  ING.carrot = (ctx) => {
    ctx.save();
    ctx.rotate(0.5);
    ctx.beginPath();
    ctx.moveTo(-0.28, -0.5);
    ctx.quadraticCurveTo(0, -0.62, 0.28, -0.5);
    ctx.lineTo(0.03, 0.9);
    ctx.lineTo(-0.03, 0.9);
    ctx.closePath();
    fs(ctx, '#FF8C1A', '#A8480A', 0.05);
    for (const a of [-0.4, 0, 0.4]) {
      ctx.save();
      ctx.translate(0, -0.55);
      ctx.rotate(a);
      G.ellipse(ctx, 0, -0.22, 0.08, 0.22);
      fs(ctx, '#62C24F', '#2F7A2C', 0.03);
      ctx.restore();
    }
    ctx.restore();
  };
  ING.sugar = (ctx) => {
    for (const [x, y] of [[-0.35, 0.3], [0.35, 0.3], [0, -0.25]]) {
      G.rr(ctx, x - 0.3, y - 0.3, 0.6, 0.6, 0.08);
      fs(ctx, '#FFFFFF', '#B8C0D0', 0.05);
      ctx.fillStyle = 'rgba(200,210,230,0.6)';
      ctx.fillRect(x - 0.3, y + 0.12, 0.6, 0.12);
    }
  };
  ING.chocolate = (ctx) => {
    ctx.save();
    ctx.rotate(-0.25);
    G.rr(ctx, -0.65, -0.8, 1.3, 1.6, 0.08);
    fs(ctx, '#7A4A2A', '#4A2A10', 0.05);
    ctx.fillStyle = '#5A3418';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-0.55 + c * 0.38, -0.7 + r * 0.38, 0.3, 0.3);
    ctx.beginPath();
    ctx.moveTo(-0.65, 0.1);
    ctx.lineTo(0.65, 0.35);
    ctx.lineTo(0.65, 0.8);
    ctx.lineTo(-0.65, 0.8);
    ctx.closePath();
    fs(ctx, '#E53935', '#8E1A1A', 0.04);
    ctx.restore();
  };
  SB.drawIngredient = function (ctx, id, x, y, s) {
    const f = ING[id];
    if (!f) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    f(ctx);
    ctx.restore();
  };

  // Блюда: на тарелочке
  const DISH = {};
  function plate(ctx) {
    G.ellipse(ctx, 0, 0.55, 0.95, 0.28);
    fs(ctx, '#FFFFFF', '#9AA6B8', 0.05);
    G.ellipse(ctx, 0, 0.52, 0.62, 0.16);
    ctx.lineWidth = 0.03;
    ctx.strokeStyle = '#C9D3E8';
    ctx.stroke();
  }
  DISH.pancakes = (ctx) => {
    plate(ctx);
    for (let k = 0; k < 4; k++) {
      G.ellipse(ctx, 0, 0.4 - k * 0.16, 0.7, 0.2);
      fs(ctx, k % 2 ? '#F2C27A' : '#E8A95A', '#A0642A', 0.04);
    }
    G.rr(ctx, -0.15, -0.3, 0.3, 0.14, 0.04);
    fs(ctx, '#FFF1A0', '#D8B040', 0.03);
    for (const x of [-0.4, 0.3]) {
      G.circle(ctx, x, -0.12, 0.1);
      fs(ctx, '#E0305A');
    }
  };
  DISH.omelet = (ctx) => {
    plate(ctx);
    ctx.beginPath();
    ctx.moveTo(-0.7, 0.4);
    ctx.bezierCurveTo(-0.7, -0.3, 0.7, -0.3, 0.7, 0.4);
    ctx.closePath();
    fs(ctx, '#FFD84A', '#C9A000', 0.05);
    G.ellipse(ctx, 0, 0.1, 0.25, 0.18);
    fs(ctx, '#FFB300');
    G.ellipse(ctx, 0.4, 0.25, 0.1, 0.05, 0.3);
    fs(ctx, '#62C24F');
  };
  DISH.sandwich = (ctx) => {
    plate(ctx);
    G.rr(ctx, -0.7, 0.1, 1.4, 0.3, 0.1);
    fs(ctx, '#E0A868', '#8A5A2B', 0.04);
    ctx.beginPath();
    ctx.moveTo(-0.75, 0.12);
    ctx.lineTo(0.75, 0.12);
    ctx.lineTo(0.6, -0.1);
    ctx.lineTo(-0.5, -0.12);
    ctx.closePath();
    fs(ctx, '#FFD23F', '#B88A00', 0.04);
    G.ellipse(ctx, -0.2, -0.12, 0.25, 0.08);
    fs(ctx, '#62C24F', '#2F7A2C', 0.03);
  };
  DISH.salad = (ctx) => {
    ctx.beginPath();
    ctx.ellipse(0, 0.2, 0.9, 0.55, 0, 0, Math.PI);
    ctx.closePath();
    fs(ctx, '#8FD3FF', '#3A6EA8', 0.05);
    for (const [x, y, c, r] of [[-0.45, 0.1, '#62C24F', 0.2], [-0.1, 0.02, '#F0433A', 0.18], [0.25, 0.08, '#4CAE48', 0.2], [0.5, 0.12, '#F0433A', 0.15], [0.05, 0.16, '#8FD36A', 0.18], [-0.25, 0.14, '#FF8C1A', 0.12]]) {
      G.circle(ctx, x, y, r);
      fs(ctx, c, U.shade(c, -0.35), 0.03);
    }
  };
  DISH.pizza = (ctx) => {
    G.circle(ctx, 0, 0.15, 0.85);
    fs(ctx, '#F2B26B', '#A0642A', 0.05);
    G.circle(ctx, 0, 0.15, 0.7);
    fs(ctx, '#F0433A');
    G.circle(ctx, 0, 0.15, 0.62);
    fs(ctx, '#FFE680');
    for (const [x, y] of [[-0.3, -0.1], [0.3, 0.0], [0, 0.4], [-0.25, 0.35], [0.35, 0.4]]) {
      G.circle(ctx, x, y, 0.1);
      fs(ctx, '#E03030');
    }
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      ctx.moveTo(0, 0.15);
      ctx.lineTo(Math.cos(a) * 0.85, 0.15 + Math.sin(a) * 0.85);
    }
    ctx.lineWidth = 0.03;
    ctx.strokeStyle = 'rgba(160,100,42,0.6)';
    ctx.stroke();
  };
  DISH.porridge = (ctx) => {
    ctx.beginPath();
    ctx.ellipse(0, 0.15, 0.85, 0.6, 0, 0, Math.PI);
    ctx.closePath();
    fs(ctx, '#FF9EC8', '#C2185B', 0.05);
    G.ellipse(ctx, 0, 0.15, 0.8, 0.2);
    fs(ctx, '#FFF4D6', '#D8C8A0', 0.03);
    for (const [x, c] of [[-0.3, '#E0305A'], [0, '#3A4AD0'], [0.3, '#E0305A']]) {
      G.circle(ctx, x, 0.1, 0.1);
      fs(ctx, c);
    }
  };
  DISH.cake = (ctx) => {
    plate(ctx);
    ctx.beginPath();
    ctx.moveTo(-0.6, 0.45);
    ctx.lineTo(0.6, 0.45);
    ctx.lineTo(0.6, -0.1);
    ctx.lineTo(-0.2, -0.45);
    ctx.lineTo(-0.6, -0.1);
    ctx.closePath();
    fs(ctx, '#7A4A2A', '#4A2A10', 0.05);
    ctx.fillStyle = '#FFF4D6';
    ctx.fillRect(-0.6, 0.12, 1.2, 0.08);
    ctx.beginPath();
    ctx.moveTo(-0.6, -0.1);
    ctx.lineTo(-0.2, -0.45);
    ctx.lineTo(0.6, -0.1);
    ctx.lineWidth = 0.08;
    ctx.strokeStyle = '#5A3418';
    ctx.stroke();
    G.circle(ctx, -0.15, -0.55, 0.12);
    fs(ctx, '#E8163E', '#8E0A26', 0.03);
  };
  DISH.applepie = (ctx) => {
    plate(ctx);
    ctx.beginPath();
    ctx.ellipse(0, 0.2, 0.8, 0.4, 0, Math.PI, TAU);
    ctx.closePath();
    fs(ctx, '#F2B26B', '#A0642A', 0.05);
    ctx.beginPath();
    for (let k = -2; k <= 2; k++) {
      ctx.moveTo(k * 0.25 - 0.1, -0.15);
      ctx.lineTo(k * 0.25 + 0.1, 0.15);
    }
    ctx.lineWidth = 0.06;
    ctx.strokeStyle = '#C98A4A';
    ctx.stroke();
    G.circle(ctx, 0.5, -0.35, 0.18);
    fs(ctx, '#F0433A', '#8E1A1A', 0.03);
  };
  function glass(ctx, fill) {
    ctx.beginPath();
    ctx.moveTo(-0.45, -0.7);
    ctx.lineTo(0.45, -0.7);
    ctx.lineTo(0.35, 0.8);
    ctx.lineTo(-0.35, 0.8);
    ctx.closePath();
    fs(ctx, 'rgba(220,240,255,0.9)', '#6B7A8A', 0.05);
    ctx.beginPath();
    ctx.moveTo(-0.4, -0.35);
    ctx.lineTo(0.4, -0.35);
    ctx.lineTo(0.33, 0.74);
    ctx.lineTo(-0.33, 0.74);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.15, -0.5);
    ctx.lineTo(0.4, -1.0);
    ctx.lineWidth = 0.08;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FF6FA8';
    ctx.stroke();
  }
  DISH.juice = (ctx) => {
    glass(ctx, '#FF9A2E');
    G.circle(ctx, -0.35, -0.7, 0.2);
    fs(ctx, '#FFD23F', '#D98B00', 0.03);
  };
  DISH.compote = (ctx) => {
    glass(ctx, '#C0305A');
    for (const [x, y] of [[-0.15, 0.3], [0.12, 0.5], [0, 0.05]]) {
      G.circle(ctx, x, y, 0.1);
      fs(ctx, '#FF6A8A');
    }
  };
  DISH.cocoa = (ctx) => {
    G.rr(ctx, -0.55, -0.4, 1.0, 1.1, 0.2);
    fs(ctx, '#5B8DEF', '#2A4A90', 0.05);
    ctx.beginPath();
    ctx.arc(0.5, 0.15, 0.25, -1.3, 1.3);
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = '#2A4A90';
    ctx.stroke();
    G.ellipse(ctx, -0.05, -0.38, 0.45, 0.1);
    fs(ctx, '#7A4A2A');
    for (const x of [-0.25, 0.1]) {
      G.rr(ctx, x - 0.1, -0.55, 0.2, 0.16, 0.05);
      fs(ctx, '#FFFFFF', '#E0C8D8', 0.02);
    }
    G.heartPath(ctx, -0.05, 0.2, 0.15);
    fs(ctx, '#FFFFFF');
  };
  DISH.jam = (ctx) => {
    if (VW.Items.ART && VW.Items.ART.jamJar) {
      ctx.scale(0.85, 0.85);
      VW.Items.ART.jamJar(ctx, 0, 0, 1, 0);
    }
  };
  DISH.surprise = (ctx, t) => {
    ctx.beginPath();
    ctx.ellipse(0, 0.1, 0.85, 0.6, 0, 0, Math.PI);
    ctx.closePath();
    fs(ctx, '#B983FF', '#5B3FB8', 0.05);
    const cols = ['#FF5A5A', '#FFD23F', '#4ADE80', '#4FC3F7', '#FF8FC0'];
    G.ellipse(ctx, 0, 0.1, 0.8, 0.2);
    fs(ctx, '#7CFFB0');
    for (let k = 0; k < 5; k++) {
      const ph = ((t || 0) * 0.8 + k / 5) % 1;
      G.circle(ctx, -0.5 + k * 0.25, 0.05 - ph * 0.6, 0.06 + ph * 0.06);
      ctx.fillStyle = cols[k];
      ctx.globalAlpha = 1 - ph;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };
  SB.drawDish = function (ctx, id, x, y, s, t) {
    const f = DISH[id] || DISH.surprise;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    f(ctx, t);
    ctx.restore();
  };

  // =========================================================
  // Детали построек (клетка C×C, x, y — левый верхний угол)
  // =========================================================
  // n — соседи: { l, r, u, d } — детали в соседних клетках (или null)
  function wallTexture(ctx, x, y, v) {
    const c = SB.wallColors[v % SB.wallColors.length];
    ctx.fillStyle = c;
    ctx.fillRect(x, y, C, C);
    ctx.beginPath();
    if (v === 0) {
      for (let k = 1; k < 4; k++) {
        ctx.moveTo(x, y + k * 15);
        ctx.lineTo(x + C, y + k * 15);
      }
      for (let k = 0; k < 4; k++) {
        const off = k % 2 ? 15 : 0;
        for (let bx = x + off; bx < x + C; bx += 30) {
          ctx.moveTo(bx, y + k * 15);
          ctx.lineTo(bx, y + k * 15 + 15);
        }
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(140,40,40,0.35)';
    } else if (v === 1) {
      for (let k = 1; k < 3; k++) {
        ctx.moveTo(x, y + k * 20);
        ctx.lineTo(x + C, y + k * 20);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(90,50,20,0.35)';
    } else if (v === 2) {
      ctx.moveTo(x + 4, y + 28);
      ctx.lineTo(x + C - 4, y + 28);
      ctx.moveTo(x + 30, y + 4);
      ctx.lineTo(x + 30, y + 28);
      ctx.moveTo(x + 18, y + 28);
      ctx.lineTo(x + 18, y + C - 4);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(60,70,100,0.3)';
    } else if (v === 3) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (const [dx, dy] of [[15, 15], [45, 30], [20, 45]]) {
        ctx.moveTo(x + dx + 4, y + dy);
        ctx.arc(x + dx, y + dy, 4, 0, TAU);
      }
      ctx.fill();
      return c;
    } else if (v === 4) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 10, y, 12, C);
      ctx.fillRect(x + 38, y, 12, C);
      return c;
    }
    ctx.stroke();
    return c;
  }
  // Цвет стены вокруг окна/двери: берём у соседней стены
  function nearWallColor(n) {
    for (const k of ['l', 'r', 'u', 'd']) {
      const c = n[k];
      if (c && c.t === 'wall') return c.v;
      if (c && c.bg && c.bg.t === 'wall') return c.bg.v;
    }
    return 5; // светло-жёлтая
  }
  const isHouse = (c) => !!c && (!!SB.houseLike[c.t] || !!(c.bg && SB.houseLike[c.bg.t]));
  function houseEdges(ctx, x, y, n, color) {
    ctx.beginPath();
    if (!isHouse(n.u)) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + C, y);
    }
    if (!isHouse(n.d)) {
      ctx.moveTo(x, y + C);
      ctx.lineTo(x + C, y + C);
    }
    if (!isHouse(n.l)) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + C);
    }
    if (!isHouse(n.r)) {
      ctx.moveTo(x + C, y);
      ctx.lineTo(x + C, y + C);
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = U.shade(color, -0.45);
    ctx.stroke();
  }
  const PART = {};
  PART.wall = function (ctx, x, y, v, n) {
    const c = wallTexture(ctx, x, y, v);
    houseEdges(ctx, x, y, n, c);
  };
  PART.window = function (ctx, x, y, v, n, t, night) {
    const wv = nearWallColor(n);
    const c = wallTexture(ctx, x, y, wv);
    const fc = SB.frameColors[v % SB.frameColors.length];
    G.rr(ctx, x + 10, y + 10, C - 20, C - 20, 6);
    ctx.fillStyle = night ? '#FFE680' : G.vGrad(ctx, y + 10, y + C - 10, ['#BFE8FF', '#E8F8FF']);
    ctx.fill();
    if (night) G.glow(ctx, x + C / 2, y + C / 2, 40, '#FFE680', 0.4);
    ctx.lineWidth = 5;
    ctx.strokeStyle = fc;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + C / 2, y + 12);
    ctx.lineTo(x + C / 2, y + C - 12);
    ctx.moveTo(x + 12, y + C / 2);
    ctx.lineTo(x + C - 12, y + C / 2);
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    G.rr(ctx, x + 10, y + 10, C - 20, C - 20, 6);
    ctx.stroke();
    houseEdges(ctx, x, y, n, c);
  };
  PART.door = function (ctx, x, y, v, n) {
    const wv = nearWallColor(n);
    const c = wallTexture(ctx, x, y, wv);
    const dc = SB.doorColors[v % SB.doorColors.length];
    const lower = n.u && n.u.t === 'door';
    const upper = n.d && n.d.t === 'door';
    ctx.beginPath();
    if (upper) {
      // верхняя половинка высокой двери — с аркой
      ctx.moveTo(x + 10, y + C);
      ctx.lineTo(x + 10, y + 28);
      ctx.arc(x + C / 2, y + 28, C / 2 - 10, Math.PI, 0);
      ctx.lineTo(x + C - 10, y + C);
    } else if (lower) {
      ctx.rect(x + 10, y, C - 20, C);
    } else {
      ctx.moveTo(x + 12, y + C);
      ctx.lineTo(x + 12, y + 26);
      ctx.arc(x + C / 2, y + 26, C / 2 - 12, Math.PI, 0);
      ctx.lineTo(x + C - 12, y + C);
    }
    ctx.closePath();
    fs(ctx, dc, U.shade(dc, -0.5), 3);
    if (!upper) {
      G.circle(ctx, x + C - 20, y + (lower ? 22 : 42), 3.5);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
    }
    if (!lower && !upper) {
      G.circle(ctx, x + C / 2, y + 26, 5);
      ctx.fillStyle = 'rgba(191,232,255,0.9)';
      ctx.fill();
    }
    houseEdges(ctx, x, y, n, c);
  };
  PART.roof = function (ctx, x, y, v, n) {
    const c = SB.roofColors[v % SB.roofColors.length];
    const l = n.l && n.l.t === 'roof', r = n.r && n.r.t === 'roof';
    ctx.beginPath();
    if (l && r) ctx.rect(x, y, C, C);
    else if (r) {
      ctx.moveTo(x - 6, y + C);
      ctx.lineTo(x + C, y);
      ctx.lineTo(x + C, y + C);
    } else if (l) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + C + 6, y + C);
      ctx.lineTo(x, y + C);
    } else {
      ctx.moveTo(x - 6, y + C);
      ctx.lineTo(x + C / 2, y + 4);
      ctx.lineTo(x + C + 6, y + C);
    }
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    // черепица
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    for (let k = 1; k < 4; k++) {
      ctx.moveTo(x - 10, y + k * 15);
      ctx.lineTo(x + C + 10, y + k * 15);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeStyle = U.shade(c, -0.45);
    ctx.beginPath();
    if (l && r) {
      if (!(n.u && n.u.t === 'roof')) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + C, y);
      }
    } else if (r) {
      ctx.moveTo(x - 6, y + C);
      ctx.lineTo(x + C, y);
    } else if (l) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + C + 6, y + C);
    } else {
      ctx.moveTo(x - 6, y + C);
      ctx.lineTo(x + C / 2, y + 4);
      ctx.lineTo(x + C + 6, y + C);
    }
    ctx.stroke();
  };
  PART.ladder = function (ctx, x, y, v, n) {
    const up = n.u && n.u.t === 'ladder';
    const top = up ? y : y + 4, bot = y + C;
    ctx.fillStyle = '#C98D52';
    ctx.strokeStyle = '#5A3515';
    ctx.lineWidth = 2;
    for (const ry of [y + 16, y + 46]) {
      G.rr(ctx, x + 12, ry - 4, C - 24, 8, 3);
      ctx.fill();
      ctx.stroke();
    }
    for (const rx of [x + 8, x + C - 16]) {
      G.rr(ctx, rx, top, 8, bot - top, 3);
      fs(ctx, '#A06A36', '#5A3515', 2);
    }
  };
  PART.cloud = function (ctx, x, y, v, n) {
    const l = n.l && n.l.t === 'cloud', r = n.r && n.r.t === 'cloud';
    const x0 = x - (l ? 12 : 4), w = C + (l ? 12 : 4) + (r ? 12 : 4);
    G.cloud(ctx, x0, y + 4, w, 46, '#FFFFFF', 'rgba(110,160,220,0.4)');
  };
  // Мебель — стоит на нижнем крае клетки
  const FURN = {};
  FURN.table = (ctx, x, y) => {
    const b = y + C;
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(x + 10, b - 30, 6, 30);
    ctx.fillRect(x + C - 16, b - 30, 6, 30);
    G.rr(ctx, x + 4, b - 36, C - 8, 9, 3);
    fs(ctx, '#C98D52', '#6A4520', 2);
  };
  FURN.chair = (ctx, x, y) => {
    const b = y + C;
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(x + 16, b - 22, 5, 22);
    ctx.fillRect(x + 38, b - 22, 5, 22);
    ctx.fillRect(x + 38, b - 50, 5, 30);
    G.rr(ctx, x + 14, b - 26, 32, 7, 3);
    fs(ctx, '#E0533F', '#8E2A2A', 2);
    G.rr(ctx, x + 36, b - 52, 9, 28, 3);
    fs(ctx, '#C98D52', '#6A4520', 1.5);
  };
  FURN.bed = (ctx, x, y) => {
    const b = y + C;
    G.rr(ctx, x + 2, b - 26, C - 4, 18, 5);
    fs(ctx, '#8FD3FF', '#3A6EA8', 2);
    G.rr(ctx, x + 2, b - 12, C - 4, 10, 3);
    fs(ctx, '#C98D52', '#6A4520', 2);
    G.rr(ctx, x + 2, b - 44, 10, 42, 3);
    fs(ctx, '#C98D52', '#6A4520', 2);
    G.rr(ctx, x + 14, b - 34, 18, 10, 5);
    fs(ctx, '#FFFFFF', '#9AA6B8', 1.5);
  };
  FURN.sofa = (ctx, x, y) => {
    const b = y + C;
    G.rr(ctx, x + 4, b - 40, C - 8, 22, 8);
    fs(ctx, '#9A55E8', '#5B2A9A', 2);
    G.rr(ctx, x + 2, b - 24, C - 4, 18, 6);
    fs(ctx, '#B983FF', '#5B2A9A', 2);
    ctx.fillStyle = '#5B2A9A';
    ctx.fillRect(x + 8, b - 6, 5, 6);
    ctx.fillRect(x + C - 13, b - 6, 5, 6);
  };
  FURN.wardrobe = (ctx, x, y) => {
    const b = y + C;
    G.rr(ctx, x + 8, b - 58, C - 16, 58, 4);
    fs(ctx, '#C98D52', '#6A4520', 2.5);
    ctx.beginPath();
    ctx.moveTo(x + C / 2, b - 56);
    ctx.lineTo(x + C / 2, b - 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#6A4520';
    ctx.stroke();
    ctx.fillStyle = '#FFD23F';
    G.circle(ctx, x + C / 2 - 5, b - 30, 2.5);
    ctx.fill();
    G.circle(ctx, x + C / 2 + 5, b - 30, 2.5);
    ctx.fill();
  };
  FURN.lamp = (ctx, x, y, t, night) => {
    const b = y + C;
    ctx.fillStyle = '#5A6378';
    ctx.fillRect(x + C / 2 - 2, b - 44, 4, 42);
    G.rr(ctx, x + C / 2 - 12, b - 4, 24, 4, 2);
    ctx.fill();
    if (night) G.glow(ctx, x + C / 2, b - 48, 50, '#FFE680', 0.6);
    ctx.beginPath();
    ctx.moveTo(x + C / 2 - 16, b - 40);
    ctx.lineTo(x + C / 2 + 16, b - 40);
    ctx.lineTo(x + C / 2 + 9, b - 58);
    ctx.lineTo(x + C / 2 - 9, b - 58);
    ctx.closePath();
    fs(ctx, '#FFD23F', '#B88A00', 2);
  };
  PART.furn = function (ctx, x, y, v, n, t, night) {
    const f = FURN[(SB.furniture[v] || SB.furniture[0]).id];
    f(ctx, x, y, t, night);
  };
  // Природа
  const NAT = {};
  NAT.tree = (ctx, x, y, t) => {
    const b = y + C, cx = x + C / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 8, b);
    ctx.lineTo(cx - 5, b - 50);
    ctx.lineTo(cx + 5, b - 50);
    ctx.lineTo(cx + 8, b);
    ctx.closePath();
    fs(ctx, '#8B5A2B', '#5A3515', 2);
    const sw = Math.sin(t * 1.3 + x) * 2;
    for (const [dx, dy, r] of [[-16, -58, 20], [16, -60, 19], [0, -78, 24]]) {
      G.circle(ctx, cx + dx + sw, b + dy, r);
      fs(ctx, '#4CAE48', '#2F8A38', 2);
    }
    G.circle(ctx, cx - 8 + sw, b - 66, 4);
    ctx.fillStyle = '#FF5A5A';
    ctx.fill();
    G.circle(ctx, cx + 10 + sw, b - 80, 4);
    ctx.fill();
  };
  NAT.bush = (ctx, x, y) => {
    const b = y + C, cx = x + C / 2;
    for (const [dx, dy, r] of [[-12, -14, 14], [12, -15, 15], [0, -24, 16]]) {
      G.circle(ctx, cx + dx, b + dy, r);
      fs(ctx, '#5FBF4A', '#2F8A38', 2);
    }
  };
  NAT.flowers = (ctx, x, y, t) => {
    const cols = ['#FF5A9E', '#FFD23F', '#B983FF', '#FF8C1A'];
    for (let k = 0; k < 4; k++) Art.flower(ctx, x + 10 + k * 13, y + C, 5 + (k % 2) * 2, cols[k], t);
  };
  NAT.mushroom = (ctx, x, y) => {
    const b = y + C, cx = x + C / 2;
    G.rr(ctx, cx - 7, b - 24, 14, 24, 5);
    fs(ctx, '#FFF1D6', '#B89A6A', 2);
    ctx.beginPath();
    ctx.moveTo(cx - 24, b - 20);
    ctx.quadraticCurveTo(cx, b - 58, cx + 24, b - 20);
    ctx.closePath();
    fs(ctx, '#F0433A', '#9C1F18', 2);
    ctx.fillStyle = '#fff';
    for (const [dx, dy] of [[-10, -30], [8, -36], [2, -24]]) {
      G.circle(ctx, cx + dx, b + dy, 3.5);
      ctx.fill();
    }
  };
  NAT.fence = (ctx, x, y) => {
    const b = y + C;
    ctx.fillStyle = '#E8C08A';
    ctx.fillRect(x, b - 30, C, 6);
    ctx.fillRect(x, b - 14, C, 6);
    for (const px of [x + 6, x + 26, x + 46]) {
      ctx.beginPath();
      ctx.moveTo(px, b);
      ctx.lineTo(px, b - 38);
      ctx.lineTo(px + 5, b - 44);
      ctx.lineTo(px + 10, b - 38);
      ctx.lineTo(px + 10, b);
      ctx.closePath();
      fs(ctx, '#F2D2A0', '#A0703F', 1.5);
    }
  };
  NAT.streetlamp = (ctx, x, y, t, night) => {
    const b = y + C, cx = x + C / 2;
    ctx.fillStyle = '#4A4E66';
    ctx.fillRect(cx - 3, b - 56, 6, 56);
    if (night) G.glow(ctx, cx, b - 60, 60, '#FFE680', 0.7);
    G.circle(ctx, cx, b - 60, 9);
    fs(ctx, night ? '#FFE680' : '#FFF6C8', '#2A2D3E', 2);
  };
  PART.nature = function (ctx, x, y, v, n, t, night) {
    const f = NAT[(SB.nature[v] || SB.nature[0]).id];
    f(ctx, x, y, t, night);
  };
  PART.food = function (ctx, x, y, v, n, t) {
    SB.drawDish(ctx, v, x + C / 2, y + C - 22, 20, t);
  };
  SB.drawPart = function (ctx, cell, x, y, n, t, night) {
    const f = PART[cell.t];
    if (f) f(ctx, x, y, cell.v, n, t, night);
  };

  // Значки инструментов (s — полуразмер)
  SB.drawToolIcon = function (ctx, id, cx, cy, s, t, variant) {
    const x = cx - C / 2, y = cy - C / 2;
    const k = (s * 2) / C;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(k, k);
    ctx.translate(-cx, -cy);
    const none = { l: null, r: null, u: null, d: null };
    const v = variant || 0;
    switch (id) {
      case 'wall':
        PART.wall(ctx, x, y, v, none);
        break;
      case 'window':
        PART.window(ctx, x, y, v, { l: { t: 'wall', v: 5 }, r: null, u: null, d: null }, t);
        break;
      case 'door':
        PART.door(ctx, x, y, v, { l: { t: 'wall', v: 5 }, r: null, u: null, d: null });
        break;
      case 'roof':
        PART.roof(ctx, x, y, v, none);
        break;
      case 'furn':
        PART.furn(ctx, x, y - 4, v, none, t);
        break;
      case 'ladder':
        PART.ladder(ctx, x, y, 0, { u: { t: 'ladder' } });
        break;
      case 'cloud':
        G.cloud(ctx, x - 4, y + 8, C + 8, 44, '#FFFFFF', 'rgba(110,160,220,0.4)');
        break;
      case 'nature':
        ctx.translate(0, 18);
        PART.nature(ctx, x, y, v, none, t);
        break;
      case 'food':
        SB.drawDish(ctx, typeof variant === 'string' ? variant : 'pancakes', cx, cy, 24, t);
        break;
      case 'erase': {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.6);
        G.rr(ctx, -26, -14, 52, 28, 8);
        fs(ctx, '#FF8FB8', '#C2185B', 3);
        G.rr(ctx, 4, -14, 22, 28, 6);
        fs(ctx, '#8FD3FF', '#3A6EA8', 3);
        ctx.restore();
        break;
      }
    }
    ctx.restore();
  };

  // =========================================================
  // Земля и фон местностей (координаты мира)
  // =========================================================
  const GROUND = {};
  GROUND.grass = (ctx, x0, x1, y, h) => Art.styles.grass(ctx, { x: x0, top: y, w: x1 - x0, h: h });
  GROUND.sand = (ctx, x0, x1, y, h) => {
    ctx.fillStyle = G.vGrad(ctx, y, y + 200, ['#F2D08A', '#E0B060']);
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.fillStyle = 'rgba(200,140,60,0.35)';
    ctx.beginPath();
    for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) {
      ctx.moveTo(x + 20, y + 40);
      ctx.ellipse(x + 14, y + 40 + ((x * 7) % 50), 10, 3, 0, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = '#F8E0A8';
    ctx.fillRect(x0, y - 4, x1 - x0, 10);
  };
  GROUND.rockGround = (ctx, x0, x1, y, h) => {
    ctx.fillStyle = G.vGrad(ctx, y, y + 200, ['#9A92B0', '#6E6690']);
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.fillStyle = 'rgba(60,50,90,0.3)';
    for (let x = Math.floor(x0 / 90) * 90; x < x1; x += 90) {
      G.ellipse(ctx, x + 30, y + 50 + ((x * 3) % 60), 18, 10);
      ctx.fill();
    }
    ctx.fillStyle = '#7CB86A';
    ctx.fillRect(x0, y - 4, x1 - x0, 10);
  };
  GROUND.snow = (ctx, x0, x1, y, h) => {
    ctx.fillStyle = G.vGrad(ctx, y, y + 200, ['#FFFFFF', '#D8E6F5']);
    ctx.fillRect(x0, y, x1 - x0, h);
    G.rr(ctx, x0, y - 8, x1 - x0, 20, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.fillStyle = 'rgba(160,190,220,0.4)';
    for (let x = Math.floor(x0 / 80) * 80; x < x1; x += 80) {
      G.ellipse(ctx, x + 30, y + 30, 22, 4);
      ctx.fill();
    }
  };
  GROUND.cloudGround = (ctx, x0, x1, y, h) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x0, y + 20, x1 - x0, h);
    ctx.beginPath();
    for (let x = Math.floor(x0 / 70) * 70 - 70; x < x1 + 70; x += 70) {
      ctx.moveTo(x + 40, y + 18);
      ctx.arc(x, y + 18, 40, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(200,190,255,0.4)';
    ctx.fillRect(x0, y + 70, x1 - x0, 12);
  };
  GROUND.moon = (ctx, x0, x1, y, h) => {
    ctx.fillStyle = G.vGrad(ctx, y, y + 200, ['#C8C4D8', '#8E88A8']);
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.fillStyle = 'rgba(90,80,120,0.35)';
    for (let x = Math.floor(x0 / 110) * 110; x < x1; x += 110) {
      G.ellipse(ctx, x + 40, y + 30 + ((x * 3) % 40), 20 + ((x * 7) % 14), 7);
      ctx.fill();
    }
    ctx.fillStyle = '#E0DCF0';
    ctx.fillRect(x0, y - 3, x1 - x0, 8);
  };
  SB.drawGround = function (ctx, terrain, x0, x1, y, h) {
    (GROUND[terrain.ground] || GROUND.grass)(ctx, x0, x1, y, h);
  };

  // Украшения у земли (позади построек)
  SB.drawBackDeco = function (ctx, terrain, x0, x1, gy, t) {
    const step = 260;
    for (let x = Math.floor(x0 / step) * step - step; x < x1 + step; x += step) {
      const k = Math.abs((x / step) | 0);
      const px = x + ((k * 97) % 120);
      switch (terrain.deco) {
        case 'trees':
          if (k % 2 === 0) VW.Scenery.DECO.parkTree.draw(ctx, { x: px, y: gy, s: 0.9 + (k % 3) * 0.1, seed: k, night: false }, t);
          else VW.Scenery.DECO.flowers.draw(ctx, { x: px, y: gy, seed: k }, t);
          break;
        case 'pines': {
          const h = 180 + (k % 3) * 50;
          ctx.fillStyle = '#6A4520';
          ctx.fillRect(px - 8, gy - 40, 16, 40);
          for (let q = 0; q < 3; q++) {
            ctx.beginPath();
            ctx.moveTo(px, gy - h + q * 40);
            ctx.lineTo(px + 60 - q * 8, gy - 30 - (2 - q) * 40);
            ctx.lineTo(px - 60 + q * 8, gy - 30 - (2 - q) * 40);
            ctx.closePath();
            fs(ctx, '#3E8E4A', '#2A6A36', 2);
          }
          break;
        }
        case 'cacti':
          if (k % 3 !== 2) {
            G.rr(ctx, px - 14, gy - 110, 28, 110, 14);
            fs(ctx, '#5FAF5A', '#2F7A3A', 2.5);
            G.rr(ctx, px + 12, gy - 80, 30, 14, 7);
            fs(ctx, '#5FAF5A', '#2F7A3A', 2);
            G.rr(ctx, px + 30, gy - 110, 14, 40, 7);
            fs(ctx, '#5FAF5A', '#2F7A3A', 2);
            G.circle(ctx, px, gy - 112, 7);
            ctx.fillStyle = '#FF6FA8';
            ctx.fill();
          } else {
            G.ellipse(ctx, px, gy - 10, 40, 18);
            fs(ctx, '#D8A860', '#A07030', 2);
          }
          break;
        case 'rocks':
          ctx.beginPath();
          ctx.moveTo(px - 50, gy);
          ctx.lineTo(px - 20, gy - 60 - (k % 3) * 20);
          ctx.lineTo(px + 10, gy - 40);
          ctx.lineTo(px + 40, gy - 80 - (k % 2) * 30);
          ctx.lineTo(px + 70, gy);
          ctx.closePath();
          fs(ctx, '#9C92C6', '#5E547A', 2.5);
          break;
        case 'snowy': {
          if (k % 4 === 1) {
            // снеговик
            for (const [dy, r] of [[-26, 26], [-66, 20], [-98, 14]]) {
              G.circle(ctx, px, gy + dy, r);
              fs(ctx, '#FFFFFF', '#A8C0D8', 2);
            }
            ctx.beginPath();
            ctx.moveTo(px, gy - 98);
            ctx.lineTo(px + 18, gy - 95);
            ctx.lineTo(px, gy - 92);
            ctx.closePath();
            fs(ctx, '#FF8C1A');
            G.circle(ctx, px - 5, gy - 102, 2);
            ctx.fillStyle = '#222';
            ctx.fill();
            G.circle(ctx, px + 5, gy - 102, 2);
            ctx.fill();
            G.rr(ctx, px - 14, gy - 124, 28, 14, 4);
            fs(ctx, '#E53935', '#8E1A1A', 1.5);
          } else {
            const h = 170 + (k % 3) * 40;
            for (let q = 0; q < 3; q++) {
              ctx.beginPath();
              ctx.moveTo(px, gy - h + q * 40);
              ctx.lineTo(px + 56 - q * 8, gy - 30 - (2 - q) * 40);
              ctx.lineTo(px - 56 + q * 8, gy - 30 - (2 - q) * 40);
              ctx.closePath();
              fs(ctx, '#4A8A6A', '#2A5A4A', 2);
              ctx.beginPath();
              ctx.moveTo(px, gy - h + q * 40);
              ctx.lineTo(px + 26 - q * 4, gy - h + q * 40 + 30);
              ctx.lineTo(px - 26 + q * 4, gy - h + q * 40 + 30);
              ctx.closePath();
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();
            }
          }
          break;
        }
        case 'rainbow':
          if (k % 4 === 0) {
            const cols = ['#FF5A5A', '#FF9A3C', '#FFD23F', '#4ADE80', '#4FC3F7', '#9A55E8'];
            cols.forEach((c, q) => {
              ctx.beginPath();
              ctx.arc(px, gy + 20, 150 - q * 12, Math.PI, 0);
              ctx.lineWidth = 12;
              ctx.strokeStyle = c;
              ctx.stroke();
            });
          }
          break;
        case 'craters':
          if (k % 5 === 2) {
            // флажок и маленькая ракета
            ctx.fillStyle = '#C9D3E8';
            ctx.fillRect(px, gy - 90, 4, 90);
            ctx.fillStyle = '#FF6FA8';
            ctx.fillRect(px + 4, gy - 90, 40, 26);
            G.starPath(ctx, px + 24, gy - 77, 8, 3.5);
            ctx.fillStyle = '#FFD23F';
            ctx.fill();
          } else {
            G.ellipse(ctx, px, gy + 6, 50, 12);
            fs(ctx, '#A8A2C0', '#7A7498', 2);
          }
          break;
      }
    }
  };
})(window.VW);
