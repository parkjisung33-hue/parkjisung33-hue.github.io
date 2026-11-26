/* 11/26 vztr.app 이전 — 페이지 맨 처음에 실행.
   옛 주소(larchive.page/gaboja/…)·www.vztr.app으로 오면: 이 기기의 VZTR 저장값(일정·유형 등)을 주소 뒤(#)에 담아 vztr.app 같은 화면으로 바로 넘김.
   새 주소(vztr.app)에서: #mig= 로 온 값을 저장(이미 있는 값은 안 덮음)한 뒤 원래 # 주소로 되돌림.
   localStorage는 주소(origin)가 바뀌면 안 따라와서 필요(MDN Web Storage). 서버 저장 링크(#g=)는 영향 없음. */
(function () {
  var KEYS = /^(gaboja|vztr)-(?!wx)/, NEW = 'https://vztr.app';
  /* 11/26 밤 깔끔한 주소: 파일 이름 → 주소 (Worker PAGES와 같은 표). 옛 주소 폴더만(/gaboja/·/gaboja/en/·/gaboja/ja/…)은 예전처럼 가이드북 = trip */
  var NM = { 'index.html': 'trip', 'start.html': 'test', 'landing.html': '', 'privacy.html': 'privacy', 'terms.html': 'terms' };
  function clean(p, dirIsTrip) { var m = p.match(/^(\/(?:(?:en|ja|zh-hans|zh-hant)\/)?)([a-z_0-9]*\.html)?$/);   /* 11/26 다국어: 언어 폴더 = i18n.js LANGS · worker.js LANG_RE */ if (!m) return p; if (!m[2]) return dirIsTrip ? m[1] + 'trip' : p; return m[2] in NM && NM.hasOwnProperty(m[2]) ? m[1] + NM[m[2]] : p; }
  try {
    /* 11/26 작업용 기기 표시: 아무 페이지나 ?dev=1 로 한 번 열면 이 기기는 구글 유료 호출 안 함(앱이 &dev=1), ?dev=0 이면 해제. 다른 화면으로 넘어가기 전에 먼저 저장 */
    if (/[?&]dev=1(&|$)/.test(location.search)) localStorage.setItem('vztr-dev', '1');
    if (/[?&]dev=0(&|$)/.test(location.search)) localStorage.removeItem('vztr-dev');
    var old = /^(www\.)?larchive\.page$/.test(location.hostname) && location.pathname.indexOf('/gaboja/') === 0, www = location.hostname === 'www.vztr.app';
    if (old || www) {
      var d = {}, n = 0;
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (KEYS.test(k)) { d[k] = localStorage.getItem(k); n++; } }
      var path = clean((old ? location.pathname.slice(7) : location.pathname) || '/', old), hash = location.hash;
      var tail = n ? '#mig=' + encodeURIComponent(JSON.stringify(d)) + (hash ? '&h=' + encodeURIComponent(hash.slice(1)) : '') : hash;
      location.replace(NEW + path + location.search + tail);
      return;
    }
    /* vztr.app에서 옛 이름(/start.html 등)으로 열면 주소창만 깔끔하게 (화면·저장값 그대로, 상대 주소 기준 폴더도 같음) */
    if (/^vztr\.app$/.test(location.hostname)) { var cp = clean(location.pathname, false); if (cp !== location.pathname) history.replaceState(history.state, '', cp + location.search + location.hash); }
    var m = location.hash.match(/^#mig=([^&]*)(?:&h=(.*))?$/);
    if (m) {
      var o = JSON.parse(decodeURIComponent(m[1]));
      for (var k2 in o) if (KEYS.test(k2) && localStorage.getItem(k2) == null) localStorage.setItem(k2, o[k2]);
      history.replaceState(null, '', location.pathname + location.search + (m[2] ? '#' + decodeURIComponent(m[2]) : ''));
    }
  } catch (e) {}
})();
