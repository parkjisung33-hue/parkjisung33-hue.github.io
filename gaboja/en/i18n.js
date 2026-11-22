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
    if (!EN && !saved && !bot && /^https?:/.test(location.protocol) && /\/(index\.html|start\.html)?$/.test(location.pathname) && !/^ko\b/i.test(navigator.language || 'ko')) { location.replace(other()); try { document.documentElement.style.visibility = 'hidden'; } catch (_) {} return; }   // 11/22 해외(영어 폰)에서 빈 화면: window.stop()이 영어판으로 넘어가는 것까지 취소했음 → 멈추지 않고 화면만 숨김
    if (!saved || saved !== L) { /* 주소로 들어온 언어는 고른 것으로 치지 않음 — 버튼으로만 기억 */ }
  } catch (_) {}
  function go() { try { localStorage.setItem(KEY, EN ? 'ko' : 'en'); } catch (_) {} location.href = other(); }

  var API = window.VZTR_I18N = { lang: L, en: EN, other: other, go: go, miss: new Map(), list: function () { return Array.from(API.miss.keys()); } };
  window.T = function (s) { return s; };   // 코드에서 쓰는 번역(한국어판 = 그대로)

  /* 머리 언어 전환 — start.html: header.bar 오른쪽 / index.html: 맨 위 상자(.pill) 메뉴 옆 */
  var CSS = '.vzlang{all:unset;box-sizing:border-box;cursor:pointer;flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;-webkit-tap-highlight-color:transparent}'   /* 누르는 칸 44px, 보이는 알약은 .vzp 34px (2026-11-22 ① 지구본+EN/KO) */
    + '.vzp{display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 11px 0 9px;border-radius:999px;background:var(--paper,#fff);box-shadow:0 0 0 1px var(--hair,rgba(22,23,26,.09));font-family:inherit;font-size:12.5px;font-weight:700;line-height:1;letter-spacing:.03em;color:var(--ink,#16171A);white-space:nowrap}'
    + '.pill .ttl b.vzwrap,.hbox .pill .ttl b.vzwrap{white-space:normal!important;overflow:visible!important;overflow-wrap:normal!important;word-break:keep-all!important;font-size:.875rem!important;line-height:1.2!important}'
    + '.vzlang.vzic .vzt{display:none}.vzlang.vzic .vzp{padding:0 9px;gap:0}'
    + '.vzp svg{width:15px;height:15px;flex:none;stroke:currentColor;fill:none;stroke-width:1.8}'
    + '.vzlang:hover .vzp{box-shadow:0 0 0 1px var(--sub,#6B6E76)}.vzlang:focus-visible{outline:2px solid var(--blue,#2F55D4);outline-offset:-2px;border-radius:999px}'
    + 'header.bar.vzl{grid-template-columns:2.75rem minmax(0,1fr) auto auto}'
    + 'html.introfit header.bar.vzl{display:grid;position:absolute;top:env(safe-area-inset-top,0px);left:0;right:0;background:none;padding:.5rem 1rem 0;pointer-events:none}html.introfit header.bar.vzl>*{visibility:hidden}html.introfit header.bar.vzl .vzlang{visibility:visible;pointer-events:auto}'   // 첫 화면은 위 막대가 없음 → 언어만 오른쪽 위에
    + '.vzko{display:block;font-size:.8125rem;font-weight:500;color:var(--sub,#6B6E76);letter-spacing:0}';
  var rf = 0, rfT = null; function refit() { if (rf || typeof window.fitTitle !== 'function') return; rf = requestAnimationFrame(function () { rf = 0; try { window.fitTitle(); var b = document.querySelector('.pill .ttl b'), l = document.querySelector('.pill .vzlang'); if (b) { var bad = function () { return b.scrollWidth > b.clientWidth + 1; }; b.classList.remove('vzwrap'); if (l) l.classList.remove('vzic'); if (b.dataset.vzs && b.textContent === b.dataset.vzs) { b.textContent = b.dataset.vzf; window.fitTitle(); } if (bad() && l) { l.classList.add('vzic'); window.fitTitle(); } if (bad()) { var f = b.textContent, m = f.match(/^(?:\d+ days? in |Day trip (?:to |· )?)(.+)$/) || f.match(/^(.+?),? (?:day trip|\d+ nights?.*)$/i) || f.match(/^(.+?) (?:\d+박 \d+일|당일치기)$/); if (m) { b.dataset.vzf = f; b.dataset.vzs = m[1]; b.title = f; b.textContent = m[1]; window.fitTitle(); } } if (bad()) { var k0 = parseFloat(b.style.getPropertyValue('--tk')) || 1; b.style.setProperty('--tk', Math.max(0.5, k0 * (b.clientWidth - 2) / b.scrollWidth).toFixed(3)); }   /* 11/22: 두 줄 금지 — 아주 좁은 폰(320)은 글자를 조금 더 줄이고(최소 0.5배), 그래도 넘치면 말줄임(…) */
    b.style.textOverflow = 'ellipsis'; b.style.overflow = 'hidden'; b.style.whiteSpace = 'nowrap'; rfT = b.textContent; } } catch (_) {} }); }   // 머리 제목 맞춤 = 버튼이 붙거나 제목이 번역된 뒤 다시
  window.VZTR_REFIT = function () { rfT = null; refit(); };   // F-03: 탭이 바뀌어 제목 칸 넓이가 달라지면 다시 맞춤
  function mount() {
    if (document.querySelector('.vzlang') || !/\/(index\.html|start\.html)?$/.test(location.pathname)) return;   // 리뷰 #9: 덜어내기 보드 등엔 영어판이 없음
    var b = document.createElement('a'); b.className = 'vzlang'; b.href = other(); b.setAttribute('data-noi18n', '');
    b.innerHTML = '<span class="vzp"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg><span class="vzt">' + (EN ? 'KO' : 'EN') + '</span></span>'; b.setAttribute('aria-label', EN ? 'View in Korean' : '영어로 보기'); b.lang = EN ? 'ko' : 'en'; b.setAttribute('hreflang', b.lang);
    b.onclick = function (e) { e.preventDefault(); go(); };
    var bar = document.querySelector('header.bar'), pill = document.querySelector('.top .pill');
    if (bar) { bar.classList.add('vzl'); bar.appendChild(b); }
    else if (pill) { var m = pill.querySelector('#modeSeg'); pill.insertBefore(b, m || null); }
    else return;
    addEventListener('hashchange', function () { b.href = other(); });
    refit(); addEventListener('resize', refit);   // 11/22 폭이 바뀌면(회전 등) 제목 다시 맞춤
  }
  var st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  if (!EN) return;

  /* ===== 영어판: 사전 ===== */
  var HAN = /[가-힣]/, D = Object.create(null), PAT = [], PATS = [], PATS2 = [], MAN = window.VZTR_EN || {};
  function load() {
    var src = Object.assign({}, window.VZTR_EN_AUTO || {}, window.VZTR_EN || {});   // 자동 번역(i18n-en-auto.js) 위에 손 사전(i18n-en.js)이 이김
    Object.keys(src).forEach(function (k) {
      if (/\{\w+\}/.test(k) && typeof src[k] === 'function') {   // 틀: '{n}박 {m}일' → /^(\d+)박 (\d+)일$/
        var names = [], re = new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{(\w+)\\?\}/g, function (_, n) { names.push(n); return /^[nmd]$/.test(n) ?'(\\d+)' : '(.+?)'; }) + '$');
        PAT.push([re, names, src[k]]);
      } else if (/\{\w+\}/.test(k)) PATS.push(k); else D[k] = src[k];
    });
  }
  load();
  PATS.forEach(function (k) { var names = [], src = Object.assign({}, window.VZTR_EN_AUTO || {}, MAN), re = new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{(\w+)\\?\}/g, function (_, n) { names.push(n); return /^[nmd]$/.test(n) ? '(\\d+)' : '(.+?)'; }) + '$'); PATS2.push([re, names, src[k]]); });   // 문자열 틀 = 마지막에
  /* 장소 이름 → 영어 (gen-data가 있는 화면에서 처음 쓸 때 한 번) */
  var placesDone = false;
  function places() {
    if (placesDone || !window.GABOJA_DATA) return; placesDone = true;
    var P = window.GABOJA_DATA.places || {};
    var names = [];
    var EPL = window.VZTR_EN_PLACES || {};
    Object.keys(P).forEach(function (id) { var p = P[id]; if (!p || !HAN.test(p.n)) return; var x = EPL[id], e = x && x.en || API.placeEn(p), sh = x && x.short && x.short.length <= 20 ? x.short : e; if (e) { if (!(p.n in MAN)) D[p.n] = e.length > 20 ? sh : e; if (p.sh && p.sh !== p.n && !(p.sh in MAN)) D[p.sh] = sh; /* 화면 = 20자 넘으면 짧은 이름(V-28 한 줄) */ names.push(p.n); if (p.sh && p.sh !== p.n) names.push(p.sh); } });
    names = names.filter(function (n) { return n.length >= 3; })   /* 리뷰 #7: 2글자('서면')는 다른 낱말 안에서도 걸려서 '@'로 안 바꿈 */.sort(function (a, b) { return b.length - a.length; });
    if (names.length) PN = new RegExp(names.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
  }
  var PN = null;
  API.placeEn = function (p) { places(); return p && (p.en || (placesDone && D[p.n] && !HAN.test(D[p.n]) ? D[p.n] : HAN.test(p.n) ? roman(p.n) : '')); };   // 영어 이름 = 장소 사전(i18n-en-auto.js VZTR_EN_PLACES) > 로마자 자동
  function tr(s, quiet) {
    var t = s.trim(); if (!t || !HAN.test(t)) return null;
    places();
    var r = null;
    for (var i = 0; i < PAT.length; i++) { var m = t.match(PAT[i][0]); if (m) { try { r = PAT[i][2].apply(null, m.slice(1)); } catch (_) { r = null; } if (r != null) break; } }   // 함수 틀 먼저(모르는 말이면 null → 다음)
    if (r == null) r = D[t];
    if (r == null && /\d/.test(t)) {   // 숫자만 다른 문장 = 키에서 숫자를 '#'로 (예 '강수확률 #%' → 'Rain #%'), 값의 '#'에 같은 순서로 다시 넣음
      var nums = t.match(/\d+/g), v0 = D[t.replace(/\d+/g, '#')];
      if (v0 != null) { var q = 0; r = String(v0).replace(/#/g, function () { return nums[q++] || ''; }); }
    }
    if (r == null && PN) {   // 장소 이름이 들어간 문장 = 이름을 '@'로 (예 '‘@’ 근처 인기 장소'), 값의 '@'에 영어 이름
      var got = []; var t2 = t.replace(PN, function (w) { got.push(D[w] || w); return '@'; }).replace(/\d+/g, '#');
      var nums2 = t.replace(PN, '@').match(/\d+/g) || [], v1 = got.length ? D[t2] : null;
      if (v1 != null) { var a = 0, b = 0; r = String(v1).replace(/@/g, function () { return got[a++] || ''; }).replace(/#/g, function () { return nums2[b++] || ''; }); }
    }
    if (r == null) for (var i2 = 0; i2 < PATS2.length; i2++) { var m2 = t.match(PATS2[i2][0]); if (!m2) continue; var g = m2.slice(1).map(function (v) { return HAN.test(v) ? (tr(v, true) || v).trim() : v; }); if (g.some(function (v) { return HAN.test(v); })) continue; r = PATS2[i2][2]; PATS2[i2][1].forEach(function (n, j) { r = r.replace('{' + n + '}', function () { return g[j]; }); }); break; }   // 리뷰 #2
    if (r == null) {   // 11/22 ' · '·' — '·' → ' 로 이어 붙인 문장 = 조각마다 번역해서 다시 이음. 바깥 구분자부터 한 겹씩(조각 이름에 ' → '가 들어 있어도 됨) · 조각이 하나라도 못 옮기면 통째로 빠진 것
      for (var si = 0, SEP = [' · ', ' — ', ' → ']; si < SEP.length; si++) {
        if (t.indexOf(SEP[si]) < 0) continue;
        var ok = true, out = t.split(SEP[si]).map(function (pc) { if (!HAN.test(pc)) return pc; var q = tr(pc, true); if (q == null) { ok = false; return pc; } return q.trim(); });
        if (ok) r = out.join(SEP[si]);
        break;
      }
    }
    if (r == null && quiet) return null;
    if (r == null) { var mk = /\d/.test(t) ? t.replace(/\d+/g, '#') : t; if (PN && t.replace(PN, '@') !== t) mk = t.replace(PN, '@').replace(/\d+/g, '#'); API.miss.set(mk, (API.miss.get(mk) || 0) + 1); return null; }   // 빠진 목록 = 사전 키 모양 그대로(숫자 #, 장소 @)
    return s.replace(t, function () { return r; });   // r 안의 '$' 글자가 치환 기호로 읽히지 않게
  }
  API.t = window.T = function (s) { var r = tr(String(s)); return r == null ? s : r; };
  API.has = function (s) { return D[String(s).trim()] != null; };   // 사전에 통째 문장이 있는지(틀이 통째 문장을 가로채지 않게)
  API.tq = function (s) { var r = tr(String(s), true); return r == null ? s : r; };   // 조용한 번역(못 옮겨도 빠진 목록에 안 쌓음) — 틀 안에서 조각을 옮길 때
  var ATTR = ['placeholder', 'aria-label', 'title', 'alt'], mine = new WeakMap(), mineA = new WeakMap();
  function skip(el) { return !el || el.closest && el.closest('script,style,textarea,[data-noi18n],[contenteditable],.vzko,[lang="ko"]'); }
  function node(n) {
    if (n.nodeType === 3) { if (mine.get(n) === n.data || skip(n.parentElement)) return; var r = tr(n.data); if (r != null) { n.data = r; mine.set(n, r); } return; }
    if (n.nodeType !== 1 || skip(n)) return;
    for (var i = 0; i < ATTR.length; i++) { var v = n.getAttribute(ATTR[i]), w = mineA.get(n) || {}; if (v && HAN.test(v) && w[ATTR[i]] !== v) { var r2 = tr(v); if (r2 != null) { w[ATTR[i]] = r2; mineA.set(n, w); n.setAttribute(ATTR[i], r2); } } }
    if (n.tagName === 'INPUT' && (n.type === 'button' || n.type === 'submit') && HAN.test(n.value)) { var r3 = tr(n.value); if (r3 != null) n.value = r3; }
    for (var c = n.firstChild; c; c = c.nextSibling) node(c);
  }
  var lastT = ''; function title() { if (document.title === lastT) return; var r = tr(document.title); if (r != null) { lastT = r; document.title = r; } }
  function start() {
    node(document.body); title();
    new MutationObserver(function (ms) {
      if (ms.some(function (m) { var e = m.target.nodeType === 1 ? m.target : m.target.parentNode, tb = e && e.closest && e.closest('.pill .ttl b'); return !tb || tb.textContent !== rfT; })) refit();   // 리뷰: refit이 제목을 줄이며 만든 변화로 다시 refit → 매 프레임 반복되던 것 막음
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
