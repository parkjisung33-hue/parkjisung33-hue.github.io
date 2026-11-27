/* VZTR 언어 틀 (W5 1차 2026-11-20 · 11/26 다국어 여러 언어 틀) — 번역판 = 같은 파일을 언어 폴더(en/·ja/·zh-hans/·zh-hant/)에 복사(deploy_larchive.py)
   - 언어: 주소에 /en/·/ja/·/zh-hans/·/zh-hant/ 가 있으면 그 언어, 아니면 'ko' → window.VZTR_LANG · <html lang>(ja · zh-Hans · zh-Hant)
   - window.VZTR_FX = 번역판(한국어가 아님) = 방한 외국인 흐름(한국 공항 도착 등). 영어만의 글자·규칙은 VZTR_LANG === 'en'
   - 첫 방문: 고른 적 없고(localStorage 'vztr-lang') 브라우저 언어가 한국어가 아니면 그 언어 폴더로(LIVE에 없으면 영어, 자동 검수 헤드리스는 제외)
   - 전환: LIVE가 둘이면 머리에 다른 언어 이름 하나 · 셋 이상이면 지구본 → 언어 목록(그 언어 이름으로). 누르면 기억하고 같은 화면(?·#) 그대로 넘어감
   - 번역 = 한국어 문장이 키인 사전. 언어마다 파일 두 개 + 장소 이름:
       i18n-<언어>-auto.js → window.VZTR_<K>_AUTO {한국어: 번역} · window.VZTR_<K>_PLACES {장소 id: {n: 이름, short: 짧은 이름}}   (영어만 {en, short})
       i18n-<언어>.js      → window.VZTR_<K> (손 사전, 이게 이김 · '{n}'·'{x}' 틀 · 함수 틀)        K = EN · JA · ZH_HANS · ZH_HANT (B 세션 이름)
     코드는 한국어 그대로 두고 화면에 그려진 글자(글자·placeholder·aria-label·title·alt, 새로 그려지는 것도 MutationObserver)를 사전과 맞춰 바꿈
   - 사전에 없는 한국어 = 그대로 두고 VZTR_I18N.miss 에 모음 → 번역 본작업 할 일 목록 (콘솔: VZTR_I18N.list())
   - 장소 이름: 사전(VZTR_<K>_PLACES) > 영어판은 gen-data places[].en > 로마자 자동(규칙 표기, 동화 규칙 없음 — 임시) */
