/* Vasilisa World — подсказки голосом (speechSynthesis, ru-RU) + субтитры */
(function (VW) {
  'use strict';

  const V = (VW.Voice = {});
  const synth = window.speechSynthesis;
  V.supported = !!(synth && window.SpeechSynthesisUtterance);

  let voice = null;
  let voicesLoaded = false;
  let current = null; // держим ссылку, иначе Safari может «потерять» фразу
  let queueTimer = null;

  V.subtitle = null; // { text, start, dur }
  V.speaking = false;

  function now() {
    return performance.now() / 1000;
  }

  function pickVoice() {
    if (!V.supported) return;
    let list = [];
    try {
      list = synth.getVoices() || [];
    } catch (e) {
      list = [];
    }
    if (list.length) voicesLoaded = true;
    const ru = list.filter((v) => /^ru([-_]|$)/i.test(v.lang || ''));
    const score = (v) =>
      (v.localService ? 4 : 0) +
      (/milena|милена|irina|ирина|alena|алёна|алена|anna|анна|katya|катя|daria|дарья|svetlana|светлана|google/i.test(v.name) ? 2 : 0) +
      (v.default ? 1 : 0);
    ru.sort((a, b) => score(b) - score(a));
    voice = ru[0] || null;
  }

  if (V.supported) {
    pickVoice();
    try {
      if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
      else synth.onvoiceschanged = pickVoice;
    } catch (e) {
      synth.onvoiceschanged = pickVoice;
    }
  }

  // Если список голосов загружен и русского нет — не говорим (иначе будет «тарабарщина»),
  // остаются субтитры.
  V.canSpeak = function () {
    if (!V.supported || V.muted) return false;
    if (!voice) pickVoice();
    return !!voice || !voicesLoaded;
  };

  function estimate(text) {
    return 1.2 + text.length * 0.075;
  }

  // Сказать фразу. opts: { onend, keepSubtitle }
  V.say = function (text, opts) {
    opts = opts || {};
    if (!text) return;
    const dur = estimate(text);
    V.subtitle = { text: text, start: now(), dur: dur };
    clearTimeout(queueTimer);

    if (!V.canSpeak()) {
      if (opts.onend) queueTimer = setTimeout(opts.onend, dur * 1000);
      return;
    }
    try {
      // Если что-то уже звучит — останавливаем и говорим чуть позже (так надёжнее в Safari).
      // Самую первую фразу говорим сразу: на iPad она должна прозвучать прямо из касания.
      const busy = synth.speaking || synth.pending;
      if (busy) synth.cancel();
      if (synth.paused) synth.resume();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU';
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.pitch = 1.1;
      u.volume = 1;
      let ended = false;
      const finish = () => {
        if (ended) return;
        ended = true;
        if (current === u) {
          current = null;
          V.speaking = false;
          if (VW.Audio) VW.Audio.duck(false);
          if (V.subtitle && V.subtitle.text === text) V.subtitle.dur = Math.min(V.subtitle.dur, now() - V.subtitle.start + 0.6);
        }
        if (opts.onend) opts.onend();
      };
      u.onstart = () => {
        V.speaking = true;
        if (VW.Audio) VW.Audio.duck(true);
      };
      u.onend = finish;
      u.onerror = finish;
      current = u;
      if (busy) {
        queueTimer = setTimeout(() => {
          if (current === u) synth.speak(u);
        }, 60);
      } else synth.speak(u);
      // страховка: если движок молчит, всё равно завершаем
      setTimeout(finish, (dur + 4) * 1000);
    } catch (e) {
      if (opts.onend) queueTimer = setTimeout(opts.onend, dur * 1000);
    }
  };

  V.stop = function () {
    clearTimeout(queueTimer);
    if (!V.supported) return;
    try {
      synth.cancel();
    } catch (e) {
      /* ничего */
    }
    current = null;
    V.speaking = false;
    if (VW.Audio) VW.Audio.duck(false);
  };

  V.clearSubtitle = function () {
    V.subtitle = null;
  };

  // Субтитр: виден, пока идёт фраза
  V.currentSubtitle = function () {
    const s = V.subtitle;
    if (!s) return null;
    const age = now() - s.start;
    if (age > s.dur + 0.4) {
      V.subtitle = null;
      return null;
    }
    return { text: s.text, age: age, dur: s.dur };
  };
})(window.VW);
