/* VZTR '한국 여행 준비' 카드 내용 (2026-11-26, C 외국인 필수 정보 F5·도착 전 체크)
   - 한국 여행 + 한국어판이 아닐 때만 보임(index.html renderKinfo). 문구 = 한국어 키 → 언어별 사전(i18n-en.js …)
   - 항목마다 출처 URL·확인일. 표 = 문서/여행앱/2026-11-26_VZTR_외국인필수정보_출처표_v1.md
   - 확인 못 한 것(시장·노점 현금 여부, 구글 지도 길찾기 현재 상태, 공항 eSIM 현장 판매 등)은 넣지 않음
   - only: 'sel' = 서울이 들어간 여행에서만 */
window.VZTR_KRINFO = {
  checked: '2026-11-26',
  chkTx: '2026-11-26 확인 · 바뀔 수 있어요, 가기 전 공식 안내를 한 번 더 보세요',
  ic: {
    check: '<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',
    pass: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
    sim: '<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><rect x="9" y="11" width="6" height="6" rx="1"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/>',
    bus: '<rect x="5" y="3" width="14" height="14" rx="2"/><path d="M5 11h14M8 20l1-3M16 20l-1-3"/><circle cx="8.5" cy="14" r=".6"/><circle cx="15.5" cy="14" r=".6"/>',
    taxi: '<path d="M5 16l1.5-5h11L19 16"/><rect x="4" y="16" width="16" height="3" rx="1"/><path d="M9 11l.5-3h5l.5 3"/>',
    map: '<path d="M9 4l-5 2v14l5-2 6 2 5-2V4l-5 2z"/><path d="M9 4v14M15 6v14"/>'
  },
  groups: [
    { h: '도착 전', rows: [
      // K-ETA 신청 대상 = '대한민국에 비자없이 입국 가능한 국민'(K-ETA 이용안내) · 대상 나라·지역 목록 = viewetaalification.do(중국 본토 없음, 대만·홍콩·마카오 있음) → 목록에 없으면 비자
      // 법무부 K-ETA 공지 2026-11-23 '한시 면제 기간 연장 알림': 2027.1.1~2027.12.31(KST), 대상 = 현재 면제 국가 · 면제 22개 나라 목록 = 외교부 2025-12-24 · 수수료 10,000원 = K-ETA 이용안내
      { ic: 'pass', b: 'K-ETA', t: '일본·대만·미국·영국 등 22개 나라는 2027년 12월 31일까지 면제 · 그 밖의 K-ETA 대상 나라는 출발 전 신청(10,000원) · 대상이 아니면 비자가 필요해요', url: 'https://www.k-eta.go.kr/portal/guide/viewetaalification.do', lk: '대상 나라',
        src: ['https://www.k-eta.go.kr/portal/board/viewboarddetail.do?bbsSn=332883', 'https://www.mofa.go.kr/es-ko/brd/m_8093/view.do?seq=1347316', 'https://www.k-eta.go.kr/portal/guide/index.do', 'https://www.k-eta.go.kr/portal/guide/viewetaalification.do'] },
      // 인천공항 안내: 도착 3일(72시간) 전부터 제출, 유효한 K-ETA가 있으면 제외, 무료
      { ic: 'doc', b: '전자입국신고서', t: '도착 3일 전부터 무료로 제출 · 유효한 K-ETA가 있으면 안 해도 돼요', url: 'https://www.e-arrivalcard.go.kr', lk: '공식 사이트',
        src: ['https://www.airport.kr/ap_en/1448/subview.do'] },
      // 인천공항 T1 통신사 로밍센터(KT·LG U+·SKT) 도착층 24시간 · LG U+ 공식: 여행 eSIM 출국 전 온라인 구매
      // 11/28 I15(B33): 도착 공항 맞춤 — PLAN.inp.inbound(ICN·PUS·GMP·CJU)로 ap 표에서 고름. 공항을 모르면 '출발 전 온라인' 한 줄만(인천 문장을 다른 공항에 붙이지 않음)
      //   김해·김포·제주 = 한국공항공사 airport.co.kr (2026-11-28 확인: 김해 SKT·KT·LGU+ 국제선 1·3층 / 김포 SKT 국제선 1층 / 제주 SKT 국제선 1층 · 제주 페이지에 '국제선 스케줄에 따라 유동적으로 운영')
      { ic: 'sim', b: 'eSIM·유심', t: '여행용 eSIM은 출발 전 온라인으로', url: 'https://www.airport.kr/ap_en/1536/subview.do', lk: '공항 안내',
        src: ['https://www.airport.kr/ap_en/1536/subview.do', 'https://www.airport.kr/ap_ko/1008/subview.do', 'https://lguplus.com/korea-sim/eng/pc/support/blog/incheon_airport_arrival_guide'],
        ap: {
          ICN: { t: '여행용 eSIM은 출발 전 온라인으로 · 인천공항 1터미널 도착층에 통신사 로밍센터(F 입국장 쪽은 24시간)' },
          PUS: { t: '여행용 eSIM은 출발 전 온라인으로 · 김해공항 국제선 1·3층에 통신사 로밍센터(SKT·KT·LG U+)', url: 'https://www.airport.co.kr/booking/cms/frCon/index.do?MENU_ID=200&CONTENTS_NO=8', src: ['https://www.airport.co.kr/booking/cms/frCon/index.do?MENU_ID=200&CONTENTS_NO=8'] },
          GMP: { t: '여행용 eSIM은 출발 전 온라인으로 · 김포공항 국제선 1층에 SKT 로밍센터', url: 'https://www.airport.co.kr/gimpo/cms/frCon/index.do?MENU_ID=2390', src: ['https://www.airport.co.kr/gimpo/cms/frCon/index.do?MENU_ID=2390'] },
          CJU: { t: '여행용 eSIM은 출발 전 온라인으로 · 제주공항 국제선 청사에 SKT 로밍센터 · 운영 시간은 국제선 일정에 따라 달라요', url: 'https://www.airport.co.kr/booking/cms/frCon/index.do?MENU_ID=200&CONTENTS_NO=7', src: ['https://www.airport.co.kr/booking/cms/frCon/index.do?MENU_ID=200&CONTENTS_NO=7', 'https://m.tworld.co.kr/product/roaming/info/center'] }
        } },
      // 11/28 I15: 제주 직항 + 간체판(중국 본토 여행자)만. 기간·조건 숫자는 공식 현행 문서로 확인 못 해 안 씀(법무부 2026-11-19 보도자료는 제주 무사증을 유지 전제로 언급 · https://www.immigration.go.kr/bbs/immigration/214/612466/artclView.do). 단체관광 무비자(3인 이상 전담여행사)는 개인 여행자 해당 없음 → 안 넣음
      { ic: 'pass', b: '제주 무사증', when: { ap: 'CJU', lang: 'zh-hans' }, t: '제주로 바로 들어오면 비자 없이 입국하는 제도(제주 무사증)가 있어요 · 조건이 바뀔 수 있으니 출발 전 하이코리아·1345로 확인', url: 'https://www.hikorea.go.kr', lk: '하이코리아',
        src: ['https://www.immigration.go.kr/bbs/immigration/214/612466/artclView.do', 'https://www.moj.go.kr/immigration_eng/1862/subview.do'] },
      // 한국관광공사 환전 안내(2026-09-11 갱신): 공항 환전소 보통 06:00~22:00·일부 24시간, 은행 평일 09:00~16:00
      { ic: 'coin', b: '환전', t: '공항 환전소는 보통 06:00–22:00(일부 24시간) · 시내 은행은 평일 09:00–16:00', url: 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=195350', lk: '공식 안내',
        src: ['https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=195350', 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?menuSn=374&vcontsId=140040'] }
    ] },
    { h: '결제·교통', rows: [
      // 한국관광공사 교통카드(140663): 편의점·서울 지하철 1~8호선 안내센터, 3,000~5,000원, 지하철·버스·택시 · 티머니 공식 블로그: 충전은 현금이 확실, 해외 카드 충전은 단정 못 함
      { ic: 'card', b: '교통카드 T-money', t: '편의점(GS25·CU·세븐일레븐)에서 3,000–5,000원 · 지하철·버스·택시 · 충전은 현금으로', url: 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140663', lk: '공식 안내',
        src: ['https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140663', 'https://blog.tmoney.co.kr/en/tmoney-guide/tmoney-convenience-store-guide/'] },
      // WOWPASS 공식: 외국인 선불카드, 여권으로 발급, 결제·환전·교통, 호텔·역 등 키오스크
      { ic: 'card', b: 'WOWPASS', t: '외국인용 선불카드 · 여권으로 발급 · 결제·환전·교통카드를 한 장에 · 호텔·역의 기기에서', url: 'https://www.wowpass.io/en', lk: '공식 사이트',
        src: ['https://www.wowpass.io/en', 'https://tmoney.co.kr/aeb/biz/bridge/foreignTravel.dev'] },
      // 한국관광공사 140663(2026-08 갱신): 단기권 1·2·3·5·7일 5,000~20,000원, 카드 3,000원, 현금 또는 한국 발행 카드, 2026-10-01부터 서울 안만
      { ic: 'bus', only: 'sel', b: '기후동행카드(서울)', t: '서울 지하철·버스 1·2·3·5·7일권 5,000–20,000원 + 카드 3,000원 · 현금으로 사요(해외 카드 안 됨) · 서울 안에서만', url: 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140663', lk: '공식 안내',
        src: ['https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140663'] }
    ] },
    { h: '택시·지도', rows: [
      // 한국관광공사(197907): k.ride = 카카오T 외국인용, 카카오톡 가입 없이, 해외 카드 등록, 영·일·중 · 택시 결제 현금·카드·교통카드(140661)
      { ic: 'taxi', b: '택시 앱 k.ride', t: '카카오T의 외국인용 · 카카오톡 가입 없이 해외 카드로 · 영어·일본어·중국어 · 택시는 현금·카드·교통카드 모두 돼요', url: 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=197907', lk: '공식 안내',
        src: ['https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=197907', 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140661'] },
      // 서울시(2026-04-03 수정): 국제택시 1644-2255, 한·영·일·중, 미리 예약
      { ic: 'phone', only: 'sel', b: '서울 국제택시', t: '영어·일본어·중국어 기사 · 미리 예약', tel: '1644-2255',
        src: ['https://news.seoul.go.kr/traffic/?p=1427', 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=140654'] },
      // 한국관광공사(1590034, 2026-05-28): 네이버 지도 한·영·중·일
      { ic: 'map', b: '지도 앱', t: '네이버 지도는 영어·일본어·중국어 화면 · 일정의 지도 버튼에서 바로 열려요', url: 'https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=1590034', lk: '공식 안내',
        src: ['https://english.visitkorea.or.kr/svc/contents/contentsView.do?vcontsId=1590034'] }
    ] },
    { h: '도움이 필요할 때', rows: [
      // 한국관광공사: 1330 한·영·일·중 24시간, 해외 폰 +82-2-1330
      { ic: 'phone', b: '관광통역안내 1330', t: '영어·일본어·중국어 24시간 · 해외 폰은 +82-2-1330', tel: '+82-2-1330', telTx: '1330',
        src: ['https://contest.visitkorea.or.kr/eng/overview/facilities/infocenter.kto'] },
      // 법무부 출입국: 1345 평일 09:00~22:00, 18시 뒤 한·영·중
      { ic: 'globe', b: '외국인종합안내 1345', t: '비자·출입국 · 평일 09:00–22:00', tel: '1345',
        src: ['https://www.moj.go.kr/immigration_eng/1862/subview.do'] },
      // 뉴질랜드 외교부(주한 대사관) '한국 긴급 번호': 112·119 통역 가능
      { ic: 'police', b: '112 · 119', t: '경찰·구급 신고도 통역으로 연결돼요',
        src: ['https://www.mfat.govt.nz/en/countries-and-regions/asia/republic-of-korea-south/new-zealand-embassy/emergency-numbers-in-korea'] }
    ] }
  ]
};
