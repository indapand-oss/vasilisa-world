/* Vasilisa World — стили площадок, батутов, лифтов и лестниц для новых миров.
   ST[style](ctx, p, t) — верх площадки (по нему ходят), BK[style] — задняя часть
   (стена дома, стебель, ножка гриба до земли), рисуется позади лестниц. */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, Art = VW.Art;
  const ST = Art.styles, BK = Art.backs, LS = Art.ladderStyles;
  const fs = Art.fs;
  const TAU = Math.PI * 2;

  // видимая часть длинной площадки
  function vx0(p) {
    const v = Art.view;
    return v ? Math.max(p.x, v.x0) : p.x;
  }
  function vx1(p) {
    const v = Art.view;
    return v ? Math.min(p.x + p.w, v.x1) : p.x + p.w;
  }
  function vy1(y) {
    const v = Art.view;
    return v ? Math.min(y, v.y1) : y;
  }
  function squash(p) {
    return p.squashT ? Math.sin((p.squashT / 0.35) * Math.PI) * 0.25 : 0;
  }
  function rnd(p, salt) {
    return U.rng(((p.seed || 7) * 131 + (salt || 0)) >>> 0);
  }
  function stripes(ctx, x, y, w, h, step, color) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.beginPath();
    for (let sx = x - h; sx < x + w + h; sx += step * 2) {
      ctx.moveTo(sx, y + h);
      ctx.lineTo(sx + h, y);
      ctx.lineTo(sx + h + step, y);
      ctx.lineTo(sx + step, y + h);
      ctx.closePath();
    }
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
  Art.stripes = stripes;
  // «батутный» изгиб: сжатие при прыжке
  function padTransform(ctx, p, cy) {
    const sq = squash(p);
    const cx = p.x + p.w / 2;
    ctx.translate(cx, cy);
    ctx.scale(1 + sq * 0.5, 1 - sq);
    ctx.translate(-cx, -cy);
  }

  // =========================================================
  // Земля и полы
  // =========================================================
  ST.street = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p), h = vy1(y + (p.h || 200)) - y;
    ctx.fillStyle = '#D4CEDF';
    ctx.fillRect(x0, y, x1 - x0, 26);
    ctx.beginPath();
    for (let x = Math.ceil(x0 / 64) * 64; x < x1; x += 64) {
      ctx.moveTo(x, y + 3);
      ctx.lineTo(x, y + 24);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(120,110,140,0.35)';
    ctx.stroke();
    ctx.fillStyle = '#9E97AE';
    ctx.fillRect(x0, y + 24, x1 - x0, 12);
    ctx.fillStyle = '#524E62';
    ctx.fillRect(x0, y + 36, x1 - x0, Math.max(0, h - 36));
    ctx.fillStyle = '#F4F1E8';
    for (let x = Math.ceil(x0 / 150) * 150; x < x1; x += 150) ctx.fillRect(x, y + 96, 76, 8);
  };

  ST.metalFloor = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p), h = vy1(y + (p.h || 200)) - y;
    ctx.fillStyle = G.vGrad(ctx, y, y + 160, ['#A2AFC2', '#7E8BA0']);
    ctx.fillRect(x0, y, x1 - x0, h);
    // рифлёный узор
    ctx.beginPath();
    for (let yy = y + 26; yy < y + Math.min(h, 170); yy += 18) {
      const off = ((yy - y) / 18) % 2 ? 14 : 0;
      for (let x = Math.floor((x0 - off) / 28) * 28 + off; x < x1; x += 28) {
        ctx.moveTo(x, yy);
        ctx.lineTo(x + 9, yy - 5);
      }
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(70,82,104,0.35)';
    ctx.stroke();
    // жёлто-чёрная полоса по краю
    ctx.fillStyle = '#FFC928';
    ctx.fillRect(x0, y - 2, x1 - x0, 14);
    stripes(ctx, x0, y - 2, x1 - x0, 14, 14, '#2E3440');
  };

  ST.concrete = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p), h = vy1(y + (p.h || 200)) - y;
    ctx.fillStyle = G.vGrad(ctx, y, y + 160, ['#BFC3CF', '#9EA3B2']);
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.fillStyle = '#D9DCE4';
    ctx.fillRect(x0, y - 3, x1 - x0, 10);
    ctx.beginPath();
    for (let x = Math.ceil(x0 / 120) * 120; x < x1; x += 120) {
      ctx.moveTo(x, y + 7);
      ctx.lineTo(x, y + h);
      ctx.moveTo(x + 40, y + 40);
      ctx.lineTo(x + 52, y + 60);
      ctx.lineTo(x + 48, y + 78);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(90,95,115,0.35)';
    ctx.stroke();
  };

  ST.soil = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p), h = vy1(y + (p.h || 200)) - y;
    ctx.fillStyle = G.vGrad(ctx, y, y + 170, ['#8A5A32', '#5E3A1E']);
    ctx.fillRect(x0, y + 4, x1 - x0, h - 4);
    // комочки
    ctx.fillStyle = 'rgba(40,20,5,0.3)';
    ctx.beginPath();
    for (let x = Math.floor(x0 / 46) * 46; x < x1; x += 46) {
      const k = ((x * 7) % 13) / 13;
      ctx.moveTo(x + 20, y + 40 + k * 60);
      ctx.ellipse(x + 14, y + 40 + k * 60, 8, 5, 0, 0, TAU);
    }
    ctx.fill();
    // грядка: край с травкой и росточками
    G.rr(ctx, x0, y - 5, x1 - x0, 14, 6);
    ctx.fillStyle = '#5DBB46';
    ctx.fill();
    ctx.beginPath();
    for (let x = Math.floor(x0 / 38) * 38 + 12; x < x1; x += 38) {
      ctx.moveTo(x, y - 4);
      ctx.quadraticCurveTo(x - 8, y - 14, x - 12, y - 12);
      ctx.quadraticCurveTo(x - 6, y - 6, x, y - 4);
      ctx.moveTo(x, y - 4);
      ctx.quadraticCurveTo(x + 8, y - 16, x + 13, y - 13);
      ctx.quadraticCurveTo(x + 7, y - 6, x, y - 4);
    }
    ctx.fillStyle = '#7BD35A';
    ctx.fill();
  };

  ST.kitchenFloor = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p), h = vy1(y + (p.h || 200)) - y;
    ctx.fillStyle = '#FFF6FA';
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.fillStyle = '#FF9EC4';
    const s = 44;
    for (let yy = y + 10, row = 0; yy < y + h; yy += s, row++) {
      for (let x = Math.floor(x0 / s) * s; x < x1; x += s) {
        if (((x / s) + row) % 2 === 0) ctx.fillRect(x, yy, s, s);
      }
    }
    // плинтус
    G.rr(ctx, x0, y - 4, x1 - x0, 16, 4);
    fs(ctx, '#E8B88A', '#B07A4A', 2);
  };

  ST.pixelGround = function (ctx, p) {
    const y = p.top, x0 = Math.floor(vx0(p) / 20) * 20, x1 = vx1(p), h = vy1(y + (p.h || 200)) - y;
    ctx.fillStyle = '#9A6A3A';
    ctx.fillRect(x0, y + 20, x1 - x0, h - 20);
    ctx.fillStyle = '#7A4E28';
    for (let yy = y + 40; yy < y + h; yy += 20) {
      for (let x = x0; x < x1; x += 20) if (((x * 3 + yy * 7) / 20) % 5 === 0) ctx.fillRect(x, yy, 20, 20);
    }
    ctx.fillStyle = '#5FBF4A';
    ctx.fillRect(x0, y - 2, x1 - x0, 22);
    ctx.fillStyle = '#8FE06A';
    for (let x = x0; x < x1; x += 20) if ((x / 20) % 3 === 0) ctx.fillRect(x, y - 2, 20, 8);
    ctx.fillStyle = '#5FBF4A';
    for (let x = x0; x < x1; x += 40) ctx.fillRect(x, y + 20, 20, 10);
  };

  ST.rackFloor = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    const thick = p.kind === 'ground' ? vy1(y + (p.h || 200)) - y : 26;
    ctx.fillStyle = '#2A3558';
    ctx.fillRect(x0, y, x1 - x0, thick);
    // решётка
    ctx.beginPath();
    for (let x = Math.ceil(x0 / 24) * 24; x < x1; x += 24) {
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x, y + 22);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3E4C7A';
    ctx.stroke();
    ctx.fillStyle = '#5FE0FF';
    ctx.fillRect(x0, y - 3, x1 - x0, 5);
    ctx.fillStyle = 'rgba(95,224,255,0.25)';
    ctx.fillRect(x0, y - 8, x1 - x0, 5);
  };

  // =========================================================
  // Город и герой-паук
  // =========================================================
  function buildingWindows(p) {
    if (p._win) return p._win;
    const r = rnd(p, 3);
    const x = p.x + 8, w = p.w - 16;
    const cols = Math.max(1, Math.floor((w - 16) / 44));
    const gx = x + (w - cols * 44) / 2 + 10;
    const win = [], lit = [];
    for (let yy = p.top + 40; yy + 38 < p.base - 20; yy += 64) {
      for (let c = 0; c < cols; c++) (r() < (p.night ? 0.45 : 0.18) ? lit : win).push([gx + c * 44, yy]);
    }
    p._win = { win: win, lit: lit, door: p.base - p.top > 150 ? x + w / 2 - 20 : null };
    return p._win;
  }
  BK.roof = function (ctx, p) {
    if (p.base == null) return;
    const c = p.color || '#E57373';
    const x = p.x + 8, w = p.w - 16, y0 = p.top + 16;
    const y1 = vy1(p.base);
    ctx.fillStyle = c;
    ctx.fillRect(x, y0, w, y1 - y0);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(x + w - 16, y0, 16, y1 - y0);
    const wd = buildingWindows(p);
    ctx.beginPath();
    for (const [wx, wy] of wd.win) ctx.rect(wx, wy, 24, 34);
    ctx.fillStyle = p.night ? '#3B3F6B' : '#CDEBFF';
    ctx.fill();
    if (wd.lit.length) {
      ctx.beginPath();
      for (const [wx, wy] of wd.lit) ctx.rect(wx, wy, 24, 34);
      ctx.fillStyle = '#FFE08A';
      ctx.fill();
    }
    ctx.beginPath();
    for (const [wx, wy] of wd.win.concat(wd.lit)) {
      ctx.moveTo(wx, wy + 17);
      ctx.lineTo(wx + 24, wy + 17);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.stroke();
    if (wd.door != null) {
      G.rr(ctx, wd.door, p.base - 62, 40, 62, 6);
      fs(ctx, U.shade(c, -0.45), U.shade(c, -0.6), 2);
    }
  };
  ST.roof = function (ctx, p) {
    const c = p.color || '#E57373';
    if (p.base == null) {
      // без стены — балкончик
      G.rr(ctx, p.x + 8, p.top + 12, p.w - 16, 26, 6);
      fs(ctx, c, U.shade(c, -0.4), 2);
    }
    G.rr(ctx, p.x, p.top - 4, p.w, 22, 5);
    fs(ctx, U.shade(c, -0.3), U.shade(c, -0.55), 2.5);
    G.rr(ctx, p.x + 3, p.top - 3, p.w - 6, 6, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
    // антенна на краю крыши
    if (p.w > 190 && (p.seed || 0) % 3 === 0) {
      const ax = p.x + p.w - 26;
      ctx.beginPath();
      ctx.moveTo(ax, p.top - 4);
      ctx.lineTo(ax, p.top - 44);
      ctx.moveTo(ax - 12, p.top - 34);
      ctx.lineTo(ax + 12, p.top - 34);
      ctx.moveTo(ax - 8, p.top - 24);
      ctx.lineTo(ax + 8, p.top - 24);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#5A5670';
      ctx.stroke();
    }
  };

  ST.ledge = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    // перила — позади героя
    ctx.beginPath();
    for (let x = Math.ceil((x0 + 4) / 24) * 24; x < x1 - 4; x += 24) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 34);
    }
    ctx.moveTo(Math.max(x0, p.x + 4), y - 34);
    ctx.lineTo(Math.min(x1, p.x + p.w - 4), y - 34);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = p.night ? '#8FA3D0' : '#9FB3D9';
    ctx.stroke();
    G.rr(ctx, x0, y, x1 - x0, 22, 6);
    fs(ctx, '#CBD5EA', '#6E7FA6', 3);
    ctx.fillStyle = '#A9B6D3';
    ctx.fillRect(x0 + 4, y + 13, x1 - x0 - 8, 6);
  };

  // Ящики-ступеньки (коробки)
  function boxStack(ctx, p, fill, edge, tape) {
    const bh = 42;
    const bottom = vy1(p.top + (p.h || 40));
    for (let yy = p.top, i = 0; yy < bottom; yy += bh, i++) {
      const h = Math.min(bh, bottom - yy);
      G.rr(ctx, p.x + 2, yy, p.w - 4, h, 4);
      fs(ctx, i % 2 ? U.shade(fill, -0.06) : fill, edge, 2.5);
      if (tape) {
        ctx.fillStyle = tape;
        ctx.fillRect(p.x + p.w / 2 - 6, yy + 1, 12, h - 2);
      }
    }
  }
  ST.boxes = function (ctx, p) {
    boxStack(ctx, p, '#D9A96A', '#8A5E2E', 'rgba(255,240,200,0.55)');
  };
  ST.metalBox = function (ctx, p) {
    boxStack(ctx, p, '#8FA3C0', '#4A5A78', null);
    ctx.fillStyle = '#FFC928';
    ctx.fillRect(p.x + 6, p.top + 4, p.w - 12, 6);
  };

  // Навес-батут
  ST.awning = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    ctx.fillStyle = '#6E6A80';
    ctx.fillRect(p.x + 10, top + 12, 6, h - 12);
    ctx.fillRect(p.x + p.w - 16, top + 12, 6, h - 12);
    ctx.save();
    padTransform(ctx, p, top + 10);
    ctx.beginPath();
    ctx.moveTo(p.x - 8, top + 20);
    ctx.quadraticCurveTo(p.x + p.w / 2, top - 16, p.x + p.w + 8, top + 20);
    ctx.lineTo(p.x + p.w + 8, top + 26);
    ctx.lineTo(p.x - 8, top + 26);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = p.color && p.color !== '#E57373' ? p.color : '#FF5A5A';
    for (let x = p.x - 8; x < p.x + p.w + 8; x += 24) ctx.fillRect(x, top - 20, 12, 50);
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8E2A2A';
    ctx.stroke();
    // фестончики
    ctx.beginPath();
    for (let x = p.x - 8; x < p.x + p.w + 8; x += 16) {
      ctx.moveTo(x, top + 26);
      ctx.arc(x + 8, top + 26, 8, Math.PI, 0, true);
    }
    ctx.fillStyle = '#FF5A5A';
    ctx.fill();
    ctx.restore();
  };

  // Люлька мойщика окон на тросах
  ST.cradle = function (ctx, p) {
    const y = p.top;
    ctx.beginPath();
    ctx.moveTo(p.x + 14, y - 30);
    ctx.lineTo(p.x + 14, y - 1400);
    ctx.moveTo(p.x + p.w - 14, y - 30);
    ctx.lineTo(p.x + p.w - 14, y - 1400);
    ctx.lineWidth = 3;
    ctx.strokeStyle = p.night ? '#9AA0C0' : '#5A5670';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x + 4, y - 32);
    ctx.lineTo(p.x + p.w - 4, y - 32);
    for (let x = p.x + 4; x <= p.x + p.w - 4; x += (p.w - 8) / 4) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 32);
    }
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#E0A030';
    ctx.stroke();
    G.rr(ctx, p.x, y, p.w, 26, 6);
    fs(ctx, '#F2B233', '#9A6A10', 3);
    stripes(ctx, p.x + 3, y + 14, p.w - 6, 9, 9, 'rgba(60,40,10,0.55)');
  };

  // Мостик из паутинок
  ST.webBridge = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    const sag = Math.min(46, p.w * 0.14);
    ctx.beginPath();
    ctx.moveTo(p.x + 4, y + 6);
    ctx.quadraticCurveTo(p.x + p.w / 2, y + 6 + sag * 2, p.x + p.w - 4, y + 6);
    const n = Math.max(3, Math.round(p.w / 30));
    for (let k = 1; k < n; k++) {
      const tt = k / n;
      const x = p.x + 4 + (p.w - 8) * tt;
      const cy = y + 6 + 2 * tt * (1 - tt) * sag * 2;
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x + (tt - 0.5) * 8, cy);
    }
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(235,235,255,0.85)';
    ctx.stroke();
    G.rr(ctx, x0, y - 3, x1 - x0, 11, 5);
    fs(ctx, '#F4F4FF', '#A9A9D6', 2);
    // «узелки»
    ctx.fillStyle = '#C9C9EE';
    for (let x = Math.ceil(x0 / 26) * 26; x < x1 - 4; x += 26) {
      G.circle(ctx, x, y + 2, 2.2);
      ctx.fill();
    }
  };
  BK.webBridge = function (ctx, p) {
    if (p.base == null) return;
    const y1 = vy1(p.base);
    for (const x of [p.x + 10, p.x + p.w - 20]) {
      G.rr(ctx, x, p.top, 10, y1 - p.top, 4);
      fs(ctx, '#4A3A6A', '#2A1F45', 2);
    }
  };

  // Паутинка-батут
  ST.webPad = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    const cx = p.x + p.w / 2;
    ctx.fillStyle = '#4A3A6A';
    ctx.fillRect(p.x + 2, top, 8, h);
    ctx.fillRect(p.x + p.w - 10, top, 8, h);
    ctx.save();
    padTransform(ctx, p, top + 8);
    const rx = p.w / 2 + 2, ry = 13;
    G.ellipse(ctx, cx, top + 8, rx, ry);
    ctx.fillStyle = 'rgba(230,230,255,0.25)';
    ctx.fill();
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU;
      ctx.moveTo(cx, top + 8);
      ctx.lineTo(cx + Math.cos(a) * rx, top + 8 + Math.sin(a) * ry);
    }
    for (const kk of [0.35, 0.65, 1]) {
      ctx.moveTo(cx + rx * kk, top + 8);
      ctx.ellipse(cx, top + 8, rx * kk, ry * kk, 0, 0, TAU);
    }
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#F0F0FF';
    ctx.stroke();
    ctx.restore();
  };

  // Качели на верёвочках (ниточках паутинки / лианах)
  ST.swing = function (ctx, p) {
    const y = p.top;
    const rope = p.night ? '#E8E8FF' : p.color === '#F4F4FF' ? '#F4F4FF' : '#6A8A3A';
    ctx.beginPath();
    ctx.moveTo(p.x + 12, y);
    ctx.lineTo(p.x + 12, y - 1300);
    ctx.moveTo(p.x + p.w - 12, y);
    ctx.lineTo(p.x + p.w - 12, y - 1300);
    ctx.lineWidth = 3;
    ctx.strokeStyle = rope;
    ctx.stroke();
    G.rr(ctx, p.x, y, p.w, 18, 7);
    fs(ctx, '#C98D52', '#6A4520', 3);
    ctx.beginPath();
    for (let x = p.x + 30; x < p.x + p.w - 10; x += 30) {
      ctx.moveTo(x, y + 3);
      ctx.lineTo(x, y + 15);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(106,69,32,0.5)';
    ctx.stroke();
  };

  // Площадка на воздушных шариках
  ST.balloons = function (ctx, p, t) {
    const y = p.top;
    const cols = ['#FF5A5A', '#FFD23F', '#4FC3F7', '#81C784', '#F06292'];
    const n = 4;
    for (let k = 0; k < n; k++) {
      const bx = p.x + 18 + ((p.w - 36) * k) / (n - 1);
      const by = y - 120 - (k % 2) * 26 + Math.sin(t * 2 + k) * 4;
      ctx.beginPath();
      ctx.moveTo(bx, by + 26);
      ctx.quadraticCurveTo(bx + 6, (by + y) / 2, p.x + p.w / 2 + (k - 1.5) * 16, y);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(80,70,90,0.7)';
      ctx.stroke();
      G.ellipse(ctx, bx, by, 20, 25);
      ctx.fillStyle = cols[(k + (p.seed || 0)) % cols.length];
      ctx.fill();
      G.ellipse(ctx, bx - 6, by - 9, 5, 8, -0.4);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fill();
    }
    G.rr(ctx, p.x, y, p.w, 18, 8);
    fs(ctx, '#FFF3D6', '#B88A4A', 3);
    stripes(ctx, p.x + 4, y + 4, p.w - 8, 10, 10, 'rgba(255,90,90,0.5)');
  };

  // =========================================================
  // Роботы
  // =========================================================
  ST.girder = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    const c = p.kind === 'floor' ? '#5B7FC7' : p.color || '#3D7BD9';
    G.rr(ctx, x0, y, x1 - x0, 24, 3);
    fs(ctx, c, U.shade(c, -0.45), 2.5);
    ctx.fillStyle = U.shade(c, 0.3);
    ctx.fillRect(x0 + 2, y + 2, x1 - x0 - 4, 5);
    ctx.fillStyle = U.shade(c, -0.25);
    ctx.fillRect(x0 + 2, y + 16, x1 - x0 - 4, 6);
    // заклёпки
    ctx.fillStyle = U.shade(c, 0.45);
    for (let x = Math.ceil((x0 + 8) / 30) * 30; x < x1 - 6; x += 30) {
      G.circle(ctx, x, y + 11, 2.6);
      ctx.fill();
    }
  };
  BK.girder = function (ctx, p) {
    if (p.base == null) return;
    const y1 = vy1(p.base);
    for (const x of p.w > 170 ? [p.x + 20, p.x + p.w - 44] : [p.x + p.w / 2 - 12]) {
      ctx.fillStyle = 'rgba(60,80,120,0.55)';
      ctx.fillRect(x, p.top + 20, 4, y1 - p.top - 20);
      ctx.fillRect(x + 20, p.top + 20, 4, y1 - p.top - 20);
      ctx.beginPath();
      for (let yy = p.top + 24; yy < y1 - 20; yy += 34) {
        ctx.moveTo(x + 2, yy);
        ctx.lineTo(x + 22, yy + 34);
        ctx.moveTo(x + 22, yy);
        ctx.lineTo(x + 2, yy + 34);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(60,80,120,0.5)';
      ctx.stroke();
    }
  };

  // Пружина-батут
  ST.spring = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    const sq = squash(p);
    const cx = p.x + p.w / 2;
    const plateY = top + sq * 30;
    G.rr(ctx, p.x + 8, top + h - 10, p.w - 16, 10, 4);
    fs(ctx, '#5A6378', '#2E3440', 2);
    ctx.beginPath();
    const coils = 5;
    for (let k = 0; k <= coils * 2; k++) {
      const yy = plateY + 12 + ((top + h - 10 - plateY - 12) * k) / (coils * 2);
      const xx = cx + (k % 2 ? 26 : -26);
      if (k === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#B7C1D6';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4A546A';
    ctx.stroke();
    G.rr(ctx, p.x - 2, plateY, p.w + 4, 14, 6);
    fs(ctx, '#FF5A5A', '#8E2A2A', 3);
  };

  // Летающая платформа с огоньками
  ST.hover = function (ctx, p, t) {
    const y = p.top;
    for (const x of [p.x + 24, p.x + p.w - 24]) {
      const fl = 14 + Math.sin(t * 20 + x) * 4;
      G.glow(ctx, x, y + 30, 26, '#5FE0FF', 0.6);
      ctx.beginPath();
      ctx.moveTo(x - 8, y + 20);
      ctx.lineTo(x, y + 20 + fl);
      ctx.lineTo(x + 8, y + 20);
      ctx.closePath();
      ctx.fillStyle = '#8FF0FF';
      ctx.fill();
    }
    G.rr(ctx, p.x, y, p.w, 22, 10);
    fs(ctx, '#C9D3E8', '#4A5A78', 3);
    ctx.fillStyle = '#5FE0FF';
    for (let x = p.x + 18; x < p.x + p.w - 10; x += 22) {
      G.circle(ctx, x, y + 11, 3);
      ctx.fill();
    }
  };

  // Крюк с поддоном
  ST.hook = function (ctx, p) {
    const y = p.top, cx = p.x + p.w / 2;
    ctx.beginPath();
    ctx.moveTo(cx, y - 60);
    ctx.lineTo(cx, y - 1400);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#4A4E5E';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x + 10, y);
    ctx.lineTo(cx, y - 56);
    ctx.lineTo(p.x + p.w - 10, y);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#6A6E80';
    ctx.stroke();
    G.rr(ctx, cx - 12, y - 72, 24, 20, 5);
    fs(ctx, '#FFB300', '#8A5A00', 2.5);
    G.rr(ctx, p.x, y, p.w, 12, 3);
    fs(ctx, '#C98D52', '#6A4520', 2.5);
    ctx.fillStyle = '#A06A36';
    for (let x = p.x + 8; x < p.x + p.w - 8; x += 34) ctx.fillRect(x, y + 12, 14, 10);
  };

  // Деревянные ящики, стопкой до пола
  function crateBox(ctx, x, y, w, h, c) {
    G.rr(ctx, x, y, w, h, 4);
    fs(ctx, c, U.shade(c, -0.5), 3);
    ctx.beginPath();
    ctx.rect(x + 7, y + 7, w - 14, h - 14);
    ctx.moveTo(x + 7, y + 7);
    ctx.lineTo(x + w - 7, y + h - 7);
    ctx.lineWidth = 3;
    ctx.strokeStyle = U.shade(c, -0.3);
    ctx.stroke();
  }
  ST.crate = function (ctx, p) {
    const c = p.color || '#D9A35F';
    if (p.kind === 'block') {
      const bottom = vy1(p.top + (p.h || 40));
      for (let yy = p.top; yy < bottom - 4; yy += 44) crateBox(ctx, p.x + 1, yy, p.w - 2, Math.min(44, bottom - yy), c);
      return;
    }
    const n = Math.max(1, Math.round(p.w / 76));
    const bw = p.w / n;
    for (let k = 0; k < n; k++) crateBox(ctx, p.x + k * bw, p.top, bw, 44, k % 2 ? U.shade(c, -0.07) : c);
  };
  BK.crate = function (ctx, p) {
    if (p.base == null || p.kind === 'block') return;
    const c = U.shade(p.color || '#D9A35F', -0.12);
    const bottom = vy1(p.base);
    const n = Math.max(1, Math.round(p.w / 76));
    const bw = p.w / n;
    for (let yy = p.top + 44, row = 0; yy < bottom - 4; yy += 44, row++) {
      for (let k = 0; k < n; k++) if ((k + row) % 3 !== 2 || row === 0) crateBox(ctx, p.x + k * bw + 3, yy, bw - 6, Math.min(44, bottom - yy), c);
    }
  };

  // =========================================================
  // Растения
  // =========================================================
  function leafShape(ctx, x, y, w, h, c) {
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.35);
    ctx.quadraticCurveTo(x + w * 0.1, y - h * 0.2, x + w * 0.5, y);
    ctx.quadraticCurveTo(x + w * 0.9, y - h * 0.2, x + w, y + h * 0.35);
    ctx.quadraticCurveTo(x + w * 0.75, y + h * 1.1, x + w * 0.5, y + h);
    ctx.quadraticCurveTo(x + w * 0.25, y + h * 1.1, x, y + h * 0.35);
    ctx.closePath();
    fs(ctx, c, U.shade(c, -0.45), 2.5);
  }
  ST.leaf = function (ctx, p) {
    const c = p.color || '#5FBF4A';
    leafShape(ctx, p.x - 6, p.top - 4, p.w + 12, 30, c);
    // прожилки
    ctx.beginPath();
    ctx.moveTo(p.x + 4, p.top + 6);
    ctx.lineTo(p.x + p.w - 4, p.top + 6);
    for (let x = p.x + 30; x < p.x + p.w - 20; x += 34) {
      ctx.moveTo(x, p.top + 6);
      ctx.lineTo(x + 14, p.top + 18);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = U.shade(c, 0.35);
    ctx.stroke();
  };
  BK.leaf = function (ctx, p) {
    if (p.base == null) return;
    const cx = p.x + p.w / 2;
    const y1 = vy1(p.base + 6);
    ctx.beginPath();
    ctx.moveTo(cx - 7, p.top + 14);
    ctx.bezierCurveTo(cx - 24, (p.top + y1) / 2, cx + 18, (p.top + y1) / 2 + 40, cx - 6, y1);
    ctx.lineTo(cx + 8, y1);
    ctx.bezierCurveTo(cx + 30, (p.top + y1) / 2 + 40, cx - 10, (p.top + y1) / 2, cx + 7, p.top + 14);
    ctx.closePath();
    fs(ctx, '#4CA83A', '#2F7A2C', 2);
    // маленькие листочки на стебле
    for (let yy = p.top + 70; yy < y1 - 30; yy += 90) {
      G.ellipse(ctx, cx + ((yy / 90) % 2 ? 22 : -22), yy, 16, 8, (yy / 90) % 2 ? 0.5 : -0.5);
      fs(ctx, '#62C24F', '#2F7A2C', 1.5);
    }
  };
  ST.flowerTop = function (ctx, p, t) {
    // вершина — огромный цветок: лепестки вокруг площадки
    const cx = p.x + p.w / 2, cy = p.top + 16;
    for (let k = 0; k < 10; k++) {
      const a = Math.PI + (k / 9) * Math.PI;
      G.ellipse(ctx, cx + Math.cos(a) * (p.w * 0.46), cy + Math.sin(a) * 30 + 14, 34, 18, a);
      fs(ctx, k % 2 ? '#FF8FC0' : '#FFB3D6', '#C2185B', 2);
    }
    G.ellipse(ctx, cx, cy + 4, p.w / 2 + 4, 20);
    fs(ctx, '#FFD23F', '#D98B00', 3);
    ctx.fillStyle = 'rgba(160,90,0,0.35)';
    for (let k = 0; k < 14; k++) {
      G.circle(ctx, cx - p.w * 0.4 + (k * p.w * 0.8) / 13, cy + 4 + ((k * 7) % 5) - 2, 2.5);
      ctx.fill();
    }
    void t;
  };
  BK.flowerTop = BK.leaf;
  ST.vineFloor = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    G.rr(ctx, x0, y - 2, x1 - x0, 20, 10);
    fs(ctx, '#4CA83A', '#2F7A2C', 2.5);
    ctx.fillStyle = '#7CD35A';
    ctx.fillRect(x0 + 4, y + 1, x1 - x0 - 8, 4);
    for (let x = Math.ceil(x0 / 90) * 90; x < x1; x += 90) {
      G.ellipse(ctx, x + 20, y + 22, 18, 9, 0.5);
      fs(ctx, '#62C24F', '#2F7A2C', 1.5);
      G.ellipse(ctx, x + 60, y - 6, 14, 7, -0.5);
      fs(ctx, '#7CD35A', '#2F7A2C', 1.5);
    }
  };

  ST.pumpkin = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    const cx = p.x + p.w / 2;
    ctx.save();
    padTransform(ctx, p, top + h);
    const rw = p.w / 2 + 6;
    for (const [dx, k] of [[-0.55, 0.62], [0.55, 0.62], [0, 0.72]]) {
      G.ellipse(ctx, cx + dx * rw * 0.7, top + h * 0.5 + 4, rw * k, h * 0.56);
      fs(ctx, dx === 0 ? '#FF9A2E' : '#F07E1E', '#A8480A', 2.5);
    }
    ctx.beginPath();
    ctx.moveTo(cx - 2, top + 2);
    ctx.quadraticCurveTo(cx + 2, top - 12, cx + 12, top - 16);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4C8A2A';
    ctx.stroke();
    G.ellipse(ctx, cx + 20, top - 8, 12, 6, 0.4);
    fs(ctx, '#62C24F', '#2F7A2C', 1.5);
    ctx.restore();
  };

  // Листик, который несёт пчёлка
  function bee(ctx, x, y, t, s) {
    s = s || 1;
    const fl = Math.sin(t * 40) * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    G.ellipse(ctx, -6, -14, 11, 7 + fl * 4, -0.4);
    ctx.fillStyle = 'rgba(220,240,255,0.85)';
    ctx.fill();
    G.ellipse(ctx, 6, -14, 11, 7 + fl * 4, 0.4);
    ctx.fill();
    G.ellipse(ctx, 0, 0, 16, 11);
    fs(ctx, '#FFD23F', '#6A4A00', 2);
    ctx.fillStyle = '#3A2A10';
    ctx.fillRect(-5, -10, 4, 20);
    ctx.fillRect(4, -10, 4, 20);
    G.circle(ctx, 15, -2, 6);
    fs(ctx, '#3A2A10');
    G.circle(ctx, 17, -4, 1.8);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
  }
  Art.bee = bee;
  ST.bee = function (ctx, p, t) {
    const y = p.top;
    const cx = p.x + p.w / 2;
    const by = y - 70 + Math.sin(t * 3) * 3;
    ctx.beginPath();
    ctx.moveTo(p.x + 16, y);
    ctx.lineTo(cx, by + 8);
    ctx.lineTo(p.x + p.w - 16, y);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(90,70,30,0.7)';
    ctx.stroke();
    bee(ctx, cx, by, t, 1.2);
    leafShape(ctx, p.x - 4, y - 3, p.w + 8, 24, '#62C24F');
  };

  // Полка с цветочными горшками
  function flowerPot(ctx, x, y, s, c, plant) {
    ctx.beginPath();
    ctx.moveTo(x - 12 * s, y - 22 * s);
    ctx.lineTo(x + 12 * s, y - 22 * s);
    ctx.lineTo(x + 9 * s, y);
    ctx.lineTo(x - 9 * s, y);
    ctx.closePath();
    fs(ctx, c, U.shade(c, -0.4), 2);
    G.rr(ctx, x - 14 * s, y - 26 * s, 28 * s, 7 * s, 2);
    fs(ctx, U.shade(c, 0.1), U.shade(c, -0.4), 2);
    const py = y - 26 * s;
    if (plant === 0) {
      for (const a of [-0.6, 0, 0.6]) {
        G.ellipse(ctx, x + Math.sin(a) * 10 * s, py - 12 * s, 6 * s, 12 * s, a);
        fs(ctx, '#5FBF4A', '#2F7A2C', 1.5);
      }
    } else if (plant === 1) {
      ctx.beginPath();
      ctx.moveTo(x, py);
      ctx.lineTo(x, py - 20 * s);
      ctx.lineWidth = 3 * s;
      ctx.strokeStyle = '#3E9E36';
      ctx.stroke();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU;
        G.circle(ctx, x + Math.cos(a) * 6 * s, py - 22 * s + Math.sin(a) * 6 * s, 4.5 * s);
        ctx.fillStyle = '#FF6FA8';
        ctx.fill();
      }
      G.circle(ctx, x, py - 22 * s, 3.5 * s);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
    } else {
      // кактус
      G.rr(ctx, x - 6 * s, py - 26 * s, 12 * s, 26 * s, 6 * s);
      fs(ctx, '#4FAF6A', '#2A6A3A', 1.5);
      G.rr(ctx, x + 4 * s, py - 18 * s, 8 * s, 5 * s, 2);
      fs(ctx, '#4FAF6A', '#2A6A3A', 1.5);
    }
  }
  Art.flowerPot = flowerPot;
  ST.potShelf = function (ctx, p) {
    const y = p.top;
    const r = rnd(p, 5);
    // горшки — позади героя, по краям полки
    const n = Math.max(1, Math.floor(p.w / 110));
    for (let k = 0; k < n; k++) {
      const x = p.x + 30 + ((p.w - 60) * (k + (n === 1 ? 0.5 : 0))) / Math.max(1, n - (n === 1 ? 0 : 1));
      flowerPot(ctx, x, y, 0.9, ['#E07A4F', '#F2A65A', '#D96C4A'][Math.floor(r() * 3)], Math.floor(r() * 3));
    }
    G.rr(ctx, p.x, y, p.w, 16, 4);
    fs(ctx, '#C98D52', '#6A4520', 2.5);
    // кронштейны
    ctx.fillStyle = '#8A5A2B';
    ctx.fillRect(p.x + 14, y + 16, 6, 18);
    ctx.fillRect(p.x + p.w - 20, y + 16, 6, 18);
  };

  // Подвесная корзинка с цветами
  ST.hangPot = function (ctx, p) {
    const y = p.top, cx = p.x + p.w / 2;
    ctx.beginPath();
    ctx.moveTo(p.x + 8, y);
    ctx.lineTo(cx, y - 70);
    ctx.lineTo(p.x + p.w - 8, y);
    ctx.moveTo(cx, y - 70);
    ctx.lineTo(cx, y - 1300);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#6A6A6A';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, y);
    ctx.lineTo(p.x + p.w, y);
    ctx.quadraticCurveTo(p.x + p.w - 10, y + 34, cx, y + 34);
    ctx.quadraticCurveTo(p.x + 10, y + 34, p.x, y);
    ctx.closePath();
    fs(ctx, '#C98D52', '#6A4520', 2.5);
    ctx.beginPath();
    for (let x = p.x + 12; x < p.x + p.w - 6; x += 14) {
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x + 7, y + 26);
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(106,69,32,0.5)';
    ctx.stroke();
    // свисающие листики
    for (const dx of [-0.35, 0.35]) {
      G.ellipse(ctx, cx + dx * p.w, y + 40, 7, 14, dx);
      fs(ctx, '#62C24F', '#2F7A2C', 1.5);
    }
    G.rr(ctx, p.x - 2, y - 3, p.w + 4, 8, 4);
    fs(ctx, '#7CD35A', '#2F7A2C', 1.5);
  };

  // Горшки-ступеньки
  ST.potBlock = function (ctx, p) {
    const h = p.h || 40;
    const bottom = vy1(p.top + h);
    ctx.beginPath();
    ctx.moveTo(p.x + 2, p.top + 10);
    ctx.lineTo(p.x + p.w - 2, p.top + 10);
    ctx.lineTo(p.x + p.w - 8, bottom);
    ctx.lineTo(p.x + 8, bottom);
    ctx.closePath();
    fs(ctx, '#D96C4A', '#8A3A1E', 2.5);
    G.rr(ctx, p.x - 2, p.top - 2, p.w + 4, 14, 4);
    fs(ctx, '#E88A5E', '#8A3A1E', 2.5);
    ctx.fillStyle = '#6E4A2A';
    ctx.fillRect(p.x + 4, p.top - 2, p.w - 8, 4);
  };

  ST.flowerPad = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    const cx = p.x + p.w / 2;
    ctx.beginPath();
    ctx.moveTo(cx, top + h);
    ctx.lineTo(cx, top + 12);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#4CA83A';
    ctx.stroke();
    ctx.save();
    padTransform(ctx, p, top + 10);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      G.ellipse(ctx, cx + Math.cos(a) * (p.w * 0.34), top + 10 + Math.sin(a) * 9, p.w * 0.22, 9, a);
      fs(ctx, '#FFFFFF', '#C9B8D8', 1.5);
    }
    G.ellipse(ctx, cx, top + 10, p.w * 0.22, 9);
    fs(ctx, '#FFD23F', '#D98B00', 2);
    ctx.restore();
  };

  // =========================================================
  // Эльфы и жучки
  // =========================================================
  function capColor(p) {
    return p.color || '#F0433A';
  }
  ST.mushCap = function (ctx, p) {
    const c = capColor(p);
    const x = p.x - 8, w = p.w + 16, y = p.top;
    ctx.beginPath();
    ctx.moveTo(x, y + 20);
    ctx.quadraticCurveTo(x + 4, y - 8, x + w * 0.2, y - 6);
    ctx.lineTo(x + w * 0.8, y - 6);
    ctx.quadraticCurveTo(x + w - 4, y - 8, x + w, y + 20);
    ctx.quadraticCurveTo(x + w / 2, y + 30, x, y + 20);
    ctx.closePath();
    fs(ctx, c, U.shade(c, -0.45), 3);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const n = Math.max(2, Math.floor(p.w / 50));
    for (let k = 0; k < n; k++) {
      G.ellipse(ctx, x + w * (0.15 + (0.7 * k) / Math.max(1, n - 1)), y + 6 + (k % 2) * 6, 7, 4.5);
      ctx.fill();
    }
    if (p.glow) {
      G.glow(ctx, p.x + p.w / 2, y + 10, p.w * 0.7, c, 0.35);
    }
  };
  BK.mushCap = function (ctx, p) {
    if (p.base == null) return;
    const cx = p.x + p.w / 2;
    const sw = Math.min(46, p.w * 0.28);
    const y1 = vy1(p.base + 4);
    ctx.beginPath();
    ctx.moveTo(cx - sw / 2, p.top + 20);
    ctx.quadraticCurveTo(cx - sw * 0.7, (p.top + y1) / 2, cx - sw * 0.8, y1);
    ctx.lineTo(cx + sw * 0.8, y1);
    ctx.quadraticCurveTo(cx + sw * 0.7, (p.top + y1) / 2, cx + sw / 2, p.top + 20);
    ctx.closePath();
    fs(ctx, '#FFF1D6', '#B89A6A', 2.5);
    // «юбочка»
    G.ellipse(ctx, cx, p.top + 44, sw * 0.8, 7);
    fs(ctx, '#FFF8EA', '#B89A6A', 1.5);
    // дверка эльфа, если гриб высокий
    if (y1 - p.top > 170) {
      G.rr(ctx, cx - 11, y1 - 40, 22, 36, 11);
      fs(ctx, '#B06A30', '#5A3210', 2);
      G.circle(ctx, cx + 5, y1 - 22, 2);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
    }
  };
  ST.glowCap = function (ctx, p, t) {
    const c = p.color || '#5AE0FF';
    G.glow(ctx, p.x + p.w / 2, p.top + 6, p.w * 0.75, c, 0.28 + 0.1 * Math.sin(t * 2 + p.x));
    ST.mushCap(ctx, p, t);
  };
  BK.glowCap = BK.mushCap;

  // Божья коровка несёт листик
  function ladybug(ctx, x, y, t, s) {
    const fl = Math.sin(t * 36) * 0.5;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    G.ellipse(ctx, -12, -8, 14, 6 + fl * 4, -0.5);
    ctx.fillStyle = 'rgba(220,240,255,0.8)';
    ctx.fill();
    G.ellipse(ctx, 12, -8, 14, 6 + fl * 4, 0.5);
    ctx.fill();
    G.circle(ctx, 0, 0, 15);
    fs(ctx, '#F0433A', '#7A1414', 2);
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(0, 15);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3A0A0A';
    ctx.stroke();
    ctx.fillStyle = '#2A1010';
    for (const [dx, dy] of [[-7, -4], [7, -4], [-6, 7], [6, 7]]) {
      G.circle(ctx, dx, dy, 3.2);
      ctx.fill();
    }
    G.circle(ctx, 0, -16, 7);
    fs(ctx, '#2A1010');
    G.circle(ctx, -2.5, -17, 1.8);
    ctx.fillStyle = '#fff';
    ctx.fill();
    G.circle(ctx, 2.5, -17, 1.8);
    ctx.fill();
    ctx.restore();
  }
  Art.ladybug = ladybug;
  ST.ladybug = function (ctx, p, t) {
    const y = p.top, cx = p.x + p.w / 2;
    const by = y - 64 + Math.sin(t * 3) * 3;
    ctx.beginPath();
    ctx.moveTo(p.x + 16, y);
    ctx.lineTo(cx, by + 10);
    ctx.lineTo(p.x + p.w - 16, y);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(90,70,30,0.7)';
    ctx.stroke();
    ladybug(ctx, cx, by, t, 1.15);
    leafShape(ctx, p.x - 4, y - 3, p.w + 8, 24, p.night ? '#3FA070' : '#62C24F');
  };
  ST.leafFlat = function (ctx, p) {
    ST.leaf(ctx, Object.assign({}, p, { color: p.color || '#6CC24A' }));
  };
  BK.leafFlat = BK.leaf;
  ST.twig = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    G.rr(ctx, x0, y - 2, x1 - x0, 14, 7);
    fs(ctx, '#A0703F', '#5A3A18', 2.5);
    ctx.fillStyle = 'rgba(255,230,190,0.35)';
    ctx.fillRect(x0 + 6, y, x1 - x0 - 12, 3);
    // сучки и листочки
    for (let x = Math.ceil(x0 / 120) * 120 + 40; x < x1 - 20; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x + 16, y - 16);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      G.ellipse(ctx, x + 22, y - 20, 9, 5, -0.6);
      fs(ctx, '#62C24F', '#2F7A2C', 1.5);
    }
  };
  BK.twig = function (ctx, p) {
    if (p.base == null) return;
    const y1 = vy1(p.base);
    for (const x of [p.x + 12, p.x + p.w - 22]) {
      ctx.beginPath();
      ctx.moveTo(x + 4, p.top + 8);
      ctx.quadraticCurveTo(x - 6, (p.top + y1) / 2, x + 4, y1);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#6CB84A';
      ctx.stroke();
    }
  };
  // Стрекоза несёт листик
  ST.dragonfly = function (ctx, p, t) {
    const y = p.top, cx = p.x + p.w / 2;
    const by = y - 62 + Math.sin(t * 4) * 3;
    ctx.beginPath();
    ctx.moveTo(p.x + 16, y);
    ctx.lineTo(cx, by + 6);
    ctx.lineTo(p.x + p.w - 16, y);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(60,80,90,0.6)';
    ctx.stroke();
    const fl = Math.sin(t * 44) * 0.35;
    ctx.save();
    ctx.translate(cx, by);
    for (const [a, l] of [[-0.25, 38], [0.25, 38], [-0.1, 30], [0.1, 30]]) {
      G.ellipse(ctx, Math.sign(a) * l * 0.55, -6 + (Math.abs(a) < 0.2 ? 8 : 0), l * 0.55, 7 + fl * 5, a);
      ctx.fillStyle = 'rgba(200,240,255,0.7)';
      ctx.fill();
    }
    G.rr(ctx, -34, -4, 50, 8, 4);
    fs(ctx, '#3CC0E0', '#1E6A80', 1.5);
    G.circle(ctx, 20, 0, 8);
    fs(ctx, '#2FA8F0', '#1E6A80', 1.5);
    G.circle(ctx, 23, -3, 2.5);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
    leafShape(ctx, p.x - 4, y - 3, p.w + 8, 24, '#7CD35A');
  };
  ST.pebble = function (ctx, p) {
    const bottom = vy1(p.top + (p.h || 40));
    ctx.beginPath();
    ctx.moveTo(p.x + 4, bottom);
    ctx.lineTo(p.x, p.top + 14);
    ctx.quadraticCurveTo(p.x + 4, p.top - 4, p.x + p.w / 2, p.top - 4);
    ctx.quadraticCurveTo(p.x + p.w - 4, p.top - 4, p.x + p.w, p.top + 14);
    ctx.lineTo(p.x + p.w - 4, bottom);
    ctx.closePath();
    fs(ctx, '#B9B2C9', '#6E6690', 2.5);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    G.ellipse(ctx, p.x + p.w * 0.35, p.top + 6, p.w * 0.2, 4);
    ctx.fill();
  };

  // =========================================================
  // Кухня
  // =========================================================
  ST.kshelf = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    const r = rnd(p, 9);
    // посуда на полке — позади героя
    if (p.w < 900) {
      const n = Math.max(1, Math.floor(p.w / 90));
      for (let k = 0; k < n; k++) {
        const x = p.x + 24 + ((p.w - 48) * (k + 0.5)) / n;
        const kind = Math.floor(r() * 3);
        const c = ['#8FD3FF', '#FF8FB8', '#FFD23F', '#9BE08A'][Math.floor(r() * 4)];
        if (kind === 0) {
          // чашка
          G.rr(ctx, x - 12, y - 22, 24, 22, 6);
          fs(ctx, c, U.shade(c, -0.45), 2);
          ctx.beginPath();
          ctx.arc(x + 14, y - 12, 6, -1.4, 1.4);
          ctx.lineWidth = 3;
          ctx.strokeStyle = U.shade(c, -0.3);
          ctx.stroke();
        } else if (kind === 1) {
          // тарелка стоит
          G.ellipse(ctx, x, y - 22, 8, 22);
          fs(ctx, '#FFFFFF', '#9AA6B8', 2);
          G.ellipse(ctx, x, y - 22, 4, 14);
          ctx.strokeStyle = c;
          ctx.stroke();
        } else {
          // баночка
          G.rr(ctx, x - 11, y - 28, 22, 28, 5);
          fs(ctx, 'rgba(220,240,255,0.8)', '#7A8AA0', 2);
          G.rr(ctx, x - 9, y - 16, 18, 14, 3);
          ctx.fillStyle = c;
          ctx.fill();
          G.rr(ctx, x - 12, y - 32, 24, 7, 3);
          fs(ctx, '#FF5A5A', '#8E2A2A', 1.5);
        }
      }
    }
    G.rr(ctx, x0, y, x1 - x0, 16, 4);
    fs(ctx, '#FFFDF6', '#C9A77A', 2.5);
    // кружевной край
    ctx.beginPath();
    for (let x = Math.ceil(x0 / 16) * 16; x < x1 - 8; x += 16) {
      ctx.moveTo(x, y + 16);
      ctx.arc(x + 8, y + 16, 8, Math.PI, 0, true);
    }
    ctx.fillStyle = '#FFB8D0';
    ctx.fill();
  };
  ST.pan = function (ctx, p) {
    const y = p.top;
    ctx.beginPath();
    ctx.moveTo(p.x + p.w, y + 6);
    ctx.lineTo(p.x + p.w + 60, y + 2);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3A2A1A';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x - 4, y);
    ctx.lineTo(p.x + p.w + 4, y);
    ctx.lineTo(p.x + p.w - 10, y + 22);
    ctx.lineTo(p.x + 10, y + 22);
    ctx.closePath();
    fs(ctx, '#4A5064', '#232634', 3);
    ctx.fillStyle = '#6E7690';
    ctx.fillRect(p.x + 2, y - 2, p.w - 4, 5);
  };
  ST.kpot = function (ctx, p, t) {
    const top = p.top, h = p.h || 46;
    const cx = p.x + p.w / 2;
    // пар
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.8 + k / 3) % 1;
      G.circle(ctx, cx + (k - 1) * 22 + Math.sin(ph * 6 + k) * 6, top - 10 - ph * 60, 8 + ph * 10);
      ctx.fillStyle = 'rgba(255,255,255,' + 0.5 * (1 - ph) + ')';
      ctx.fill();
    }
    ctx.save();
    padTransform(ctx, p, top + h);
    G.rr(ctx, p.x - 12, top + 12, 14, 8, 3);
    fs(ctx, '#3A3F50');
    G.rr(ctx, p.x + p.w - 2, top + 12, 14, 8, 3);
    fs(ctx, '#3A3F50');
    G.rr(ctx, p.x, top + 4, p.w, h - 4, 10);
    fs(ctx, '#C9D3E8', '#5A6378', 3);
    G.ellipse(ctx, cx, top + 6, p.w / 2 - 2, 8);
    fs(ctx, '#FF8A3C', '#B8581A', 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(p.x + 8, top + 16, 8, h - 20);
    ctx.restore();
  };
  // Крышка на облачке пара
  ST.lid = function (ctx, p, t) {
    const y = p.top, cx = p.x + p.w / 2;
    for (let k = 0; k < 4; k++) {
      G.circle(ctx, p.x + 16 + (k * (p.w - 32)) / 3, y + 26 + Math.sin(t * 3 + k) * 3, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(p.x, y + 10);
    ctx.quadraticCurveTo(cx, y - 14, p.x + p.w, y + 10);
    ctx.closePath();
    fs(ctx, '#C9D3E8', '#5A6378', 3);
    G.rr(ctx, cx - 12, y - 12, 24, 10, 5);
    fs(ctx, '#E0533F', '#8E2A2A', 2);
  };
  ST.tray = function (ctx, p) {
    const y = p.top;
    ctx.beginPath();
    ctx.moveTo(p.x + 12, y);
    ctx.lineTo(p.x + 12, y - 1300);
    ctx.moveTo(p.x + p.w - 12, y);
    ctx.lineTo(p.x + p.w - 12, y - 1300);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FF8FB8';
    ctx.stroke();
    G.rr(ctx, p.x, y, p.w, 14, 7);
    fs(ctx, '#E4EAF4', '#7A8AA0', 3);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(p.x + 10, y + 3, p.w - 20, 3);
  };
  ST.jelly = function (ctx, p, t) {
    const top = p.top, h = p.h || 46;
    const cx = p.x + p.w / 2;
    const wob = Math.sin(t * 6 + p.x) * 0.03;
    ctx.save();
    padTransform(ctx, p, top + h);
    ctx.translate(cx, top + h);
    ctx.scale(1 + wob, 1 - wob);
    ctx.translate(-cx, -(top + h));
    G.ellipse(ctx, cx, top + h - 2, p.w / 2 + 10, 8);
    fs(ctx, '#FFFFFF', '#9AA6B8', 2);
    ctx.beginPath();
    ctx.moveTo(p.x, top + h - 4);
    ctx.lineTo(p.x + 8, top + 6);
    ctx.quadraticCurveTo(cx, top - 6, p.x + p.w - 8, top + 6);
    ctx.lineTo(p.x + p.w, top + h - 4);
    ctx.closePath();
    fs(ctx, 'rgba(255,70,110,0.85)', '#A8163E', 2.5);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(p.x + 14, top + 10, 8, h - 20);
    G.circle(ctx, cx, top - 4, 7);
    fs(ctx, '#E8163E', '#8E0A26', 1.5);
    ctx.restore();
  };
  ST.tin = function (ctx, p) {
    const h = p.h || 40;
    const bottom = vy1(p.top + h);
    G.rr(ctx, p.x + 1, p.top + 4, p.w - 2, bottom - p.top - 4, 6);
    const c = p.color || '#FF8FB8';
    fs(ctx, c, U.shade(c, -0.45), 2.5);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let yy = p.top + 16; yy < bottom - 6; yy += 22) {
      G.circle(ctx, p.x + p.w / 2, yy, 4);
      ctx.fill();
    }
    G.rr(ctx, p.x - 3, p.top - 2, p.w + 6, 10, 4);
    fs(ctx, U.shade(c, -0.2), U.shade(c, -0.5), 2);
  };
  ST.cakeTier = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    ctx.fillStyle = '#F5D4A8';
    ctx.fillRect(x0, y + 14, x1 - x0, 26);
    ctx.fillStyle = '#E0533F';
    ctx.fillRect(x0, y + 26, x1 - x0, 5);
    G.rr(ctx, x0, y - 4, x1 - x0, 20, 8);
    fs(ctx, '#FFF6FA', '#E0A0B8', 2);
    // подтёки крема
    ctx.beginPath();
    for (let x = Math.ceil(x0 / 40) * 40; x < x1 - 10; x += 40) {
      const d = 10 + ((x * 13) % 17);
      ctx.moveTo(x, y + 12);
      ctx.lineTo(x, y + 12 + d);
      ctx.arc(x + 8, y + 12 + d, 8, Math.PI, 0, true);
      ctx.lineTo(x + 16, y + 12);
    }
    ctx.fillStyle = '#FFF6FA';
    ctx.fill();
    // вишенки
    for (let x = Math.ceil(x0 / 180) * 180 + 60; x < x1 - 20; x += 180) {
      G.circle(ctx, x, y - 8, 7);
      fs(ctx, '#E8163E', '#8E0A26', 1.5);
    }
  };
  ST.cupcake = function (ctx, p) {
    const y = p.top;
    const c = p.color || '#FF8FB8';
    ctx.beginPath();
    ctx.moveTo(p.x + 8, y + 12);
    ctx.lineTo(p.x + p.w - 8, y + 12);
    ctx.lineTo(p.x + p.w - 22, y + 44);
    ctx.lineTo(p.x + 22, y + 44);
    ctx.closePath();
    fs(ctx, '#F2B26B', '#A0642A', 2.5);
    ctx.beginPath();
    for (let x = p.x + 26; x < p.x + p.w - 20; x += 16) {
      ctx.moveTo(x, y + 14);
      ctx.lineTo(x + 2, y + 42);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(160,100,42,0.5)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, y + 14);
    ctx.quadraticCurveTo(p.x + 4, y - 8, p.x + p.w / 2, y - 8);
    ctx.quadraticCurveTo(p.x + p.w - 4, y - 8, p.x + p.w, y + 14);
    ctx.closePath();
    fs(ctx, c, U.shade(c, -0.4), 2.5);
    const cols = ['#FFD23F', '#4FC3F7', '#81C784', '#FFFFFF'];
    for (let k = 0; k < 8; k++) {
      const sx = p.x + 16 + ((p.w - 32) * k) / 7;
      ctx.fillStyle = cols[k % cols.length];
      ctx.fillRect(sx, y - 2 + ((k * 5) % 7), 7, 3);
    }
  };
  ST.macaron = function (ctx, p) {
    const y = p.top;
    const c = p.color || '#C49BFF';
    G.rr(ctx, p.x, y + 12, p.w, 12, 6);
    fs(ctx, c, U.shade(c, -0.4), 2);
    G.rr(ctx, p.x + 4, y + 6, p.w - 8, 8, 4);
    fs(ctx, '#FFF6FA', '#E0C0D0', 1.5);
    G.rr(ctx, p.x, y - 4, p.w, 13, 6);
    fs(ctx, c, U.shade(c, -0.4), 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(p.x + 14, y - 1, p.w - 28, 3);
  };

  // =========================================================
  // Лес
  // =========================================================
  ST.log = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    G.rr(ctx, x0, y - 4, x1 - x0, 28, 14);
    fs(ctx, '#9A6433', '#5A3515', 3);
    ctx.beginPath();
    for (let x = Math.ceil(x0 / 36) * 36; x < x1 - 10; x += 36) {
      ctx.moveTo(x, y + 2);
      ctx.quadraticCurveTo(x + 10, y + 10, x + 4, y + 18);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(60,30,10,0.4)';
    ctx.stroke();
    // срез
    if (x1 >= p.x + p.w - 1) {
      G.ellipse(ctx, p.x + p.w - 6, y + 10, 8, 14);
      fs(ctx, '#E8C08A', '#5A3515', 2);
      G.ellipse(ctx, p.x + p.w - 6, y + 10, 3, 6);
      ctx.strokeStyle = '#A0703F';
      ctx.stroke();
    }
    // мох
    ctx.fillStyle = '#6CC24A';
    for (let x = Math.ceil(x0 / 90) * 90 + 20; x < x1 - 20; x += 90) {
      G.ellipse(ctx, x, y - 4, 14, 5);
      ctx.fill();
    }
  };
  ST.forestPlat = function (ctx, p) {
    if (p.base != null) {
      // пень: срез наверху
      G.ellipse(ctx, p.x + p.w / 2, p.top + 6, p.w / 2, 13);
      fs(ctx, '#E8C08A', '#7A4A20', 3);
      ctx.beginPath();
      for (const k of [0.3, 0.6]) {
        ctx.moveTo(p.x + p.w / 2 + (p.w / 2) * k, p.top + 6);
        ctx.ellipse(p.x + p.w / 2, p.top + 6, (p.w / 2) * k, 13 * k, 0, 0, TAU);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#B88A5A';
      ctx.stroke();
      return;
    }
    ST.branch(ctx, p);
  };
  BK.forestPlat = function (ctx, p) {
    if (p.base == null) return;
    const y1 = vy1(p.base + 4);
    ctx.beginPath();
    ctx.moveTo(p.x, p.top + 6);
    ctx.lineTo(p.x + 4, y1 - 10);
    ctx.quadraticCurveTo(p.x - 14, y1, p.x - 18, y1);
    ctx.lineTo(p.x + p.w + 18, y1);
    ctx.quadraticCurveTo(p.x + p.w + 14, y1, p.x + p.w - 4, y1 - 10);
    ctx.lineTo(p.x + p.w, p.top + 6);
    ctx.closePath();
    fs(ctx, '#8B5A2B', '#5A3515', 3);
    ctx.beginPath();
    for (let x = p.x + 16; x < p.x + p.w - 10; x += 22) {
      ctx.moveTo(x, p.top + 20);
      ctx.quadraticCurveTo(x + 6, (p.top + y1) / 2, x - 2, y1 - 12);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(60,30,10,0.35)';
    ctx.stroke();
  };
  ST.stumpBlock = function (ctx, p) {
    const bottom = vy1(p.top + (p.h || 40));
    G.rr(ctx, p.x + 3, p.top + 4, p.w - 6, bottom - p.top - 4, 6);
    fs(ctx, '#8B5A2B', '#5A3515', 2.5);
    G.ellipse(ctx, p.x + p.w / 2, p.top + 4, p.w / 2 - 2, 8);
    fs(ctx, '#E8C08A', '#7A4A20', 2);
    G.ellipse(ctx, p.x + p.w / 2, p.top + 4, p.w / 5, 3.5);
    ctx.strokeStyle = '#B88A5A';
    ctx.stroke();
  };

  // =========================================================
  // Парк и стройка
  // =========================================================
  ST.playground = function (ctx, p) {
    const c = p.color || '#FF6B6B';
    G.rr(ctx, p.x, p.top - 2, p.w, 20, 5);
    fs(ctx, c, U.shade(c, -0.45), 3);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(p.x + 4, p.top + 1, p.w - 8, 4);
    ctx.beginPath();
    for (let x = p.x + 24; x < p.x + p.w - 10; x += 24) {
      ctx.moveTo(x, p.top + 6);
      ctx.lineTo(x, p.top + 16);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = U.shade(c, -0.3);
    ctx.stroke();
    // перила
    ctx.beginPath();
    ctx.moveTo(p.x + 6, p.top);
    ctx.lineTo(p.x + 6, p.top - 30);
    ctx.lineTo(p.x + 40, p.top - 30);
    ctx.moveTo(p.x + p.w - 6, p.top);
    ctx.lineTo(p.x + p.w - 6, p.top - 30);
    ctx.lineTo(p.x + p.w - 40, p.top - 30);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FFD54F';
    ctx.stroke();
  };
  BK.playground = function (ctx, p) {
    if (p.base == null) return;
    const y1 = vy1(p.base);
    ctx.fillStyle = '#4FC3F7';
    for (const x of [p.x + 8, p.x + p.w - 20]) {
      G.rr(ctx, x, p.top + 10, 12, y1 - p.top - 10, 4);
      fs(ctx, '#4FC3F7', '#1E6A90', 2);
    }
    // горка с одной стороны
    if (p.base - p.top > 120 && (p.seed || 0) % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(p.x + p.w - 4, p.top + 14);
      ctx.quadraticCurveTo(p.x + p.w + 70, p.top + 40, p.x + p.w + 110, y1 - 6);
      ctx.lineTo(p.x + p.w + 130, y1 - 6);
      ctx.quadraticCurveTo(p.x + p.w + 90, p.top + 20, p.x + p.w - 4, p.top - 4);
      ctx.closePath();
      fs(ctx, '#FFD54F', '#B8860B', 2.5);
    }
  };
  ST.trampoline = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    ctx.fillStyle = '#1E6A90';
    for (const x of [p.x + 6, p.x + p.w / 2 - 3, p.x + p.w - 12]) ctx.fillRect(x, top + 8, 6, h - 8);
    ctx.save();
    padTransform(ctx, p, top + 8);
    G.ellipse(ctx, p.x + p.w / 2, top + 8, p.w / 2 + 6, 12);
    fs(ctx, '#4FC3F7', '#1E6A90', 3);
    G.ellipse(ctx, p.x + p.w / 2, top + 8, p.w / 2 - 6, 7);
    ctx.fillStyle = '#2A2F45';
    ctx.fill();
    ctx.restore();
  };
  ST.scaffold = function (ctx, p) {
    const y = p.top, x0 = vx0(p), x1 = vx1(p);
    // трубы-перила
    ctx.beginPath();
    ctx.moveTo(x0, y - 40);
    ctx.lineTo(x1, y - 40);
    for (let x = Math.ceil(x0 / 160) * 160; x < x1; x += 160) {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 40);
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#8E9AB2';
    ctx.stroke();
    // доски
    for (let x = Math.floor(x0 / 120) * 120; x < x1; x += 120) {
      const a = Math.max(x, x0), b = Math.min(x + 118, x1);
      if (b <= a) continue;
      G.rr(ctx, a, y, b - a, 16, 3);
      fs(ctx, '#E0A868', '#8A5A2B', 2);
    }
    ctx.fillStyle = '#FFB300';
    ctx.fillRect(x0, y + 16, x1 - x0, 6);
    stripes(ctx, x0, y + 16, x1 - x0, 6, 12, '#2E3440');
  };

  // =========================================================
  // Интернет
  // =========================================================
  ST.window = function (ctx, p) {
    const c = p.color || '#4FC3F7';
    const y = p.top;
    const h = 56;
    G.rr(ctx, p.x, y, p.w, h, 10);
    fs(ctx, '#FFFFFF', U.shade(c, -0.45), 3);
    // заголовок окна
    ctx.save();
    G.rr(ctx, p.x, y, p.w, h, 10);
    ctx.clip();
    ctx.fillStyle = c;
    ctx.fillRect(p.x, y, p.w, 16);
    ctx.restore();
    for (let k = 0; k < 3; k++) {
      G.circle(ctx, p.x + 12 + k * 13, y + 8, 4);
      ctx.fillStyle = ['#FF6B6B', '#FFD54F', '#7CD35A'][k];
      ctx.fill();
    }
    // картинка внутри
    const kind = (p.seed || 0) % 3;
    const ix = p.x + 10, iy = y + 22, iw = p.w - 20, ih = h - 28;
    if (kind === 0) {
      ctx.fillStyle = '#BFE6FF';
      ctx.fillRect(ix, iy, iw, ih);
      ctx.beginPath();
      ctx.moveTo(ix, iy + ih);
      ctx.lineTo(ix + iw * 0.35, iy + 6);
      ctx.lineTo(ix + iw * 0.6, iy + ih * 0.6);
      ctx.lineTo(ix + iw * 0.75, iy + ih * 0.35);
      ctx.lineTo(ix + iw, iy + ih);
      ctx.closePath();
      ctx.fillStyle = '#7CD35A';
      ctx.fill();
      G.circle(ctx, ix + iw - 16, iy + 9, 5);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
    } else if (kind === 1) {
      ctx.fillStyle = '#FFE3F0';
      ctx.fillRect(ix, iy, iw, ih);
      for (let k = 0; k < Math.floor(iw / 40); k++) {
        G.heartPath(ctx, ix + 20 + k * 40, iy + ih / 2 + 2, 7);
        ctx.fillStyle = '#FF4F9A';
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#E8E0FF';
      ctx.fillRect(ix, iy, iw, ih);
      ctx.fillStyle = '#B983FF';
      for (let k = 0; k < 3; k++) ctx.fillRect(ix + 8, iy + 5 + k * 8, (iw - 16) * (0.9 - k * 0.2), 4);
    }
  };
  ST.pixelBlock = function (ctx, p) {
    const c = p.color || '#E0533F';
    const s = 40;
    const h = p.kind === 'block' ? p.h || 40 : 40;
    const bottom = vy1(p.top + h);
    const x0 = vx0(p), x1 = vx1(p);
    for (let yy = p.top; yy < bottom - 2; yy += s) {
      for (let x = p.x; x < p.x + p.w - 2; x += s) {
        if (x + s < x0 || x > x1) continue;
        const w = Math.min(s, p.x + p.w - x), hh = Math.min(s, bottom - yy);
        ctx.fillStyle = c;
        ctx.fillRect(x, yy, w, hh);
        ctx.fillStyle = U.shade(c, 0.35);
        ctx.fillRect(x, yy, w, 6);
        ctx.fillRect(x, yy, 6, hh);
        ctx.fillStyle = U.shade(c, -0.35);
        ctx.fillRect(x, yy + hh - 6, w, 6);
        ctx.fillRect(x + w - 6, yy, 6, hh);
      }
    }
  };
  BK.pixelBlock = function (ctx, p) {
    if (p.base == null || p.kind === 'block') return;
    const c = U.shade(p.color || '#E0533F', -0.25);
    const x = p.x + p.w / 2 - 20;
    const bottom = vy1(p.base);
    for (let yy = p.top + 40; yy < bottom - 2; yy += 40) {
      ctx.fillStyle = c;
      ctx.fillRect(x, yy, 40, Math.min(40, bottom - yy));
      ctx.fillStyle = U.shade(c, -0.3);
      ctx.fillRect(x + 34, yy, 6, Math.min(40, bottom - yy));
    }
  };
  ST.smiley = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    const cx = p.x + p.w / 2;
    ctx.save();
    padTransform(ctx, p, top + h);
    const r = Math.min(p.w / 2, h);
    G.ellipse(ctx, cx, top + h - r * 0.72, r * 0.95, r * 0.72);
    fs(ctx, '#FFD23F', '#D98B00', 3);
    G.circle(ctx, cx - r * 0.3, top + h - r * 0.85, r * 0.1);
    ctx.fillStyle = '#5A3A00';
    ctx.fill();
    G.circle(ctx, cx + r * 0.3, top + h - r * 0.85, r * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, top + h - r * 0.72, r * 0.42, 0.3, Math.PI - 0.3);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5A3A00';
    ctx.stroke();
    ctx.restore();
  };
  ST.pixelSpring = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    const sq = squash(p);
    const py = top + sq * 24;
    ctx.fillStyle = '#9AA6B8';
    for (let yy = py + 14; yy < top + h - 8; yy += 10) ctx.fillRect(p.x + 22 + ((yy / 10) % 2) * 20, yy, p.w - 64, 6);
    ctx.fillStyle = '#5A6378';
    ctx.fillRect(p.x + 10, top + h - 8, p.w - 20, 8);
    ctx.fillStyle = '#FF5A5A';
    ctx.fillRect(p.x, py, p.w, 14);
    ctx.fillStyle = '#FF9A9A';
    ctx.fillRect(p.x, py, p.w, 4);
  };
  ST.pixelMover = function (ctx, p) {
    ST.pixelBlock(ctx, Object.assign({}, p, { kind: 'plat', color: '#FFB300' }));
    ctx.fillStyle = '#fff';
    ctx.fillRect(p.x + p.w / 2 - 6, p.top + 12, 12, 12);
  };
  ST.loadBar = function (ctx, p, t) {
    const y = p.top;
    G.rr(ctx, p.x, y, p.w, 24, 12);
    fs(ctx, '#FFFFFF', '#5A4FCF', 3);
    const k = (t * 0.35 + (p.seed || 0) * 0.1) % 1;
    ctx.save();
    G.rr(ctx, p.x + 4, y + 4, p.w - 8, 16, 8);
    ctx.clip();
    ctx.fillStyle = '#7CD35A';
    ctx.fillRect(p.x + 4, y + 4, (p.w - 8) * k, 16);
    stripes(ctx, p.x + 4, y + 4, (p.w - 8) * k, 16, 8, 'rgba(255,255,255,0.35)');
    ctx.restore();
  };
  ST.rack = function (ctx, p, t) {
    const y = p.top;
    G.rr(ctx, p.x, y, p.w, 30, 4);
    fs(ctx, '#3A4670', '#1B2440', 2.5);
    for (let x = p.x + 10; x < p.x + p.w - 14; x += 18) {
      const on = Math.sin(t * 3 + x * 0.7) > -0.2;
      G.circle(ctx, x, y + 15, 3);
      ctx.fillStyle = on ? ['#7CFFB0', '#4FD1FF', '#FFD23F'][Math.floor(x / 18) % 3] : '#2A3558';
      ctx.fill();
    }
    ctx.fillStyle = '#5FE0FF';
    ctx.fillRect(p.x + 2, y - 2, p.w - 4, 4);
  };
  BK.rack = function (ctx, p) {
    if (p.base == null) return;
    const y1 = vy1(p.base);
    G.rr(ctx, p.x + 10, p.top + 30, p.w - 20, y1 - p.top - 30, 4);
    fs(ctx, '#27305A', '#1B2440', 2);
    ctx.fillStyle = '#33407A';
    for (let yy = p.top + 40; yy < y1 - 12; yy += 26) ctx.fillRect(p.x + 18, yy, p.w - 36, 16);
  };
  ST.dataLift = function (ctx, p, t) {
    const y = p.top, cx = p.x + p.w / 2;
    G.glow(ctx, cx, y + 12, p.w * 0.8, '#5FE0FF', 0.45 + 0.15 * Math.sin(t * 5));
    G.ellipse(ctx, cx, y + 8, p.w / 2 + 4, 14);
    fs(ctx, '#BFF6FF', '#2FA8C8', 3);
    G.ellipse(ctx, cx, y + 6, p.w / 2 - 12, 7);
    ctx.fillStyle = '#5FE0FF';
    ctx.fill();
  };

  // =========================================================
  // Волшебная школа: ещё немножко
  // =========================================================
  ST.bookStack = function (ctx, p) {
    const h = p.h || 40;
    const bottom = vy1(p.top + h);
    const cols = ['#E0533F', '#3F8FE0', '#2FBF55', '#B983FF', '#FFB347'];
    let i = (p.seed || 0) % 5;
    for (let yy = p.top; yy < bottom - 2; yy += 20, i++) {
      const inset = ((i * 7) % 3) * 3;
      G.rr(ctx, p.x + inset, yy, p.w - inset * 2, Math.min(20, bottom - yy), 3);
      fs(ctx, cols[i % 5], U.shade(cols[i % 5], -0.45), 2);
      ctx.fillStyle = '#FFF4D6';
      ctx.fillRect(p.x + p.w - inset - 8, yy + 4, 5, 12);
    }
  };
  ST.cushion = function (ctx, p) {
    const top = p.top, h = p.h || 46;
    ctx.save();
    padTransform(ctx, p, top + h);
    G.rr(ctx, p.x - 6, top + 4, p.w + 12, h - 4, 18);
    fs(ctx, '#B983FF', '#5B3FB8', 3);
    ctx.fillStyle = '#FFD23F';
    for (const [dx, dy] of [[0.25, 0.4], [0.75, 0.4], [0.5, 0.7]]) {
      G.starPath(ctx, p.x + p.w * dx, top + h * dy + 4, 7, 3);
      ctx.fill();
    }
    ctx.restore();
  };
  ST.stoneBlock = function (ctx, p) {
    const h = p.h || 40;
    const bottom = vy1(p.top + h);
    G.rr(ctx, p.x + 1, p.top, p.w - 2, bottom - p.top, 5);
    fs(ctx, '#9C92C6', '#5E547A', 2.5);
    ctx.beginPath();
    for (let yy = p.top + 22; yy < bottom - 4; yy += 22) {
      ctx.moveTo(p.x + 3, yy);
      ctx.lineTo(p.x + p.w - 3, yy);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(70,60,110,0.45)';
    ctx.stroke();
    ctx.fillStyle = '#BDB3DD';
    ctx.fillRect(p.x + 3, p.top + 2, p.w - 6, 5);
  };

  // =========================================================
  // Лестницы особого вида
  // =========================================================
  const LC = Art.ladderColors;
  LC.web = { rail: '#F2F2FF', rung: '#E0E0F5', line: '#9A9AC0' };
  LC.bamboo = { rail: '#B8C95A', rung: '#D8E07A', line: '#6E7A2A' };

  // Лиана с листочками
  LS.vine = function (ctx, l, t) {
    const top = l.top - 14, bot = l.bottom;
    ctx.beginPath();
    for (const rx of [l.x - 20, l.x + 20]) {
      ctx.moveTo(rx, top);
      for (let y = top; y <= bot; y += 20) ctx.lineTo(rx + Math.sin(y * 0.05 + rx) * 3, y);
    }
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3E8E36';
    ctx.stroke();
    ctx.beginPath();
    for (let y = bot - 18; y > top + 6; y -= 30) {
      ctx.moveTo(l.x - 20, y);
      ctx.quadraticCurveTo(l.x, y + 5, l.x + 20, y);
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#5BAE3E';
    ctx.stroke();
    for (let y = top + 20; y < bot; y += 56) {
      G.ellipse(ctx, l.x - 30, y, 11, 6, 0.6);
      fs(ctx, '#62C24F', '#2F7A2C', 1.5);
      G.ellipse(ctx, l.x + 30, y + 28, 11, 6, -0.6);
      fs(ctx, '#7CD35A', '#2F7A2C', 1.5);
    }
    void t;
  };
  // Леденцовая лестница
  LS.candy = function (ctx, l) {
    const top = l.top - 14, bot = l.bottom;
    for (let y = bot - 18; y > top + 6; y -= 30) {
      G.rr(ctx, l.x - 20, y - 4, 40, 8, 4);
      fs(ctx, '#FFF6FA', '#E0A0B8', 1.5);
    }
    for (const rx of [l.x - 24, l.x + 16]) {
      G.rr(ctx, rx, top, 8, bot - top, 4);
      fs(ctx, '#FFFFFF', '#C2185B', 2);
      ctx.save();
      G.rr(ctx, rx, top, 8, bot - top, 4);
      ctx.clip();
      ctx.beginPath();
      for (let y = top; y < bot; y += 18) {
        ctx.moveTo(rx, y);
        ctx.lineTo(rx + 8, y - 8);
        ctx.lineTo(rx + 8, y - 2);
        ctx.lineTo(rx, y + 6);
        ctx.closePath();
      }
      ctx.fillStyle = '#FF3A6A';
      ctx.fill();
      ctx.restore();
    }
  };
  // Лестница из проводов
  LS.cable = function (ctx, l) {
    const top = l.top - 14, bot = l.bottom;
    ctx.beginPath();
    for (let y = bot - 18; y > top + 6; y -= 30) {
      ctx.moveTo(l.x - 20, y);
      ctx.lineTo(l.x + 20, y);
    }
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4FD1FF';
    ctx.stroke();
    const cols = ['#FF6FA8', '#7CFFB0'];
    [l.x - 22, l.x + 22].forEach((rx, i) => {
      ctx.beginPath();
      ctx.moveTo(rx, top);
      ctx.lineTo(rx, bot);
      ctx.lineWidth = 7;
      ctx.strokeStyle = cols[i];
      ctx.stroke();
    });
  };
  // Пиксельная лестница
  LS.pixel = function (ctx, l) {
    const top = l.top - 14, bot = l.bottom;
    const cols = ['#FF6FA8', '#FFB300', '#FFD54F', '#7CD35A', '#4FC3F7', '#9A55E8'];
    let i = 0;
    for (let y = bot - 18; y > top + 4; y -= 30, i++) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.fillRect(l.x - 20, y - 5, 40, 10);
    }
    ctx.fillStyle = '#5A4FCF';
    ctx.fillRect(l.x - 26, top, 8, bot - top);
    ctx.fillRect(l.x + 18, top, 8, bot - top);
  };
})(window.VW);
