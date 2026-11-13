/* 가보자 일정 조립 엔진 v6 (2026-11-13 차 이동 시간 CAR_POLICY·표 연결 / v5 수정: 식사 중복 방지·이른 귀국·자정 넘김·휴무 closed_nth/날짜·숙소 미인식 안내·(추정) / v4 국내 흐름 — 기차·국내선·차·집에서 바로 / v3 도시 설정, v1 오사카·교토 시범)
   데이터 = gen-data.js (tools/build_gen_data.py가 장소 DB places.json · 조각 pieces.json · 동네 이동 시간에서 만듦)
   입력: 유형 코드(LSRP 등) + 여행 정보(날짜·박·비행기·출발지·취향·피할 것)
   규칙 = 만드는 규칙 v1(문서/여행앱/2026-11-11_가보자_만드는규칙_v1.md)의 시범판:
   ① 날 뼈대: 첫날 = 집 → 공항(출발 2시간 전) → 도착 → 숙소 짐 / 마지막 날 = 체크아웃 → 공항(2시간 전) → 집
   ② 하루 조각 수: 알차게(F) = 오전·오후·저녁 이후 3조각 / 여유롭게(R) = 오전·오후 2조각 + 숙소 휴식
   ③ 조각 고르기: 묶음(로컬·핫플 × 구경·즐기기) 맞는 것 > 취향 칩 > 피할 것 빼기, 같은 유형이라도 날짜에 따라 조금씩 다르게
   ④ 검사: 그 요일 휴무 · 영업시간(도착이 열기 전이면 45분까지 기다림, 닫기 전 못 끝내면 다른 조각)
   ⑤ 계획형(J) = 시각 하나 / 즉흥형(P) = 같은 시간대 다른 후보 하나를 '또는'으로
   ⑥ 식사: 그 동네에서 그 시각에 여는 식당(DB) → 없으면 '현장 선택' */
