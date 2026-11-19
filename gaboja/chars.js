// 11/19 파스텔 팔레트 확정(동우님): 메인 #9DD2D8·#FADCE4·#9DC3E2·#FFB5CC + 몸·바탕 그라디언트. 옛 색 = history/2026-11-19_chars_파스텔전.js
// 가보자 짐 캐릭터 16 (2026-11-15 확정 v7 → 스타일 3: 테두리 없음·3톤·약한 입체, p9h) — 16유형마다 다른 여행 짐. 정본 시안 = preview/2026-11-15_9_짐캐릭터16_시안_v7.html
// 사용: GABOJA_CHAR(code, {bg:true}) → <svg> 문자열 · GABOJA_CHAR_BG(code) → 묶음 바탕색 · GABOJA_CHAR_ITEM(code) → 짐 이름
(() => {
/* ===== 짐 캐릭터 16 (2026-11-15 v3) — 더 단순하게: 점 눈 · 볼터치·입 없음 · 선 하나 굵기 · 묶음 색 하나 ===== */
const K = '#15171A', W = '#FFFFFF';
const G = [   // 11/19 파스텔 시안(동우님 팔레트): 메인 = 위 4색, 몸·바탕 그라디언트 = 아래 동그라미 4개
  { name: '로컬 탐험형', bg: '#E4F3F5', a: 'url(#vzals)', grad: ['#9DD2D8', '#9DC3E2'], bgGrad: ['#E2F3F5', '#E3EDF8'] },
  { name: '취향 수집형', bg: '#FEF2F5', a: 'url(#vzale)', grad: ['#FADCE4', '#FFC6D7'], bgGrad: ['#FFFAFB', '#FFEEF3'] },
  { name: '명소 정복형', bg: '#E4EEF7', a: 'url(#vzahs)', grad: ['#9DC3E2', '#B8CCE0'], bgGrad: ['#E3EDF8', '#F6EEF4'] },
  { name: '힐링 충전형', bg: '#FFE7EF', a: 'url(#vzahe)', grad: ['#FFB5CC', '#E9BCE0'], bgGrad: ['#FFE6EE', '#F5E5F3'] }
];
const GK = ['LS', 'LE', 'HS', 'HE'];
const eyes = (x, y, g = 10) => `<circle cx="${x-g/2}" cy="${y}" r="2.1" fill="${K}" stroke="none"/><circle cx="${x+g/2}" cy="${y}" r="2.1" fill="${K}" stroke="none"/>`;
const legs = (x, y) => `<path d="M${x-6} ${y} v6 h-3 M${x+6} ${y} v6 h3" fill="none"/>`;
const DEFS = g => { const k = GK[G.indexOf(g)].toLowerCase(); /* 아이디 소문자(soft()가 fill 값을 소문자로 바꿈) */ return `<defs><linearGradient id="vza${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g.grad[0]}"/><stop offset="1" stop-color="${g.grad[1]}"/></linearGradient><linearGradient id="vzb${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g.bgGrad[0]}"/><stop offset="1" stop-color="${g.bgGrad[1]}"/></linearGradient></defs>`; };
const wrap = (bg, body, g) => `<svg viewBox="0 0 100 92"><rect width="100" height="92" fill="${bg === 'none' || !g ? bg : 'url(#vzb' + GK[G.indexOf(g)].toLowerCase() + ')'}"/><g stroke="${K}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const C = [
 // 로컬 탐험형
 ['LSFJ', '골목 탐험대장', '나침반', g => `<rect x="46" y="14" width="8" height="6" rx="2" fill="${W}"/><circle cx="50" cy="44" r="23" fill="${W}"/><circle cx="50" cy="44" r="18.5" fill="none" stroke-width="1.4"/><path d="M50 25.5 v3 M50 59.5 v3 M31.5 44 h3 M65.5 44 h3" stroke-width="1.6"/><text x="50" y="35" text-anchor="middle" font-size="7" font-weight="800" fill="${K}" stroke="none" font-family="Pretendard Variable, sans-serif">N</text><g class="fx-ndl"><path d="M50 37 L54 46 L46 46 Z" fill="${g.a}" stroke-width="1.6"/><path d="M50 55 L54 46 L46 46 Z" fill="${W}" stroke-width="1.6"/><circle cx="50" cy="46" r="1.6" fill="${K}" stroke="none"/></g>${eyes(50,52,22)}${legs(50,67)}`],
 ['LSFP', '프로 뚜벅이', '운동화', g => `<path d="M18 58 Q18 40 36 38 L48 38 Q55 38 59 45 Q75 47 81 54 Q83 60 78 60 L22 60 Z" fill="${g.a}"/><rect x="16" y="58" width="68" height="8" rx="4" fill="${W}"/><path d="M45 42 l6 4 M51 40 l6 4" stroke="${W}" stroke-width="2"/>${eyes(33,50)}<path class="fx-l1" d="M44 66 v6 h-3" fill="none"/><path class="fx-l2" d="M56 66 v6 h3" fill="none"/>`],
 ['LSRJ', '골목 산책가', '이정표', g => `<path d="M50 18 V74" stroke-width="3"/><circle cx="50" cy="16" r="3.4" fill="${g.a}"/><g class="fx-s1"><path d="M50 24 H72 a2 2 0 0 1 1.5 .7 L79 31 L73.5 37.3 a2 2 0 0 1 -1.5 .7 H50 Z" fill="${g.a}"/>${eyes(63,31,8)}</g><g class="fx-s2"><path d="M50 43 H30 a2 2 0 0 0 -1.5 .7 L23 50 L28.5 56.3 a2 2 0 0 0 1.5 .7 H50 Z" fill="#A6E0C3"/><path d="M33 50 H44" stroke="${W}" stroke-width="2"/></g><path d="M40 74 H60" stroke-width="3"/>`],
 ['LSRP', '동네 방랑자', '버스', g => `<rect x="12" y="24" width="76" height="40" rx="8" fill="${g.a}"/><rect x="18" y="30" width="12" height="13" rx="2" fill="${W}" stroke-width="1.6"/><rect x="34" y="30" width="12" height="13" rx="2" fill="${W}" stroke-width="1.6"/><rect x="50" y="30" width="12" height="13" rx="2" fill="${W}" stroke-width="1.6"/><rect x="67" y="30" width="15" height="19" rx="3" fill="${W}"/>${eyes(74.5,40,7)}<text x="40.6" y="50.5" text-anchor="middle" dominant-baseline="central" font-size="7.4" font-weight="800" letter-spacing=".14em" fill="${W}" stroke="none" font-family="Pretendard Variable, sans-serif">BUS</text><circle cx="85" cy="56" r="1.8" fill="#FFD66B" stroke="none"/><circle cx="28" cy="64" r="6.5" fill="${K}"/><circle cx="28" cy="64" r="2.4" fill="${W}" stroke="none"/><circle cx="72" cy="64" r="6.5" fill="${K}"/><circle cx="72" cy="64" r="2.4" fill="${W}" stroke="none"/><g class="fx-puff" opacity="0"><g class="p1" fill="#C9CED6" stroke="none" opacity=".9"><circle cx="8" cy="59" r="3" fill="#C9CED6" stroke="none"/><circle cx="5.5" cy="57" r="2.6" fill="#C9CED6" stroke="none"/><circle cx="9.5" cy="56.5" r="2.2" fill="#C9CED6" stroke="none"/></g><g class="p2" fill="#C9CED6" stroke="none" opacity=".75"><circle cx="4" cy="52" r="2.4" fill="#C9CED6" stroke="none"/><circle cx="2" cy="50.5" r="2" fill="#C9CED6" stroke="none"/><circle cx="5.5" cy="50" r="1.8" fill="#C9CED6" stroke="none"/></g><g class="p3" fill="#C9CED6" stroke="none" opacity=".55"><circle cx="6" cy="45.5" r="1.8" fill="#C9CED6" stroke="none"/><circle cx="4.5" cy="44.5" r="1.4" fill="#C9CED6" stroke="none"/></g></g>`],
 // 취향 수집형
 ['LEFJ', '맛집 지도 제작자', '맛집 지도', g => `<g class="fx-map"><path d="M18 26 L36 20 L64 26 L82 20 V64 L64 70 L36 64 L18 70 Z" fill="${W}"/><path d="M36 20 V64 M64 26 V70" fill="none" stroke-width="1.6"/></g><g class="fx-pin"><path d="M50 18 a11 11 0 0 1 11 11 c0 8 -11 18 -11 18 s-11 -10 -11 -18 a11 11 0 0 1 11 -11 Z" fill="${g.a}"/><path d="M44.5 23 v4.6 a1.6 1.6 0 0 0 1.6 1.6 h1.8 a1.6 1.6 0 0 0 1.6 -1.6 V23 M47 23 v13" fill="none" stroke="${W}" stroke-width="1.4"/><path d="M55.5 36 V23 a3.4 3.4 0 0 0 -3 3.4 v4.2 a1.2 1.2 0 0 0 1.2 1.2 h1.8" fill="none" stroke="${W}" stroke-width="1.4"/></g>${eyes(50,55)}${legs(50,70)}`],
 ['LEFP', '소품샵 헌터', '가격표', g => `<g class="fx-tag"><path d="M20 44 L35 26 H80 V62 H35 Z" fill="${W}"/><circle cx="34" cy="44" r="5" fill="${g.a}" stroke="none"/><circle cx="34" cy="44" r="2.2" fill="${g.bg}" stroke-width="1.4"/>${eyes(59,38)}<path d="M48 50 v7 M51 50 v7 M55 50 v7 M57.5 50 v7 M61 50 v7 M65 50 v7 M67.5 50 v7 M71 50 v7" stroke-width="1.4"/></g>${legs(57,63)}`],
 ['LERJ', '현지 단골손님', '쿠폰', g => `<rect x="16" y="18" width="68" height="48" rx="7" fill="${W}"/><path d="M16 32 V25 a7 7 0 0 1 7 -7 H77 a7 7 0 0 1 7 7 V32 Z" fill="${g.a}"/><text x="50" y="25" text-anchor="middle" dominant-baseline="central" font-size="7" font-weight="800" letter-spacing=".12em" fill="${W}" stroke="none" font-family="Pretendard Variable, sans-serif">COUPON</text>${eyes(50,41)}${[28,39,50,61,72].map((x,i) => i<4 ? `<g class="fx-st" style="--i:${i}"><circle cx="${x}" cy="55" r="4.4" fill="${g.a}" stroke="none"/><path d="M${x-2} 55 l1.4 1.5 2.6 -3" fill="none" stroke="${W}" stroke-width="1.4"/></g>` : `<circle cx="${x}" cy="55" r="4.4" fill="${W}" stroke-width="1.4" stroke-dasharray="2 2"/>`).join('')}${legs(50,66)}`],
 ['LERP', '반쯤 현지인', '동네 장바구니', g => `<g transform="translate(0 10)"><g class="fx-veg"><g transform="rotate(16 58 27)"><path d="M56 12 q-6 -6 -3 -11 M58 12 q0 -8 3 -11 M60 12 q5 -6 10 -7" fill="none" stroke="#3FA34D" stroke-width="3.6"/><rect x="54.5" y="12" width="7" height="32" rx="3.5" fill="${W}"/><path d="M54.5 18 h7" stroke="#3FA34D" stroke-width="2.4"/></g><g transform="rotate(-14 42 28)"><rect x="37" y="12" width="11" height="30" rx="5.5" fill="${g.a}"/><path d="M40 20.5 q2.5 -2.4 5 -2.6 M40 27.5 q2.5 -2.4 5 -2.6 M40 34.5 q2.5 -2.4 5 -2.6" fill="none" stroke="#9A4A12" stroke-width="1.7"/></g></g></g><path d="M28 40 Q50 18 72 40" fill="none" stroke-width="2.6"/><path d="M20 40 H80 L74 70 H26 Z" fill="${W}"/><path d="M23 50 H77" stroke-width="1.4"/>${eyes(50,59)}${legs(50,70)}`],
 // 명소 정복형
 ['HSFJ', '명소 정복자', '깃발', g => `<path d="M34 14 V76"/><g class="fx-flag"><path d="M34 18 C46.7 18 59.3 18 72 18 L64 30 L72 42 C59.3 42 46.7 42 34 42 Z" fill="${g.a}"><animate class="fx-wave" attributeName="d" begin="indefinite" dur="1.6s" fill="freeze" calcMode="spline" keyTimes="0;.2;.4;.6;.8;1" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1" values="M34 18 C46.7 18 59.3 18 72 18 L64 30 L72 42 C59.3 42 46.7 42 34 42 Z;M34 18 C45 13 59 23 72 17 L65 29 L72 41 C59 47 45 37 34 42 Z;M34 18 C45 22 59 13 72 19 L63 31 L72 43 C59 37 45 46 34 42 Z;M34 18 C45 15 59 21 72 17.5 L64.5 29.5 L72 41.5 C59 45 45 39 34 42 Z;M34 18 C45 19.5 59 16.5 72 18.5 L63.7 30.3 L72 42.5 C59 40.5 45 43 34 42 Z;M34 18 C46.7 18 59.3 18 72 18 L64 30 L72 42 C59.3 42 46.7 42 34 42 Z"/></path>${eyes(50,30)}</g><path d="M24 76 H44"/>`],
 ['HSFP', '핫플 러너', '스마트폰', g => `<path d="M47 69 l-5 7 l-9 2" fill="none" stroke-width="2.6"/><path d="M55 68 l8 5 l-2 9 h4" fill="none" stroke-width="2.6"/><g transform="rotate(12 50 42)"><rect x="32" y="10" width="36" height="58" rx="8" fill="${W}"/><path d="M45 16 H55" stroke-width="1.6"/><g class="fx-fire" opacity="0"><g transform="translate(0 16)"><path d="M50 7 c3.5 4 7.5 6.5 7.5 11.5 a7.5 7.5 0 0 1 -15 0 c0 -3 1.8 -5 3.2 -7 c.2 3 1.8 4.3 3 4.3 c1.2 -2.8 .3 -5.8 1.3 -8.8 Z" fill="#FF7A3D"/><path d="M50 14.5 c1.8 2 3.4 3.4 3.4 5.6 a3.4 3.4 0 0 1 -6.8 0 c0 -1.6 1 -2.8 1.8 -3.8 c.4 1.2 1 1.8 1.6 1.8 c.2 -1.2 -.2 -2.4 0 -3.6 Z" fill="#FFD66B"/></g></g><g class="fx-pin2"><path d="M50 24 a8 8 0 0 1 8 8 c0 6 -8 13 -8 13 s-8 -7 -8 -13 a8 8 0 0 1 8 -8 Z" fill="${g.a}"/><circle cx="50" cy="32" r="2.8" fill="${W}" stroke="none"/></g>${eyes(50,56)}</g><path d="M30 44 l-6 4 M70 40 l6 -5" fill="none" stroke-width="2.2"/>`],
 ['HSRJ', '인생샷 장인', '카메라', g => `<rect x="30" y="20" width="14" height="8" rx="2" fill="${W}"/><rect x="18" y="27" width="64" height="40" rx="8" fill="${W}"/><g class="fx-lens"><circle cx="50" cy="47" r="15" fill="${g.a}"/><circle cx="50" cy="47" r="9" fill="${W}" stroke="none"/>${eyes(50,47,8)}</g>${legs(50,67)}<g class="fx-flash" opacity="0"><path d="M37 13 v-5 M30 15 l-3.5 -3.5 M44 15 l3.5 -3.5" fill="none" stroke-width="1.8"/></g>`],
 ['HSRP', '뷰 맛집 감상가', '쌍안경', g => `<rect x="30" y="14" width="12" height="9" rx="3" fill="${g.a}"/><rect x="58" y="14" width="12" height="9" rx="3" fill="${g.a}"/><path d="M29 22 H43 Q45 22 45.4 24 L49.5 56 H18.4 L26.6 24 Q27 22 29 22 Z" fill="${W}"/><path d="M57 22 H71 Q73 22 73.4 24 L81.6 56 H50.5 L54.6 24 Q55 22 57 22 Z" fill="${W}"/><rect x="20.2" y="41" width="27.6" height="6" rx="2" fill="${g.a}"/><rect x="52.2" y="41" width="27.6" height="6" rx="2" fill="${g.a}"/><rect x="44" y="30" width="12" height="10" rx="2" fill="${g.a}"/><circle cx="34" cy="60" r="16" fill="${g.a}"/><circle cx="34" cy="60" r="11.5" fill="#C3D0FF" stroke="none"/><g class="fx-gl" stroke="none"><circle cx="28.5" cy="54.5" r="2.6" fill="#ffffff" opacity=".9"/><circle cx="32.6" cy="52.4" r="1.1" fill="#ffffff" opacity=".9"/></g><circle cx="35" cy="62" r="2.6" fill="${K}" stroke="none"/><circle cx="66" cy="60" r="16" fill="${g.a}"/><circle cx="66" cy="60" r="11.5" fill="#C3D0FF" stroke="none"/><g class="fx-gl g2" stroke="none"><circle cx="60.5" cy="54.5" r="2.6" fill="#ffffff" opacity=".9"/><circle cx="64.6" cy="52.4" r="1.1" fill="#ffffff" opacity=".9"/></g><circle cx="67" cy="62" r="2.6" fill="${K}" stroke="none"/>`],
 // 힐링 충전형
 ['HEFJ', '맛집 투어 대장', '라멘 그릇', g => `<g class="fx-steam2" opacity="0"><path d="M30 34 c-2.5 -2.5 2.5 -4.5 0 -7 c-2.5 -2.5 2.5 -4.5 0 -7 M38 33 c-2.5 -2.5 2.5 -4.5 0 -7" fill="none" stroke-width="1.8"/></g><path class="fx-chop" d="M58 12 L46 40 M66 14 L52 40" stroke-width="2.4"/><path d="M18 40 H82 Q80 66 50 68 Q20 66 18 40 Z" fill="${W}"/><path d="M22 48 H78" stroke="${g.a}" stroke-width="3"/>${eyes(50,57)}<path d="M40 68 H60"/>`],
 ['HEFP', '쇼핑 마스터', '쇼핑백', g => `<path d="M40 34 V26 a10 10 0 0 1 20 0 V34" fill="none" stroke-width="2.6"/><g class="fx-pop"><rect x="42" y="38" width="16" height="12" rx="2" fill="#FFD66B"/><path d="M50 38 v12 M42 43 h16" fill="none" stroke="#E0812E" stroke-width="1.6"/><path d="M50 38 c-2 -3 -5 -3 -5 -1 s3 1 5 1 c2 0 5 1 5 -1 s-3 -2 -5 1" fill="none" stroke="#E0812E" stroke-width="1.4"/></g><path d="M24 30 H76 L80 74 H20 Z" fill="${g.a}"/><path d="M24 30 H76 L76.6 37 H23.4 Z" fill="${W}" stroke-width="1.8"/><circle cx="40" cy="33.5" r="1.8" fill="${K}" stroke="none"/><circle cx="60" cy="33.5" r="1.8" fill="${K}" stroke="none"/><rect x="38" y="46" width="24" height="16" rx="3" fill="${W}" stroke="none"/>${eyes(50,54)}${legs(50,74)}`],
 ['HERJ', '호캉스 플래너', '호텔 침대', g => `<rect x="14" y="26" width="12" height="46" rx="4" fill="${W}"/><rect x="14" y="54" width="74" height="16" rx="5" fill="${W}"/><rect x="28" y="40" width="20" height="12" rx="6" fill="${W}"/><path d="M44 46 H82 a6 6 0 0 1 6 6 V60 H44 Z" fill="${g.a}"/><path d="M52 64.5 q3 2.4 6 0 M64 64.5 q3 2.4 6 0" fill="none" stroke-width="2"/><path d="M18 70 v6 M84 70 v6" stroke-width="2.6"/><path class="fx-z1" d="M58 30 h6 l-6 6 h6" fill="none" stroke-width="1.8"/><path class="fx-z2" d="M68 23 h4 l-4 4 h4" fill="none" stroke-width="1.8"/>`],
 ['HERP', '멍때리기 고수', '커피잔', g => `<g transform="translate(0 7)"><path class="fx-sm" style="--i:0" d="M42 8 c-3 2.5 -3 4.5 0 7 c3 2.5 3 4.5 0 7" fill="none" stroke-width="2"/><path class="fx-sm" style="--i:1" d="M50 6 c-3 2.5 -3 4.5 0 7 c3 2.5 3 4.5 0 7" fill="none" stroke-width="2"/><path class="fx-sm" style="--i:2" d="M58 8 c-3 2.5 -3 4.5 0 7 c3 2.5 3 4.5 0 7" fill="none" stroke-width="2"/></g><ellipse cx="50" cy="72" rx="32" ry="5.5" fill="${g.a}"/><path d="M68 42 h3 a8 8 0 0 1 0 16 h-5" fill="none" stroke-width="2.6"/><path d="M28 34 H70 V52 a17 17 0 0 1 -17 17 H45 a17 17 0 0 1 -17 -17 Z" fill="${W}"/><path d="M28 34 H70" stroke-width="2.6"/><path d="M42 50 q3 2.4 6 0 M51 50 q3 2.4 6 0" fill="none" stroke-width="2"/>`],
];


const IDX = {}; C.forEach((c, i) => IDX[c[0]] = i);
const grp = code => G[Math.floor(IDX[code] / 4)];

/* ===== 11/15 스타일 3 확정: 테두리 없음 · 묶음 색 3톤(밝은·기본·진한) · 약한 광택 + 바닥 그림자 =====
   선 원본(검은 테두리) = GABOJA_CHAR_LINE · 화면에는 GABOJA_CHAR(스타일 3) */

/* 11/15: 크기 맞춤 — 외곽 상자 면적이 비슷하게(부분 보정, 0.88~1.12배) · 가로 가운데 · 바닥선 y77로 정렬. [배율, x이동, y이동] */
const NORM = {"LSFJ":[1.091,-4.55,-2.64,50.2],"LSFP":[1.12,-6.0,-3.64,76.2],"LSRJ":[1.016,-1.83,1.8,56.9],"LSRP":[1.008,-0.39,5.94,76.6],"LEFJ":[0.993,0.34,1.52,63.6],"LEFP":[1.108,-5.38,0.57,66.5],"LERJ":[0.996,0.18,5.26,67.7],"LERP":[0.935,3.24,5.93,56.1],"HSFJ":[1.061,-0.94,-3.65,31.2,35.1],"HSFP":[0.979,1.07,-3.24,50.9],"HSRJ":[1.02,-1.02,2.51,65.3],"HSRP":[0.92,4.0,7.08,58.9],"HEFJ":[1.004,-0.18,8.75,64.3],"HEFP":[0.983,0.85,-1.65,59.0],"HERJ":[0.977,0.18,2.76,72.3],"HERP":[0.962,1.9,2.45,61.6]};
const body = (code, g) => { const n = NORM[code], b = C[IDX[code]][3](g); return '<g class="fx-b">' + (n ? `<g transform="translate(${n[1]} ${n[2]}) scale(${n[0]})">${b}</g>` : b) + '</g>'; };   // 11/18 T7: fx-* = 등장 이펙트 걸 자리(CSS 없으면 그대로)
const TONE = { LS: { lt: '#C4E5E9', dk: '#2F6B73' }, LE: { lt: '#FCE6EC', dk: '#9A4A62' }, HS: { lt: '#C6DBEE', dk: '#2F557A' }, HE: { lt: '#FFD2E0', dk: '#8E3A63' } };   // 11/19 파스텔: lt = 넓은 흰 면, dk = 선·눈
const FXDEFS = '<defs><filter id="gbjSoft" x="-20%" y="-20%" width="140%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/><feSpecularLighting in="b" surfaceScale="1.6" specularConstant=".42" specularExponent="22" lighting-color="#fff" result="s"><fePointLight x="20" y="-40" z="80"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="s2"/></feMerge></filter><radialGradient id="gbjGnd" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#1b1f3a" stop-opacity=".22"/><stop offset="1" stop-color="#1b1f3a" stop-opacity="0"/></radialGradient></defs>';
const ALLDEFS = () => G.map(DEFS).join('').replace(/<\/?defs>/g, '');   // 11/19 리뷰: 묶음 그라디언트 8개는 전역 #gbjFx 한 곳에만(숨은 화면의 캐릭터가 먼저 나와도 색이 빠지지 않게)
const ensureFx = () => { if (document.getElementById('gbjFxCss') || !document.body) return; const d = document.createElement('div'); d.innerHTML = '<svg id="gbjFx" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true">' + FXDEFS.replace('</defs>', ALLDEFS() + '</defs>') + '</svg>'; document.body.appendChild(d.firstChild); };
const CACHE = {};
/* 11/20 동우님 폰: 사파리(아이폰은 모든 브라우저가 WebKit)는 SVG 필터를 낮은 해상도로 그려 몸 테두리가 거칠어짐 → 거기선 입체 필터를 빼고 그라디언트 면만(가장자리 선명) */
const WK_LOWRES = (() => { try { const u = navigator.userAgent; return /iP(hone|ad|od)/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1) || (/Safari\//.test(u) && !/Chrome|Chromium|Edg|OPR|Android/.test(u)); } catch (_) { return false; } })();
function soft(code, bg) {
  const key = code + (bg ? 1 : 0); if (CACHE[key]) return CACHE[key];
  const g = grp(code), t = TONE[code.slice(0, 2)], raw = wrap(bg ? g.bg : 'none', body(code, g), g);
  if (!document.body) return raw;
  ensureFx();
  const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-9999px;top:0;width:200px;visibility:hidden'; host.innerHTML = raw; document.body.appendChild(host);
  const svg = host.querySelector('svg'), gg = svg.querySelector('g'), KL = K.toLowerCase();
  gg.setAttribute('stroke', t.dk);
  gg.querySelectorAll('path,rect,circle,ellipse,text').forEach(el => {
    const f = (el.getAttribute('fill') || '').toLowerCase(), st = (el.getAttribute('stroke') || '').toLowerCase();
    if (el.tagName === 'text') { if (f === KL) el.setAttribute('fill', t.dk); return; }
    if (f && f !== 'none') {
      let nf = f, a = 0; try { const b = el.getBBox(); a = b.width * b.height; } catch (_) {}
      if (f === W.toLowerCase()) nf = a > 420 ? t.lt : '#ffffff'; else if (f === KL) nf = t.dk;
      el.setAttribute('fill', nf);
      el.setAttribute('stroke', el.getAttribute('stroke-dasharray') ? t.dk : 'none');
      if (!WK_LOWRES && el.getAttribute('stroke') === 'none' && a > 30 && !el.closest('.fx-puff,.fx-fire,.fx-pop')) el.setAttribute('filter', 'url(#gbjSoft)');
    } else if (!st || st === KL) el.setAttribute('stroke', t.dk);
  });
  { const n = NORM[code] || [1, 0, 0, 60], rx = Math.max(13, Math.min(30, n[3] * 0.4));   // 11/15: 그림자 = 그림 폭에 맞춰 바로 아래(바닥선 y77) · 넓고 옅은 그림자 + 좁고 진한 접지 그림자
    gg.insertAdjacentHTML('afterbegin', `<ellipse cx="${n[4] || 50}" cy="78.6" rx="${rx.toFixed(1)}" ry="3.4" fill="url(#gbjGnd)" stroke="none"/><ellipse cx="${n[4] || 50}" cy="78" rx="${(rx * 0.62).toFixed(1)}" ry="1.5" fill="#1b1f3a" opacity=".12" stroke="none"/>`); }
  const out = svg.outerHTML; host.remove(); return (CACHE[key] = out);
}
window.GABOJA_CHAR_LINE = (code, o = {}) => { if (!(code in IDX)) return ''; ensureFx(); const g = grp(code); return wrap(o.bg === false ? 'none' : g.bg, body(code, g), g).replace('<svg ', '<svg aria-hidden="true" focusable="false" '); };
/* 11/20 동우님: 짐마다 키·좌우가 달라(바닥선 기준으로 그려 위가 비어 있음) 옆 글자와 가운데가 안 맞음 → 그림 둘레에 같은 여백을 두고 정사각형으로 잘라 칸 가운데에. pad = 그림 크기 대비 여백(이펙트 자리) */
window.GABOJA_FIT = (svg, pad = 6) => { if (!svg || svg.dataset.fit) return; const g = svg.querySelector('.fx-b'); if (!g) return; let b; try { b = g.getBBox(); } catch (_) { return; } if (!b.width) return;
  const bot = Math.max(b.y + b.height, 79.5), w = b.width + pad * 2, h = bot - b.y + pad * 2, sz = Math.max(w, h);
  svg.setAttribute('viewBox', `${(b.x - pad - (sz - w) / 2).toFixed(1)} ${(b.y - pad - (sz - h) / 2).toFixed(1)} ${sz.toFixed(1)} ${sz.toFixed(1)}`); svg.dataset.fit = '1'; };
window.GABOJA_CHAR = (code, o = {}) => { if (!(code in IDX)) return ''; return soft(code, o.bg !== false).replace('<svg ', '<svg aria-hidden="true" focusable="false" '); };
window.GABOJA_CHAR_BG = code => code in IDX ? grp(code).bg : '';
window.GABOJA_CHAR_ITEM = code => code in IDX ? C[IDX[code]][2] : '';
/* ===== 등장 이펙트 (2026-11-18 확정, 정본 시안 = preview/2026-11-18_7_캐릭터이펙트_시안_v1.html 3차) =====
   쓰는 법: 캐릭터를 감싼 칸에 class="gfx" data-c="코드" (선택: data-fxd="지연 ms"). 화면에 보이면 한 번 재생.
   GABOJA_CHAR_PLAY(el) = 다시 재생 */
const FXCSS = `/* ===== 이펙트 (재생 = .gfx.play) — 등장할 때 한 번, 1~1.6초, 그 짐만의 동작 ===== */
.gfx svg [class*="fx-"], .gfx svg .fx-puff > g { transform-box: fill-box; }   /* 이펙트 조각에만 (transform 속성이 있는 몸통·회전 묶음은 건드리지 않음) */
.gfx.play .fx-ndl { transform-origin: center; animation: ndl 1.5s cubic-bezier(.2,.75,.25,1) both; }
@keyframes ndl { 0% { transform: rotate(0); } 62% { transform: rotate(570deg); } 78% { transform: rotate(528deg); } 90% { transform: rotate(546deg); } 100% { transform: rotate(540deg); } }
/* 운동화: 좌우로 뒤뚱 + 두 발 번갈아 들기 (걸음) */
.gfx.play[data-c="LSFP"] .fx-b { transform-origin: 50% 100%; animation: waddle 1.3s ease-in-out both; }
@keyframes waddle { 0%, 100% { transform: none; } 15% { transform: translateX(-2px) rotate(-4deg); } 40% { transform: translateX(2px) rotate(4deg); } 65% { transform: translateX(-1px) rotate(-2.5deg); } 85% { transform: translateX(.5px) rotate(1deg); } }
.gfx.play .fx-l1 { animation: step 1.3s ease-in-out both; } .gfx.play .fx-l2 { animation: step 1.3s ease-in-out .25s both; }
@keyframes step { 0%, 50%, 100% { transform: none; } 12% { transform: translateY(-3px); } 62% { transform: translateY(-2px); } 75% { transform: none; } }
/* 이정표: "어느 길로 갈래?" — 팔이 번갈아 은은하게 커졌다 작아짐 */
.gfx.play .fx-s1 { transform-origin: 0% 50%; animation: ask 1.6s ease-in-out both; }
.gfx.play .fx-s2 { transform-origin: 100% 50%; animation: ask 1.6s ease-in-out .4s both; }
@keyframes ask { 0%, 50%, 100% { transform: none; } 22% { transform: scale(1.14); } 72% { transform: scale(1.05); } 88% { transform: none; } }
/* 버스: 부르릉(살짝 떨림) + 뒤 배기구 연기 붕 */
.gfx.play[data-c="LSRP"] .fx-b { animation: rumble 1.3s linear both; }
@keyframes rumble { 0%, 40%, 100% { transform: none; } 8%, 24% { transform: translateY(-1px); } 16%, 32% { transform: translateY(.6px); } 55% { transform: translateX(1.5px); } 75% { transform: translateX(-.5px); } }
.gfx.play .fx-puff { animation: show 1.6s ease-out both; }
@keyframes show { 0%, 100% { opacity: 0; } 12%, 70% { opacity: 1; } }
.gfx.play .fx-puff > g { transform-origin: center; animation: puff 1.6s cubic-bezier(.2,.7,.3,1) both; }
.gfx.play .fx-puff .p2 { animation-delay: .12s; } .gfx.play .fx-puff .p3 { animation-delay: .24s; }
@keyframes puff { 0% { transform: translate(6px, 3px) scale(.25); opacity: .9; } 60% { opacity: .8; } 100% { transform: translate(-3px, -5px) scale(1.5); opacity: 0; } }

/* 맛집 지도: 지도가 펼쳐지고 핀이 톡 꽂힘 */
.gfx.play .fx-map { transform-origin: center; animation: unfold .55s cubic-bezier(.2,.8,.2,1) both; }
@keyframes unfold { from { transform: scaleX(.12); } to { transform: none; } }
.gfx.play .fx-pin { animation: pin .7s cubic-bezier(.3,.6,.3,1.4) .4s both; }
@keyframes pin { 0% { transform: translateY(-16px); opacity: 0; } 55% { transform: translateY(1.5px); opacity: 1; } 75% { transform: translateY(-1.5px); } 100% { transform: none; } }
/* 가격표: 매달린 줄에서 흔들 */
.gfx.play .fx-tag { transform-origin: 23% 50%; animation: swing 1.6s cubic-bezier(.3,.6,.4,1) both; }
@keyframes swing { 0% { transform: rotate(-14deg); } 25% { transform: rotate(9deg); } 45% { transform: rotate(-5deg); } 65% { transform: rotate(2.5deg); } 82% { transform: rotate(-1deg); } 100% { transform: none; } }
/* 쿠폰: 도장이 하나씩 쾅 */
.gfx.play .fx-st { transform-origin: center; animation: stamp .38s cubic-bezier(.3,.6,.3,1.5) calc(var(--i) * .18s + .1s) both; }
@keyframes stamp { 0% { transform: scale(1.9) rotate(-18deg); opacity: 0; } 70% { transform: scale(.92); opacity: 1; } 100% { transform: none; } }
/* 장바구니: 채소가 쏙 */
.gfx.play .fx-veg { animation: veg .8s cubic-bezier(.3,.6,.3,1.5) .1s both; }
@keyframes veg { 0% { transform: translateY(-20px); opacity: 0; } 30% { opacity: 1; } 62% { transform: translateY(2px); } 80% { transform: translateY(-1px); } 100% { transform: none; } }
/* 깃발: 종이처럼 휘며 펄럭 — 모양 자체가 바뀜(SVG animate, 재생 때 시작) + 살짝 기울기 */
.gfx.play .fx-flag { transform-origin: 0% 50%; animation: flagtilt 1.6s ease-in-out both; }
@keyframes flagtilt { 0%, 100% { transform: none; } 25% { transform: rotate(-2deg); } 55% { transform: rotate(1.5deg); } }
/* 스마트폰: 화면 속 핀이 톡 */
.gfx.play .fx-pin2 { transform-origin: 50% 100%; animation: topin 1.8s ease-in-out both; }
@keyframes topin { 0%, 42% { opacity: 0; transform: scale(.7); } 70% { opacity: 1; transform: scale(1.06); } 85% { transform: scale(.98); } 100% { opacity: 1; transform: none; } }
.gfx.play .fx-fire { transform-origin: 50% 100%; animation: fire 1.8s ease-in-out both; }
@keyframes fire { 0% { opacity: 0; transform: scale(.2); } 14% { opacity: 1; transform: scale(1.12); } 24% { transform: scale(.95, 1.06); } 34% { transform: scale(1.04, .96); } 44% { opacity: 1; transform: scale(1); } 66% { opacity: 0; transform: scale(.8) translateY(-3px); } 100% { opacity: 0; } }
.gfx.play[data-c="HSFP"] .fx-b { transform-origin: 50% 100%; animation: tilt 1s ease-out both; }
@keyframes tilt { 0% { transform: rotate(-4deg); } 50% { transform: rotate(2deg); } 100% { transform: none; } }
/* 카메라: 찰칵 (렌즈 조였다 펴짐 + 플래시) */
.gfx.play .fx-lens { transform-origin: center; animation: snap .55s cubic-bezier(.3,.6,.3,1.4) .25s both; }
@keyframes snap { 0% { transform: none; } 40% { transform: scale(.82); } 100% { transform: none; } }
.gfx.play .fx-flash { animation: flash .7s ease-out .35s both; }
@keyframes flash { 0% { opacity: 0; } 20% { opacity: 1; } 100% { opacity: 0; } }
/* 쌍안경: 들어 올리고 렌즈에 빛이 스침 */
.gfx.play[data-c="HSRP"] .fx-b { transform-origin: 50% 100%; animation: lift 1.4s ease-in-out both; }
@keyframes lift { 0%, 100% { transform: none; } 20% { transform: translateX(-3px) rotate(-4deg); } 50% { transform: translateX(3px) rotate(4deg); } 75% { transform: translateX(-1px) rotate(-1.5deg); } }
.gfx.play .fx-gl { animation: glint .9s ease-out .9s both; } .gfx.play .fx-gl.g2 { animation-delay: 1s; }
@keyframes glint { 0% { transform: translate(-6px, 6px); opacity: 0; } 50% { transform: translate(3px, -3px); opacity: 1; } 100% { transform: none; opacity: 1; } }
/* 라멘: 젓가락이 쏙 들어갔다 나오고 김이 피어오름 */
.gfx.play .fx-chop { animation: dip 1.2s ease-in-out both; }
@keyframes dip { 0%, 100% { transform: none; } 30% { transform: translate(-2px, 5px); } 55% { transform: translate(1px, -3px); } 75% { transform: translate(0, 1px); } }
.gfx.play .fx-steam2 { animation: steam 1.6s ease-out .3s both; }
@keyframes steam { 0% { opacity: 0; transform: translateY(5px); } 35% { opacity: 1; } 100% { opacity: 0; transform: translateY(-6px); } }
/* 쇼핑백: 통통 + 반짝 */
.gfx.play[data-c="HEFP"] .fx-b { transform-origin: 50% 100%; animation: squash .9s cubic-bezier(.3,.6,.3,1.3) both; }
@keyframes squash { 0% { transform: scale(1.08, .86); } 45% { transform: scale(.96, 1.05); } 75% { transform: scale(1.02, .98); } 100% { transform: none; } }
.gfx.play .fx-pop { animation: peek 1.3s cubic-bezier(.3,.6,.3,1.3) .2s both; }
@keyframes peek { 0%, 100% { transform: none; } 35%, 60% { transform: translateY(-15px) rotate(-6deg); } 48% { transform: translateY(-15px) rotate(5deg); } 85% { transform: translateY(1px); } }
/* 호텔 침대: zZ가 둥실 */
.gfx.play .fx-z1 { animation: zz 1.2s ease-out .1s both; } .gfx.play .fx-z2 { animation: zz 1.2s ease-out .45s both; }
@keyframes zz { 0% { opacity: 0; transform: translate(-4px, 6px) scale(.6); } 60% { opacity: 1; transform: translate(1px, -2px); } 100% { opacity: 1; transform: none; } }
/* 커피잔: 김이 하나씩 피어오름 */
.gfx.play .fx-sm { animation: rise 1.1s ease-out calc(var(--i) * .18s + .1s) both; }
@keyframes rise { 0% { opacity: 0; transform: translateY(6px); } 70% { opacity: 1; transform: translateY(-1.5px); } 100% { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .gfx.play * { animation: none !important; } }
`;
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };
const play = el => { el.classList.remove('play'); void el.offsetWidth; el.classList.add('play'); if (!reduced()) el.querySelectorAll('animate').forEach(m => { try { m.beginElement(); } catch (_) {} }); };
window.GABOJA_CHAR_PLAY = play;
const boot = () => {
  if (!document.getElementById('gbjFxCss')) { const st = document.createElement('style'); st.id = 'gbjFxCss'; st.textContent = FXCSS; document.head.appendChild(st); }
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const el = e.target; io.unobserve(el); setTimeout(() => play(el), +el.dataset.fxd || 0); }), { threshold: .6 });
  const scan = () => document.querySelectorAll('.gfx:not([data-fxw])').forEach(el => { if (!el.querySelector('svg')) return; el.dataset.fxw = '1'; io.observe(el); });
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
