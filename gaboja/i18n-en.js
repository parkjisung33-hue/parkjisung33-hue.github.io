/* VZTR 영어 손 사전 (2026-11-20~) — 키 = 화면에 보이는 한국어 그대로 · 값 = 영어. 자동 번역(i18n-en-auto.js)보다 이게 이김
   - 숫자는 '#'(값의 '#'에 같은 순서로), 장소 이름은 '@'
   - '{n}'·'{m}'·'{d}' = 숫자, '{x}'·'{y}' = 아무 말 → 틀. 값이 문자열이면 끼운 말을 번역해서 넣고, 함수면 한국어 그대로 받음(null 돌려주면 다음 틀로)
   - 틀이 먼저 맞춰 봄(정확한 문장보다 우선) */
(function () {
  const TT = s => (window.VZTR_I18N && VZTR_I18N.t ? VZTR_I18N.t(s) : s);
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WK = { '일': 'Sun', '월': 'Mon', '화': 'Tue', '수': 'Wed', '목': 'Thu', '금': 'Fri', '토': 'Sat', '일요일': 'Sunday', '월요일': 'Monday', '화요일': 'Tuesday', '수요일': 'Wednesday', '목요일': 'Thursday', '금요일': 'Friday', '토요일': 'Saturday' };
  // 하루 제목 끝말(엔진 themeTitle의 W) → 짧은 영어. 모르는 말이면 null
  const DAYW = w => { const S = { '맛집 탐방': 'Food', '카페 투어': 'Cafes', '쇼핑': 'Shopping', '골목 산책': 'Alleys', '명소 구경': 'Sights' }, M = { '맛집': 'Food', '카페': 'Cafes', '쇼핑': 'Shopping', '산책': 'Walks', '명소': 'Sights' };
    if (S[w]) return S[w]; const m = String(w).match(/^(.+?)[와과] (.+)$/); return m && M[m[1]] && M[m[2]] ? M[m[1]] + ' & ' + M[m[2]] : null; };
  window.VZTR_EN_FN = { TT, MON, WK, DAYW };
})();
window.VZTR_EN = {
  // 공통 버튼
  '다음': 'Next', '뒤로': 'Back', '닫기': 'Close', '확인': 'OK', '바꾸기': 'Change', '저장': 'Save', '취소': 'Cancel', '건너뛰기': 'Skip', '되돌리기': 'Undo',
  '아직': 'Not yet', '정했어요': 'Booked', '아직 안 정했어요': 'Not decided yet', '동네만': 'Area only', '나중에 입력': 'Add later',
  // 도시·공항
  '서울': 'Seoul', '부산': 'Busan', '한국': 'South Korea', '인천': 'Incheon', '김포': 'Gimpo', '김해': 'Gimhae',
  '인천 ICN': 'Incheon ICN', '김포 GMP': 'Gimpo GMP', '김해 PUS': 'Gimhae PUS',
  '인천공항': 'Incheon Airport', '김포공항': 'Gimpo Airport', '김해공항': 'Gimhae Airport',
  '인천국제공항': 'Incheon International Airport', '김포국제공항': 'Gimpo International Airport', '김해국제공항': 'Gimhae International Airport',
  '인천공항 도착': 'Arrive at Incheon Airport', '김포공항 도착': 'Arrive at Gimpo Airport', '김해공항 도착': 'Arrive at Gimhae Airport',
  '명동·을지로': 'Myeongdong · Euljiro', '홍대': 'Hongdae', '강남': 'Gangnam', '종로': 'Jongno', '성수': 'Seongsu', '서울역': 'Seoul Station',
  '해운대': 'Haeundae', '서면': 'Seomyeon', '광안리': 'Gwangalli', '남포': 'Nampo', '부산역': 'Busan Station',
  // 신청 단계 머리
  '어디로': 'Where', '어디로 가세요?': 'Where are you going?', '가는 곳은 계속 늘려 갈게요': 'More cities soon',
  '언제': 'When', '언제 가세요?': 'When are you going?', '누구와': 'Who', '누구와 가세요?': 'Who’s coming?',
  '공항': 'Airport', '어느 공항에 도착하세요?': 'Where do you land?', '도착 공항에서 일정을 시작해요. 시각은 몰라도 돼요.': 'Your plan starts when you land. Times are optional.',
  '도착 공항': 'Arrival airport', '도착 비행기': 'Arriving flight', '출국 비행기': 'Departing flight', '도착': 'Arrive', '출발': 'Depart', '출처 외교부·JNTO': 'Source: MOFA · JNTO', '사진 Commons 외': 'Photos: Commons etc.', '날씨 Open-Meteo': 'Weather: Open-Meteo', '경로 © OpenStreetMap': 'Routes © OpenStreetMap', '내 나라 대사관 찾기': 'Find your embassy', '일본 외무성 공식 목록': 'Official list · MOFA Japan', '한국 외교부 공식 목록': 'Official list · MOFA Korea', '목록 열기': 'Open list', 'JNTO · 24시간 · 영어·중국어·한국어': 'JNTO · 24 h · EN, ZH, KO', '확인 완료': 'Mark as checked', '확인함': 'Checked', '확인 완료로 표시했어요': 'Marked as checked', '확인 표시를 지웠어요': 'Check mark removed', '내 링크 복사': 'Copy my link', '다른 폰에서도 열기': 'Open on another phone', '사진 Commons·Openverse·공공누리': 'Photos Commons·Openverse·KOGL', '날씨 Open-Meteo (CC BY 4.0)': 'Weather Open-Meteo (CC BY 4.0)',
  '편명 (예: KE902)': 'Flight no. (e.g. KE902)', '편명 (예: OZ221)': 'Flight no. (e.g. OZ221)',
  '숙소': 'Stay', '숙소 이름': 'Hotel name', '동네 이름 (예: 홍대)': 'Area (e.g. Hongdae)', '동네 이름 (예: 해운대)': 'Area (e.g. Haeundae)',
  '모르면 비워 두세요 · 나중에 앱에서 넣어도 돼요': 'Not sure? Leave it blank.',
  '받을 곳': 'Send to', '이메일': 'Email', '닉네임': 'Nickname', '여행 제목': 'Trip title',
  // 가이드북
  '요약': 'Summary', '상세': 'Detail', '메뉴 열기': 'Open menu', '보기 방식': 'View', '날짜 고르기': 'Pick a day',
  '오전': 'Morning', '오후': 'Afternoon', '저녁': 'Evening', '이동': 'Move', '장소': 'Place', '식사': 'Meal', '메모': 'Notes',
  '지도': 'Map', '길찾기': 'Directions', '네이버 지도': 'Naver Map', '카카오맵': 'KakaoMap', '구글 지도': 'Google Maps',
  '네이버 지도는 앱이 있어야 열려요 · 없으면 카카오맵(웹)': 'Naver Map opens in its app · No app? Try KakaoMap',
  '한글로 보여 주기': 'Show in Korean', '여기로 가 주세요': 'Please take me here',
  '출국 비행기': 'Departing flight', '출국': 'Departure', '공항철도': 'AREX Airport Railroad', '지하철': 'Subway', '경전철·지하철': 'Light rail · Subway',
  '돌아가는 날': 'Departure day', '도착하자마자': 'Right after arrival', '동네 산책': 'Neighborhood walk',
  '입국 심사 → 짐 찾기 → 공항철도(AREX) 표지판': 'Immigration → Baggage → follow AREX signs',
  '입국 심사 → 짐 찾기 → 지하철 표지판': 'Immigration → Baggage → follow Subway signs',
  '입국 심사 → 짐 찾기 → 경전철 표지판': 'Immigration → Baggage → follow Light Rail signs',
  '입국 심사·짐 찾기 약 1시간으로 잡았어요 · 붐비면 더 걸려요': 'Allow ~1 h for immigration and bags · more when busy',
  '세금 환급(택스 리펀드)은 출국 심사 전에': 'Claim your tax refund before passport control',
  '체크인 전 짐만 보관': 'Drop bags before check-in',
  // 가이드북 뼈대(메뉴·탭·머리)
  '일정': 'Plan', '출발 전': 'Upcoming', '오늘': 'Today', '일정 요약 보기': 'Trip overview', '주의': 'Heads-up', '알아 두기': 'Good to know', '확인 필요': 'Check',
  '현지 정보': 'Local info', '경찰': 'Police', '구급·소방': 'Ambulance · Fire', '관광통역안내': 'Tourist interpretation', '한국관광공사 · 24시간': 'Korea Tourism Organization · 24h',
  '긴급 연락처 · 번호를 누르면 전화가 걸려요': 'Emergency numbers · Tap to call',
  '시간 조정': 'Adjust time', '지금대로': 'On time', '5분 일찍 끝났어요': 'Finished 5 min early', '5분 늦어지고 있어요': 'Running 5 min late', '빼기': 'Remove', '건너뛰기·빼기': 'Skip · Remove', '남음': 'left',
  '기록': 'Log', '여행 기록': 'Travel log', '기록 보기': 'View log', '하루가 끝나면 자동으로 저장돼요': 'Saves itself at the end of each day',
  '화면': 'Display', '길안내': 'Navigate', '일정 추가': 'Add to plan', '메뉴': 'Menu', '새 여행': 'New trip', '내 여행': 'My trips', '내 일정': 'My plan', '여행 요약': 'Trip summary',
  '보관함': 'Archive', '여행 정보 수정': 'Edit trip info', '공유하기': 'Share', '설정': 'Settings', '화면 모드': 'Theme', '시스템': 'System', '라이트': 'Light', '다크': 'Dark', '홈 화면에 추가': 'Add to Home Screen',
  '시작': 'Start', '마무리': 'Wrap-up', '숙소 · 짐': 'Hotel · Bags', '숙소 체크인': 'Hotel check-in', '체크인': 'Check-in', '체크아웃': 'Check-out', '취침': 'Bedtime', '시간 고정': 'Fixed time',
  '머무는 시간': 'Time here', '15분 줄이기': '15 min less', '15분 늘리기': '15 min more', '메모 적기': 'Add a note', '추가': 'Add', '↑ 앞으로': '↑ Earlier', '↓ 뒤로': '↓ Later', '보관': 'Archive',
  '영업시간 확인': 'Check hours', '가는 순서': 'Route order', '다음 순서': 'Next stop', '수정하기': 'Edit', '수정': 'Edit', '입력하기': 'Enter', '숙소 정하기': 'Set hotel', '다시 보내기': 'Resend',
  '샘플 일정 보기': 'See a sample plan', '발급 완료': 'Done', '동행': 'Companions', '취향': 'Likes', 'NEXT · 다음 할 일': 'NEXT · To do', '좋아요': 'Like', '패스': 'Pass', '거리': 'Street',
  // 신청 화면 뼈대
  '10번 고르면 끝': 'Just 10 picks', '출발 안내': 'Departures', '여행 성향들': 'Travel types', '나': 'Me', '확인 전': 'Pending', '다시 하기': 'Retake', '16가지 성향 보기': 'See all 16 types',
  '일정 방식': 'Planning style', '추천': 'Recommended', '이전 달': 'Previous month', '다음 달': 'Next month', '날짜 미정이면': 'No dates yet?', '하루 줄이기': 'One day less', '하루 늘리기': 'One day more',
  '혼자': 'Solo', '내 속도대로': 'At my own pace', '연인': 'Partner', '둘이서': 'Just the two of us', '친구': 'Friends', '여럿이': 'In a group', '가족 (아이 포함)': 'Family (with kids)', '가족 (어른만)': 'Family (adults)',
  '이건 빼 주세요': 'Leave these out', '여러 개 가능': 'Pick any', '줄 서는 맛집': 'Long queues', '많이 걷는 코스': 'Lots of walking', '붐비는 관광지': 'Crowded sights', '이른 아침 일정': 'Early mornings', '날것·회': 'Raw fish', '매운 음식': 'Spicy food',
  '예: name@gmail.com': 'e.g. name@gmail.com', '· 도착하는 날': '· Arrival day', '남산·서울역': 'Seoul Station', '하루 완성': 'Day complete',
  // 요일·날짜 (틀)
  '일': 'Sun', '월': 'Mon', '화': 'Tue', '수': 'Wed', '목': 'Thu', '금': 'Fri', '토': 'Sat',
  '월요일': 'Monday', '화요일': 'Tuesday', '수요일': 'Wednesday', '목요일': 'Thursday', '금요일': 'Friday', '토요일': 'Saturday', '일요일': 'Sunday',
  '{n}년 {m}월': (y, m) => ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1] + ' ' + y,
  '{n}년 {m}월 {d}일': (y, m, d) => VZTR_EN_FN.MON[m - 1] + ' ' + d + ', ' + y,
  '오늘 {n}월 {m}일 {x}': (m, d, w) => VZTR_EN_FN.WK[w] ? 'Today · ' + VZTR_EN_FN.WK[w] + ', ' + VZTR_EN_FN.MON[m - 1] + ' ' + d : null,
  '{n}.{m} {x}': (m, d, w) => VZTR_EN_FN.WK[w] ? VZTR_EN_FN.WK[w] + ' ' + m + '/' + d : null, '{n}. {m} {x}': (m, d, w) => VZTR_EN_FN.WK[w] ? VZTR_EN_FN.WK[w] + ' ' + m + '/' + d : null, '· {n}. {m} {x}': (m, d, w) => VZTR_EN_FN.WK[w] ? '· ' + VZTR_EN_FN.WK[w] + ' ' + m + '/' + d : null,
  'DAY {n} 일정 보기': 'View DAY {n}', 'DAY {n} {m} / {d} 진행': 'DAY {n} · {m} of {d} done', '긴급 연락처 {n}': 'Emergency {n}',
  '{n}곳': '{n} places', '{n}곳 예정': '{n} planned', '장소 {n}곳': '{n} places', '{n}곳 중 {m}곳': '{m} of {n}', '{n}번째': '#{n}', '선택 {n} / {m}': '{n} of {m} picked',
  '강수확률 {n}%': 'Rain {n}%', '날씨 {n}도 {m}도': 'Weather {n}° / {m}°', '{x}에서 {n}일': '{n} days in {x}', '{x} 지도': '{x} map',
  '걸어서 · 약 {n}분': 'Walk · about {n} min',
  // 11/22 동네 이름이 끼는 문장 = 틀 하나로 (도시별로 한 줄씩 넣던 방식은 새 동네에서 한글이 남음 — '오다이바 근처')
  '{x} 근처': 'Near {x}', '{x} 역 근처': 'Near {x} Station', '{x} 근처에서 갈 곳을 넣어 보세요': 'Add a place to go near {x}',
  '점심 — {x} 근처': 'Lunch — near {x}', '저녁 — {x} 근처': 'Dinner — near {x}', '브런치 — {x} 근처': 'Brunch — near {x}', '아침 — {x} 근처': 'Breakfast — near {x}',
  '점심 — {x} 역 근처': 'Lunch — near {x} Station', '브런치 — {x} 역 근처': 'Brunch — near {x} Station',
  '자유 시간 — {x}': 'Free time — {x}', '오호리 공원': 'Ohori Park', '종로·광화문': 'Jongno/Gwanghwamun',
  '옥내외 전시실에 #만여 점을 전시해요': 'Tens of thousands of pieces on show, indoors and out',
  '#만 보 채우고 웃으며 귀가': 'Hit 10,000 steps and head home smiling', '#층 초장집': 'Chojang raw-fish spot (floor #)',
  '(가정)': '(assumed)', '(기본값)': '(default)', '(다음 날)': '(next day)', '(차 기준, 추정)': '(by car, est.)', '(추정)': '(est.)', '(금) 출발로 가정': '(Fri) departure assumed',
  '날씨 · Open-Meteo (CC BY #.#) · 평년 = #–# 평균': 'Weather · Open-Meteo (CC BY #.#) · Normals = #–# average',
  '빵': 'Bakeries', '짐': 'Bags', '집': 'Home', '도착 = 출발 뒤 계산': 'Arrival = worked out from departure', '도착 = 출발': 'Arrival = departure',
  '차 시간 = 도로×혼잡+휴게소 (추정)': 'Drive time = road × traffic + rest stops (est.)', '차 시간 = 도로 기준 × 시간대 혼잡 + 휴게소 쉼(#시간마다 #분)': 'Drive time = road time × traffic by hour + rest stops (every # h, # min)',
  '집 ↔ 공항·역 = 카카오 길찾기 문 앞 기준 (차는 그 시각 교통 예측 · 공항은 주차 #분 더함)': 'Home ↔ airport/station = Kakao door-to-door (car uses predicted traffic · airport adds # min parking)',
  '해돋이마을': 'Haedoji Village', '늦어지면 @ · @ 먼저 빼기': 'Running late? Skip @ · @ first', '해돋이마을 전망과 미피카페': 'Haedoji Village views and Miffy Cafe', '책·잡지 #만 #천 권을 고른 서점': 'Bookstore with a hand-picked shelf of books and magazines',
  '밤 #시까지': 'Until #:00',   // 자동 번역 'p.m.' 바로잡음 (24시 표기)
  // 검수(11/20): 영어가 길어 넘치던 곳 = 짧게 (한 줄 원칙)
  '관광보다 먹방': 'Food over sights', '현지인 동네 골목': 'Local alleys', '유명한 곳은 꼭': 'Famous spots', '전시·문화·역사': 'Museums · history',
  '찾아보고, 내 성향에 맞는 여행 일정도 받아 보세요.': 'Find yours and get a plan that fits.',
  '#곳 다녀옴 · #:# 마무리': '# visited · done #:#', '#곳 예정 · #:# 마무리': '# planned · ends #:#',
  '인천공항 #:#까지 도착 · 출발 #시간 전': 'Incheon Airport by #:# · # h early', '김포공항 #:#까지 도착 · 출발 #시간 전': 'Gimpo Airport by #:# · # h early', '김해공항 #:#까지 도착 · 출발 #시간 전': 'Gimhae Airport by #:# · # h early',
  '4칸이 다 차면 내 여행 유형': '4 letters = your type',
  // 11/21 발급 완료 화면 — 메일 켬(E6) 뒤 나오는 문장 (코드리뷰: 영어판에서 한국어로 남던 것)
  '{x}(으)로 가이드북 링크를 보냈어요': x => 'Guidebook link sent to ' + x,
  '신청 완료! {x}(으)로 보내 드릴게요': x => 'Request sent! We’ll email ' + x,
  '방금 만든 {x} 일정이 열려요. 메일 속 링크로 다른 폰에서도 열고 고칠 수 있어요.': () => 'Your new plan opens next. Use the email link to open and edit it on any phone.',
  '방금 만든 {x} 일정이 열려요. 시험판이라 아키가 한 번 더 확인한 가이드북을 따로 보내 드려요.': () => 'Your new plan opens next. Trial version: Aki double-checks and sends the guidebook separately.',
  '시험판이라 신청은 보내지 않았어요': 'Trial version: request not sent',
  // 11/21 장소 고르기 ★ 줄 덧붙임(start swWhy) 'OO(으)로 유명해요' · '대표 OO' — 유명한 것(kf)은 장소 문장 사전에서 영어로, 없으면 한국어 그대로(null)
  '{x}로 유명해요': x => { const e = window.VZTR_I18N && VZTR_I18N.t(String(x).replace(/으$/, '')); return e && !/[가-힣]/.test(e) ? 'Known for ' + e : null; },
  '대표 {x}': x => { const e = window.VZTR_I18N && VZTR_I18N.t(x); return e && !/[가-힣]/.test(e) ? 'Known for ' + e : null; },
  // 출발 안내판 아래 줄 '로컬, 구경 쪽' = 짧은 축 이름
  '{x} 쪽': x => { const S = { '로컬': 'Local', '핫플': 'Hotspot', '구경': 'Sights', '즐기기': 'Fun', '알차게': 'Packed', '여유롭게': 'Easy', '계획형': 'Plan', '즉흥형': 'Free' }, p = x.split(/,\s*/); return p.every(w => S[w]) ? p.map(w => S[w]).join(' · ') : null; },
  // 하루 제목(엔진 themeTitle) = 짧게
  '{x} 도착, {y}': (c, w) => VZTR_EN_FN.DAYW(w) ? 'Arrive · ' + VZTR_EN_FN.DAYW(w) : null, '{x}에서의 {y}': (c, w) => VZTR_EN_FN.DAYW(w) ? VZTR_EN_FN.DAYW(w) : null,
  '{x}에서 마지막 {y}': (c, w) => VZTR_EN_FN.DAYW(w) ? 'Last · ' + VZTR_EN_FN.DAYW(w) : null, '{x} 당일치기 {y}': (c, w) => VZTR_EN_FN.DAYW(w) ? 'Day trip · ' + VZTR_EN_FN.DAYW(w) : null,
  // 리뷰 #3: 숫자 둘 이상인데 영어 어순이 바뀌던 것 (값의 '#'는 원문 순서대로 들어감)
  '#년대 양옥을 고쳐 만든 #층 티하우스예요': 'A #s Western-style house turned into a #-floor tea house', '#년부터 #년 넘게 이어 온 집이에요': 'Open since #, for over # years',
  '#월 #일 금 – #일 월': '#/# Fri – # Mon', '#월 #일 금 – #일 일': '#/# Fri – # Sun', '#월 #일 토요일 · #:#': '#/# Saturday · #:#',
  '#일 · #월 #일 금 – #일 월': '# days · #/# Fri – # Mon', '#일 · #월 #일 금 – #일 일': '# days · #/# Fri – # Sun',
  '모르면 비워 두세요 · 나중에 ‘여행 정보 수정’에서 넣어도 돼요': "Leave blank if unsure · Add later in 'Edit trip info'",
  '흘러가는 대로 vs 오픈 시간 계산': 'Go with the flow vs. plan to open', '느긋한 즉흥 같고 동네·명소 보완': 'Easygoing; adds areas and sights',
  '명소 정복자': 'Bucket Lister', '쇼핑 마스터': 'Haul Master', '로컬 탐험형': 'Explorers', '취향 수집형': 'Curators', '명소 정복형': 'Sightseers', '힐링 충전형': 'Rechargers',
  '· {x}': x => { const e = VZTR_EN_FN.TT(x); return e !== x ? '· ' + e : null; },
  '나는 어떤 여행자일까?': 'Find your travel type',
  '지도에 없는 동네도 동선은 미리. 하루 #만 보는 기본': 'Off-map streets, route planned anyway. 10K steps a day, minimum.',
  '한눈에 보는 여행 성향 #': 'All # travel types', '고를 때마다 한 칸씩 채워져요': 'Each pick fills a slot', '오륙도와 부산항대교가 한눈에 보여요': 'Views of Oryukdo and Busan Harbor Bridge',
  '다음 →': 'Next →',
  '출발 공항을 바꿔서 편명·시각을 지웠어요': 'Airport changed · flight cleared',
  '이날은 일정이 꽉 찼어요 · 더 넣을 수 없어요': 'This day is full · Nothing more fits',
  '장소 자세히 보기': 'Place info',
  '시간 계산이 완료되었어요 · 뒤 일정 반영': 'Times updated · rest of the day adjusted',
  '지금 거 유지': 'Keep current', '‘@’ 대신': 'Instead of ‘@’', '가는 길': 'Getting there', '동네': 'Area',
  '내 유형 글자 뜻': 'What your letters mean', '현지인 동네·골목 위주': 'Local streets and alleys', '유명한 곳·요즘 뜨는 곳 위주': 'Famous and trending spots',
  '보고 걷는 게 좋은 편': 'Seeing and walking', '먹고 사고 체험하는 게 좋은 편': 'Eating, shopping, doing', '하루를 꽉 채우는 편': 'Full days', '쉬는 시간을 넉넉히': 'Plenty of downtime',
  '동선·시간을 미리 정해 두는 편': 'Routes and times set ahead', '그때그때 끌리는 대로': 'Whatever feels right',
  '고정된 일정': 'Fixed',
  '최대 6박 7일까지 고를 수 있어요': 'Up to 6 nights',
  '23:30을 넘겨서 이 시간으로는 못 바꿔요': 'That would run past 11:30 PM',
  '23:30 넘어서 끝나요 · 더 이른 시각을 골라 주세요': 'Ends after 11:30 PM · Pick an earlier time',
  // 틀(숫자)
  '{n}박 {m}일': '{n} nights · {m} days', '약 {n}분': 'about {n} min', '{n}분': '{n} min', '약 {n}시간 {m}분': 'about {n} h {m} min', '{n}시간 {m}분': '{n} h {m} min', '{n}시간': '{n} h',
  'DAY {n}': 'DAY {n}',
};

