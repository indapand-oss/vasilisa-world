/* Vasilisa World — финал мира: праздничный зал, звёздочки выстраиваются столбиками */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, UI = VW.UI, D = VW.Data, S = VW.Store, A = VW.Audio, V = VW.Voice, Hero = VW.Hero, I = VW.Items;
  const TAU = Math.PI * 2;
  const FLAG = ['#FF4F9A', '#FFC21A', '#2FA8F0', '#2FBF55', '#9A55E8', '#FF8C1A'];

  VW.screens = VW.screens || {};

  const HALL = (VW.screens.hall = {
    subtitlePos: 'bottom',

    enter(p) {
      this.world = (p && p.world) || 'magic';
      const prog = S.world(this.world);
      this.t = 0;
      this.fx = new VW.Particles();
      this.counts = D.scenes.map((s) => prog.best[s.id] || 0);
      this.total = this.counts.reduce((a, b) => a + b, 0);
      this.bonus = 0;
      if (!prog.bonusGiven && D.scenes.every((s) => prog.done.indexOf(s.id) >= 0)) {
        prog.bonusGiven = true;
        prog.finished = true;
        this.bonus = D.WORLD_BONUS;
        S.addStars(this.bonus);
        S.save();
      }
      // очередь звёзд: столбик за столбиком
      this.queue = [];
      this.counts.forEach((n, col) => {
        for (let k = 0; k < n; k++) this.queue.push({ col: col, k: k });
      });
      this.stacked = this.counts.map(() => 0);
      this.falling = [];
      this.shown = 0;
      this.spawnAcc = 0;
      this.interval = U.clamp(3.5 / Math.max(1, this.total), 0.035, 0.14);
      this.phase = 'intro';
      this.doneT = 0;
      this.fireT = 0;
      this.balloons = [];
      for (let i = 0; i < 8; i++) this.balloons.push({ x: Math.random(), y: 0.2 + Math.random() * 0.6, c: FLAG[i % FLAG.length], ph: Math.random() * 6, v: 0.02 + Math.random() * 0.02 });
      A.music('hall');
      A.sfx('found');
      V.say(D.say.hall);
    },

    colX(i, W) {
      const n = this.counts.length;
      const x0 = W * 0.27, x1 = W * 0.83;
      return n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1);
    },

    layout(W, H) {
      const maxRows = Math.max(1, Math.ceil(Math.max.apply(null, this.counts) / 2));
      const top = 200, base = H - 200;
      const step = Math.min(24, (base - top) / maxRows);
      return { base: base, step: step, r: Math.max(7, Math.min(13, step * 0.6)) };
    },

    slot(col, k, W, H) {
      const lay = this.layout(W, H);
      const row = Math.floor(k / 2);
      const side = k % 2 === 0 ? -1 : 1;
      return [this.colX(col, W) + side * lay.r * 1.05, lay.base - lay.r - row * lay.step];
    },

    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      const W = VW.W, H = VW.H;
      for (const b of this.balloons) {
        b.y -= b.v * dt;
        if (b.y < -0.2) {
          b.y = 1.1;
          b.x = Math.random();
        }
      }
      if (this.phase === 'intro' && this.t > 1.4) this.phase = 'stars';
      if (this.phase === 'stars') {
        this.spawnAcc += dt;
        while (this.spawnAcc > this.interval && this.queue.length) {
          this.spawnAcc -= this.interval;
          const q = this.queue.shift();
          const [tx, ty] = this.slot(q.col, q.k, W, H);
          this.falling.push({ col: q.col, k: q.k, x: tx + U.rand(-40, 40), y: -30, tx: tx, ty: ty, t: 0 });
        }
        for (const f of this.falling) {
          f.t += dt;
          const k = Math.min(1, f.t / 0.45);
          f.cx = U.lerp(f.x, f.tx, U.easeOutCubic(k));
          f.cy = U.lerp(f.y, f.ty, k * k);
          if (k >= 1 && !f.done) {
            f.done = true;
            this.stacked[f.col]++;
            this.shown++;
            A.sfx('star', this.shown % 15);
            if (this.shown % 3 === 0) this.fx.burst('spark', f.tx, f.ty, 3, { speed: 90, size: 7, color: '#FFF3A0', life: 0.4 });
          }
        }
        this.falling = this.falling.filter((f) => !f.done);
        if (!this.queue.length && !this.falling.length) {
          this.phase = 'done';
          this.doneT = 0;
          A.sfx('found');
          V.say(D.say.hallCount + ' Всего звёздочек: ' + this.total + '!');
          this.fx.burst('confetti', W / 2, H * 0.3, 80, { speed: 700, g: 500, life: 2.5 });
        }
      }
      if (this.phase === 'done') {
        this.doneT += dt;
        this.fireT -= dt;
        if (this.fireT <= 0) {
          this.fireT = 0.55 + Math.random() * 0.5;
          const fx = U.rand(W * 0.15, W * 0.85), fy = U.rand(70, 220);
          const col = U.pick(FLAG);
          this.fx.burst('spark', fx, fy, 28, { speed: 320, speedMin: 150, size: 9, color: col, life: 1.1, g: 120, drag: 1.4 });
          this.fx.burst('glow', fx, fy, 1, { speed: 1, size: 60, color: col, life: 0.5 });
          A.sfx('firework');
        }
      }
      // конфетти сыплется всё время
      if (Math.random() < dt * 10) {
        this.fx.add({ type: 'confetti', x: U.rand(0, W), y: -10, vx: U.rand(-20, 20), vy: U.rand(60, 120), g: 30, drag: 0.2, life: 6, size: U.rand(6, 11), color: U.pick(FLAG), rot: U.rand(0, TAU), vr: U.rand(-4, 4) });
      }
    },

    onKey(code) {
      if (this.phase !== 'done') return;
      if (code === 'Enter' || code === 'Space' || code === 'Escape') this.home();
    },

    home() {
      A.sfx('back');
      VW.go('worlds');
    },

    toMap() {
      A.sfx('tap');
      VW.go('map', {});
    },

    draw(ctx, W, H) {
      const t = this.t;
      // стены
      G.sky(ctx, W, H, ['#FFE9CC', '#FFD9B0', '#FFCFA0']);
      // окна с ночным небом
      const nWin = Math.max(3, Math.round(W / 300));
      for (let i = 0; i < nWin; i++) {
        const wx = ((i + 0.5) * W) / nWin - 70, wy = 150, ww = 140, wh = 250;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(wx, wy + wh);
        ctx.lineTo(wx, wy + 70);
        ctx.arc(wx + ww / 2, wy + 70, ww / 2, Math.PI, 0);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.closePath();
        ctx.fillStyle = G.vGrad(ctx, wy, wy + wh, ['#1B1646', '#4B3A9A']);
        ctx.fill();
        ctx.clip();
        G.nightStars(ctx, ww, wh, t, 13 + i, 10, -wx, -wy);
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(wx, wy + wh);
        ctx.lineTo(wx, wy + 70);
        ctx.arc(wx + ww / 2, wy + 70, ww / 2, Math.PI, 0);
        ctx.lineTo(wx + ww, wy + wh);
        ctx.closePath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#C98B4F';
        ctx.stroke();
      }
      // гирлянды с флажками
      for (const [y0, sag, off] of [[18, 60, 0], [8, 90, 3]]) {
        const n = Math.round(W / 60);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.quadraticCurveTo(W / 2, y0 + sag * 2, W, y0);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#8A5A2B';
        ctx.stroke();
        for (let i = 1; i < n; i++) {
          const k = i / n;
          const x = k * W;
          const y = (1 - k) * (1 - k) * y0 + 2 * (1 - k) * k * (y0 + sag * 2) + k * k * y0;
          const sw = Math.sin(t * 2 + i) * 3;
          ctx.beginPath();
          ctx.moveTo(x - 14, y);
          ctx.lineTo(x + 14, y);
          ctx.lineTo(x + sw, y + 32);
          ctx.closePath();
          ctx.fillStyle = FLAG[(i + off) % FLAG.length];
          ctx.fill();
        }
      }
      // шарики
      for (const b of this.balloons) {
        const x = b.x * W + Math.sin(t + b.ph) * 20, y = b.y * H;
        ctx.beginPath();
        ctx.moveTo(x, y + 34);
        ctx.quadraticCurveTo(x + 8, y + 60, x, y + 90);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(90,60,40,0.6)';
        ctx.stroke();
        G.ellipse(ctx, x, y, 26, 32);
        ctx.fillStyle = b.c;
        ctx.fill();
        G.ellipse(ctx, x - 8, y - 12, 6, 9, -0.4);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      }

      // праздничный стол
      const ty = H - 128;
      G.rr(ctx, 150, ty, W - 170, 34, 10);
      Art_fs(ctx, '#FF9EC8', '#C2185B', 3);
      ctx.fillStyle = '#fff';
      for (let x = 170; x < W - 30; x += 36) {
        G.circle(ctx, x, ty + 17, 4);
        ctx.fill();
      }
      ctx.fillStyle = '#FFB8D8';
      ctx.fillRect(160, ty + 34, W - 190, H - ty);
      ctx.fillStyle = 'rgba(194,24,91,0.25)';
      for (let x = 190; x < W - 40; x += 90) ctx.fillRect(x, ty + 34, 6, H - ty);
      // угощения
      this.drawTreats(ctx, W, ty, t);

      // столбики звёзд
      const lay = this.layout(W, H);
      for (let i = 0; i < this.counts.length; i++) {
        const cx = this.colX(i, W);
        // подставка с артефактом
        G.ellipse(ctx, cx, lay.base + 42, 44, 10);
        ctx.fillStyle = 'rgba(120,60,20,0.25)';
        ctx.fill();
        G.rr(ctx, cx - 38, lay.base + 4, 76, 36, 12);
        Art_fs(ctx, '#FFF8E6', '#F2A900', 3);
        I.drawArtifact(ctx, D.scenes[i].artifact, cx, lay.base - 2 + 20, 20, t + i, { sparkles: false });
        for (let k = 0; k < this.stacked[i]; k++) {
          const [sx, sy] = this.slot(i, k, W, H);
          G.starSprite(ctx, sx, sy, lay.r);
        }
        // число над столбиком
        if (this.stacked[i] > 0) {
          const [, topY] = this.slot(i, Math.max(0, this.stacked[i] - 1), W, H);
          G.text(ctx, String(this.stacked[i]), cx, topY - lay.r - 16, 24, '#6A4300', { weight: 900, stroke: '#fff', lw: 6 });
        }
      }
      for (const f of this.falling) {
        if (f.cx == null) continue;
        G.starIcon(ctx, f.cx, f.cy, lay.r * 1.2, { rot: f.t * 8 });
      }

      // герой танцует
      const look = S.data.look;
      const hx = 80, hy = H - 36;
      Hero.draw(ctx, hx, hy, look, { state: this.phase === 'done' ? 'dance' : 'cheer', t: t, facing: 1 }, 1.45);
      if (look.pet) VW.Pets.draw(ctx, look.pet, hx + 70, hy - (VW.Pets.flies(look.pet) ? 150 : 0) - Math.abs(Math.sin(t * 5)) * 8, { t: t, facing: -1, scale: 1.2, moving: true });

      this.fx.draw(ctx);

      // заголовок и общий счёт
      const tk = U.easeOutBack(Math.min(1, this.t / 0.6));
      ctx.save();
      ctx.translate(W / 2, 78);
      ctx.scale(tk, tk);
      VW.drawTitle(ctx, 'Праздник!', 0, 0, Math.min(84, W / 11), t, 1);
      ctx.restore();
      const txt = String(this.shown);
      const pw = 130 + G.measure(ctx, txt, 44, 900);
      G.panel(ctx, W / 2 - pw / 2, 128, pw, 64, { r: 32, fill: '#fff', stroke: '#F2A900', lw: 4, shadowY: 5 });
      G.starIcon(ctx, W / 2 - pw / 2 + 40, 160, 24, { rot: Math.sin(t * 3) * 0.2 });
      G.text(ctx, txt, W / 2 - pw / 2 + 76, 162, 44, '#6A4300', { align: 'left', weight: 900 });

      if (this.phase === 'done') {
        // подарок за весь мир
        if (this.bonus) {
          const k = U.easeOutBack(Math.min(1, this.doneT / 0.5));
          ctx.save();
          ctx.translate(W / 2 + pw / 2 + 70, 160);
          ctx.scale(k, k);
          G.panel(ctx, -56, -26, 112, 52, { r: 26, fill: '#2FBF55', stroke: '#fff', lw: 3, shadowY: 4 });
          G.starIcon(ctx, -26, 0, 17);
          G.text(ctx, '+' + this.bonus, 14, 2, 26, '#fff', { weight: 900 });
          ctx.restore();
        }
        if (this.doneT > 0.8) {
          VW.roundBtn(ctx, 'hallHome', W - 56, 56, 40, '#8C7BD8', 'home', () => this.home(), 0.55);
          VW.roundBtn(ctx, 'hallMap', W - 150, 56, 40, '#FF9A3C', 'map', () => this.toMap(), 0.55);
        }
      }
    },

    drawTreats(ctx, W, ty, t) {
      // торт и сладости — между подставками со столбиками
      const cx = (this.colX(1, W) + this.colX(2, W)) / 2;
      I.drawCake(ctx, cx, ty - 34, 40, t);
      const xs = [W * 0.19, (this.colX(0, W) + this.colX(1, W)) / 2, (this.colX(2, W) + this.colX(3, W)) / 2, (this.colX(3, W) + this.colX(4, W)) / 2, W * 0.92];
      xs.forEach((x, i) => {
        if (i % 3 === 0) {
          // кекс
          ctx.beginPath();
          ctx.moveTo(x - 16, ty - 22);
          ctx.lineTo(x + 16, ty - 22);
          ctx.lineTo(x + 12, ty);
          ctx.lineTo(x - 12, ty);
          ctx.closePath();
          Art_fs(ctx, '#E0A868', '#8A5A2B', 2);
          G.circle(ctx, x, ty - 28, 16);
          Art_fs(ctx, FLAG[i % FLAG.length], '#8A3A5A', 2);
          G.circle(ctx, x, ty - 44, 5);
          Art_fs(ctx, '#FF3A3A');
        } else if (i % 3 === 1) {
          // ваза с фруктами
          ctx.beginPath();
          ctx.ellipse(x, ty - 12, 28, 14, 0, 0, Math.PI);
          ctx.closePath();
          Art_fs(ctx, '#9EC9F5', '#3A6EA8', 2);
          for (const [dx, c] of [[-12, '#FF5A5A'], [0, '#FFD23F'], [12, '#7CD36A']]) {
            G.circle(ctx, x + dx, ty - 20, 10);
            Art_fs(ctx, c, U.shade(c, -0.4), 1.5);
          }
        } else {
          // стакан с соком
          G.rr(ctx, x - 11, ty - 38, 22, 38, 5);
          Art_fs(ctx, 'rgba(220,240,255,0.9)', '#6B7A8A', 2);
          G.rr(ctx, x - 9, ty - 26, 18, 24, 4);
          Art_fs(ctx, i % 2 ? '#FF8A3C' : '#FF5A9E');
          ctx.beginPath();
          ctx.moveTo(x + 4, ty - 36);
          ctx.lineTo(x + 12, ty - 54);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#2FA8F0';
          ctx.stroke();
        }
      });
    },
  });

  function Art_fs(ctx, fill, stroke, lw) {
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = lw || 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  void HALL;
})(window.VW);
