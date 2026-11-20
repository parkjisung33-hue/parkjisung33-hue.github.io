/* VZTR 언어 틀 (W5 1차, 2026-11-20) — 영어판 = 같은 파일을 /gaboja/en/ 에 복사(deploy_larchive.py)
   - 언어: 주소에 /en/ 이 있으면 'en', 아니면 'ko' → window.VZTR_LANG · <html lang>
   - 첫 방문: 고른 적 없고(localStorage 'vztr-lang') 브라우저 언어가 한국어가 아니면 /en/ 으로 (자동 검수 헤드리스는 제외)
   - 전환: 머리에 다른 언어 이름 하나('English' / '한국어') → 누르면 기억하고 같은 화면(?·#) 그대로 넘어감
   - 번역 = 한국어 문장이 키인 사전(i18n-en.js, window.VZTR_EN). 코드는 한국어 그대로 두고 화면에 그려진 글자를 사전과 맞춰 바꿈
     (글자·placeholder·aria-label·title·alt, 새로 그려지는 것도 MutationObserver로). '{n}'·'{x}' 들어간 키 = 틀(숫자·말 끼움)
   - 사전에 없는 한국어 = 그대로 두고 VZTR_I18N.miss 에 모음 → 번역 본작업 할 일 목록 (콘솔: VZTR_I18N.list())
   - 장소 이름: 영어 이름(gen-data places[].en, 공식) > 로마자 자동(규칙 표기, 동화 규칙 없음 — 임시) — 영어판에서만 */