/* ===== 2026-11-22 영어판 한글 0자 — 이름·숫자·화살표 경로가 끼는 문장 = 틀 (장소·공항이 새로 생겨도 한글이 안 남게) =====
   FULL(x) = 다 영어로 옮겨질 때만 · EN1(x) = 영어 > 못 옮기면 로마자(사람·가게 이름 전용) · PATHEN = 'A → B → C' 조각마다 */
(function () {
  const HAN = /[가-힣]/, I = () => window.VZTR_I18N || {};
  const TQ = s => (I().tq ? I().tq(String(s)) : String(s));
  const ROM = s => (I().roman ? I().roman(String(s)) : String(s));
  const EN1 = s => { s = String(s).trim(); const e = TQ(s); return HAN.test(e) ? ROM(e) : e; };
  const FULL = s => { const e = TQ(String(s).trim()); return HAN.test(e) ? null : e; };
  const PATHEN = x => String(x).split(' → ').map(EN1).join(' → ');
  const HAS = s => !!(I().has && I().has(s));
  const WK = VZTR_EN_FN.WK, MON = VZTR_EN_FN.MON;
  const num = v => /^-?\d+$/.test(String(v));
  const wrapAfter = (suffix, en) => x => { if (HAS(x + suffix)) return null; const e = FULL(x); return e ? en(e) : null; };
  Object.assign(window.VZTR_EN, {
    // 대안 카드·구글 지도·동선
    '‘{x}’ 대신, 지금 문 연 비슷한 곳': x => 'Instead of ‘' + EN1(x) + '’, a similar place open now',
    '‘{x}’ 대신': x => 'Instead of ‘' + EN1(x) + '’',
    '‘{x}’': x => { const e = FULL(x); return e ? '‘' + e + '’' : null; },
    '{x} 근처 구글 지도에서 열기': x => 'Open Google Maps near ' + EN1(x),
    '{x} 구글 지도에서 열기': x => 'Open ' + EN1(x) + ' in Google Maps',
    '동선: {x}': x => 'Route: ' + PATHEN(x),
    '{x} 외 {n}곳': (x, n) => PATHEN(x) + ' +' + n + ' more',
    '{x} 지도': wrapAfter(' 지도', e => 'Map: ' + e),
    '출국 비행기 {x}': x => 'Departing flight ' + x, '도착 비행기 {x}': x => 'Arriving flight ' + x,
    '{x} (가정)': wrapAfter(' (가정)', e => e + ' (assumed)'),
    '{x} (추정)': wrapAfter(' (추정)', e => e + ' (est.)'),
    '{x} (대략)': wrapAfter(' (대략)', e => e + ' (approx.)'),
    // 길·이동
    '✈ {x}': x => { const e = FULL(x); return e ? '✈ ' + e : null; },
    '{x}으로': x => { if (HAS(x + '으로')) return null; const M = { '공항': 'the airport', '숙소': 'your stay', '집': 'home' }, e = M[x] || FULL(x); return e ? 'To ' + e : null; },
    '{x}로': x => { if (HAS(x + '로')) return null; const M = { '공항': 'the airport', '숙소': 'your stay', '집': 'home' }, e = M[x] || FULL(x); return e ? 'To ' + e : null; },
    '{x}까지 이동': x => { const e = FULL(x); return e ? 'Head to ' + e : null; },
    '늦어지면 {x} 먼저 빼기': x => { const e = FULL(x); return e ? 'Running late? Skip ' + e + ' first' : null; },
    '다음 {x}': x => { const m = /^(\d{1,2}:\d{2}) (.+)$/.exec(x); if (!m) return null; const e = FULL(m[2]); return e ? 'Next ' + m[1] + ' ' + e : null; },
    '{n}시간 {m}분 남음': '{n} h {m} min left', '{n}시간 남음': '{n} h left', '{n}분 남음': '{n} min left',
    // 날짜·날씨·시각
    '날씨 {x}도 {y}도': (a, b) => num(a) && num(b) ? 'Weather ' + a + '° / ' + b + '°' : null,
    '출발 {n}. {m}': 'Departs {n}/{m}',
    '+{n}곳': '+{n} more',   // F-14 여행 요약 남은 장소 수
    '{n}월 {m}일 {x}': (m, d, w) => WK[w] ? WK[w] + ', ' + MON[m - 1] + ' ' + d : null,
    '{n}일 · {m}월 {d}일 {x} – {y}일 {z}': (n, m, d, w, y, z) => WK[w] && WK[z] && num(y) ? n + ' days · ' + m + '/' + d + ' ' + WK[w] + ' – ' + y + ' ' + WK[z] : null,
    // 사진 출처: 사진 © 이름 · 라이선스  /  사진 · Google · 이름   (이름 = 영어 > 로마자, 라이선스는 영어로)
    '사진 © {x} · {y}': (x, y) => { const e = HAN.test(y) ? FULL(y) : y; return e ? 'Photo © ' + EN1(x) + ' · ' + e : null; },
    '사진 © {x}': x => 'Photo © ' + EN1(x),
    '사진 · Google · {x}': x => 'Photo · Google · ' + EN1(x),
  });
})();

