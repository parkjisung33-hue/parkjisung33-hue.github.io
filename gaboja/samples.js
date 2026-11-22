// 공유용 샘플 가이드북 (2026-11-14 밤): index.html#sample=키 로 열면 실제 엔진(gen.js)으로 그 자리에서 만든 일정을 보여 줌.
// 저장 안 함 — 내 일정(gaboja-plan)·편집 저장본을 건드리지 않음 (made 없음 → saveEdits 안 함)
window.GABOJA_SAMPLE_INPUTS = {
  'air-tbd':  { label: '일본 · 비행기 시각 미정 (후쿠오카 2박)', inp: { type: 'LEFJ', start: '2026-12-04', nights: 2, dest: 'fuk', fo: { no: '' }, fb: { no: '' } } },   // 피드백용: 비행기 정보 없이 만든 가이드북
  'air-jp':   { label: '일본 · 비행기 (오사카·교토 3박)', inp: { type: 'LEFJ', start: '2026-12-04', nights: 3, dest: 'kix', fo: { no: 'KE723', dep: '09:00', arr: '10:50' }, fb: { no: 'KE724', dep: '15:00', arr: '16:50' }, likes: ['맛집', '카페', '빵', '말차'] } },
  'day-jp':   { label: '일본 · 비행기 당일치기 (후쿠오카)', inp: { type: 'HSRP', start: '2026-12-05', daytrip: true, nights: 0, dest: 'fuk', fo: { no: '7C1401', dep: '07:30', arr: '08:55' }, fb: { no: '7C1402', dep: '20:10', arr: '21:40' } } },
  'air-kr':   { label: '국내 · 비행기 (김포 → 부산 2박)', inp: { type: 'HEFP', start: '2026-12-11', nights: 2, dest: 'bsn', region: '수도권', mode: 'air', fo: { no: 'KE1101', dep: '09:00', arr: '10:05' }, fb: { no: 'KE1112', dep: '17:00', arr: '18:05' } } },
  'train-kr': { label: '국내 · 기차 (서울역 → 부산 2박)', inp: { type: 'LSFJ', start: '2026-12-11', nights: 2, dest: 'bsn', region: '수도권', mode: 'train', line: 0, fo: { no: '011', dep: '08:00', arr: '10:40' }, fb: { no: '054', dep: '18:00', arr: '20:40' } } },
  'car-kr':   { label: '국내 · 차 (강원 → 서울 2박)', inp: { type: 'HERP', start: '2026-12-18', nights: 2, dest: 'sel', region: '강원', mode: 'car', fo: { dep: '09:00' }, fb: { dep: '15:00' } } },
  // 11/22 테마·레벨 검수용: 새 테마 장소가 많이 나오는 일정
  'th-sel':   { label: '국내 · 서울 테마(K-팝·푸드·뷰티) 3박', inp: { type: 'HEFP', start: '2026-12-18', nights: 3, dest: 'sel', region: '강원', mode: 'car', fo: { dep: '09:00' }, fb: { dep: '15:00' }, themes: ['kpop', 'kfood', 'kbeauty'], level: 2 } },
  'th-sel2':  { label: '국내 · 서울 K-팝·뷰티 고수 3박', inp: { type: 'LSRJ', start: '2026-12-19', nights: 3, dest: 'sel', region: '강원', mode: 'car', fo: { dep: '09:00' }, fb: { dep: '15:00' }, themes: ['kpop', 'kbeauty'], level: 4 } },
  'th-tyo':   { label: '일본 · 도쿄 애니 3박', inp: { type: 'HEFP', start: '2026-12-04', nights: 3, dest: 'tyo', fo: { no: 'KE703', dep: '09:00', arr: '11:20' }, fb: { no: 'KE704', dep: '15:00', arr: '17:30' }, themes: ['anime'], level: 1 } },
  'th-kix':   { label: '일본 · 오사카·교토 애니 3박', inp: { type: 'LEFJ', start: '2026-12-04', nights: 3, dest: 'kix', fo: { no: 'KE723', dep: '09:00', arr: '10:50' }, fb: { no: 'KE724', dep: '15:00', arr: '16:50' }, themes: ['anime'], level: 3 } },
  'th-in-sel': { label: '외국인 · 서울 테마 3박', inp: { type: 'LEFP', start: '2026-12-04', nights: 3, dest: 'sel', inbound: 'ICN', fo: { no: 'KE902', arr: '14:30' }, fb: { no: 'KE901', dep: '19:40' }, themes: ['kpop', 'kfood', 'kbeauty'], level: 1 } },
  'in-sel':   { label: '외국인 · 인천 도착 (서울 3박)', inp: { type: 'HSFJ', start: '2026-12-04', nights: 3, dest: 'sel', inbound: 'ICN', fo: { no: 'KE902', arr: '14:30' }, fb: { no: 'KE901', dep: '19:40' }, stayTx: '홍대', likes: ['맛집', '쇼핑'] } },   // 11/20 W5 F1
  'in-bsn':   { label: '외국인 · 김해 도착 (부산 2박)', inp: { type: 'LEFP', start: '2026-12-11', nights: 2, dest: 'bsn', inbound: 'PUS', fo: { no: '', arr: '' }, fb: { no: '', dep: '' } } },
  'day-kr':   { label: '국내 · 기차 당일치기 (서울역 → 부산)', inp: { type: 'LEFJ', start: '2026-12-12', daytrip: true, nights: 0, dest: 'bsn', region: '수도권', mode: 'train', line: 0, fo: { no: '001', dep: '06:00', arr: '08:35' }, fb: { no: '070', dep: '20:00', arr: '22:40' } } }
};
(() => {
  const m = (location.hash.match(/#sample=([\w-]+)/) || [])[1], S = m && window.GABOJA_SAMPLE_INPUTS[m];
  if (!S || !window.GABOJA_GEN) return;
  try { const p = window.GABOJA_GEN.make(S.inp); delete p.made; p.sampleKey = m; window.GABOJA_SAMPLE_PLAN = p; } catch (e) { console.warn('sample', e); }
})();