(function () {
  /* 언어 표 — h = <html lang> · nm = 그 언어로 쓴 이름(메뉴) · k = 사전 이름(VZTR_<k>) · join = 띄어 쓰지 않은 '·'로 이은 도시 묶음을 이을 때(영어는 '&') */
  var LANGS = { ko: { h: 'ko', nm: '한국어', k: '' }, en: { h: 'en', nm: 'English', k: 'EN' }, ja: { h: 'ja', nm: '日本語', k: 'JA', join: '・' }, 'zh-hans': { h: 'zh-Hans', nm: '简体中文', k: 'ZH_HANS', join: '、' }, 'zh-hant': { h: 'zh-Hant', nm: '繁體中文', k: 'ZH_HANT', join: '、' } };
  /* 메뉴·첫 방문 자동 이동·배포(tools/deploy_larchive.py가 이 줄을 읽어 언어 폴더를 만듦)에 나오는 언어 — 사전이 다 되면(검수 0) 여기에 더함 */
  var LIVE = ['ko', 'en', 'ja', 'zh-hans', 'zh-hant'];   // 11/27 A 일본어 + B 중국어 간체·번체 공개
  var PRE = /\/(en|ja|zh-hans|zh-hant)\//, pm = location.pathname.match(PRE);
  var L = pm ? pm[1] : window.VZTR_LANG && LANGS[window.VZTR_LANG] ? window.VZTR_LANG : 'ko', FX = L !== 'ko', EN = L === 'en', KEY = 'vztr-lang';
  window.VZTR_LANG = L; window.VZTR_FX = FX; document.documentElement.lang = LANGS[L].h;
  /* 11/23 동우님 '시스템 글꼴' 확정(시안 v2 fonts4.html 1순위): 영어판 영문 = 기기 글꼴(아이폰 SF Pro · 안드로이드는 기기 기본). 한글 원문 칸은 Pretendard 그대로. 로고 .vz(Inter Tight)는 안 바뀜 */
  /* 11/23 저녁: 아이폰·맥 = SF Pro(-apple-system·BlinkMacSystemFont는 Apple 기기만 알아들음) · 갤럭시·PC = Mona Sans(OFL, 시안 v3 fonts5.html 1순위). system-ui는 갤럭시도 알아들어 뺌. Mona는 쓰는 기기에서만 내려받음 */
  var KRF = '"VZTR KR", "Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  function enFont() { if (document.getElementById('vztr-en-font')) return; var SYS = '-apple-system, BlinkMacSystemFont, "Mona Sans", "Segoe UI", Roboto, Arial, ' + KRF;
    var mf = document.createElement('link'); mf.rel = 'stylesheet'; mf.href = 'fonts/google/mona.css?v=1';   /* 11/24 자체 호스팅 */ (document.head || document.documentElement).appendChild(mf);
    /* Mona Sans는 고정폭 숫자(tnum)의 0에 빗금 → Apple 기기가 아니면(= Mona를 쓰면) 숫자만 일반 숫자로. Apple은 SF Pro라 그대로 */
    if (!/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) document.documentElement.classList.add('vz-mona');
    var fs = document.createElement('style'); fs.id = 'vztr-en-font'; fs.textContent = 'html[lang="en"]{--kr:' + SYS + ';--kr-plain:' + SYS + ';--lat:' + SYS + ';--mono:' + SYS + '}html[lang="en"] .vzko,html[lang="en"] [lang="ko"]{font-family:' + KRF + '}html[lang="en"] .lfl .lb{display:none}html[lang="en"] #bdS{white-space:nowrap!important;overflow:hidden!important;text-overflow:clip!important;-webkit-line-clamp:unset!important}html[lang="en"] .code.k{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;word-break:normal!important;overflow-wrap:normal!important;text-wrap:balance}html[lang="en"] .pass .place.pl1{flex-wrap:wrap;white-space:normal;column-gap:.25rem;row-gap:0}html[lang="en"] .pass .place.pl1 .pn{overflow:visible;text-overflow:clip}html[lang="en"] .nmc b{font-size:.9375rem}html[lang="en"] .ticket .nm,html[lang="en"] .pass .city,html[lang="en"] .rec2 b,html[lang="en"] .tile .n.one,html[lang="en"] .li .nm .one{overflow-wrap:normal;word-break:normal}html.vz-mona[lang="en"] body,html.vz-mona[lang="en"] body *{font-variant-numeric:lining-nums proportional-nums!important}'; (document.head || document.documentElement).appendChild(fs); }
  /* 11/26 다국어 일본어·중국어: 한자·가나는 그 언어 기기 글꼴로(Pretendard엔 가나는 있고 한자가 없어 섞이면 글자 모양이 달라짐 — fontTools로 확인) · 숫자·로마자도 같은 글꼴 · 한글 원문 칸은 Pretendard 그대로 */
  var CJK = { ja: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Yu Gothic", Meiryo, "Noto Sans CJK JP", "Noto Sans JP"', 'zh-hans': '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans SC"', 'zh-hant': '"PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", "Noto Sans TC"' };
  function cjkFont(l) { l = l || L; if (!CJK[l] || document.getElementById('vztr-cjk-' + l)) return; var h = LANGS[l].h, S = CJK[l] + ', -apple-system, BlinkMacSystemFont, "Segoe UI", ' + KRF;
    var fs = document.createElement('style'); fs.id = 'vztr-cjk-' + l; fs.textContent = 'html[lang="' + h + '"]{--kr:' + S + ';--kr-plain:' + S + '}html[lang="' + h + '"] .vzko,html[lang="' + h + '"] [lang="ko"]{font-family:' + KRF + '}'
      /* 11/26 모선 품질 기준: 한국어판 keep-all은 띄어쓰기 없는 일본어·중국어를 한 덩어리로 만들어 칸 밖으로 넘침 → normal + 금칙(strict: 、。」ー 줄 앞 금지) · 한글 원문 칸만 keep-all */
      /* 11/27 B: 탑승권·버스표 장소 칸 = 영어판(enFont)과 같은 줄바꿈 규칙(이름이 '束草长…'처럼 잘리고 시각과 겹치던 것) */
      + 'html[lang="' + h + '"] .pass .place.pl1{flex-wrap:wrap;white-space:normal;column-gap:.25rem;row-gap:0}html[lang="' + h + '"] .pass .place.pl1 .pn{overflow:visible;text-overflow:clip}'
      + 'html[lang="' + h + '"] body,html[lang="' + h + '"] body *{word-break:normal!important;line-break:strict}html[lang="' + h + '"] .vzko,html[lang="' + h + '"] [lang="ko"],html[lang="' + h + '"] [lang="ko"] *{word-break:keep-all!important}'; (document.head || document.documentElement).appendChild(fs); }
  function langFont(l) { if (l === 'en') enFont(); else cjkFont(l); }
  if (FX) langFont(L);   // 11/26 밤 함수로 뺌: 첫 페이지 언어 바로 바꾸기(landing.html)가 미리 불러 둠
  var bot = navigator.webdriver || /HeadlessChrome/.test(navigator.userAgent);
  function urlFor(l) {   // 같은 화면의 그 언어 주소 (언어 폴더만 바꿈: /ja/trip ↔ /trip ↔ /en/trip)
    var p = location.pathname.replace(PRE, '/');
    if (l && l !== 'ko') { var i = p.lastIndexOf('/'); p = p.slice(0, i + 1) + l + '/' + p.slice(i + 1); }
    return p + location.search + location.hash;
  }
  function other() { return urlFor(L === 'ko' ? (LIVE[1] || 'en') : 'ko'); }   // 언어 둘일 때 = 다른 언어
  function pref() {   // 브라우저 언어 → 우리 언어 (LIVE에 있는 첫 번째, 없으면 영어)
    var ls = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'ko'];
    for (var i = 0; i < ls.length; i++) { var x = String(ls[i] || '').toLowerCase(), l = /^ko\b/.test(x) ? 'ko' : /^ja\b/.test(x) ? 'ja' : /^zh\b/.test(x) ? (/hant|-tw|-hk|-mo/.test(x) ? 'zh-hant' : 'zh-hans') : /^en\b/.test(x) ? 'en' : ''; if (l && LIVE.indexOf(l) >= 0) return l; }
    return 'en';
  }
  try {
    var saved = localStorage.getItem(KEY);
    if (L === 'ko' && !saved && !bot && /^https?:/.test(location.protocol) && /\/(index\.html|start\.html|landing\.html|trip|test|types)?$/.test(location.pathname) && pref() !== 'ko') { location.replace(urlFor(pref())); try { document.documentElement.style.visibility = 'hidden'; } catch (_) {} return; }   // 11/22 해외(영어 폰)에서 빈 화면: window.stop()이 영어판으로 넘어가는 것까지 취소했음 → 멈추지 않고 화면만 숨김
    /* 주소로 들어온 언어는 고른 것으로 치지 않음 — 버튼으로만 기억 */
  } catch (_) {}
  function go(l) { l = l && LANGS[l] ? l : L === 'ko' ? (LIVE[1] || 'en') : 'ko'; try { localStorage.setItem(KEY, l); } catch (_) {} location.href = urlFor(l); }
  /* 코드 속 글자 고르기: 한국어판 = ko · 영어판 = en(이미 써 둔 영어) · 그 밖 = 한국어를 사전으로 옮김 (예: VZTR_I18N.tx('친구', 'Friend')) */
  function tx(ko, en) { return L === 'ko' ? ko : L === 'en' && en != null ? en : API.t(ko); }
  /* 틀 문장 + 끼울 말: fmt('내 여행 유형은 {x}, 너는?', { x: 이름 }, 영어) — 사전의 같은 키(틀 그대로)를 쓰고 {x}에 끼움(끼울 말은 이미 옮긴 것). 사전에 없으면 한국어 틀 */
  function fmt(k, o, en) { var v = L === 'ko' ? k : L === 'en' && en != null ? en : API.raw(k); if (typeof v !== 'string') v = k; return v.replace(/\{(\w+)\}/g, function (_, n) { return o && o[n] != null ? o[n] : ''; }); }

  var API = window.VZTR_I18N = { lang: L, fx: FX, en: EN, html: LANGS[L].h, langs: LANGS, live: LIVE, dir: FX ? L + '/' : '', url: urlFor, other: other, go: go, tx: tx, fmt: fmt, raw: function (k) { return k; }, enFont: enFont, cjkFont: cjkFont, langFont: langFont, pref: pref, miss: new Map(), log: /[?&]vzlog=1/.test(location.search) ? {} : null, list: function () { return Array.from(API.miss.keys()); } };
  window.T = API.t = function (s) { return s; };   // 코드에서 쓰는 번역(한국어판 = 그대로)

  /* 머리 언어 전환 — start.html: header.bar 오른쪽 / index.html: 맨 위 상자(.pill) 메뉴 옆 */
  var CSS = '.vzlang{all:unset;box-sizing:border-box;cursor:pointer;flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;-webkit-tap-highlight-color:transparent}'   /* 누르는 칸 44px, 보이는 알약은 .vzp 34px (2026-11-22 ① 지구본+EN/KO) */
    + '.vzp{display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 11px 0 9px;border-radius:999px;background:#ECECEF;box-shadow:none;font-family:inherit;font-size:12.5px;font-weight:700;line-height:1;letter-spacing:.03em;color:var(--ink,#16171A);white-space:nowrap}'
    + '.pill .ttl b.vzwrap,.hbox .pill .ttl b.vzwrap{white-space:normal!important;overflow:visible!important;overflow-wrap:normal!important;word-break:keep-all!important;font-size:.875rem!important;line-height:1.2!important}'
    + '.vzlang.vzic .vzt{display:none}.vzlang.vzic .vzp{padding:0 9px;gap:0}'
    + '.vzp svg{width:15px;height:15px;flex:none;stroke:currentColor;fill:none;stroke-width:1.8}'
    + '.vzlang:hover .vzp{background:#E2E2E6}:root[data-theme="dark"] .vzp{background:rgba(255,255,255,.1);color:#F2F1F7}:root[data-theme="dark"] .vzlang:hover .vzp{background:rgba(255,255,255,.16)}.vzp svg.cv{width:10px;height:10px;stroke-width:2.6;opacity:.55;margin-left:1px}.vzlang.vzic .vzp svg.cv{display:none}.vzlang:focus-visible{outline:2px solid var(--blue,#2F55D4);outline-offset:-2px;border-radius:999px}'
    + 'header.bar.vzl{grid-template-columns:2.75rem minmax(0,1fr) auto auto}'
    + 'html.introfit header.bar.vzl{display:grid;position:absolute;top:env(safe-area-inset-top,0px);left:0;right:0;background:none;padding:.5rem 1rem 0;pointer-events:none}html.introfit header.bar.vzl>*{visibility:hidden}html.introfit header.bar.vzl .vzlang{visibility:visible;pointer-events:auto}'   // 첫 화면은 위 막대가 없음 → 언어만 오른쪽 위에
    + '.vzko{display:block;font-size:.8125rem;font-weight:500;color:var(--sub,#6B6E76);letter-spacing:0}';
  var rf = 0, rfT = null; function refit() { if (rf || typeof window.fitTitle !== 'function') return; rf = requestAnimationFrame(function () { rf = 0; try { window.fitTitle(); var b = document.querySelector('.pill .ttl b'), l = document.querySelector('.pill .vzlang'); if (b) { var bad = function () { return b.scrollWidth > b.clientWidth + 1; }; b.classList.remove('vzwrap'); if (l) l.classList.remove('vzic'); if (b.dataset.vzs && b.textContent === b.dataset.vzs) { b.textContent = b.dataset.vzf; window.fitTitle(); } if (bad() && l) { l.classList.add('vzic'); window.fitTitle(); } if (bad()) { var f = b.textContent, m = f.match(/^(?:\d+ days? in |Day trip (?:to |· )?)(.+)$/) || f.match(/^(.+?),? (?:day trip|\d+ nights?.*)$/i) || f.match(/^(.+?) (?:\d+박 \d+일|당일치기)$/); if (m) { b.dataset.vzf = f; b.dataset.vzs = m[1]; b.title = f; b.textContent = m[1]; window.fitTitle(); } } if (FX && bad()) { var full = b.dataset.vzf || b.textContent, pt = b.textContent.split(/, | & |・|、/); if (pt.length > 1) { b.dataset.vzf = full; b.dataset.vzs = pt[0] + ' +' + (pt.length - 1); b.title = full; b.textContent = b.dataset.vzs; window.fitTitle(); } } /* 11/25 Verdana 긴 이름: 도시가 여럿이면 첫 도시 + 개수 */ if (bad()) { var k0 = parseFloat(b.style.getPropertyValue('--tk')) || 1; b.style.setProperty('--tk', Math.max(0.5, k0 * (b.clientWidth - 2) / b.scrollWidth).toFixed(3)); }   /* 11/22: 두 줄 금지 — 아주 좁은 폰(320)은 글자를 조금 더 줄이고(최소 0.5배), 그래도 넘치면 말줄임(…) */
    b.style.textOverflow = 'ellipsis'; b.style.overflow = 'hidden'; b.style.whiteSpace = 'nowrap'; rfT = b.textContent; } } catch (_) {} }); }   // 머리 제목 맞춤 = 버튼이 붙거나 제목이 번역된 뒤 다시
  window.VZTR_REFIT = function () { rfT = null; refit(); };   // F-03: 탭이 바뀌어 제목 칸 넓이가 달라지면 다시 맞춤
  /* 11/27 언어 선택(동우님 '여러 언어 중 고르는 심플하고 편한 토글') — 레퍼런스(W3C i18n · GOV.UK language navigation · USWDS select-a-language · Smashing 2022 · Airbnb·Notion 도움말) + VZTR UI 규칙 v1
     - 버튼 = 연회색 알약(#ECECEF) · 지구본 + 지금 언어 자기 이름 + ⌄ (국기·'EN' 코드 X)
     - 목록 = 폰(폭 < 760) 아래에서 올라오는 시트 · PC 버튼 아래 작은 목록. 순서 고정(어느 언어로 보든 같음)
     - 줄 = 그 언어 자기 이름(lang 속성) + 회색으로 지금 화면 언어의 이름(W3C 'čeština (Czech)' 방식) · 고른 언어 = 검정 채움 한 가지(UI 규칙 '선택 효과 하나', 체크 X) · 줄 높이 48
     - Esc·바깥 누르면 닫힘 · 닫으면 버튼으로 초점 · 고르면 같은 화면 그대로 그 언어로 */
  var NAMES = {   // 줄 아래 회색 이름 = 지금 화면 언어로 쓴 그 언어 이름 (자기 이름과 같으면 안 씀)
    ko: { ko: '한국어', en: '영어', ja: '일본어', 'zh-hans': '중국어 간체', 'zh-hant': '중국어 번체' },
    en: { ko: 'Korean', en: 'English', ja: 'Japanese', 'zh-hans': 'Chinese (Simplified)', 'zh-hant': 'Chinese (Traditional)' },
    ja: { ko: '韓国語', en: '英語', ja: '日本語', 'zh-hans': '中国語（簡体字）', 'zh-hant': '中国語（繁体字）' },
    'zh-hans': { ko: '韩语', en: '英语', ja: '日语', 'zh-hans': '简体中文', 'zh-hant': '繁体中文' },
    'zh-hant': { ko: '韓語', en: '英語', ja: '日語', 'zh-hans': '簡體中文', 'zh-hant': '繁體中文' } };
  var TITLE = { ko: '언어', en: 'Language', ja: '言語', 'zh-hans': '语言', 'zh-hant': '語言' };
  var UIF = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Hiragino Sans","Yu Gothic UI","PingFang SC","Microsoft YaHei",' + KRF;
  var MCSS = '.vzmenu{position:fixed;z-index:2147483647;box-sizing:border-box;margin:0;padding:6px;background:#fff;color:#16171A;font:600 15px/1.25 ' + UIF + ';-webkit-font-smoothing:antialiased}'
    + '.vzmenu.vzpop{min-width:13.5rem;max-width:calc(100vw - 24px);border-radius:16px;box-shadow:0 12px 32px rgba(22,23,26,.16),0 0 0 1px rgba(22,23,26,.08)}'
    + '.vzmenu.vzsheet{left:0;right:0;bottom:0;border-radius:20px 20px 0 0;padding:8px 12px calc(16px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 32px rgba(22,23,26,.18);transform:translateY(100%);transition:transform .24s cubic-bezier(.2,.8,.2,1)}'
    + '.vzmenu.vzsheet.on{transform:none}.vzmenu .grab{width:36px;height:4px;border-radius:2px;background:#D6D7DB;margin:2px auto 10px}'
    + '.vzmenu h2{margin:0 4px 8px;font-size:13px;font-weight:600;color:#6B6E75;letter-spacing:0}'
    + '.vzmenu a{display:flex;flex-direction:column;justify-content:center;gap:1px;min-height:48px;padding:6px 14px;border-radius:12px;color:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}'
    + '.vzmenu a + a{margin-top:2px}.vzmenu a b{font-weight:700;font-size:15px}.vzmenu a small{font-size:12px;font-weight:500;color:#6B6E75}'
    + '.vzmenu a:hover,.vzmenu a:focus-visible{background:#ECECEF;outline:none}'
    + '.vzmenu a[aria-current],.vzmenu a[aria-current]:hover{background:#16171A;color:#fff}.vzmenu a[aria-current] small{color:rgba(255,255,255,.72)}'
    + '.vzmenu a:focus-visible{box-shadow:0 0 0 2px #2F55D4}'
    + '.vzscrim{position:fixed;inset:0;z-index:2147483646;background:rgba(10,11,14,.32);opacity:0;transition:opacity .2s}.vzscrim.on{opacity:1}'
    + ':root[data-theme="dark"] .vzmenu{background:#1F1D26;color:#F2F1F7}:root[data-theme="dark"] .vzmenu.vzpop{box-shadow:0 12px 32px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.1)}:root[data-theme="dark"] .vzmenu h2,:root[data-theme="dark"] .vzmenu a small{color:#A3A6AD}:root[data-theme="dark"] .vzmenu .grab{background:#3A3844}'
    + ':root[data-theme="dark"] .vzmenu a:hover,:root[data-theme="dark"] .vzmenu a:focus-visible{background:rgba(255,255,255,.08)}:root[data-theme="dark"] .vzmenu a[aria-current]{background:#F2F1F7;color:#16171A}:root[data-theme="dark"] .vzmenu a[aria-current] small{color:#6B6E75}'
    + '@media (prefers-reduced-motion:reduce){.vzmenu.vzsheet,.vzscrim{transition:none}}';
  var menuEl = null, scrimEl = null, menuOff = null, menuAnchor = null;
  function closeMenu(refocus) { if (!menuEl) return; var m = menuEl, sc = scrimEl; menuEl = scrimEl = null; if (menuOff) menuOff(); menuOff = null;
    if (m.classList.contains('vzsheet')) { m.classList.remove('on'); if (sc) sc.classList.remove('on'); setTimeout(function () { m.remove(); if (sc) sc.remove(); }, 240); } else m.remove();
    if (refocus && menuAnchor && menuAnchor.focus) menuAnchor.focus({ preventScroll: true }); }
  function openMenu(anchor, cur, onPick) {
    if (menuEl) { closeMenu(); return; }
    menuAnchor = anchor;
    if (!document.getElementById('vztr-menu-css')) { var s = document.createElement('style'); s.id = 'vztr-menu-css'; s.textContent = MCSS; document.head.appendChild(s); }
    var ui = LANGS[cur] ? cur : L, sheet = innerWidth < 760, nm = NAMES[ui] || NAMES.en;
    var m = menuEl = document.createElement('div'); m.className = 'vzmenu ' + (sheet ? 'vzsheet' : 'vzpop');   /* 가이드북에 .sheet(z-index 21) 클래스가 따로 있어 이름을 겹치지 않게 */ m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', TITLE[ui] || 'Language'); m.setAttribute('data-noi18n', ''); m.lang = LANGS[ui].h;
    m.innerHTML = (sheet ? '<div class="grab" aria-hidden="true"></div><h2>' + (TITLE[ui] || 'Language') + '</h2>' : '')
      + '<nav aria-label="' + (TITLE[ui] || 'Language') + '">' + LIVE.map(function (l) { var sub = nm[l] && nm[l] !== LANGS[l].nm ? '<small>' + nm[l] + '</small>' : '';
        return '<a href="' + urlFor(l) + '" data-l="' + l + '" hreflang="' + LANGS[l].h + '"' + (l === cur ? ' aria-current="true"' : '') + '><b lang="' + LANGS[l].h + '">' + LANGS[l].nm + '</b>' + sub + '</a>'; }).join('') + '</nav>';
    if (sheet) { var sc = scrimEl = document.createElement('div'); sc.className = 'vzscrim'; sc.setAttribute('data-noi18n', ''); document.body.appendChild(sc); sc.addEventListener('click', function () { closeMenu(true); }); }
    document.body.appendChild(m);
    if (sheet) { void m.offsetHeight; setTimeout(function () { if (m.isConnected) { m.classList.add('on'); if (scrimEl) scrimEl.classList.add('on'); } }, 16); }
    else { var r = anchor.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
      if (!r.width && !r.height) r = { left: innerWidth - 12, right: innerWidth - 12, top: 12, bottom: 12 };   // 버튼이 안 보이는 자리(가려진 머리)면 오른쪽 위
      var x = Math.min(Math.max(12, r.right - mw), innerWidth - mw - 12), y = r.bottom + 8 + mh > innerHeight - 8 ? r.top - 8 - mh : r.bottom + 8;
      m.style.left = x + 'px'; m.style.top = Math.max(8, y) + 'px'; }
    m.addEventListener('click', function (e) { var a = e.target.closest('a[data-l]'); if (!a) return; e.preventDefault(); e.stopPropagation(); var l = a.dataset.l; closeMenu(l === cur); if (l !== cur) (onPick || go)(l); });
    var outside = function (e) { if (menuEl && !menuEl.contains(e.target) && !anchor.contains(e.target) && !(scrimEl && scrimEl === e.target)) closeMenu(); },
      key = function (e) { if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); } else if (e.key === 'Tab' && menuEl) { var f = [].slice.call(menuEl.querySelectorAll('a')), a0 = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a0) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a0.focus(); } } },
      w0 = innerWidth, rs = function () { if (innerWidth !== w0) closeMenu(); };   // 폰 주소창이 숨거나 나올 때(높이만 바뀜)는 안 닫음
    setTimeout(function () { document.addEventListener('pointerdown', outside, true); }, 0); document.addEventListener('keydown', key); addEventListener('resize', rs);
    menuOff = function () { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', key); removeEventListener('resize', rs); };
    var fc = m.querySelector('[aria-current]') || m.querySelector('a'); if (fc) fc.focus({ preventScroll: true });
  }
  API.menu = openMenu; API.closeMenu = closeMenu;
  var MANY = LIVE.length > 2, GLOBE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>';
  function mount() {
    if (document.querySelector('.vzlang') || !/\/(index\.html|start\.html|trip|test|types)?$/.test(location.pathname)) return;   // 리뷰 #9: 덜어내기 보드 등엔 번역판이 없음
    var to = L === 'ko' ? (LIVE[1] || 'en') : 'ko';   // 언어 둘일 때 바꿀 언어
    var b = document.createElement('a'); b.className = 'vzlang'; b.href = MANY ? urlFor(L) : other(); b.setAttribute('data-noi18n', '');
    /* 11/23 impeccable E7: 바꿀 언어를 그 언어 이름으로(W3C·GOV.UK) — 'KO'는 지금 언어처럼 읽힘 · 한국어판 가이드북 머리는 자리가 좁아 EN 유지
       11/26 다국어 언어 셋 이상: 지구본 + 지금 언어 이름 → 누르면 목록 */
    var bt = MANY ? LANGS[L].nm : to === 'ko' ? '한국어' : document.querySelector('header.bar') ? LANGS[to].nm : to.toUpperCase().slice(0, 2);
    b.innerHTML = '<span class="vzp">' + GLOBE + '<span class="vzt" lang="' + LANGS[MANY ? L : to].h + '">' + bt + '</span>' + (MANY ? '<svg class="cv" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>' : '') + '</span>';
    b.setAttribute('aria-label', MANY ? 'Language · 언어' : L === 'ko' ? '영어로 보기' : 'View in Korean'); if (!MANY) { b.lang = LANGS[to].h; b.setAttribute('hreflang', b.lang); } else { b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('role', 'button'); }
    b.onclick = function (e) { e.preventDefault(); if (MANY) openMenu(b, L); else go(to); };
    var bar = document.querySelector('header.bar'), pill = document.querySelector('.top .pill');
    if (bar) { bar.classList.add('vzl'); bar.appendChild(b); }
    else if (pill && document.getElementById('drawer')) {   /* 11/23 동우님(보드 답 E7): 가이드북은 머리 대신 왼쪽 메뉴 '설정' 안에 한 줄 — 머리가 깔끔해지고 제목 칸이 넓어짐 */
      var dr = document.getElementById('drawer'), th = dr.querySelector('.themes');
      b.className = 'vzrow'; b.setAttribute('data-m', 'lang');
      if (MANY) b.innerHTML = GLOBE + '<span>Language · ' + LANGS[L].nm + '</span>';   // 언어 줄은 어느 언어로 보든 알아보게 'Language' + 지금 언어
      else { b.setAttribute('lang', LANGS[to].h); b.innerHTML = GLOBE + '<span>' + (L === 'ko' ? 'View in English' : '한국어로 보기') + '</span>'; }
      b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); if (MANY) openMenu(b, L); else go(to); };
      if (th && th.nextSibling) dr.insertBefore(b, th.nextSibling); else dr.appendChild(b);
      addEventListener('hashchange', function () { b.href = MANY ? urlFor(L) : other(); });
      refit(); addEventListener('resize', refit); return;   // 제목 맞춤(영어판 'N days in X' → 'X')은 그대로
    }
    else if (pill) { var m = pill.querySelector('#modeSeg'); pill.insertBefore(b, m || null); }
    else return;
    addEventListener('hashchange', function () { b.href = MANY ? urlFor(L) : other(); });
    refit(); addEventListener('resize', refit);   // 11/22 폭이 바뀌면(회전 등) 제목 다시 맞춤
  }
  var st = document.createElement('style'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  if (!FX) return;

  /* ===== 번역판: 사전 (언어마다 VZTR_<K>_AUTO < VZTR_<K> 손 사전) ===== */
  var K = LANGS[L].k, AUTO = window['VZTR_' + K + '_AUTO'] || {}, PLC = window['VZTR_' + K + '_PLACES'] || {}, NMAX = EN ? 20 : 12;   // 화면 이름 = 이 글자 수 넘으면 짧은 이름
  var HAN = /[가-힣]/, D = Object.create(null), PAT = [], PATS = [], PATS2 = [], MAN = window['VZTR_' + K] || {};
  API.raw = function (k) { var v = MAN[k] != null ? MAN[k] : AUTO[k]; if (v == null) { if (HAN.test(k)) API.miss.set(k, (API.miss.get(k) || 0) + 1); return k; } return v; };   // 틀 그대로 찾기(fmt) — 없으면 빠진 목록에
  function load() {
    var src = Object.assign({}, AUTO, MAN);   // 자동 번역(i18n-<언어>-auto.js) 위에 손 사전(i18n-<언어>.js)이 이김
    Object.keys(src).forEach(function (k) {
      if (/\{\w+\}/.test(k) && typeof src[k] === 'function') {   // 틀: '{n}박 {m}일' → /^(\d+)박 (\d+)일$/
        var names = [], re = new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{(\w+)\\?\}/g, function (_, n) { names.push(n); return /^[nmd]$/.test(n) ?'(\\d+)' : '(.+?)'; }) + '$');
        PAT.push([re, names, src[k]]);
      } else if (/\{\w+\}/.test(k)) PATS.push(k); else D[k] = src[k];
    });
  }
  load();
  PATS.forEach(function (k) { var names = [], src = Object.assign({}, AUTO, MAN), re = new RegExp('^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{(\w+)\\?\}/g, function (_, n) { names.push(n); return /^[nmd]$/.test(n) ? '(\\d+)' : '(.+?)'; }) + '$'); PATS2.push([re, names, src[k]]); });   // 문자열 틀 = 마지막에
  /* 장소 이름 → 번역 (gen-data가 있는 화면에서 처음 쓸 때 한 번) */
  var placesDone = false;
  function places() {
    if (placesDone || !window.GABOJA_DATA) return; placesDone = true;
    var P = window.GABOJA_DATA.places || {};
    var names = [];
    var EPL = PLC;
    Object.keys(P).forEach(function (id) { var p = P[id]; if (!p || !HAN.test(p.n)) return; var x = EPL[id], e = x && (x.en || x.n) || (!EN && p.l && !HAN.test(p.l) ? p.l : '') || API.placeEn(p),   /* 11/27 최종 검수: 일·중판 사전에 없는 일본 장소 = 현지 이름(黒門市場 등) — 한국어 로마자로 떨어지던 것 */ lim = !EN && e && /^[\x00-\x7F]+$/.test(e) ? 20 : NMAX, sh = x && x.short && x.short.length <= lim ? x.short : e; if (e) { if (!(p.n in MAN)) D[p.n] = e.length > lim ? sh : e;   /* 11/27 B: 일·중판에서 공식 이름이 없어 영어 이름을 쓰는 곳 = 라틴 글자만이면 영어판처럼 20자 한도 */ if (p.sh && p.sh !== p.n && !(p.sh in MAN)) D[p.sh] = sh; /* 화면 = 20자 넘으면 짧은 이름(V-28 한 줄) */ names.push(p.n); if (p.sh && p.sh !== p.n) names.push(p.sh); } });
    names = names.filter(function (n) { return n.length >= 3; })   /* 리뷰 #7: 2글자('서면')는 다른 낱말 안에서도 걸려서 '@'로 안 바꿈 */.sort(function (a, b) { return b.length - a.length; });
    if (names.length) PN = new RegExp(names.map(function (n) { return n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g');
  }
  var PN = null;
  API.placeEn = API.placeName = function (p) { places(); return p && ((EN && p.en) || (placesDone && D[p.n] && !HAN.test(D[p.n]) ? D[p.n] : HAN.test(p.n) ? roman(p.n) : '')); };   // 번역 이름 = 장소 사전(i18n-<언어>-auto.js VZTR_<K>_PLACES) > (영어판) gen-data 공식 영어 > 로마자 자동. 이름(placeEn)은 예전 그대로 둠
  function tr(s, quiet) {
    var t = s.trim(); if (!t || !HAN.test(t)) return null;
    places();
    var r = null;
    var lm = t.match(/^(·\s+)([\s\S]+)$/); if (lm && HAN.test(lm[2])) { var q0 = tr(lm[2], true); if (q0 != null) r = lm[1] + String(q0).trim(); }   /* 11/27 최종 검수: 앞에 붙은 구분점 '· …로 유명해요'를 함수 틀이 통째로 잡아 '以· …闻名'이 되던 것 → 점 떼고 옮겨 다시 붙임 */
    if (r == null) for (var i = 0; i < PAT.length; i++) { var m = t.match(PAT[i][0]); if (m) { try { r = PAT[i][2].apply(null, m.slice(1)); } catch (_) { r = null; } if (r != null) break; } }   // 함수 틀 먼저(모르는 말이면 null → 다음)
    var KK = null; if (r == null) { r = D[t]; if (r != null) KK = t; }
    if (r == null && /\d/.test(t)) {   // 숫자만 다른 문장 = 키에서 숫자를 '#'로 (예 '강수확률 #%' → 'Rain #%'), 값의 '#'에 같은 순서로 다시 넣음
      var nums = t.match(/\d+/g), v0 = D[t.replace(/\d+/g, '#')];
      if (v0 != null) { KK = t.replace(/\d+/g, '#'); var q = 0; r = String(v0).replace(/#/g, function () { return nums[q++] || ''; }); }
    }
    if (r == null && PN) {   // 장소 이름이 들어간 문장 = 이름을 '@'로 (예 '‘@’ 근처 인기 장소'), 값의 '@'에 영어 이름
      var got = []; var t2 = t.replace(PN, function (w) { got.push(D[w] || w); return '@'; }).replace(/\d+/g, '#');
      var nums2 = t.replace(PN, '@').match(/\d+/g) || [], v1 = got.length ? D[t2] : null;
      if (v1 != null) { KK = t2; var a = 0, b = 0; r = String(v1).replace(/@/g, function () { return got[a++] || ''; }).replace(/#/g, function () { return nums2[b++] || ''; }); }
    }
    if (r == null) for (var i2 = 0; i2 < PATS2.length; i2++) { var m2 = t.match(PATS2[i2][0]); if (!m2) continue; var g = m2.slice(1).map(function (v) { return HAN.test(v) ? (tr(v, true) || dotJoin(v) || v).trim() : v; }); if (g.some(function (v) { return HAN.test(v); })) continue; r = PATS2[i2][2]; PATS2[i2][1].forEach(function (n, j) { r = r.replace('{' + n + '}', function () { return g[j]; }); }); break; }   // 리뷰 #2
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
    if (API.log && KK) API.log[KK] = D[KK];   /* 11/24 검수용: 화면에 실제로 쓰인 사전 키 모으기(qa_lines --harvest) */
    return s.replace(t, function () { return r; });   // r 안의 '$' 글자가 치환 기호로 읽히지 않게
  }
  /* 11/23 impeccable E1: 띄어쓰지 않은 '·'로 이은 도시 묶음('오사카·고베')은 조각마다 옮겨 영어식으로 이음 → 'Osaka & Kobe' · 'Osaka, Kyoto & Nara' (영어엔 가운뎃점을 안 씀) */
  function dotJoin(v) { if (v.indexOf('·') < 0 || /\s·|·\s/.test(v)) return null; var ps = v.split('·').map(function (x) { return HAN.test(x) ? tr(x, true) : x; }); if (ps.some(function (x) { return x == null || HAN.test(x); })) return null; ps = ps.map(function (x) { return x.trim(); }); if (LANGS[L].join) return ps.join(LANGS[L].join); return ps.length < 3 ? ps.join(' & ') : ps.slice(0, -1).join(', ') + ' & ' + ps[ps.length - 1]; }
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
  API.node = function (el) { if (FX && el) node(el); };   // 11/22 그 자리에서 바로 번역(한 줄 맞추기 swFit이 영어 폭으로 재게)
  var lastT = ''; function title() { if (document.title === lastT) return; var r = tr(document.title); if (r != null) { lastT = r; document.title = r; } }
  /* 11/23 영어판: 발급 완료 탑승권 도시 이름(.pass .city · .ticket .nm)이 'Osaka·Kyot/o'처럼 단어 중간에서 끊기던 것 → 끊지 않고, 넘치면 글자를 줄여 한 줄에(최소 20px) · 장소 추가 목록 이름 'Cheonggyecheo/n'도(최소 11px) */
  var nmR = 0; function fitNm() { if (nmR) return; nmR = requestAnimationFrame(function () { nmR = 0; [['.ticket .nm, .pass .city', 20], ['.rec2 b, .tile .n.one, .li .nm .one', 11], ['.pass .route .code', 14]].forEach(function (q) { var es = document.querySelectorAll(q[0]); for (var i = 0; i < es.length; i++) { var e = es[i]; if (!e.clientWidth) continue; var k = e.textContent + '|' + e.clientWidth; if (e._vzf === k) continue; e._vzf = k; e.style.removeProperty('font-size'); var fs = parseFloat(getComputedStyle(e).fontSize); while (e.scrollWidth > e.clientWidth + 1 && fs > q[1]) { fs -= 0.5; e.style.setProperty('font-size', fs + 'px', 'important'); } } }); }); }
  function start() {
    node(document.body); title(); fitNm(); addEventListener('resize', fitNm); try { document.fonts.ready.then(fitNm); } catch (_) {}
    new MutationObserver(function (ms) {
      fitNm();
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

/* 11/24 동우님 '두 줄 금지': 한 줄이어야 하는 칸 = 줄바꿈 없이(nowrap), 넘치면 글자를 0.5px씩 줄임(최소 11px, 칸에 data-one="12"면 그 값)
   한국어·영어 두 판 공통(이 파일은 두 판 다 불러옴). 칸 목록 = ONE_SEL — 새 한 줄 칸이 생기면 여기에 더하고 tools/qa_lines.py ONE에도 */
(function () {
  var ONE_SEL = ['#likeC button', '#avoidC button', '.rlist button.nm', '#bdS', '#rxT', '.swhd h1', '.li .nm .one', '.rhy .rr > span:last-child', '.one:not(.n):not(#sheetTitle)', '.hrow .eyebrow', '.agree b', 'h1.city', '.hero h1', '#cT', '#bdT', '.nowacts + .acts .btn.ghost', '#warn .nt', '.facts span', '.rhy .rr .tm', '.ticks div > span:last-child', '.dayline h2', '.agree .pv li > span', '.bsteps li > span', '.mvp', '.sub2', '.chips .chip', '.tbdrow > span', /* 11/25 Verdana 긴 이름 */ '.hero-chips span', '.gchip', '.tnm', '.ttbl .k', '.ttbl dt', '[data-one]', /* 11/26 영어 긴 유형 이름(Photo Perfectionist) */ '.rx .near b', /* 11/27 최종 검수: 승차권 칸 'KTX-Eum 752'(중국어 글꼴 라틴 폭) 말줄임 대신 줄임 */ '.pass .fld b'];
  var t = 0;
  function run() {
    t = 0;
    var MINS = { '#bdS': 10.5, '#rxT': 16, '.swhd h1': 20, '.li .nm .one': 12, '.tt > span.one': 10, /* 11/25 Verdana 긴 이름 */ '.pass h1.city': 20, 'h1.city': 20, '.hero h1': 24, '.dayline h2': 16, '#cT': 18 };   // 큰 제목은 너무 작아지지 않게 칸별 최소
    document.querySelectorAll(ONE_SEL.join(',')).forEach(function (e) {
      if (!e.offsetWidth || !e.clientWidth) return;   // 인라인 칸(clientWidth 0)은 잴 수 없음 → 건너뜀
      if (e.matches('.dayline h2, #sheet h3#sheetTitle, #v-log .ttl2.one, .drawer #typeNm')) return;   // 11/25 이 칸들은 index.html fitLines가 맡음(CSS !important라 여기서 넣는 글자 크기가 안 먹고 둘이 다툼)
      e.style.fontSize = ''; e.style.whiteSpace = 'nowrap';
      if (e.dataset.sh && e.dataset.fw !== String(e.clientWidth)) { if (!e.dataset.full) e.dataset.full = e.textContent; e.dataset.fw = String(e.clientWidth); if (e.textContent !== e.dataset.full) e.textContent = e.dataset.full; if (e.scrollWidth > e.clientWidth + 1) e.textContent = e.dataset.sh; }   // 넘치면 짧은 이름 먼저(폭이 바뀔 때만 다시 정함 — 글자 바꾸기가 다시 부르는 고리 막기)
      var fs = parseFloat(getComputedStyle(e).fontSize), mn = parseFloat(e.dataset.one) || 11, n = 0; for (var k in MINS) if (e.matches(k)) mn = MINS[k];
      while (e.scrollWidth > e.clientWidth + 1 && fs > mn && n++ < 40) { fs -= 0.5; e.style.fontSize = fs + 'px'; }
      if (e.scrollWidth > e.clientWidth + 1) e.style.whiteSpace = 'normal';   // 11/25 동우님 폰: 최소 글자로도 안 들어가면 칸 밖으로 넘치지 않게 줄바꿈(넘침 < 두 줄)
    });
  }
  function q() { if (!t) t = requestAnimationFrame(run); }
  window.VZTR_ONE = { run: q, add: function (s) { ONE_SEL.push(s); q(); } };
  function go() { new MutationObserver(q).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'aria-pressed', 'open'] });   /* 숨겨 둔 탭이 보일 때도 다시 잼 */ addEventListener('resize', q); try { document.fonts.ready.then(q); } catch (_) {} q(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
