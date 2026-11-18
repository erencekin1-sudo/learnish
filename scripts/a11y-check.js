// Paste into the browser console (light and dark; resize to 375px for tap targets).
// Expect: every array empty, over === false.
(() => {
  const rgb = s => { const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
  const bg = el => { for (let c = el; c && c !== document.documentElement; c = c.parentElement) { const x = rgb(getComputedStyle(c).backgroundColor); if (x && x[3] > 0.95) return x.slice(0, 3); } return [255, 255, 255]; };
  const L = a => { const [r, g, b] = a.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return r * .2126 + g * .7152 + b * .0722; };
  const contrast = [];
  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,button,label,li,td,th,div,small,b,strong').forEach(el => {
    if (!el.offsetParent || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const s = getComputedStyle(el), fg = rgb(s.color); if (!fg) return;
    const b = bg(el), a = fg[3], f = a < 1 ? fg.slice(0, 3).map((v, i) => v * a + b[i] * (1 - a)) : fg.slice(0, 3);
    const r = (Math.max(L(f), L(b)) + .05) / (Math.min(L(f), L(b)) + .05), fs = parseFloat(s.fontSize);
    if (r < ((fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700)) ? 3 : 4.5)) contrast.push(`${el.className} ${r.toFixed(2)}`);
  });
  const min = innerWidth < 768 ? 44 : 24;
  const tap = [...document.querySelectorAll('button,a[href],input,select,textarea')].filter(e => e.offsetParent && !['checkbox', 'radio'].includes(e.type))
    .filter(e => { const r = e.getBoundingClientRect(); return r.width < min || r.height < min; }).map(e => e.outerHTML.slice(0, 80));
  const labelled = i => i.type === 'hidden' || i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || i.closest('label') || (i.id && document.querySelector(`label[for="${CSS.escape(i.id)}"]`));
  return {
    contrast, tap,
    orphans: [...document.querySelectorAll('input,select,textarea')].filter(i => !labelled(i)).length,
    fakeButtons: document.querySelectorAll('div[onclick],span[onclick]').length,
    over: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
})();
