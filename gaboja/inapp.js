/* 11/19 앱 안 브라우저(카카오톡·인스타그램·라인 등)로 열리면 폰 기본 브라우저(사파리·크롬)로 넘김
   - 카카오톡: kakaotalk://web/openExternal?url= (카카오 공식 문서엔 없음, 개발자들이 쓰는 방식 — 안 되면 아래 안내 줄이 남음)
   - 라인: ?openExternalBrowser=1
   - 안드로이드 그 밖의 앱: intent:// 로 기본 브라우저 열기
   - 아이폰 그 밖의 앱(인스타그램 등): 코드로 못 넘김 → 위에 'Safari로 열기' 안내 줄 */
(function () {
  var ua = navigator.userAgent || '', url = location.href;
  var ios = /iPhone|iPad|iPod/i.test(ua), android = /Android/i.test(ua);
  var kakao = /KAKAOTALK/i.test(ua), line = /\bLine\//i.test(ua);
  var inapp = kakao || line || /Instagram|FBAN|FBAV|FB_IAB|NAVER\(inapp|DaumApps|everytimeApp|BAND\/|Snapchat|Twitter|TikTok|musical_ly|Whale\/.*inapp|; wv\)/i.test(ua);
  if (!inapp) return;
  try { if (sessionStorage.getItem('vz-ext-tried') === url) { banner(); return; } sessionStorage.setItem('vz-ext-tried', url); } catch (e) {}
  if (kakao) { location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url); }
  else if (line) { if (!/[?&]openExternalBrowser=1/.test(url)) location.replace(url + (url.indexOf('?') < 0 ? '?' : '&') + 'openExternalBrowser=1'); }
  else if (android) { var u = new URL(url); location.href = 'intent://' + u.host + u.pathname + u.search + u.hash + '#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=' + encodeURIComponent(url) + ';end'; }
  setTimeout(banner, 1200);   // 넘어가지 못했으면 안내
  function banner() {
    if (document.getElementById('vzExt')) return;
    var go = function () {
      var b = document.createElement('div'); b.id = 'vzExt';
      b.setAttribute('style', 'position:fixed;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top,0px));z-index:2147483000;background:#0A1F33;color:#fff;border-radius:10px;padding:11px 14px;font:600 13px/1.45 system-ui,sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 8px 24px -10px rgba(0,0,0,.5)');
      b.innerHTML = '<span style="flex:1">' + (ios ? '오른쪽 위 <b>···</b> 또는 공유 버튼 → <b>Safari로 열기</b>를 누르면 더 잘 보여요' : '오른쪽 위 <b>⋮</b> → <b>다른 브라우저로 열기</b>를 누르면 더 잘 보여요') + '</span><button style="all:unset;cursor:pointer;opacity:.7;font-size:18px;padding:0 4px" aria-label="닫기">×</button>';
      b.querySelector('button').onclick = function () { b.remove(); };
      document.body.appendChild(b);
    };
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
})();
