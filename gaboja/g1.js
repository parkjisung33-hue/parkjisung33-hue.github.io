/* VZTR 가이드북 1차안 — 시각 미정인 날(시각 칸이 전부 '–') 상세 목록에 .notm 표시 → g1.css가 시각 칸을 빼고 공간을 다시 나눔.
   앱에 옮길 땐 index.html list(d)에서 d.tbd면 '<div class="list glass notm">'으로 바로 붙이면 된다 */
(function () {
  function mark() {
    document.querySelectorAll('#dayBody .list').forEach(function (l) {
      var t = l.querySelectorAll('.li .tm');
      var none = t.length && [].every.call(t, function (x) { return x.textContent.trim() === '–'; });
      l.classList.toggle('notm', !!none);
    });
  }
  function go() {
    var b = document.getElementById('dayBody');
    if (!b) return;
    mark();
    new MutationObserver(mark).observe(b, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
