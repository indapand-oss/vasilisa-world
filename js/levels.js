/* Vasilisa World — сцены мира волшебной школы */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G, Art = VW.Art, A = VW.Audio;
  const Lv = (VW.Levels = {});
  const TAU = Math.PI * 2;
  const fs = Art.fs;

  function row(x0, x1, y, n) {
    const a = [];
    for (let i = 0; i < n; i++) a.push([n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1), y]);
    return a;
  }

  // Параллакс-слой: насколько камера поднялась над нижним краем уровня
  function camUp(L, cam, SH) {
    return Math.max(0, L.h - SH - cam.y);
  }

  // Далёкие горы на фоне (экранные координаты)
  function farMountains(ctx, cam, SW, SH, up, color, base, amp, f, seed) {
    const y0 = SH - base + up * f;
    if (y0 - amp * 1.6 > SH) return;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-10, SH + 10);
    const off = cam.x * f;
    for (let x = -10; x <= SW + 40; x += 30) {
      const wx = x + off;
      const y = y0 - amp * (0.55 + 0.45 * Math.sin(wx * 0.0042 + seed)) - amp * 0.35 * Math.abs(Math.sin(wx * 0.011 + seed * 2));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(SW + 40, SH + 10);
    ctx.closePath();
    ctx.fill();
  }

  function skyClouds(ctx, cam, SW, SH, up, t, list, f, color) {
    for (const c of list) {
      const span = SW + c.w + 200;
      let x = (c.x - cam.x * f + t * c.v) % span;
      if (x < 0) x += span;
      x -= c.w + 100;
      const y = c.y + up * f;
      if (y > SH + 50) continue;
      G.cloud(ctx, x, y, c.w, c.h, color || 'rgba(255,255,255,0.95)');
    }
  }

  // =========================================================
  // Сцена 1: Волшебное дерево (эскиз 3)
  // =========================================================
  Lv.tree = function () {
    const W = 2600, H = 1560, GY = 1380;
    const L = { id: 'tree', w: W, h: H, spawn: [250, GY], spawnFacing: 1 };
    const LAD_X = 790;

    L.platforms = [
      { x: 0, y: GY, w: 1180, h: H - GY, style: 'grass' },
      { x: 1180, y: GY + 50, w: 540, h: H - GY - 50, style: 'none' }, // дно пруда
      { x: 1720, y: GY, w: 880, h: H - GY, style: 'grass' },
      { x: 38, y: GY - 45, w: 92, h: 45, style: 'mushroom', bounce: true },
      // ветки
      { x: 650, y: 1150, w: 360, style: 'branch', leaves: 'R' },
      { x: 250, y: 1110, w: 220, style: 'branch', leaves: 'L' },
      { x: 240, y: 960, w: 200, style: 'branch', leaves: 'L' },
      { x: 440, y: 800, w: 390, h: 22, style: 'plank' }, // пол домика
      { x: 250, y: 640, w: 180, style: 'branch', leaves: 'L' },
      { x: 320, y: 490, w: 200, style: 'branch', leaves: 'L' },
      { x: 820, y: 600, w: 260, style: 'branch', leaves: 'R' },
      { x: 715, y: 120, w: 170, h: 22, style: 'plank' }, // смотровая площадка
      // облака
      { x: 900, y: 210, w: 190, style: 'cloud' },
      { x: 1130, y: 250, w: 190, style: 'cloud' },
      { x: 1390, y: 190, w: 190, style: 'cloud' },
      { x: 1650, y: 290, w: 190, style: 'cloud' },
      { x: 1910, y: 390, w: 190, style: 'cloud' },
      { x: 2170, y: 500, w: 190, style: 'cloud' },
      // уступы горы
      { x: 2300, y: 660, w: 140, style: 'rock' },
      { x: 2180, y: 830, w: 150, style: 'rock' },
      { x: 2400, y: 960, w: 160, style: 'rock' },
      { x: 2160, y: 1100, w: 150, style: 'rock' },
      { x: 2380, y: 1230, w: 180, style: 'rock' },
    ];
    L.ladders = [{ x: LAD_X, top: 120, bottom: GY }];
    L.water = [{ x: 1180, y: GY + 12, w: 540, h: H - GY }];
    L.artifact = { x: 590, y: 738 };
    L.coins = [].concat(
      [[330, 1330], [420, 1330], [560, 1330], [690, 1330], [900, 1330], [1000, 1330], [1100, 1330]],
      [[84, 1210], [84, 1120], [84, 1030], [84, 940]],
      row(300, 440, 1060, 3),
      [[700, 1100], [880, 1100], [960, 1100]],
      row(290, 390, 910, 2),
      [[480, 750], [700, 750]],
      row(300, 390, 590, 2),
      row(370, 470, 440, 2),
      row(880, 1040, 550, 3),
      [[LAD_X, 1000], [LAD_X, 380], [LAD_X, 260]],
      [[760, 70], [845, 70]],
      [[995, 160], [1225, 200], [1485, 140], [1745, 240], [2005, 340], [2265, 450]],
      [[2370, 610], [2255, 780], [2480, 910], [2235, 1050], [2470, 1180]],
      [[1300, 1320], [1380, 1282], [1450, 1268], [1520, 1282], [1600, 1320]],
      [[2175, 1330], [2235, 1330]]
    );

    // дверка в корне дерева оживает от касания
    const door = { x: 520, y: 1270, w: 80, h: 110, open: 0, t: 0 };
    door.onTouch = (game) => {
      if (door.opened) return;
      door.opened = true;
      A.sfx('door');
      game.fx.burst('spark', 560, 1320, 14, { speed: 220, size: 10, color: '#FFE27A' });
    };
    L.props = [door];

    // декорации
    const r = U.rng(42);
    const flowers = [];
    const FC = ['#FF5A9E', '#FFD23F', '#FF8C1A', '#B983FF', '#FFFFFF', '#5AC8FA'];
    for (let i = 0; i < 70; i++) {
      const x = 20 + r() * (W - 40);
      if (x > 1150 && x < 1750) continue;
      flowers.push([x, GY + 4 + r() * 4, 4 + r() * 3, FC[Math.floor(r() * FC.length)]]);
    }
    const foliage = [];
    for (let i = 0; i < 26; i++) {
      const a = r() * TAU, d = Math.sqrt(r());
      foliage.push([570 + Math.cos(a) * d * 330, 470 + Math.sin(a) * d * 300, 90 + r() * 90]);
    }
    const fruits = [];
    for (let i = 0; i < 18; i++) {
      const a = r() * TAU, d = 0.3 + r() * 0.7;
      fruits.push([570 + Math.cos(a) * d * 360, 470 + Math.sin(a) * d * 330, r() > 0.5 ? '#FF5A5A' : '#FF9EC8']);
    }
    const fish = [
      { x: 1260, y: 1455, dir: 1, v: 45, c: '#FF8C1A', s: 14 },
      { x: 1500, y: 1470, dir: -1, v: 35, c: '#FFD23F', s: 11 },
      { x: 1650, y: 1450, dir: -1, v: 55, c: '#FF5A9E', s: 12 },
      { x: 1380, y: 1480, dir: 1, v: 30, c: '#5AC8FA', s: 10 },
    ];
    const clouds = [
      { x: 100, y: 60, w: 220, h: 70, v: 6 },
      { x: 700, y: 150, w: 170, h: 60, v: 9 },
      { x: 1300, y: 40, w: 260, h: 80, v: 5 },
    ];

    L.paintSky = function (ctx, cam, SW, SH, t) {
      G.sky(ctx, SW, SH, ['#56B4FF', '#A6DCFF', '#E4F6FF']);
      const up = camUp(L, cam, SH);
      const sy = 110 + up * 0.04;
      G.glow(ctx, SW - 150, sy, 170, '#FFF3A0', 0.85);
      G.circle(ctx, SW - 150, sy, 52);
      ctx.fillStyle = '#FFE45C';
      ctx.fill();
      skyClouds(ctx, cam, SW, SH, up, t, clouds, 0.15);
      farMountains(ctx, cam, SW, SH, up, '#B7C6F5', 230, 170, 0.12, 1);
      farMountains(ctx, cam, SW, SH, up, '#9FD69A', 120, 70, 0.3, 4);
    };

    L.paintBack = function (ctx, t, v) {
      // гора справа
      if (v.x1 > 1950) {
        ctx.beginPath();
        ctx.moveTo(1960, GY + 10);
        ctx.quadraticCurveTo(2160, 900, 2330, 610);
        ctx.lineTo(2380, 590);
        ctx.quadraticCurveTo(2500, 800, 2620, 1100);
        ctx.lineTo(2620, GY + 10);
        ctx.closePath();
        fs(ctx, '#A396CC', '#6E6399', 4);
        ctx.beginPath();
        ctx.moveTo(2380, 590);
        ctx.quadraticCurveTo(2500, 800, 2620, 1100);
        ctx.lineTo(2620, GY + 10);
        ctx.lineTo(2420, GY + 10);
        ctx.quadraticCurveTo(2440, 900, 2380, 590);
        ctx.closePath();
        ctx.fillStyle = '#8E81BA';
        ctx.fill();
        // снежная шапка
        ctx.beginPath();
        ctx.moveTo(2290, 680);
        ctx.lineTo(2330, 610);
        ctx.lineTo(2380, 590);
        ctx.lineTo(2425, 660);
        ctx.lineTo(2400, 690);
        ctx.lineTo(2370, 668);
        ctx.lineTo(2340, 700);
        ctx.lineTo(2315, 672);
        ctx.closePath();
        fs(ctx, '#FFFFFF', '#C9C0E6', 2);
        // пещера
        ctx.beginPath();
        ctx.moveTo(2130, GY + 2);
        ctx.quadraticCurveTo(2135, 1250, 2205, 1245);
        ctx.quadraticCurveTo(2275, 1250, 2280, GY + 2);
        ctx.closePath();
        fs(ctx, '#3E3560', '#5E547A', 4);
        Art.lantern(ctx, 2205, 1290, 14, t);
      }

      // крона — большая, как на эскизе
      if (v.x0 < 1000 && v.y0 < 950) {
        // каждый слой — одним путём: так пиксели красятся один раз (быстрее на планшете)
        const layer = (color, dx, dy, dr, kr) => {
          ctx.beginPath();
          for (const f of foliage) {
            const x = f[0] + dx * f[2], y = f[1] + dy * f[2] + (dr ? 10 : 0), rr = f[2] * kr + dr;
            ctx.moveTo(x + rr, y);
            ctx.arc(x, y, rr, 0, TAU);
          }
          ctx.fillStyle = color;
          ctx.fill();
        };
        layer('#2F8A38', 0, 0, 14, 1);
        layer('#44AE48', 0, 0, 0, 1);
        layer('#62C95A', -0.25, -0.3, 0, 0.55);
        // листочки-овалы (как на рисунке)
        ctx.fillStyle = '#86DB72';
        ctx.beginPath();
        for (let i = 0; i < foliage.length; i++) {
          const f = foliage[i];
          ctx.moveTo(f[0] + 44, f[1] + 20);
          ctx.ellipse(f[0] + 30, f[1] + 20, 14, 7, i, 0, TAU);
        }
        ctx.fill();
        for (const fr of fruits) {
          G.circle(ctx, fr[0], fr[1], 9);
          ctx.fillStyle = fr[2];
          ctx.fill();
          G.circle(ctx, fr[0] - 3, fr[1] - 3, 3);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();
        }
      }

      // ствол и две большие ветви (развилка)
      if (v.x0 < 900) {
        ctx.beginPath();
        ctx.moveTo(430, GY + 4);
        ctx.quadraticCurveTo(480, 1330, 485, 1200);
        ctx.lineTo(500, 860);
        ctx.quadraticCurveTo(430, 700, 360, 560);
        ctx.lineTo(430, 540);
        ctx.quadraticCurveTo(500, 690, 560, 800);
        ctx.quadraticCurveTo(630, 690, 720, 530);
        ctx.lineTo(790, 560);
        ctx.quadraticCurveTo(690, 720, 630, 860);
        ctx.lineTo(640, 1200);
        ctx.quadraticCurveTo(650, 1330, 710, GY + 4);
        ctx.closePath();
        fs(ctx, '#8B5A2B', '#5A3515', 4);
        // кора
        ctx.beginPath();
        for (const [x, y0, y1] of [[520, 900, 1150], [560, 950, 1250], [600, 880, 1100], [535, 1180, 1330], [615, 1150, 1320]]) {
          ctx.moveTo(x, y0);
          ctx.quadraticCurveTo(x + 8, (y0 + y1) / 2, x - 2, y1);
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(70,40,15,0.45)';
        ctx.stroke();
        // дупло-сучок
        G.ellipse(ctx, 575, 1010, 16, 22);
        fs(ctx, '#4A2C10', '#3A220A', 3);
        // дверка в корне
        const op = door.opened ? Math.min(1, (door.t || 0) * 2) : 0;
        if (door.opened) door.t = (door.t || 0) + 1 / 60;
        ctx.beginPath();
        ctx.moveTo(525, GY);
        ctx.lineTo(525, 1305);
        ctx.quadraticCurveTo(560, 1262, 595, 1305);
        ctx.lineTo(595, GY);
        ctx.closePath();
        fs(ctx, op > 0 ? '#FFE9A8' : '#5A3515', '#3A220A', 3);
        if (op > 0) {
          G.glow(ctx, 560, 1330, 60, '#FFE27A', 0.5);
          // крошечная мышка машет из домика
          G.circle(ctx, 560, 1352, 11);
          fs(ctx, '#B8B0C8', '#6E6690', 2);
          G.circle(ctx, 552, 1341, 5);
          fs(ctx, '#FFB3CE', '#6E6690', 1.5);
          G.circle(ctx, 568, 1341, 5);
          fs(ctx, '#FFB3CE', '#6E6690', 1.5);
          G.circle(ctx, 557, 1351, 1.6);
          ctx.fillStyle = '#222';
          ctx.fill();
          G.circle(ctx, 564, 1351, 1.6);
          ctx.fill();
        }
        ctx.save();
        ctx.translate(595, 0);
        ctx.scale(1 - op * 0.75, 1);
        ctx.translate(-595, 0);
        ctx.beginPath();
        ctx.moveTo(525, GY);
        ctx.lineTo(525, 1305);
        ctx.quadraticCurveTo(560, 1262, 595, 1305);
        ctx.lineTo(595, GY);
        ctx.closePath();
        fs(ctx, '#C98B4F', '#5A3515', 3);
        G.circle(ctx, 560, 1305, 11);
        fs(ctx, '#BFE8FF', '#5A3515', 2);
        G.circle(ctx, 583, 1345, 4);
        fs(ctx, '#FFD23F');
        ctx.restore();
      }

      // домик на дереве
      if (v.x0 < 800 && v.y0 < 820 && v.y1 > 500) {
        const hx = 470, hy = 640, hw = 240, hh = 160;
        ctx.fillStyle = '#FFD27F';
        G.rr(ctx, hx, hy, hw, hh, 6);
        fs(ctx, '#FFD27F', '#8A5A2B', 3);
        ctx.beginPath();
        for (let y = hy + 26; y < hy + hh; y += 26) {
          ctx.moveTo(hx + 3, y);
          ctx.lineTo(hx + hw - 3, y);
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(160,110,40,0.35)';
        ctx.stroke();
        // вход: видно, что внутри
        ctx.beginPath();
        ctx.moveTo(535, hy + hh);
        ctx.lineTo(535, 700);
        ctx.quadraticCurveTo(592, 640, 648, 700);
        ctx.lineTo(648, hy + hh);
        ctx.closePath();
        fs(ctx, '#9A6433', '#5A3515', 3);
        G.glow(ctx, 592, 740, 70, '#FFE9A8', 0.45);
        // полочка с книжками внутри
        ctx.fillStyle = '#5A3515';
        ctx.fillRect(548, 705, 30, 4);
        ctx.fillStyle = '#FF5A5A';
        ctx.fillRect(551, 690, 6, 15);
        ctx.fillStyle = '#5AC8FA';
        ctx.fillRect(558, 693, 6, 12);
        ctx.fillStyle = '#FFD23F';
        ctx.fillRect(565, 689, 6, 16);
        // круглое окошко
        G.circle(ctx, 682, 690, 16);
        fs(ctx, '#BFE8FF', '#8A5A2B', 3);
        ctx.beginPath();
        ctx.moveTo(682, 674);
        ctx.lineTo(682, 706);
        ctx.moveTo(666, 690);
        ctx.lineTo(698, 690);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8A5A2B';
        ctx.stroke();
        // крыша
        ctx.beginPath();
        ctx.moveTo(452, hy + 6);
        ctx.lineTo(590, 548);
        ctx.lineTo(728, hy + 6);
        ctx.closePath();
        fs(ctx, '#E85D5D', '#8E2A2A', 3);
        ctx.beginPath();
        for (let k = 1; k < 4; k++) {
          const y = 548 + k * 24;
          const dx = (y - 548) * (138 / 98);
          ctx.moveTo(590 - dx, y);
          ctx.lineTo(590 + dx, y);
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(120,30,30,0.45)';
        ctx.stroke();
        // фонарик на верёвочке (на эскизе что-то висит в кроне)
        const sw = Math.sin(t * 1.6) * 0.12;
        ctx.save();
        ctx.translate(700, 470);
        ctx.rotate(sw);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 44);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#6A4520';
        ctx.stroke();
        Art.lantern(ctx, 0, 58, 13, t);
        ctx.restore();
      }

      // дно пруда
      if (v.x1 > 1150 && v.x0 < 1750) {
        ctx.beginPath();
        ctx.moveTo(1150, GY);
        ctx.quadraticCurveTo(1185, GY + 60, 1260, GY + 64);
        ctx.lineTo(1640, GY + 64);
        ctx.quadraticCurveTo(1715, GY + 60, 1750, GY);
        ctx.lineTo(1750, H);
        ctx.lineTo(1150, H);
        ctx.closePath();
        ctx.fillStyle = '#6E4A2A';
        ctx.fill();
        // камыши
        for (const [x, h] of [[1165, 70], [1178, 90], [1735, 80], [1722, 60]]) {
          ctx.beginPath();
          ctx.moveTo(x, GY + 10);
          ctx.lineTo(x + Math.sin(t * 2 + x) * 3, GY - h);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#3E9E36';
          ctx.stroke();
          G.rr(ctx, x - 5 + Math.sin(t * 2 + x) * 3, GY - h - 4, 10, 26, 5);
          fs(ctx, '#8B5A2B');
        }
        // рыбки
        for (const f of fish) {
          f.x += f.dir * f.v * (1 / 60);
          if (f.x > 1690) f.dir = -1;
          if (f.x < 1210) f.dir = 1;
          Art.fish(ctx, f.x, f.y + Math.sin(t * 2 + f.v) * 4, f.s, f.dir, f.c, t);
        }
      }

      // мелочи на земле: указатель, тележка, цветы, грибочки
      if (v.x0 < 460) {
        ctx.fillStyle = '#8A5A2B';
        ctx.fillRect(372, 1270, 10, 110);
        ctx.beginPath();
        ctx.moveTo(340, 1262);
        ctx.lineTo(440, 1262);
        ctx.lineTo(462, 1282);
        ctx.lineTo(440, 1302);
        ctx.lineTo(340, 1302);
        ctx.closePath();
        fs(ctx, '#C98B4F', '#5A3515', 3);
        VW.Items.drawArtifact(ctx, 'wand', 395, 1282, 15, 0, { sparkles: false });
      }
      if (v.x0 < 1100 && v.x1 > 820) {
        // тележка с яблоками (на эскизе у лестницы)
        ctx.fillStyle = '#8A5A2B';
        ctx.fillRect(880, 1326, 110, 30);
        ctx.strokeStyle = '#5A3515';
        ctx.lineWidth = 3;
        ctx.strokeRect(880, 1326, 110, 30);
        for (const ax of [895, 915, 935, 955, 975, 905, 925, 945, 965]) {
          G.circle(ctx, ax, ax % 2 ? 1320 : 1312, 9);
          fs(ctx, '#FF5A5A', '#A02020', 1.5);
        }
        for (const wx of [900, 970]) {
          G.circle(ctx, wx, 1362, 16);
          fs(ctx, '#6A4520', '#3A220A', 3);
          G.circle(ctx, wx, 1362, 4);
          fs(ctx, '#C98B4F');
        }
        ctx.beginPath();
        ctx.moveTo(990, 1340);
        ctx.lineTo(1040, 1300);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#8A5A2B';
        ctx.stroke();
      }
      for (const [x, y, s, c] of flowers) {
        if (x < v.x0 || x > v.x1) continue;
        Art.flower(ctx, x, y, s, c, t);
      }
      for (const x of [180, 1080, 1880, 2050]) {
        if (x < v.x0 - 50 || x > v.x1 + 50) continue;
        Art.smallMushroom(ctx, x, GY + 2, 22);
      }
      if (v.x0 < 260) Art.bush(ctx, 190, GY + 4, 34);
      if (v.x1 > 1800 && v.x0 < 1960) Art.bush(ctx, 1860, GY + 4, 40);
    };

    L.paintFront = function (ctx, t, v) {
      // вода пруда поверх ног героя
      if (v.x1 > 1150 && v.x0 < 1750) {
        const wy = GY + 12;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(1158, wy);
        for (let x = 1158; x <= 1742; x += 16) ctx.lineTo(x, wy + Math.sin(t * 3 + x * 0.05) * 2.5);
        ctx.lineTo(1742, wy);
        ctx.quadraticCurveTo(1712, GY + 62, 1640, GY + 66);
        ctx.lineTo(1260, GY + 66);
        ctx.quadraticCurveTo(1188, GY + 62, 1158, wy);
        ctx.closePath();
        ctx.fillStyle = 'rgba(70,180,240,0.62)';
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        for (let x = 1170; x < 1730; x += 60) {
          const y = wy + 16 + Math.sin(t * 2 + x) * 3;
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + 12, y - 4, x + 24, y);
        }
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.stroke();
        // кувшинки
        for (const [x, s] of [[1230, 20], [1560, 24], [1680, 16]]) {
          ctx.beginPath();
          ctx.ellipse(x, wy + 3, s, s * 0.35, 0, 0.35, TAU - 0.35);
          ctx.lineTo(x, wy + 3);
          ctx.closePath();
          fs(ctx, '#4CB944', '#2F7A2C', 1.5);
        }
        G.circle(ctx, 1566, wy - 3, 6);
        fs(ctx, '#FF9EC8', '#C2185B', 1.5);
      }
    };

    return L;
  };

  // =========================================================
  // Сцена 2: Домик под лестницей (эскиз 4)
  // =========================================================
  Lv.house = function () {
    const W = 2300, H = 1350, GY = 1170, F1 = 850, AT = 530;
    const L = { id: 'house', w: W, h: H, spawn: [2080, GY], spawnFacing: -1 };
    const plats = [
      { x: 0, y: GY, w: W, h: H - GY, style: 'floor' },
      { x: 30, y: F1, w: 1070, h: 34, style: 'wood' }, // 1-й этаж
      { x: 300, y: AT, w: 1360, h: 34, style: 'wood' }, // чердак
      { x: 1750, y: 1050, w: 300, style: 'counter' }, // кухонная столешница
      { x: 1790, y: 880, w: 220, style: 'shelf' }, // полка на кухне
      { x: 2130, y: 900, w: 150, style: 'none' }, // верх холодильника
      { x: 520, y: 1060, w: 170, style: 'none', noStep: true }, // спинка дивана
    ];
    // ступеньки: с 1-го этажа вниз направо
    const STEPS = 9, RISE = 32, RUN = 44, SX = 1100;
    for (let i = 1; i <= STEPS; i++) {
      plats.push({ x: SX + RUN * (i - 1), y: F1 + RISE * i, w: RUN, h: 36, style: 'step' });
    }
    L.platforms = plats;
    L.ladders = [
      { x: 110, top: F1, bottom: GY },
      { x: 1040, top: AT, bottom: F1 },
    ];
    // задняя стенка каморки под лестницей
    L.walls = [{ x: 1326, y: 1070, w: 22, h: GY - 1070 }];
    L.artifact = { x: 1235, y: 1098 };
    L.coins = [].concat(
      [[1560, 1120], [1660, 1120]],
      row(1800, 1960, 1000, 3),
      row(1850, 1950, 830, 2),
      [[2205, 850]],
      [[1474, 1090], [1386, 1026], [1298, 962], [1210, 898]],
      row(200, 950, 800, 6),
      row(420, 1520, 478, 8),
      row(300, 900, 1120, 4),
      [[110, 1000], [1040, 690]]
    );

    // Предметы, которые оживают
    const sink = { x: 1840, y: 960, w: 110, h: 210, t: null };
    sink.onTouch = (game) => {
      sink.t = 0;
      A.sfx('water');
      game.fx.burst('bubble', 1895, 1040, 12, { angle: -Math.PI / 2, spread: 0.6, speed: 120, g: -40, size: 6, color: '#8FD8FF', life: 1.4 });
    };
    const clock = { x: 580, y: 620, w: 90, h: 230, t: null };
    clock.onTouch = () => {
      clock.t = 0;
      A.sfx('cuckoo');
    };
    const cat = { x: 520, y: 1000, w: 170, h: 170, t: null };
    cat.onTouch = (game) => {
      cat.t = 0;
      A.sfx('meow');
      game.fx.burst('heart', 600, 1040, 6, { angle: -Math.PI / 2, spread: 0.6, speed: 120, g: -30, size: 9, color: '#FF6FA8', life: 1.2 });
    };
    L.props = [sink, clock, cat];

    L.paintSky = function (ctx, cam, SW, SH) {
      // обои (экранные координаты, лёгкий параллакс узора)
      ctx.fillStyle = '#FFE9C7';
      ctx.fillRect(0, 0, SW, SH);
    };

    L.paintBack = function (ctx, t, v) {
      // обои со звёздочками
      const x0 = Math.floor(v.x0 / 80) * 80, y0 = Math.floor(v.y0 / 80) * 80;
      ctx.fillStyle = '#FFE0B0';
      for (let x = x0; x < v.x1; x += 80) {
        for (let y = y0; y < v.y1; y += 80) {
          const ox = ((y / 80) % 2) * 40;
          G.starPath(ctx, x + ox + 20, y + 20, 7, 3);
          ctx.fill();
        }
      }
      // чердак: скошенная крыша и тёмные балки
      ctx.fillStyle = '#E8C39A';
      ctx.beginPath();
      ctx.moveTo(300, AT);
      ctx.lineTo(560, 120);
      ctx.lineTo(1400, 120);
      ctx.lineTo(1660, AT);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(300, AT);
      ctx.lineTo(560, 120);
      ctx.lineTo(1400, 120);
      ctx.lineTo(1660, AT);
      ctx.lineWidth = 16;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      // круглое окно на чердаке
      G.circle(ctx, 980, 290, 70);
      fs(ctx, '#1E2A5A', '#8A5A2B', 12);
      ctx.save();
      G.circle(ctx, 980, 290, 64);
      ctx.clip();
      G.nightStars(ctx, 140, 140, t, 5, 12, -910, -220);
      G.circle(ctx, 1005, 265, 16);
      ctx.fillStyle = '#FFF4C2';
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(980, 220);
      ctx.lineTo(980, 360);
      ctx.moveTo(910, 290);
      ctx.lineTo(1050, 290);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      // сундук и коробки на чердаке
      G.rr(ctx, 1280, AT - 70, 120, 70, 10);
      fs(ctx, '#B06A30', '#5A3210', 3);
      ctx.fillStyle = '#FFD23F';
      ctx.fillRect(1280, AT - 45, 120, 8);
      ctx.fillRect(1333, AT - 52, 14, 22);
      G.rr(ctx, 560, AT - 64, 80, 64, 4);
      fs(ctx, '#D9A066', '#8A5A2B', 3);
      G.rr(ctx, 590, AT - 110, 60, 46, 4);
      fs(ctx, '#E8B878', '#8A5A2B', 3);
      // лошадка-качалка
      ctx.beginPath();
      ctx.arc(760, AT - 6, 50, Math.PI * 1.15, Math.PI * 1.85);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      G.ellipse(ctx, 760, AT - 60, 34, 16);
      fs(ctx, '#FF9EC8', '#B83A78', 2.5);
      G.ellipse(ctx, 792, AT - 82, 12, 16, 0.4);
      fs(ctx, '#FF9EC8', '#B83A78', 2.5);
      ctx.beginPath();
      ctx.moveTo(740, AT - 48);
      ctx.lineTo(735, AT - 20);
      ctx.moveTo(780, AT - 48);
      ctx.lineTo(785, AT - 20);
      ctx.lineWidth = 4;
      ctx.stroke();

      // стена между этажами (перекрытие) — толщина
      // гостиная (слева внизу): камин, окно, диван
      // окно
      Art.window(ctx, 260, 930, 150, 130, '#7FD3FF', '#D8F3FF', t, false);
      // камин
      G.rr(ctx, 760, 990, 200, 180, 8);
      fs(ctx, '#C0704A', '#7A3A20', 4);
      ctx.beginPath();
      ctx.moveTo(800, GY);
      ctx.lineTo(800, 1070);
      ctx.quadraticCurveTo(860, 1020, 920, 1070);
      ctx.lineTo(920, GY);
      ctx.closePath();
      fs(ctx, '#3A2020');
      G.glow(ctx, 860, 1140, 70, '#FF9A3C', 0.55 + 0.1 * Math.sin(t * 9));
      for (let k = 0; k < 3; k++) {
        const fx = 835 + k * 25, f = Math.sin(t * 12 + k) * 3;
        ctx.beginPath();
        ctx.moveTo(fx - 12, GY - 6);
        ctx.quadraticCurveTo(fx - 12, GY - 36, fx + f, GY - 56 + k * 6);
        ctx.quadraticCurveTo(fx + 12, GY - 34, fx + 12, GY - 6);
        ctx.closePath();
        fs(ctx, k === 1 ? '#FFD23F' : '#FF8A1A');
      }
      G.rr(ctx, 745, 980, 230, 18, 5);
      fs(ctx, '#8A4A2A', '#5A2A10', 3);
      // диван с котиком
      G.rr(ctx, 500, 1060, 210, 70, 20);
      fs(ctx, '#7FB6F2', '#3A6EA8', 3);
      G.rr(ctx, 480, 1100, 250, 60, 18);
      fs(ctx, '#94C6FA', '#3A6EA8', 3);
      ctx.fillStyle = '#3A6EA8';
      ctx.fillRect(505, 1158, 12, 12);
      ctx.fillRect(693, 1158, 12, 12);
      const catBounce = cat.t != null && cat.t < 1 ? Math.abs(Math.sin(cat.t * 10)) * 8 : 0;
      VW.Pets.draw(ctx, 'cat', 620, 1100 - catBounce, { t: t, facing: -1, scale: 1.1 });
      // коврик
      G.ellipse(ctx, 400, GY + 4, 170, 14);
      fs(ctx, '#FF9EC8', '#D0508F', 3);
      // лампа
      ctx.beginPath();
      ctx.moveTo(380, GY);
      ctx.lineTo(380, 1030);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#6A4520';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(350, 1030);
      ctx.lineTo(410, 1030);
      ctx.lineTo(395, 995);
      ctx.lineTo(365, 995);
      ctx.closePath();
      fs(ctx, '#FFE27A', '#B08A10', 2.5);
      G.glow(ctx, 380, 1020, 80, '#FFE9A8', 0.35);

      // второй этаж: картины и часы-ходики
      Art.painting(ctx, 250, 650, 110, 80, 1);
      Art.painting(ctx, 830, 660, 90, 70, 2);
      // часы с кукушкой
      G.rr(ctx, 590, 620, 70, 80, 8);
      fs(ctx, '#B06A30', '#5A3210', 3);
      ctx.beginPath();
      ctx.moveTo(582, 624);
      ctx.lineTo(625, 590);
      ctx.lineTo(668, 624);
      ctx.closePath();
      fs(ctx, '#8A4A1A', '#5A3210', 3);
      G.circle(ctx, 625, 668, 22);
      fs(ctx, '#FFF8E6', '#5A3210', 2);
      ctx.beginPath();
      ctx.moveTo(625, 668);
      ctx.lineTo(625 + Math.cos(t * 0.5) * 14, 668 + Math.sin(t * 0.5) * 14);
      ctx.moveTo(625, 668);
      ctx.lineTo(625 + Math.cos(t * 3) * 18, 668 + Math.sin(t * 3) * 18);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#3A2010';
      ctx.stroke();
      const cuckoo = clock.t != null && clock.t < 1.2 ? Math.sin(Math.min(1, clock.t * 3) * Math.PI) : 0;
      if (cuckoo > 0) {
        G.circle(ctx, 625, 632 - cuckoo * 16, 9);
        fs(ctx, '#FFD23F', '#B08A10', 2);
        ctx.beginPath();
        ctx.moveTo(633, 632 - cuckoo * 16);
        ctx.lineTo(642, 634 - cuckoo * 16);
        ctx.lineTo(633, 637 - cuckoo * 16);
        fs(ctx, '#FF8A1A');
      }
      const sw = Math.sin(t * 3) * 0.3;
      ctx.beginPath();
      ctx.moveTo(625, 700);
      ctx.lineTo(625 + Math.sin(sw) * 60, 700 + Math.cos(sw) * 60);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#8A6010';
      ctx.stroke();
      G.circle(ctx, 625 + Math.sin(sw) * 60, 700 + Math.cos(sw) * 60, 9);
      fs(ctx, '#FFD23F', '#8A6010', 2);

      // каморка под лестницей
      ctx.beginPath();
      ctx.moveTo(SX, F1 + 34);
      ctx.lineTo(SX + RUN * STEPS, GY);
      ctx.lineTo(SX, GY);
      ctx.closePath();
      ctx.fillStyle = '#7A4A26';
      ctx.fill();
      // внутри каморки — уютно и светло
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(SX + 10, 905);
      ctx.lineTo(1326, 1066);
      ctx.lineTo(1326, GY);
      ctx.lineTo(SX + 10, GY);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#FFD9A0';
      ctx.fillRect(SX, F1, 260, GY - F1);
      G.glow(ctx, 1200, 1060, 140, '#FFF1B0', 0.8);
      // кроватка
      G.rr(ctx, 1130, 1120, 90, 36, 8);
      fs(ctx, '#FF9EC8', '#B83A78', 2.5);
      G.rr(ctx, 1132, 1110, 30, 18, 8);
      fs(ctx, '#fff', '#B89A9A', 2);
      ctx.fillStyle = '#8A5A2B';
      ctx.fillRect(1126, 1150, 8, 20);
      ctx.fillRect(1216, 1150, 8, 20);
      // свечка
      G.rr(ctx, 1285, 1110, 12, 26, 3);
      fs(ctx, '#FFF8E6', '#B8A080', 1.5);
      G.ellipse(ctx, 1291, 1102 + Math.sin(t * 12) * 1, 5, 8);
      fs(ctx, '#FFB300');
      G.glow(ctx, 1291, 1100, 40, '#FFE27A', 0.5);
      ctx.fillStyle = '#8A5A2B';
      ctx.fillRect(1270, 1136, 44, 8);
      ctx.fillRect(1288, 1144, 8, 26);
      // паутинка в уголке
      ctx.beginPath();
      for (let k = 0; k <= 4; k++) {
        const a = (k / 4) * (Math.PI / 2);
        ctx.moveTo(SX + 12, 912);
        ctx.lineTo(SX + 12 + Math.cos(a) * 54, 912 + Math.sin(a) * 54);
      }
      for (const rr of [18, 34, 50]) {
        ctx.moveTo(SX + 12 + rr, 912);
        ctx.arc(SX + 12, 912, rr, 0, Math.PI / 2);
      }
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(120,90,60,0.6)';
      ctx.stroke();
      ctx.restore();
      // задняя стенка каморки и косоур лестницы
      ctx.fillStyle = '#6A3F18';
      ctx.fillRect(1326, 1062, 22, GY - 1062);
      ctx.beginPath();
      ctx.moveTo(SX, F1 + 30);
      ctx.lineTo(SX + RUN * STEPS + 6, GY - 4);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      // дверной проём каморки (открыт)
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#5A3515';
      ctx.beginPath();
      ctx.moveTo(SX + 4, GY);
      ctx.lineTo(SX + 4, F1 + 40);
      ctx.stroke();
      // сама дверца — распахнута к стене
      ctx.beginPath();
      ctx.moveTo(SX - 4, GY);
      ctx.lineTo(SX - 4, 960);
      ctx.lineTo(SX - 40, 975);
      ctx.lineTo(SX - 40, GY - 6);
      ctx.closePath();
      fs(ctx, '#C98B4F', '#5A3515', 3);
      G.circle(ctx, SX - 32, 1080, 4);
      fs(ctx, '#FFD23F');

      // кухня
      Art.window(ctx, 1830, 720, 140, 110, '#7FD3FF', '#D8F3FF', t, false);
      // занавески
      ctx.fillStyle = '#FF7EB6';
      ctx.beginPath();
      ctx.moveTo(1812, 704);
      ctx.quadraticCurveTo(1850, 760, 1822, 850);
      ctx.lineTo(1806, 850);
      ctx.lineTo(1806, 704);
      ctx.closePath();
      ctx.moveTo(1988, 704);
      ctx.quadraticCurveTo(1950, 760, 1978, 850);
      ctx.lineTo(1994, 850);
      ctx.lineTo(1994, 704);
      ctx.closePath();
      ctx.fill();
      // полка с баночками
      for (let k = 0; k < 4; k++) {
        const jx = 1805 + k * 52;
        G.rr(ctx, jx, 842, 34, 38, 8);
        fs(ctx, ['#FF8A8A', '#FFD27F', '#9BE07A', '#9EC9F5'][k], '#6A5A7A', 2);
        G.rr(ctx, jx - 2, 836, 38, 10, 4);
        fs(ctx, '#C98B4F', '#6A4520', 1.5);
      }
      // шкафчик под мойкой (эскиз 4: справа внизу)
      G.rr(ctx, 1756, 1062, 288, 108, 6);
      fs(ctx, '#7FC8A9', '#3A7A60', 3);
      ctx.beginPath();
      ctx.moveTo(1900, 1066);
      ctx.lineTo(1900, 1166);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3A7A60';
      ctx.stroke();
      G.circle(ctx, 1886, 1116, 5);
      fs(ctx, '#FFD23F');
      G.circle(ctx, 1914, 1116, 5);
      fs(ctx, '#FFD23F');
      // решётка-сушилка (как на рисунке)
      ctx.strokeStyle = '#8E8EA8';
      ctx.lineWidth = 2;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.moveTo(1985 + k * 9, 1010);
        ctx.lineTo(1985 + k * 9, 1050);
        ctx.stroke();
      }
      ctx.strokeRect(1980, 1010, 42, 40);
      // мойка и кран
      G.rr(ctx, 1845, 1044, 110, 14, 6);
      fs(ctx, '#C9D3DD', '#6B7A8A', 2);
      ctx.beginPath();
      ctx.moveTo(1930, 1046);
      ctx.lineTo(1930, 990);
      ctx.quadraticCurveTo(1930, 975, 1912, 975);
      ctx.lineTo(1898, 975);
      ctx.lineTo(1898, 990);
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#AAB6C3';
      ctx.stroke();
      if (sink.t != null && sink.t < 2.2) {
        ctx.beginPath();
        ctx.moveTo(1898, 994);
        ctx.lineTo(1898, 1044);
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(120,200,255,0.8)';
        ctx.stroke();
      }
      // холодильник
      G.rr(ctx, 2130, 900, 150, 270, 16);
      fs(ctx, '#F2F2F7', '#8E8EA8', 3);
      ctx.beginPath();
      ctx.moveTo(2134, 1000);
      ctx.lineTo(2276, 1000);
      ctx.stroke();
      ctx.fillStyle = '#8E8EA8';
      ctx.fillRect(2145, 940, 8, 40);
      ctx.fillRect(2145, 1020, 8, 60);
      Art.painting(ctx, 2200, 1030, 50, 40, 2);
      // столик со стульями
      ctx.fillStyle = '#C98B4F';
      ctx.fillRect(1560, 1062, 16, 108);
      G.rr(ctx, 1500, 1050, 140, 16, 6);
      fs(ctx, '#E0A868', '#6A3F18', 2.5);
      G.circle(ctx, 1545, 1036, 12);
      fs(ctx, '#FF8A65', '#A63D1E', 2);
      G.circle(ctx, 1590, 1034, 14);
      fs(ctx, '#FFF8E6', '#8E8EA8', 2);
    };

    L.paintFront = function (ctx, t, v) {
      // перила лестницы — поверх героя
      ctx.beginPath();
      ctx.moveTo(SX + 10, F1 - 60);
      ctx.lineTo(SX + RUN * STEPS + 20, GY - 70);
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#8A5A2B';
      ctx.stroke();
      for (let i = 1; i <= STEPS; i += 2) {
        const x = SX + RUN * (i - 0.5), y = F1 + RISE * i;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 60 - 4 * (1 - i / STEPS));
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#A0703C';
        ctx.stroke();
      }
    };

    return L;
  };

  // =========================================================
  // Сцена 3: Волшебная библиотека
  // =========================================================
  Lv.library = function () {
    const W = 2100, H = 1600, FY = 1420;
    const L = { id: 'library', w: W, h: H, spawn: [220, FY], spawnFacing: 1 };
    L.platforms = [
      { x: 0, y: FY, w: W, h: H - FY, style: 'floor' },
      { x: 40, y: 1200, w: 660, style: 'shelf' }, // T1
      { x: 760, y: 1090, w: 130, style: 'book', color: '#E0533F', move: { ax: 80, period: 4.5 } },
      { x: 940, y: 980, w: 620, style: 'shelf' }, // T2
      { x: 1150, y: 760, w: 800, style: 'shelf' }, // T3
      { x: 1990, y: 650, w: 100, style: 'book', color: '#3F8FE0', move: { ay: 100, period: 5 } },
      { x: 800, y: 540, w: 1100, style: 'shelf' }, // T4
      { x: 1100, y: 430, w: 130, style: 'book', color: '#2FBF55', move: { ax: 150, period: 6, phase: 1 } },
      { x: 380, y: 320, w: 580, style: 'shelf' }, // T5 — самая верхняя полка
      { x: 1240, y: 1330, w: 150, style: 'none', noStep: true }, // кресло
    ];
    L.ladders = [
      { x: 100, top: 1200, bottom: FY, style: 'brass' },
      { x: 1000, top: 980, bottom: FY, style: 'brass' },
      { x: 1500, top: 760, bottom: 980, style: 'brass' },
      { x: 1250, top: 540, bottom: 760, style: 'brass' },
      { x: 880, top: 320, bottom: 540, style: 'brass' },
    ];
    L.artifact = { x: 450, y: 262 };
    L.coins = [].concat(
      [[300, 1370], [500, 1370], [700, 1370], [1300, 1370], [1600, 1370], [1900, 1370]],
      row(200, 650, 1150, 4),
      [[800, 1030], [880, 1030]],
      row(1100, 1400, 930, 3),
      [[1400, 710], [1650, 710], [1850, 710]],
      [[2040, 480], [2040, 425]],
      [[1000, 490], [1150, 490], [1450, 490], [1650, 490], [1850, 490]],
      [[1050, 372], [1250, 372]],
      row(600, 900, 270, 3),
      [[1000, 1200], [1250, 650], [880, 430]]
    );
    const cat = { x: 380, y: 1260, w: 150, h: 160, t: null };
    cat.onTouch = (game) => {
      cat.t = 0;
      A.sfx('meow');
      game.fx.burst('heart', 450, 1300, 6, { angle: -Math.PI / 2, spread: 0.6, speed: 120, g: -30, size: 9, color: '#FF6FA8', life: 1.2 });
    };
    const globe = { x: 1680, y: 1250, w: 120, h: 170, t: null, spin: 0 };
    globe.onTouch = () => {
      globe.t = 0;
      A.sfx('whoosh');
    };
    L.props = [cat, globe];

    // книжные корешки для фона (заранее)
    const r = U.rng(77);
    const BOOK = ['#E0533F', '#3F8FE0', '#2FBF55', '#F5B041', '#9B6BFF', '#FF7EB6', '#14BFA8', '#8A5A2B'];
    const books = [];
    for (let y = 150; y < FY - 40; y += 115) {
      let x = 20;
      while (x < W - 20) {
        const w = 14 + r() * 16, h = 60 + r() * 34;
        if (!(x > 1640 && x < 1960 && y > 820 && y < 1300)) books.push([x, y + 96 - h, w, h, Math.floor(r() * BOOK.length)]);
        x += w + 2 + (r() < 0.08 ? 30 : 0);
      }
    }
    const birds = [];
    for (let i = 0; i < 4; i++) birds.push({ x: r() * W, y: 200 + r() * 800, v: 30 + r() * 30, ph: r() * 6 });

    L.paintSky = function (ctx, cam, SW, SH) {
      ctx.fillStyle = '#4A3260';
      ctx.fillRect(0, 0, SW, SH);
    };

    L.paintBack = function (ctx, t, v) {
      // задняя стена-шкаф с книгами
      ctx.fillStyle = '#5E3A26';
      ctx.fillRect(Math.max(0, v.x0), Math.max(0, v.y0), Math.min(W, v.x1) - Math.max(0, v.x0), Math.min(FY, v.y1) - Math.max(0, v.y0));
      // полки фона
      ctx.fillStyle = '#7A4A26';
      for (let y = 150; y < FY - 40; y += 115) {
        if (y + 110 < v.y0 || y > v.y1) continue;
        ctx.fillRect(0, y + 96, W, 12);
      }
      // корешки — одним проходом на цвет
      for (let c = 0; c < BOOK.length; c++) {
        ctx.fillStyle = BOOK[c];
        ctx.beginPath();
        for (const b of books) {
          if (b[4] !== c || b[0] > v.x1 || b[0] + b[2] < v.x0 || b[1] > v.y1 || b[1] + b[3] < v.y0) continue;
          ctx.rect(b[0], b[1], b[2], b[3]);
        }
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,230,160,0.55)';
      ctx.beginPath();
      for (const b of books) {
        if (b[0] > v.x1 || b[0] + b[2] < v.x0 || b[1] > v.y1 || b[1] + b[3] < v.y0) continue;
        ctx.rect(b[0] + 2, b[1] + 10, b[2] - 4, 3);
      }
      ctx.fill();
      // тень, чтобы фон не спорил с полками
      ctx.fillStyle = 'rgba(40,20,60,0.5)';
      ctx.fillRect(Math.max(0, v.x0), Math.max(0, v.y0), Math.min(W, v.x1) - Math.max(0, v.x0), Math.min(FY, v.y1) - Math.max(0, v.y0));
      // большое окно с луной
      if (v.x1 > 1620 && v.y1 > 820 && v.y0 < 1300) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(1660, 1300);
        ctx.lineTo(1660, 960);
        ctx.arc(1800, 960, 140, Math.PI, 0);
        ctx.lineTo(1940, 1300);
        ctx.closePath();
        ctx.fillStyle = G.vGrad(ctx, 820, 1300, ['#1B1646', '#4B3A9A']);
        ctx.fill();
        ctx.clip();
        G.nightStars(ctx, 280, 480, t, 3, 22, -1660, -820);
        G.circle(ctx, 1850, 930, 44);
        ctx.fillStyle = '#FFF4C2';
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(1660, 1300);
        ctx.lineTo(1660, 960);
        ctx.arc(1800, 960, 140, Math.PI, 0);
        ctx.lineTo(1940, 1300);
        ctx.closePath();
        ctx.moveTo(1800, 820);
        ctx.lineTo(1800, 1300);
        ctx.moveTo(1660, 1080);
        ctx.lineTo(1940, 1080);
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#8A5A2B';
        ctx.stroke();
      }
      // лампы на цепочках
      for (const lx of [350, 1050, 1650]) {
        if (lx < v.x0 - 100 || lx > v.x1 + 100) continue;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, 200);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#C9A23A';
        ctx.stroke();
        Art.lantern(ctx, lx, 222, 20, t);
      }
      // кресло
      if (v.x1 > 1200 && v.x0 < 1450) {
        G.rr(ctx, 1230, 1250, 170, 120, 30);
        fs(ctx, '#C0392B', '#6E1A10', 3);
        G.rr(ctx, 1215, 1320, 200, 60, 20);
        fs(ctx, '#E0533F', '#6E1A10', 3);
        ctx.fillStyle = '#6E1A10';
        ctx.fillRect(1235, 1375, 12, 45);
        ctx.fillRect(1383, 1375, 12, 45);
      }
      // глобус
      if (v.x1 > 1660 && v.x0 < 1820) {
        if (globe.t != null && globe.t < 2) globe.spin += (2 - globe.t) * 0.12;
        ctx.fillStyle = '#8A5A2B';
        ctx.fillRect(1734, 1330, 12, 90);
        ctx.fillRect(1705, 1410, 70, 10);
        ctx.beginPath();
        ctx.arc(1740, 1290, 56, -0.4, Math.PI + 0.4, true);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#C9A23A';
        ctx.stroke();
        G.circle(ctx, 1740, 1290, 46);
        fs(ctx, '#5AB7F5', '#2E6FA8', 3);
        ctx.save();
        G.circle(ctx, 1740, 1290, 45);
        ctx.clip();
        ctx.fillStyle = '#5BC86A';
        const off = (globe.spin * 30) % 120;
        for (let k = -1; k < 3; k++) {
          G.ellipse(ctx, 1705 + k * 60 + off, 1275, 18, 13, 0.4);
          ctx.fill();
          G.ellipse(ctx, 1730 + k * 60 + off, 1310, 13, 9, -0.3);
          ctx.fill();
        }
        ctx.restore();
      }
      // стопка книг с котиком
      if (v.x1 > 360 && v.x0 < 560) {
        const cols = ['#3F8FE0', '#F5B041', '#9B6BFF', '#E0533F'];
        for (let k = 0; k < 4; k++) {
          G.rr(ctx, 390 + (k % 2) * 8, FY - 26 - k * 24, 120, 24, 4);
          fs(ctx, cols[k], U.shade(cols[k], -0.45), 2);
        }
        const hop = cat.t != null && cat.t < 1 ? Math.abs(Math.sin(cat.t * 10)) * 8 : 0;
        VW.Pets.draw(ctx, 'cat', 455, FY - 96 - hop, { t: t, facing: 1, scale: 1.1 });
      }
      // бумажные птички
      for (const b of birds) {
        b.x += b.v / 60;
        if (b.x > W + 60) b.x = -60;
        const y = b.y + Math.sin(t + b.ph) * 20;
        if (b.x < v.x0 - 40 || b.x > v.x1 + 40) continue;
        const fl = Math.sin(t * 8 + b.ph) * 8;
        ctx.beginPath();
        ctx.moveTo(b.x + 18, y);
        ctx.lineTo(b.x - 14, y - 4);
        ctx.lineTo(b.x - 4, y - 14 - fl);
        ctx.closePath();
        ctx.moveTo(b.x + 18, y);
        ctx.lineTo(b.x - 14, y - 4);
        ctx.lineTo(b.x - 2, y + 8);
        ctx.closePath();
        fs(ctx, '#FFF8E6', '#B8A080', 1.5);
      }
      // столб-опоры под полками (чтобы полки «стояли»)
      ctx.fillStyle = '#6A3F18';
      for (const p of L.platforms) {
        if (p.style !== 'shelf') continue;
        for (const sx of [p.x + 8, p.x + p.w - 20]) ctx.fillRect(sx, p.top + 20, 12, 40);
      }
    };

    L.paintFront = function (ctx, t, v) {
      // волшебная пыль
      ctx.fillStyle = 'rgba(255,240,180,0.8)';
      for (let i = 0; i < 26; i++) {
        const x = ((i * 397 + t * (10 + (i % 5) * 4)) % W);
        const y = (i * 263) % FY + Math.sin(t + i) * 20;
        if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
        G.sparkle(ctx, x, y, 3 + (i % 3), '#FFF3B0', 0.5 + 0.5 * Math.sin(t * 3 + i));
      }
    };
    return L;
  };

  // =========================================================
  // Сцена 4: Класс зелий
  // =========================================================
  Lv.potions = function () {
    const W = 2300, H = 1350, FY = 1170;
    const L = { id: 'potions', w: W, h: H, spawn: [120, FY], spawnFacing: 1 };
    L.platforms = [
      { x: 0, y: FY, w: W, h: H - FY, style: 'stonefloor' },
      { x: 300, y: FY - 50, w: 120, h: 50, style: 'cauldron', bounce: true, color: '#7CFF6A' },
      { x: 180, y: 760, w: 440, style: 'stone' }, // S1
      { x: 700, y: 1040, w: 260, style: 'table', legs: 130 },
      { x: 1000, y: FY - 50, w: 120, h: 50, style: 'cauldron', bounce: true, color: '#FF7EC8' },
      { x: 900, y: 700, w: 580, style: 'stone' }, // S2
      { x: 230, y: 710, w: 90, h: 50, style: 'cauldron', bounce: true, color: '#6AD8FF' },
      { x: 400, y: 420, w: 600, style: 'stone' }, // S3
      { x: 1200, y: 650, w: 90, h: 50, style: 'cauldron', bounce: true, color: '#FFD23F' },
      { x: 1400, y: 420, w: 500, style: 'stone' }, // S4
      { x: 1690, y: 370, w: 90, h: 50, style: 'cauldron', bounce: true, bounceV: 1080, color: '#B983FF' },
      { x: 1850, y: 240, w: 420, style: 'stone' }, // S5 — зелье здесь
      { x: 1550, y: 1040, w: 260, style: 'table', legs: 130 },
    ];
    for (const p of L.platforms) if (p.style === 'cauldron') p.bounceColor = p.color;
    L.ladders = [
      { x: 560, top: 760, bottom: FY },
      { x: 1360, top: 700, bottom: FY },
      { x: 480, top: 420, bottom: 760 },
      { x: 1450, top: 420, bottom: 700 },
      { x: 1880, top: 240, bottom: 420 },
    ];
    L.artifact = { x: 2150, y: 182 };
    L.coins = [].concat(
      [[150, 1120], [850, 1120], [1250, 1120], [2000, 1120], [2150, 1120]],
      [[360, 1000], [360, 900], [360, 820]],
      [[760, 990], [900, 990]],
      [[1060, 1000], [1060, 880], [1060, 780]],
      [[400, 710], [520, 710]],
      [[980, 650], [1100, 650], [1320, 650]],
      row(520, 950, 370, 4),
      [[1520, 370], [1620, 370], [1840, 370]],
      [[1960, 190], [2050, 190]],
      [[1620, 990], [1740, 990]],
      [[1360, 950], [1880, 330], [1245, 470]]
    );
    const flask = { x: 700, y: 900, w: 260, h: 270, t: null };
    flask.onTouch = (game) => {
      flask.t = 0;
      A.sfx('magic');
      game.fx.burst('bubble', 830, 990, 14, { angle: -Math.PI / 2, spread: 0.7, speed: 160, g: -50, size: 7, color: '#C9A2FF', life: 1.5 });
    };
    const frog = { x: 1550, y: 900, w: 260, h: 270, t: null };
    frog.onTouch = () => {
      frog.t = 0;
      A.sfx('giggle');
    };
    L.props = [flask, frog];

    const r = U.rng(31);
    const jars = [];
    for (let i = 0; i < 40; i++) jars.push([r(), r(), Math.floor(r() * 6)]);
    const JC = ['#7CFF6A', '#FF7EC8', '#6AD8FF', '#FFD23F', '#B983FF', '#FF8A5A'];

    L.update = function (dt, game) {
      // пузырьки из котлов
      for (const p of L.platforms) {
        if (p.style !== 'cauldron') continue;
        if (Math.random() < dt * 2.5) game.fx.add({ type: 'bubble', x: p.x + 20 + Math.random() * (p.w - 40), y: p.top - 6, vx: 0, vy: -40 - Math.random() * 40, life: 1.4, size: 4 + Math.random() * 5, color: U.shade(p.color, 0.3) });
      }
    };

    L.paintSky = function (ctx, cam, SW, SH) {
      ctx.fillStyle = '#5B4E7A';
      ctx.fillRect(0, 0, SW, SH);
    };

    L.paintBack = function (ctx, t, v) {
      // каменная кладка
      const x0 = Math.max(0, Math.floor(v.x0 / 90) * 90), y0 = Math.max(0, Math.floor(v.y0 / 45) * 45);
      ctx.fillStyle = '#7E729E';
      ctx.fillRect(Math.max(0, v.x0), Math.max(0, v.y0), Math.min(W, v.x1) - Math.max(0, v.x0), Math.min(FY, v.y1) - Math.max(0, v.y0));
      ctx.beginPath();
      for (let y = y0; y < Math.min(FY, v.y1); y += 45) {
        ctx.moveTo(Math.max(0, v.x0), y);
        ctx.lineTo(Math.min(W, v.x1), y);
        const odd = Math.round(y / 45) % 2;
        for (let x = x0 + odd * 45; x < v.x1; x += 90) {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 45);
        }
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(60,50,90,0.45)';
      ctx.stroke();
      // деревянные балки под потолком
      ctx.fillStyle = '#6A4520';
      ctx.fillRect(0, 60, W, 34);
      for (let x = 100; x < W; x += 400) ctx.fillRect(x, 0, 30, 94);
      // пучки трав
      for (let x = 200; x < W; x += 400) {
        if (x < v.x0 - 60 || x > v.x1 + 60) continue;
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(x + k * 18, 94);
          ctx.lineTo(x + k * 18, 130);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#6A4520';
          ctx.stroke();
          G.ellipse(ctx, x + k * 18, 146, 9, 20, Math.sin(t + k) * 0.1);
          fs(ctx, ['#5BA84A', '#8CC152', '#C9A2FF'][k], '#2F5A20', 1.5);
        }
      }
      // факелы
      for (const tx of [150, 700, 1250, 1800, 2200]) {
        if (tx < v.x0 - 80 || tx > v.x1 + 80) continue;
        Art.torch(ctx, tx, 560, t);
        Art.torch(ctx, tx + 200, 960, t);
      }
      // доска с рисунками мелом (без надписей)
      if (v.x1 > 1400 && v.x0 < 2000) {
        G.rr(ctx, 1500, 540, 380, 230, 10);
        fs(ctx, '#2F4A3A', '#6A4520', 10);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        G.starPath(ctx, 1590, 630, 40, 17);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(1700, 640, 36, 0.6, 5.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(1790, 590);
        ctx.lineTo(1790, 630);
        ctx.lineTo(1765, 700);
        ctx.lineTo(1835, 700);
        ctx.lineTo(1810, 630);
        ctx.lineTo(1810, 590);
        ctx.stroke();
        G.heartPath(ctx, 1640, 720, 16);
        ctx.stroke();
      }
      // полки с баночками на стене
      for (const [sx, sy, sw] of [[40, 560, 120], [1000, 300, 300], [2000, 560, 260], [700, 250, 200]]) {
        if (sx > v.x1 || sx + sw < v.x0) continue;
        ctx.fillStyle = '#6A4520';
        ctx.fillRect(sx, sy, sw, 10);
        for (let k = 0; k * 40 < sw - 30; k++) {
          const j = jars[(k + sx) % jars.length];
          const c = JC[j[2]];
          const jh = 34 + j[0] * 20;
          G.rr(ctx, sx + 8 + k * 40, sy - jh, 28, jh, 8);
          fs(ctx, U.rgba(c, 0.85), U.shade(c, -0.5), 2);
          G.rr(ctx, sx + 12 + k * 40, sy - jh - 8, 20, 10, 3);
          fs(ctx, '#B07A40');
        }
      }
      // большой котёл на фоне
      if (v.x1 > 1900) {
        G.glow(ctx, 2150, 1080, 160, '#7CFF6A', 0.25 + 0.1 * Math.sin(t * 2));
      }
      // лягушка в банке
      if (v.x1 > 1540 && v.x0 < 1820) {
        const hop = frog.t != null && frog.t < 1 ? Math.abs(Math.sin(frog.t * 9)) * 16 : 0;
        G.rr(ctx, 1600, 950, 90, 90, 22);
        fs(ctx, 'rgba(200,240,255,0.55)', '#5B7C99', 3);
        const fx = 1645, fy = 1022 - hop;
        G.ellipse(ctx, fx, fy, 24, 16);
        fs(ctx, '#5BC86A', '#2E7D32', 2);
        G.circle(ctx, fx - 11, fy - 14, 8);
        fs(ctx, '#5BC86A', '#2E7D32', 2);
        G.circle(ctx, fx + 11, fy - 14, 8);
        fs(ctx, '#5BC86A', '#2E7D32', 2);
        G.circle(ctx, fx - 11, fy - 14, 4);
        fs(ctx, '#fff');
        G.circle(ctx, fx + 11, fy - 14, 4);
        fs(ctx, '#fff');
        G.circle(ctx, fx - 10, fy - 14, 2);
        fs(ctx, '#222');
        G.circle(ctx, fx + 12, fy - 14, 2);
        fs(ctx, '#222');
        ctx.beginPath();
        ctx.arc(fx, fy - 2, 9, 0.2, Math.PI - 0.2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2E7D32';
        ctx.stroke();
      }
      // колба на столе
      if (v.x1 > 700 && v.x0 < 960) {
        const k = flask.t != null && flask.t < 1.5 ? Math.sin(flask.t * 12) * 0.1 : 0;
        ctx.save();
        ctx.translate(830, 1040);
        ctx.rotate(k);
        G.circle(ctx, 0, -30, 28);
        fs(ctx, 'rgba(210,180,255,0.9)', '#6A4AA0', 3);
        G.rr(ctx, -9, -86, 18, 34, 4);
        fs(ctx, 'rgba(230,240,255,0.9)', '#6A4AA0', 2.5);
        ctx.restore();
      }
    };
    return L;
  };

  // =========================================================
  // Сцена 5: Звёздная башня (ночь)
  // =========================================================
  Lv.tower = function () {
    const W = 1700, H = 2400, FY = 2220;
    const L = { id: 'tower', w: W, h: H, spawn: [300, FY], spawnFacing: 1 };
    const N = true;
    L.platforms = [
      { x: 0, y: FY, w: W, h: H - FY, style: 'grassNight' },
      { x: 1100, y: 2000, w: 300, style: 'balcony' }, // B1
      { x: 1450, y: 1850, w: 190, style: 'cloud', night: N },
      { x: 1100, y: 1760, w: 300, style: 'balcony' }, // B2
      { x: 700, y: 1540, w: 500, style: 'balcony' }, // B3
      { x: 420, y: 1430, w: 170, style: 'carpet', move: { ax: 140, period: 6 } },
      { x: 150, y: 1320, w: 610, style: 'balcony' }, // B4
      { x: 20, y: 1180, w: 180, style: 'cloud', night: N },
      { x: 200, y: 1050, w: 660, style: 'balcony' }, // B5
      { x: 760, y: 830, w: 540, style: 'balcony' }, // B6
      { x: 1350, y: 700, w: 190, style: 'cloud', night: N },
      { x: 1150, y: 580, w: 180, style: 'cloud', night: N },
      { x: 1180, y: 450, w: 180, style: 'cloud', night: N },
      { x: 550, y: 320, w: 600, style: 'balcony' }, // вершина-обсерватория
    ];
    L.ladders = [
      { x: 1350, top: 1760, bottom: FY, style: 'metal' },
      { x: 1150, top: 1540, bottom: 1760, style: 'metal' },
      { x: 740, top: 1050, bottom: 1540, style: 'metal' },
      { x: 820, top: 830, bottom: 1050, style: 'metal' },
      { x: 1120, top: 320, bottom: 830, style: 'metal' },
    ];
    L.artifact = { x: 850, y: 240 };
    L.coins = [].concat(
      [[200, 2170], [450, 2170], [1000, 2170], [1550, 2170]],
      [[1350, 2110]],
      [[1150, 1950], [1250, 1950]],
      [[1545, 1800]],
      [[1200, 1710], [1300, 1710]],
      [[1150, 1650]],
      row(800, 1100, 1490, 3),
      row(350, 550, 1378, 3),
      row(250, 550, 1270, 3),
      [[110, 1130]],
      row(300, 600, 1000, 3),
      [[850, 780], [1000, 780], [1250, 780]],
      [[1445, 650], [1240, 530], [1270, 400]],
      [[1120, 700], [1120, 500]],
      [[650, 270], [1050, 270]]
    );
    const scope = { x: 950, y: 150, w: 200, h: 170, t: null };
    scope.onTouch = (game) => {
      scope.t = 0;
      A.sfx('sparkle');
      game.fx.burst('star', 1080, 190, 10, { speed: 260, size: 9, color: '#FFE680', life: 1.2 });
    };
    L.props = [scope];

    const r = U.rng(99);
    const fireflies = [];
    for (let i = 0; i < 24; i++) fireflies.push([r() * W, 300 + r() * (FY - 300), r() * 6, 20 + r() * 30]);
    const vines = [];
    for (let i = 0; i < 10; i++) vines.push([610 + r() * 480, 500 + r() * 1500, 80 + r() * 140]);
    let shoot = { t: -5, x: 0, y: 0 };

    L.paintSky = function (ctx, cam, SW, SH, t) {
      const up = camUp(L, cam, SH);
      const k = U.clamp(up / (H - SH), 0, 1);
      G.sky(ctx, SW, SH, [U.lerp(0, 1, k) > 0.5 ? '#120E36' : '#1B1646', '#2F2470', '#5B3FA8']);
      G.nightStars(ctx, SW, SH, t, 21, 90, cam.x * 0.1, cam.y * 0.1);
      // луна
      const my = 130 + (1 - k) * 60, mx = 170;
      G.glow(ctx, mx, my, 160, '#FFF4C2', 0.45);
      G.circle(ctx, mx, my, 60);
      ctx.fillStyle = '#FFF4C2';
      ctx.fill();
      ctx.fillStyle = 'rgba(220,200,140,0.5)';
      for (const [dx, dy, rr] of [[-18, -12, 12], [16, 10, 9], [-6, 22, 6], [20, -20, 5]]) {
        G.circle(ctx, mx + dx, my + dy, rr);
        ctx.fill();
      }
      // падающая звезда
      if (t - shoot.t > 6) shoot = { t: t, x: 100 + Math.random() * SW * 0.6, y: 40 + Math.random() * 120 };
      const st = t - shoot.t;
      if (st < 1) {
        const sx = shoot.x + st * 500, sy = shoot.y + st * 220;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 90, sy - 40);
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(255,245,200,' + (1 - st) + ')';
        ctx.stroke();
        G.sparkle(ctx, sx, sy, 8, '#FFF6C0', 1 - st);
      }
      farMountains(ctx, cam, SW, SH, up, '#2A2060', 200, 150, 0.1, 2);
      farMountains(ctx, cam, SW, SH, up, '#1F4A4A', 110, 60, 0.25, 6);
    };

    L.paintBack = function (ctx, t, v) {
      // башня
      if (v.x1 > 580 && v.x0 < 1120) {
        ctx.fillStyle = '#6A5F9A';
        ctx.fillRect(600, 330, 500, FY - 330);
        // кладка
        ctx.beginPath();
        const y0 = Math.max(330, Math.floor(v.y0 / 40) * 40);
        for (let y = y0; y < Math.min(FY, v.y1); y += 40) {
          ctx.moveTo(600, y);
          ctx.lineTo(1100, y);
          const odd = Math.round(y / 40) % 2;
          for (let x = 600 + odd * 40; x < 1100; x += 80) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 40);
          }
        }
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(40,30,80,0.5)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(600, 330, 60, FY - 330);
        // окна
        for (const [wx, wy] of [[760, 700], [940, 1180], [700, 1850], [900, 1950], [820, 1400], [960, 600]]) {
          if (wy < v.y0 - 100 || wy > v.y1 + 100) continue;
          G.glow(ctx, wx + 25, wy + 30, 70, '#FFE27A', 0.35);
          ctx.beginPath();
          ctx.moveTo(wx, wy + 70);
          ctx.lineTo(wx, wy + 22);
          ctx.arc(wx + 25, wy + 22, 25, Math.PI, 0);
          ctx.lineTo(wx + 50, wy + 70);
          ctx.closePath();
          fs(ctx, '#FFE27A', '#3A2F6A', 4);
          ctx.beginPath();
          ctx.moveTo(wx + 25, wy);
          ctx.lineTo(wx + 25, wy + 70);
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        // дверь
        if (v.y1 > FY - 200) {
          ctx.beginPath();
          ctx.moveTo(800, FY);
          ctx.lineTo(800, FY - 110);
          ctx.arc(850, FY - 110, 50, Math.PI, 0);
          ctx.lineTo(900, FY);
          ctx.closePath();
          fs(ctx, '#8A5A2B', '#3A220A', 4);
          G.circle(ctx, 885, FY - 60, 5);
          fs(ctx, '#FFD23F');
        }
        // лианы с цветами
        for (const [vx, vy, vl] of vines) {
          if (vy > v.y1 || vy + vl < v.y0) continue;
          ctx.beginPath();
          ctx.moveTo(vx, vy);
          for (let k = 0; k <= 8; k++) ctx.lineTo(vx + Math.sin(k * 0.9 + vx) * 10, vy + (k * vl) / 8);
          ctx.lineWidth = 4;
          ctx.strokeStyle = '#2F7A5A';
          ctx.stroke();
          for (let k = 1; k < 8; k += 2) {
            G.circle(ctx, vx + Math.sin(k * 0.9 + vx) * 10, vy + (k * vl) / 8, 5);
            ctx.fillStyle = k % 4 === 1 ? '#FF9EC8' : '#FFE27A';
            ctx.fill();
          }
        }
      }
      // обсерватория на вершине: купол и телескоп
      if (v.y0 < 420) {
        ctx.beginPath();
        ctx.moveTo(640, 330);
        ctx.arc(850, 330, 210, Math.PI, 0);
        ctx.closePath();
        fs(ctx, '#8E7FD0', '#3A2F6A', 5);
        ctx.fillStyle = '#FFD23F';
        for (let k = 0; k < 7; k++) {
          const a = Math.PI + (k + 0.5) * (Math.PI / 7);
          G.starPath(ctx, 850 + Math.cos(a) * 150, 330 + Math.sin(a) * 150, 10, 4.5);
          ctx.fill();
        }
        ctx.save();
        ctx.translate(1050, 230);
        ctx.rotate(-0.6 + (scope.t != null && scope.t < 1.5 ? Math.sin(scope.t * 8) * 0.06 : 0));
        G.rr(ctx, -20, -18, 150, 36, 12);
        fs(ctx, '#C9A23A', '#6A4A10', 3);
        G.rr(ctx, 120, -24, 22, 48, 6);
        fs(ctx, '#E6C56B', '#6A4A10', 3);
        ctx.restore();
        ctx.fillStyle = '#6A4A10';
        ctx.fillRect(1040, 240, 12, 80);
      }
      // земля: светящиеся цветы
      for (let x = 60; x < W; x += 110) {
        if (x < v.x0 - 20 || x > v.x1 + 20 || v.y1 < FY - 60) continue;
        Art.flower(ctx, x, FY + 4, 5, x % 220 ? '#9BE7FF' : '#FF9EC8', t);
      }
    };

    L.paintFront = function (ctx, t, v) {
      // светлячки
      for (const f of fireflies) {
        const x = f[0] + Math.sin(t * 0.7 + f[2]) * f[3];
        const y = f[1] + Math.cos(t * 0.9 + f[2]) * f[3];
        if (x < v.x0 || x > v.x1 || y < v.y0 || y > v.y1) continue;
        const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + f[2]));
        G.glow(ctx, x, y, 14, '#EFFF8A', a * 0.5);
        G.circle(ctx, x, y, 3);
        ctx.fillStyle = 'rgba(240,255,150,' + a + ')';
        ctx.fill();
      }
    };
    return L;
  };
})(window.VW);
