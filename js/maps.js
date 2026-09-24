/* Vasilisa World — фоны карт миров и оформление праздничных залов.
   Maps.paint(ctx, W, H, t, world, round) — фон карты; вариант (день/вечер/ночь, рельеф)
   зависит от круга, чтобы на каждом круге карта была немножко другой. */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, Art = VW.Art;
  const M = (VW.Maps = {});
  const TAU = Math.PI * 2;
  const fs = Art.fs;

  // Время суток по кругу: 0 — день, 1 — вечер, 2 — ночь
  function tod(round) {
    return (Math.max(1, round) - 1) % 3;
  }
  M.tod = tod;
  const SKY = {
    day: ['#5FB8FF', '#A8DDFF', '#E4F6FF'],
    eve: ['#5A3FC0', '#9D6FE0', '#FF9ECF', '#FFD9A0'],
    night: ['#141A45', '#26306E', '#4A4FA0', '#6B6AC0'],
  };
  function skyFor(k, custom) {
    if (custom && custom[k]) return custom[k];
    return [SKY.day, SKY.eve, SKY.night][k];
  }
  function sunMoon(ctx, W, H, k, t, x) {
    x = x == null ? 0.88 : x;
    if (k === 0) {
      G.glow(ctx, W * x, H * 0.14, 130, '#FFF3A0', 0.8);
      G.circle(ctx, W * x, H * 0.14, 44);
      ctx.fillStyle = '#FFE45C';
      ctx.fill();
    } else if (k === 1) {
      G.glow(ctx, W * x, H * 0.5, 160, '#FFD49A', 0.7);
      G.circle(ctx, W * x, H * 0.5, 58);
      ctx.fillStyle = '#FFB36B';
      ctx.fill();
      G.nightStars(ctx, W, H * 0.35, t, 21, 20);
    } else {
      G.nightStars(ctx, W, H * 0.6, t, 11, 60);
      G.glow(ctx, W * x, H * 0.18, 90, '#FFF4C2', 0.5);
      G.circle(ctx, W * x, H * 0.18, 34);
      ctx.fillStyle = '#FFF4C2';
      ctx.fill();
    }
  }
  function clouds(ctx, W, H, t, k, n) {
    for (let i = 0; i < (n || 4); i++) {
      const w = 170 + i * 30;
      const x = ((t * (10 + i * 4) + i * 360) % (W + w + 200)) - w - 100;
      const y = 60 + i * 46 + (i % 2) * 20;
      G.cloud(ctx, x, y, w, 60 + i * 6, k === 2 ? 'rgba(200,200,255,0.25)' : k === 1 ? 'rgba(255,230,245,0.8)' : '#fff', k === 1 ? 'rgba(160,100,200,0.3)' : null);
    }
  }
  function seeded(round, salt) {
    return U.rng(((round || 1) * 7919 + (salt || 0)) >>> 0);
  }

  const P = {};

  // ---------- волшебная школа ----------
  P.magic = function (ctx, W, H, t, round) {
    const k = tod(round); // 1-й уровень — вечер (как раньше), потом день и ночь
    VW.landscape(ctx, W, H, t, k !== 1);
    if (k === 2) {
      ctx.fillStyle = 'rgba(20,20,70,0.38)';
      ctx.fillRect(0, 0, W, H);
      G.nightStars(ctx, W, H * 0.5, t, 31, 50);
    }
  };

  // ---------- герой-паук: город на закате ----------
  P.spider = function (ctx, W, H, t, round) {
    const k = tod(round);
    G.sky(ctx, W, H, skyFor(k, { 0: ['#6A5ACD', '#C86FB0', '#FF9A7A', '#FFD49A'], 1: ['#3A2A7A', '#8A4FA0', '#FF7A7A', '#FFC080'], 2: ['#0F1A3D', '#1E2F6B', '#3A4F9A', '#5E6FB8'] }));
    sunMoon(ctx, W, H, k === 0 ? 1 : k === 1 ? 1 : 2, t, 0.8);
    const r = seeded(round, 1);
    const layers = [['#A77BB8', 0.62, 0.3, 0.1], ['#7E568F', 0.74, 0.22, 0.3]];
    if (k === 2) {
      layers[0][0] = '#2A3A70';
      layers[1][0] = '#1E2A55';
    }
    for (const [c, base, amp, lit] of layers) {
      let x = -20;
      ctx.fillStyle = c;
      const wins = [];
      while (x < W + 40) {
        const w = 50 + r() * 80, h = H * amp * (0.4 + r() * 0.8);
        ctx.fillRect(x, H * base - h, w, H);
        for (let wy = 14; wy < h - 10; wy += 24) for (let wx = 8; wx < w - 12; wx += 18) if (r() < lit) wins.push([x + wx, H * base - h + wy]);
        x += w + 3 + r() * 12;
      }
      ctx.fillStyle = '#FFE08A';
      for (const [wx, wy] of wins) ctx.fillRect(wx, wy, 7, 10);
    }
    // дорога
    ctx.fillStyle = '#524E62';
    ctx.fillRect(0, H * 0.86, W, H);
    ctx.fillStyle = '#D4CEDF';
    ctx.fillRect(0, H * 0.84, W, 16);
    ctx.fillStyle = '#F4F1E8';
    for (let x = 20; x < W; x += 120) ctx.fillRect(x, H * 0.93, 60, 6);
    // паутинка в углу
    ctx.beginPath();
    for (let q = 0; q < 7; q++) {
      const a = (q / 6) * (Math.PI / 2);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * 240, Math.sin(a) * 240);
    }
    for (const rr of [60, 110, 160, 210]) {
      for (let q = 0; q <= 6; q++) {
        const a = (q / 6) * (Math.PI / 2);
        if (q === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.stroke();
    VW.Scenery.drawSpider(ctx, 150, 150 + Math.sin(t * 1.5) * 14, 0.9, t);
  };

  // ---------- роботы: фабрика и ракета ----------
  P.robots = function (ctx, W, H, t, round) {
    const k = tod(round);
    G.sky(ctx, W, H, skyFor(k, { 0: ['#8FB3E8', '#BFD6F5', '#E6F0FF'], 1: ['#3A2A7A', '#7A5AC0', '#FFB3A0'], 2: ['#0B0B2A', '#1A1A4A', '#2E2A6E', '#4B3F8F'] }));
    if (k === 2) G.nightStars(ctx, W, H * 0.7, t, 5, 80);
    else sunMoon(ctx, W, H, k, t, 0.5);
    // планета
    G.circle(ctx, W * 0.14, H * 0.18, 34);
    ctx.fillStyle = '#FF9EC8';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(W * 0.14, H * 0.18, 58, 12, -0.3, 0, TAU);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255,220,150,0.8)';
    ctx.stroke();
    // фабрика с трубами и шестерёнками
    const base = H * 0.72;
    ctx.fillStyle = k === 2 ? '#2A3358' : '#6E86AE';
    ctx.fillRect(0, base - 120, W * 0.55, 200);
    for (let x = 30; x < W * 0.55; x += 110) {
      ctx.fillRect(x, base - 220, 34, 110);
      for (let q = 0; q < 3; q++) {
        const ph = (t * 0.3 + q / 3 + x) % 1;
        G.circle(ctx, x + 17 + Math.sin(ph * 5) * 8, base - 230 - ph * 80, 10 + ph * 14);
        ctx.fillStyle = 'rgba(255,255,255,' + 0.5 * (1 - ph) + ')';
        ctx.fill();
      }
      ctx.fillStyle = k === 2 ? '#2A3358' : '#6E86AE';
    }
    ctx.fillStyle = '#FFE08A';
    for (let x = 20; x < W * 0.55 - 30; x += 60) ctx.fillRect(x, base - 90, 30, 22);
    for (const [gx, gy, R] of [[W * 0.3, base - 150, 50], [W * 0.42, base - 130, 34]]) {
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(t * (R > 40 ? 0.5 : -0.75));
      ctx.beginPath();
      for (let q = 0; q < 20; q++) {
        const a = (q / 20) * TAU;
        const rr = q % 2 ? R : R + 12;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      fs(ctx, '#FFC928', '#B87800', 3);
      G.circle(ctx, 0, 0, R * 0.35);
      ctx.fillStyle = '#B87800';
      ctx.fill();
      ctx.restore();
    }
    // ракета справа
    const rx = W * 0.8, rb = base + 10;
    ctx.beginPath();
    ctx.moveTo(rx - 36, rb);
    ctx.lineTo(rx - 36, rb - 180);
    ctx.quadraticCurveTo(rx - 36, rb - 260, rx, rb - 300);
    ctx.quadraticCurveTo(rx + 36, rb - 260, rx + 36, rb - 180);
    ctx.lineTo(rx + 36, rb);
    ctx.closePath();
    fs(ctx, '#F4F6FF', '#8E9AB2', 3);
    G.circle(ctx, rx, rb - 190, 16);
    fs(ctx, '#8FE0FF', '#3A6EA8', 4);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(rx + s * 36, rb - 80);
      ctx.lineTo(rx + s * 76, rb);
      ctx.lineTo(rx + s * 36, rb);
      ctx.closePath();
      fs(ctx, '#E0533F', '#8E2A2A', 3);
    }
    // земля
    ctx.fillStyle = '#9AA6BA';
    ctx.fillRect(0, base, W, H);
    ctx.fillStyle = '#FFC928';
    ctx.fillRect(0, base, W, 12);
    Art.stripes(ctx, 0, base, W, 12, 14, '#2E3440');
    ctx.fillStyle = '#8290A8';
    ctx.fillRect(0, H * 0.86, W, H);
  };

  // ---------- растения: огород ----------
  P.plants = function (ctx, W, H, t, round) {
    const k = tod(round);
    G.sky(ctx, W, H, skyFor(k, { 0: ['#7CC8FF', '#B5E2FF', '#E8F7FF'] }));
    sunMoon(ctx, W, H, k, t, 0.14);
    clouds(ctx, W, H, t, k, 3);
    const r = seeded(round, 3);
    G.hill(ctx, -20, W + 20, H * 0.6, 60, k === 2 ? '#3A6A5A' : '#A8D98A', 3 + round);
    // подсолнухи за забором
    for (let x = 40 + r() * 40; x < W; x += 120 + r() * 80) {
      const h = 120 + r() * 60;
      ctx.beginPath();
      ctx.moveTo(x, H * 0.66);
      ctx.lineTo(x, H * 0.66 - h);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#4CA83A';
      ctx.stroke();
      for (let q = 0; q < 12; q++) {
        const a = (q / 12) * TAU + Math.sin(t + x) * 0.05;
        G.ellipse(ctx, x + Math.cos(a) * 20, H * 0.66 - h + Math.sin(a) * 20, 11, 5, a);
        ctx.fillStyle = '#FFD23F';
        ctx.fill();
      }
      G.circle(ctx, x, H * 0.66 - h, 14);
      ctx.fillStyle = '#7A4A20';
      ctx.fill();
    }
    // забор
    for (let x = -10; x < W; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, H * 0.7);
      ctx.lineTo(x, H * 0.62);
      ctx.lineTo(x + 10, H * 0.6);
      ctx.lineTo(x + 20, H * 0.62);
      ctx.lineTo(x + 20, H * 0.7);
      ctx.closePath();
      fs(ctx, '#F2D2A0', '#A0703F', 2);
    }
    // грядки
    ctx.fillStyle = k === 2 ? '#4A3220' : '#8A5A32';
    ctx.fillRect(0, H * 0.7, W, H);
    for (let row = 0; row < 3; row++) {
      const y = H * 0.76 + row * H * 0.08;
      ctx.fillStyle = '#6E4424';
      ctx.fillRect(0, y + 14, W, 10);
      for (let x = 20 + row * 30; x < W; x += 70) {
        if (row === 1) {
          for (const [dx, rr] of [[-10, 12], [10, 12], [0, 15]]) {
            G.circle(ctx, x + dx, y + 6, rr);
            fs(ctx, '#8FD36A', '#3E8E36', 1.5);
          }
        } else {
          ctx.beginPath();
          ctx.moveTo(x, y + 14);
          ctx.lineTo(x - 8, y - 8);
          ctx.moveTo(x, y + 14);
          ctx.lineTo(x + 8, y - 10);
          ctx.moveTo(x, y + 14);
          ctx.lineTo(x, y - 12);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#4CA83A';
          ctx.stroke();
        }
      }
    }
  };

  // ---------- эльфы и жучки: грибная поляна ----------
  P.elves = function (ctx, W, H, t, round) {
    const k = tod(round);
    G.sky(ctx, W, H, skyFor(k, { 0: ['#8FCBFF', '#C6E6FF', '#FFF1CC'] }));
    sunMoon(ctx, W, H, k, t, 0.8);
    clouds(ctx, W, H, t, k, 3);
    const r = seeded(round, 4);
    G.hill(ctx, -20, W + 20, H * 0.62, 50, k === 2 ? '#2E5A4A' : '#9FD08A', 7 + round);
    // грибы на горизонте
    for (let x = 30 + r() * 40; x < W; x += 110 + r() * 110) {
      const h = 70 + r() * 90, w = 40 + r() * 40;
      const c = ['#F0433A', '#B5651D', '#9A55E8', '#FF8C1A', '#E85D9A'][Math.floor(r() * 5)];
      G.rr(ctx, x - w * 0.18, H * 0.68 - h, w * 0.36, h, 10);
      fs(ctx, '#FFF1D6', '#B89A6A', 2);
      ctx.beginPath();
      ctx.moveTo(x - w, H * 0.68 - h + 8);
      ctx.quadraticCurveTo(x, H * 0.68 - h - w * 1.1, x + w, H * 0.68 - h + 8);
      ctx.closePath();
      fs(ctx, c, U.shade(c, -0.4), 2.5);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      G.ellipse(ctx, x - w * 0.4, H * 0.68 - h - w * 0.15, 6, 4);
      ctx.fill();
      G.ellipse(ctx, x + w * 0.3, H * 0.68 - h - w * 0.3, 7, 5);
      ctx.fill();
      if (k === 2) G.glow(ctx, x, H * 0.68 - h - 10, w * 1.4, c, 0.3);
    }
    ctx.fillStyle = k === 2 ? '#1E4A3A' : '#62C94F';
    ctx.fillRect(0, H * 0.68, W, H);
    // травинки
    ctx.fillStyle = k === 2 ? '#2E6A4A' : '#4CAE48';
    ctx.beginPath();
    for (let x = 0; x < W; x += 16) {
      const hh = 20 + ((x * 7) % 30);
      ctx.moveTo(x - 5, H);
      ctx.quadraticCurveTo(x, H - hh, x + 4 + Math.sin(t + x) * 3, H - hh - 10);
      ctx.quadraticCurveTo(x + 2, H - hh * 0.5, x + 5, H);
    }
    ctx.fill();
    if (k === 2) G.nightStars(ctx, W, H * 0.5, t, 9, 30);
  };

  // ---------- кухня: стол со скатертью ----------
  P.kitchen = function (ctx, W, H, t, round) {
    const k = tod(round);
    ctx.fillStyle = ['#FFF1C9', '#FFE0EC', '#E0E8FF'][k];
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = ['#FFE3A0', '#FFC8DC', '#C8D4FF'][k];
    for (let x = 0; x < W; x += 90) ctx.fillRect(x, 0, 30, H);
    // окно
    const wx = W * 0.5, wy = 40;
    G.rr(ctx, wx - 150, wy, 300, 190, 12);
    ctx.fillStyle = G.vGrad(ctx, wy, wy + 190, k === 2 ? ['#141A45', '#3A4F9A'] : k === 1 ? ['#9D6FE0', '#FFD9A0'] : ['#8FD3FF', '#DFF4FF']);
    ctx.fill();
    if (k === 2) {
      G.circle(ctx, wx + 80, wy + 50, 20);
      ctx.fillStyle = '#FFF4C2';
      ctx.fill();
    } else G.cloud(ctx, wx - 110 + Math.sin(t * 0.2) * 20, wy + 40, 120, 40, '#fff');
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#FFFFFF';
    G.rr(ctx, wx - 150, wy, 300, 190, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx, wy + 190);
    ctx.stroke();
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(wx + s * 165, wy - 16);
      ctx.quadraticCurveTo(wx + s * 110, wy + 100, wx + s * 150, wy + 210);
      ctx.lineTo(wx + s * 180, wy + 210);
      ctx.lineTo(wx + s * 180, wy - 16);
      ctx.closePath();
      fs(ctx, '#FF9EC8', '#C2185B', 2);
    }
    // полки с баночками
    for (const sx of [W * 0.12, W * 0.84]) {
      G.rr(ctx, sx - 90, 190, 180, 12, 4);
      fs(ctx, '#C98D52', '#6A4520', 2);
      for (let q = 0; q < 3; q++) {
        const jx = sx - 55 + q * 55;
        G.rr(ctx, jx - 18, 146, 36, 44, 7);
        fs(ctx, 'rgba(220,240,255,0.85)', '#7A8AA0', 2);
        G.rr(ctx, jx - 15, 160, 30, 26, 5);
        ctx.fillStyle = ['#E0305A', '#FFB300', '#9A55E8'][q];
        ctx.fill();
        G.rr(ctx, jx - 20, 138, 40, 10, 4);
        fs(ctx, '#FF5A5A', '#8E2A2A', 1.5);
      }
    }
    // стол со скатертью в клеточку
    const ty = H * 0.42;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, ty, W, H);
    ctx.fillStyle = 'rgba(255,90,120,0.45)';
    for (let x = 0; x < W; x += 60) ctx.fillRect(x, ty, 30, H);
    for (let y = ty; y < H; y += 60) ctx.fillRect(0, y, W, 30);
    ctx.fillStyle = '#C98D52';
    ctx.fillRect(0, ty - 10, W, 12);
    // чайник и торт на столе
    VW.Items.drawArtifact(ctx, 'teapot', W * 0.08, ty + 60, 44, t, { sparkles: false });
    VW.Items.drawCake(ctx, W * 0.93, ty + 56, 40, t);
  };

  // ---------- лес ----------
  P.forest = function (ctx, W, H, t, round) {
    const k = tod(round);
    G.sky(ctx, W, H, skyFor(k, { 0: ['#8ECFFF', '#C2E6FF', '#EAF7FF'] }));
    sunMoon(ctx, W, H, k, t, 0.84);
    clouds(ctx, W, H, t, k, 3);
    const r = seeded(round, 6);
    const rows = [[H * 0.55, k === 2 ? '#2A4A5A' : '#9CC7A6', 0.9], [H * 0.66, k === 2 ? '#1E3A40' : '#6FAE7A', 1.2]];
    for (const [base, c, s] of rows) {
      ctx.fillStyle = c;
      ctx.beginPath();
      for (let x = -20; x < W + 40; x += 30 + r() * 30) {
        const h = (60 + r() * 60) * s, w = (18 + r() * 12) * s;
        ctx.moveTo(x, base - h);
        ctx.lineTo(x + w, base);
        ctx.lineTo(x - w, base);
        ctx.closePath();
      }
      ctx.rect(-10, base - 2, W + 20, H);
      ctx.fill();
    }
    // берёзки
    for (let x = 60 + r() * 60; x < W; x += 200 + r() * 160) {
      G.rr(ctx, x - 10, H * 0.3, 20, H * 0.5, 8);
      fs(ctx, '#F7F7F2', '#9A9A90', 2);
      ctx.fillStyle = '#2E2E2E';
      for (let y = H * 0.33; y < H * 0.78; y += 34) ctx.fillRect(x - 10 + ((y * 7) % 10), y, 10, 4);
      G.circle(ctx, x, H * 0.3, 44);
      fs(ctx, k === 2 ? '#3A6A4A' : '#8FD36A', k === 2 ? '#2A4A3A' : '#5FA848', 2);
    }
    // речка
    ctx.beginPath();
    ctx.moveTo(W * 0.35, H);
    ctx.bezierCurveTo(W * 0.4, H * 0.85, W * 0.62, H * 0.86, W * 0.66, H * 0.72);
    ctx.lineTo(W * 0.72, H * 0.72);
    ctx.bezierCurveTo(W * 0.7, H * 0.9, W * 0.5, H * 0.92, W * 0.48, H);
    ctx.closePath();
    ctx.fillStyle = k === 2 ? '#3A5AA0' : '#8FDBFF';
    ctx.fill();
    ctx.fillStyle = k === 2 ? '#2A5A3A' : '#62C94F';
    ctx.fillRect(0, H * 0.78, W * 0.36, H);
    ctx.fillRect(W * 0.72, H * 0.72, W, H);
  };

  // ---------- город ----------
  P.city = function (ctx, W, H, t, round) {
    const k = tod(round);
    G.sky(ctx, W, H, skyFor(k, { 0: ['#8FD3FF', '#C6EBFF', '#F0FAFF'] }));
    sunMoon(ctx, W, H, k, t, 0.86);
    clouds(ctx, W, H, t, k, 3);
    const r = seeded(round, 7);
    const cols = ['#FFB74D', '#81C784', '#64B5F6', '#E57373', '#F06292', '#FFD54F', '#A1887F'];
    // дальние дома
    let x = -10;
    ctx.fillStyle = k === 2 ? '#2A3A70' : '#C2CEE6';
    while (x < W + 40) {
      const w = 60 + r() * 80, h = 140 + r() * 200;
      ctx.fillRect(x, H * 0.66 - h, w, h + 10);
      x += w + 4;
    }
    // колесо обозрения
    const fx = W * 0.72, fy = H * 0.38, R = 110;
    ctx.beginPath();
    ctx.arc(fx, fy, R, 0, TAU);
    for (let q = 0; q < 10; q++) {
      const a = (q / 10) * TAU + t * 0.15;
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(a) * R, fy + Math.sin(a) * R);
    }
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx - 50, H * 0.68);
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 50, H * 0.68);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#E08AB8';
    ctx.stroke();
    for (let q = 0; q < 10; q++) {
      const a = (q / 10) * TAU + t * 0.15;
      G.rr(ctx, fx + Math.cos(a) * R - 11, fy + Math.sin(a) * R, 22, 18, 6);
      ctx.fillStyle = cols[q % cols.length];
      ctx.fill();
    }
    // ближние домики
    x = -20;
    while (x < W + 40) {
      const w = 80 + r() * 60, h = 90 + r() * 100;
      const c = cols[Math.floor(r() * cols.length)];
      ctx.fillStyle = k === 2 ? U.shade(c, -0.5) : c;
      ctx.fillRect(x, H * 0.74 - h, w, h + 10);
      ctx.fillStyle = k === 2 ? '#FFE08A' : '#CDEBFF';
      for (let wy = 14; wy < h - 20; wy += 30) for (let wx = 10; wx < w - 20; wx += 26) ctx.fillRect(x + wx, H * 0.74 - h + wy, 14, 18);
      x += w + 6;
    }
    ctx.fillStyle = '#D4CEDF';
    ctx.fillRect(0, H * 0.74, W, 18);
    ctx.fillStyle = '#524E62';
    ctx.fillRect(0, H * 0.74 + 18, W, H);
    ctx.fillStyle = '#F4F1E8';
    for (let xx = 20; xx < W; xx += 120) ctx.fillRect(xx, H * 0.88, 60, 6);
  };

  // ---------- интернет ----------
  P.internet = function (ctx, W, H, t, round) {
    const k = tod(round);
    G.sky(ctx, W, H, [['#6E6EF0', '#9E9CFF', '#C8D6FF', '#E6F4FF'], ['#5A2A9A', '#A04FD0', '#FF8FC8', '#FFD0E8'], ['#0B1030', '#1B2460', '#2E3A8A', '#4A4FB0']][k]);
    if (k === 2) G.nightStars(ctx, W, H * 0.5, t, 3, 50);
    // сетка «в перспективу»
    const hz = H * 0.52;
    ctx.fillStyle = k === 2 ? '#141A45' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(0, hz, W, H);
    ctx.beginPath();
    for (let q = -12; q <= 12; q++) {
      ctx.moveTo(W / 2 + q * 30, hz);
      ctx.lineTo(W / 2 + q * 180, H);
    }
    for (let q = 0; q < 8; q++) {
      const y = hz + Math.pow(q / 8, 1.8) * (H - hz) + ((t * 20) % 40) * (q / 8);
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = k === 2 ? 'rgba(95,224,255,0.6)' : 'rgba(255,255,255,0.8)';
    ctx.stroke();
    // летающие окошки и значки
    const r = seeded(round, 9);
    for (let q = 0; q < 5; q++) {
      const x = W * (0.1 + q * 0.2) + r() * 40, y = H * 0.12 + r() * H * 0.25 + Math.sin(t + q) * 8;
      const c = ['#FF6FA8', '#4FC3F7', '#FFD54F', '#7CD35A', '#B983FF'][q];
      ctx.globalAlpha = 0.85;
      G.rr(ctx, x - 50, y - 34, 100, 68, 8);
      fs(ctx, '#FFFFFF', U.shade(c, -0.4), 2);
      ctx.fillStyle = c;
      ctx.fillRect(x - 49, y - 33, 98, 12);
      ctx.globalAlpha = 1;
      const icon = ['smiley', 'likeHeart', 'letter', 'gamepad', 'pcMouse'][q];
      VW.Items.drawArtifact(ctx, icon, x, y + 8, 18, t, { sparkles: false });
    }
  };

  M.paint = function (ctx, W, H, t, world, round) {
    round = round || 1;
    // каждые три уровня пейзаж отражается — другой рельеф и дорожка
    const mirror = Math.floor((round - 1) / 3) % 2 === 1;
    if (mirror) {
      ctx.save();
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
    }
    (P[world] || P.magic)(ctx, W, H, t, round);
    if (mirror) ctx.restore();
  };

  // Цвет дорожки и кружков на карте
  M.pathColors = {
    magic: ['#E9C98F', '#F7E2B5'],
    spider: ['#9A93A8', '#D4CEDF'],
    robots: ['#8E9AB2', '#C9D3E8'],
    plants: ['#B0703F', '#E0B070'],
    elves: ['#E9C98F', '#FFF1CC'],
    kitchen: ['#E0A0B8', '#FFE0EC'],
    forest: ['#B0823F', '#E8C08A'],
    city: ['#9A93A8', '#E4E0EC'],
    internet: ['#7F5CFF', '#C8B8FF'],
  };

  // ---------- праздничные залы ----------
  M.hall = {
    magic: { wall: ['#FFE9CC', '#FFD9B0', '#FFCFA0'], frame: '#C98B4F', win: ['#1B1646', '#4B3A9A'], cloth: '#FF9EC8', deco: null },
    spider: { wall: ['#FFE3E3', '#FFC8D0', '#F0B0C8'], frame: '#8E2A4A', win: ['#1E2F6B', '#5E6FB8'], cloth: '#E57373', deco: 'web', city: true },
    robots: { wall: ['#DDE6F5', '#C4D3EC', '#AFC2E0'], frame: '#4A5A78', win: ['#0B0B2A', '#2E2A6E'], cloth: '#4FC3F7', deco: 'gear' },
    plants: { wall: ['#E8FFE0', '#CDEFC0', '#B5E2A8'], frame: '#4C8A2A', win: ['#6FC0FF', '#E4F6FF'], cloth: '#9BE08A', deco: 'flower' },
    elves: { wall: ['#FFF4D6', '#FFE6B0', '#FFD890'], frame: '#A0642A', win: ['#26306E', '#5A5AB8'], cloth: '#F5B041', deco: 'mushroom' },
    kitchen: { wall: ['#FFF1F6', '#FFE0EC', '#FFD0E2'], frame: '#C2185B', win: ['#8FD3FF', '#DFF4FF'], cloth: '#FF9EC8', deco: 'cupcake' },
    forest: { wall: ['#EAF7E0', '#D6EDC8', '#C2E0B0'], frame: '#6A4520', win: ['#2A4A5A', '#8ECFFF'], cloth: '#81C784', deco: 'leaf' },
    city: { wall: ['#EEF2FA', '#DDE4F2', '#C9D4EA'], frame: '#5A6378', win: ['#1E2F6B', '#8FD3FF'], cloth: '#64B5F6', deco: 'balloon', city: true },
    internet: { wall: ['#EDE7FA', '#D9CEF8', '#C4B4F2'], frame: '#5A4FCF', win: ['#0B1030', '#2E3A8A'], cloth: '#B983FF', deco: 'heart' },
  };
})(window.VW);
