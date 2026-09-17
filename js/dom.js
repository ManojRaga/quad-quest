// Small DOM helpers, following the framework-free Rational Realms structure.
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child !== null && child !== undefined && child !== false) el.append(child?.nodeType ? child : document.createTextNode(String(child)));
  }
  return el;
}
export function svg(tag, attrs = {}, ...children) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,v);
  children.flat().forEach(c => el.append(c));
  return el;
}
export function button(label, action, cls = 'button') { return h('button', {type:'button', class:cls, onclick:action}, label); }
export function stars(count = 0) { return h('span', {class:'stars', 'aria-label':`${count} of 3 stars`}, [1,2,3].map(i => h('span', {class:i <= count ? 'earned' : '', 'aria-hidden':'true'}, '★'))); }
export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [out[i],out[j]]=[out[j],out[i]]; }
  return out;
}
