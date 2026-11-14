/* 가보자 일정 조립 엔진 v8 (2026-11-13 오후: 시·군·구 출발 input.sgg = 집→공항·국내 차 출발점 / 차 출발 미입력 = 09:00(오는 날 15:00)로 표시 / 시각 미입력 = days[].tbd(시각 숨김) · 차 = 탑승권 카드 틀(fly+ride:'car', 출발만 입력 → 도착 계산, 시간대별 표 car.d) · 일정 pid 유지 / v6: 차 이동 시간 CAR_POLICY·표 연결 / v5 수정: 식사 중복 방지·이른 귀국·자정 넘김·휴무 closed_nth/날짜·숙소 미인식 안내·(추정) / v4 국내 흐름 — 기차·국내선·차·집에서 바로 / v3 도시 설정, v1 오사카·교토 시범)
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

  function make(input) {
    const type = /^[LH][SE][FR][JP]$/.test(input.type || '') ? input.type : 'LSRP';
    const G = type.slice(0, 2), F = type[2] === 'F', J = type[3] === 'J';
    const DT = input.daytrip === true || input.nights === 0;   // 13b 당일치기(0박): 하루 안에 가고 오기, 숙소 없음
    const nights = DT ? 0 : Math.max(1, Math.min(6, input.nights || 3)), N = nights + 1;
    let start = input.start ? new Date(input.start + 'T00:00:00') : null, assumed = [];
    if (!start || isNaN(start)) { start = new Date(); start.setDate(start.getDate() + 21); while (start.getDay() !== 5) start.setDate(start.getDate() + 1); assumed.push('날짜 미정 → ' + (start.getMonth() + 1) + '/' + start.getDate() + '(금) 출발로 가정'); }
    const rand = rng(type + (input.start || '') + nights);
    const likes = new Set(input.likes || []), avoid = new Set(input.avoid || []);
    const tagW = input.tagW && typeof input.tagW === 'object' ? input.tagW : null, BLANK = input.blank === true;
    const banSet = new Set(Array.isArray(input.ban) ? input.ban : []);
    const MUSTD = {}; if (input.must && typeof input.must === 'object') Object.keys(input.must).forEach(k => { const L = [].concat(input.must[k] || []).filter(id => typeof id === 'string' && !banSet.has(id)); if (L.length) MUSTD[k] = L.filter((id, j) => L.indexOf(id) === j); });
    // 비행기 (v2): 가는 편 fo · 오는 편 fb = { no 편명, dep 출발, arr 도착 }. 빈 칸은 보통 시각으로 가정 + 표시
    //   (옛 입력: flightTx 안의 시각 둘 = 가는 편)
    const hm = v => /^\d{1,2}:\d{2}$/.test(v || '') ? v.padStart(5, '0') : null;
    const tm = String(input.flightTx || '').match(/(\d{1,2}):(\d{2})/g);
    const fo = input.fo || {}, fb = input.fb || {};
    // 도시 설정 (gen-data.js의 cfg: 공항·숙소 동네·공항↔숙소 이동) — kix = 오사카·교토, tyo = 도쿄
    const C = (D.cfg || {})[input.dest] || (D.cfg || {}).kix;
    const DOM = !!C.domestic;   // 국내(서울·부산): 비행기 대신 기차·국내선·차·집에서 바로
    // 시·군·구 출발 (input.sgg = '서울 마포구' 같은 키, 표 = gen-data sgg): 집→공항·국내 차 구간을 그 시·군·구 중심점 기준으로 계산. 표에 없으면 null = 기존 가정값
    const SG = input.sgg && D.sgg && D.sgg[input.sgg] ? { name: input.sgg, ...D.sgg[input.sgg] } : null; let sgUsed = false;
    // 집 ↔ 공항(code) 차 시간(분) = 기준분 × 혼잡 배수 + 휴게 + airBuf. t = 공항 도착 시각(fromHub=false, 집에서 출발) 또는 공항 출발 시각(fromHub=true, 집으로). 표에 없으면 null
    const homeCarMin = (code, t, date, fromHub) => {
      const T = SG && SG.t[code]; if (!T) return null; let m = T[0];
      for (let k = 0; k < 3; k++) { const lv = ((Math.round(fromHub ? t : t - m) % 1440) + 1440) % 1440, raw = T[0] * carMult(T[1], lv, date, ''); m = Math.round(raw + Math.floor(raw / CAR_POLICY.restEvery) * CAR_POLICY.restMin + CAR_POLICY.airBuf); }
      sgUsed = true; return m;
    };
    const homeTx = (hc, h) => '약 ' + mnTx(h) + (hc ? ' (차 기준, 추정)' : ' (가정)');
    const stayRaw = String(input.stayTx || '').trim(), matchB = C.bases.find(b => b.re && new RegExp(b.re).test(stayRaw)) || (stayRaw && C.bases.find(b => stayRaw.includes(b.name.split('·')[0].trim())));
    const B = matchB || C.bases[0];
    const base = B.key, calcName = B.name;
    // 화면에 쓰는 숙소 이름: 목록에 있으면 동네 이름, 없으면 사용자가 적은 말 그대로(계산만 첫 동네 기준). 지도 검색어도 같은 말 (11/13)
    const baseName = matchB || !stayRaw ? calcName : stayRaw.slice(0, 14), BQ = matchB || !stayRaw ? (D.clQ[base] || calcName) : stayRaw;
    // 숙소 동네가 목록에 없으면 첫 동네로 계산 → 1일차 회색 주의에 알림 (아래 notes[1])
    const stayUnknown = stayRaw && !matchB ? '숙소 ‘' + stayRaw.slice(0, 20) + '’ → 목록에 없는 동네라 이동 시간은 ' + calcName + ' 기준으로 계산' : '';
    if (stayUnknown) assumed.push(stayUnknown);
    else if (!stayRaw) assumed.push('숙소 미정 → ' + calcName + ' 기준으로 계산');
    const fnoOut = String(fo.no || '').toUpperCase().slice(0, 8), fnoBack = String(fb.no || '').toUpperCase().slice(0, 8);
    const durK = m => (m >= 60 ? Math.floor(m / 60) + '시간' + (m % 60 ? ' ' + m % 60 + '분' : '') : m + '분');
    let apK = null, AP = null, TB = null, R = null, mode = 'intl', out, back, outOk, backOk, homeMin = 75; // 집 → 인천공항 (주소별 계산은 앱 단계, 지금은 가정)
    if (!DOM) {
      apK = C.airports[input.airport] ? input.airport : Object.keys(C.airports)[0]; AP = C.airports[apK];
      out = hm(fo.dep) && hm(fo.arr) ? [hm(fo.dep), hm(fo.arr)] : !input.fo && tm && tm.length >= 2 ? [tm[0].padStart(5, '0'), tm[1].padStart(5, '0')] : AP.out;
      back = hm(fb.dep) && hm(fb.arr) ? [hm(fb.dep), hm(fb.arr)] : AP.back;
      outOk = !!(hm(fo.dep) && hm(fo.arr)) || (!input.fo && !!(tm && tm.length >= 2)); backOk = !!(hm(fb.dep) && hm(fb.arr));
      if (!outOk) assumed.push('가는 비행기 시각 미입력 → 시각 미정');
      if (!backOk) assumed.push('오는 비행기 시각 미입력 → 시각 미정');
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
      pc.tags.forEach(t => { if (likes.has(t)) s += 2; if (tagW && tagW[t]) s += tagW[t]; });
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
      if (loc !== cl(first.place)) { items.push({ k: 'm', s: cur, e: cur + mv, mode: 'train', n: '전철', mv: '전철·걷기 · 약 ' + mnTx(mv) + '' + estTx(loc, cl(first.place)), to: PL[first.place].q, tc: cl(first.place) }); cur += mv; }
      for (const st of pc.steps) {
        const p = PL[st.place]; if (!p) return null;
        if (loc && cl(st.place) === loc && items.length && items[items.length - 1].k !== 'm') { const w = 10; items.push({ k: 'm', s: cur, e: cur + w, mode: 'walk', n: '걸어서', mv: '걸어서 · 약 ' + mnTx(w) + '', to: p.q }); cur += w; }
        const o = openAt(p, date, cur, st.stay); if (!o.ok) return { fail: p.n + ' ' + o.why };
        const s = o.start, e = s + st.stay;
        if (o.end && e > o.end + 1) return { fail: p.n + ' 닫는 시각' };
        const tw = twOf(p, pc.slots && pc.slots.length === 1 && pc.slots[0] === 'night');
        if (tw === 'night' && s < 1050) return { fail: p.n + ' 밤 전용(17:30 이후)' };   // 11/13: 야경·바 같은 밤 전용을 낮 시각에 넣지 않음
        if (tw === 'morning' && s >= 720) return { fail: p.n + ' 아침 전용(정오 전)' };
        items.push({ k: st.meal && st.meal !== '간식' ? 'f' : (o.opensAt ? 'x' : 'p'), s, e, n: (st.meal && st.meal !== '간식' ? st.meal + ' — ' : '') + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: o.unknown ? 'no' : 'ok', info: p.oTx ? [['영업', p.oTx]] : null, pid: st.place, meal: st.meal, tw: tw || undefined, oh: o.ran });
        if (o.opensAt) warn.push({ lv: 'red', ref: p.sh || p.n, t: (p.sh || p.n) + ' ' + o.opensAt + ' 문 열 때 맞춰 도착' });
        if (o.unknown) warn.push({ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 확인 필요 · 전날 확인' });
        cur = e; loc = cl(st.place);
      }
      return { items, warn, end: cur, loc };
    }
    // must: 그날 우선 배치. 반나절 조각 대신 그 장소 하나를 지금 시각·위치에 넣어 봄 (영업시간·밤/아침 전용·이동 규칙은 tryPiece 그대로). 안 되면 mustWhy에 이유만 남기고 다음 칸에서 다시
    function mustPiece(group, t) { const steps = group.map(id => { const p = PL[id]; return { place: id, stay: Math.min(p.st || 60, group.length > 1 ? 90 : 120), meal: p.kind === 'restaurant' ? (t >= 1050 ? '저녁' : '점심') : undefined }; }); return { id: 'must:' + group.join('+'), name: group.map(id => PL[id].sh || PL[id].n).join(' · '), steps, auto: 1 }; }
    function takeMust(date, t, at, until) {
      for (const lead of mustQ) {
        if (!PL[lead]) continue;
        const mates = mustQ.filter(x => x !== lead && PL[x] && cl(x) === cl(lead));   // 같은 동네 must는 한 칸에 묶어 넣어 봄 (최대 3곳)
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
      (p.tg || []).forEach(x => { if (likes.has(x)) s += 2; if (tagW && tagW[x]) s += tagW[x]; });
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
        const dur = o.end ? Math.min(p.st || 60, o.end - o.start) : (p.st || 60); if (dur < 30) continue;   // 닫는 시각을 넘기지 않게 식사 시간을 줄임 (11/13)
        usedPlaces.add(id);
        const items = []; if (go) items.push({ k: 'm', s: t, e: t + go, mode: 'train', n: '이동', mv: '약 ' + mnTx(go) + '' + estTx(at, cl(id)), to: p.q, tc: cl(id) });
        items.push({ k: 'f', s: o.start, e: o.start + dur, n: kind + ' — ' + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: o.unknown ? 'no' : 'ok', info: p.oTx ? [['영업', p.oTx]] : null, pid: id, oh: o.ran });
        return { items, end: o.start + dur, loc: cl(id), warn: o.unknown ? [{ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 확인 필요' }] : [] };
      }
      const area = D.clName[at] || '근처';
      return { items: [{ k: 'f', s: t, e: t + 60, n: kind + ' — ' + area + ' 근처', sh: kind, say: '가서 고르기 · 줄이 길면 옆 가게로', q: D.clQ[at] || area }], end: t + 60, loc: at, warn: [] };
    }

    // 옆 도시(교토 등) 가는 날 수 — 옆 도시가 없는 곳(도쿄)은 0
    const middle = N - 2, kyotoDays = !C.side || middle <= 0 ? 0 : Math.min(middle, Math.max(1, Math.round(middle * (G === 'HS' ? 0.6 : 0.45))));
    const kyotoIdx = new Set(); for (let i = 0; i < kyotoDays; i++) kyotoIdx.add(2 + i * 2 <= N - 1 ? 2 + i * 2 : 2 + i);
    const days = [], notes = {}; let carry = 0;
    const fmtD = d => (d.getMonth() + 1) + '. ' + d.getDate() + ' ' + WDK[d.getDay()];
    for (let i = 1; i <= N; i++) {
      const date = new Date(start); date.setDate(start.getDate() + i - 1);
      const city = kyotoIdx.has(i) ? C.side : C.main;
      ate.l = ate.d = false; mustQ = (MUSTD[i - 1] || []).slice();
      const it = [], nt = []; let t, at = base; const blocks = [];
      const push = arr => arr.forEach(x => it.push(x));
      const addBlock = (slot, until, cityX) => { const b = place(cityX || city, slot, date, t, at, until); if (!b) return false; push(decorate(b)); nt.push(...b.warn); blocks.push(b.pc.name); t = b.end; at = b.loc; return true; };
      const decorate = b => { const its = b.items.map(x => ({ ...x })); if (b.alt) { const f = its.find(x => x.k !== 'm'); if (f) f.say = '또는 ' + b.alt.name + (f.say ? ' · ' + f.say : ''); } return its; };
      const flushMust = until => { while (mustQ.length && t < until) { const m = takeMust(date, t, at, until); if (!m) break; push(decorate(m)); nt.push(...m.warn); blocks.push(m.pc.name); t = m.end; at = m.loc; } };   // 그날 must가 남았으면 빈 시간에 끼움
      const addMeal = kind => { const m = meal(kind, city, date, t, at); push(m.items); nt.push(...m.warn); t = m.end; at = m.loc; };
      const rest = (len, why) => { const back = at === base ? 0 : mins(at, base); if (back) it.push({ k: 'm', s: t, e: t + back, mode: 'train', n: '숙소로', mv: '숙소로 · 약 ' + mnTx(back) + '' + estTx(at, base), to: BQ }); t += back; it.push({ k: 'p', s: t, e: t + len, n: why, sh: '숙소 휴식', q: BQ }); t += len; at = base; };
      // 첫날 도착 뒤: 짐 → 점심(11:00~14:30) → 오후 조각 → 체크인/휴식 → 저녁(~21:00) → 밤 조각. 한밤 도착이면 체크인만
      const arriveTail = bagSay => {
        if (t >= toMin('21:00')) { it.push({ k: 'p', s: t, e: t + 30, sh: '체크인', n: baseName + ' · 숙소 체크인', q: BQ }); t += 30; at = base; return; }
        it.push({ k: 'p', s: t, e: t + 30, sh: '숙소 · 짐', n: baseName + ' · 숙소에 짐 맡기기', say: bagSay, q: BQ }); t += 30;
        if (!ate.l && t < toMin('12:30')) addMeal('점심');
        if (t <= toMin('15:30')) addBlock('pm', toMin(F ? '18:00' : '17:00'));
        if (!F) rest(60, '숙소 체크인 · 휴식'); else if (t < toMin('17:30')) { it.push({ k: 'p', s: t, e: t + 30, sh: '체크인', n: '숙소 체크인', q: BQ }); t += 30; at = base; }
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
        const back0 = at === base ? 0 : mins(at, base), free = leave - back0 - t;
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
          const dep = toMin(out[0]), arr = spanEnd(out[0], out[1]), hub = dep - R.pre, hc = mode === 'air' ? homeCarMin(R.fc, hub, date, false) : null, hmo = hc || homeMin, leave = hub - hmo;
          it.push({ k: 'w', s: leave - 45, n: '기상', say: mode === 'air' ? '신분증·지갑·충전기 확인' : '승차권·지갑·충전기 확인' });
          it.push({ k: 'm', s: leave, e: hub, mode: 'home', n: '집에서 출발', mv: '집 → ' + R.fromName + ' · ' + homeTx(hc, hmo), to: R.fromName });
          it.push({ k: 'p', s: hub, e: dep, sh: R.fromName, n: R.fromName, say: mode === 'air' ? '탑승 수속·보안 검색 먼저' : '타는 곳 확인', q: R.fromName });
          it.push({ k: 'x', s: dep, e: arr, fly: [R.fc, R.fromName, R.tc, R.toName], ride: mode, line: R.lineTx, pre: R.pre, fno: fnoOut || undefined, n: R.lineTx + ' · ' + R.fromName + ' → ' + R.toName + (fnoOut ? ' ' + fnoOut : ''), mv: R.lineTx });
          it.push({ k: 'p', s: arr, e: arr + R.ex, sh: R.toName, n: R.toName + ' 도착', say: TB[1] + ' 타는 곳으로', q: R.toName });
          it.push({ k: 'm', s: arr + R.ex, e: arr + R.ex + TB[0], mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + mnTx(TB[0]) + '', to: BQ });
          t = r5(arr + R.ex + TB[0]); route = ['집', R.fromName, R.toName, baseName];
        } else if (mode === 'car') {
          const leave = toMin(R.carOutDep), L = R.tabOut ? carLeg(R.kOut, leave, date) : null, dur = L ? L.dur : CAR_ASSUME, arrv = leave + dur, tb = R.tabOut ? carTable(R.kOut, date) : null;
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
      else if (i === 1) {
        const dep = toMin(out[0]), arr = spanEnd(out[0], out[1]), airport = dep - 120, hcO = homeCarMin('ICN', airport, date, false), hmo = hcO || homeMin, leave = airport - hmo;
        if (hcO && leave - 45 < 0) nt.push({ lv: 'amber', t: '집 출발이 자정 전 · 전날 공항 근처에서 자는 것도 방법' });
        it.push({ k: 'w', s: leave - 45, n: '기상', say: '여권·지갑·충전기 확인' });
        it.push({ k: 'm', s: leave, e: airport, mode: 'home', n: '집에서 출발', mv: '집 → 인천공항 · ' + homeTx(hcO, hmo), to: '인천국제공항' });
        it.push({ k: 'p', s: airport, e: dep, sh: '인천공항', n: '인천공항', say: '체크인·출국 심사 먼저', q: '인천국제공항' });
        it.push({ k: 'x', s: dep, e: arr, fly: ['ICN', '인천', apK, AP.name], fno: fnoOut || undefined, n: '비행기 · 인천 → ' + AP.name + (fnoOut ? ' ' + fnoOut : ''), mv: '비행기' });
        it.push({ k: 'p', s: arr, e: arr + 60, sh: AP.name + '공항', n: AP.name + '공항 도착', l: AP.l, say: AP.say, q: AP.q });
        const tr = TB[0];
        it.push({ k: 'm', s: arr + 60, e: arr + 60 + tr, mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + mnTx(tr) + '', to: BQ });
        t = r5(arr + 60 + tr); if (!DT) { arriveTail('체크인 전 짐만 보관'); if (mustQ.length && t < toMin('21:30')) flushMust(toMin('22:30')); }
        title = '도착하자마자 ' + (blocks[0] || '동네 산책'); route = ['집', '인천공항', AP.name + '공항', baseName];
        if (DT) { const ro = route; backIntl(true); title = '당일치기 — ' + (blocks[0] || '동네 산책'); route = ro.concat(route.slice(1)); }
      } else if (i === N) backIntl(false);
      else {
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
        if (mustQ.length) flushMust(toMin('22:00'));
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: '숙소로', mv: '숙소로 · 약 ' + mnTx(b) + '' + estTx(at, base), to: BQ }); t += b; }
        title = (city === C.side ? C.side + ' — ' : '') + (blocks.slice(0, 2).join(' · ') || '자유 일정');
        route = [baseName].concat(it.filter(x => x.tc).map(x => D.clName[x.tc])).concat(at === base ? [] : [baseName]);
      }
      function backDom(dt) {
        let hub = null, leave, dep, arr;
        if (R.pre) { dep = toMin(back[0]); arr = spanEnd(back[0], back[1]); hub = dep - R.pre; leave = hub - (TB[0] + 5); }
        else leave = toMin(mode === 'car' ? R.carBackDep : '17:00');
        let leave2 = leave;
        if (dt) dayFill(leave); else t = checkoutMorning(leave);
        if (leave - t >= 150) { addBlock('am', leave - 60); }
        if (leave - t >= 50 && !ate.l && t <= toMin('14:30')) { const m = meal('점심', C.main, date, t, at); if (m.end + (m.loc === base ? 0 : mins(m.loc, base)) <= leave) { push(m.items); t = m.end; at = m.loc; } else { it.push({ k: 'f', s: t, e: t + 40, n: (t < 660 ? '브런치' : '점심') + ' — ' + baseName + ' 근처', sh: '점심', say: '출발 전 간단히', q: BQ }); t += 40; at = base; } }
        if (R.pre && leave - t >= 150) { addBlock('pm', leave - 60); }
        if (mustQ.length) flushMust(leave - 60);
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: dt ? '이동' : '숙소로', mv: (dt ? '돌아가는 길 · 약 ' : '짐 찾으러 · 약 ') + mnTx(b) + '' + estTx(at, base), to: BQ }); t += b; at = base; }
        if (t > leave) leave2 = t;
        if (R.pre) {
          it.push({ k: 'm', s: leave2, e: Math.max(hub, leave2 + TB[0]), mode: 'train', n: TB[1], mv: R.toName + '으로 · ' + TB[1] + ' 약 ' + mnTx(TB[0]) + '', to: R.toName });
          it.push({ k: 'x', s: Math.min(dep, Math.max(hub, leave2 + TB[0])), e: dep, sh: R.toName, n: R.toName + (mode === 'air' ? ' · 탑승 수속' : ' · 타는 곳'), say: mode === 'air' ? '신분증 · 출발 ' + mnTx(R.pre) + ' 전 도착' : '기념품은 역 안에서', q: R.toName });
          it.push({ k: 'x', s: dep, e: arr, fly: [R.tc, R.toName, R.fc, R.fromName], ride: mode, line: R.lineTx, pre: R.pre, fno: fnoBack || undefined, n: R.lineTx + ' · ' + R.toName + ' → ' + R.fromName + (fnoBack ? ' ' + fnoBack : ''), mv: R.lineTx });
          it.push({ k: 'p', s: arr, e: arr + R.ex, sh: R.fromName, n: R.fromName + ' 도착', q: R.fromName });
          const hc = mode === 'air' ? homeCarMin(R.fc, arr + R.ex, date, true) : null, hmb = hc || homeMin;
          it.push({ k: 'm', s: arr + R.ex, e: arr + R.ex + hmb, mode: 'home', n: '집으로', mv: R.fromName + ' → 집 · ' + homeTx(hc, hmb) });
          it.push({ k: 'p', s: arr + R.ex + hmb, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
          if (backOk) nt.push({ lv: 'red', ref: R.toName, t: R.toName + ' ' + toT(hub) + '까지 도착 · 출발 ' + mnTx(R.pre) + ' 전' });
          route = [baseName, R.toName, R.fromName, '집'];
        } else {
          const LB = mode === 'car' && R.tabBack ? carLeg(R.kBack, leave2, date) : null;
          const drive = LB ? LB.dur : mode === 'car' ? CAR_ASSUME : R.min;
          if (mode === 'car') { const tb = R.tabBack ? carTable(R.kBack, date) : null; it.push({ k: 'x', s: leave2, e: leave2 + drive, mode: 'car', ride: 'car', fly: [baseName, baseName, '집', '집'], car: { d: tb && tb.d, rs: tb && tb.rs, est: !!LB, rest: !!(LB && LB.rest), park: 0, dflt: R.dBack || undefined }, n: '차 · ' + baseName + ' → 집', to: '집', drv: LB ? LB.drv : undefined }); }
          else it.push({ k: 'm', s: leave2, e: leave2 + drive, mode: 'home', n: '집으로', mv: baseName + ' → 집 · 지하철 약 ' + mnTx(R.min) + ' (가정)' });
          it.push({ k: 'p', s: leave2 + drive, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
          if (mode === 'car') nt.push({ lv: 'gray', t: '일·연휴 오후 고속도로 막힘 · 출발 확인' });
          route = [baseName, '집'];
        }
        title = '돌아가는 날' + (blocks[0] ? ' — ' + blocks[0] : '');
      }
      function backIntl(dt) {
        const dep = toMin(back[0]), arr = spanEnd(back[0], back[1]), airport = dep - 120, leave = airport - (TB[0] + 5); let leave2 = leave;
        if (dt) dayFill(leave); else t = checkoutMorning(leave);
        if (leave - t >= 150) { addBlock('am', leave - 60); }
        if (leave - t >= 50 && !ate.l && t <= toMin('14:30')) { const m = meal('점심', C.main, date, t, at); if (m.end + (m.loc === base ? 0 : mins(m.loc, base)) <= leave) { push(m.items); t = m.end; at = m.loc; } else { it.push({ k: 'f', s: t, e: t + 40, n: (t < 660 ? '브런치' : '점심') + ' — ' + baseName + ' 역 근처', sh: '점심', say: '공항 가기 전 간단히', q: BQ }); t += 40; at = base; } }
        if (mustQ.length) flushMust(leave - 60);
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: dt ? '이동' : '숙소로', mv: (dt ? '돌아가는 길 · 약 ' : '짐 찾으러 · 약 ') + mnTx(b) + '' + estTx(at, base), to: BQ }); t += b; at = base; }
        if (t > leave) leave2 = t;
        it.push({ k: 'm', s: leave2, e: Math.max(airport, leave2 + TB[0]), mode: 'train', n: TB[1], mv: '공항으로 · ' + TB[1] + ' 약 ' + mnTx(TB[0]) + '', to: AP.q });
        it.push({ k: 'x', s: airport, e: dep, sh: AP.name + '공항', n: AP.name + '공항 · 체크인', l: AP.l, say: '면세품 있으면 세관 먼저', q: AP.q });
        it.push({ k: 'x', s: dep, e: arr, fly: [apK, AP.name, 'ICN', '인천'], fno: fnoBack || undefined, n: '비행기 · ' + AP.name + ' → 인천' + (fnoBack ? ' ' + fnoBack : ''), mv: '비행기' });
        it.push({ k: 'p', s: arr, e: arr + 50, sh: '인천공항', n: '인천공항 도착', q: '인천국제공항' });
        const hcB = homeCarMin('ICN', arr + 50, date, true), hmb = hcB || homeMin;
        it.push({ k: 'm', s: arr + 50, e: arr + 50 + hmb, mode: 'home', n: '집으로', mv: '인천공항 → 집 · ' + homeTx(hcB, hmb) });
        it.push({ k: 'p', s: arr + 50 + hmb, sh: '집 도착', n: '집 도착 — 여행 끝', est: 1 });
        if (backOk) nt.push({ lv: 'red', ref: AP.name + '공항', t: AP.name + '공항 ' + toT(airport) + '까지 도착 · 출발 2시간 전' });
        nt.push({ lv: 'gray', t: '면세품은 짐 부치기 전 세관 먼저' });
        title = '돌아가는 날' + (blocks[0] ? ' — ' + blocks[0] : ''); route = [baseName, AP.name + '공항', '인천공항', '집'];
      }
      // 못 넣은 must → 그날 메모 (맨 앞)
      if (mustQ.length) mustQ.slice().reverse().forEach(id => nt.unshift({ lv: 'amber', t: '못 넣은 곳: ' + (PL[id] ? PL[id].sh || PL[id].n : id) + '(' + (mustWhy[id] || '남은 시간 부족') + ')' }));
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
        else { title = (city === C.side ? C.side + ' — ' : '') + ar.slice(0, 2).join(' · '); route = [baseName].concat(ar).concat([baseName]); }
      }
      if (i === 1) carry = Math.max(0, t - 1440);   // 한밤(다음 날) 도착이면 둘째 날 늦게 시작
      it.push({ k: 'w', s: i === N || t > toMin('22:30') ? null : toMin('22:30'), n: '취침' });
      if (blocks.length && !BLANK) nt.push({ lv: 'gray', t: '늦어지면 ' + blocks[blocks.length - 1] + ' 먼저 빼기' });
      const flyS = it.filter(x => x.fly && x.s != null).map(x => x.s);
      const items = it.filter(x => x.s != null).map(x => { const o = { ...x }; if (x.fly) { o.s = toT(x.s); o.e = toT(x.e); } else { o.s = toT(r5(x.s)); if (x.e != null) { let e = Math.max(r5(x.e), r5(x.s)); const nf = flyS.find(f => f >= x.s && f < e); if (nf != null) e = Math.max(nf, r5(x.s)); o.e = toT(e); } }   /* 5분 올림이 뒤 열차·비행기 출발 시각을 넘지 않게 */   /* 비행기·열차 = 실제 시각 그대로 */ delete o.tc; delete o.meal;   /* pid는 남김: 앱의 '문 닫았어요'가 장소 DB에서 같은 종류를 찾을 때 씀 */ if (!o.info) delete o.info; return o; });
      const seen = new Set(); notes[i] = nt.filter(n => { const k = n.t; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);
      days.push({ no: i, tbd: ((i === 1 && !outOk) || (i === N && !backOk)) && !(DOM && mode === 'car') || undefined, city, base: baseName, date: fmtD(date), title, route: route.filter((x, k, a) => x && x !== a[k - 1]).join(' → '), drop: blocks.length ? blocks[blocks.length - 1] + ' 먼저 빼기' : '', codes: '', items, ...(areaDay ? { area: areaDay } : {}) });
    }
    const wd = DOM && mode === 'train' ? '열차' : '비행기';
    // 시각 미입력 = 그날 시각을 숨기고 순서만(앱이 days[].tbd로 처리). 안내 글에 가정 시각을 넣지 않음
    if (!DOM || R.pre) {
      if (!outOk) (notes[1] = notes[1] || []).unshift({ lv: 'amber', ref: DOM ? R.fromName : '인천공항', t: '가는 ' + wd + ' 시각 미입력 · 넣으면 그날 시간이 정해져요' });
      if (!backOk) (notes[N] = notes[N] || []).unshift({ lv: 'amber', ref: DOM ? R.toName : AP.name + '공항', t: '오는 ' + wd + ' 시각 미입력 · 넣으면 그날 시간이 정해져요' });
    }
    let carAttr;
    if (DOM && mode === 'car') {
      if (!outOk) (notes[1] = notes[1] || []).unshift({ lv: 'amber', t: '차 출발 시각 미입력 · 09:00 출발로 계산 · 차 카드에서 바꿔요' });
      if (!backOk) (notes[N] = notes[N] || []).unshift({ lv: 'amber', t: '돌아오는 차 출발 시각 미입력 · ' + R.carBackDep + ' 출발로 계산 · 차 카드에서 바꿔요' });
      if (!R.tabOut) (notes[1] = notes[1] || []).push({ lv: 'gray', t: '운전 시간 미확인 · 4시간 가정 · 내비로 확인' });
      if (!R.tabBack) (notes[N] = notes[N] || []).push({ lv: 'gray', t: '돌아오는 운전 시간 미확인 · 4시간 가정 · 내비로 확인' });
      if (R.tabOut || R.tabBack) {
        (notes[R.tabOut ? 1 : N] = notes[R.tabOut ? 1 : N] || []).push({ lv: 'gray', t: '차 시간 = 도로×혼잡+휴게소 (추정)' });
        assumed.push('차 시간 = 도로 기준 × 시간대 혼잡 + 휴게소 쉼(2시간마다 15분)' + (R.tabOut ? ' · 도착 뒤 주차·도보 ' + mnTx(CAR_POLICY.parkMin) + '' : '') + ' (추정)');
        carAttr = (D.car.meta && D.car.meta.attribution) || '경로 © openrouteservice.org · © OpenStreetMap contributors';
      }
    }
    // 시·군·구 출발이 실제로 쓰였을 때: 가정 목록·1일차 안내·출처
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
    return { v: 1, type, title: (input.cityLabel || C.label) + (DT ? ' 당일치기' : ' ' + nights + '박 ' + N + '일'), sub: (DT ? f2(start) : f2(start) + ' – ' + f2(end)) + ' · 집에서 집까지', start: start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0'), days, notes, assumed, local: C.local || null, sgg: SG && sgUsed ? SG.name : null, dest: input.dest || 'kix', go: DOM ? { mode, line: R.lineTx || null, region: R.region } : { mode: 'intl', airport: apK }, carAttr, ...(BLANK ? { blank: true } : {}), inp: JSON.parse(JSON.stringify(input)), made: new Date().toISOString() };   // inp = 11/14 #28: 앱에서 비행기 시각을 바꾸면 그날을 다시 짤 때 씀
  }
  // 차 예상 도착 (질문지 start.html도 이 함수를 씀): key 'pt>base' 또는 'sgg:서울 마포구>base' · dep 'HH:MM' · date Date · dest 도시코드 → { dep, arr 'HH:MM', next(다음 날), dur(분), rest(휴게소 쉼 포함) } 또는 null(표에 없음)
  function carEta(key, dep, date, dest) {
    const T = pairOf(key); if (!T || !(T.min > 0) || !/^\d{1,2}:\d{2}$/.test(dep || '')) return null;
    const leave = toMin(dep), raw = T.min * carMult(T.km || 999, leave, date, dest), rest = Math.floor(raw / CAR_POLICY.restEvery) * CAR_POLICY.restMin, arr = Math.max(r5(leave + raw + rest), leave + 30);
    return { dep: toT(leave), arr: toT(arr).replace(/\(.*/, ''), next: arr >= 1440, dur: arr - leave, rest: rest > 0 };
  }
  window.GABOJA_GEN = { make, carEta, CAR_POLICY, version: 8, dests: Object.keys(D.cfg || {}) };
})();
