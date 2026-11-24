/* 가보자 일정 조립 엔진 v9 (2026-11-24 동선 최적화: 장소 좌표로 이동 시간 · 조각 안 순서 · 중간 날 하루 순서 다시 줄 세우기 · 식당 가까운 곳으로 바꾸기 · 빈 시간 구경거리 · must 둘레 — README 11/24 절) / v8 (2026-11-13 오후: 시·군·구 출발 input.sgg = 집→공항·국내 차 출발점 / 차 출발 미입력 = 09:00(오는 날 15:00)로 표시 / 시각 미입력 = days[].tbd(시각 숨김) · 차 = 탑승권 카드 틀(fly+ride:'car', 출발만 입력 → 도착 계산, 시간대별 표 car.d) · 일정 pid 유지 / v6: 차 이동 시간 CAR_POLICY·표 연결 / v5 수정: 식사 중복 방지·이른 귀국·자정 넘김·휴무 closed_nth/날짜·숙소 미인식 안내·(추정) / v4 국내 흐름 — 기차·국내선·차·집에서 바로 / v3 도시 설정, v1 오사카·교토 시범)
   데이터 = gen-data.js (tools/build_gen_data.py가 장소 DB places.json · 조각 pieces.json · 동네 이동 시간에서 만듦)
   입력: 유형 코드(LSRP 등) + 여행 정보(날짜·박·비행기·출발지·취향·피할 것)
   규칙 = 만드는 규칙 v1(문서/여행앱/2026-11-11_가보자_만드는규칙_v1.md)의 시범판:
   ① 날 뼈대: 첫날 = 집 → 공항(출발 2시간 전) → 도착 → 숙소 짐 / 마지막 날 = 체크아웃 → 공항(2시간 전) → 집
   ② 하루 조각 수: 알차게(F) = 오전·오후·저녁 이후 3조각 / 여유롭게(R) = 오전·오후 2조각 + 숙소 휴식
   ③ 조각 고르기: 묶음(로컬·핫플 × 구경·즐기기) 맞는 것 > 취향 칩 > 피할 것 빼기, 같은 유형이라도 날짜에 따라 조금씩 다르게
   ④ 검사: 그 요일 휴무 · 영업시간(도착이 열기 전이면 45분까지 기다림, 닫기 전 못 끝내면 다른 조각)
   ⑤ 계획형(J) = 시각 하나 / 즉흥형(P) = 같은 시간대 다른 후보 하나를 '또는'으로
   ⑥ 식사: 그 동네에서 그 시각에 여는 식당(DB) → 없으면 '현장 선택' */
/* E1 (2026-11-14) 선택 입력 4개 — 없으면 결과가 예전과 완전히 같음:
     must { [dayIndex 0부터]: [placeId] } 그날 우선 배치(그날 자동 조각 대신 들어감, 영업시간·동선 규칙 그대로, 못 넣으면 그날 메모 '못 넣은 곳') · ban [placeId] 전체 제외 ·
     tagW { 태그: 가중치 } 취향 점수에 더함(조각·채움) · blank true = 뼈대(공항·이동·숙소·체크인/아웃)만 두고 관광·식당은 비움, days[].area = 그날 동네 */
