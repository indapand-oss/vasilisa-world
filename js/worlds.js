/* Vasilisa World — какие сцены в каком мире и на каком круге */
(function (VW) {
  'use strict';

  const U = VW.U, D = VW.Data;
  const Wd = (VW.Worlds = {});

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  Wd.hash = hash;

  const MAGIC_TRANSPOSE = [0, 2, -3, 5, -1];

  // Перемешать копию массива (детерминированно)
  function shuffled(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  Wd.get = (id) => D.worldById[id] || D.worlds[0];

  // Сколько сцен на круге
  Wd.sceneCount = function (worldId, round) {
    if (worldId === 'magic' && round === 1) return D.scenes.length;
    if (round <= 1) return Wd.get(worldId).themes.length >= 3 ? 3 : Wd.get(worldId).themes.length;
    return Math.min(5, 3 + Math.floor((round - 1) / 2));
  };

  // Сколько находок в сцене на круге
  function artsPerScene(round, r) {
    if (round <= 1) return 1;
    if (round === 2) return 2;
    return r() < 0.5 ? 2 : 3;
  }

  const cache = {};
  // Список сцен мира на круге: [{ id, name, arts, intro, found, theme | level, seed, layout, music }]
  Wd.scenes = function (worldId, round) {
    round = Math.max(1, round | 0 || 1);
    const w = Wd.get(worldId);
    const key = w.id + ':' + round;
    if (cache[key]) return cache[key];
    let list;
    if (w.id === 'magic' && round === 1) {
      // первый круг волшебной школы — нарисованные вручную сцены
      list = D.scenes.map((s, i) => ({
        id: s.id,
        level: s.id,
        name: s.name,
        arts: [s.artifact],
        intro: s.intro,
        hint: s.hint,
        found: s.found,
        music: { song: 'level', transpose: MAGIC_TRANSPOSE[i % MAGIC_TRANSPOSE.length] },
      }));
    } else {
      const r = U.rng(hash(key));
      const n = Wd.sceneCount(w.id, round);
      // оформление сцен: на первом круге — по порядку, дальше — вперемешку
      let themes = [];
      if (round === 1) themes = w.themes.slice(0, n);
      else {
        while (themes.length < n) themes = themes.concat(shuffled(w.themes, r));
        themes = themes.slice(0, n);
        // высокая сцена — лучше в конце круга
        const tallIdx = themes.findIndex((t) => (VW.Themes.get(t) || {}).layout === 'tall');
        if (tallIdx >= 0 && tallIdx !== n - 1 && r() < 0.7) themes.push(themes.splice(tallIdx, 1)[0]);
      }
      // находки: «мешочек», чтобы каждая встречалась
      let bag = [];
      const take = () => {
        if (!bag.length) bag = round === 1 ? w.arts.slice() : shuffled(w.arts, r);
        return bag.shift();
      };
      list = themes.map((tid, i) => {
        const th = VW.Themes.get(tid);
        const na = artsPerScene(round, r);
        const arts = [];
        while (arts.length < na) {
          const a = take();
          if (arts.indexOf(a) < 0) arts.push(a);
          else if (w.arts.length <= arts.length) break;
        }
        // на следующих кругах — другое время суток
        const variant = round === 1 ? 0 : (round + i) % Math.max(1, (th.variants || [null]).length);
        const vv = (th.variants || [])[variant] || {};
        const name = th.name + (vv.suffix || '');
        return {
          id: 'r' + round + '-' + i,
          name: name,
          themeId: tid,
          theme: th,
          variant: variant,
          layout: th.layout || 'wide',
          seed: hash(key + ':' + i + ':' + tid),
          round: round,
          arts: arts,
          intro: name + '. Найди ' + D.listAcc(arts) + '!',
          found: arts.length > 1 ? 'Ура! Ты нашла все находки!' : 'Ура! Ты нашла ' + D.artAcc(arts[0]) + '!',
          music: th.music || { song: 'level', transpose: 0 },
        };
      });
    }
    list.forEach((s, i) => {
      s.world = w.id;
      s.round = round;
      s.idx = i;
    });
    cache[key] = list;
    return list;
  };

  // Положение кружков на карте (доли экрана): n сцен + праздник
  const MAGIC_NODES = [
    [0.11, 0.74],
    [0.27, 0.52],
    [0.43, 0.73],
    [0.58, 0.5],
    [0.73, 0.72],
    [0.88, 0.47],
  ];
  Wd.mapNodes = function (worldId, round, n) {
    if (worldId === 'magic' && round === 1 && n === 5) return MAGIC_NODES;
    const r = U.rng(hash('map:' + worldId + ':' + round));
    const pts = [];
    let high = r() < 0.5;
    for (let i = 0; i <= n; i++) {
      const x = U.lerp(0.11, 0.88, i / n) + (r() - 0.5) * 0.03;
      const y = high ? 0.47 + r() * 0.08 : 0.68 + r() * 0.07;
      pts.push([x, y]);
      high = !high;
    }
    return pts;
  };

  // ---------- открытие миров ----------
  const S = () => VW.Store;
  Wd.isOpen = function (id) {
    const w = Wd.get(id);
    return !w.price || !!S().world(id).unlocked;
  };
  Wd.unlock = function (id) {
    const w = Wd.get(id);
    if (Wd.isOpen(id)) return true;
    if (S().data.stars < w.price) return false;
    S().data.stars -= w.price;
    S().world(id).unlocked = true;
    S().save();
    return true;
  };
  // Текущий круг мира
  Wd.round = function (id) {
    const r = S().world(id).round;
    return typeof r === 'number' && r >= 1 ? Math.floor(r) : 1;
  };
})(window.VW);
