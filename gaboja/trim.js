/* VZTR 덜어내기 보드 (2026-11-19)
   앱 화면(start.html·index.html) 위에 얹는 도구. 앱 코드는 건드리지 않는다.
   - 곡률 바: 앱 CSS의 모서리 값(원·알약 모양 제외)에 배율을 곱한다 → 0% 직각 ~ 100% 지금 ~ 150%
   - 빼기 모드: 아무 부분이나 눌러 고르고 → 더 크게/작게로 범위 조절 → '빼기'(이것만 / 같은 것 전부)
   - 뺀 것은 CSS 선택자로 숨김 → 화면이 다시 그려져도 계속 빠짐. 목록에서 되살리기·메모·답 복사
   저장 = 이 브라우저 localStorage (페이지별) */
(function () {
  'use strict';
  /* 11/20 화면별 보드(trim-board.html): 대표 화면마다 따로 저장 · 자간·행간·여백·위치 조절 */
  var SCREENS = [
    { g: 'start', s: 'intro', n: '첫 페이지' },
    { g: 'start', s: 'q3', n: '질문 (4번째)' },
    { g: 'start', s: 'result', n: '유형 결과' },
    { g: 'start', s: 'method', n: '일정 만드는 방법' },
    { g: 'start', s: 'city', n: '입력 — 어디로' },
    { g: 'start', s: 'date', n: '입력 — 날짜' },
    { g: 'start', s: 'likes', n: '입력 — 좋아하는 것' },
    { g: 'start', s: 'swipe', n: '장소 고르기' },
    { g: 'start', s: 'done', n: '발급 완료' },
    { g: 'guide', s: 'plan', n: '가이드북 — 일정(요약)' },
    { g: 'guide', s: 'detail', n: '가이드북 — 상세', act: function () { click('#modeDetail'); } },
    { g: 'guide', s: 'pass', n: '탑승권', act: function () { var f = document.querySelector('.flycard'); if (f) f.scrollIntoView({ block: 'center' }); } },
    { g: 'guide', s: 'daysum', n: '하루 일정 요약', act: function () { click('[data-daysum]'); } },
    { g: 'guide', s: 'tripsum', n: '여행 요약', act: function () { click('[data-m="sum"]'); } },
    { g: 'guide', s: 'now', n: '길 안내', act: function () { click('[data-v="v-now"]'); } },
    { g: 'guide', s: 'log', n: '기록', act: function () { click('#tabLog'); } },
    { g: 'guide', s: 'add', n: '일정 추가', act: function () { click('#addBtn'); } },
    { g: 'guide', s: 'menu', n: '메뉴', act: function () { click('#menuBtn'); } }
  ];
  function click(q) { var e = document.querySelector(q); if (e) e.click(); }
  function keyOf(g, s) { return 'vztr-trim2-' + g + (s ? '-' + s : ''); }
  var PRE = window.TRIM_PRESET || {};          // 시안 페이지(g1 등)가 정해 둔 곡률·이름
  var PAGE = PRE.page || (/start/.test(location.pathname) ? 'start' : 'guide');
  var QS = new URLSearchParams(location.search);
  var SCR = QS.get('scr') || '', SDEF = SCREENS.filter(function (x) { return x.g === PAGE && x.s === SCR; })[0];
  var PAGE_TX = PRE.tx || (SDEF ? SDEF.n : PAGE === 'start' ? '시작·질문·입력·발급' : '가이드북');
  var KEY = keyOf(PAGE, SCR), KKEY = 'vztr-trim2-k' + (PRE.page ? '-' + PRE.page : '');   // 11/19 1차안 합침 뒤 새 키(앱 곡률이 이미 30%·8px로 고정됨)

  /* 보드(허브)용: UI 없이 목록·답 글자만 */
  var ADJ_TX = { ls: '자간', lh: '행간', mt: '위 여백', mb: '아래 여백', gap: '사이 간격', pl: '왼쪽 안쪽', pr: '오른쪽 안쪽', x: '가로 위치', y: '세로 위치' };
  function fmtV(k, v) { return k === 'ls' ? (+v).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + 'em' : k === 'lh' ? (v === 0 ? '보통' : (+v).toFixed(2)) : Math.round(v) + 'px'; }
  function adjLine(it) {
    return Object.keys(ADJ_TX).filter(function (k) { return it.v && it.v[k] !== it.b[k]; }).map(function (k) {
      return ADJ_TX[k] + ' ' + fmtV(k, it.b[k]) + '→' + fmtV(k, it.v[k]);
    }).join(' · ');
  }
  function fmtState(st, title) {
    var lines = [];
    (st.items || []).forEach(function (it, i) {
      lines.push('빼기 ' + (i + 1) + '. “' + it.tx + '”' + (it.all ? ' (같은 것 전부 ' + it.n + ')' : ''));
      lines.push('   ' + it.sel);
    });
    (st.adj || []).forEach(function (it, i) {
      var l = adjLine(it); if (!l) return;
      lines.push('조절 ' + (i + 1) + '. “' + it.tx + '”' + (it.all ? ' (같은 것 전부 ' + it.n + ')' : '') + ' — ' + l);
      lines.push('   ' + it.sel);
    });
    if (st.memo) lines.push('메모: ' + st.memo);
    return lines.length ? ['■ ' + title].concat(lines).join('\n') : '';
  }
  if (window.TRIM_HUB) {
    window.VZTR_TRIM = { screens: SCREENS, key: keyOf, fmt: fmtState, count: function (st) { return { cut: (st.items || []).length, adj: (st.adj || []).filter(function (x) { return adjLine(x); }).length, memo: !!st.memo }; } };
    return;
  }
  var STATE_CLS = /^(on|off|play|now|live|sel|selected|active|show|shown|open|done|hide|hidden|in|out|go|cur|past|fit|is-|has-|js-|trim-)/;
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var S = load(KEY, { items: [], memo: '' });
  if (!S.adj) S.adj = [];
  var scope = 'all';                             // 조절 범위: 'all' 같은 것 전부 / 'one' 이것만
  var K = load(KKEY, PRE.k != null ? PRE.k : 1);   // 기본 = 지금 앱 그대로(100%)
  var P = load(KKEY + '-pill', PRE.p != null ? PRE.p : 1);
  var ghost = false, mode = false, pick = null;

  /* ---------- 곡률: 스타일시트의 border-radius를 calc(값 * k)로 바꿔 둔다 ---------- */
  var RAD_PROPS = ['border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'];
  function toPx(n, u) { return u === 'rem' || u === 'em' ? n * 16 : n; }
  function scaleVal(v) {
    if (!v || /%|inherit|initial|calc|var\(|unset/.test(v)) return null;
    if (/^\s*(\d*\.?\d+)(px|rem)\s*(!important)?\s*$/.test(v) && toPx(parseFloat(v), /rem/.test(v) ? 'rem' : 'px') >= 100)
      return 'var(--trim-pill, ' + v.replace(/\s*!important/, '') + ')';   // 알약(머리·탭바·버튼) = 둘째 바
    var big = false, any = false;
    var out = v.replace(/(\d*\.?\d+)(px|rem|em)/g, function (m, n, u) {
      var px = toPx(parseFloat(n), u);
      if (px >= 100) big = true;            // 알약(62rem·999px)은 그대로
      if (px > 0) any = true;
      return 'calc(' + m + ' * var(--trim-k, 1))';
    });
    return big || !any ? null : out;
  }
  function scaleVar(v) {                     // --r-lg 같은 토큰도
    var m = /^\s*(\d*\.?\d+)(px|rem)\s*$/.exec(v || '');
    if (!m || toPx(parseFloat(m[1]), m[2]) >= 100) return null;
    return 'calc(' + m[1] + m[2] + ' * var(--trim-k, 1))';
  }
  var done = new WeakSet();
  function walk(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.cssRules && !r.style) { walk(r.cssRules); continue; }
      if (!r.style || done.has(r)) continue;
      done.add(r);
      if (r.cssRules) walk(r.cssRules);
      for (var j = 0; j < RAD_PROPS.length; j++) {
        var p = RAD_PROPS[j], v = r.style.getPropertyValue(p);
        if (!v) continue;
        var nv = scaleVal(v);
        if (nv) r.style.setProperty(p, nv, r.style.getPropertyPriority(p));
      }
      ['--r-lg', '--r-md', '--r-sm', '--nr'].forEach(function (p) {
        var v = r.style.getPropertyValue(p), nv = v && scaleVar(v);
        if (nv) r.style.setProperty(p, nv, r.style.getPropertyPriority(p));
      });
    }
  }
  function patchSheets() {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var sh = document.styleSheets[i];
      if (sh.ownerNode && sh.ownerNode.id === 'trimCss') continue;
      try { walk(sh.cssRules); } catch (e) { /* 다른 출처 글꼴 CSS */ }
    }
  }
  function setK(k) {
    K = Math.max(0, Math.min(1.5, k));
    document.documentElement.style.setProperty('--trim-k', K);
    save(KKEY, K);
    var lab = document.getElementById('trimKv');
    if (lab) lab.textContent = Math.round(K * 100) + '% (지금 앱 기준)';
    if (typeof window.fixNotches === 'function') try { window.fixNotches(); } catch (e) {}
  }

  function setP(p) {
    P = Math.max(0, Math.min(1, p));
    if (P >= 1) document.documentElement.style.removeProperty('--trim-pill');
    else document.documentElement.style.setProperty('--trim-pill', Math.round(P * 32) + 'px');
    save(KKEY + '-pill', P);
    var lab = document.getElementById('trimPv');
    if (lab) lab.textContent = P >= 1 ? '100% · 지금' : Math.round(P * 100) + '% · ' + Math.round(P * 32) + 'px';
  }

  /* ---------- 선택자 ---------- */
  function cls(el) {
    var c = [].slice.call(el.classList).filter(function (x) { return !STATE_CLS.test(x); });
    return c.length ? '.' + CSS.escape(c[0]) : '';
  }
  function nth(el) {
    var i = 1, s = el;
    while ((s = s.previousElementSibling)) if (s.tagName === el.tagName) i++;
    return ':nth-of-type(' + i + ')';
  }
  function anchor(el) {                      // 가장 가까운 id 조상
    var a = el.parentElement;
    while (a && a !== document.body && !a.id) a = a.parentElement;
    return a && a.id && !/^trim/.test(a.id) ? '#' + CSS.escape(a.id) : 'body';
  }
  function selOne(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    var parts = [], e = el;
    while (e && e !== document.body && !e.id) {
      parts.unshift(e.tagName.toLowerCase() + cls(e) + nth(e));
      e = e.parentElement;
    }
    return (e && e.id ? '#' + CSS.escape(e.id) : 'body') + ' > ' + parts.join(' > ');
  }
  function selAll(el) {                      // 같은 종류 전부
    var c = cls(el), t = el.tagName.toLowerCase();
    if (c) return anchor(el) + ' ' + t + c;
    var pa = el.parentElement, pc = pa && cls(pa);           // 클래스 없는 칸 = 부모 클래스 > 태그
    if (pc) return anchor(pa) + ' ' + pa.tagName.toLowerCase() + pc + ' > ' + t;
    return null;
  }
  function label(el) {
    var t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!t) t = el.getAttribute('aria-label') || el.getAttribute('alt') || '';
    if (!t) t = el.tagName === 'svg' || el.querySelector('svg') ? '(아이콘·그림)' : '(빈 칸·장식)';
    return t.length > 28 ? t.slice(0, 28) + '…' : t;
  }
  function screenTx() {
    var h = document.querySelector('h1:not([hidden]), .qh h1, h2');
    var vis = [].slice.call(document.querySelectorAll('h1,h2')).filter(function (x) { return x.offsetParent && !x.closest('#trimUi'); })[0];
    var t = (vis || h || {}).textContent || '';
    t = t.replace(/\s+/g, ' ').trim();
    return (t.length > 20 ? t.slice(0, 20) + '…' : t) || PAGE_TX;
  }

  /* ---------- 숨김 CSS ---------- */
  var hideCss;
  function applyHide() {
    var css = S.items.map(function (it) {
      return it.sel + (ghost
        ? '{opacity:.18!important;outline:1px dashed #CF3F66!important}'
        : '{display:none!important}');
    }).join('\n');
    hideCss.textContent = css;
    var n = document.getElementById('trimN');
    if (n) n.textContent = S.items.length + S.adj.filter(function (x) { return adjLine(x); }).length;
    save(KEY, S);
  }

  /* ---------- 조절: 자간·행간·여백·위치 → 선택자별 CSS ---------- */
  var adjCss;
  var ADJ_CSS = { ls: function (v) { return 'letter-spacing:' + v + 'em'; }, lh: function (v) { return 'line-height:' + (v === 0 ? 'normal' : v); },
    mt: function (v) { return 'margin-top:' + v + 'px'; }, mb: function (v) { return 'margin-bottom:' + v + 'px'; },
    gap: function (v) { return 'gap:' + v + 'px'; }, pl: function (v) { return 'padding-left:' + v + 'px'; }, pr: function (v) { return 'padding-right:' + v + 'px'; } };
  function applyAdj() {
    adjCss.textContent = S.adj.map(function (it) {
      var d = Object.keys(ADJ_CSS).filter(function (k) { return it.v[k] !== it.b[k]; }).map(function (k) { return ADJ_CSS[k](it.v[k]) + '!important'; });
      if (it.v.x || it.v.y) d.push('translate:' + (it.v.x || 0) + 'px ' + (it.v.y || 0) + 'px!important');
      return d.length ? it.sel + '{' + d.join(';') + '}' : '';
    }).join('\n');
    applyHide();
  }
  function px(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function baseOf(el) {
    var cs = getComputedStyle(el), fs = px(cs.fontSize) || 16;
    var ls = cs.letterSpacing === 'normal' ? 0 : Math.round(px(cs.letterSpacing) / fs * 1000) / 1000;
    var lh = cs.lineHeight === 'normal' ? 0 : Math.round(px(cs.lineHeight) / fs * 100) / 100;
    var flex = /flex|grid/.test(cs.display);
    return { ls: ls, lh: lh, mt: Math.round(px(cs.marginTop)), mb: Math.round(px(cs.marginBottom)), gap: flex ? Math.round(px(cs.rowGap) || px(cs.columnGap)) : null,
      pl: Math.round(px(cs.paddingLeft)), pr: Math.round(px(cs.paddingRight)), x: 0, y: 0 };
  }
  function adjSel() { var a = selAll(pick); return scope === 'all' && a && safeCount(a) > 1 ? a : selOne(pick); }
  function adjItem(make) {
    if (!pick) return null;
    var sel = adjSel(), it = S.adj.filter(function (x) { return x.sel === sel; })[0];
    if (!it && make) {
      var b = baseOf(pick);
      it = { sel: sel, tx: label(pick), all: sel !== selOne(pick), n: safeCount(sel) || 1, scr: screenTx(), b: b, v: JSON.parse(JSON.stringify(b)) };
      S.adj.push(it);
    }
    return it;
  }
  var STEP = { ls: 0.005, lh: 0.05, mt: 2, mb: 2, gap: 2, pl: 2, pr: 2, x: 2, y: 2 };
  function bump(k, dir) {
    if (!pick || (k === 'gap' && baseOf(pick).gap == null && !adjItem(false))) return;   // 리뷰: 사이 간격 없는 칸에 빈 항목 쌓이지 않게
    var it = adjItem(true); if (!it) return;
    if (k === 'lh' && it.v.lh === 0) it.v.lh = 1.2;   // '보통' → 1.2부터
    if (k === 'gap' && it.v.gap == null) return;
    it.v[k] = Math.round((it.v[k] + dir * STEP[k]) * 1000) / 1000;
    applyAdj(); paintAdj(); setTimeout(function () { if (pick) boxTo(pick); }, 30);
  }
  function resetAdj() {
    var it = adjItem(false); if (!it) return;
    S.adj.splice(S.adj.indexOf(it), 1); applyAdj(); paintAdj(); setTimeout(function () { if (pick) boxTo(pick); }, 30);
  }
  function paintAdj() {
    if (!pick) return;
    var it = adjItem(false), b = it ? it.v : baseOf(pick), base = it ? it.b : b;
    ['ls', 'lh', 'mt', 'mb', 'gap', 'pl', 'pr'].forEach(function (k) {
      var el = document.getElementById('trimA-' + k); if (!el) return;
      var row = el.closest('.ar');
      if (k === 'gap') row.style.display = b.gap == null ? 'none' : '';
      if (b[k] == null) return;
      el.textContent = fmtV(k, b[k]);
      el.classList.toggle('ch', b[k] !== base[k]);
    });
    var xy = document.getElementById('trimA-xy');
    xy.textContent = (b.x || 0) + ', ' + (b.y || 0) + 'px';
    xy.classList.toggle('ch', !!(b.x || b.y));
    var all = selAll(pick), n = all ? safeCount(all) : 0;
    var sc = document.getElementById('trimScope');
    sc.style.display = n > 1 ? '' : 'none';
    sc.textContent = scope === 'all' && n > 1 ? '범위: 같은 것 전부 ' + n + '개 ⇄' : '범위: 이것만 ⇄';
  }

  /* ---------- UI ---------- */
  var CSS_UI = [
    '#trimUi,#trimUi *{box-sizing:border-box;font-family:Pretendard Variable,Pretendard,system-ui,sans-serif;letter-spacing:0;line-height:1.35;text-transform:none}',
    '#trimUi span{display:inline!important;font-size:inherit!important;line-height:inherit!important;min-height:0!important;margin:0!important}',
    '#trimUi span.kl{display:inline-block!important;font-size:11px!important}',
    '#trimUi button{min-height:0!important;height:auto!important;width:auto;flex:none}',
    '#trimBar{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:2147483600;background:#16171A;color:#fff;border-radius:14px;padding:8px 10px;box-shadow:0 8px 28px rgba(0,0,0,.28);font-size:13px}',
    '#trimBar .row{display:flex;align-items:center;gap:8px}',
    '#trimBar .row+.row{margin-top:6px}',
    '#trimBar button{appearance:none;border:0;border-radius:9px;padding:8px 10px;font-size:13px;font-weight:700;background:rgba(255,255,255,.12);color:#fff;white-space:nowrap}',
    '#trimBar button.on{background:#1F5FE0}',
    '#trimBar input[type=range]{flex:1;accent-color:#6D97EB;min-width:0;height:20px;margin:0;padding:0;background:none;border:0;box-shadow:none}',
    '#trimBar .kl{font-size:11px;opacity:.75;white-space:nowrap}',
    '#trimBar .k .kl:first-child{width:74px}',
    '#trimBar .k .kl:last-child{width:84px;text-align:right}',
    '#trimBar .hide{display:none}',
    '#trimPick{position:fixed;left:8px;right:8px;bottom:calc(140px + env(safe-area-inset-bottom,0px));z-index:2147483601;background:#fff;color:#16171A;border-radius:14px;padding:10px;box-shadow:0 8px 28px rgba(0,0,0,.3);font-size:13px;display:none}',
    '#trimPick .t{font-weight:700;margin-bottom:8px;word-break:keep-all}',
    '#trimPick .t small{display:block;font-weight:500;color:#6B6E75;margin-top:2px}',
    '#trimPick .g{display:grid;grid-template-columns:1fr 1fr;gap:6px}',
    '#trimPick button{appearance:none;border:0;border-radius:9px;padding:10px 8px;font-size:13px;font-weight:700;background:#EFEFF1;color:#16171A}',
    '#trimPick button.x{background:#CF3F66;color:#fff}',
    '#trimPick button.x2{background:#fbe3ea;color:#CF3F66}',
    '#trimBox{position:fixed;z-index:2147483599;pointer-events:none;border:2px solid #CF3F66;background:rgba(207,63,102,.10);border-radius:4px;display:none;transition:all .08s}',
    '#trimList{position:fixed;inset:0;z-index:2147483602;background:rgba(22,23,26,.45);display:none}',
    '#trimList .sh{position:absolute;left:0;right:0;bottom:0;max-height:82vh;overflow:auto;background:#fff;color:#16171A;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px))}',
    '#trimList h3{margin:0 0 4px;font-size:17px}',
    '#trimList .sub{color:#6B6E75;font-size:12px;margin:0 0 12px}',
    '#trimList .it{display:flex;gap:8px;align-items:center;padding:9px 0;border-top:1px solid #EFEFF1;font-size:13px}',
    '#trimList .it .nm{flex:1;min-width:0;word-break:keep-all}',
    '#trimList .it .nm small{display:block;color:#6B6E75;font-size:11px}',
    '#trimList button{appearance:none;border:0;border-radius:9px;padding:9px 11px;font-size:13px;font-weight:700;background:#EFEFF1;color:#16171A;white-space:nowrap}',
    '#trimList button.p{background:#1F5FE0;color:#fff}',
    '#trimList textarea{width:100%;min-height:72px;border:1px solid #D5D9DF;border-radius:10px;padding:10px;font-size:14px;margin:10px 0}',
    '#trimList .fb{font-size:12px;color:#6B6E75;background:#F5F6F8;border-radius:10px;padding:10px;margin-bottom:12px;line-height:1.55}',
    '#trimList .btns{display:flex;gap:8px;flex-wrap:wrap}',
    'html.trim-on body{padding-bottom:150px!important}',
    'html.trim-mode *{cursor:crosshair!important;-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}',
    '#trimVer{font-size:10px;opacity:.5;align-self:center}',
    '#trimPick{max-height:46vh;overflow:auto;padding:8px 10px!important}','#trimPick .ar,#trimPick .mv{margin-top:3px!important}','#trimPick .ar button,#trimPick .mv button{padding:5px 0!important}',
    '#trimPick.top{top:calc(8px + env(safe-area-inset-top,0px));bottom:auto!important}',
    '#trimPick .tabs{display:flex;gap:6px;margin-bottom:8px}',
    '#trimPick .tabs button{flex:1;padding:8px;background:#EFEFF1;color:#6B6E75}',
    '#trimPick .tabs button.on{background:#16171A;color:#fff}',
    '#trimPick .adj{display:none}',
    '#trimPick.a .adj{display:block}#trimPick.a .cutg{display:none}',
    '#trimPick .ar{display:grid;grid-template-columns:72px 44px 1fr 44px;gap:6px;align-items:center;margin-top:5px}',
    '#trimPick .lb{font-size:12px;font-weight:700;color:#6B6E75}',
    '#trimPick .vl{text-align:center;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}',
    '#trimPick .vl.ch{color:#1F5FE0}',
    '#trimPick .ar button{padding:7px 0;font-size:16px;line-height:1}',
    '#trimPick .mv{display:grid;grid-template-columns:72px 1fr 1fr 1fr 1fr;gap:6px;align-items:center;margin-top:5px}',
    '#trimPick .mv button{padding:7px 0;font-size:15px}',
    '#trimPick .mv .lb .vl{display:block!important;text-align:left;font-size:11px!important}',
    '#trimPick .sc{width:100%!important;margin-top:8px;background:#E8EEFF!important;color:#1F5FE0!important}',
    '#trimBack{color:#fff;text-decoration:none;font-weight:700;font-size:13px;background:rgba(255,255,255,.12);border-radius:9px;padding:8px 10px;white-space:nowrap}',
    '#trimTitle{font-size:12px;font-weight:700;opacity:.85;flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'
  ].join('\n');

  var FB = PAGE === 'start'
    ? '1단계 참고 — <b>6</b> 장소 고르기 왼쪽 위 글자 묶음 · <b>8</b> 발급 완료 \'넣기·정하기\'·왼쪽 아래 빈칸 · <b>전체 5</b> 위계·불필요한 것 덜어내기'
    : '1단계 참고 — <b>14</b> 맨 위 메뉴+DAY 메뉴 통합(제목·요약/상세·메뉴만) · <b>9b</b> 제목 칸 요일 반복 · <b>11</b> 시각 미정 탑승권 맨 위 · <b>13a</b> 길안내 제목·도착 칸 · <b>15</b> 주의 한 줄 · <b>16</b> 이벤트 하나면 가로 전체 · <b>17</b> 편명 정렬 · <b>전체 5</b> 덜어내기';

  function build() {
    var st = document.createElement('style'); st.id = 'trimCss'; st.textContent = CSS_UI; document.head.appendChild(st);
    hideCss = document.createElement('style'); hideCss.id = 'trimHide'; document.head.appendChild(hideCss);
    adjCss = document.createElement('style'); adjCss.id = 'trimAdjCss'; document.head.appendChild(adjCss);
    var ui = document.createElement('div'); ui.id = 'trimUi';
    ui.innerHTML =
      '<div id="trimBox"></div>' +
      '<div id="trimBar">' +
        (SDEF ? '<div class="row" style="margin-bottom:6px"><a id="trimBack" href="trim-board.html">← 보드</a><span id="trimTitle">' + SDEF.n + '</span></div>' : '') +
        '<div class="row k"><span class="kl">상자·이벤트</span><input id="trimK" type="range" min="0" max="150" step="5"><span class="kl" id="trimKv"></span></div>' +
        '<div class="row k"><span class="kl">머리·탭바·버튼</span><input id="trimP" type="range" min="0" max="100" step="5"><span class="kl" id="trimPv"></span></div>' +
        '<div class="row"><button id="trimMode">✂ 고르기</button><button id="trimGhost">흐리게</button><button id="trimOpen">목록 <span id="trimN">0</span></button><span id="trimVer">v4</span><button id="trimFold" style="margin-left:auto">곡률 접기</button></div>' +
      '</div>' +
      '<div id="trimPick"><div class="t" id="trimPt"></div>' +
        '<div class="tabs"><button id="trimTCut" class="on">빼기</button><button id="trimTAdj">간격·위치</button></div>' +
        '<div class="g"><button id="trimUp">↑ 더 큰 덩어리</button><button id="trimDn">↓ 더 작게</button></div>' +
        '<div class="g cutg" style="margin-top:6px"><button class="x" id="trimCut">이것 빼기</button><button class="x2" id="trimCutAll">같은 것 전부 빼기</button></div>' +
        '<div class="adj">' +
          [['ls', '자간'], ['lh', '행간'], ['mt', '위 여백'], ['mb', '아래 여백'], ['gap', '사이 간격'], ['pl', '왼쪽 안쪽'], ['pr', '오른쪽 안쪽']].map(function (a) {
            return '<div class="ar"><span class="lb">' + a[1] + '</span><button data-a="' + a[0] + '" data-d="-1">−</button><span class="vl" id="trimA-' + a[0] + '"></span><button data-a="' + a[0] + '" data-d="1">+</button></div>';
          }).join('') +
          '<div class="mv"><span class="lb">위치<span id="trimA-xy" class="vl"></span></span><button data-a="x" data-d="-1">←</button><button data-a="y" data-d="-1">↑</button><button data-a="y" data-d="1">↓</button><button data-a="x" data-d="1">→</button></div>' +
          '<button class="sc" id="trimScope"></button>' +
          '<div class="g" style="margin-top:6px;grid-template-columns:1fr"><button id="trimAReset">이 조절 되돌리기</button></div>' +
        '</div>' +
      '<div class="g" style="margin-top:6px;grid-template-columns:1fr"><button id="trimCancel">닫기</button></div></div>' +
      '<div id="trimList"><div class="sh">' +
        '<h3>덜어내기·간격 — ' + PAGE_TX + '</h3><p class="sub">고친 것 목록 · 되돌리기 · 메모' + (SDEF ? ' → 보드에서 전체 한 번에 복사' : ' → 답 복사해서 아키에게') + '</p>' +
        '<div class="fb">' + FB + '</div>' +
        '<div id="trimItems"></div>' +
        '<textarea id="trimMemo" placeholder="메모 (예: 요일 줄은 첫날만, 날씨는 상세에서만)"></textarea>' +
        '<div class="btns"><button class="p" id="trimCopy">답 복사</button><button id="trimReset">전부 되살리기</button><button id="trimClose" style="margin-left:auto">닫기</button></div>' +
      '</div></div>';
    document.body.appendChild(ui);
    document.documentElement.classList.add('trim-on');

    var k = document.getElementById('trimK');
    k.value = Math.round(K * 100);
    k.addEventListener('input', function () { setK(k.value / 100); });
    setK(K);
    var pp = document.getElementById('trimP');
    pp.value = Math.round(P * 100);
    pp.addEventListener('input', function () { setP(pp.value / 100); });
    setP(P);

    on('trimMode', function () { setMode(!mode); });
    on('trimGhost', function () { ghost = !ghost; this.classList.toggle('on', ghost); applyHide(); });
    on('trimOpen', openList);
    on('trimFold', function () {
      var rs = document.querySelectorAll('#trimBar .row.k'), h = !rs[0].classList.contains('hide');
      [].forEach.call(rs, function (r) { r.classList.toggle('hide', h); });
      this.textContent = h ? '곡률 열기' : '곡률 접기';
    });
    on('trimUp', function () { if (pick && pick.parentElement && pick.parentElement !== document.body) setPick(pick.parentElement, pick); });
    on('trimDn', function () { if (pick && pick._from && pick.contains(pick._from)) setPick(pick._from); else if (pick && pick.firstElementChild) setPick(pick.firstElementChild); });
    on('trimCut', function () { cut(false); });
    on('trimCutAll', function () { cut(true); });
    on('trimCancel', function () { setPick(null); });
    on('trimTCut', function () { tab(false); });
    on('trimTAdj', function () { tab(true); });
    on('trimScope', function () { scope = scope === 'all' ? 'one' : 'all'; paintAdj(); });
    on('trimAReset', resetAdj);
    [].forEach.call(document.querySelectorAll('#trimPick [data-a]'), function (b) {
      b.addEventListener('click', function (e) { e.stopPropagation(); bump(b.dataset.a, +b.dataset.d); });
    });
    on('trimClose', function () { document.getElementById('trimList').style.display = 'none'; });
    on('trimReset', function () { if (confirm('이 화면에서 뺀 것·조절한 것을 전부 되돌릴까요?')) { S.items = []; S.adj = []; applyAdj(); renderList(); } });
    on('trimCopy', copy);
    document.getElementById('trimList').addEventListener('click', function (e) {
      if (e.target === this) this.style.display = 'none';
      var b = e.target.closest('[data-i]');
      if (b) { S.items.splice(+b.dataset.i, 1); applyHide(); renderList(); }
      var j = e.target.closest('[data-j]');
      if (j) { S.adj.splice(+j.dataset.j, 1); applyAdj(); renderList(); }
    });
    var memo = document.getElementById('trimMemo');
    memo.value = S.memo || '';
    memo.addEventListener('input', function () { S.memo = memo.value; save(KEY, S); });
    applyAdj();
    if (SDEF) { [].forEach.call(document.querySelectorAll('#trimBar .row.k'), function (r) { r.classList.add('hide'); }); document.getElementById('trimFold').textContent = '곡률 열기'; }
  }
  function on(id, fn) { document.getElementById(id).addEventListener('click', function (e) { e.stopPropagation(); fn.call(this, e); }); }

  /* ---------- 빼기 모드 ---------- */
  function setMode(v) {
    mode = v;
    document.getElementById('trimMode').classList.toggle('on', v);
    document.getElementById('trimMode').textContent = v ? '✂ 고르기 켜짐' : '✂ 고르기';
    document.documentElement.classList.toggle('trim-mode', v);
    if (!v) setPick(null);
  }
  function ours(el) { return el && el.closest && el.closest('#trimUi'); }
  /* 폰: touchstart/touchend에 preventDefault를 걸면 click이 아예 안 생긴다(11/19 폰에서 빼기 안 됨).
     → 앱 쪽으로는 전파만 막고(스크롤은 살림), 고르기는 손을 뗄 때(pointerup) 직접 한다. 움직였으면 스크롤로 보고 무시 */
  function stop(e) {
    if (!mode || ours(e.target)) return;
    e.stopPropagation(); e.stopImmediatePropagation();
  }
  ['mousedown', 'mouseup', 'touchmove', 'dblclick', 'contextmenu', 'change', 'input', 'keydown'].forEach(function (t) {
    window.addEventListener(t, stop, { capture: true, passive: true });
  });
  ['submit', 'contextmenu', 'dragstart', 'selectstart'].forEach(function (t) {
    window.addEventListener(t, function (e) { if (mode && !ours(e.target)) e.preventDefault(); }, { capture: true, passive: false });
  });
  var down = null, lastPick = 0;
  window.addEventListener('pointerdown', function (e) {
    if (!mode || ours(e.target)) return;
    down = { x: e.clientX, y: e.clientY };
    e.stopPropagation(); e.stopImmediatePropagation();
  }, true);
  function pickAt(x, y) {
    var el = document.elementFromPoint(x, y);
    if (el && !ours(el) && el !== document.documentElement && el !== document.body) { setPick(el); lastPick = Date.now(); }
  }
  window.addEventListener('pointerup', function (e) {
    if (!mode || ours(e.target)) return;
    e.stopPropagation(); e.stopImmediatePropagation();
    var d = down; down = null;
    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;   // 스크롤
    pickAt(e.clientX, e.clientY);
  }, true);
  /* 폰 예비 길: touchend로도 고른다(pointerup이 안 오거나 pointercancel로 끝나는 브라우저) */
  var tdown = null;
  window.addEventListener('touchstart', function (e) {
    if (!mode || ours(e.target)) return;
    var t = e.touches[0]; tdown = t && { x: t.clientX, y: t.clientY };
    e.stopPropagation(); e.stopImmediatePropagation();
  }, { capture: true, passive: true });
  window.addEventListener('touchend', function (e) {
    if (!mode || ours(e.target)) return;
    e.stopPropagation(); e.stopImmediatePropagation();
    var t = e.changedTouches[0], d = tdown; tdown = null;
    if (!t || (d && Math.hypot(t.clientX - d.x, t.clientY - d.y) > 10)) return;
    if (Date.now() - lastPick > 400) pickAt(t.clientX, t.clientY);
  }, { capture: true, passive: true });
  window.addEventListener('click', function (e) {
    if (!mode || ours(e.target)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();   // 링크·버튼 동작 막기
    if (Date.now() - lastPick > 400) pickAt(e.clientX, e.clientY);          // pointerup이 없던 브라우저 대비
  }, true);

  function setPick(el, from) {
    pick = el;
    var box = document.getElementById('trimBox'), pp = document.getElementById('trimPick');
    if (!el) { box.style.display = 'none'; pp.style.display = 'none'; return; }
    if (from) el._from = from;
    var r = boxTo(el);
    pp.style.display = 'block';
    pp.style.bottom = (document.getElementById('trimBar').getBoundingClientRect().height + 16) + 'px';
    pp.classList.toggle('top', r.top + r.height / 2 > innerHeight * 0.45);   // 고른 것이 아래쪽이면 판을 위로
    paintAdj();
    var all = selAll(el), n = all ? safeCount(all) : 0;
    document.getElementById('trimPt').innerHTML = '“' + esc(label(el)) + '”<small>' + Math.round(r.width) + '×' + Math.round(r.height) + ' · 같은 것 ' + (n || 1) + '개</small>';
    document.getElementById('trimCutAll').style.display = all && n > 1 ? '' : 'none';
  }
  function boxTo(el) {
    var box = document.getElementById('trimBox'), r = el.getBoundingClientRect();
    box.style.display = 'block';
    box.style.left = r.left + 'px'; box.style.top = r.top + 'px';
    box.style.width = r.width + 'px'; box.style.height = r.height + 'px';
    return r;
  }
  function tab(a) {
    document.getElementById('trimPick').classList.toggle('a', a);
    document.getElementById('trimTCut').classList.toggle('on', !a);
    document.getElementById('trimTAdj').classList.toggle('on', a);
    paintAdj();
  }
  function safeCount(s) { try { return document.querySelectorAll(s).length; } catch (e) { return 0; } }
  function cut(all) {
    if (!pick) return;
    var sel = all ? selAll(pick) : selOne(pick);
    if (!sel) return;
    S.items.push({ sel: sel, tx: label(pick), all: !!all, scr: screenTx(), n: all ? safeCount(sel) : 1 });
    applyHide();
    setPick(null);
  }

  /* ---------- 목록·복사 ---------- */
  function openList() { renderList(); document.getElementById('trimList').style.display = 'block'; }
  function renderList() {
    var box = document.getElementById('trimItems');
    var adj = S.adj.filter(function (x) { return adjLine(x); });
    box.innerHTML = (S.items.length ? S.items.map(function (it, i) {
      return '<div class="it"><div class="nm">✂ ' + esc(it.tx) + '<small>' + esc(it.scr) + (it.all ? ' · 같은 것 전부(' + it.n + ')' : '') + '</small></div><button data-i="' + i + '">되살리기</button></div>';
    }).join('') : '') + adj.map(function (it) {
      return '<div class="it"><div class="nm">↕ ' + esc(it.tx) + '<small>' + esc(adjLine(it)) + (it.all ? ' · 같은 것 전부(' + it.n + ')' : '') + '</small></div><button data-j="' + S.adj.indexOf(it) + '">되돌리기</button></div>';
    }).join('') || '<p class="sub">아직 고친 것이 없습니다. 아래 \'✂ 고르기\'를 켜고 화면을 눌러 보세요.</p>';
  }
  function copy() {
    var lines = ['[VZTR 덜어내기] ' + PAGE_TX, '곡률 상자·이벤트 ' + Math.round(K * 100) + '% (큰 상자 ' + Math.round(26 * K) + 'px) · 머리·탭바·버튼 ' + (P >= 1 ? '100%(지금)' : Math.round(P * 32) + 'px'), ''];
    var t = lines.join('\n') + (fmtState(S, PAGE_TX) || '(고친 것 없음)');
    var b = document.getElementById('trimCopy');
    function ok() { b.textContent = '복사됨 ✓'; setTimeout(function () { b.textContent = '답 복사'; }, 1600); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} ta.remove(); }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 시작 ---------- */
  function start() {
    patchSheets();
    build();
    // 나중에 붙는 스타일(chars.js 이펙트 등)도 곡률 적용
    new MutationObserver(function (ms) {
      for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms[i].addedNodes.length; j++) {
        var n = ms[i].addedNodes[j];
        if (n.tagName === 'STYLE' || n.tagName === 'LINK') { setTimeout(patchSheets, 50); return; }
      }
    }).observe(document.head, { childList: true });
    window.addEventListener('scroll', function () { if (pick) boxTo(pick); }, { passive: true, capture: true });
    if (SDEF && SDEF.act) { var tries = 0, tk = setInterval(function () {   // 리뷰: 샘플 일정이 늦게 그려지는 폰 대비 — 누를 것이 생길 때까지 최대 6초
      tries++; var before = document.querySelector('#scrim:not([hidden]), #v-now:not([hidden]), #v-log:not([hidden])');
      if (before) { clearInterval(tk); return; }   // 이미 열려 있으면 또 누르지 않음(메뉴 닫힘 방지)
      try { SDEF.act(); } catch (e) {}
      if (SDEF.s === 'pass' || SDEF.s === 'detail' || tries > 20 || document.querySelector('#scrim:not([hidden]), #v-now:not([hidden]), #v-log:not([hidden])')) clearInterval(tk);
    }, 300); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
