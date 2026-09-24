/* Vasilisa World — игровой экран: платформер, лестницы, монетки, артефакт */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, UI = VW.UI, D = VW.Data, S = VW.Store, A = VW.Audio, V = VW.Voice, Hero = VW.Hero, I = VW.Items;
  const TAU = Math.PI * 2;

  // Физика (единицы — логические пиксели)
  const GRAV = 2500;
  const MAX_FALL = 1300;
  const SPEED = 340;
  const ACCEL = 3200;
  const AIR_ACCEL = 2400;
  const JUMP_V = 1010; // высота прыжка ≈ 204
  const CLIMB = 280;
  const STEP = 52; // автоматический шаг на ступеньку
  const STEP_OFF = 64; // с лестницы можно шагнуть на платформу в этих пределах
  const COYOTE = 0.13;
  const JUMP_BUF = 0.17;
  const BOUNCE_V = 1500;
  const FOOT = 14; // полуширина «ступней»
  const PW = 40, PH = 96;
  const HINT_TIME = 40; // через сколько секунд подсказывать
  const LADDER_GRAB = 58; // как далеко от лестницы можно за неё «схватиться»
  const CORNER = 16; // насколько ниже края площадки можно «зацепиться» за него сбоку

  const TRANSPOSE = [0, 2, -3, 5, -1];

  VW.screens = VW.screens || {};

  const GAME = (VW.screens.game = {
    subtitlePos: 'top',

    enter(p) {
      p = p || {};
      // старый вызов { scene: 'tree' } — первый круг волшебной школы
      const world = p.world || 'magic';
      const round = p.round || (VW.Worlds ? VW.Worlds.round(world) : 1);
      const scenes = VW.Worlds.scenes(world, round);
      let idx = p.idx != null ? p.idx : 0;
      if (p.scene) {
        const i = scenes.findIndex((s) => s.id === p.scene);
        if (i >= 0) idx = i;
      }
      idx = U.clamp(idx | 0, 0, scenes.length - 1);
      this.world = world;
      this.round = round;
      this.scenes = scenes;
      this.idx = idx;
      this.scene = scenes[idx];
      if (p.desc) this.scene = Object.assign({}, this.scene, p.desc); // для проверки: другое «зерно»
      this.sceneId = this.scene.id;
      this.L = this.scene.level ? VW.Levels[this.scene.level]() : VW.Gen.build(this.scene);
      this.prepareLevel();
      const L = this.L;
      this.P = {
        x: L.spawn[0], y: L.spawn[1], vx: 0, vy: 0, facing: L.spawnFacing || 1,
        onGround: true, ground: null, ladder: null, coyote: 0, jumpBuf: 0,
        phase: 0, squash: 0, visOff: 0, inWater: false, sideHold: 0, climbSnd: 0, stepSnd: 0,
      };
      this.coins = L.coins.map((c) => ({ x: c[0], y: c[1], taken: false, spin: Math.random() * TAU }));
      this.coinsGot = 0;
      this.combo = 0;
      this.comboT = 0;
      const arts = L.artifacts || [{ x: L.artifact.x, y: L.artifact.y, id: this.scene.arts[0] }];
      this.arts = arts.map((a) => ({ x: a.x, y: a.y, id: a.id, feat: a.feat, taken: false, pop: 0 }));
      this.art = this.arts[0];
      this.lastArt = this.arts[0];
      this.fx = new VW.Particles();
      this.hud = new VW.Particles();
      this.flying = [];
      this.t = 0;
      this.mt = 0;
      this.playT = 0;
      this.hintUntil = 0;
      this.autoHinted = false;
      this.state = 'play';
      this.found = null;
      this.pause = null;
      this.partFound = null;
      this.pet = { x: L.spawn[0] - 60 * (L.spawnFacing || 1), y: L.spawn[1], facing: L.spawnFacing || 1, moving: false, trail: [] };
      this.cam = { x: 0, y: 0 };
      this.snapCamera();
      this.showKeysHint = !UI.touchMode && !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      const mu = this.scene.music || {};
      A.music(mu.song || 'level', { transpose: mu.transpose || 0, bpm: mu.bpm });
    },

    exit() {
      S.save();
    },

    onHide() {
      if (this.state === 'play') this.openPause();
    },

    prepareLevel() {
      const L = this.L;
      L.platforms = L.platforms || [];
      L.ladders = L.ladders || [];
      L.walls = L.walls || [];
      L.water = L.water || [];
      L.props = L.props || [];
      for (const p of L.platforms) {
        p.top = p.y;
        if (p.move) {
          p.bx = p.x;
          p.by = p.y;
          p.dx = 0;
          p.dy = 0;
        }
      }
      // у каждой лестницы наверху должна быть опора
      for (const l of L.ladders) {
        const has = L.platforms.some((p) => Math.abs(p.y - l.top) < 3 && p.x < l.x + 10 && p.x + p.w > l.x - 10);
        if (!has) L.platforms.push({ x: l.x - 36, y: l.top, top: l.top, w: 72, h: 10, style: 'none', ladderTop: true });
      }
      this.movers = L.platforms.filter((p) => p.move);
    },

    // ---------- вспомогательное ----------
    overlapX(x, p, half) {
      const h = half == null ? FOOT : half;
      return x + h > p.x && x - h < p.x + p.w;
    },

    // Лестница рядом, по которой можно лезть вверх (dir = -1) или вниз (dir = 1)
    ladderFor(dir) {
      const P = this.P;
      let best = null, bd = 1e9;
      for (const l of this.L.ladders) {
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

    canClimbUp() {
      return !!this.P.ladder || !!this.ladderFor(-1);
    },

    canClimbDown() {
      return !!this.P.ladder || !!this.ladderFor(1);
    },

    snapCamera() {
      const k = this.cam;
      this.camTarget();
      k.x = this.tx;
      k.y = this.ty;
      this.clampCam();
    },

    camTarget() {
      const P = this.P, W = VW.W, H = VW.H;
      this.tx = P.x - W / 2 + P.facing * 70;
      this.ty = P.y - H * 0.6;
    },

    clampCam() {
      const k = this.cam, L = this.L, W = VW.W, H = VW.H;
      if (L.w <= W) k.x = (L.w - W) / 2;
      else k.x = U.clamp(k.x, 0, L.w - W);
      if (L.h <= H) k.y = L.h - H;
      else k.y = U.clamp(k.y, 0, L.h - H);
    },

    input() {
      if (this.botInput) return this.botInput;
      const k = UI.key;
      const tk = (id) => UI.held(id);
      return {
        left: tk('left') || k('ArrowLeft') || k('KeyA'),
        right: tk('right') || k('ArrowRight') || k('KeyD'),
        up: tk('up') || k('ArrowUp') || k('KeyW'),
        down: tk('down') || k('ArrowDown') || k('KeyS'),
        jumpEdge: UI.edge('jump') || UI.keyEdge('Space'),
        upEdge: UI.edge('up') || UI.keyEdge('ArrowUp') || UI.keyEdge('KeyW'),
        jumpHeld: tk('jump') || k('Space'),
      };
    },

    // ---------- обновление ----------
    update(dt) {
      this.t += dt;
      this.hud.update(dt);
      this.updateFlying(dt);
      if (this.state === 'pause') {
        this.pause.t += dt;
        return;
      }
      if (this.state === 'found') {
        this.updateFound(dt);
        this.fx.update(dt);
        this.updatePet(dt);
        return;
      }
      this.playT += dt;
      const inp = this.input();
      if (inp.left || inp.right || inp.jumpEdge) this.showKeysHint = false;
      const n = Math.max(1, Math.ceil(dt / (1 / 120)));
      const sdt = dt / n;
      for (let i = 0; i < n; i++) this.step(sdt, inp, i === 0);
      this.afterStep(dt);
      this.fx.update(dt);
      this.updatePet(dt);
      this.updateCamera(dt);
      // подсказка через некоторое время
      if (!this.autoHinted && this.playT > HINT_TIME) {
        this.autoHinted = true;
        this.showHint();
      }
      this.comboT -= dt;
      if (this.comboT <= 0) this.combo = 0;
      if (this.partFound) {
        this.partFound.t += dt;
        if (this.partFound.t > 2.6) this.partFound = null;
      }
      if (this.L.update) this.L.update(dt, this);
    },

    // ближайшая ещё не найденная находка
    nextArt() {
      const P = this.P;
      let best = null, bd = 1e12;
      for (const a of this.arts) {
        if (a.taken) continue;
        const d = Math.hypot(a.x - P.x, (a.y - P.y) * 1.3);
        if (d < bd) {
          bd = d;
          best = a;
        }
      }
      return best;
    },

    showHint() {
      const a = this.nextArt();
      let text = this.scene.hint;
      if (!text || this.arts.length > 1) text = a ? VW.Gen.hint(this.L, this.P, a, this.L.theme) : '';
      if (!text) return;
      V.say(text);
      this.hintUntil = this.t + 8;
      A.sfx('sparkle');
    },

    moveMovers(dt) {
      this.mt += dt;
      for (const p of this.movers) {
        const m = p.move;
        const ph = ((this.mt + (m.phase || 0)) / m.period) * TAU;
        const nx = p.bx + (m.ax || 0) * Math.sin(ph);
        const ny = p.by + (m.ay || 0) * Math.sin(ph);
        p.dx = nx - p.x;
        p.dy = ny - p.y;
        p.x = nx;
        p.y = ny;
        p.top = ny;
      }
    },

    step(dt, inp, first) {
      const P = this.P;
      this.moveMovers(dt);
      if (P.ground && P.ground.move && !P.ladder) {
        P.x += P.ground.dx;
        P.y += P.ground.dy;
      }
      if (first && inp.jumpEdge) P.jumpBuf = JUMP_BUF;
      if (P.ladder) this.stepLadder(dt, inp, first);
      else this.stepFree(dt, inp, first);
    },

    stepFree(dt, inp, first) {
      const P = this.P, L = this.L;
      const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      const maxSp = SPEED * (P.inWater ? 0.62 : 1);
      P.vx = U.approach(P.vx, dir * maxSp, (P.onGround ? ACCEL : AIR_ACCEL) * dt);
      if (dir) P.facing = dir;

      // лестницы
      const ladUp = this.ladderFor(-1);
      if (inp.up && ladUp) {
        this.grabLadder(ladUp);
        return;
      }
      const ladDn = P.onGround ? this.ladderFor(1) : null;
      if (inp.down && ladDn) {
        this.grabLadder(ladDn);
        P.y += 3;
        return;
      }
      // «вверх» без лестницы — прыжок (так проще для малышей)
      if (first && inp.upEdge && !ladUp) P.jumpBuf = JUMP_BUF;

      // прыжок
      if (P.onGround) P.coyote = COYOTE;
      else P.coyote -= dt;
      P.jumpBuf -= dt;
      if (P.jumpBuf > 0 && P.coyote > 0) {
        P.vy = -JUMP_V * (P.inWater ? 0.92 : 1);
        P.onGround = false;
        P.ground = null;
        P.coyote = 0;
        P.jumpBuf = 0;
        P.squash = -0.14;
        A.sfx('jump');
        this.fx.burst('dust', P.x, P.y, 5, { speed: 90, size: 7, color: '#ffffff', life: 0.4, g: -40 });
      }

      P.vy = Math.min(P.vy + GRAV * dt, MAX_FALL);

      // по горизонтали
      const prevX = P.x;
      let nx = P.x + P.vx * dt;
      nx = U.clamp(nx, PW / 2, L.w - PW / 2);
      for (const w of L.walls) {
        if (P.y > w.y + 2 && P.y - PH < w.y + w.h && nx + PW / 2 > w.x && nx - PW / 2 < w.x + w.w) {
          nx = P.x < w.x + w.w / 2 ? w.x - PW / 2 : w.x + w.w + PW / 2;
          P.vx = 0;
        }
      }
      P.x = nx;

      // автоматический шаг на ступеньку
      if (P.onGround && Math.abs(P.vx) > 1) {
        for (const p of L.platforms) {
          if (p === P.ground || p.noStep) continue;
          const rise = P.y - p.top;
          if (rise > 0.5 && rise <= STEP && this.overlapX(P.x, p, FOOT + 2)) {
            P.visOff += rise;
            P.y = p.top;
            P.ground = p;
          }
        }
      }

      // по вертикали и приземление
      const wasGround = P.onGround;
      const prevY = P.y;
      let ny = P.y + P.vy * dt;
      let landed = null;
      if (P.vy >= 0) {
        for (const p of L.platforms) {
          const top = p.top;
          const tol = 1.5 + (p.move ? Math.max(0, -p.dy) + 1 : 0);
          if (prevY <= top + tol && ny >= top && this.overlapX(P.x, p)) {
            if (!landed || top < landed.top) landed = p;
          } else if (!p.move && ny >= top && ny - top <= CORNER && this.overlapX(P.x, p) && !this.overlapX(prevX, p)) {
            // «въехали» в край площадки сбоку чуть ниже верха — ставим на край, а не сквозь
            if (!landed || top < landed.top) landed = p;
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
        if (landed.bounce) {
          P.vy = -(landed.bounceV || BOUNCE_V);
          P.onGround = false;
          P.ground = null;
          P.squash = 0.25;
          landed.squashT = 0.35;
          A.sfx('bounce');
          this.fx.burst(landed.bounceFx || 'spark', P.x, landed.top, 10, { speed: 260, size: 10, color: landed.bounceColor || '#FFF3A0', life: 0.7 });
        } else if (!wasGround && impact > 350) {
          P.squash = Math.min(0.28, impact / 3500);
          A.sfx('land');
          this.fx.burst('dust', P.x, landed.top, 6, { speed: 110, size: 8, color: '#ffffff', life: 0.45, g: -30 });
        }
      } else {
        P.ground = null;
      }
      P.y = ny;

      // вода
      const inW = L.water.some((w) => P.x > w.x && P.x < w.x + w.w && P.y > w.y + 6);
      if (inW && !P.inWater) {
        A.sfx('splash');
        const w = L.water.find((w) => P.x > w.x && P.x < w.x + w.w);
        this.fx.burst('splash', P.x, w ? w.y : P.y, 16, { angle: -Math.PI / 2, spread: 0.9, speed: 420, size: 9, color: '#9FE3FF', life: 0.8 });
      }
      P.inWater = inW;

      // страховка: если провалились — назад на безопасное место
      if (P.y > L.h + 300) {
        const sp = L.spawn;
        P.x = sp[0];
        P.y = sp[1];
        P.vx = P.vy = 0;
        this.snapCamera();
      }
    },

    grabLadder(lad) {
      const P = this.P;
      P.ladder = lad;
      P.vx = 0;
      P.vy = 0;
      P.onGround = false;
      P.ground = null;
      P.sideHold = 0;
      P.jumpBuf = 0;
    },

    stepLadder(dt, inp, first) {
      const P = this.P, L = this.L;
      const lad = P.ladder;
      P.x = U.approach(P.x, lad.x, 700 * dt);
      P.vx = 0;
      const v = (inp.up ? -CLIMB : 0) + (inp.down ? CLIMB : 0);
      P.vy = v;
      P.y += v * dt;
      if (v !== 0) {
        P.phase += dt * 10;
        P.climbSnd -= dt;
        if (P.climbSnd <= 0) {
          P.climbSnd = 0.2;
          A.sfx('climb');
        }
      }
      if (P.y <= lad.top) {
        P.y = lad.top;
        P.ladder = null;
        P.vy = 0;
        P.onGround = true;
        P.ground = this.surfaceAt(P.x, lad.top);
        return;
      }
      if (P.y >= lad.bottom) {
        P.y = lad.bottom;
        P.ladder = null;
        P.vy = 0;
        P.onGround = true;
        P.ground = this.surfaceAt(P.x, lad.bottom);
        return;
      }
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
        for (const p of L.platforms) {
          const dy = p.top - P.y;
          if (dy >= -STEP_OFF && dy <= STEP_OFF && this.overlapX(P.x + d * 30, p)) {
            if (!best || Math.abs(dy) < Math.abs(best.top - P.y)) best = p;
          }
        }
        if (best) {
          P.ladder = null;
          P.visOff += P.y - best.top; // плавно, без рывка
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

    surfaceAt(x, y) {
      let best = null;
      for (const p of this.L.platforms) {
        if (Math.abs(p.top - y) < 4 && this.overlapX(x, p)) best = p;
      }
      return best;
    },

    afterStep(dt) {
      const P = this.P;
      P.visOff *= Math.exp(-dt * 22);
      if (Math.abs(P.visOff) < 0.3) P.visOff = 0;
      P.squash *= Math.exp(-dt * 10);
      // анимация
      if (P.ladder) P.anim = 'climb';
      else if (P.onGround) {
        if (Math.abs(P.vx) > 25) {
          P.anim = P.inWater ? 'wade' : 'walk';
          const prev = P.phase;
          P.phase += dt * Math.abs(P.vx) * 0.042;
          if (Math.floor(prev / Math.PI) !== Math.floor(P.phase / Math.PI)) {
            if (P.inWater) A.sfx('bubble');
            else A.sfx('step');
          }
        } else P.anim = 'idle';
      } else P.anim = P.vy < 0 ? 'jump' : 'fall';

      // монетки
      const cx = P.x, cy = P.y - 48;
      for (const c of this.coins) {
        if (c.taken) continue;
        c.spin += dt * 5;
        if (Math.abs(c.x - cx) < 46 && Math.abs(c.y - cy) < 62) this.takeCoin(c);
      }
      // находки
      for (const a of this.arts) {
        if (!a.taken && Math.abs(a.x - cx) < 58 && Math.abs(a.y - cy) < 70) {
          this.takeArt(a);
          if (this.state !== 'play') break;
        }
      }
      // предметы, которые оживают от касания
      for (const pr of this.L.props) {
        const inside = cx > pr.x && cx < pr.x + pr.w && cy > pr.y && cy < pr.y + pr.h;
        if (inside && !pr.inside && pr.onTouch) pr.onTouch(this, pr);
        pr.inside = inside;
        if (pr.t != null) pr.t += dt;
      }
    },

    takeCoin(c) {
      c.taken = true;
      this.coinsGot++;
      this.combo = Math.min(this.combo + 1, 12);
      this.comboT = 1.2;
      A.sfx('coin', this.combo - 1);
      S.addStars(1);
      this.fx.burst('spark', c.x, c.y, 7, { speed: 200, size: 9, color: '#FFF3A0', life: 0.5 });
      // монетка летит к счётчику звёзд
      this.flying.push({ x: c.x - this.cam.x, y: c.y - this.cam.y, t: 0 });
    },

    updateFlying(dt) {
      for (const f of this.flying) {
        f.t += dt;
      }
      const before = this.flying.length;
      this.flying = this.flying.filter((f) => f.t < 0.55);
      if (this.flying.length < before) VW.starPulse = 0.6;
    },

    updateCamera(dt) {
      this.camTarget();
      const k = this.cam;
      const a = Math.min(1, dt * 5);
      k.x += (this.tx - k.x) * a;
      const dy = this.ty - k.y;
      k.y += dy * Math.min(1, dt * (Math.abs(dy) > 120 ? 6 : 3.5));
      this.clampCam();
    },

    updatePet(dt) {
      const look = S.data.look;
      if (!look.pet) return;
      const P = this.P, pet = this.pet;
      const tr = pet.trail;
      const last = tr[tr.length - 1];
      if (!last || Math.hypot(last.x - P.x, last.y - P.y) > 4) tr.push({ x: P.x, y: P.y });
      if (tr.length > 80) tr.shift();
      // ищем точку на «следе» в 70 единицах позади
      let dist = 0, tx = P.x - P.facing * 60, ty = P.y;
      let prev = { x: P.x, y: P.y };
      for (let i = tr.length - 1; i >= 0; i--) {
        const q = tr[i];
        dist += Math.hypot(q.x - prev.x, q.y - prev.y);
        prev = q;
        if (dist >= 70) {
          tx = q.x;
          ty = q.y;
          break;
        }
      }
      if (dist < 70 && tr.length) {
        tx = tr[0].x;
        ty = tr[0].y;
      }
      const fly = VW.Pets.flies(look.pet);
      if (fly) ty -= 75;
      const ox = pet.x;
      pet.x += (tx - pet.x) * Math.min(1, dt * 7);
      pet.y += (ty - pet.y) * Math.min(1, dt * 9);
      const mv = pet.x - ox;
      pet.moving = Math.abs(mv) > 0.4 || Math.abs(ty - pet.y) > 3;
      if (Math.abs(mv) > 0.2) pet.facing = mv > 0 ? 1 : -1;
      else if (!pet.moving) pet.facing = P.x >= pet.x ? 1 : -1;
    },

    // ---------- находка ----------
    takeArt(a) {
      a.taken = true;
      this.lastArt = a;
      const left = this.arts.filter((x) => !x.taken).length;
      if (left === 0) {
        this.foundArtifact();
        return;
      }
      // не последняя — маленький праздник, играем дальше
      A.sfx('found');
      this.fx.burst('confetti', a.x, a.y - 30, 40, { speed: 480, g: 520, life: 1.6 });
      this.fx.burst('spark', a.x, a.y, 16, { speed: 260, size: 10, color: '#FFF3A0', life: 0.8 });
      this.partFound = { t: 0, id: a.id };
      this.hintUntil = 0;
      V.say('Ура! ' + D.artName(a.id) + '! ' + (left === 1 ? 'Осталась ещё одна находка!' : 'Осталось ещё ' + left + ' ' + U.plural(left, 'находка', 'находки', 'находок') + '!'));
    },

    foundArtifact() {
      const P = this.P;
      const a = this.lastArt;
      this.state = 'found';
      P.vx = 0;
      P.anim = 'cheer';
      const prog = S.roundProg(this.world, this.round);
      const first = prog.done.indexOf(this.sceneId) < 0;
      const allCoins = this.coinsGot >= this.coins.length;
      const bonus = first ? D.ARTIFACT_BONUS + 5 * (this.arts.length - 1) : D.ARTIFACT_BONUS_AGAIN;
      const coinBonus = allCoins ? D.ALL_COINS_BONUS : 0;
      S.addStars(bonus + coinBonus);
      if (first) prog.done.push(this.sceneId);
      prog.best[this.sceneId] = Math.max(prog.best[this.sceneId] || 0, this.coinsGot);
      S.save();
      this.found = {
        t: 0,
        sx: a.x - this.cam.x,
        sy: a.y - this.cam.y,
        id: a.id,
        bonus: bonus,
        coinBonus: coinBonus,
        coins: this.coinsGot,
        allCoins: allCoins,
        shown: 0,
        last: this.idx === this.scenes.length - 1,
      };
      A.sfx('found');
      V.say(this.scene.found + (allCoins ? ' ' + D.say.allCoins : ''));
      this.fx.burst('confetti', P.x, P.y - 120, 70, { speed: 600, g: 520, life: 2 });
    },

    updateFound(dt) {
      const f = this.found;
      f.t += dt;
      const P = this.P;
      P.anim = 'cheer';
      if (f.t > 0.7 && !f.c2) {
        f.c2 = true;
        this.hud.burst('confetti', VW.W / 2, VW.H * 0.35, 80, { speed: 650, g: 520, life: 2.2 });
      }
      // счётчик наград
      const total = f.coins + f.bonus + f.coinBonus;
      if (f.t > 1.6 && f.shown < total) {
        f.acc = (f.acc || 0) + dt;
        const rate = Math.max(0.025, 0.9 / total);
        while (f.acc > rate && f.shown < total) {
          f.acc -= rate;
          f.shown++;
          if (f.shown % 2 === 0 || total < 30) A.sfx('star', f.shown % 15);
        }
      }
    },

    next() {
      const f = this.found;
      A.sfx('magic');
      if (f && f.last) VW.go('hall', { world: this.world, round: this.round });
      else VW.go('map', { world: this.world, round: this.round, justDone: this.idx });
    },

    replay() {
      A.sfx('tap');
      VW.go('game', { world: this.world, round: this.round, idx: this.idx });
    },

    openPause() {
      if (this.state !== 'play') return;
      this.state = 'pause';
      this.pause = { t: 0 };
      UI.releaseAll();
      A.sfx('tap');
    },

    closePause() {
      this.state = 'play';
      this.pause = null;
      A.sfx('tap');
    },

    onKey(code) {
      if (this.state === 'play' && (code === 'Escape' || code === 'KeyP')) this.openPause();
      else if (this.state === 'pause') {
        if (code === 'Escape' || code === 'Enter' || code === 'Space') this.closePause();
      } else if (this.state === 'found' && this.found.t > 1.6) {
        if (code === 'Enter' || code === 'Space') this.next();
      }
    },

    // ---------- рисование ----------
    draw(ctx, W, H) {
      const L = this.L, cam = this.cam, t = this.t;
      const view = { x0: cam.x - 100, y0: cam.y - 100, x1: cam.x + W + 100, y1: cam.y + H + 100 };
      VW.Art.view = view;
      L.paintSky(ctx, cam, W, H, t);
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      if (L.paintBack) L.paintBack(ctx, t, view, this);
      // опоры площадок (стены домов, стебли) — позади лестниц
      for (const p of L.platforms) {
        if (p.base == null && !p.back) continue;
        if (p.x > view.x1 || p.x + p.w < view.x0 || p.top > view.y1 + 50 || (p.base || p.top + 60) < view.y0) continue;
        VW.Art.platformBack(ctx, p, t);
      }
      // платформы и лестницы
      for (const l of L.ladders) {
        if (l.x < view.x0 - 60 || l.x > view.x1 + 60 || l.bottom < view.y0 || l.top > view.y1) continue;
        VW.Art.ladder(ctx, l, t);
      }
      for (const p of L.platforms) {
        if (p.style === 'none') continue;
        if (p.x > view.x1 || p.x + p.w < view.x0 || p.top > view.y1 + 50 || p.top + (p.h || 40) < view.y0) continue;
        VW.Art.platform(ctx, p, t);
        if (p.squashT) p.squashT = Math.max(0, p.squashT - 1 / 60);
      }
      if (L.paintMid) L.paintMid(ctx, t, view, this);
      // монетки
      for (const c of this.coins) {
        if (c.taken || c.x < view.x0 || c.x > view.x1 || c.y < view.y0 || c.y > view.y1) continue;
        G.coin(ctx, c.x, c.y + Math.sin(t * 3 + c.x * 0.01) * 3, 17, c.spin);
      }
      // находки
      for (const a of this.arts) {
        if (a.taken || a.x < view.x0 - 60 || a.x > view.x1 + 60 || a.y < view.y0 - 60 || a.y > view.y1 + 60) continue;
        const bob = Math.sin(t * 2.5 + a.x * 0.01) * 6;
        I.drawArtifact(ctx, a.id, a.x, a.y + bob, 34, t, { glow: true });
      }
      // питомец и герой
      this.drawPet(ctx);
      this.drawPlayer(ctx);
      if (L.paintFront) L.paintFront(ctx, t, view, this);
      this.fx.draw(ctx);
      if (VW.debug) this.drawDebug(ctx);
      // стрелка-подсказка
      if (this.state === 'play' && (this.t < this.hintUntil || this.autoHinted)) this.drawHintArrow(ctx);
      ctx.restore();

      this.drawHUD(ctx, W, H);
      if (this.partFound && this.state === 'play') this.drawPartFound(ctx, W, H);
      if (this.state === 'play') this.drawControls(ctx, W, H);
      this.hud.draw(ctx);
      this.drawFlying(ctx);
      if (this.state === 'found') this.drawFound(ctx, W, H);
      if (this.state === 'pause') this.drawPause(ctx, W, H);
    },

    // «Нашла одну из находок» — плашка сверху
    drawPartFound(ctx, W, H) {
      const pf = this.partFound;
      const k = U.easeOutBack(U.clamp(pf.t / 0.35, 0, 1)) * U.clamp((2.6 - pf.t) / 0.3, 0, 1);
      if (k <= 0) return;
      const found = this.arts.filter((a) => a.taken).length;
      const txt = found + ' из ' + this.arts.length;
      ctx.save();
      ctx.translate(W / 2, 205);
      ctx.scale(k, k);
      G.panel(ctx, -150, -40, 300, 80, { r: 40, fill: '#FFF8E6', stroke: '#2FBF55', lw: 5, shadowY: 5 });
      G.glow(ctx, -95, 0, 60, '#FFF3A0', 0.6);
      I.drawArtifact(ctx, pf.id, -95, 0, 28, this.t, {});
      G.text(ctx, txt, 30, 2, 36, '#2F7A3A', { weight: 900 });
      ctx.restore();
    },

    drawPlayer(ctx) {
      const P = this.P;
      const look = S.data.look;
      // тень
      if (!P.ladder) {
        let gy = null;
        for (const p of this.L.platforms) {
          if (p.top >= P.y - 1 && this.overlapX(P.x, p) && (gy === null || p.top < gy)) gy = p.top;
        }
        if (gy !== null && gy - P.y < 400) {
          const k = 1 - (gy - P.y) / 400;
          G.ellipse(ctx, P.x, gy + 2, 24 * k + 6, 6 * k + 2);
          ctx.fillStyle = 'rgba(20,10,40,' + 0.22 * k + ')';
          ctx.fill();
        }
      }
      const speed = P.ladder ? 0 : P.vx;
      Hero.draw(ctx, P.x, P.y + P.visOff, look, { state: this.state === 'found' ? 'cheer' : P.anim || 'idle', t: this.t, phase: P.phase, facing: P.facing, speed: speed, squash: P.squash }, 1);
    },

    drawPet(ctx) {
      const look = S.data.look;
      if (!look.pet) return;
      const pet = this.pet;
      VW.Pets.draw(ctx, look.pet, pet.x, pet.y, { t: this.t, facing: pet.facing, moving: pet.moving, scale: 0.95 });
    },

    drawHintArrow(ctx) {
      const P = this.P, a = this.nextArt();
      if (!a) return;
      const hx = P.x, hy = P.y - 130;
      const ang = Math.atan2(a.y - hy, a.x - hx);
      const d = Math.hypot(a.x - hx, a.y - hy);
      if (d < 160) return;
      const bob = Math.sin(this.t * 6) * 8;
      const r = 60 + bob;
      ctx.save();
      ctx.translate(hx + Math.cos(ang) * r, hy + Math.sin(ang) * r);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(26, 0);
      ctx.lineTo(-8, -20);
      ctx.lineTo(-2, -7);
      ctx.lineTo(-24, -7);
      ctx.lineTo(-24, 7);
      ctx.lineTo(-2, 7);
      ctx.lineTo(-8, 20);
      ctx.closePath();
      ctx.fillStyle = '#FFD23F';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#B87800';
      ctx.stroke();
      ctx.restore();
      I.drawArtifact(ctx, a.id, hx, hy, 18, this.t, { sparkles: false });
    },

    drawDebug(ctx) {
      const L = this.L;
      ctx.lineWidth = 2;
      for (const p of L.platforms) {
        ctx.strokeStyle = p.bounce ? '#f0f' : p.move ? '#0af' : '#f00';
        ctx.beginPath();
        ctx.moveTo(p.x, p.top);
        ctx.lineTo(p.x + p.w, p.top);
        ctx.stroke();
      }
      ctx.strokeStyle = '#00f';
      for (const l of L.ladders) ctx.strokeRect(l.x - 20, l.top, 40, l.bottom - l.top);
      ctx.strokeStyle = '#0a0';
      for (const w of L.walls) ctx.strokeRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = '#fa0';
      for (const w of L.water) ctx.strokeRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(this.P.x - PW / 2, this.P.y - PH, PW, PH);
    },

    drawFlying(ctx) {
      for (const f of this.flying) {
        const k = U.easeInCubic(Math.min(1, f.t / 0.55));
        const x = U.lerp(f.x, 48, k), y = U.lerp(f.y, 45, k) - Math.sin(k * Math.PI) * 60;
        G.coin(ctx, x, y, 17 * (1 - k * 0.4), f.t * 20);
      }
    },

    drawHUD(ctx, W, H) {
      const t = this.t;
      VW.drawStarCounter(ctx);
      // монетки сцены
      const txt = this.coinsGot + ' / ' + this.coins.length;
      const tw = G.measure(ctx, txt, 22, 900);
      G.panel(ctx, 20, 84, tw + 62, 40, { r: 20, fill: 'rgba(255,255,255,0.85)', stroke: '#F2A900', lw: 2, shadowY: 3 });
      G.coin(ctx, 42, 104, 12, t * 3);
      G.text(ctx, txt, 62, 105, 22, '#6A4300', { align: 'left', weight: 900 });

      // «Найди:» — что ищем (нажми — подсказка голосом)
      if (this.state === 'play') {
        const n = this.arts.length;
        const bx = W / 2, by = 50;
        if (n === 1) {
          const pressed = UI.btnC('find', bx, by, 42, () => this.showHint());
          const s = pressed ? 0.93 : 1;
          G.circle(ctx, bx, by + 4, 42 * s);
          ctx.fillStyle = 'rgba(40,20,80,0.25)';
          ctx.fill();
          G.circle(ctx, bx, by, 42 * s);
          ctx.fillStyle = '#FFF8E6';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#F2A900';
          ctx.stroke();
          I.drawArtifact(ctx, this.arts[0].id, bx, by, 25 * s, t, { sparkles: false });
          G.circle(ctx, bx + 32, by + 30, 15);
        } else {
          const gap = 70, w = gap * n + 20, h = 76;
          const pressed = UI.btn('find', bx - w / 2, by - h / 2, w, h, () => this.showHint());
          const s = pressed ? 0.95 : 1;
          G.panel(ctx, bx - (w / 2) * s, by - (h / 2) * s, w * s, h * s, { r: 38 * s, fill: '#FFF8E6', stroke: '#F2A900', lw: 4, shadowY: 4 });
          this.arts.forEach((a, i) => {
            const ax = bx - ((n - 1) * gap) / 2 + i * gap;
            let k = 1;
            if (this.partFound && this.partFound.id === a.id) k = 1 + 0.35 * Math.sin(Math.min(1, this.partFound.t / 0.5) * Math.PI);
            ctx.globalAlpha = a.taken ? 1 : 0.9;
            I.drawArtifact(ctx, a.id, ax, by, 24 * s * k, t, { sparkles: false });
            ctx.globalAlpha = 1;
            if (a.taken) G.checkBadge(ctx, ax + 20, by + 20, 12);
          });
          G.circle(ctx, bx + w / 2 - 4, by + 30, 15);
        }
        const sx = n === 1 ? bx + 32 : bx + (70 * n + 20) / 2 - 4;
        ctx.fillStyle = '#FF9A3C';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        G.icon(ctx, 'speaker', sx, by + 30, 8, '#fff', false);
        // пауза
        VW.roundBtn(ctx, 'pause', W - 50, 50, 34, '#8C7BD8', 'pause', () => this.openPause(), 0.5);
      }
      // подсказка про клавиатуру
      if (this.showKeysHint && this.state === 'play' && this.playT < 12) {
        const a = Math.min(1, (12 - this.playT) / 0.5);
        ctx.globalAlpha = a;
        const x = W / 2 - 230, y = H - 92;
        G.panel(ctx, x, y, 460, 70, { r: 20, fill: 'rgba(255,255,255,0.92)', stroke: '#9B7BFF', lw: 3, shadowY: 4 });
        keyCap(ctx, x + 40, y + 35, 'left');
        keyCap(ctx, x + 88, y + 35, 'right');
        G.text(ctx, 'идти', x + 150, y + 36, 20, '#3B2A6B', { weight: 800 });
        G.rr(ctx, x + 198, y + 17, 90, 36, 8);
        ctx.fillStyle = '#EDE7FA';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#9B7BFF';
        ctx.stroke();
        G.text(ctx, 'прыжок', x + 243, y + 36, 16, '#3B2A6B', { weight: 800 });
        keyCap(ctx, x + 330, y + 35, 'up');
        keyCap(ctx, x + 378, y + 35, 'down');
        G.icon(ctx, 'ladderUp', x + 426, y + 35, 16, '#9B7BFF', false);
        ctx.globalAlpha = 1;
      }
    },

    drawControls(ctx, W, H) {
      const t = this.t;
      const touch = UI.touchMode || !this.showKeysHintEver();
      const alpha = touch ? 0.9 : 0.75;
      const s = touch ? 1 : 0.85;
      const btn = (id, cx, cy, r, color, icon, on) => {
        const held = UI.hold(id, cx, cy, r);
        const a = on === false ? 0.45 : alpha;
        const oy = G.roundButton(ctx, cx, cy, r * (held ? 0.95 : 1), color, held, a);
        ctx.globalAlpha = on === false ? 0.6 : 1;
        G.icon(ctx, icon, cx, cy + oy, r * 0.5, '#fff');
        ctx.globalAlpha = 1;
      };
      const by = H - 92 * s;
      btn('left', 92 * s, by, 64 * s, '#5B8DEF', 'left');
      btn('right', 92 * s + 150 * s, by, 64 * s, '#5B8DEF', 'right');
      const up = this.canClimbUp(), dn = this.canClimbDown();
      if (up) G.glow(ctx, W - 258 * s, H - 184 * s, 80 * s, '#FFE680', 0.4 + 0.25 * Math.sin(t * 6));
      btn('up', W - 258 * s, H - 184 * s, 52 * s, '#FF9A3C', 'ladderUp', up || null);
      btn('down', W - 258 * s, H - 64 * s, 46 * s, '#FF9A3C', 'ladderDown', dn);
      btn('jump', W - 100 * s, H - 104 * s, 78 * s, '#2FBF55', 'jump');
    },

    showKeysHintEver() {
      return !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches) && !UI.touchMode;
    },

    drawFound(ctx, W, H) {
      const f = this.found, t = this.t;
      const k = U.clamp(f.t / 1.1, 0, 1);
      ctx.fillStyle = 'rgba(30,15,70,' + 0.55 * U.clamp(f.t / 0.8, 0, 1) + ')';
      ctx.fillRect(0, 0, W, H);
      UI.blocker(null);
      const panelK = U.easeOutBack(U.clamp((f.t - 1.0) / 0.45, 0, 1));
      const pw = Math.min(640, W - 60), ph = 500;
      const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
      // артефакт летит в центр карточки
      const ax = U.lerp(f.sx, W / 2, U.easeInOut(k));
      const ay = U.lerp(f.sy, py + 165, U.easeInOut(k)) - Math.sin(k * Math.PI) * 80;
      const as = U.lerp(34, 70, U.easeOutBack(k));
      if (panelK > 0) {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(panelK, panelK);
        ctx.translate(-W / 2, -H / 2);
        G.panel(ctx, px, py, pw, ph, { r: 36, fill: '#FFF8E6', stroke: '#F2A900', lw: 6, shadowY: 10 });
        ctx.restore();
      }
      G.glow(ctx, ax, ay, as * 2, '#FFF3A0', panelK > 0 ? 0.45 : 0.7);
      G.rays(ctx, ax, ay, as * 1.9, t * 0.7, '#FFE680', 14, panelK > 0 ? 0.3 : 0.4);
      I.drawArtifact(ctx, f.id, ax, ay, as, t, {});
      if (this.arts.length > 1 && panelK > 0) {
        // остальные находки сцены — по бокам
        const others = this.arts.filter((a) => a !== this.lastArt);
        others.forEach((a, j) => {
          const k2 = U.easeOutBack(U.clamp((f.t - 1.25 - j * 0.15) / 0.4, 0, 1));
          if (k2 <= 0) return;
          const ox = W / 2 + (j === 0 ? -1 : 1) * 150 * panelK, oy = H / 2 + (py + 175 - H / 2) * panelK;
          G.glow(ctx, ox, oy, 70 * k2, '#FFF3A0', 0.4);
          I.drawArtifact(ctx, a.id, ox, oy, 40 * k2 * panelK, t, {});
        });
      }
      if (panelK > 0) {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(panelK, panelK);
        ctx.translate(-W / 2, -H / 2);
        G.text(ctx, 'Ура!', W / 2, py + 48, 50, '#FF4F9A', { weight: 900, stroke: '#fff', lw: 9 });
        // награды
        const rows = [['coins', f.coins, this.coins.length], ['art', f.bonus]];
        if (f.coinBonus) rows.push(['all', f.coinBonus]);
        let y = py + 272;
        let shown = f.shown;
        for (const r of rows) {
          const val = r[1];
          const v = Math.max(0, Math.min(val, shown));
          shown -= val;
          const lx = W / 2 - 160;
          if (r[0] === 'coins') {
            G.coin(ctx, lx, y, 18, t * 3);
            G.text(ctx, r[1] + ' / ' + r[2], lx + 30, y + 1, 28, '#6A4300', { align: 'left', weight: 900 });
          } else if (r[0] === 'art') {
            I.drawArtifact(ctx, f.id, lx, y, 20, t, { sparkles: false });
            G.text(ctx, this.arts.length > 1 ? 'Все находки' : D.artName(f.id), lx + 30, y + 1, 24, '#6A4300', { align: 'left', weight: 800, maxW: 190 });
          } else {
            G.coin(ctx, lx - 8, y, 13, 0);
            G.coin(ctx, lx + 8, y, 13, 0.5);
            G.text(ctx, 'все!', lx + 30, y + 1, 28, '#2FBF55', { align: 'left', weight: 900 });
          }
          G.starIcon(ctx, W / 2 + 110, y, 18);
          G.text(ctx, '+' + v, W / 2 + 134, y + 1, 32, '#E08A00', { align: 'left', weight: 900 });
          y += 46;
        }
        if (f.t > 1.6) {
          const by = py + ph - 62;
          VW.roundBtn(ctx, 'replay', W / 2 - 130, by, 40, '#FF9A3C', 'replay', () => this.replay(), 0.55);
          G.glow(ctx, W / 2 + 40, by, 110, '#B6FFB0', 0.5);
          VW.roundBtn(ctx, 'next', W / 2 + 40, by, 56, '#2FBF55', 'play', () => this.next(), 0.62);
        }
        ctx.restore();
      }
    },

    drawPause(ctx, W, H) {
      const p = this.pause;
      ctx.fillStyle = 'rgba(30,15,70,0.55)';
      ctx.fillRect(0, 0, W, H);
      UI.blocker(null);
      const k = U.easeOutBack(Math.min(1, p.t / 0.3));
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(k, k);
      ctx.translate(-W / 2, -H / 2);
      const pw = 520, ph = 300;
      const px = W / 2 - pw / 2, py = H / 2 - ph / 2;
      G.panel(ctx, px, py, pw, ph, { r: 36, fill: '#FFF8E6', stroke: '#9B7BFF', lw: 6, shadowY: 10 });
      G.icon(ctx, 'pause', W / 2, py + 58, 26, '#9B7BFF', false);
      const by = py + ph - 110;
      VW.roundBtn(ctx, 'pHome', W / 2 - 160, by, 44, '#8C7BD8', 'map', () => {
        A.sfx('back');
        VW.go('map', { world: this.world, round: this.round });
      }, 0.55);
      G.glow(ctx, W / 2, by, 120, '#B6FFB0', 0.5);
      VW.roundBtn(ctx, 'pPlay', W / 2, by, 64, '#2FBF55', 'play', () => this.closePause(), 0.62);
      VW.musicBtn(ctx, 'pMusic', W / 2 + 160, by, 44);
      ctx.restore();
    },
  });

  function keyCap(ctx, x, y, dir) {
    G.rr(ctx, x - 20, y - 18, 40, 36, 8);
    ctx.fillStyle = '#EDE7FA';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#9B7BFF';
    ctx.stroke();
    G.icon(ctx, dir, x, y, 10, '#5B3FB8', false);
  }

  void GAME;
})(window.VW);
