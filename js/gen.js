/* Vasilisa World — генератор сцен для новых миров и новых кругов.
   Сцена собирается из «фигур»: ступеньки, лестница на мостик, батут, ездящий мостик,
   лифт, «ёлочка» вокруг ствола, кубики. Для каждой фигуры известно, как её пройти,
   поэтому сцена всегда проходима. Путь героя записывается в L.route — по нему
   автоматическая проверка проходит сцену от начала до последней находки. */
(function (VW) {
  'use strict';

  const U = VW.U;
  const Gen = (VW.Gen = {});

  const GROUND_DEPTH = 420; // толщина земли под нижним краем

  // ---------- сложность круга ----------
  Gen.difficulty = function (round) {
    const r = Math.max(1, round | 0);
    const k = Math.min(1, (r - 1) / 4); // 0 на первом круге, 1 — с пятого
    return {
      round: r,
      k: k,
      rise: U.lerp(100, 124, k), // подъём одного прыжка
      gap: U.lerp(70, 130, k), // промежуток между площадками
      platW: U.lerp(210, 160, k), // ширина площадок
      features: Math.min(3 + Math.floor((r - 1) * 0.8), 7),
      storeys: Math.min(3 + Math.floor((r - 1) / 2), 6),
      movers: r === 1 ? 0.3 : Math.min(0.9, 0.45 + 0.1 * (r - 2)),
      coins: 1 + 0.12 * Math.min(r - 1, 6),
    };
  };

  // ---------- сборщик ----------
  function Builder(seed, d) {
    this.r = U.rng(seed);
    this.d = d;
    this.platforms = [];
    this.ladders = [];
    this.coins = [];
    this.water = [];
    this.route = [];
    this.feats = [];
    this.columns = []; // стволы и опоры для фона
    this.holes = []; // дыры в земле (пруды)
  }
  const BP = Builder.prototype;
  BP.f = function (a, b) {
    return a + this.r() * (b - a);
  };
  BP.i = function (a, b) {
    return Math.floor(a + this.r() * (b - a + 1));
  };
  BP.chance = function (p) {
    return this.r() < p;
  };
  BP.pick = function (arr) {
    return arr[Math.floor(this.r() * arr.length)];
  };
  BP.weighted = function (w) {
    let sum = 0;
    for (const k of Object.keys(w)) sum += Math.max(0, w[k]);
    let x = this.r() * sum;
    for (const k of Object.keys(w)) {
      x -= Math.max(0, w[k]);
      if (x <= 0 && w[k] > 0) return k;
    }
    return Object.keys(w)[0];
  };
  BP.plat = function (x, y, w, kind, extra) {
    const p = { x: Math.round(x), y: Math.round(y), w: Math.round(w), kind: kind };
    if (extra) Object.assign(p, extra);
    this.platforms.push(p);
    return p;
  };
  BP.ladder = function (x, top, bottom) {
    const l = { x: Math.round(x), top: Math.round(top), bottom: Math.round(bottom) };
    this.ladders.push(l);
    return l;
  };
  BP.coin = function (x, y) {
    this.coins.push([Math.round(x), Math.round(y)]);
  };
  // монетки над площадкой (n штук, отступ от краёв)
  BP.coinsOn = function (p, n, margin) {
    margin = margin == null ? 36 : margin;
    const span = p.w - margin * 2;
    n = Math.min(n, Math.floor(span / 52) + 1);
    for (let k = 0; k < n; k++) {
      const x = n === 1 ? p.x + p.w / 2 : p.x + margin + (span * k) / (n - 1);
      this.coin(x, p.y - 50);
    }
  };
  BP.coinsLadder = function (l) {
    for (let y = l.bottom - 120; y > l.top + 50; y -= 100) this.coin(l.x, y);
  };
  // ряд монеток над землёй/полом
  BP.coinRow = function (x0, x1, y, step) {
    step = step || 64;
    const n = Math.max(1, Math.floor((x1 - x0) / step));
    for (let k = 0; k <= n; k++) this.coin(U.lerp(x0, x1, n ? k / n : 0.5), y - 50);
  };
  BP.go = function (step) {
    this.route.push(step);
  };

  // ---------- фигуры для «широких» сцен (земля — y = 0, вверх — минус) ----------
  const F = {};

  // Ступеньки-прыжки: площадки поднимаются вправо (или влево)
  F.stairs = function (b, x0) {
    const d = b.d;
    const n = b.i(3, 4 + (d.round > 2 ? 1 : 0));
    const left = b.chance(0.35); // вершина слева — тогда поднимаемся справа налево
    const ws = [], rises = [], gaps = [];
    for (let k = 0; k < n; k++) {
      ws.push(k === n - 1 ? Math.max(210, b.f(d.platW, d.platW * 1.2)) : b.f(d.platW * 0.85, d.platW * 1.15));
      rises.push(b.f(d.rise * 0.72, d.rise));
      gaps.push(k === 0 ? 0 : b.f(d.gap * 0.45, d.gap));
    }
    let total = 0;
    for (let k = 0; k < n; k++) total += ws[k] + gaps[k];
    const plats = [];
    let y = 0;
    let cur = left ? x0 + total : x0; // край, от которого строим
    for (let k = 0; k < n; k++) {
      y -= rises[k];
      let px;
      if (!left) {
        px = cur + gaps[k];
        cur = px + ws[k];
      } else {
        px = cur - gaps[k] - ws[k];
        cur = px;
      }
      const last = k === n - 1;
      const p = b.plat(px, y, ws[k], last ? 'top' : 'plat');
      const prev = plats[k - 1];
      if (!prev) {
        if (!left) b.go({ a: 'jump', from: px - 40, to: { x: px + 60, y: y }, on: p });
        else b.go({ a: 'jump', from: px + p.w + 40, to: { x: px + p.w - 60, y: y }, on: p });
      } else if (!left) {
        b.go({ a: 'jump', from: prev.x + prev.w - 16, to: { x: px + Math.min(70, p.w / 2), y: y }, on: p });
        if (gaps[k] > 70 && b.chance(0.6)) b.coin(prev.x + prev.w + gaps[k] / 2, Math.min(prev.y, y) - 150);
      } else {
        b.go({ a: 'jump', from: prev.x + 16, to: { x: px + p.w - Math.min(70, p.w / 2), y: y }, on: p });
        if (gaps[k] > 70 && b.chance(0.6)) b.coin(prev.x - gaps[k] / 2, Math.min(prev.y, y) - 150);
      }
      if (!last) b.coinsOn(p, 2);
      plats.push(p);
    }
    const top = plats[n - 1];
    const slot = { x: top.x + top.w / 2, y: top.y };
    // «левые» ступеньки проходим, зайдя справа
    if (left) b.route.splice(b.route.length - n, 0, { a: 'walk', x: x0 + total + 80 });
    b.go({ a: 'walk', x: slot.x });
    return { x1: x0 + total, slot: slot, top: top, kind: 'stairs' };
  };

  // Лестница на мостик, иногда — ещё одна наверх
  F.ladder = function (b, x0) {
    const d = b.d;
    const lx = x0 + 70;
    const h1 = b.f(270, 390);
    const walk = b.plat(lx - 70, -h1, b.f(320, 500), 'walk');
    const l1 = b.ladder(lx, -h1, 0);
    b.coinsLadder(l1);
    b.go({ a: 'climb', x: lx, top: -h1 });
    let top = walk;
    let x1 = walk.x + walk.w;
    if (b.chance(0.3 + d.k * 0.45)) {
      const lx2 = walk.x + walk.w - b.f(70, 110);
      const h2 = b.f(220, 300);
      const tw = b.f(210, 280);
      const t2 = b.plat(lx2 - tw * 0.35, walk.y - h2, tw, 'top');
      const l2 = b.ladder(lx2, t2.y, walk.y);
      b.coinRow(lx + 70, lx2 - 60, walk.y, 70);
      b.go({ a: 'walk', x: lx2 });
      b.go({ a: 'climb', x: lx2, top: t2.y });
      b.coinsLadder(l2);
      top = t2;
      x1 = Math.max(x1, t2.x + t2.w);
    } else {
      walk.kind = 'top';
      b.coinRow(lx + 70, walk.x + walk.w - 150, walk.y, 70);
    }
    const slot = { x: top.x + top.w - 70, y: top.y };
    b.go({ a: 'walk', x: slot.x });
    return { x1: x1, slot: slot, top: top, kind: 'ladder' };
  };

  // Батут подбрасывает на высокий уступ
  F.bounce = function (b, x0) {
    const pw = 106;
    const px = x0 + 40;
    const pad = b.plat(px, -46, pw, 'pad', { h: 46, bounce: true });
    const h = b.f(300, 380);
    const ledge = b.plat(px - 30, -h, b.f(300, 360), 'top');
    // скорость ровно такая, чтобы подняться чуть выше уступа
    pad.bounceV = Math.round(Math.sqrt(2 * 2500 * (h - 46 + 90)));
    for (let y = -46 - 120; y > -h + 30; y -= 95) b.coin(px + pw / 2, y);
    b.go({ a: 'bounce', x: px + pw / 2, to: { x: ledge.x + ledge.w / 2, y: ledge.y }, on: ledge });
    const slot = { x: ledge.x + ledge.w - 70, y: ledge.y };
    b.go({ a: 'walk', x: slot.x });
    return { x1: ledge.x + ledge.w, slot: slot, top: ledge, kind: 'bounce' };
  };

  // Ездящий мостик между двумя площадками
  F.mover = function (b, x0) {
    const d = b.d;
    const h = b.f(250, 320);
    const A = b.plat(x0, -h, b.f(180, 220), 'plat');
    const lx = x0 + 60;
    b.coinsLadder(b.ladder(lx, -h, 0));
    b.go({ a: 'climb', x: lx, top: -h });
    const gap = b.f(230, 290 + 110 * d.k);
    const mw = 150;
    const B = b.plat(A.x + A.w + gap, -h, b.f(230, 290), 'top');
    const ax = gap / 2 - mw / 2 + 26;
    const period = U.lerp(5.6, 4.4, d.k);
    const M = b.plat(A.x + A.w + gap / 2 - mw / 2, -h, mw, 'mover', { move: { ax: ax, period: period, phase: b.f(0, period) } });
    for (let k = 1; k <= 3; k++) b.coin(A.x + A.w + (gap * k) / 4, -h - 56);
    b.go({ a: 'ride', m: M, board: A.x + A.w - 26, fromEdge: A.x + A.w, toEdge: B.x, dest: { x: B.x + 80, y: B.y }, on: B });
    const slot = { x: B.x + B.w - 70, y: B.y };
    b.go({ a: 'walk', x: slot.x });
    return { x1: B.x + B.w, slot: slot, top: B, kind: 'mover' };
  };

  // Лифт у высокого уступа
  F.lift = function (b, x0) {
    const d = b.d;
    const h = b.f(300, 400);
    const mw = 130;
    const low = -40, high = -h - 6;
    const period = U.lerp(6, 4.8, d.k);
    const M = b.plat(x0 + 40, (low + high) / 2, mw, 'lift', { move: { ay: (low - high) / 2, period: period, phase: b.f(0, period) } });
    const T = b.plat(M.x + mw + 8, -h, b.f(270, 340), 'top');
    for (let y = low - 110; y > high + 20; y -= 95) b.coin(M.x + mw / 2, y - 40);
    b.go({ a: 'lift', m: M, wait: M.x - 34, low: low, high: high, dest: { x: T.x + 80, y: T.y }, on: T });
    const slot = { x: T.x + T.w - 70, y: T.y };
    b.go({ a: 'walk', x: slot.x });
    return { x1: T.x + T.w, slot: slot, top: T, kind: 'lift' };
  };

  // «Ёлочка»: площадки по очереди слева и справа от ствола
  F.column = function (b, x0) {
    const d = b.d;
    const n = b.i(4, 5 + Math.round(d.k * 2));
    const w = b.f(180, 215);
    const cx = x0 + w + 12;
    let y = 0, side = -1, prev = null;
    for (let k = 0; k < n; k++) {
      y -= b.f(d.rise * 0.8, d.rise);
      const px = side < 0 ? cx - 12 - w : cx + 12;
      const p = b.plat(px, y, w, 'plat');
      if (!prev) b.go({ a: 'jump', from: px - 40, to: { x: px + w / 2, y: y }, on: p });
      else if (side > 0) b.go({ a: 'jump', from: prev.x + prev.w - 16, to: { x: px + 70, y: y }, on: p });
      else b.go({ a: 'jump', from: prev.x + 16, to: { x: px + w - 70, y: y }, on: p });
      b.coinsOn(p, 2);
      prev = p;
      side = -side;
    }
    y -= b.f(d.rise * 0.8, d.rise);
    const top = b.plat(cx - 120, y, 240, 'top');
    // side — сторона, куда прыгаем: к вершине над стволом
    if (side > 0) b.go({ a: 'jump', from: prev.x + prev.w - 16, to: { x: cx, y: y }, on: top });
    else b.go({ a: 'jump', from: prev.x + 16, to: { x: cx, y: y }, on: top });
    b.columns.push({ x: cx, top: y, bottom: 0 });
    const slot = { x: cx, y: y };
    b.go({ a: 'walk', x: slot.x });
    return { x1: cx + 12 + w, slot: slot, top: top, kind: 'column' };
  };

  // Кубики-ступени: наверх пешком, без прыжков
  F.blocks = function (b, x0) {
    const n = b.i(3, 5);
    let y = 0, x = x0;
    for (let k = 0; k < n; k++) {
      y -= b.f(34, 44);
      const w = b.f(72, 100);
      b.plat(x, y, w, 'block', { h: -y });
      x += w;
    }
    const top = b.plat(x, y - b.f(20, 36), b.f(180, 230), 'top', { h: 0 });
    top.h = -top.y;
    x += top.w;
    const m = b.i(1, 2);
    let yy = top.y;
    for (let k = 0; k < m; k++) {
      yy = yy * (1 - 1 / (m - k + 1));
      const w = b.f(70, 90);
      b.plat(x, yy, w, 'block', { h: -yy });
      x += w;
    }
    const slot = { x: top.x + top.w / 2, y: top.y };
    b.go({ a: 'walk', x: slot.x });
    return { x1: x, slot: slot, top: top, kind: 'blocks' };
  };

  // Пруд с камушками (идём прямо по воде — она неглубокая)
  BP.pool = function (x0, w) {
    this.holes.push([x0, x0 + w]);
    this.water.push({ x: x0, y: 12, w: w, h: GROUND_DEPTH });
    // дно чуть шире пруда — под берегами, чтобы у края нельзя было «провалиться» в землю
    this.plat(x0 - 40, 50, w + 80, 'hidden', { h: GROUND_DEPTH - 50 });
    const n = Math.max(1, Math.floor((w - 40) / 120));
    for (let k = 0; k < n; k++) {
      const x = x0 + ((k + 0.5) * w) / n;
      this.plat(x - 30, -6, 60, 'stone', { h: 20 });
      this.coin(x, -60);
    }
  };

  // ---------- «широкая» сцена ----------
  function buildWide(b, theme) {
    const d = b.d;
    const weights = Object.assign({ stairs: 3, ladder: 2, bounce: 2, mover: 1, lift: 1, column: 1, blocks: 1 }, theme.features || {});
    const n = Math.max(2, d.features + (b.chance(0.4) ? 1 : 0));
    b.spawn = [160, 0];
    b.coinRow(300, 420, 0, 60);
    let x = 520;
    let lastKind = null, movers = 0;
    for (let k = 0; k < n; k++) {
      const w = Object.assign({}, weights);
      if (lastKind) w[lastKind] *= 0.25;
      const moverOk = b.chance(d.movers) && movers < 1 + Math.floor(d.round / 2);
      if (!moverOk) {
        w.mover = 0;
        w.lift = 0;
      }
      const kind = b.weighted(w);
      if (kind === 'mover' || kind === 'lift') movers++;
      const res = F[kind](b, x);
      res.x0 = x;
      res.routeEnd = b.route.length;
      b.feats.push(res);
      lastKind = kind;
      if (k < n - 1) {
        b.go({ a: 'drop', x: res.x1 + 40, y: 0 });
        let sx = res.x1 + b.f(90, 130);
        if (theme.water && b.chance(0.35)) {
          const pw = b.f(260, 380);
          b.pool(sx, pw);
          sx += pw + 70;
        } else {
          b.coinRow(sx, sx + b.f(100, 160), 0, 60);
          sx += 170;
        }
        x = sx + b.f(60, 140);
      } else x = res.x1;
    }
    b.W = Math.round(x + b.f(260, 360));
    // земля (с дырами для прудов)
    const holes = b.holes.slice().sort((a, c) => a[0] - c[0]);
    let gx = 0;
    for (const [h0, h1] of holes) {
      if (h0 > gx) b.plat(gx, 0, h0 - gx, 'ground', { h: GROUND_DEPTH });
      gx = h1;
    }
    if (gx < b.W) b.plat(gx, 0, b.W - gx, 'ground', { h: GROUND_DEPTH });
    b.floorYs = [0];
  }

  // ---------- «высокая» сцена: этажи один над другим ----------
  function buildTall(b, theme) {
    const d = b.d;
    const N = d.storeys;
    const W = Math.round(b.f(1500, 1750) + 90 * (N - 3));
    b.W = W;
    const FX0 = 70, FX1 = W - 70;
    const types = Object.assign({ ladder: 3, stairs: 2, lift: 1, bounce: 1 }, theme.connect || {});
    let side = b.chance(0.5) ? 1 : -1; // где подъём на следующий этаж: 1 — справа
    b.spawn = [side > 0 ? 150 : W - 150, 0];
    b.floorYs = [0];
    let y = 0;
    let lastType = null;
    const floors = [];
    for (let k = 0; k < N; k++) {
      const S = Math.round(b.f(420, 470));
      const ny = y - S;
      const cx = side > 0 ? W - b.f(340, 420) : b.f(340, 420);
      const w = Object.assign({}, types);
      if (lastType) w[lastType] *= 0.35;
      if (!b.chance(d.movers)) w.lift = 0;
      const type = b.weighted(w);
      lastType = type;
      const inX = k === 0 ? b.spawn[0] : floors[k - 1].arrive;
      const startIdx = b.route.length;
      // монетки вдоль этажа — от места прихода до подъёма
      const a0 = Math.min(inX, cx) + 90, a1 = Math.max(inX, cx) - 90;
      if (a1 - a0 > 120) b.coinRow(a0, a1, y, 90);
      // пол следующего этажа (у лифта — с отверстием)
      let hole = null;
      if (type === 'lift') hole = [cx - 80, cx + 80];
      if (hole) {
        b.plat(FX0, ny, hole[0] - FX0, 'floor', { h: 34 });
        b.plat(hole[1], ny, FX1 - hole[1], 'floor', { h: 34 });
      } else b.plat(FX0, ny, FX1 - FX0, 'floor', { h: 34 });
      b.floorYs.push(ny);
      let arrive;
      if (type === 'ladder') {
        const l = b.ladder(cx, ny, y);
        b.coinsLadder(l);
        b.go({ a: 'climb', x: cx, top: ny });
        arrive = cx;
      } else if (type === 'bounce') {
        const pad = b.plat(cx - 53, y - 46, 106, 'pad', { h: 46, bounce: true });
        pad.bounceV = Math.round(Math.sqrt(2 * 2500 * (S - 46 + 100)));
        for (let yy = y - 170; yy > ny + 40; yy -= 100) b.coin(cx, yy);
        arrive = cx - side * 130;
        b.go({ a: 'bounce', x: cx, to: { x: arrive, y: ny } });
      } else if (type === 'lift') {
        const mw = 130;
        const low = y - 40, high = ny - 6;
        const period = U.lerp(6, 4.8, d.k);
        const M = b.plat(cx - mw / 2, (low + high) / 2, mw, 'lift', { move: { ay: (low - high) / 2, period: period, phase: b.f(0, period) } });
        for (let yy = low - 110; yy > high + 30; yy -= 100) b.coin(cx, yy - 40);
        arrive = cx - side * 170;
        b.go({ a: 'lift', m: M, wait: cx - side * (mw / 2 + 36), low: low, high: high, dest: { x: arrive, y: ny } });
      } else {
        // ступеньки: 3 прыжка по площадкам и четвёртый — на пол этажа
        const steps = 3;
        const rise = S / (steps + 1);
        const pw = b.f(160, 190);
        let prev = null;
        let px = cx - pw / 2;
        for (let s = 0; s < steps; s++) {
          const py = y - rise * (s + 1);
          if (s > 0) px -= side * (pw + b.f(30, 60));
          const p = b.plat(px, py, pw, 'plat');
          if (!prev) b.go({ a: 'jump', from: side > 0 ? px - 40 : px + pw + 40, to: { x: px + pw / 2, y: py }, on: p });
          else if (side > 0) b.go({ a: 'jump', from: prev.x + 16, to: { x: px + pw - 60, y: py }, on: p });
          else b.go({ a: 'jump', from: prev.x + prev.w - 16, to: { x: px + 60, y: py }, on: p });
          b.coinsOn(p, 2);
          prev = p;
        }
        arrive = side > 0 ? prev.x - 110 : prev.x + prev.w + 110;
        if (side > 0) b.go({ a: 'jump', from: prev.x + 16, to: { x: arrive, y: ny } });
        else b.go({ a: 'jump', from: prev.x + prev.w - 16, to: { x: arrive, y: ny } });
      }
      if (b.route[startIdx]) b.route[startIdx].floorFrom = k;
      floors.push({ y: ny, arrive: arrive, side: side, from: y, type: type, cx: cx });
      y = ny;
      side = -side;
    }
    b.floors = floors;
    // вершина: площадка над крышей в стороне от места прихода
    const lastF = floors[N - 1];
    const topSide = -lastF.side; // идём от места прихода в противоположную сторону
    const sx = topSide > 0 ? W - b.f(260, 340) : b.f(260, 340);
    const a0 = Math.min(lastF.arrive, sx) + 90, a1 = Math.max(lastF.arrive, sx) - 90;
    if (a1 - a0 > 120) b.coinRow(a0, a1, y, 90);
    const summit = b.plat(sx - 120, y - b.f(100, 115), 240, 'top');
    b.go({ a: 'jump', from: topSide > 0 ? summit.x - 40 : summit.x + summit.w + 40, to: { x: summit.x + 120, y: summit.y }, on: summit });
    b.columns.push({ x: sx, top: summit.y, bottom: y, summit: true });
    const slot = { x: summit.x + summit.w / 2, y: summit.y };
    b.go({ a: 'walk', x: slot.x });
    b.feats.push({ slot: slot, top: summit, kind: 'summit', routeEnd: b.route.length, floor: N });
    // земля
    b.plat(0, 0, W, 'ground', { h: GROUND_DEPTH });
    // «присесть» на этажах для лишних находок
    b.perchFloors = floors.slice(0, N - 1);
  }

  // Лишняя находка на этаже высокой сцены: уступ у стены.
  // У дальней стены (за следующим подъёмом) — если по дороге нет батута или лифта;
  // иначе у ближней стены (откуда пришли) — если в этом полу нет дыры от лифта.
  function addPerch(b, fi) {
    const fl = b.perchFloors[fi];
    if (!fl) return null;
    const next = b.floors[fi + 1];
    let wallSide;
    if (next && (next.type === 'ladder' || next.type === 'stairs')) wallSide = -fl.side;
    else if (fl.type !== 'lift') wallSide = fl.side;
    else return null;
    const pw = 150;
    const px = wallSide > 0 ? b.W - 80 - pw : 80;
    const p = b.plat(px, fl.y - b.f(100, 112), pw, 'perch');
    b.coin(wallSide > 0 ? px - 40 : px + pw + 40, fl.y - 50);
    return {
      fi: fi,
      slot: { x: px + pw / 2, y: p.y },
      steps: [
        { a: 'jump', from: wallSide > 0 ? px - 40 : px + pw + 40, to: { x: px + pw / 2, y: p.y }, on: p },
        { a: 'walk', x: px + pw / 2 },
        { a: 'art' },
        { a: 'drop', x: wallSide > 0 ? px - 60 : px + pw + 60, y: fl.y },
      ],
    };
  }

  // ---------- общие проходы ----------
  // Опора до земли: если под площадкой ничего нет — стиль может нарисовать ствол/стену
  function computeBases(b) {
    const solid = b.platforms.filter((p) => p.kind === 'ground' || p.kind === 'floor');
    for (const p of b.platforms) {
      if (p.move || p.kind === 'ground' || p.kind === 'floor' || p.kind === 'hidden' || p.kind === 'pad' || p.kind === 'stone') continue;
      let base = null;
      for (const s of solid) {
        if (s.y > p.y && s.x < p.x + p.w && s.x + s.w > p.x && (base === null || s.y < base)) base = s.y;
      }
      if (base === null) continue;
      let clear = true;
      for (const q of b.platforms) {
        if (q === p || q.kind === 'ground' || q.kind === 'floor' || q.kind === 'hidden') continue;
        if (q.move) {
          // ездящие площадки проезжают мимо — считаем по всему ходу
          const ax = (q.move.ax || 0) + 10, ay = q.move.ay || 0;
          if (q.x - ax < p.x + p.w + 10 && q.x + q.w + ax > p.x - 10 && q.y + ay > p.y && q.y - ay < base) clear = false;
          continue;
        }
        if (q.y > p.y && q.y < base && q.x < p.x + p.w + 10 && q.x + q.w > p.x - 10) clear = false;
      }
      if (clear) p.base = base;
    }
  }

  function shiftY(b, dy) {
    for (const p of b.platforms) p.y += dy;
    for (const l of b.ladders) {
      l.top += dy;
      l.bottom += dy;
    }
    for (const c of b.coins) c[1] += dy;
    for (const w of b.water) w.y += dy;
    for (const c of b.columns) {
      c.top += dy;
      c.bottom += dy;
    }
    for (const f of b.feats) f.slot.y += dy;
    for (const p of b.platforms) if (p.base != null) p.base += dy;
    b.floorYs = b.floorYs.map((y) => y + dy);
    b.spawn[1] += dy;
    for (const s of b.route) {
      if (s.to) s.to.y += dy;
      if (s.dest) s.dest.y += dy;
      if (s.top != null) s.top += dy;
      if (s.y != null) s.y += dy;
      if (s.low != null) s.low += dy;
      if (s.high != null) s.high += dy;
    }
  }

  // ---------- сборка сцены ----------
  // desc: { seed, theme (объект), round, arts: [id...], layout: 'wide'|'tall' }
  Gen.build = function (desc) {
    const theme = desc.theme;
    const d = Gen.difficulty(desc.round || 1);
    const b = new Builder(desc.seed >>> 0, d);
    const layout = desc.layout || theme.layout || 'wide';
    if (layout === 'tall') buildTall(b, theme);
    else buildWide(b, theme);

    // куда положить находки: последняя — в самом конце пути, остальные — раньше
    const nArts = Math.max(1, (desc.arts || []).length);
    const slots = [];
    if (layout === 'tall') {
      const nf = b.perchFloors.length;
      // этажи по порядку предпочтения: равномерно по высоте, потом остальные
      const want = [];
      for (let k = 0; k < nArts - 1; k++) want.push(Math.max(0, Math.min(nf - 1, Math.round(((k + 1) * nf) / nArts) - 1)));
      const order = want.concat(Array.from({ length: nf }, (_, i) => i));
      const used = [];
      for (const fi of order) {
        if (used.length >= nArts - 1) break;
        if (used.indexOf(fi) >= 0) continue;
        const pr = addPerch(b, fi);
        if (!pr) continue;
        used.push(fi);
        slots.push({ slot: pr.slot, perch: pr });
      }
      slots.sort((a, c) => a.perch.fi - c.perch.fi);
      const last = b.feats[b.feats.length - 1];
      slots.push({ slot: last.slot, feat: last });
    } else {
      const n = b.feats.length;
      const pickIdx = [n - 1];
      for (let k = 1; k < nArts && k < n; k++) pickIdx.unshift(Math.round(((n - 1) * (nArts - k)) / nArts) - 0);
      const uniq = [];
      for (const i of pickIdx) if (uniq.indexOf(i) < 0) uniq.push(i);
      uniq.sort((a, c) => a - c);
      for (const i of uniq) slots.push({ slot: b.feats[i].slot, feat: b.feats[i] });
    }

    // монетки на вершинах: где находка — по краям, где нет — посередине тоже
    for (const f of b.feats) {
      const hasArt = slots.some((s) => s.feat === f);
      if (f.top && f.kind !== 'blocks') {
        if (hasArt) {
          const p = f.top;
          b.coin(p.x + 40, p.y - 50);
          if (Math.abs(p.x + p.w - 40 - f.slot.x) > 70) b.coin(p.x + p.w - 40, p.y - 50);
        } else b.coinsOn(f.top, 3);
      }
    }

    // находки и отметки в пути
    const arts = [];
    const artIds = desc.arts && desc.arts.length ? desc.arts : ['star'];
    slots.forEach((s, i) => {
      arts.push({ x: Math.round(s.slot.x), y: Math.round(s.slot.y - 62), id: artIds[i % artIds.length], feat: s.feat ? s.feat.kind : 'perch' });
    });
    // отметки «здесь находка» — в конце соответствующего участка пути
    const marks = [];
    slots.forEach((s, i) => {
      if (s.feat) marks.push({ at: s.feat.routeEnd, i: i });
    });
    marks.sort((a, c) => c.at - a.at);
    for (const m of marks) b.route.splice(m.at, 0, { a: 'art', i: m.i });
    // заход на уступ — перед подъёмом с этого этажа
    slots.forEach((s, i) => {
      if (!s.perch) return;
      const at = b.route.findIndex((st) => st.floorFrom === s.perch.fi + 1);
      const steps = s.perch.steps.map((st) => (st.a === 'art' ? { a: 'art', i: i } : st));
      if (at >= 0) b.route.splice(at, 0, ...steps);
    });

    computeBases(b);

    // по вертикали: земля на 180 выше нижнего края, сверху запас для неба
    let minY = 0;
    for (const p of b.platforms) minY = Math.min(minY, p.y - (p.move && p.move.ay ? p.move.ay : 0));
    for (const c of b.coins) minY = Math.min(minY, c[1]);
    for (const a of arts) minY = Math.min(minY, a.y);
    const GY = Math.round(-minY + 300);
    shiftY(b, GY);
    for (const a of arts) a.y += GY;
    const H = GY + 180;
    for (const p of b.platforms) if (p.kind === 'ground') p.h = H - p.y + 40;

    const L = {
      id: desc.id || 'gen',
      w: b.W,
      h: H,
      gy: GY,
      spawn: b.spawn,
      spawnFacing: b.spawn[0] > b.W / 2 ? -1 : 1,
      platforms: b.platforms,
      ladders: b.ladders,
      walls: [],
      water: b.water,
      coins: b.coins,
      artifacts: arts,
      route: b.route,
      feats: b.feats,
      columns: b.columns,
      floorYs: b.floorYs,
      layout: layout,
      seed: desc.seed >>> 0,
      round: d.round,
    };
    if (VW.Themes && VW.Themes.dress) VW.Themes.dress(L, theme, desc);
    return L;
  };

  // Подсказка голосом: куда идти к следующей находке
  Gen.hint = function (L, P, art, theme) {
    const words = (theme && theme.words) || {};
    const dx = art.x - P.x;
    const up = P.y - art.y > 160;
    let dir = '';
    if (Math.abs(dx) > 260) dir = dx > 0 ? 'Иди направо! ' : 'Иди налево! ';
    const how = {
      stairs: 'Прыгай по ' + (words.plats || 'ступенькам') + ' наверх!',
      ladder: 'Залезай по лестнице!',
      bounce: 'Прыгни на ' + (words.pad || 'батут') + ' — он подбросит высоко!',
      mover: 'Залезь по лестнице и прокатись на ' + (words.mover || 'ездящем мостике') + '!',
      lift: 'Встань на ' + (words.lift || 'лифт') + ' — он поднимет наверх!',
      column: 'Прыгай по ' + (words.plats || 'ступенькам') + ' вверх!',
      blocks: 'Шагай по ' + (words.blocks || 'кубикам') + ' наверх!',
      summit: 'Поднимайся на самый верх! Ищи лестницу.',
      perch: 'Находка на уступе у стены. Подпрыгни!',
    }[art.feat] || 'Ищи наверху!';
    if (!up && Math.abs(dx) > 260) return dir + 'Находка там!';
    return dir + how;
  };
})(window.VW);
