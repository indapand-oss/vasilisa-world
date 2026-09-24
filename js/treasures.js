/* Vasilisa World — находки новых миров. Каждая рисуется в круге радиуса s вокруг (cx, cy). */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, I = VW.Items;
  const TAU = Math.PI * 2, PI = Math.PI;
  const ART = (I.ART = I.ART || {});

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
  function shine(ctx, x, y, rx, ry, rot, a) {
    G.ellipse(ctx, x, y, rx, ry, rot || 0);
    ctx.fillStyle = 'rgba(255,255,255,' + (a == null ? 0.55 : a) + ')';
    ctx.fill();
  }
  function goldGrad(ctx, cy, s) {
    return G.vGrad(ctx, Math.round(cy - s), Math.round(cy + s), ['#FFF1A0', '#FFC928', '#E09A00']);
  }
  // Удобно: рисуем в системе координат «центр, 1 = s»
  function unit(ctx, cx, cy, s, fn) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    fn();
    ctx.restore();
  }
  const LW = (s, k) => k / s; // толщина линии в «единицах»

  // ================= Герой-паук =================
  ART.spiderBadge = function (ctx, cx, cy, s, t) {
    G.circle(ctx, cx, cy, s * 0.9);
    fs(ctx, goldGrad(ctx, cy, s), '#B87800', s * 0.07);
    G.circle(ctx, cx, cy, s * 0.68);
    fs(ctx, '#E53935', '#8E1A1A', s * 0.04);
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        for (const sd of [-1, 1]) {
          const y0 = -0.12 + k * 0.1;
          ctx.moveTo(sd * 0.12, y0);
          ctx.quadraticCurveTo(sd * 0.36, y0 - 0.18 + k * 0.06, sd * 0.48, y0 + 0.02 + k * 0.08);
        }
      }
      ctx.lineWidth = 0.06;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1E1E2E';
      ctx.stroke();
      G.ellipse(ctx, 0, 0.08, 0.2, 0.24);
      ctx.fillStyle = '#1E1E2E';
      ctx.fill();
      G.circle(ctx, 0, -0.18, 0.14);
      ctx.fill();
      for (const dx of [-0.06, 0.06]) {
        G.circle(ctx, dx, -0.2, 0.045);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      // звёздочки по кругу
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + 0.5;
        G.starPath(ctx, Math.cos(a) * 0.79, Math.sin(a) * 0.79, 0.07, 0.03);
        ctx.fillStyle = '#FFF6C8';
        ctx.fill();
      }
    });
    shine(ctx, cx - s * 0.35, cy - s * 0.5, s * 0.2, s * 0.09, -0.6, 0.6);
  };
  ART.heroMask = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      // ленточки
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sd * 0.8, -0.05);
        ctx.quadraticCurveTo(sd * 1.0, 0.2 + Math.sin(t * 4) * 0.05, sd * 0.92, 0.55);
        ctx.lineTo(sd * 0.8, 0.5);
        ctx.quadraticCurveTo(sd * 0.86, 0.2, sd * 0.72, 0.08);
        ctx.closePath();
        fs(ctx, '#C62828', '#7A1414', 0.04);
      }
      ctx.beginPath();
      ctx.moveTo(-0.85, -0.2);
      ctx.quadraticCurveTo(-0.6, -0.55, 0, -0.3);
      ctx.quadraticCurveTo(0.6, -0.55, 0.85, -0.2);
      ctx.quadraticCurveTo(0.9, 0.3, 0.45, 0.32);
      ctx.quadraticCurveTo(0.12, 0.3, 0, 0.12);
      ctx.quadraticCurveTo(-0.12, 0.3, -0.45, 0.32);
      ctx.quadraticCurveTo(-0.9, 0.3, -0.85, -0.2);
      ctx.closePath();
      fs(ctx, '#E53935', '#7A1414', 0.06);
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sd * 0.42, -0.04, 0.22, 0.14, sd * 0.15, 0, TAU);
        fs(ctx, '#FFF8E6', '#7A1414', 0.04);
      }
      shine(ctx, -0.45, -0.3, 0.2, 0.06, -0.2, 0.5);
    });
  };
  ART.webBall = function (ctx, cx, cy, s, t) {
    G.circle(ctx, cx, cy, s * 0.78);
    fs(ctx, '#F4F4FF', '#9A9AC8', s * 0.05);
    ctx.save();
    G.circle(ctx, cx, cy, s * 0.78);
    ctx.clip();
    ctx.beginPath();
    for (let k = -3; k <= 3; k++) {
      ctx.moveTo(cx - s, cy + k * s * 0.22);
      ctx.quadraticCurveTo(cx, cy + k * s * 0.22 - s * 0.35, cx + s, cy + k * s * 0.22);
    }
    for (let k = -2; k <= 2; k++) {
      ctx.moveTo(cx + k * s * 0.3, cy - s);
      ctx.quadraticCurveTo(cx + k * s * 0.3 + s * 0.3, cy, cx + k * s * 0.3, cy + s);
    }
    ctx.lineWidth = s * 0.04;
    ctx.strokeStyle = '#B8B8E0';
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.6, cy + s * 0.5);
    ctx.bezierCurveTo(cx + s * 0.95, cy + s * 0.7, cx + s * 0.7, cy + s * 0.95, cx + s * 0.98, cy + s * 0.98);
    ctx.lineWidth = s * 0.05;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#DADAF5';
    ctx.stroke();
    shine(ctx, cx - s * 0.3, cy - s * 0.35, s * 0.2, s * 0.12, -0.6, 0.8);
  };
  ART.heroWatch = function (ctx, cx, cy, s, t) {
    G.rr(ctx, cx - s * 0.32, cy - s * 0.95, s * 0.64, s * 1.9, s * 0.2);
    fs(ctx, '#3F6FE0', '#1E3A8A', s * 0.05);
    ctx.fillStyle = '#6F98FF';
    for (const y of [-0.75, -0.6, 0.6, 0.75]) ctx.fillRect(cx - s * 0.2, cy + s * y, s * 0.4, s * 0.06);
    G.circle(ctx, cx, cy, s * 0.55);
    fs(ctx, '#C9D3E8', '#5A6378', s * 0.06);
    G.circle(ctx, cx, cy, s * 0.43);
    const pulse = 0.6 + 0.4 * Math.sin(t * 4);
    ctx.fillStyle = 'rgba(80,220,255,' + (0.7 + 0.3 * pulse) + ')';
    ctx.fill();
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(0.08, -0.3);
      ctx.lineTo(-0.14, 0.04);
      ctx.lineTo(0.02, 0.04);
      ctx.lineTo(-0.06, 0.3);
      ctx.lineTo(0.16, -0.06);
      ctx.lineTo(0, -0.06);
      ctx.closePath();
      fs(ctx, '#FFE45C', '#B87800', 0.03);
    });
    G.rr(ctx, cx + s * 0.52, cy - s * 0.1, s * 0.14, s * 0.2, s * 0.05);
    fs(ctx, '#8E9AB2', '#4A546A', s * 0.03);
  };
  ART.heroCup = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sd * 0.5, -0.38, 0.24, sd > 0 ? -PI / 2 : PI / 2, sd > 0 ? PI / 2 : PI * 1.5, sd < 0);
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = '#E0A000';
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(-0.55, -0.7);
      ctx.lineTo(0.55, -0.7);
      ctx.quadraticCurveTo(0.55, 0.05, 0.1, 0.2);
      ctx.lineTo(0.1, 0.45);
      ctx.lineTo(-0.1, 0.45);
      ctx.lineTo(-0.1, 0.2);
      ctx.quadraticCurveTo(-0.55, 0.05, -0.55, -0.7);
      ctx.closePath();
      fs(ctx, goldGrad(ctx, 0, 1), '#B87800', 0.05);
      G.rr(ctx, -0.38, 0.45, 0.76, 0.14, 0.04);
      fs(ctx, '#E0A000', '#B87800', 0.04);
      G.rr(ctx, -0.5, 0.58, 1, 0.2, 0.06);
      fs(ctx, '#8E4AC8', '#5A2A8A', 0.04);
      G.starPath(ctx, 0, -0.3, 0.24, 0.1);
      fs(ctx, '#FFF6C8', '#E0A000', 0.03);
      shine(ctx, -0.3, -0.45, 0.07, 0.18, 0, 0.6);
    });
  };

  // ================= Роботы =================
  function gearPath(ctx, x, y, R, r, n, rot) {
    ctx.beginPath();
    for (let k = 0; k < n * 2; k++) {
      const a = rot + (k / (n * 2)) * TAU;
      const rr = k % 2 ? r : R;
      ctx.lineTo(x + Math.cos(a - 0.14) * rr, y + Math.sin(a - 0.14) * rr);
      ctx.lineTo(x + Math.cos(a + 0.14) * rr, y + Math.sin(a + 0.14) * rr);
    }
    ctx.closePath();
  }
  ART.gear = function (ctx, cx, cy, s, t) {
    gearPath(ctx, cx, cy, s * 0.92, s * 0.72, 8, t * 0.6);
    fs(ctx, goldGrad(ctx, cy, s), '#B87800', s * 0.06);
    G.circle(ctx, cx, cy, s * 0.42);
    fs(ctx, '#FFD84A', '#B87800', s * 0.05);
    G.circle(ctx, cx, cy, s * 0.18);
    fs(ctx, '#8A5A00', '#6A4300', s * 0.03);
    shine(ctx, cx - s * 0.3, cy - s * 0.4, s * 0.2, s * 0.08, -0.6, 0.6);
  };
  ART.battery = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(-0.35);
      G.rr(ctx, -0.42, -0.85, 0.84, 1.65, 0.16);
      fs(ctx, '#3A3F55', '#1E222E', 0.06);
      G.rr(ctx, -0.16, -1.0, 0.32, 0.17, 0.05);
      fs(ctx, '#C9D3E8', '#5A6378', 0.04);
      const lvl = 1 + Math.floor((t * 1.5) % 4);
      for (let k = 0; k < 4; k++) {
        G.rr(ctx, -0.3, 0.52 - k * 0.36, 0.6, 0.28, 0.06);
        ctx.fillStyle = k < lvl ? '#6CFF7A' : '#2A3040';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(0.05, -0.62);
      ctx.lineTo(-0.16, -0.18);
      ctx.lineTo(0.02, -0.18);
      ctx.lineTo(-0.06, 0.22);
      ctx.lineTo(0.18, -0.28);
      ctx.lineTo(0.0, -0.28);
      ctx.closePath();
      fs(ctx, '#FFE45C', '#B87800', 0.03);
      shine(ctx, -0.26, -0.3, 0.05, 0.4, 0, 0.35);
    });
  };
  ART.robotHeart = function (ctx, cx, cy, s, t) {
    const beat = 1 + 0.06 * Math.max(0, Math.sin(t * 6));
    G.heartPath(ctx, cx, cy + s * 0.05, s * 0.78 * beat);
    fs(ctx, '#B7C1D6', '#4A546A', s * 0.07);
    G.heartPath(ctx, cx, cy + s * 0.08, s * 0.5 * beat);
    fs(ctx, '#FF4A6A', '#A8163E', s * 0.04);
    G.glow(ctx, cx, cy, s * 0.6, '#FF4A6A', 0.35);
    ctx.fillStyle = '#6E7A92';
    for (const [dx, dy] of [[-0.62, -0.28], [0.62, -0.28], [0, 0.62], [-0.3, 0.3], [0.3, 0.3]]) {
      G.circle(ctx, cx + dx * s, cy + dy * s, s * 0.06);
      ctx.fill();
    }
    shine(ctx, cx - s * 0.4, cy - s * 0.35, s * 0.14, s * 0.08, -0.6, 0.6);
  };
  ART.remote = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(0.25);
      G.rr(ctx, -0.36, -0.9, 0.72, 1.8, 0.2);
      fs(ctx, '#5A6378', '#2E3440', 0.06);
      G.rr(ctx, -0.26, -0.78, 0.52, 0.3, 0.06);
      ctx.fillStyle = '#6CFFB0';
      ctx.fill();
      const cols = ['#FF4A4A', '#FFD23F', '#4ADE80', '#4FC3F7', '#B983FF', '#FF8FB8'];
      let k = 0;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++, k++) {
          G.circle(ctx, -0.14 + col * 0.28, -0.22 + row * 0.3, 0.1);
          fs(ctx, cols[k], U.shade(cols[k], -0.4), 0.03);
        }
      }
      G.rr(ctx, -0.18, 0.62, 0.36, 0.14, 0.05);
      fs(ctx, '#C9D3E8');
      const on = Math.sin(t * 5) > 0;
      G.circle(ctx, 0, -1.0, 0.07);
      ctx.fillStyle = on ? '#FF4A4A' : '#8A2A2A';
      ctx.fill();
    });
  };
  ART.screw = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(-0.6);
      G.rr(ctx, -0.14, -0.35, 0.28, 1.2, 0.08);
      fs(ctx, '#C9D3E8', '#5A6378', 0.05);
      ctx.beginPath();
      for (let y = -0.25; y < 0.8; y += 0.14) {
        ctx.moveTo(-0.16, y);
        ctx.lineTo(0.16, y + 0.08);
      }
      ctx.lineWidth = 0.04;
      ctx.strokeStyle = '#6E7A92';
      ctx.stroke();
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        ctx.lineTo(Math.cos(a) * 0.46, -0.52 + Math.sin(a) * 0.3);
      }
      ctx.closePath();
      fs(ctx, goldGrad(ctx, -0.5, 0.5), '#B87800', 0.05);
      G.rr(ctx, -0.22, -0.56, 0.44, 0.08, 0.03);
      ctx.fillStyle = '#8A5A00';
      ctx.fill();
    });
    G.sparkle(ctx, cx + s * 0.55, cy - s * 0.55, s * (0.12 + 0.06 * Math.sin(t * 5)), '#FFF6C8');
  };

  // ================= Растения =================
  ART.seed = function (ctx, cx, cy, s, t) {
    G.glow(ctx, cx, cy, s, '#B6FFB0', 0.35);
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(0, -0.55);
      ctx.bezierCurveTo(0.62, -0.3, 0.55, 0.75, 0, 0.8);
      ctx.bezierCurveTo(-0.55, 0.75, -0.62, -0.3, 0, -0.55);
      ctx.closePath();
      fs(ctx, '#B0703F', '#6A4520', 0.06);
      ctx.beginPath();
      ctx.moveTo(0, -0.45);
      ctx.quadraticCurveTo(0.14, 0.15, 0, 0.7);
      ctx.lineWidth = 0.05;
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      shine(ctx, -0.2, -0.05, 0.08, 0.25, 0.2, 0.45);
      // росток
      const sw = Math.sin(t * 2) * 0.06;
      ctx.beginPath();
      ctx.moveTo(0, -0.52);
      ctx.quadraticCurveTo(0.05, -0.75, sw, -0.92);
      ctx.lineWidth = 0.08;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#4CAE48';
      ctx.stroke();
      G.ellipse(ctx, -0.18 + sw, -0.9, 0.2, 0.1, 0.5);
      fs(ctx, '#7CD35A', '#2F7A2C', 0.03);
      G.ellipse(ctx, 0.2 + sw, -0.95, 0.2, 0.1, -0.5);
      fs(ctx, '#62C24F', '#2F7A2C', 0.03);
    });
  };
  ART.wateringCan = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(0.4, -0.05);
      ctx.lineTo(0.95, -0.55);
      ctx.lineWidth = 0.14;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#2FA8F0';
      ctx.stroke();
      G.ellipse(ctx, 0.98, -0.6, 0.12, 0.08, -0.7);
      fs(ctx, '#1E88D0', '#0E5A90', 0.03);
      G.rr(ctx, -0.6, -0.35, 1.05, 0.95, 0.18);
      fs(ctx, '#4FC3F7', '#1E6A90', 0.06);
      ctx.beginPath();
      ctx.arc(-0.08, -0.35, 0.36, PI, 0);
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = '#1E6A90';
      ctx.stroke();
      // цветочек на лейке
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU;
        G.circle(ctx, -0.08 + Math.cos(a) * 0.13, 0.13 + Math.sin(a) * 0.13, 0.09);
        ctx.fillStyle = '#FFF';
        ctx.fill();
      }
      G.circle(ctx, -0.08, 0.13, 0.07);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
      // капли
      for (let k = 0; k < 3; k++) {
        const ph = (t * 1.2 + k / 3) % 1;
        G.ellipse(ctx, 1.05 + k * 0.08 - 0.08, -0.5 + ph * 0.9, 0.04, 0.07);
        ctx.fillStyle = 'rgba(110,200,255,' + (1 - ph) + ')';
        ctx.fill();
      }
    });
  };
  ART.rainbowFlower = function (ctx, cx, cy, s, t) {
    const cols = ['#FF4A4A', '#FF8C1A', '#FFD23F', '#4ADE80', '#4FC3F7', '#5B6BFF', '#B983FF'];
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.2);
    ctx.quadraticCurveTo(cx + s * 0.1, cy + s * 0.6, cx, cy + s * 0.98);
    ctx.lineWidth = s * 0.1;
    ctx.strokeStyle = '#4CAE48';
    ctx.stroke();
    G.ellipse(ctx, cx + s * 0.22, cy + s * 0.68, s * 0.22, s * 0.1, -0.5);
    fs(ctx, '#62C24F', '#2F7A2C', s * 0.03);
    const cyf = cy - s * 0.15;
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU + t * 0.3;
      G.ellipse(ctx, cx + Math.cos(a) * s * 0.42, cyf + Math.sin(a) * s * 0.42, s * 0.28, s * 0.17, a);
      fs(ctx, cols[k], U.shade(cols[k], -0.35), s * 0.03);
    }
    G.circle(ctx, cx, cyf, s * 0.24);
    fs(ctx, '#FFF1A0', '#E0A000', s * 0.04);
    G.circle(ctx, cx - s * 0.07, cyf - s * 0.04, s * 0.04);
    ctx.fillStyle = '#6A4300';
    ctx.fill();
    G.circle(ctx, cx + s * 0.07, cyf - s * 0.04, s * 0.04);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cyf + s * 0.02, s * 0.09, 0.3, PI - 0.3);
    ctx.lineWidth = s * 0.03;
    ctx.strokeStyle = '#6A4300';
    ctx.stroke();
  };
  ART.goldCarrot = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(0.5);
      for (const [a, l] of [[-0.35, 0.5], [0, 0.6], [0.35, 0.5]]) {
        ctx.save();
        ctx.translate(0, -0.55);
        ctx.rotate(a + Math.sin(t * 2) * 0.05);
        G.ellipse(ctx, 0, -l / 2, 0.1, l / 2);
        fs(ctx, '#62C24F', '#2F7A2C', 0.03);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.moveTo(-0.3, -0.55);
      ctx.quadraticCurveTo(0, -0.7, 0.3, -0.55);
      ctx.lineTo(0.04, 0.95);
      ctx.lineTo(-0.04, 0.95);
      ctx.closePath();
      fs(ctx, goldGrad(ctx, 0, 1), '#B87800', 0.05);
      ctx.beginPath();
      for (const y of [-0.25, 0.05, 0.35, 0.6]) {
        const w = 0.26 * (1 - (y + 0.55) / 1.5);
        ctx.moveTo(-w, y);
        ctx.lineTo(-w + 0.12, y + 0.03);
        ctx.moveTo(w, y + 0.12);
        ctx.lineTo(w - 0.12, y + 0.15);
      }
      ctx.lineWidth = 0.04;
      ctx.strokeStyle = '#B87800';
      ctx.stroke();
      shine(ctx, -0.1, -0.25, 0.05, 0.25, 0, 0.6);
    });
  };
  ART.strawberry = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(0, 0.9);
      ctx.bezierCurveTo(-0.95, 0.35, -0.8, -0.6, 0, -0.5);
      ctx.bezierCurveTo(0.8, -0.6, 0.95, 0.35, 0, 0.9);
      ctx.closePath();
      fs(ctx, '#F0304A', '#8E0A26', 0.06);
      ctx.fillStyle = '#FFE680';
      for (const [x, y] of [[-0.35, -0.2], [0, -0.25], [0.35, -0.2], [-0.45, 0.15], [-0.15, 0.1], [0.15, 0.1], [0.45, 0.15], [-0.25, 0.45], [0.05, 0.42], [0.3, 0.45], [0, 0.7]]) {
        G.ellipse(ctx, x, y, 0.04, 0.06);
        ctx.fill();
      }
      for (let k = 0; k < 5; k++) {
        const a = PI + 0.3 + (k / 4) * (PI - 0.6);
        G.ellipse(ctx, Math.cos(a) * 0.3, -0.52 + Math.sin(a) * 0.12, 0.2, 0.08, a);
        fs(ctx, '#4CAE48', '#2F7A2C', 0.03);
      }
      ctx.beginPath();
      ctx.moveTo(0, -0.55);
      ctx.lineTo(0.05, -0.85);
      ctx.lineWidth = 0.07;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#3E8E36';
      ctx.stroke();
      shine(ctx, -0.35, -0.15, 0.1, 0.2, 0.4, 0.45);
    });
  };

  // ================= Эльфы и жучки =================
  ART.acornLamp = function (ctx, cx, cy, s, t) {
    const glow = 0.5 + 0.2 * Math.sin(t * 3);
    G.glow(ctx, cx, cy + s * 0.2, s * 1.1, '#FFE680', glow);
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.arc(0, -0.92, 0.12, 0, TAU);
      ctx.lineWidth = 0.06;
      ctx.strokeStyle = '#6A4520';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.55, -0.2);
      ctx.bezierCurveTo(-0.6, 0.55, -0.15, 0.9, 0, 0.95);
      ctx.bezierCurveTo(0.15, 0.9, 0.6, 0.55, 0.55, -0.2);
      ctx.closePath();
      fs(ctx, 'rgba(255,236,150,0.95)', '#B87800', 0.05);
      G.circle(ctx, 0, 0.3, 0.2);
      ctx.fillStyle = '#FFFBE0';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-0.65, -0.18);
      ctx.quadraticCurveTo(-0.62, -0.78, 0, -0.8);
      ctx.quadraticCurveTo(0.62, -0.78, 0.65, -0.18);
      ctx.closePath();
      fs(ctx, '#8B5A2B', '#5A3515', 0.05);
      ctx.beginPath();
      for (let x = -0.5; x <= 0.5; x += 0.2) {
        ctx.moveTo(x - 0.08, -0.25);
        ctx.lineTo(x, -0.62);
        ctx.lineTo(x + 0.08, -0.25);
      }
      ctx.lineWidth = 0.03;
      ctx.strokeStyle = 'rgba(60,30,10,0.5)';
      ctx.stroke();
    });
  };
  ART.dewdrop = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      G.ellipse(ctx, 0.1, 0.72, 0.8, 0.2, -0.1);
      fs(ctx, '#62C24F', '#2F7A2C', 0.04);
      ctx.beginPath();
      ctx.moveTo(0, -0.85);
      ctx.bezierCurveTo(0.2, -0.45, 0.62, -0.1, 0.62, 0.22);
      ctx.bezierCurveTo(0.62, 0.62, 0.3, 0.72, 0, 0.72);
      ctx.bezierCurveTo(-0.3, 0.72, -0.62, 0.62, -0.62, 0.22);
      ctx.bezierCurveTo(-0.62, -0.1, -0.2, -0.45, 0, -0.85);
      ctx.closePath();
      ctx.fillStyle = G.vGrad(ctx, -1, 1, ['#C8F2FF', '#5AC8FA', '#2A8AD0']);
      ctx.fill();
      ctx.lineWidth = 0.05;
      ctx.strokeStyle = '#1E6A90';
      ctx.stroke();
      shine(ctx, -0.22, 0.05, 0.1, 0.22, 0.3, 0.8);
      G.circle(ctx, 0.22, 0.4, 0.06);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
    });
    G.sparkle(ctx, cx + s * 0.5, cy - s * 0.4, s * (0.1 + 0.06 * Math.sin(t * 4)), '#FFFFFF');
  };
  ART.clover = function (ctx, cx, cy, s, t) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.1);
    ctx.quadraticCurveTo(cx + s * 0.25, cy + s * 0.6, cx + s * 0.1, cy + s * 0.98);
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3E8E36';
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU + PI / 4 + Math.sin(t * 1.5) * 0.05;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * s * 0.36, cy - s * 0.1 + Math.sin(a) * s * 0.36);
      ctx.rotate(a + PI / 2);
      G.heartPath(ctx, 0, 0, s * 0.3);
      fs(ctx, k % 2 ? '#4CC24A' : '#62D35A', '#2F7A2C', s * 0.04);
      ctx.restore();
    }
    G.circle(ctx, cx, cy - s * 0.1, s * 0.08);
    ctx.fillStyle = '#2F7A2C';
    ctx.fill();
  };
  ART.honeyPot = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(-0.5, -0.45);
      ctx.bezierCurveTo(-0.95, -0.2, -0.85, 0.85, 0, 0.85);
      ctx.bezierCurveTo(0.85, 0.85, 0.95, -0.2, 0.5, -0.45);
      ctx.closePath();
      fs(ctx, '#D9824A', '#8A4A20', 0.06);
      G.rr(ctx, -0.6, -0.62, 1.2, 0.22, 0.08);
      fs(ctx, '#E89A5E', '#8A4A20', 0.05);
      // мёд стекает
      ctx.beginPath();
      ctx.moveTo(-0.56, -0.5);
      ctx.lineTo(0.56, -0.5);
      ctx.lineTo(0.56, -0.38);
      const d = 0.12 * Math.sin(t * 2);
      ctx.quadraticCurveTo(0.4, -0.2, 0.3, -0.38);
      ctx.quadraticCurveTo(0.1, 0.05 + d, -0.05, -0.38);
      ctx.quadraticCurveTo(-0.3, -0.15, -0.4, -0.38);
      ctx.lineTo(-0.56, -0.38);
      ctx.closePath();
      fs(ctx, '#FFC928', '#D98B00', 0.03);
      G.ellipse(ctx, 0, -0.66, 0.5, 0.1);
      fs(ctx, '#FFD84A', '#D98B00', 0.03);
      shine(ctx, -0.45, 0.15, 0.08, 0.2, 0.3, 0.35);
      // сердечко на горшке
      G.heartPath(ctx, 0.05, 0.25, 0.16);
      fs(ctx, '#FFD84A', '#B87800', 0.03);
    });
    Art_bee(ctx, cx + s * 0.75 + Math.sin(t * 2) * s * 0.1, cy - s * 0.65 + Math.cos(t * 3) * s * 0.08, t, s / 45);
  };
  function Art_bee(ctx, x, y, t, sc) {
    if (VW.Art && VW.Art.bee) VW.Art.bee(ctx, x, y, t, sc);
  }
  ART.elfFlute = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(-0.7);
      G.rr(ctx, -0.95, -0.14, 1.9, 0.28, 0.14);
      fs(ctx, '#C98D52', '#6A4520', 0.05);
      ctx.fillStyle = '#5A3515';
      for (const x of [-0.3, -0.05, 0.2, 0.45]) {
        G.circle(ctx, x, 0, 0.06);
        ctx.fill();
      }
      G.rr(ctx, -0.95, -0.16, 0.18, 0.32, 0.06);
      fs(ctx, '#8B5A2B', '#5A3515', 0.03);
      // ленточка-листик
      G.ellipse(ctx, -0.55, 0.3, 0.2, 0.09, 0.8);
      fs(ctx, '#62C24F', '#2F7A2C', 0.03);
      shine(ctx, 0, -0.07, 0.6, 0.03, 0, 0.35);
    });
    // ноты
    for (let k = 0; k < 2; k++) {
      const ph = (t * 0.7 + k * 0.5) % 1;
      const nx = cx + s * (0.5 + ph * 0.35), ny = cy - s * (0.5 + ph * 0.5);
      ctx.globalAlpha = 1 - ph;
      G.ellipse(ctx, nx, ny, s * 0.09, s * 0.07, -0.4);
      ctx.fillStyle = '#9A55E8';
      ctx.fill();
      ctx.fillRect(nx + s * 0.06, ny - s * 0.3, s * 0.03, s * 0.3);
      ctx.globalAlpha = 1;
    }
  };

  // ================= Кухня =================
  ART.goldSpoon = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(-0.7);
      G.rr(ctx, -0.08, -0.1, 0.16, 1.05, 0.08);
      fs(ctx, goldGrad(ctx, 0.4, 0.6), '#B87800', 0.04);
      G.ellipse(ctx, 0, -0.45, 0.3, 0.42);
      fs(ctx, goldGrad(ctx, -0.45, 0.45), '#B87800', 0.05);
      G.ellipse(ctx, 0, -0.42, 0.18, 0.28);
      ctx.fillStyle = 'rgba(255,250,210,0.6)';
      ctx.fill();
      G.heartPath(ctx, 0, 0.8, 0.1);
      fs(ctx, '#FF4F9A');
    });
    G.sparkle(ctx, cx - s * 0.5, cy - s * 0.6, s * (0.12 + 0.06 * Math.sin(t * 5)), '#FFF6C8');
  };
  ART.teapot = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(0.5, 0.1);
      ctx.quadraticCurveTo(0.9, 0.05, 0.95, -0.35);
      ctx.lineWidth = 0.16;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#FF8FB8';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-0.62, 0.1, 0.25, PI / 2, PI * 1.5);
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = '#E0608A';
      ctx.stroke();
      G.ellipse(ctx, 0, 0.18, 0.62, 0.55);
      fs(ctx, '#FF9EC8', '#C2185B', 0.05);
      ctx.fillStyle = '#FFFFFF';
      for (const [x, y] of [[-0.3, 0.05], [0.1, 0.3], [0.3, -0.05], [-0.15, 0.45], [0.35, 0.45]]) {
        G.circle(ctx, x, y, 0.07);
        ctx.fill();
      }
      G.ellipse(ctx, 0, -0.34, 0.36, 0.1);
      fs(ctx, '#FF8FB8', '#C2185B', 0.04);
      G.circle(ctx, 0, -0.48, 0.09);
      fs(ctx, '#FFD23F', '#B87800', 0.03);
      shine(ctx, -0.3, -0.12, 0.14, 0.07, -0.4, 0.5);
      for (let k = 0; k < 3; k++) {
        const ph = (t * 0.6 + k / 3) % 1;
        G.circle(ctx, 0.98 + Math.sin(ph * 6) * 0.05, -0.5 - ph * 0.45, 0.05 + ph * 0.08);
        ctx.fillStyle = 'rgba(255,255,255,' + 0.8 * (1 - ph) + ')';
        ctx.fill();
      }
    });
  };
  ART.cupcake = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(-0.55, 0.05);
      ctx.lineTo(0.55, 0.05);
      ctx.lineTo(0.4, 0.85);
      ctx.lineTo(-0.4, 0.85);
      ctx.closePath();
      fs(ctx, '#4FC3F7', '#1E6A90', 0.05);
      ctx.beginPath();
      for (let x = -0.4; x <= 0.4; x += 0.16) {
        ctx.moveTo(x, 0.1);
        ctx.lineTo(x * 0.8, 0.8);
      }
      ctx.lineWidth = 0.03;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.62, 0.1);
      ctx.bezierCurveTo(-0.8, -0.3, -0.3, -0.35, -0.25, -0.5);
      ctx.bezierCurveTo(-0.1, -0.8, 0.3, -0.65, 0.25, -0.45);
      ctx.bezierCurveTo(0.7, -0.4, 0.8, -0.05, 0.62, 0.1);
      ctx.closePath();
      fs(ctx, '#FF9EC8', '#C2185B', 0.05);
      const cols = ['#FFD23F', '#7CD35A', '#FFFFFF', '#B983FF'];
      for (let k = 0; k < 7; k++) {
        ctx.save();
        ctx.translate(-0.45 + k * 0.15, -0.15 - ((k * 7) % 4) * 0.08);
        ctx.rotate(k);
        ctx.fillStyle = cols[k % 4];
        ctx.fillRect(-0.06, -0.02, 0.12, 0.04);
        ctx.restore();
      }
      G.circle(ctx, 0.05, -0.72, 0.14);
      fs(ctx, '#E8163E', '#8E0A26', 0.03);
      ctx.beginPath();
      ctx.moveTo(0.08, -0.84);
      ctx.quadraticCurveTo(0.12, -1.0, 0.25, -1.02);
      ctx.lineWidth = 0.04;
      ctx.strokeStyle = '#3E8E36';
      ctx.stroke();
    });
  };
  ART.jamJar = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      G.rr(ctx, -0.55, -0.45, 1.1, 1.3, 0.2);
      fs(ctx, 'rgba(230,245,255,0.9)', '#7A8AA0', 0.05);
      G.rr(ctx, -0.47, -0.25, 0.94, 1.02, 0.15);
      ctx.fillStyle = '#E0305A';
      ctx.fill();
      G.rr(ctx, -0.35, 0.05, 0.7, 0.4, 0.08);
      fs(ctx, '#FFF8E6', '#C98D52', 0.03);
      G.heartPath(ctx, 0, 0.26, 0.1);
      fs(ctx, '#E0305A');
      // тряпочка-крышка в клеточку
      ctx.beginPath();
      ctx.moveTo(-0.7, -0.45);
      ctx.lineTo(0.7, -0.45);
      ctx.lineTo(0.6, -0.72);
      ctx.lineTo(-0.6, -0.72);
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#FF5A5A';
      for (let x = -0.7; x < 0.7; x += 0.2) ctx.fillRect(x, -0.75, 0.1, 0.35);
      ctx.restore();
      ctx.lineWidth = 0.03;
      ctx.strokeStyle = '#8E2A2A';
      ctx.stroke();
      G.rr(ctx, -0.6, -0.5, 1.2, 0.08, 0.03);
      fs(ctx, '#C98D52');
      shine(ctx, -0.35, 0.2, 0.06, 0.35, 0, 0.45);
    });
  };
  ART.pie = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(-0.9, 0.35);
      ctx.bezierCurveTo(-0.85, -0.55, 0.85, -0.55, 0.9, 0.35);
      ctx.quadraticCurveTo(0, 0.55, -0.9, 0.35);
      ctx.closePath();
      fs(ctx, '#F2B26B', '#A0642A', 0.06);
      ctx.beginPath();
      for (let k = 0; k <= 8; k++) {
        const x = -0.85 + k * 0.21;
        ctx.moveTo(x, 0.36 + Math.sin((k / 8) * PI) * 0.1);
        ctx.lineTo(x + 0.08, 0.26 + Math.sin((k / 8) * PI) * 0.1);
      }
      ctx.lineWidth = 0.05;
      ctx.strokeStyle = '#A0642A';
      ctx.stroke();
      shine(ctx, -0.25, -0.15, 0.3, 0.08, -0.1, 0.45);
      for (const x of [-0.2, 0.15]) {
        ctx.beginPath();
        ctx.moveTo(x, -0.05);
        ctx.lineTo(x + 0.14, 0.05);
        ctx.lineWidth = 0.05;
        ctx.strokeStyle = '#C98A4A';
        ctx.stroke();
      }
    });
    for (let k = 0; k < 2; k++) {
      const ph = (t * 0.5 + k / 2) % 1;
      ctx.globalAlpha = 1 - ph;
      ctx.beginPath();
      ctx.moveTo(cx + (k - 0.5) * s * 0.4, cy - s * 0.5 - ph * s * 0.4);
      ctx.quadraticCurveTo(cx + (k - 0.5) * s * 0.4 + s * 0.1, cy - s * 0.65 - ph * s * 0.4, cx + (k - 0.5) * s * 0.4, cy - s * 0.8 - ph * s * 0.4);
      ctx.lineWidth = s * 0.05;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  // ================= Лес =================
  ART.pineCone = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(0.3);
      G.ellipse(ctx, 0, 0.1, 0.52, 0.82);
      fs(ctx, '#9A6433', '#5A3515', 0.05);
      for (let row = 0; row < 6; row++) {
        const y = -0.55 + row * 0.24;
        const w = 0.5 * Math.sqrt(Math.max(0.05, 1 - Math.pow((y - 0.1) / 0.85, 2)));
        for (let k = -2; k <= 2; k++) {
          const x = k * w * 0.42 + (row % 2) * w * 0.2;
          if (Math.abs(x) > w) continue;
          ctx.beginPath();
          ctx.moveTo(x - 0.1, y);
          ctx.quadraticCurveTo(x, y + 0.2, x + 0.1, y);
          ctx.closePath();
          fs(ctx, '#B87A40', '#5A3515', 0.025);
        }
      }
      ctx.beginPath();
      ctx.moveTo(0, -0.7);
      ctx.lineTo(0.05, -0.95);
      ctx.lineWidth = 0.08;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#6A4520';
      ctx.stroke();
      shine(ctx, -0.22, -0.2, 0.06, 0.25, 0.1, 0.35);
    });
  };
  ART.berryBasket = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.arc(0, -0.05, 0.62, PI * 1.05, TAU - PI * 0.05);
      ctx.lineWidth = 0.1;
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      const cols = ['#E0305A', '#3A4AD0', '#FF5A5A', '#6A2AA0'];
      for (let k = 0; k < 9; k++) {
        G.circle(ctx, -0.55 + (k % 5) * 0.28 + (k > 4 ? 0.14 : 0), 0.0 - (k > 4 ? 0.18 : 0), 0.16);
        fs(ctx, cols[k % 4], U.shade(cols[k % 4], -0.4), 0.03);
      }
      G.ellipse(ctx, 0.35, -0.2, 0.18, 0.08, -0.4);
      fs(ctx, '#62C24F', '#2F7A2C', 0.03);
      ctx.beginPath();
      ctx.moveTo(-0.8, 0.05);
      ctx.lineTo(0.8, 0.05);
      ctx.lineTo(0.6, 0.78);
      ctx.lineTo(-0.6, 0.78);
      ctx.closePath();
      fs(ctx, '#D9A35F', '#8A5A2B', 0.05);
      ctx.beginPath();
      for (let y = 0.2; y < 0.75; y += 0.16) {
        ctx.moveTo(-0.76 + (y - 0.05) * 0.27, y);
        ctx.lineTo(0.76 - (y - 0.05) * 0.27, y);
      }
      for (let x = -0.6; x <= 0.6; x += 0.2) {
        ctx.moveTo(x, 0.05);
        ctx.lineTo(x * 0.78, 0.78);
      }
      ctx.lineWidth = 0.03;
      ctx.strokeStyle = 'rgba(138,90,43,0.8)';
      ctx.stroke();
    });
  };
  ART.owlFeather = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(0.6 + Math.sin(t * 1.5) * 0.06);
      ctx.beginPath();
      ctx.moveTo(0, -0.95);
      ctx.bezierCurveTo(0.5, -0.6, 0.45, 0.4, 0.05, 0.7);
      ctx.lineTo(-0.05, 0.7);
      ctx.bezierCurveTo(-0.45, 0.4, -0.5, -0.6, 0, -0.95);
      ctx.closePath();
      fs(ctx, '#E8C08A', '#8A5A2B', 0.05);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#A0703F';
      for (let y = -0.7; y < 0.6; y += 0.22) ctx.fillRect(-0.6, y, 1.2, 0.08);
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(0, -0.9);
      ctx.lineTo(0, 0.95);
      ctx.lineWidth = 0.05;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#6A4520';
      ctx.stroke();
      shine(ctx, -0.14, -0.3, 0.05, 0.3, 0, 0.35);
    });
  };
  ART.mushroomB = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(-0.3, -0.1);
      ctx.bezierCurveTo(-0.45, 0.5, -0.4, 0.85, 0, 0.88);
      ctx.bezierCurveTo(0.4, 0.85, 0.45, 0.5, 0.3, -0.1);
      ctx.closePath();
      fs(ctx, '#FFF1D6', '#B89A6A', 0.05);
      ctx.beginPath();
      ctx.moveTo(-0.85, 0.05);
      ctx.bezierCurveTo(-0.9, -0.7, 0.9, -0.7, 0.85, 0.05);
      ctx.quadraticCurveTo(0, 0.2, -0.85, 0.05);
      ctx.closePath();
      fs(ctx, '#9A5A2B', '#5A3010', 0.05);
      shine(ctx, -0.35, -0.3, 0.22, 0.08, -0.3, 0.4);
      G.ellipse(ctx, 0.5, 0.82, 0.2, 0.08, 0);
      fs(ctx, '#62C24F', '#2F7A2C', 0.03);
    });
  };
  ART.goldLeaf = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(-0.3 + Math.sin(t * 1.4) * 0.06);
      ctx.beginPath();
      const pts = [[0, -0.95], [0.25, -0.55], [0.6, -0.65], [0.5, -0.25], [0.85, -0.05], [0.45, 0.15], [0.55, 0.5], [0.12, 0.35], [0, 0.6], [-0.12, 0.35], [-0.55, 0.5], [-0.45, 0.15], [-0.85, -0.05], [-0.5, -0.25], [-0.6, -0.65], [-0.25, -0.55]];
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      fs(ctx, goldGrad(ctx, 0, 1), '#B87800', 0.05);
      ctx.beginPath();
      ctx.moveTo(0, 0.95);
      ctx.lineTo(0, -0.8);
      ctx.moveTo(0, -0.2);
      ctx.lineTo(0.6, -0.5);
      ctx.moveTo(0, -0.2);
      ctx.lineTo(-0.6, -0.5);
      ctx.moveTo(0, 0.1);
      ctx.lineTo(0.55, 0.1);
      ctx.moveTo(0, 0.1);
      ctx.lineTo(-0.55, 0.1);
      ctx.lineWidth = 0.04;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#B87800';
      ctx.stroke();
    });
  };

  // ================= Город =================
  ART.cityKey = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(-0.7);
      G.rr(ctx, -0.1, -0.3, 0.2, 1.2, 0.06);
      fs(ctx, goldGrad(ctx, 0.3, 0.7), '#B87800', 0.04);
      G.rr(ctx, 0.08, 0.6, 0.3, 0.12, 0.03);
      fs(ctx, '#FFC928', '#B87800', 0.03);
      G.rr(ctx, 0.08, 0.8, 0.22, 0.1, 0.03);
      fs(ctx, '#FFC928', '#B87800', 0.03);
      G.circle(ctx, 0, -0.55, 0.38);
      fs(ctx, goldGrad(ctx, -0.55, 0.4), '#B87800', 0.05);
      G.heartPath(ctx, 0, -0.56, 0.18);
      fs(ctx, '#FF4F9A', '#B8185A', 0.03);
      shine(ctx, -0.18, -0.75, 0.1, 0.05, -0.5, 0.6);
    });
  };
  ART.balloon = function (ctx, cx, cy, s, t) {
    const sw = Math.sin(t * 2) * s * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx + sw, cy + s * 0.5);
    ctx.bezierCurveTo(cx + s * 0.2, cy + s * 0.7, cx - s * 0.15, cy + s * 0.8, cx + s * 0.05, cy + s * 1.0);
    ctx.lineWidth = s * 0.04;
    ctx.strokeStyle = '#6A6A7A';
    ctx.stroke();
    G.ellipse(ctx, cx + sw, cy - s * 0.12, s * 0.55, s * 0.66);
    fs(ctx, '#FF4A5A', '#A8163E', s * 0.05);
    ctx.beginPath();
    ctx.moveTo(cx + sw - s * 0.08, cy + s * 0.58);
    ctx.lineTo(cx + sw + s * 0.08, cy + s * 0.58);
    ctx.lineTo(cx + sw, cy + s * 0.5);
    ctx.closePath();
    fs(ctx, '#E03040');
    shine(ctx, cx + sw - s * 0.22, cy - s * 0.4, s * 0.1, s * 0.2, -0.4, 0.6);
  };
  ART.hardHat = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      G.rr(ctx, -0.95, 0.2, 1.9, 0.2, 0.1);
      fs(ctx, '#FFB300', '#A06A00', 0.05);
      ctx.beginPath();
      ctx.moveTo(-0.7, 0.22);
      ctx.bezierCurveTo(-0.75, -0.75, 0.75, -0.75, 0.7, 0.22);
      ctx.closePath();
      fs(ctx, '#FFC928', '#A06A00', 0.05);
      G.rr(ctx, -0.12, -0.6, 0.24, 0.8, 0.08);
      fs(ctx, '#FFD84A', '#A06A00', 0.03);
      shine(ctx, -0.4, -0.25, 0.1, 0.2, 0.3, 0.5);
      // наклейка-звёздочка
      G.starPath(ctx, 0.38, -0.05, 0.14, 0.06);
      fs(ctx, '#FF5A5A');
    });
  };
  ART.iceCream = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(-0.42, 0.05);
      ctx.lineTo(0.42, 0.05);
      ctx.lineTo(0, 0.98);
      ctx.closePath();
      fs(ctx, '#E8B06A', '#A0642A', 0.05);
      ctx.save();
      ctx.clip();
      ctx.beginPath();
      for (let k = -4; k <= 4; k++) {
        ctx.moveTo(k * 0.18 - 0.6, 0);
        ctx.lineTo(k * 0.18 + 0.4, 1);
        ctx.moveTo(k * 0.18 + 0.6, 0);
        ctx.lineTo(k * 0.18 - 0.4, 1);
      }
      ctx.lineWidth = 0.03;
      ctx.strokeStyle = '#B8763A';
      ctx.stroke();
      ctx.restore();
      G.circle(ctx, 0, 0.0, 0.42);
      fs(ctx, '#9BE0C0', '#3A9A70', 0.04);
      G.circle(ctx, 0, -0.45, 0.38);
      fs(ctx, '#FF9EC8', '#C2185B', 0.04);
      G.circle(ctx, 0.05, -0.85, 0.12);
      fs(ctx, '#E8163E', '#8E0A26', 0.03);
      shine(ctx, -0.16, -0.58, 0.1, 0.06, -0.4, 0.6);
      const cols = ['#FFD23F', '#4FC3F7', '#FFFFFF'];
      for (let k = 0; k < 5; k++) {
        ctx.save();
        ctx.translate(-0.25 + k * 0.12, -0.35 - (k % 2) * 0.12);
        ctx.rotate(k * 1.3);
        ctx.fillStyle = cols[k % 3];
        ctx.fillRect(-0.05, -0.015, 0.1, 0.03);
        ctx.restore();
      }
    });
  };
  ART.ticket = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.rotate(-0.2);
      ctx.beginPath();
      ctx.moveTo(-0.9, -0.45);
      ctx.lineTo(0.9, -0.45);
      ctx.lineTo(0.9, -0.12);
      ctx.arc(0.9, 0, 0.12, -PI / 2, PI / 2, true);
      ctx.lineTo(0.9, 0.45);
      ctx.lineTo(-0.9, 0.45);
      ctx.lineTo(-0.9, 0.12);
      ctx.arc(-0.9, 0, 0.12, PI / 2, -PI / 2, true);
      ctx.closePath();
      fs(ctx, '#FFD54F', '#B8860B', 0.05);
      ctx.beginPath();
      ctx.setLineDash([0.08, 0.07]);
      ctx.moveTo(0.45, -0.4);
      ctx.lineTo(0.45, 0.4);
      ctx.lineWidth = 0.04;
      ctx.strokeStyle = '#B8860B';
      ctx.stroke();
      ctx.setLineDash([]);
      G.starPath(ctx, -0.2, 0, 0.3, 0.13);
      fs(ctx, '#FF5A7A', '#A8163E', 0.03);
      G.circle(ctx, 0.68, 0, 0.1);
      fs(ctx, '#FF5A7A');
    });
  };

  // ================= Интернет =================
  ART.smiley = function (ctx, cx, cy, s, t) {
    G.circle(ctx, cx, cy, s * 0.85);
    ctx.fillStyle = G.vGrad(ctx, Math.round(cy - s), Math.round(cy + s), ['#FFF1A0', '#FFD23F', '#F2A900']);
    ctx.fill();
    ctx.lineWidth = s * 0.06;
    ctx.strokeStyle = '#C98A00';
    ctx.stroke();
    const blink = Math.sin(t * 1.3) > 0.97 ? 0.2 : 1;
    for (const dx of [-0.3, 0.3]) {
      G.ellipse(ctx, cx + dx * s, cy - s * 0.18, s * 0.1, s * 0.15 * blink);
      ctx.fillStyle = '#5A3A00';
      ctx.fill();
    }
    for (const dx of [-0.52, 0.52]) {
      G.ellipse(ctx, cx + dx * s, cy + s * 0.12, s * 0.12, s * 0.08);
      ctx.fillStyle = 'rgba(255,110,140,0.55)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.05, s * 0.42, 0.25, PI - 0.25);
    ctx.lineWidth = s * 0.08;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5A3A00';
    ctx.stroke();
    shine(ctx, cx - s * 0.35, cy - s * 0.5, s * 0.18, s * 0.09, -0.6, 0.6);
  };
  ART.likeHeart = function (ctx, cx, cy, s, t) {
    const beat = 1 + 0.08 * Math.max(0, Math.sin(t * 5));
    G.heartPath(ctx, cx, cy + s * 0.05, s * 0.85 * beat);
    ctx.fillStyle = G.vGrad(ctx, Math.round(cy - s), Math.round(cy + s), ['#FF9EC8', '#FF4F9A', '#E0306A']);
    ctx.fill();
    ctx.lineWidth = s * 0.06;
    ctx.strokeStyle = '#A8185A';
    ctx.stroke();
    shine(ctx, cx - s * 0.38, cy - s * 0.3, s * 0.18, s * 0.1, -0.7, 0.65);
    G.sparkle(ctx, cx + s * 0.55, cy - s * 0.55, s * (0.1 + 0.06 * Math.sin(t * 4)), '#FFFFFF');
  };
  ART.letter = function (ctx, cx, cy, s, t) {
    const fl = Math.sin(t * 3) * s * 0.05;
    unit(ctx, cx, cy + fl / s, s, () => {
      G.rr(ctx, -0.85, -0.55, 1.7, 1.1, 0.1);
      fs(ctx, '#FFFFFF', '#5A4FCF', 0.05);
      ctx.beginPath();
      ctx.moveTo(-0.85, -0.5);
      ctx.lineTo(0, 0.12);
      ctx.lineTo(0.85, -0.5);
      ctx.lineWidth = 0.05;
      ctx.strokeStyle = '#5A4FCF';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.85, 0.52);
      ctx.lineTo(-0.2, -0.02);
      ctx.moveTo(0.85, 0.52);
      ctx.lineTo(0.2, -0.02);
      ctx.lineWidth = 0.03;
      ctx.stroke();
      G.heartPath(ctx, 0, 0.1, 0.2);
      fs(ctx, '#FF4F9A', '#A8185A', 0.03);
    });
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      ctx.moveTo(cx - s * (1.05 + k * 0.08), cy - s * 0.3 + k * s * 0.3 + fl);
      ctx.lineTo(cx - s * (0.9 + k * 0.08), cy - s * 0.3 + k * s * 0.3 + fl);
    }
    ctx.lineWidth = s * 0.05;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(90,79,207,0.6)';
    ctx.stroke();
  };
  ART.pcMouse = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(0, -0.62);
      ctx.bezierCurveTo(0.1, -0.85, 0.5, -0.8, 0.45, -1.0);
      ctx.lineWidth = 0.06;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#5A4FCF';
      ctx.stroke();
      G.ellipse(ctx, 0, 0.1, 0.52, 0.75);
      fs(ctx, '#EDE7FA', '#5A4FCF', 0.06);
      ctx.beginPath();
      ctx.moveTo(0, -0.62);
      ctx.lineTo(0, -0.05);
      ctx.moveTo(-0.52, -0.05);
      ctx.quadraticCurveTo(0, 0.05, 0.52, -0.05);
      ctx.lineWidth = 0.04;
      ctx.strokeStyle = '#8A7AE0';
      ctx.stroke();
      G.rr(ctx, -0.06, -0.45, 0.12, 0.25, 0.05);
      fs(ctx, '#FF4F9A');
      G.ellipse(ctx, -0.25, -0.35, 0.16, 0.22);
      ctx.fillStyle = 'rgba(79,209,255,0.45)';
      ctx.fill();
      shine(ctx, -0.25, 0.25, 0.07, 0.2, 0.2, 0.5);
    });
  };
  ART.gamepad = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(-0.55, -0.4);
      ctx.lineTo(0.55, -0.4);
      ctx.bezierCurveTo(1.0, -0.4, 1.05, 0.55, 0.75, 0.55);
      ctx.bezierCurveTo(0.55, 0.55, 0.45, 0.25, 0.3, 0.2);
      ctx.lineTo(-0.3, 0.2);
      ctx.bezierCurveTo(-0.45, 0.25, -0.55, 0.55, -0.75, 0.55);
      ctx.bezierCurveTo(-1.05, 0.55, -1.0, -0.4, -0.55, -0.4);
      ctx.closePath();
      fs(ctx, '#7F5CFF', '#3A2A8A', 0.06);
      ctx.fillStyle = '#EDE7FA';
      ctx.fillRect(-0.6, -0.1, 0.36, 0.1);
      ctx.fillRect(-0.47, -0.23, 0.1, 0.36);
      const cols = ['#FF4A4A', '#FFD23F', '#4ADE80', '#4FC3F7'];
      [[0.45, -0.22], [0.6, -0.07], [0.45, 0.08], [0.3, -0.07]].forEach(([x, y], k) => {
        G.circle(ctx, x, y, 0.07);
        ctx.fillStyle = cols[k];
        ctx.fill();
      });
      shine(ctx, -0.5, -0.3, 0.2, 0.05, 0, 0.35);
    });
  };

  // ================= Волшебная школа (следующие круги) =================
  ART.crystal = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      ctx.beginPath();
      ctx.moveTo(-0.45, 0.95);
      ctx.lineTo(0.45, 0.95);
      ctx.lineTo(0.3, 0.55);
      ctx.lineTo(-0.3, 0.55);
      ctx.closePath();
      fs(ctx, goldGrad(ctx, 0.75, 0.25), '#B87800', 0.04);
    });
    G.circle(ctx, cx, cy - s * 0.12, s * 0.66);
    ctx.fillStyle = G.vGrad(ctx, Math.round(cy - s), Math.round(cy + s * 0.5), ['#E8DCFF', '#B983FF', '#6A3FC0']);
    ctx.fill();
    ctx.lineWidth = s * 0.05;
    ctx.strokeStyle = '#4A2A8A';
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      const a = t * 1.5 + (k * TAU) / 4;
      G.sparkle(ctx, cx + Math.cos(a) * s * 0.35, cy - s * 0.12 + Math.sin(a) * s * 0.2, s * 0.1, '#FFF6C8', 0.9);
    }
    shine(ctx, cx - s * 0.28, cy - s * 0.42, s * 0.16, s * 0.1, -0.6, 0.7);
  };
  ART.wizardHat = function (ctx, cx, cy, s, t) {
    unit(ctx, cx, cy, s, () => {
      G.ellipse(ctx, 0, 0.6, 0.95, 0.24);
      fs(ctx, '#6A3FC0', '#3A1C75', 0.05);
      ctx.beginPath();
      ctx.moveTo(-0.55, 0.6);
      ctx.quadraticCurveTo(-0.2, -0.3, 0.25 + Math.sin(t * 2) * 0.05, -0.95);
      ctx.quadraticCurveTo(0.2, -0.2, 0.55, 0.6);
      ctx.closePath();
      fs(ctx, '#8E5CE0', '#3A1C75', 0.05);
      G.rr(ctx, -0.52, 0.35, 1.04, 0.18, 0.05);
      fs(ctx, '#FFC928', '#B87800', 0.03);
      for (const [x, y, r] of [[-0.12, 0.05, 0.1], [0.12, -0.35, 0.08], [0.25, 0.15, 0.07]]) {
        G.starPath(ctx, x, y, r, r * 0.45);
        ctx.fillStyle = '#FFE45C';
        ctx.fill();
      }
    });
  };

  // Подключаем к общему рисованию находок
  const base = I.drawArtifact;
  I.drawArtifact = function (ctx, id, cx, cy, s, t, o) {
    const f = ART[id];
    if (!f) return base(ctx, id, cx, cy, s, t, o);
    o = o || {};
    t = t || 0;
    if (o.glow) {
      G.glow(ctx, cx, cy, s * 1.7, '#FFF2A8', 0.55);
      G.rays(ctx, cx, cy, s * 1.6, t * 0.5, '#FFF6C8', 10, 0.3);
    }
    f(ctx, cx, cy, s, t);
    if (o.sparkles !== false) {
      for (let i = 0; i < 3; i++) {
        const a = t * 1.3 + (i * TAU) / 3;
        const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 2);
        G.sparkle(ctx, cx + Math.cos(a) * s * 1.05, cy + Math.sin(a) * s * 0.9, s * (0.1 + tw * 0.1), '#FFFBE0', 0.9);
      }
    }
  };
  void LW;
})(window.VW);
