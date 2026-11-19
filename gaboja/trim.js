/* VZTR 덜어내기 보드 (2026-11-19)
   앱 화면(start.html·index.html) 위에 얹는 도구. 앱 코드는 건드리지 않는다.
   - 곡률 바: 앱 CSS의 모서리 값(원·알약 모양 제외)에 배율을 곱한다 → 0% 직각 ~ 100% 지금 ~ 150%
   - 빼기 모드: 아무 부분이나 눌러 고르고 → 더 크게/작게로 범위 조절 → '빼기'(이것만 / 같은 것 전부)
   - 뺀 것은 CSS 선택자로 숨김 → 화면이 다시 그려져도 계속 빠짐. 목록에서 되살리기·메모·답 복사
   저장 = 이 브라우저 localStorage (페이지별) */
(function () {
  'use strict';
  var PAGE = /start/.test(location.pathname) ? 'start' : 'guide';
  var PAGE_TX = PAGE === 'start' ? '시작·질문·입력·발급' : '가이드북';
  var KEY = 'vztr-trim-' + PAGE, KKEY = 'vztr-trim-k';
  var STATE_CLS = /^(on|off|play|now|live|sel|selected|active|show|shown|open|done|hide|hidden|in|out|go|cur|past|fit|is-|has-|js-|trim-)/;
  function load(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var S = load(KEY, { items: [], memo: '' });
  var K = load(KKEY, 0.35);   // 기본 = '조금 더 직각에 가까운 둥근형' 시험값
  var P = load(KKEY + '-pill', 1);
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
    if (lab) lab.textContent = Math.round(K * 100) + '% · 상자 ' + Math.round(26 * K) + 'px';
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
    if (n) n.textContent = S.items.length;
    save(KEY, S);
  }

  /* ---------- UI ---------- */
  var CSS_UI = [
    '#trimUi,#trimUi *{box-sizing:border-box;font-family:Pretendard Variable,Pretendard,system-ui,sans-serif;letter-spacing:0;line-height:1.35;text-transform:none}',
    '#trimUi span{display:inline!important;font-size:inherit!important;line-height:inherit!important;min-height:0!important;margin:0!important}',
    '#trimUi span.kl{display:inline-block!important;font-size:11px!important}',
    '#trimUi button{min-height:0!important;height:auto!important;width:auto;flex:none}',
    '#trimBar{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:2147483600;background:#0A1F33;color:#fff;border-radius:14px;padding:8px 10px;box-shadow:0 8px 28px rgba(0,0,0,.28);font-size:13px}',
    '#trimBar .row{display:flex;align-items:center;gap:8px}',
    '#trimBar .row+.row{margin-top:6px}',
    '#trimBar button{appearance:none;border:0;border-radius:9px;padding:8px 10px;font-size:13px;font-weight:700;background:rgba(255,255,255,.12);color:#fff;white-space:nowrap}',
    '#trimBar button.on{background:#2F5BFF}',
    '#trimBar input[type=range]{flex:1;accent-color:#7C95FF;min-width:0;height:20px;margin:0;padding:0;background:none;border:0;box-shadow:none}',
    '#trimBar .kl{font-size:11px;opacity:.75;white-space:nowrap}',
    '#trimBar .k .kl:first-child{width:74px}',
    '#trimBar .k .kl:last-child{width:84px;text-align:right}',
    '#trimBar .hide{display:none}',
    '#trimPick{position:fixed;left:8px;right:8px;bottom:calc(140px + env(safe-area-inset-bottom,0px));z-index:2147483601;background:#fff;color:#0A1F33;border-radius:14px;padding:10px;box-shadow:0 8px 28px rgba(0,0,0,.3);font-size:13px;display:none}',
    '#trimPick .t{font-weight:700;margin-bottom:8px;word-break:keep-all}',
    '#trimPick .t small{display:block;font-weight:500;color:#5B6B7A;margin-top:2px}',
    '#trimPick .g{display:grid;grid-template-columns:1fr 1fr;gap:6px}',
    '#trimPick button{appearance:none;border:0;border-radius:9px;padding:10px 8px;font-size:13px;font-weight:700;background:#EEF0F3;color:#0A1F33}',
    '#trimPick button.x{background:#CF3F66;color:#fff}',
    '#trimPick button.x2{background:#fbe3ea;color:#CF3F66}',
    '#trimBox{position:fixed;z-index:2147483599;pointer-events:none;border:2px solid #CF3F66;background:rgba(207,63,102,.10);border-radius:4px;display:none;transition:all .08s}',
    '#trimList{position:fixed;inset:0;z-index:2147483602;background:rgba(10,31,51,.45);display:none}',
    '#trimList .sh{position:absolute;left:0;right:0;bottom:0;max-height:82vh;overflow:auto;background:#fff;color:#0A1F33;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px))}',
    '#trimList h3{margin:0 0 4px;font-size:17px}',
    '#trimList .sub{color:#5B6B7A;font-size:12px;margin:0 0 12px}',
    '#trimList .it{display:flex;gap:8px;align-items:center;padding:9px 0;border-top:1px solid #EEF0F3;font-size:13px}',
    '#trimList .it .nm{flex:1;min-width:0;word-break:keep-all}',
    '#trimList .it .nm small{display:block;color:#5B6B7A;font-size:11px}',
    '#trimList button{appearance:none;border:0;border-radius:9px;padding:9px 11px;font-size:13px;font-weight:700;background:#EEF0F3;color:#0A1F33;white-space:nowrap}',
    '#trimList button.p{background:#2F5BFF;color:#fff}',
    '#trimList textarea{width:100%;min-height:72px;border:1px solid #D5D9DF;border-radius:10px;padding:10px;font-size:14px;margin:10px 0}',
    '#trimList .fb{font-size:12px;color:#5B6B7A;background:#F5F6F8;border-radius:10px;padding:10px;margin-bottom:12px;line-height:1.55}',
    '#trimList .btns{display:flex;gap:8px;flex-wrap:wrap}',
    'html.trim-on body{padding-bottom:150px!important}',
    'html.trim-mode *{cursor:crosshair!important;-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}',
    '#trimVer{font-size:10px;opacity:.5;align-self:center}'
  ].join('\n');

  var FB = PAGE === 'start'
    ? '1단계 참고 — <b>6</b> 장소 고르기 왼쪽 위 글자 묶음 · <b>8</b> 발급 완료 \'넣기·정하기\'·왼쪽 아래 빈칸 · <b>전체 5</b> 위계·불필요한 것 덜어내기'
    : '1단계 참고 — <b>14</b> 맨 위 메뉴+DAY 메뉴 통합(제목·요약/상세·메뉴만) · <b>9b</b> 제목 칸 요일 반복 · <b>11</b> 시각 미정 탑승권 맨 위 · <b>13a</b> 길안내 제목·도착 칸 · <b>15</b> 주의 한 줄 · <b>16</b> 이벤트 하나면 가로 전체 · <b>17</b> 편명 정렬 · <b>전체 5</b> 덜어내기';

  function build() {
    var st = document.createElement('style'); st.id = 'trimCss'; st.textContent = CSS_UI; document.head.appendChild(st);
    hideCss = document.createElement('style'); hideCss.id = 'trimHide'; document.head.appendChild(hideCss);
    var ui = document.createElement('div'); ui.id = 'trimUi';
    ui.innerHTML =
      '<div id="trimBox"></div>' +
      '<div id="trimBar">' +
        '<div class="row k"><span class="kl">상자·이벤트</span><input id="trimK" type="range" min="0" max="150" step="5"><span class="kl" id="trimKv"></span></div>' +
        '<div class="row k"><span class="kl">머리·탭바·버튼</span><input id="trimP" type="range" min="0" max="100" step="5"><span class="kl" id="trimPv"></span></div>' +
        '<div class="row"><button id="trimMode">✂ 빼기</button><button id="trimGhost">흐리게</button><button id="trimOpen">목록 <span id="trimN">0</span></button><span id="trimVer">v3</span><button id="trimFold" style="margin-left:auto">곡률 접기</button></div>' +
      '</div>' +
      '<div id="trimPick"><div class="t" id="trimPt"></div><div class="g">' +
        '<button id="trimUp">↑ 더 큰 덩어리</button><button id="trimDn">↓ 더 작게</button>' +
        '<button class="x" id="trimCut">이것 빼기</button><button class="x2" id="trimCutAll">같은 것 전부 빼기</button>' +
      '</div><div class="g" style="margin-top:6px;grid-template-columns:1fr"><button id="trimCancel">닫기</button></div></div>' +
      '<div id="trimList"><div class="sh">' +
        '<h3>덜어내기 — ' + PAGE_TX + '</h3><p class="sub">뺀 것 목록 · 되살리기 · 메모 → 답 복사해서 아키에게 보내 주세요</p>' +
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
    on('trimClose', function () { document.getElementById('trimList').style.display = 'none'; });
    on('trimReset', function () { if (confirm('뺀 것을 전부 되살릴까요?')) { S.items = []; applyHide(); renderList(); } });
    on('trimCopy', copy);
    document.getElementById('trimList').addEventListener('click', function (e) {
      if (e.target === this) this.style.display = 'none';
      var b = e.target.closest('[data-i]');
      if (b) { S.items.splice(+b.dataset.i, 1); applyHide(); renderList(); }
    });
    var memo = document.getElementById('trimMemo');
    memo.value = S.memo || '';
    memo.addEventListener('input', function () { S.memo = memo.value; save(KEY, S); });
    applyHide();
  }
  function on(id, fn) { document.getElementById(id).addEventListener('click', function (e) { e.stopPropagation(); fn.call(this, e); }); }

  /* ---------- 빼기 모드 ---------- */
  function setMode(v) {
    mode = v;
    document.getElementById('trimMode').classList.toggle('on', v);
    document.getElementById('trimMode').textContent = v ? '✂ 빼기 켜짐' : '✂ 빼기';
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
    var r = el.getBoundingClientRect();
    box.style.display = 'block';
    box.style.left = r.left + 'px'; box.style.top = r.top + 'px';
    box.style.width = r.width + 'px'; box.style.height = r.height + 'px';
    pp.style.display = 'block';
    pp.style.bottom = (document.getElementById('trimBar').getBoundingClientRect().height + 16) + 'px';
    var all = selAll(el), n = all ? safeCount(all) : 0;
    document.getElementById('trimPt').innerHTML = '“' + esc(label(el)) + '”<small>' + Math.round(r.width) + '×' + Math.round(r.height) + ' · 같은 것 ' + (n || 1) + '개</small>';
    document.getElementById('trimCutAll').style.display = all && n > 1 ? '' : 'none';
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
    box.innerHTML = S.items.length ? S.items.map(function (it, i) {
      return '<div class="it"><div class="nm">' + esc(it.tx) + '<small>' + esc(it.scr) + (it.all ? ' · 같은 것 전부(' + it.n + ')' : '') + '</small></div><button data-i="' + i + '">되살리기</button></div>';
    }).join('') : '<p class="sub">아직 뺀 것이 없습니다. 아래 \'✂ 빼기 모드\'를 켜고 화면을 눌러 보세요.</p>';
  }
  function copy() {
    var lines = ['[VZTR 덜어내기] ' + PAGE_TX, '곡률 상자·이벤트 ' + Math.round(K * 100) + '% (큰 상자 ' + Math.round(26 * K) + 'px) · 머리·탭바·버튼 ' + (P >= 1 ? '100%(지금)' : Math.round(P * 32) + 'px'), ''];
    S.items.forEach(function (it, i) {
      lines.push((i + 1) + '. ' + it.scr + ' — “' + it.tx + '”' + (it.all ? ' (같은 것 전부 ' + it.n + ')' : ''));
      lines.push('   ' + it.sel);
    });
    if (S.memo) lines.push('', '메모: ' + S.memo);
    var t = lines.join('\n');
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
    window.addEventListener('scroll', function () { if (pick) setPick(pick); }, { passive: true, capture: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
