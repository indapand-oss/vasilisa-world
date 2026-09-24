/* Vasilisa World — человечек (герой), наряды, наборы-костюмы и питомцы */
(function (VW) {
  'use strict';

  const U = VW.U, G = VW.G;
  const H = (VW.Hero = {});
  const P = (VW.Pets = {});
  const TAU = Math.PI * 2;
  const PI = Math.PI;

  // Геометрия (рост ~102 при масштабе 1, ноги в точке 0,0)
  const HIP_Y = -40, SH_Y = -68, NECK_Y = -72, HEAD_Y = -87, HEAD_R = 15;
  const LIMB_W = 7.5;

  H.HEIGHT = 102;

  H.bodyColor = function (look, t) {
    const c = VW.Store.item('color', look.color) || VW.Data.colors[0];
    if (c.rainbow) return U.hslToHex(Math.round(((t || 0) * 90) % 360), 85, 56);
    return c.hex;
  };

  // ---------- поза ----------
  function computePose(pose) {
    const st = pose.state || 'idle';
    const t = pose.t || 0;
    const p = pose.phase || 0;
    const R = { bob: 0, legA: [-0.17, -0.12], legB: [0.17, 0.12], armA: [-0.3, -0.15], armB: [0.3, 0.15] };
    switch (st) {
      case 'walk':
      case 'wade': {
        const s1 = Math.sin(p), c1 = Math.cos(p);
        R.legA = [0.55 * s1, 0.55 * s1 - 0.75 * Math.max(0, c1)];
        R.legB = [-0.55 * s1, -0.55 * s1 - 0.75 * Math.max(0, -c1)];
        R.armA = [-0.5 * s1, -0.5 * s1 + 0.5];
        R.armB = [0.5 * s1, 0.5 * s1 + 0.5];
        R.bob = -2.4 * Math.abs(c1);
        if (st === 'wade') {
          R.armA = [R.armA[0] - 0.7, R.armA[1] - 0.5];
          R.armB = [R.armB[0] + 0.7, R.armB[1] + 0.5];
        }
        break;
      }
      case 'jump':
        R.legA = [0.95, 0.2];
        R.legB = [-0.3, -0.6];
        R.armA = [-2.35, -2.7];
        R.armB = [2.35, 2.75];
        break;
      case 'fall': {
        const w = Math.sin(t * 18) * 0.25;
        R.legA = [0.35, 0.6];
        R.legB = [-0.3, -0.05];
        R.armA = [-2.05 - w, -2.4 - w];
        R.armB = [2.05 + w, 2.4 + w];
        break;
      }
      case 'climb': {
        const s1 = Math.sin(p);
        R.legA = [-(0.22 + 0.6 * Math.max(0, s1)), 0.1 + 0.3 * Math.max(0, s1)];
        R.legB = [0.22 + 0.6 * Math.max(0, -s1), -0.1 - 0.3 * Math.max(0, -s1)];
        R.armA = [-2.55 - 0.3 * Math.max(0, -s1) + 0.25 * Math.max(0, s1), -2.95 + 0.5 * Math.max(0, s1)];
        R.armB = [2.55 + 0.3 * Math.max(0, s1) - 0.25 * Math.max(0, -s1), 2.95 - 0.5 * Math.max(0, -s1)];
        break;
      }
      case 'cheer': {
        const w = Math.sin(t * 10) * 0.3;
        R.legA = [-0.28, -0.1];
        R.legB = [0.28, 0.1];
        R.armA = [-2.55 - w, -2.9 - w];
        R.armB = [2.55 + w, 2.9 + w];
        R.bob = -Math.abs(Math.sin(t * 6)) * 12;
        break;
      }
      case 'wave': {
        R.bob = Math.sin(t * 2) * 0.8;
        R.armA = [-0.3 + 0.03 * Math.sin(t * 2), -0.15];
        R.armB = [1.75 + 0.1 * Math.sin(t * 7), 2.6 + 0.35 * Math.sin(t * 7 + 0.7)];
        break;
      }
      case 'dance': {
        const s1 = Math.sin(t * 7);
        R.bob = -Math.abs(Math.sin(t * 7)) * 6;
        R.legA = [-0.3 + 0.25 * s1, -0.1 + 0.4 * Math.max(0, s1)];
        R.legB = [0.3 + 0.25 * s1, 0.1 - 0.4 * Math.max(0, -s1)];
        R.armA = [-2.2 + 0.6 * s1, -2.6 + 0.8 * s1];
        R.armB = [2.2 + 0.6 * s1, 2.6 + 0.8 * s1];
        break;
      }
      default: {
        // idle
        R.bob = Math.sin(t * 2.2) * 0.8;
        R.armA = [-0.3 + 0.04 * Math.sin(t * 2.2), -0.14];
        R.armB = [0.3 - 0.04 * Math.sin(t * 2.2), 0.14];
      }
    }
    return R;
  }

  function limb(ox, oy, ang, l1, l2) {
    const kx = ox + Math.sin(ang[0]) * l1, ky = oy + Math.cos(ang[0]) * l1;
    const ex = kx + Math.sin(ang[1]) * l2, ey = ky + Math.cos(ang[1]) * l2;
    return [ox, oy, kx, ky, ex, ey];
  }

  function strokeLimbs(ctx, limbs, col, out, lw) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = out;
    ctx.lineWidth = lw + 4.5;
    ctx.beginPath();
    for (const L of limbs) {
      ctx.moveTo(L[0], L[1]);
      ctx.lineTo(L[2], L[3]);
      ctx.lineTo(L[4], L[5]);
    }
    ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    for (const L of limbs) {
      ctx.moveTo(L[0], L[1]);
      ctx.lineTo(L[2], L[3]);
      ctx.lineTo(L[4], L[5]);
    }
    ctx.stroke();
  }

  function dot(ctx, x, y, r, fill, stroke, lw) {
    G.circle(ctx, x, y, r);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineWidth = lw || 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function fs(ctx, fill, stroke, lw) {
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = lw || 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  // ---------- главный рисователь ----------
  const NO_PARTS = {};

  // Какой герой сейчас выбран (или null — обычный человечек)
  H.heroOf = function (look) {
    const D = VW.Data;
    if (!look) return null;
    if (look.hero && D.heroById[look.hero]) return D.heroById[look.hero];
    if (look.set && D.heroForOldSet && D.heroForOldSet[look.set]) return D.heroById[D.heroForOldSet[look.set]] || null;
    return null;
  };

  // look: {color, head, body, hero}; pose: {state, t, phase, facing, speed, squash, blink}
  // Цвет из палитры красит человечка, наряды слева надеваются поверх героя
  H.draw = function (ctx, x, y, look, pose, scale) {
    scale = scale || 1;
    pose = pose || {};
    look = look || {};
    const t = pose.t || 0;
    const f = pose.facing < 0 ? -1 : 1;
    const R = computePose(pose);
    const col = H.bodyColor(look, t);
    const out = U.shade(col, -0.5);
    const hero = H.heroOf(look);
    const P = hero ? hero.p : NO_PARTS;
    const headOut = look.head || null;
    const bodyOut = look.body || null;
    const lower = bodyOut === 'skirt' || bodyOut === 'dress' ? null : P.lower || null;
    const sq = pose.squash || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * f * (1 + sq), scale * (1 - sq));
    ctx.translate(0, R.bob);

    const lA = limb(0, HIP_Y, R.legA, 21, 21);
    const lB = limb(0, HIP_Y, R.legB, 21, 21);
    const aA = limb(0, SH_Y, R.armA, 17, 16);
    const aB = limb(0, SH_Y, R.armB, 17, 16);
    const S = { t: t, f: f, pose: pose, R: R, col: col, out: out, lA: lA, lB: lB, aA: aA, aB: aB, speed: pose.speed || 0, P: P };

    // 1. то, что за спиной
    if (P.aura) drawAura(ctx, S, P.aura);
    if (P.back === 'wings') drawWings(ctx, S, P.wings, P.wingColors);
    if (P.back === 'jetpack') drawJetpack(ctx, S);
    if (P.back === 'shell') drawShell(ctx, S);
    if (bodyOut === 'cape') drawCape(ctx, S, '#E63946', '#FFC928');
    else if (P.back === 'cape') drawCape(ctx, S, P.backColor || '#3559E0', '#FFC928');
    if (P.tail) drawTail(ctx, S, P.tail);
    if (P.hair) hairBack(ctx, S, P.hair, P.hairColor || '#5A3A1A');

    // 2. ноги и туловище (одним проходом, чтобы не было швов)
    strokeLimbs(ctx, [lA, lB, [0, NECK_Y, 0, (NECK_Y + HIP_Y) / 2, 0, HIP_Y]], col, out, LIMB_W);
    foot(ctx, lA[4], lA[5], col, out);
    foot(ctx, lB[4], lB[5], col, out);

    // 3. одежда
    if (P.suit) drawSuit(ctx, S, P.suit);
    if (lower === 'robe') drawRobe(ctx, S, P.lowerColor || '#3D3A9E', P.stars);
    if (lower === 'dress') drawDress(ctx, S, P.lowerColor || '#9B6BFF', P.pattern || 'dots');
    if (lower === 'tutu') drawTutu(ctx, S, P.lowerColor || '#FF9ED2');
    if (lower === 'toga') drawToga(ctx, S, P.lowerColor || '#FFFFFF');
    if (bodyOut === 'skirt') drawSkirt(ctx, S);
    if (bodyOut === 'dress') drawDress(ctx, S, '#9B6BFF', 'dots');
    if (P.robotBody) drawRobotBody(ctx, S, P.robotBody, P.metal || '#D8E0E8', P.screen);
    if (lower === 'apron') drawApron(ctx, S);
    if (P.emblem) drawEmblem(ctx, S, P.emblem);

    // у робота голова рисуется раньше рук, чтобы поднятые руки было видно
    if (P.robotHead) drawRobotHead(ctx, S, P.robotHead, P.metal || '#D8E0E8', headOut ? 'none' : P.antenna || 'none', P.eye);

    // 4. руки и то, что в руке
    strokeLimbs(ctx, [aA, aB], col, out, LIMB_W);
    if (!bodyOut && !lower && !P.suit && !P.robotBody) dot(ctx, 0, SH_Y, LIMB_W / 2 + 0.3, col);
    dot(ctx, aA[4], aA[5], 4.3, col, out, 2.2);
    dot(ctx, aB[4], aB[5], 4.3, col, out, 2.2);
    if (P.hand) drawHandItem(ctx, S, P.hand, P);

    // 5. голова
    if (!P.robotHead) drawHead(ctx, S);

    // 6. на голове
    if (P.hair) hairFront(ctx, S, P.hair, P.hairColor || '#5A3A1A');
    if (P.ears) drawEars(ctx, S, P.ears);
    if (!headOut) {
      if (P.hat) drawHatType(ctx, S, P.hat, P);
      if (P.tiara) drawTiara(ctx, P.tiara);
      if (P.crown) drawCrownType(ctx, S, P.crown);
      if (P.topper === 'mandarin') drawMandarin(ctx, S);
    }
    if (headOut === 'crown') drawCrown(ctx);
    if (headOut === 'hat') drawHat(ctx);
    if (headOut === 'bow') drawBow(ctx);

    ctx.restore();
  };

  function foot(ctx, x, y, col, out) {
    G.ellipse(ctx, x + 2, y - 1, 6.2, 4.2);
    fs(ctx, col, out, 2.2);
  }

  function drawHead(ctx, S) {
    G.circle(ctx, 0, HEAD_Y, HEAD_R);
    fs(ctx, S.col, S.out, 2.6);
    face(ctx, S);
  }

  function face(ctx, S) {
    const t = S.t, P = S.P;
    if (P.mask === 'spider') {
      spiderMask(ctx, S);
      return;
    }
    const blink = S.pose.blink != null ? S.pose.blink : (t % 3.6) < 0.13 ? 1 : 0;
    const ex1 = -2.8, ex2 = 6.6, ey = HEAD_Y - 2;
    // маска супергероя
    if (P.mask === 'eye') {
      G.rr(ctx, -13.5, ey - 5, 27.5, 9.5, 4.5);
      fs(ctx, P.maskColor || '#1E2A78', U.shade(P.maskColor || '#1E2A78', -0.5), 1.6);
    }
    // щёчки
    if (!P.beard) {
      G.ellipse(ctx, -8.5, HEAD_Y + 3.5, 2.8, 1.9);
      ctx.fillStyle = 'rgba(255,110,150,0.55)';
      ctx.fill();
      G.ellipse(ctx, 11.2, HEAD_Y + 3.5, 2.6, 1.9);
      ctx.fill();
    }
    if (P.freckles) {
      ctx.fillStyle = U.shade(S.col, -0.35);
      for (const [x, y] of [[-9, 1.5], [-7, 3.2], [-10.5, 3.6], [10, 1.5], [12, 3.2], [9, 3.8]]) {
        G.circle(ctx, x, HEAD_Y + y, 0.9);
        ctx.fill();
      }
    }
    // глаза
    const ry = 4.1 * (1 - blink * 0.9);
    G.ellipse(ctx, ex1, ey, 3.3, ry);
    ctx.fillStyle = '#fff';
    ctx.fill();
    G.ellipse(ctx, ex2, ey, 3.3, ry);
    ctx.fill();
    if (blink < 0.5) {
      dot(ctx, ex1 + 0.9, ey + 0.5, 2.1, '#1E1433');
      dot(ctx, ex2 + 0.9, ey + 0.5, 2.1, '#1E1433');
      dot(ctx, ex1 + 1.6, ey - 0.6, 0.8, '#fff');
      dot(ctx, ex2 + 1.6, ey - 0.6, 0.8, '#fff');
    }
    // мордочка
    if (P.snout) drawSnout(ctx, S, P.snout);
    // улыбка
    const snouted = P.snout === 'fox' || P.snout === 'bear' || P.snout === 'capy';
    ctx.beginPath();
    if (snouted) ctx.arc(3.2, HEAD_Y + 5.2, 3.2, 0.15 * PI, 0.85 * PI);
    else ctx.arc(2.2, HEAD_Y + 3.2, P.snout === 'turtle' ? 5.2 : 4.2, 0.15 * PI, 0.85 * PI);
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3A1A1A';
    ctx.stroke();
    if (P.snout === 'bunny' || P.snout === 'cat') whiskers(ctx, P.snout === 'bunny');
    if (P.beard) drawBeard(ctx, P.beard);
  }

  function whiskers(ctx, teeth) {
    if (teeth) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(1.2, HEAD_Y + 6.8, 1.9, 2.4);
      ctx.fillRect(3.3, HEAD_Y + 6.8, 1.9, 2.4);
    }
    ctx.beginPath();
    ctx.moveTo(-5, HEAD_Y + 2);
    ctx.lineTo(-13, HEAD_Y + 0.5);
    ctx.moveTo(-5, HEAD_Y + 3.5);
    ctx.lineTo(-13, HEAD_Y + 4.5);
    ctx.moveTo(10, HEAD_Y + 2);
    ctx.lineTo(18, HEAD_Y + 0.5);
    ctx.moveTo(10, HEAD_Y + 3.5);
    ctx.lineTo(18, HEAD_Y + 4.5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(40,20,20,0.7)';
    ctx.stroke();
  }

  function drawSnout(ctx, S, type) {
    const light = U.shade(S.col, 0.55);
    switch (type) {
      case 'cat':
      case 'bunny':
        ctx.beginPath();
        ctx.moveTo(1, HEAD_Y + 0.8);
        ctx.lineTo(4.6, HEAD_Y + 0.8);
        ctx.lineTo(2.8, HEAD_Y + 3);
        ctx.closePath();
        fs(ctx, '#FF7FAA', '#C2476F', 1);
        break;
      case 'fox':
        G.ellipse(ctx, 3.5, HEAD_Y + 5.5, 7.5, 5.2);
        fs(ctx, '#FFFFFF', U.shade(S.col, -0.2), 1);
        dot(ctx, 3.5, HEAD_Y + 2.4, 2, '#1E1433');
        break;
      case 'bear':
        G.ellipse(ctx, 3, HEAD_Y + 5, 6.8, 5.2);
        fs(ctx, light, U.shade(S.col, -0.3), 1);
        G.ellipse(ctx, 3, HEAD_Y + 2.6, 2.8, 1.9);
        fs(ctx, '#2B1A10');
        break;
      case 'capy':
        G.ellipse(ctx, 3.5, HEAD_Y + 5.2, 9.5, 7);
        fs(ctx, U.shade(S.col, 0.3), U.shade(S.col, -0.35), 1.4);
        G.ellipse(ctx, 0.8, HEAD_Y + 2.6, 1.3, 1.9, 0.3);
        fs(ctx, '#3A2410');
        G.ellipse(ctx, 6.2, HEAD_Y + 2.6, 1.3, 1.9, -0.3);
        fs(ctx, '#3A2410');
        break;
    }
  }

  function drawBeard(ctx, c) {
    ctx.beginPath();
    ctx.moveTo(-13, HEAD_Y + 1);
    ctx.quadraticCurveTo(-14, HEAD_Y + 20, 1, HEAD_Y + 29);
    ctx.quadraticCurveTo(16, HEAD_Y + 20, 15, HEAD_Y + 1);
    ctx.quadraticCurveTo(8, HEAD_Y + 9, 1, HEAD_Y + 5);
    ctx.quadraticCurveTo(-6, HEAD_Y + 9, -13, HEAD_Y + 1);
    ctx.closePath();
    fs(ctx, c, U.shade(c, -0.3), 1.8);
    ctx.fillStyle = c;
    G.ellipse(ctx, -2.5, HEAD_Y + 4, 5.4, 2.4, 0.3);
    ctx.fill();
    G.ellipse(ctx, 7, HEAD_Y + 4, 5.4, 2.4, -0.3);
    ctx.fill();
  }

  function spiderMask(ctx, S) {
    const c = U.shade(S.col, -0.55);
    ctx.save();
    G.circle(ctx, 0, HEAD_Y, HEAD_R - 1.2);
    ctx.clip();
    ctx.beginPath();
    const cx = 2, cy = HEAD_Y + 1;
    for (let i = 0; i < 8; i++) {
      const a = (i * PI) / 4 + 0.2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20);
    }
    for (const r of [5.5, 10.5]) {
      ctx.moveTo(cx + r, cy);
      ctx.arc(cx, cy, r, 0, TAU);
    }
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = c;
    ctx.stroke();
    ctx.restore();
    for (const [ex, rot] of [[-4, -0.55], [8.6, 0.55]]) {
      ctx.save();
      ctx.translate(ex, HEAD_Y - 2.5);
      ctx.rotate(rot);
      G.ellipse(ctx, 0, 0, 4.4, 6);
      fs(ctx, '#FFFFFF', '#1E1433', 2.2);
      ctx.restore();
    }
  }

  // ---------- причёски ----------
  function hairBack(ctx, S, type, hc) {
    const dk = U.shade(hc, -0.4);
    switch (type) {
      case 'long':
        G.rr(ctx, -17.5, HEAD_Y - 10, 35, 40, 14);
        fs(ctx, hc, dk, 2);
        break;
      case 'longWavy': {
        ctx.beginPath();
        ctx.moveTo(-16, HEAD_Y - 6);
        for (let i = 0; i <= 4; i++) ctx.quadraticCurveTo(-22 + (i % 2) * 5, HEAD_Y + i * 8 + 4, -18 + (i % 2) * 2, HEAD_Y + i * 8 + 8);
        for (let i = 0; i <= 5; i++) {
          const x = -18 + (i * 36) / 5;
          ctx.quadraticCurveTo(x + 3.6, HEAD_Y + 38, x + 7.2, HEAD_Y + 34);
        }
        for (let i = 4; i >= 0; i--) ctx.quadraticCurveTo(22 - (i % 2) * 5, HEAD_Y + i * 8 + 4, 17 - (i % 2) * 2, HEAD_Y + i * 8);
        ctx.closePath();
        fs(ctx, hc, dk, 2);
        break;
      }
      case 'braids':
        for (const side of [-1, 1]) {
          for (let k = 0; k < 3; k++) {
            G.ellipse(ctx, side * 15.5, HEAD_Y + 5 + k * 8, 4.6, 5.4);
            fs(ctx, hc, dk, 1.6);
          }
          dot(ctx, side * 15.5, HEAD_Y + 29, 3, '#FF6FA8', '#B01E62', 1.2);
        }
        break;
      case 'ponytail': {
        const sw = Math.sin(S.t * 4) * 2;
        ctx.beginPath();
        ctx.moveTo(-8, HEAD_Y - 12);
        ctx.quadraticCurveTo(-32, HEAD_Y - 16 + sw, -27 + sw, HEAD_Y + 16);
        ctx.quadraticCurveTo(-18, HEAD_Y + 6, -12, HEAD_Y - 2);
        ctx.closePath();
        fs(ctx, hc, dk, 2);
        dot(ctx, -13, HEAD_Y - 8, 3.2, '#FF6FA8', '#B01E62', 1.2);
        break;
      }
      case 'curly':
        ctx.fillStyle = dk;
        ctx.beginPath();
        for (let a = PI * 0.85; a <= PI * 2.15; a += PI / 8) {
          const x = Math.cos(a) * 16, y = HEAD_Y + Math.sin(a) * 16;
          ctx.moveTo(x + 7.6, y);
          ctx.arc(x, y, 7.6, 0, TAU);
        }
        ctx.fill();
        ctx.fillStyle = hc;
        ctx.beginPath();
        for (let a = PI * 0.85; a <= PI * 2.15; a += PI / 8) {
          const x = Math.cos(a) * 16, y = HEAD_Y + Math.sin(a) * 16;
          ctx.moveTo(x + 6.2, y);
          ctx.arc(x, y, 6.2, 0, TAU);
        }
        ctx.fill();
        break;
    }
  }

  // «Шапочка» волос над лбом; spikes — растрёпанные вихры
  function hairCap(ctx, dy, spikes) {
    const r = HEAD_R + 1.4;
    const a0 = PI * 1.04, a1 = PI * 1.96;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a0) * r, HEAD_Y + Math.sin(a0) * r);
    if (spikes) {
      const n = 8;
      for (let i = 1; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        const rr = i % 2 ? r + 5.5 : r;
        ctx.lineTo(Math.cos(a) * rr, HEAD_Y + Math.sin(a) * rr);
      }
    } else ctx.arc(0, HEAD_Y, r, a0, a1);
    const xR = Math.cos(a1) * r, xL = Math.cos(a0) * r;
    const yF = HEAD_Y + dy;
    ctx.lineTo(xR - 1, yF);
    const n2 = 4;
    for (let i = 1; i <= n2; i++) {
      const xa = xR + ((xL - xR) * (i - 0.5)) / n2, xb = xR + ((xL - xR) * i) / n2;
      ctx.quadraticCurveTo(xa, yF + 4.2, xb, yF);
    }
    ctx.closePath();
  }

  function hairFront(ctx, S, type, hc) {
    const dk = U.shade(hc, -0.4);
    switch (type) {
      case 'short':
        hairCap(ctx, -7, false);
        fs(ctx, hc, dk, 1.8);
        break;
      case 'messy':
        hairCap(ctx, -6.5, true);
        fs(ctx, hc, dk, 1.8);
        break;
      case 'long':
      case 'longWavy':
      case 'ponytail':
      case 'braids':
        hairCap(ctx, -7.5, false);
        fs(ctx, hc, dk, 1.8);
        if (type !== 'ponytail') {
          G.rr(ctx, -17.5, HEAD_Y - 7, 5.5, 20, 3);
          fs(ctx, hc, dk, 1.4);
          G.rr(ctx, 12.5, HEAD_Y - 7, 5.5, 20, 3);
          fs(ctx, hc, dk, 1.4);
        }
        break;
      case 'bun':
        hairCap(ctx, -7.5, false);
        fs(ctx, hc, dk, 1.8);
        G.circle(ctx, 0, HEAD_Y - 18, 7);
        fs(ctx, hc, dk, 1.8);
        break;
      case 'curly':
        ctx.fillStyle = hc;
        ctx.beginPath();
        for (let x = -10; x <= 12; x += 5.5) {
          ctx.moveTo(x + 4.4, HEAD_Y - 11);
          ctx.arc(x, HEAD_Y - 11, 4.4, 0, TAU);
        }
        ctx.fill();
        break;
    }
  }

  // ---------- головные уборы ----------
  function drawCrown(ctx) {
    const y0 = HEAD_Y - 10;
    ctx.beginPath();
    ctx.moveTo(-13, y0);
    ctx.lineTo(-15.5, y0 - 17);
    ctx.lineTo(-7.5, y0 - 8);
    ctx.lineTo(0, y0 - 21);
    ctx.lineTo(7.5, y0 - 8);
    ctx.lineTo(15.5, y0 - 17);
    ctx.lineTo(13, y0);
    ctx.closePath();
    fs(ctx, '#FFD23F', '#B87800', 2);
    G.rr(ctx, -14, y0 - 4.5, 28, 6, 2);
    fs(ctx, '#FFB300', '#B87800', 1.5);
    dot(ctx, 0, y0 - 1.5, 2.3, '#E8264A');
    dot(ctx, -8, y0 - 1.5, 1.9, '#2F8CFF');
    dot(ctx, 8, y0 - 1.5, 1.9, '#20C070');
    dot(ctx, -15.5, y0 - 17, 2.3, '#FFE680', '#B87800', 1.2);
    dot(ctx, 0, y0 - 21, 2.6, '#FFE680', '#B87800', 1.2);
    dot(ctx, 15.5, y0 - 17, 2.3, '#FFE680', '#B87800', 1.2);
  }

  function lerpPt(a, b, k) {
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }

  function drawHat(ctx) {
    const y0 = HEAD_Y - 7;
    const L = [-16, y0], Rt = [16, y0], T = [-5, y0 - 38];
    ctx.beginPath();
    ctx.moveTo(L[0], L[1]);
    ctx.lineTo(T[0], T[1]);
    ctx.lineTo(Rt[0], Rt[1]);
    ctx.closePath();
    fs(ctx, '#FF5470', '#A8233A', 2);
    // полоски
    ctx.fillStyle = '#fff';
    for (const [k1, k2] of [[0.28, 0.4], [0.58, 0.68]]) {
      const a = lerpPt(L, T, k1), b = lerpPt(Rt, T, k1), c = lerpPt(Rt, T, k2), d = lerpPt(L, T, k2);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.lineTo(d[0], d[1]);
      ctx.closePath();
      ctx.fill();
    }
    G.rr(ctx, -18, y0 - 4, 36, 8, 4);
    fs(ctx, '#fff', '#C9C0D6', 1.5);
    dot(ctx, T[0], T[1], 5.5, '#fff', '#C9C0D6', 1.5);
  }

  function drawBow(ctx) {
    ctx.save();
    ctx.translate(8, HEAD_Y - 12);
    ctx.rotate(0.35);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-9, -12, -15, -4);
    ctx.quadraticCurveTo(-12, 7, 0, 0);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(9, -12, 15, -4);
    ctx.quadraticCurveTo(12, 7, 0, 0);
    fs(ctx, '#FF4FA0', '#B01E62', 2);
    ctx.beginPath();
    ctx.moveTo(-1, 1);
    ctx.lineTo(-6, 11);
    ctx.lineTo(-2, 10);
    ctx.moveTo(1, 1);
    ctx.lineTo(6, 11);
    ctx.lineTo(2, 10);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FF4FA0';
    ctx.stroke();
    dot(ctx, 0, 0, 3.6, '#FF7EBE', '#B01E62', 1.8);
    ctx.restore();
  }

  function drawHatType(ctx, S, type, P) {
    const c = P.hatColor || '#4B3FC4';
    if (type === 'wizard' || type === 'wizardTall') drawWizardHat(ctx, S, c, type === 'wizardTall');
    else if (type === 'witch') drawWitchHat(ctx, S, c, P.band || '#FFC928');
    else if (type === 'chef') drawChefHat(ctx);
    else if (type === 'helmet') drawHelmet(ctx, c);
  }

  function drawWizardHat(ctx, S, color, tall) {
    const y0 = HEAD_Y - 10;
    const dk = U.shade(color, -0.55);
    G.ellipse(ctx, 0, y0, 23, 5.5);
    fs(ctx, U.shade(color, -0.12), dk, 2);
    const sway = Math.sin(S.t * 3) * 2;
    const h = tall ? 56 : 40;
    ctx.beginPath();
    ctx.moveTo(-12.5, y0 - 1);
    ctx.quadraticCurveTo(-8, y0 - h * 0.65, -9 + sway, y0 - h);
    ctx.quadraticCurveTo(-16 + sway, y0 - h - 4, -20 + sway, y0 - h);
    ctx.quadraticCurveTo(-10 + sway, y0 - h - 8, -4 + sway, y0 - h);
    ctx.quadraticCurveTo(2, y0 - h * 0.6, 12.5, y0 - 1);
    ctx.closePath();
    fs(ctx, color, dk, 2);
    G.rr(ctx, -12.5, y0 - 6, 25, 5, 2);
    fs(ctx, '#FFC928', '#B07A00', 1.2);
    G.starPath(ctx, -2, y0 - 17, 5, 2.2);
    fs(ctx, '#FFE066');
    ctx.beginPath();
    ctx.arc(-5, y0 - 28 - (tall ? 10 : 0), 3.2, 0.5, 5.2);
    ctx.arc(-3.8, y0 - 28.6 - (tall ? 10 : 0), 2.6, 5.0, 0.7, true);
    fs(ctx, '#FFE066');
  }

  function drawWitchHat(ctx, S, color, band) {
    const y0 = HEAD_Y - 10;
    const dk = U.shade(color, -0.55);
    G.ellipse(ctx, 0, y0, 27, 6.2);
    fs(ctx, U.shade(color, -0.12), dk, 2);
    const sway = Math.sin(S.t * 2.6) * 1.5;
    ctx.beginPath();
    ctx.moveTo(-12, y0 - 1);
    ctx.lineTo(-3 + sway, y0 - 32);
    ctx.quadraticCurveTo(-10 + sway, y0 - 40, -19 + sway, y0 - 36);
    ctx.quadraticCurveTo(-8 + sway, y0 - 46, 1 + sway, y0 - 34);
    ctx.lineTo(12, y0 - 1);
    ctx.closePath();
    fs(ctx, color, dk, 2);
    G.rr(ctx, -12.5, y0 - 8, 25, 6, 2);
    fs(ctx, band, U.shade(band, -0.4), 1.2);
    G.rr(ctx, -3, y0 - 9, 6, 8, 1.5);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#6A4A10';
    ctx.stroke();
  }

  function drawChefHat(ctx) {
    const y0 = HEAD_Y - 12;
    G.rr(ctx, -12.5, y0 - 3, 25, 10, 3);
    fs(ctx, '#FFFFFF', '#B8B8C8', 1.6);
    ctx.fillStyle = '#B8B8C8';
    ctx.beginPath();
    for (const [x, y, r] of [[-8, y0 - 9, 8.6], [0, y0 - 14, 9.6], [8, y0 - 9, 8.6]]) {
      ctx.moveTo(x + r + 1.4, y);
      ctx.arc(x, y, r + 1.4, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    for (const [x, y, r] of [[-8, y0 - 9, 8.6], [0, y0 - 14, 9.6], [8, y0 - 9, 8.6]]) {
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, TAU);
    }
    ctx.fill();
  }

  function drawHelmet(ctx, color) {
    ctx.beginPath();
    ctx.arc(0, HEAD_Y, HEAD_R + 2.6, PI, TAU);
    ctx.lineTo(HEAD_R + 2.6, HEAD_Y - 3);
    ctx.lineTo(-HEAD_R - 2.6, HEAD_Y - 3);
    ctx.closePath();
    fs(ctx, color, U.shade(color, -0.5), 2);
    ctx.beginPath();
    ctx.moveTo(-3, HEAD_Y - 17);
    ctx.lineTo(0, HEAD_Y - 25);
    ctx.lineTo(4, HEAD_Y - 17);
    ctx.closePath();
    fs(ctx, '#FFD23F', '#B87800', 1.4);
    for (const x of [-4.5, 7]) {
      G.circle(ctx, x, HEAD_Y - 9, 4.2);
      fs(ctx, '#9FE3FF', '#2B3A55', 1.8);
    }
  }

  function drawTiara(ctx, gem) {
    const y0 = HEAD_Y - 11;
    ctx.beginPath();
    ctx.moveTo(-12, y0 + 2);
    ctx.quadraticCurveTo(0, y0 - 10, 12, y0 + 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D9D9F0';
    ctx.stroke();
    const gx = 0, gy = y0 - 6;
    switch (gem) {
      case 'rose':
        dot(ctx, gx, gy, 5.2, '#FF4F9A', '#B01E62', 1.4);
        ctx.beginPath();
        ctx.arc(gx, gy, 2.6, 0, 4.5);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#B01E62';
        ctx.stroke();
        break;
      case 'drop':
        ctx.beginPath();
        ctx.moveTo(gx, gy - 7);
        ctx.quadraticCurveTo(gx + 6, gy + 1, gx, gy + 4);
        ctx.quadraticCurveTo(gx - 6, gy + 1, gx, gy - 7);
        fs(ctx, '#5AC8FA', '#2E6FA8', 1.4);
        break;
      case 'snow':
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * PI) / 3;
          ctx.moveTo(gx - Math.cos(a) * 6, gy - Math.sin(a) * 6);
          ctx.lineTo(gx + Math.cos(a) * 6, gy + Math.sin(a) * 6);
        }
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#7FC8FF';
        ctx.stroke();
        break;
      default:
        G.starPath(ctx, gx, gy, 6.5, 3);
        fs(ctx, gem === 'star' ? '#FFD23F' : '#FF7EC8', gem === 'star' ? '#B87800' : '#C2185B', 1.5);
    }
    dot(ctx, -7, y0 - 2, 1.8, '#7FE3FF');
    dot(ctx, 7, y0 - 2, 1.8, '#7FE3FF');
  }

  function drawCrownType(ctx, S, type) {
    switch (type) {
      case 'sun': {
        const rot = S.t * 0.4;
        ctx.save();
        ctx.translate(0, HEAD_Y);
        for (let i = 0; i < 9; i++) {
          const a = PI + (i + 0.5) * (PI / 9) + Math.sin(rot) * 0.02;
          const len = i % 2 ? 11 : 16;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a - 0.14) * 15, Math.sin(a - 0.14) * 15);
          ctx.lineTo(Math.cos(a) * (15 + len), Math.sin(a) * (15 + len));
          ctx.lineTo(Math.cos(a + 0.14) * 15, Math.sin(a + 0.14) * 15);
          ctx.closePath();
          fs(ctx, '#FFC928', '#D98B00', 1.3);
        }
        ctx.restore();
        ctx.beginPath();
        ctx.arc(0, HEAD_Y, HEAD_R + 1, PI * 1.05, PI * 1.95);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FFB300';
        ctx.stroke();
        break;
      }
      case 'sea': {
        ctx.beginPath();
        ctx.arc(0, HEAD_Y, HEAD_R + 1, PI * 1.08, PI * 1.92);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#14BFA8';
        ctx.stroke();
        for (const [x, y, r] of [[-9, HEAD_Y - 14, 4.2], [9, HEAD_Y - 14, 4.2]]) {
          ctx.beginPath();
          ctx.moveTo(x, y + r);
          ctx.arc(x, y + r, r * 1.4, PI * 1.2, PI * 1.8);
          ctx.closePath();
          fs(ctx, '#FFD6E8', '#C2476F', 1.3);
        }
        G.starPath(ctx, 0, HEAD_Y - 20, 7, 3.2, 5, -PI / 2 + Math.sin(S.t) * 0.1);
        fs(ctx, '#FF8A5A', '#B84A20', 1.4);
        break;
      }
      case 'thunder': {
        // тучка с молниями
        for (const bx of [-9, 9]) {
          ctx.beginPath();
          ctx.moveTo(bx, HEAD_Y - 18);
          ctx.lineTo(bx - 3, HEAD_Y - 26);
          ctx.lineTo(bx + 1, HEAD_Y - 26);
          ctx.lineTo(bx - 2, HEAD_Y - 34);
          ctx.lineTo(bx + 5, HEAD_Y - 24);
          ctx.lineTo(bx + 1, HEAD_Y - 24);
          ctx.closePath();
          fs(ctx, '#FFE066', '#B88A00', 1.2);
        }
        ctx.fillStyle = '#8A96B8';
        ctx.beginPath();
        for (const [x, y, r] of [[-8, HEAD_Y - 14, 6.5], [0, HEAD_Y - 18, 8], [8, HEAD_Y - 14, 6.5]]) {
          ctx.moveTo(x + r + 1.2, y);
          ctx.arc(x, y, r + 1.2, 0, TAU);
        }
        ctx.fill();
        ctx.fillStyle = '#DDE3F5';
        ctx.beginPath();
        for (const [x, y, r] of [[-8, HEAD_Y - 14, 6.5], [0, HEAD_Y - 18, 8], [8, HEAD_Y - 14, 6.5]]) {
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, TAU);
        }
        ctx.fill();
        break;
      }
      case 'moon': {
        ctx.beginPath();
        ctx.arc(0, HEAD_Y, HEAD_R + 1, PI * 1.08, PI * 1.92);
        ctx.lineWidth = 3.4;
        ctx.strokeStyle = '#E6E6FA';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, HEAD_Y - 22, 7, 0.9, PI * 2 - 0.9, false);
        ctx.arc(3.5, HEAD_Y - 24, 6, PI * 2 - 1.2, 1.2, true);
        ctx.closePath();
        fs(ctx, '#FFF4C2', '#C9B070', 1.3);
        break;
      }
      case 'flowers': {
        const cols = ['#FF6FA8', '#FFD23F', '#B983FF', '#FF8A5A', '#FF6FA8', '#7FD3FF', '#FFD23F'];
        for (let i = 0; i < 7; i++) {
          const a = PI + (i + 0.5) * (PI / 7);
          const x = Math.cos(a) * 15.5, y = HEAD_Y + Math.sin(a) * 15.5;
          ctx.fillStyle = cols[i];
          ctx.beginPath();
          for (let k = 0; k < 5; k++) {
            const b = (k / 5) * TAU;
            ctx.moveTo(x + Math.cos(b) * 2.6 + 2.2, y + Math.sin(b) * 2.6);
            ctx.arc(x + Math.cos(b) * 2.6, y + Math.sin(b) * 2.6, 2.2, 0, TAU);
          }
          ctx.fill();
          dot(ctx, x, y, 1.5, '#FFF3A0');
        }
        break;
      }
      case 'leaves':
      case 'laurel': {
        const c1 = type === 'laurel' ? '#FFD23F' : '#5BC86A', c2 = type === 'laurel' ? '#B87800' : '#2E7D32';
        for (let i = 0; i < 7; i++) {
          for (const side of [-1, 1]) {
            const a = -PI / 2 + side * (0.35 + i * 0.25);
            const x = Math.cos(a) * 15.5, y = HEAD_Y + Math.sin(a) * 15.5;
            G.ellipse(ctx, x, y, 4.2, 2.1, a + side * 0.9);
            fs(ctx, c1, c2, 1);
          }
        }
        break;
      }
    }
  }

  function drawMandarin(ctx, S) {
    const bob = Math.sin(S.t * 2) * 0.6;
    G.circle(ctx, 2, HEAD_Y - 19 + bob, 6.8);
    fs(ctx, '#FF9A1A', '#B85A00', 1.8);
    G.ellipse(ctx, 0, HEAD_Y - 21 + bob, 2, 1.4, -0.5);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    G.ellipse(ctx, 5, HEAD_Y - 27 + bob, 4, 2, -0.5);
    fs(ctx, '#4CB944', '#2E7D32', 1.2);
  }

  // ---------- ушки ----------
  function drawEars(ctx, S, type) {
    const c = S.col, o = S.out;
    switch (type) {
      case 'cat':
      case 'fox': {
        const tall = type === 'fox' ? 20 : 15;
        for (const side of [-1, 1]) {
          const bx = side * 9;
          ctx.beginPath();
          ctx.moveTo(bx - 6, HEAD_Y - 10);
          ctx.lineTo(bx + side * 3, HEAD_Y - 10 - tall);
          ctx.lineTo(bx + 6, HEAD_Y - 10);
          ctx.closePath();
          fs(ctx, c, o, 2);
          ctx.beginPath();
          ctx.moveTo(bx - 3, HEAD_Y - 11);
          ctx.lineTo(bx + side * 2.4, HEAD_Y - 8 - tall * 0.8);
          ctx.lineTo(bx + 3, HEAD_Y - 11);
          ctx.closePath();
          fs(ctx, type === 'fox' ? '#FFFFFF' : '#FFB3CE');
          if (type === 'fox') {
            ctx.beginPath();
            ctx.moveTo(bx + side * 3, HEAD_Y - 10 - tall);
            ctx.lineTo(bx + side * 3 - 3, HEAD_Y - 4 - tall);
            ctx.lineTo(bx + side * 3 + 3, HEAD_Y - 4 - tall);
            ctx.closePath();
            fs(ctx, '#2B1A10');
          }
        }
        break;
      }
      case 'bunny': {
        const flop = Math.sin(S.t * 3) * 0.06;
        for (const [x, rot] of [[-6, -0.22 - flop], [6, 0.28 + flop]]) {
          ctx.save();
          ctx.translate(x, HEAD_Y - 11);
          ctx.rotate(rot);
          G.ellipse(ctx, 0, -13, 5.8, 15);
          fs(ctx, c, o, 2);
          G.ellipse(ctx, 0, -12, 2.8, 10.5);
          ctx.fillStyle = '#FFB3CE';
          ctx.fill();
          ctx.restore();
        }
        break;
      }
      case 'bear':
        for (const side of [-1, 1]) {
          dot(ctx, side * 11, HEAD_Y - 12, 6.2, c, o, 2);
          dot(ctx, side * 11, HEAD_Y - 12, 3, U.shade(c, 0.45));
        }
        break;
      case 'capy':
        for (const side of [-1, 1]) dot(ctx, side * 11.5, HEAD_Y - 11.5, 3.8, U.shade(c, -0.15), o, 1.6);
        break;
    }
  }

  // ---------- одежда ----------
  function drawSkirt(ctx, S) {
    const sw = Math.sin(S.pose.phase || 0) * 2;
    ctx.beginPath();
    ctx.moveTo(-8, HIP_Y - 7);
    ctx.lineTo(8, HIP_Y - 7);
    ctx.lineTo(19 + sw, HIP_Y + 13);
    for (let i = 0; i <= 5; i++) {
      const x = 19 + sw - (i * 38) / 5;
      ctx.quadraticCurveTo(x + 3.8, HIP_Y + 17, x, HIP_Y + 13);
    }
    ctx.closePath();
    fs(ctx, '#FF6FB5', '#B0306E', 2);
    ctx.beginPath();
    for (const x of [-6, 0, 6]) {
      ctx.moveTo(x * 0.6, HIP_Y - 5);
      ctx.lineTo(x * 1.6 + sw * 0.5, HIP_Y + 12);
    }
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = 'rgba(160,30,90,0.45)';
    ctx.stroke();
    G.rr(ctx, -9, HIP_Y - 9, 18, 4, 2);
    fs(ctx, '#FFD1E8', '#B0306E', 1.2);
  }

  function drawDress(ctx, S, color, pattern) {
    const sw = Math.sin(S.pose.phase || 0) * 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, SH_Y - 3);
    ctx.lineTo(6, SH_Y - 3);
    ctx.lineTo(8, HIP_Y - 10);
    ctx.lineTo(22 + sw, HIP_Y + 16);
    ctx.quadraticCurveTo(0, HIP_Y + 21, -22 + sw, HIP_Y + 16);
    ctx.lineTo(-8, HIP_Y - 10);
    ctx.closePath();
    const dk = U.shade(color, -0.5);
    fs(ctx, color, dk, 2);
    const pts = [[-8, -34], [3, -30], [12, -26], [-14, -27], [-2, -40], [8, -44], [-4, -51]];
    switch (pattern) {
      case 'stars':
        ctx.fillStyle = '#FFE066';
        for (const [x, y] of pts) {
          G.starPath(ctx, x + sw * 0.3, y, 2.4, 1.1);
          ctx.fill();
        }
        break;
      case 'waves':
        ctx.beginPath();
        for (const y of [-30, -22]) {
          ctx.moveTo(-14 + sw * 0.3, y);
          for (let k = 0; k < 4; k++) ctx.quadraticCurveTo(-11 + k * 7 + sw * 0.3, y - 3, -7.5 + k * 7 + sw * 0.3, y);
        }
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.stroke();
        break;
      case 'leaves':
        ctx.fillStyle = '#A8E6A0';
        for (const [x, y] of pts) {
          G.ellipse(ctx, x + sw * 0.3, y, 2.8, 1.4, 0.7);
          ctx.fill();
        }
        break;
      case 'snow':
        ctx.fillStyle = '#FFFFFF';
        for (const [x, y] of pts) {
          G.sparklePath(ctx, x + sw * 0.3, y, 2.8);
          ctx.fill();
        }
        break;
      case 'flowers':
        for (const [x, y] of pts) {
          dot(ctx, x + sw * 0.3, y, 2, '#FF9EC8');
          dot(ctx, x + sw * 0.3, y, 0.9, '#FFE066');
        }
        break;
      default:
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        for (const [x, y] of pts) {
          G.circle(ctx, x + sw * 0.3, y, 1.6);
          ctx.fill();
        }
    }
    G.rr(ctx, -8.5, HIP_Y - 12, 17, 4, 2);
    fs(ctx, U.shade(color, 0.45), dk, 1.2);
    ctx.beginPath();
    ctx.arc(0, SH_Y - 3, 6, 0, PI);
    fs(ctx, '#fff', '#8B7BB5', 1.2);
  }

  function drawCape(ctx, S, color, clasp) {
    const sp = U.clamp(Math.abs(S.speed) / 330, 0, 1);
    const w = Math.sin(S.t * 9) * (2 + sp * 4);
    const ext = 6 + sp * 18;
    ctx.beginPath();
    ctx.moveTo(6, SH_Y - 3);
    ctx.lineTo(-6, SH_Y - 3);
    ctx.quadraticCurveTo(-14 - ext * 0.6, -40, -16 - ext, -16 + w);
    ctx.quadraticCurveTo(-4 - ext * 0.5, -10 - w * 0.5, 10 - ext * 0.2, -18);
    ctx.quadraticCurveTo(10, -44, 6, SH_Y - 3);
    ctx.closePath();
    fs(ctx, color, U.shade(color, -0.45), 2);
    dot(ctx, 2, SH_Y - 2, 3, clasp, U.shade(clasp, -0.4), 1.2);
  }

  // «Костюм» супергероя: туловище-комбинезон цвета героя
  function drawSuit(ctx, S, type) {
    const c = S.col, o = S.out;
    ctx.beginPath();
    ctx.moveTo(-9, SH_Y - 3);
    ctx.lineTo(9, SH_Y - 3);
    ctx.lineTo(7.5, HIP_Y + 3);
    ctx.lineTo(-7.5, HIP_Y + 3);
    ctx.closePath();
    fs(ctx, c, o, 2);
    if (type === 'web') {
      ctx.beginPath();
      ctx.moveTo(0, SH_Y - 2);
      ctx.lineTo(0, HIP_Y + 2);
      for (const y of [SH_Y + 4, SH_Y + 12, SH_Y + 20]) {
        ctx.moveTo(-8.4, y - 3);
        ctx.quadraticCurveTo(-4, y + 1, 0, y);
        ctx.quadraticCurveTo(4, y + 1, 8.4, y - 3);
      }
      ctx.moveTo(-8.5, SH_Y);
      ctx.lineTo(0, SH_Y + 12);
      ctx.lineTo(8.5, SH_Y);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = U.shade(c, -0.55);
      ctx.stroke();
    }
    G.rr(ctx, -8, HIP_Y - 3, 16, 4, 2);
    fs(ctx, type === 'web' ? U.shade(c, -0.35) : '#FFC928', type === 'web' ? null : '#B87800', 1);
  }

  function drawEmblem(ctx, S, type) {
    const x = 0, y = -56;
    switch (type) {
      case 'star':
        dot(ctx, x, y, 7, '#FFD23F', '#B87800', 1.8);
        G.starPath(ctx, x, y + 0.5, 5, 2.2);
        ctx.fillStyle = '#E53935';
        ctx.fill();
        break;
      case 'heart':
        G.heartPath(ctx, x, y, 5.8);
        fs(ctx, '#FF3A7A', '#FFFFFF', 1.6);
        break;
      case 'moon':
        ctx.beginPath();
        ctx.arc(x, y, 6, 0.9, PI * 2 - 0.9, false);
        ctx.arc(x + 3, y - 1.5, 5, PI * 2 - 1.2, 1.2, true);
        ctx.closePath();
        fs(ctx, '#FFE066', '#B88A00', 1.2);
        break;
      case 'bolt':
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 8);
        ctx.lineTo(x - 4, y + 1);
        ctx.lineTo(x, y + 1);
        ctx.lineTo(x - 2, y + 8);
        ctx.lineTo(x + 5, y - 2);
        ctx.lineTo(x + 1, y - 2);
        ctx.closePath();
        fs(ctx, '#FFE066', '#B88A00', 1.2);
        break;
      case 'spider': {
        const c = U.shade(S.col, -0.7);
        ctx.beginPath();
        for (const side of [-1, 1]) {
          for (let k = 0; k < 4; k++) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + side * 6, y - 5 + k * 3.4);
            ctx.lineTo(x + side * 7.5, y - 3 + k * 3.6);
          }
        }
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = c;
        ctx.stroke();
        G.ellipse(ctx, x, y + 1, 2.6, 3.6);
        fs(ctx, c);
        dot(ctx, x, y - 3.6, 1.9, c);
        break;
      }
    }
  }

  function drawRobe(ctx, S, color, stars) {
    const sw = Math.sin(S.pose.phase || 0) * 2.5;
    const dk = U.shade(color, -0.5);
    ctx.beginPath();
    ctx.moveTo(-7, SH_Y - 3);
    ctx.lineTo(7, SH_Y - 3);
    ctx.lineTo(20 + sw, -9);
    ctx.quadraticCurveTo(0, -5, -20 + sw, -9);
    ctx.closePath();
    fs(ctx, color, dk, 2);
    if (stars) {
      ctx.fillStyle = '#FFE066';
      for (const [x, y, r] of [[-9, -22, 3.2], [8, -30, 2.6], [-2, -45, 2.4], [12, -15, 2.2], [-13, -38, 2]]) {
        G.starPath(ctx, x + sw * 0.3, y, r, r * 0.45);
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.moveTo(-8, -50);
    ctx.lineTo(8, -50);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFC928';
    ctx.stroke();
  }

  function drawApron(ctx) {
    G.rr(ctx, -8.5, SH_Y + 6, 17, 30, 4);
    fs(ctx, '#FFFFFF', '#B8B8C8', 1.6);
    G.rr(ctx, -4, SH_Y + 22, 8, 7, 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#FF8A5A';
    ctx.stroke();
  }

  function drawRobotBody(ctx, S, type, metal, screen) {
    const dk = U.shade(metal, -0.55);
    if (type === 'round') {
      G.ellipse(ctx, 0, SH_Y + 14, 13.5, 17.5);
      fs(ctx, metal, dk, 2.2);
      G.circle(ctx, 0, SH_Y + 12, 6.5);
      fs(ctx, '#2A3A4E');
      if (screen === 'heart') {
        G.heartPath(ctx, 0, SH_Y + 12, 3.6);
        ctx.fillStyle = '#FF5A8A';
        ctx.fill();
      } else dot(ctx, 0, SH_Y + 12, 2.6, '#6CFFB0');
      dot(ctx, -6, SH_Y + 24, 1.8, '#FFD23F');
      dot(ctx, 6, SH_Y + 24, 1.8, '#FF6A6A');
      return;
    }
    G.rr(ctx, -13.5, SH_Y - 4, 27, 33, 6);
    fs(ctx, metal, dk, 2.2);
    G.rr(ctx, -8.5, SH_Y + 3, 17, 14, 3);
    fs(ctx, '#2A3A4E');
    dot(ctx, -4, SH_Y + 10, 2.2, '#FF5A5A');
    dot(ctx, 1, SH_Y + 10, 2.2, '#FFD23F');
    dot(ctx, 6, SH_Y + 10, 2.2, '#3CE28A');
    G.heartPath(ctx, 0, SH_Y + 23, 3.2);
    ctx.fillStyle = '#FF5A8A';
    ctx.fill();
  }

  function drawRobotHead(ctx, S, type, metal, antenna, eyeCol) {
    const y = HEAD_Y;
    const dk = U.shade(metal, -0.55);
    // антенна
    if (antenna === 'ball') {
      ctx.beginPath();
      ctx.moveTo(0, y - 15);
      ctx.lineTo(0, y - 26);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = dk;
      ctx.stroke();
      const on = Math.sin(S.t * 5) > 0;
      dot(ctx, 0, y - 27, 3.6, on ? '#FF4A4A' : '#9E2B2B', dk, 1.5);
    } else if (antenna === 'flower') {
      ctx.beginPath();
      ctx.moveTo(0, y - 15);
      ctx.lineTo(0, y - 25);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#3E9E36';
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU + S.t;
        ctx.moveTo(Math.cos(a) * 4.5 + 2.6, y - 28 + Math.sin(a) * 4.5);
        ctx.arc(Math.cos(a) * 4.5, y - 28 + Math.sin(a) * 4.5, 2.6, 0, TAU);
      }
      ctx.fill();
      dot(ctx, 0, y - 28, 2.4, '#FFD23F');
    } else if (antenna === 'leaf') {
      ctx.beginPath();
      ctx.moveTo(0, y - 15);
      ctx.quadraticCurveTo(-1, y - 21, 0, y - 25);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#3E9E36';
      ctx.stroke();
      G.ellipse(ctx, -5, y - 24, 5, 2.4, 0.5);
      fs(ctx, '#5BC86A', '#2E7D32', 1.1);
      G.ellipse(ctx, 5, y - 26, 5, 2.4, -0.5);
      fs(ctx, '#5BC86A', '#2E7D32', 1.1);
    }
    const blink = (S.t % 3.2) < 0.12;
    if (type === 'dome') {
      G.rr(ctx, -17, y + 1, 34, 13, 6);
      fs(ctx, metal, dk, 2.2);
      ctx.beginPath();
      ctx.arc(0, y + 2, 16, PI, TAU);
      ctx.closePath();
      fs(ctx, 'rgba(190,235,255,0.65)', dk, 2);
      const ec = eyeCol || '#FF5A5A';
      dot(ctx, 1.5, y - 5, 7, '#FFFFFF', dk, 1.4);
      if (!blink) {
        dot(ctx, 3, y - 5, 4, ec);
        dot(ctx, 3.6, y - 5, 2, '#1E1433');
      } else {
        ctx.fillStyle = ec;
        ctx.fillRect(-4, y - 5.5, 11, 1.6);
      }
      G.ellipse(ctx, -8, y - 7, 2.5, 4, 0.5);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fill();
      dot(ctx, 10, y + 7.5, 1.8, Math.sin(S.t * 4) > 0 ? '#3CE28A' : '#1E7A34');
      return;
    }
    if (type === 'round') {
      G.circle(ctx, 0, y, 16);
      fs(ctx, metal, dk, 2.4);
      G.rr(ctx, -11.5, y - 7, 23, 11, 5.5);
      fs(ctx, '#20304A');
      ctx.fillStyle = '#5CF2FF';
      if (blink) {
        ctx.fillRect(-7, y - 2, 5, 1.4);
        ctx.fillRect(3, y - 2, 5, 1.4);
      } else {
        G.ellipse(ctx, -4.5, y - 1.5, 2.5, 3);
        ctx.fill();
        G.ellipse(ctx, 5.5, y - 1.5, 2.5, 3);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(1, y + 7, 3.5, 0.2 * PI, 0.8 * PI);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = dk;
      ctx.stroke();
      G.ellipse(ctx, -8.5, y + 5, 2.4, 1.6);
      ctx.fillStyle = 'rgba(255,110,150,0.6)';
      ctx.fill();
      G.ellipse(ctx, 10.5, y + 5, 2.4, 1.6);
      ctx.fill();
      return;
    }
    // коробочка
    G.rr(ctx, -17, y - 15, 34, 30, 7);
    fs(ctx, metal, dk, 2.4);
    G.rr(ctx, -12.5, y - 10, 25, 19, 5);
    fs(ctx, '#20304A');
    ctx.fillStyle = '#5CF2FF';
    if (blink) {
      ctx.fillRect(-7.5, y - 3, 6, 1.5);
      ctx.fillRect(3.5, y - 3, 6, 1.5);
    } else {
      G.rr(ctx, -7.5, y - 6, 5.5, 6, 2);
      ctx.fill();
      G.rr(ctx, 3.5, y - 6, 5.5, 6, 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(1, y + 1, 4, 0.2 * PI, 0.8 * PI);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#5CF2FF';
    ctx.stroke();
    dot(ctx, -17, y, 3, U.shade(metal, -0.2), dk, 1.2);
    dot(ctx, 17, y, 3, U.shade(metal, -0.2), dk, 1.2);
  }

  function drawWings(ctx, S, style, colors) {
    const c1 = (colors && colors[0]) || '#BFE9FF', c2 = (colors && colors[1]) || '#FFD0EC';
    const k = 0.75 + 0.25 * Math.sin(S.t * 12);
    ctx.save();
    ctx.translate(-2, SH_Y + 4);
    ctx.globalAlpha = 0.88;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side * k, 1);
      if (style === 'leaf') {
        for (const [cx, cy, rx, ry, rot, c] of [[14, -8, 15, 7, -0.5, c1], [11, 9, 11, 5.5, 0.45, c2]]) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, rot, 0, TAU);
          fs(ctx, c, U.shade(c, -0.45), 1.5);
          ctx.beginPath();
          ctx.moveTo(cx - Math.cos(rot) * rx, cy - Math.sin(rot) * rx);
          ctx.lineTo(cx + Math.cos(rot) * rx, cy + Math.sin(rot) * rx);
          ctx.lineWidth = 1;
          ctx.strokeStyle = U.shade(c, -0.4);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.ellipse(13, -9, 14, 9, -0.6, 0, TAU);
        fs(ctx, c1, U.shade(c1, -0.4), 1.5);
        ctx.beginPath();
        ctx.ellipse(10, 9, 10, 6.5, 0.5, 0, TAU);
        fs(ctx, c2, U.shade(c2, -0.4), 1.5);
        if (style === 'star') {
          ctx.fillStyle = '#FFFFFF';
          G.starPath(ctx, 14, -9, 3.2, 1.4);
          ctx.fill();
          G.starPath(ctx, 10, 9, 2.4, 1.1);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawJetpack(ctx, S) {
    const moving = Math.abs(S.speed) > 30 || S.pose.state === 'jump' || S.pose.state === 'fall';
    for (const x of [-17, 9]) {
      G.rr(ctx, x, SH_Y - 1, 8, 22, 4);
      fs(ctx, '#B7C1D6', '#4A546A', 1.8);
      G.rr(ctx, x, SH_Y - 3, 8, 5, 2);
      fs(ctx, '#FF5A5A', '#9E2B2B', 1.2);
      if (moving) {
        const fl = 6 + Math.sin(S.t * 30 + x) * 3;
        ctx.beginPath();
        ctx.moveTo(x + 1, SH_Y + 21);
        ctx.quadraticCurveTo(x + 4, SH_Y + 21 + fl * 2, x + 7, SH_Y + 21);
        ctx.closePath();
        fs(ctx, '#FFB300');
      }
    }
  }

  function drawShell(ctx) {
    G.ellipse(ctx, -1, -54, 19, 24);
    fs(ctx, '#43A047', '#2E7D32', 2.4);
    ctx.fillStyle = '#7CCB6C';
    for (const [x, y] of [[-12, -64], [-13, -46], [11, -64], [12, -46], [0, -76], [0, -32]]) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.lineTo(x + Math.cos(a) * 4.5, y + Math.sin(a) * 4);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawTail(ctx, S, type) {
    const c = S.col, o = S.out;
    const sway = Math.sin(S.t * 4) * 3;
    switch (type) {
      case 'cat':
        ctx.beginPath();
        ctx.moveTo(-4, HIP_Y + 2);
        ctx.quadraticCurveTo(-22, HIP_Y + 6 + sway, -24 + sway * 0.4, HIP_Y - 16);
        ctx.lineCap = 'round';
        ctx.lineWidth = 7.5;
        ctx.strokeStyle = o;
        ctx.stroke();
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = c;
        ctx.stroke();
        break;
      case 'fox':
        ctx.beginPath();
        ctx.moveTo(-4, HIP_Y);
        ctx.bezierCurveTo(-18, HIP_Y + 12, -34, HIP_Y + 2 + sway, -30 + sway * 0.4, HIP_Y - 18);
        ctx.bezierCurveTo(-24, HIP_Y - 8, -16, HIP_Y - 4, -4, HIP_Y - 4);
        ctx.closePath();
        fs(ctx, c, o, 2);
        G.ellipse(ctx, -29 + sway * 0.4, HIP_Y - 15, 4.6, 5.6, 0.4);
        fs(ctx, '#FFFFFF');
        break;
      case 'bunny':
        dot(ctx, -8, HIP_Y + 2, 6.5, '#fff', '#C9B8C9', 2);
        break;
      case 'bear':
        dot(ctx, -8, HIP_Y + 1, 4.6, c, o, 1.8);
        break;
      case 'turtle':
        ctx.beginPath();
        ctx.moveTo(-6, HIP_Y - 2);
        ctx.lineTo(-13, HIP_Y + 3);
        ctx.lineTo(-6, HIP_Y + 4);
        ctx.closePath();
        fs(ctx, c, o, 1.6);
        break;
    }
  }

  function drawTutu(ctx, S, color) {
    const dk = U.shade(color, -0.45);
    ctx.beginPath();
    ctx.moveTo(-9, HIP_Y - 7);
    ctx.lineTo(9, HIP_Y - 7);
    ctx.lineTo(24, HIP_Y + 6);
    for (let i = 0; i <= 6; i++) {
      const x = 24 - (i * 48) / 6;
      ctx.quadraticCurveTo(x + 4, HIP_Y + 12, x, HIP_Y + 6);
    }
    ctx.closePath();
    fs(ctx, color, dk, 1.8);
    ctx.beginPath();
    ctx.moveTo(-9, HIP_Y - 7);
    ctx.lineTo(9, HIP_Y - 7);
    ctx.lineTo(17, HIP_Y + 1);
    ctx.lineTo(-17, HIP_Y + 1);
    ctx.closePath();
    fs(ctx, U.shade(color, 0.4));
  }

  function drawToga(ctx, S, color) {
    const dk = U.shade(color, -0.35);
    ctx.beginPath();
    ctx.moveTo(-9, SH_Y - 4);
    ctx.lineTo(6, SH_Y - 4);
    ctx.lineTo(18, -18);
    ctx.quadraticCurveTo(0, -14, -17, -18);
    ctx.closePath();
    fs(ctx, color, dk, 2);
    ctx.beginPath();
    ctx.moveTo(-6, SH_Y);
    ctx.quadraticCurveTo(4, -52, 14, -24);
    ctx.moveTo(-9, -60);
    ctx.quadraticCurveTo(-2, -40, 4, -18);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = U.rgba(dk, 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, -44);
    ctx.lineTo(10, -46);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFC928';
    ctx.stroke();
  }

  function drawAura(ctx, S, color) {
    const c = color || '#FFE066';
    G.glow(ctx, 0, HEAD_Y, 36, c, 0.55);
    G.rays(ctx, 0, HEAD_Y, 36, S.t * 0.6, c, 10, 0.32);
    for (let i = 0; i < 3; i++) {
      const a = S.t * 1.5 + (i * TAU) / 3;
      G.sparkle(ctx, Math.cos(a) * 28, -50 + Math.sin(a) * 30, 3.5, '#FFF3A0');
    }
  }

  function drawWand(ctx, S, stick, tip) {
    const L = S.aB;
    const hx = L[4], hy = L[5];
    const ang = Math.atan2(L[5] - L[3], L[4] - L[2]);
    const ex = hx + Math.cos(ang) * 18, ey = hy + Math.sin(ang) * 18;
    ctx.beginPath();
    ctx.moveTo(hx - Math.cos(ang) * 3, hy - Math.sin(ang) * 3);
    ctx.lineTo(ex, ey);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = stick;
    ctx.stroke();
    G.starPath(ctx, ex, ey, 6.5, 2.8, 5, S.t * 2);
    fs(ctx, tip, U.shade(tip, -0.4), 1.2);
    const tw = 0.5 + 0.5 * Math.sin(S.t * 8);
    G.sparkle(ctx, ex + 7, ey - 6, 2.5 + tw * 2, '#fff', 0.9);
  }

  // Предмет в передней руке
  function drawHandItem(ctx, S, type, P) {
    const L = S.aB;
    const hx = L[4], hy = L[5];
    const ang = Math.atan2(L[5] - L[3], L[4] - L[2]);
    const stroke = (w, c) => {
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.strokeStyle = c;
      ctx.stroke();
    };
    switch (type) {
      case 'wand':
        drawWand(ctx, S, '#7A4A22', P.tip || '#FFD84A');
        break;
      case 'staff':
      case 'trident':
      case 'sunstaff': {
        // посох всегда выше головы: от пола (или ниже руки) до макушки
        const top = Math.min(hy - 30, HEAD_Y - 16);
        const bottom = Math.min(0, hy + 30);
        ctx.beginPath();
        ctx.moveTo(hx, bottom);
        ctx.lineTo(hx, top);
        stroke(3.4, type === 'staff' ? '#7A4A22' : '#C9A23A');
        if (type === 'staff') {
          G.glow(ctx, hx, top - 6, 16, P.tip || '#7FE3FF', 0.6);
          ctx.beginPath();
          ctx.moveTo(hx, top - 14);
          ctx.lineTo(hx + 5, top - 6);
          ctx.lineTo(hx, top + 2);
          ctx.lineTo(hx - 5, top - 6);
          ctx.closePath();
          fs(ctx, P.tip || '#7FE3FF', '#2E6FA8', 1.3);
        } else if (type === 'trident') {
          ctx.beginPath();
          ctx.moveTo(hx - 7, top - 10);
          ctx.lineTo(hx - 7, top);
          ctx.lineTo(hx + 7, top);
          ctx.lineTo(hx + 7, top - 10);
          ctx.moveTo(hx, top);
          ctx.lineTo(hx, top - 13);
          stroke(2.6, '#FFD23F');
          ctx.fillStyle = '#FFD23F';
          for (const px of [-7, 0, 7]) {
            ctx.beginPath();
            ctx.moveTo(px + hx - 2.6, top - 9 - (px ? 0 : 3));
            ctx.lineTo(px + hx, top - 15 - (px ? 0 : 3));
            ctx.lineTo(px + hx + 2.6, top - 9 - (px ? 0 : 3));
            ctx.closePath();
            ctx.fill();
          }
        } else {
          G.glow(ctx, hx, top - 8, 20, '#FFE066', 0.65);
          ctx.save();
          ctx.translate(hx, top - 8);
          ctx.rotate(S.t);
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a - 0.25) * 6, Math.sin(a - 0.25) * 6);
            ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
            ctx.lineTo(Math.cos(a + 0.25) * 6, Math.sin(a + 0.25) * 6);
            ctx.closePath();
            fs(ctx, '#FFC928');
          }
          ctx.restore();
          dot(ctx, hx, top - 8, 6.5, '#FFE45C', '#D98B00', 1.4);
        }
        break;
      }
      case 'broom': {
        ctx.beginPath();
        ctx.moveTo(hx + 12, hy - 22);
        ctx.lineTo(hx - 16, hy + 24);
        stroke(3, '#8A5A2B');
        ctx.save();
        ctx.translate(hx - 16, hy + 24);
        ctx.rotate(Math.atan2(46, -28) - PI / 2);
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(-8, 16);
        ctx.lineTo(8, 16);
        ctx.lineTo(3, 0);
        ctx.closePath();
        fs(ctx, '#E8C36A', '#9C7A2A', 1.4);
        ctx.restore();
        break;
      }
      case 'bolt': {
        const bx = hx + 2, by = hy - 14;
        G.glow(ctx, bx, by, 18, '#FFE066', 0.6);
        ctx.beginPath();
        ctx.moveTo(bx + 3, by - 12);
        ctx.lineTo(bx - 5, by + 2);
        ctx.lineTo(bx, by + 2);
        ctx.lineTo(bx - 3, by + 13);
        ctx.lineTo(bx + 7, by - 3);
        ctx.lineTo(bx + 2, by - 3);
        ctx.closePath();
        fs(ctx, '#FFE066', '#B88A00', 1.4);
        break;
      }
      case 'spatula': {
        const ex = hx + Math.cos(ang) * 14, ey = hy + Math.sin(ang) * 14;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(ex, ey);
        stroke(2.6, '#8A5A2B');
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(ang);
        G.rr(ctx, 0, -4, 9, 8, 2);
        fs(ctx, '#C9D3DD', '#6B7A8A', 1.2);
        ctx.restore();
        break;
      }
      case 'can': {
        G.rr(ctx, hx - 1, hy - 3, 13, 10, 3);
        fs(ctx, '#5BC86A', '#2E7D32', 1.4);
        ctx.beginPath();
        ctx.moveTo(hx + 12, hy);
        ctx.lineTo(hx + 20, hy - 7);
        stroke(2.2, '#2E7D32');
        ctx.beginPath();
        ctx.arc(hx + 5, hy - 3, 5, PI, TAU);
        stroke(1.8, '#2E7D32');
        break;
      }
      case 'book':
        G.rr(ctx, hx - 3, hy - 11, 12, 15, 2);
        fs(ctx, P.item || '#E0533F', '#6A1A10', 1.4);
        ctx.fillStyle = '#FFF4D6';
        ctx.fillRect(hx + 8, hy - 10, 2, 13);
        G.starPath(ctx, hx + 3, hy - 4, 2.6, 1.2);
        ctx.fillStyle = '#FFE066';
        ctx.fill();
        break;
      case 'flower':
        ctx.beginPath();
        ctx.moveTo(hx, hy + 2);
        ctx.quadraticCurveTo(hx + 3, hy - 8, hx + 1, hy - 16);
        stroke(2, '#3E9E36');
        ctx.fillStyle = '#FF6FA8';
        ctx.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * TAU;
          ctx.moveTo(hx + 1 + Math.cos(a) * 3.4 + 2.6, hy - 18 + Math.sin(a) * 3.4);
          ctx.arc(hx + 1 + Math.cos(a) * 3.4, hy - 18 + Math.sin(a) * 3.4, 2.6, 0, TAU);
        }
        ctx.fill();
        dot(ctx, hx + 1, hy - 18, 2, '#FFE066');
        break;
    }
  }

  // Показ отдельного наряда в меню (без человечка): s — масштаб
  H.drawSkinIcon = function (ctx, id, cx, cy, s, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const S = { t: t || 0, f: 1, pose: { phase: 0 }, speed: 0, P: NO_PARTS };
    if (id === 'crown') {
      ctx.translate(0, -HEAD_Y + 20);
      drawCrown(ctx);
    } else if (id === 'hat') {
      ctx.translate(2, -HEAD_Y + 26);
      drawHat(ctx);
    } else if (id === 'bow') {
      ctx.translate(-8, -HEAD_Y + 14);
      drawBow(ctx);
    } else if (id === 'skirt') {
      ctx.translate(0, -HIP_Y - 4);
      drawSkirt(ctx, S);
    } else if (id === 'dress') {
      ctx.translate(0, -(SH_Y + HIP_Y) / 2 + 2);
      drawDress(ctx, S, '#9B6BFF', 'dots');
    } else if (id === 'cape') {
      ctx.translate(4, -(SH_Y - 16) / 2 - 22);
      drawCape(ctx, S, '#E63946', '#FFC928');
    }
    ctx.restore();
  };

  // =========================================================
  // Питомцы
  // =========================================================
  // opts: {facing, t, moving, state: 'idle'|'walk'|'climb'|'fly', scale}
  P.draw = function (ctx, id, x, y, o) {
    o = o || {};
    const f = o.facing < 0 ? -1 : 1;
    const s = o.scale || 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * f, s);
    const t = o.t || 0;
    switch (id) {
      case 'cat':
        drawCat(ctx, t, o.moving);
        break;
      case 'robot':
        drawPetRobot(ctx, t, o.moving);
        break;
      case 'turtle':
        drawTurtle(ctx, t, o.moving);
        break;
      case 'owl':
        drawOwl(ctx, t, o.moving);
        break;
      case 'capy':
        drawCapyPet(ctx, t, o.moving);
        break;
    }
    ctx.restore();
  };

  function drawCat(ctx, t, moving) {
    const step = moving ? Math.sin(t * 14) : 0;
    const bob = moving ? Math.abs(Math.sin(t * 14)) * -1.5 : Math.sin(t * 2) * 0.5;
    const o = '#A85A12', c = '#FFA040';
    // хвост
    ctx.beginPath();
    ctx.moveTo(-15, -16 + bob);
    ctx.quadraticCurveTo(-30, -20 + Math.sin(t * 4) * 4, -24, -38 + Math.sin(t * 4) * 3);
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = o;
    ctx.stroke();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = c;
    ctx.stroke();
    // лапки
    ctx.lineWidth = 5;
    ctx.strokeStyle = o;
    ctx.beginPath();
    for (const [x, ph] of [[-10, 0], [-4, PI], [6, PI], [12, 0]]) {
      ctx.moveTo(x, -10 + bob);
      ctx.lineTo(x + Math.sin(t * 14 + ph) * 3 * (moving ? 1 : 0), 0);
    }
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = c;
    ctx.stroke();
    // тельце
    G.ellipse(ctx, 0, -16 + bob, 17, 10.5);
    fs(ctx, c, o, 2);
    ctx.beginPath();
    ctx.moveTo(-6, -25 + bob);
    ctx.lineTo(-4, -18 + bob);
    ctx.moveTo(0, -26 + bob);
    ctx.lineTo(1, -19 + bob);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(168,90,18,0.6)';
    ctx.stroke();
    // голова
    const hy = -30 + bob + step * 0.5;
    ctx.beginPath();
    ctx.moveTo(8, hy - 6);
    ctx.lineTo(9, hy - 17);
    ctx.lineTo(15, hy - 9);
    ctx.moveTo(18, hy - 9);
    ctx.lineTo(24, hy - 17);
    ctx.lineTo(25, hy - 6);
    fs(ctx, c, o, 2);
    G.circle(ctx, 16.5, hy, 11);
    fs(ctx, c, o, 2);
    const bl = (t % 4) < 0.12;
    if (bl) {
      ctx.fillStyle = '#2B1A0A';
      ctx.fillRect(12, hy - 2, 4, 1.4);
      ctx.fillRect(19, hy - 2, 4, 1.4);
    } else {
      dot(ctx, 14, hy - 1.5, 2, '#2B1A0A');
      dot(ctx, 21, hy - 1.5, 2, '#2B1A0A');
    }
    dot(ctx, 17.5, hy + 3, 1.6, '#FF6F91');
    ctx.beginPath();
    ctx.moveTo(10, hy + 3);
    ctx.lineTo(3, hy + 1.5);
    ctx.moveTo(10, hy + 5);
    ctx.lineTo(3, hy + 6);
    ctx.moveTo(25, hy + 3);
    ctx.lineTo(32, hy + 1.5);
    ctx.moveTo(25, hy + 5);
    ctx.lineTo(32, hy + 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(60,30,10,0.7)';
    ctx.stroke();
  }

  function drawPetRobot(ctx, t, moving) {
    const bob = moving ? Math.sin(t * 20) * 0.8 : Math.sin(t * 3) * 0.6;
    // колёса
    for (const x of [-9, 9]) {
      G.circle(ctx, x, -7, 7);
      fs(ctx, '#3A4555', '#1C232D', 1.5);
      const a = moving ? t * 12 : 0;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 5, -7 + Math.sin(a) * 5);
      ctx.lineTo(x - Math.cos(a) * 5, -7 - Math.sin(a) * 5);
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = '#9AA8B8';
      ctx.stroke();
    }
    // ручки
    ctx.beginPath();
    ctx.moveTo(-15, -26 + bob);
    ctx.lineTo(-21, -18 + bob + Math.sin(t * 6) * 3);
    ctx.moveTo(15, -26 + bob);
    ctx.lineTo(21, -18 + bob - Math.sin(t * 6) * 3);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6B7A8A';
    ctx.stroke();
    // корпус
    G.rr(ctx, -15, -44 + bob, 30, 32, 6);
    fs(ctx, '#8EC5FF', '#3A6EA8', 2);
    G.rr(ctx, -11, -40 + bob, 22, 15, 4);
    fs(ctx, '#20304A');
    const bl = (t % 3) < 0.12;
    ctx.fillStyle = '#6CFFB0';
    if (bl) {
      ctx.fillRect(-7, -33 + bob, 5, 1.4);
      ctx.fillRect(2, -33 + bob, 5, 1.4);
    } else {
      dot(ctx, -4.5, -33 + bob, 2.4, '#6CFFB0');
      dot(ctx, 4.5, -33 + bob, 2.4, '#6CFFB0');
    }
    // «Т»-рот как на эскизе
    ctx.beginPath();
    ctx.moveTo(-3, -28 + bob);
    ctx.lineTo(3, -28 + bob);
    ctx.moveTo(0, -28 + bob);
    ctx.lineTo(0, -26 + bob);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#6CFFB0';
    ctx.stroke();
    dot(ctx, -6, -18 + bob, 2, '#FFD23F');
    dot(ctx, 0, -18 + bob, 2, '#FF6A6A');
    dot(ctx, 6, -18 + bob, 2, '#FFD23F');
    // антенна
    ctx.beginPath();
    ctx.moveTo(0, -44 + bob);
    ctx.lineTo(0, -52 + bob);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3A6EA8';
    ctx.stroke();
    dot(ctx, 0, -54 + bob, 3, Math.sin(t * 6) > 0 ? '#FF5A5A' : '#FFD23F');
  }

  function drawTurtle(ctx, t, moving) {
    const st = moving ? Math.sin(t * 9) : 0;
    const o = '#2E7D32';
    // лапки
    ctx.fillStyle = '#9BE07A';
    ctx.strokeStyle = o;
    ctx.lineWidth = 1.6;
    for (const [x, ph] of [[-11, 0], [-4, PI], [5, PI], [12, 0]]) {
      G.ellipse(ctx, x + Math.sin(t * 9 + ph) * 2 * (moving ? 1 : 0), -3, 3.8, 4.5);
      ctx.fill();
      ctx.stroke();
    }
    // хвостик
    ctx.beginPath();
    ctx.moveTo(-17, -8);
    ctx.lineTo(-23, -6);
    ctx.lineTo(-17, -4);
    fs(ctx, '#9BE07A', o, 1.4);
    // голова
    const hx = 21 + st * 1.2, hy = -12 - Math.abs(st) * 1.2;
    G.circle(ctx, hx, hy, 7.2);
    fs(ctx, '#9BE07A', o, 1.8);
    dot(ctx, hx + 2.5, hy - 2, 1.8, '#1B2A12');
    ctx.beginPath();
    ctx.arc(hx + 2, hy + 1.5, 2.6, 0.2, 2.2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#1B2A12';
    ctx.stroke();
    // панцирь
    ctx.beginPath();
    ctx.ellipse(0, -8, 19, 15, 0, PI, TAU);
    ctx.closePath();
    fs(ctx, '#43A047', o, 2);
    ctx.fillStyle = '#7CCB6C';
    for (const [x, y] of [[0, -15], [-9, -11], [9, -11]]) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        ctx.lineTo(x + Math.cos(a) * 4.2, y + Math.sin(a) * 3.6);
      }
      ctx.closePath();
      ctx.fill();
    }
    G.rr(ctx, -20, -9, 40, 4.5, 2);
    fs(ctx, '#2E7D32');
  }

  function drawOwl(ctx, t, moving) {
    const flap = Math.sin(t * (moving ? 16 : 6)) * (moving ? 0.7 : 0.25);
    const bob = Math.sin(t * 3) * 2;
    ctx.translate(0, bob);
    const o = '#5D3A17', c = '#B07A40';
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 10, -24);
      ctx.rotate(side * (0.4 + flap));
      G.ellipse(ctx, side * 7, 2, 9, 5);
      fs(ctx, '#8C5A2B', o, 1.6);
      ctx.restore();
    }
    G.ellipse(ctx, 0, -22, 13, 16);
    fs(ctx, c, o, 2);
    G.ellipse(ctx, 0, -16, 8, 9);
    ctx.fillStyle = '#F2D6A8';
    ctx.fill();
    // ушки
    ctx.beginPath();
    ctx.moveTo(-11, -32);
    ctx.lineTo(-10, -42);
    ctx.lineTo(-4, -35);
    ctx.moveTo(11, -32);
    ctx.lineTo(10, -42);
    ctx.lineTo(4, -35);
    fs(ctx, c, o, 1.6);
    const bl = (t % 3.5) < 0.15;
    for (const x of [-5, 5]) {
      G.circle(ctx, x, -28, 5.2);
      fs(ctx, '#fff', o, 1.4);
      if (bl) {
        ctx.fillStyle = '#2B1A0A';
        ctx.fillRect(x - 3, -28.5, 6, 1.4);
      } else {
        dot(ctx, x + 0.8, -27.6, 2.6, '#2B1A0A');
        dot(ctx, x + 1.6, -28.6, 0.8, '#fff');
      }
    }
    ctx.beginPath();
    ctx.moveTo(-2, -23);
    ctx.lineTo(2, -23);
    ctx.lineTo(0, -19.5);
    ctx.closePath();
    fs(ctx, '#FFA726', '#B26A00', 1);
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(-4, -2);
    ctx.moveTo(4, -6);
    ctx.lineTo(4, -2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFA726';
    ctx.stroke();
  }

  function drawCapyPet(ctx, t, moving) {
    const bob = moving ? Math.abs(Math.sin(t * 10)) * -1.4 : Math.sin(t * 1.6) * 0.5;
    const c = '#A8743F', o = '#6A4520';
    // лапки
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = o;
    ctx.beginPath();
    for (const [x, ph] of [[-11, 0], [-5, PI], [7, PI], [13, 0]]) {
      ctx.moveTo(x, -8 + bob);
      ctx.lineTo(x + Math.sin(t * 10 + ph) * 2.5 * (moving ? 1 : 0), 0);
    }
    ctx.stroke();
    // тельце-бочонок
    G.rr(ctx, -19, -30 + bob, 36, 23, 11);
    fs(ctx, c, o, 2);
    // голова
    G.rr(ctx, 8, -36 + bob, 20, 17, 7);
    fs(ctx, c, o, 2);
    G.rr(ctx, 18, -30 + bob, 11, 10, 4);
    fs(ctx, '#8C5A30', o, 1.4);
    dot(ctx, 22, -26 + bob, 1.1, '#2B1A0A');
    dot(ctx, 26, -26 + bob, 1.1, '#2B1A0A');
    dot(ctx, 11, -35 + bob, 3, '#8C5A30', o, 1.2);
    const bl = (t % 4.2) < 0.14;
    if (bl) {
      ctx.fillStyle = '#2B1A0A';
      ctx.fillRect(14, -31 + bob, 4, 1.3);
    } else dot(ctx, 16, -30.5 + bob, 1.8, '#2B1A0A');
    // мандаринка на голове
    dot(ctx, 17, -41 + bob, 4.6, '#FF9A1A', '#B85A00', 1.4);
    G.ellipse(ctx, 19.5, -45.5 + bob, 3, 1.5, -0.5);
    fs(ctx, '#4CB944');
  }

  // Питомец летает? (сова парит над землёй)
  P.flies = (id) => id === 'owl';
})(window.VW);