(function () {
  const D = window.GABOJA_DATA;
  if (!D) return;
  const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], WDK = ['일', '월', '화', '수', '목', '금', '토'];
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  // 분 → 'HH:MM'. 24:00 넘으면 '01:40(다음 날)' (index.html의 toMin이 '(다음 날)'을 다시 +1440으로 읽음)
  const toT = m => { m = Math.max(0, Math.round(m)); const nx = m >= 1440; m %= 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') + (nx ? '(다음 날)' : ''); };
  // 출발 a → 도착 b (둘 다 'HH:MM'): 도착이 더 이르면 다음 날로 보고 +1440
  const spanEnd = (a, b) => { const x = toMin(a), y = toMin(b); return y < x ? y + 1440 : y; };
  // 11/13: 5분 올림 제거 — 이동·도착 시각은 데이터의 실제 분(8분 등) 그대로. (r5는 이제 정수로만 맞춤)
  const r5 = m => Math.round(m);
  // 11/14 #24: 60분 넘으면 'N시간 M분' (앱 전체 같은 표기)
  const mnTx = m => { m = Math.round(m); return m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' + m % 60 + '분' : '') : m + '분'; };
  // 차(운전) 이동 시간 정책 (2026-11-13) — 값은 전부 여기 한 곳. 시간 = 기준분(경로 엔진 표 car_times.json) × 혼잡 배수 + 버퍼
  // 근거 구분: [근거] = 확인한 자료가 있는 부분, [추정] = 아키 추정(출처 없음, 바꿔도 됨)
  /* 11/20 W5 F1 한국 공항 도착(외국인) — 시간 출처: AREX 직통 43분·일반 59분(인천 T1 → 서울역, 한국관광공사 english.visitkorea.or.kr 140654) ·
     홍대 = 공항철도 일반 약 1시간(Visit Seoul english.visitseoul.net/airport-to-seoul) · 서울역 → 동네 = 기존 국내 표(modes.train.toBase 서울역) + 갈아타기 5분 [추정 합산] ·
     김포·김해 → 동네 = 기존 국내선 표(modes.air.toBase 김포·김해) · 입국 심사·짐 = 60분 [추정, 공식 평균 없음] · 인천 T2는 공항철도 +7분(미반영) */
  const INBOUND = {
    ICN: { dest: 'sel', ap: { name: '인천', q: '인천국제공항', say: '입국 심사 → 짐 찾기 → 공항철도(AREX) 표지판', out: ['11:00', '11:00'], back: ['18:00', '18:00'] },
      toBase: tr => { const S = (tr.toBase || {})['서울역'] || {}, o = {}; Object.keys(S).forEach(k => { o[k] = S[k][0] ? [59 + 5 + S[k][0], '공항철도 + ' + S[k][1]] : [59, '공항철도']; }); o['sel-hongdae'] = [60, '공항철도']; return o; } },
    GMP: { dest: 'sel', ap: { name: '김포', q: '김포국제공항', say: '입국 심사 → 짐 찾기 → 지하철 표지판', out: ['11:00', '11:00'], back: ['18:00', '18:00'] },
      toBase: (tr, air) => ({ ...((air.toBase || {})['김포'] || {}) }) },
    CJU: { dest: 'jej', ap: { name: '제주', q: '제주국제공항', say: '입국 심사 → 짐 찾기 → 택시·버스 표지판', out: ['11:00', '11:00'], back: ['18:00', '18:00'] },   // 11/24 영어판 도시 넓힘: 국제선 있는 공항만(제주·대구)
      toBase: (tr, air) => ({ ...((air.toBase || {})['제주'] || {}) }) },
    TAE: { dest: 'dgu', ap: { name: '대구', q: '대구국제공항', say: '입국 심사 → 짐 찾기 → 택시 표지판', out: ['11:00', '11:00'], back: ['18:00', '18:00'] },
      toBase: (tr, air) => ({ ...((air.toBase || {})['대구'] || {}) }) },
    PUS: { dest: 'bsn', ap: { name: '김해', q: '김해국제공항', say: '입국 심사 → 짐 찾기 → 경전철 표지판', out: ['11:00', '11:00'], back: ['18:00', '18:00'] },
      toBase: (tr, air) => ({ ...((air.toBase || {})['김해'] || {}) }) },
  };
  const CAR_POLICY = {
    // 혼잡 배수 [추정] — 참고 수치: 서울 2025 평균 속도 퇴근 18~20시 19.8 · 휴일 평균 23.9km/h (서울시 자료 인용 보도, heraldk 2026-03-13). 자유 흐름 대비 배수는 한국·일본 모두 근거 못 구함
    metro: { peak: 1.3, day: 1.15, night: 1.0, weekend: 1.2 },   // 대도시 안: 평일 07–10·17–20시 peak / 평일 10–17시 day / 그 밖 night / 주말 10–19시 weekend
    hwy: { weekday: 1.1, rush: 1.25 },                           // 도시 간(고속) 구간: 평소 1.1 / 금 16시~ · 토 오전 · 일 오후 rush
    metroKm: 100,                                                // 기준 거리가 이보다 짧으면 대도시 안(metro), 길면 도시 간(hwy)으로 봄 [추정]
    winter: { dests: ['spk'], months: [12, 1, 2, 3], mult: 1.2 }, // 홋카이도 겨울 눈길 [추정] — 속도 저하 수치 못 구함. 지금은 국내만 차 구간이 있어 쓰이지 않음
    restEvery: 120, restMin: 15,                                  // 2시간 운전마다 휴식 15분 [근거: 한국도로공사 권고(기사 인용, 공식 원문 미확인) · 사업용 2시간당 15분] — 운전자 기준
    parkMin: 10,                                                  // 숙소 도착 뒤 주차·도보 [추정]. 공항 도착 규칙은 기존(공항 2시간 전 등) 그대로
    airBuf: 15,                                                   // 집↔공항 차 이동의 주차·터미널 걷기 여유 [추정] (시·군·구 출발일 때만)
  };
  // 출발 시각(분)·날짜·거리·도시로 혼잡 배수
  function carMult(km, dep, date, dest) {
    const wd = date.getDay(), h = (dep % 1440) / 60, P = CAR_POLICY; let m;
    if (km >= P.metroKm) m = (wd === 5 && h >= 16) || (wd === 6 && h < 12) || (wd === 0 && h >= 12) ? P.hwy.rush : P.hwy.weekday;
    else if (wd >= 1 && wd <= 5) m = (h >= 7 && h < 10) || (h >= 17 && h < 20) ? P.metro.peak : h >= 10 && h < 17 ? P.metro.day : P.metro.night;
    else m = h >= 10 && h < 19 ? P.metro.weekend : P.metro.night;
    if (P.winter.dests.includes(dest) && P.winter.months.includes(date.getMonth() + 1)) m *= P.winter.mult;
    return m;
  }
  // 차 구간 표 한 쌍 / 점: 키 'a>b'. a·b 중 'sgg:서울 마포구'(시·군·구 출발) 가 있으면 D.sgg 표에서, 아니면 D.car.pairs
  const sggOf = k => (k && k.indexOf('sgg:') === 0 ? k.slice(4) : null);
  function pairOf(key) {
    const [a, b] = String(key).split('>'), sa = sggOf(a), sb = sggOf(b);
    if (sa || sb) { const s = D.sgg && D.sgg[sa || sb], o = s && s.t[sa ? b : a]; return o ? { min: o[0], km: o[1] } : null; }
    return (D.car && D.car.pairs && D.car.pairs[key]) || null;
  }
  function pointOf(k) {
    const s = sggOf(k); if (s) return D.sgg && D.sgg[s] ? [s, D.sgg[s].p[0], D.sgg[s].p[1]] : null;
    return (D.car && D.car.points && D.car.points[k]) || null;
  }
  const PL = D.places, PC = D.pieces;
  const cl = id => (PL[id] && PL[id].cl) || '';
  const isEst = (a, b) => !!a && !!b && a !== b && (D.est || []).includes(a < b ? a + '|' + b : b + '|' + a);
  const estTx = (a, b) => isEst(a, b) ? ' (추정)' : '';
  function mins(a, b) {
    if (!a || !b || a === b) return a === b ? 8 : 30;
    const k1 = a + '|' + b, k2 = b + '|' + a;
    return D.areas[k1] || D.areas[k2] || (D.cityOf[a] === D.cityOf[b] ? 30 : 55);
  }
  /* 11/24 동선 최적화 — 장소 사이 실제 거리(장소 DB 좌표 ll)로 이동 시간 [추정]
     길 = 직선거리 × 1.3(도심 우회 계수 [추정]) · 걷기 4.5km/h [추정] · 걸어서 1.6km(약 28분) 이하이고 대중교통보다 빠르면 걷기('많이 걷기 빼기' = 0.9km)
     대중교통 = 동네 사이 표(areas, 조사값)가 있으면 그 값 · 없거나 같은 동네 안이면 도시별 맞춤(기본분 + 분/km — areas 표를 동네 중심점 거리로 최소제곱, 표 12쌍 미만 도시는 일본·한국 전체 값)
     좌표가 없으면 예전 그대로(같은 동네 걸어서 10분 · 표 · 30/55분). 동네 중심점 = 그 동네 장소 좌표의 중앙값(숙소 위치 대신 씀) */
  const hv = (a, b) => { const r = Math.PI / 180, dl = (b[0] - a[0]) * r, dn = (b[1] - a[1]) * r, x = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
  const CEN = {}, JPC = new Set(['오사카', '교토', '도쿄', '후쿠오카', '삿포로', '나라', '고베']), FIT = {};
  (() => {
    const L = {}, med = a => { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; };
    Object.values(D.places).forEach(p => { if (p.ll && p.cl && p.kind !== 'hub') (L[p.cl] = L[p.cl] || []).push(p.ll); });
    Object.keys(L).forEach(k => { CEN[k] = [med(L[k].map(x => x[0])), med(L[k].map(x => x[1]))]; });
    const by = {}; Object.keys(D.areas || {}).forEach(k => { const [a, b] = k.split('|'), c = D.cityOf[a]; if (CEN[a] && CEN[b] && c && c === D.cityOf[b]) (by[c] = by[c] || []).push([hv(CEN[a], CEN[b]), D.areas[k]]); });
    const lsq = P => { const n = P.length; let sx = 0, sy = 0, sxx = 0, sxy = 0; P.forEach(([x, y]) => { sx += x; sy += y; sxx += x * x; sxy += x * y; }); const b = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1); return [Math.min(25, Math.max(6, (sy - b * sx) / n)), Math.min(4, Math.max(0.8, b))]; };
    const jp = [], kr = []; Object.keys(by).forEach(c => (JPC.has(c) ? jp : kr).push(...by[c]));
    FIT._jp = jp.length ? lsq(jp) : [10, 2.5]; FIT._kr = kr.length ? lsq(kr) : [10, 1.6];
    Object.keys(by).forEach(c => { FIT[c] = by[c].length >= 12 ? lsq(by[c]) : FIT[JPC.has(c) ? '_jp' : '_kr']; });
  })();
  const ptOf = x => (D.places[x] && D.places[x].ll) || CEN[x] || null, clOf = x => (D.places[x] ? D.places[x].cl || '' : x || '');
  // 순열(원래 순서가 맨 앞). 5개 넘으면 원래 순서만
  function perms(a) { if (a.length < 2 || a.length > 5) return [a]; const out = []; const go = (pre, rest) => { if (!rest.length) { out.push(pre); return; } rest.forEach((x, k) => go(pre.concat([x]), rest.slice(0, k).concat(rest.slice(k + 1)))); }; go([], a); return out; }
  const LEGC = new Map();
  // a·b = 장소 id 또는 동네 키 → { m 분, walk 걷기?, est 추정?, cross 동네가 바뀜?, km 걷는 거리 }
  function legOf(a, b, wkMax) {
    if (!a || !b || a === b) return { m: 0, walk: 1, est: false, cross: false, km: 0 };
    const key = a + '>' + b + '>' + wkMax; let r = LEGC.get(key); if (r) return r;
    const ca = clOf(a), cb = clOf(b), pa = ptOf(a), pb = ptOf(b);
    if (!pa || !pb) r = ca === cb ? { m: 10, walk: 1, est: false, cross: false, km: 0.75 } : { m: mins(ca, cb), walk: 0, est: isEst(ca, cb), cross: true, km: 0.6 };
    else {
      const d = hv(pa, pb), wk = Math.max(3, Math.round(d * 1.3 / 4.5 * 60)), c = D.places[a] ? D.places[a].city : D.cityOf[a];
      const tb = ca !== cb ? D.areas[ca + '|' + cb] || D.areas[cb + '|' + ca] : 0, f = FIT[c] || FIT[JPC.has(c) ? '_jp' : '_kr'];
      const tr = tb || (ca !== cb && D.cityOf[ca] !== D.cityOf[cb] ? 55 : Math.round(f[0] + f[1] * d));
      r = d * 1.3 <= wkMax && wk <= tr ? { m: wk, walk: 1, est: false, cross: ca !== cb, km: d * 1.3 } : { m: tr, walk: 0, est: tb ? isEst(ca, cb) : true, cross: ca !== cb, km: 0.6 };
    }
    LEGC.set(key, r); return r;
  }
  // 날짜에 따라 다른 결과가 나오게 하는 고정 난수
  function rng(seed) { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; }; }

  // 시간대 제약 (11/13): 밤에만 의미 있는 곳('night') · 아침에만 되는 곳('morning'). 식당은 영업시간 경고만(제약 없음).
  //  night = 술집(bar) · 이름·한 줄·태그에 야경/일루미네이션/야시장/포장마차/야타이/이자카야 · 영업이 17:00 이후에만 시작 · 밤 전용 조각(slots=[night])의 구경거리(sight·street·event)
  //  morning = 영업이 14:00 안에 끝남 (예: 시장 09:00–14:00). 앱이 17:30 전 = night, 12:00 이후 = morning 이면 옮김·추가를 막음
  const TW_NIGHT = /야경|일루미네이션|야시장|포장마차|야타이|이자카야/;
  function twOf(p, nightPiece) {
    if (p.kind === 'restaurant' || p.kind === 'hub') return '';
    const o = p.h && p.h.o && p.h.o.length && !/^거리/.test(p.oTx || '') ? p.h.o : null;
    if (p.kind === 'bar' || TW_NIGHT.test([p.n, p.say || '', (p.tg || []).join(' ')].join(' '))) return 'night';
    if (o && o.every(([a]) => toMin(a) >= 1020)) return 'night';
    if (nightPiece && ['sight', 'street', 'event'].includes(p.kind)) return 'night';
    if (o && o.every(([, b]) => toMin(b) <= 840)) return 'morning';
    return '';
  }
  // 장소가 그 날·그 시각에 되는지: {ok, start(기다린 뒤 시작), why}
  function openAt(p, date, t, stay) {
    const wd = WD[date.getDay()], md = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'), ymd = date.getFullYear() + '-' + md;
    if (p.sea && !p.sea.some(([a, b]) => a <= b ? md >= a && md <= b : md >= a || md <= b)) return { ok: false, why: '기간 아님' };
    if (p.mday && !p.mday.includes(date.getDate())) return { ok: false, why: '장 서는 날 아님' };
    const h = p.h; if (!h) return { ok: true, start: t, unknown: true };
    if ((h.x || []).includes(wd)) return { ok: false, why: WDK[date.getDay()] + '요일 휴무' };
    // 매월 n번째 요일 휴무 (cn = [[요일, n]])
    for (const [w, n] of h.cn || []) if (w === wd && Math.ceil(date.getDate() / 7) === n) return { ok: false, why: '매월 ' + n + '번째 ' + WDK[date.getDay()] + '요일 휴무' };
    // 휴무일: 'MM-DD'는 매년, 'YYYY-MM-DD'는 그 해 그날만 ('..'로 기간)
    for (const c of h.cd || []) { const [a, b] = c.split('..'), v = a.length > 5 ? ymd : md; if (b ? (a <= b ? v >= a && v <= b : v >= a || v <= b) : v === a) return { ok: false, why: '휴무일' }; }
    const winter = [11, 0, 1].includes(date.getMonth());
    const mo = date.getMonth() + 1, byM = h.m && Object.keys(h.m).find(k => { const [a, b] = k.split('-').map(Number); return a <= b ? mo >= a && mo <= b : mo >= a || mo <= b; });
    const ranges = (h.w && h.w[wd]) || (byM && h.m[byM]) || (winter && h.wi) || h.o; if (!ranges || !ranges.length) return { ok: true, start: t, unknown: true };
    for (const [o, c] of ranges) {
      const O = toMin(o), C = toMin(c), last = h.le ? toMin(h.le) : C;
      let s = t; if (s < O) { if (O - s > 45) continue; s = O; }
      if (s > last) continue;
      if (s + Math.min(stay, 30) > C) continue;
      return { ok: true, start: s, end: Math.min(s + stay, C), waited: s > t, opensAt: s === O && s > t ? o : null, ran: [o, c] };
    }
    return { ok: false, why: '영업시간 밖' };
  }

  // 11/19 I48: 옆 도시만 갈 때 숙소 동네·공항→숙소 이동 (gen-data cfg에 없는 값이라 여기 둠)
  //   [추정] 간사이공항→교토역 하루카 80분: JR West 공식 페이지엔 분 수가 없음(직통·운임만), 비공식 75~80분 → 긴 쪽. 가와라마치 = +20분(교토역↔가와라마치 areas 표 값)
  const SIDE_ONLY = {
    kix: { bases: [{ key: 'kyo-station', name: '교토역', re: '' }, { key: 'kyo-center', name: '가와라마치', re: '가와라마치|기온|시조|산조|河原町|祇園|四条' }],
      toBase: { KIX: { 'kyo-station': [80, 'JR 특급 하루카'], 'kyo-center': [100, 'JR 하루카 + 지하철·버스'] } }, say: { KIX: '입국 심사 → JR 표지판 · 하루카 타는 곳' } }
  };
  /* 11/22 동우님 #4: 숙소 글자 → 숙소 동네(클러스터) 키. 동네 이름·줄임말·일본어 > DB 장소 이름 > 기준 동네(bases) 정규식. 못 찾으면 '' */
  /* 11/25 동우님 피드백: 숙소를 주소·지도 링크로 넣으면 좌표(stayLL) → 그 도시 장소 중 가장 가까운 곳의 동네(5km 안). 글자 맞추기보다 먼저 */
  function nearCl(C, ll) {
    if (!ll || !isFinite(ll[0]) || !isFinite(ll[1])) return '';
    let best = '', bd = 5;
    Object.values(PL).forEach(p => { if (!p.cl || !p.ll || p.kind === 'hub' || (p.city !== C.main && p.city !== C.side)) return;
      const dy = (p.ll[0] - ll[0]) * 111, dx = (p.ll[1] - ll[1]) * 111 * Math.cos(ll[0] * Math.PI / 180), d = Math.hypot(dx, dy);
      if (d < bd) { bd = d; best = p.cl; } });
    return best;
  }
  function stayHome(C, stayRaw, matchB, ll) {
    const nc = nearCl(C, ll); if (nc) return nc;
    if (!stayRaw) return '';
    const CLS = [...new Set(Object.values(PL).filter(p => p.city === C.main || p.city === C.side).map(p => p.cl).filter(Boolean))];
    const AKA = { 'osk-minami': '도톤보리|신사이바시|닛폰바시|難波|心斎橋|Namba', 'osk-kita': '오사카역|梅田|Umeda', 'osk-tennoji': '아베노|신세카이|天王寺', 'osk-bay': '유니버설|USJ|베이 에리어', 'kyo-center': '시조|기온|가라스마|河原町|祇園|四条', 'kyo-station': '京都駅', 'kyo-arashiyama': '嵐山', 'kyo-fushimi': '伏見',
      'tyo-akiba': '아키바|秋葉原|Akihabara', 'tyo-shimokita': '시모키타|下北沢', 'tyo-asakusa': '浅草|Asakusa', 'tyo-ueno': '上野|Ueno', 'tyo-ginza': '니혼바시|유라쿠초|마루노우치|銀座|東京駅|Ginza', 'tyo-shinjuku': '新宿|Shinjuku', 'tyo-shibuya': '에비스|渋谷|Shibuya', 'tyo-harajuku': '오모테산도|原宿', 'tyo-ikebukuro': '池袋', 'tyo-shinagawa': '品川', 'tyo-bay': 'お台場|도요스',
      'fuk-hakata': '하카타|博多', 'fuk-tenjin': '다이묘|天神', 'fuk-nakasu': '캐널시티|中洲', 'spk-station': '札幌駅', 'spk-susukino': 'すすきの|스스키노', 'spk-odori': '大通',
      'sel-hongdae': '연남|합정|신촌|망원', 'sel-euljiro': '명동|을지로|충무로', 'sel-jongno': '인사동|북촌|광화문|익선동|삼청', 'sel-namsan': '서울역|용산|후암', 'sel-itaewon': '한남|해방촌', 'sel-gangnam': '신사|압구정|역삼|삼성|청담|논현', 'sel-dongdaemun': '혜화|대학로|동대문', 'sel-jamsil': '롯데월드|석촌', 'bsn-haeundae': '해운대|송정|마린시티', 'bsn-gwangalli': '광안|민락|수영', 'bsn-seomyeon': '전포|부전', 'bsn-nampo': '광복|자갈치|중앙동', 'bsn-station': '초량' };   // 11/22 #4: 흔히 쓰는 줄임말·일본어
    const clHit = k => (D.clName[k] || '').split('·').some(w => (w = w.trim()).length >= 2 && stayRaw.includes(w)) || (AKA[k] && new RegExp(AKA[k], 'i').test(stayRaw));
    const plHit = stayRaw.length >= 2 ? Object.values(PL).find(p => (p.city === C.main || p.city === C.side) && p.cl && p.kind !== 'hub' && ((p.n && p.n.length >= 3 && (stayRaw.includes(p.n) || p.n.includes(stayRaw) && stayRaw.length >= 3)) || (p.l && p.l.length >= 3 && stayRaw.includes(p.l)))) : null;
    return CLS.find(clHit) || (plHit && plHit.cl) || (matchB && matchB.key) || '';
  }
  function stayArea(dest, raw, ll) {   // 시작 화면 숙소 칸 아래 '○○에서 출발해요' (엔진과 같은 규칙) · ll = 숙소 좌표(주소·지도 링크로 넣었을 때)
    const C = D.cfg && D.cfg[dest]; raw = String(raw || '').trim(); if (!C || !raw) return '';
    const mb = C.bases.find(b => b.re && new RegExp(b.re).test(raw)) || C.bases.find(b => raw.includes(b.name.split('·')[0].trim()));
    const k = stayHome(C, raw, mb, ll); return k ? D.clName[k] || '' : '';
  }
  /* 11/25 영어판 한국 여러 도시(서울 → 부산 → 대구 등) · 공항 없는 도시(경주·강릉 등 = 인천 도착 → 기차): 도시 사이 = 기차.
     표 = 한국 도시 설정 modes.train을 한데 모은 그래프 — regions(역 ↔ 역 소요 분, 조사값) · toBase(역 → 숙소 동네). 역의 도시 = toBase 동네의 도시
     기차 탈 때마다 역에서 20분(표·타는 곳 [추정], cfg train.pre와 같음) · 내려서 10분 [추정] · 같은 도시 역 ↔ 역 = 두 역의 toBase 합(가장 짧은 동네 경유, 대략)
     열차 시각표는 없음 → 기차 시각은 대략(그날 메모로 알림) */
  const KRC = { '서울': 'sel', '부산': 'bsn', '대구': 'dgu', '경주': 'gyj', '강릉': 'gng', '전주': 'jnj', '여수': 'ysu', '수원': 'swn', '속초': 'sch', '통영': 'tyg' };   // 11/25 수원 = TAGO 직통(서울·용산·부산 등) · 속초·통영 = 버스(D.krBus)
  const RAIL = (() => {
    const E = {}, STB = {}, CITY = {}, SC = {};
    const add = (a, b, m, line) => { if (!(m > 0)) return; const L = E[a] = E[a] || [], o = L.find(x => x.to === b); if (!o) L.push({ to: b, m, line }); else if (m < o.m) { o.m = m; o.line = line; } };
    Object.values(D.cfg || {}).forEach(c => { if (!c.domestic) return; const T = (c.modes || {}).train; if (!T) return;
      Object.values(T.regions || {}).forEach(L => [].concat(L).forEach(r => { const ln = String(r.line || '열차').replace(/\s*\(.*\)\s*/g, '').trim() || '열차'; add(r.from, r.to, r.min, ln); add(r.to, r.from, r.min, ln); }));
      Object.entries(T.toBase || {}).forEach(([st, o]) => Object.entries(o).forEach(([b, v]) => { (STB[st] = STB[st] || {})[b] = v; if (D.cityOf[b]) CITY[st] = D.cityOf[b]; })); });
    Object.values(D.cfg || {}).forEach(c => { if (c.domestic) (c.bases || []).forEach(b => { if (STB[b.name] && !STB[b.name][b.key]) STB[b.name][b.key] = [0, '같은 역']; }); });
    /* 11/25 TAGO 공식 시각표(D.krRail, tools/kr_rail_tago.py): 직통 구간 소요를 이 값으로 바꿈(방향별) · 편수 n → 기다림 벌점 pen(경로 고를 때만, 화면엔 안 씀)
       pen = min(60, 450 ÷ 하루 편수)분 [추정 규칙] — 하루 3편 강릉↔부전은 60분 · 75편 서울↔부산은 6분. 새 역(부전역)의 숙소 동네 = krRail.toBase */
    const KR = D.krRail; if (KR && Array.isArray(KR.pairs)) {
      Object.entries(KR.toBase || {}).forEach(([st, o]) => Object.entries(o).forEach(([b, v]) => { (STB[st] = STB[st] || {})[b] = v; if (D.cityOf[b]) CITY[st] = D.cityOf[b]; }));
      KR.pairs.forEach(r => { if (!(r.min > 0) || !STB[r.from] || !STB[r.to]) return; const L = E[r.from] = E[r.from] || [], o = L.find(x => x.to === r.to), v = { to: r.to, m: r.min, line: r.line || '열차', pen: Math.min(60, Math.round(450 / Math.max(1, r.n || 1))) };
        if (o) Object.assign(o, v); else L.push(v); }); }
    /* 11/25 버스(D.krBus): 터미널도 같은 그래프의 '역'으로 — 소요 = TAGO 고속·시외버스, 터미널 → 숙소 동네 = 택시 (대략). 버스 구간 = bus:1 (가이드북은 기차표와 같은 카드에 버스 아이콘) */
    const KB = D.krBus, TERM = {}; if (KB && Array.isArray(KB.edges)) {
      Object.entries(KB.toBase || {}).forEach(([st, o]) => { TERM[st] = (KB.short || {})[st] || st.replace(/(고속|시외|종합)?버스터미널$|터미널$/, ''); Object.entries(o).forEach(([b, v]) => { (STB[st] = STB[st] || {})[b] = v; if (D.cityOf[b]) CITY[st] = D.cityOf[b]; }); });
      KB.edges.forEach(r => { if (!(r.min > 0) || !STB[r.from] || !STB[r.to]) return; (E[r.from] = E[r.from] || []).push({ to: r.to, m: r.min, line: r.line || '버스', bus: 1, pen: Math.min(60, Math.round(450 / Math.max(1, r.n || 1))) }); }); }
    Object.keys(STB).forEach(st => { const k = Object.keys(STB[st]).find(b => STB[st][b][0] <= 5); if (k) SC[st] = k; });
    return { E, STB, CITY, SC, TERM };
  })();
  function make(input) {
    const type =/^[LH][SE][FR][JP]$/.test(input.type || '') ? input.type : 'LSRP';
    const G = type.slice(0, 2), F = type[2] === 'F', J = type[3] === 'J';
    const DT = input.daytrip === true || input.nights === 0;   // 13b 당일치기(0박): 하루 안에 가고 오기, 숙소 없음
    const nights = DT ? 0 : Math.max(1, Math.min(6, input.nights || 3)), N = nights + 1;
    let start = input.start ? new Date(input.start + 'T00:00:00') : null, assumed = [];
    if (!start || isNaN(start)) { start = new Date(); start.setDate(start.getDate() + 21); while (start.getDay() !== 5) start.setDate(start.getDate() + 1); assumed.push('날짜 미정 → ' + (start.getMonth() + 1) + '/' + start.getDate() + '(금) 출발로 가정'); }
    const rand = rng(type + (input.start || '') + nights);
    const likes = new Set(input.likes || []), avoid = new Set(input.avoid || []);
    /* 11/22 3축 엔진: 테마 input.themes = ['kpop','kfood','kbeauty','anime'] → 그 꼬리표(조각 th · 장소 th) 먼저 · 레벨 input.level 1~5(방문 횟수) → 유명도 가중 LVK
       (Lv1 명소 쪽 +0.7 · Lv2 0 · Lv3 숨은 곳 쪽 −0.9 · Lv4+ −1.6, 로드맵 5절 비율은 가정값) · Lv2+ input.seen(지난 여행에서 간 장소 id) 은 뺌 */
    const THM = new Set(Array.isArray(input.themes) ? input.themes : []), thHit = th => !!th && th.some(x => THM.has(x));
    const LV = input.level ? Math.max(1, Math.min(5, parseInt(input.level, 10) || 1)) : 0, LVK = [0, 0.7, 0, -0.9, -1.6, -1.6][LV];
    const SEEN = new Set(LV >= 2 && Array.isArray(input.seen) ? input.seen : []);
    // 11/14 #15 A안 '빼 주세요' (옛 이름도 받음) · '@' 좋아함 규칙: @local 덜 알려진 곳 · @famous 유명한 곳 · @night 밤 조각
    const AV = { walk: avoid.has('많이 걷기') || avoid.has('많이 걷는 코스'), crowd: avoid.has('붐비는 관광지'), queue: avoid.has('줄 서는 맛집') || avoid.has('긴 줄'),
      raw: avoid.has('날것·회') || avoid.has('날것 (회·스시)'), early: avoid.has('이른 아침 일정') };
    const RAW = new Set(['스시', '카이센동', '해산물']), isRaw = tg => (tg || []).some(t => RAW.has(t));
    const busyFood = id => { const q = PL[id]; return !!q && q.kind === 'restaurant' && (q.fame || 0) >= 2; };
    // 11/24 동선: 장소 사이 이동(legOf) · 지금 서 있는 곳 POS(장소 id, 없으면 동네 키) — at(동네)과 같은 동네일 때만 믿음
    const leg = (a, b) => legOf(a, b, AV.walk ? 0.9 : 1.6);
    let POS = '', DAYIT = [], DAYMUST = [];
    // 오늘 이미 떠난 동네(지금 동네·숙소 동네 빼고) — 다시 들어가면 감점(한 동네는 몰아서)
    const leftNow = at => { const s = new Set(); let c = null; for (const x of DAYIT) if (x.pid && PL[x.pid]) { const cc = cl(x.pid); if (c && cc !== c) s.add(c); c = cc; } s.delete(at); s.delete(base); return s; };
    const posFrom = at => (POS && clOf(POS) === at ? POS : at);
    const mvItem = (to, s, L, tail) => L.walk ? { k: 'm', s, e: s + L.m, mode: 'walk', n: '걸어서', mv: '걸어서 · 약 ' + mnTx(L.m), to: PL[to] ? PL[to].q : to, ...(L.cross ? { tc: clOf(to) } : {}) }
      : { k: 'm', s, e: s + L.m, mode: 'train', n: tail ? '이동' : '대중교통', mv: (tail ? '약 ' : '대중교통 · 약 ')   /* 11/24 동우님 보드 답 3: '전철·걷기' → '대중교통'(지하철 없는 도시도 있음) */ + mnTx(L.m) + (L.est ? ' (추정)' : ''), to: PL[to] ? PL[to].q : to, tc: clOf(to) };
    const tagW = input.tagW && typeof input.tagW === 'object' ? input.tagW : null, BLANK = input.blank === true;
    const banSet = new Set(Array.isArray(input.ban) ? input.ban : []);
    const MUSTD = {}; if (input.must && typeof input.must === 'object') Object.keys(input.must).forEach(k => { const L = [].concat(input.must[k] || []).filter(id => typeof id === 'string' && !banSet.has(id)); if (L.length) MUSTD[k] = L.filter((id, j) => L.indexOf(id) === j); });
    // 비행기 (v2): 가는 편 fo · 오는 편 fb = { no 편명, dep 출발, arr 도착 }. 빈 칸은 보통 시각으로 가정 + 표시
    //   (옛 입력: flightTx 안의 시각 둘 = 가는 편)
    const hm = v => /^\d{1,2}:\d{2}$/.test(v || '') ? v.padStart(5, '0') : null;
    const tm = String(input.flightTx || '').match(/(\d{1,2}):(\d{2})/g);
    const fo = input.fo || {}, fb = input.fb || {};
    // 도시 설정 (gen-data.js의 cfg: 공항·숙소 동네·공항↔숙소 이동) — kix = 오사카·교토, tyo = 도쿄
    const C0 = (D.cfg || {})[input.dest] || (D.cfg || {}).kix;
    // 11/19 I48: 오사카·교토 묶음 안에서 고르기 input.part = 'main'(오사카만) · 'side'(교토만) · 없음(둘 다 = 기존과 같음)
    //   main = 옆 도시 가는 날 없음 / side = 숙소·공항 이동 기준을 옆 도시(SIDE_ONLY)로 바꾸고 모든 날을 옆 도시에서
    const PART = C0.side && (input.part === 'main' || (input.part === 'side' && SIDE_ONLY[input.dest || 'kix'])) ? input.part : '';
    const C1 = PART === 'main' ? { ...C0, side: null, label: C0.main } : PART === 'side' ? { ...C0, ...SIDE_ONLY[input.dest || 'kix'], airports: Object.fromEntries(Object.entries(C0.airports || {}).map(([k, a]) => [k, { ...a, say: (SIDE_ONLY[input.dest || 'kix'].say || {})[k] || a.say }])), main: C0.side, side: null, label: C0.side } : C0;
    /* 11/20 W5 외국인판(F1) input.inbound = 'ICN'|'GMP'|'PUS' (서울·부산만): 집 대신 한국 공항 도착에서 시작 → 마지막 날 공항 출국까지.
       국내 도시 설정을 해외 흐름(공항 → 숙소)으로 돌림. 공항 → 숙소 시간 = INBOUND (출처는 그 위 주석) */
    /* 11/24 동우님: 영어판(외국인) = 한국·일본 도시 전부 → 일본은 그 도시 공항(C1.airports) 도착에서 시작하는 같은 흐름(집·인천 없음) */
    /* 11/25 KRM = 영어판 한국 여러 도시(input.kx) — 도착 공항 도시와 숙소 도시가 달라도 됨(인천 도착 → 기차로 경주 등). 출국 공항 input.outbound(없으면 도착 공항) */
    const KRM = !!(input.kx && Array.isArray(input.kx.cities) && C1.domestic && INBOUND[input.inbound] && INBOUND[input.inbound].dest !== 'jej');
    const INB = KRM ? INBOUND[input.inbound] : input.inbound && (C1.domestic ? (INBOUND[input.inbound] && INBOUND[input.inbound].dest === (input.dest || '') ? INBOUND[input.inbound] : null) : (C1.airports && C1.airports[input.inbound] ? { jp: 1 } : null));
    const C = INB && !INB.jp ? { ...C1, domestic: false, airports: { [input.inbound]: INB.ap }, toBase: { [input.inbound]: INB.toBase(((KRM ? D.cfg[INB.dest] : C1).modes || {}).train || {}, ((KRM ? D.cfg[INB.dest] : C1).modes || {}).air || {}) } } : C1;
    const DOM = !!C.domestic;
    const RT = KRM && input.rt && typeof input.rt === 'object' ? input.rt : null;   // 11/25 실제 열차 시각(아래 realTrain)
    const OUTK = KRM && INBOUND[input.outbound] && INBOUND[input.outbound].dest !== 'jej' ? input.outbound : input.inbound, OAP = KRM ? INBOUND[OUTK].ap : null;   // 11/25 KRM 출국 공항
    /* 11/25 KRM 기차 경로 a → b (a·b = 숙소 동네 키 또는 'AP:ICN'): { m 총 분, segs: [{ t: 'loc'|'rail', m, how|line, from, to }] } — 가장 짧은 길(다익스트라, 위 RAIL 그래프)
       같은 도시면 기차 없이 한 줄(공항 = INBOUND toBase · 동네 사이 = mins) */
    const APT = {}, aptOf = code => APT[code] || (APT[code] = INBOUND[code] ? INBOUND[code].toBase(((D.cfg[INBOUND[code].dest] || {}).modes || {}).train || {}, ((D.cfg[INBOUND[code].dest] || {}).modes || {}).air || {}) : {});
    const isAPn = n => String(n).indexOf('AP:') === 0, cityOfN = n => isAPn(n) ? (D.cfg[(INBOUND[n.slice(3)] || {}).dest] || {}).main : D.cityOf[n];
    const hj = (a, b) => /^(지하철|전철)/.test(a) && /^(지하철|전철)/.test(b) ? '지하철' : a + ' + ' + b;   // 수단 이어 붙이기('지하철 + 전철' → '지하철')
    const locSt = (n, st) => {   // 동네·공항 n ↔ 역 st 시내 이동 [분, 수단] (그 역 도시 안)
      const S = RAIL.STB[st] || {}, T = isAPn(n) ? aptOf(n.slice(3)) : null; let best = null;
      Object.keys(S).forEach(b => { if (D.cityOf[b] !== RAIL.CITY[st]) return; let L;
        if (T) { if (!T[b]) return; L = [T[b][0] + S[b][0], S[b][0] ? hj(T[b][1], S[b][1]) : T[b][1]]; }
        else L = b === n ? [S[b][0], S[b][1]] : [S[b][0] + mins(b, n), hj(S[b][1], '전철')];
        if (!best || L[0] < best[0]) best = L; });
      return best;
    };
    const krRoute = (a, b) => {
      const ca = cityOfN(a), cb = cityOfN(b);
      if (ca && ca === cb) {
        let L; if (isAPn(a) || isAPn(b)) { const ap = isAPn(a) ? a : b, k = isAPn(a) ? b : a, T = aptOf(ap.slice(3)); L = T[k] ? T[k].slice() : null; if (!L) Object.keys(T).forEach(x => { const m = T[x][0] + mins(x, k); if (!L || m < L[0]) L = [m, T[x][1] + ' + 전철']; }); L = L || [60, '전철 (대략)']; }
        else L = [a === b ? 0 : mins(a, b), '전철'];
        return { m: L[0], segs: [{ t: 'loc', m: L[0], how: L[1], from: a, to: b }] };
      }
      const dist = { [a]: 0 }, prev = {}, Q = [a], done = new Set();
      const nb = n => { const o = [];
        if (n === a) { Object.keys(RAIL.STB).forEach(st => { if (RAIL.CITY[st] !== ca) return; const L = locSt(a, st); if (L) o.push([st, L[0], { t: 'loc', m: L[0], how: L[1] }]); }); return o; }
        (RAIL.E[n] || []).forEach(e => o.push([e.to, e.m + 20 + (e.pen || 0), { t: 'rail', m: e.m, line: e.line, pen: e.pen || 0, bus: e.bus || 0 }]));   // 11/25 pen = 편수 적은 구간 기다림 벌점(경로 고르기만)
        if (RAIL.CITY[n] === cb) { const L = locSt(b, n); if (L) o.push([b, L[0] + 10, { t: 'loc', m: L[0] + 10, how: L[1] }]); }
        Object.keys(RAIL.STB).forEach(st => { if (st === n || RAIL.CITY[st] !== RAIL.CITY[n]) return; let m = null;
          Object.keys(RAIL.STB[n]).forEach(k => { const v = RAIL.STB[st][k]; if (v && D.cityOf[k] === RAIL.CITY[n] && (m == null || RAIL.STB[n][k][0] + v[0] < m)) m = RAIL.STB[n][k][0] + v[0]; });
          if (m != null) o.push([st, m + 10, { t: 'loc', m: m + 10, how: RAIL.TERM[st] || RAIL.TERM[n] ? '택시 (대략)' : '전철' }]); });   // 11/25 역 ↔ 터미널은 택시
        return o; };
      while (Q.length) {
        let qi = 0; Q.forEach((x, j) => { if (dist[x] < dist[Q[qi]]) qi = j; }); const n = Q.splice(qi, 1)[0]; if (n === b) break; done.add(n);
        nb(n).forEach(([to, c, seg]) => { if (done.has(to)) return; const d = dist[n] + c; if (dist[to] == null || d < dist[to]) { if (dist[to] == null) Q.push(to); dist[to] = d; prev[to] = { from: n, seg }; } });
      }
      if (dist[b] == null) return { m: 180, segs: [{ t: 'loc', m: 180, how: '기차·버스 (대략)', from: a, to: b }] };
      const segs = []; for (let n = b; n !== a; n = prev[n].from) segs.unshift({ ...prev[n].seg, from: prev[n].from, to: n });
      return { m: dist[b] - segs.reduce((x, g) => x + (g.pen || 0), 0), segs };   // 벌점은 빼고 실제 분
    };   // 국내(서울·부산): 비행기 대신 기차·국내선·차·집에서 바로
    // 시·군·구 출발 (input.sgg = '서울 마포구' 같은 키, 표 = gen-data sgg): 집→공항·국내 차 구간을 그 시·군·구 중심점 기준으로 계산. 표에 없으면 null = 기존 가정값
    const SG = input.sgg && D.sgg && D.sgg[input.sgg] ? { name: input.sgg, ...D.sgg[input.sgg] } : null; let sgUsed = false;
    // 집 ↔ 공항(code) 차 시간(분) = 기준분 × 혼잡 배수 + 휴게 + airBuf. t = 공항 도착 시각(fromHub=false, 집에서 출발) 또는 공항 출발 시각(fromHub=true, 집으로). 표에 없으면 null
    const homeCarMin = (code, t, date, fromHub) => {
      const T = SG && SG.t[code]; if (!T) return null; let m = T[0];
      for (let k = 0; k < 3; k++) { const lv = ((Math.round(fromHub ? t : t - m) % 1440) + 1440) % 1440, raw = T[0] * carMult(T[1], lv, date, ''); m = Math.round(raw + Math.floor(raw / CAR_POLICY.restEvery) * CAR_POLICY.restMin + CAR_POLICY.airBuf); }
      sgUsed = true; return m;
    };
    const DEPAP = { ICN: ['ICN', '인천', '인천공항', '인천국제공항'], GMP: ['GMP', '김포', '김포공항', '김포국제공항'], PUS: ['PUS', '김해', '김해공항', '김해국제공항'] }, DA = DEPAP[input.depAp] || DEPAP.ICN;   // 11/15 #5 출발 공항
    // 11/15 #6: 하루 제목 = 그날 장소 종류로 요약 ('오사카에서의 맛집 탐방') — 길어서 '…' 안 나오게. 장소가 없으면 원래 제목
    const TH = { restaurant: '맛집', bar: '맛집', market: '맛집', cafe: '카페', shop: '쇼핑', street: '산책', sight: '명소', museum: '명소', event: '명소' };
    const TW = { 맛집: '맛집 탐방', 카페: '카페 투어', 쇼핑: '쇼핑', 산책: '골목 산책', 명소: '명소 구경' };
    const ro = w => { const c = String(w).charCodeAt(String(w).length - 1) - 0xAC00; return c >= 0 && c % 28 && c % 28 !== 8 ? '으로' : '로'; };   // 11/25 '부산으로'·'서울로'
    const josa = w => { const c = w.charCodeAt(w.length - 1) - 0xAC00; return c >= 0 && c % 28 ? '과' : '와'; };
    /* 11/24 동우님 #9: 하루 제목 = 그날 실제로 가는 곳으로 구체적으로('니조 시장과 오도리 공원') — 위에 도시 이름이 이미 있어 도시는 빼고, 한 줄(13자 안)
       대표 장소 = 머무는 시간 × 유명도가 큰 곳(식당은 덜 셈) 두 곳. 이름이 길면 '마루야마 골목 산책'처럼 동네 + 그날 성격 */
    const nmS = p => String(p.sh || p.n).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+(본점|본관|[^\s]{1,5}점)$/, '').replace(/\s+/g, ' ').trim();
    const MOOD = { 맛집: '맛집 투어', 카페: '카페 산책', 쇼핑: '쇼핑 산책', 산책: '골목 산책', 명소: '명소 산책' };
    const themeTitle = (t0, items, i, cityNm) => {
      const tm = v => typeof v === 'number' ? v : toMin(v || '0:00');
      const pl0 = items.filter(x => x.k !== 'm' && x.pid && PL[x.pid] && TH[PL[x.pid].kind]), pl1 = pl0.filter(x => x.k !== 'f' && !FOODK[PL[x.pid].kind]), pl = pl1.length ? pl1 : pl0;   // 제목 = 끼니보다 구경·산책 장소 먼저
      if (!pl.length) return t0.length > 13 ? t0.split(' — ')[0] : t0;
      const cnt = {}; pl.forEach(x => { const th = TH[PL[x.pid].kind]; cnt[th] = (cnt[th] || 0) + 1; });
      const cnt0 = {}; pl0.forEach(x => { const th = TH[PL[x.pid].kind]; cnt0[th] = (cnt0[th] || 0) + 1; });
      const top = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]);
      const sc = x => Math.max(30, tm(x.e) - tm(x.s)) * ((PL[x.pid].fame || 0) + 1.5) * (FOODK[PL[x.pid].kind] ? 0.6 : 1);
      const cn = String(cityNm || '').split('·')[0].trim(), noC = x => { if (!cn) return x; if (x.indexOf(cn + ' ') === 0 && x.length > cn.length + 2) x = x.slice(cn.length + 1); if (x.length > cn.length + 2 && x.slice(-cn.length - 1) === ' ' + cn) x = x.slice(0, -cn.length - 1); return x; };   // 도시 이름은 위에 있으니 '삿포로 TV탑' → 'TV탑'
      const hd = [...new Set(pl.slice().sort((a, b) => sc(b) - sc(a)).map(x => noC(nmS(PL[x.pid]))))], n1 = hd[0], n2 = hd[1];
      const ar = String(PL[pl[0].pid].area || D.clName[PL[pl[0].pid].cl] || '').split(/[·(]/)[0].trim(), mood = MOOD[top[0]] || '산책';
      const LWN = /^(신궁|신사|공원|타워|성|미술관|박물관|해변|해수욕장|폭포|온천|정원|전망대|시계탑|동물원|수족관|운하|호수)$/   /* '상점가·골목·시장'만 남으면 무슨 곳인지 모름 → 뺌 */, lw = x => { const w = String(x || '').split(' '); return w.length > 1 && LWN.test(w[w.length - 1]) ? w[w.length - 1] : ''; }, l2 = lw(n2);
      const mid = [n2 && n1 + '에서 ' + n2 + '까지', n2 && n1 + josa(n1) + ' ' + n2, l2 && n1 + josa(n1) + ' ' + l2, l2 && n1 + ' → ' + l2, ar && ar + ' ' + mood];   // 이름만 덩그러니는 안 씀(영어판 틀로 못 옮김)
      const C = DT || (i > 1 && i < N) ? mid : i === 1 ? hd.slice(0, 3).map(n => '도착하자마자 ' + n).concat(hd.slice(0, 3).map(n => n + '부터 시작'), [ar && '도착, ' + ar + ' ' + mood]) : hd.slice(0, 3).map(n => '마지막으로 ' + n).concat(['돌아가는 날']);
      return C.find(x => x && x.length <= 13) || (ar && (ar + ' ' + mood).length <= 13 ? ar + ' ' + mood : t0.split(' — ')[0]);
    };
    const homeTx = (hc, h) => '약 ' + mnTx(h) + (hc ? ' (차 기준, 추정)' : ' (가정)');
    // 11/20 문 앞 기준 (input.door — start.html이 서버 /door = 카카오 길찾기로 받아 넣음, 저장 안 함): 키 '허브>o|b' = { c: 차 분, p: 대중교통 분, pv: '공항버스 6002', early: 첫차 전일 수 있음 }
    // 공항 = 차 + 주차·걷기(airBuf) 기준, 대중교통은 옆에 같이 · 역 = 대중교통 기준(첫차 전이면 차). 없으면 예전처럼 시·군·구 표 / 가정
    const DOOR = input.door || {}; let doorUsed = false;
    const homeLeg = (code, t, date, back, rail) => {
      const d = DOOR[code + (back ? '>b' : '>o')], ptx = d && d.p ? (d.pv || '대중교통') + ' 약 ' + mnTx(d.p) : '';
      // 이동 줄은 한 줄(#15) → 기준 수단 하나만, 다른 수단은 alt(그날 안내 줄)
      if (d && d.p && (rail || !d.c) && !(d.early && d.c)) { doorUsed = true; return { m: d.p, tx: ptx, door: 1 }; }
      if (d && d.c) { doorUsed = true; const m = d.c + (rail ? 5 : CAR_POLICY.airBuf); return { m, tx: '차 약 ' + mnTx(m), door: 1, early: d.early, alt: !rail && ptx && !d.early ? '대중교통이면 ' + ptx : '' }; }
      const hc = rail ? null : homeCarMin(code, t, date, back), h = hc || homeMin; return { m: h, tx: homeTx(hc, h), sg: !!hc };
    };
    const stayRaw = String(input.stayTx || '').trim(), matchB = C.bases.find(b => b.re && new RegExp(b.re).test(stayRaw)) || (stayRaw && C.bases.find(b => stayRaw.includes(b.name.split('·')[0].trim())));
    /* 11/22 동우님 #4: 숙소에 적은 동네·장소(예: 아키하바라·호텔 이름 속 동네·DB 장소 이름) = 그 동네(클러스터)에서 매일 출발·복귀.
       공항·역·차 표는 기준 동네(bases)에만 있으니 표는 가장 가까운 기준 동네 + 동네 사이 시간으로 계산 */
    const HOME = stayHome(C, stayRaw, matchB, input.stayLL);
    const B = matchB || (HOME ? C.bases.slice().sort((a, b) => mins(a.key, HOME) - mins(b.key, HOME))[0] : null) || C.bases[0];
    let base = B.key; const calcName = HOME ? D.clName[HOME] || B.name : B.name;
    // 화면에 쓰는 숙소 이름: 목록에 있으면 동네 이름, 없으면 사용자가 적은 말 그대로(계산만 첫 동네 기준). 지도 검색어도 같은 말 (11/13)
    const ADDR = s => /[都道府県]\s|丁目|番地|[0-9０-９]+番|\d+(-\d+)+|[로길]\s?\d/.test(s);   // 11/25 주소로 넣은 숙소 = 화면 이름은 '○○ 숙소'(주소 전체 대신)
    const exact = input.stayKind === 'yes' && stayRaw;   // 리뷰: '정했어요'(숙소 이름)는 화면 이름·지도 검색어를 적은 그대로 — 계산만 동네(HOME)로
    let baseName = exact ? (ADDR(stayRaw) ? calcName + ' 숙소' : stayRaw.slice(0, 14)) : HOME || !stayRaw ? calcName : stayRaw.slice(0, 14), BQ = exact ? stayRaw : HOME || !stayRaw ? (D.clQ[HOME || base] || calcName) : stayRaw;
    /* 11/23 간사이 여러 도시 (동우님: '하루는 오사카, 하루는 고베에서 잘 수도 있고 · 오사카 숙소에서 고베 당일치기도') — input.kx = { cities: ['오사카','고베',…], stays: [1박째 도시, 2박째 도시, …] }
       밤마다 그 도시 숙소 · 자는 도시가 바뀌는 날 = 체크아웃 → 짐 들고 이동 → 새 숙소에 짐 · 안 자는 도시 = 당일치기(중간 날에 나눠 넣음). kx 없으면 예전과 완전히 같음 */
    const KXC = KRM ? KRC : { '오사카': 'kix', '교토': 'kyo', '나라': 'nar', '고베': 'kob' };   // 11/25 KRM = 한국 도시(KRC) — 같은 규칙, 도시 사이·공항 이동만 기차 경로(krRoute)
    const KX = (KRM || (input.dest || 'kix') === 'kix') && input.kx && Array.isArray(input.kx.cities) ? (() => {
      const cities = input.kx.cities.filter(c => KXC[c]).filter((c, k, a) => a.indexOf(c) === k); if (!cities.length) return null;
      const info = {}; let hit = '';
      cities.forEach(c => {
        const cf = KRM ? D.cfg[KXC[c]] : c === '오사카' ? D.cfg.kix : c === '교토' ? { ...D.cfg.kix, ...SIDE_ONLY.kix } : D.cfg[KXC[c]]; if (!cf || !cf.bases) return;
        const h = stayRaw ? stayHome({ ...cf, main: c, side: null }, stayRaw, null, input.stayLL) : '';
        const b0 = h ? cf.bases.slice().sort((a, b) => mins(a.key, h) - mins(b.key, h))[0] : cf.bases[0];
        const tb = ((cf.toBase || {}).KIX || {})[b0.key] || [80, '전철 (대략)'], add = h && h !== b0.key ? mins(b0.key, h) : 0;
        if (h && !hit) hit = c;
        info[c] = { key: h || b0.key, name: h ? D.clName[h] || b0.name : b0.name, tb: add ? [tb[0] + add, tb[1] + ' + 전철'] : tb };
      });
      const ok = cities.filter(c => info[c]); if (!ok.length) return null;
      const st = (Array.isArray(input.kx.stays) ? input.kx.stays : []).map(c => ok.includes(c) ? c : null), stays = [];
      for (let k = 0; k < nights; k++) stays.push(st[k] || (k ? stays[k - 1] : hit || ok[0]));
      const own = hit || stays[0] || ok[0];   // 리뷰: 숙소 이름을 적었으면(정했어요) 그 도시 숙소 = 적은 이름 그대로 — 동네를 못 찾으면 첫 밤 도시에 붙임(계산은 그 도시 중심)
      if (exact) info[own].shown = stayRaw.slice(0, 14);
      if (hit && nights && !stays.includes(hit)) assumed.push('숙소 칸 ‘' + stayRaw.slice(0, 14) + '’ = ' + hit + ' 숙소인데 ' + hit + '에서 자는 밤이 없어서 안 썼어요');   // 리뷰: 적은 숙소가 조용히 무시되지 않게
      let trips = DT ? [] : ok.filter(c => !stays.includes(c));
      if (KRM) trips = trips.filter(c => { const m = Math.min(...[...new Set(stays)].map(s => krRoute(info[s].key, info[c].key).m)); if (m <= 150) return true; assumed.push(c + ' 당일치기는 멀어서 뺐어요 · ' + c + '에서 자는 밤을 넣어 주세요'); return false; });   // 11/25 KRM: 기차 편도 2시간 반 넘는 당일치기는 안 짬
      return { cities: ok, info, stays, hit, trips };   // 리뷰: 당일치기(0박)는 첫 도시만 — 당일치기 넣을 날 안내 안 겹치게
    })() : null;
    const kxSet = c => { const x = KX.info[c]; base = x.key; baseName = x.shown || x.name; BQ = x.shown ? stayRaw : D.clQ[x.key] || x.name; return x; };   // 그날 숙소(도시)로 기준 바꿈
    /* 11/25 동우님: 한 도시 안에서 숙소가 중간에 바뀜(예: 오사카 3박 = 난바 2박 + 우메다 1박) — input.stay2 = { tx, ll, from: 두 번째 숙소에서 자는 첫 밤(2…nights) }.
       밤 k(1…nights)는 k ≥ from이면 두 번째 숙소 · 바뀌는 날(from일째) = 체크아웃 → 짐 들고 이동 → 새 숙소에 짐(간사이·한국 여러 도시 KX와 같은 모양). KX와 함께 쓰지 않음 */
    const SW = !KX && !DT && input.stay2 && nights >= 2 && String(input.stay2.tx || '').trim() ? (() => {
      const r2 = String(input.stay2.tx).trim(), m2 = C.bases.find(b => b.re && new RegExp(b.re).test(r2)) || C.bases.find(b => r2.includes(b.name.split('·')[0].trim()));
      const H2 = stayHome(C, r2, m2, input.stay2.ll), B2 = m2 || (H2 ? C.bases.slice().sort((a, b) => mins(a.key, H2) - mins(b.key, H2))[0] : null) || C.bases[0];
      const nm2 = H2 ? D.clName[H2] || B2.name : B2.name, from = Math.min(nights, Math.max(2, Math.round(+input.stay2.from) || nights));
      if (!H2) assumed.push('두 번째 숙소 ‘' + r2.slice(0, 20) + '’ → 목록에 없는 동네라 ' + nm2 + ' 기준으로 계산');
      return { from, A: { key: base, name: baseName, q: BQ }, B: { key: H2 || B2.key, bkey: B2.key, name: ADDR(r2) ? nm2 + ' 숙소' : r2.slice(0, 14), q: r2, calc: nm2 } };
    })() : null;
    const swSet = x => { base = x.key; baseName = x.name; BQ = x.q; return x; };
    const swOf = i => { if (!SW) return null; const wake = i === 1 ? null : (i - 1 >= SW.from ? 'B' : 'A'), sleep = i < N ? (i >= SW.from ? 'B' : 'A') : null;
      return { wake, sleep, home: i === 1 ? sleep || 'A' : wake, move: i > 1 && i < N && wake !== sleep }; };
    // 숙소 동네가 목록에 없으면 첫 동네로 계산 → 1일차 회색 주의에 알림 (아래 notes[1])
    const stayUnknown = stayRaw && !HOME && !(KX && KX.hit) ? '숙소 ‘' + stayRaw.slice(0, 20) + '’ → 목록에 없는 동네라 이동 시간은 ' + (KX ? '도시마다 중심 동네' : calcName) + ' 기준으로 계산' : '';
    if (stayUnknown) assumed.push(stayUnknown);
    else if (!stayRaw) assumed.push('숙소 미정 → ' + (KX ? '도시마다 중심 동네' : calcName) + ' 기준으로 계산');
    const fnoOut = String(fo.no || '').toUpperCase().slice(0, 8), fnoBack = String(fb.no || '').toUpperCase().slice(0, 8);
    const durK = m => (m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' + m % 60 + '분' : '') : m + '분');
    let apK = null, AP = null, TB = null, R = null, mode = 'intl', out, back, outOk, backOk, homeMin = 75; // 집 → 인천공항 (주소별 계산은 앱 단계, 지금은 가정)
    if (!DOM) {
      apK = C.airports[input.airport] ? input.airport : Object.keys(C.airports)[0]; AP = C.airports[apK];
      if (INB) { const a = hm(fo.arr) || AP.out[1], b = hm(fb.dep) || AP.back[0]; out = [a, a]; back = [b, b]; outOk = !!hm(fo.arr); backOk = !!hm(fb.dep);
        if (!outOk) assumed.push('도착 비행기 시각 미입력 → 시각 미정'); if (!backOk) assumed.push('출국 비행기 시각 미입력 → 시각 미정'); }
      else out = hm(fo.dep) && hm(fo.arr) ? [hm(fo.dep), hm(fo.arr)] : !input.fo && tm && tm.length >= 2 ? [tm[0].padStart(5, '0'), tm[1].padStart(5, '0')] : AP.out;
      if (!INB) { back = hm(fb.dep) && hm(fb.arr) ? [hm(fb.dep), hm(fb.arr)] : AP.back;
      outOk = !!(hm(fo.dep) && hm(fo.arr)) || (!input.fo && !!(tm && tm.length >= 2)); backOk = !!(hm(fb.dep) && hm(fb.arr));
      if (!outOk) assumed.push('가는 비행기 시각 미입력 → 시각 미정');
      if (!backOk) assumed.push('오는 비행기 시각 미입력 → 시각 미정'); }
      TB = (C.toBase[apK] || {})[base] || [60, '전철'];
    } else {
      // 출발 지역 × 교통수단 → 타는 곳·내리는 곳·소요 시간 (cfg.modes = domestic_moves_add.json 조사값)
      const M = C.modes || {}, regions = Object.keys(M.train && M.train.regions || {}).concat(Object.keys(M.car && M.car.regions || {})).concat(Object.keys(M.air && M.air.regions || {}));   // 11/23 도시추가: 비행기만 있는 도시(제주)·비행기만 있는 지역(대구←제주)도 출발 지역 인정
      let region = input.region; if (!region || !regions.concat((M.home || {}).regions || []).includes(region)) { region = '수도권'; if (!input.region) assumed.push('출발 지역 미입력 → 수도권 가정'); }
      const can = m => m === 'home' ? !!(M.home && (M.home.regions || []).includes(region)) : !!(M[m] && M[m].regions && M[m].regions[region] && [].concat(M[m].regions[region]).length);
      mode = can(input.mode) ? input.mode : ['home', 'train', 'air', 'car'].find(can) || 'car';
      if (input.mode && mode !== input.mode) assumed.push({ train: '기차', air: '비행기', car: '차', home: '집에서 바로' }[input.mode] + ' 노선 없음 → ' + { train: '기차', air: '비행기', car: '차', home: '집에서 바로' }[mode] + '로');
      if (mode === 'train' || mode === 'air') {
        const L = [].concat(M[mode].regions[region]), r = L[Math.min(L.length - 1, Math.max(0, input.line || 0))];
        R = { ...r, pre: M[mode].pre || (mode === 'air' ? 60 : 20), ex: mode === 'air' ? 20 : 10 };
        R.fromName = r.from + (mode === 'air' ? '공항' : ''); R.toName = r.to + (mode === 'air' ? '공항' : '');
        R.fc = mode === 'air' ? r.fcode : r.from.replace(/역$/, ''); R.tc = mode === 'air' ? r.tcode : r.to.replace(/역$/, '');
        R.lineTx = mode === 'air' ? '비행기' : r.line;
        const tb = ((M[mode].toBase || {})[r.to] || {})[base]; TB = tb ? [tb[0], tb[1]] : [40, '지하철·버스 (대략)'];
        homeMin = region === '수도권' ? 50 : 30;   // 집 → 역·공항 (가정). 국내선은 아래에서 시·군·구 표가 있으면 차 시간으로 바꿈
        out = hm(fo.dep) && hm(fo.arr) ? [hm(fo.dep), hm(fo.arr)] : r.out; back = hm(fb.dep) && hm(fb.arr) ? [hm(fb.dep), hm(fb.arr)] : r.back;
        outOk = !!(hm(fo.dep) && hm(fo.arr)); backOk = !!(hm(fb.dep) && hm(fb.arr));
        const w = mode === 'air' ? '비행기' : '열차';
        if (!outOk) assumed.push('가는 ' + w + ' 시각 미입력 → 시각 미정');
        if (!backOk) assumed.push('오는 ' + w + ' 시각 미입력 → 시각 미정');
        if (M[mode].preEst) assumed.push((mode === 'air' ? '공항' : '역') + ' 도착 = 출발 ' + mnTx(R.pre) + ' 전으로 가정');
        if (!tb) assumed.push(R.toName + ' → ' + baseName + ' 이동 시간은 대략값');
      } else if (mode === 'car') {
        // 차: 출발 시각만 받음 (도착 입력값이 와도 무시 → 도로 기준 표로 계산, 표에 없으면 4시간 가정). 출발 미입력 = 시각 미정(days[].tbd)
        const pt = (M.car.regions[region] || {}).pt, od = hm(fo.dep), bd = hm(fb.dep);
        const useSg = !!(SG && SG.t[base]), a0 = useSg ? 'sgg:' + SG.name : pt;   // 시·군·구 표가 있으면 지역 대표 역 대신 그 시·군·구에서 출발
        R = { carOutDep: od || '09:00', carBackDep: bd || '15:00', kOut: a0 + '>' + base, kBack: base + '>' + a0, dOut: !od, dBack: !bd }; outOk = !!od; backOk = !!bd;
        const okT = k => { const T = pairOf(k); return !!T && T.min > 0; };
        R.tabOut = !!a0 && okT(R.kOut); R.tabBack = !!a0 && okT(R.kBack); if (useSg && R.tabOut) sgUsed = true;
        // 차는 출발 시각을 안 넣어도 숨기지 않음: 가는 날 09:00 · 오는 날 15:00 출발로 계산해 보여 주고 앱에서 바꾸게 함 (비행기·열차만 '시각 미정')
        if (!od) assumed.push('차 출발 시각 미입력 → 09:00 출발로 계산');
        if (!bd) assumed.push('돌아오는 차 출발 시각 미입력 → 15:00 출발로 계산');
      } else { R = { min: (M.home && M.home.min) || 60 }; outOk = backOk = true; assumed.push('집 → 숙소 지하철 약 ' + mnTx(R.min) + ' 가정'); }
      R.region = region;
    }
    let carAdd = 0;   // 리뷰: 차 표는 기준 동네까지 → 숙소 동네까지 시내 이동을 더함(앱에서 출발 시각 바꿀 때 쓰는 표 car.d 에도)
    if (HOME && HOME !== base) { if (TB) TB = [TB[0] + mins(base, HOME), TB[1] + ' + 전철']; if (DOM && mode === 'car') carAdd = mins(base, HOME); base = HOME; } if (SW) SW.A.key = base;   // 11/25 첫 숙소 = 실제 동네   // 11/22 #4: 표 계산이 끝난 뒤 숙소 동네로
    if (DT && !backOk && out && back) {   // 당일치기: 오는 편 시각 미입력이면 가는 편 도착 6시간 뒤로 가정(순서만 쓰임)
      const oa = spanEnd(out[0], out[1]), bd0 = toMin(back[0]), bdu = spanEnd(back[0], back[1]) - bd0;
      const gap = DOM ? 360 : 480;   // 해외는 공항 수속(2시간 전)·공항 이동이 길어 8시간
      if (bd0 < oa + gap) { const nd = Math.min(toMin('21:30'), Math.ceil((oa + gap) / 30) * 30); back = [toT(nd), toT(nd + bdu)]; }
    }
    if (DT && R && R.dBack) R.carBackDep = '18:00';
    assumed.push('동네 사이 이동 시간은 대략값 · 길찾기 버튼으로 실제 시간 확인');
    // 차 구간 한 번: 출발 시각 leave(분)·날짜 → { dur(5분 단위 총 분), arr, drv(지도 링크용 점) }. 표에 없으면 null
    const carLeg = (key, leave, date) => {
      const T = pairOf(key); if (!T || !(T.min > 0)) return null;
      const raw = T.min * carMult(T.km || 999, leave, date, input.dest), rest = Math.floor(raw / CAR_POLICY.restEvery) * CAR_POLICY.restMin;
      const arr = r5(leave + raw + rest), [a, b] = key.split('>'), pa = pointOf(a), pb = pointOf(b);
      return { dur: Math.max(30, arr - leave), arr: Math.max(arr, leave + 30), rest: rest > 0, drv: pa && pb ? { a: pa, b: pb, kr: 1 } : null };
    };
    // 출발 시각(시)별 운전 시간 표 24칸 — 앱에서 출발 시각을 고치면 도착을 다시 계산하는 데 씀 (혼잡 배수가 정시 단위로 바뀌므로 시 단위면 정확)
    const carTable = (key, date) => { const d = [], rs = []; for (let h = 0; h < 24; h++) { const L = carLeg(key, h * 60, date); if (!L) return null; d.push(L.dur); rs.push(L.rest ? 1 : 0); } return { d, rs }; };
    const CAR_ASSUME = 240;   // 표에 없는 쌍: 4시간 가정 (내비로 확인)

    // 조각 점수
    const used = new Set(), usedPlaces = new Set();
    banSet.forEach(id => usedPlaces.add(id));                                   // ban = 어디서도 안 씀
    Object.keys(MUSTD).forEach(k => MUSTD[k].forEach(id => usedPlaces.add(id))); // must = 다른 날·자동 조각이 먼저 쓰지 않게 잡아 둠 (그날에만 풀림)
    let mustQ = [];                                                             // 오늘 아직 못 넣은 must
    const mustWhy = {};
    const ate = { l: false, d: false };
    /* 11/24 동우님 #9: 하루 식사 상한 = 식당·술집 3번 + 카페(디저트) 2곳 — 맛집 유형이면 식당이 6곳씩 들어가던 것. fd = 그날 넣은 수(push에서 셈) */
    const FOODK = { restaurant: 1, bar: 1 }, fd = { m: 0, c: 0 };
    // 11/24 합침: fb20의 legTo·lastLL(실제 거리)은 동선 최적화의 leg()·legOf()로 하나만 씀
    // ate = 그날 점심·저녁을 이미 먹었는지 (하루 점심 1 · 저녁 1)
    // 조각 안 식당 단계(meal)를 시각으로 이름 붙임: 점심 11:00~14:30 · 저녁 17:30~21:00 · 브런치 09:30~11:00. 맞는 끼니가 이미 있거나 시간대 밖이면 '간식'(이름만).
    // dry=true면 고치지 않고 '간식으로 바뀔 개수'만 셈
    function settleMeals(items, dry) {
      const a = dry ? { l: ate.l, d: ate.d } : ate; let clash = 0;
      for (const x of items) {
        if (!x.meal || x.meal === '간식' || !PL[x.pid]) continue;
        const s = x.s; let label = null;
        if (s >= 660 && s <= 870 && !a.l) { label = '점심'; a.l = true; }
        else if (s >= 1050 && s <= 1260 && !a.d) { label = '저녁'; a.d = true; }
        else if (s >= 570 && s < 660 && !a.l) { label = '브런치'; a.l = true; }
        if (label) { if (!dry) x.n = label + ' — ' + PL[x.pid].n; }
        else { clash++; if (!dry) { if (x.k === 'f') x.k = 'p'; x.n = PL[x.pid].n; } }
      }
      return clash;
    }
    function score(pc) {
      let s = 0;
      if (pc.fit.includes(G)) s += 6; else { if (pc.fit.some(f => f[0] === G[0])) s += 1.5; if (pc.fit.some(f => f[1] === G[1])) s += 1.5; }
      pc.tags.forEach(t => { if (likes.has(t)) s += 2; if (tagW && tagW[t]) s += tagW[t]; });
      if (AV.walk && pc.walk === 'high') s -= 8;
      if (AV.crowd) s -= pc.fame * 1.2;
      if (AV.raw && (isRaw(pc.tags) || pc.steps.some(st => PL[st.place] && isRaw(PL[st.place].tg)))) s -= 8;
      if (AV.queue && pc.steps.some(st => busyFood(st.place))) s -= 4;
      if (likes.has('@local')) s -= pc.fame * 0.8;
      if (likes.has('@famous')) s += pc.fame * 0.8;
      if (likes.has('@night') && pc.slots.includes('night')) s += 2;
      if (!F && pc.walk === 'low') s += 1;
      if (G[0] === 'H') s += pc.fame * 0.6; else s -= pc.fame * 0.4;
      if (thHit(pc.th)) s += 9;   // 11/22 테마 조각 먼저
      s += pc.fame * LVK;          // 11/22 레벨
      return s + rand() * 2.2;
    }
    /* 11/22 동우님 #11: 동선 — 지금 있는 동네에서 먼 조각일수록 감점(30분 ≈ −3.8) + 오후·밤 조각은 숙소로 돌아가는 길도 감점.
       같은 동네 안이면 감점 0 → 가까운 곳끼리 이어지고, 하루에 도시를 가로질러 갔다 왔다 하지 않게 */
    /* 11/24: 동네 대신 장소 좌표로 — 지금 선 곳 → 조각 첫 장소 + 조각 안 이동(가장 짧은 순서) + 숙소로 돌아가는 길 + 오늘 아직 못 넣은 must(직접 고른 곳)에서 먼 만큼 */
    const PIN = new Map();
    const pieceIn = pc => { let v = PIN.get(pc.id); if (v != null) return v; v = 0; const ids = pc.steps.map(s => s.place); if (ids.length > 1) v = Math.min(...perms(ids).map(o => o.reduce((m, x, k) => m + (k ? leg(o[k - 1], x).m : 0), 0))); PIN.set(pc.id, v); return v; };
    const legPen = (pc, slot, at) => { if (!at || !pc.steps.length) return 0; const a = pc.steps[0].place, z = pc.steps[pc.steps.length - 1].place, from = posFrom(at);
      const lf = leftNow(at); let p = leg(from, a).m / 8 + pieceIn(pc) / 12 + (pc.steps.some(s => lf.has(cl(s.place))) ? 1.25 : 0) + (slot === 'am' ? 0 : leg(z, base).m / (slot === 'night' ? 12 : 24));
      const mq = DAYMUST.filter(id => PL[id] && !pc.steps.some(s => s.place === id)); if (mq.length) p += Math.min(...mq.map(id => Math.min(...pc.steps.map(s => leg(s.place, id).m)))) / (mustQ.length ? 8 : 10);   // 직접 고른 곳(넣었든 아직이든) 가까이
      return p; };
    function candidates(city, slot, at) { return PC.filter(pc => pc.city === city && pc.slots.includes(slot) && !used.has(pc.id) && !pc.steps.some(st => usedPlaces.has(st.place) || SEEN.has(st.place))).map(pc => [score(pc) - legPen(pc, slot, at), pc]).sort((a, b) => b[0] - a[0]).map(x => x[1]); }
    // 조각을 지금 시각·위치에서 실제로 넣어 봄
    /* 11/24: 조각 안 장소 순서도 이동이 가장 짧게 — 원래 순서보다 4분 넘게 줄 때만 바꿔 봄(영업시간·밤/아침 전용에 걸리면 다음 순서). 실패 이유는 원래 순서 기준 */
    function tryPiece(pc, date, t, at) {
      const from = posFrom(at), orig = pc.steps;
      if (orig.length < 2 || orig.length > 4) return runSteps(pc, orig, date, t, at, from);
      const cost = o => o.reduce((m, st, k) => m + leg(k ? o[k - 1].place : from, st.place).m, 0), c0 = cost(orig) - 4;
      const alt = perms(orig).slice(1).map(o => [cost(o), o]).filter(x => x[0] < c0).sort((a, b) => a[0] - b[0]).slice(0, 5).map(x => x[1]);
      for (const o of alt) { const r = runSteps(pc, o, date, t, at, from); if (r && !r.fail) return r; }
      return runSteps(pc, orig, date, t, at, from);
    }
    function runSteps(pc, steps, date, t, at, from) {
      const items = [], warn = []; let cur = t, loc = at, pos = from, pm = 0, pcf = 0, rl = !ate.l, rd = !ate.d;   // 11/24 #9 하루 식사 상한(fb20)
      const nightPc = pc.slots && pc.slots.length === 1 && pc.slots[0] === 'night';
      for (const st of steps) {
        const p = PL[st.place]; if (!p) return null;
        if (pos !== st.place) { const L = leg(pos, st.place); if (L.m > 0) { items.push(mvItem(st.place, cur, L)); cur += L.m; } }
        const o = openAt(p, date, cur, st.stay); if (!o.ok) return { fail: p.n + ' ' + o.why };
        const s = o.start, e = s + st.stay;
        if (o.end && e > o.end + 1) return { fail: p.n + ' 닫는 시각' };
        const tw = twOf(p, nightPc);
        if (tw === 'night' && s < 1050) return { fail: p.n + ' 밤 전용(17:30 이후)' };   // 11/13: 야경·바 같은 밤 전용을 낮 시각에 넣지 않음
        if (tw === 'morning' && s >= 720) return { fail: p.n + ' 아침 전용(정오 전)' };
        if (FOODK[p.kind]) { const lab = st.meal && st.meal !== '간식' && ((s >= 570 && s <= 870 && rl) || (s >= 1050 && s <= 1260 && rd)); if (lab) { if (s <= 870) rl = false; else rd = false; } else if (fd.m + pm + rl + rd >= 3) return { fail: p.n + ' 하루 식사 3번 넘음' }; pm++; }   // 11/24 #9 끼니 자리(점심·저녁)는 남겨 둠
        else if (p.kind === 'cafe') { if (fd.c + pcf >= 2) return { fail: p.n + ' 하루 카페 2곳 넘음' }; pcf++; }
        items.push({ k: st.meal && st.meal !== '간식' ? 'f' : (o.opensAt ? 'x' : 'p'), s, e, n: (st.meal && st.meal !== '간식' ? st.meal + ' — ' : '') + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: o.unknown ? 'no' : 'ok', info: p.oTx ? [['영업', p.oTx]] : null, pid: st.place, meal: st.meal, tw: tw || undefined, oh: o.ran, _sl: pc.slots || null });
        if (o.opensAt) warn.push({ lv: 'red', ref: p.sh || p.n, t: (p.sh || p.n) + ' ' + o.opensAt + ' 문 열 때 맞춰 도착' });
        if (o.unknown) warn.push({ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 전날 확인' });
        cur = e; loc = cl(st.place); pos = st.place;
      }
      return { items, warn, end: cur, loc, pos };
    }
    // must: 그날 우선 배치. 반나절 조각 대신 그 장소 하나를 지금 시각·위치에 넣어 봄 (영업시간·밤/아침 전용·이동 규칙은 tryPiece 그대로). 안 되면 mustWhy에 이유만 남기고 다음 칸에서 다시
    function mustPiece(group, t) { const steps = group.map(id => { const p = PL[id]; return { place: id, stay: Math.min(p.st || 60, group.length > 1 ? 90 : 120), meal: p.kind === 'restaurant' ? (t >= 1050 ? '저녁' : '점심') : undefined }; }); return { id: 'must:' + group.join('+'), name: group.map(id => PL[id].sh || PL[id].n).join(' · '), steps, auto: 1 }; }
    function takeMust(date, t, at, until) {
      for (const lead of mustQ) {
        if (!PL[lead]) continue;
        const mates = mustQ.filter(x => x !== lead && PL[x] && (cl(x) === cl(lead) || leg(lead, x).m <= 15)).sort((a, b) => leg(lead, a).m - leg(lead, b).m);   // 같은 동네·15분 안 must는 한 칸에 묶어 넣어 봄 (최대 3곳, 가까운 순)
        for (let k = Math.min(2, mates.length); k >= 0; k--) {
          const group = [lead].concat(mates.slice(0, k)), r = tryPiece(mustPiece(group, t), date, t, at);
          if (r && !r.fail && r.end <= until) { settleMeals(r.items, false); mustQ = mustQ.filter(x => !group.includes(x)); group.forEach(id => { delete mustWhy[id]; }); return { pc: mustPiece(group, t), ...r, alt: null }; }
          if (k === 0) mustWhy[lead] = r && r.fail ? String(r.fail).slice((PL[lead].n || '').length + 1) : '남은 시간 부족';
        }
      }
      return null;
    }
    function place(city, slot, date, t, at, until) {
      if (mustQ.length) { const m = takeMust(date, t, at, until); if (m) return m; }
      const list = candidates(city, slot, at);
      for (const strict of [true, false]) for (const pc of list) {   // 1차: 끼니 겹치지 않는 조각 먼저, 없으면 겹치는 끼니는 '간식'으로
        const r = tryPiece(pc, date, t, at);
        if (r && !r.fail && r.end <= until && (!strict || settleMeals(r.items, true) === 0)) {
          settleMeals(r.items, false);
          used.add(pc.id); pc.steps.forEach(st => usedPlaces.add(st.place));
          let alt = null;
          if (!J) { for (const pc2 of list) { if (pc2 === pc || used.has(pc2.id)) continue; const r2 = tryPiece(pc2, date, t, at); if (r2 && !r2.fail && r2.end <= until + 30) { alt = pc2; break; } } }
          return { pc, ...r, alt };
        }
      }
      return fill(city, slot, date, t, at, until);
    }
    // 조각을 다 쓴 날(긴 여행·조각 적은 도시): 장소 DB에서 그 시각에 여는 근처 장소 두 곳으로 반나절 만들기 (v4, 11/13)
    const SEE = { sight: 1, museum: 1, street: 1, event: 1 }, ENJ = { cafe: 1, shop: 1, market: 1, bar: 1 };
    function pscore(id, p, slot, at) {
      if (p.kind === 'restaurant' || p.kind === 'hub') return -99;
      if (p.kind === 'bar' && slot !== 'night') return -99;
      let s = (G[1] === 'S' ? (SEE[p.kind] ? 3 : 1) : (ENJ[p.kind] ? 3 : 1)) + (G[0] === 'H' ? p.fame * 1.2 : -p.fame * 0.8);
      (p.tg || []).forEach(x => { if (likes.has(x)) s += 2; if (tagW && tagW[x]) s += tagW[x]; });
      if (AV.crowd) s -= (p.fame || 0) * 1.2;
      if (AV.raw && isRaw(p.tg)) s -= 8;
      if (likes.has('@local')) s -= (p.fame || 0) * 0.8;
      if (likes.has('@famous')) s += (p.fame || 0) * 0.8;
      if (thHit(p.th)) s += 5; s += (p.fame || 0) * LVK;   // 11/22 테마·레벨
      return s - leg(posFrom(at), id).m / 10 + rand();   // 11/24: 지금 선 곳에서 실제 거리
    }
    function fill(city, slot, date, t, at, until) {
      const pool = Object.entries(PL).filter(([id, p]) => p.city === city && !usedPlaces.has(id) && !SEEN.has(id)).map(([id, p]) => [pscore(id, p, slot, at), id, p]).filter(x => x[0] > -50).sort((a, b) => b[0] - a[0]);
      for (const [, a, A] of pool.slice(0, 12)) {
        const pair = pool.filter(([, b]) => b !== a && leg(a, b).m <= 15).sort((x, y) => (y[0] - leg(a, y[1]).m / 6) - (x[0] - leg(a, x[1]).m / 6)).slice(0, 4).map(x => x[1]);   // 11/24: 같은 동네 → 15분 안(가까울수록 먼저)
        for (const b of pair.concat([null])) {
          const steps = [{ place: a, stay: Math.min(A.st || 60, 120) }].concat(b ? [{ place: b, stay: Math.min(PL[b].st || 60, 120) }] : []);
          const pc = { id: 'auto:' + a + (b ? '+' + b : ''), name: (A.sh || A.n) + (b ? ' · ' + (PL[b].sh || PL[b].n) : ''), steps, auto: 1 };
          const r = tryPiece(pc, date, t, at);
          if (r && !r.fail && r.end <= until && (b || r.end - t >= 60)) { used.add(pc.id); steps.forEach(st => usedPlaces.add(st.place)); return { pc, ...r, alt: null }; }
        }
      }
      return null;
    }
    // 식사: 그 동네 · 그 시각에 여는 식당
    function meal(kind, city, date, t, at) {
      if (kind === '점심' && t < toMin('11:00')) kind = '브런치';
      if (kind === '점심' || kind === '브런치') ate.l = true; else if (kind === '저녁') ate.d = true;
      const lim = kind === '저녁' ? 1260 : 870;   // 점심 ~14:30 · 저녁 ~21:00 안에 시작
      let pool = Object.entries(PL).filter(([id, p]) => p.city === city && p.kind === 'restaurant' && !usedPlaces.has(id) && !(AV.raw && isRaw(p.tg)));
      if (SEEN.size) { const fresh = pool.filter(([id]) => !SEEN.has(id)); if (fresh.length) pool = fresh; }   // 11/22 Lv2+: 지난번 간 식당 빼기
      if (AV.queue) { const calm = pool.filter(([id]) => !busyFood(id)); if (calm.length) pool = calm; }   // 줄 서는 맛집 빼기 = 유명한 식당(fame 2 이상) 먼저 거름
      // 11/24: 지금 선 곳에서 실제 20분 안 · 가까운 순(+ 고정 난수로 조금 섞음, 테마 식당 먼저)
      const from = posFrom(at), lf = leftNow(at), near = pool.map(([id, p]) => [id, p, leg(from, id)]).filter(x => x[2].m <= 20).map(x => [x, x[2].m + (lf.has(cl(x[0])) ? 10 : 0) + rand() * 8 - (thHit(x[1].th) ? 30 : 0)]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
      for (const [id, p, L] of near) {
        const go = L.m;
        const o = openAt(p, date, t + go, p.st || 60); if (!o.ok || o.start > lim) continue;
        const dur = o.end ? Math.min(p.st || 60, o.end - o.start) : (p.st || 60); if (dur < 30) continue;   // 닫는 시각을 넘기지 않게 식사 시간을 줄임 (11/13)
        usedPlaces.add(id);
        const items = []; if (go) items.push(mvItem(id, t, L, true));
        items.push({ k: 'f', s: o.start, e: o.start + dur, n: kind + ' — ' + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: o.unknown ? 'no' : 'ok', info: p.oTx ? [['영업', p.oTx]] : null, pid: id, oh: o.ran, _ml: kind });
        return { items, end: o.start + dur, loc: cl(id), pos: id, warn: o.unknown ? [{ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 전날 확인' }] : [] };
      }
      const area = D.clName[at] || '근처';
      return { items: [{ k: 'f', s: t, e: t + 60, n: kind + ' — ' + area + ' 근처', sh: kind, say: '가서 고르기 · 줄이 길면 옆 가게로', q: D.clQ[at] || area }], end: t + 60, loc: at, warn: [] };
    }

    // 옆 도시(교토 등) 가는 날 수 — 옆 도시가 없는 곳(도쿄)은 0
    const middle = N - 2, kyotoDays = !C.side || middle <= 0 ? 0 : Math.min(middle, Math.max(1, Math.round(middle * (G === 'HS' ? 0.6 : 0.45))));
    const kyotoIdx = new Set(); if (!KX) for (let i = 0; i < kyotoDays; i++) kyotoIdx.add(2 + i * 2 <= N - 1 ? 2 + i * 2 : 2 + i);
    if (SW && kyotoIdx.has(SW.from)) {   // 리뷰 11/25: 숙소 옮기는 날엔 교토 당일치기를 넣지 않음 → 다른 중간 날로
      kyotoIdx.delete(SW.from); let j = 2; while (j < N && (kyotoIdx.has(j) || j === SW.from)) j++;
      if (j < N) kyotoIdx.add(j); else assumed.push(C.side + ' 당일치기 넣을 날이 모자라요 · 숙소 옮기는 날과 겹쳐서 뺐어요');
    }
    // 11/23 KX: 날마다 일어나는 도시(wake) · 자는 도시(sleep) · 노는 도시(play). 당일치기 도시는 짐 옮기지 않는 중간 날에 하나씩(2·4·…일째 먼저)
    const KXD = {};
    if (KX) {
      for (let i = 1; i <= N; i++) { const wake = i === 1 ? null : KX.stays[i - 2], sleep = i < N ? KX.stays[i - 1] : null; KXD[i] = { wake, sleep, move: i > 1 && i < N && wake !== sleep, home: i === 1 ? (sleep || KX.cities[0]) : wake }; KXD[i].play = KXD[i].move ? sleep : KXD[i].home; }
      const free = []; for (let i = 2; i < N; i++) if (!KXD[i].move) free.push(i);
      const order = free.filter(i => i % 2 === 0).concat(free.filter(i => i % 2 === 1));
      if (KRM) { const left = order.slice();   // 11/25 KRM: 당일치기 = 그 도시에서 가장 가까운 숙소 도시에서 자는 날(기차 시간 순, 같으면 2·4…일째 먼저)
        KX.trips.forEach(c => { if (!left.length) { assumed.push(c + ' 당일치기 넣을 날이 모자라요 · 박 수를 늘리면 들어가요'); return; } let bi = 0, bm = 1e9; left.forEach((d, j) => { const m = krRoute(KX.info[KXD[d].home].key, KX.info[c].key).m; if (m < bm) { bm = m; bi = j; } });
          if (bm > 150) { assumed.push(c + ' 당일치기는 멀어서 뺐어요 · ' + c + '에서 자는 밤을 넣어 주세요'); return; } KXD[left.splice(bi, 1)[0]].play = c; }); }
      else KX.trips.forEach((c, k) => { if (order[k] != null) KXD[order[k]].play = c; else assumed.push(c + ' 당일치기 넣을 날이 모자라요 · 박 수를 늘리면 들어가요'); });
      if (DT && KX.cities.length > 1) assumed.push('당일치기 여행은 ' + KXD[1].home + '만 짰어요');
    }
    const days = [], notes = {}; let carry = 0;
    if (SW) SW.tbA = TB;
    const swTB = () => {   // 두 번째 숙소 ↔ 공항·역 (표에 없으면 첫 숙소 값 + 두 숙소 사이 시간, 추정)
      const k = SW.B.bkey, add = SW.B.key !== k ? mins(k, SW.B.key) : 0; let v = null;
      if (!DOM && apK) v = (C.toBase[apK] || {})[k];
      else if (R && C.modes && C.modes[mode]) v = ((C.modes[mode].toBase || {})[R.to] || {})[k];
      return v ? [v[0] + add, v[1] + (add ? ' + 전철' : '')] : SW.tbA ? [SW.tbA[0] + mins(SW.A.key, SW.B.key), SW.tbA[1] + ' (추정)'] : SW.tbA;
    };
    const fmtD = d => (d.getMonth() + 1) + '. ' + d.getDate() + ' ' + WDK[d.getDay()];
    for (let i = 1; i <= N; i++) {
      const date = new Date(start); date.setDate(start.getDate() + i - 1);
      if (KX) { const x = kxSet(KXD[i].home); if (i === 1 || i === N) TB = x.tb; }
      const SWD = swOf(i); if (SWD) { swSet(SW[SWD.home]); if (i === N) TB = SWD.home === 'B' ? (SW.tbB || (SW.tbB = swTB())) : SW.tbA; }
      const city = KX ? KXD[i].play : kyotoIdx.has(i) ? C.side : C.main;
      const away = KX ? city !== KXD[i].home && !KXD[i].move : city === C.side;   // 숙소 도시 밖으로 당일치기 (예전: 교토 가는 날)
      ate.l = ate.d = false; fd.m = fd.c = 0; mustQ = (MUSTD[i - 1] || []).slice(); DAYMUST = mustQ.slice();
      const it = [], nt = []; let t, at = base; const blocks = []; POS = base; DAYIT = it;
      // 11/24: 숙소로 돌아가는 길 = 지금 선 곳(장소) → 숙소 동네 중심. 이미 숙소면 null
      const backL = () => { const f = posFrom(at); return f === base ? null : leg(f, base); };
      const backMv = (pre, n) => { const L = backL(); if (!L || !L.m) { at = base; POS = base; return 0; } it.push({ k: 'm', s: t, e: t + L.m, mode: L.walk ? 'walk' : 'train', n, mv: pre + mnTx(L.m) + (L.est ? ' (추정)' : ''), to: BQ }); t += L.m; at = base; POS = base; return L.m; };
      const push = arr => arr.forEach(x => { it.push(x); const p = x.pid && PL[x.pid]; if (p && p.kind === 'cafe') fd.c++; else if (x.k === 'f' || (p && FOODK[p.kind])) fd.m++; });   // 11/24 #9 하루 식사·카페 수 — 카페는 종류로 먼저 셈('점심 — 카페'를 식사로 세던 어긋남 고침)
      /* 11/24 하루 순서 최적화 (중간 날): 조각을 다 고른 뒤, 고정 일정(기상·숙소 휴식·체크인·이름 없는 식사·자유 시간) 사이의 장소들을
         이동 합이 가장 짧게 다시 줄 세움 — 옮기기(relocate) + 뒤집기(2-opt)를 더 못 줄일 때까지. 지키는 것: 영업시간·휴무(openAt) · 밤 전용 17:30 이후 ·
         아침 전용 정오 전 · 점심 09:30~13:30 · 저녁 17:30~20:00(원래 더 늦었으면 그 시각까지 · 원래보다 이르게는 12:00·18:30 전으로 안 당김) · 밤 조각 아닌 곳은 원래보다 늦게 18:00 넘기지 않음 ·
         다음 고정 일정 시각(끝 구간은 원래 숙소 도착 시각)을 넘기지 않음. 3분 넘게 줄 때만 바꿈 · 난수 없음(같은 입력 = 같은 결과) */
      const reseqDay = () => {
        const isStop = x => !!(x.pid && PL[x.pid] && !x.fly && x.k !== 'm');
        const fixPos = (x, p) => x.k === 'p' && /숙소|체크/.test(x.sh || x.n || '') ? base : p;
        const MLF = { 점심: [570, 870, 720], 브런치: [570, 870, 720], 저녁: [1050, 1260, 1110] };
        let k = 0, pos = base; const out = [];
        while (k < it.length) {
          const x = it[k];
          if (x.k !== 'm' && !isStop(x)) { out.push(x); pos = fixPos(x, pos); k++; continue; }
          let j = k; while (j < it.length && (it[j].k === 'm' || isStop(it[j]))) j++;
          const run = it.slice(k, j), S = run.filter(isStop), nx = it[j] || null;
          const done = () => { out.push(...run); if (S.length) pos = S[S.length - 1].pid; if (nx && fixPos(nx, '') === base && run.length && run[run.length - 1].k === 'm') pos = base; k = j; };
          if (S.length < 2) { done(); continue; }
          const P0 = pos, T0 = run[0].s, toBase = !nx || fixPos(nx, '') === base, lastCl = toBase ? '' : cl(S[S.length - 1].pid);
          const tail = run[run.length - 1].k === 'm' ? run[run.length - 1] : null;
          const Te = nx ? nx.s : (tail ? tail.e : S[S.length - 1].e + leg(S[S.length - 1].pid, base).m);
          const st = S.map(x => { const ml = (/^(점심|저녁|브런치) — /.exec(x.n || '') || [])[1] || (x.k === 'f' && x.meal) || '', w = MLF[ml];
            return { x, pid: x.pid, stay: x.e - x.s, s0: x.s, ml, w: w && [w[0], Math.max(w[1] - 60, x.s)], floor: w ? Math.min(x.s, w[2]) : 0, night: !!(x._sl && x._sl.includes('night')) || x.s >= 1080 || x.tw === 'night' }; });
          const sim = ord => {
            let t1 = T0, p = P0, cost = 0, wait = 0; const pl = [], left = new Set();
            for (const s of ord) {
              const L = leg(p, s.pid); const arr = t1 + L.m; cost += L.m;
              const c0 = clOf(p), c1 = cl(s.pid); if (c1 !== c0) { if (left.has(c1) && c1 !== base) cost += L.walk ? 4 : 15; left.add(c0); }   // 떠난 동네로 다시 = 전철 +15분 · 걸어서 +4분으로 셈(한 동네는 몰아서)
              const o = openAt(PL[s.pid], date, Math.max(arr, s.floor), s.stay); if (!o.ok) return null;
              const s1 = o.start; if (o.end && s1 + s.stay > o.end + 1) return null;
              if (s.x.tw === 'night' && s1 < 1050) return null; if (s.x.tw === 'morning' && s1 >= 720) return null;
              if (s.w && (s1 < s.w[0] || s1 > s.w[1])) return null;
              if (!s.w && !s.night && s1 >= 1080 && s1 > s.s0) return null;
              wait += s1 - arr; pl.push({ s, L, from: p, dep: t1, s1, o }); t1 = s1 + s.stay; p = s.pid;
            }
            let eL = null; if (toBase) { eL = leg(p, base); t1 += eL.m; cost += eL.m; } else if (cl(p) !== lastCl) return null;
            if (t1 > Te) return null;
            return { cost: cost + wait * 0.3, trav: cost, pl, t1, eL, last: p };
          };
          const r0 = sim(st); if (!r0) { done(); continue; }
          let best = r0, cur = st;
          // 옮기기(1~3곳 묶음, or-opt) + 뒤집기(2-opt) — 더 못 줄일 때까지
          const ORDER = () => { for (let g = 0, imp = true; imp && g < 60; g++) {
            imp = false;
            const n = cur.length, tryO = o => { const r = sim(o); if (r && r.cost < best.cost - 0.01) { best = r; cur = o; imp = true; return true; } return false; };
            for (let L = 1; L <= 3 && !imp; L++) for (let a = 0; a + L <= n && !imp; a++) for (let b = 0; b <= n - L && !imp; b++) { if (b === a) continue; const o = cur.slice(), seg = o.splice(a, L); o.splice(b, 0, ...seg); tryO(o); }
            for (let a = 0; a < n - 1 && !imp; a++) for (let b = a + 1; b < n && !imp; b++) { const o = cur.slice(0, a).concat(cur.slice(a, b + 1).reverse(), cur.slice(b + 1)); tryO(o); }
          } };
          ORDER();
          // 순서를 정한 뒤 식사(meal()이 고른 식당)만: 앞·뒤 장소 사이에서 더 가까운 식당으로 바꿔 봄(같은 도시 · 그 시각 영업 · 테마 식당이었으면 테마 식당끼리 · 피할 것 그대로)
          let swapped = 0;
          cur.forEach((s, q) => {
            if (!s.x._ml || !s.ml) return;
            const pv = q ? cur[q - 1].pid : P0, nxp = q < cur.length - 1 ? cur[q + 1].pid : toBase ? base : null, ct = PL[s.pid].city, th = thHit(PL[s.pid].th);
            const dt = id => leg(pv, id).m + (nxp ? leg(id, nxp).m : 0), d0 = dt(s.pid);
            const cand = Object.keys(PL).filter(id => { const p = PL[id]; return p.kind === 'restaurant' && p.city === ct && !usedPlaces.has(id) && !SEEN.has(id) && !(AV.raw && isRaw(p.tg)) && !(AV.queue && busyFood(id)) && (!th || thHit(p.th)) && dt(id) < d0 - 4; })
              .sort((a, b) => dt(a) - dt(b)).slice(0, 6);
            for (const id of cand) {
              const p = PL[id], o2 = cur.slice(), x2 = { ...s.x, pid: id, n: s.ml + ' — ' + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, info: p.oTx ? [['영업', p.oTx]] : null, ck: p.h ? 'ok' : 'no' };
              o2[q] = { ...s, x: x2, pid: id, stay: Math.min(s.stay, p.st || 60) < 30 ? s.stay : Math.min(s.stay, p.st || 60) };
              const r = sim(o2); if (r && r.cost < best.cost - 3) { usedPlaces.delete(s.pid); usedPlaces.add(id); best = r; cur = o2; swapped++;
                if (!p.h) nt.push({ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 전날 확인' });
                for (let z = nt.length - 1; z >= 0; z--) if (nt[z].ref === (s.x.sh || PL[s.pid].n) && / 영업시간 전날 확인$/.test(nt[z].t)) nt.splice(z, 1);
                break; }
            }
          });
          if (swapped) ORDER();
          /* 빈 시간 채우기: 줄여서 생긴 빈 시간(또는 원래 있던 빈 시간)이 75분 넘으면, 앞·뒤 장소 사이 돌아가는 길이 20분 안이고 하루 이동이 14분 넘게 늘지 않는 구경거리 하나를 끼움
             (명소·박물관·거리·쇼핑·행사만 — 식당·카페·시장·술집은 하루 식사 상한 규칙과 겹치지 않게 안 넣음). 취향 점수(pscore) 높은 곳 먼저 */
          let added = 0;
          for (let round = 0; round < 3; round++) {
            let hit = false;
            for (let q = 0; q <= cur.length && !hit; q++) {
              const pe = q ? best.pl[q - 1].s1 + cur[q - 1].stay : T0, pv = q ? cur[q - 1].pid : P0, nxp = q < cur.length ? cur[q].pid : toBase ? base : null;
              const ns = q < cur.length ? best.pl[q].s1 : Te - (toBase ? leg(pv, base).m : 0), idle = ns - pe - (q < cur.length ? leg(pv, nxp).m : 0);
              if (idle < 75) continue;
              const dt = id => leg(pv, id).m + (nxp ? leg(id, nxp).m - leg(pv, nxp).m : 0), sl = pe < 720 ? 'am' : pe < 1050 ? 'pm' : 'night';
              const cands = Object.keys(PL).filter(id => { const p = PL[id]; return SEE[p.kind] || p.kind === 'shop' ? p.city === city && !usedPlaces.has(id) && !SEEN.has(id) && dt(id) <= 20 : false; })
                .map(id => [pscore(id, PL[id], sl, cl(pv)) - dt(id) / 6, id]).filter(x => x[0] > -50).sort((a, b) => b[0] - a[0]).slice(0, 8);
              for (const [, id] of cands) {
                const p = PL[id], stay = Math.min(p.st || 60, 90, idle - dt(id) - 10); if (stay < 30) continue;
                const tw = twOf(p, false), x = { k: 'p', s: pe, e: pe + stay, n: p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: p.h ? 'ok' : 'no', info: p.oTx ? [['영업', p.oTx]] : null, pid: id, tw: tw || undefined, _sl: null };
                const o2 = cur.slice(); o2.splice(q, 0, { x, pid: id, stay, s0: pe, ml: '', w: null, floor: 0, night: pe >= 1050 || tw === 'night' });
                const r = sim(o2); if (!r || r.trav - best.trav > 14) continue;   // 늘어나는 이동(떠난 동네 다시 들어가는 셈 포함) 14분까지
                best = r; cur = o2; usedPlaces.add(id); added++; hit = true; if (!p.h) nt.push({ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 전날 확인' }); break;
              }
            }
            if (!hit) break;
          }
          if (!added && (best === r0 || r0.cost - best.cost < 3)) { done(); continue; }
          // 다시 만들기: 장소 사이 이동 줄은 새로, 장소 줄은 시각·끼니 이름·문 여는 시각 표시만 고침
          const nr = []; const refs = new Set(st.map(s => s.x.sh || PL[s.pid].n));
          for (let q = nt.length - 1; q >= 0; q--) if (nt[q].lv === 'red' && refs.has(nt[q].ref) && / 문 열 때 맞춰 도착$/.test(nt[q].t)) nt.splice(q, 1);
          best.pl.forEach(({ s, L, from, dep, s1, o }) => {
            if (L.m > 0) nr.push(s.x.k === 'f' && s.x._ml ? mvItem(s.pid, dep, L, true) : mvItem(s.pid, dep, L));
            const y = { ...s.x, s: s1, e: s1 + s.stay, oh: o.ran || s.x.oh }, p = PL[s.pid];
            if (s.ml) { const lb = s.ml === '저녁' ? '저녁' : s1 < 660 ? '브런치' : '점심'; y.n = lb + ' — ' + p.n; y.k = 'f'; }
            else { y.k = o.opensAt ? 'x' : 'p'; if (o.opensAt) nt.push({ lv: 'red', ref: p.sh || p.n, t: (p.sh || p.n) + ' ' + o.opensAt + ' 문 열 때 맞춰 도착' }); }
            nr.push(y);
          });
          let t1 = best.pl[best.pl.length - 1].s1 + best.pl[best.pl.length - 1].s.stay;
          if (toBase && best.eL && best.eL.m > 0 && (tail || nx)) {   // 숙소로 가는 줄 (끝 구간은 아래 backMv가 다시 붙임)
            const tn = tail || { n: '숙소로', mv: '숙소로 · 약 ' }, pre = String(tn.mv || '숙소로 · 약 ').replace(/약 .*$/, '약 ');
            nr.push({ ...tn, s: t1, e: t1 + best.eL.m, mode: best.eL.walk ? 'walk' : 'train', mv: pre + mnTx(best.eL.m) + (best.eL.est ? ' (추정)' : ''), to: BQ }); t1 += best.eL.m;
          }
          if (nx && t1 < nx.s && nx.k === 'p' && fixPos(nx, '') === base && nx.e != null) nx.s = t1;   // 일찍 돌아오면 숙소 휴식이 그만큼 길어짐
          out.push(...nr); pos = toBase && (tail || nx) ? base : best.last; k = j;
        }
        it.splice(0, it.length, ...out);
        // 끝 구간(숙소로 가는 줄 없음)이면 지금 위치·시각을 새 순서 기준으로
        const lastX = it[it.length - 1]; if (lastX && isStop(lastX)) { t = lastX.e; at = cl(lastX.pid); POS = lastX.pid; } else if (lastX && lastX.e != null) t = Math.max(t, lastX.e);
      };
      const addBlock = (slot, until, cityX) => { const b = place(cityX || city, slot, date, t, at, until); if (!b) return false; push(decorate(b)); nt.push(...b.warn); blocks.push(b.pc.name); t = b.end; at = b.loc; POS = b.pos || b.loc; return true; };
      const decorate = b => { const its = b.items.map(x => ({ ...x })); if (b.alt) { const f = its.find(x => x.k !== 'm'); if (f) f.say = '또는 ' + b.alt.name + (f.say ? ' · ' + f.say : ''); } return its; };
      const flushMust = until => { while (mustQ.length && t < until) { const m = takeMust(date, t, at, until); if (!m) break; push(decorate(m)); nt.push(...m.warn); blocks.push(m.pc.name); t = m.end; at = m.loc; POS = m.pos || m.loc; } };   // 그날 must가 남았으면 빈 시간에 끼움
      const addMeal = kind => { const m = meal(kind, city, date, t, at); push(m.items); nt.push(...m.warn); t = m.end; at = m.loc; POS = m.pos || POS; };
      // 11/25 KRM: 기차 경로 줄 — 역 타는 곳(20분, 갈아탈 땐 '갈아타기') → 기차(승차권 카드) → 내려서 10분 → 시내 이동. 끝 시각을 돌려줌
      let railUsed = false, railReal = 0, railEst = false, busUsed = false;
      /* 11/25 실제 열차 시각: input.rt['서울역|강릉역|20261202'] = [{ no, grade, dep, arr }] (시작 화면이 서버 /train = 국토교통부 TAGO 로 받아 넣음)
         역 도착 + 20분 뒤에 떠나는 열차 중 가장 빨리 도착하는 편(자정 넘는 편 빼고) · 없으면 조사값 소요(대략) */
      const ymd = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0');
      const realTrain = (A, Bn, tMin) => { const L = RT && RT[A + '|' + Bn + '|' + ymd(date)]; if (!Array.isArray(L)) return null; let b = null;
        L.forEach(x => { if (!/^\d{2}:\d{2}$/.test(x.dep || '') || !/^\d{2}:\d{2}$/.test(x.arr || '')) return; const d = toMin(x.dep), a = toMin(x.arr); if (a <= d || d < tMin) return; if (!b || a < b.a || (a === b.a && d > b.d)) b = { ...x, d, a }; });
        return b; };
      let railMiss = [];
      const railRun = (Rt, t0, toQ, dry) => { let t1 = t0, pr = false; const out = dry ? [] : it;   // dry = 시험 계산만(줄 안 넣음)
        Rt.segs.forEach((g, k) => {
          if (g.t === 'rail') { const A = g.from, Bn = g.to, R = g.bus ? null : realTrain(A, Bn, t1 + 20), ln = R ? R.grade || g.line : g.line, sn = x => RAIL.TERM[x] || x.replace(/역$/, '');   // 11/25 버스 = 실제 시각 없음(TAGO 버스는 당일만)
            if (!dry && !R && !g.bus && RT && Array.isArray(RT[A + '|' + Bn + '|' + ymd(date)])) railMiss.push(Bn.replace(/역$/, ''));   // 시각표는 있는데 그 뒤 열차 없음 = 막차 지남
            const wt = R ? R.d - t1 : 0;   // 역에서 기다리는 분 (실제 열차)
            out.push({ k: 'p', s: t1, e: R ? R.d : t1 + 20, sh: A, n: pr ? A + ' · 갈아타기' : A, say: (wt >= 60 ? '열차 ' + R.dep + ' 출발 · 기다리는 동안 역 근처 식사·카페 · ' : '') + (pr ? '갈아탈 열차 타는 곳 확인' : '승차권 · 타는 곳 확인'), q: A }); t1 = R ? R.d : t1 + 20;
            const ride = R ? R.a - R.d : g.m;
            out.push({ k: 'x', s: t1, e: t1 + ride, fly: [sn(A), A, sn(Bn), Bn], ride: 'train', ...(g.bus ? { bus: 1 } : {}), line: ln, pre: 20, n: ln + ' · ' + A + ' → ' + Bn, mv: ln, ...(R ? { fno: String(R.no).replace(/^0+/, ''), real: 1 } : {}) }); t1 += ride; pr = true; if (!dry) { if (g.bus) busUsed = true; else { railUsed = true; if (R) railReal++; else railEst = true; } } return; }
          let m = g.m; if (pr) { out.push({ k: 'p', s: t1, e: t1 + 10, sh: g.from, n: g.from + ' 도착', q: g.from }); t1 += 10; m -= 10; }
          if (m > 0) { out.push({ k: 'm', s: t1, e: t1 + m, mode: /^걷기/.test(g.how) ? 'walk' : 'train', n: g.how, mv: g.how + ' · 약 ' + mnTx(m), to: k === Rt.segs.length - 1 ? toQ : g.to }); t1 += m; }
          pr = false; });
        return t1; };
      /* 11/25 실제 시각표가 있으면 '언제 출발하나'를 열차에 맞춤: 첫 기차 편마다 숙소·공항에서 나설 시각 t0 = 출발 − 20분(역) − 역까지 이동
         railBy = 마감(공항 체크인)까지 닿는 가장 늦은 t0 · railNear = 원래 나설 시각 want에 가장 가까운 t0(아래 가중) */
      const railStarts = Rt => { const k = Rt.segs.findIndex(g => g.t === 'rail'); if (k < 0 || !RT) return null; const g = Rt.segs[k], L = RT[g.from + '|' + g.to + '|' + ymd(date)];
        if (!Array.isArray(L) || !L.length) return null; const lead = Rt.segs.slice(0, k).reduce((x, q) => x + q.m, 0);
        return [...new Set(L.filter(x => /^\d{2}:\d{2}$/.test(x.dep || '')).map(x => toMin(x.dep) - 20 - lead))].sort((a, b) => a - b); };
      const railBy = (Rt, dl) => { const S = railStarts(Rt); if (!S) return null; let b = null; S.forEach(t0 => { if (railRun(Rt, t0, '', true) <= dl && (b == null || t0 > b)) b = t0; }); return b; };
      // railNear 가중: 늦게 나서기(그 동네에서 더 머묾) 0.5 < 역에서 기다리기 1 < 일찍 나서기 1.5 [추정 가중]
      const railNear = (Rt, want, early) => { const S = railStarts(Rt); if (!S) return null; let b = null, bc = 1e9; S.forEach(t0 => { if (t0 < early) return; const c = (t0 < want ? (want - t0) * 1.5 : (t0 - want) * 0.5) + (railRun(Rt, t0, '', true) - t0); if (c < bc) { bc = c; b = t0; } }); return b; };   // + 가는 데 걸리는 전체(갈아타기 기다림 포함)
      const railGo = (Rt, t0, toQ) => { const s0 = railNear(Rt, t0, t0); return railRun(Rt, s0 != null ? s0 : t0, toQ); };   // 지금(t0) 뒤 가장 일찍 닿는 출발 — 늦게 나서면 그만큼 그 자리에서 더 머묾
      const rest = (len, why) => { backMv('숙소로 · 약 ', '숙소로'); it.push({ k: 'p', s: t, e: t + len, n: why, sh: '숙소 휴식', q: BQ }); t += len; at = base; POS = base; };
      // 첫날 도착 뒤: 짐 → 점심(11:00~14:30) → 오후 조각 → 체크인/휴식 → 저녁(~21:00) → 밤 조각. 한밤 도착이면 체크인만
      const arriveTail = bagSay => {
        if (t >= toMin('21:00')) { it.push({ k: 'p', s: t, e: t + 30, sh: '체크인', n: baseName + ' · 숙소 체크인', q: BQ }); t += 30; at = base; POS = base; return; }
        it.push({ k: 'p', s: t, e: t + 30, sh: '숙소 · 짐', n: baseName + ' · 숙소에 짐 맡기기', say: bagSay, q: BQ }); t += 30;
        if (!ate.l && t < toMin('12:30')) addMeal('점심');
        if (t <= toMin('15:30')) addBlock('pm', toMin(F ? '18:00' : '17:00'));
        if (!F) rest(60, '숙소 체크인 · 휴식'); else if (t < toMin('17:30')) { backMv('숙소로 · 약 ', '숙소로'); it.push({ k: 'p', s: t, e: t + 30, sh: '체크인', n: '숙소 체크인', q: BQ }); t += 30; at = base; POS = base; }
        if (!ate.d) { t = Math.max(t, toMin('18:00')); if (t <= toMin('20:30')) addMeal('저녁'); }
        if (F && t <= toMin('20:30')) addBlock('night', toMin('22:30'));
      };
      // 13b 당일치기: 도착 뒤 ~ 돌아가는 길(leave) 전까지 숙소 없이 채움 — 끼니 시간대면 식사, 아니면 조각(점심·저녁 전에 끊음)
      const dayFill = leave => {
        for (let k = 0; k < 7 && leave - t >= 90; k++) {
          if (!ate.l && t >= toMin('11:00') && t <= toMin('14:00')) { addMeal('점심'); continue; }
          if (!ate.d && t >= toMin('17:30') && t <= toMin('20:00') && leave - t >= 100) { addMeal('저녁'); continue; }
          const slot = t < toMin('12:00') ? 'am' : t < toMin('17:30') ? 'pm' : 'night';
          const until = Math.min(leave - 45, !ate.l && t < toMin('11:00') ? toMin('12:30') : !ate.d && t < toMin('17:30') ? toMin('18:00') : leave - 45);
          if (until - t >= 60 && addBlock(slot, until)) continue;
          if (!ate.l && t < toMin('11:00')) { t = toMin('11:00'); continue; }
          if (!ate.d && t < toMin('17:30') && leave - toMin('17:30') >= 100) { t = toMin('17:30'); continue; }
          break;
        }
        if (mustQ.length) flushMust(leave - 45);
        // 돌아가는 길까지 30분 넘게 남으면 빈칸 대신 '자유 시간'(지금 있는 동네에서)
        const back0 = (backL() || { m: 0 }).m, free = leave - back0 - t;
        if (free >= 30) { const nm = D.clName[at] || baseName; it.push({ k: 'p', s: t, e: t + free, sh: '자유 시간', n: '자유 시간 — ' + nm, say: '근처 산책·기념품 · 돌아가는 시각 확인', q: D.clQ[at] || nm }); t += free; }
      };
      // 마지막 날 아침: 체크아웃을 출발(leave)보다 30분 앞으로, 기상은 그보다 30분 앞 (이른 비행기·열차)
      const checkoutMorning = leave => {
        const ck = Math.min(toMin('10:00'), leave - 30);
        it.push({ k: 'w', s: Math.min(toMin('08:30'), ck - 30), n: '기상', say: '짐 싸기' });
        it.push({ k: 'p', s: ck, e: ck + 30, sh: '체크아웃', n: '체크아웃', q: BQ }); return ck + 30;
      };
      let title = '', route = [];
      if (i === 1 && DOM) {
        if (R.pre) {   // 기차·국내선
          const dep = toMin(out[0]), arr = spanEnd(out[0], out[1]), hub = dep - R.pre, HL = homeLeg(R.fc, hub, date, false, mode !== 'air'), hmo = HL.m, leave = hub - hmo; if (HL.alt) nt.push({ lv: 'gray', t: HL.alt });
          it.push({ k: 'w', s: leave - 45, n: '기상', say: mode === 'air' ? '신분증·지갑·충전기 확인' : '승차권·지갑·충전기 확인' });
          it.push({ k: 'm', s: leave, e: hub, mode: 'home', hub: R.fc, n: '집에서 출발', mv: '집 → ' + R.fromName + ' · ' + HL.tx, to: R.fromName });
          it.push({ k: 'p', s: hub, e: dep, sh: R.fromName, n: R.fromName, say: mode === 'air' ? '탑승 수속·보안 검색 먼저' : '타는 곳 확인', q: R.fromName });
          it.push({ k: 'x', s: dep, e: arr, fly: [R.fc, R.fromName, R.tc, R.toName], ride: mode, line: R.lineTx, pre: R.pre, fno: fnoOut || undefined, n: R.lineTx + ' · ' + R.fromName + ' → ' + R.toName + (fnoOut ? ' ' + fnoOut : ''), mv: R.lineTx });
          it.push({ k: 'p', s: arr, e: arr + R.ex, sh: R.toName, n: R.toName + ' 도착', say: TB[1] + ' 타는 곳으로', q: R.toName });
          it.push({ k: 'm', s: arr + R.ex, e: arr + R.ex + TB[0], mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + mnTx(TB[0]) + '', to: BQ });
          t = r5(arr + R.ex + TB[0]); route = ['집', R.fromName, R.toName, baseName];
        } else if (mode === 'car') {
          const leave = toMin(R.carOutDep), L = R.tabOut ? carLeg(R.kOut, leave, date) : null, dur = (L ? L.dur : CAR_ASSUME) + carAdd, arrv = leave + dur, tb0 = R.tabOut ? carTable(R.kOut, date) : null, tb = tb0 && carAdd ? { ...tb0, d: tb0.d.map(x => x + carAdd) } : tb0;
          it.push({ k: 'w', s: leave - 45, n: '기상', say: '짐 싣기 · 주차 확인' });
          it.push({ k: 'x', s: leave, e: arrv, mode: 'car', ride: 'car', fly: ['집', '집', baseName, baseName], car: { d: tb && tb.d, rs: tb && tb.rs, est: !!L, rest: !!(L && L.rest), park: L ? CAR_POLICY.parkMin : 0, dflt: R.dOut || undefined }, n: '차 · 집 → ' + baseName, to: BQ, drv: L ? L.drv : undefined });
          t = r5(arrv + (L ? CAR_POLICY.parkMin : 0)); route = ['집', baseName];
        } else {
          const leave = toMin('10:00');
          it.push({ k: 'w', s: leave - 60, n: '기상', say: '짐 챙기기' });
          it.push({ k: 'm', s: leave, e: leave + R.min, mode: 'home', n: '집에서 출발', mv: '집 → ' + baseName + ' · 지하철 약 ' + mnTx(R.min) + ' (가정)', to: BQ });
          t = r5(leave + R.min); route = ['집', baseName];
        }
        if (!DT) { arriveTail(mode === 'car' ? '체크인 전 짐·주차' : '체크인 전 짐만 보관'); if (mustQ.length && t < toMin('21:30')) flushMust(toMin('22:30')); }
        title = (mode === 'home' ? '집에서 바로 ' : '도착하자마자 ') + (blocks[0] || '동네 산책');
        if (DT) { const ro = route; backDom(true); title = '당일치기 — ' + (blocks[0] || '동네 산책'); route = ro.concat(route.slice(1)); }
      } else if (i === N && DOM) backDom(false);
      else if (i === 1 && INB) {   // W5 F1: 한국 공항 도착에서 시작 (집·출국 없음)
        const arr = toMin(out[1]), ex = 60, tr = TB[0], Rt = KRM ? krRoute('AP:' + apK, base) : null;   // 11/25 KRM: 공항 → (기차) → 숙소 도시
        it.push({ k: 'p', s: arr, e: arr + ex, sh: AP.name + '공항', n: AP.name + '공항 도착', l: AP.l, say: AP.say, q: AP.q });
        const t1 = Rt ? railGo(Rt, arr + ex, BQ) : (it.push({ k: 'm', s: arr + ex, e: arr + ex + tr, mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + mnTx(tr), to: BQ }), arr + ex + tr);
        nt.push({ lv: 'gray', t: '입국 심사·짐 찾기 약 1시간 · 붐비면 더 걸려요' });
        t = r5(t1); if (!DT) { arriveTail('체크인 전 짐만 보관'); if (mustQ.length && t < toMin('21:30')) flushMust(toMin('22:30')); }
        title = '도착하자마자 ' + (blocks[0] || '동네 산책'); route = [AP.name + '공항'].concat(Rt ? Rt.segs.filter(g => g.t === 'rail').flatMap(g => [g.from, g.to]) : [], [baseName]);
        if (DT) { const ro = route; backIntl(true); title = '당일치기 — ' + (blocks[0] || '동네 산책'); route = ro.concat(route.slice(1)); }
      }
      else if (i === 1) {
        const dep = toMin(out[0]), arr = spanEnd(out[0], out[1]), airport = dep - 120, HL = homeLeg(DA[0], airport, date, false, false), hmo = HL.m, leave = airport - hmo;
        if (HL.early) nt.push({ lv: 'amber', t: '새벽 출발 · 대중교통은 첫차 전일 수 있어요 · 차·택시 기준' });
        if (HL.alt) nt.push({ lv: 'gray', t: HL.alt });
        if ((HL.sg || HL.door) && leave - 45 < 0) nt.push({ lv: 'amber', t: '집 출발이 자정 전 · 전날 공항 근처에서 자는 것도 방법' });
        it.push({ k: 'w', s: leave - 45, n: '기상', say: '여권·지갑·충전기 확인' });
        it.push({ k: 'm', s: leave, e: airport, mode: 'home', hub: DA[0], n: '집에서 출발', mv: '집 → ' + DA[2] + ' · ' + HL.tx, to: DA[3] });
        it.push({ k: 'p', s: airport, e: dep, sh: DA[2], n: DA[2], say: '체크인·출국 심사 먼저', q: DA[3] });
        it.push({ k: 'x', s: dep, e: arr, fly: [DA[0], DA[1], apK, AP.name], fno: fnoOut || undefined, n: '비행기 · ' + DA[1] + ' → ' + AP.name + (fnoOut ? ' ' + fnoOut : ''), mv: '비행기' });
        it.push({ k: 'p', s: arr, e: arr + 60, sh: AP.name + '공항', n: AP.name + '공항 도착', l: AP.l, say: AP.say, q: AP.q });
        const tr = TB[0];
        it.push({ k: 'm', s: arr + 60, e: arr + 60 + tr, mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + mnTx(tr) + '', to: BQ });
        t = r5(arr + 60 + tr); if (!DT) { arriveTail('체크인 전 짐만 보관'); if (mustQ.length && t < toMin('21:30')) flushMust(toMin('22:30')); }
        title = '도착하자마자 ' + (blocks[0] || '동네 산책'); route = ['집', DA[2], AP.name + '공항', baseName];
        if (DT) { const ro = route; backIntl(true); title = '당일치기 — ' + (blocks[0] || '동네 산책'); route = ro.concat(route.slice(1)); }
      } else if (i === N) backIntl(false);
      else {
        const wake = AV.early ? '09:00' : F ? '07:30' : '08:30'; let wakeM = toMin(wake);   // 이른 아침 빼기 = 중간 날 09:00 기상
        if (i === 2 && carry) wakeM = Math.max(wakeM, Math.min(carry + 420, toMin('11:30')));   // 전날 한밤 도착이면 늦게 일어남
        let mvFrom = null;
        if (SWD && SWD.move) {   // 11/25 같은 도시 안 숙소 바꾸는 날 = 체크아웃 → 짐 들고 이동 → 새 숙소에 짐 맡기기 → 그 동네에서 하루
          const oldB = SW.A.key, oldN = SW.A.name, oldQ = SW.A.q; mvFrom = oldN; swSet(SW.B); const mv = mins(oldB, base);
          const ck = Math.max(wakeM + 45, toMin(F ? '09:00' : '10:00'));
          it.push({ k: 'w', s: wakeM, n: '기상', say: '짐 싸기 · 오늘 ' + baseName + ro(baseName) + ' 숙소 옮기는 날' });
          it.push({ k: 'p', s: ck, e: ck + 20, sh: '체크아웃', n: oldN + ' · 체크아웃', q: oldQ });
          if (oldB !== base && mv) it.push({ k: 'm', s: ck + 20, e: ck + 20 + mv, mode: 'train', n: '짐 들고 이동', mv: oldN + ' → ' + baseName + ' · 짐 들고 · 약 ' + mnTx(mv) + estTx(oldB, base), to: BQ, tc: base });
          const tA = ck + 20 + (oldB !== base ? mv : 15);
          it.push({ k: 'p', s: tA, e: tA + 30, sh: '숙소 · 짐', n: baseName + ' · 숙소에 짐 맡기기', say: '체크인 전 짐만 보관', q: BQ });
          t = tA + 30; at = base; POS = base;
        } else if (KX && KXD[i].move) {   // 11/23 KX: 자는 도시가 바뀌는 날 = 체크아웃 → 짐 들고 이동 → 새 숙소에 짐 맡기기 → 그 도시에서 하루
          const oldB = base, oldN = baseName, oldQ = BQ; mvFrom = oldN; kxSet(KXD[i].sleep); const Rt = KRM ? krRoute(oldB, base) : null, mv = Rt ? Rt.m : mins(oldB, base);
          let ck = Math.max(wakeM + 45, toMin(F ? '09:00' : '10:00'));
          let st0 = null;   // 숙소 나서는 시각(실제 열차에 맞춤)
          if (Rt) { const s0 = railNear(Rt, ck + 20, toMin('07:15') + 20); if (s0 != null) { ck = Math.min(s0 - 20, Math.max(ck, toMin('11:00'))); wakeM = Math.min(wakeM, ck - 45); st0 = s0; } }   // 11/25 실제 열차: 체크아웃을 열차에 맞춤(늦어도 11:00, 일찍은 07:15까지)
          it.push({ k: 'w', s: wakeM, n: '기상', say: '짐 싸기 · 오늘 ' + KXD[i].sleep + ro(KXD[i].sleep) + ' 숙소 옮기는 날' });
          it.push({ k: 'p', s: ck, e: ck + 20, sh: '체크아웃', n: oldN + ' · 체크아웃', q: oldQ });
          let tA = ck + 20 + mv;
          if (st0 != null && st0 > ck + 35) it.push({ k: 'p', s: ck + 20, e: st0, sh: '짐 맡기고 산책', n: oldN + ' · 짐 맡기고 근처 산책', say: '숙소에 짐 맡기고 · 열차 시각에 맞춰 출발', q: oldQ });   // 11/25 체크아웃(늦어도 11:00) 뒤 열차까지
          if (Rt) tA = railRun(Rt, st0 != null ? Math.max(ck + 20, st0) : ck + 20, BQ);   // 11/25 KRM: 기차로 짐 들고 이동 (도착 = 실제 열차 시각이면 그 시각 · 리뷰: 예전엔 조사값 mv로 셈)
          else it.push({ k: 'm', s: ck + 20, e: ck + 20 + mv, mode: 'train', n: '짐 들고 이동', mv: KXD[i].wake + ' → ' + KXD[i].sleep + ' · 짐 들고 · 약 ' + mnTx(mv) + estTx(oldB, base), to: BQ, tc: base });
          it.push({ k: 'p', s: tA, e: tA + 30, sh: '숙소 · 짐', n: baseName + ' · 숙소에 짐 맡기기', say: '체크인 전 짐만 보관', q: BQ });
          t = tA + 30; at = base; POS = base;
        } else {
        it.push({ k: 'w', s: wakeM, n: '기상', say: [baseName + ' 숙소에서 출발', away ? '편한 신발 · ' + city + '까지 이동' : ''].filter(Boolean).join(' · ') });   // 11/22 #4: 출발지 = 숙소 동네
        t = Math.max(toMin(AV.early ? '10:30' : F ? '09:00' : '10:00'), wakeM + 45);
        if (KRM && away) { const tk = KX.info[city].key, R0 = krRoute(base, tk), s0 = railNear(R0, t, toMin('07:15'));   // 11/25 실제 열차: 숙소 나서는 시각을 열차에 맞춤(일찍이면 기상도 당김)
          if (s0 != null) { if (s0 < t) { const w = it[it.length - 1]; if (w && w.k === 'w') w.s = Math.min(w.s, s0 - 45); } t = s0; }
          t = r5(railRun(R0, t, D.clQ[tk] || city)); at = tk; POS = tk; }   // 11/25 KRM 당일치기: 기차로 그 도시 → 하루 → 기차로 숙소
        }
        addBlock('am', toMin('13:30'));
        if (!ate.l) { t = Math.max(t, toMin('12:00')); if (t <= toMin('14:30')) addMeal('점심'); }
        addBlock('pm', toMin(F ? '18:30' : '17:00'));
        // 오후가 길게 비면 조각 하나 더 (알차게 = 저녁 전까지, 여유롭게 = 휴식 전까지 1시간 40분 이상 남을 때)
        if (t + 100 <= toMin(F ? '18:30' : '16:30')) addBlock('pm', toMin(F ? '18:30' : '17:00'));
        const krB = KRM && away ? krRoute(at, base).m : 0;
        if (!F && !(KRM && away) && !(KX && away && (backL() || { m: 0 }).m > 45)) rest(away ? 45 : 75, '숙소 휴식');   // 리뷰: 먼 당일치기(나라↔고베 등)는 숙소 왕복 휴식 대신 그 도시에서 저녁까지
        if (!ate.d) { t = Math.max(t, toMin('18:30')); if (t <= toMin('21:00')) addMeal('저녁'); }
        if ((F || likes.has('@night')) && t <= toMin('20:30') && krB <= 60) addBlock('night', toMin('22:00'));   // 야경·밤 산책을 고르면 여유형도 밤 조각 하나
        if (mustQ.length) flushMust(toMin('22:00'));
        const atEnd = at;
        if (KRM && away) { t = r5(railGo(krRoute(at, base), t, BQ)); at = base; POS = base; }   // 11/25 KRM: 당일치기 날은 순서 다시 줄 세우기 없이(기차 줄이 고정) 기차로 숙소
        else { reseqDay(); if (posFrom(at) !== base) backMv('숙소로 · 약 ', '숙소로'); }
        title = (away ? city + ' — ' : '') + (blocks.slice(0, 2).join(' · ') || '자유 일정');
        route = (mvFrom ? [mvFrom] : [baseName]).concat(it.filter(x => x.fly || x.tc).flatMap(x => x.fly ? [x.fly[1], x.fly[3]] : [D.clName[x.tc]])).concat(atEnd === base && at === base ? [] : [baseName]);   // 리뷰: 짐 옮기는 날은 전 숙소에서 시작
      }
      function backDom(dt) {
        let hub = null, leave, dep, arr;
        if (R.pre) { dep = toMin(back[0]); arr = spanEnd(back[0], back[1]); hub = dep - R.pre; leave = hub - (TB[0] + 5); }
        else leave = toMin(mode === 'car' ? R.carBackDep : '17:00');
        let leave2 = leave;
        if (dt) dayFill(leave); else t = checkoutMorning(leave);
        if (leave - t >= 150) { addBlock('am', leave - 60); }
        if (leave - t >= 50 && !ate.l && t <= toMin('14:30')) { const m = meal('점심', city, date, t, at); if (m.end + leg(m.pos || m.loc, base).m <= leave) { push(m.items); t = m.end; at = m.loc; POS = m.pos || POS; } else { it.push({ k: 'f', s: t, e: t + 40, n: (t < 660 ? '브런치' : '점심') + ' — ' + baseName + ' 근처', sh: '점심', say: '출발 전 간단히', q: BQ }); t += 40; at = base; POS = base; } }
        if (R.pre && leave - t >= 150) { addBlock('pm', leave - 60); }
        if (mustQ.length) flushMust(leave - 60);
        if (posFrom(at) !== base) backMv(dt ? '돌아가는 길 · 약 ' : '짐 찾으러 · 약 ', dt ? '이동' : '숙소로');
        if (t > leave) leave2 = t;
        if (R.pre) {
          it.push({ k: 'm', s: leave2, e: Math.max(hub, leave2 + TB[0]), mode: 'train', n: TB[1], mv: R.toName + '으로 · ' + TB[1] + ' 약 ' + mnTx(TB[0]) + '', to: R.toName });
          it.push({ k: 'x', s: Math.min(dep, Math.max(hub, leave2 + TB[0])), e: dep, sh: R.toName, n: R.toName + (mode === 'air' ? ' · 탑승 수속' : ' · 타는 곳'), say: mode === 'air' ? '신분증 · 출발 ' + mnTx(R.pre) + ' 전 도착' : '기념품은 역 안에서', q: R.toName });
          it.push({ k: 'x', s: dep, e: arr, fly: [R.tc, R.toName, R.fc, R.fromName], ride: mode, line: R.lineTx, pre: R.pre, fno: fnoBack || undefined, n: R.lineTx + ' · ' + R.toName + ' → ' + R.fromName + (fnoBack ? ' ' + fnoBack : ''), mv: R.lineTx });
          it.push({ k: 'p', s: arr, e: arr + R.ex, sh: R.fromName, n: R.fromName + ' 도착', q: R.fromName });
          const HL = homeLeg(R.fc, arr + R.ex, date, true, mode !== 'air'), hmb = HL.m; if (HL.alt) nt.push({ lv: 'gray', t: HL.alt });
          it.push({ k: 'm', s: arr + R.ex, e: arr + R.ex + hmb, mode: 'home', hub: R.fc, n: '집으로', mv: R.fromName + ' → 집 · ' + HL.tx });
          it.push({ k: 'p', s: arr + R.ex + hmb, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
          if (backOk) nt.push({ lv: 'red', ref: R.toName, t: R.toName + ' ' + toT(hub) + '까지 도착 · 출발 ' + mnTx(R.pre) + ' 전' });
          route = [baseName, R.toName, R.fromName, '집'];
        } else {
          const LB = mode === 'car' && R.tabBack ? carLeg(R.kBack, leave2, date) : null;
          const drive = (LB ? LB.dur : mode === 'car' ? CAR_ASSUME : R.min) + (mode === 'car' ? carAdd : 0);
          if (mode === 'car') { const tb0 = R.tabBack ? carTable(R.kBack, date) : null, tb = tb0 && carAdd ? { ...tb0, d: tb0.d.map(x => x + carAdd) } : tb0; it.push({ k: 'x', s: leave2, e: leave2 + drive, mode: 'car', ride: 'car', fly: [baseName, baseName, '집', '집'], car: { d: tb && tb.d, rs: tb && tb.rs, est: !!LB, rest: !!(LB && LB.rest), park: 0, dflt: R.dBack || undefined }, n: '차 · ' + baseName + ' → 집', to: '집', drv: LB ? LB.drv : undefined }); }
          else it.push({ k: 'm', s: leave2, e: leave2 + drive, mode: 'home', n: '집으로', mv: baseName + ' → 집 · 지하철 약 ' + mnTx(R.min) + ' (가정)' });
          it.push({ k: 'p', s: leave2 + drive, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
          if (mode === 'car') nt.push({ lv: 'gray', t: '일·연휴 오후 고속도로 막힘 · 출발 확인' });
          route = [baseName, '집'];
        }
        title = '돌아가는 날' + (blocks[0] ? ' — ' + blocks[0] : '');
      }
      function backIntl(dt) {
        if (KRM) AP = OAP;   // 11/25 KRM: 출국 공항(도착 공항과 다를 수 있음) · 숙소 → (기차) → 공항
        const RtB = KRM ? krRoute(base, 'AP:' + OUTK) : null;
        const dep = toMin(back[0]), arr = spanEnd(back[0], back[1]), airport = dep - 120, rb = RtB ? railBy(RtB, airport) : null, leave = rb != null ? rb : airport - ((RtB ? RtB.m : TB[0]) + 5); let leave2 = leave;   // 11/25 실제 열차: 체크인 시각까지 닿는 가장 늦은 편
        if (dt) dayFill(leave); else t = checkoutMorning(leave);
        if (leave - t >= 150) { addBlock('am', leave - 60); }
        if (leave - t >= 50 && !ate.l && t <= toMin('14:30')) { const m = meal('점심', city, date, t, at); if (m.end + leg(m.pos || m.loc, base).m <= leave) { push(m.items); t = m.end; at = m.loc; POS = m.pos || POS; } else { it.push({ k: 'f', s: t, e: t + 40, n: (t < 660 ? '브런치' : '점심') + ' — ' + baseName + ' 역 근처', sh: '점심', say: '공항 가기 전 간단히', q: BQ }); t += 40; at = base; POS = base; } }
        if (mustQ.length) flushMust(leave - 60);
        if (posFrom(at) !== base) backMv(dt ? '돌아가는 길 · 약 ' : '짐 찾으러 · 약 ', dt ? '이동' : '숙소로');
        if (t > leave) leave2 = t;
        if (RtB) railRun(RtB, leave2, AP.q);
        else it.push({ k: 'm', s: leave2, e: Math.max(airport, leave2 + TB[0]), mode: 'train', n: TB[1], mv: '공항으로 · ' + TB[1] + ' 약 ' + mnTx(TB[0]) + '', to: AP.q });
        it.push({ k: 'x', s: airport, e: dep, sh: AP.name + '공항', n: AP.name + '공항 · 체크인', l: AP.l, say: '면세품 있으면 세관 먼저', q: AP.q });
        if (INB) {   // W5 F1: 출국 비행기가 마지막 (그 뒤 도착·집 없음)
          it.push({ k: 'x', s: dep, e: dep + 5, n: '출국 비행기' + (fnoBack ? ' ' + fnoBack : ''), sh: '출국', q: AP.q });
          if (backOk) nt.push({ lv: 'red', ref: AP.name + '공항', t: AP.name + '공항 ' + toT(airport) + '까지 도착 · 출발 2시간 전' });
          nt.push({ lv: 'gray', t: '세금 환급(택스 리펀드)은 출국 심사 전에' });
          title = '돌아가는 날' + (blocks[0] ? ' — ' + blocks[0] : ''); route = [baseName].concat(RtB ? RtB.segs.filter(g => g.t === 'rail').flatMap(g => [g.from, g.to]) : [], [AP.name + '공항']); return;
        }
        it.push({ k: 'x', s: dep, e: arr, fly: [apK, AP.name, DA[0], DA[1]], fno: fnoBack || undefined, n: '비행기 · ' + AP.name + ' → ' + DA[1] + (fnoBack ? ' ' + fnoBack : ''), mv: '비행기' });
        it.push({ k: 'p', s: arr, e: arr + 50, sh: DA[2], n: DA[2] + ' 도착', q: DA[3] });
        const HB = homeLeg(DA[0], arr + 50, date, true, false), hmb = HB.m; if (HB.alt) nt.push({ lv: 'gray', t: HB.alt });
        it.push({ k: 'm', s: arr + 50, e: arr + 50 + hmb, mode: 'home', hub: DA[0], n: '집으로', mv: DA[2] + ' → 집 · ' + HB.tx });
        it.push({ k: 'p', s: arr + 50 + hmb, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
        if (backOk) nt.push({ lv: 'red', ref: AP.name + '공항', t: AP.name + '공항 ' + toT(airport) + '까지 도착 · 출발 2시간 전' });
        nt.push({ lv: 'gray', t: '면세품은 짐 부치기 전 세관 먼저' });
        title = '돌아가는 날' + (blocks[0] ? ' — ' + blocks[0] : ''); route = [baseName, AP.name + '공항', DA[2], '집'];
      }
      // 못 넣은 must → 그날 메모 (맨 앞)
      if (mustQ.length) mustQ.slice().reverse().forEach(id => nt.unshift({ lv: 'amber', t: (PL[id] ? PL[id].sh || PL[id].n : id) + ' 빠짐 · ' + (mustWhy[id] || '시간 부족') }));
      // blank: 관광·식당 장소와 그 사이 이동·숙소 휴식을 걷어 내고 뼈대만 남김. 그날 동네 이름은 area·제목에 유지
      let areaDay = null;
      if (BLANK) {
        areaDay = []; const gone = new Set();
        const isGone = x => !x.fly && ((x.pid && PL[x.pid]) || x.k === 'f' || (x.k === 'm' && (x.tc || x.mode === 'walk' || x.n === '숙소로')) || (x.k === 'p' && x.n === '숙소 휴식'));
        it.forEach(x => { if (!isGone(x)) return; const c0 = x.pid && PL[x.pid] ? cl(x.pid) : x.tc; const nm = c0 && D.clName[c0]; if (nm && !areaDay.includes(nm)) areaDay.push(nm); if (x.pid && PL[x.pid]) { gone.add(PL[x.pid].sh || PL[x.pid].n); gone.add(PL[x.pid].n); } });
        const keep = it.filter(x => !isGone(x)); it.splice(0, it.length, ...keep);
        for (let k = nt.length - 1; k >= 0; k--) if (/^늦어지면 /.test(nt[k].t) || (nt[k].ref && gone.has(nt[k].ref))) nt.splice(k, 1);
        blocks.length = 0;
        if (!areaDay.length) areaDay.push(baseName);
        const ar = areaDay;
        if (i === 1) title = '도착하는 날 — ' + ar[0]; else if (i === N) title = '돌아가는 날';
        else { title = (away ? city + ' — ' : '') + ar.slice(0, 2).join(' · '); route = [baseName].concat(ar).concat([baseName]); }
      }
      if (i === 1) carry = Math.max(0, t - 1440);   // 한밤(다음 날) 도착이면 둘째 날 늦게 시작
      it.push({ k: 'w', s: i === N || t > toMin('22:30') ? null : toMin('22:30'), n: '취침' });
      if (busUsed) nt.splice(Math.min(nt.length, 2), 0, { lv: 'gray', t: '버스 시각은 대략 · 터미널에서 예매' });   // 11/25 버스 = 실제 시각 없음
      if (railMiss.length) nt.unshift({ lv: 'red', t: railMiss[0] + ' 가는 막차 지남 · 코레일 확인' });   // 11/25
      if (railUsed) nt.splice(Math.min(nt.length, 2), 0, { lv: 'gray', t: railEst ? '기차 시각은 대략 · 코레일에서 예매' : '열차 시각 = 코레일 시간표 · 코레일에서 예매' });   // 11/25 KRM: 실제 시각표를 못 받은 구간이 있으면 '대략'
      if (blocks.length && !BLANK) nt.push({ lv: 'gray', t: '늦어지면 ' + blocks[blocks.length - 1] + ' 먼저 빼기' });
      const flyS = it.filter(x => x.fly && x.s != null).map(x => x.s);
      const items = it.filter(x => x.s != null).map(x => { const o = { ...x }; if (x.fly) { o.s = toT(x.s); o.e = toT(x.e); } else { o.s = toT(r5(x.s)); if (x.e != null) { let e = Math.max(r5(x.e), r5(x.s)); const nf = flyS.find(f => f >= x.s && f < e); if (nf != null) e = Math.max(nf, r5(x.s)); o.e = toT(e); } }   /* 5분 올림이 뒤 열차·비행기 출발 시각을 넘지 않게 */   /* 비행기·열차 = 실제 시각 그대로 */ delete o.tc; delete o.meal; delete o._sl; delete o._ml;   /* pid는 남김: 앱의 '문 닫았어요'가 장소 DB에서 같은 종류를 찾을 때 씀 */ if (!o.info) delete o.info; return o; });
      const seen = new Set(); notes[i] = nt.filter(n => { const k = n.t; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);
      days.push({ no: i, tbd: ((i === 1 && !outOk) || (i === N && !backOk)) && !(DOM && mode === 'car') || undefined, city, base: baseName, date: fmtD(date), title: themeTitle(title, items, i, city), route: route.filter((x, k, a) => x && x !== a[k - 1]).join(' → '), drop: blocks.length ? blocks[blocks.length - 1] + ' 먼저 빼기' : '', codes: '', items, ...(areaDay ? { area: areaDay } : {}) });
    }
    const wd = DOM && mode === 'train' ? '열차' : '비행기';
    // 시각 미입력 = 그날 시각을 숨기고 순서만(앱이 days[].tbd로 처리). 안내 글에 가정 시각을 넣지 않음
    if (!DOM || R.pre) {
      if (!outOk) (notes[1] = notes[1] || []).unshift({ lv: 'amber', ref: DOM ? R.fromName : DA[2], t: '가는 ' + wd + ' 시각을 넣으면 시간이 정해져요' });
      if (!backOk) (notes[N] = notes[N] || []).unshift({ lv: 'amber', ref: DOM ? R.toName : AP.name + '공항', t: '오는 ' + wd + ' 시각을 넣으면 시간이 정해져요' });
    }
    let carAttr;
    if (DOM && mode === 'car') {
      if (!outOk) (notes[1] = notes[1] || []).unshift({ lv: 'amber', t: '차 출발 09:00로 계산 · 차 카드에서 바꿔요' });
      if (!backOk) (notes[N] = notes[N] || []).unshift({ lv: 'amber', t: '돌아오는 차 ' + R.carBackDep + ' 출발로 계산' });
      if (!R.tabOut) (notes[1] = notes[1] || []).push({ lv: 'gray', t: '운전 시간 미확인 · 4시간 가정 · 내비로 확인' });
      if (!R.tabBack) (notes[N] = notes[N] || []).push({ lv: 'gray', t: '돌아오는 운전 시간 미확인 · 4시간 가정 · 내비로 확인' });
      if (R.tabOut || R.tabBack) {
        (notes[R.tabOut ? 1 : N] = notes[R.tabOut ? 1 : N] || []).push({ lv: 'gray', t: '차 시간 = 도로×혼잡+휴게소 (추정)' });
        assumed.push('차 시간 = 도로 기준 × 시간대 혼잡 + 휴게소 쉼(2시간마다 15분)' + (R.tabOut ? ' · 도착 뒤 주차·도보 ' + mnTx(CAR_POLICY.parkMin) + '' : '') + ' (추정)');
        carAttr = (D.car.meta && D.car.meta.attribution) || '경로 © openrouteservice.org · © OpenStreetMap contributors';
      }
    }
    // 시·군·구 출발이 실제로 쓰였을 때: 가정 목록·1일차 안내·출처
    if (doorUsed) assumed.push('집 ↔ 공항·역 = 카카오 길찾기 문 앞 기준 (차는 그 시각 교통 예측 · 공항은 주차 15분 더함)');
    if (SG && sgUsed) {
      const carHome = DOM && mode === 'car';
      assumed.push('집 → ' + (carHome ? '숙소' : '공항') + ' 차 시간 = ' + SG.name + ' 중심점 기준 · 도로×혼잡' + (carHome ? '' : '+주차 ' + mnTx(CAR_POLICY.airBuf) + '') + ' (추정)');
      (notes[1] = notes[1] || []).push({ lv: 'gray', t: SG.name + ' 기준 차 시간 (추정) · 중심점 기준이라 집 위치에 따라 달라요' });
      carAttr = carAttr || (D.car && D.car.meta && D.car.meta.attribution) || '경로 © openrouteservice.org · © OpenStreetMap contributors';
    }
    (notes[1] = notes[1] || []).push({ lv: 'gray', t: '동네 사이 이동 시간 대략값' });
    if (stayUnknown) notes[1].push({ lv: 'gray', t: stayUnknown });
    const end = new Date(start); end.setDate(start.getDate() + nights);
    const f2 = d => (d.getMonth() + 1) + '. ' + d.getDate();
    return { v: 1, type, title: (KX && DT ? KXD[1].home : PART ? C.label : input.cityLabel || C.label) + (DT ? ' 당일치기' : ' ' + nights + '박 ' + N + '일'), sub: (DT ? f2(start) : f2(start) + ' – ' + f2(end)) + (INB ? ' · 공항에서 공항까지' : ' · 집에서 집까지'), start: start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0'), days, notes, assumed, local: C.local || null, sgg: SG && sgUsed ? SG.name : null, dest: input.dest || 'kix', ...(PART ? { part: PART } : {}), go: DOM ? { mode, line: R.lineTx || null, region: R.region } : { mode: INB ? 'inbound' : 'intl', airport: apK }, carAttr, ...(BLANK ? { blank: true } : {}), inp: JSON.parse(JSON.stringify(input)), made: new Date().toISOString() };   // inp = 11/14 #28: 앱에서 비행기 시각을 바꾸면 그날을 다시 짤 때 씀
  }
  // 차 예상 도착 (질문지 start.html도 이 함수를 씀): key 'pt>base' 또는 'sgg:서울 마포구>base' · dep 'HH:MM' · date Date · dest 도시코드 → { dep, arr 'HH:MM', next(다음 날), dur(분), rest(휴게소 쉼 포함) } 또는 null(표에 없음)
  function carEta(key, dep, date, dest) {
    const T = pairOf(key); if (!T || !(T.min > 0) || !/^\d{1,2}:\d{2}$/.test(dep || '')) return null;
    const leave = toMin(dep), raw = T.min * carMult(T.km || 999, leave, date, dest), rest = Math.floor(raw / CAR_POLICY.restEvery) * CAR_POLICY.restMin, arr = Math.max(r5(leave + raw + rest), leave + 30);
    return { dep: toT(leave), arr: toT(arr).replace(/\(.*/, ''), next: arr >= 1440, dur: arr - leave, rest: rest > 0 };
  }
  // 11/24 앱(일정 추가 추천)용: 좌표 두 개 · 도시 이름 → 이동 분 (엔진과 같은 규칙)
  function legLL(a, b, city) { if (!a || !b) return null; const d = hv(a, b), wk = Math.max(3, Math.round(d * 1.3 / 4.5 * 60)), f = FIT[city] || FIT[JPC.has(city) ? '_jp' : '_kr'], tr = Math.round(f[0] + f[1] * d); return d * 1.3 <= 1.6 && wk <= tr ? wk : tr; }
  window.GABOJA_GEN = { make, stayArea, carEta, legLL, CAR_POLICY, version: 9, dests: Object.keys(D.cfg || {}) };
})();
