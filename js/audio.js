/* Vasilisa World — звуки и музыка на Web Audio API (всё синтезируется кодом) */
(function (VW) {
  'use strict';

  const A = (VW.Audio = {});
  let ctx = null, master = null, sfxBus = null, musicBus = null, noiseBuf = null;
  let musicWanted = null; // какую музыку играть
  let duckLevel = 1;

  A.musicOn = true;

  const MUSIC_VOL = 0.2;
  const SFX_VOL = 0.55;

  A.init = function () {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
    } catch (e) {
      ctx = null;
      return false;
    }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.2;
    master = ctx.createGain();
    master.gain.value = 0.9;
    sfxBus = ctx.createGain();
    sfxBus.gain.value = SFX_VOL;
    musicBus = ctx.createGain();
    musicBus.gain.value = A.musicOn ? MUSIC_VOL : 0;
    sfxBus.connect(master);
    musicBus.connect(master);
    master.connect(comp);
    comp.connect(ctx.destination);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  };

  // Вызывается из обработчика касания/клика — на iPad звук включается только так
  A.unlock = function () {
    if (!A.init()) return;
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      try {
        ctx.resume();
      } catch (e) {
        /* ничего */
      }
    }
    try {
      const b = ctx.createBuffer(1, 1, 22050);
      const s = ctx.createBufferSource();
      s.buffer = b;
      s.connect(ctx.destination);
      s.start(0);
    } catch (e) {
      /* ничего */
    }
    if (musicWanted && !seq.song) startSong(musicWanted);
  };

  A.ready = () => !!ctx && ctx.state === 'running';

  A.suspend = function () {
    if (ctx && ctx.state === 'running') ctx.suspend().catch(() => {});
  };
  A.resume = function () {
    if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  };

  // ---------- базовые кирпичики ----------
  function tone(freq, t0, dur, o) {
    o = o || {};
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t0 + (o.slideTime || dur));
    if (o.detune) osc.detune.value = o.detune;
    const vol = o.vol == null ? 0.2 : o.vol;
    const att = o.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + att);
    if (o.hold) g.gain.setValueAtTime(vol, t0 + att + Math.max(0, Math.min(o.hold, dur - att - 0.02)));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(o.dest || sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
    return osc;
  }

  function noise(t0, dur, o) {
    o = o || {};
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.filter || 'lowpass';
    f.frequency.setValueAtTime(o.freq || 1200, t0);
    if (o.slide) f.frequency.exponentialRampToValueAtTime(o.slide, t0 + dur);
    f.Q.value = o.q || 0.8;
    const g = ctx.createGain();
    const vol = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (o.attack || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(o.dest || sfxBus);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
  }

  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function midi(name) {
    const m = /^([A-G][#b]?)(-?\d)$/.exec(name);
    if (!m) return null;
    return 12 * (parseInt(m[2], 10) + 1) + NOTE[m[1]];
  }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const PENTA = [0, 2, 4, 7, 9];

  // ---------- звуковые эффекты ----------
  const lastPlay = {};
  function can(name, gap) {
    if (!ctx || ctx.state !== 'running') return false;
    const now = ctx.currentTime;
    if (gap && lastPlay[name] && now - lastPlay[name] < gap) return false;
    lastPlay[name] = now;
    return true;
  }

  const S = {};
  S.tap = () => {
    const t = ctx.currentTime;
    tone(520, t, 0.09, { type: 'sine', vol: 0.25, slide: 820 });
    tone(1040, t, 0.06, { type: 'triangle', vol: 0.06 });
  };
  S.back = () => {
    const t = ctx.currentTime;
    tone(700, t, 0.1, { type: 'sine', vol: 0.22, slide: 420 });
  };
  S.select = () => {
    const t = ctx.currentTime;
    tone(660, t, 0.08, { type: 'triangle', vol: 0.18 });
    tone(990, t + 0.06, 0.16, { type: 'triangle', vol: 0.16 });
  };
  S.locked = () => {
    const t = ctx.currentTime;
    tone(392, t, 0.14, { type: 'triangle', vol: 0.2 });
    tone(311, t + 0.13, 0.22, { type: 'triangle', vol: 0.2 });
  };
  S.buy = () => {
    const t = ctx.currentTime;
    [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, t + i * 0.07, 0.3, { type: 'triangle', vol: 0.16 }));
    for (let i = 0; i < 6; i++) tone(2000 + Math.random() * 2000, t + 0.3 + i * 0.05, 0.12, { type: 'sine', vol: 0.05 });
  };
  S.jump = () => {
    const t = ctx.currentTime;
    tone(300, t, 0.2, { type: 'square', vol: 0.07, slide: 720, slideTime: 0.16 });
    tone(600, t, 0.16, { type: 'triangle', vol: 0.08, slide: 1300 });
  };
  S.land = () => {
    const t = ctx.currentTime;
    tone(150, t, 0.12, { type: 'sine', vol: 0.25, slide: 60 });
    noise(t, 0.07, { freq: 700, vol: 0.08 });
  };
  S.step = () => {
    const t = ctx.currentTime;
    noise(t, 0.04, { filter: 'bandpass', freq: 1800 + Math.random() * 600, q: 1.2, vol: 0.05 });
  };
  S.climb = () => {
    const t = ctx.currentTime;
    tone(620 + Math.random() * 160, t, 0.05, { type: 'triangle', vol: 0.07 });
  };
  S.coin = (combo) => {
    const t = ctx.currentTime;
    const k = Math.pow(2, Math.min(combo || 0, 10) / 12);
    tone(988 * k, t, 0.08, { type: 'square', vol: 0.08 });
    tone(1319 * k, t + 0.07, 0.32, { type: 'square', vol: 0.08 });
    tone(2637 * k, t + 0.07, 0.25, { type: 'sine', vol: 0.05 });
  };
  S.bounce = () => {
    const t = ctx.currentTime;
    const o = tone(160, t, 0.42, { type: 'sine', vol: 0.3, slide: 560, slideTime: 0.25 });
    // лёгкое «пружинное» дрожание
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 22;
    lg.gain.value = 30;
    lfo.connect(lg);
    lg.connect(o.frequency);
    lfo.start(t);
    lfo.stop(t + 0.45);
    tone(320, t, 0.3, { type: 'triangle', vol: 0.08, slide: 900 });
  };
  S.splash = () => {
    const t = ctx.currentTime;
    noise(t, 0.4, { freq: 1600, slide: 250, vol: 0.28 });
    for (let i = 0; i < 4; i++) tone(400 + Math.random() * 600, t + 0.05 + i * 0.06, 0.08, { type: 'sine', vol: 0.08, slide: 900 + Math.random() * 400 });
  };
  S.bubble = () => {
    const t = ctx.currentTime;
    tone(500 + Math.random() * 500, t, 0.08, { type: 'sine', vol: 0.08, slide: 1200 + Math.random() * 600 });
  };
  S.found = () => {
    const t = ctx.currentTime;
    const seq = [523, 659, 784, 1047, 1319, 1568];
    seq.forEach((f, i) => {
      tone(f, t + i * 0.1, 0.45, { type: 'triangle', vol: 0.2 });
      tone(f * 2, t + i * 0.1, 0.25, { type: 'sine', vol: 0.05 });
    });
    [1047, 1319, 1568, 2093].forEach((f) => tone(f, t + 0.7, 1.2, { type: 'triangle', vol: 0.11, attack: 0.02 }));
    for (let i = 0; i < 10; i++) tone(2200 + Math.random() * 2600, t + 0.6 + i * 0.07, 0.15, { type: 'sine', vol: 0.05 });
  };
  S.sparkle = () => {
    const t = ctx.currentTime;
    for (let i = 0; i < 5; i++) tone(1800 + Math.random() * 2400, t + i * 0.05, 0.14, { type: 'sine', vol: 0.05 });
  };
  S.magic = () => {
    const t = ctx.currentTime;
    [0, 4, 7, 11, 14, 19].forEach((s, i) => tone(mtof(72 + s), t + i * 0.045, 0.3, { type: 'sine', vol: 0.09 }));
  };
  S.star = (i) => {
    const t = ctx.currentTime;
    const n = i || 0;
    const m = 72 + 12 * Math.floor(n / 5) + PENTA[n % 5];
    const f = mtof(Math.min(m, 108));
    tone(f, t, 0.18, { type: 'triangle', vol: 0.13 });
    tone(f * 2, t, 0.1, { type: 'sine', vol: 0.04 });
  };
  S.firework = () => {
    const t = ctx.currentTime;
    noise(t, 0.12, { freq: 900, slide: 3000, vol: 0.06, filter: 'bandpass' });
    noise(t + 0.35, 0.6, { freq: 2600, slide: 200, vol: 0.22 });
    for (let i = 0; i < 6; i++) noise(t + 0.45 + Math.random() * 0.4, 0.04, { freq: 5000, filter: 'highpass', vol: 0.06 });
  };
  S.whoosh = () => {
    const t = ctx.currentTime;
    noise(t, 0.35, { filter: 'bandpass', freq: 400, slide: 2400, q: 1.5, vol: 0.12 });
  };
  S.door = () => {
    const t = ctx.currentTime;
    tone(880, t, 0.25, { type: 'triangle', vol: 0.12 });
    tone(1320, t + 0.1, 0.35, { type: 'triangle', vol: 0.1 });
  };
  S.giggle = () => {
    const t = ctx.currentTime;
    for (let i = 0; i < 4; i++) tone(700 + i * 40, t + i * 0.09, 0.08, { type: 'sine', vol: 0.12, slide: 1000 + i * 60 });
  };
  S.meow = () => {
    const t = ctx.currentTime;
    tone(620, t, 0.35, { type: 'triangle', vol: 0.12, slide: 900, slideTime: 0.12 });
    tone(900, t + 0.14, 0.25, { type: 'triangle', vol: 0.1, slide: 520 });
  };
  S.water = () => {
    const t = ctx.currentTime;
    noise(t, 0.9, { filter: 'bandpass', freq: 2400, q: 0.7, vol: 0.12 });
    for (let i = 0; i < 6; i++) tone(700 + Math.random() * 900, t + i * 0.12, 0.07, { type: 'sine', vol: 0.05, slide: 1500 });
  };
  S.cuckoo = () => {
    const t = ctx.currentTime;
    tone(784, t, 0.25, { type: 'sine', vol: 0.18 });
    tone(622, t + 0.28, 0.35, { type: 'sine', vol: 0.18 });
  };

  const GAPS = { step: 0.12, climb: 0.1, coin: 0.03, land: 0.08, bubble: 0.05, splash: 0.3, bounce: 0.1 };

  A.sfx = function (name, arg) {
    if (!S[name]) return;
    if (!can(name, GAPS[name])) return;
    try {
      S[name](arg);
    } catch (e) {
      /* звук не главное */
    }
  };

  // ---------- музыка: маленький секвенсор ----------
  // Каждая дорожка — строка шагов: «C5» нота, «-» тянуть, «.» пауза, «|» разделитель тактов
  function parseTrack(str) {
    const toks = str.replace(/\|/g, ' ').trim().split(/\s+/);
    const ev = [];
    let cur = null;
    toks.forEach((tk, i) => {
      if (tk === '-') {
        if (cur) cur.len += 1;
      } else if (tk === '.') {
        cur = null;
      } else {
        const m = midi(tk);
        cur = m == null ? null : { step: i, m: m, len: 1 };
        if (cur) ev.push(cur);
      }
    });
    const byStep = [];
    for (const e of ev) (byStep[e.step] = byStep[e.step] || []).push(e);
    return { ev: ev, byStep: byStep, steps: toks.length };
  }

  const SONGS = {
    // Вальс для меню (3/4, восьмые)
    menu: {
      bpm: 104,
      stepBeats: 0.5,
      tracks: [
        {
          inst: 'bell', vol: 0.5,
          notes: 'E5 - G5 - C6 - | B5 - - - G5 - | A5 - C6 - A5 - | G5 - - - - - | F5 - A5 - D6 - | C6 - - - A5 - | G5 - F5 - D5 - | C5 - - - - - |' +
            'E5 - E5 - G5 - | A5 - - - G5 - | F5 - D5 - F5 - | E5 - - - - - | D5 - F5 - A5 - | G5 - - - E5 - | D5 - E5 - B4 - | C5 - - - - - |',
        },
        {
          inst: 'bass', vol: 0.55,
          notes: 'C3 - G3 - G3 - | G2 - D3 - D3 - | F2 - C3 - C3 - | C3 - G3 - G3 - | D3 - A3 - A3 - | A2 - E3 - E3 - | G2 - D3 - D3 - | C3 - G2 - C3 - |' +
            'C3 - G3 - G3 - | F2 - C3 - C3 - | D3 - A3 - A3 - | A2 - E3 - E3 - | D3 - A3 - A3 - | C3 - G3 - G3 - | G2 - D3 - D3 - | C3 - G2 - C3 - |',
        },
      ],
    },
    // Бодрая тема уровня (4/4, восьмые). Для разных сцен — разная тональность
    level: {
      bpm: 118,
      stepBeats: 0.5,
      tracks: [
        {
          inst: 'bell', vol: 0.45,
          notes: 'C5 . E5 . G5 . E5 . | F5 . A5 . G5 - - . | E5 . G5 . C6 . G5 . | A5 . G5 . E5 - - . | F5 . F5 . A5 . F5 . | E5 . E5 . G5 . E5 . | D5 . E5 . F5 . D5 . | C5 - - . . . . . |' +
            'A5 . A5 . G5 . E5 . | G5 - - . E5 . D5 . | C5 . D5 . E5 . G5 . | A5 - - . G5 - - . | A5 . C6 . A5 . G5 . | E5 . G5 . E5 . D5 . | C5 . D5 . E5 . D5 . | C5 - - - . . . . |',
        },
        {
          inst: 'bass', vol: 0.5,
          notes: 'C3 . G2 . C3 . G2 . | F2 . C3 . F2 . C3 . | C3 . G2 . C3 . G2 . | F2 . C3 . G2 . B2 . | F2 . C3 . F2 . C3 . | C3 . G2 . C3 . G2 . | G2 . D3 . G2 . B2 . | C3 . G2 . C3 . . . |' +
            'F2 . C3 . F2 . C3 . | C3 . G2 . C3 . G2 . | A2 . E3 . A2 . E3 . | F2 . C3 . G2 . G2 . | F2 . C3 . F2 . C3 . | C3 . G2 . C3 . G2 . | G2 . D3 . G2 . B2 . | C3 . G2 . C3 . . . |',
        },
        { inst: 'hat', vol: 0.3, notes: '. C6 . C6 . C6 . C6 |'.repeat(16) },
      ],
    },
    // Праздник
    hall: {
      bpm: 128,
      stepBeats: 0.5,
      tracks: [
        {
          inst: 'bell', vol: 0.5,
          notes: 'G4 . C5 . E5 . G5 - | - . E5 . G5 - - - | A5 . G5 . F5 . E5 . | D5 - - - . . . . | F4 . B4 . D5 . F5 - | - . D5 . F5 - - - | G5 . F5 . E5 . D5 . | C5 - - - . . G4 . |' +
            'C5 . C5 . E5 . C5 . | G5 - - - E5 - - - | F5 . F5 . A5 . F5 . | E5 - - - C5 - - - | D5 . E5 . F5 . G5 . | A5 . G5 . F5 . E5 . | D5 . . . G5 . . . | C6 - - - . . . . |',
        },
        {
          inst: 'bass', vol: 0.5,
          notes: 'C3 . G2 . C3 . G2 . | C3 . G2 . C3 . E3 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . D3 . | G2 . D3 . G2 . D3 . | G2 . D3 . G2 . B2 . | C3 . G2 . G2 . B2 . | C3 . G2 . C3 . G2 . |' +
            'C3 . G2 . C3 . G2 . | E3 . C3 . E3 . C3 . | F2 . C3 . F2 . C3 . | C3 . G2 . C3 . G2 . | D3 . A2 . D3 . A2 . | F2 . C3 . F2 . C3 . | G2 . D3 . G2 . D3 . | C3 . G2 . C3 . . . |',
        },
        { inst: 'hat', vol: 0.3, notes: '. C6 . C6 . C6 . C6 |'.repeat(16) },
        { inst: 'kick', vol: 0.5, notes: 'C2 . . . C2 . . . |'.repeat(16) },
      ],
    },
  };
  for (const k of Object.keys(SONGS)) SONGS[k].tracks.forEach((tr) => Object.assign(tr, parseTrack(tr.notes)));

  function playInst(inst, m, t, dur, vol) {
    const f = mtof(m);
    switch (inst) {
      case 'bell':
        tone(f, t, Math.max(0.25, dur * 1.1), { type: 'triangle', vol: 0.22 * vol, dest: musicBus, attack: 0.006 });
        tone(f * 2, t, 0.3, { type: 'sine', vol: 0.06 * vol, dest: musicBus });
        break;
      case 'bass':
        tone(f, t, Math.max(0.2, dur * 0.95), { type: 'triangle', vol: 0.32 * vol, dest: musicBus, attack: 0.01, hold: dur * 0.5 });
        break;
      case 'hat':
        noise(t, 0.05, { filter: 'highpass', freq: 7000, vol: 0.05 * vol, dest: musicBus });
        break;
      case 'kick':
        tone(120, t, 0.16, { type: 'sine', vol: 0.4 * vol, slide: 45, dest: musicBus });
        break;
    }
  }

  const seq = { song: null, name: null, transpose: 0, step: 0, nextTime: 0, timer: null, stepDur: 0.25 };

  function startSong(desc) {
    stopSong();
    if (!ctx) return;
    const song = SONGS[desc.name];
    if (!song) return;
    seq.song = song;
    seq.name = desc.name;
    seq.transpose = desc.transpose || 0;
    const bpm = desc.bpm || song.bpm;
    seq.stepDur = (60 / bpm) * song.stepBeats;
    seq.step = 0;
    seq.total = Math.max.apply(null, song.tracks.map((t) => t.steps));
    seq.nextTime = ctx.currentTime + 0.12;
    seq.timer = setInterval(schedule, 40);
    schedule();
  }

  function stopSong() {
    if (seq.timer) clearInterval(seq.timer);
    seq.timer = null;
    seq.song = null;
    seq.name = null;
  }

  function schedule() {
    if (!ctx || !seq.song) return;
    if (ctx.state !== 'running') {
      seq.nextTime = ctx.currentTime + 0.1;
      return;
    }
    // если вкладка «спала» — не догоняем пропущенное
    if (seq.nextTime < ctx.currentTime - 0.3) seq.nextTime = ctx.currentTime + 0.05;
    while (seq.nextTime < ctx.currentTime + 0.18) {
      const st = seq.step % seq.total;
      for (const tr of seq.song.tracks) {
        const evs = tr.byStep[st % tr.steps];
        if (!evs) continue;
        for (const e of evs) {
          const m = tr.inst === 'hat' || tr.inst === 'kick' ? e.m : e.m + seq.transpose;
          playInst(tr.inst, m, seq.nextTime, e.len * seq.stepDur, tr.vol);
        }
      }
      seq.nextTime += seq.stepDur;
      seq.step++;
    }
  }

  // name: 'menu' | 'level' | 'hall'; opts: {transpose, bpm}
  A.music = function (name, opts) {
    const desc = Object.assign({ name: name }, opts || {});
    const same = musicWanted && musicWanted.name === desc.name && musicWanted.transpose === desc.transpose && musicWanted.bpm === desc.bpm;
    musicWanted = desc;
    if (same && seq.song) return;
    if (ctx) startSong(desc);
  };

  A.stopMusic = function () {
    musicWanted = null;
    stopSong();
  };

  A.setMusicOn = function (on) {
    A.musicOn = on;
    applyMusicGain();
  };

  function applyMusicGain() {
    if (!ctx || !musicBus) return;
    const target = A.musicOn ? MUSIC_VOL * duckLevel : 0;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setTargetAtTime(target, ctx.currentTime, 0.12);
  }

  // Приглушаем музыку, пока говорит голос
  A.duck = function (on) {
    duckLevel = on ? 0.35 : 1;
    applyMusicGain();
  };
})(window.VW);
