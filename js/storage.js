/* Vasilisa World — сохранение прогресса в localStorage */
(function (VW) {
  'use strict';

  const KEY = 'vasilisa-world-v1';
  const S = (VW.Store = {});

  const VERSION = 5;

  S.defaults = function () {
    return {
      v: VERSION,
      stars: 0, // текущий запас звёзд (тратится на наряды)
      earned: 0, // сколько всего заработано
      owned: [], // купленное: 'color:purple', 'skin:dress', 'pet:cat', 'set:fairy'
      look: { color: 'brown', head: null, body: null, pet: null, hero: null },
      worlds: {},
      music: true,
      visits: 0,
      // «Создай свой мир»: местность, клетки [x, y, деталь, вариант], зверушки в домиках, блюда
      sandbox: { terrain: 'meadow', cells: [], homes: [], carry: [], dishes: {}, seen: false },
    };
  };

  // Прогресс мира: открыт ли, какой круг, какие сцены круга пройдены, лучшие монетки
  // past — пройденные раньше уровни (круги): { '1': { done, best, bonusGiven } }
  function worldDefaults() {
    return { unlocked: false, round: 1, done: [], best: {}, finished: false, bonusGiven: false, rounds: 0, past: {} };
  }

  function merge(target, src) {
    if (!src || typeof src !== 'object') return target;
    for (const k of Object.keys(target)) {
      if (!(k in src)) continue;
      const tv = target[k], sv = src[k];
      if (tv && typeof tv === 'object' && !Array.isArray(tv) && sv && typeof sv === 'object' && !Array.isArray(sv)) {
        target[k] = merge(tv, sv);
        // сохраняем и дополнительные ключи (например, миры)
        for (const kk of Object.keys(sv)) if (!(kk in target[k])) target[k][kk] = sv[kk];
      } else if (typeof tv === typeof sv || tv === null) {
        target[k] = sv;
      }
    }
    return target;
  }

  S.data = S.defaults();

  S.load = function () {
    let raw = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (e) {
      raw = null;
    }
    S.data = S.defaults();
    if (raw) {
      try {
        S.data = merge(S.defaults(), S.migrate(JSON.parse(raw)));
      } catch (e) {
        S.data = S.defaults();
      }
    }
    if (!Array.isArray(S.data.owned)) S.data.owned = [];
    if (!S.data.worlds || typeof S.data.worlds !== 'object') S.data.worlds = {};
    for (const id of Object.keys(S.data.worlds)) {
      const w = (S.data.worlds[id] = merge(worldDefaults(), S.data.worlds[id]));
      if (!Array.isArray(w.done)) w.done = [];
      if (!w.best || typeof w.best !== 'object') w.best = {};
      if (!w.past || typeof w.past !== 'object') w.past = {};
      if (typeof w.round !== 'number' || !(w.round >= 1)) w.round = 1;
      w.round = Math.floor(w.round);
    }
    if (typeof S.data.stars !== 'number' || !isFinite(S.data.stars) || S.data.stars < 0) S.data.stars = 0;
    // Проверяем, что надетые вещи существуют и куплены
    const L = S.data.look;
    if (!findById(VW.Data.colors, L.color) || !S.owns('color', L.color)) L.color = 'brown';
    if (L.head && (!findById(VW.Data.skins, L.head) || !S.owns('skin', L.head))) L.head = null;
    if (L.body && (!findById(VW.Data.skins, L.body) || !S.owns('skin', L.body))) L.body = null;
    if (L.pet && (!findById(VW.Data.pets, L.pet) || !S.owns('pet', L.pet))) L.pet = null;
    if (L.hero) {
      const h = VW.Data.heroById[L.hero];
      if (!h || !S.owns('set', h.set)) L.hero = null;
    }
    return S.data;
  };

  // Перевод старых сохранений на новый формат — ничего из прогресса не теряется
  S.migrate = function (d) {
    if (!d || typeof d !== 'object') return d;
    const v = typeof d.v === 'number' ? d.v : 1;
    if (v < 2) {
      // v1 → v2: вместо «костюма набора» (look.set) теперь выбирается герой набора (look.hero)
      if (d.look && typeof d.look === 'object') {
        if (d.look.set && !d.look.hero) d.look.hero = (VW.Data.heroForOldSet || {})[d.look.set] || null;
        delete d.look.set;
      }
    }
    if (v < 3) {
      // v2 → v3: миры открываются за звёздочку; где уже есть прогресс — мир считаем открытым
      if (d.worlds && typeof d.worlds === 'object') {
        for (const id of Object.keys(d.worlds)) {
          const w = d.worlds[id];
          if (!w || typeof w !== 'object') continue;
          if ((Array.isArray(w.done) && w.done.length) || w.finished) w.unlocked = true;
          if (typeof w.round !== 'number') w.round = 1;
        }
      }
    }
    if (v < 4) {
      // v3 → v4: появились уровни (круги). Мир, пройденный до праздника, переходит на уровень 2,
      // а пройденный первый уровень сохраняется в past — к нему можно вернуться на карте.
      if (d.worlds && typeof d.worlds === 'object') {
        for (const id of Object.keys(d.worlds)) {
          const w = d.worlds[id];
          if (!w || typeof w !== 'object') continue;
          if (!w.past || typeof w.past !== 'object') w.past = {};
          const r = typeof w.round === 'number' && w.round >= 1 ? Math.floor(w.round) : 1;
          w.round = r;
          if (w.bonusGiven) {
            w.past[String(r)] = { done: Array.isArray(w.done) ? w.done.slice() : [], best: Object.assign({}, w.best || {}), bonusGiven: true, finished: true };
            w.round = r + 1;
            w.rounds = Math.max(w.rounds || 0, r);
            w.done = [];
            w.best = {};
            w.bonusGiven = false;
            w.finished = false;
          }
        }
      }
    }
    // v4 → v5: появился режим «Создай свой мир» — пустой мир добавится сам (значения по умолчанию)
    d.v = VERSION;
    return d;
  };

  function findById(list, id) {
    return list.find((x) => x.id === id);
  }

  S.save = function () {
    clearTimeout(S._t);
    S._t = null;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(S.data));
    } catch (e) {
      /* приватный режим — просто играем без сохранения */
    }
  };

  S.saveSoon = function () {
    if (S._t) return;
    S._t = setTimeout(S.save, 800);
  };

  S.reset = function () {
    S.data = S.defaults();
    S.save();
  };

  S.catalog = function (kind) {
    return { color: VW.Data.colors, skin: VW.Data.skins, pet: VW.Data.pets, set: VW.Data.sets }[kind];
  };

  S.item = function (kind, id) {
    return findById(S.catalog(kind), id);
  };

  S.owns = function (kind, id) {
    const it = S.item(kind, id);
    if (!it) return false;
    return it.price === 0 || S.data.owned.indexOf(kind + ':' + id) >= 0;
  };

  S.buy = function (kind, id) {
    const it = S.item(kind, id);
    if (!it || S.owns(kind, id)) return true;
    if (S.data.stars < it.price) return false;
    S.data.stars -= it.price;
    S.data.owned.push(kind + ':' + id);
    S.save();
    return true;
  };

  S.addStars = function (n) {
    S.data.stars += n;
    S.data.earned += n;
    S.saveSoon();
  };

  S.world = function (id) {
    if (!S.data.worlds[id]) S.data.worlds[id] = worldDefaults();
    return S.data.worlds[id];
  };

  // Прогресс конкретного уровня мира: текущий — прямо в мире, прошлые — в past
  S.roundProg = function (id, round) {
    const w = S.world(id);
    const cur = w.round || 1;
    if (!round || round >= cur) return w;
    if (!w.past || typeof w.past !== 'object') w.past = {};
    const key = String(round);
    if (!w.past[key]) w.past[key] = { done: [], best: {}, bonusGiven: true, finished: true };
    return w.past[key];
  };

  // Праздник пройден — открываем следующий уровень
  S.advanceRound = function (id) {
    const w = S.world(id);
    const cur = w.round || 1;
    if (!w.past || typeof w.past !== 'object') w.past = {};
    w.past[String(cur)] = { done: w.done.slice(), best: Object.assign({}, w.best), bonusGiven: true, finished: true };
    w.round = cur + 1;
    w.rounds = Math.max(w.rounds || 0, cur);
    w.done = [];
    w.best = {};
    w.bonusGiven = false;
    w.finished = false;
    S.save();
    return w.round;
  };

  // Попросим браузер не удалять данные (если умеет)
  S.persist = function () {
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    } catch (e) {
      /* ничего */
    }
  };
})(window.VW);
