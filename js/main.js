/* Vasilisa World — запуск, главный цикл, масштабирование, переходы между экранами */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, UI = VW.UI;

  const BASE_H = 720; // логическая высота экрана
  const MIN_W = 960; // минимальная логическая ширина (4:3)

  VW.screens = VW.screens || {};
  VW.screen = null;
  VW.time = 0;
  VW.W = MIN_W;
  VW.H = BASE_H;
  VW.scale = 1;
  VW.dpr = 1;
  VW.portrait = false;
  VW.dprCap = 2; // снижается автоматически, если планшет не успевает

  const params = new URLSearchParams(location.search);
  VW.debug = params.has('debug');

  let canvas, ctx;
  let trans = null; // { phase: 'out'|'in', t, to, params }
  let pendingSwitch = null;

  VW.resize = function () {
    const cw = Math.max(1, window.innerWidth);
    const ch = Math.max(1, window.innerHeight);
    VW.dpr = Math.min(window.devicePixelRatio || 1, VW.dprCap);
    VW.scale = Math.min(ch / BASE_H, cw / MIN_W);
    VW.W = cw / VW.scale;
    VW.H = ch / VW.scale;
    canvas.width = Math.round(cw * VW.dpr);
    canvas.height = Math.round(ch * VW.dpr);
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    VW.portrait = ch > cw * 1.05;
    if (VW.screen && VW.screen.resize) VW.screen.resize();
  };

  // Переход на другой экран с «волшебной» шторкой
  VW.go = function (name, p, instant) {
    if (!VW.screens[name]) return;
    if (instant) {
      switchTo(name, p);
      return;
    }
    if (trans && trans.phase === 'out') return;
    trans = { phase: 'out', t: 0, to: name, params: p };
    UI.locked = true;
    UI.releaseAll();
  };

  function switchTo(name, p) {
    if (VW.screen && VW.screen.exit) VW.screen.exit();
    VW.screen = VW.screens[name];
    VW.screenName = name;
    UI.releaseAll();
    if (VW.screen.enter) VW.screen.enter(p || {});
  }

  const TRANS_T = 0.3;

  function updateTransition(dt) {
    if (!trans) return;
    trans.t += dt;
    if (trans.phase === 'out' && trans.t >= TRANS_T) {
      switchTo(trans.to, trans.params);
      trans = { phase: 'in', t: 0 };
    } else if (trans.phase === 'in' && trans.t >= TRANS_T) {
      trans = null;
      UI.locked = false;
    }
  }

  function drawTransition(ctx, W, H) {
    if (!trans) return;
    let k = U.clamp(trans.t / TRANS_T, 0, 1);
    k = trans.phase === 'out' ? U.easeInOut(k) : 1 - U.easeInOut(k);
    if (k <= 0) return;
    const R = Math.hypot(W, H) * 0.6 * k;
    ctx.save();
    ctx.fillStyle = '#5B3FB8';
    G.circle(ctx, W / 2, H / 2, R);
    ctx.fill();
    // звёздочки по краю шторки
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + VW.time * 2;
      G.sparkle(ctx, W / 2 + Math.cos(a) * R, H / 2 + Math.sin(a) * R, 16 + 8 * Math.sin(i + VW.time * 8), '#FFE680');
    }
    ctx.restore();
  }

  // Экран «Поверни планшет»
  function drawRotate(ctx, W, H) {
    ctx.fillStyle = '#5B3FB8';
    ctx.fillRect(0, 0, W, H);
    const t = VW.time;
    const cx = W / 2, cy = H * 0.42;
    const a = (Math.sin(t * 2) * 0.5 + 0.5) * (Math.PI / 2);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-a);
    G.rr(ctx, -70, -110, 140, 220, 22);
    ctx.fillStyle = '#fff';
    ctx.fill();
    G.rr(ctx, -58, -94, 116, 188, 10);
    ctx.fillStyle = '#9B7BFF';
    ctx.fill();
    G.starIcon(ctx, 0, 0, 34);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, 170, -2.4, -1.2);
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FFE680';
    ctx.stroke();
    G.text(ctx, 'Поверни планшет', cx, H * 0.8, Math.min(64, W / 9), '#fff', { stroke: '#3A2380', lw: 10 });
  }

  let last = 0;
  let fpsAcc = 0, fpsN = 0, fps = 60;

  // Автоподстройка качества: если кадры идут медленно, рисуем в чуть меньшем разрешении
  // (2 → 1.5 → 1.25). Картинка остаётся чёткой, а игра — плавной.
  const frameTimes = [];
  function watchPerformance(dt) {
    if (dt <= 0 || dt > 0.25 || document.hidden || VW.portrait) return;
    frameTimes.push(dt);
    if (frameTimes.length < 120) return;
    const sorted = frameTimes.slice().sort((a, b) => a - b);
    frameTimes.length = 0;
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median > 0.022 && VW.dprCap > 1.25 && (window.devicePixelRatio || 1) > 1.25) {
      VW.dprCap = VW.dprCap > 1.5 ? 1.5 : 1.25;
      VW.resize();
    }
  }

  function frame(ts) {
    requestAnimationFrame(frame);
    const now = ts / 1000;
    let dt = last ? now - last : 1 / 60;
    last = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    VW.time += dt;
    VW.starPulse = Math.max(0, (VW.starPulse || 0) - dt);
    if (!params.has('fixeddpr')) watchPerformance(dt);

    fpsAcc += dt;
    fpsN++;
    if (fpsAcc > 0.5) {
      fps = fpsN / fpsAcc;
      fpsAcc = 0;
      fpsN = 0;
    }

    const W = VW.W, H = VW.H;
    const scr = VW.screen;
    if (!VW.portrait && scr && scr.update) scr.update(dt);
    updateTransition(dt);
    UI.clearEdges();

    const k = VW.scale * VW.dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    UI.begin();
    if (scr && scr.draw) scr.draw(ctx, W, H);
    UI.drawSubtitle(ctx, W, H, scr && scr.subtitlePos);
    drawTransition(ctx, W, H);
    if (VW.portrait) {
      UI.begin();
      UI.blocker(null);
      drawRotate(ctx, W, H);
    }
    if (VW.debug) {
      G.text(ctx, Math.round(fps) + ' fps', W - 10, H - 14, 16, '#000', { align: 'right', stroke: '#fff', lw: 4 });
    }
  }

  VW.toggleFullscreen = function () {
    const d = document, el = d.documentElement;
    const fsEl = d.fullscreenElement || d.webkitFullscreenElement;
    try {
      if (fsEl) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) {
      /* ничего */
    }
  };
  VW.canFullscreen = function () {
    const el = document.documentElement;
    const standalone = window.navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    return !standalone && !!(el.requestFullscreen || el.webkitRequestFullscreen);
  };

  function boot() {
    canvas = document.getElementById('game');
    VW.canvas = canvas;
    ctx = canvas.getContext('2d', { alpha: false });
    VW.ctx = ctx;
    const bootEl = document.getElementById('boot');
    if (bootEl) bootEl.remove();

    if (params.has('reset')) {
      VW.Store.reset();
      history.replaceState(null, '', location.pathname);
    }
    VW.Store.load();
    VW.Store.data.visits++;
    VW.Store.save();
    VW.Store.persist();
    VW.Audio.musicOn = VW.Store.data.music !== false;
    if (VW.debug && params.has('stars')) {
      VW.Store.data.stars = parseInt(params.get('stars'), 10) || 0;
    }

    VW.resize();
    window.addEventListener('resize', VW.resize);
    window.addEventListener('orientationchange', () => {
      VW.resize();
      setTimeout(VW.resize, 350);
    });
    UI.attach(canvas);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        VW.Audio.suspend();
        VW.Voice.stop();
        VW.Store.save();
        if (VW.screen && VW.screen.onHide) VW.screen.onHide();
      } else {
        VW.Audio.resume();
      }
    });
    window.addEventListener('pagehide', () => VW.Store.save());

    const start = params.get('screen');
    if (VW.debug && start && VW.screens[start]) {
      const dp = { debug: true, scene: params.get('scene') || undefined, world: params.get('world') || undefined };
      if (params.has('round')) dp.round = parseInt(params.get('round'), 10) || 1;
      if (params.has('idx')) dp.idx = parseInt(params.get('idx'), 10) || 0;
      switchTo(start, dp);
    }
    else switchTo('title', {});
    requestAnimationFrame(frame);

    // Офлайн-режим: service worker (только по https/localhost)
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !VW.debug) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.VW);
