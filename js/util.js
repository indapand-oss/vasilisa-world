/* Vasilisa World — общие утилиты */
window.VW = window.VW || {};

(function (VW) {
  'use strict';

  const U = (VW.U = {});

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.approach = (v, target, delta) =>
    v < target ? Math.min(v + delta, target) : Math.max(v - delta, target);
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  U.inRect = (px, py, x, y, w, h) => px >= x && px <= x + w && py >= y && py <= y + h;
  U.TAU = Math.PI * 2;

  // Плавности
  U.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  U.easeInCubic = (t) => t * t * t;
  U.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  U.easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  U.easeOutElastic = (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  };

  // Детерминированный генератор случайных чисел (для декораций, чтобы не «прыгали»)
  U.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Цвета
  U.hexToRgb = function (hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  U.rgbToHex = function (r, g, b) {
    const c = (v) => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
  };
  // amt > 0 — светлее, amt < 0 — темнее
  const shadeCache = new Map();
  U.shade = function (hex, amt) {
    const key = hex + '|' + amt;
    let res = shadeCache.get(key);
    if (res) return res;
    const [r, g, b] = U.hexToRgb(hex);
    if (amt >= 0) res = U.rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
    else res = U.rgbToHex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
    if (shadeCache.size > 600) shadeCache.clear();
    shadeCache.set(key, res);
    return res;
  };
  U.rgba = function (hex, a) {
    const [r, g, b] = U.hexToRgb(hex);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  };
  U.hsl = (h, s, l) => 'hsl(' + (((h % 360) + 360) % 360) + ',' + s + '%,' + l + '%)';
  U.hslToHex = function (h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    s /= 100;
    l /= 100;
    const f = (n) => {
      const k = (n + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return U.rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
  };

  // Русское склонение: plural(5, 'звёздочка', 'звёздочки', 'звёздочек')
  U.plural = function (n, one, few, many) {
    const n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
    return many;
  };
})(window.VW);
