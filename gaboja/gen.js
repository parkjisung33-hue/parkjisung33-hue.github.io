/* 가보자 일정 조립 엔진 v1 (2026-11-12, 오사카·교토 시범)
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
  const toT = m => { m = Math.round(m); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const r5 = m => Math.ceil(m / 5) * 5;
  const PL = D.places, PC = D.pieces;
  const cl = id => (PL[id] && PL[id].cl) || '';
  const isEst = (a, b) => (D.est || []).includes(a < b ? a + '|' + b : b + '|' + a);
  function mins(a, b) {
    if (!a || !b || a === b) return a === b ? 8 : 30;
    const k1 = a + '|' + b, k2 = b + '|' + a;
    return D.areas[k1] || D.areas[k2] || (D.cityOf[a] === D.cityOf[b] ? 30 : 55);
  }
  // 날짜에 따라 다른 결과가 나오게 하는 고정 난수
  function rng(seed) { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; }; }

  // 장소가 그 날·그 시각에 되는지: {ok, start(기다린 뒤 시작), why}
  function openAt(p, date, t, stay) {
    const wd = WD[date.getDay()], md = String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    if (p.sea && !p.sea.some(([a, b]) => a <= b ? md >= a && md <= b : md >= a || md <= b)) return { ok: false, why: '기간 아님' };
    if (p.mday && !p.mday.includes(date.getDate())) return { ok: false, why: '장 서는 날 아님' };
    const h = p.h; if (!h) return { ok: true, start: t, unknown: true };
    if ((h.x || []).includes(wd)) return { ok: false, why: WDK[date.getDay()] + '요일 휴무' };
    for (const c of h.cd || []) { const [a, b] = c.split('..'); if (b ? (a <= b ? md >= a && md <= b : md >= a || md <= b) : md === a) return { ok: false, why: '휴무일' }; }
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
    const apK = C.airports[input.airport] ? input.airport : Object.keys(C.airports)[0], AP = C.airports[apK];
    const out = hm(fo.dep) && hm(fo.arr) ? [hm(fo.dep), hm(fo.arr)] : !input.fo && tm && tm.length >= 2 ? [tm[0].padStart(5, '0'), tm[1].padStart(5, '0')] : AP.out;
    const back = hm(fb.dep) && hm(fb.arr) ? [hm(fb.dep), hm(fb.arr)] : AP.back;
    const outOk = !!(hm(fo.dep) && hm(fo.arr)) || (!input.fo && !!(tm && tm.length >= 2)), backOk = !!(hm(fb.dep) && hm(fb.arr));
    if (!outOk) assumed.push('가는 비행기 인천 ' + AP.out[0] + ' → ' + AP.name + ' ' + AP.out[1] + ' 가정');
    if (!backOk) assumed.push('오는 비행기 ' + AP.name + ' ' + AP.back[0] + ' → 인천 ' + AP.back[1] + ' 가정');
    assumed.push('동네 사이 이동 시간은 대략값 · 길찾기 버튼으로 실제 시간 확인');
    const fnoOut = String(fo.no || '').toUpperCase().slice(0, 8), fnoBack = String(fb.no || '').toUpperCase().slice(0, 8);
    const B = C.bases.find(b => b.re && new RegExp(b.re).test(input.stayTx || '')) || C.bases[0];
    const base = B.key, baseName = B.name, TB = (C.toBase[apK] || {})[base] || [60, '전철'];
    const homeMin = 75; // 집 → 인천공항 (주소별 계산은 앱 단계, 지금은 가정)

    // 조각 점수
    const used = new Set(), usedPlaces = new Set();
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
      if (loc !== cl(first.place)) { items.push({ k: 'm', s: cur, e: cur + mv, mode: 'train', n: '전철', mv: '전철·걷기 · 약 ' + mv + '분', to: PL[first.place].q, tc: cl(first.place) }); cur += mv; }
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
      for (const pc of list) {
        const r = tryPiece(pc, date, t, at);
        if (r && !r.fail && r.end <= until) {
          used.add(pc.id); pc.steps.forEach(st => usedPlaces.add(st.place));
          let alt = null;
          if (!J) { for (const pc2 of list) { if (pc2 === pc || used.has(pc2.id)) continue; const r2 = tryPiece(pc2, date, t, at); if (r2 && !r2.fail && r2.end <= until + 30) { alt = pc2; break; } } }
          return { pc, ...r, alt };
        }
      }
      return null;
    }
    // 식사: 그 동네 · 그 시각에 여는 식당
    function meal(kind, city, date, t, at) {
    if (kind === '점심' && t < toMin('11:00')) kind = '브런치';
      const pool = Object.entries(PL).filter(([id, p]) => p.city === city && p.kind === 'restaurant' && !usedPlaces.has(id));
      const near = pool.filter(([id]) => cl(id) === at).concat(pool.filter(([id]) => cl(id) !== at && mins(at, cl(id)) <= 20));
      for (const [id, p] of near.sort(() => rand() - 0.5).sort((a, b) => (cl(a[0]) !== at) - (cl(b[0]) !== at))) {
        const go = cl(id) === at ? 0 : mins(at, cl(id));
        const o = openAt(p, date, t + go, p.st || 60); if (!o.ok) continue;
        usedPlaces.add(id);
        const items = []; if (go) items.push({ k: 'm', s: t, e: t + go, mode: 'train', n: '이동', mv: '약 ' + go + '분', to: p.q, tc: cl(id) });
        items.push({ k: 'f', s: o.start, e: o.start + (p.st || 60), n: kind + ' — ' + p.n, sh: p.sh || p.n, l: p.l, say: p.say || '', q: p.q, ck: o.unknown ? 'no' : 'ok', info: p.oTx ? [['영업', p.oTx]] : null, pid: id });
        return { items, end: o.start + (p.st || 60), loc: cl(id), warn: o.unknown ? [{ lv: 'amber', ref: p.sh || p.n, t: (p.sh || p.n) + ' 영업시간 확인 필요' }] : [] };
      }
      const area = D.clName[at] || '근처';
      return { items: [{ k: 'f', s: t, e: t + 60, n: kind + ' — ' + area + ' 근처', sh: kind, say: '현장 선택 · 줄이 길면 옆 가게', q: D.clQ[at] || area }], end: t + 60, loc: at, warn: [] };
    }

    // 옆 도시(교토 등) 가는 날 수 — 옆 도시가 없는 곳(도쿄)은 0
    const middle = N - 2, kyotoDays = !C.side || middle <= 0 ? 0 : Math.min(middle, Math.max(1, Math.round(middle * (G === 'HS' ? 0.6 : 0.45))));
    const kyotoIdx = new Set(); for (let i = 0; i < kyotoDays; i++) kyotoIdx.add(2 + i * 2 <= N - 1 ? 2 + i * 2 : 2 + i);
    const days = [], notes = {};
    const fmtD = d => (d.getMonth() + 1) + '. ' + d.getDate() + ' ' + WDK[d.getDay()];
    for (let i = 1; i <= N; i++) {
      const date = new Date(start); date.setDate(start.getDate() + i - 1);
      const city = kyotoIdx.has(i) ? C.side : C.main;
      const it = [], nt = []; let t, at = base; const blocks = [];
      const push = arr => arr.forEach(x => it.push(x));
      const addBlock = (slot, until, cityX) => { const b = place(cityX || city, slot, date, t, at, until); if (!b) return false; push(decorate(b)); nt.push(...b.warn); blocks.push(b.pc.name); t = b.end; at = b.loc; return true; };
      const decorate = b => { const its = b.items.map(x => ({ ...x })); if (b.alt) { const f = its.find(x => x.k !== 'm'); if (f) f.say = '또는 ' + b.alt.name + (f.say ? ' · ' + f.say : ''); } return its; };
      const addMeal = kind => { const m = meal(kind, city, date, t, at); push(m.items); nt.push(...m.warn); t = m.end; at = m.loc; };
      const rest = (len, why) => { const back = at === base ? 0 : mins(at, base); if (back) it.push({ k: 'm', s: t, e: t + back, mode: 'train', n: '숙소로', mv: '숙소로 · 약 ' + back + '분', to: D.clQ[base] }); t += back; it.push({ k: 'p', s: t, e: t + len, n: why, sh: '숙소 휴식' }); t += len; at = base; };
      let title = '', route = [];
      if (i === 1) {
        const dep = toMin(out[0]), arr = toMin(out[1]), airport = dep - 120, leave = airport - homeMin;
        it.push({ k: 'w', s: leave - 45, n: '기상', say: '여권·지갑·충전기 확인' });
        it.push({ k: 'm', s: leave, e: airport, mode: 'home', n: '집에서 출발', mv: '집 → 인천공항 · 약 ' + homeMin + '분 (가정)', to: '인천국제공항' });
        it.push({ k: 'p', s: airport, e: dep, sh: '인천공항', n: '인천공항', say: '체크인·출국 심사 먼저', q: '인천국제공항' });
        it.push({ k: 'x', s: dep, e: arr, fly: ['ICN', '인천', apK, AP.name], fno: fnoOut || undefined, n: '비행기 · 인천 → ' + AP.name + (fnoOut ? ' ' + fnoOut : ''), mv: '비행기' });
        it.push({ k: 'p', s: arr, e: arr + 60, sh: AP.name + '공항', n: AP.name + '공항 도착', l: AP.l, say: AP.say, q: AP.q });
        const tr = TB[0];
        it.push({ k: 'm', s: arr + 60, e: arr + 60 + tr, mode: 'train', n: TB[1], mv: TB[1] + ' · 약 ' + tr + '분', to: D.clQ[base] });
        t = r5(arr + 60 + tr); it.push({ k: 'p', s: t, e: t + 30, sh: '숙소 · 짐', n: baseName + ' · 숙소에 짐 맡기기', say: '체크인 전 짐만 보관' }); t += 30;
        if (t < toMin('12:30')) { addMeal('점심'); }
        if (t <= toMin('15:30')) addBlock('pm', toMin(F ? '18:00' : '17:00'));
        if (!F) rest(60, '숙소 체크인 · 휴식'); else if (t < toMin('17:30')) { it.push({ k: 'p', s: t, e: t + 30, sh: '체크인', n: '숙소 체크인' }); t += 30; at = base; }
        t = Math.max(t, toMin('18:00')); addMeal('저녁');
        if (F) addBlock('night', toMin('22:30'));
        title = '도착하자마자 ' + (blocks[0] || '동네 산책'); route = ['집', '인천공항', AP.name + '공항', baseName];
      } else if (i === N) {
        const dep = toMin(back[0]), arr = toMin(back[1]), airport = dep - 120, leave = airport - (TB[0] + 5); let leave2 = leave;
        it.push({ k: 'w', s: toMin('08:30'), n: '기상', say: '짐 싸기' });
        t = toMin('10:00'); it.push({ k: 'p', s: t, e: t + 30, sh: '체크아웃', n: '체크아웃' }); t += 30;
        if (leave - t >= 150) { addBlock('am', leave - 60); }
        if (leave - t >= 50) { const m = meal('점심', C.main, date, t, at); if (m.end + (m.loc === base ? 0 : mins(m.loc, base)) <= leave) { push(m.items); t = m.end; at = m.loc; } else { it.push({ k: 'f', s: t, e: t + 40, n: '점심 — ' + baseName + ' 역 근처', sh: '점심', say: '공항 가기 전 간단히', q: D.clQ[base] }); t += 40; at = base; } }
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: '숙소로', mv: '짐 찾으러 · 약 ' + b + '분' }); t += b; at = base; }
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
        const wake = F ? '07:30' : '08:30'; it.push({ k: 'w', s: toMin(wake), n: '기상', say: city === C.side ? '편한 신발 · ' + C.side + '까지 이동' : '' });
        t = toMin(F ? '09:00' : '10:00');
        addBlock('am', toMin('13:30'));
        t = Math.max(t, toMin('12:00')); addMeal('점심');
        addBlock('pm', toMin(F ? '18:30' : '17:00'));
        // 오후가 길게 비면 조각 하나 더 (알차게 = 저녁 전까지, 여유롭게 = 휴식 전까지 1시간 40분 이상 남을 때)
        if (t + 100 <= toMin(F ? '18:30' : '16:30')) addBlock('pm', toMin(F ? '18:30' : '17:00'));
        if (!F) rest(city === C.side ? 45 : 75, '숙소 휴식');
        t = Math.max(t, toMin('18:30')); addMeal('저녁');
        if (F) addBlock('night', toMin('22:00'));
        if (at !== base) { const b = mins(at, base); it.push({ k: 'm', s: t, e: t + b, mode: 'train', n: '숙소로', mv: '숙소로 · 약 ' + b + '분', to: D.clQ[base] }); t += b; }
        title = (city === C.side ? C.side + ' — ' : '') + (blocks.slice(0, 2).join(' · ') || '자유 일정');
        route = [baseName].concat(it.filter(x => x.tc).map(x => D.clName[x.tc])).concat(at === base ? [] : [baseName]);
      }
      it.push({ k: 'w', s: i === N ? null : toMin('22:30'), n: '취침' });
      if (blocks.length) nt.push({ lv: 'gray', t: '늦어지면 ' + blocks[blocks.length - 1] + ' 먼저 빼기' });
      const items = it.filter(x => x.s != null).map(x => { const o = { ...x }; o.s = toT(r5(x.s)); if (x.e != null) o.e = toT(Math.max(r5(x.e), r5(x.s))); delete o.tc; delete o.pid; delete o.meal; if (!o.info) delete o.info; return o; });
      const seen = new Set(); notes[i] = nt.filter(n => { const k = n.t; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);
      days.push({ no: i, city, date: fmtD(date), title, route: route.filter((x, k, a) => x && x !== a[k - 1]).join(' → '), drop: blocks.length ? blocks[blocks.length - 1] + ' 먼저 빼기' : '', codes: '', items });
    }
    if (!outOk) (notes[1] = notes[1] || []).unshift({ lv: 'amber', ref: '인천공항', t: '가는 비행기 시각 미입력 · 09:00 가정' });
    if (!outOk) notes[1][0].t = '가는 비행기 시각 미입력 · ' + AP.out[0] + ' 가정';
    if (!backOk) (notes[N] = notes[N] || []).unshift({ lv: 'amber', ref: AP.name + '공항', t: '오는 비행기 시각 미입력 · ' + AP.back[0] + ' 가정' });
    (notes[1] = notes[1] || []).push({ lv: 'gray', t: '동네 사이 이동 시간 대략값' });
    const end = new Date(start); end.setDate(start.getDate() + nights);
    const f2 = d => (d.getMonth() + 1) + '. ' + d.getDate();
    return { v: 1, type, title: (input.cityLabel || C.label) + ' ' + nights + '박 ' + N + '일', sub: f2(start) + ' – ' + f2(end) + ' · 집에서 집까지', start: start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0'), days, notes, assumed, made: new Date().toISOString() };
  }
  window.GABOJA_GEN = { make, version: 3, dests: Object.keys(D.cfg || {}) };
})();
