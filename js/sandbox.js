/* Vasilisa World — «Создай свой мир»: песочница.
   Строить: выбираешь деталь внизу и нажимаешь (или ведёшь пальцем) по экрану.
   Нажала на такую же деталь — она убирается. Играть: герой ходит по постройкам,
   лезет по лестницам до облаков и в космос, собирает звёзды и ловит зверушек. */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, UI = VW.UI, S = VW.Store, A = VW.Audio, V = VW.Voice, Hero = VW.Hero;
  const SB = VW.SandboxArt;
  const TAU = Math.PI * 2;
  const C = SB.C;

  // ---------- мир ----------
  const GW = 48; // клеток в ширину
  const GROW = 52; // строка земли
  const GY = GROW * C; // верх земли
  const WW = GW * C;
  const WH = GY + 200;
  const TOP_ROW = 2; // выше строить нельзя
  const CLOUD_Y0 = GY - 1700, CLOUD_Y1 = GY - 1000; // полоса облаков
  const SPACE_Y = GY - 2100; // выше — космос

  // ---------- физика (как в игре) ----------
  const GRAV = 2500, MAX_FALL = 1300, SPEED = 340, ACCEL = 3200, AIR_ACCEL = 2400, JUMP_V = 1010;
  const CLIMB = 300, STEP = 64, COYOTE = 0.13, JUMP_BUF = 0.17, FOOT = 14, LADDER_GRAB = 52, CORNER = 16;
  const MAX_CARRY = 3;
  const WILD = 4; // сколько зверушек гуляет

  const key = (x, y) => y * GW + x;
  const ITEM = { furn: 1, nature: 1, food: 1 }; // вещи, которые ставятся перед стеной
  const solidCell = (c) => !!c && (!!SB.solid[c.t] || !!(c.bg && SB.solid[c.bg.t]));
  const houseCell = (c) => !!c && (!!SB.houseLike[c.t] || !!(c.bg && SB.houseLike[c.bg.t]));

  // Дальние облака для облачной страны
  const FAR = VW.Scenery.FAR;
  if (!FAR.cloudsFar) {
    FAR.cloudsFar = function (ctx, cam, SW, SH, up, t, o) {
      const y0 = SH - o.base + up * o.f;
      if (y0 - 120 > SH) return;
      for (let k = 0; k < 6; k++) {
        const x = ((k * 260 - cam.x * o.f) % (SW + 300) + SW + 300) % (SW + 300) - 150;
        G.cloud(ctx, x, y0 - 60 - (k % 2) * 40, 240, 80, o.color, 'rgba(180,160,255,0.25)');
      }
    };
  }

  // Облака-площадки и звёзды наверху (одинаковые при каждом заходе)
  function makeSky() {
    const r = U.rng(20240917);
    const clouds = [];
    let x = 300 + r() * 200, y = CLOUD_Y1 - 40, dir = 1;
    // цепочка по полосе облаков
    for (let k = 0; k < 14; k++) {
      const w = (3 + Math.floor(r() * 3)) * C;
      clouds.push({ x: Math.round(x), top: Math.round(y), w: w, sky: true });
      x += dir * (w + 110 + r() * 110);
      y = U.clamp(y + (r() - 0.55) * 160, CLOUD_Y0 + 60, CLOUD_Y1 - 20);
      if (x > WW - 400) {
        dir = -1;
        x = WW - 400;
      }
      if (x < 120) {
        dir = 1;
        x = 120;
      }
    }
    // облачная лесенка вверх — к космосу
    let sx = WW * 0.5, sy = CLOUD_Y0 + 40;
    for (let k = 0; k < 6; k++) {
      sy -= 150 + r() * 30;
      sx += (k % 2 ? 1 : -1) * (180 + r() * 60);
      clouds.push({ x: Math.round(sx), top: Math.round(sy), w: 4 * C, sky: true, stair: true });
    }
    // «планетки» в космосе
    const planets = [];
    for (let k = 0; k < 10; k++) {
      planets.push({ x: Math.round(160 + r() * (WW - 420)), top: Math.round(SPACE_Y - 150 - r() * (SPACE_Y - 420)), w: (2 + Math.floor(r() * 2)) * C, planet: true, c: ['#FF9EC8', '#8FD3FF', '#FFD54F', '#B983FF', '#7CD35A'][k % 5] });
    }
    // звёзды: над облаками и в космосе
    const stars = [];
    for (const c of clouds) if (r() < 0.45) stars.push({ x: c.x + c.w / 2, y: c.top - 70 });
    for (const p of planets) stars.push({ x: p.x + p.w / 2, y: p.top - 80 });
    for (let k = 0; k < 8; k++) stars.push({ x: 200 + r() * (WW - 400), y: 300 + r() * (SPACE_Y - 400) });
    return { clouds: clouds, planets: planets, stars: stars };
  }
  const SKY = makeSky();

  const SBX = (VW.screens.sandbox = {
    subtitlePos: 'top',

    enter() {
      this.t = 0;
      if (!S.data.sandbox || typeof S.data.sandbox !== 'object') S.data.sandbox = S.defaults().sandbox;
      this.data = S.data.sandbox;
      this.load();
      if (!this.data.seen && !this.cells.size) this.starterHouse();
      this.mode = 'build';
      this.tool = this.tool || 'wall';
      this.variants = this.variants || { wall: 0, window: 0, door: 0, roof: 0, furn: 0, nature: 0, food: null };
      this.cam = { x: WW / 2 - VW.W / 2, y: GY - VW.H + 250 };
      this.clampCam();
      this.fx = new VW.Particles();
      this.hud = new VW.Particles();
      this.flying = [];
      this.overlay = null;
      this.kitchen = { bowl: [], phase: 'pick', t: 0, dish: null, recipes: false };
      this.strokes = new Map();
      this.P = null;
      this.pet = null;
      this.stars = SKY.stars.map((s) => ({ x: s.x, y: s.y, taken: false, spin: Math.random() * TAU }));
      this.visited = {};
      this.wild = [];
      for (let k = 0; k < WILD; k++) this.spawnAnimal(k, true);
      this.spawnT = 0;
      this.dirty = true;
      A.music('nature', { transpose: 2 });
      setTimeout(() => {
        if (VW.screen !== SBX || V.speaking) return;
        V.say(this.data.seen ? 'Твой мир! Строим дальше?' : 'Создай свой мир! Выбери деталь внизу и нажимай, где строить.');
        this.data.seen = true;
        S.saveSoon();
      }, 400);
    },

    exit() {
      this.saveData();
      S.save();
    },

    // ---------- сохранение ----------
    load() {
      const d = this.data;
      this.terrain = SB.terrainById[d.terrain] || SB.terrains[0];
      this.cells = new Map();
      if (Array.isArray(d.cells)) {
        for (const c of d.cells) {
          if (!Array.isArray(c) || c.length < 3) continue;
          const [x, y, t, v, bt, bv] = c;
          if (!(x >= 0 && x < GW && y >= TOP_ROW && y < GROW) || !SB.toolById[t] || t === 'erase') continue;
          const cell = { x: x, y: y, t: t, v: v == null ? 0 : v };
          if (bt && SB.houseLike[bt]) cell.bg = { t: bt, v: bv || 0 };
          this.cells.set(key(x, y), cell);
        }
      }
      this.homes = Array.isArray(d.homes) ? d.homes.filter((h) => h && SB.animalByK[h.k]) : [];
      this.carry = Array.isArray(d.carry) ? d.carry.filter((k) => SB.animalByK[k]).slice(0, MAX_CARRY) : [];
      if (!d.dishes || typeof d.dishes !== 'object') d.dishes = {};
    },
    // Домик-пример при первом входе: видно, как собирать дом из деталей (его можно убрать стёркой)
    starterHouse() {
      const x0 = 18, y1 = GROW - 1;
      for (let x = x0; x < x0 + 4; x++) for (let y = y1 - 1; y <= y1; y++) this.cells.set(key(x, y), { x: x, y: y, t: 'wall', v: 0 });
      this.cells.set(key(x0 + 1, y1), { x: x0 + 1, y: y1, t: 'door', v: 0 });
      this.cells.set(key(x0 + 2, y1 - 1), { x: x0 + 2, y: y1 - 1, t: 'window', v: 1 });
      this.cells.set(key(x0 + 3, y1), { x: x0 + 3, y: y1, t: 'furn', v: 0, bg: { t: 'wall', v: 0 } });
      for (let x = x0 - 1; x < x0 + 5; x++) this.cells.set(key(x, y1 - 2), { x: x, y: y1 - 2, t: 'roof', v: 0 });
      for (let x = x0; x < x0 + 4; x++) this.cells.set(key(x, y1 - 3), { x: x, y: y1 - 3, t: 'roof', v: 0 });
      this.cells.set(key(x0 + 6, y1), { x: x0 + 6, y: y1, t: 'nature', v: 2 });
      this.dirty = true;
      this.saveData();
    },
    saveData() {
      const d = this.data;
      d.terrain = this.terrain.id;
      d.cells = Array.from(this.cells.values()).map((c) => (c.bg ? [c.x, c.y, c.t, c.v, c.bg.t, c.bg.v] : [c.x, c.y, c.t, c.v]));
      d.homes = this.homes.map((h) => ({ k: h.k, door: h.door }));
      d.carry = this.carry.slice();
      S.saveSoon();
    },

    // ---------- клетки ----------
    cell(x, y) {
      return this.cells.get(key(x, y)) || null;
    },
    nb(x, y) {
      return { l: this.cell(x - 1, y), r: this.cell(x + 1, y), u: this.cell(x, y - 1), d: this.cell(x, y + 1) };
    },
    place(x, y, t, v) {
      if (x < 0 || x >= GW || y < TOP_ROW || y >= GROW) return false;
      const old = this.cell(x, y);
      if (old && old.t === t && old.v === v) return false;
      const cell = { x: x, y: y, t: t, v: v };
      // мебель, еду и цветы ставим «в дом»: стена остаётся позади
      if (ITEM[t] && old) {
        if (SB.houseLike[old.t] && old.t !== 'door') cell.bg = { t: old.t, v: old.v };
        else if (old.bg) cell.bg = old.bg;
      }
      this.cells.set(key(x, y), cell);
      this.dirty = true;
      this.sndT = this.sndT || 0;
      if (this.t - this.sndT > 0.07) {
        this.sndT = this.t;
        A.sfx(t === 'ladder' ? 'climb' : 'select');
      }
      this.fx.burst('spark', x * C + C / 2, y * C + C / 2, 5, { speed: 140, size: 7, color: '#FFF3A0', life: 0.4 });
      return true;
    },
    erase(x, y) {
      const old = this.cell(x, y);
      if (!old) return false;
      if (old.bg) this.cells.set(key(x, y), { x: x, y: y, t: old.bg.t, v: old.bg.v });
      else this.cells.delete(key(x, y));
      this.dirty = true;
      this.sndT = this.sndT || 0;
      if (this.t - this.sndT > 0.07) {
        this.sndT = this.t;
        A.sfx('back');
      }
      this.fx.burst('dust', x * C + C / 2, y * C + C / 2, 6, { speed: 150, size: 9, color: '#ffffff', life: 0.45, g: -30 });
      // дверь убрали — зверушки выходят гулять
      if (old.t === 'door') {
        const k = key(x, y);
        const out = this.homes.filter((h) => h.door === k);
        this.homes = this.homes.filter((h) => h.door !== k);
        for (const h of out) this.wild.push(this.makeAnimal(h.k, x * C + C / 2));
      }
      return true;
    },

    // Площадки и лестницы для героя (пересчитываются, когда что-то построили)
    rebuild() {
      this.dirty = false;
      const plats = [{ x: 0, top: GY, w: WW, ground: true }];
      for (let y = TOP_ROW; y < GROW; y++) {
        let run = -1;
        for (let x = 0; x <= GW; x++) {
          const c = x < GW ? this.cell(x, y) : null;
          const above = x < GW ? this.cell(x, y - 1) : null;
          const top = solidCell(c) && !solidCell(above);
          if (top && run < 0) run = x;
          if (!top && run >= 0) {
            plats.push({ x: run * C, top: y * C, w: (x - run) * C });
            run = -1;
          }
        }
      }
      for (const c of SKY.clouds) plats.push(c);
      for (const p of SKY.planets) plats.push(p);
      const ladders = [];
      for (let x = 0; x < GW; x++) {
        let y0 = -1;
        for (let y = TOP_ROW; y <= GROW; y++) {
          const c = y < GROW ? this.cell(x, y) : null;
          const lad = c && c.t === 'ladder';
          if (lad && y0 < 0) y0 = y;
          if (!lad && y0 >= 0) {
            const l = { x: x * C + C / 2, top: y0 * C, bottom: y * C };
            ladders.push(l);
            // опора наверху лестницы
            if (!plats.some((p) => Math.abs(p.top - l.top) < 3 && p.x < l.x + 10 && p.x + p.w > l.x - 10)) plats.push({ x: l.x - 36, top: l.top, w: 72, ladderTop: true });
            y0 = -1;
          }
        }
      }
      this.plats = plats;
      this.ladders = ladders;
      // окна каждого дома — для зверушек, которые там живут
      this.houseWindows = new Map();
    },
    windowsOf(doorKey) {
      if (this.houseWindows.has(doorKey)) return this.houseWindows.get(doorKey);
      const start = this.cells.get(doorKey);
      const wins = [];
      if (start) {
        const seen = new Set([doorKey]);
        const queue = [start];
        while (queue.length && seen.size < 90) {
          const c = queue.shift();
          if (c.t === 'window') wins.push(c);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const n = this.cell(c.x + dx, c.y + dy);
            const k = key(c.x + dx, c.y + dy);
            if (houseCell(n) && !seen.has(k)) {
              seen.add(k);
              queue.push(n);
            }
          }
        }
      }
      this.houseWindows.set(doorKey, wins);
      return wins;
    },

    // ---------- зверушки ----------
    makeAnimal(k, x) {
      return { k: k, x: x, y: GY, dir: Math.random() < 0.5 ? -1 : 1, v: 40 + Math.random() * 40, st: 'walk', timer: 1 + Math.random() * 3, t: Math.random() * 10, hop: 0 };
    },
    spawnAnimal(i, initial) {
      const kinds = SB.animals.map((a) => a.k);
      const k = initial ? kinds[i % kinds.length] : U.pick(kinds);
      const x = initial ? 300 + (i + 0.5) * ((WW - 600) / WILD) : Math.random() < 0.5 ? 60 : WW - 60;
      this.wild.push(this.makeAnimal(k, x));
    },
    updateAnimals(dt) {
      for (const a of this.wild) {
        a.t += dt;
        a.timer -= dt;
        if (a.hop > 0) a.hop = Math.max(0, a.hop - dt);
        if (a.timer <= 0) {
          a.st = Math.random() < 0.3 ? 'idle' : 'walk';
          if (Math.random() < 0.4) a.dir = -a.dir;
          a.timer = 1.5 + Math.random() * 3;
        }
        if (a.st === 'walk') {
          a.x += a.dir * a.v * dt;
          if (a.x < 40) {
            a.x = 40;
            a.dir = 1;
          }
          if (a.x > WW - 40) {
            a.x = WW - 40;
            a.dir = -1;
          }
        }
      }
      if (this.wild.length < WILD) {
        this.spawnT += dt;
        if (this.spawnT > 8) {
          this.spawnT = 0;
          this.spawnAnimal(0, false);
        }
      }
    },
    catchAnimal(a) {
      if (this.carry.length >= MAX_CARRY) {
        V.say('Руки заняты! Сначала отведи зверушек в домик.');
        A.sfx('locked');
        return;
      }
      this.wild.splice(this.wild.indexOf(a), 1);
      this.carry.push(a.k);
      const info = SB.animalByK[a.k];
      A.sfx(info.sfx);
      this.fx.burst('heart', a.x, a.y - 40, 10, { speed: 180, size: 13, color: '#FF6FA8', life: 1.1, g: -60 });
      const hasDoor = Array.from(this.cells.values()).some((c) => c.t === 'door');
      V.say('Поймала ' + info.acc + '! ' + (hasDoor ? (this.mode === 'play' ? 'Отведи к двери домика!' : 'Нажми на дверь домика — там будет жить.') : 'Построй домик с дверью!'));
      this.saveData();
    },
    settle(doorCell) {
      if (!this.carry.length) return false;
      const k = this.carry.shift();
      const info = SB.animalByK[k];
      this.homes.push({ k: k, door: key(doorCell.x, doorCell.y) });
      A.sfx('found');
      const cx = doorCell.x * C + C / 2, cy = doorCell.y * C + C / 2;
      this.fx.burst('confetti', cx, cy - 20, 40, { speed: 420, g: 500, life: 1.4 });
      this.fx.burst('heart', cx, cy, 8, { speed: 160, size: 13, color: '#FF6FA8', life: 1, g: -60 });
      V.say(info.name + (info.k === 'capy' || info.k === 'turtle' ? ' теперь живёт в домике!' : ' теперь живёт в домике!'));
      this.saveData();
      return true;
    },

    // ---------- режимы ----------
    setMode(m) {
      if (m === this.mode) return;
      this.mode = m;
      this.strokes.clear();
      UI.releaseAll();
      A.sfx('magic');
      if (m === 'play') {
        if (this.dirty) this.rebuild();
        const x = U.clamp(this.cam.x + VW.W / 2, 60, WW - 60);
        const y0 = this.cam.y + VW.H * 0.45;
        let top = GY;
        for (const p of this.plats) if (p.top >= y0 && p.top < top && x > p.x && x < p.x + p.w) top = p.top;
        this.P = { x: x, y: top, vx: 0, vy: 0, facing: 1, onGround: true, ground: null, ladder: null, coyote: 0, jumpBuf: 0, phase: 0, squash: 0, visOff: 0, sideHold: 0, climbSnd: 0 };
        this.pet = { x: x - 60, y: top, facing: 1, moving: false, trail: [] };
        this.follow = [];
        V.say('Играем! Построй лестницу до облаков и собирай звёзды в космосе!');
      } else {
        this.P = null;
        V.say('Строим!');
      }
    },
    selectTool(id) {
      if (this.tool === id) return;
      this.tool = id;
      A.sfx('tap');
      const t = SB.toolById[id];
      if (id === 'food' && !Object.keys(this.data.dishes).length) V.say('Сначала приготовь что-нибудь на кухне!');
      else V.say(t.name + '!');
    },

    // ---------- обновление ----------
    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      this.hud.update(dt);
      for (const f of this.flying) f.t += dt;
      const n0 = this.flying.length;
      this.flying = this.flying.filter((f) => f.t < 0.55);
      if (this.flying.length < n0) VW.starPulse = 0.6;
      if (this.dirty) this.rebuild();
      this.updateAnimals(dt);
      for (const s of this.stars) s.spin += dt * 5;
      if (this.overlay === 'kitchen') this.updateKitchen(dt);
      if (this.overlay) return;
      if (this.mode === 'build') this.updateBuild(dt);
      else this.updatePlay(dt);
    },

    updateBuild(dt) {
      const W = VW.W, H = VW.H;
      // стрелки прокрутки
      const sp = 700 * dt;
      if (UI.isPressed('scrL')) this.cam.x -= sp;
      if (UI.isPressed('scrR')) this.cam.x += sp;
      if (UI.isPressed('scrU')) this.cam.y -= sp;
      if (UI.isPressed('scrD')) this.cam.y += sp;
      // рисуем пальцем
      for (const [pid, p] of UI.pointers) {
        if (p.btn !== 'world') continue;
        let st = this.strokes.get(pid);
        if (!st) {
          st = { mode: null, last: -1 };
          this.strokes.set(pid, st);
        }
        if (st.mode === 'done') continue;
        // тянешь палец к краю экрана — мир едет сам (можно «дорисовать» лестницу до неба)
        if (Math.hypot(p.x - p.sx, p.y - p.sy) > 24) {
          if (p.y < 150) this.cam.y -= 420 * dt;
          else if (p.y > H - 210) this.cam.y += 420 * dt;
          if (p.x < 80) this.cam.x -= 420 * dt;
          else if (p.x > W - 80) this.cam.x += 420 * dt;
          this.clampCam();
        }
        const wx = p.x + this.cam.x, wy = p.y + this.cam.y;
        const cx = Math.floor(wx / C), cy = Math.floor(wy / C);
        const k = key(cx, cy);
        if (st.mode === null) {
          // первое касание: зверушка? дверь? деталь?
          const a = this.animalAt(wx, wy);
          if (a) {
            this.catchAnimal(a);
            st.mode = 'done';
            continue;
          }
          const c0 = this.cell(cx, cy);
          if (c0 && c0.t === 'door' && this.carry.length) {
            this.settle(c0);
            st.mode = 'done';
            continue;
          }
          const hm = this.homeAt(wx, wy);
          if (hm) {
            A.sfx(SB.animalByK[hm.k].sfx);
            this.fx.burst('heart', wx, wy, 6, { speed: 150, size: 12, color: '#FF6FA8', life: 0.9, g: -60 });
            st.mode = 'done';
            continue;
          }
          const v = this.curVariant();
          if (this.tool === 'food' && v == null) {
            this.openKitchen();
            st.mode = 'done';
            continue;
          }
          st.mode = this.tool === 'erase' || (c0 && c0.t === this.tool && c0.v === v) ? 'erase' : 'place';
        }
        if (k === st.last) continue;
        st.last = k;
        if (cy >= GROW || cy < TOP_ROW || cx < 0 || cx >= GW) continue;
        if (st.mode === 'erase') this.erase(cx, cy);
        else this.place(cx, cy, this.tool, this.curVariant());
        if (st.mode === 'place' || st.mode === 'erase') this.saveData();
      }
      for (const pid of Array.from(this.strokes.keys())) if (!UI.pointers.has(pid)) this.strokes.delete(pid);
      this.clampCam();
    },
    curVariant() {
      const id = this.tool;
      if (id === 'food') {
        const v = this.variants.food;
        if (v && this.data.dishes[v]) return v;
        const any = Object.keys(this.data.dishes)[0];
        this.variants.food = any || null;
        return any || null;
      }
      return this.variants[id] || 0;
    },
    animalAt(wx, wy) {
      for (const a of this.wild) if (Math.abs(a.x - wx) < 55 && wy > a.y - 90 && wy < a.y + 20) return a;
      return null;
    },
    homeAt(wx, wy) {
      for (const h of this.homes) if (h._pos && Math.abs(h._pos[0] - wx) < 36 && Math.abs(h._pos[1] - 20 - wy) < 40) return h;
      return null;
    },
    clampCam() {
      const W = VW.W, H = VW.H;
      this.cam.x = U.clamp(this.cam.x, 0, Math.max(0, WW - W));
      this.cam.y = U.clamp(this.cam.y, 0, Math.max(0, WH - H));
    },

    // ---------- игра: герой ----------
    input() {
      const k = UI.key;
      const tk = (id) => UI.held(id);
      return {
        left: tk('left') || k('ArrowLeft') || k('KeyA'),
        right: tk('right') || k('ArrowRight') || k('KeyD'),
        up: tk('up') || k('ArrowUp') || k('KeyW'),
        down: tk('down') || k('ArrowDown') || k('KeyS'),
        jumpEdge: UI.edge('jump') || UI.keyEdge('Space'),
        upEdge: UI.edge('up') || UI.keyEdge('ArrowUp') || UI.keyEdge('KeyW'),
      };
    },
    grav() {
      if (this.terrain.lowGrav) return GRAV * 0.55;
      return this.P.y < SPACE_Y ? GRAV * 0.55 : GRAV;
    },
    overlapX(x, p, half) {
      const h = half == null ? FOOT : half;
      return x + h > p.x && x - h < p.x + p.w;
    },
    ladderFor(dir) {
      const P = this.P;
      let best = null, bd = 1e9;
      for (const l of this.ladders) {
        const d = Math.abs(P.x - l.x);
        if (d >= LADDER_GRAB || P.y < l.top - 6 || P.y > l.bottom + 6) continue;
        if (dir < 0 && !(P.y > l.top + 4)) continue;
        if (dir > 0 && !(P.y < l.bottom - 6)) continue;
        if (d < bd) {
          best = l;
          bd = d;
        }
      }
      return best;
    },
    updatePlay(dt) {
      const inp = this.input();
      const n = Math.max(1, Math.ceil(dt / (1 / 120)));
      for (let i = 0; i < n; i++) this.stepHero(dt / n, inp, i === 0);
      const P = this.P;
      P.visOff *= Math.exp(-dt * 22);
      P.squash *= Math.exp(-dt * 10);
      if (P.ladder) P.anim = 'climb';
      else if (P.onGround) {
        if (Math.abs(P.vx) > 25) {
          P.anim = 'walk';
          const prev = P.phase;
          P.phase += dt * Math.abs(P.vx) * 0.042;
          if (Math.floor(prev / Math.PI) !== Math.floor(P.phase / Math.PI)) A.sfx('step');
        } else P.anim = 'idle';
      } else P.anim = P.vy < 0 ? 'jump' : 'fall';
      // звёзды
      const cx = P.x, cy = P.y - 48;
      for (const s of this.stars) {
        if (s.taken) continue;
        if (Math.abs(s.x - cx) < 46 && Math.abs(s.y - cy) < 62) {
          s.taken = true;
          S.addStars(1);
          A.sfx('coin', Math.floor(Math.random() * 6));
          this.fx.burst('spark', s.x, s.y, 8, { speed: 200, size: 9, color: '#FFF3A0', life: 0.5 });
          this.flying.push({ x: s.x - this.cam.x, y: s.y - this.cam.y, t: 0 });
        }
      }
      // зверушки: подойти — поймать
      for (const a of this.wild.slice()) if (Math.abs(a.x - P.x) < 44 && Math.abs(a.y - P.y) < 60) this.catchAnimal(a);
      // дверь рядом — отдаём зверушку
      if (this.carry.length) {
        const c = this.cell(Math.floor(P.x / C), Math.floor((P.y - 20) / C));
        if (c && c.t === 'door') this.settle(c);
      }
      // первый раз на облаках и в космосе
      if (!this.visited.clouds && P.y < CLOUD_Y1 && P.onGround) {
        this.visited.clouds = true;
        V.say('Ты на облаках!');
        A.sfx('sparkle');
      }
      if (!this.visited.space && P.y < SPACE_Y) {
        this.visited.space = true;
        V.say('Ты в космосе! Здесь прыгаешь высоко-высоко. Собирай звёзды!');
        A.sfx('magic');
      }
      this.updatePet(dt);
      // камера за героем
      const tx = P.x - VW.W / 2 + P.facing * 70, ty = P.y - VW.H * 0.6;
      this.cam.x += (tx - this.cam.x) * Math.min(1, dt * 5);
      this.cam.y += (ty - this.cam.y) * Math.min(1, dt * 5);
      this.clampCam();
    },
    stepHero(dt, inp, first) {
      const P = this.P;
      if (first && inp.jumpEdge) P.jumpBuf = JUMP_BUF;
      if (P.ladder) {
        this.stepLadder(dt, inp, first);
        return;
      }
      const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      P.vx = U.approach(P.vx, dir * SPEED, (P.onGround ? ACCEL : AIR_ACCEL) * dt);
      if (dir) P.facing = dir;
      const ladUp = this.ladderFor(-1);
      if (inp.up && ladUp) {
        this.grab(ladUp);
        return;
      }
      const ladDn = P.onGround ? this.ladderFor(1) : null;
      if (inp.down && ladDn) {
        this.grab(ladDn);
        P.y += 3;
        return;
      }
      if (first && inp.upEdge && !ladUp) P.jumpBuf = JUMP_BUF;
      if (P.onGround) P.coyote = COYOTE;
      else P.coyote -= dt;
      P.jumpBuf -= dt;
      if (P.jumpBuf > 0 && P.coyote > 0) {
        P.vy = -JUMP_V;
        P.onGround = false;
        P.ground = null;
        P.coyote = 0;
        P.jumpBuf = 0;
        P.squash = -0.14;
        A.sfx('jump');
      }
      P.vy = Math.min(P.vy + this.grav() * dt, MAX_FALL);
      const prevX = P.x;
      P.x = U.clamp(P.x + P.vx * dt, 20, WW - 20);
      // шаг на ступеньку (одна клетка — сама)
      if (P.onGround && Math.abs(P.vx) > 1) {
        for (const p of this.plats) {
          if (p === P.ground) continue;
          const rise = P.y - p.top;
          if (rise > 0.5 && rise <= STEP && this.overlapX(P.x, p, FOOT + 2)) {
            P.visOff += rise;
            P.y = p.top;
            P.ground = p;
          }
        }
      }
      const wasGround = P.onGround;
      const prevY = P.y;
      let ny = P.y + P.vy * dt;
      let landed = null;
      if (P.vy >= 0) {
        for (const p of this.plats) {
          if (prevY <= p.top + 1.5 && ny >= p.top && this.overlapX(P.x, p)) {
            if (!landed || p.top < landed.top) landed = p;
          } else if (ny >= p.top && ny - p.top <= CORNER && this.overlapX(P.x, p) && !this.overlapX(prevX, p)) {
            if (!landed || p.top < landed.top) landed = p;
          }
        }
      }
      P.onGround = false;
      if (landed) {
        const impact = P.vy;
        ny = landed.top;
        P.vy = 0;
        P.onGround = true;
        P.ground = landed;
        if (!wasGround && impact > 350) {
          P.squash = Math.min(0.28, impact / 3500);
          A.sfx('land');
          if (landed.sky) this.fx.burst('dust', P.x, landed.top, 6, { speed: 110, size: 9, color: '#ffffff', life: 0.5, g: -30 });
        }
      } else P.ground = null;
      P.y = ny;
      if (P.y > WH + 100) {
        P.x = WW / 2;
        P.y = GY;
        P.vx = P.vy = 0;
      }
    },
    grab(l) {
      const P = this.P;
      P.ladder = l;
      P.vx = 0;
      P.vy = 0;
      P.onGround = false;
      P.ground = null;
      P.sideHold = 0;
      P.jumpBuf = 0;
    },
    stepLadder(dt, inp, first) {
      const P = this.P, lad = P.ladder;
      P.x = U.approach(P.x, lad.x, 700 * dt);
      const v = (inp.up ? -CLIMB : 0) + (inp.down ? CLIMB : 0);
      P.y += v * dt;
      if (v !== 0) {
        P.phase += dt * 10;
        P.climbSnd -= dt;
        if (P.climbSnd <= 0) {
          P.climbSnd = 0.2;
          A.sfx('climb');
        }
      }
      const land = (y) => {
        P.y = y;
        P.ladder = null;
        P.vy = 0;
        P.onGround = true;
        P.ground = this.plats.find((p) => Math.abs(p.top - y) < 4 && this.overlapX(P.x, p)) || null;
        if (!P.ground) P.onGround = false;
      };
      if (P.y <= lad.top) return land(lad.top);
      if (P.y >= lad.bottom) return land(lad.bottom);
      if (first && P.jumpBuf > 0) {
        P.ladder = null;
        P.jumpBuf = 0;
        const d = inp.left ? -1 : inp.right ? 1 : 0;
        P.vy = -JUMP_V * 0.72;
        P.vx = d * SPEED * 0.8;
        if (d) P.facing = d;
        A.sfx('jump');
        return;
      }
      if (inp.left || inp.right) {
        const d = inp.right ? 1 : -1;
        P.facing = d;
        let best = null;
        for (const p of this.plats) {
          const dy = p.top - P.y;
          if (dy >= -STEP && dy <= STEP && this.overlapX(P.x + d * 30, p)) if (!best || Math.abs(dy) < Math.abs(best.top - P.y)) best = p;
        }
        if (best) {
          P.ladder = null;
          P.visOff += P.y - best.top;
          P.y = best.top;
          P.x += d * 10;
          P.onGround = true;
          P.ground = best;
          return;
        }
        P.sideHold += dt;
        if (P.sideHold > 0.35) {
          P.ladder = null;
          P.vx = d * SPEED * 0.5;
          P.vy = 0;
        }
      } else P.sideHold = 0;
    },
    updatePet(dt) {
      const P = this.P, pet = this.pet;
      const tr = pet.trail;
      const last = tr[tr.length - 1];
      if (!last || Math.hypot(last.x - P.x, last.y - P.y) > 4) tr.push({ x: P.x, y: P.y });
      if (tr.length > 160) tr.shift();
      // питомец и пойманные зверушки идут следом по «следу»
      const at = (dist) => {
        let d = 0, prev = { x: P.x, y: P.y };
        for (let i = tr.length - 1; i >= 0; i--) {
          const q = tr[i];
          d += Math.hypot(q.x - prev.x, q.y - prev.y);
          prev = q;
          if (d >= dist) return q;
        }
        return tr[0] || { x: P.x, y: P.y };
      };
      const look = S.data.look;
      if (look.pet) {
        const q = at(70);
        const ty = q.y - (VW.Pets.flies(look.pet) ? 75 : 0);
        const ox = pet.x;
        pet.x += (q.x - pet.x) * Math.min(1, dt * 7);
        pet.y += (ty - pet.y) * Math.min(1, dt * 9);
        pet.moving = Math.abs(pet.x - ox) > 0.4;
        if (Math.abs(pet.x - ox) > 0.2) pet.facing = pet.x > ox ? 1 : -1;
      }
      this.follow = this.carry.map((k, i) => {
        const q = at(70 * (i + (look.pet ? 2 : 1)));
        return { k: k, x: q.x, y: q.y };
      });
    },

    // ---------- кухня ----------
    openKitchen() {
      this.overlay = 'kitchen';
      this.kitchen = { bowl: [], phase: 'pick', t: 0, dish: null, recipes: false };
      A.sfx('tap');
      V.say('Кухня! Выбери продукты и нажми «Готовить».');
    },
    addIng(id) {
      const k = this.kitchen;
      if (k.phase !== 'pick') return;
      if (k.bowl.length >= 3) {
        A.sfx('locked');
        V.say('В миске только три продукта!');
        return;
      }
      k.bowl.push(id);
      A.sfx('bubble');
      V.say(SB.ingById[id].name);
    },
    cookNow() {
      const k = this.kitchen;
      if (k.phase !== 'pick') return;
      if (!k.bowl.length) {
        V.say('Сначала положи продукты в миску!');
        A.sfx('locked');
        return;
      }
      k.phase = 'cook';
      k.t = 0;
      k.dish = SB.cook(k.bowl);
      A.sfx('magic');
    },
    updateKitchen(dt) {
      const k = this.kitchen;
      k.t += dt;
      if (k.phase === 'cook' && k.t > 1.4) {
        k.phase = 'done';
        k.t = 0;
        const d = this.data.dishes;
        d[k.dish.id] = (d[k.dish.id] || 0) + 1;
        this.variants.food = k.dish.id;
        S.saveSoon();
        A.sfx('found');
        this.hud.burst('confetti', VW.W / 2 + 180, VW.H * 0.45, 50, { speed: 520, g: 520, life: 1.6 });
        V.say('Получилось: ' + k.dish.name + '!');
      }
    },

    // ---------- рисование ----------
    draw(ctx, W, H) {
      const t = this.t, cam = this.cam;
      const tr = this.terrain;
      this.paintSky(ctx, W, H, t);
      const v = { x0: cam.x - 80, y0: cam.y - 120, x1: cam.x + W + 80, y1: cam.y + H + 80 };
      VW.Art.view = v;
      // касания по миру (рисование) — самая «нижняя» кнопка
      if (this.mode === 'build' && !this.overlay) UI.btn('world', 0, 0, W, H, null, { pad: 0 });
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      if (v.y1 > GY - 400) SB.drawBackDeco(ctx, tr, v.x0, v.x1, GY, t);
      // облака и планетки наверху
      for (const c of SKY.clouds) {
        if (c.x > v.x1 || c.x + c.w < v.x0 || c.top > v.y1 || c.top < v.y0 - 80) continue;
        G.cloud(ctx, c.x - 14, c.top - 6, c.w + 28, 56, tr.space ? '#E6E0FF' : '#FFFFFF', 'rgba(110,160,220,0.4)');
      }
      for (const p of SKY.planets) {
        if (p.x > v.x1 || p.x + p.w < v.x0 || p.top > v.y1 || p.top < v.y0 - 80) continue;
        G.rr(ctx, p.x, p.top - 4, p.w, 30, 15);
        Art_fs(ctx, p.c, U.shade(p.c, -0.4), 3);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(p.x + 12, p.top, p.w - 24, 5);
      }
      // постройки
      const x0 = Math.max(0, Math.floor(v.x0 / C)), x1 = Math.min(GW - 1, Math.floor(v.x1 / C));
      const y0 = Math.max(TOP_ROW, Math.floor(v.y0 / C)), y1 = Math.min(GROW - 1, Math.floor(v.y1 / C) + 1);
      const night = !!tr.space;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const c = this.cell(x, y);
          if (!c) continue;
          const n = this.nb(x, y);
          if (c.bg) SB.drawPart(ctx, c.bg, x * C, y * C, n, t, night);
          SB.drawPart(ctx, c, x * C, y * C, n, t, night);
        }
      }
      // зверушки в домиках
      this.drawHomes(ctx, t);
      // земля
      if (v.y1 > GY - 20) SB.drawGround(ctx, tr, Math.max(0, v.x0), Math.min(WW, v.x1), GY, WH - GY + 40);
      // сетка-подсказка в режиме стройки
      if (this.mode === 'build') this.drawGrid(ctx, v);
      // звёзды
      for (const s of this.stars) {
        if (s.taken || s.x < v.x0 || s.x > v.x1 || s.y < v.y0 || s.y > v.y1) continue;
        G.glow(ctx, s.x, s.y, 40, '#FFF3A0', 0.5);
        G.starIcon(ctx, s.x, s.y + Math.sin(t * 3 + s.x) * 4, 20, { rot: Math.sin(s.spin) * 0.3 });
      }
      // гуляющие зверушки
      for (const a of this.wild) {
        if (a.x < v.x0 - 60 || a.x > v.x1 + 60) continue;
        SB.drawAnimal(ctx, a.k, a.x, a.y, a.t, a.dir, 1, a.st === 'walk');
      }
      // герой
      if (this.mode === 'play' && this.P) this.drawHero(ctx, t);
      this.fx.draw(ctx);
      ctx.restore();
      if (tr.front === 'snow') this.drawSnow(ctx, W, H, t);
      this.drawHUD(ctx, W, H, t);
      this.hud.draw(ctx);
      for (const f of this.flying) {
        const k = U.easeInCubic(Math.min(1, f.t / 0.55));
        G.starIcon(ctx, U.lerp(f.x, 48, k), U.lerp(f.y, 45, k) - Math.sin(k * Math.PI) * 60, 16 * (1 - k * 0.4), { rot: f.t * 10 });
      }
      if (this.overlay === 'kitchen') this.drawKitchen(ctx, W, H, t);
      else if (this.overlay === 'terrain') this.drawTerrainPicker(ctx, W, H, t);
    },

    paintSky(ctx, W, H, t) {
      const tr = this.terrain;
      const alt = GY - (this.cam.y + H / 2); // высота середины экрана над землёй
      G.sky(ctx, W, H, tr.sky);
      if (!tr.space) {
        // выше — небо синее, а потом космос
        const k1 = U.clamp((alt - 500) / 1100, 0, 1), k2 = U.clamp((alt - 1700) / 500, 0, 1);
        if (k1 > 0) {
          ctx.globalAlpha = k1 * (1 - k2);
          G.sky(ctx, W, H, tr.id === 'clouds' ? ['#9A88F0', '#C8B8FF', '#FFD0EA'] : ['#3F8FE0', '#6FB8FF', '#A8DCFF']);
          ctx.globalAlpha = 1;
        }
        if (k2 > 0) {
          ctx.globalAlpha = k2;
          G.sky(ctx, W, H, ['#0B0B2A', '#1A1A4A', '#2E2A6E']);
          G.nightStars(ctx, W, H, t, 17, 80, this.cam.x * 0.05, this.cam.y * 0.05);
          ctx.globalAlpha = 1;
        }
        if (tr.sun && k2 < 1) {
          ctx.globalAlpha = 1 - k2;
          const sy = 110;
          G.glow(ctx, W * 0.84, sy, tr.hot ? 190 : 150, '#FFF3A0', 0.8);
          G.circle(ctx, W * 0.84, sy, tr.hot ? 62 : 50);
          ctx.fillStyle = tr.hot ? '#FFD23F' : '#FFE45C';
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      } else {
        G.nightStars(ctx, W, H, t, 17, 110, this.cam.x * 0.05, this.cam.y * 0.05);
        const px = W * 0.2, py = 140;
        G.circle(ctx, px, py, 50);
        ctx.fillStyle = '#FF9EC8';
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(px, py, 86, 16, -0.3, 0, TAU);
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'rgba(255,220,150,0.8)';
        ctx.stroke();
        G.circle(ctx, W * 0.82, 110, 40);
        ctx.fillStyle = '#5AB8F0';
        ctx.fill();
        G.circle(ctx, W * 0.82 - 10, 100, 14);
        ctx.fillStyle = '#7CD35A';
        ctx.fill();
      }
      // дальние силуэты у земли
      const up = Math.max(0, WH - H - this.cam.y);
      for (const o of tr.far) if (FAR[o.kind]) FAR[o.kind](ctx, this.cam, W, H, up, t, o);
      if (tr.snowcaps) {
        /* снежные шапки уже нарисованы у гор */
      }
    },

    drawSnow(ctx, W, H, t) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let k = 0; k < 50; k++) {
        const x = ((k * 97 + t * (20 + (k % 5) * 6)) % (W + 40)) - 20 + Math.sin(t + k) * 10;
        const y = ((k * 53 + t * (40 + (k % 7) * 8)) % (H + 40)) - 20;
        G.circle(ctx, x, y, 2 + (k % 3));
        ctx.fill();
      }
    },

    drawGrid(ctx, v) {
      const x0 = Math.floor(Math.max(0, v.x0) / C) * C, x1 = Math.min(WW, v.x1);
      const y0 = Math.max(TOP_ROW * C, Math.floor(v.y0 / C) * C), y1 = Math.min(GY, v.y1);
      ctx.beginPath();
      for (let x = x0; x <= x1; x += C) {
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
      }
      for (let y = y0; y <= y1; y += C) {
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = this.terrain.space ? 'rgba(255,255,255,0.12)' : 'rgba(40,60,120,0.1)';
      ctx.stroke();
    },

    drawHomes(ctx, t) {
      const byDoor = new Map();
      for (const h of this.homes) {
        if (!byDoor.has(h.door)) byDoor.set(h.door, []);
        byDoor.get(h.door).push(h);
      }
      for (const [dk, list] of byDoor) {
        const door = this.cells.get(dk);
        if (!door) continue;
        const wins = this.windowsOf(dk);
        list.forEach((h, i) => {
          let x, y, s;
          if (i < wins.length) {
            // выглядывает из окна
            const w = wins[i];
            x = w.x * C + C / 2;
            y = w.y * C + C - 6;
            s = 0.62;
            ctx.save();
            ctx.beginPath();
            ctx.rect(w.x * C + 10, w.y * C + 10, C - 20, C - 20);
            ctx.clip();
            SB.drawAnimal(ctx, h.k, x, y + 14, t + i, 1, s, false);
            ctx.restore();
          } else {
            // сидит у двери
            x = door.x * C + C / 2 + (i - wins.length) * 26 - 10;
            y = door.y * C + C + (this.cell(door.x, door.y + 1) && this.cell(door.x, door.y + 1).t === 'door' ? C : 0);
            s = 0.7;
            SB.drawAnimal(ctx, h.k, x, y, t + i, 1, s, false);
          }
          h._pos = [x, y - 10];
        });
      }
    },

    drawHero(ctx, t) {
      const P = this.P;
      const look = S.data.look;
      for (const f of this.follow || []) SB.drawAnimal(ctx, f.k, f.x, f.y, t, f.x < P.x ? 1 : -1, 0.85, true);
      if (look.pet) VW.Pets.draw(ctx, look.pet, this.pet.x, this.pet.y, { t: t, facing: this.pet.facing, moving: this.pet.moving, scale: 0.95 });
      Hero.draw(ctx, P.x, P.y + P.visOff, look, { state: P.anim || 'idle', t: t, phase: P.phase, facing: P.facing, speed: P.ladder ? 0 : P.vx, squash: P.squash }, 1);
    },

    // ---------- интерфейс ----------
    drawHUD(ctx, W, H, t) {
      VW.drawStarCounter(ctx);
      VW.roundBtn(ctx, 'sbBack', W - 52, 50, 36, '#8C7BD8', 'back', () => {
        A.sfx('back');
        VW.go('worlds');
      });
      // Играть / Строить
      const play = this.mode === 'play';
      const bx = W - 250, by = 22, bw = 150, bh = 58;
      const pr = UI.btn('sbMode', bx, by, bw, bh, () => this.setMode(play ? 'build' : 'play'));
      const oy = G.button3d(ctx, bx, by, bw, bh, play ? '#FF9A3C' : '#2FBF55', pr, 26);
      if (play) VW.SandboxIcons.hammer(ctx, bx + 34, by + 29 + oy, 17);
      else G.icon(ctx, 'play', bx + 32, by + 29 + oy, 13, '#fff', false);
      G.text(ctx, play ? 'Строить' : 'Играть', bx + 94, by + 30 + oy, 22, '#fff', { weight: 900 });
      // зверушки «в руках»
      if (this.carry.length) {
        const cw = 150 + this.carry.length * 56, cx = W / 2 - cw / 2 + (play ? 0 : 60), cy = play ? 18 : 92;
        G.panel(ctx, cx, cy, cw, 64, { r: 32, fill: 'rgba(255,255,255,0.92)', stroke: '#FF6FA8', lw: 3, shadowY: 3 });
        this.carry.forEach((k, i) => SB.drawAnimal(ctx, k, cx + 40 + i * 56, cy + 54, t + i, 1, 0.55, false));
        G.text(ctx, play ? 'Веди к двери!' : 'Нажми на дверь!', cx + 30 + this.carry.length * 56 + 60, cy + 33, 17, '#C2185B', { weight: 900, maxW: 150 });
      }
      if (this.overlay) return;
      if (!play) {
        this.drawTopButtons(ctx, W, H, t);
        this.drawToolbar(ctx, W, H, t);
        this.drawScrollArrows(ctx, W, H);
      } else this.drawControls(ctx, W, H, t);
    },

    drawTopButtons(ctx, W, H, t) {
      const items = [
        ['sbTerrain', 'Местность', '#5B8DEF', () => this.openTerrain(), (x, y) => VW.SandboxIcons.mountain(ctx, x, y, 16)],
        ['sbKitchen', 'Кухня', '#FF6FA8', () => this.openKitchen(), (x, y) => VW.SandboxIcons.pot(ctx, x, y, 16)],
      ];
      items.forEach(([id, label, col, fn, icon], i) => {
        const bw = 184, bh = 56, bx = 190 + i * (bw + 14), by = 22;
        const pr = UI.btn(id, bx, by, bw, bh, fn);
        const oy = G.button3d(ctx, bx, by, bw, bh, col, pr, 24);
        icon(bx + 34, by + 28 + oy);
        G.text(ctx, label, bx + 118, by + 29 + oy, 20, '#fff', { weight: 900, maxW: 116 });
      });
    },

    drawToolbar(ctx, W, H, t) {
      const n = SB.tools.length;
      const bs = Math.min(84, (W - 40) / n - 6);
      const gap = 6;
      const total = n * bs + (n - 1) * gap;
      const x0 = W / 2 - total / 2, y0 = H - bs - 14;
      G.panel(ctx, x0 - 12, y0 - 10, total + 24, bs + 22, { r: 24, fill: 'rgba(255,255,255,0.88)', stroke: '#B9A7F0', lw: 3, shadowY: 4 });
      SB.tools.forEach((tool, i) => {
        const x = x0 + i * (bs + gap);
        const sel = this.tool === tool.id;
        const pr = UI.btn('tool_' + tool.id, x, y0 - (sel ? 10 : 0), bs, bs, () => this.selectTool(tool.id));
        const oy = (sel ? -10 : 0) + (pr ? 3 : 0);
        G.rr(ctx, x, y0 + oy, bs, bs, 16);
        ctx.fillStyle = sel ? '#FFF3B0' : '#F6F2FF';
        ctx.fill();
        ctx.lineWidth = sel ? 4 : 2;
        ctx.strokeStyle = sel ? '#F2A900' : '#C9BCF0';
        ctx.stroke();
        const v = tool.id === 'food' ? this.variants.food || Object.keys(this.data.dishes)[0] || 'pancakes' : this.variants[tool.id] || 0;
        ctx.save();
        G.rr(ctx, x + 2, y0 + oy + 2, bs - 4, bs - 4, 14);
        ctx.clip();
        SB.drawToolIcon(ctx, tool.id, x + bs / 2, y0 + oy + bs / 2 - 6, bs * 0.34, t, v);
        ctx.restore();
        G.text(ctx, tool.name, x + bs / 2, y0 + oy + bs - 11, 13, '#3B2A6B', { weight: 900, maxW: bs - 6, stroke: '#fff', lw: 4 });
      });
      // варианты выбранной детали
      const tool = SB.toolById[this.tool];
      let list = null;
      if (tool.variants > 0) list = Array.from({ length: tool.variants }, (_, i) => i);
      else if (tool.variants === -1) list = Object.keys(this.data.dishes);
      if (!list) return;
      const vs = 66, vg = 10;
      const vy = y0 - vs - 30;
      if (!list.length) {
        const pw = 380, px = W / 2 - pw / 2;
        G.panel(ctx, px, vy - 4, pw, vs + 8, { r: 22, fill: 'rgba(255,255,255,0.92)', stroke: '#FF6FA8', lw: 3, shadowY: 3 });
        const pr = UI.btn('sbGoKitchen', px, vy - 4, pw, vs + 8, () => this.openKitchen());
        G.text(ctx, 'Приготовь еду на кухне!', W / 2 + 26, vy + vs / 2 + (pr ? 2 : 0), 21, '#C2185B', { weight: 900 });
        VW.SandboxIcons.pot(ctx, px + 36, vy + vs / 2, 16);
        return;
      }
      const vt = list.length * vs + (list.length - 1) * vg;
      const vx0 = W / 2 - vt / 2;
      G.panel(ctx, vx0 - 10, vy - 8, vt + 20, vs + 16, { r: 22, fill: 'rgba(255,255,255,0.85)', stroke: '#E0D4FF', lw: 2, shadow: false });
      list.forEach((vv, i) => {
        const x = vx0 + i * (vs + vg);
        const sel = (tool.id === 'food' ? this.curVariant() : this.variants[tool.id] || 0) === vv;
        const pr = UI.btn('var_' + i, x, vy, vs, vs, () => {
          this.variants[tool.id] = vv;
          A.sfx('select');
          if (tool.id === 'furn') V.say(SB.furniture[vv].name);
          else if (tool.id === 'nature') V.say(SB.nature[vv].name);
          else if (tool.id === 'food') V.say(SB.dishById[vv].name);
        });
        const oy = pr ? 2 : 0;
        G.rr(ctx, x, vy + oy, vs, vs, 14);
        ctx.fillStyle = sel ? '#FFF3B0' : '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = sel ? 4 : 2;
        ctx.strokeStyle = sel ? '#F2A900' : '#D8CCF5';
        ctx.stroke();
        ctx.save();
        G.rr(ctx, x + 2, vy + oy + 2, vs - 4, vs - 4, 12);
        ctx.clip();
        SB.drawToolIcon(ctx, tool.id, x + vs / 2, vy + oy + vs / 2, vs * 0.36, t, vv);
        ctx.restore();
        if (tool.id === 'food') {
          const cnt = this.data.dishes[vv] || 0;
          if (cnt > 1) G.text(ctx, '×' + cnt, x + vs - 12, vy + oy + 12, 14, '#6A4300', { weight: 900, stroke: '#fff', lw: 4 });
        }
      });
    },

    drawScrollArrows(ctx, W, H) {
      const my = H / 2 - 40;
      const arrow = (id, cx, cy, icon) => {
        const pr = UI.isPressed(id);
        UI.btnC(id, cx, cy, 34, null);
        ctx.globalAlpha = 0.72;
        G.roundButton(ctx, cx, cy, 32, '#8C7BD8', pr);
        ctx.globalAlpha = 1;
        G.icon(ctx, icon, cx, cy + (pr ? 3 : 0), 14, '#fff', false);
      };
      arrow('scrL', 40, my, 'left');
      arrow('scrR', W - 40, my, 'right');
      arrow('scrU', W - 40, my - 86, 'up');
      arrow('scrD', W - 40, my + 86, 'down');
      // «домой» — к земле посередине
      const pr = UI.btnC('scrHome', 40, my + 86, 34, () => {
        A.sfx('whoosh');
        this.cam.x = WW / 2 - W / 2;
        this.cam.y = GY - H + 250;
        this.clampCam();
      });
      ctx.globalAlpha = 0.72;
      G.roundButton(ctx, 40, my + 86, 32, '#2FBF55', pr);
      ctx.globalAlpha = 1;
      G.icon(ctx, 'home', 40, my + 86 + (pr ? 3 : 0), 14, '#fff', false);
    },

    drawControls(ctx, W, H, t) {
      const btn = (id, cx, cy, r, color, icon, on) => {
        const held = UI.hold(id, cx, cy, r);
        const a = on === false ? 0.45 : 0.9;
        const oy = G.roundButton(ctx, cx, cy, r * (held ? 0.95 : 1), color, held, a);
        ctx.globalAlpha = on === false ? 0.6 : 1;
        G.icon(ctx, icon, cx, cy + oy, r * 0.5, '#fff');
        ctx.globalAlpha = 1;
      };
      const by = H - 92;
      btn('left', 92, by, 64, '#5B8DEF', 'left');
      btn('right', 242, by, 64, '#5B8DEF', 'right');
      const up = !!this.P.ladder || !!this.ladderFor(-1), dn = !!this.P.ladder || !!this.ladderFor(1);
      if (up) G.glow(ctx, W - 258, H - 184, 80, '#FFE680', 0.4 + 0.25 * Math.sin(t * 6));
      btn('up', W - 258, H - 184, 52, '#FF9A3C', 'ladderUp', up || null);
      btn('down', W - 258, H - 64, 46, '#FF9A3C', 'ladderDown', dn);
      btn('jump', W - 100, H - 104, 78, '#2FBF55', 'jump');
    },

    // ---------- выбор местности ----------
    openTerrain() {
      this.overlay = 'terrain';
      this.otT = 0;
      A.sfx('tap');
      V.say('Выбери местность!');
    },
    drawTerrainPicker(ctx, W, H, t) {
      UI.blocker(() => {
        this.overlay = null;
      });
      ctx.fillStyle = 'rgba(30,15,70,0.5)';
      ctx.fillRect(0, 0, W, H);
      const pw = Math.min(980, W - 40), ph = 560;
      const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
      UI.btn('terPanel', px, py, pw, ph, null);
      G.panel(ctx, px, py, pw, ph, { r: 34, fill: '#FFFDF4', stroke: '#5B8DEF', lw: 6, shadowY: 10 });
      G.text(ctx, 'Местность', W / 2, py + 50, 38, '#2A4A90', { weight: 900 });
      const cols = 4, cw = (pw - 60 - (cols - 1) * 18) / cols, ch = 196;
      SB.terrains.forEach((tr, i) => {
        const row = Math.floor(i / cols), col = i % cols;
        const n = row === 0 ? cols : SB.terrains.length - cols;
        const rowW = n * cw + (n - 1) * 18;
        const x = W / 2 - rowW / 2 + col * (cw + 18), y = py + 96 + row * (ch + 20);
        const sel = this.terrain.id === tr.id;
        const pr = UI.btn('ter_' + tr.id, x, y, cw, ch, () => {
          this.terrain = tr;
          this.overlay = null;
          A.sfx('magic');
          V.say(tr.say);
          this.saveData();
        });
        const oy = pr ? 3 : 0;
        ctx.save();
        G.rr(ctx, x, y + oy, cw, ch, 20);
        ctx.clip();
        ctx.fillStyle = G.vGrad(ctx, y + oy, y + oy + ch, tr.sky);
        ctx.fillRect(x, y + oy, cw, ch);
        if (tr.space) G.nightStars(ctx, cw, ch - 60, t, 3 + i, 16, -x, -(y + oy));
        const miniCam = { x: 0, y: 0 };
        ctx.translate(x, y + oy);
        for (const o of tr.far) if (FAR[o.kind]) FAR[o.kind](ctx, miniCam, cw, ch - 36, 0, t, Object.assign({}, o, { base: o.base * 0.45, amp: o.amp * 0.45 }));
        SB.drawBackDeco(ctx, tr, 0, cw, ch - 44, t);
        SB.drawGround(ctx, tr, 0, cw, ch - 44, 60);
        ctx.restore();
        G.rr(ctx, x, y + oy, cw, ch, 20);
        ctx.lineWidth = sel ? 6 : 3;
        ctx.strokeStyle = sel ? '#F2A900' : '#B9C8F0';
        ctx.stroke();
        G.panel(ctx, x + cw / 2 - 70, y + oy + ch - 40, 140, 34, { r: 17, fill: 'rgba(255,255,255,0.92)', shadow: false });
        G.text(ctx, tr.name, x + cw / 2, y + oy + ch - 22, 20, '#2A4A90', { weight: 900 });
        if (sel) G.checkBadge(ctx, x + cw - 22, y + oy + 22, 16);
      });
      VW.roundBtn(ctx, 'terClose', px + pw - 22, py + 22, 30, '#FF6B6B', 'close', () => {
        this.overlay = null;
        A.sfx('back');
      }, 0.5);
    },

    // ---------- кухня ----------
    drawKitchen(ctx, W, H, t) {
      const k = this.kitchen;
      UI.blocker(null);
      ctx.fillStyle = 'rgba(30,15,70,0.55)';
      ctx.fillRect(0, 0, W, H);
      const pw = Math.min(1000, W - 30), ph = H - 40;
      const px = W / 2 - pw / 2, py = 20;
      UI.btn('kitPanel', px, py, pw, ph, null);
      G.panel(ctx, px, py, pw, ph, { r: 34, fill: '#FFF6FA', stroke: '#FF6FA8', lw: 6, shadowY: 10 });
      // плитка на стене
      ctx.save();
      G.rr(ctx, px + 6, py + 6, pw - 12, ph - 12, 30);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,158,196,0.12)';
      for (let yy = py; yy < py + ph; yy += 50) for (let xx = px; xx < px + pw; xx += 50) if (((xx - px) / 50 + (yy - py) / 50) % 2 === 0) ctx.fillRect(xx, yy, 50, 50);
      ctx.restore();
      G.text(ctx, 'Кухня', px + pw / 2, py + 42, 36, '#C2185B', { weight: 900 });
      VW.roundBtn(ctx, 'kitClose', px + pw - 26, py + 26, 30, '#FF6B6B', 'close', () => {
        this.overlay = null;
        A.sfx('back');
      }, 0.5);
      // рецепты
      const rpr = UI.btn('kitRecipes', px + 24, py + 16, 170, 54, () => {
        k.recipes = !k.recipes;
        A.sfx('tap');
        if (k.recipes) V.say('Рецепты! Нажми на рецепт — продукты сами лягут в миску.');
      });
      const roy = G.button3d(ctx, px + 24, py + 16, 170, 54, '#9A55E8', rpr, 22);
      VW.SandboxIcons.book(ctx, px + 52, py + 43 + roy, 14);
      G.text(ctx, 'Рецепты', px + 124, py + 44 + roy, 20, '#fff', { weight: 900 });
      if (k.recipes) {
        this.drawRecipes(ctx, px, py, pw, ph, t);
        return;
      }
      // продукты: 4 × 3
      const gx0 = px + 30, gy0 = py + 100, bs = Math.min(104, (pw * 0.55 - 30) / 4 - 12);
      SB.ingredients.forEach((g, i) => {
        const x = gx0 + (i % 4) * (bs + 14), y = gy0 + Math.floor(i / 4) * (bs + 34);
        const pr = UI.btn('ing_' + g.id, x, y, bs, bs, () => this.addIng(g.id));
        const oy = pr ? 3 : 0;
        G.rr(ctx, x, y + oy, bs, bs, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFB8D0';
        ctx.stroke();
        SB.drawIngredient(ctx, g.id, x + bs / 2, y + oy + bs / 2, bs * 0.34);
        G.text(ctx, g.name, x + bs / 2, y + bs + 16, 17, '#8E2A5A', { weight: 900, maxW: bs + 10 });
      });
      // миска
      const bx = px + pw * 0.78, byy = py + ph * 0.44;
      if (k.phase === 'done') {
        G.glow(ctx, bx, byy - 20, 200, '#FFF3A0', 0.8);
        G.rays(ctx, bx, byy - 20, 190, t * 0.5, '#FFE680', 12, 0.35);
        SB.drawDish(ctx, k.dish.id, bx, byy - 30, 90, t);
        let nfs = 32;
        while (nfs > 18 && G.measure(ctx, k.dish.name, nfs, 900) > pw * 0.4) nfs--;
        G.text(ctx, k.dish.name, bx, byy + 110, nfs, '#7A4A00', { weight: 900, stroke: '#fff', lw: 7 });
        const p1 = UI.btn('kitAgain', bx - 190, py + ph - 110, 176, 80, () => {
          k.bowl = [];
          k.phase = 'pick';
          A.sfx('tap');
        });
        const o1 = G.button3d(ctx, bx - 190, py + ph - 110, 176, 80, '#FF9A3C', p1, 28);
        G.text(ctx, 'Ещё!', bx - 102, py + ph - 69 + o1, 28, '#fff', { weight: 900 });
        const p2 = UI.btn('kitPlace', bx + 4, py + ph - 110, 196, 80, () => {
          this.overlay = null;
          this.tool = 'food';
          this.variants.food = k.dish.id;
          A.sfx('magic');
          V.say('Поставь ' + k.dish.acc + ' в своём мире!');
        });
        const o2 = G.button3d(ctx, bx + 4, py + ph - 110, 196, 80, '#2FBF55', p2, 28);
        G.text(ctx, 'В мир!', bx + 102, py + ph - 69 + o2, 28, '#fff', { weight: 900 });
        return;
      }
      const stir = k.phase === 'cook' ? Math.sin(k.t * 14) * 0.08 : 0;
      ctx.save();
      ctx.translate(bx, byy);
      ctx.rotate(stir);
      ctx.beginPath();
      ctx.ellipse(0, 0, 150, 100, 0, 0, Math.PI);
      ctx.closePath();
      Art_fs(ctx, '#8FD3FF', '#3A6EA8', 5);
      G.ellipse(ctx, 0, 0, 150, 30);
      Art_fs(ctx, '#DDF2FF', '#3A6EA8', 5);
      k.bowl.forEach((id, i) => {
        const ix = (i - (k.bowl.length - 1) / 2) * 90;
        SB.drawIngredient(ctx, id, ix, -18 + (k.phase === 'cook' ? Math.sin(k.t * 10 + i) * 8 : 0), 34);
      });
      ctx.restore();
      if (k.phase === 'cook') {
        for (let q = 0; q < 5; q++) {
          const ph2 = (k.t * 1.2 + q / 5) % 1;
          G.circle(ctx, bx - 60 + q * 30 + Math.sin(ph2 * 6) * 10, byy - 60 - ph2 * 140, 14 + ph2 * 16);
          ctx.fillStyle = 'rgba(255,255,255,' + 0.7 * (1 - ph2) + ')';
          ctx.fill();
        }
        G.text(ctx, 'Готовим…', bx, byy + 150, 30, '#C2185B', { weight: 900 });
        return;
      }
      // убрать продукт из миски — нажать на него
      k.bowl.forEach((id, i) => {
        const ix = bx + (i - (k.bowl.length - 1) / 2) * 90;
        UI.btnC('bowl_' + i, ix, byy - 18, 40, () => {
          k.bowl.splice(i, 1);
          A.sfx('back');
        });
      });
      if (!k.bowl.length) G.text(ctx, 'Положи продукты в миску', bx, byy - 30, 20, '#3A6EA8', { weight: 800 });
      const cpr = UI.btn('kitCook', bx - 130, py + ph - 116, 260, 90, () => this.cookNow());
      const coy = G.button3d(ctx, bx - 130, py + ph - 116, 260, 90, k.bowl.length ? '#2FBF55' : '#A8B8A8', cpr, 32);
      VW.SandboxIcons.pot(ctx, bx - 78, py + ph - 71 + coy, 22);
      G.text(ctx, 'Готовить!', bx + 30, py + ph - 70 + coy, 30, '#fff', { weight: 900 });
    },
    drawRecipes(ctx, px, py, pw, ph, t) {
      const k = this.kitchen;
      const cols = 2, rw = (pw - 80) / cols, rh = Math.min(84, (ph - 120) / 6);
      SB.recipes.forEach((r, i) => {
        const col = Math.floor(i / 6), row = i % 6;
        const x = px + 30 + col * (rw + 20), y = py + 90 + row * rh;
        const pr = UI.btn('rec_' + r.id, x, y, rw, rh - 10, () => {
          k.bowl = r.ing.slice();
          k.recipes = false;
          k.phase = 'pick';
          A.sfx('select');
          V.say(r.name + '! Нажми «Готовить».');
        });
        const oy = pr ? 2 : 0;
        G.rr(ctx, x, y + oy, rw, rh - 10, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#E0C8F0';
        ctx.stroke();
        const cy = y + oy + (rh - 10) / 2;
        let ix = x + 34;
        r.ing.forEach((g, j) => {
          SB.drawIngredient(ctx, g, ix, cy, 18);
          ix += 44;
          G.text(ctx, j < r.ing.length - 1 ? '+' : '=', ix - 22, cy + 1, 24, '#9A55E8', { weight: 900 });
        });
        SB.drawDish(ctx, r.id, ix + 10, cy, 22, t);
        G.text(ctx, r.name, ix + 44, cy + 1, 19, '#5B2A9A', { align: 'left', weight: 900, maxW: x + rw - ix - 50 });
      });
    },

    onKey(code) {
      if (this.overlay) {
        if (code === 'Escape') this.overlay = null;
        return;
      }
      if (code === 'Escape') {
        A.sfx('back');
        VW.go('worlds');
      }
      if (code === 'Enter') this.setMode(this.mode === 'play' ? 'build' : 'play');
    },
  });

  function Art_fs(ctx, fill, stroke, lw) {
    VW.Art.fs(ctx, fill, stroke, lw);
  }

  // ---------- значки ----------
  const IC = (VW.SandboxIcons = {});
  IC.hammer = function (ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.7);
    G.rr(ctx, -s * 0.16, -s * 0.3, s * 0.32, s * 1.35, s * 0.12);
    Art_fs(ctx, color || '#C98D52', '#6A4520', Math.max(2, s * 0.1));
    G.rr(ctx, -s * 0.7, -s * 0.78, s * 1.4, s * 0.55, s * 0.14);
    Art_fs(ctx, '#B7C1D6', '#4A546A', Math.max(2, s * 0.1));
    ctx.restore();
  };
  IC.mountain = function (ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - s * 1.1, y + s * 0.8);
    ctx.lineTo(x - s * 0.3, y - s * 0.7);
    ctx.lineTo(x + s * 0.2, y + s * 0.1);
    ctx.lineTo(x + s * 0.5, y - s * 0.3);
    ctx.lineTo(x + s * 1.1, y + s * 0.8);
    ctx.closePath();
    Art_fs(ctx, '#FFFFFF', '#2A4A90', 2.5);
    G.circle(ctx, x + s * 0.7, y - s * 0.7, s * 0.28);
    ctx.fillStyle = '#FFE45C';
    ctx.fill();
  };
  IC.pot = function (ctx, x, y, s) {
    G.rr(ctx, x - s * 0.9, y - s * 0.3, s * 1.8, s * 1.1, s * 0.3);
    Art_fs(ctx, '#FFFFFF', '#8E2A5A', 2.5);
    G.rr(ctx, x - s * 1.05, y - s * 0.5, s * 2.1, s * 0.3, s * 0.12);
    Art_fs(ctx, '#FFFFFF', '#8E2A5A', 2.5);
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(x - s * 0.5 + k * s * 0.5, y - s * 0.75);
      ctx.quadraticCurveTo(x - s * 0.3 + k * s * 0.5, y - s * 1.0, x - s * 0.5 + k * s * 0.5, y - s * 1.25);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    }
  };
  IC.book = function (ctx, x, y, s) {
    G.rr(ctx, x - s, y - s * 0.8, s * 2, s * 1.6, s * 0.2);
    Art_fs(ctx, '#FFFFFF', '#5B2A9A', 2.5);
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.8);
    ctx.lineTo(x, y + s * 0.8);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#5B2A9A';
    ctx.stroke();
  };
})(window.VW);