(function () {
  var EN = /\/en\//.test(location.pathname) || window.VZTR_LANG === 'en', L = EN ? 'en' : 'ko', KEY = 'vztr-lang';
  window.VZTR_LANG = L; document.documentElement.lang = L;
  var bot = navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent);
  function other() {   // 같은 화면의 다른 언어 주소
    var p = location.pathname;
    if (EN) p = p.replace(/\/en\//, '/');
    else { var i = p.lastIndexOf('/'); p = p.slice(0, i + 1) + 'en/' + p.slice(i + 1); }
    return p + location.search + location.hash;
  }
  try {
    var saved = localStorage.getItem(KEY);
    if (!EN && !saved && !bot && /^https?:/.test(location.protocol) && /\/(index\.html|start\.html)?$/.test(location.pathname) && !/^ko\b/i.test(navigator.language || 'ko')) { location.replace(other()); return; }
    if (!saved || saved !== L) { /* 주소로 들어온 언어는 고른 것으로 치지 않음 — 버튼으로만 기억 */ }
  } catch (_) {}
  function go() { try { localStorage.setItem(KEY, EN ? 'ko' : 'en'); } catch (_) {} location.href = other(); }

  var API = window.VZTR_I18N = { lang: L, en: EN, other: other, go: go, miss: new Map(), list: function () { return Array.from(API.miss.keys()); } };
  window.T = function (s) { return s; };   // 코드에서 쓰는 번역(한국어판 = 그대로)

  /* 머리 언어 전환 — start.html: header.bar 오른쪽 / index.html: 맨 위 상자(.pill) 메뉴 옆 */
  var CSS = '.vzlang{all:unset;box-sizing:border-box;cursor:pointer;flex:none;display:inline-flex;align-items:center;justify-content:center;min-height:2rem;padding:0 .625rem;border-radius:999px;font:600 .8125rem/1 inherit;letter-spacing:0;color:var(--sub,#6B6E76);white-space:nowrap;-webkit-tap-highlight-color:transparent}'
    + '.vzlang:hover{color:var(--ink,#16171A)}.vzlang:focus-visible{outline:2px solid var(--blue,#2F55D4);outline-offset:2px}'
    + 'header.bar.vzl{grid-template-columns:2.75rem minmax(0,1fr) auto auto}'
    + 'html.introfit header.bar.vzl{display:grid;position:absolute;top:env(safe-area-inset-top,0px);left:0;right:0;background:none;padding:.5rem 1rem 0;pointer-events:none}html.introfit header.bar.vzl>*{visibility:hidden}html.introfit header.bar.vzl .vzlang{visibility:visible;pointer-events:auto}'   // 첫 화면은 위 막대가 없음 → 언어만 오른쪽 위에
    + '.vzko{display:block;font-size:.8125rem;font-weight:500;color:var(--sub,#6B6E76);letter-spacing:0}';
  function mount() {
    if (document.querySelector('.vzlang')) return;
    var b = document.createElement('a'); b.className = 'vzlang'; b.href = other(); b.setAttribute('data-noi18n', '');
    b.textContent = EN ? '한국어' : 'English'; b.lang = EN ? 'ko' : 'en'; b.setAttribute('hreflang', b.lang);
    b.onclick = function (e) { e.preventDefault(); go(); };
    var bar = document.querySelector('header.bar'), pill = document.querySelector('.top .pill');
    if (bar) { bar.classList.add('vzl'); bar.appendChild(b); }
    else if (pill) { var m = pill.querySelector('#modeSeg'); pill.insertBefore(b, m || null); }
    else return;
    addEventListener('hashchange', function () { b.href = other(); });
  }
  var st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  if (!EN) return;

  /* ===== 영어판: 사전 ===== */
  var HAN = /[가-힣]/, D = Object.create(null), PAT = [];
  function load() {
    var src = window.VZTR_EN || {};
    Object.keys(src).forEach(function (k) {
      if (/\{\w+\}/.test(k)) {   // 틀: '{n}박 {m}일' → /^(\d+)박 (\d+)일$/
        var names = [], re = new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{(\w+)\\?\}/g, function (_, n) { names.push(n); return /^[nmd]$/.test(n) ?'(\\d+)' : '(.+?)'; }) + '$');
        PAT.push([re, names, src[k]]);
      } else D[k] = src[k];
    });
  }
  load();
  /* 장소 이름 → 영어 (gen-data가 있는 화면에서 처음 쓸 때 한 번) */
  var placesDone = false;
  function places() {
    if (placesDone || !window.GABOJA_DATA) return; placesDone = true;
    var P = window.GABOJA_DATA.places || {};
    Object.keys(P).forEach(function (id) { var p = P[id]; if (!p || !HAN.test(p.n)) return; var e = API.placeEn(p); if (e) { if (!(p.n in D)) D[p.n] = e; if (p.sh && !(p.sh in D)) D[p.sh] = e; } });
  }
  API.placeEn = function (p) { return p && (p.en || (HAN.test(p.n) ? roman(p.n) : '')); };
  function tr(s) {
    var t = s.trim(); if (!t || !HAN.test(t)) return null;
    places();
    var r = D[t];
    if (r == null) for (var i = 0; i < PAT.length; i++) { var m = t.match(PAT[i][0]); if (m) { r = PAT[i][2]; var g = m.slice(1).map(function (v) { return HAN.test(v) ? (tr(v) || v).trim() : v; }); if (typeof r === 'function') r = r.apply(null, g); else PAT[i][1].forEach(function (n, j) { r = r.replace('{' + n + '}', g[j]); }); break; } }   // 값이 함수면 끼운 말들을 받아 문장을 만듦
    if (r == null) { API.miss.set(t, (API.miss.get(t) || 0) + 1); return null; }
    return s.replace(t, r);
  }
  API.t = window.T = function (s) { var r = tr(String(s)); return r == null ? s : r; };
  var ATTR = ['placeholder', 'aria-label', 'title', 'alt'], mine = new WeakMap(), mineA = new WeakMap();
  function skip(el) { return !el || el.closest && el.closest('script,style,textarea,[data-noi18n],[contenteditable],.vzko,[lang="ko"]'); }
  function node(n) {
    if (n.nodeType === 3) { if (mine.get(n) === n.data || skip(n.parentElement)) return; var r = tr(n.data); if (r != null) { n.data = r; mine.set(n, r); } return; }
    if (n.nodeType !== 1 || skip(n)) return;
    for (var i = 0; i < ATTR.length; i++) { var v = n.getAttribute(ATTR[i]), w = mineA.get(n) || {}; if (v && HAN.test(v) && w[ATTR[i]] !== v) { var r2 = tr(v); if (r2 != null) { w[ATTR[i]] = r2; mineA.set(n, w); n.setAttribute(ATTR[i], r2); } } }
    if (n.tagName === 'INPUT' && (n.type === 'button' || n.type === 'submit') && HAN.test(n.value)) { var r3 = tr(n.value); if (r3 != null) n.value = r3; }
    for (var c = n.firstChild; c; c = c.nextSibling) node(c);
  }
  function title() { var r = tr(document.title); if (r != null) document.title = r; }
  function start() {
    node(document.body); title();
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) { var m = ms[i];
        if (m.type === 'characterData') node(m.target);
        else if (m.type === 'attributes') node(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) node(m.addedNodes[j]); }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
    new MutationObserver(title).observe(document.querySelector('title') || document.head, { childList: true, characterData: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  /* ===== 로마자 자동 표기 (국어의 로마자 표기법 기본 대응표만 — 동화·된소리 규칙 없음, 공식 영어 이름이 없을 때만 임시로) ===== */
  var CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'],
    JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'],
    JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
  /* 장소 이름 끝말 → 영어 (2015 관광 안내 용어 통일안처럼 고유 부분은 로마자 + 속성은 번역) */
  var TAIL = [['전통시장', 'Traditional Market'], ['시장', 'Market'], ['골목', 'Alley'], ['거리', 'Street'], ['길', '-gil'], ['공원', 'Park'], ['해수욕장', 'Beach'], ['해변', 'Beach'], ['박물관', 'Museum'], ['미술관', 'Art Museum'],
    ['전망대', 'Observatory'], ['타워', 'Tower'], ['궁', 'Palace'], ['사', 'Temple'], ['산', 'Mountain'], ['역', 'Station'], ['마을', 'Village'], ['포장마차', 'Street Food Stalls'], ['카페', 'Cafe'], ['식당', 'Restaurant'], ['한옥', 'Hanok'], ['돌담길', 'Stone Wall Path'], ['야시장', 'Night Market']];
  function rom(w) {
    var o = '', prevJ = -1;
    for (var i = 0; i < w.length; i++) {
      var c = w.charCodeAt(i) - 0xAC00;
      if (c < 0 || c > 11171) { o += w[i]; prevJ = -1; continue; }
      var ch = Math.floor(c / 588), ju = Math.floor((c % 588) / 28), jo = c % 28, cs = CHO[ch];
      if (ch === 5) cs = prevJ === 8 ? 'l' : 'r';          // ㄹㄹ = ll
      if (ch === 11 && prevJ > 0 && o) { /* 받침 + ㅇ: 그대로 이어 씀 */ }
      o += cs + JUNG[ju] + JONG[jo]; prevJ = jo;
    }
    return o;
  }
  var cap = function (s) { return s.replace(/(^|[\s(·-])([a-z])/g, function (_, a, b) { return a + b.toUpperCase(); }); };
  function roman(name) {
    return cap(String(name).split(/\s+/).map(function (w) {
      for (var i = 0; i < TAIL.length; i++) { var k = TAIL[i][0]; if (w === k) return TAIL[i][1]; if (w.length > k.length + 1 && w.slice(-k.length) === k) return rom(w.slice(0, -k.length)) + (TAIL[i][1][0] === '-' ? TAIL[i][1] : ' ' + TAIL[i][1]); }
      return rom(w);
    }).join(' '));
  }
  API.roman = roman;
})();
