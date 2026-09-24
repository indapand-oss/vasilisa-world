/* Vasilisa World — фон сгенерированных сцен: небо, дальние силуэты, стены, стволы,
   фоны высоких сцен и эффекты переднего плана. Декор на земле и друзья — в decor.js. */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, Art = VW.Art;
  const Sc = (VW.Scenery = {});
  const TAU = Math.PI * 2;
  const fs = Art.fs;

  function camUp(L, cam, SH) {
    return Math.max(0, L.h - SH - cam.y);
  }

  // =========================================================
  // Дальние силуэты (экранные координаты, параллакс)
  // =========================================================
  const FAR = (Sc.FAR = {});
  // Повторяющийся «рисунок» шириной span: items(x) → рисует объекты, сдвинутые на off
  function tiled(SW, off, span, draw) {
    const start = Math.floor(off / span) * span;
    for (let base = start; base < off + SW + span; base += span) draw(base - off);
  }
  function tileItems(o, span, make) {
    if (!o._items) {
      const r = U.rng(o.seed || 17);
      o._items = make(r, span);
    }
    return o._items;
  }

  FAR.mountains = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp * 1.6 > SH) return;
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.moveTo(-10, SH + 10);
    const off = cam.x * o.f, seed = o.seed || 1;
    for (let x = -10; x <= SW + 40; x += 30) {
      const wx = x + off;
      ctx.lineTo(x, y0 - o.amp * (0.55 + 0.45 * Math.sin(wx * 0.0042 + seed)) - o.amp * 0.35 * Math.abs(Math.sin(wx * 0.011 + seed * 2)));
    }
    ctx.lineTo(SW + 40, SH + 10);
    ctx.closePath();
    ctx.fill();
  };
  FAR.hills = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp > SH) return;
    ctx.fillStyle = o.color;
    ctx.beginPath();
    ctx.moveTo(-10, SH + 10);
    const off = cam.x * o.f, seed = o.seed || 3;
    for (let x = -10; x <= SW + 40; x += 24) {
      const wx = x + off;
      ctx.lineTo(x, y0 - o.amp * (0.5 + 0.5 * Math.sin(wx * 0.006 + seed)) - o.amp * 0.25 * Math.sin(wx * 0.017 + seed));
    }
    ctx.lineTo(SW + 40, SH + 10);
    ctx.closePath();
    ctx.fill();
  };
  FAR.roundTrees = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp * 2 > SH) return;
    const span = 900;
    const items = tileItems(o, span, (r) => {
      const a = [];
      for (let x = 0; x < span; x += 60 + r() * 70) a.push([x, o.amp * (0.6 + r() * 0.6), 30 + r() * 30]);
      return a;
    });
    ctx.fillStyle = o.color;
    ctx.beginPath();
    tiled(SW, cam.x * o.f, span, (bx) => {
      for (const [x, h, rr] of items) {
        const cx = bx + x;
        if (cx < -80 || cx > SW + 80) continue;
        ctx.rect(cx - 5, y0 - h + rr, 10, h);
        ctx.moveTo(cx + rr, y0 - h);
        ctx.arc(cx, y0 - h, rr, 0, TAU);
        ctx.moveTo(cx + rr * 0.8 - 14, y0 - h + rr * 0.5);
        ctx.arc(cx - 14, y0 - h + rr * 0.5, rr * 0.8, 0, TAU);
      }
    });
    ctx.rect(-10, y0, SW + 20, SH - y0 + 10);
    ctx.fill();
  };
  FAR.pines = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp * 1.5 > SH) return;
    const span = 800;
    const items = tileItems(o, span, (r) => {
      const a = [];
      for (let x = 0; x < span; x += 36 + r() * 50) a.push([x, o.amp * (0.6 + r() * 0.7), 22 + r() * 16]);
      return a;
    });
    ctx.fillStyle = o.color;
    ctx.beginPath();
    tiled(SW, cam.x * o.f, span, (bx) => {
      for (const [x, h, w] of items) {
        const cx = bx + x;
        if (cx < -60 || cx > SW + 60) continue;
        ctx.moveTo(cx, y0 - h);
        ctx.lineTo(cx + w, y0);
        ctx.lineTo(cx - w, y0);
        ctx.closePath();
      }
    });
    ctx.rect(-10, y0 - 2, SW + 20, SH - y0 + 12);
    ctx.fill();
  };
  FAR.skyline = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp * 1.2 > SH) return;
    const span = 1400;
    const items = tileItems(o, span, (r) => {
      const a = [];
      for (let x = 0; x < span; ) {
        const w = 60 + r() * 90;
        const h = o.amp * (0.35 + r() * 0.75);
        const wins = [];
        if (o.lit) {
          for (let wy = 16; wy < h - 20; wy += 26) for (let wx = 10; wx < w - 14; wx += 20) if (r() < o.lit) wins.push([wx, wy]);
        }
        a.push([x, w, h, wins, r() < 0.25]);
        x += w + 4 + r() * 16;
      }
      return a;
    });
    tiled(SW, cam.x * o.f, span, (bx) => {
      ctx.fillStyle = o.color;
      ctx.beginPath();
      for (const [x, w, h, , ant] of items) {
        const X = bx + x;
        if (X > SW + 20 || X + w < -20) continue;
        ctx.rect(X, y0 - h, w, h + 4);
        if (ant) ctx.rect(X + w / 2 - 2, y0 - h - 26, 4, 26);
      }
      ctx.fill();
      if (o.lit) {
        ctx.fillStyle = o.win || '#FFE08A';
        for (const [x, w, h, wins] of items) {
          const X = bx + x;
          if (X > SW + 20 || X + w < -20) continue;
          for (const [wx, wy] of wins) ctx.fillRect(X + wx, y0 - h + wy, 8, 11);
        }
      }
    });
    ctx.fillStyle = o.color;
    ctx.fillRect(-10, y0, SW + 20, SH - y0 + 10);
  };
  FAR.grassFar = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp > SH) return;
    const span = 700;
    const items = tileItems(o, span, (r) => {
      const a = [];
      for (let x = 0; x < span; x += 14 + r() * 26) a.push([x, o.amp * (0.4 + r() * 0.7), (r() - 0.5) * 60, 8 + r() * 8]);
      return a;
    });
    ctx.fillStyle = o.color;
    ctx.beginPath();
    tiled(SW, cam.x * o.f, span, (bx) => {
      for (const [x, h, lean, w] of items) {
        const X = bx + x;
        if (X < -60 || X > SW + 60) continue;
        const sw = Math.sin(t * 1.2 + x) * 6;
        ctx.moveTo(X - w, y0);
        ctx.quadraticCurveTo(X + lean * 0.3, y0 - h * 0.6, X + lean + sw, y0 - h);
        ctx.quadraticCurveTo(X + lean * 0.3 + w * 0.6, y0 - h * 0.5, X + w, y0);
        ctx.closePath();
      }
    });
    ctx.rect(-10, y0 - 1, SW + 20, SH - y0 + 11);
    ctx.fill();
  };
  FAR.mushroomsFar = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp * 1.4 > SH) return;
    const span = 900;
    const items = tileItems(o, span, (r) => {
      const a = [];
      for (let x = 0; x < span; x += 90 + r() * 140) a.push([x, o.amp * (0.6 + r() * 0.8), 34 + r() * 40]);
      return a;
    });
    ctx.fillStyle = o.color;
    ctx.beginPath();
    tiled(SW, cam.x * o.f, span, (bx) => {
      for (const [x, h, w] of items) {
        const X = bx + x;
        if (X < -100 || X > SW + 100) continue;
        ctx.rect(X - w * 0.14, y0 - h, w * 0.28, h + 2);
        ctx.moveTo(X - w, y0 - h + 6);
        ctx.quadraticCurveTo(X, y0 - h - w * 0.9, X + w, y0 - h + 6);
        ctx.closePath();
      }
    });
    ctx.rect(-10, y0, SW + 20, SH - y0 + 10);
    ctx.fill();
  };
  FAR.pixelHills = function (ctx, cam, SW, SH, up, t, o) {
    const y0 = SH - o.base + up * o.f;
    if (y0 - o.amp > SH) return;
    ctx.fillStyle = o.color;
    const off = cam.x * o.f, seed = o.seed || 5;
    const s = 24;
    ctx.beginPath();
    for (let x = -((off % s) + s); x <= SW + s; x += s) {
      const wx = Math.floor((x + off) / s) * s;
      const h = Math.round((o.amp * (0.5 + 0.5 * Math.sin(wx * 0.005 + seed))) / s) * s;
      ctx.rect(x, y0 - h, s + 1, h + SH);
    }
    ctx.fill();
  };
  FAR.icons = function (ctx, cam, SW, SH, up, t, o) {
    const items = tileItems(o, 1, (r) => {
      const a = [];
      for (let k = 0; k < 14; k++) a.push([r(), r(), r() < 0.33 ? 'heart' : r() < 0.5 ? 'star' : 'note', 10 + r() * 14, 0.5 + r()]);
      return a;
    });
    ctx.fillStyle = o.color;
    for (const [fx, fy, kind, sz, v] of items) {
      const x = ((fx * (SW + 200) - cam.x * o.f) % (SW + 200) + SW + 200) % (SW + 200) - 100;
      const y = ((fy * SH - t * 12 * v + up * o.f) % SH + SH) % SH;
      if (kind === 'heart') G.heartPath(ctx, x, y, sz);
      else if (kind === 'star') G.starPath(ctx, x, y, sz, sz * 0.45);
      else {
        ctx.beginPath();
        ctx.ellipse(x, y, sz * 0.5, sz * 0.38, -0.4, 0, TAU);
        ctx.rect(x + sz * 0.35, y - sz * 1.4, sz * 0.18, sz * 1.4);
      }
      ctx.fill();
    }
  };
  FAR.ferris = function (ctx, cam, SW, SH, up, t, o) {
    const cx = SW * 0.62 - ((cam.x * o.f) % (SW * 2)) + SW * 0.4, cy = SH - o.base - 150 + up * o.f;
    if (cy - 200 > SH) return;
    const R = 150;
    ctx.strokeStyle = o.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.moveTo(cx + R * 0.35, cy);
    ctx.arc(cx, cy, R * 0.35, 0, TAU);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU + t * 0.15;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    }
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 70, cy + R + 60);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 70, cy + R + 60);
    ctx.stroke();
    ctx.fillStyle = o.color;
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU + t * 0.15;
      G.rr(ctx, cx + Math.cos(a) * R - 14, cy + Math.sin(a) * R, 28, 22, 7);
      ctx.fill();
    }
  };

  // Небо целиком
  function paintSkyFor(L, th) {
    const clouds = [];
    if (th.clouds) {
      const r = U.rng(L.seed + 11);
      for (let k = 0; k < th.clouds.n; k++) clouds.push({ x: r() * 1800, y: 40 + r() * 200, w: 150 + r() * 130, h: 56 + r() * 26, v: 4 + r() * 8 });
    }
    return function (ctx, cam, SW, SH, t) {
      if (th.indoor && !th.sky) {
        ctx.fillStyle = th.wall.base;
        ctx.fillRect(0, 0, SW, SH);
        if (th.wall.sky) G.sky(ctx, SW, SH, th.wall.sky);
        return;
      }
      G.sky(ctx, SW, SH, th.sky);
      const up = camUp(L, cam, SH);
      if (th.stars) G.nightStars(ctx, SW, SH, t, (L.seed % 97) + 3, th.stars, cam.x * 0.05, -up * 0.05);
      if (th.planet) {
        const px = SW * 0.2, py = 150 + up * 0.03;
        G.circle(ctx, px, py, 46);
        ctx.fillStyle = '#FF9EC8';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px, py, 80, 16, -0.3, 0, TAU);
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255,220,150,0.8)';
        ctx.stroke();
        G.circle(ctx, SW * 0.72, 90 + up * 0.03, 16);
        ctx.fillStyle = '#8FE0FF';
        ctx.fill();
      }
      if (th.sun) {
        const s = th.sun, sx = SW * s.x, sy = s.y + up * 0.05;
        G.glow(ctx, sx, sy, s.r * 3.2, s.glow || '#FFF3A0', 0.8);
        G.circle(ctx, sx, sy, s.r);
        ctx.fillStyle = s.color;
        ctx.fill();
      }
      if (th.pixelSun) {
        const sx = SW * 0.82, sy = 100 + up * 0.05;
        ctx.fillStyle = '#FFE45C';
        for (let dy = -3; dy <= 3; dy++) {
          const w = 7 - Math.abs(dy);
          ctx.fillRect(sx - w * 10, sy + dy * 10, w * 20, 10);
        }
      }
      if (th.moon) {
        const m = th.moon, mx = SW * m.x, my = m.y + up * 0.04;
        G.glow(ctx, mx, my, m.r * 3, '#FFF4C2', 0.45);
        G.circle(ctx, mx, my, m.r);
        ctx.fillStyle = '#FFF4C2';
        ctx.fill();
        ctx.fillStyle = 'rgba(230,210,150,0.6)';
        for (const [dx, dy, rr] of [[-0.3, -0.2, 0.2], [0.25, 0.15, 0.15], [-0.1, 0.4, 0.12]]) {
          G.circle(ctx, mx + dx * m.r, my + dy * m.r, rr * m.r);
          ctx.fill();
        }
      }
      for (const c of clouds) {
        const span = SW + c.w + 200;
        let x = (c.x - cam.x * 0.15 + t * c.v) % span;
        if (x < 0) x += span;
        x -= c.w + 100;
        const y = c.y + up * 0.15;
        if (y > SH + 50) continue;
        G.cloud(ctx, x, y, c.w, c.h, th.clouds.color || 'rgba(255,255,255,0.95)', th.clouds.shadow);
      }
      if (th.far) for (const o of th.far) FAR[o.kind] && FAR[o.kind](ctx, cam, SW, SH, up, t, o, L);
    };
  }

  // =========================================================
  // Стены помещений (координаты мира)
  // =========================================================
  const WALL = (Sc.WALL = {});
  function clampV(v, L) {
    return { x0: Math.max(0, v.x0), x1: Math.min(L.w, v.x1), y0: Math.max(0, v.y0), y1: Math.min(L.h, v.y1) };
  }
  WALL.planks = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = o.base;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    ctx.fillStyle = o.light;
    for (let x = Math.floor(c.x0 / 70) * 70; x < c.x1; x += 140) ctx.fillRect(x, c.y0, 70, c.y1 - c.y0);
    ctx.beginPath();
    for (let x = Math.floor(c.x0 / 70) * 70; x < c.x1; x += 70) {
      ctx.moveTo(x, c.y0);
      ctx.lineTo(x, c.y1);
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = o.line;
    ctx.stroke();
  };
  WALL.stones = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = o.line;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    ctx.fillStyle = o.base;
    ctx.beginPath();
    const bw = 96, bh = 54;
    for (let y = Math.floor(c.y0 / bh) * bh, row = Math.floor(c.y0 / bh); y < c.y1; y += bh, row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let x = Math.floor((c.x0 - off) / bw) * bw + off; x < c.x1; x += bw) {
        ctx.moveTo(x + 8, y + 3);
        ctx.roundRect ? ctx.roundRect(x + 3, y + 3, bw - 6, bh - 6, 8) : ctx.rect(x + 3, y + 3, bw - 6, bh - 6);
      }
    }
    ctx.fill();
    ctx.fillStyle = o.light;
    for (let y = Math.floor(c.y0 / bh) * bh, row = Math.floor(c.y0 / bh); y < c.y1; y += bh, row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let x = Math.floor((c.x0 - off) / bw) * bw + off; x < c.x1; x += bw) if ((x * 7 + y) % 5 === 0) ctx.fillRect(x + 10, y + 8, bw - 30, 6);
    }
  };
  WALL.panels = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = o.line;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    const pw = 180, ph = 130;
    for (let y = Math.floor(c.y0 / ph) * ph; y < c.y1; y += ph) {
      for (let x = Math.floor(c.x0 / pw) * pw; x < c.x1; x += pw) {
        ctx.fillStyle = ((x / pw + y / ph) % 2 === 0) ? o.base : o.light;
        ctx.fillRect(x + 4, y + 4, pw - 8, ph - 8);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    for (let y = Math.floor(c.y0 / ph) * ph; y < c.y1; y += ph) {
      for (let x = Math.floor(c.x0 / pw) * pw; x < c.x1; x += pw) {
        for (const [dx, dy] of [[12, 12], [pw - 12, 12], [12, ph - 12], [pw - 12, ph - 12]]) {
          ctx.moveTo(x + dx + 3, y + dy);
          ctx.arc(x + dx, y + dy, 3, 0, TAU);
        }
      }
    }
    ctx.fill();
  };
  WALL.corrugated = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = o.base;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    ctx.fillStyle = o.light;
    for (let x = Math.floor(c.x0 / 24) * 24; x < c.x1; x += 24) ctx.fillRect(x, c.y0, 10, c.y1 - c.y0);
    ctx.fillStyle = o.line;
    for (let y = Math.floor(c.y0 / 420) * 420; y < c.y1; y += 420) ctx.fillRect(c.x0, y, c.x1 - c.x0, 8);
  };
  WALL.glass = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = 'rgba(207,242,224,0.35)';
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    // лучи солнца
    ctx.fillStyle = 'rgba(255,255,220,0.18)';
    for (let x = Math.floor(c.x0 / 600) * 600; x < c.x1 + 300; x += 600) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 160, 0);
      ctx.lineTo(x - 240, L.gy);
      ctx.lineTo(x - 420, L.gy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    for (let x = Math.floor(c.x0 / 150) * 150; x < c.x1; x += 150) {
      ctx.moveTo(x, c.y0);
      ctx.lineTo(x, c.y1);
    }
    for (let y = Math.floor(c.y0 / 180) * 180; y < c.y1; y += 180) {
      ctx.moveTo(c.x0, y);
      ctx.lineTo(c.x1, y);
    }
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#F4FFF8';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(120,170,150,0.6)';
    ctx.stroke();
  };
  WALL.wallpaper = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = o.base;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    // вертикальные полоски и цветочки
    ctx.fillStyle = o.light;
    for (let x = Math.floor(c.x0 / 90) * 90; x < c.x1; x += 90) ctx.fillRect(x, c.y0, 30, c.y1 - c.y0);
    ctx.fillStyle = o.line;
    ctx.beginPath();
    for (let y = Math.floor(c.y0 / 90) * 90 - 90; y < c.y1; y += 90) {
      for (let x = Math.floor(c.x0 / 90) * 90; x < c.x1; x += 90) {
        const cx = x + 60, cy = y + (Math.abs(x / 90) % 2 ? 45 : 0) + 20;
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * TAU;
          const px = cx + Math.cos(a) * 6, py = cy + Math.sin(a) * 6;
          ctx.moveTo(px + 4, py);
          ctx.arc(px, py, 4, 0, TAU);
        }
      }
    }
    ctx.fill();
    // панель внизу стены
    if (o.wainscot && c.y1 > L.gy - 150) {
      ctx.fillStyle = o.wainscot;
      ctx.fillRect(c.x0, L.gy - 150, c.x1 - c.x0, 150);
      ctx.fillStyle = 'rgba(120,70,30,0.25)';
      for (let x = Math.floor(c.x0 / 110) * 110; x < c.x1; x += 110) ctx.fillRect(x + 10, L.gy - 132, 90, 110);
      ctx.fillStyle = U.shade(o.wainscot, -0.25);
      ctx.fillRect(c.x0, L.gy - 156, c.x1 - c.x0, 10);
    }
  };
  WALL.tiles = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = o.base;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    const s = 56;
    ctx.fillStyle = o.light;
    for (let y = Math.floor(c.y0 / s) * s; y < c.y1; y += s) {
      for (let x = Math.floor(c.x0 / s) * s; x < c.x1; x += s) if (((x + y) / s) % 2 === 0) ctx.fillRect(x, y, s, s);
    }
    ctx.beginPath();
    for (let x = Math.floor(c.x0 / s) * s; x < c.x1; x += s) {
      ctx.moveTo(x, c.y0);
      ctx.lineTo(x, c.y1);
    }
    for (let y = Math.floor(c.y0 / s) * s; y < c.y1; y += s) {
      ctx.moveTo(c.x0, y);
      ctx.lineTo(c.x1, y);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = o.line;
    ctx.stroke();
  };
  WALL.sprinkles = function (ctx, L, v, o) {
    const c = clampV(v, L);
    ctx.fillStyle = o.base;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    const cols = ['#FF8FB8', '#8FD3FF', '#FFD23F', '#9BE08A', '#C49BFF'];
    const s = 70;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let ci = 0; ci < cols.length; ci++) {
      ctx.beginPath();
      for (let y = Math.floor(c.y0 / s) * s; y < c.y1; y += s) {
        for (let x = Math.floor(c.x0 / s) * s; x < c.x1; x += s) {
          const k = Math.abs((x * 7 + y * 13) / s) | 0;
          if (k % cols.length !== ci) continue;
          const px = x + 20 + (k % 30), py = y + 20 + ((k * 3) % 30);
          const d = k % 2 ? 5 : -5;
          ctx.moveTo(px - 5, py - d);
          ctx.lineTo(px + 5, py + d);
        }
      }
      ctx.strokeStyle = cols[ci];
      ctx.stroke();
    }
  };
  WALL.grid = function (ctx, L, v, o, t) {
    const c = clampV(v, L);
    ctx.fillStyle = o.base;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    ctx.beginPath();
    for (let x = Math.floor(c.x0 / 60) * 60; x < c.x1; x += 60) {
      ctx.moveTo(x, c.y0);
      ctx.lineTo(x, c.y1);
    }
    for (let y = Math.floor(c.y0 / 60) * 60; y < c.y1; y += 60) {
      ctx.moveTo(c.x0, y);
      ctx.lineTo(c.x1, y);
    }
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = o.line;
    ctx.stroke();
    ctx.fillStyle = o.light;
    for (let y = Math.floor(c.y0 / 120) * 120; y < c.y1; y += 120) {
      for (let x = Math.floor(c.x0 / 120) * 120; x < c.x1; x += 120) {
        const a = 0.3 + 0.3 * Math.sin((t || 0) * 2 + x * 0.1 + y);
        ctx.globalAlpha = a;
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }
    ctx.globalAlpha = 1;
  };

  // =========================================================
  // Стволы и опоры «ёлочек»
  // =========================================================
  const COL = (Sc.COL = {});
  function trunkPath(ctx, x, top, bottom, w) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2, top);
    ctx.lineTo(x + w / 2, top);
    ctx.quadraticCurveTo(x + w * 0.55, (top + bottom) / 2, x + w * 0.7, bottom);
    ctx.lineTo(x - w * 0.7, bottom);
    ctx.quadraticCurveTo(x - w * 0.55, (top + bottom) / 2, x - w / 2, top);
    ctx.closePath();
  }
  COL.trunk = function (ctx, c) {
    trunkPath(ctx, c.x, c.top, c.bottom + 4, 54);
    fs(ctx, '#8B5A2B', '#5A3515', 3);
    ctx.beginPath();
    for (let y = c.top + 30; y < c.bottom - 20; y += 60) {
      ctx.moveTo(c.x - 10, y);
      ctx.quadraticCurveTo(c.x - 4, y + 20, c.x - 12, y + 40);
      ctx.moveTo(c.x + 12, y + 20);
      ctx.quadraticCurveTo(c.x + 6, y + 40, c.x + 14, y + 55);
    }
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(60,30,10,0.4)';
    ctx.stroke();
    if (!c.summit) {
      // крона наверху
      for (const [dx, dy, r] of [[-60, -10, 60], [60, -14, 56], [0, -50, 70]]) {
        G.circle(ctx, c.x + dx, c.top + dy, r);
        fs(ctx, '#4CAE48', '#2F8A38', 3);
      }
    }
  };
  COL.darkTrunk = function (ctx, c) {
    trunkPath(ctx, c.x, c.top, c.bottom + 4, 54);
    fs(ctx, '#3A2F55', '#221A38', 3);
    if (!c.summit) {
      for (const [dx, dy, r] of [[-60, -10, 60], [60, -14, 56], [0, -50, 70]]) {
        G.circle(ctx, c.x + dx, c.top + dy, r);
        fs(ctx, '#23305E', '#161E40', 3);
      }
    }
  };
  COL.birch = function (ctx, c) {
    G.rr(ctx, c.x - 24, c.top - 200, 48, c.bottom - c.top + 204, 14);
    fs(ctx, '#F7F7F2', '#9A9A90', 2.5);
    ctx.fillStyle = '#2E2E2E';
    for (let y = c.top - 180; y < c.bottom - 10; y += 46) {
      const k = ((y * 13) % 7) / 7;
      ctx.fillRect(c.x - 24 + k * 20, y, 14 + k * 10, 5);
    }
  };
  COL.stalk = function (ctx, c) {
    G.rr(ctx, c.x - 14, c.top, 28, c.bottom - c.top + 4, 12);
    fs(ctx, '#4CA83A', '#2F7A2C', 3);
    ctx.fillStyle = '#7CD35A';
    ctx.fillRect(c.x - 6, c.top + 10, 5, c.bottom - c.top - 20);
    if (!c.summit) {
      // бутон-цветок на вершине
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        G.ellipse(ctx, c.x + Math.cos(a) * 30, c.top - 36 + Math.sin(a) * 30, 22, 14, a);
        fs(ctx, '#FF8FC0', '#C2185B', 2);
      }
      G.circle(ctx, c.x, c.top - 36, 16);
      fs(ctx, '#FFD23F', '#D98B00', 2);
    }
  };
  COL.grassStem = function (ctx, c) {
    ctx.beginPath();
    ctx.moveTo(c.x - 16, c.bottom + 4);
    ctx.quadraticCurveTo(c.x - 10, (c.top + c.bottom) / 2, c.x - 4, c.top - 90);
    ctx.lineTo(c.x + 4, c.top - 90);
    ctx.quadraticCurveTo(c.x + 10, (c.top + c.bottom) / 2, c.x + 16, c.bottom + 4);
    ctx.closePath();
    fs(ctx, '#5DBB46', '#2F7A2C', 2.5);
  };
  COL.mushStem = function (ctx, c) {
    G.rr(ctx, c.x - 20, c.top, 40, c.bottom - c.top + 4, 16);
    fs(ctx, '#FFF1D6', '#B89A6A', 2.5);
    if (!c.summit) {
      ctx.beginPath();
      ctx.moveTo(c.x - 110, c.top + 10);
      ctx.quadraticCurveTo(c.x, c.top - 110, c.x + 110, c.top + 10);
      ctx.closePath();
      fs(ctx, '#F0433A', '#9C1F18', 3);
      ctx.fillStyle = '#fff';
      for (const [dx, dy] of [[-50, -10], [0, -40], [48, -12], [-20, -24], [24, -30]]) {
        G.ellipse(ctx, c.x + dx, c.top + dy, 9, 6);
        ctx.fill();
      }
    }
  };
  COL.pole = function (ctx, c) {
    G.rr(ctx, c.x - 9, c.top, 18, c.bottom - c.top + 4, 6);
    fs(ctx, '#6E7A92', '#3A4256', 2.5);
    if (!c.summit) {
      G.rr(ctx, c.x - 60, c.top - 30, 120, 30, 8);
      fs(ctx, '#FFD54F', '#B8860B', 2.5);
    }
  };
  COL.antenna = function (ctx, c, t) {
    ctx.beginPath();
    ctx.moveTo(c.x, c.bottom);
    ctx.lineTo(c.x, c.top - 160);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#8E9AB2';
    ctx.stroke();
    const on = Math.sin(t * 4) > 0;
    G.glow(ctx, c.x, c.top - 164, 30, '#FF4A4A', on ? 0.7 : 0.2);
    G.circle(ctx, c.x, c.top - 164, 7);
    ctx.fillStyle = on ? '#FF4A4A' : '#8A2A2A';
    ctx.fill();
  };
  COL.pipe = function (ctx, c) {
    G.rr(ctx, c.x - 16, c.top - 40, 32, c.bottom - c.top + 44, 8);
    fs(ctx, '#9AA9BF', '#4A5A78', 3);
    for (let y = c.top; y < c.bottom; y += 140) {
      G.rr(ctx, c.x - 22, y, 44, 14, 4);
      fs(ctx, '#B7C1D6', '#4A5A78', 2);
    }
  };
  COL.lattice = function (ctx, c) {
    ctx.fillStyle = '#E0533F';
    ctx.fillRect(c.x - 22, c.top, 5, c.bottom - c.top);
    ctx.fillRect(c.x + 17, c.top, 5, c.bottom - c.top);
    ctx.beginPath();
    for (let y = c.top; y < c.bottom - 10; y += 40) {
      ctx.moveTo(c.x - 20, y);
      ctx.lineTo(c.x + 20, y + 40);
      ctx.moveTo(c.x + 20, y);
      ctx.lineTo(c.x - 20, y + 40);
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F2F2F2';
    ctx.stroke();
  };
  COL.cable = function (ctx, c) {
    const cols = ['#FF6FA8', '#4FD1FF', '#7CFFB0'];
    cols.forEach((col, i) => {
      ctx.beginPath();
      ctx.moveTo(c.x - 12 + i * 12, c.top - 60);
      ctx.quadraticCurveTo(c.x - 20 + i * 18, (c.top + c.bottom) / 2, c.x - 12 + i * 12, c.bottom);
      ctx.lineWidth = 8;
      ctx.strokeStyle = col;
      ctx.stroke();
    });
  };
  COL.candle = function (ctx, c, t) {
    G.rr(ctx, c.x - 14, c.top - 60, 28, c.bottom - c.top + 64, 6);
    fs(ctx, '#FFF6FA', '#E0A0B8', 2);
    ctx.save();
    G.rr(ctx, c.x - 14, c.top - 60, 28, c.bottom - c.top + 64, 6);
    ctx.clip();
    ctx.beginPath();
    for (let y = c.top - 60; y < c.bottom; y += 30) {
      ctx.moveTo(c.x - 14, y);
      ctx.lineTo(c.x + 14, y - 14);
      ctx.lineTo(c.x + 14, y - 4);
      ctx.lineTo(c.x - 14, y + 10);
      ctx.closePath();
    }
    ctx.fillStyle = '#FF8FB8';
    ctx.fill();
    ctx.restore();
    const fl = Math.sin(t * 12) * 2;
    G.glow(ctx, c.x, c.top - 80, 40, '#FFD23F', 0.6);
    G.ellipse(ctx, c.x + fl * 0.3, c.top - 78, 8, 14 + fl);
    ctx.fillStyle = '#FFB300';
    ctx.fill();
  };
  COL.rollingPin = function (ctx, c) {
    G.rr(ctx, c.x - 12, c.top, 24, c.bottom - c.top + 4, 10);
    fs(ctx, '#E8C08A', '#8A5A2B', 2.5);
  };
  COL.ladle = COL.pipe;
  COL.bookColumn = function (ctx, c) {
    ST_bookColumn(ctx, c);
  };
  function ST_bookColumn(ctx, c) {
    const cols = ['#E0533F', '#3F8FE0', '#2FBF55', '#B983FF', '#FFB347'];
    let i = 0;
    for (let y = c.bottom - 22; y > c.top; y -= 22, i++) {
      G.rr(ctx, c.x - 34 + (i % 3) * 3, y, 68 - (i % 3) * 6, 20, 3);
      fs(ctx, cols[i % 5], U.shade(cols[i % 5], -0.45), 2);
    }
  }
  COL.stoneColumn = function (ctx, c) {
    G.rr(ctx, c.x - 30, c.top, 60, c.bottom - c.top + 4, 6);
    fs(ctx, '#9C92C6', '#5E547A', 3);
    ctx.beginPath();
    for (let y = c.top + 40; y < c.bottom; y += 40) {
      ctx.moveTo(c.x - 28, y);
      ctx.lineTo(c.x + 28, y);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(70,60,110,0.45)';
    ctx.stroke();
  };
  COL.pixelCol = function (ctx, c) {
    for (let y = c.bottom - 40; y > c.top - 20; y -= 40) {
      ctx.fillStyle = '#9A6A3A';
      ctx.fillRect(c.x - 20, y, 40, 40);
      ctx.fillStyle = '#7A4E28';
      ctx.fillRect(c.x + 14, y, 6, 40);
    }
    if (!c.summit) {
      ctx.fillStyle = '#5FBF4A';
      ctx.fillRect(c.x - 80, c.top - 100, 160, 80);
      ctx.fillStyle = '#8FE06A';
      ctx.fillRect(c.x - 80, c.top - 100, 160, 16);
    }
  };

  // =========================================================
  // Фоны высоких сцен
  // =========================================================
  const TALL = (Sc.TALL = {});
  // Фасад небоскрёба с окнами
  TALL.facade = function (ctx, L, v, t) {
    const x0 = 40, x1 = L.w - 40, top = L.floorYs[L.floorYs.length - 1] - 30;
    if (!L._facade) {
      const r = U.rng(L.seed + 5);
      const wins = [];
      for (let y = top + 50; y < L.gy - 60; y += 110) for (let x = x0 + 50; x < x1 - 60; x += 110) wins.push([x, y, r() < 0.28, r()]);
      L._facade = wins;
    }
    ctx.fillStyle = '#34406E';
    ctx.fillRect(x0, Math.max(top, v.y0), x1 - x0, Math.min(L.gy, v.y1) - Math.max(top, v.y0));
    ctx.fillStyle = '#2A3560';
    for (let x = x0; x < x1; x += 320) ctx.fillRect(x, Math.max(top, v.y0), 14, Math.min(L.gy, v.y1) - Math.max(top, v.y0));
    for (const [x, y, lit, k] of L._facade) {
      if (y > v.y1 || y + 52 < v.y0 || x > v.x1 || x + 38 < v.x0) continue;
      ctx.fillStyle = lit ? (k < 0.2 ? 'rgba(143,232,255,0.55)' : 'rgba(255,224,138,0.6)') : '#2A3462';
      ctx.fillRect(x, y, 38, 52);
      if (lit && k > 0.75) {
        ctx.fillStyle = 'rgba(255,140,170,0.45)';
        ctx.fillRect(x, y, 10, 52);
        ctx.fillRect(x + 28, y, 10, 52);
      }
    }
    // карниз на крыше
    ctx.fillStyle = '#4A5890';
    ctx.fillRect(x0 - 10, top - 12, x1 - x0 + 20, 16);
  };
  // Башня обслуживания и ракета
  TALL.rocketTower = function (ctx, L, v, t) {
    const top = L.floorYs[L.floorYs.length - 1];
    // решётчатая башня за этажами
    const tx0 = L.w * 0.12, tx1 = L.w * 0.88;
    ctx.fillStyle = 'rgba(224,83,63,0.9)';
    ctx.fillRect(tx0, Math.max(top - 200, v.y0), 12, L.gy - Math.max(top - 200, v.y0));
    ctx.fillRect(tx1 - 12, Math.max(top - 200, v.y0), 12, L.gy - Math.max(top - 200, v.y0));
    ctx.beginPath();
    for (let y = Math.max(top - 200, Math.floor(v.y0 / 80) * 80); y < Math.min(L.gy, v.y1); y += 80) {
      ctx.moveTo(tx0 + 6, y);
      ctx.lineTo(tx1 - 6, y + 80);
      ctx.moveTo(tx1 - 6, y);
      ctx.lineTo(tx0 + 6, y + 80);
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(240,240,255,0.25)';
    ctx.stroke();
    // ракета — посередине, от земли почти до верха
    const cx = L.w / 2, rw = 170;
    const rTop = top - 160, rBot = L.gy - 10;
    if (rBot > v.y0 && rTop < v.y1) {
      ctx.beginPath();
      ctx.moveTo(cx - rw / 2, rBot - 60);
      ctx.lineTo(cx - rw / 2, rTop + 260);
      ctx.quadraticCurveTo(cx - rw / 2, rTop + 40, cx, rTop);
      ctx.quadraticCurveTo(cx + rw / 2, rTop + 40, cx + rw / 2, rTop + 260);
      ctx.lineTo(cx + rw / 2, rBot - 60);
      ctx.closePath();
      fs(ctx, '#F4F6FF', '#8E9AB2', 4);
      ctx.fillStyle = '#E0533F';
      ctx.beginPath();
      ctx.moveTo(cx - rw / 2, rTop + 150);
      ctx.quadraticCurveTo(cx - rw / 2 + 10, rTop + 50, cx, rTop);
      ctx.quadraticCurveTo(cx + rw / 2 - 10, rTop + 50, cx + rw / 2, rTop + 150);
      ctx.closePath();
      ctx.fill();
      for (let y = rTop + 260; y < rBot - 160; y += 300) {
        G.circle(ctx, cx, y, 34);
        fs(ctx, '#8FE0FF', '#3A6EA8', 6);
        G.circle(ctx, cx - 10, y - 10, 9);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fill();
      }
      // крылья
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + (s * rw) / 2, rBot - 260);
        ctx.lineTo(cx + s * (rw / 2 + 90), rBot - 60);
        ctx.lineTo(cx + (s * rw) / 2, rBot - 60);
        ctx.closePath();
        fs(ctx, '#E0533F', '#8E2A2A', 4);
      }
      G.rr(ctx, cx - rw / 2 + 20, rBot - 60, rw - 40, 50, 8);
      fs(ctx, '#8E9AB2', '#4A546A', 3);
    }
  };
  // Огромные стебли цветов
  TALL.giantStalks = function (ctx, L, v, t) {
    const top = L.floorYs[L.floorYs.length - 1];
    const xs = [L.w * 0.18, L.w * 0.5, L.w * 0.82];
    xs.forEach((x, i) => {
      const sx = x + Math.sin(i * 2) * 30;
      G.rr(ctx, sx - 30, top - 120, 60, L.gy - top + 124, 26);
      fs(ctx, '#62B84A', '#3E8E36', 3);
      ctx.fillStyle = '#86D366';
      ctx.fillRect(sx - 12, top - 100, 8, L.gy - top + 90);
      for (let y = top + 80; y < L.gy - 100; y += 260) {
        const d = (y / 260) % 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(sx, y);
        ctx.quadraticCurveTo(sx + d * 150, y - 90, sx + d * 230, y - 30);
        ctx.quadraticCurveTo(sx + d * 140, y + 20, sx, y + 20);
        ctx.closePath();
        fs(ctx, '#7CD35A', '#3E8E36', 3);
      }
      // цветок
      const fy = top - 170;
      const fc = ['#FF8FC0', '#FFD23F', '#B983FF'][i];
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU + t * 0.1;
        G.ellipse(ctx, sx + Math.cos(a) * 70, fy + Math.sin(a) * 70, 52, 30, a);
        fs(ctx, fc, U.shade(fc, -0.35), 3);
      }
      G.circle(ctx, sx, fy, 46);
      fs(ctx, '#FFB300', '#B87800', 3);
    });
  };
  // Светящееся дерево
  TALL.glowTree = function (ctx, L, v, t) {
    const top = L.floorYs[L.floorYs.length - 1];
    const cx = L.w / 2;
    trunkPath(ctx, cx, top - 100, L.gy + 4, 260);
    fs(ctx, '#3A2F55', '#221A38', 4);
    ctx.beginPath();
    for (let y = top; y < L.gy; y += 110) {
      ctx.moveTo(cx - 60, y);
      ctx.quadraticCurveTo(cx - 40, y + 50, cx - 70, y + 90);
      ctx.moveTo(cx + 50, y + 40);
      ctx.quadraticCurveTo(cx + 30, y + 80, cx + 60, y + 110);
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(20,15,40,0.5)';
    ctx.stroke();
    // светящиеся дупла и грибочки на стволе
    for (let y = top + 120; y < L.gy - 80; y += 300) {
      G.glow(ctx, cx, y, 70, '#FFE680', 0.5 + 0.2 * Math.sin(t * 2 + y));
      G.ellipse(ctx, cx, y, 28, 38);
      ctx.fillStyle = '#FFE9A8';
      ctx.fill();
    }
    // крона
    for (const [dx, dy, r] of [[-200, -80, 150], [200, -90, 140], [0, -200, 190], [-90, -250, 120], [110, -240, 120]]) {
      G.circle(ctx, cx + dx, top + dy, r);
      fs(ctx, '#24306A', '#161E40', 4);
    }
    for (let k = 0; k < 16; k++) {
      const a = k * 2.4, d = 60 + ((k * 37) % 150);
      const x = cx + Math.cos(a) * d * 1.3, y = top - 150 + Math.sin(a) * d * 0.6;
      G.glow(ctx, x, y, 16, '#EFFF8A', 0.4 + 0.3 * Math.sin(t * 3 + k));
    }
  };
  // Слои огромного торта
  TALL.cakeTiers = function (ctx, L, v, t) {
    const fl = L.floorYs;
    const cols = ['#F5D4A8', '#FFB8D0', '#C9A0FF', '#A8E0FF', '#FFE08A', '#B8F0B0', '#F5D4A8'];
    for (let k = 0; k < fl.length - 1; k++) {
      const yb = fl[k], yt = fl[k + 1];
      if (yb < v.y0 || yt > v.y1) continue;
      const inset = 60 + k * 30;
      const x0 = inset, x1 = L.w - inset;
      ctx.fillStyle = cols[k % cols.length];
      ctx.fillRect(x0, yt + 20, x1 - x0, yb - yt - 20);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(x0, yt + (yb - yt) * 0.5, x1 - x0, 14);
      ctx.fillStyle = 'rgba(224,83,63,0.5)';
      ctx.fillRect(x0, yt + (yb - yt) * 0.5 + 14, x1 - x0, 8);
      // горошки
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let x = x0 + 40; x < x1 - 20; x += 90) {
        G.circle(ctx, x, yt + (yb - yt) * 0.3, 8);
        ctx.fill();
      }
    }
    // свечка на самом верху
    const top = fl[fl.length - 1];
    COL.candle(ctx, { x: L.w / 2 + 220, top: top - 120, bottom: top }, t);
  };
  // Огромный дуб
  TALL.oakTrunk = function (ctx, L, v, t) {
    const top = L.floorYs[L.floorYs.length - 1];
    const cx = L.w / 2;
    trunkPath(ctx, cx, top - 60, L.gy + 6, 300);
    fs(ctx, '#8B5A2B', '#5A3515', 4);
    ctx.beginPath();
    for (let y = Math.max(top, Math.floor(v.y0 / 90) * 90); y < Math.min(L.gy, v.y1); y += 90) {
      ctx.moveTo(cx - 90, y);
      ctx.quadraticCurveTo(cx - 70, y + 45, cx - 96, y + 80);
      ctx.moveTo(cx + 20, y + 30);
      ctx.quadraticCurveTo(cx + 40, y + 70, cx + 16, y + 100);
      ctx.moveTo(cx + 100, y + 10);
      ctx.quadraticCurveTo(cx + 84, y + 50, cx + 106, y + 84);
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(60,30,10,0.35)';
    ctx.stroke();
    // дупло совы у вершины
    G.ellipse(ctx, cx, top + 160, 40, 56);
    fs(ctx, '#3A220A', '#2A1606', 3);
    // крона
    for (const [dx, dy, r] of [[-240, -40, 160], [240, -50, 150], [0, -170, 210], [-120, -230, 130], [130, -220, 130]]) {
      G.circle(ctx, cx + dx, top + dy, r);
      fs(ctx, '#4CAE48', '#2F8A38', 4);
    }
    for (let k = 0; k < 12; k++) {
      const a = k * 2.1, d = 80 + ((k * 41) % 140);
      G.ellipse(ctx, cx + Math.cos(a) * d * 1.4, top - 120 + Math.sin(a) * d * 0.6, 14, 18, a);
      ctx.fillStyle = '#8B5A2B';
      ctx.fill();
      G.ellipse(ctx, cx + Math.cos(a) * d * 1.4, top - 132 + Math.sin(a) * d * 0.6, 12, 7);
      ctx.fillStyle = '#6A4520';
      ctx.fill();
    }
  };
  // Стройка: кран и каркас дома
  TALL.craneSite = function (ctx, L, v, t) {
    const top = L.floorYs[L.floorYs.length - 1];
    // бетонные колонны каркаса
    ctx.fillStyle = '#C9CDD8';
    for (let x = 120; x < L.w - 100; x += 300) ctx.fillRect(x, Math.max(top, v.y0), 30, Math.min(L.gy, v.y1) - Math.max(top, v.y0));
    // кран
    const kx = L.w - 170;
    const ktop = top - 360;
    ctx.fillStyle = '#FFB300';
    ctx.fillRect(kx - 18, Math.max(ktop, v.y0), 6, L.gy - Math.max(ktop, v.y0));
    ctx.fillRect(kx + 12, Math.max(ktop, v.y0), 6, L.gy - Math.max(ktop, v.y0));
    ctx.beginPath();
    for (let y = Math.max(ktop, Math.floor(v.y0 / 40) * 40); y < Math.min(L.gy, v.y1); y += 40) {
      ctx.moveTo(kx - 15, y);
      ctx.lineTo(kx + 15, y + 40);
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#E09A00';
    ctx.stroke();
    if (ktop > v.y0 - 100) {
      ctx.fillStyle = '#FFB300';
      ctx.fillRect(kx - L.w * 0.75, ktop, L.w * 0.75 + 80, 16);
      G.rr(ctx, kx - 40, ktop + 16, 60, 50, 6);
      fs(ctx, '#FFD54F', '#B8860B', 2.5);
      ctx.fillStyle = '#8FE0FF';
      ctx.fillRect(kx - 32, ktop + 24, 22, 20);
    }
  };
  // Стойки с серверами
  TALL.serverRacks = function (ctx, L, v, t) {
    const fl = L.floorYs;
    for (let k = 0; k < fl.length - 1; k++) {
      const yb = fl[k], yt = fl[k + 1];
      if (yb < v.y0 || yt > v.y1) continue;
      for (let x = 100; x < L.w - 100; x += 170) {
        if (x > v.x1 || x + 120 < v.x0) continue;
        G.rr(ctx, x, yt + 60, 120, yb - yt - 60, 6);
        fs(ctx, '#27305A', '#141A33', 2);
        for (let y = yt + 76; y < yb - 16; y += 24) {
          ctx.fillStyle = '#33407A';
          ctx.fillRect(x + 10, y, 100, 16);
          const on = Math.sin(t * 4 + x * 0.3 + y) > 0;
          ctx.fillStyle = on ? '#7CFFB0' : '#2A3558';
          ctx.fillRect(x + 94, y + 5, 8, 6);
          ctx.fillStyle = Math.sin(t * 7 + y) > 0.3 ? '#4FD1FF' : '#2A3558';
          ctx.fillRect(x + 80, y + 5, 8, 6);
        }
      }
    }
  };
  // Стена замка с окнами
  TALL.castleWall = function (ctx, L, v, t) {
    const top = L.floorYs[L.floorYs.length - 1] - 40;
    ctx.fillStyle = '#6E5AA8';
    ctx.fillRect(40, Math.max(top, v.y0), L.w - 80, Math.min(L.gy, v.y1) - Math.max(top, v.y0));
    ctx.fillStyle = '#5E4B96';
    for (let y = Math.max(top, Math.floor(v.y0 / 60) * 60); y < Math.min(L.gy, v.y1); y += 60) {
      for (let x = 40 + ((y / 60) % 2) * 50; x < L.w - 80; x += 100) ctx.fillRect(x, y, 90, 6);
    }
    // зубцы на верху
    ctx.fillStyle = '#6E5AA8';
    for (let x = 40; x < L.w - 60; x += 80) ctx.fillRect(x, top - 40, 48, 42);
    // окна с огоньками
    const fl = L.floorYs;
    for (let k = 1; k < fl.length; k++) {
      const y = fl[k] + 80;
      if (y < v.y0 - 100 || y > v.y1) continue;
      for (let x = 200; x < L.w - 150; x += 360) {
        ctx.beginPath();
        ctx.moveTo(x, y + 140);
        ctx.lineTo(x, y + 40);
        ctx.arc(x + 40, y + 40, 40, Math.PI, 0);
        ctx.lineTo(x + 80, y + 140);
        ctx.closePath();
        ctx.fillStyle = '#FFE680';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#4B3A8A';
        ctx.stroke();
      }
    }
  };

  // =========================================================
  // Передний план: светлячки, пузырьки, листочки…
  // =========================================================
  const FRONT = (Sc.FRONT = {});
  function frontItems(L, n) {
    const r = U.rng(L.seed + 99);
    const a = [];
    for (let k = 0; k < n; k++) a.push([r() * L.w, 80 + r() * (L.gy - 80), r() * 10, 20 + r() * 40, r()]);
    return a;
  }
  FRONT.fireflies = function (ctx, L, v, t) {
    for (const f of L._front) {
      const x = f[0] + Math.sin(t * 0.7 + f[2]) * f[3], y = f[1] + Math.cos(t * 0.9 + f[2]) * f[3];
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
      const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + f[2]));
      G.glow(ctx, x, y, 14, '#EFFF8A', a * 0.5);
      G.circle(ctx, x, y, 3);
      ctx.fillStyle = 'rgba(240,255,150,' + a + ')';
      ctx.fill();
    }
  };
  FRONT.sparkles = function (ctx, L, v, t) {
    for (const f of L._front) {
      const x = f[0], y = f[1] + Math.sin(t + f[2]) * 10;
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + f[2] * 5);
      G.sparkle(ctx, x, y, 3 + tw * 5, '#FFF6C8', 0.3 + tw * 0.6);
    }
  };
  FRONT.dust = function (ctx, L, v, t) {
    ctx.fillStyle = 'rgba(255,240,200,0.5)';
    for (const f of L._front) {
      const x = f[0] + Math.sin(t * 0.3 + f[2]) * 30, y = f[1] + Math.sin(t * 0.2 + f[2]) * 20;
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
      G.circle(ctx, x, y, 1.5 + f[4] * 2);
      ctx.fill();
    }
  };
  FRONT.bubbles = function (ctx, L, v, t) {
    for (const f of L._front) {
      const span = L.gy;
      const y = ((f[1] - t * (20 + f[4] * 30)) % span + span) % span;
      const x = f[0] + Math.sin(t + f[2]) * 12;
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
      G.circle(ctx, x, y, 4 + f[4] * 6);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(200,255,220,0.6)';
      ctx.stroke();
    }
  };
  FRONT.sparks = function (ctx, L, v, t) {
    for (const f of L._front) {
      const ph = (t * 0.6 + f[4]) % 1;
      if (ph > 0.25) continue;
      const x = f[0], y = f[1];
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
      for (let k = 0; k < 4; k++) {
        const a = k * 1.6 + f[2];
        G.circle(ctx, x + Math.cos(a) * ph * 120, y + Math.sin(a) * ph * 60 + ph * ph * 200, 2.5);
        ctx.fillStyle = 'rgba(255,220,100,' + (1 - ph * 4) + ')';
        ctx.fill();
      }
    }
  };
  FRONT.butterflies = function (ctx, L, v, t) {
    const cols = ['#FF8FC0', '#FFD23F', '#8FD3FF', '#B983FF'];
    L._front.forEach((f, i) => {
      if (i % 3) return;
      const x = f[0] + Math.sin(t * 0.5 + f[2]) * 120, y = Math.min(L.gy - 40, f[1]) + Math.sin(t * 1.3 + f[2]) * 40;
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) return;
      const fl = Math.abs(Math.sin(t * 12 + f[2]));
      const c = cols[i % cols.length];
      G.ellipse(ctx, x - 7 * fl, y, 8 * fl + 1, 10, -0.3);
      ctx.fillStyle = c;
      ctx.fill();
      G.ellipse(ctx, x + 7 * fl, y, 8 * fl + 1, 10, 0.3);
      ctx.fill();
      ctx.fillStyle = '#3A2A40';
      ctx.fillRect(x - 1, y - 7, 2, 14);
    });
  };
  FRONT.pollen = function (ctx, L, v, t) {
    ctx.fillStyle = 'rgba(255,250,210,0.8)';
    for (const f of L._front) {
      const x = f[0] + Math.sin(t * 0.4 + f[2]) * 40 + t * 8 * f[4];
      const y = f[1] + Math.sin(t * 0.7 + f[2]) * 20;
      const xx = ((x % L.w) + L.w) % L.w;
      if (xx < v.x0 || xx > v.x1 || y < v.y0 || y > v.y1) continue;
      G.circle(ctx, xx, y, 2 + f[4] * 2);
      ctx.fill();
    }
  };
  FRONT.leaves = function (ctx, L, v, t) {
    const cols = ['#F2A93B', '#E0703A', '#9BC94A'];
    L._front.forEach((f, i) => {
      if (i % 2) return;
      const span = L.gy + 200;
      const y = ((f[1] + t * (30 + f[4] * 30)) % span) - 100;
      const x = f[0] + Math.sin(t * 0.8 + f[2]) * 60;
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) return;
      G.ellipse(ctx, x, y, 8, 4, t * 2 + f[2]);
      ctx.fillStyle = cols[i % 3];
      ctx.fill();
    });
  };
  FRONT.steam = function (ctx, L, v, t) {
    L._front.forEach((f, i) => {
      if (i % 2) return;
      const ph = (t * 0.25 + f[4]) % 1;
      const x = f[0] + Math.sin(ph * 6 + f[2]) * 20;
      const y = L.gy - 60 - ph * 500;
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) return;
      G.circle(ctx, x, y, 14 + ph * 30);
      ctx.fillStyle = 'rgba(255,255,255,' + 0.35 * (1 - ph) + ')';
      ctx.fill();
    });
  };
  FRONT.iconsUp = function (ctx, L, v, t) {
    L._front.forEach((f, i) => {
      if (i % 2) return;
      const span = L.gy;
      const y = ((f[1] - t * (24 + f[4] * 20)) % span + span) % span;
      const x = f[0] + Math.sin(t + f[2]) * 16;
      if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) return;
      ctx.globalAlpha = 0.55;
      if (i % 3 === 0) {
        G.heartPath(ctx, x, y, 9);
        ctx.fillStyle = '#FF6FA8';
        ctx.fill();
      } else if (i % 3 === 1) {
        G.starPath(ctx, x, y, 10, 4.5);
        ctx.fillStyle = '#FFD54F';
        ctx.fill();
      } else {
        G.rr(ctx, x - 10, y - 7, 20, 14, 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 7);
        ctx.lineTo(x, y + 1);
        ctx.lineTo(x + 10, y - 7);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#5A4FCF';
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  };

  // =========================================================
  // Сборка фона сцены
  // =========================================================
  Sc.build = function (L, th, r, desc) {
    L.paintSky = paintSkyFor(L, th);
    const deco = Sc.placeDeco ? Sc.placeDeco(L, th, r) : [];
    L.deco = deco;
    L._front = th.front ? frontItems(L, th.front === 'fireflies' ? 40 : 30) : [];
    L.paintBack = function (ctx, t, v) {
      if (th.wall && WALL[th.wall.kind]) WALL[th.wall.kind](ctx, L, v, th.wall, t);
      if (L.layout === 'tall' && th.tallBack && TALL[th.tallBack]) TALL[th.tallBack](ctx, L, v, t);
      // вода — дно пруда
      for (const w of L.water) {
        if (w.x > v.x1 || w.x + w.w < v.x0) continue;
        ctx.fillStyle = '#6E4A2A';
        ctx.fillRect(w.x, w.y + 38, w.w, 200);
      }
      for (const d of deco) {
        if (d.x + d.w < v.x0 || d.x - d.w > v.x1 || d.y < v.y0 - 50 || d.y - d.h > v.y1) continue;
        d.draw(ctx, d, t);
      }
      const colStyle = COL[th.column] || COL.trunk;
      for (const c of L.columns) {
        if (c.x + 200 < v.x0 || c.x - 200 > v.x1 || c.bottom < v.y0 || c.top - 250 > v.y1) continue;
        colStyle(ctx, c, t);
      }
    };
    L.paintMid = function (ctx, t, v, game) {
      // вода поверх дна
      for (const w of L.water) {
        if (w.x > v.x1 || w.x + w.w < v.x0) continue;
        ctx.fillStyle = U.rgba(th.water || '#8FDBFF', 0.7);
        ctx.fillRect(w.x, w.y, w.w, 40);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let x = w.x + 20; x < w.x + w.w - 20; x += 60) ctx.fillRect(x + Math.sin(t * 2 + x) * 6, w.y + 6, 26, 3);
      }
      if (L.props) for (const pr of L.props) if (pr.draw && !(pr.x > v.x1 || pr.x + pr.w < v.x0)) pr.draw(ctx, pr, t, game);
    };
    L.paintFront = th.front && FRONT[th.front] ? (ctx, t, v) => FRONT[th.front](ctx, L, v, t) : null;
    L.props = Sc.makeFriends ? Sc.makeFriends(L, th, r) : [];
    void desc;
  };
})(window.VW);
