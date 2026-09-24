/* Vasilisa World — сохранение прогресса в localStorage */
(function (VW) {
  'use strict';

  const KEY = 'vasilisa-world-v1';
  const S = (VW.Store = {});

  const VERSION = 2;

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
    };
  };

  function worldDefaults() {
    return { done: [], best: {}, finished: false, bonusGiven: false };
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
      S.data.worlds[id] = merge(worldDefaults(), S.data.worlds[id]);
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

  // Попросим браузер не удалять данные (если умеет)
  S.persist = function () {
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    } catch (e) {
      /* ничего */
    }
  };
})(window.VW);