/* ===== 2026-11-22 (2) 영어판 한글 0자 — 틀 추가: 공항 도착·유형 코드·편명·'또는'·단문 =====
   한 글자 키('팁'·'차')는 build_i18n(자동)이 안 받아서 여기에 */
(function () {
  const HAN = /[가-힣]/, I = () => window.VZTR_I18N || {};
  const TQ = s => (I().tq ? I().tq(String(s)) : String(s));
  const ROM = s => (I().roman ? I().roman(String(s)) : String(s));
  const EN1 = s => { s = String(s).trim(); const e = TQ(s); return HAN.test(e) ? ROM(e) : e; };
  const FULL = s => { const e = TQ(String(s).trim()); return HAN.test(e) ? null : e; };
  const HAS = s => !!(I().has && I().has(s));
  const wrapAfter = (suffix, en) => x => { if (HAS(x + suffix)) return null; const e = FULL(x); return e ? en(e) : null; };
  const wrapBefore = (prefix, en) => x => { if (HAS(prefix + x)) return null; const e = FULL(x); return e ? en(e) : null; };
  const CODE = /^(?:[A-Z0-9]{2}\d{2,4}|[A-Z]{3}|\d{3,4})$/;   // 편명(KE723·7C1401)·기차 번호(011)·공항 코드(KIX)
  Object.assign(window.VZTR_EN, {
    '팁': 'Tipping', '차': 'Car',
    // 공항·역 도착 / 체크인 줄
    '{x} 도착': wrapAfter(' 도착', e => 'Arrive at ' + e),
    '{x} 역': wrapAfter(' 역', e => e + ' Station'),
    '{x}까지 도착 · 출발 {n}시간 전': (x, n) => { const m = /^(.+) (\d{1,2}:\d{2})$/.exec(x), e = m && FULL(m[1]); return e ? e + ' by ' + m[2] + ' · ' + n + ' h early' : null; },
    '{x}까지 도착 · 출발 {n}분 전': (x, n) => { const m = /^(.+) (\d{1,2}:\d{2})$/.exec(x), e = m && FULL(m[1]); return e ? e + ' by ' + m[2] + ' · ' + n + ' min early' : null; },
    '{x} 약 {n}분': '{x} · about {n} min', '{x} 약 {n}시간 {m}분': '{x} · about {n} h {m} min', '{x} 약 {n}시간': '{x} · about {n} h',
    '{x} 당일치기': '{x} day trip', '{x}에서 자유 시간': wrapAfter('에서 자유 시간', e => 'Free time in ' + e),
    // 코드가 붙은 이름: '골목 산책가' 앞 'LSRJ' · '인천 → 간사이 KE723' · '간사이 KIX' · '부산역 011'
    '{x} {y}': (a, b) => { if (/^[LH][SE][FR][JP]$/.test(a)) { const e = FULL(b); return e ? a + ' ' + e : null; } if (CODE.test(b)) { const e = FULL(a); return e ? e + ' ' + b : null; } return null; },
    'KTX {x}': x => { const e = FULL(x); return e ? 'KTX ' + e : null; },
    '차 {x}': x => { const e = FULL(x); return e ? 'Car ' + e : null; },
    '출국 비행기 {x}': x => { if (HAS('출국 비행기 ' + x)) return null; const e = HAN.test(x) ? FULL(x) : x; return e ? 'Departing flight ' + e : null; },
    '도착 비행기 {x}': x => { if (HAS('도착 비행기 ' + x)) return null; const e = HAN.test(x) ? FULL(x) : x; return e ? 'Arriving flight ' + e : null; },
    // 하루 일정 '또는' 후보 · 닫혀 있나요?
    '또는 {x}': x => { const e = FULL(x); return e ? 'Or ' + e : null; },
    '‘{x}’ 닫혀 있나요? 다른 곳 보기': x => 'Is ‘' + EN1(x) + '’ closed? See other places',
    // 질문 마지막 화면
    '{x} 유형에 맞춰 골라 뒀어요': x => { const e = FULL(x); return e ? 'Picked to match ' + e : null; },
    '먼저 넣는 곳: {x}': x => { const e = FULL(x); return e ? 'Added first: ' + e : null; },
    '{x}에 맞는 곳부터 골라요': x => { const e = FULL(x); return e ? 'Starting with places for ' + e : null; },
    '최대 {n}개': 'Up to {n}',
    '{x}에서 {y} 취향에 맞는 곳 고르기': (c, t) => { const a = FULL(c), b = FULL(t); return a && b ? 'Pick places in ' + a + ' for ' + b : null; },
    '{x} 맞춤': wrapAfter(' 맞춤', e => 'Tailored for ' + e),
    '{x} 쪽으로 {n}%': (x, n) => { const e = FULL(x); return e ? 'Leans ' + e + ' ' + n + '%' : null; },
  });
})();

