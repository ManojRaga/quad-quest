const KEY = 'quad-quest-v1';
export function createStore(storage) {
  let data = {stars:{}, runs:{}, muted:false};
  try {
    const saved = JSON.parse(storage?.getItem(KEY));
    if (saved && typeof saved === 'object') {
      data.muted = saved.muted === true;
      for (const [id,n] of Object.entries(saved.stars || {})) if (Number.isInteger(n) && n >= 1 && n <= 3) data.stars[id] = n;
      for (const [id,run] of Object.entries(saved.runs || {})) {
        if (run && Number.isInteger(run.index) && run.index >= 0 && Number.isInteger(run.hits) && run.hits >= 0 && run.hits <= run.index) data.runs[id] = {...run,missed:run.missed === true};
      }
    }
  } catch { /* A fresh adventure also works when storage is unavailable. */ }
  let persistent = true;
  function save() { try { if (!storage) throw new Error(); storage.setItem(KEY,JSON.stringify(data)); } catch { persistent = false; } }
  return {
    stars: id => data.stars[id] || 0,
    total: () => Object.values(data.stars).reduce((a,b)=>a+b,0),
    unlocked: (index,worlds) => index === 0 || !!data.stars[worlds[index-1].id],
    run: id => data.runs[id] ? {...data.runs[id]} : null,
    saveRun(id,run) { data.runs[id] = {...run}; save(); },
    finish(id,stars) { data.stars[id] = Math.max(data.stars[id] || 0,stars); delete data.runs[id]; save(); },
    muted: () => data.muted,
    toggleMute() { data.muted = !data.muted; save(); return data.muted; },
    persistent: () => persistent,
    reset() { data = {stars:{}, runs:{}, muted:data.muted}; save(); }
  };
}
let storage;
try { storage = globalThis.localStorage; } catch { /* Private/embedded browser. */ }
export const store = createStore(storage);
