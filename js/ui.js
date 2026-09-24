/* Vasilisa World — ввод (касания, мышь, клавиатура), кнопки, субтитры, частицы */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G;
  const UI = (VW.UI = {});
  const TAU = Math.PI * 2;

  UI.hits = []; // кнопки, нарисованные в последнем кадре
  UI.holds = []; // «зажимаемые» кнопки управления в игре
  UI.pointers = new Map();
  UI.edges = new Set(); // только что нажатые кнопки управления
  UI.keys = Object.create(null);
  UI.keyEdges = new Set();
  UI.touchMode = false;
  UI.locked = false; // во время перехода между экранами

  UI.begin = function () {
    UI.hits = [];
    UI.holds = [];
  };

  // Прямоугольная кнопка. Возвращает true, если сейчас нажата
  // o.scroll — объект прокрутки {pos, vel, max, axis}: если палец потянули, кнопка не нажимается, а список едет
  UI.btn = function (id, x, y, w, h, onTap, o) {
    o = o || {};
    UI.hits.push({ id: id, x: x, y: y, w: w, h: h, onTap: onTap, onDown: o.onDown, pad: o.pad == null ? 6 : o.pad, scroll: o.scroll || null });
    return UI.isPressed(id);
  };

  // Плавная прокрутка списков (инерция и «пружинка» у краёв)
  UI.stepScroll = function (st, dt) {
    if (!st || st.dragging) return;
    const max = st.max || 0;
    if (st.target != null) {
      st.pos += (st.target - st.pos) * Math.min(1, dt * 12);
      st.vel = 0;
      if (Math.abs(st.target - st.pos) < 0.5) {
        st.pos = st.target;
        st.target = null;
      }
      return;
    }
    if (Math.abs(st.vel || 0) > 5) {
      st.pos += st.vel * dt;
      st.vel *= Math.exp(-dt * 5);
    } else st.vel = 0;
    if (st.pos < 0) {
      st.pos += (0 - st.pos) * Math.min(1, dt * 14);
      if (st.vel < 0) st.vel = 0;
    }
    if (st.pos > max) {
      st.pos += (max - st.pos) * Math.min(1, dt * 14);
      if (st.vel > 0) st.vel = 0;
    }
  };

  // Круглая кнопка
  UI.btnC = function (id, cx, cy, r, onTap, o) {
    o = o || {};
    UI.hits.push({ id: id, round: true, cx: cx, cy: cy, r: r, onTap: onTap, onDown: o.onDown, pad: o.pad == null ? 8 : o.pad });
    return UI.isPressed(id);
  };

  // Перехватывает касания ниже (для окошек поверх экрана)
  UI.blocker = function (onTap) {
    UI.hits.push({ id: '__blocker' + UI.hits.length, blocker: true, onTap: onTap });
  };

  // Кнопка управления, которую держат (влево/вправо/прыжок)
  UI.hold = function (id, cx, cy, r) {
    UI.holds.push({ id: id, cx: cx, cy: cy, r: r });
    return UI.held(id);
  };

  function inside(b, x, y, extra) {
    if (b.blocker) return true;
    const pad = (b.pad || 0) + (extra || 0);
    if (b.round) return (x - b.cx) * (x - b.cx) + (y - b.cy) * (y - b.cy) <= (b.r + pad) * (b.r + pad);
    return x >= b.x - pad && x <= b.x + b.w + pad && y >= b.y - pad && y <= b.y + b.h + pad;
  }

  function findBtn(x, y) {
    for (let i = UI.hits.length - 1; i >= 0; i--) {
      if (inside(UI.hits[i], x, y)) return UI.hits[i];
    }
    return null;
  }

  function byId(id) {
    for (let i = UI.hits.length - 1; i >= 0; i--) if (UI.hits[i].id === id) return UI.hits[i];
    return null;
  }

  function findHold(x, y) {
    // ближайшая кнопка в пределах увеличенного радиуса
    let best = null, bd = Infinity;
    for (const h of UI.holds) {
      const d = Math.hypot(x - h.cx, y - h.cy);
      if (d <= h.r * 1.3 && d < bd) {
        bd = d;
        best = h;
      }
    }
    return best;
  }

  UI.isPressed = function (id) {
    for (const p of UI.pointers.values()) if (p.btn === id && p.inside) return true;
    return false;
  };

  UI.held = function (id) {
    for (const p of UI.pointers.values()) if (p.isHold && p.hold === id) return true;
    return false;
  };

  UI.edge = function (id) {
    return UI.edges.has(id);
  };

  UI.key = function (code) {
    return !!UI.keys[code];
  };

  UI.keyEdge = function (code) {
    return UI.keyEdges.has(code);
  };

  UI.clearEdges = function () {
    UI.edges.clear();
    UI.keyEdges.clear();
  };

  UI.releaseAll = function () {
    for (const p of UI.pointers.values()) if (p.drag) p.drag.dragging = false;
    UI.pointers.clear();
    UI.keys = Object.create(null);
    UI.edges.clear();
    UI.keyEdges.clear();
  };

  // ---------- обработка событий ----------
  function down(pid, x, y) {
    if (UI.locked) return;
    const h = findHold(x, y);
    const b = findBtn(x, y);
    // обычные кнопки (пауза и т.п.) важнее кнопок управления, если палец точно на них
    if (h && !(b && !b.blocker)) {
      UI.pointers.set(pid, { x: x, y: y, isHold: true, hold: h.id });
      UI.edges.add(h.id);
      return;
    }
    UI.pointers.set(pid, { x: x, y: y, btn: b ? b.id : null, inside: true, sx: x, sy: y, t: performance.now() });
    if (b && b.onDown) b.onDown(x, y);
  }

  function move(pid, x, y) {
    const p = UI.pointers.get(pid);
    if (!p) return;
    p.x = x;
    p.y = y;
    if (p.isHold) {
      const h = findHold(x, y);
      const id = h ? h.id : null;
      if (id && id !== p.hold) UI.edges.add(id);
      p.hold = id;
      return;
    }
    if (p.btn) {
      const b = byId(p.btn);
      // палец тянет список — это прокрутка, а не нажатие
      if (!p.drag && b && b.scroll) {
        const d = b.scroll.axis === 'x' ? x - p.sx : y - p.sy;
        if (Math.abs(d) > 10) {
          p.drag = b.scroll;
          p.inside = false;
          p.last = b.scroll.axis === 'x' ? x : y;
          p.lastT = performance.now();
          p.drag.dragging = true;
          p.drag.target = null;
          p.drag.vel = 0;
        }
      }
      if (p.drag) {
        const cur = p.drag.axis === 'x' ? x : y;
        const now = performance.now();
        const dd = cur - p.last;
        const dts = Math.max(0.008, (now - p.lastT) / 1000);
        p.drag.pos -= dd;
        p.drag.vel = (p.drag.vel || 0) * 0.5 + (-dd / dts) * 0.5;
        p.last = cur;
        p.lastT = now;
        return;
      }
      p.inside = !!b && inside(b, x, y, 14);
    }
  }

  function up(pid, x, y) {
    const p = UI.pointers.get(pid);
    if (!p) return;
    UI.pointers.delete(pid);
    if (p.drag) {
      p.drag.dragging = false;
      if (performance.now() - p.lastT > 120) p.drag.vel = 0;
      return;
    }
    if (UI.locked) return;
    if (p.btn) {
      const b = byId(p.btn);
      if (b && inside(b, x, y, 18) && b.onTap) b.onTap(x, y);
    }
  }

  function cancel(pid) {
    const p = UI.pointers.get(pid);
    if (p && p.drag) p.drag.dragging = false;
    UI.pointers.delete(pid);
  }

  function toLogical(cx, cy) {
    const r = VW.canvas.getBoundingClientRect();
    return [(cx - r.left) / VW.scale, (cy - r.top) / VW.scale];
  }

  function unlockMedia() {
    if (VW.Audio) VW.Audio.unlock();
  }

  UI.attach = function (canvas) {
    const opt = { passive: false };
    canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        UI.touchMode = true;
        for (const t of e.changedTouches) {
          const [x, y] = toLogical(t.clientX, t.clientY);
          down('t' + t.identifier, x, y);
        }
      },
      opt
    );
    canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        for (const t of e.changedTouches) {
          const [x, y] = toLogical(t.clientX, t.clientY);
          move('t' + t.identifier, x, y);
        }
      },
      opt
    );
    const endT = (e) => {
      e.preventDefault();
      unlockMedia(); // на iPad звук и голос разрешаются только в touchend
      for (const t of e.changedTouches) {
        const [x, y] = toLogical(t.clientX, t.clientY);
        up('t' + t.identifier, x, y);
      }
    };
    canvas.addEventListener('touchend', endT, opt);
    canvas.addEventListener(
      'touchcancel',
      (e) => {
        for (const t of e.changedTouches) cancel('t' + t.identifier);
      },
      opt
    );

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const [x, y] = toLogical(e.clientX, e.clientY);
      down('m', x, y);
    });
    window.addEventListener('mousemove', (e) => {
      const [x, y] = toLogical(e.clientX, e.clientY);
      move('m', x, y);
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return;
      unlockMedia();
      const [x, y] = toLogical(e.clientX, e.clientY);
      up('m', x, y);
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault(), opt);
    document.addEventListener('dblclick', (e) => e.preventDefault(), opt);
    document.addEventListener(
      'touchmove',
      (e) => {
        if (e.target !== canvas) e.preventDefault();
      },
      opt
    );

    const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
    window.addEventListener('keydown', (e) => {
      const code = e.code || e.key;
      if (GAME_KEYS.indexOf(code) >= 0 || code === 'Enter') e.preventDefault();
      unlockMedia();
      if (!e.repeat) UI.keyEdges.add(code);
      UI.keys[code] = true;
      if (!e.repeat && !UI.locked && VW.screen && VW.screen.onKey) VW.screen.onKey(code);
    });
    window.addEventListener('keyup', (e) => {
      const code = e.code || e.key;
      UI.keys[code] = false;
    });
    window.addEventListener('blur', UI.releaseAll);
  };

  // ---------- субтитры ----------
  UI.drawSubtitle = function (ctx, W, H, pos) {
    const s = VW.Voice.currentSubtitle();
    if (!s) return;
    const a = Math.min(1, s.age / 0.2, (s.dur + 0.4 - s.age) / 0.3);
    if (a <= 0) return;
    const fsz = 26;
    const maxW = Math.min(W * 0.62, 760);
    const lines = G.wrap(ctx, s.text, fsz, maxW - 70, 800);
    const lh = fsz * 1.25;
    let w = 0;
    ctx.font = G.font(fsz, 800);
    for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
    w += 84;
    const h = lines.length * lh + 26;
    const x = W / 2 - w / 2;
    const y = typeof pos === 'number' ? pos : pos === 'top' ? 96 : H - h - 16;
    ctx.globalAlpha = a;
    G.rr(ctx, x, y, w, h, 22);
    ctx.fillStyle = 'rgba(40,24,90,0.82)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.stroke();
    G.icon(ctx, 'speaker', x + 34, y + h / 2, 15, '#FFE680', false);
    lines.forEach((l, i) => G.text(ctx, l, x + 58, y + 13 + lh * (i + 0.5), fsz, '#fff', { align: 'left', weight: 800 }));
    ctx.globalAlpha = 1;
  };

  // =========================================================
  // Частицы
  // =========================================================
  const CONF = ['#FF4F9A', '#FFC928', '#2FA8F0', '#2FBF55', '#9A55E8', '#FF8C1A', '#FF5A5A'];

  class Particles {
    constructor() {
      this.list = [];
    }
    clear() {
      this.list.length = 0;
    }
    add(p) {
      p.age = 0;
      p.life = p.life || 1;
      p.g = p.g == null ? 0 : p.g;
      p.drag = p.drag == null ? 0 : p.drag;
      p.rot = p.rot || 0;
      p.vr = p.vr || 0;
      this.list.push(p);
      if (this.list.length > 700) this.list.splice(0, this.list.length - 700);
      return p;
    }
    burst(type, x, y, n, o) {
      o = o || {};
      for (let i = 0; i < n; i++) {
        const a = o.angle != null ? o.angle + U.rand(-(o.spread || 0.6), o.spread || 0.6) : U.rand(0, TAU);
        const sp = U.rand(o.speedMin || 80, o.speed || 320);
        this.add({
          type: type,
          x: x + U.rand(-(o.jitter || 0), o.jitter || 0),
          y: y + U.rand(-(o.jitter || 0), o.jitter || 0),
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          g: o.g != null ? o.g : type === 'confetti' ? 420 : type === 'splash' ? 900 : 0,
          drag: o.drag != null ? o.drag : type === 'confetti' ? 1.6 : 1.2,
          life: U.rand(o.lifeMin || 0.5, o.life || 1.1),
          size: U.rand(o.sizeMin || 4, o.size || 9),
          color: o.color || (type === 'confetti' ? U.pick(CONF) : '#FFF6B0'),
          rot: U.rand(0, TAU),
          vr: U.rand(-8, 8),
        });
      }
    }
    update(dt) {
      const L = this.list;
      let j = 0;
      for (let i = 0; i < L.length; i++) {
        const p = L[i];
        p.age += dt;
        if (p.age >= p.life) continue;
        if (p.drag) {
          const k = Math.exp(-p.drag * dt);
          p.vx *= k;
          p.vy *= k;
        }
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        L[j++] = p;
      }
      L.length = j;
    }
    draw(ctx) {
      for (const p of this.list) {
        const k = p.age / p.life;
        const a = 1 - k;
        switch (p.type) {
          case 'spark':
            G.sparkle(ctx, p.x, p.y, p.size * (1 - k * 0.6), p.color, a);
            break;
          case 'star':
            ctx.globalAlpha = a;
            G.starPath(ctx, p.x, p.y, p.size, p.size * 0.45, 5, p.rot);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            break;
          case 'confetti':
            ctx.save();
            ctx.globalAlpha = Math.min(1, a * 2);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.cos(p.age * 9 + p.size));
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
            break;
          case 'dust':
            ctx.globalAlpha = a * 0.6;
            G.circle(ctx, p.x, p.y, p.size * (0.6 + k));
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            break;
          case 'bubble':
            ctx.globalAlpha = a;
            G.circle(ctx, p.x + Math.sin(p.age * 6 + p.size) * 3, p.y, p.size);
            ctx.lineWidth = 2;
            ctx.strokeStyle = p.color;
            ctx.stroke();
            ctx.globalAlpha = 1;
            break;
          case 'splash':
            ctx.globalAlpha = a;
            G.circle(ctx, p.x, p.y, p.size * 0.5);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            break;
          case 'heart':
            ctx.globalAlpha = a;
            G.heartPath(ctx, p.x, p.y, p.size);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.globalAlpha = 1;
            break;
          case 'glow':
            ctx.globalAlpha = a;
            G.glow(ctx, p.x, p.y, p.size * (1 + k), p.color, 0.7);
            ctx.globalAlpha = 1;
            break;
        }
      }
    }
  }
  VW.Particles = Particles;
})(window.VW);
