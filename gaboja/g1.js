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

/* ── 14 A2 (11/19 동우님 선택): 맨 위 + DAY = 한 상자, 내리면 날짜 줄이 한 줄로 접힘 ──
   끊김 없게 하는 방법
   ① 접힘 정도 --p(0~1)를 스크롤 위치에 바로 묶음 (손가락과 같이 움직임, 클래스 껐다 켰다 없음 → 튐 없음)
   ② 맨 위 칸(.top)의 자리 높이는 펼친 높이로 고정 → 접혀도 아래 내용이 밀려 올라가지 않음(덜컥임·스크롤 보정 루프 없음)
   ③ 탭 이동·맨 위로 같이 한 번에 크게 바뀔 때만 몇 프레임에 걸쳐 따라감(부드럽게)
   ④ 움직임 줄이기 설정이면 바로 바뀜 */
(function () {
  var D = 64;                       // 이만큼 내리면 다 접힘(px)
  var root = document.documentElement, top, box, days, cur = 0, goal = 0, raf = 0, H0 = 0, H1 = 0, easing = false;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setP(p) {
    root.style.setProperty('--p', p.toFixed(4));
    root.style.setProperty('--hb', (H0 - (H0 - H1) * p).toFixed(2) + 'px');   // 뒤 바탕 가림 높이 = 상자 높이
  }
  function measure() {
    if (!box) return;
    top.style.height = '';
    root.style.setProperty('--p', '1'); H1 = box.offsetHeight;
    root.style.setProperty('--p', '0'); H0 = box.offsetHeight;
    var cs = getComputedStyle(top);
    top.style.height = (H0 + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)) + 'px';
    setP(cur);
  }
  function tick() {
    raf = 0;
    var d = goal - cur;
    if (!reduce && Math.abs(d) > 0.3) easing = true;          // 한 번에 크게 바뀜(탭 이동·맨 위로) → 끝까지 부드럽게 따라감
    if (reduce || Math.abs(d) < 0.003) { cur = goal; easing = false; }
    else if (easing) cur += d * 0.24;
    else cur = goal;                                           // 손가락 스크롤 = 그대로 붙어서
    setP(cur);
    if (cur !== goal) raf = requestAnimationFrame(tick);
  }
  function onScroll() {
    goal = Math.max(0, Math.min(1, (window.scrollY || 0) / D));
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function go() {
    top = document.querySelector('.app > .top');
    var pill = top && top.querySelector('.pill'); days = document.getElementById('dayBtns');
    if (!pill || !days) return;
    box = document.createElement('div');
    box.className = 'hbox glass';
    top.insertBefore(box, pill);
    box.appendChild(pill); box.appendChild(days);
    pill.classList.remove('glass'); days.classList.remove('glass');
    root.classList.add('g1-a2');
    measure();
    onScroll(); cur = goal; setP(cur);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { measure(); onScroll(); });
    // 날짜 칸이 다시 그려지거나(여행 바뀜) 숨겨질 때(다른 탭) 높이 다시 잼
    new MutationObserver(function () { requestAnimationFrame(measure); }).observe(days, { attributes: true, attributeFilter: ['hidden'], childList: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
