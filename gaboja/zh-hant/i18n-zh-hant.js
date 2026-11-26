/* VZTR 중국어 손 사전 (번체, 2026-11-26~, 방한 대만 이용자용) — 모양은 i18n-ja.js와 같음(키 = 화면에 보이는 한국어 그대로 · 값 = 중국어). 자동 번역(i18n-zh-hant-auto.js)보다 이게 이김
   - 숫자는 '#', 장소 이름은 '@', '{n}'·'{m}'·'{d}' = 숫자, '{x}'·'{y}' = 아무 말 → 틀. 함수면 한국어 그대로 받음(null 돌려주면 다음 틀로)
   - 문체 = 문서/여행앱/2026-11-26_VZTR_중국어문체가이드_v1.md (你 · 짧게 · 24시간 · 「」 따옴표 · 대만 용어)
   - 아래: ① 요일·하루 제목 낱말 ② 함수 틀(i18n-ja.js 틀과 같은 키, 중국어 어순 · 한글 이름이 남으면 사전 > 로마자) ③ 한 글자 키 · 16유형 이름 */
(function () {
  const TT = s => (window.VZTR_I18N && VZTR_I18N.t ? VZTR_I18N.t(s) : s);
  const WK = { '일': '週日', '월': '週一', '화': '週二', '수': '週三', '목': '週四', '금': '週五', '토': '週六', '일요일': '星期日', '월요일': '星期一', '화요일': '星期二', '수요일': '星期三', '목요일': '星期四', '금요일': '星期五', '토요일': '星期六' };
  // 하루 제목 끝말(엔진 themeTitle의 W) → 짧은 중국어. 모르는 말이면 null
  const DAYW = w => { const S = { '맛집 탐방': '美食探店', '카페 투어': '逛咖啡廳', '쇼핑': '購物', '골목 산책': '逛巷弄', '명소 구경': '逛景點' }, M = { '맛집': '美食', '카페': '咖啡廳', '쇼핑': '購物', '산책': '散步', '명소': '景點' };
    if (S[w]) return S[w]; const m = String(w).match(/^(.+?)[와과] (.+)$/); return m && M[m[1]] && M[m[2]] ? M[m[1]] + '和' + M[m[2]] : null; };
  window.VZTR_ZH_HANT_FN = { TT, WK, DAYW };
})();
window.VZTR_ZH_HANT = {};

