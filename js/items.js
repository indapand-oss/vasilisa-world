/* Vasilisa World — артефакты, иконки миров, праздничный торт */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G;
  const I = (VW.Items = {});
  const TAU = Math.PI * 2, PI = Math.PI;

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

  // ---------- артефакты ----------
  // s — «радиус» предмета. o: {glow: true}
  I.drawArtifact = function (ctx, id, cx, cy, s, t, o) {
    o = o || {};
    t = t || 0;
    if (o.glow) {
      G.glow(ctx, cx, cy, s * 1.7, '#FFF2A8', 0.55);
      G.rays(ctx, cx, cy, s * 1.6, t * 0.5, '#FFF6C8', 10, 0.3);
    }
    switch (id) {
      case 'wand':
        wand(ctx, cx, cy, s, t);
        break;
      case 'glasses':
        glasses(ctx, cx, cy, s, t);
        break;
      case 'book':
        book(ctx, cx, cy, s, t);
        break;
      case 'potion':
        potion(ctx, cx, cy, s, t);
        break;
      case 'star':
        wishStar(ctx, cx, cy, s, t);
        break;
    }
    if (o.sparkles !== false) {
      for (let i = 0; i < 3; i++) {
        const a = t * 1.3 + (i * TAU) / 3;
        const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 2);
        G.sparkle(ctx, cx + Math.cos(a) * s * 1.05, cy + Math.sin(a) * s * 0.9, s * (0.1 + tw * 0.1), '#FFFBE0', 0.9);
      }
    }
  };

  function wand(ctx, cx, cy, s, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.78);
    G.rr(ctx, -s * 0.95, -s * 0.075, s * 1.5, s * 0.15, s * 0.07);
    fs(ctx, '#6D3F1E', '#3B200C', s * 0.04);
    G.rr(ctx, -s * 0.98, -s * 0.11, s * 0.5, s * 0.22, s * 0.09);
    fs(ctx, '#B06A30', '#5A3210', s * 0.04);
    ctx.fillStyle = '#FFC928';
    ctx.fillRect(-s * 0.56, -s * 0.11, s * 0.06, s * 0.22);
    ctx.fillRect(-s * 0.84, -s * 0.11, s * 0.05, s * 0.22);
    ctx.restore();
    const tx = cx + Math.cos(-0.78) * s * 0.62, ty = cy + Math.sin(-0.78) * s * 0.62;
    G.glow(ctx, tx, ty, s * 0.7, '#FFE066', 0.5);
    G.starPath(ctx, tx, ty, s * 0.42, s * 0.19, 5, -PI / 2 + Math.sin(t * 2) * 0.2);
    fs(ctx, '#FFD84A', '#C98A00', s * 0.05);
    G.starPath(ctx, tx - s * 0.04, ty - s * 0.03, s * 0.2, s * 0.09, 5, -PI / 2 + Math.sin(t * 2) * 0.2);
    ctx.fillStyle = '#FFF6C0';
    ctx.fill();
  }

  function heartLens(ctx, x, y, r) {
    G.heartPath(ctx, x, y, r);
  }

  function glasses(ctx, cx, cy, s, t) {
    const r = s * 0.4;
    const lx = cx - s * 0.47, rx = cx + s * 0.47, y = cy + s * 0.02;
    // дужки
    ctx.beginPath();
    ctx.moveTo(lx - r * 0.95, y - r * 0.35);
    ctx.lineTo(lx - r * 1.55, y - r * 0.55);
    ctx.lineTo(lx - r * 1.65, y + r * 0.15);
    ctx.moveTo(rx + r * 0.95, y - r * 0.35);
    ctx.lineTo(rx + r * 1.55, y - r * 0.55);
    ctx.lineTo(rx + r * 1.65, y + r * 0.15);
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#8E3FD6';
    ctx.stroke();
    // стёкла
    for (const x of [lx, rx]) {
      heartLens(ctx, x, y, r);
      ctx.fillStyle = 'rgba(170,225,255,0.85)';
      ctx.fill();
      ctx.lineWidth = s * 0.1;
      ctx.strokeStyle = '#B04CFF';
      ctx.stroke();
      G.ellipse(ctx, x - r * 0.35, y - r * 0.25, r * 0.22, r * 0.12, -0.6);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    }
    // перемычка
    ctx.beginPath();
    ctx.moveTo(lx + r * 0.5, y - r * 0.3);
    ctx.quadraticCurveTo(cx, y - r * 0.8, rx - r * 0.5, y - r * 0.3);
    ctx.lineWidth = s * 0.09;
    ctx.strokeStyle = '#B04CFF';
    ctx.stroke();
    const tw = 0.5 + 0.5 * Math.sin(t * 6);
    G.sparkle(ctx, rx + r * 0.3, y - r * 0.7, s * (0.1 + tw * 0.08), '#fff');
  }

  function book(ctx, cx, cy, s, t) {
    const w = s * 1.25, h = s * 1.55;
    const x = cx - w / 2, y = cy - h / 2;
    // страницы
    G.rr(ctx, x + s * 0.1, y + s * 0.1, w, h, s * 0.1);
    fs(ctx, '#FFF4D6', '#B89A5C', s * 0.04);
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      ctx.moveTo(x + w + s * 0.02, y + s * 0.2 + i * s * 0.02);
      ctx.lineTo(x + w + s * 0.02, y + h + s * 0.02);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(150,120,70,0.5)';
    ctx.stroke();
    // обложка
    G.rr(ctx, x, y, w, h, s * 0.12);
    fs(ctx, '#6A3FB5', '#3A1C75', s * 0.06);
    G.rr(ctx, x, y, s * 0.22, h, s * 0.1);
    fs(ctx, '#4E2A8E');
    // уголки
    ctx.fillStyle = '#FFC928';
    for (const [px, py, sx, sy] of [[x + w, y, -1, 1], [x + w, y + h, -1, -1]]) {
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + sx * s * 0.28, py);
      ctx.lineTo(px, py + sy * s * 0.28);
      ctx.closePath();
      ctx.fill();
    }
    // эмблема: звезда и месяц
    const ex = x + w * 0.58, ey = y + h * 0.45;
    G.circle(ctx, ex, ey, s * 0.36);
    fs(ctx, '#3A1C75', '#FFC928', s * 0.05);
    G.starPath(ctx, ex, ey + s * 0.02, s * 0.26, s * 0.11, 5, -PI / 2 + Math.sin(t) * 0.1);
    fs(ctx, '#FFE066');
    // закладка
    ctx.beginPath();
    ctx.moveTo(x + w * 0.75, y + h);
    ctx.lineTo(x + w * 0.75, y + h + s * 0.3);
    ctx.lineTo(x + w * 0.82, y + h + s * 0.22);
    ctx.lineTo(x + w * 0.89, y + h + s * 0.3);
    ctx.lineTo(x + w * 0.89, y + h);
    ctx.closePath();
    fs(ctx, '#FF4F7A');
  }

  const RAINBOW = ['#FF4F4F', '#FF9F2E', '#FFE04A', '#4FD86A', '#3FA8FF', '#9B5DE5'];

  function potion(ctx, cx, cy, s, t) {
    const by = cy + s * 0.25, r = s * 0.58;
    // горлышко
    G.rr(ctx, cx - s * 0.18, cy - s * 0.78, s * 0.36, s * 0.55, s * 0.06);
    fs(ctx, 'rgba(210,240,255,0.9)', '#5B7C99', s * 0.05);
    // пробка
    G.rr(ctx, cx - s * 0.22, cy - s * 0.98, s * 0.44, s * 0.26, s * 0.08);
    fs(ctx, '#B07A40', '#5D3A17', s * 0.05);
    // колба
    G.circle(ctx, cx, by, r);
    fs(ctx, 'rgba(225,245,255,0.95)', '#5B7C99', s * 0.06);
    // радужная жидкость
    ctx.save();
    G.circle(ctx, cx, by, r - s * 0.05);
    ctx.clip();
    const top = by - r * 0.25 + Math.sin(t * 3) * s * 0.03;
    const bandH = (r * 2) / RAINBOW.length;
    for (let i = 0; i < RAINBOW.length; i++) {
      ctx.fillStyle = RAINBOW[i];
      const yy = top + i * bandH * 0.62;
      ctx.beginPath();
      ctx.moveTo(cx - r, yy);
      for (let k = 0; k <= 8; k++) {
        const xx = cx - r + (k / 8) * 2 * r;
        ctx.lineTo(xx, yy + Math.sin(k * 1.2 + t * 4 + i) * s * 0.03);
      }
      ctx.lineTo(cx + r, by + r);
      ctx.lineTo(cx - r, by + r);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // пузырьки
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.8 + i / 3) % 1;
      G.circle(ctx, cx + (i - 1) * s * 0.2, by + r * 0.4 - ph * r * 0.9, s * 0.05 + i * s * 0.015);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.8 - ph * 0.6) + ')';
      ctx.fill();
    }
    // блик
    G.ellipse(ctx, cx - r * 0.45, by - r * 0.35, r * 0.14, r * 0.28, 0.5);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
  }

  function wishStar(ctx, cx, cy, s, t) {
    const rot = -PI / 2 + Math.sin(t * 1.5) * 0.12;
    G.starPath(ctx, cx, cy + s * 0.05, s * 0.95, s * 0.46, 5, rot);
    fs(ctx, '#FFD23F', '#D98B00', s * 0.07);
    G.starPath(ctx, cx - s * 0.06, cy - s * 0.02, s * 0.62, s * 0.3, 5, rot);
    ctx.fillStyle = '#FFE680';
    ctx.fill();
    // мордочка
    const bl = (t % 3) < 0.15;
    ctx.fillStyle = '#5A3A00';
    if (bl) {
      ctx.fillRect(cx - s * 0.26, cy - s * 0.02, s * 0.14, s * 0.04);
      ctx.fillRect(cx + s * 0.1, cy - s * 0.02, s * 0.14, s * 0.04);
    } else {
      G.ellipse(ctx, cx - s * 0.19, cy, s * 0.06, s * 0.09);
      ctx.fill();
      G.ellipse(ctx, cx + s * 0.17, cy, s * 0.06, s * 0.09);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx - s * 0.01, cy + s * 0.12, s * 0.13, 0.15 * PI, 0.85 * PI);
    ctx.lineWidth = s * 0.05;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5A3A00';
    ctx.stroke();
    G.ellipse(ctx, cx - s * 0.36, cy + s * 0.12, s * 0.08, s * 0.05);
    ctx.fillStyle = 'rgba(255,120,120,0.6)';
    ctx.fill();
    G.ellipse(ctx, cx + s * 0.34, cy + s * 0.12, s * 0.08, s * 0.05);
    ctx.fill();
  }

  // ---------- иконки миров ----------
  I.drawWorldIcon = function (ctx, id, cx, cy, s, t) {
    t = t || 0;
    switch (id) {
      case 'wand':
        wand(ctx, cx, cy, s * 0.95, t);
        for (let i = 0; i < 3; i++) {
          const tw = 0.5 + 0.5 * Math.sin(t * 4 + i * 2);
          G.sparkle(ctx, cx + [-0.6, 0.55, 0.1][i] * s, cy + [-0.4, 0.5, -0.85][i] * s, s * (0.08 + tw * 0.08), '#FFE680');
        }
        break;
      case 'web':
        web(ctx, cx, cy, s, t);
        break;
      case 'robot':
        robotIcon(ctx, cx, cy, s, t);
        break;
      case 'flower':
        flower(ctx, cx, cy, s, t);
        break;
      case 'bug':
        bug(ctx, cx, cy, s, t);
        break;
      case 'pot':
        pot(ctx, cx, cy, s, t);
        break;
      case 'tree':
        tree(ctx, cx, cy, s, t);
        break;
      case 'city':
        city(ctx, cx, cy, s, t);
        break;
      case 'net':
        net(ctx, cx, cy, s, t);
        break;
    }
  };

  function web(ctx, cx, cy, s, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#4A4A5E';
    ctx.lineWidth = s * 0.05;
    ctx.lineCap = 'round';
    const n = 8;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * s * 0.9, Math.sin(a) * s * 0.9);
    }
    ctx.stroke();
    ctx.beginPath();
    for (const rr of [0.25, 0.5, 0.75]) {
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * TAU;
        const px = Math.cos(a) * s * rr, py = Math.sin(a) * s * rr;
        if (i === 0) ctx.moveTo(px, py);
        else {
          const pa = ((i - 0.5) / n) * TAU;
          ctx.quadraticCurveTo(Math.cos(pa) * s * rr * 0.85, Math.sin(pa) * s * rr * 0.85, px, py);
        }
      }
    }
    ctx.stroke();
    // паучок
    const sy = s * 0.2 + Math.sin(t * 2) * s * 0.08;
    ctx.beginPath();
    ctx.moveTo(s * 0.45, -s * 0.9);
    ctx.lineTo(s * 0.45, sy - s * 0.1);
    ctx.lineWidth = s * 0.025;
    ctx.stroke();
    ctx.beginPath();
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        ctx.moveTo(s * 0.45, sy);
        ctx.lineTo(s * 0.45 + side * s * 0.2, sy - s * 0.1 + k * s * 0.09);
      }
    }
    ctx.lineWidth = s * 0.035;
    ctx.stroke();
    G.circle(ctx, s * 0.45, sy, s * 0.11);
    fs(ctx, '#E53935', '#7A1414', s * 0.03);
    G.circle(ctx, s * 0.42, sy - s * 0.02, s * 0.03);
    ctx.fillStyle = '#fff';
    ctx.fill();
    G.circle(ctx, s * 0.49, sy - s * 0.02, s * 0.03);
    ctx.fill();
    ctx.restore();
  }

  function robotIcon(ctx, cx, cy, s, t) {
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.55, cy + s * 0.1);
    ctx.lineTo(cx - s * 0.85, cy + s * 0.55);
    ctx.moveTo(cx + s * 0.55, cy + s * 0.1);
    ctx.lineTo(cx + s * 0.85, cy + s * 0.55);
    ctx.lineWidth = s * 0.1;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5E6E80';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.55);
    ctx.lineTo(cx, cy - s * 0.8);
    ctx.lineWidth = s * 0.07;
    ctx.stroke();
    G.circle(ctx, cx, cy - s * 0.85, s * 0.1);
    fs(ctx, Math.sin(t * 5) > 0 ? '#FF4A4A' : '#FFD23F');
    G.rr(ctx, cx - s * 0.6, cy - s * 0.58, s * 1.2, s * 1.05, s * 0.18);
    fs(ctx, '#9EC9F5', '#3A6EA8', s * 0.06);
    G.rr(ctx, cx - s * 0.44, cy - s * 0.42, s * 0.88, s * 0.52, s * 0.1);
    fs(ctx, '#20304A');
    G.circle(ctx, cx - s * 0.2, cy - s * 0.18, s * 0.09);
    fs(ctx, '#6CFFB0');
    G.circle(ctx, cx + s * 0.2, cy - s * 0.18, s * 0.09);
    fs(ctx, '#6CFFB0');
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.25, s * 0.14, 0.2 * PI, 0.8 * PI);
    ctx.lineWidth = s * 0.06;
    ctx.strokeStyle = '#3A6EA8';
    ctx.stroke();
  }

  function flower(ctx, cx, cy, s, t) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.9);
    ctx.quadraticCurveTo(cx - s * 0.1, cy + s * 0.4, cx, cy);
    ctx.lineWidth = s * 0.1;
    ctx.strokeStyle = '#2E9E48';
    ctx.stroke();
    G.ellipse(ctx, cx - s * 0.25, cy + s * 0.55, s * 0.24, s * 0.1, -0.5);
    fs(ctx, '#43C25E');
    G.ellipse(ctx, cx + s * 0.22, cy + s * 0.45, s * 0.24, s * 0.1, 0.5);
    fs(ctx, '#43C25E');
    const sw = Math.sin(t * 2) * 0.1;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + sw;
      G.ellipse(ctx, cx + Math.cos(a) * s * 0.33, cy - s * 0.25 + Math.sin(a) * s * 0.33, s * 0.24, s * 0.16, a);
      fs(ctx, i % 2 ? '#FF7EB6' : '#FF5A9E', '#C2185B', s * 0.03);
    }
    G.circle(ctx, cx, cy - s * 0.25, s * 0.2);
    fs(ctx, '#FFD23F', '#D98B00', s * 0.03);
  }

  function bug(ctx, cx, cy, s, t) {
    // божья коровка
    const x = cx - s * 0.1, y = cy + s * 0.25;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.3, y - s * 0.45);
    ctx.lineTo(x - s * 0.45, y - s * 0.7);
    ctx.moveTo(x + s * 0.05, y - s * 0.5);
    ctx.lineTo(x + s * 0.15, y - s * 0.75);
    ctx.lineWidth = s * 0.04;
    ctx.strokeStyle = '#222';
    ctx.stroke();
    G.circle(ctx, x - s * 0.12, y - s * 0.35, s * 0.2);
    fs(ctx, '#222');
    G.ellipse(ctx, x, y, s * 0.55, s * 0.45);
    fs(ctx, '#E53935', '#7A1414', s * 0.04);
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.45);
    ctx.lineTo(x, y + s * 0.45);
    ctx.lineWidth = s * 0.04;
    ctx.strokeStyle = '#7A1414';
    ctx.stroke();
    ctx.fillStyle = '#222';
    for (const [dx, dy] of [[-0.3, -0.12], [-0.25, 0.2], [0.28, -0.1], [0.25, 0.22], [-0.05, 0.3], [0.08, -0.25]]) {
      G.circle(ctx, x + dx * s, y + dy * s, s * 0.08);
      ctx.fill();
    }
    // эльфийский колпачок
    const hx = cx + s * 0.45, hy = cy - s * 0.35 + Math.sin(t * 2) * s * 0.04;
    ctx.beginPath();
    ctx.moveTo(hx - s * 0.28, hy + s * 0.2);
    ctx.quadraticCurveTo(hx, hy - s * 0.2, hx + s * 0.35, hy - s * 0.55);
    ctx.quadraticCurveTo(hx + s * 0.1, hy - s * 0.05, hx + s * 0.28, hy + s * 0.2);
    ctx.closePath();
    fs(ctx, '#43C25E', '#1E7A34', s * 0.04);
    G.circle(ctx, hx + s * 0.35, hy - s * 0.55, s * 0.08);
    fs(ctx, '#FFD23F');
    G.rr(ctx, hx - s * 0.32, hy + s * 0.14, s * 0.64, s * 0.12, s * 0.05);
    fs(ctx, '#2E9E48');
  }

  function pot(ctx, cx, cy, s, t) {
    // пар
    ctx.lineWidth = s * 0.07;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(150,170,200,0.7)';
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * s * 0.3;
      const ph = t * 2 + i;
      ctx.beginPath();
      ctx.moveTo(x, cy - s * 0.45);
      ctx.quadraticCurveTo(x + Math.sin(ph) * s * 0.15, cy - s * 0.65, x, cy - s * 0.85);
      ctx.stroke();
    }
    G.rr(ctx, cx - s * 0.75, cy - s * 0.2, s * 1.5, s * 0.85, s * 0.2);
    fs(ctx, '#FF7043', '#A63D1E', s * 0.05);
    G.rr(ctx, cx - s * 0.85, cy - s * 0.35, s * 1.7, s * 0.2, s * 0.08);
    fs(ctx, '#FF8A65', '#A63D1E', s * 0.05);
    G.rr(ctx, cx - s * 0.12, cy - s * 0.48, s * 0.24, s * 0.14, s * 0.05);
    fs(ctx, '#A63D1E');
    G.rr(ctx, cx - s * 1.0, cy - s * 0.08, s * 0.28, s * 0.14, s * 0.06);
    fs(ctx, '#A63D1E');
    G.rr(ctx, cx + s * 0.72, cy - s * 0.08, s * 0.28, s * 0.14, s * 0.06);
    fs(ctx, '#A63D1E');
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const dx of [-0.35, 0, 0.35]) {
      G.circle(ctx, cx + dx * s, cy + s * 0.25, s * 0.07);
      ctx.fill();
    }
  }

  function tree(ctx, cx, cy, s, t) {
    G.rr(ctx, cx - s * 0.13, cy, s * 0.26, s * 0.9, s * 0.08);
    fs(ctx, '#8B5A2B', '#5A3A18', s * 0.04);
    const sw = Math.sin(t * 1.5) * s * 0.03;
    ctx.fillStyle = '#2E9E48';
    for (const [dx, dy, r] of [[0, -0.3, 0.5], [-0.38, 0.05, 0.36], [0.38, 0.05, 0.36], [0, 0.12, 0.4]]) {
      G.circle(ctx, cx + dx * s + sw, cy + dy * s, r * s + s * 0.04);
      ctx.fill();
    }
    ctx.fillStyle = '#4CC764';
    for (const [dx, dy, r] of [[0, -0.3, 0.5], [-0.38, 0.05, 0.36], [0.38, 0.05, 0.36], [0, 0.12, 0.4]]) {
      G.circle(ctx, cx + dx * s + sw, cy + dy * s - s * 0.03, r * s);
      ctx.fill();
    }
    ctx.fillStyle = '#FF5A5A';
    for (const [dx, dy] of [[-0.25, -0.3], [0.2, -0.05], [-0.1, 0.2], [0.35, -0.35]]) {
      G.circle(ctx, cx + dx * s + sw, cy + dy * s, s * 0.07);
      ctx.fill();
    }
  }

  function city(ctx, cx, cy, s, t) {
    const b = [
      [-0.9, -0.2, 0.5, 1.1, '#7FA8E0'],
      [-0.35, -0.9, 0.6, 1.8, '#F5B041'],
      [0.3, -0.45, 0.55, 1.35, '#F78FB8'],
    ];
    for (const [x, y, w, h, c] of b) {
      G.rr(ctx, cx + x * s, cy + y * s, w * s, h * s, s * 0.06);
      fs(ctx, c, U.shade(c, -0.45), s * 0.04);
      ctx.fillStyle = 'rgba(255,255,230,0.9)';
      for (let yy = y + 0.12; yy < y + h - 0.25; yy += 0.28) {
        for (let xx = x + 0.1; xx < x + w - 0.12; xx += 0.22) {
          const on = (Math.sin(t * 0.8 + xx * 13 + yy * 7) > -0.3);
          ctx.fillStyle = on ? 'rgba(255,250,200,0.95)' : 'rgba(80,90,120,0.6)';
          ctx.fillRect(cx + xx * s, cy + yy * s, s * 0.12, s * 0.14);
        }
      }
    }
    G.rr(ctx, cx - s, cy + s * 0.88, s * 2, s * 0.08, s * 0.04);
    fs(ctx, '#5E6E80');
  }

  function net(ctx, cx, cy, s, t) {
    G.rr(ctx, cx - s * 0.85, cy - s * 0.55, s * 1.7, s * 1.15, s * 0.14);
    fs(ctx, '#3A4A62', '#1C2433', s * 0.05);
    G.rr(ctx, cx - s * 0.72, cy - s * 0.43, s * 1.44, s * 0.9, s * 0.08);
    fs(ctx, '#5ED3F3');
    G.rr(ctx, cx - s * 0.2, cy + s * 0.6, s * 0.4, s * 0.18, s * 0.04);
    fs(ctx, '#3A4A62');
    G.rr(ctx, cx - s * 0.45, cy + s * 0.76, s * 0.9, s * 0.1, s * 0.04);
    fs(ctx, '#3A4A62');
    // вай-фай волны
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const on = ((t * 2) % 3) >= i;
      ctx.beginPath();
      ctx.arc(cx, cy + s * 0.25, s * (0.18 + i * 0.18), -PI * 0.75, -PI * 0.25);
      ctx.lineWidth = s * 0.08;
      ctx.strokeStyle = on ? '#fff' : 'rgba(255,255,255,0.35)';
      ctx.stroke();
    }
    G.circle(ctx, cx, cy + s * 0.25, s * 0.07);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  // ---------- торт (значок праздника на карте) ----------
  I.drawCake = function (ctx, cx, cy, s, t) {
    G.ellipse(ctx, cx, cy + s * 0.72, s * 0.95, s * 0.16);
    fs(ctx, '#E0E6F0', '#9AA6B8', s * 0.03);
    G.rr(ctx, cx - s * 0.8, cy + s * 0.05, s * 1.6, s * 0.65, s * 0.12);
    fs(ctx, '#FF8FC0', '#B83A78', s * 0.04);
    G.rr(ctx, cx - s * 0.55, cy - s * 0.4, s * 1.1, s * 0.5, s * 0.1);
    fs(ctx, '#FFD6E8', '#B83A78', s * 0.04);
    // глазурь-капельки
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const x = cx - s * 0.8 + (i * s * 1.6) / 6;
      ctx.moveTo(x + s * 0.12, cy + s * 0.08);
      ctx.arc(x, cy + s * 0.08, s * 0.12, 0, PI);
    }
    ctx.fill();
    ctx.fillStyle = '#FF4F7A';
    for (const dx of [-0.5, -0.1, 0.3, 0.6]) {
      G.circle(ctx, cx + dx * s, cy + s * 0.42, s * 0.06);
      ctx.fill();
    }
    // свечки
    for (const dx of [-0.3, 0, 0.3]) {
      G.rr(ctx, cx + dx * s - s * 0.05, cy - s * 0.7, s * 0.1, s * 0.32, s * 0.03);
      fs(ctx, dx === 0 ? '#7FD3FF' : '#FFE066');
      const fl = Math.sin(t * 12 + dx * 10) * s * 0.02;
      G.ellipse(ctx, cx + dx * s + fl, cy - s * 0.8, s * 0.06, s * 0.1);
      fs(ctx, '#FFB300');
      G.ellipse(ctx, cx + dx * s + fl, cy - s * 0.78, s * 0.03, s * 0.05);
      fs(ctx, '#FFF6C0');
    }
  };
})(window.VW);
