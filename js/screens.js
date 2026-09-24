/* Vasilisa World — экраны: заставка, персонаж (эскиз 1), миры (эскиз 2), карта сцен */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, UI = VW.UI, D = VW.Data, S = VW.Store, A = VW.Audio, V = VW.Voice, Hero = VW.Hero, I = VW.Items;
  const TAU = Math.PI * 2;

  VW.screens = VW.screens || {};
  VW.starPulse = 0;

  // ---------- общие элементы ----------
  function roundBtn(ctx, id, cx, cy, r, color, icon, onTap, iconScale) {
    const pressed = UI.btnC(id, cx, cy, r, onTap);
    const oy = G.roundButton(ctx, cx, cy, r, color, pressed);
    G.icon(ctx, icon, cx, cy + oy, r * (iconScale || 0.55), '#fff');
    return pressed;
  }
  VW.roundBtn = roundBtn;

  function starCounter(ctx) {
    return G.starCounter(ctx, 16, 14, S.data.stars, 62, { pulse: Math.sin(Math.min(1, VW.starPulse / 0.6) * Math.PI) });
  }
  VW.drawStarCounter = starCounter;

  function musicBtn(ctx, id, cx, cy, r) {
    roundBtn(ctx, id, cx, cy, r, '#8C7BD8', A.musicOn ? 'music' : 'musicOff', () => {
      A.setMusicOn(!A.musicOn);
      S.data.music = A.musicOn;
      S.save();
      A.sfx('tap');
    });
  }
  VW.musicBtn = musicBtn;

  // Пейзаж волшебной страны (заставка и карта)
  function landscape(ctx, W, H, t, evening) {
    if (evening) G.sky(ctx, W, H, ['#5A3FC0', '#9D6FE0', '#FF9ECF', '#FFD9A0']);
    else G.sky(ctx, W, H, ['#5FB8FF', '#A8DDFF', '#E4F6FF']);
    if (evening) {
      G.nightStars(ctx, W, H * 0.45, t, 11, 40);
      G.glow(ctx, W * 0.9, H * 0.2, 90, '#FFF4C2', 0.5);
      G.circle(ctx, W * 0.9, H * 0.2, 34);
      ctx.fillStyle = '#FFF4C2';
      ctx.fill();
      ctx.fillStyle = 'rgba(230,210,150,0.6)';
      for (const [dx, dy, r] of [[-10, -8, 7], [9, 6, 5], [-4, 14, 4]]) {
        G.circle(ctx, W * 0.9 + dx, H * 0.2 + dy, r);
        ctx.fill();
      }
    } else {
      G.glow(ctx, W * 0.12, H * 0.12, 140, '#FFF3A0', 0.8);
      G.circle(ctx, W * 0.12, H * 0.12, 46);
      ctx.fillStyle = '#FFE45C';
      ctx.fill();
    }
    // облака
    for (let i = 0; i < 4; i++) {
      const w = 170 + i * 30;
      const x = ((t * (10 + i * 4) + i * 360) % (W + w + 200)) - w - 100;
      const y = 60 + i * 50 + (i % 2) * 20;
      G.cloud(ctx, x, y, w, 64 + i * 6, evening ? 'rgba(255,230,245,0.8)' : '#fff', evening ? 'rgba(160,100,200,0.3)' : null);
    }
    // дальние горы
    ctx.fillStyle = evening ? '#7E5CC8' : '#A6B8F0';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.62);
    const pk = [[0.08, 0.44], [0.2, 0.55], [0.33, 0.4], [0.47, 0.56], [0.62, 0.42], [0.78, 0.56], [0.92, 0.45], [1.05, 0.58]];
    for (const [px, py] of pk) ctx.lineTo(px * W, py * H);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (const [px, py] of [[0.33, 0.4], [0.62, 0.42], [0.08, 0.44]]) {
      ctx.beginPath();
      ctx.moveTo(px * W, py * H);
      ctx.lineTo(px * W - 26, py * H + 34);
      ctx.lineTo(px * W - 6, py * H + 28);
      ctx.lineTo(px * W + 8, py * H + 36);
      ctx.lineTo(px * W + 28, py * H + 32);
      ctx.closePath();
      ctx.fill();
    }
    castle(ctx, W * 0.74, H * 0.62, 1, t, evening);
    G.hill(ctx, -20, W + 20, H * 0.72, 40, evening ? '#6FBF6A' : '#8EDB7A', 5);
    G.hill(ctx, -20, W + 20, H * 0.84, 30, evening ? '#4FA85A' : '#5FC860', 9);
  }
  VW.landscape = landscape;

  // Своя волшебная школа-замок (не из фильмов)
  function castle(ctx, x, baseY, s, t, evening) {
    ctx.save();
    ctx.translate(x, baseY);
    ctx.scale(s, s);
    const wall = evening ? '#C9B8F0' : '#F2E6FF', roof = '#FF6FA8', win = evening ? '#FFE680' : '#7FD3FF';
    const towers = [[-120, 150, 40], [-60, 210, 48], [10, 250, 56], [85, 190, 46], [140, 140, 36]];
    G.rr(ctx, -140, -110, 300, 110, 8);
    ctx.fillStyle = wall;
    ctx.fill();
    for (const [tx, th, tw] of towers) {
      G.rr(ctx, tx - tw / 2, -th, tw, th, 6);
      ctx.fillStyle = wall;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(90,60,150,0.4)';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx - tw / 2 - 8, -th);
      ctx.lineTo(tx, -th - tw * 1.3);
      ctx.lineTo(tx + tw / 2 + 8, -th);
      ctx.closePath();
      ctx.fillStyle = roof;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(tx, -th - tw * 1.3);
      ctx.lineTo(tx, -th - tw * 1.3 - 22);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6B4FA0';
      ctx.stroke();
      ctx.beginPath();
      const fl = Math.sin(t * 4 + tx) * 3;
      ctx.moveTo(tx, -th - tw * 1.3 - 22);
      ctx.lineTo(tx + 16, -th - tw * 1.3 - 17 + fl);
      ctx.lineTo(tx, -th - tw * 1.3 - 12);
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
      G.rr(ctx, tx - 7, -th + 22, 14, 20, 7);
      ctx.fillStyle = win;
      ctx.fill();
    }
    G.rr(ctx, -18, -54, 36, 54, 18);
    ctx.fillStyle = '#8C5A2B';
    ctx.fill();
    ctx.restore();
  }
  VW.castle = castle;

  // =========================================================
  // Заставка
  // =========================================================
  const TITLE_COLORS = ['#FF4F9A', '#FF8C1A', '#FFC21A', '#2FBF55', '#2FA8F0', '#9A55E8'];

  VW.screens.title = {
    enter() {
      this.t = 0;
      this.fx = new VW.Particles();
      A.music('menu');
    },
    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      if (Math.random() < dt * 6) {
        this.fx.add({ type: 'spark', x: U.rand(0, VW.W), y: U.rand(0, VW.H * 0.6), vx: 0, vy: -10, life: 1.2, size: U.rand(5, 11), color: U.pick(['#fff', '#FFF3A0', '#FFD1EC']) });
      }
    },
    onKey(code) {
      if (code === 'Enter' || code === 'Space') this.start();
    },
    start() {
      A.sfx('magic');
      V.say(D.say.hello);
      VW.go('character');
    },
    draw(ctx, W, H) {
      const t = this.t;
      landscape(ctx, W, H, t, false);
      this.fx.draw(ctx);

      // Заголовок: разноцветные прыгающие буквы
      drawTitle(ctx, 'Vasilisa', W / 2, H * 0.19, Math.min(118, W / 8.2), t, 0);
      drawTitle(ctx, 'World', W / 2, H * 0.36, Math.min(96, W / 10), t, 3);

      // Герой и питомец
      const look = S.data.look;
      const hx = W * 0.3, hy = H - 70;
      G.ellipse(ctx, hx, hy + 4, 70, 14);
      ctx.fillStyle = 'rgba(30,80,30,0.25)';
      ctx.fill();
      Hero.draw(ctx, hx, hy, look, { state: 'wave', t: t, facing: 1 }, 2.1);
      if (look.pet) VW.Pets.draw(ctx, look.pet, hx + 150, hy - (VW.Pets.flies(look.pet) ? 90 : 0), { t: t, facing: -1, scale: 1.8 });

      // Большая кнопка «Играть»
      const bx = W * 0.64, by = H * 0.7, br = 78 + Math.sin(t * 4) * 4;
      G.glow(ctx, bx, by, br * 1.9, '#FFF3A0', 0.55);
      roundBtn(ctx, 'play', bx, by, br, '#2FBF55', 'play', () => this.start(), 0.6);

      // Музыка и во весь экран
      musicBtn(ctx, 'music', W - 52, 52, 34);
      if (VW.canFullscreen()) {
        roundBtn(ctx, 'fs', W - 132, 52, 34, '#8C7BD8', 'fullscreen', () => {
          A.sfx('tap');
          VW.toggleFullscreen();
        });
      }
    },
  };

  function drawTitle(ctx, str, cx, cy, size, t, phase) {
    ctx.font = G.font(size, 900);
    const widths = str.split('').map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + (str.length - 1) * size * 0.02;
    let x = cx - total / 2;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const y = cy + Math.sin(t * 3 + (i + phase) * 0.55) * size * 0.06;
      const rot = Math.sin(t * 2 + i) * 0.05;
      ctx.save();
      ctx.translate(x + widths[i] / 2, y);
      ctx.rotate(rot);
      ctx.lineWidth = size * 0.26;
      ctx.strokeStyle = '#3A2380';
      ctx.strokeText(ch, -widths[i] / 2, size * 0.04);
      ctx.lineWidth = size * 0.12;
      ctx.strokeStyle = '#fff';
      ctx.strokeText(ch, -widths[i] / 2, 0);
      ctx.fillStyle = TITLE_COLORS[(i + phase) % TITLE_COLORS.length];
      ctx.fillText(ch, -widths[i] / 2, 0);
      ctx.restore();
      x += widths[i] + size * 0.02;
    }
  }
  VW.drawTitle = drawTitle;

  // =========================================================
  // Прокручиваемый список (лента слева и справа)
  // =========================================================
  // o: {id, x, y, w, h, items, itemH, gap, st, title, draw(it, x, y, w, h, pressed, i), tap(it, i)}
  function scrollList(ctx, o) {
    const st = o.st;
    st.axis = 'y';
    const titleH = o.title ? 30 : 0;
    const arrowH = 38;
    const top = o.y + titleH;
    const vy = top + arrowH, vh = o.y + o.h - arrowH - vy;
    const step = o.itemH + o.gap;
    const contentH = Math.max(0, o.items.length * step - o.gap);
    st.max = Math.max(0, contentH - vh);
    if (!st.dragging) st.pos = U.clamp(st.pos, -60, st.max + 60);
    G.panel(ctx, o.x, o.y, o.w, o.h, { r: 24, fill: 'rgba(255,255,255,0.88)', stroke: o.color || '#B9A7F0', lw: 3, shadowY: 4 });
    if (o.title) {
      let fsz = 17;
      while (fsz > 11 && G.measure(ctx, o.title, fsz, 900) > o.w - 16) fsz--;
      G.text(ctx, o.title, o.x + o.w / 2, o.y + 18, fsz, '#4A3A7A', { weight: 900 });
    }
    const canUp = st.pos > 1, canDn = st.pos < st.max - 1;
    const pu = UI.btn(o.id + 'up', o.x + 8, top + 4, o.w - 16, arrowH - 8, () => {
      st.target = U.clamp(Math.round(st.pos / step - 1) * step, 0, st.max);
      A.sfx('tap');
    });
    G.icon(ctx, 'up', o.x + o.w / 2, top + arrowH / 2 + (pu ? 2 : 0), 15, canUp ? '#7C5CE0' : '#D8D0F0', false);
    const pd = UI.btn(o.id + 'dn', o.x + 8, o.y + o.h - arrowH + 4, o.w - 16, arrowH - 8, () => {
      st.target = U.clamp(Math.round(st.pos / step + 1) * step, 0, st.max);
      A.sfx('tap');
    });
    G.icon(ctx, 'down', o.x + o.w / 2, o.y + o.h - arrowH / 2 + (pd ? 2 : 0), 15, canDn ? '#7C5CE0' : '#D8D0F0', false);
    // фон списка тоже можно тянуть пальцем
    UI.btn(o.id + 'bg', o.x, vy, o.w, vh, null, { scroll: st, pad: 0 });
    ctx.save();
    ctx.beginPath();
    ctx.rect(o.x + 2, vy, o.w - 4, vh);
    ctx.clip();
    o.items.forEach((it, i) => {
      const iy = vy + i * step - st.pos;
      if (iy + o.itemH < vy || iy > vy + vh) return;
      const hy0 = Math.max(iy, vy), hy1 = Math.min(iy + o.itemH, vy + vh);
      const pressed = hy1 - hy0 > 10 ? UI.btn(o.id + ':' + i, o.x + 8, hy0, o.w - 16, hy1 - hy0, () => o.tap(it, i), { scroll: st, pad: 0 }) : false;
      o.draw(it, o.x + 8, iy, o.w - 16, o.itemH, pressed, i);
    });
    ctx.restore();
    if (st.max > 0) {
      const bh = Math.max(24, (vh * vh) / contentH);
      const by = vy + (vh - bh) * U.clamp(st.pos / st.max, 0, 1);
      G.rr(ctx, o.x + o.w - 7, by, 4, bh, 2);
      ctx.fillStyle = 'rgba(120,90,200,0.35)';
      ctx.fill();
    }
  }
  VW.scrollList = scrollList;

  // =========================================================
  // Меню персонажа (эскиз 1)
  // =========================================================
  const PETS_CAT = { id: 'pets', name: 'Питомцы', pets: true };

  const CH = (VW.screens.character = {
    get subtitlePos() {
      return this.modal ? 'bottom' : 126;
    },
    enter() {
      this.t = 0;
      this.fx = new VW.Particles();
      this.leftSt = this.leftSt || { pos: 0, vel: 0 };
      this.rightSt = this.rightSt || { pos: 0, vel: 0 };
      this.setOff = this.setOff || 0;
      this.modal = null;
      this.cheer = 0;
      this.shake = {};
      const hero = Hero.heroOf(S.data.look);
      if (!this.cat) this.cat = hero ? hero.set : 'wizard';
      A.music('menu');
      const first = !S.data.seenCharacter;
      S.data.seenCharacter = true;
      S.saveSoon();
      setTimeout(() => {
        if (VW.screen === CH && !V.speaking) V.say(first ? D.say.character : D.say.characterAgain);
      }, first ? 2600 : 400);
    },
    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      UI.stepScroll(this.leftSt, dt);
      UI.stepScroll(this.rightSt, dt);
      this.cheer = Math.max(0, this.cheer - dt);
      for (const k of Object.keys(this.shake)) {
        this.shake[k] -= dt;
        if (this.shake[k] <= 0) delete this.shake[k];
      }
      if (this.modal) this.modal.t += dt;
    },
    onKey(code) {
      if (this.modal) {
        if (code === 'Escape') this.closeModal();
        if (code === 'Enter') this.modal.primary && this.modal.primary();
        return;
      }
      if (code === 'Enter' || code === 'Space') this.next();
    },
    next() {
      A.sfx('magic');
      VW.go('worlds');
    },
    // Как будет выглядеть герой, если выбрать вещь (для примерки в окошке покупки)
    lookWith(kind, id, heroId) {
      const L = Object.assign({}, S.data.look);
      if (kind === 'color') L.color = id;
      if (kind === 'skin') {
        const it = S.item('skin', id);
        L[it.slot] = id;
      }
      if (kind === 'pet') L.pet = id;
      if (kind === 'set') {
        L.hero = heroId || (D.heroesOf(id)[0] || {}).id || null;
        L.head = null;
        L.body = null;
      }
      return L;
    },
    // Нажатие на цвет или наряд
    choose(kind, id) {
      const it = S.item(kind, id);
      if (!it) return;
      if (!S.owns(kind, id)) {
        this.openBuy(kind, id);
        return;
      }
      this.apply(kind, id);
      V.say(it.name + '!');
    },
    // Надеть/снять вещь (наряды надеваются и поверх героя)
    apply(kind, id) {
      const it = S.item(kind, id);
      const L = S.data.look;
      if (kind === 'color') {
        L.color = id;
      } else if (kind === 'skin') {
        L[it.slot] = L[it.slot] === id ? null : id;
      } else if (kind === 'pet') {
        L.pet = L.pet === id ? null : id;
      }
      this.feedback();
    },
    feedback() {
      S.save();
      A.sfx('select');
      this.cheer = 0.8;
      this.fx.burst('spark', this.heroX || VW.W / 2, (this.heroY || VW.H / 2) - 150, 10, { speed: 260, size: 12, color: '#FFF3A0' });
    },
    // Нажатие на героя в списке справа
    chooseHero(h) {
      if (!S.owns('set', h.set)) {
        this.openBuy('set', h.set, h.id);
        return;
      }
      const L = S.data.look;
      if (L.hero === h.id) {
        L.hero = null;
        this.feedback();
        V.say('Снова обычный человечек!');
        return;
      }
      L.hero = h.id;
      L.head = null;
      L.body = null;
      this.feedback();
      V.say(h.name + '!');
    },
    choosePet(p) {
      if (!S.owns('pet', p.id)) {
        this.openBuy('pet', p.id);
        return;
      }
      this.apply('pet', p.id);
      V.say(p.name + '!');
    },
    // Нажатие на категорию внизу — справа показываем её героев
    chooseCat(c) {
      if (this.cat !== c.id) {
        this.cat = c.id;
        this.rightSt.pos = 0;
        this.rightSt.vel = 0;
        this.rightSt.target = null;
      }
      A.sfx('tap');
      if (c.pets) V.say('Питомцы! Выбирай друга справа.');
      else if (!S.owns('set', c.id)) V.say(c.name + '! Этот набор стоит десять звёздочек.');
      else V.say(c.name + '! Выбирай героя справа.');
    },
    openBuy(kind, id, heroId) {
      const it = S.item(kind, id);
      const can = S.data.stars >= it.price;
      A.sfx(can ? 'tap' : 'locked');
      this.shake[kind + (heroId || id)] = 0.4;
      this.modal = { kind: kind, id: id, hero: heroId || null, item: it, t: 0, can: can };
      this.modal.primary = can ? () => this.buy() : () => this.closeModal();
      const name = kind === 'set' ? 'Набор «' + it.name + '»' : it.name;
      V.say(name + '! ' + (can ? 'Купить за звёздочки?' : D.say.needStars));
    },
    closeModal() {
      this.modal = null;
      A.sfx('back');
    },
    buy() {
      const m = this.modal;
      if (!m) return;
      if (S.buy(m.kind, m.id)) {
        VW.starPulse = 0.6;
        this.modal = null;
        if (m.kind === 'set') {
          const L = S.data.look;
          L.hero = m.hero || (D.heroesOf(m.id)[0] || {}).id || null;
          L.head = null;
          L.body = null;
          this.feedback();
        } else this.apply(m.kind, m.id);
        A.sfx('buy');
        V.say(D.say.bought);
        this.fx.burst('confetti', VW.W / 2, VW.H * 0.35, 60, { speed: 520, g: 500 });
      } else {
        this.closeModal();
      }
    },
    draw(ctx, W, H) {
      const t = this.t;
      G.notebook(ctx, W, H);
      const look = S.data.look;

      // --- верх: звёзды, палитра, кнопка «дальше» ---
      const cw = starCounter(ctx);
      const goR = 46;
      const goX = W - 16 - goR, goY = 14 + goR;
      G.glow(ctx, goX, goY, goR * 1.7, '#B6FFB0', 0.5 + 0.2 * Math.sin(t * 4));
      roundBtn(ctx, 'go', goX, goY, goR, '#2FBF55', 'play', () => this.next(), 0.62);

      const px0 = 16 + cw + 22, px1 = W - 16 - goR * 2 - 22;
      const n = D.colors.length;
      const sp = Math.min(80, (px1 - px0) / n);
      const pr = sp * 0.4;
      const py = 14 + 34;
      G.panel(ctx, px0 - 8, 10, sp * n + 16, 84, { r: 40, fill: 'rgba(255,255,255,0.85)', stroke: '#F2C37A', lw: 3, shadowY: 4 });
      D.colors.forEach((c, i) => {
        const cx = px0 + sp * (i + 0.5), cy = py + 4;
        const owned = S.owns('color', c.id);
        const sel = look.color === c.id;
        const sh = this.shake['color' + c.id] ? Math.sin(this.shake['color' + c.id] * 50) * 5 : 0;
        const pressed = UI.btnC('col' + c.id, cx, cy, pr + 4, () => this.choose('color', c.id));
        const r = pr * (sel ? 1.12 : 1) * (pressed ? 0.9 : 1);
        if (sel) {
          G.circle(ctx, cx + sh, cy, r + 7);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = '#5B3FB8';
          ctx.stroke();
        }
        drawSwatch(ctx, c, cx + sh, cy, r, t);
        if (!owned) {
          G.circle(ctx, cx + sh, cy, r);
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.fill();
          G.lockBadge(ctx, cx + sh + r * 0.62, cy - r * 0.62, 11);
          G.priceTag(ctx, cx + sh, cy + r + 8, c.price, 20, S.data.stars >= c.price);
        }
      });

      // --- середина ---
      const midTop = 118, midBot = H - 164;
      const stripW = Math.min(172, W * 0.155);

      // левая лента: наряды (надеваются и на героя)
      scrollList(ctx, {
        id: 'skins', x: 16, y: midTop, w: stripW, h: midBot - midTop, items: D.skins, itemH: 104, gap: 10, st: this.leftSt,
        draw: (it, x, y, w, h, pressed) => {
          const owned = S.owns('skin', it.id);
          const on = look[it.slot] === it.id;
          const sh = this.shake['skin' + it.id] ? Math.sin(this.shake['skin' + it.id] * 50) * 5 : 0;
          const oy = pressed ? 3 : 0;
          G.panel(ctx, x + sh, y + oy, w, h, { r: 18, fill: on ? '#FFF4C2' : '#F6F2FF', stroke: on ? '#F2A900' : '#CFC4F2', lw: on ? 4 : 2.5, shadowY: pressed ? 1 : 4 });
          ctx.save();
          G.rr(ctx, x + sh + 2, y + oy + 2, w - 4, h - 4, 16);
          ctx.clip();
          Hero.drawSkinIcon(ctx, it.id, x + sh + w / 2, y + oy + h / 2, 1.9, t);
          ctx.restore();
          if (!owned) {
            G.lockBadge(ctx, x + sh + w - 18, y + oy + 18, 14);
            G.priceTag(ctx, x + sh + w / 2, y + oy + h - 16, it.price, 24, S.data.stars >= it.price);
          } else if (on) G.checkBadge(ctx, x + sh + w - 18, y + oy + 18, 14);
        },
        tap: (it) => this.choose('skin', it.id),
      });

      // правая лента: герои выбранной категории (или питомцы)
      const cat = this.cat === 'pets' ? PETS_CAT : S.item('set', this.cat) || D.sets[0];
      const catOwned = cat.pets || S.owns('set', cat.id);
      const rightItems = cat.pets ? D.pets : D.heroesOf(cat.id);
      scrollList(ctx, {
        id: 'list', x: W - 16 - stripW, y: midTop, w: stripW, h: midBot - midTop, items: rightItems, itemH: 118, gap: 10, st: this.rightSt,
        title: cat.name, color: '#9ED7F2',
        draw: (it, x, y, w, h, pressed, i) => {
          const isPet = !!cat.pets;
          const owned = isPet ? S.owns('pet', it.id) : catOwned;
          const on = isPet ? look.pet === it.id : look.hero === it.id;
          const key = (isPet ? 'pet' : 'set') + it.id;
          const sh = this.shake[key] ? Math.sin(this.shake[key] * 50) * 5 : 0;
          const oy = pressed ? 3 : 0;
          G.panel(ctx, x + sh, y + oy, w, h, { r: 18, fill: on ? '#FFF4C2' : '#F2FAFF', stroke: on ? '#F2A900' : '#BFE3F5', lw: on ? 4 : 2.5, shadowY: pressed ? 1 : 4 });
          ctx.save();
          G.rr(ctx, x + sh + 2, y + oy + 2, w - 4, h - 4, 16);
          ctx.clip();
          if (isPet) VW.Pets.draw(ctx, it.id, x + sh + w / 2, y + oy + h - 30 - (VW.Pets.flies(it.id) ? 6 : 0), { t: t, scale: 1.25, facing: -1 });
          else {
            const mini = { color: look.color, hero: it.id };
            Hero.draw(ctx, x + sh + w / 2, y + oy + h - 25, mini, { state: on ? 'cheer' : 'idle', t: t + i * 0.7, facing: 1 }, 0.66);
          }
          ctx.restore();
          const lines = G.wrap(ctx, it.name, 14, w - 12, 800);
          lines.slice(0, 2).forEach((l, k) => G.text(ctx, l, x + sh + w / 2, y + oy + h - 16 + (k - (lines.length > 1 ? 0.5 : 0)) * 14 - (lines.length > 1 ? 4 : 0), 14, '#3B4A6B', { weight: 800, stroke: 'rgba(255,255,255,0.9)', lw: 4 }));
          if (!owned) {
            G.lockBadge(ctx, x + sh + w - 17, y + oy + 17, 13);
            if (isPet) G.priceTag(ctx, x + sh + 30, y + oy + 18, it.price, 22, S.data.stars >= it.price);
          } else if (on) G.checkBadge(ctx, x + sh + w - 17, y + oy + 17, 13);
        },
        tap: (it) => (cat.pets ? this.choosePet(it) : this.chooseHero(it)),
      });

      // сцена с героем
      const sx0 = 16 + stripW + 18, sx1 = W - 16 - stripW - 18;
      const scx = (sx0 + sx1) / 2;
      G.panel(ctx, sx0, midTop, sx1 - sx0, midBot - midTop, { r: 30, fill: 'rgba(255,248,230,0.9)', stroke: '#F2C37A', lw: 3, shadowY: 5 });
      const floorY = midBot - 34;
      G.glow(ctx, scx, floorY - 130, 230, '#FFF1B0', 0.7);
      G.ellipse(ctx, scx, floorY + 6, 120, 20);
      ctx.fillStyle = '#FFD1E8';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#F09AC4';
      ctx.stroke();
      const showLook = this.modal ? this.lookWith(this.modal.kind, this.modal.id, this.modal.hero) : look;
      const hs = Math.min(2.6, (floorY - midTop - 60) / 118);
      this.heroX = scx - (showLook.pet ? 40 : 0);
      this.heroY = floorY;
      const heroTap = UI.btn('hero', this.heroX - 70, floorY - hs * 115, 140, hs * 115, () => {
        this.cheer = 1.2;
        A.sfx('giggle');
        V.say(U.pick(D.say.tapHero));
        this.fx.burst('heart', this.heroX, floorY - hs * 100, 8, { speed: 200, g: -60, size: 10, color: '#FF6FA8' });
      });
      Hero.draw(ctx, this.heroX, floorY, showLook, { state: this.cheer > 0 ? 'cheer' : 'wave', t: t, facing: 1 }, hs * (heroTap ? 0.96 : 1));
      if (showLook.pet) {
        const fly = VW.Pets.flies(showLook.pet);
        VW.Pets.draw(ctx, showLook.pet, this.heroX + hs * 58, floorY - (fly ? hs * 80 : 0), { t: t, scale: hs * 0.85, facing: -1 });
      }
      const heroNow = Hero.heroOf(showLook);
      if (heroNow) G.text(ctx, heroNow.name, scx, midTop + 26, 22, '#6A4A2A', { weight: 900, stroke: '#FFF8E6', lw: 6, maxW: sx1 - sx0 - 30 });

      // --- низ: категории героев ---
      this.drawSets(ctx, 16, H - 150, W - 32, 136);

      this.fx.draw(ctx);

      if (this.modal) this.drawModal(ctx, W, H);
    },

    drawSets(ctx, x, y, w, h) {
      const t = this.t;
      const items = D.sets.concat([PETS_CAT]);
      G.panel(ctx, x, y, w, h, { r: 24, fill: 'rgba(255,255,255,0.88)', stroke: '#9ED7F2', lw: 3, shadowY: 4 });
      const gap = 8;
      const minW = 116;
      let fit = Math.floor((w - 16 + gap) / (minW + gap));
      let arrows = fit < items.length;
      let ax = 0;
      if (arrows) {
        ax = 46;
        fit = Math.max(1, Math.floor((w - 16 - ax * 2 + gap) / (minW + gap)));
      }
      fit = Math.min(fit, items.length);
      const maxOff = Math.max(0, items.length - fit);
      this.setOff = U.clamp(this.setOff, 0, maxOff);
      const cardW = (w - 16 - ax * 2 - gap * (fit - 1)) / fit;
      if (arrows) {
        const pl = UI.btn('setL', x + 6, y + 8, ax - 8, h - 16, () => {
          if (this.setOff > 0) {
            this.setOff--;
            A.sfx('tap');
          }
        });
        G.icon(ctx, 'left', x + ax / 2 + 3 + (pl ? 2 : 0), y + h / 2, 16, this.setOff > 0 ? '#2F8CC8' : '#CFE6F2', false);
        const prr = UI.btn('setR', x + w - ax + 2, y + 8, ax - 8, h - 16, () => {
          if (this.setOff < maxOff) {
            this.setOff++;
            A.sfx('tap');
          }
        });
        G.icon(ctx, 'right', x + w - ax / 2 - 3 + (prr ? 2 : 0), y + h / 2, 16, this.setOff < maxOff ? '#2F8CC8' : '#CFE6F2', false);
      }
      const look = S.data.look;
      const curHero = Hero.heroOf(look);
      for (let i = 0; i < fit; i++) {
        const it = items[this.setOff + i];
        if (!it) continue;
        const cx = x + 8 + ax + i * (cardW + gap), cy = y + 8, ch = h - 16;
        const owned = it.pets || S.owns('set', it.id);
        const active = this.cat === it.id;
        const wearing = it.pets ? !!look.pet : !!(curHero && curHero.set === it.id);
        const pressed = UI.btn('cat' + it.id, cx, cy, cardW, ch, () => this.chooseCat(it));
        const oy = pressed ? 3 : 0;
        G.panel(ctx, cx, cy + oy, cardW, ch, { r: 16, fill: active ? '#E6F6FF' : '#F7FBFF', stroke: active ? '#2F8CC8' : '#BFE3F5', lw: active ? 5 : 2.5, shadowY: pressed ? 1 : 3 });
        let nfs = 17;
        while (nfs > 11 && G.measure(ctx, it.name, nfs, 800) > cardW - 12) nfs -= 1;
        G.text(ctx, it.name, cx + cardW / 2, cy + oy + 15, nfs, '#3B4A6B', { weight: 800, maxW: cardW - 8 });
        ctx.save();
        G.rr(ctx, cx + 2, cy + oy + 2, cardW - 4, ch - 4, 14);
        ctx.clip();
        if (it.pets) {
          const pid = look.pet || 'cat';
          VW.Pets.draw(ctx, pid, cx + cardW / 2, cy + oy + ch - 24 - (VW.Pets.flies(pid) ? 8 : 0), { t: t, scale: 1.05, facing: -1 });
        } else {
          const rep = wearing ? curHero : D.heroesOf(it.id)[0];
          const mini = { color: look.color, hero: rep ? rep.id : null };
          Hero.draw(ctx, cx + cardW / 2, cy + oy + ch - (owned ? 8 : 26), mini, { state: active ? 'wave' : 'idle', t: t + i, facing: 1 }, 0.5);
        }
        ctx.restore();
        if (!owned) {
          G.lockBadge(ctx, cx + cardW - 16, cy + oy + ch - 48, 13);
          G.priceTag(ctx, cx + cardW / 2, cy + oy + ch - 15, it.price, 24, S.data.stars >= it.price);
        } else if (wearing) G.checkBadge(ctx, cx + cardW - 16, cy + oy + ch - 18, 13);
        if (active) {
          // стрелочка: «герои этой категории — справа»
          ctx.beginPath();
          ctx.moveTo(cx + cardW / 2 - 9, cy + oy - 1);
          ctx.lineTo(cx + cardW / 2, cy + oy - 11);
          ctx.lineTo(cx + cardW / 2 + 9, cy + oy - 1);
          ctx.closePath();
          ctx.fillStyle = '#2F8CC8';
          ctx.fill();
        }
      }
    },

    drawModal(ctx, W, H) {
      const m = this.modal;
      const k = U.easeOutBack(Math.min(1, m.t / 0.3));
      UI.blocker(() => this.closeModal());
      ctx.fillStyle = 'rgba(30,15,70,' + 0.45 * Math.min(1, m.t / 0.2) + ')';
      ctx.fillRect(0, 0, W, H);
      const pw = Math.min(660, W - 60), ph = 440;
      const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(k, k);
      ctx.translate(-W / 2, -H / 2);
      UI.btn('modalPanel', px, py, pw, ph, null);
      G.panel(ctx, px, py, pw, ph, { r: 34, fill: '#FFFDF4', stroke: '#9B7BFF', lw: 5, shadowY: 10 });
      // примерка
      const L = this.lookWith(m.kind, m.id, m.hero);
      const pvx = px + pw * 0.28, pvy = py + ph - 60;
      G.glow(ctx, pvx, pvy - 120, 170, '#FFF1B0', 0.8);
      if (m.kind === 'color') drawSwatch(ctx, m.item, pvx, py + 90, 48, this.t);
      Hero.draw(ctx, pvx - (L.pet ? 30 : 0), pvy, L, { state: 'wave', t: this.t, facing: 1 }, m.kind === 'color' ? 1.7 : 2.1);
      if (L.pet && m.kind === 'pet') VW.Pets.draw(ctx, L.pet, pvx + 90, pvy - (VW.Pets.flies(L.pet) ? 120 : 0), { t: this.t, scale: 2, facing: -1 });
      // справа: название, цена, прогресс
      const rx = px + pw * 0.66;
      const title = m.kind === 'set' ? 'Набор «' + m.item.name + '»' : m.item.name;
      let tfs = 34;
      while (tfs > 20 && G.measure(ctx, title, tfs, 900) > pw * 0.6) tfs--;
      G.text(ctx, title, rx, py + 58, tfs, '#3B2A6B', { weight: 900 });
      if (m.kind === 'set') {
        // все герои набора — маленькие, в ряд
        const hs = D.heroesOf(m.id);
        const gapx = Math.min(56, (pw * 0.6) / hs.length);
        hs.forEach((h, i) => Hero.draw(ctx, rx - ((hs.length - 1) * gapx) / 2 + i * gapx, py + 150, { color: S.data.look.color, hero: h.id }, { state: 'idle', t: this.t + i, facing: 1 }, 0.46));
      }
      const tagY = m.kind === 'set' ? py + 196 : py + 140;
      G.priceTag(ctx, rx, tagY, m.item.price, 50, m.can);
      // полоска «сколько есть»
      const bw = pw * 0.5, bx = rx - bw / 2, by = tagY + 44;
      const frac = U.clamp(S.data.stars / m.item.price, 0, 1);
      G.rr(ctx, bx, by, bw, 28, 14);
      ctx.fillStyle = '#EDE7FA';
      ctx.fill();
      if (frac > 0) {
        G.rr(ctx, bx, by, Math.max(28, bw * frac), 28, 14);
        ctx.fillStyle = m.can ? '#2FBF55' : '#FFC928';
        ctx.fill();
      }
      G.rr(ctx, bx, by, bw, 28, 14);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#B9A7F0';
      ctx.stroke();
      G.starIcon(ctx, bx + 16, by + 14, 11);
      G.text(ctx, Math.min(S.data.stars, 99999) + ' / ' + m.item.price, rx + 8, by + 15, 18, '#3B2A6B', { weight: 900 });
      // кнопки
      if (m.can) {
        const p = UI.btn('buyYes', rx - 110, py + ph - 116, 220, 84, () => this.buy());
        const oy = G.button3d(ctx, rx - 110, py + ph - 116, 220, 84, '#2FBF55', p, 30);
        G.icon(ctx, 'check', rx - 40, py + ph - 74 + oy, 26, '#fff');
        G.starIcon(ctx, rx + 34, py + ph - 76 + oy, 24);
      } else {
        const p = UI.btn('buyOk', rx - 90, py + ph - 116, 180, 84, () => this.closeModal());
        const oy = G.button3d(ctx, rx - 90, py + ph - 116, 180, 84, '#FF9A3C', p, 30);
        G.icon(ctx, 'check', rx, py + ph - 74 + oy, 28, '#fff');
      }
      roundBtn(ctx, 'buyNo', px + pw - 20, py + 20, 30, '#FF6B6B', 'close', () => this.closeModal(), 0.5);
      ctx.restore();
    },
  });

  function drawSwatch(ctx, c, cx, cy, r, t) {
    if (c.rainbow) {
      const cols = ['#FF4F4F', '#FF9F2E', '#FFE04A', '#4FD86A', '#3FA8FF', '#9B5DE5'];
      for (let i = 0; i < cols.length; i++) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, t + (i / cols.length) * TAU, t + ((i + 1) / cols.length) * TAU);
        ctx.closePath();
        ctx.fillStyle = cols[i];
        ctx.fill();
      }
    } else {
      G.circle(ctx, cx, cy, r);
      ctx.fillStyle = c.hex;
      ctx.fill();
    }
    G.circle(ctx, cx, cy, r);
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.rainbow ? '#7C5CE0' : U.shade(c.hex, -0.4);
    ctx.stroke();
    G.ellipse(ctx, cx - r * 0.3, cy - r * 0.35, r * 0.28, r * 0.18, -0.5);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
  }

  // =========================================================
  // Меню миров (эскиз 2)
  // =========================================================
  VW.screens.worlds = {
    enter() {
      this.t = 0;
      this.shake = {};
      this.fx = new VW.Particles();
      A.music('menu');
      setTimeout(() => {
        if (VW.screenName === 'worlds' && !V.speaking) V.say(D.say.worlds);
      }, 500);
    },
    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      for (const k of Object.keys(this.shake)) {
        this.shake[k] -= dt;
        if (this.shake[k] <= 0) delete this.shake[k];
      }
    },
    onKey(code) {
      if (code === 'Escape') this.back();
      if (code === 'Enter' || code === 'Space') this.open(D.worlds[0]);
    },
    back() {
      A.sfx('back');
      VW.go('character');
    },
    open(w) {
      if (w.playable) {
        A.sfx('magic');
        V.say(w.say);
        VW.go('map', { world: w.id });
      } else {
        A.sfx('locked');
        this.shake[w.id] = 0.45;
        V.say(w.say + ' ' + D.say.worldLocked);
      }
    },
    draw(ctx, W, H) {
      const t = this.t;
      G.notebook(ctx, W, H);
      starCounter(ctx);
      roundBtn(ctx, 'back', W - 52, 50, 36, '#8C7BD8', 'back', () => this.back());
      G.text(ctx, 'Миры', W / 2, 50, 50, '#5B3FB8', { weight: 900, stroke: '#fff', lw: 10 });

      const x0 = 26, x1 = W - 26, y0 = 100, y1 = H - 86;
      const gx = 16, gy = 14;
      const cw = (x1 - x0 - gx * 2) / 3, ch = (y1 - y0 - gy * 2) / 3;
      const prog = S.world('magic');
      D.worlds.forEach((w, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
        const sh = this.shake[w.id] ? Math.sin(this.shake[w.id] * 55) * 7 : 0;
        const pressed = UI.btn('w' + w.id, x, y, cw, ch, () => this.open(w));
        const oy = pressed ? 3 : 0;
        const bg = w.playable ? U.shade(w.color, 0.72) : U.shade(w.color, 0.82);
        if (w.playable) G.glow(ctx, x + cw / 2, y + ch / 2, cw * 0.75, '#FFF3A0', 0.35 + 0.15 * Math.sin(t * 3));
        G.panel(ctx, x + sh, y + oy, cw, ch, { r: 26, fill: bg, stroke: w.color, lw: w.playable ? 5 : 3, shadowY: pressed ? 2 : 6 });
        const is = Math.min(ch * 0.33, cw * 0.18);
        const icx = x + sh + 18 + is * 1.1, icy = y + oy + ch / 2;
        G.circle(ctx, icx, icy, is * 1.25);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
        I.drawWorldIcon(ctx, w.icon, icx, icy, is, t + i);
        const tx = icx + is * 1.25 + 14;
        const tw = x + sh + cw - tx - (w.playable ? 52 : 60);
        const fsz = Math.min(28, ch * 0.2);
        const lines = G.wrap(ctx, w.name, fsz, tw, 900);
        const ly = y + oy + ch / 2 - ((lines.length - 1) * fsz * 1.1) / 2 - (w.playable ? 12 : 0);
        lines.forEach((l, k) => G.text(ctx, l, tx, ly + k * fsz * 1.1, fsz, U.shade(w.color, -0.55), { align: 'left', weight: 900, maxW: tw }));
        if (w.playable) {
          // прогресс: найденные артефакты
          const n = D.scenes.length;
          for (let k = 0; k < n; k++) {
            const done = prog.done.indexOf(D.scenes[k].id) >= 0;
            const dx = tx + 12 + k * 26, dy = y + oy + ch / 2 + fsz * 0.9 + 4;
            if (done) G.starIcon(ctx, dx, dy, 11);
            else {
              G.circle(ctx, dx, dy, 7);
              ctx.fillStyle = 'rgba(120,90,200,0.25)';
              ctx.fill();
            }
          }
          G.circle(ctx, x + sh + cw - 30, y + oy + 30, 20);
          ctx.fillStyle = '#2FBF55';
          ctx.fill();
          G.icon(ctx, 'play', x + sh + cw - 29, y + oy + 30, 11, '#fff', false);
        } else {
          G.rr(ctx, x + sh, y + oy, cw, ch, 26);
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fill();
          G.lockBadge(ctx, x + sh + cw - 28, y + oy + 28, 18);
          G.text(ctx, 'скоро', x + sh + cw - 28, y + oy + 60, 15, '#6B5B95', { weight: 800 });
        }
      });

      // «Миры → 1000» — как на эскизе
      const by = H - 44;
      const p = UI.btn('more', W / 2 - 200, by - 30, 400, 60, () => {
        A.sfx('sparkle');
        V.say(D.say.moreWorlds);
        this.fx.burst('star', W / 2 + 120, by, 12, { speed: 240, size: 10, color: '#FFC928' });
      });
      const oy = p ? 2 : 0;
      G.text(ctx, 'Миры', W / 2 - 120, by + oy, 34, '#3B4A6B', { weight: 900 });
      ctx.beginPath();
      ctx.moveTo(W / 2 - 60, by + oy + 6);
      ctx.bezierCurveTo(W / 2 - 20, by + oy + 18, W / 2 + 10, by + oy - 10, W / 2 + 50, by + oy + 2);
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#3B4A6B';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W / 2 + 40, by + oy - 8);
      ctx.lineTo(W / 2 + 52, by + oy + 2);
      ctx.lineTo(W / 2 + 38, by + oy + 10);
      ctx.stroke();
      G.text(ctx, '1000', W / 2 + 118, by + oy, 38, '#FF4F9A', { weight: 900, stroke: '#fff', lw: 6 });
      G.sparkle(ctx, W / 2 + 175, by - 18, 9 + 3 * Math.sin(t * 5), '#FFC928');
      this.fx.draw(ctx);
    },
  };

  // =========================================================
  // Карта сцен мира
  // =========================================================
  const NODE_POS = [
    [0.11, 0.74],
    [0.27, 0.52],
    [0.43, 0.73],
    [0.58, 0.5],
    [0.73, 0.72],
    [0.88, 0.47],
  ];

  const MAP = (VW.screens.map = {
    enter(p) {
      p = p || {};
      this.t = 0;
      this.fx = new VW.Particles();
      this.intro = null;
      this.world = 'magic';
      A.music('menu');
      const prog = S.world(this.world);
      const next = this.nextIndex();
      this.heroNode = next;
      this.walk = null;
      if (p.justDone != null) {
        // новый артефакт появляется в кружке, герой идёт к следующей сцене
        this.heroNode = p.justDone;
        this.popNode = p.justDone;
        this.popT = 0;
        const target = Math.min(p.justDone + 1, D.scenes.length);
        this.walk = { from: p.justDone, to: target, t: -0.9, dur: 1.0, openAfter: target < D.scenes.length };
      } else {
        setTimeout(() => {
          if (VW.screen === MAP && !this.intro && !V.speaking) V.say(D.say.map);
        }, 500);
      }
      void prog;
    },
    nextIndex() {
      const prog = S.world(this.world);
      for (let i = 0; i < D.scenes.length; i++) if (prog.done.indexOf(D.scenes[i].id) < 0) return i;
      return D.scenes.length; // всё пройдено — праздник
    },
    isOpen(i) {
      const prog = S.world(this.world);
      if (i === 0) return true;
      if (i >= D.scenes.length) return D.scenes.every((s) => prog.done.indexOf(s.id) >= 0);
      return prog.done.indexOf(D.scenes[i - 1].id) >= 0 || prog.done.indexOf(D.scenes[i].id) >= 0;
    },
    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      if (this.popNode != null) {
        this.popT += dt;
        if (this.popT > 1.2) this.popNode = null;
      }
      if (this.walk) {
        this.walk.t += dt;
        if (this.walk.t >= this.walk.dur) {
          this.heroNode = this.walk.to;
          const w = this.walk;
          this.walk = null;
          if (w.openAfter) this.openIntro(w.to);
        }
      }
      if (this.intro) this.intro.t += dt;
    },
    onKey(code) {
      if (this.intro) {
        if (code === 'Escape') this.closeIntro();
        if (code === 'Enter' || code === 'Space') this.play();
        return;
      }
      if (code === 'Escape') this.back();
      if (code === 'Enter' || code === 'Space') this.tapNode(Math.min(this.nextIndex(), D.scenes.length));
    },
    back() {
      A.sfx('back');
      VW.go('worlds');
    },
    tapNode(i) {
      if (this.walk) return;
      if (!this.isOpen(i)) {
        A.sfx('locked');
        V.say(i >= D.scenes.length ? D.say.hallLocked : D.say.sceneLocked);
        return;
      }
      if (i >= D.scenes.length) {
        A.sfx('magic');
        VW.go('hall', { world: this.world });
        return;
      }
      this.openIntro(i);
    },
    openIntro(i) {
      A.sfx('tap');
      this.intro = { i: i, t: 0 };
      V.say(D.scenes[i].intro);
    },
    closeIntro() {
      this.intro = null;
      A.sfx('back');
    },
    play() {
      if (!this.intro) return;
      const sc = D.scenes[this.intro.i];
      A.sfx('magic');
      VW.go('game', { scene: sc.id });
    },
    nodePos(i, W, H) {
      const p = NODE_POS[i];
      return [p[0] * W, p[1] * H];
    },
    draw(ctx, W, H) {
      const t = this.t;
      landscape(ctx, W, H, t, true);
      const prog = S.world(this.world);

      // дорожка
      const pts = NODE_POS.map((p, i) => this.nodePos(i, W, H));
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
        ctx.bezierCurveTo(ax + (bx - ax) * 0.5, ay, ax + (bx - ax) * 0.5, by, bx, by);
      }
      ctx.lineCap = 'round';
      ctx.lineWidth = 30;
      ctx.strokeStyle = '#E9C98F';
      ctx.stroke();
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#F7E2B5';
      ctx.stroke();
      ctx.setLineDash([2, 22]);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.setLineDash([]);

      // кружки сцен
      const next = this.nextIndex();
      for (let i = 0; i <= D.scenes.length; i++) {
        const [x, y] = pts[i];
        const open = this.isOpen(i);
        const isHall = i === D.scenes.length;
        const done = !isHall && prog.done.indexOf(D.scenes[i].id) >= 0;
        const r = isHall ? 62 : 52;
        const pressed = UI.btnC('node' + i, x, y, r + 6, () => this.tapNode(i));
        const pulse = i === next && open ? 1 + 0.06 * Math.sin(t * 5) : 1;
        const rr = r * pulse * (pressed ? 0.94 : 1);
        if (i === next && open) G.glow(ctx, x, y, rr * 2, '#FFF3A0', 0.7);
        G.circle(ctx, x, y + 6, rr);
        ctx.fillStyle = 'rgba(40,20,80,0.25)';
        ctx.fill();
        G.circle(ctx, x, y, rr);
        ctx.fillStyle = !open ? '#CFC8DD' : isHall ? '#FFE3F0' : done ? '#FFF4C2' : '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = !open ? '#9A92AE' : done || isHall ? '#F2A900' : '#9B7BFF';
        ctx.stroke();
        if (isHall) {
          I.drawCake(ctx, x, y + 4, rr * 0.62, t);
          if (!open) G.lockBadge(ctx, x + rr * 0.7, y - rr * 0.7, 18);
        } else if (done) {
          let s = rr * 0.6;
          if (this.popNode === i) s *= U.easeOutElastic(Math.min(1, this.popT / 0.8));
          I.drawArtifact(ctx, D.scenes[i].artifact, x, y, s, t, { sparkles: true });
        } else if (open) {
          G.icon(ctx, 'question', x, y, rr * 0.55, '#9B7BFF', false);
        } else {
          G.icon(ctx, 'lock', x, y, rr * 0.5, '#8E86A3', false);
        }
        if (!isHall) {
          G.circle(ctx, x - rr * 0.72, y + rr * 0.72, 17);
          ctx.fillStyle = open ? '#9B7BFF' : '#9A92AE';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fff';
          ctx.stroke();
          G.text(ctx, String(i + 1), x - rr * 0.72, y + rr * 0.72 + 1, 20, '#fff', { weight: 900 });
        }
      }

      // герой на карте
      let hx, hy, walking = false, face = 1;
      if (this.walk && this.walk.t > 0) {
        const k = U.easeInOut(Math.min(1, this.walk.t / this.walk.dur));
        const [ax, ay] = pts[this.walk.from], [bx, by] = pts[this.walk.to];
        hx = U.lerp(ax, bx, k) - 20;
        hy = U.lerp(ay, by, k) + 44 - Math.sin(k * Math.PI) * 30;
        walking = true;
        face = bx >= ax ? 1 : -1;
      } else {
        const [ax, ay] = pts[Math.min(this.heroNode, pts.length - 1)];
        hx = ax - 66;
        hy = ay + 50;
      }
      const look = S.data.look;
      G.ellipse(ctx, hx, hy + 3, 26, 7);
      ctx.fillStyle = 'rgba(30,20,60,0.25)';
      ctx.fill();
      Hero.draw(ctx, hx, hy, look, { state: walking ? 'walk' : 'wave', t: t, phase: t * 12, facing: face }, 0.85);
      if (look.pet) VW.Pets.draw(ctx, look.pet, hx - 38 * face, hy - (VW.Pets.flies(look.pet) ? 60 : 0), { t: t, scale: 0.75, facing: face, moving: walking });

      // заголовок
      G.panel(ctx, W / 2 - 230, 12, 460, 70, { r: 35, fill: 'rgba(255,255,255,0.9)', stroke: '#9B7BFF', lw: 4, shadowY: 5 });
      I.drawWorldIcon(ctx, 'wand', W / 2 - 180, 47, 24, t);
      G.text(ctx, 'Волшебная школа', W / 2 + 20, 48, 34, '#5B3FB8', { weight: 900, maxW: 360 });
      starCounter(ctx);
      roundBtn(ctx, 'back', W - 52, 50, 36, '#8C7BD8', 'back', () => this.back());

      this.fx.draw(ctx);
      if (this.intro) this.drawIntro(ctx, W, H);
    },

    // Карточка задания: что нужно найти
    drawIntro(ctx, W, H) {
      const it = this.intro;
      const sc = D.scenes[it.i];
      const k = U.easeOutBack(Math.min(1, it.t / 0.35));
      UI.blocker(() => this.closeIntro());
      ctx.fillStyle = 'rgba(30,15,70,' + 0.5 * Math.min(1, it.t / 0.2) + ')';
      ctx.fillRect(0, 0, W, H);
      const pw = Math.min(660, W - 60), ph = Math.min(500, H - 60);
      const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(k, k);
      ctx.translate(-W / 2, -H / 2);
      UI.btn('introPanel', px, py, pw, ph, null);
      G.panel(ctx, px, py, pw, ph, { r: 36, fill: '#FFF8E6', stroke: '#F2A900', lw: 6, shadowY: 10 });
      // номер и название
      G.circle(ctx, px + 58, py + 58, 30);
      ctx.fillStyle = '#9B7BFF';
      ctx.fill();
      G.text(ctx, String(it.i + 1), px + 58, py + 60, 34, '#fff', { weight: 900 });
      G.text(ctx, sc.name, px + pw / 2 + 20, py + 60, 40, '#5B3FB8', { weight: 900, maxW: pw - 160 });
      // что найти
      const ax = px + pw / 2, ay = py + ph * 0.47;
      G.glow(ctx, ax, ay, 150, '#FFF1A8', 0.85);
      G.rays(ctx, ax, ay, 140, this.t * 0.4, '#FFE680', 12, 0.35);
      I.drawArtifact(ctx, sc.artifact, ax, ay + Math.sin(this.t * 3) * 5, 78, this.t, {});
      G.text(ctx, sc.artName, ax, ay + 112, 30, '#7A4A00', { weight: 900, stroke: '#fff', lw: 6 });
      // кнопки
      const by = py + ph - 68;
      roundBtn(ctx, 'introSay', ax - 150, by, 38, '#FF9A3C', 'speaker', () => V.say(sc.intro));
      G.glow(ctx, ax, by, 100, '#B6FFB0', 0.5);
      roundBtn(ctx, 'introPlay', ax, by, 54, '#2FBF55', 'play', () => this.play(), 0.62);
      roundBtn(ctx, 'introClose', px + pw - 22, py + 22, 30, '#FF6B6B', 'close', () => this.closeIntro(), 0.5);
      ctx.restore();
    },
  });
})(window.VW);