/* ===== 함수 틀 (i18n-ja.js 틀과 같은 키, 중국어 어순) ===== */
(function () {
  const HAN = /[가-힣]/, I = () => window.VZTR_I18N || {};
  const TQ = s => (I().tq ? I().tq(String(s)) : String(s));
  const RM = s => (I().roman ? I().roman(String(s)) : String(s));
  const ZH1 = s => { s = String(s).trim(); const e = TQ(s); return HAN.test(e) ? RM(e) : e; };   // 사전 > 로마자
  const FULL = s => { const e = TQ(String(s).trim()); return HAN.test(e) ? null : e; };
  const PATHZ = x => String(x).split(' → ').map(ZH1).join(' → ');
  const HAS = s => !!(I().has && I().has(s));
  const WK = VZTR_ZH_HANT_FN.WK, DAYW = VZTR_ZH_HANT_FN.DAYW;
  const num = v => /^-?\d+$/.test(String(v));
  const W = w => WK[w] ? '（' + WK[w] + '）' : null;
  const Q = x => '「' + x + '」';
  const wrapAfter = (suffix, f) => x => { if (HAS(x + suffix)) return null; const e = FULL(x); return e ? f(e) : null; };
  const CODE = /^(?:[A-Z0-9]{2}\d{2,4}|[A-Z]{3}|\d{3,4})$/;   // 편명·기차 번호·공항 코드
  const TO = { '공항': '機場', '숙소': '住宿', '집': '家' };
  const SIDE = { '로컬': '在地', '핫플': '熱門', '구경': '景點', '즐기기': '體驗', '알차게': '滿檔', '여유롭게': '悠閒', '계획형': '計畫', '즉흥형': '隨性' };
  /* 하루 제목: 엔진이 장소 이름을 줄여 씀(gen.js nmS) → 같은 규칙으로 줄인 한국어 이름 ↔ 중국어 이름 표(VZTR_ZH_HANT_PLACES) */
  let TTM = null, AREAS = null;
  const ttMap = () => { if (TTM) return TTM; const G = window.GABOJA_DATA, P = G && G.places, E = window.VZTR_ZH_HANT_PLACES || {}; if (!P) return {}; TTM = {}; AREAS = new Set(Object.values(G.clName || {}).flatMap(x => String(x).split(/[·\s]/)).concat(Object.values(P).map(p => String(p.area || '').split(/[·(\s]/)[0])).filter(Boolean));
    const nmS = x => String(x).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+(본점|본관|[^\s]{1,5}점)$/, '').replace(/\s+/g, ' ').trim();
    const zS = x => String(x).replace(/\s*[（(].*?[）)]\s*/g, '').replace(/\s*(本店|本館)$/, '').trim();
    Object.keys(P).forEach(id => { const p = P[id], x = E[id], z = (x && (x.short || x.n)) || (I().placeName && I().placeName(p)); if (!z || HAN.test(z)) return;
      const cn = String(p.city || ''), ce = I().tq ? I().tq(cn) : cn; [p.sh, p.n].forEach(k => { if (!k) return; const ko = nmS(k), e = zS(z);
        TTM[ko] = TTM[ko] || e; if (cn && ko.indexOf(cn + ' ') === 0) TTM[ko.slice(cn.length + 1)] = TTM[ko.slice(cn.length + 1)] || (e.indexOf(ce) === 0 ? e.slice(ce.length).trim() : e); if (cn && ko.slice(-cn.length - 1) === ' ' + cn) TTM[ko.slice(0, -cn.length - 1)] = TTM[ko.slice(0, -cn.length - 1)] || e; }); });
    return TTM; };
  const LW = { 신궁: '神宮', 신사: '神社', 공원: '公園', 시장: '市場', 전통시장: '傳統市場', 타워: '塔', 성: '城', 궁: '宮', 사: '寺', 미술관: '美術館', 박물관: '博物館', 해변: '海灘', 해수욕장: '海水浴場', 폭포: '瀑布', 온천: '溫泉', 정원: '庭園', 전망대: '觀景台', 시계탑: '鐘樓', 동물원: '動物園', 수족관: '水族館', 운하: '運河', 호수: '湖', 골목: '巷弄', 거리: '街', 야시장: '夜市', 한옥마을: '韓屋村' };
  const PNM = s => { s = String(s).trim(); if (LW[s]) return LW[s]; const f = FULL(s); if (f) return f; const m = ttMap()[s]; if (m) return m; return /^[가-힣]{2,6}$/.test(s) && AREAS && AREAS.has(s) ? RM(s) : null; };   // 로마자는 동네 이름일 때만
  const GEN = /(市場|公園|塔|站|博物館|美術館|庭園|商店街|巷弄)$/;
  const two = (a, b, f) => { const x = PNM(a), y = PNM(b); if (!x || !y) return null; const r = f(x, y); if (r.length <= 12) return r; const cut = v => { const c = v.replace(GEN, ''); return c.length >= 2 ? c : v; }; return f(cut(x), cut(y)); };   // 제목 한 줄: 길면 '市场'·'公园' 같은 꼬리말을 뺌
  const one = (a, f) => { const x = PNM(a); return x ? f(x) : null; };
  const TQ2 = x => { const r = TQ(x); return r && !HAN.test(r) ? r : null; };
  const MODE = [['공항리무진버스', '機場巴士'], ['공항리무진', '機場巴士'], ['리무진버스', '機場巴士'], ['리무진', '機場巴士'], ['공항버스', '機場巴士'], ['공항철도', '機場快線'], ['대중교통', '大眾運輸'], ['지하철', '地鐵'], ['전철', '地鐵'], ['시내버스', '市區公車'], ['고속버스', '客運'], ['시외버스', '城際客運'], ['버스', '公車'], ['택시', '計程車'], ['기차', '火車'], ['열차', '列車'], ['차', '開車'], ['걸어서', '步行'], ['도보', '步行']];
  const DUR = (h, m) => h ? '約' + h + '小時' + (m ? m + '分鐘' : '') : '約' + m + '分鐘';
  const TRV = x => { const m = /^(.+?)\s*약\s*(?:(\d+)시간)?\s*(?:(\d+)분)?\s*(\((?:추정|가정)\))?$/.exec(String(x).trim()); if (!m || (!m[2] && !m[3])) return null;
    let md = m[1].trim(); MODE.forEach(([k, v]) => { md = md.split(k).join(v); }); if (HAN.test(md)) { const t = TQ2(m[1].trim()); if (!t) return null; md = t; }
    return md + ' · ' + DUR(m[2], m[3]) + (m[4] ? '（推估）' : ''); };
  const RTE = x => { const m = /^(.+?)\s*→\s*(.+)$/.exec(String(x).trim()); if (!m) return null; const f = TO[m[1]] || PNM(m[1]), g = TO[m[2]] || PNM(m[2]); return f && g ? f + ' → ' + g : null; };
  Object.assign(window.VZTR_ZH_HANT, {
    // 숙소·날짜
    '{n}박은 {x}에서 출발·복귀해요': (n, x) => (+n === 1 ? '第1晚' : '第1–' + n + '晚') + '從' + ZH1(x) + '出發並返回',
    '{n}년 {m}월': (y, m) => y + '年' + m + '月',
    '{n}년 {m}월 {d}일': (y, m, d) => y + '年' + m + '月' + d + '日',
    '오늘 {n}월 {m}일 {x}': (m, d, w) => W(w) ? '今天 · ' + m + '月' + d + '日' + W(w) : null,
    '{n}.{m} {x}': (m, d, w) => W(w) ? m + '/' + d + ' ' + WK[w] : null,
    '{n}. {m} {x}': (m, d, w) => W(w) ? m + '/' + d + ' ' + WK[w] : null,
    '· {n}. {m} {x}': (m, d, w) => W(w) ? '· ' + m + '/' + d + ' ' + WK[w] : null,
    '{n}월 {m}일 {x}': (m, d, w) => W(w) ? m + '月' + d + '日' + W(w) : null,
    '{n}월 {m}일 {x} – {d}일 {y}': (m, d, w, e, z) => W(w) && W(z) ? m + '月' + d + '日' + W(w) + ' – ' + e + '日' + W(z) : null,
    '{n}일 · {m}월 {d}일 {x} – {y}일 {z}': (n, m, d, w, y, z) => W(w) && W(z) && num(y) ? n + '天 · ' + m + '/' + d + W(w) + ' – ' + y + '日' + W(z) : null,
    '날씨 {x}도 {y}도': (a, b) => num(a) && num(b) ? '天氣 ' + a + '° / ' + b + '°' : null,
    // 메일·발급
    '{x}(으)로 가이드북 링크를 보냈어요': x => '旅遊手冊連結已寄至' + x,
    '신청 완료! {x}(으)로 보내 드릴게요': x => '申請完成！將寄至' + x,
    '방금 만든 {x} 일정이 열려요. 메일 속 링크로 다른 폰에서도 열고 고칠 수 있어요.': () => '剛建立的行程已開啟。透過郵件裡的連結，也能在其他手機上開啟和修改。',
    '방금 만든 {x} 일정이 열려요. 시험판이라 아키가 한 번 더 확인한 가이드북을 따로 보내 드려요.': () => '剛建立的行程已開啟。這是試用版，Aki 會另外寄送再次核對過的旅遊手冊。',
    // 장소 설명
    '{x}로 유명해요': x => { const e = TQ(String(x).replace(/으$/, '')); return e && !HAN.test(e) ? '以' + e + '聞名' : null; },
    '대표 {x}': x => { const e = TQ(x); return e && !HAN.test(e) ? '招牌：' + e : null; },
    '{x} 쪽': x => { const p = String(x).split(/,\s*/); return p.every(w => SIDE[w]) ? '偏' + p.map(w => SIDE[w]).join('·') : null; },
    // 하루 제목(옛 틀)
    '{x} 도착, {y}': (c, w) => DAYW(w) ? '抵達 · ' + DAYW(w) : null,
    '{x}에서의 {y}': (c, w) => DAYW(w) || null,
    '{x}에서 마지막 {y}': (c, w) => DAYW(w) ? '最後一天 · ' + DAYW(w) : null,
    '{x} 당일치기 {y}': (c, w) => DAYW(w) ? '一日遊 · ' + DAYW(w) : null,
    '· {x}': x => { const e = VZTR_ZH_HANT_FN.TT(x); return e !== x && !HAN.test(e) ? '· ' + e : null; },
    // 대안 카드·구글 지도·동선
    '‘{x}’ 대신, 지금 문 연 비슷한 곳': x => '替代' + Q(ZH1(x)) + '：現在營業中的類似地點',
    '‘{x}’ 대신': x => '替代' + Q(ZH1(x)),
    '‘{x}’': x => { const e = FULL(x); return e ? Q(e) : null; },
    '{x} 근처 구글 지도에서 열기': x => '在Google地圖開啟' + ZH1(x) + '附近',
    '{x} 구글 지도에서 열기': x => '在Google地圖開啟' + ZH1(x),
    '동선: {x}': x => '路線：' + PATHZ(x),
    '{x} 외 {n}곳': (x, n) => PATHZ(x) + '等' + n + '處',
    '{x} 지도': wrapAfter(' 지도', e => e + '地圖'),
    '{x} (가정)': wrapAfter(' (가정)', e => e + '（假設）'),
    '{x} (추정)': wrapAfter(' (추정)', e => e + '（推估）'),
    '{x} (대략)': wrapAfter(' (대략)', e => e + '（大約）'),
    // 길·이동
    '✈ {x}': x => { const e = FULL(x); return e ? '✈ ' + e : null; },
    '{x}으로': x => { if (HAS(x + '으로')) return null; const e = TO[x] || FULL(x); return e ? '去' + e : null; },
    '{x}로': x => { if (HAS(x + '로')) return null; const e = TO[x] || FULL(x); return e ? '去' + e : null; },
    '{x}까지 이동': x => { const e = FULL(x); return e ? '前往' + e : null; },
    '늦어지면 {x} 먼저 빼기': x => { const e = FULL(x); return e ? '來不及就先跳過' + e : null; },
    '다음 {x}': x => { const m = /^(\d{1,2}:\d{2}) (.+)$/.exec(x); if (!m) return null; const e = FULL(m[2]); return e ? '接下來 ' + m[1] + ' ' + e : null; },
    '도착 {x}': x => /^\d{1,2}:\d{2}$/.test(x) ? '抵達' + x : null,
    '{x} 출발': x => /^\d{1,2}:\d{2}$/.test(x) ? '出發' + x : null,
    // 사진 출처 (이름 = 사전 > 로마자 · 라이선스 글은 사전으로)
    '사진 © {x} · {y}': (x, y) => { const e = HAN.test(y) ? FULL(y) : y; return e ? '照片 © ' + ZH1(x) + ' · ' + e : null; },
    '사진 © {x}': x => '照片 © ' + ZH1(x),
    '사진 · Google · {x}': x => '照片 · Google · ' + ZH1(x),
    '사진 · Google Maps · {x}': x => '照片 · Google Maps · ' + ZH1(x),
    // 공항·역 도착 · 체크인 줄
    '{x} 도착': wrapAfter(' 도착', e => '抵達' + e),
    '{x} 역': wrapAfter(' 역', e => /站$/.test(e) ? e : e + '站'),
    '{x}까지 도착 · 출발 {n}시간 전': (x, n) => { const m = /^(.+) (\d{1,2}:\d{2})$/.exec(x), e = m && FULL(m[1]); return e ? m[2] + '前抵達' + e + ' · 出發前' + n + '小時' : null; },
    '{x}까지 도착 · 출발 {n}분 전': (x, n) => { const m = /^(.+) (\d{1,2}:\d{2})$/.exec(x), e = m && FULL(m[1]); return e ? m[2] + '前抵達' + e + ' · 出發前' + n + '分鐘' : null; },
    '{x}에서 자유 시간': wrapAfter('에서 자유 시간', e => e + '自由活動'),
    // 코드가 붙은 이름: 'LSRJ 느린 산책가' · '인천 → 간사이 KE723' · '부산역 011'
    '{x} {y}': (a, b) => { if (/^[LH][SE][FR][JPOU]$/.test(a)) { const e = FULL(b); return e ? a + ' ' + e : null; } if (CODE.test(b)) { const e = FULL(a); return e ? e + ' ' + b : null; } return null; },
    'KTX {x}': x => { const e = FULL(x); return e ? 'KTX ' + e : null; },
    '차 {x}': x => { const e = FULL(x); return e ? '自駕 ' + e : null; },
    '출국 비행기 {x}': x => { if (HAS('출국 비행기 ' + x)) return null; const e = HAN.test(x) ? FULL(x) : x; return e ? '出境班機 ' + e : null; },
    '도착 비행기 {x}': x => { if (HAS('도착 비행기 ' + x)) return null; const e = HAN.test(x) ? FULL(x) : x; return e ? '入境班機 ' + e : null; },
    '또는 {x}': x => { const e = FULL(x); return e ? '或' + e : null; },
    '‘{x}’ 닫혀 있나요? 다른 곳 보기': x => Q(ZH1(x)) + '關門了？看看其他地方',
    // 질문 마지막 화면 · 유형
    '{x} 유형에 맞춰 골라 뒀어요': x => { const e = FULL(x); return e ? '已依' + e + '類型挑選' : null; },
    '먼저 넣는 곳: {x}': x => { const e = TQ(x); return HAN.test(e) ? null : '優先排入：' + e; },
    '{x}에 맞는 곳부터 골라요': x => { const e = FULL(x); return e ? '先挑適合' + e + '的地方' : null; },
    '{x}에서 {y} 취향에 맞는 곳 고르기': (c, t) => { const a = FULL(c), b = FULL(t); return a && b ? '在' + a + '挑符合' + b + '偏好的地方' : null; },
    '{x} 맞춤': wrapAfter(' 맞춤', e => e + '專屬'),
    '{x} 쪽으로 {n}%': (x, n) => { const e = FULL(x); return e ? '偏' + e + n + '%' : null; },
    '{x}, 몇 번째예요?': x => { const e = FULL(x); return e ? e + '，第幾次去？' : null; },
    '{x} 여행': x => { const e = FULL(x); return e ? e + '旅行' : null; },
    '매일 {x}에서 출발·복귀하는 동선으로 짜요': x => { const e = FULL(x); return e ? '路線依每天從' + e + '出發並返回安排' : null; },
    '{x} 숙소에서 출발': x => { const e = FULL(x); return e ? '從' + e + '住宿出發' : null; },
    // 하루 제목(gen.js themeTitle 11/24) — 장소 이름은 중국어 이름으로, 길면 꼬리말 뺌
    '{x}에서 {y}까지': (a, b) => two(a, b, (x, y) => x + '到' + y),
    '{x}과 {y}': (a, b) => two(a, b, (x, y) => x + '和' + y), '{x}와 {y}': (a, b) => two(a, b, (x, y) => x + '和' + y),
    '도착하자마자 {x}': a => one(a, x => '一到就去' + x), '{x}부터 시작': a => one(a, x => '從' + x + '開始'),
    '마지막으로 {x}': a => one(a, x => '最後去' + x), '도착, {x}': a => one(a, x => '抵達，' + x),
    '{x} 맛집 투어': a => one(a, x => x + '美食探店'), '{x} 카페 산책': a => one(a, x => x + '咖啡廳散步'),
    '{x} 쇼핑 산책': a => one(a, x => x + '逛街'), '{x} 골목 산책': a => one(a, x => '逛' + x + '巷弄'),
    '{x} 명소 산책': a => one(a, x => x + '景點遊'),
    '{x}에서 내 취향 장소 고르기': a => one(a, x => '在' + x + '挑喜歡的地方'),
    '{x} 빠짐 · {y}': (a, b) => two(a, b, (x, y) => '少了' + x + ' · ' + y),
    // 이동 문구(수단 + 시간)
    '대중교통이면 {x}': a => { const t = TRV(a); return t ? '大眾運輸：' + t : one(a, x => '大眾運輸：' + x); },
    '{x} 대중교통이면 {y}': (a, b) => { const f = RTE(a), t = TRV(b); return f && t ? f + '：' + t : null; },
    '못 넣은 곳: {x}({y})': (a, b) => { const x = PNM(a) || TQ2(a), y = TQ2(b); return x && y ? '未排入：' + x + '（' + y + '）' : null; },
    '못 넣은 곳: {x}': a => { const x = PNM(a) || TQ2(a); return x ? '未排入：' + x : null; },
    '{x} {n}:{m} 문 열 때 맞춰 도착': (x, h, m) => { const e = VZTR_ZH_HANT_FN.TT(x); return HAN.test(e) ? null : e + '：趕在' + h + ':' + m + '開門時抵達'; },
  });
})();

