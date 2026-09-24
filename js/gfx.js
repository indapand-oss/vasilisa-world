/* Vasilisa World — рисование: примитивы, кнопки, иконки, фоны */
(function (VW) {
  'use strict';

  const U = VW.U;
  const G = (VW.G = {});
  const TAU = Math.PI * 2;

  G.FONT = 'ui-rounded, "SF Pro Rounded", "Arial Rounded MT Bold", "Trebuchet MS", "Segoe UI", system-ui, -apple-system, sans-serif';
  G.font = (size, weight) => (weight || 800) + ' ' + Math.max(1, Math.round(size)) + 'px ' + G.FONT;

  // ---------- контуры ----------
  G.rr = function (ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  G.circle = function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0, r), 0, TAU);
  };

  G.ellipse = function (ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot || 0, 0, TAU);
  };

  G.starPath = function (ctx, x, y, R, r, n, rot) {
    n = n || 5;
    rot = rot == null ? -Math.PI / 2 : rot;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 === 0 ? R : r;
      const a = rot + (i * Math.PI) / n;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  G.heartPath = function (ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.9);
    ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
    ctx.closePath();
  };

  // Облако: объединение кругов + основание. Рисуется одной заливкой.
  G.cloudPath = function (ctx, x, y, w, h) {
    ctx.beginPath();
    const n = Math.max(3, Math.round(w / (h * 0.9)));
    const base = y + h * 0.62;
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const cx = x + h * 0.45 + t * (w - h * 0.9);
      const bump = Math.sin(t * Math.PI);
      const r = h * (0.38 + 0.22 * bump);
      const cy = base - h * 0.1 - bump * h * 0.22;
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, TAU);
    }
    // плоское дно
    ctx.moveTo(x + h * 0.4, base);
    ctx.rect(x + h * 0.4, base - h * 0.25, w - h * 0.8, h * 0.38);
  };

  G.cloud = function (ctx, x, y, w, h, fill, shadow) {
    ctx.fillStyle = shadow || 'rgba(120,160,210,0.35)';
    G.cloudPath(ctx, x, y + h * 0.08, w, h);
    ctx.fill();
    ctx.fillStyle = fill || '#fff';
    G.cloudPath(ctx, x, y, w, h);
    ctx.fill();
  };

  G.sparklePath = function (ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.closePath();
  };

  G.sparkle = function (ctx, x, y, s, color, alpha) {
    if (alpha != null) ctx.globalAlpha = alpha;
    ctx.fillStyle = color || '#fff';
    G.sparklePath(ctx, x, y, s);
    ctx.fill();
    if (alpha != null) ctx.globalAlpha = 1;
  };

  G.glow = function (ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, U.rgba(color, alpha == null ? 0.6 : alpha));
    g.addColorStop(1, U.rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  G.rays = function (ctx, x, y, r, t, color, n, alpha) {
    n = n || 12;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t);
    ctx.fillStyle = U.rgba(color || '#FFF3B0', alpha == null ? 0.35 : alpha);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const w = Math.PI / n / 1.3;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a - w) * r, Math.sin(a - w) * r);
      ctx.lineTo(Math.cos(a + w) * r, Math.sin(a + w) * r);
      ctx.closePath();
    }
    ctx.fill();
    ctx.restore();
  };

  // ---------- текст ----------
  G.text = function (ctx, str, x, y, size, color, o) {
    o = o || {};
    ctx.font = G.font(size, o.weight);
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.baseline || 'middle';
    if (o.stroke) {
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.lineWidth = o.lw || Math.max(2, size * 0.2);
      ctx.strokeStyle = o.stroke;
      if (o.maxW) ctx.strokeText(str, x, y, o.maxW);
      else ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = color;
    if (o.maxW) ctx.fillText(str, x, y, o.maxW);
    else ctx.fillText(str, x, y);
  };

  G.measure = function (ctx, str, size, weight) {
    ctx.font = G.font(size, weight);
    return ctx.measureText(str).width;
  };

  // Перенос по словам
  G.wrap = function (ctx, str, size, maxW, weight) {
    ctx.font = G.font(size, weight);
    const words = String(str).split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  // ---------- панели и кнопки ----------
  G.panel = function (ctx, x, y, w, h, o) {
    o = o || {};
    const r = o.r == null ? 24 : o.r;
    if (o.shadow !== false) {
      G.rr(ctx, x, y + (o.shadowY || 7), w, h, r);
      ctx.fillStyle = o.shadowColor || 'rgba(40,20,80,0.18)';
      ctx.fill();
    }
    G.rr(ctx, x, y, w, h, r);
    ctx.fillStyle = o.fill || '#fff';
    ctx.fill();
    if (o.stroke) {
      ctx.lineWidth = o.lw || 4;
      ctx.strokeStyle = o.stroke;
      ctx.stroke();
    }
  };

  // Объёмная кнопка-прямоугольник. Возвращает смещение содержимого по Y
  G.button3d = function (ctx, x, y, w, h, color, pressed, r) {
    r = r == null ? Math.min(w, h) * 0.3 : r;
    const depth = 7;
    const oy = pressed ? depth - 2 : 0;
    G.rr(ctx, x, y + depth, w, h, r);
    ctx.fillStyle = U.shade(color, -0.35);
    ctx.fill();
    G.rr(ctx, x, y + oy, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
    G.rr(ctx, x + w * 0.08, y + oy + h * 0.08, w * 0.84, h * 0.4, r * 0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.26)';
    ctx.fill();
    G.rr(ctx, x, y + oy, w, h, r);
    ctx.lineWidth = 3;
    ctx.strokeStyle = U.shade(color, -0.5);
    ctx.stroke();
    return oy;
  };

  // Объёмная круглая кнопка. Возвращает смещение содержимого по Y
  G.roundButton = function (ctx, cx, cy, r, color, pressed, alpha) {
    const depth = Math.max(4, r * 0.12);
    const oy = pressed ? depth - 1 : 0;
    if (alpha != null) ctx.globalAlpha = alpha;
    G.circle(ctx, cx, cy + depth, r);
    ctx.fillStyle = U.shade(color, -0.35);
    ctx.fill();
    G.circle(ctx, cx, cy + oy, r);
    ctx.fillStyle = color;
    ctx.fill();
    G.ellipse(ctx, cx, cy + oy - r * 0.38, r * 0.7, r * 0.4);
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fill();
    G.circle(ctx, cx, cy + oy, r);
    ctx.lineWidth = Math.max(2.5, r * 0.07);
    ctx.strokeStyle = U.shade(color, -0.5);
    ctx.stroke();
    if (alpha != null) ctx.globalAlpha = 1;
    return oy;
  };

  // ---------- иконки (s — «радиус» иконки) ----------
  function thick(ctx, lw, color) {
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
  }

  G.icon = function (ctx, name, cx, cy, s, color, shadow) {
    color = color || '#fff';
    ctx.save();
    if (shadow !== false) {
      ctx.translate(0, s * 0.08);
      drawIcon(ctx, name, cx, cy, s, 'rgba(0,0,0,0.22)');
      ctx.translate(0, -s * 0.08);
    }
    drawIcon(ctx, name, cx, cy, s, color);
    ctx.restore();
  };

  function drawIcon(ctx, name, cx, cy, s, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    switch (name) {
      case 'play': {
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.42, cy - s * 0.62);
        ctx.lineTo(cx + s * 0.62, cy);
        ctx.lineTo(cx - s * 0.42, cy + s * 0.62);
        ctx.closePath();
        thick(ctx, s * 0.22, color);
        ctx.stroke();
        ctx.fill();
        break;
      }
      case 'back': {
        thick(ctx, s * 0.3, color);
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.62, cy + s * 0.05);
        ctx.lineTo(cx - s * 0.3, cy + s * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.7, cy + s * 0.05);
        ctx.lineTo(cx - s * 0.12, cy - s * 0.5);
        ctx.lineTo(cx - s * 0.12, cy + s * 0.6);
        ctx.closePath();
        thick(ctx, s * 0.16, color);
        ctx.stroke();
        ctx.fill();
        break;
      }
      case 'home': {
        thick(ctx, s * 0.14, color);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.78, cy - s * 0.02);
        ctx.lineTo(cx, cy - s * 0.72);
        ctx.lineTo(cx + s * 0.78, cy - s * 0.02);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(cx - s * 0.52, cy - s * 0.12, s * 1.04, s * 0.78);
        ctx.fill();
        G.rr(ctx, cx - s * 0.16, cy + s * 0.18, s * 0.32, s * 0.48, s * 0.08);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
        break;
      }
      case 'speaker': {
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.75, cy - s * 0.25);
        ctx.lineTo(cx - s * 0.4, cy - s * 0.25);
        ctx.lineTo(cx + s * 0.05, cy - s * 0.65);
        ctx.lineTo(cx + s * 0.05, cy + s * 0.65);
        ctx.lineTo(cx - s * 0.4, cy + s * 0.25);
        ctx.lineTo(cx - s * 0.75, cy + s * 0.25);
        ctx.closePath();
        thick(ctx, s * 0.12, color);
        ctx.stroke();
        ctx.fill();
        thick(ctx, s * 0.14, color);
        ctx.beginPath();
        ctx.arc(cx + s * 0.1, cy, s * 0.38, -0.8, 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + s * 0.1, cy, s * 0.7, -0.8, 0.8);
        ctx.stroke();
        break;
      }
      case 'music':
      case 'musicOff': {
        thick(ctx, s * 0.16, color);
        G.ellipse(ctx, cx - s * 0.3, cy + s * 0.42, s * 0.28, s * 0.22, -0.4);
        ctx.fill();
        G.ellipse(ctx, cx + s * 0.45, cy + s * 0.26, s * 0.28, s * 0.22, -0.4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.06, cy + s * 0.4);
        ctx.lineTo(cx - s * 0.06, cy - s * 0.55);
        ctx.lineTo(cx + s * 0.7, cy - s * 0.72);
        ctx.lineTo(cx + s * 0.7, cy + s * 0.22);
        ctx.stroke();
        if (name === 'musicOff') {
          thick(ctx, s * 0.2, color === '#fff' ? '#FF5A5A' : color);
          ctx.beginPath();
          ctx.moveTo(cx - s * 0.8, cy - s * 0.8);
          ctx.lineTo(cx + s * 0.8, cy + s * 0.8);
          ctx.stroke();
        }
        break;
      }
      case 'lock': {
        thick(ctx, s * 0.2, color);
        ctx.beginPath();
        ctx.arc(cx, cy - s * 0.18, s * 0.38, Math.PI, 0);
        ctx.lineTo(cx + s * 0.38, cy + s * 0.05);
        ctx.moveTo(cx - s * 0.38, cy + s * 0.05);
        ctx.lineTo(cx - s * 0.38, cy - s * 0.18);
        ctx.stroke();
        G.rr(ctx, cx - s * 0.62, cy - s * 0.08, s * 1.24, s * 0.9, s * 0.18);
        ctx.fill();
        break;
      }
      case 'check': {
        thick(ctx, s * 0.32, color);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.6, cy + s * 0.02);
        ctx.lineTo(cx - s * 0.15, cy + s * 0.48);
        ctx.lineTo(cx + s * 0.65, cy - s * 0.48);
        ctx.stroke();
        break;
      }
      case 'close': {
        thick(ctx, s * 0.3, color);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.5, cy - s * 0.5);
        ctx.lineTo(cx + s * 0.5, cy + s * 0.5);
        ctx.moveTo(cx + s * 0.5, cy - s * 0.5);
        ctx.lineTo(cx - s * 0.5, cy + s * 0.5);
        ctx.stroke();
        break;
      }
      case 'left':
      case 'right':
      case 'up':
      case 'down': {
        const rot = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[name];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(s * 0.7, 0);
        ctx.lineTo(-s * 0.35, -s * 0.66);
        ctx.lineTo(-s * 0.35, s * 0.66);
        ctx.closePath();
        thick(ctx, s * 0.24, color);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'jump': {
        thick(ctx, s * 0.26, color);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.62, cy - s * 0.02);
        ctx.lineTo(cx, cy - s * 0.62);
        ctx.lineTo(cx + s * 0.62, cy - s * 0.02);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.62, cy + s * 0.5);
        ctx.lineTo(cx, cy - s * 0.1);
        ctx.lineTo(cx + s * 0.62, cy + s * 0.5);
        ctx.stroke();
        break;
      }
      case 'ladderUp':
      case 'ladderDown': {
        thick(ctx, s * 0.13, color);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.62, cy - s * 0.75);
        ctx.lineTo(cx - s * 0.62, cy + s * 0.75);
        ctx.moveTo(cx - s * 0.1, cy - s * 0.75);
        ctx.lineTo(cx - s * 0.1, cy + s * 0.75);
        for (let i = -2; i <= 2; i++) {
          ctx.moveTo(cx - s * 0.62, cy + i * s * 0.3);
          ctx.lineTo(cx - s * 0.1, cy + i * s * 0.3);
        }
        ctx.stroke();
        ctx.save();
        ctx.translate(cx + s * 0.42, cy);
        if (name === 'ladderDown') ctx.rotate(Math.PI);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.72);
        ctx.lineTo(s * 0.4, -s * 0.12);
        ctx.lineTo(-s * 0.4, -s * 0.12);
        ctx.closePath();
        thick(ctx, s * 0.14, color);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.2);
        ctx.lineTo(0, s * 0.62);
        thick(ctx, s * 0.22, color);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'map': {
        thick(ctx, s * 0.1, color);
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.8, cy - s * 0.5);
        ctx.lineTo(cx - s * 0.28, cy - s * 0.7);
        ctx.lineTo(cx + s * 0.28, cy - s * 0.5);
        ctx.lineTo(cx + s * 0.8, cy - s * 0.7);
        ctx.lineTo(cx + s * 0.8, cy + s * 0.55);
        ctx.lineTo(cx + s * 0.28, cy + s * 0.75);
        ctx.lineTo(cx - s * 0.28, cy + s * 0.55);
        ctx.lineTo(cx - s * 0.8, cy + s * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.setLineDash([s * 0.14, s * 0.14]);
        thick(ctx, s * 0.1, 'rgba(0,0,0,0.4)');
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.55, cy + s * 0.35);
        ctx.quadraticCurveTo(cx - s * 0.1, cy - s * 0.4, cx + s * 0.3, cy + s * 0.05);
        ctx.stroke();
        ctx.setLineDash([]);
        thick(ctx, s * 0.12, 'rgba(220,40,40,0.8)');
        ctx.beginPath();
        ctx.moveTo(cx + s * 0.35, cy - s * 0.35);
        ctx.lineTo(cx + s * 0.6, cy - s * 0.1);
        ctx.moveTo(cx + s * 0.6, cy - s * 0.35);
        ctx.lineTo(cx + s * 0.35, cy - s * 0.1);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'fullscreen': {
        thick(ctx, s * 0.2, color);
        const a = s * 0.7, b = s * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - a, cy - b);
        ctx.lineTo(cx - a, cy - a);
        ctx.lineTo(cx - b, cy - a);
        ctx.moveTo(cx + b, cy - a);
        ctx.lineTo(cx + a, cy - a);
        ctx.lineTo(cx + a, cy - b);
        ctx.moveTo(cx + a, cy + b);
        ctx.lineTo(cx + a, cy + a);
        ctx.lineTo(cx + b, cy + a);
        ctx.moveTo(cx - b, cy + a);
        ctx.lineTo(cx - a, cy + a);
        ctx.lineTo(cx - a, cy + b);
        ctx.stroke();
        break;
      }
      case 'replay': {
        thick(ctx, s * 0.24, color);
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.55, -Math.PI * 0.35, Math.PI * 1.25);
        ctx.stroke();
        const ex = cx + Math.cos(-Math.PI * 0.35) * s * 0.55, ey = cy + Math.sin(-Math.PI * 0.35) * s * 0.55;
        ctx.beginPath();
        ctx.moveTo(ex + s * 0.38, ey - s * 0.12);
        ctx.lineTo(ex - s * 0.05, ey - s * 0.42);
        ctx.lineTo(ex - s * 0.08, ey + s * 0.18);
        ctx.closePath();
        thick(ctx, s * 0.12, color);
        ctx.stroke();
        ctx.fill();
        break;
      }
      case 'pause': {
        G.rr(ctx, cx - s * 0.5, cy - s * 0.6, s * 0.34, s * 1.2, s * 0.1);
        ctx.fill();
        G.rr(ctx, cx + s * 0.16, cy - s * 0.6, s * 0.34, s * 1.2, s * 0.1);
        ctx.fill();
        break;
      }
      case 'star': {
        G.starPath(ctx, cx, cy + s * 0.05, s * 0.85, s * 0.4);
        thick(ctx, s * 0.12, color);
        ctx.stroke();
        ctx.fill();
        break;
      }
      case 'question': {
        ctx.font = G.font(s * 1.6, 900);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', cx, cy + s * 0.08);
        break;
      }
      case 'shirt': {
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.3, cy - s * 0.7);
        ctx.lineTo(cx - s * 0.8, cy - s * 0.4);
        ctx.lineTo(cx - s * 0.55, cy - s * 0.05);
        ctx.lineTo(cx - s * 0.4, cy - s * 0.15);
        ctx.lineTo(cx - s * 0.4, cy + s * 0.7);
        ctx.lineTo(cx + s * 0.4, cy + s * 0.7);
        ctx.lineTo(cx + s * 0.4, cy - s * 0.15);
        ctx.lineTo(cx + s * 0.55, cy - s * 0.05);
        ctx.lineTo(cx + s * 0.8, cy - s * 0.4);
        ctx.lineTo(cx + s * 0.3, cy - s * 0.7);
        ctx.quadraticCurveTo(cx, cy - s * 0.4, cx - s * 0.3, cy - s * 0.7);
        ctx.closePath();
        thick(ctx, s * 0.1, color);
        ctx.stroke();
        ctx.fill();
        break;
      }
    }
  }

  // ---------- звёздочка-валюта и монетка ----------
  G.starIcon = function (ctx, cx, cy, r, o) {
    o = o || {};
    const rot = o.rot || 0;
    G.starPath(ctx, cx, cy + r * 0.06, r, r * 0.5, 5, -Math.PI / 2 + rot);
    ctx.fillStyle = o.dim ? '#BDB6CC' : '#FFC928';
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.5, r * 0.14);
    ctx.strokeStyle = o.dim ? '#8E86A3' : '#D98B00';
    ctx.stroke();
    // блик
    G.starPath(ctx, cx - r * 0.08, cy - r * 0.02, r * 0.5, r * 0.22, 5, -Math.PI / 2 + rot);
    ctx.fillStyle = o.dim ? 'rgba(255,255,255,0.35)' : 'rgba(255,250,210,0.8)';
    ctx.fill();
  };

  // Та же звёздочка, но заранее нарисованная в картинку — для сотен звёзд сразу
  const starCache = new Map();
  G.starSprite = function (ctx, cx, cy, r) {
    const k = (VW.scale || 1) * (VW.dpr || 1);
    const key = Math.round(r * k * 4);
    let c = starCache.get(key);
    if (!c) {
      const size = Math.ceil(r * 2.4 * k) + 4;
      c = document.createElement('canvas');
      c.width = c.height = size;
      const g = c.getContext('2d');
      g.setTransform(k, 0, 0, k, size / 2, size / 2);
      G.starIcon(g, 0, 0, r);
      c._k = k;
      if (starCache.size > 30) starCache.clear();
      starCache.set(key, c);
    }
    const s = c.width / c._k;
    ctx.drawImage(c, cx - s / 2, cy - s / 2, s, s);
  };

  // Монетка со звёздочкой; spin — угол поворота
  G.coin = function (ctx, cx, cy, r, spin) {
    const k = Math.cos(spin || 0);
    const w = Math.max(0.12, Math.abs(k));
    ctx.save();
    ctx.translate(cx, cy);
    // ребро
    G.ellipse(ctx, 0, 0, r * w + r * 0.12 * (1 - w), r);
    ctx.fillStyle = '#D98B00';
    ctx.fill();
    G.ellipse(ctx, (k >= 0 ? -1 : 1) * r * 0.1 * (1 - w), 0, r * w, r * 0.95);
    ctx.fillStyle = '#FFC928';
    ctx.fill();
    if (w > 0.35) {
      G.ellipse(ctx, 0, 0, r * w * 0.72, r * 0.72);
      ctx.lineWidth = r * 0.1;
      ctx.strokeStyle = '#F2A900';
      ctx.stroke();
      ctx.scale(w, 1);
      G.starPath(ctx, 0, r * 0.04, r * 0.48, r * 0.22);
      ctx.fillStyle = '#FFF1A8';
      ctx.fill();
    }
    ctx.restore();
    // блик
    G.ellipse(ctx, cx - r * 0.3 * w, cy - r * 0.45, r * 0.18 * w + 0.5, r * 0.26);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  };

  // Плашка со звёздами: ★ 123
  G.starCounter = function (ctx, x, y, value, h, o) {
    o = o || {};
    h = h || 64;
    const txt = String(value);
    const fs = h * 0.56;
    const tw = G.measure(ctx, txt, fs, 900);
    const w = h * 1.05 + tw + h * 0.4;
    G.panel(ctx, x, y, w, h, { r: h / 2, fill: o.fill || 'rgba(255,255,255,0.92)', stroke: '#F2A900', lw: 3, shadowY: 4 });
    const pulse = o.pulse || 0;
    G.starIcon(ctx, x + h * 0.52, y + h * 0.5, h * 0.36 * (1 + pulse * 0.35));
    G.text(ctx, txt, x + h * 0.95, y + h * 0.53, fs, '#5A3A00', { align: 'left', weight: 900 });
    return w;
  };

  // Цена: ★ 30 (серым, если пока не хватает)
  G.priceTag = function (ctx, cx, cy, price, h, affordable) {
    const txt = String(price);
    const fs = h * 0.62;
    const tw = G.measure(ctx, txt, fs, 900);
    const w = h + tw + h * 0.3;
    const x = cx - w / 2;
    G.rr(ctx, x, cy - h / 2, w, h, h / 2);
    ctx.fillStyle = affordable ? '#FFE27A' : '#EFEAF6';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = affordable ? '#E0A000' : '#B8AECB';
    ctx.stroke();
    G.starIcon(ctx, x + h * 0.52, cy, h * 0.36, { dim: !affordable });
    G.text(ctx, txt, x + h * 0.95, cy + h * 0.04, fs, affordable ? '#6A4300' : '#7D7392', { align: 'left', weight: 900 });
    return w;
  };

  // Замочек на плашке
  G.lockBadge = function (ctx, cx, cy, s) {
    G.circle(ctx, cx, cy, s);
    ctx.fillStyle = '#6B5B95';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    drawIcon(ctx, 'lock', cx, cy + s * 0.05, s * 0.62, '#fff');
  };

  G.checkBadge = function (ctx, cx, cy, s) {
    G.circle(ctx, cx, cy, s);
    ctx.fillStyle = '#2FBF55';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    drawIcon(ctx, 'check', cx, cy, s * 0.62, '#fff');
  };

  // ---------- фоны ----------
  // Тетрадный лист в клеточку — как эскизы Василисы
  G.notebook = function (ctx, W, H, o) {
    o = o || {};
    ctx.fillStyle = o.paper || '#FFFDF4';
    ctx.fillRect(0, 0, W, H);
    const step = 30;
    ctx.beginPath();
    for (let x = step; x < W; x += step) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, H);
    }
    for (let y = step; y < H; y += step) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(W, Math.round(y) + 0.5);
    }
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(110,160,215,0.3)';
    ctx.stroke();
    if (o.margin !== false) {
      ctx.beginPath();
      ctx.moveTo(W - 58.5, 0);
      ctx.lineTo(W - 58.5, H);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(232,80,90,0.45)';
      ctx.stroke();
    }
  };

  // Небо-градиент (кэшируется по размеру)
  const gradCache = new Map();
  G.vGrad = function (ctx, y0, y1, stops) {
    const key = y0 + '|' + y1 + '|' + stops.join(',');
    let g = gradCache.get(key);
    if (!g) {
      g = ctx.createLinearGradient(0, y0, 0, y1);
      stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
      if (gradCache.size > 200) gradCache.clear();
      gradCache.set(key, g);
    }
    return g;
  };

  G.sky = function (ctx, W, H, stops) {
    ctx.fillStyle = G.vGrad(ctx, 0, H, stops);
    ctx.fillRect(0, 0, W, H);
  };

  // Мерцающие звёзды на ночном небе (детерминированно)
  G.nightStars = function (ctx, W, H, t, seed, count, offX, offY) {
    const r = U.rng(seed || 7);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < (count || 60); i++) {
      const x = ((r() * (W + 200) - (offX || 0)) % (W + 200) + W + 200) % (W + 200) - 100;
      const y = ((r() * (H + 200) - (offY || 0)) % (H + 200) + H + 200) % (H + 200) - 100;
      const s = 1.5 + r() * 3.5;
      const tw = 0.5 + 0.5 * Math.sin(t * (1 + r() * 2) + i);
      ctx.globalAlpha = 0.35 + tw * 0.65;
      if (s > 4) G.sparkle(ctx, x, y, s * 1.6, '#FFF7C2');
      else {
        G.circle(ctx, x, y, s * 0.6);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  // Холмы (для заставки и карты)
  G.hill = function (ctx, x0, x1, baseY, amp, color, seed) {
    const r = U.rng(seed || 3);
    ctx.beginPath();
    ctx.moveTo(x0, baseY + 400);
    ctx.lineTo(x0, baseY);
    const n = 8;
    const ph = r() * 10;
    for (let i = 0; i <= n * 4; i++) {
      const x = x0 + ((x1 - x0) * i) / (n * 4);
      const y = baseY - amp * (0.5 + 0.5 * Math.sin(i * 0.35 + ph)) - amp * 0.3 * Math.sin(i * 0.9 + ph * 2);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x1, baseY + 400);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
})(window.VW);
