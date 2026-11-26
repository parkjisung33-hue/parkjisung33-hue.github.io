/* 11/26 2주차(동우님 보드 q5 = A): 유입 숫자 세기 — 하루·출처·단계 합계만 서버(/hit)에 +1. 쿠키 없음 · IP·기기 값 저장 안 함(처리방침 '자동 수집 장치').
   출처 = 처음 들어온 주소의 utm_source(/go/ 링크가 붙여 줌) · 결과 공유 링크로 오면 'share' · 그 밖 'direct' → 이 기기에 30일(vztr-src). 처음이 direct였다가 꼬리표 달고 오면 바꿈.
   안 세는 곳: vztr.app 밖(localhost·옛 주소) · 헤드리스·자동화 브라우저 · 작업용 기기(?dev=1 → vztr-dev). 같은 단계는 탭 하나에서 한 번만. */
(function () {
  var K = 'vztr-src', D = 30 * 864e5, src = 'direct';
  try {
    var q = new URLSearchParams(location.search).get('utm_source'), now = Date.now(), o = null;
    q = q ? q.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40) : '';
    try { o = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) {}
    if (o && o.s && now - o.t < D && !(o.s === 'direct' && (q || window.VZTR_SHARED))) src = o.s;
    else { src = q || (window.VZTR_SHARED ? 'share' : 'direct'); localStorage.setItem(K, JSON.stringify({ s: src, t: now })); }
  } catch (e) {}
  var off = !/^(www\.)?vztr\.app$/.test(location.hostname) || /HeadlessChrome|Lighthouse/i.test(navigator.userAgent) || navigator.webdriver;
  try { if (localStorage.getItem('vztr-dev')) off = true; } catch (e) {}
  window.vztrHit = function (e) {
    if (off) return;
    try { var k = 'vztr-hit-' + e; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (_) {}
    try { var u = '/hit?e=' + encodeURIComponent(e) + '&s=' + encodeURIComponent(src); if (!(navigator.sendBeacon && navigator.sendBeacon(u))) fetch(u, { method: 'POST', keepalive: true }); } catch (_) {}
  };
})();