/* ===== 2026-11-22 (3) 검수(qa_sweep 일본 화면)에서 영어가 길어 두 줄·잘림 나던 곳 = 짧게 ===== */
Object.assign(window.VZTR_EN, {
  '공항 도착': 'At airport', '역 도착': 'At station',
  '출발 {n}. {m}': 'Departs {n}/{m}',
  '여권·지갑·충전기 확인': 'Passport · wallet · charger', '신분증·지갑·충전기 확인': 'ID · wallet · charger', '승차권·지갑·충전기 확인': 'Ticket · wallet · charger',
  '와나카 영업시간이 자료마다 달라요 · 전날 전화로 확인': 'Wanaka hours vary · call ahead', '영업시간이 자료마다 달라요 · 전날 전화로 확인': 'Hours vary by source · call ahead',
  '비행기 시각을 넣으면 그날 시간이 정해져요': 'Add flight time to set the day', '비행기 시각을 넣으면 시간표가 완성돼요': 'Add flight time to finish the plan',
  '비행기 시각을 넣으면 일정을 추가할 수 있어요': 'Add flight time to add stops', '이동 시각을 넣으면 일정을 추가할 수 있어요': 'Add travel time to add stops',
});

/* ===== 2026-11-22 (4) 3축 엔진: 이번 여행 주제(테마) · 몇 번째(레벨) 단계 ===== */
(function () {
  const I = () => window.VZTR_I18N || {}, HAN = /[가-힣]/;
  const FULL = s => { const e = I().tq ? I().tq(String(s).trim()) : String(s); return HAN.test(e) ? null : e; };
  Object.assign(window.VZTR_EN, {
    '주제': 'Theme', '이번 여행 주제가 있나요?': 'Any theme for this trip?', '몇 번째 여행이에요?': 'How many times have you been?',
    '고른 주제의 장소를 먼저 넣어요': 'Places for your theme go in first', '다녀온 만큼 유명한 곳은 줄이고 숨은 곳을 늘려요': 'More visits, fewer famous spots, more hidden ones',
    '숨은 곳 비율이 달라져요': 'Sets the hidden-spot mix', '처음이에요': 'First time', '두 번째': '2nd time', '3~4번째': '3rd–4th', '5번 이상': '5+ times', '없음': 'None',
    '숙소에 짐 맡기기': 'Drop bags', "강남 · 숙소에 짐 맡기기": "Gangnam · Drop bags", "난바 · 숙소에 짐 맡기기": "Namba · Drop bags", "명동·을지로 · 숙소에 짐 맡기기": "Myeongdong·Euljiro · Drop bags", "해운대 · 숙소에 짐 맡기기": "Haeundae · Drop bags", "홍대 · 숙소에 짐 맡기기": "Hongdae · Drop bags",   // 검수: 하루 요약 버튼 한 줄(동네 이름 + 이 말)
    'K-팝': 'K-pop', 'K-푸드': 'K-food', 'K-뷰티': 'K-beauty', '애니·만화': 'Anime & manga', '주제라 골랐어요': 'Picked for your theme',
    '{x}, 몇 번째예요?': x => { const e = FULL(x); return e ? 'Times in ' + e + '?' : null; },
    '{x} 여행': x => { const e = FULL(x); return e ? e + ' trip' : null; },
  });
})();