/* ===== 한 글자 키(자동 사전이 못 받는 것) · 16유형 이름 · 묶음 이름 ===== */
Object.assign(window.VZTR_ZH_HANT, {
  '월': '週一', '화': '週二', '수': '週三', '목': '週四', '금': '週五', '토': '週六', '일': '週日',
  '나': '我', '면': '麵', '바': '酒吧', '빵': '麵包店', '짐': '行李', '집': '家', '차': '自駕', '팁': '小費',
  '골목 탐험대장': '巷弄探險隊長', '프로 뚜벅이': '暴走達人', '느린 산책가': '慢步散步家', '동네 방랑자': '街區漫遊者',
  '맛집 큐레이터': '美食策展人', '득템 요정': '挖寶小精靈', '재방문 장인': '回頭客達人', '반쯤 현지인': '半個在地人',
  '명소 정복자': '景點征服者', '웨이팅 장인': '排隊達人', '인생샷 장인': '美照大師', '전망 감상가': '賞景鑑賞家',
  '고독한 미식가': '孤獨美食家', '쇼핑 중독자': '購物狂', '호캉스 여행자': '飯店度假派', '멍때리기 고수': '放空高手',
  '로컬 탐험형': '在地探索派', '취향 수집형': '品味收集派', '명소 정복형': '景點征服派', '힐링 충전형': '療癒充電派',
});
Object.assign(window.VZTR_ZH_HANT, { '{n}:{m}까지': '{n}:{m}前' });   // 11/27 검수: '07:00까지'
Object.assign(window.VZTR_ZH_HANT, { 'JNTO · 24시간 · 영어·중국어·한국어': 'JNTO · 24小時 · 英中韓' });   // 11/27 qa_lines: 한 줄 칸
Object.assign(window.VZTR_ZH_HANT, { '강릉시외버스터미널': '江陵長途站', '서울고속버스터미널': '首爾高速站', '속초고속버스터미널': '束草高速站', '속초시외버스터미널': '束草長途站', '통영종합버스터미널': '統營客運站', '와나카 영업시간이 자료마다 달라요 · 전날 전화로 확인': '營業時間說法不一，前一天電話確認', '늦어지면 도톤보리 → 숙소 휴식 순 단축': '晚了就少逛道頓堀、早點回去', '늦어지면 도톤보리 · 에비스바시 → 숙소 휴식 순 단축': '晚了就少逛道頓堀、早點回去' });   // 11/27 qa_lines: 버스표 칸(두 줄)·기본 일정 한 줄 주의 칸
// 11/27 C 외국인 필수 정보('한국 여행 준비' 카드) — 출처표 5절 · K-ETA·WOWPASS·112·119·역 표기는 번역 안 함
Object.assign(window.VZTR_ZH_HANT, { '한국 여행 준비': '韓國旅行準備', '확인할 것 {n}': '{n}項待確認', '공식 사이트': '官網', '공식 안내': '官方說明', '공항 안내': '機場指南', '대상 나라': '適用國家', '도착 전': '抵達前', '결제·교통': '支付·交通', '택시·지도': '計程車·地圖', '도움이 필요할 때': '需要協助時', '2026-11-26 확인 · 바뀔 수 있어요, 가기 전 공식 안내를 한 번 더 보세요': '2026-11-26確認 · 規定可能變動，出發前請再看一次官方說明', '일본·대만·미국·영국 등 22개 나라는 2027년 12월 31일까지 면제 · 그 밖의 K-ETA 대상 나라는 출발 전 신청(10,000원) · 대상이 아니면 비자가 필요해요': '日本、台灣、美國、英國等22國至2027年12月31日免申請 · 其他K-ETA適用國家須出發前申請（10,000韓元）· 不在適用範圍內則需辦理簽證', '전자입국신고서': '電子入境卡', '도착 3일 전부터 무료로 제출 · 유효한 K-ETA가 있으면 안 해도 돼요': '抵達前3天起可免費填寫 · 持有效K-ETA者免填', 'eSIM·유심': 'eSIM·SIM卡', '여행용 eSIM은 출발 전 온라인으로 · 인천공항 1터미널 도착층에 통신사 로밍센터(24시간)': '旅遊eSIM出發前上網買 · 仁川機場T1入境大廳有電信漫遊中心（24小時）', '환전': '換匯', '공항 환전소는 보통 06:00–22:00(일부 24시간) · 시내 은행은 평일 09:00–16:00': '機場換匯處一般06:00–22:00（部分24小時）· 市區銀行平日09:00–16:00', '교통카드 T-money': '交通卡T-money', '편의점(GS25·CU·세븐일레븐)에서 3,000–5,000원 · 지하철·버스·택시 · 충전은 현금으로': '便利商店（GS25·CU·7-Eleven）有售，3,000–5,000韓元 · 地鐵·公車·計程車通用 · 現金儲值', '외국인용 선불카드 · 여권으로 발급 · 결제·환전·교통카드를 한 장에 · 호텔·역의 기기에서': '外國旅客預付卡 · 憑護照辦理 · 支付、換匯、交通一卡搞定 · 飯店和車站的機台可辦', '기후동행카드(서울)': '氣候同行卡（首爾）', '서울 지하철·버스 1·2·3·5·7일권 5,000–20,000원 + 카드 3,000원 · 현금으로 사요(해외 카드 안 됨) · 서울 안에서만': '首爾地鐵·公車1/2/3/5/7日票5,000–20,000韓元＋卡費3,000韓元 · 只能用現金買（海外卡不行）· 僅限首爾市內', '택시 앱 k.ride': '叫車App k.ride', '카카오T의 외국인용 · 카카오톡 가입 없이 해외 카드로 · 영어·일본어·중국어 · 택시는 현금·카드·교통카드 모두 돼요': 'Kakao T外國旅客版 · 不用註冊KakaoTalk，可綁海外卡 · 支援英日中文 · 計程車收現金、信用卡、交通卡', '서울 국제택시': '首爾國際計程車', '영어·일본어·중국어 기사 · 미리 예약': '司機會說英日中文 · 需提前預約', '지도 앱': '地圖App', '네이버 지도는 영어·일본어·중국어 화면 · 일정의 지도 버튼에서 바로 열려요': 'Naver地圖有英日中文介面 · 行程裡的地圖按鈕可直接開啟', '관광통역안내 1330': '旅遊諮詢熱線1330', '영어·일본어·중국어 24시간 · 해외 폰은 +82-2-1330': '英日中文24小時 · 海外手機撥+82-2-1330', '외국인종합안내 1345': '外國人綜合諮詢1345', '비자·출입국 · 평일 09:00–22:00': '簽證·出入境 · 平日09:00–22:00', '경찰·구급 신고도 통역으로 연결돼요': '報警、叫救護車也可接通翻譯', '가까운 역': '最近車站', '걸어서 약 {n}분': '步行約{n}分鐘' });
// 11/27 궁합 칸 새 문구(main 11/26 밤 디자인 + A TXO 다국어)
Object.assign(window.VZTR_ZH_HANT, { '서로에게 추천하는 여행 메이트예요': '彼此最推薦的旅伴', '아래 맞추는 법대로 다니면 괜찮아요': '照下面的方法安排就沒問題', '궁합 카드 공유하기': '分享合拍卡', '잘 맞아요': '很合拍', '부딪힐 수 있어요': '可能有分歧', '추천 짝': '推薦搭檔', '부딪힐 수 있는 짝': '容易有分歧的搭檔', '친구는 {x}, 나는 {y}': '朋友愛{x}，我愛{y}', '둘 다 동네 가게를 좋아해요': '都愛巷口小店', '유명한 곳보다 골목을 먼저 찾아요': '比起名勝，先找小巷', '둘 다 요즘 뜨는 곳을 좋아해요': '都愛當下熱門', '새로 생긴 곳, 화제인 곳부터 가 봐요': '新店、話題店先去', '둘 다 보고 걷는 걸 좋아해요': '都愛邊走邊看', '풍경과 거리 구경이 여행의 재미예요': '看風景、逛街就是旅行的樂趣', '둘 다 먹고 사는 걸 좋아해요': '都愛吃吃買買', '맛집과 쇼핑, 체험이 여행의 재미예요': '美食、購物、體驗就是旅行的樂趣', '둘 다 일정을 꽉 채워요': '都愛排滿行程', '하루에 많이 보고 많이 다녀요': '一天多看多逛', '둘 다 느긋한 여행을 좋아해요': '都愛慢慢玩', '쉬는 시간이 넉넉해야 좋아요': '休息時間要充足', '둘 다 미리 계획해요': '都愛提前計畫', '동선과 시간을 정해 두고 움직여요': '路線和時間先排好再出發', '둘 다 그때그때 정해요': '都愛隨走隨定', '가서 마음 가는 대로 골라요': '到了再看心情選', '동네 가게': '巷口小店', '뜨는 곳': '熱門地', '하루씩 번갈아 골라요': '一人一天輪流選', '맛집·쇼핑': '美食·購物', '오전엔 구경하고, 오후엔 먹고 사요': '上午逛景點，下午吃和買', '꽉 찬 하루': '滿檔的一天', '느긋한 하루': '悠閒的一天', '오전은 꽉 채우고, 오후는 쉬엄쉬엄 다녀요': '上午排滿，下午放慢', '미리 계획': '提前計畫', '그때그때': '隨走隨定', '큰 틀만 정하고, 나머지는 가서 골라요': '只定大方向，其餘到了再選', '정반대라서 더 재밌는 사이': '正因相反才更有趣', '서로 새로운 걸 알려 주는 사이': '互相帶來新發現', '반은 같고, 반은 서로 채워 주는 사이': '一半相同，一半互補', '거울처럼 똑 닮은 사이': '像照鏡子一樣像' });
Object.assign(window.VZTR_ZH_HANT, { '광명역': '光明站', '동서울종합터미널': '東首爾站', '동서울터미널': '東首爾站', '{n}박째': '第{n}晚' });   // 11/27 A 일본어 qa_lines에서 찾은 빠진 문구(역·터미널·N박째) · 버스표 작은 칸용 짧은 이름