(function () {
  const D = window.GABOJA_DATA;
  if (!D) return;
  const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], WDK = ['일', '월', '화', '수', '목', '금', '토'];
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  // 분 → 'HH:MM'. 24:00 넘으면 '01:40(다음 날)' (index.html의 toMin이 '(다음 날)'을 다시 +1440으로 읽음)
  const toT = m => { m = Math.max(0, Math.round(m)); const nx = m >= 1440; m %= 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') + (nx ? '(다음 날)' : ''); };
  // 출발 a → 도착 b (둘 다 'HH:MM'): 도착이 더 이르면 다음 날로 보고 +1440
  const spanEnd = (a, b) => { const x = toMin(a), y = toMin(b); return y < x ? y + 1440 : y; };
  const r5 = m => Math.ceil(m / 5) * 5;
  // 차(운전) 이동 시간 정책 (2026-11-13) — 값은 전부 여기 한 곳. 시간 = 기준분(경로 엔진 표 car_times.json) × 혼잡 배수 + 버퍼
  // 근거 구분: [근거] = 확인한 자료가 있는 부분, [추정] = 아키 추정(출처 없음, 바꿔도 됨)
  const CAR_POLICY = {
    // 혼잡 배수 [추정] — 참고 수치: 서울 2025 평균 속도 퇴근 18~20시 19.8 · 휴일 평균 23.9km/h (서울시 자료 인용 보도, heraldk 2026-03-13). 자유 흐름 대비 배수는 한국·일본 모두 근거 못 구함
    metro: { peak: 1.3, day: 1.15, night: 1.0, weekend: 1.2 },   // 대도시 안: 평일 07–10·17–20시 peak / 평일 10–17시 day / 그 밖 night / 주말 10–19시 weekend
    hwy: { weekday: 1.1, rush: 1.25 },                           // 도시 간(고속) 구간: 평소 1.1 / 금 16시~ · 토 오전 · 일 오후 rush
    metroKm: 100,                                                // 기준 거리가 이보다 짧으면 대도시 안(metro), 길면 도시 간(hwy)으로 봄 [추정]
    winter: { dests: ['spk'], months: [12, 1, 2, 3], mult: 1.2 }, // 홋카이도 겨울 눈길 [추정] — 속도 저하 수치 못 구함. 지금은 국내만 차 구간이 있어 쓰이지 않음
    restEvery: 120, restMin: 15,                                  // 2시간 운전마다 휴식 15분 [근거: 한국도로공사 권고(기사 인용, 공식 원문 미확인) · 사업용 2시간당 15분] — 운전자 기준
    parkMin: 10,                                                  // 숙소 도착 뒤 주차·도보 [추정]. 공항 도착 규칙은 기존(공항 2시간 전 등) 그대로
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
  const PL = D.places, PC = D.pieces;
  const cl = id => (PL[id] && PL[id].cl) || '';
  const isEst = (a, b) => !!a && !!b && a !== b && (D.est || []).includes(a < b ? a + '|' + b : b + '|' + a);
  const estTx = (a, b) => isEst(a, b) ? ' (추정)' : '';
  function mins(a, b) {
    if (!a || !b || a === b) return a === b ? 8 : 30;
    const k1 = a + '|' + b, k2 = b + '|' + a;
    return D.areas[k1] || D.areas[k2] || (D.cityOf[a] === D.cityOf[b] ? 30 : 55);
  }
  // 날짜에 따라 다른 결과가 나오게 하는 고정 난수
  function rng(seed) { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; }; }

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
      return { ok: true, start: s, end: Math.min(s + stay, C), waited: s > t, opensAt: s === O && s > t ? o : null };
    }
    return { ok: false, why: '영업시간 밖' };
  }

  function make(input) {
    const type = /^[LH][SE][FR][JP]$/.test(input.type || '') ? input.type : 'LSRP';
    const G = type.slice(0, 2), F = type[2] === 'F', J = type[3] === 'J';
    const nights = Math.max(1, Math.min(6, input.nights || 3)), N = nights + 1;
    let start = input.start ? new Date(input.start + 'T00:00:00') : null, assumed = [];
    if (!start || isNaN(start)) { start = new Date(); start.setDate(start.getDate() + 21); while (start.getDay() !== 5) start.setDate(start.getDate() + 1); assumed.push('날짜 미정 → ' + (start.getMonth() + 1) + '/' + start.getDate() + '(금) 출발로 가정'); }
    const rand = rng(type + (input.start || '') + nights);
    const likes = new Set(input.likes || []), avoid = new Set(input.avoid || []);
    // 비행기 (v2): 가는 편 fo · 오는 편 fb = { no 편명, dep 출발, arr 도착 }. 빈 칸은 보통 시각으로 가정 + 표시
    //   (옛 입력: flightTx 안의 시각 둘 = 가는 편)
    const hm = v => /^\d{1,2}:\d{2}$/.test(v || '') ? v.padStart(5, '0') : null;
    const tm = String(input.flightTx || '').match(/(\d{1,2}):(\d{2})/g);
    const fo = input.fo || {}, fb = input.fb || {};
    // 도시 설정 (gen-data.js의 cfg: 공항·숙소 동네·공항↔숙소 이동) — kix = 오사카·교토, tyo = 도쿄
    const C = (D.cfg || {})[input.dest] || (D.cfg || {}).kix;
    const DOM = !!C.domestic;   // 국내(서울·부산): 비행기 대신 기차·국내선·차·집에서 바로
    const stayRaw = String(input.stayTx || '').trim(), matchB = C.bases.find(b => b.re && new RegExp(b.re).test(stayRaw));
    const B = matchB || C.bases[0];
    const base = B.key, baseName = B.name;
    // 숙소 동네가 목록에 없으면 첫 동네로 계산 → 1일차 회색 주의에 알림 (아래 notes[1])
    const stayUnknown = stayRaw && !matchB && !C.bases.some(b => stayRaw.includes(b.name.split('·')[0].trim())) ? '숙소 ‘' + stayRaw.slice(0, 20) + '’은 목록에 없어 ' + baseName + ' 기준으로 계산' : '';
    if (stayUnknown) assumed.push(stayUnknown);
    const fnoOut = String(fo.no || '').toUpperCase().slice(0, 8), fnoBack = String(fb.no || '').toUpperCase().slice(0, 8);
    const durK = m => (m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' + m % 60 + '분' : '') : m + '분');
    let apK = null, AP = null, TB = null, R = null, mode = 'intl', out, back, outOk, backOk, homeMin = 75; // 집 → 인천공항 (주소별 계산은 앱 단계, 지금은 가정)
    if (!DOM) {
      apK = C.airports[input.airport] ? input.airport : Object.keys(C.airports)[0]; AP = C.airports[apK];
      out = hm(fo.dep) && hm(fo.arr) ? [hm(fo.dep), hm(fo.arr)] : !input.fo && tm && tm.length >= 2 ? [tm[0].padStart(5, '0'), tm[1].padStart(5, '0')] : AP.out;
      back = hm(fb.dep) && hm(fb.arr) ? [hm(fb.dep), hm(fb.arr)] : AP.back;
      outOk = !!(hm(fo.dep) && hm(fo.arr)) || (!input.fo && !!(tm && tm.length >= 2)); backOk = !!(hm(fb.dep) && hm(fb.arr));
      if (!outOk) assumed.push('가는 비행기 인천 ' + AP.out[0] + ' → ' + AP.name + ' ' + AP.out[1] + ' 가정');
      if (!backOk) assumed.push('오는 비행기 ' + AP.name + ' ' + AP.back[0] + ' → 인천 ' + AP.back[1] + ' 가정');
      TB = (C.toBase[apK] || {})[base] || [60, '전철'];
    } else {
      // 출발 지역 × 교통수단 → 타는 곳·내리는 곳·소요 시간 (cfg.modes = domestic_moves_add.json 조사값)
      const M = C.modes || {}, regions = Object.keys(M.train && M.train.regions || {}).concat(Object.keys(M.car && M.car.regions || {}));
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
        homeMin = region === '수도권' ? 50 : 30;   // 집 → 역·공항 (가정)
        out = hm(fo.dep) && hm(fo.arr) ? [hm(fo.dep), hm(fo.arr)] : r.out; back = hm(fb.dep) && hm(fb.arr) ? [hm(fb.dep), hm(fb.arr)] : r.back;
        outOk = !!(hm(fo.dep) && hm(fo.arr)); backOk = !!(hm(fb.dep) && hm(fb.arr));
        const w = mode === 'air' ? '비행기' : '열차';
        if (!outOk) assumed.push('가는 ' + w + ' ' + R.fromName + ' ' + r.out[0] + ' → ' + R.toName + ' ' + r.out[1] + ' 가정');
        if (!backOk) assumed.push('오는 ' + w + ' ' + R.toName + ' ' + r.back[0] + ' → ' + R.fromName + ' ' + r.back[1] + ' 가정');
        if (M[mode].preEst) assumed.push((mode === 'air' ? '공항' : '역') + ' 도착 = 출발 ' + R.pre + '분 전으로 가정');
        if (!tb) assumed.push(R.toName + ' → ' + baseName + ' 이동 시간은 대략값');
      } else if (mode === 'car') {
        // 운전 시간 공식값이 없음(도로공사 조회 실패, 11/13) → 사용자가 넣은 출발·도착 예정 시각, 없으면 가정
        const o = hm(fo.dep) && hm(fo.arr) ? [hm(fo.dep), hm(fo.arr)] : null, b = hm(fb.dep) && hm(fb.arr) ? [hm(fb.dep), hm(fb.arr)] : null;
        const pt = (M.car.regions[region] || {}).pt, ct = (D.car && D.car.pairs) || {};
        const od = hm(fo.dep), bd = hm(fb.dep);   // 출발 시각만 넣은 경우도 그 출발 시각 사용
        R = { carOut: o || [od || '09:00', '13:00'], carBack: b || [bd || '15:00', '19:00'], kOut: pt + '>' + base, kBack: base + '>' + pt }; outOk = !!o; backOk = !!b;
        // 도로 기준 시간 표(ORS)에 이 쌍이 있고 사용자가 시각을 안 넣었으면 표로 계산 (없으면 아래 가정값 그대로)
        R.tabOut = !o && !!pt && !!(ct[R.kOut] && ct[R.kOut].min > 0); R.tabBack = !b && !!pt && !!(ct[R.kBack] && ct[R.kBack].min > 0);
        if (!o) assumed.push(R.tabOut ? '차 출발 ' + (od ? od + ' (입력)' : '09:00 가정') + ' · 도착은 도로 기준 추정' : od ? '차 출발 ' + od + ' · 숙소 도착 13:00 가정 (운전 시간은 내비로 확인)' : '차 출발 09:00 · 숙소 도착 13:00 가정 (운전 시간은 내비로 확인)');
        if (!b) assumed.push(R.tabBack ? '돌아오는 차 ' + (bd ? bd + ' 출발 (입력)' : '15:00 출발 가정') + ' · 도착은 도로 기준 추정' : '돌아오는 차 ' + (bd || '15:00') + ' 출발 · 19:00 집 도착 가정');
      } else { R = { min: (M.home && M.home.min) || 60 }; outOk = backOk = true; assumed.push('집 → 숙소 지하철 약 ' + R.min + '분 가정'); }
      R.region = region;
    }
    assumed.push('동네 사이 이동 시간은 대략값 · 길찾기 버튼으로 실제 시간 확인');
    // 차 구간 한 번: 출발 시각 leave(분)·날짜 → { dur(5분 단위 총 분), arr, drv(지도 링크용 점) }. 표에 없으면 null
    const carLeg = (key, leave, date) => {
      const T = D.car && D.car.pairs && D.car.pairs[key]; if (!T || !(T.min > 0)) return null;
      const raw = T.min * carMult(T.km || 999, leave, date, input.dest), rest = Math.floor(raw / CAR_POLICY.restEvery) * CAR_POLICY.restMin;
      const arr = r5(leave + raw + rest), [a, b] = key.split('>'), P = D.car.points || {};
      return { dur: Math.max(30, arr - leave), arr: Math.max(arr, leave + 30), drv: P[a] && P[b] ? { a: P[a], b: P[b], kr: 1 } : null };
    };

    // 조각 점수
    const used = new Set(), usedPlaces = new Set();
    const ate = { l: false, d: false };   // 그날 점심·저녁을 이미 먹었는지 (하루 점심 1 · 저녁 1)
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
      pc.tags.forEach(t => { if (likes.has(t)) s += 2; });
      if (avoid.has('많이 걷기') && pc.walk === 'high') s -= 8;
      if (!F && pc.walk === 'low') s += 1;
      if (G[0] === 'H') s += pc.fame * 0.6; else s -= pc.fame * 0.4;
      return s + rand() * 2.2;
    }
    function candidates(city, slot) { return PC.filter(pc => pc.city === city && pc.slots.includes(slot) && !used.has(pc.id) && !pc.steps.some(st => usedPlaces.has(st.place))).map(pc => [score(pc), pc]).sort((a, b) => b[0] - a[0]).map(x => x[1]); }
    // 조각을 지금 시각·위치에서 실제로 넣어 봄
    function tryPiece(pc, date, t, at) {
      const items = [], warn = []; let cur = t, loc = at;
      const first = pc.steps[0], mv = mins(loc, cl(first.place));
      if (loc !== cl(first.place)) { items.push({ k: 'm', s: cur, e: cur + mv, mode: 'train', n: '전철', mv: '전철·걷기 · 약 ' + mv + '분' + estTx(loc, cl(first.place)), to: PL[first.place].q, tc: cl(first.place) }); cur += mv; }
      for (const st of pc.steps) {
        const p = PL[st.place]; if (!p) return null;
        if (loc && cl(st.place) === loc && items.length && items[items.length - 1].k !== 'm') { const w = 10; items.push({ k: 'm', s: cur, e: cur + w, mode: 'walk', n: '걸어서', mv: '걸어서 · 약 ' + w + '분', to: p.q }); cur += w; }
        const o = openAt(p, date, cur, st.stay); if (!o.ok) return { fail: p.n + ' ' + o.why };
        const s = o.start, e = s + st.stay;
        if (o.end && e > o.end + 1) return { fail: p.n + ' 닫는 시각' };
        items.push({ k: st.meal && st.meal !== '간식' ? 'f' : (o.opensAt ? 'x' : 'p'), s, e, n: (st.meal && st.meal !== '간식' ? st.meal + ' — ' : '') + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: o.unknown ? 'no' : 'ok', info: p.oTx ? [['영업', p.oTx]] : null, pid: st.place, meal: st.meal });
        if (o.opensAt) warn.push({ lv: 'red', ref: p.sh || p.n, t: (p.sh || p.n) + ' ' + o.opensAt + ' 문 열 때 맞춰 도착' });
        if (o.unknown) warn.push({ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 확인 필요 · 전날 확인' });
        cur = e; loc = cl(st.place);
      }
      return { items, warn, end: cur, loc };
    }
    function place(city, slot, date, t, at, until) {
      const list = candidates(city, slot);
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
      (p.tg || []).forEach(x => { if (likes.has(x)) s += 2; });
      return s - (p.cl === at ? 0 : mins(at, p.cl) / 12) + rand();
    }
    function fill(city, slot, date, t, at, until) {
      const pool = Object.entries(PL).filter(([id, p]) => p.city === city && !usedPlaces.has(id)).map(([id, p]) => [pscore(id, p, slot, at), id, p]).filter(x => x[0] > -50).sort((a, b) => b[0] - a[0]);
      for (const [, a, A] of pool.slice(0, 12)) {
        const pair = pool.filter(([, b, Bp]) => b !== a && Bp.cl === A.cl).slice(0, 4).map(x => x[1]);
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
      const pool = Object.entries(PL).filter(([id, p]) => p.city === city && p.kind === 'restaurant' && !usedPlaces.has(id));
      const near = pool.filter(([id]) => cl(id) === at).concat(pool.filter(([id]) => cl(id) !== at && mins(at, cl(id)) <= 20));
      for (const [id, p] of near.sort(() => rand() - 0.5).sort((a, b) => (cl(a[0]) !== at) - (cl(b[0]) !== at))) {
        const go = cl(id) === at ? 0 : mins(at, cl(id));
        const o = openAt(p, date, t + go, p.st || 60); if (!o.ok || o.start > lim) continue;
        usedPlaces.add(id);
        const items = []; if (go) items.push({ k: 'm', s: t, e: t + go, mode: 'train', n: '이동', mv: '약 ' + go + '분' + estTx(at, cl(id)), to: p.q, tc: cl(id) });
        items.push({ k: 'f', s: o.start, e: o.start + (p.st || 60), n: kind + ' — ' + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: o.unknown ? 'no' : 'ok', info: p.oTx ? [['영업', p.oTx]] : null, pid: id });
        return { items, end: o.start + (p.st || 60), loc: cl(id), warn: o.unknown ? [{ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 확인 필요' }] : [] };
      }
      const area = D.clName[at] || '근처';
      return { items: [{ k: 'f', s: t, e: t + 60, n: kind + ' — ' + area + ' 근처', sh: kind, say: '현장 선택 · 줄이 길면 옆 가게', q: D.clQ[at] || area }], end: t + 60, loc: at, warn: [] };
    }

    // 옆 도시(교토 등) 가는 날 수 — 옆 도시가 없는 곳(도쿄)은 0
    const middle = N - 2, kyotoDays = !C.side || middle <= 0 ? 0 : Math.min(middle, Math.max(1, Math.round(middle * (G === 'HS' ? 0.6 : 0.45))));
    const kyotoIdx = new Set(); for (let i = 0; i < kyotoDays; i++) kyotoIdx.add(2 + i * 2 <= N - 1 ? 2 + i * 2 : 2 + i);
    const days = [], notes = {}; let carry = 0;
    const fmtD = d => (d.getMonth() + 1) + '. ' + d.getDate() + ' ' + WDK[d.getDay()];
    for (let i = 1; i <= N; i++) {
      const date = new Date(start); date.setDate(start.getDate() + i - 1);
      const city = kyotoIdx.has(i) ? C.side : C.main;
      ate.l = ate.d = false;
      const it = [], nt = []; let t, at = base; const blocks = [];
      const push = arr => arr.forEach(x => it.push(x));
      const addBlock = (slot, until, cityX) => { const b = place(cityX || city, slot, date, t, at, until); if (!b) return false; push(decorate(b)); nt.push(...b.warn); blocks.push(b.pc.name); t = b.end; at = b.loc; return true; };
      const decorate = b => { const its = b.items.map(x => ({ ...x })); if (b.alt) { const f = its.find(x => x.k !== 'm'); if (f) f.say = '또는 ' + b.alt.name + (f.say ? ' · ' + f.say : ''); } return its; };
      const addMeal = kind => { const m = meal(kind, city, date, t, at); push(m.items); nt.push(...m.warn); t = m.end; at = m.loc; };
      const rest = (len, why) => { const back = at === base ? 0 : mins(at, base); if (back) it.push({ k: 'm', s: t, e: t + back, mode: 'train', n: '숙소로', mv: '숙소로 · 약 ' + back + '분' + estTx(at, base), to: D.clQ[base] }); t += back; it.push({ k: 'p', s: t, e: t + len, n: why, sh: '숙소 휴식' }); t += len; at = base; };
      // 첫날 도착 뒤: 짐 → 점심(11:00~14:30) → 오후 조각 → 체크인/휴식 → 저녁(~21:00) → 밤 조각. 한밤 도착이면 체크인만
      const arriveTail = bagSay => {
        if (t >= toMin('21:00')) { it.push({ k: 'p', s: t, e: t + 30, sh: '체크인', n: baseName + ' · 숙소 체크인' }); t += 30; at = base; return; }
        it.push({ k: 'p', s: t, e: t + 30, sh: '숙소 · 짐', n: baseName + ' · 숙소에 짐 맡기기', say: bagSay }); t += 30;
        if (!ate.l && t < toMin('12:30')) addMeal('점심');
        if (t <= toMin('15:30')) addBlock('pm', toMin(F ? '18:00' : '17:00'));
        if (!F) rest(60, '숙소 체크인 · 휴식'); else if (t < toMin('17:30')) { it.push({ k: 'p', s: t, e: t + 30, sh: '체크인', n: '숙소 체크인' }); t += 30; at = base; }
        if (!ate.d) { t = Math.max(t, toMin('18:00')); if (t <= toMin('20:30')) addMeal('저녁'); }
        if (F && t <= toMin('20:30')) addBlock('night', toMin('22:30'));
      };
      // 마지막 날 아침: 체크아웃을 출발(leave)보다 30분 앞으로, 기상은 그보다 30분 앞 (이른 비행기·열차)
      const checkoutMorning = leave => {
        const ck = Math.min(toMin('10:00'), leave - 30);
        it.push({ k: 'w', s: Math.min(toMin('08:30'), ck - 30), n: '기상', say: '짐 싸기' });
        it.push({ k: 'p', s: ck, e: ck + 30, sh: '체크아웃', n: '체크아웃' }); return ck + 30;
      };
      let title = '', route = [];
      if (i === 1 && DOM) {
        if (R.pre) {   // 기차·국내선
          const dep = toMin(out[0]), arr = spanEnd(out[0], out[1]), hub = dep - R.pre, leave = hub - homeMin;
          it.push({ k: 'w', s: leave - 45, n: '기상', say: mode === 'air' ? '신분증·지갑·충전기 확인' : '승차권·지갑·충전기 확인' });
          it.push({ k: 'm', s: leave, e: hub, mode: 'home', n: '집에서 출발', mv: '집 → ' + R.fromName + ' · 약 ' + homeMin + '분 (가정)', to: R.fromName });
          it.push({ k: 'p', s: hub, e: dep, sh: R.fromName, n: R.fromName, say: mode === 'air' ? '탑승 수속·보안 검색 먼저' : '타는 곳 확인', q: R.fromName });
          it.push({ k: 'x', s: dep, e: arr, fly: [R.fc, R.fromName, R.tc, R.toName], ride: mode, line: R.lineTx, pre: R.pre, fno: fnoOut || undefined, n: R.lineTx + ' · ' + R.fromName + ' → ' + R.toName + (fnoOut ? ' ' + fnoOut : ''), mv: R.lineTx });
          it.push({ k: 'p', s: arr, e: arr + R.ex, sh: R.toName, n: R.toName + ' 도착', say: TB[1] + ' 타는 곳으로', q: R.toName });
          it.push({ k: 'm', s: arr + R.ex, e: arr + R.ex + TB[0], mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + TB[0] + '분', to: D.clQ[base] });
          t = r5(arr + R.ex + TB[0]); route = ['집', R.fromName, R.toName, baseName];
        } else if (mode === 'car') {
          const leave = toMin(R.carOut[0]), L = R.tabOut ? carLeg(R.kOut, leave, date) : null, arrv = L ? L.arr : Math.max(spanEnd(R.carOut[0], R.carOut[1]), leave + 30);
          it.push({ k: 'w', s: leave - 45, n: '기상', say: '짐 싣기 · 주차 확인' });
          it.push({ k: 'm', s: leave, e: arrv, mode: 'car', n: '차로 출발', mv: '집 → ' + baseName + ' · 차' + (L ? ' 약 ' : '로 약 ') + durK(arrv - leave) + (L ? ' (추정)' : outOk ? '' : ' (가정)'), to: D.clQ[base], drv: L ? L.drv : undefined });
          t = r5(arrv + (L ? CAR_POLICY.parkMin : 0)); route = ['집', baseName];
        } else {
          const leave = toMin('10:00');
          it.push({ k: 'w', s: leave - 60, n: '기상', say: '짐 챙기기' });
          it.push({ k: 'm', s: leave, e: leave + R.min, mode: 'home', n: '집에서 출발', mv: '집 → ' + baseName + ' · 지하철 약 ' + R.min + '분 (가정)', to: D.clQ[base] });
          t = r5(leave + R.min); route = ['집', baseName];
        }
        arriveTail(mode === 'car' ? '체크인 전 짐·주차' : '체크인 전 짐만 보관');
        title = (mode === 'home' ? '집에서 바로 ' : '도착하자마자 ') + (blocks[0] || '동네 산책');
      } else if (i === N && DOM) {
        let hub = null, leave, dep, arr;
        if (R.pre) { dep = toMin(back[0]); arr = spanEnd(back[0], back[1]); hub = dep - R.pre; leave = hub - (TB[0] + 5); }
        else leave = toMin(mode === 'car' ? R.carBack[0] : '17:00');
        let leave2 = leave;
        t = checkoutMorning(leave);
        if (leave - t >= 150) { addBlock('am', leave - 60); }
        if (leave - t >= 50 && !ate.l && t <= toMin('14:30')) { const m = meal('점심', C.main, date, t, at); if (m.end + (m.loc === base ? 0 : mins(m.loc, base)) <= leave) { push(m.items); t = m.end; at = m.loc; } else { it.push({ k: 'f', s: t, e: t + 40, n: (t < 660 ? '브런치' : '점심') + ' — ' + baseName + ' 근처', sh: '점심', say: '출발 전 간단히', q: D.clQ[base] }); t += 40; at = base; } }
        if (R.pre && leave - t >= 150) { addBlock('pm', leave - 60); }
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: '숙소로', mv: '짐 찾으러 · 약 ' + b + '분' + estTx(at, base) }); t += b; at = base; }
        if (t > leave) leave2 = t;
        if (R.pre) {
          it.push({ k: 'm', s: leave2, e: Math.max(hub, leave2 + TB[0]), mode: 'train', n: TB[1], mv: R.toName + '으로 · ' + TB[1] + ' 약 ' + TB[0] + '분', to: R.toName });
          it.push({ k: 'x', s: Math.min(dep, Math.max(hub, leave2 + TB[0])), e: dep, sh: R.toName, n: R.toName + (mode === 'air' ? ' · 탑승 수속' : ' · 타는 곳'), say: mode === 'air' ? '신분증 · 출발 ' + R.pre + '분 전 도착' : '기념품은 역 안에서', q: R.toName });
          it.push({ k: 'x', s: dep, e: arr, fly: [R.tc, R.toName, R.fc, R.fromName], ride: mode, line: R.lineTx, pre: R.pre, fno: fnoBack || undefined, n: R.lineTx + ' · ' + R.toName + ' → ' + R.fromName + (fnoBack ? ' ' + fnoBack : ''), mv: R.lineTx });
          it.push({ k: 'p', s: arr, e: arr + R.ex, sh: R.fromName, n: R.fromName + ' 도착', q: R.fromName });
          it.push({ k: 'm', s: arr + R.ex, e: arr + R.ex + homeMin, mode: 'home', n: '집으로', mv: R.fromName + ' → 집 · 약 ' + homeMin + '분 (가정)' });
          it.push({ k: 'p', s: arr + R.ex + homeMin, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
          nt.push({ lv: 'red', ref: R.toName, t: R.toName + ' ' + toT(hub) + '까지 도착 · 출발 ' + R.pre + '분 전' });
          route = [baseName, R.toName, R.fromName, '집'];
        } else {
          const LB = mode === 'car' && R.tabBack ? carLeg(R.kBack, leave2, date) : null;
          const drive = LB ? LB.dur : mode === 'car' ? Math.max(30, spanEnd(R.carBack[0], R.carBack[1]) - toMin(R.carBack[0])) : R.min;
          it.push({ k: 'm', s: leave2, e: leave2 + drive, mode: mode === 'car' ? 'car' : 'home', n: '집으로', mv: baseName + ' → 집 · ' + (mode === 'car' ? '차' + (LB ? ' 약 ' : '로 약 ') + durK(drive) + (LB ? ' (추정)' : backOk ? '' : ' (가정)') : '지하철 약 ' + R.min + '분 (가정)'), drv: LB ? LB.drv : undefined });
          it.push({ k: 'p', s: leave2 + drive, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
          if (mode === 'car') nt.push({ lv: 'gray', t: '일·연휴 오후 고속도로 막힘 · 출발 확인' });
          route = [baseName, '집'];
        }
        title = '돌아가는 날' + (blocks[0] ? ' — ' + blocks[0] : '');
      } else if (i === 1) {
        const dep = toMin(out[0]), arr = spanEnd(out[0], out[1]), airport = dep - 120, leave = airport - homeMin;
        it.push({ k: 'w', s: leave - 45, n: '기상', say: '여권·지갑·충전기 확인' });
        it.push({ k: 'm', s: leave, e: airport, mode: 'home', n: '집에서 출발', mv: '집 → 인천공항 · 약 ' + homeMin + '분 (가정)', to: '인천국제공항' });
        it.push({ k: 'p', s: airport, e: dep, sh: '인천공항', n: '인천공항', say: '체크인·출국 심사 먼저', q: '인천국제공항' });
        it.push({ k: 'x', s: dep, e: arr, fly: ['ICN', '인천', apK, AP.name], fno: fnoOut || undefined, n: '비행기 · 인천 → ' + AP.name + (fnoOut ? ' ' + fnoOut : ''), mv: '비행기' });
        it.push({ k: 'p', s: arr, e: arr + 60, sh: AP.name + '공항', n: AP.name + '공항 도착', l: AP.l, say: AP.say, q: AP.q });
        const tr = TB[0];
        it.push({ k: 'm', s: arr + 60, e: arr + 60 + tr, mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + tr + '분', to: D.clQ[base] });
        t = r5(arr + 60 + tr); arriveTail('체크인 전 짐만 보관');
        title = '도착하자마자 ' + (blocks[0] || '동네 산책'); route = ['집', '인천공항', AP.name + '공항', baseName];
      } else if (i === N) {
        const dep = toMin(back[0]), arr = spanEnd(back[0], back[1]), airport = dep - 120, leave = airport - (TB[0] + 5); let leave2 = leave;
        t = checkoutMorning(leave);
        if (leave - t >= 150) { addBlock('am', leave - 60); }
        if (leave - t >= 50 && !ate.l && t <= toMin('14:30')) { const m = meal('점심', C.main, date, t, at); if (m.end + (m.loc === base ? 0 : mins(m.loc, base)) <= leave) { push(m.items); t = m.end; at = m.loc; } else { it.push({ k: 'f', s: t, e: t + 40, n: (t < 660 ? '브런치' : '점심') + ' — ' + baseName + ' 역 근처', sh: '점심', say: '공항 가기 전 간단히', q: D.clQ[base] }); t += 40; at = base; } }
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: '숙소로', mv: '짐 찾으러 · 약 ' + b + '분' + estTx(at, base) }); t += b; at = base; }
        if (t > leave) leave2 = t;
        it.push({ k: 'm', s: leave2, e: Math.max(airport, leave2 + TB[0]), mode: 'train', n: TB[1], mv: '공항으로 · ' + TB[1] + ' 약 ' + TB[0] + '분', to: AP.q });
        it.push({ k: 'x', s: airport, e: dep, sh: AP.name + '공항', n: AP.name + '공항 · 체크인', l: AP.l, say: '면세품 있으면 세관 먼저', q: AP.q });
        it.push({ k: 'x', s: dep, e: arr, fly: [apK, AP.name, 'ICN', '인천'], fno: fnoBack || undefined, n: '비행기 · ' + AP.name + ' → 인천' + (fnoBack ? ' ' + fnoBack : ''), mv: '비행기' });
        it.push({ k: 'p', s: arr, e: arr + 50, sh: '인천공항', n: '인천공항 도착', q: '인천국제공항' });
        it.push({ k: 'm', s: arr + 50, e: arr + 50 + homeMin, mode: 'home', n: '집으로', mv: '인천공항 → 집 · 약 ' + homeMin + '분 (가정)' });
        it.push({ k: 'p', s: arr + 50 + homeMin, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
        nt.push({ lv: 'red', ref: AP.name + '공항', t: AP.name + '공항 ' + toT(airport) + '까지 도착 · 출발 2시간 전' }, { lv: 'gray', t: '면세품은 짐 부치기 전 세관 먼저' });
        title = '돌아가는 날' + (blocks[0] ? ' — ' + blocks[0] : ''); route = [baseName, AP.name + '공항', '인천공항', '집'];
      } else {
        const wake = F ? '07:30' : '08:30'; let wakeM = toMin(wake);
        if (i === 2 && carry) wakeM = Math.max(wakeM, Math.min(carry + 420, toMin('11:30')));   // 전날 한밤 도착이면 늦게 일어남
        it.push({ k: 'w', s: wakeM, n: '기상', say: city === C.side ? '편한 신발 · ' + C.side + '까지 이동' : '' });
        t = Math.max(toMin(F ? '09:00' : '10:00'), wakeM + 45);
        addBlock('am', toMin('13:30'));
        if (!ate.l) { t = Math.max(t, toMin('12:00')); if (t <= toMin('14:30')) addMeal('점심'); }
        addBlock('pm', toMin(F ? '18:30' : '17:00'));
        // 오후가 길게 비면 조각 하나 더 (알차게 = 저녁 전까지, 여유롭게 = 휴식 전까지 1시간 40분 이상 남을 때)
        if (t + 100 <= toMin(F ? '18:30' : '16:30')) addBlock('pm', toMin(F ? '18:30' : '17:00'));
        if (!F) rest(city === C.side ? 45 : 75, '숙소 휴식');
        if (!ate.d) { t = Math.max(t, toMin('18:30')); if (t <= toMin('21:00')) addMeal('저녁'); }
        if (F && t <= toMin('20:30')) addBlock('night', toMin('22:00'));
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: '숙소로', mv: '숙소로 · 약 ' + b + '분' + estTx(at, base), to: D.clQ[base] }); t += b; }
        title = (city === C.side ? C.side + ' — ' : '') + (blocks.slice(0, 2).join(' · ') || '자유 일정');
        route = [baseName].concat(it.filter(x => x.tc).map(x => D.clName[x.tc])).concat(at === base ? [] : [baseName]);
      }
      if (i === 1) carry = Math.max(0, t - 1440);   // 한밤(다음 날) 도착이면 둘째 날 늦게 시작
      it.push({ k: 'w', s: i === N || t > toMin('22:30') ? null : toMin('22:30'), n: '취침' });
      if (blocks.length) nt.push({ lv: 'gray', t: '늦어지면 ' + blocks[blocks.length - 1] + ' 먼저 빼기' });
      const flyS = it.filter(x => x.fly && x.s != null).map(x => x.s);
      const items = it.filter(x => x.s != null).map(x => { const o = { ...x }; if (x.fly) { o.s = toT(x.s); o.e = toT(x.e); } else { o.s = toT(r5(x.s)); if (x.e != null) { let e = Math.max(r5(x.e), r5(x.s)); const nf = flyS.find(f => f >= x.s && f < e); if (nf != null) e = Math.max(nf, r5(x.s)); o.e = toT(e); } }   /* 5분 올림이 뒤 열차·비행기 출발 시각을 넘지 않게 */   /* 비행기·열차 = 실제 시각 그대로 */ delete o.tc; delete o.pid; delete o.meal; if (!o.info) delete o.info; return o; });
      const seen = new Set(); notes[i] = nt.filter(n => { const k = n.t; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);
      days.push({ no: i, city, date: fmtD(date), title, route: route.filter((x, k, a) => x && x !== a[k - 1]).join(' → '), drop: blocks.length ? blocks[blocks.length - 1] + ' 먼저 빼기' : '', codes: '', items });
    }
    const wd = DOM && mode === 'train' ? '열차' : '비행기';
    if (!DOM || R.pre) {
      if (!outOk) (notes[1] = notes[1] || []).unshift({ lv: 'amber', ref: DOM ? R.fromName : '인천공항', t: '가는 ' + wd + ' 시각 미입력 · ' + out[0] + ' 가정' });
      if (!backOk) (notes[N] = notes[N] || []).unshift({ lv: 'amber', ref: DOM ? R.toName : AP.name + '공항', t: '오는 ' + wd + ' 시각 미입력 · ' + back[0] + ' 가정' });
    }
    let carAttr;
    if (DOM && mode === 'car') {
      if (!outOk) (notes[1] = notes[1] || []).unshift({ lv: R.tabOut && hm(fo.dep) ? 'gray' : 'amber', t: R.tabOut ? (hm(fo.dep) ? '운전 도착은 도로 기준 계산' : '운전 출발 시각 미입력 · 09:00 출발 가정') : '운전 시각 미입력 · ' + (hm(fo.dep) || '09:00') + ' 출발 13:00 도착 가정' });
      if (!backOk) (notes[N] = notes[N] || []).unshift({ lv: R.tabBack && hm(fb.dep) ? 'gray' : 'amber', t: R.tabBack && hm(fb.dep) ? '돌아오는 운전 도착도 도로 기준 계산' : '돌아오는 운전 시각 미입력 · ' + (hm(fb.dep) || '15:00') + ' 출발 가정' });
      // 도로 기준 표를 못 쓴 구간 = 운전 시간 미확인 (사용자가 시각을 넣었으면 그 값이라 안내 안 함)
      if (!outOk && !R.tabOut) (notes[1] = notes[1] || []).push({ lv: 'gray', t: '운전 시간 미확인 · 가정값이라 내비로 확인' });
      if (!backOk && !R.tabBack) (notes[N] = notes[N] || []).push({ lv: 'gray', t: '돌아오는 운전 시간 미확인 · 가정값이라 내비로 확인' });
      if (R.tabOut || R.tabBack) {
        (notes[R.tabOut ? 1 : N] = notes[R.tabOut ? 1 : N] || []).push({ lv: 'gray', t: '차 시간 = 도로×혼잡+휴게소 (추정)' });
        assumed.push('차 시간 = 도로 기준 × 시간대 혼잡 + 휴게소 쉼(2시간마다 15분)' + (R.tabOut ? ' · 도착 뒤 주차·도보 ' + CAR_POLICY.parkMin + '분' : '') + ' (추정)');
        carAttr = (D.car.meta && D.car.meta.attribution) || '경로 © openrouteservice.org · © OpenStreetMap contributors';
      }
    }
    (notes[1] = notes[1] || []).push({ lv: 'gray', t: '동네 사이 이동 시간 대략값' });
    if (stayUnknown) notes[1].push({ lv: 'gray', t: stayUnknown });
    const end = new Date(start); end.setDate(start.getDate() + nights);
    const f2 = d => (d.getMonth() + 1) + '. ' + d.getDate();
    return { v: 1, type, title: (input.cityLabel || C.label) + ' ' + nights + '박 ' + N + '일', sub: f2(start) + ' – ' + f2(end) + ' · 집에서 집까지', start: start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0'), days, notes, assumed, local: C.local || null, dest: input.dest || 'kix', go: DOM ? { mode, line: R.lineTx || null, region: R.region } : { mode: 'intl', airport: apK }, carAttr, made: new Date().toISOString() };
  }
  window.GABOJA_GEN = { make, version: 6, dests: Object.keys(D.cfg || {}) };
})();
