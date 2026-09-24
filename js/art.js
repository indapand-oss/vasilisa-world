/* Vasilisa World — рисование платформ, лестниц и общих декораций уровней */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G;
  const Art = (VW.Art = {});
  const TAU = Math.PI * 2;

  function fs(ctx, fill, stroke, lw) {
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = lw || 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }
  Art.fs = fs;

  // ---------- платформы ----------
  const ST = {};

  // Земля с травой
  ST.grass = function (ctx, p) {
    const h = p.h || 120;
    ctx.fillStyle = G.vGrad(ctx, p.top, p.top + h, ['#A8703F', '#7A4824']);
    ctx.fillRect(p.x, p.top + 6, p.w, h - 6);
    // камушки в земле
    if (!p._stones) {
      const r = U.rng(Math.round(p.x * 7 + p.top));
      p._stones = [];
      for (let i = 0; i < p.w / 70; i++) p._stones.push([p.x + r() * p.w, p.top + 30 + r() * (h - 40), 5 + r() * 9]);
    }
    ctx.fillStyle = 'rgba(70,40,20,0.35)';
    for (const s of p._stones) {
      G.ellipse(ctx, s[0], s[1], s[2], s[2] * 0.6);
      ctx.fill();
    }
    G.rr(ctx, p.x, p.top - 4, p.w, 24, 10);
    ctx.fillStyle = '#3E9E36';
    ctx.fill();
    G.rr(ctx, p.x, p.top - 6, p.w, 16, 8);
    ctx.fillStyle = '#62C94F';
    ctx.fill();
    // пучки травы
    ctx.fillStyle = '#62C94F';
    ctx.beginPath();
    for (let x = p.x + 8; x < p.x + p.w - 8; x += 26) {
      const k = ((x * 13) % 7) / 7;
      ctx.moveTo(x - 6, p.top - 4);
      ctx.lineTo(x - 2, p.top - 14 - k * 8);
      ctx.lineTo(x + 1, p.top - 4);
      ctx.lineTo(x + 5, p.top - 11 - k * 6);
      ctx.lineTo(x + 8, p.top - 4);
    }
    ctx.fill();
  };

  // Ночная земля
  ST.grassNight = function (ctx, p) {
    const h = p.h || 120;
    ctx.fillStyle = G.vGrad(ctx, p.top, p.top + h, ['#4A3A6A', '#2A1F45']);
    ctx.fillRect(p.x, p.top + 6, p.w, h - 6);
    G.rr(ctx, p.x, p.top - 6, p.w, 18, 8);
    ctx.fillStyle = '#2F7A5A';
    ctx.fill();
    ctx.fillStyle = '#3FA070';
    ctx.beginPath();
    for (let x = p.x + 8; x < p.x + p.w - 8; x += 26) {
      const k = ((x * 13) % 7) / 7;
      ctx.moveTo(x - 6, p.top - 4);
      ctx.lineTo(x - 2, p.top - 14 - k * 8);
      ctx.lineTo(x + 1, p.top - 4);
      ctx.lineTo(x + 5, p.top - 11 - k * 6);
      ctx.lineTo(x + 8, p.top - 4);
    }
    ctx.fill();
  };

  // Ветка дерева
  ST.branch = function (ctx, p) {
    const y = p.top;
    G.rr(ctx, p.x, y - 3, p.w, 26, 13);
    fs(ctx, '#8B5A2B', '#5A3515', 3);
    G.rr(ctx, p.x + 6, y - 1, p.w - 12, 7, 4);
    ctx.fillStyle = 'rgba(255,220,170,0.35)';
    ctx.fill();
    ctx.beginPath();
    for (let x = p.x + 20; x < p.x + p.w - 14; x += 34) {
      ctx.moveTo(x, y + 10);
      ctx.quadraticCurveTo(x + 8, y + 14, x + 16, y + 10);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(70,40,15,0.5)';
    ctx.stroke();
    // листочки на концах
    const ends = p.leaves === 'none' ? [] : p.leaves === 'L' ? [p.x] : p.leaves === 'R' ? [p.x + p.w] : [p.x, p.x + p.w];
    for (const ex of ends) {
      for (let i = 0; i < 4; i++) {
        const a = i * 1.6 + ex * 0.01;
        G.ellipse(ctx, ex + Math.cos(a) * 14, y + 6 + Math.sin(a) * 10, 13, 8, a);
        fs(ctx, i % 2 ? '#4CB944' : '#3E9E3A', '#2F7A2C', 1.5);
      }
    }
  };

  // Доски (пол домика, смотровая площадка)
  ST.plank = function (ctx, p) {
    const y = p.top, h = p.h || 20;
    G.rr(ctx, p.x, y, p.w, h, 5);
    fs(ctx, '#D9A066', '#7A4E22', 3);
    ctx.beginPath();
    for (let x = p.x + 44; x < p.x + p.w - 10; x += 44) {
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x, y + h - 2);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(122,78,34,0.6)';
    ctx.stroke();
    ctx.fillStyle = '#7A4E22';
    for (let x = p.x + 10; x < p.x + p.w; x += 44) {
      G.circle(ctx, x, y + h / 2, 1.8);
      ctx.fill();
    }
  };

  // Облако-платформа
  ST.cloud = function (ctx, p, t) {
    const bob = 0;
    G.cloud(ctx, p.x - 12, p.top + 8 + bob, p.w + 24, 56, p.night ? '#E6E0FF' : '#fff', p.night ? 'rgba(120,100,200,0.5)' : 'rgba(110,160,220,0.45)');
  };

  // Каменный уступ горы
  ST.rock = function (ctx, p) {
    const y = p.top;
    ctx.beginPath();
    ctx.moveTo(p.x, y);
    ctx.lineTo(p.x + p.w, y);
    ctx.lineTo(p.x + p.w - 10, y + 20);
    ctx.lineTo(p.x + p.w * 0.6, y + 34);
    ctx.lineTo(p.x + p.w * 0.25, y + 28);
    ctx.lineTo(p.x + 8, y + 18);
    ctx.closePath();
    fs(ctx, '#8C82AE', '#554C78', 3);
    G.rr(ctx, p.x + 2, y - 2, p.w - 4, 9, 4);
    ctx.fillStyle = '#BDB3DD';
    ctx.fill();
  };

  // Гриб-батут
  ST.mushroom = function (ctx, p, t) {
    const cx = p.x + p.w / 2;
    const sq = p.squashT ? Math.sin((p.squashT / 0.35) * Math.PI) * 0.25 : 0;
    G.rr(ctx, cx - 18, p.top + 10, 36, (p.h || 50) - 10, 12);
    fs(ctx, '#FFF1D6', '#B89A6A', 2.5);
    ctx.save();
    ctx.translate(cx, p.top + 14);
    ctx.scale(1 + sq * 0.5, 1 - sq);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w / 2 + 14, 30, 0, Math.PI, TAU);
    ctx.closePath();
    fs(ctx, '#F0433A', '#9C1F18', 3);
    ctx.fillStyle = '#fff';
    for (const [dx, dy, r] of [[-0.55, -0.35, 7], [0, -0.7, 8], [0.5, -0.4, 6], [-0.2, -0.2, 5], [0.25, -0.15, 4]]) {
      G.ellipse(ctx, dx * (p.w / 2), dy * 30, r * 1.2, r);
      ctx.fill();
    }
    ctx.restore();
  };

  // Деревянный пол в доме
  ST.floor = function (ctx, p) {
    const h = p.h || 80;
    ctx.fillStyle = G.vGrad(ctx, p.top, p.top + h, ['#C98B4F', '#9A6433']);
    ctx.fillRect(p.x, p.top, p.w, h);
    ctx.beginPath();
    for (let y = p.top + 16; y < p.top + h; y += 16) {
      ctx.moveTo(p.x, y);
      ctx.lineTo(p.x + p.w, y);
    }
    let row = 0;
    for (let y = p.top; y < p.top + h; y += 16, row++) {
      for (let x = p.x + (row % 2) * 60; x < p.x + p.w; x += 120) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 16);
      }
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(90,50,20,0.35)';
    ctx.stroke();
    ctx.fillStyle = '#E0A868';
    ctx.fillRect(p.x, p.top, p.w, 5);
  };

  // Каменный пол
  ST.stonefloor = function (ctx, p) {
    const h = p.h || 120;
    ctx.fillStyle = G.vGrad(ctx, p.top, p.top + h, ['#9C90B8', '#6E6390']);
    ctx.fillRect(p.x, p.top, p.w, h);
    ctx.beginPath();
    let row = 0;
    for (let y = p.top; y < p.top + h; y += 30, row++) {
      ctx.moveTo(p.x, y);
      ctx.lineTo(p.x + p.w, y);
      for (let x = p.x + (row % 2) * 45; x < p.x + p.w; x += 90) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 30);
      }
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(60,50,90,0.45)';
    ctx.stroke();
    ctx.fillStyle = '#B9AED6';
    ctx.fillRect(p.x, p.top, p.w, 6);
  };

  // Балка / этаж (дерево)
  ST.wood = function (ctx, p) {
    const h = p.h || 34;
    G.rr(ctx, p.x, p.top, p.w, h, 6);
    fs(ctx, '#B87842', '#6A3F18', 3);
    ctx.fillStyle = '#D9A066';
    G.rr(ctx, p.x + 3, p.top + 2, p.w - 6, 8, 4);
    ctx.fill();
    ctx.beginPath();
    for (let x = p.x + 90; x < p.x + p.w - 20; x += 90) {
      ctx.moveTo(x, p.top + 12);
      ctx.lineTo(x, p.top + h - 3);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(90,50,20,0.4)';
    ctx.stroke();
  };

  // Ступенька лестницы
  ST.step = function (ctx, p) {
    const h = p.h || 32;
    ctx.fillStyle = '#A8683A';
    ctx.fillRect(p.x, p.top, p.w, h);
    ctx.fillStyle = '#D9A066';
    ctx.fillRect(p.x - 3, p.top - 2, p.w + 6, 9);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#6A3F18';
    ctx.strokeRect(p.x - 3, p.top - 2, p.w + 6, 9);
  };

  // Кухонная столешница
  ST.counter = function (ctx, p) {
    G.rr(ctx, p.x - 6, p.top, p.w + 12, 16, 5);
    fs(ctx, '#F2F2F7', '#8E8EA8', 2.5);
  };

  // Книжная полка
  ST.shelf = function (ctx, p) {
    G.rr(ctx, p.x, p.top, p.w, 24, 5);
    fs(ctx, '#C0864D', '#4A2A10', 3);
    ctx.fillStyle = '#E3B070';
    ctx.fillRect(p.x + 4, p.top + 3, p.w - 8, 6);
    ctx.fillStyle = '#FFD23F';
    ctx.fillRect(p.x + 4, p.top + 15, p.w - 8, 3);
  };

  // Летающая книга (движется)
  ST.book = function (ctx, p, t) {
    const x = p.x, y = p.top, w = p.w;
    const flap = Math.sin(t * 7 + x * 0.01) * 5;
    const col = p.color || '#E0533F';
    // обложка снизу
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 8 + flap);
    ctx.lineTo(x + w / 2, y + 18);
    ctx.lineTo(x + w + 4, y + 8 + flap);
    ctx.lineTo(x + w + 4, y + 14 + flap);
    ctx.lineTo(x + w / 2, y + 26);
    ctx.lineTo(x - 4, y + 14 + flap);
    ctx.closePath();
    fs(ctx, col, U.shade(col, -0.45), 2.5);
    // страницы
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2 + flap);
    ctx.quadraticCurveTo(x + w * 0.25, y - 2 + flap * 0.5, x + w / 2, y + 12);
    ctx.quadraticCurveTo(x + w * 0.75, y - 2 + flap * 0.5, x + w - 2, y + 2 + flap);
    ctx.lineTo(x + w - 2, y + 9 + flap);
    ctx.lineTo(x + w / 2, y + 19);
    ctx.lineTo(x + 2, y + 9 + flap);
    ctx.closePath();
    fs(ctx, '#FFF8E6', '#B89A6A', 1.5);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 12);
    ctx.lineTo(x + w / 2, y + 19);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#B89A6A';
    ctx.stroke();
    G.sparkle(ctx, x + w + 6, y - 6, 4 + 2 * Math.sin(t * 6), '#FFF6B0', 0.9);
  };

  // Каменная полка
  ST.stone = function (ctx, p) {
    const h = 24;
    G.rr(ctx, p.x, p.top, p.w, h, 5);
    fs(ctx, '#A99FC0', '#5E547A', 3);
    ctx.beginPath();
    for (let x = p.x + 60; x < p.x + p.w - 10; x += 60) {
      ctx.moveTo(x, p.top + 2);
      ctx.lineTo(x, p.top + h - 2);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(80,70,110,0.5)';
    ctx.stroke();
    ctx.fillStyle = '#C9C0DD';
    ctx.fillRect(p.x + 3, p.top + 2, p.w - 6, 5);
    // кронштейны
    ctx.fillStyle = '#6E6390';
    for (const x of [p.x + 16, p.x + p.w - 30]) {
      ctx.beginPath();
      ctx.moveTo(x, p.top + h);
      ctx.lineTo(x + 14, p.top + h);
      ctx.lineTo(x + 14, p.top + h + 26);
      ctx.closePath();
      ctx.fill();
    }
  };

  // Стол
  ST.table = function (ctx, p) {
    const legs = p.legs || 120;
    ctx.fillStyle = '#8A5A2B';
    ctx.fillRect(p.x + 12, p.top + 14, 12, legs - 14);
    ctx.fillRect(p.x + p.w - 24, p.top + 14, 12, legs - 14);
    G.rr(ctx, p.x, p.top, p.w, 18, 5);
    fs(ctx, '#C98B4F', '#6A3F18', 3);
  };

  // Котёл-батут
  ST.cauldron = function (ctx, p, t) {
    const cx = p.x + p.w / 2, top = p.top;
    const sq = p.squashT ? Math.sin((p.squashT / 0.35) * Math.PI) * 0.12 : 0;
    const h = p.h || 70;
    const col = p.color || '#7CFF6A';
    ctx.save();
    ctx.translate(cx, top);
    ctx.scale(1 + sq, 1 - sq);
    // ножки
    ctx.fillStyle = '#2B2740';
    ctx.fillRect(-p.w / 2 + 4, h - 16, 12, 18);
    ctx.fillRect(p.w / 2 - 16, h - 16, 12, 18);
    // тело
    ctx.beginPath();
    ctx.moveTo(-p.w / 2 - 4, 4);
    ctx.bezierCurveTo(-p.w / 2 - 14, h * 0.7, -p.w / 2 + 10, h, 0, h);
    ctx.bezierCurveTo(p.w / 2 - 10, h, p.w / 2 + 14, h * 0.7, p.w / 2 + 4, 4);
    ctx.closePath();
    fs(ctx, '#3D3858', '#1C1930', 3);
    G.ellipse(ctx, -p.w * 0.22, h * 0.45, 8, 14, 0.3);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    // зелье
    G.ellipse(ctx, 0, 2, p.w / 2 + 2, 11);
    fs(ctx, col, U.shade(col, -0.4), 2);
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.5 + i * 0.37) % 1;
      G.circle(ctx, -p.w * 0.25 + i * p.w * 0.25, -ph * 12, 4 + i);
      ctx.fillStyle = U.rgba(U.shade(col, 0.4), 1 - ph);
      ctx.fill();
    }
    // обод
    G.rr(ctx, -p.w / 2 - 8, -2, p.w + 16, 10, 5);
    fs(ctx, '#56507A', '#1C1930', 2.5);
    ctx.restore();
  };

  // Ковёр-самолёт (движется)
  ST.carpet = function (ctx, p, t) {
    const x = p.x, y = p.top, w = p.w;
    ctx.beginPath();
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const xx = x + (w * i) / n;
      const yy = y + 2 + Math.sin(t * 5 + i * 0.8) * 3;
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    for (let i = n; i >= 0; i--) {
      const xx = x + (w * i) / n;
      const yy = y + 16 + Math.sin(t * 5 + i * 0.8) * 3;
      ctx.lineTo(xx, yy);
    }
    ctx.closePath();
    fs(ctx, '#D63A6A', '#7A1638', 2.5);
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const xx = x + (w * i) / n;
      const yy = y + 9 + Math.sin(t * 5 + i * 0.8) * 3;
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFD23F';
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#FFD23F';
    for (const ex of [x - 6, x + w + 2]) {
      for (let k = 0; k < 3; k++) {
        G.circle(ctx, ex + 2, y + 4 + k * 6 + Math.sin(t * 5) * 2, 2.6);
        ctx.fill();
      }
    }
  };

  // Каменный балкон башни
  ST.balcony = function (ctx, p) {
    const x = p.x, y = p.top, w = p.w;
    // перила сзади
    ctx.fillStyle = '#8F86B8';
    for (let bx = x + 10; bx < x + w - 6; bx += 22) ctx.fillRect(bx, y - 34, 8, 34);
    G.rr(ctx, x, y - 42, w, 10, 4);
    fs(ctx, '#B5ACDA', '#5E547A', 2);
    // плита
    G.rr(ctx, x - 4, y, w + 8, 22, 6);
    fs(ctx, '#B5ACDA', '#5E547A', 3);
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 22);
    ctx.lineTo(x + w / 2, y + 44);
    ctx.lineTo(x + w - 10, y + 22);
    ctx.closePath();
    fs(ctx, '#9C92C6', '#5E547A', 2.5);
  };

  Art.platform = function (ctx, p, t) {
    const f = ST[p.style];
    if (f) f(ctx, p, t);
  };
  Art.styles = ST;
  // Задняя часть площадки (стена дома, стебель, ножка гриба) — рисуется позади лестниц
  const BACK = {};
  Art.backs = BACK;
  Art.platformBack = function (ctx, p, t) {
    const f = BACK[p.style];
    if (f) f(ctx, p, t);
  };

  // ---------- лестницы ----------
  const LAD = {
    wood: { rail: '#A06A36', rung: '#C98D52', line: '#5A3515' },
    brass: { rail: '#C9A23A', rung: '#E6C56B', line: '#7A5A10' },
    metal: { rail: '#8E9AB2', rung: '#B7C1D6', line: '#4A546A' },
    rope: { rail: '#C9A56A', rung: '#8B5A2B', line: '#6A4520' },
  };

  Art.ladderColors = LAD;
  Art.ladderStyles = {}; // особые лестницы (лиана, леденец, пиксели) — см. styles.js

  Art.ladder = function (ctx, l, t) {
    const special = Art.ladderStyles[l.style];
    if (special) {
      special(ctx, l, t);
      return;
    }
    const c = LAD[l.style || 'wood'] || LAD.wood;
    const top = l.top - 14, bot = l.bottom;
    const x = l.x;
    // перекладины
    ctx.fillStyle = c.rung;
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 2;
    for (let y = bot - 18; y > top + 6; y -= 30) {
      G.rr(ctx, x - 20, y - 4, 40, 8, 3);
      ctx.fill();
      ctx.stroke();
    }
    // стойки
    for (const rx of [x - 24, x + 16]) {
      G.rr(ctx, rx, top, 8, bot - top, 4);
      fs(ctx, c.rail, c.line, 2);
    }
  };

  // ---------- общие декорации ----------
  Art.flower = function (ctx, x, y, s, color, t) {
    const sw = Math.sin(t * 2 + x) * 0.08;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sw);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -s * 2.2);
    ctx.lineWidth = s * 0.3;
    ctx.strokeStyle = '#3E9E36';
    ctx.stroke();
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU;
      G.circle(ctx, Math.cos(a) * s * 0.55, -s * 2.2 + Math.sin(a) * s * 0.55, s * 0.5);
      ctx.fill();
    }
    G.circle(ctx, 0, -s * 2.2, s * 0.38);
    ctx.fillStyle = '#FFE14D';
    ctx.fill();
    ctx.restore();
  };

  Art.bush = function (ctx, x, y, s, dark) {
    ctx.fillStyle = dark || '#3E9E3A';
    for (const [dx, dy, r] of [[-0.6, -0.3, 0.55], [0, -0.55, 0.7], [0.6, -0.3, 0.55]]) {
      G.circle(ctx, x + dx * s, y + dy * s, r * s);
      ctx.fill();
    }
    ctx.fillStyle = '#56BF4C';
    for (const [dx, dy, r] of [[-0.55, -0.4, 0.4], [0, -0.65, 0.5], [0.55, -0.4, 0.4]]) {
      G.circle(ctx, x + dx * s, y + dy * s, r * s);
      ctx.fill();
    }
  };

  Art.smallMushroom = function (ctx, x, y, s) {
    G.rr(ctx, x - s * 0.2, y - s * 0.9, s * 0.4, s * 0.9, s * 0.15);
    fs(ctx, '#FFF1D6', '#B89A6A', 1.5);
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.85, s * 0.7, s * 0.55, 0, Math.PI, TAU);
    ctx.closePath();
    fs(ctx, '#F0433A', '#9C1F18', 1.5);
    ctx.fillStyle = '#fff';
    G.circle(ctx, x - s * 0.25, y - s * 1.1, s * 0.12);
    ctx.fill();
    G.circle(ctx, x + s * 0.2, y - s * 1.2, s * 0.1);
    ctx.fill();
  };

  Art.fish = function (ctx, x, y, s, dir, color, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    const wag = Math.sin(t * 10) * 0.25;
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, 0);
    ctx.lineTo(-s * 1.3, -s * 0.45 + wag * s);
    ctx.lineTo(-s * 1.3, s * 0.45 + wag * s);
    ctx.closePath();
    fs(ctx, U.shade(color, -0.15));
    G.ellipse(ctx, 0, 0, s, s * 0.55);
    fs(ctx, color, U.shade(color, -0.45), 1.5);
    G.circle(ctx, s * 0.5, -s * 0.12, s * 0.14);
    ctx.fillStyle = '#1E1433';
    ctx.fill();
    ctx.restore();
  };

  Art.lantern = function (ctx, x, y, s, t, on) {
    G.rr(ctx, x - s * 0.5, y - s * 0.7, s, s * 1.3, s * 0.2);
    fs(ctx, on === false ? '#8A8398' : '#FFE27A', '#6A4A10', 2);
    if (on !== false) G.glow(ctx, x, y, s * 2.4, '#FFE27A', 0.35 + 0.1 * Math.sin(t * 7));
    G.rr(ctx, x - s * 0.62, y - s * 0.86, s * 1.24, s * 0.22, s * 0.08);
    fs(ctx, '#5A3A10');
    G.rr(ctx, x - s * 0.62, y + s * 0.6, s * 1.24, s * 0.2, s * 0.08);
    fs(ctx, '#5A3A10');
  };

  Art.torch = function (ctx, x, y, t) {
    G.rr(ctx, x - 5, y, 10, 34, 3);
    fs(ctx, '#6A4520', '#3A220A', 2);
    G.glow(ctx, x, y - 10, 70, '#FFB347', 0.45 + 0.1 * Math.sin(t * 11 + x));
    const f = Math.sin(t * 14 + x) * 2;
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 10, y - 16, x + f, y - 26);
    ctx.quadraticCurveTo(x + 10, y - 14, x + 9, y);
    ctx.closePath();
    fs(ctx, '#FF8A1A');
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.quadraticCurveTo(x - 5, y - 9, x + f * 0.5, y - 16);
    ctx.quadraticCurveTo(x + 5, y - 8, x + 4, y);
    ctx.closePath();
    fs(ctx, '#FFE066');
  };

  // Окно с рамой (внутренние сцены)
  Art.window = function (ctx, x, y, w, h, skyTop, skyBot, t, night) {
    G.rr(ctx, x - 10, y - 10, w + 20, h + 20, 12);
    fs(ctx, '#8A5A2B', '#5A3515', 3);
    ctx.save();
    G.rr(ctx, x, y, w, h, 6);
    ctx.clip();
    ctx.fillStyle = G.vGrad(ctx, y, y + h, [skyTop, skyBot]);
    ctx.fillRect(x, y, w, h);
    if (night) {
      G.nightStars(ctx, w, h, t, Math.round(x), 14, -x, -y);
      G.circle(ctx, x + w * 0.7, y + h * 0.3, Math.min(w, h) * 0.13);
      ctx.fillStyle = '#FFF4C2';
      ctx.fill();
    } else {
      G.cloud(ctx, x + w * 0.1 + ((t * 8) % (w * 0.8)), y + h * 0.2, w * 0.45, h * 0.18);
      ctx.fillStyle = '#7DD36E';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.3, y + h, w * 0.6, h * 0.25, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#8A5A2B';
    ctx.fillRect(x + w / 2 - 4, y, 8, h);
    ctx.fillRect(x, y + h / 2 - 4, w, 8);
  };

  // Картина в рамке
  Art.painting = function (ctx, x, y, w, h, kind) {
    G.rr(ctx, x - 8, y - 8, w + 16, h + 16, 6);
    fs(ctx, '#E0B040', '#8A6010', 3);
    ctx.fillStyle = kind === 1 ? '#BFE8FF' : '#FFE2EE';
    ctx.fillRect(x, y, w, h);
    if (kind === 1) {
      ctx.fillStyle = '#6CCB5F';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w * 0.35, y + h * 0.45);
      ctx.lineTo(x + w * 0.6, y + h * 0.75);
      ctx.lineTo(x + w * 0.8, y + h * 0.5);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      G.circle(ctx, x + w * 0.78, y + h * 0.25, h * 0.12);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
    } else {
      G.heartPath(ctx, x + w / 2, y + h / 2, Math.min(w, h) * 0.28);
      ctx.fillStyle = '#FF5A9E';
      ctx.fill();
    }
  };
})(window.VW);
