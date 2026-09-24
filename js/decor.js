/* Vasilisa World — декор на земле сгенерированных сцен и «друзья», которые радуются касанию */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, Art = VW.Art, A = VW.Audio;
  const Sc = VW.Scenery;
  const TAU = Math.PI * 2;
  const fs = Art.fs;

  // Каждый декор: { w — полуширина, h — высота, big — можно ставить позади фигур, draw(ctx, d, t) }
  const D = (Sc.DECO = {});
  const def = (name, w, h, big, draw) => (D[name] = { w: w, h: h, big: big, draw: draw });

  // ---------- город ----------
  def('lamp', 30, 200, false, function (ctx, d, t) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 5, y - 190, 10, 190, 4);
    fs(ctx, '#4A4E66', '#2A2D3E', 2);
    ctx.beginPath();
    ctx.moveTo(x, y - 186);
    ctx.quadraticCurveTo(x + 4, y - 214, x + 34, y - 210);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#4A4E66';
    ctx.stroke();
    if (d.night) G.glow(ctx, x + 36, y - 196, 70, '#FFE680', 0.55);
    G.rr(ctx, x + 22, y - 214, 28, 14, 6);
    fs(ctx, d.night ? '#FFE680' : '#FFF6C8', '#2A2D3E', 2);
  });
  D.lampOn = { w: 30, h: 200, big: false, draw: (ctx, d, t) => D.lamp.draw(ctx, Object.assign({}, d, { night: true }), t) };
  def('hydrant', 20, 50, false, function (ctx, d) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 12, y - 44, 24, 44, 6);
    fs(ctx, '#E53935', '#7A1414', 2.5);
    G.rr(ctx, x - 16, y - 34, 32, 10, 4);
    fs(ctx, '#E53935', '#7A1414', 2);
    G.circle(ctx, x, y - 48, 9);
    fs(ctx, '#C62828', '#7A1414', 2);
  });
  def('bench', 60, 60, false, function (ctx, d) {
    const x = d.x, y = d.y;
    ctx.fillStyle = '#3A3F55';
    ctx.fillRect(x - 50, y - 30, 8, 30);
    ctx.fillRect(x + 42, y - 30, 8, 30);
    G.rr(ctx, x - 58, y - 36, 116, 10, 4);
    fs(ctx, '#C98D52', '#6A4520', 2);
    G.rr(ctx, x - 58, y - 62, 116, 10, 4);
    fs(ctx, '#C98D52', '#6A4520', 2);
    ctx.fillStyle = '#3A3F55';
    ctx.fillRect(x - 50, y - 62, 6, 30);
    ctx.fillRect(x + 44, y - 62, 6, 30);
  });
  // Паутинка на фоне (милая, с паучком)
  def('web', 70, 300, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 200 - (d.seed % 3) * 60;
    const R = 60;
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R);
    }
    for (const kk of [0.3, 0.55, 0.8, 1]) {
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * TAU;
        const px = x + Math.cos(a) * R * kk, py = y + Math.sin(a) * R * kk;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = d.night ? 'rgba(230,230,255,0.7)' : 'rgba(255,255,255,0.85)';
    ctx.stroke();
    const sy = y + 20 + Math.sin(t * 1.5 + d.seed) * 12;
    Sc.drawSpider(ctx, x + 16, sy, 0.7, t);
  });
  def('trafficLight', 20, 190, false, function (ctx, d, t) {
    const x = d.x, y = d.y;
    ctx.fillStyle = '#3A3F55';
    ctx.fillRect(x - 4, y - 130, 8, 130);
    G.rr(ctx, x - 16, y - 196, 32, 76, 8);
    fs(ctx, '#2E3246', '#15171F', 2);
    const ph = Math.floor((t + d.seed) / 3) % 3;
    ['#FF4A4A', '#FFD23F', '#4ADE80'].forEach((c, i) => {
      G.circle(ctx, x, y - 182 + i * 24, 8);
      ctx.fillStyle = i === ph ? c : U.shade(c, -0.6);
      ctx.fill();
    });
  });
  def('planter', 40, 110, false, function (ctx, d) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 26, y - 34, 52, 34, 6);
    fs(ctx, '#B0703F', '#6A4520', 2);
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(x - 4, y - 70, 8, 38);
    G.circle(ctx, x, y - 86, 30);
    fs(ctx, '#5FBF4A', '#2F7A2C', 2);
  });
  // Магазинчик с навесом и значком на вывеске
  def('shop', 120, 260, true, function (ctx, d) {
    const x = d.x, y = d.y;
    const c = ['#FFB74D', '#81C784', '#64B5F6', '#F06292'][d.seed % 4];
    G.rr(ctx, x - 110, y - 250, 220, 250, 6);
    fs(ctx, c, U.shade(c, -0.4), 3);
    G.rr(ctx, x - 90, y - 150, 110, 90, 6);
    fs(ctx, '#CDEBFF', '#5A6378', 3);
    G.rr(ctx, x + 36, y - 130, 50, 130, 6);
    fs(ctx, '#8B5A2B', '#4A2A10', 2.5);
    // навес
    ctx.beginPath();
    ctx.moveTo(x - 118, y - 176);
    ctx.lineTo(x + 118, y - 176);
    ctx.lineTo(x + 104, y - 150);
    ctx.lineTo(x - 104, y - 150);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#FF5A5A';
    for (let k = x - 118; k < x + 118; k += 26) ctx.fillRect(k, y - 180, 13, 34);
    ctx.restore();
    // вывеска со значком (хлеб, мишка, цветок, мороженое)
    G.rr(ctx, x - 70, y - 236, 140, 44, 10);
    fs(ctx, '#FFF8E6', '#8A6A3A', 2.5);
    const ix = x, iy = y - 214;
    const kind = d.seed % 4;
    if (kind === 0) {
      G.ellipse(ctx, ix, iy, 26, 12);
      fs(ctx, '#E0A868', '#8A5A2B', 2);
    } else if (kind === 1) {
      G.circle(ctx, ix, iy + 3, 12);
      fs(ctx, '#C98D52', '#6A4520', 2);
      G.circle(ctx, ix - 10, iy - 8, 6);
      fs(ctx, '#C98D52', '#6A4520', 2);
      G.circle(ctx, ix + 10, iy - 8, 6);
      fs(ctx, '#C98D52', '#6A4520', 2);
    } else if (kind === 2) {
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU;
        G.circle(ctx, ix + Math.cos(a) * 9, iy + Math.sin(a) * 9, 7);
        ctx.fillStyle = '#FF6FA8';
        ctx.fill();
      }
      G.circle(ctx, ix, iy, 5);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(ix - 10, iy - 2);
      ctx.lineTo(ix, iy + 18);
      ctx.lineTo(ix + 10, iy - 2);
      ctx.closePath();
      fs(ctx, '#E0A868', '#8A5A2B', 2);
      G.circle(ctx, ix, iy - 6, 10);
      fs(ctx, '#FF9EC8', '#C2185B', 2);
    }
  });

  // ---------- парк ----------
  def('parkTree', 90, 320, true, function (ctx, d) {
    const x = d.x, y = d.y, s = d.s;
    ctx.beginPath();
    ctx.moveTo(x - 14 * s, y);
    ctx.lineTo(x - 9 * s, y - 150 * s);
    ctx.lineTo(x + 9 * s, y - 150 * s);
    ctx.lineTo(x + 14 * s, y);
    ctx.closePath();
    fs(ctx, d.night ? '#3A2F55' : '#8B5A2B', d.night ? '#221A38' : '#5A3515', 2.5);
    const c = d.night ? '#23305E' : ['#5FBF4A', '#4CAE48', '#7CC364'][d.seed % 3];
    for (const [dx, dy, r] of [[-40, -170, 56], [40, -175, 52], [0, -220, 64]]) {
      G.circle(ctx, x + dx * s, y + dy * s, r * s);
      fs(ctx, c, U.shade(c, -0.35), 2.5);
    }
  });
  def('flowerbed', 70, 40, false, function (ctx, d, t) {
    G.rr(ctx, d.x - 66, d.y - 20, 132, 20, 8);
    fs(ctx, '#8A5A32', '#5E3A1E', 2);
    const cols = ['#FF5A9E', '#FFD23F', '#FF8C1A', '#B983FF'];
    for (let k = 0; k < 6; k++) Art.flower(ctx, d.x - 55 + k * 22, d.y - 20, 6, cols[(k + d.seed) % 4], t);
  });
  // Фонтан (вода брызжет)
  def('fountain', 130, 200, true, function (ctx, d, t) {
    const x = d.x, y = d.y;
    ctx.fillStyle = 'rgba(160,220,255,0.7)';
    for (let k = 0; k < 7; k++) {
      const ph = (t * 1.2 + k / 7) % 1;
      const a = -Math.PI / 2 + (k - 3) * 0.22;
      const px = x + Math.cos(a) * ph * 120, py = y - 90 + Math.sin(a) * ph * 160 + ph * ph * 180;
      G.circle(ctx, px, py, 6 * (1 - ph) + 2);
      ctx.fill();
    }
    G.rr(ctx, x - 8, y - 100, 16, 60, 6);
    fs(ctx, '#D8DCE8', '#8E9AB2', 2);
    G.ellipse(ctx, x, y - 100, 30, 8);
    fs(ctx, '#E8ECF4', '#8E9AB2', 2);
    G.rr(ctx, x - 120, y - 44, 240, 44, 14);
    fs(ctx, '#D8DCE8', '#8E9AB2', 3);
    G.rr(ctx, x - 108, y - 40, 216, 16, 8);
    ctx.fillStyle = '#8FDBFF';
    ctx.fill();
  });

  // ---------- роботы ----------
  def('gear', 110, 400, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 200 - (d.seed % 3) * 70, R = 60 + (d.seed % 4) * 14;
    const rot = t * (d.seed % 2 ? 0.4 : -0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    const n = 10;
    for (let k = 0; k < n * 2; k++) {
      const a = (k / (n * 2)) * TAU;
      const rr = k % 2 ? R : R + 16;
      ctx.lineTo(Math.cos(a - 0.12) * rr, Math.sin(a - 0.12) * rr);
      ctx.lineTo(Math.cos(a + 0.12) * rr, Math.sin(a + 0.12) * rr);
    }
    ctx.closePath();
    fs(ctx, 'rgba(143,163,192,0.9)', 'rgba(79,98,131,0.9)', 3);
    G.circle(ctx, 0, 0, R * 0.4);
    ctx.fillStyle = 'rgba(79,98,131,0.9)';
    ctx.fill();
    G.circle(ctx, 0, 0, R * 0.15);
    ctx.fillStyle = 'rgba(200,210,230,0.9)';
    ctx.fill();
    ctx.restore();
  });
  def('pipes', 150, 500, true, function (ctx, d) {
    const x = d.x, y = d.y;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 140, y - 60);
    ctx.lineTo(x - 140, y - 320);
    ctx.quadraticCurveTo(x - 140, y - 360, x - 100, y - 360);
    ctx.lineTo(x + 140, y - 360);
    ctx.lineWidth = 26;
    ctx.strokeStyle = '#8E9AB2';
    ctx.stroke();
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.stroke();
    for (const [px, py] of [[x - 140, y - 200], [x, y - 360]]) {
      G.rr(ctx, px - 18, py - 18, 36, 36, 6);
      fs(ctx, '#FF9A3C', '#8A4A10', 2.5);
    }
  });
  def('lampRed', 20, 400, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 300 - (d.seed % 3) * 40;
    const on = Math.sin(t * 3 + d.seed) > 0;
    G.glow(ctx, x, y, 40, on ? '#FF4A4A' : '#4AFF8A', 0.5);
    G.circle(ctx, x, y, 10);
    ctx.fillStyle = on ? '#FF6A6A' : '#6AFFA0';
    ctx.fill();
    G.rr(ctx, x - 14, y + 8, 28, 8, 3);
    fs(ctx, '#4A5A78');
  });
  // Робот-помощник на заднем плане (машет)
  def('robotBack', 50, 160, true, function (ctx, d, t) {
    Sc.drawRobot(ctx, d.x, d.y, 0.9, t + d.seed, false);
  });
  def('rack', 150, 380, true, function (ctx, d) {
    const x = d.x, y = d.y;
    ctx.fillStyle = '#FF9A3C';
    ctx.fillRect(x - 140, y - 360, 10, 360);
    ctx.fillRect(x + 130, y - 360, 10, 360);
    for (let k = 1; k <= 3; k++) {
      const sy = y - k * 110;
      ctx.fillStyle = '#3D7BD9';
      ctx.fillRect(x - 140, sy, 280, 10);
      for (let b = 0; b < 4; b++) {
        const bw = 44 + ((b * 7 + d.seed) % 3) * 10;
        const bx = x - 126 + b * 66;
        const bh = 40 + ((b + k + d.seed) % 3) * 16;
        G.rr(ctx, bx, sy - bh, bw, bh, 3);
        fs(ctx, '#D9A96A', '#8A5E2E', 2);
      }
    }
  });
  def('hangLamp', 40, 600, true, function (ctx, d) {
    const x = d.x, y = d.y - 480;
    ctx.beginPath();
    ctx.moveTo(x, y - 600);
    ctx.lineTo(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3A3F55';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,240,180,0.18)';
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 20);
    ctx.lineTo(x + 20, y + 20);
    ctx.lineTo(x + 130, y + 380);
    ctx.lineTo(x - 130, y + 380);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 24);
    ctx.lineTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.lineTo(x + 30, y + 24);
    ctx.closePath();
    fs(ctx, '#4A5A78', '#2A3348', 2);
    G.circle(ctx, x, y + 26, 8);
    ctx.fillStyle = '#FFF3B0';
    ctx.fill();
  });
  def('barrel', 30, 70, false, function (ctx, d) {
    G.rr(ctx, d.x - 26, d.y - 66, 52, 66, 12);
    const c = ['#3D7BD9', '#E0533F', '#2FBF55'][d.seed % 3];
    fs(ctx, c, U.shade(c, -0.45), 2.5);
    ctx.fillStyle = U.shade(c, -0.3);
    ctx.fillRect(d.x - 26, d.y - 50, 52, 6);
    ctx.fillRect(d.x - 26, d.y - 20, 52, 6);
  });

  // ---------- растения ----------
  def('fence', 110, 90, true, function (ctx, d) {
    const x = d.x, y = d.y;
    ctx.fillStyle = '#E8C08A';
    ctx.fillRect(x - 110, y - 56, 220, 10);
    ctx.fillRect(x - 110, y - 26, 220, 10);
    for (let k = 0; k < 7; k++) {
      const px = x - 104 + k * 34;
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, y - 74);
      ctx.lineTo(px + 11, y - 86);
      ctx.lineTo(px + 22, y - 74);
      ctx.lineTo(px + 22, y);
      ctx.closePath();
      fs(ctx, '#F2D2A0', '#A0703F', 2);
    }
  });
  def('sunflower', 40, 260, true, function (ctx, d, t) {
    const x = d.x, y = d.y, h = 180 + (d.seed % 4) * 25;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y - h / 2, x, y - h);
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#4CA83A';
    ctx.stroke();
    G.ellipse(ctx, x + 16, y - h * 0.45, 18, 8, 0.5);
    fs(ctx, '#5FBF4A', '#2F7A2C', 1.5);
    const sw = Math.sin(t * 1.2 + d.seed) * 0.08;
    ctx.save();
    ctx.translate(x, y - h);
    ctx.rotate(sw);
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * TAU;
      G.ellipse(ctx, Math.cos(a) * 26, Math.sin(a) * 26, 14, 6, a);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
    }
    G.circle(ctx, 0, 0, 18);
    fs(ctx, '#7A4A20', '#4A2A10', 2);
    ctx.restore();
  });
  def('cabbage', 40, 50, false, function (ctx, d) {
    for (const [dx, r, c] of [[-14, 18, '#7CD35A'], [14, 18, '#7CD35A'], [0, 22, '#A8E68A']]) {
      G.circle(ctx, d.x + dx, d.y - 20, r);
      fs(ctx, c, '#3E8E36', 2);
    }
    ctx.beginPath();
    ctx.moveTo(d.x, d.y - 40);
    ctx.lineTo(d.x, d.y - 8);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#5FBF4A';
    ctx.stroke();
    // морковки рядом
    for (const dx of [36, 52]) {
      ctx.beginPath();
      ctx.moveTo(d.x + dx - 5, d.y - 4);
      ctx.lineTo(d.x + dx, d.y - 22);
      ctx.lineTo(d.x + dx + 5, d.y - 4);
      ctx.moveTo(d.x + dx, d.y - 22);
      ctx.lineTo(d.x + dx - 6, d.y - 34);
      ctx.moveTo(d.x + dx, d.y - 22);
      ctx.lineTo(d.x + dx + 6, d.y - 36);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#4CA83A';
      ctx.stroke();
    }
  });
  // Добрый огородный помощник-пугало (соломенная шляпа, улыбка)
  def('scarecrow', 60, 230, true, function (ctx, d, t) {
    const x = d.x, y = d.y;
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(x - 5, y - 200, 10, 200);
    ctx.fillRect(x - 70, y - 150, 140, 9);
    G.rr(ctx, x - 32, y - 160, 64, 80, 12);
    fs(ctx, '#5B8DEF', '#2A4A90', 2.5);
    ctx.fillStyle = '#FFD23F';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * 70, y - 152);
      ctx.lineTo(x + s * 84, y - 160 + Math.sin(t * 2) * 3);
      ctx.lineTo(x + s * 82, y - 140);
      ctx.closePath();
      ctx.fill();
    }
    G.circle(ctx, x, y - 186, 24);
    fs(ctx, '#F2D2A0', '#A0703F', 2);
    G.circle(ctx, x - 8, y - 190, 3);
    ctx.fillStyle = '#3A2A10';
    ctx.fill();
    G.circle(ctx, x + 8, y - 190, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - 182, 9, 0.3, Math.PI - 0.3);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#3A2A10';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, y - 206, 40, 9, 0, 0, TAU);
    ctx.fillStyle = '#E8C060';
    ctx.fill();
    G.rr(ctx, x - 20, y - 230, 40, 26, 8);
    fs(ctx, '#E8C060', '#A0803A', 2);
  });
  def('bigPlant', 90, 260, true, function (ctx, d) {
    const x = d.x, y = d.y;
    Art.flowerPot(ctx, x, y, 2.2, '#E07A4F', 3);
    for (const [a, l] of [[-0.9, 150], [-0.4, 190], [0.2, 180], [0.7, 150], [1.1, 120]]) {
      ctx.save();
      ctx.translate(x, y - 58);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -l);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#3E8E36';
      ctx.stroke();
      G.ellipse(ctx, 0, -l, 34, 22, 0);
      fs(ctx, '#4FAF4A', '#2F7A2C', 2);
      ctx.restore();
    }
  });
  def('hangVine', 40, 600, true, function (ctx, d, t) {
    const x = d.x;
    const top = 0, bottom = d.y - 260 - (d.seed % 3) * 60;
    ctx.beginPath();
    ctx.moveTo(x, top);
    for (let y = top; y < bottom; y += 20) ctx.lineTo(x + Math.sin(y * 0.03 + t) * 6, y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3E8E36';
    ctx.stroke();
    for (let y = bottom - 400; y < bottom; y += 44) {
      if (y < top) continue;
      G.ellipse(ctx, x + ((y / 44) % 2 ? 10 : -10) + Math.sin(y * 0.03 + t) * 6, y, 10, 6, (y / 44) % 2 ? 0.6 : -0.6);
      fs(ctx, '#62C24F', '#2F7A2C', 1.5);
    }
  });
  def('canDeco', 40, 60, false, function (ctx, d) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 22, y - 44, 44, 44, 8);
    fs(ctx, '#4FC3F7', '#1E6A90', 2.5);
    ctx.beginPath();
    ctx.moveTo(x + 20, y - 34);
    ctx.lineTo(x + 46, y - 58);
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4FC3F7';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - 20, y - 26, 14, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1E6A90';
    ctx.stroke();
  });

  // ---------- эльфы и жучки ----------
  def('mushBig', 90, 260, true, function (ctx, d) {
    const x = d.x, y = d.y, s = d.s;
    const c = ['#F0433A', '#B5651D', '#9A55E8', '#FF8C1A'][d.seed % 4];
    G.rr(ctx, x - 18 * s, y - 150 * s, 36 * s, 150 * s, 14 * s);
    fs(ctx, '#FFF1D6', '#B89A6A', 2.5);
    ctx.beginPath();
    ctx.moveTo(x - 90 * s, y - 140 * s);
    ctx.quadraticCurveTo(x, y - 260 * s, x + 90 * s, y - 140 * s);
    ctx.closePath();
    fs(ctx, c, U.shade(c, -0.45), 3);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [dx, dy] of [[-45, -160], [0, -196], [42, -164], [-18, -176]]) {
      G.ellipse(ctx, x + dx * s, y + dy * s, 9 * s, 6 * s);
      ctx.fill();
    }
  });
  // Домик эльфов в грибе
  def('elfHouse', 70, 200, true, function (ctx, d, t) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 50, y - 120, 100, 120, 30);
    fs(ctx, '#FFF1D6', '#B89A6A', 3);
    G.rr(ctx, x - 16, y - 56, 32, 56, 16);
    fs(ctx, '#B06A30', '#5A3210', 2.5);
    G.circle(ctx, x + 7, y - 28, 3);
    ctx.fillStyle = '#FFD23F';
    ctx.fill();
    G.circle(ctx, x - 30, y - 84, 11);
    fs(ctx, '#FFE680', '#B89A6A', 2);
    ctx.beginPath();
    ctx.moveTo(x - 72, y - 104);
    ctx.quadraticCurveTo(x, y - 210, x + 72, y - 104);
    ctx.closePath();
    fs(ctx, '#E85D9A', '#8E2A5A', 3);
    ctx.fillStyle = '#fff';
    for (const [dx, dy] of [[-36, -120], [4, -150], [34, -122]]) {
      G.ellipse(ctx, x + dx, y + dy, 8, 5);
      ctx.fill();
    }
    // дымок из трубы
    G.rr(ctx, x + 30, y - 164, 14, 30, 4);
    fs(ctx, '#B06A30', '#5A3210', 2);
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.4 + k / 3) % 1;
      G.circle(ctx, x + 37 + Math.sin(ph * 5) * 6, y - 170 - ph * 70, 6 + ph * 8);
      ctx.fillStyle = 'rgba(255,255,255,' + 0.6 * (1 - ph) + ')';
      ctx.fill();
    }
  });
  def('flowers', 50, 40, false, function (ctx, d, t) {
    const cols = ['#FF5A9E', '#FFD23F', '#FF8C1A', '#B983FF', '#FFFFFF', '#5AC8FA'];
    for (let k = 0; k < 5; k++) Art.flower(ctx, d.x - 40 + k * 20, d.y + 2, 5 + (k % 2) * 2, cols[(k + d.seed) % cols.length], t);
  });
  def('grassTuft', 30, 40, false, function (ctx, d, t) {
    ctx.fillStyle = '#4CAE48';
    ctx.beginPath();
    for (let k = -2; k <= 2; k++) {
      const sw = Math.sin(t * 2 + d.x + k) * 3;
      ctx.moveTo(d.x + k * 7 - 4, d.y);
      ctx.quadraticCurveTo(d.x + k * 9, d.y - 20, d.x + k * 12 + sw, d.y - 34 + Math.abs(k) * 6);
      ctx.quadraticCurveTo(d.x + k * 8 + 2, d.y - 16, d.x + k * 7 + 4, d.y);
    }
    ctx.fill();
  });
  def('grassBlade', 60, 420, true, function (ctx, d, t) {
    const h = 260 + (d.seed % 5) * 40;
    const sw = Math.sin(t * 0.8 + d.seed) * 10;
    ctx.beginPath();
    ctx.moveTo(d.x - 16, d.y);
    ctx.quadraticCurveTo(d.x - 6, d.y - h * 0.6, d.x + 20 + sw, d.y - h);
    ctx.quadraticCurveTo(d.x + 8, d.y - h * 0.55, d.x + 16, d.y);
    ctx.closePath();
    fs(ctx, '#6CC24A', '#3E8E36', 2);
  });
  def('snailHouse', 80, 140, true, function (ctx, d) {
    const x = d.x, y = d.y;
    G.circle(ctx, x, y - 64, 62);
    fs(ctx, '#F5B041', '#A0642A', 3);
    ctx.beginPath();
    for (let a = 0; a < TAU * 2.4; a += 0.2) {
      const r = 6 + a * 3.6;
      const px = x + Math.cos(a) * r, py = y - 64 + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#C07A2A';
    ctx.stroke();
    G.rr(ctx, x - 14, y - 40, 28, 40, 14);
    fs(ctx, '#8B5A2B', '#4A2A10', 2);
    G.circle(ctx, x + 26, y - 94, 10);
    fs(ctx, '#BFE8FF', '#A0642A', 2);
  });
  def('dandelion', 40, 220, true, function (ctx, d, t) {
    const x = d.x, y = d.y, h = 150 + (d.seed % 3) * 30;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 8, y - h / 2, x, y - h);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#5DBB46';
    ctx.stroke();
    ctx.beginPath();
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * TAU + t * 0.1;
      ctx.moveTo(x, y - h);
      ctx.lineTo(x + Math.cos(a) * 28, y - h + Math.sin(a) * 28);
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.stroke();
    G.circle(ctx, x, y - h, 6);
    ctx.fillStyle = '#E8E8D0';
    ctx.fill();
  });
  def('beetleHouse', 80, 130, true, function (ctx, d) {
    const x = d.x, y = d.y;
    ctx.beginPath();
    ctx.moveTo(x - 70, y);
    ctx.quadraticCurveTo(x - 72, y - 120, x, y - 124);
    ctx.quadraticCurveTo(x + 72, y - 120, x + 70, y);
    ctx.closePath();
    fs(ctx, '#2FA870', '#1A6A40', 3);
    ctx.beginPath();
    ctx.moveTo(x, y - 124);
    ctx.lineTo(x, y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1A6A40';
    ctx.stroke();
    G.rr(ctx, x - 16, y - 46, 32, 46, 16);
    fs(ctx, '#FFE680', '#A0803A', 2.5);
    for (const dx of [-36, 36]) {
      G.circle(ctx, x + dx, y - 70, 10);
      fs(ctx, '#BFE8FF', '#1A6A40', 2);
    }
  });

  // ---------- кухня ----------
  def('jar', 30, 70, false, function (ctx, d) {
    const x = d.x, y = d.y;
    const c = ['#FF5A7A', '#FFB300', '#9A55E8'][d.seed % 3];
    G.rr(ctx, x - 24, y - 60, 48, 60, 10);
    fs(ctx, 'rgba(220,240,255,0.85)', '#7A8AA0', 2.5);
    G.rr(ctx, x - 20, y - 40, 40, 36, 8);
    ctx.fillStyle = c;
    ctx.fill();
    G.rr(ctx, x - 26, y - 70, 52, 14, 5);
    fs(ctx, '#FFFFFF', '#C98D52', 2);
    ctx.fillStyle = '#FF5A5A';
    for (let k = 0; k < 4; k++) ctx.fillRect(x - 24 + k * 13, y - 70, 7, 14);
  });
  def('plates', 60, 110, true, function (ctx, d) {
    const x = d.x, y = d.y - 60;
    for (let k = 0; k < 3; k++) {
      G.circle(ctx, x - 40 + k * 40, y - 30, 26);
      fs(ctx, '#FFFFFF', '#9AA6B8', 2.5);
      G.circle(ctx, x - 40 + k * 40, y - 30, 16);
      ctx.lineWidth = 3;
      ctx.strokeStyle = ['#4FC3F7', '#FF8FB8', '#FFD23F'][k];
      ctx.stroke();
    }
    G.rr(ctx, x - 76, y, 152, 10, 4);
    fs(ctx, '#C98D52', '#6A4520', 2);
  });
  def('cups', 60, 400, true, function (ctx, d) {
    const x = d.x, y = d.y - 330;
    G.rr(ctx, x - 70, y - 8, 140, 10, 4);
    fs(ctx, '#C98D52', '#6A4520', 2);
    for (let k = 0; k < 3; k++) {
      const cx = x - 44 + k * 44;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(cx, y + 16);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6A4520';
      ctx.stroke();
      G.rr(ctx, cx - 14, y + 16, 28, 26, 7);
      const c = ['#8FD3FF', '#FF8FB8', '#9BE08A'][k];
      fs(ctx, c, U.shade(c, -0.45), 2);
    }
  });
  def('clock', 50, 520, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 420;
    G.circle(ctx, x, y, 44);
    fs(ctx, '#FFF8E6', '#C98D52', 6);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU;
      G.circle(ctx, x + Math.cos(a) * 34, y + Math.sin(a) * 34, 2.5);
      ctx.fillStyle = '#8A5A2B';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(t * 0.2 - 1.5) * 24, y + Math.sin(t * 0.2 - 1.5) * 24);
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(t * 1.2) * 32, y + Math.sin(t * 1.2) * 32);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3A2A1A';
    ctx.stroke();
  });
  def('kWindow', 120, 560, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 330;
    G.rr(ctx, x - 100, y - 170, 200, 170, 10);
    ctx.fillStyle = G.vGrad(ctx, y - 170, y, ['#8FD3FF', '#DFF4FF']);
    ctx.fill();
    G.cloud(ctx, x - 70 + Math.sin(t * 0.2) * 20, y - 140, 90, 36, '#fff');
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - 170);
    ctx.lineTo(x, y);
    ctx.moveTo(x - 100, y - 85);
    ctx.lineTo(x + 100, y - 85);
    ctx.lineWidth = 6;
    ctx.stroke();
    // занавески
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * 112, y - 186);
      ctx.quadraticCurveTo(x + s * 70, y - 100, x + s * 104, y + 6);
      ctx.lineTo(x + s * 124, y + 6);
      ctx.lineTo(x + s * 124, y - 186);
      ctx.closePath();
      fs(ctx, '#FF9EC8', '#C2185B', 2);
    }
  });
  def('stoveBody', 150, 200, true, function (ctx, d, t) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 140, y - 170, 280, 170, 10);
    fs(ctx, '#F4F6FA', '#8E9AB2', 3);
    G.rr(ctx, x - 110, y - 120, 220, 100, 10);
    fs(ctx, '#3A3F50', '#1E222E', 3);
    G.rr(ctx, x - 96, y - 108, 192, 76, 8);
    ctx.fillStyle = 'rgba(255,160,80,' + (0.35 + 0.1 * Math.sin(t * 3)) + ')';
    ctx.fill();
    for (let k = 0; k < 4; k++) {
      G.circle(ctx, x - 90 + k * 60, y - 150, 9);
      fs(ctx, '#FF5A5A', '#8E2A2A', 2);
    }
    G.rr(ctx, x - 144, y - 184, 288, 16, 6);
    fs(ctx, '#5A6378', '#2E3440', 2);
  });
  def('kettle', 50, 90, false, function (ctx, d, t) {
    const x = d.x, y = d.y;
    G.ellipse(ctx, x, y - 34, 34, 32);
    fs(ctx, '#E0533F', '#8E2A2A', 3);
    ctx.beginPath();
    ctx.moveTo(x + 28, y - 44);
    ctx.lineTo(x + 54, y - 64);
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#E0533F';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y - 64, 20, Math.PI, 0);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#3A2A1A';
    ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.6 + k / 3) % 1;
      G.circle(ctx, x + 58 + ph * 20, y - 70 - ph * 50, 6 + ph * 10);
      ctx.fillStyle = 'rgba(255,255,255,' + 0.6 * (1 - ph) + ')';
      ctx.fill();
    }
  });
  def('utensils', 80, 480, true, function (ctx, d) {
    const x = d.x, y = d.y - 380;
    G.rr(ctx, x - 80, y - 6, 160, 10, 4);
    fs(ctx, '#8E9AB2', '#4A546A', 2);
    const items = ['ladle', 'spatula', 'whisk', 'spoon'];
    items.forEach((it, k) => {
      const ux = x - 60 + k * 40;
      ctx.beginPath();
      ctx.moveTo(ux, y);
      ctx.lineTo(ux, y + 90);
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      if (it === 'ladle') {
        G.circle(ctx, ux, y + 100, 14);
        fs(ctx, '#C9D3E8', '#5A6378', 2);
      } else if (it === 'spatula') {
        G.rr(ctx, ux - 10, y + 88, 20, 30, 4);
        fs(ctx, '#FF8FB8', '#C2185B', 2);
      } else if (it === 'whisk') {
        G.ellipse(ctx, ux, y + 106, 10, 20);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8E9AB2';
        ctx.stroke();
      } else {
        G.ellipse(ctx, ux, y + 100, 9, 13);
        fs(ctx, '#FFD23F', '#B87800', 2);
      }
    });
  });

  // ---------- лес ----------
  def('birch', 40, 900, true, function (ctx, d) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 20, -40, 40, y + 44, 12);
    fs(ctx, '#F7F7F2', '#9A9A90', 2);
    ctx.fillStyle = '#2E2E2E';
    for (let yy = y - 20; yy > 0; yy -= 50) {
      const k = ((yy * 13 + d.seed) % 7) / 7;
      ctx.fillRect(x - 20 + k * 16, yy, 12 + k * 10, 5);
    }
    for (let yy = 80; yy < y - 300; yy += 170) {
      G.circle(ctx, x + ((yy / 170) % 2 ? 40 : -40), yy, 44);
      fs(ctx, '#8FD36A', '#5FA848', 2);
    }
  });
  def('bush', 60, 70, false, function (ctx, d) {
    for (const [dx, dy, r] of [[-26, -24, 26], [22, -26, 28], [0, -40, 30]]) {
      G.circle(ctx, d.x + dx, d.y + dy, r);
      fs(ctx, '#4CAE48', '#2F8A38', 2);
    }
  });
  def('fern', 40, 60, false, function (ctx, d, t) {
    for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(a + Math.sin(t * 1.5 + d.x) * 0.04);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(6, -30, 0, -56);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3E9E36';
      ctx.stroke();
      for (let k = 1; k < 6; k++) {
        G.ellipse(ctx, 0, -k * 10, 9 - k, 3, 0);
        ctx.fillStyle = '#5FBF4A';
        ctx.fill();
      }
      ctx.restore();
    }
  });
  def('mushSmall', 30, 40, false, function (ctx, d) {
    Art.smallMushroom(ctx, d.x, d.y, 1.2);
    Art.smallMushroom(ctx, d.x + 22, d.y, 0.8);
  });
  def('berryBush', 70, 90, false, function (ctx, d) {
    for (const [dx, dy, r] of [[-30, -28, 30], [26, -30, 32], [0, -48, 34]]) {
      G.circle(ctx, d.x + dx, d.y + dy, r);
      fs(ctx, '#3E9E3A', '#2A7A2A', 2);
    }
    const c = ['#E0305A', '#3A4AD0', '#FF5A5A'][d.seed % 3];
    for (let k = 0; k < 9; k++) {
      G.circle(ctx, d.x - 44 + ((k * 37) % 90), d.y - 20 - ((k * 23) % 50), 5);
      ctx.fillStyle = c;
      ctx.fill();
    }
  });
  def('bigStrawberry', 40, 80, false, function (ctx, d) {
    const x = d.x, y = d.y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 40, y - 20, x - 36, y - 64, x, y - 60);
    ctx.bezierCurveTo(x + 36, y - 64, x + 40, y - 20, x, y);
    ctx.closePath();
    fs(ctx, '#F0304A', '#8E0A26', 2.5);
    ctx.fillStyle = '#FFE680';
    for (let k = 0; k < 8; k++) {
      G.ellipse(ctx, x - 18 + ((k * 13) % 36), y - 14 - ((k * 17) % 40), 2, 3);
      ctx.fill();
    }
    for (const a of [-0.8, 0, 0.8]) {
      G.ellipse(ctx, x + Math.sin(a) * 14, y - 64, 10, 5, a);
      fs(ctx, '#4CAE48', '#2F7A2C', 1.5);
    }
  });

  // ---------- интернет ----------
  def('winFloat', 110, 400, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 260 - (d.seed % 3) * 70 + Math.sin(t + d.seed) * 8;
    const c = ['#FF6FA8', '#4FC3F7', '#FFD54F', '#7CD35A'][d.seed % 4];
    ctx.globalAlpha = 0.75;
    G.rr(ctx, x - 90, y - 60, 180, 120, 12);
    fs(ctx, '#FFFFFF', U.shade(c, -0.4), 3);
    ctx.fillStyle = c;
    ctx.fillRect(x - 88, y - 58, 176, 18);
    // картинка: котик-смайлик
    G.circle(ctx, x, y + 14, 28);
    fs(ctx, '#FFD23F', '#D98B00', 2);
    ctx.beginPath();
    ctx.moveTo(x - 24, y);
    ctx.lineTo(x - 18, y - 22);
    ctx.lineTo(x - 6, y - 12);
    ctx.moveTo(x + 24, y);
    ctx.lineTo(x + 18, y - 22);
    ctx.lineTo(x + 6, y - 12);
    ctx.fillStyle = '#FFD23F';
    ctx.fill();
    G.circle(ctx, x - 10, y + 10, 3);
    ctx.fillStyle = '#5A3A00';
    ctx.fill();
    G.circle(ctx, x + 10, y + 10, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y + 16, 9, 0.3, Math.PI - 0.3);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#5A3A00';
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  def('loader', 40, 400, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 320;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU + t * 3;
      G.circle(ctx, x + Math.cos(a) * 26, y + Math.sin(a) * 26, 6);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + (k / 8) * 0.75) + ')';
      ctx.fill();
    }
  });
  def('pixelTree', 60, 220, true, function (ctx, d) {
    const x = Math.round(d.x / 20) * 20, y = d.y;
    ctx.fillStyle = '#9A6A3A';
    ctx.fillRect(x - 10, y - 100, 20, 100);
    ctx.fillStyle = '#3E9E36';
    ctx.fillRect(x - 60, y - 200, 120, 100);
    ctx.fillRect(x - 40, y - 220, 80, 20);
    ctx.fillStyle = '#5FBF4A';
    ctx.fillRect(x - 40, y - 190, 40, 20);
    ctx.fillRect(x + 20, y - 160, 20, 20);
  });
  def('pixelFlower', 20, 60, false, function (ctx, d) {
    const x = Math.round(d.x / 10) * 10, y = d.y;
    ctx.fillStyle = '#3E9E36';
    ctx.fillRect(x - 3, y - 30, 6, 30);
    ctx.fillStyle = ['#FF6FA8', '#FFD54F', '#4FC3F7'][d.seed % 3];
    ctx.fillRect(x - 12, y - 48, 24, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 4, y - 43, 8, 8);
  });
  def('pixelCloud', 80, 600, true, function (ctx, d, t) {
    const x = Math.round((d.x + Math.sin(t * 0.2 + d.seed) * 30) / 10) * 10, y = d.y - 420 - (d.seed % 3) * 60;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 60, y, 120, 30);
    ctx.fillRect(x - 40, y - 20, 60, 20);
    ctx.fillRect(x, y - 30, 30, 30);
  });

  // ---------- волшебная школа ----------
  def('bigTree', 110, 420, true, function (ctx, d, t) {
    D.parkTree.draw(ctx, Object.assign({}, d, { s: 1.5 }), t);
    ctx.fillStyle = '#FF5A5A';
    for (let k = 0; k < 5; k++) {
      G.circle(ctx, d.x - 60 + k * 30, d.y - 280 - ((k * 37) % 60), 7);
      ctx.fill();
    }
  });
  def('sparkleFlower', 30, 60, false, function (ctx, d, t) {
    Art.flower(ctx, d.x, d.y, 8, '#B983FF', t);
    G.sparkle(ctx, d.x + 10, d.y - 40 + Math.sin(t * 2 + d.x) * 4, 6, '#FFF6C8', 0.8);
  });
  def('bookcase', 130, 500, true, function (ctx, d) {
    const x = d.x, y = d.y;
    G.rr(ctx, x - 120, y - 480, 240, 480, 8);
    fs(ctx, '#6A3F22', '#3E2210', 3);
    const cols = ['#E0533F', '#3F8FE0', '#2FBF55', '#B983FF', '#FFB347', '#E0C040'];
    for (let k = 0; k < 5; k++) {
      const sy = y - 470 + k * 94;
      ctx.fillStyle = '#4A2A14';
      ctx.fillRect(x - 110, sy + 84, 220, 8);
      let bx = x - 106;
      let i = k * 3 + d.seed;
      while (bx < x + 100) {
        const bw = 14 + (i % 3) * 5;
        const bh = 56 + (i % 4) * 7;
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(bx, sy + 84 - bh, bw, bh);
        bx += bw + 2;
        i++;
      }
    }
  });
  def('globe', 40, 120, false, function (ctx, d, t) {
    const x = d.x, y = d.y;
    ctx.fillStyle = '#6A3F22';
    ctx.fillRect(x - 4, y - 50, 8, 50);
    ctx.fillRect(x - 24, y - 6, 48, 6);
    G.circle(ctx, x, y - 84, 34);
    fs(ctx, '#5AB8F0', '#2A6A9A', 2.5);
    ctx.save();
    G.circle(ctx, x, y - 84, 34);
    ctx.clip();
    ctx.fillStyle = '#7CD35A';
    const off = (t * 10) % 80;
    for (const [dx, dy, r] of [[-20, -10, 12], [14, 8, 14], [40, -14, 10], [-50, 10, 12]]) {
      G.circle(ctx, x + dx - off + 40, y - 84 + dy, r);
      ctx.fill();
    }
    ctx.restore();
  });
  def('candle', 20, 400, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 300 - (d.seed % 3) * 60 + Math.sin(t * 1.2 + d.seed) * 10;
    G.rr(ctx, x - 7, y, 14, 40, 3);
    fs(ctx, '#FFF4D6', '#C9A77A', 1.5);
    G.glow(ctx, x, y - 8, 30, '#FFD23F', 0.6);
    G.ellipse(ctx, x, y - 8, 5, 9);
    ctx.fillStyle = '#FFB300';
    ctx.fill();
  });
  def('torch', 30, 380, true, function (ctx, d, t) {
    Art.torch(ctx, d.x, d.y - 300, t);
  });
  def('flaskShelf', 90, 360, true, function (ctx, d, t) {
    const x = d.x, y = d.y - 280;
    G.rr(ctx, x - 90, y, 180, 10, 3);
    fs(ctx, '#6A3F22', '#3E2210', 2);
    const cols = ['#7CFF6A', '#FF7EC8', '#6AD8FF', '#FFD23F'];
    for (let k = 0; k < 4; k++) {
      const fx = x - 66 + k * 44;
      G.circle(ctx, fx, y - 18, 16);
      fs(ctx, 'rgba(220,240,255,0.85)', '#5B7C99', 2);
      G.circle(ctx, fx, y - 14, 11);
      ctx.fillStyle = cols[k];
      ctx.fill();
      G.rr(ctx, fx - 5, y - 44, 10, 14, 3);
      fs(ctx, 'rgba(220,240,255,0.9)', '#5B7C99', 1.5);
      G.sparkle(ctx, fx + 6, y - 22 - Math.sin(t * 3 + k) * 4, 3, '#fff', 0.8);
    }
  });
  def('bigCauldron', 90, 150, true, function (ctx, d, t) {
    const x = d.x, y = d.y;
    for (let k = 0; k < 4; k++) {
      const ph = (t * 0.7 + k / 4) % 1;
      G.circle(ctx, x - 30 + k * 20, y - 110 - ph * 90, 8 + ph * 8);
      ctx.fillStyle = 'rgba(124,255,106,' + 0.5 * (1 - ph) + ')';
      ctx.fill();
    }
    G.ellipse(ctx, x, y - 50, 80, 56);
    fs(ctx, '#3A3050', '#1E1830', 3);
    G.ellipse(ctx, x, y - 96, 72, 14);
    fs(ctx, '#7CFF6A', '#3A9A30', 2);
  });

  // ---------- размещение декора ----------
  Sc.placeDeco = function (L, th, r) {
    const out = [];
    const list = (th.deco || []).filter((k) => D[k]);
    if (!list.length) return out;
    const busy = [];
    if (L.feats) for (const f of L.feats) if (f.x0 != null) busy.push([f.x0 - 40, f.x1 + 40]);
    for (const w of L.water) busy.push([w.x - 30, w.x + w.w + 30]);
    busy.push([L.spawn[0] - 60, L.spawn[0] + 60]);
    const free = (x, hw) => !busy.some(([a, b]) => x + hw > a && x - hw < b);
    const floors = L.layout === 'tall' ? [L.gy] : [L.gy];
    for (const fy of floors) {
      let x = 60 + r() * 120;
      let last = -1;
      while (x < L.w - 60) {
        let k = Math.floor(r() * list.length);
        if (k === last && list.length > 1) k = (k + 1) % list.length;
        const kind = list[k];
        const dd = D[kind];
        if (dd.big || free(x, dd.w)) {
          out.push({ kind: kind, x: x, y: fy, w: dd.w, h: dd.h, s: 0.9 + r() * 0.25, seed: Math.floor(r() * 1000), night: L.night, draw: dd.draw });
          last = k;
          x += dd.w * 2 + 60 + r() * 220;
        } else x += 60;
      }
    }
    // большой декор — первым (позади маленького)
    out.sort((a, b) => (D[b.kind].big === D[a.kind].big ? 0 : D[a.kind].big ? -1 : 1));
    return out;
  };

  // =========================================================
  // Друзья: радуются, когда до них дотронуться
  // =========================================================
  Sc.drawSpider = function (ctx, x, y, s, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, -400);
    ctx.lineWidth = 1.2 / s;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.stroke();
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      for (const sd of [-1, 1]) {
        const a = -0.6 + k * 0.4;
        const w = Math.sin(t * 6 + k) * 3;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(sd * 20, -10 + k * 6 + w, sd * 28, 6 + k * 6);
        void a;
      }
    }
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4A3A6A';
    ctx.stroke();
    G.circle(ctx, 0, 0, 16);
    fs(ctx, '#6A4FA0', '#3A2A6A', 2);
    G.circle(ctx, -6, -3, 5);
    ctx.fillStyle = '#fff';
    ctx.fill();
    G.circle(ctx, 6, -3, 5);
    ctx.fill();
    G.circle(ctx, -5, -2, 2.4);
    ctx.fillStyle = '#222';
    ctx.fill();
    G.circle(ctx, 7, -2, 2.4);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 4, 6, 0.3, Math.PI - 0.3);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();
  };

  Sc.drawRobot = function (ctx, x, y, s, t, happy) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const bob = Math.abs(Math.sin(t * (happy ? 10 : 2))) * (happy ? 16 : 3);
    ctx.translate(0, -bob);
    ctx.fillStyle = '#4A5A78';
    ctx.fillRect(-18, -22, 10, 22);
    ctx.fillRect(8, -22, 10, 22);
    G.rr(ctx, -30, -80, 60, 60, 12);
    fs(ctx, '#8FB3E8', '#3A5A90', 3);
    G.rr(ctx, -16, -64, 32, 22, 6);
    ctx.fillStyle = '#FFD23F';
    ctx.fill();
    // руки (машет)
    const wave = Math.sin(t * (happy ? 12 : 3)) * 0.6;
    ctx.save();
    ctx.translate(30, -70);
    ctx.rotate(-1 + wave);
    ctx.fillStyle = '#6F8FC0';
    ctx.fillRect(0, -5, 34, 10);
    ctx.restore();
    ctx.fillStyle = '#6F8FC0';
    ctx.fillRect(-60, -72, 32, 10);
    G.rr(ctx, -26, -126, 52, 44, 12);
    fs(ctx, '#B7CFF5', '#3A5A90', 3);
    G.rr(ctx, -18, -116, 36, 22, 8);
    ctx.fillStyle = '#20304A';
    ctx.fill();
    G.circle(ctx, -8, -105, 4.5);
    ctx.fillStyle = '#6CFFB0';
    ctx.fill();
    G.circle(ctx, 8, -105, 4.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -126);
    ctx.lineTo(0, -144);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3A5A90';
    ctx.stroke();
    G.circle(ctx, 0, -148, 6);
    ctx.fillStyle = Math.sin(t * 5) > 0 ? '#FF4A4A' : '#FFD23F';
    ctx.fill();
    ctx.restore();
  };

  const FR = (Sc.FRIENDS = {});
  FR.spider = { w: 60, h: 90, sfx: 'giggle', draw: (ctx, pr, t, k) => Sc.drawSpider(ctx, pr.cx, pr.cy - 60 - k * 40, 1, t) };
  FR.robot = { w: 70, h: 150, sfx: 'magic', draw: (ctx, pr, t, k) => Sc.drawRobot(ctx, pr.cx, pr.cy, 0.8, t, k > 0) };
  FR.snail = {
    w: 90, h: 60, sfx: 'giggle',
    draw(ctx, pr, t, k) {
      const x = pr.cx + Math.sin(t * 0.3) * 30, y = pr.cy;
      ctx.save();
      ctx.translate(x, y - k * 20);
      G.rr(ctx, -40, -16, 80, 16, 8);
      fs(ctx, '#B8E08A', '#5A8A3A', 2);
      G.circle(ctx, 0, -34, 26);
      fs(ctx, '#FFB347', '#A0642A', 2.5);
      ctx.beginPath();
      for (let a = 0; a < TAU * 2; a += 0.3) {
        const rr = 3 + a * 3.2;
        ctx.lineTo(Math.cos(a) * rr, -34 + Math.sin(a) * rr);
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#C07A2A';
      ctx.stroke();
      for (const dx of [30, 40]) {
        ctx.beginPath();
        ctx.moveTo(dx - 6, -14);
        ctx.lineTo(dx, -40);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5A8A3A';
        ctx.stroke();
        G.circle(ctx, dx, -42, 4);
        ctx.fillStyle = '#222';
        ctx.fill();
      }
      ctx.restore();
    },
  };
  FR.elf = {
    w: 60, h: 120, sfx: 'sparkle',
    draw(ctx, pr, t, k) {
      const x = pr.cx, y = pr.cy - k * 30;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#3E8E36';
      ctx.fillRect(-10, -26, 7, 26);
      ctx.fillRect(3, -26, 7, 26);
      G.rr(ctx, -16, -62, 32, 40, 10);
      fs(ctx, '#5FBF4A', '#2F7A2C', 2);
      G.circle(ctx, 0, -76, 16);
      fs(ctx, '#FFD9B8', '#B07A50', 2);
      // уши
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 14, -80);
        ctx.lineTo(s * 28, -90);
        ctx.lineTo(s * 14, -72);
        ctx.closePath();
        fs(ctx, '#FFD9B8', '#B07A50', 1.5);
      }
      ctx.beginPath();
      ctx.moveTo(-17, -84);
      ctx.lineTo(4, -128 + Math.sin(t * 2) * 3);
      ctx.lineTo(17, -84);
      ctx.closePath();
      fs(ctx, '#2F9A48', '#1E6A30', 2);
      G.circle(ctx, -5, -76, 2);
      ctx.fillStyle = '#222';
      ctx.fill();
      G.circle(ctx, 5, -76, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -71, 5, 0.3, Math.PI - 0.3);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#8A3A3A';
      ctx.stroke();
      ctx.restore();
    },
  };
  FR.ant = {
    w: 70, h: 70, sfx: 'giggle',
    draw(ctx, pr, t, k) {
      const x = pr.cx + Math.sin(t * 0.4) * 40, y = pr.cy - k * 24;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const w = Math.sin(t * 8 + i) * 4;
        ctx.moveTo(-10 + i * 12, -14);
        ctx.lineTo(-16 + i * 12 + w, 0);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#3A2020';
      ctx.stroke();
      for (const [dx, r] of [[-20, 10], [0, 8], [20, 11]]) {
        G.circle(ctx, dx, -20, r);
        fs(ctx, '#C0392B', '#6A1A10', 2);
      }
      G.circle(ctx, 24, -24, 3);
      ctx.fillStyle = '#fff';
      ctx.fill();
      // рюкзачок-листик
      G.ellipse(ctx, -2, -40, 20, 9, -0.3);
      fs(ctx, '#62C24F', '#2F7A2C', 1.5);
      ctx.restore();
    },
  };
  FR.mouse = {
    w: 60, h: 60, sfx: 'giggle',
    draw(ctx, pr, t, k) {
      const x = pr.cx, y = pr.cy - k * 26;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(-24, -10);
      ctx.quadraticCurveTo(-50, -10, -44, -34);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#E0A0B8';
      ctx.stroke();
      G.ellipse(ctx, 0, -18, 26, 18);
      fs(ctx, '#C8C0D8', '#7A7090', 2);
      G.circle(ctx, 20, -32, 12);
      fs(ctx, '#C8C0D8', '#7A7090', 2);
      G.circle(ctx, 12, -46, 9);
      fs(ctx, '#FFB3CE', '#7A7090', 1.5);
      G.circle(ctx, 28, -46, 8);
      fs(ctx, '#FFB3CE', '#7A7090', 1.5);
      G.circle(ctx, 24, -34, 2.2);
      ctx.fillStyle = '#222';
      ctx.fill();
      G.circle(ctx, 32, -30, 2.5);
      ctx.fillStyle = '#FF7AA0';
      ctx.fill();
      // кусочек сыра
      ctx.beginPath();
      ctx.moveTo(34, -14);
      ctx.lineTo(56, -8);
      ctx.lineTo(36, 0);
      ctx.closePath();
      fs(ctx, '#FFD23F', '#B88A00', 1.5);
      ctx.restore();
    },
  };
  FR.hedgehog = {
    w: 70, h: 60, sfx: 'giggle',
    draw(ctx, pr, t, k) {
      const x = pr.cx + Math.sin(t * 0.35) * 30, y = pr.cy - k * 26;
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI + (i / 10) * Math.PI;
        const r = i % 2 ? 26 : 36;
        ctx.lineTo(Math.cos(a) * r * 1.2 - 4, -8 + Math.sin(a) * r);
      }
      ctx.closePath();
      fs(ctx, '#6A4A30', '#3A2A18', 2);
      G.ellipse(ctx, 24, -12, 16, 12);
      fs(ctx, '#E8C08A', '#8A5A2B', 2);
      G.circle(ctx, 38, -14, 3.5);
      ctx.fillStyle = '#222';
      ctx.fill();
      G.circle(ctx, 26, -16, 2.5);
      ctx.fill();
      // яблочко на колючках
      G.circle(ctx, -8, -44, 9);
      fs(ctx, '#FF4A4A', '#8E1A1A', 1.5);
      ctx.restore();
    },
  };
  FR.puppy = {
    w: 70, h: 70, sfx: 'giggle',
    draw(ctx, pr, t, k) {
      const x = pr.cx, y = pr.cy - k * 30;
      ctx.save();
      ctx.translate(x, y);
      const wag = Math.sin(t * (k > 0 ? 20 : 6)) * 0.5;
      ctx.save();
      ctx.translate(-26, -30);
      ctx.rotate(-0.8 + wag);
      ctx.fillStyle = '#E0A868';
      ctx.fillRect(-3, -22, 6, 22);
      ctx.restore();
      ctx.fillStyle = '#C98D52';
      for (const dx of [-18, -8, 10, 20]) ctx.fillRect(dx, -16, 7, 16);
      G.ellipse(ctx, 0, -26, 30, 16);
      fs(ctx, '#E0A868', '#8A5A2B', 2);
      G.circle(ctx, 26, -44, 16);
      fs(ctx, '#E0A868', '#8A5A2B', 2);
      G.ellipse(ctx, 18, -56, 7, 12, -0.4);
      fs(ctx, '#8A5A2B');
      G.circle(ctx, 30, -46, 2.5);
      ctx.fillStyle = '#222';
      ctx.fill();
      G.circle(ctx, 41, -40, 4);
      ctx.fill();
      ctx.restore();
    },
  };
  FR.smile = {
    w: 60, h: 80, sfx: 'sparkle',
    draw(ctx, pr, t, k) {
      const x = pr.cx, y = pr.cy - k * 34 - Math.abs(Math.sin(t * 3)) * 4;
      ctx.fillStyle = '#5A4FCF';
      ctx.fillRect(x - 12, y - 16, 6, 16);
      ctx.fillRect(x + 6, y - 16, 6, 16);
      G.circle(ctx, x, y - 40, 26);
      fs(ctx, '#FFD23F', '#D98B00', 3);
      G.circle(ctx, x - 9, y - 46, 3.5);
      ctx.fillStyle = '#5A3A00';
      ctx.fill();
      G.circle(ctx, x + 9, y - 46, 3.5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - 40, 12, 0.3, Math.PI - 0.3);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#5A3A00';
      ctx.stroke();
    },
  };
  FR.owl = {
    w: 60, h: 80, sfx: 'sparkle',
    draw(ctx, pr, t, k) {
      VW.Pets.draw(ctx, 'owl', pr.cx, pr.cy - 20 - k * 30, { t: t, facing: -1, scale: 1.1 });
    },
  };
  FR.frog = {
    w: 60, h: 60, sfx: 'giggle',
    draw(ctx, pr, t, k) {
      const x = pr.cx, y = pr.cy - k * 40;
      G.ellipse(ctx, x, y - 20, 28, 20);
      fs(ctx, '#5FBF4A', '#2F7A2C', 2);
      for (const dx of [-12, 12]) {
        G.circle(ctx, x + dx, y - 40, 9);
        fs(ctx, '#7CD35A', '#2F7A2C', 2);
        G.circle(ctx, x + dx, y - 40, 4);
        ctx.fillStyle = '#222';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x, y - 20, 14, 0.2, Math.PI - 0.2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#1E5A1E';
      ctx.stroke();
    },
  };

  const FRIEND_SAY = ['Привет!', 'Ура!', 'Хи-хи!', 'Как здорово!'];
  Sc.makeFriends = function (L, th, r) {
    const kind = th.friend && FR[th.friend] ? th.friend : null;
    if (!kind) return [];
    const f = FR[kind];
    // рядом со стартом, на свободном месте земли
    let x = L.spawn[0] + (L.spawnFacing > 0 ? 1 : -1) * (260 + r() * 120);
    x = U.clamp(x, 80, L.w - 80);
    const y = L.gy;
    const pr = {
      kind: kind, cx: x, cy: y, x: x - f.w / 2, y: y - f.h - 40, w: f.w, h: f.h + 40, t: null, hop: 0,
      onTouch(game, p) {
        p.t = 0;
        A.sfx(f.sfx || 'giggle');
        game.fx.burst('heart', p.cx, p.cy - f.h, 8, { speed: 160, size: 12, color: '#FF6FA8', life: 1.1, g: -60 });
        if (!p.greeted) {
          p.greeted = true;
          VW.Voice.say(U.pick(FRIEND_SAY));
        }
      },
      draw(ctx, p, t) {
        const k = p.t != null && p.t < 0.8 ? Math.sin((p.t / 0.8) * Math.PI) : 0;
        f.draw(ctx, p, t, k);
      },
    };
    return [pr];
  };
})(window.VW);
