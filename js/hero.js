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
  // look: {color, head, body, set}; pose: {state, t, phase, facing, speed, squash, blink}
  H.draw = function (ctx, x, y, look, pose, scale) {
    scale = scale || 1;
    pose = pose || {};
    const t = pose.t || 0;
    const f = pose.facing < 0 ? -1 : 1;
    const R = computePose(pose);
    const col = H.bodyColor(look, t);
    const out = U.shade(col, -0.5);
    const set = look.set || null;
    const head = set ? null : look.head;
    const body = set ? null : look.body;
    const sq = pose.squash || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * f * (1 + sq), scale * (1 - sq));
    ctx.translate(0, R.bob);

    const lA = limb(0, HIP_Y, R.legA, 21, 21);
    const lB = limb(0, HIP_Y, R.legB, 21, 21);
    const aA = limb(0, SH_Y, R.armA, 17, 16);
    const aB = limb(0, SH_Y, R.armB, 17, 16);
    const S = { t: t, f: f, pose: pose, R: R, col: col, out: out, lA: lA, lB: lB, aA: aA, aB: aB, speed: pose.speed || 0, set: set };

    // 1. то, что за спиной
    if (set === 'god') drawAura(ctx, S);
    if (set === 'fairy') drawWings(ctx, S);
    if (body === 'cape') drawCape(ctx, S, '#E63946', '#FFC928');
    if (set === 'hero') drawCape(ctx, S, '#3559E0', '#FFC928');
    if (set === 'animal') dot(ctx, -8, HIP_Y + 2, 6.5, '#fff', '#C9B8C9', 2);

    // 2–3. ноги и туловище (одним проходом, чтобы не было швов)
    strokeLimbs(ctx, [lA, lB, [0, NECK_Y, 0, (NECK_Y + HIP_Y) / 2, 0, HIP_Y]], col, out, LIMB_W);
    foot(ctx, lA[4], lA[5], col, out);
    foot(ctx, lB[4], lB[5], col, out);

    // 4. одежда
    if (body === 'skirt') drawSkirt(ctx, S);
    if (body === 'dress') drawDress(ctx, S);
    if (set === 'wizard') drawRobe(ctx, S);
    if (set === 'robot') drawRobotBody(ctx, S);
    if (set === 'fairy') drawTutu(ctx, S);
    if (set === 'god') drawToga(ctx, S);
    if (set === 'hero') drawEmblem(ctx, S);

    // у робота голова-коробка рисуется раньше рук, чтобы поднятые руки было видно
    if (set === 'robot') drawRobotHead(ctx, S);

    // 5. руки
    strokeLimbs(ctx, [aA, aB], col, out, LIMB_W);
    if (!body && !set) dot(ctx, 0, SH_Y, LIMB_W / 2 + 0.3, col);
    dot(ctx, aA[4], aA[5], 4.3, col, out, 2.2);
    dot(ctx, aB[4], aB[5], 4.3, col, out, 2.2);
    if (set === 'wizard') drawWand(ctx, S, '#7A4A22', '#FFD84A');
    if (set === 'fairy') drawWand(ctx, S, '#E8E8F5', '#FF7EC8');

    // 6. голова
    if (set !== 'robot') drawHead(ctx, S);

    // 7. на голове
    if (head === 'crown') drawCrown(ctx);
    if (head === 'hat') drawHat(ctx);
    if (head === 'bow') drawBow(ctx);
    if (set === 'wizard') drawWizardHat(ctx, S);
    if (set === 'fairy') drawTiara(ctx);
    if (set === 'animal') drawBunnyEars(ctx, S);
    if (set === 'god') drawLaurel(ctx);

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
    const t = S.t;
    const blink = S.pose.blink != null ? S.pose.blink : (t % 3.6) < 0.13 ? 1 : 0;
    const ex1 = -2.8, ex2 = 6.6, ey = HEAD_Y - 2;
    // маска супергероя
    if (S.set === 'hero') {
      G.rr(ctx, -13.5, ey - 5, 27.5, 9.5, 4.5);
      fs(ctx, '#1E2A78', '#0E1440', 1.6);
    }
    // щёчки
    G.ellipse(ctx, -8.5, HEAD_Y + 3.5, 2.8, 1.9);
    ctx.fillStyle = 'rgba(255,110,150,0.55)';
    ctx.fill();
    G.ellipse(ctx, 11.2, HEAD_Y + 3.5, 2.6, 1.9);
    ctx.fill();
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
    // улыбка
    ctx.beginPath();
    ctx.arc(2.2, HEAD_Y + 3.2, 4.2, 0.15 * PI, 0.85 * PI);
    ctx.lineWidth = 1.9;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3A1A1A';
    ctx.stroke();
    // зайка: носик, зубки и усики
    if (S.set === 'animal') {
      ctx.beginPath();
      ctx.moveTo(1, HEAD_Y + 0.8);
      ctx.lineTo(4.6, HEAD_Y + 0.8);
      ctx.lineTo(2.8, HEAD_Y + 3);
      ctx.closePath();
      fs(ctx, '#FF7FAA', '#C2476F', 1);
      ctx.fillStyle = '#fff';
      ctx.fillRect(1.2, HEAD_Y + 6.8, 1.9, 2.4);
      ctx.fillRect(3.3, HEAD_Y + 6.8, 1.9, 2.4);
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

  function drawWizardHat(ctx, S) {
    const y0 = HEAD_Y - 10;
    G.ellipse(ctx, 0, y0, 23, 5.5);
    fs(ctx, '#3F35A8', '#1E1760', 2);
    const sway = Math.sin(S.t * 3) * 2;
    ctx.beginPath();
    ctx.moveTo(-12.5, y0 - 1);
    ctx.quadraticCurveTo(-8, y0 - 26, -9 + sway, y0 - 40);
    ctx.quadraticCurveTo(-16 + sway, y0 - 44, -20 + sway, y0 - 40);
    ctx.quadraticCurveTo(-10 + sway, y0 - 48, -4 + sway, y0 - 40);
    ctx.quadraticCurveTo(2, y0 - 24, 12.5, y0 - 1);
    ctx.closePath();
    fs(ctx, '#4B3FC4', '#1E1760', 2);
    G.rr(ctx, -12.5, y0 - 6, 25, 5, 2);
    fs(ctx, '#FFC928', '#B07A00', 1.2);
    G.starPath(ctx, -2, y0 - 17, 5, 2.2);
    fs(ctx, '#FFE066');
    ctx.beginPath();
    ctx.arc(-5, y0 - 28, 3.2, 0.5, 5.2);
    ctx.arc(-3.8, y0 - 28.6, 2.6, 5.0, 0.7, true);
    fs(ctx, '#FFE066');
  }

  function drawTiara(ctx) {
    const y0 = HEAD_Y - 11;
    ctx.beginPath();
    ctx.moveTo(-12, y0 + 2);
    ctx.quadraticCurveTo(0, y0 - 10, 12, y0 + 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D9D9F0';
    ctx.stroke();
    G.starPath(ctx, 0, y0 - 6, 6.5, 3);
    fs(ctx, '#FF7EC8', '#C2185B', 1.5);
    dot(ctx, -7, y0 - 2, 1.8, '#7FE3FF');
    dot(ctx, 7, y0 - 2, 1.8, '#7FE3FF');
  }

  function drawBunnyEars(ctx, S) {
    const flop = Math.sin(S.t * 3) * 0.06;
    for (const [x, rot] of [[-6, -0.22 - flop], [6, 0.28 + flop]]) {
      ctx.save();
      ctx.translate(x, HEAD_Y - 11);
      ctx.rotate(rot);
      G.ellipse(ctx, 0, -13, 5.8, 15);
      fs(ctx, '#fff', '#B9A6B9', 2);
      G.ellipse(ctx, 0, -12, 2.8, 10.5);
      ctx.fillStyle = '#FFB3CE';
      ctx.fill();
      ctx.restore();
    }
  }

  function drawLaurel(ctx) {
    for (let i = 0; i < 7; i++) {
      for (const side of [-1, 1]) {
        const a = -PI / 2 + side * (0.35 + i * 0.25);
        const x = Math.cos(a) * 15.5, y = HEAD_Y + Math.sin(a) * 15.5;
        G.ellipse(ctx, x, y, 4.2, 2.1, a + side * 0.9);
        fs(ctx, '#FFD23F', '#B87800', 1);
      }
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
      const x = 19 + sw - (i * (38)) / 5;
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

  function drawDress(ctx, S) {
    const sw = Math.sin(S.pose.phase || 0) * 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, SH_Y - 3);
    ctx.lineTo(6, SH_Y - 3);
    ctx.lineTo(8, HIP_Y - 10);
    ctx.lineTo(22 + sw, HIP_Y + 16);
    ctx.quadraticCurveTo(0, HIP_Y + 21, -22 + sw, HIP_Y + 16);
    ctx.lineTo(-8, HIP_Y - 10);
    ctx.closePath();
    fs(ctx, '#9B6BFF', '#4C2A9E', 2);
    // горошек
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [x, y] of [[-8, -34], [3, -30], [12, -26], [-14, -27], [-2, -40], [8, -44], [-4, -51]]) {
      G.circle(ctx, x + sw * 0.3, y, 1.6);
      ctx.fill();
    }
    // пояс и воротничок
    G.rr(ctx, -8.5, HIP_Y - 12, 17, 4, 2);
    fs(ctx, '#FF7EC8', '#A02A70', 1.2);
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

  function drawEmblem(ctx) {
    dot(ctx, 0, -56, 7, '#FFD23F', '#B87800', 1.8);
    G.starPath(ctx, 0, -55.5, 5, 2.2);
    ctx.fillStyle = '#E53935';
    ctx.fill();
  }

  function drawRobe(ctx, S) {
    const sw = Math.sin(S.pose.phase || 0) * 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, SH_Y - 3);
    ctx.lineTo(7, SH_Y - 3);
    ctx.lineTo(20 + sw, -9);
    ctx.quadraticCurveTo(0, -5, -20 + sw, -9);
    ctx.closePath();
    fs(ctx, '#3D3A9E', '#1B1858', 2);
    ctx.fillStyle = '#FFE066';
    for (const [x, y, r] of [[-9, -22, 3.2], [8, -30, 2.6], [-2, -45, 2.4], [12, -15, 2.2], [-13, -38, 2]]) {
      G.starPath(ctx, x + sw * 0.3, y, r, r * 0.45);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(-8, -50);
    ctx.lineTo(8, -50);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFC928';
    ctx.stroke();
  }

  function drawRobotBody(ctx) {
    G.rr(ctx, -13.5, SH_Y - 4, 27, 33, 6);
    fs(ctx, '#C9D3DD', '#5E6E80', 2.2);
    G.rr(ctx, -8.5, SH_Y + 3, 17, 14, 3);
    fs(ctx, '#2A3A4E');
    dot(ctx, -4, SH_Y + 10, 2.2, '#FF5A5A');
    dot(ctx, 1, SH_Y + 10, 2.2, '#FFD23F');
    dot(ctx, 6, SH_Y + 10, 2.2, '#3CE28A');
    G.heartPath(ctx, 0, SH_Y + 23, 3.2);
    ctx.fillStyle = '#FF5A8A';
    ctx.fill();
  }

  function drawRobotHead(ctx, S) {
    const y = HEAD_Y;
    ctx.beginPath();
    ctx.moveTo(0, y - 15);
    ctx.lineTo(0, y - 26);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#5E6E80';
    ctx.stroke();
    const on = Math.sin(S.t * 5) > 0;
    dot(ctx, 0, y - 27, 3.6, on ? '#FF4A4A' : '#9E2B2B', '#5E6E80', 1.5);
    G.rr(ctx, -17, y - 15, 34, 30, 7);
    fs(ctx, '#D8E0E8', '#5E6E80', 2.4);
    G.rr(ctx, -12.5, y - 10, 25, 19, 5);
    fs(ctx, '#20304A');
    const blink = (S.t % 3.2) < 0.12;
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
    dot(ctx, -17, y, 3, '#AAB6C3', '#5E6E80', 1.2);
    dot(ctx, 17, y, 3, '#AAB6C3', '#5E6E80', 1.2);
  }

  function drawWings(ctx, S) {
    const k = 0.75 + 0.25 * Math.sin(S.t * 12);
    ctx.save();
    ctx.translate(-2, SH_Y + 4);
    ctx.globalAlpha = 0.85;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side * k, 1);
      ctx.beginPath();
      ctx.ellipse(13, -9, 14, 9, -0.6, 0, TAU);
      fs(ctx, '#BFE9FF', '#6FB6E8', 1.5);
      ctx.beginPath();
      ctx.ellipse(10, 9, 10, 6.5, 0.5, 0, TAU);
      fs(ctx, '#FFD0EC', '#E07BB5', 1.5);
      ctx.restore();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawTutu(ctx) {
    ctx.beginPath();
    ctx.moveTo(-9, HIP_Y - 7);
    ctx.lineTo(9, HIP_Y - 7);
    ctx.lineTo(24, HIP_Y + 6);
    for (let i = 0; i <= 6; i++) {
      const x = 24 - (i * 48) / 6;
      ctx.quadraticCurveTo(x + 4, HIP_Y + 12, x, HIP_Y + 6);
    }
    ctx.closePath();
    fs(ctx, '#FF9ED2', '#D0508F', 1.8);
    ctx.beginPath();
    ctx.moveTo(-9, HIP_Y - 7);
    ctx.lineTo(9, HIP_Y - 7);
    ctx.lineTo(17, HIP_Y + 1);
    ctx.lineTo(-17, HIP_Y + 1);
    ctx.closePath();
    fs(ctx, '#FFC2E4');
  }

  function drawToga(ctx) {
    ctx.beginPath();
    ctx.moveTo(-9, SH_Y - 4);
    ctx.lineTo(6, SH_Y - 4);
    ctx.lineTo(18, -18);
    ctx.quadraticCurveTo(0, -14, -17, -18);
    ctx.closePath();
    fs(ctx, '#FFFFFF', '#B7B0C8', 2);
    ctx.beginPath();
    ctx.moveTo(-6, SH_Y);
    ctx.quadraticCurveTo(4, -52, 14, -24);
    ctx.moveTo(-9, -60);
    ctx.quadraticCurveTo(-2, -40, 4, -18);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(150,140,180,0.6)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, -44);
    ctx.lineTo(10, -46);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFC928';
    ctx.stroke();
  }

  function drawAura(ctx, S) {
    G.glow(ctx, 0, HEAD_Y, 34, '#FFE066', 0.55);
    G.rays(ctx, 0, HEAD_Y, 34, S.t * 0.6, '#FFE9A0', 10, 0.35);
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

  // Показ отдельного наряда в меню (без человечка): s — масштаб
  H.drawSkinIcon = function (ctx, id, cx, cy, s, t) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const S = { t: t || 0, f: 1, pose: { phase: 0 }, speed: 0 };
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
      drawDress(ctx, S);
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

  // Питомец летает? (сова парит над землёй)
  P.flies = (id) => id === 'owl';
})(window.VW);
