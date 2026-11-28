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
  '도착 공항': 'Arrival airport', '도착 비행기': 'Arriving flight', '출국 비행기': 'Departing flight', '도착': 'Arrive', '출발': 'Depart', '출처 외교부·JNTO': 'Source: MOFA · JNTO', '사진 Commons 외': 'Photos: Commons etc.', '날씨 Open-Meteo': 'Weather: Open-Meteo', '경로 © OpenStreetMap': 'Routes © OpenStreetMap', '내 나라 대사관 찾기': 'Find your embassy', '일본 외무성 공식 목록': 'Official list · MOFA Japan', '한국 외교부 공식 목록': 'Official list · MOFA Korea', '목록 열기': 'Open list', 'JNTO · 24시간 · 영어·중국어·한국어': 'JNTO · 24 h · EN, ZH, KO', '확인 완료': 'Got it', '야경·밤 산책': 'Night views & walks', '확인함': 'Checked', '확인 완료로 표시했어요': 'Marked as checked', '확인 표시를 지웠어요': 'Check mark removed', '내 링크 복사': 'Copy my link', '다른 폰에서도 열기': 'Open on another phone', '사진 Commons·Openverse·공공누리': 'Photos Commons·Openverse·KOGL', '날씨 Open-Meteo (CC BY 4.0)': 'Weather Open-Meteo (CC BY 4.0)',
  '편명 (예: KE902)': 'Flight no. (e.g. KE902)', '편명 (예: OZ221)': 'Flight no. (e.g. OZ221)',
  '숙소': 'Stay', '숙소 이름': 'Hotel name', '장소 이름 · 주소 · 구글 지도 링크': 'Place name · address · Google Maps link', '예: 구로몬 시장 · 주소 · 지도 링크': 'e.g. Kuromon Market · address · map link', '위치 정보 없음': 'No location', '지도 링크 위치': 'From map link', '위치 확인': 'Located', '주소로 찾은 위치': 'From address', '＋ 중간에 숙소가 바뀌어요': '+ Changing hotels mid-trip', '두 번째 숙소': 'Second hotel', '{n}박은 {x}에서 출발·복귀해요': (n, x) => (+n === 1 ? 'First night' : 'Nights 1–' + n) + ': start and end in ' + ((window.VZTR_I18N && window.VZTR_I18N.t && window.VZTR_I18N.t(x)) || x), '{x} 숙소': '{x} hotel', '빼기': 'Remove', '마지막 밤': 'Last night', '{n}박째부터': 'From night {n}', '{n}박째부터 {x}에서 자요 · 그날 짐 들고 옮겨요': 'From night {n} in {x} · move bags that day', '마지막 밤은 {x}에서 자요 · 그날 짐 들고 옮겨요': 'Last night in {x} · move bags that day', '두 번째 숙소 ‘{x}’ → 목록에 없는 동네라 {y} 기준으로 계산': 'Second hotel ‘{x}’ → area not in our list, timed from {y}', '{x} (마지막 밤)': '{x} (last night)', '{x} ({n}박째부터)': '{x} (from night {n})', '이름 검색을 잠시 쉬어요 · 숙소 주소나 구글 지도 링크를 넣어 주세요': 'Name search is paused · enter the hotel address or a Google Maps link', '이름 검색을 잠시 쉬어요 · 주소나 구글 지도 링크를 넣어 주세요': 'Name search is paused · enter an address or a Google Maps link', '위치를 못 찾았어요 · 주소나 구글 지도 링크를 넣어 주세요': 'Couldn’t find that spot · enter an address or a Google Maps link', '위치를 못 찾았어요 · 숙소 주소나 구글 지도 링크를 넣어 주세요': 'Couldn’t find that spot · enter the hotel address or a Google Maps link', '‘{x}’ 그대로 추가': 'Add ‘{x}’ as is', '지도에서 고른 곳': 'Place from map', '지도 링크에서 위치를 못 읽었어요 · 장소 이름이나 주소로 적어 주세요': 'Couldn’t read that map link · type the name or address', '숙소 이름 · 주소 · 지도 링크': 'Hotel name · address · map link', '숙소 주소 · 구글 지도 링크': 'Hotel address · Google Maps link', '가이드북에 나올 이름': 'Name shown in your guide', '예: 숙소 이름 (비우면 동네 이름 + 숙소)': 'e.g. hotel name (blank = area + hotel)', '주소 · 구글 지도 링크': 'Address · Google Maps link', '주소나 구글 지도 링크를 붙여 넣어요': 'Paste an address or Google Maps link', '일정 이름': 'Name', '주소나 지도 링크를 넣어 주세요': 'Enter an address or map link', '지도에서 고른 숙소': 'Hotel from map', '지도 링크에서 위치를 못 읽었어요 · 숙소 주소를 적어 주세요': 'Couldn’t read that map link · type the hotel address', '이 주소로 위치 정하기': 'Use this address', '동네 이름 (예: 홍대)': 'Area (e.g. Hongdae)', '동네 이름 (예: 해운대)': 'Area (e.g. Haeundae)',
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
  '입국 심사·짐 찾기 약 1시간으로 잡았어요 · 붐비면 더 걸려요': 'Immigration & bags ~1 h · longer if busy', '입국 심사·짐 찾기 약 1시간 · 붐비면 더 걸려요': 'Immigration & bags ~1 h · longer if busy',   // 11/25 주의 칸 한 줄
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
  '시작': 'Start', '마무리': 'Wrap-up', '숙소 · 짐': 'Check-in & bags', '숙소 체크인': 'Hotel check-in', '체크인': 'Check-in', '체크아웃': 'Check-out', '취침': 'Bedtime', '시간 고정': 'Fixed time',
  '머무는 시간': 'Time here', '15분 줄이기': '15 min less', '15분 늘리기': '15 min more', '메모 적기': 'Add a note', '추가': 'Add', '↑ 앞으로': '↑ Earlier', '↓ 뒤로': '↓ Later', '보관': 'Archive',
  '영업시간 확인': 'Check hours', '가는 순서': 'Route order', '다음 순서': 'Next stop', '수정하기': 'Edit', '수정': 'Edit', '입력하기': 'Enter', '숙소 정하기': 'Set hotel', '다시 보내기': 'Resend',
  '샘플 일정 보기': 'See a sample plan', '발급 완료': 'Done', '동행': 'With', '면': 'Noodles', '바': 'Bar', '야나카긴자 계단 위에 있는 노포예요': 'A long-running shop at the top of the Yanaka Ginza steps', '야나카 #층 크림소다 카페': 'Yanaka cream soda café, floor #', '라무네 맛 크림소다가 간판 메뉴예요': 'Ramune-flavored cream soda is the signature', '직접 만든 반찬과 튀김 정식이 인기예요': 'Popular for homemade sides and tempura set meals', '니시진 학생·동네 정식집': 'Set-meal diner for Nishijin students and locals', '치킨난반 정식이 가장 인기예요': 'The chicken nanban set meal is the favorite', '취향': 'Likes', 'NEXT · 다음 할 일': 'NEXT · To do', '좋아요': 'Like', '패스': 'Pass', '거리': 'Street',
  // 신청 화면 뼈대
  '10번 고르면 끝': '10 picks', '출발 안내': 'Departures', '여행 성향들': 'Travel types', '나': 'Me', '확인 전': 'Pending', '다시 하기': 'Retake', '16가지 성향 보기': 'See all 16 types',
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
  '걸어서 · 약 {n}분': 'Walk · ~{n} min',
  // 11/22 동네 이름이 끼는 문장 = 틀 하나로 (도시별로 한 줄씩 넣던 방식은 새 동네에서 한글이 남음 — '오다이바 근처')
  '{x} 근처라 이동 +{n}분': 'Near {x} · +{n} min travel',   // 11/24 일정 추가 추천 이유(동선)
  '뒤 일정이 밀림': 'Later plans pushed back',
  '{x} 근처': 'Near {x}', '{x} 역 근처': 'Near {x} Station', '{x} 근처에서 갈 곳을 넣어 보세요': 'Add a place to go near {x}',
  '점심 — {x} 근처': 'Lunch — near {x}', '저녁 — {x} 근처': 'Dinner — near {x}', '브런치 — {x} 근처': 'Brunch — near {x}', '아침 — {x} 근처': 'Breakfast — near {x}',
  '점심 — {x} 역 근처': 'Lunch — near {x} Station', '브런치 — {x} 역 근처': 'Brunch — near {x} Station',
  '자유 시간 — {x}': 'Free time — {x}', '오호리 공원': 'Ohori Park', '종로·광화문': 'Jongno/Gwanghwamun',
  '옥내외 전시실에 #만여 점을 전시해요': 'Tens of thousands of pieces on show, indoors and out',
  '@ 영업시간 전날 확인': '@ hours?', '횟수 안 고름': 'Not chosen', '고른 #곳을 중심으로, 남은 시간은 가까운 곳으로 채울게요': 'Built around your # picks · the rest filled with places nearby', '한국': 'Korea', '일본': 'Japan', '도시만 고르면 동선은': 'Just pick a city and the route is', '준비 중': 'Coming soon', '다른 곳': 'Somewhere else', '직접 입력': 'Type it in', '예: 다낭, 타이베이': 'e.g. Da Nang, Taipei', '목록에 없는 동네예요 · 가까운 큰 동네 기준으로 짜요': 'Not on our list · we will plan from the nearest main area',
  '#만 보 채우고 웃으며 귀가': 'Hit 10,000 steps and head home smiling', '#층 초장집': 'Chojang raw-fish spot (floor #)',
  '(가정)': '(assumed)', '(기본값)': '(default)', '(다음 날)': '(next day)', '(차 기준, 추정)': '(by car, est.)', '(추정)': '(est.)', '(금) 출발로 가정': '(Fri) departure assumed',
  '날씨 · Open-Meteo (CC BY #.#) · 평년 = #–# 평균': 'Weather · Open-Meteo (CC BY #.#) · Normals = #–# average',
  '빵': 'Bakeries', '짐': 'Bags', '집': 'Home', '도착 = 출발 뒤 계산': 'Arrival = worked out from departure', '도착 = 출발': 'Arrival = departure',
  '차 시간 = 도로×혼잡+휴게소 (추정)': 'Drive time = road × traffic + rest stops (est.)', '차 시간 = 도로 기준 × 시간대 혼잡 + 휴게소 쉼(#시간마다 #분)': 'Drive time = road time × traffic by hour + rest stops (every # h, # min)',
  '집 ↔ 공항·역 = 카카오 길찾기 문 앞 기준 (차는 그 시각 교통 예측 · 공항은 주차 #분 더함)': 'Home ↔ airport/station = Kakao door-to-door (car uses predicted traffic · airport adds # min parking)',
  '해돋이마을': 'Haedoji Village', '늦어지면 @ · @ 먼저 빼기': 'If late, skip @ · @', '해돋이마을 전망과 미피카페': 'Haedoji Village views and Miffy Cafe', '책·잡지 #만 #천 권을 고른 서점': 'Bookstore with a hand-picked shelf of books and magazines',
  '밤 #시까지': 'Until #:00',   // 자동 번역 'p.m.' 바로잡음 (24시 표기)
  // 검수(11/20): 영어가 길어 넘치던 곳 = 짧게 (한 줄 원칙)
  '관광보다 먹방': 'Food over sights', '현지인 동네 골목': 'Local alleys', '유명한 곳은 꼭': 'Famous spots', '전시·문화·역사': 'Museums · history',
  '계획파일까, 즉흥파일까?': 'Do you plan it all, or wing it?',   // 11/25 첫 화면 설명 2번 시안
  '답하다 보면 내 여행이 보여요.': 'Answer a few, and your trip takes shape.',
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
  '{x} 쪽': x => { const S = { '로컬': 'Local', '핫플': 'Hotspot', '구경': 'Sightseeing', '즐기기': 'Experience', '알차게': 'Fast-paced', '여유롭게': 'Relaxed', '계획형': 'Organized', '즉흥형': 'Unscripted' }, p = x.split(/,\s*/); return p.every(w => S[w]) ? p.map(w => S[w]).join(', ') : null; },
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
  '이번 여행, 나답게.': 'Pack your personality.',   // 11/25 첫 화면 제목(한 4번 시안 · 영 5번 시안)
  // 11/23 장소 고르기 맛집 카드 ★ 줄 머리말(start swPoints) — 메뉴 이름 영어는 i18n-en-auto(메뉴 사전)
  '인기 메뉴': 'Popular', '인기': 'Popular', '대표': 'Signature',
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
  '{n}박 {m}일': '{n} nights · {m} days', '{x} 늦어짐 · 비행기 시각과 겹쳐요': '{x} late · Clashes with flight', '{x} 늦어짐 · {y} 시각 확인': '{x} late · Check {y} time', '{x} 늦어짐 · 뒤 일정 최대 {y} 밀림': '{x} late · Later stops +{y}', '{x} 늦어짐 · 뒤 일정은 그대로': '{x} late · Later stops on time', '{x} 일찍 · 뒤 일정 당김': '{x} early · Later stops moved up', '{x} 일찍 · 뒤 일정은 그대로': '{x} early · Later stops on time', '약 {n}분': '~{n} min', '{n}분': '{n} min', '약 {n}시간 {m}분': '~{n} h {m} min', '{n}시간 {m}분': '{n} h {m} min', '{n}시간': '{n} h',
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
    '늦어지면 {x} 먼저 빼기': x => { const e = FULL(x); return e ? 'If late, skip ' + e : null; },   // 11/25 주의 칸 한 줄(짧게)
    '다음 {x}': x => { const m = /^(\d{1,2}:\d{2}) (.+)$/.exec(x); if (!m) return null; const e = FULL(m[2]); return e ? 'Next ' + m[1] + ' ' + e : null; },
    '{n}시간 {m}분 남음': '{n} h {m} min left', '{n}시간 남음': '{n} h left', '{n}분 남음': '{n} min left',
    // 11/24 보드 11·15·3: 길안내 실제 시각 · 남은 분 · 상세 이동 줄 · 공유 카드
    '약 {n}분 남음': '~{n} min left', '곧 도착': 'Almost there',
    '로그인 필요 없어요': 'No login',   /* 11/24 검수: 360px 폰에서 소개 칩 3개가 3px 넘쳐 잘리던 것 → 짧게(아래 2개도) */
    '탑승권 코드 # / #': 'Pass code # / #',   /* 숫자 '#' 키 = 자동 사전과 같은 자리라 손 사전이 이김 */
    '전철 {n}시간 {m}분': 'Train {n} h {m} min', '전철 {n}시간': 'Train {n} h', '니시테쓰 공항버스': 'Nishitetsu Airport Bus',
    '도착 {x}': x => /^\d{1,2}:\d{2}$/.test(x) ? 'Arrived ' + x : null, '{x} 출발': x => /^\d{1,2}:\d{2}$/.test(x) ? 'Left ' + x : null,
    '차로': 'By car', '추정': 'est.', '숙소로': 'To your stay',
    '내 여행 유형': 'My travel type', '너는 어떤 여행자야?': 'What kind of traveler are you?',
    '카드 이미지를 저장했어요': 'Card image saved', '카드 이미지를 저장하고 링크를 복사했어요': 'Card image saved · link copied',
    // 날짜·날씨·시각
    '날씨 {x}도 {y}도': (a, b) => num(a) && num(b) ? 'Weather ' + a + '° / ' + b + '°' : null,
    '출발 {n}. {m}': 'Dep {n}/{m}',
    '+{n}곳': '+{n} more',   // F-14 여행 요약 남은 장소 수
    '{n}월 {m}일 {x}': (m, d, w) => WK[w] ? WK[w] + ', ' + MON[m - 1] + ' ' + d : null,
    '{n}월 {m}일 {x} – {d}일 {y}': (m, d, w, e, z) => WK[w] && WK[z] ? MON[m - 1] + ' ' + d + ' ' + WK[w] + ' – ' + e + ' ' + WK[z] : null,   // 11/23 impeccable E2: 여행 날짜 줄 '11월 4일 금 – 6일 토'가 한글로 남던 것
    '{n}일 · {m}월 {d}일 {x} – {y}일 {z}': (n, m, d, w, y, z) => WK[w] && WK[z] && num(y) ? n + ' days · ' + m + '/' + d + ' ' + WK[w] + ' – ' + y + ' ' + WK[z] : null,
    // 사진 출처: 사진 © 이름 · 라이선스  /  사진 · Google · 이름   (이름 = 영어 > 로마자, 라이선스는 영어로)
    '사진 © {x} · {y}': (x, y) => { const e = HAN.test(y) ? FULL(y) : y; return e ? 'Photo © ' + EN1(x) + ' · ' + e : null; },
    '사진 © {x}': x => 'Photo © ' + EN1(x),
    '사진 · Google · {x}': x => 'Photo · Google · ' + EN1(x),
    '사진 · Google Maps · {x}': x => 'Photo · Google Maps · ' + EN1(x),   // 11/24 구글 표기 'Google Maps'는 번역 안 함
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
    '{x} 약 {n}분': '{x} · ~{n} min', '{x} 약 {n}시간 {m}분': '{x} · ~{n} h {m} min', '{x} 약 {n}시간': '{x} · ~{n} h',
    '{x} 당일치기': '{x} day trip', '{x}에서 자유 시간': wrapAfter('에서 자유 시간', e => 'Free time in ' + e),
    // 코드가 붙은 이름: '골목 산책가' 앞 'LSRJ' · '인천 → 간사이 KE723' · '간사이 KIX' · '부산역 011'
    '{x} {y}': (a, b) => { if (/^[LH][SE][FR][JPOU]$/.test(a)) { const e = FULL(b); return e ? a + ' ' + e : null; } if (CODE.test(b)) { const e = FULL(a); return e ? e + ' ' + b : null; } return null; },
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
  '출발 {n}. {m}': 'Dep {n}/{m}',
  '여권·지갑·충전기 확인': 'Passport · wallet · charger', '신분증·지갑·충전기 확인': 'ID · wallet · charger', '승차권·지갑·충전기 확인': 'Ticket · wallet · charger',
  '와나카 영업시간이 자료마다 달라요 · 전날 전화로 확인': 'Wanaka hours vary · call ahead', '와나카 영업시간은 전날 전화로 확인': 'Call Wanaka ahead to confirm hours', '영업시간이 자료마다 달라요 · 전날 전화로 확인': 'Hours vary by source · call ahead',
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

/* ===== 2026-11-22 (5) 동우님 피드백 17개: 숙소 = 출발지 · 어디로 묶음 ===== */
(function () {
  const I = () => window.VZTR_I18N || {}, HAN = /[가-힣]/;
  const FULL = s => { const e = I().tq ? I().tq(String(s).trim()) : String(s); return HAN.test(e) ? null : e; };
  Object.assign(window.VZTR_EN, {
    '매일 {x}에서 출발·복귀하는 동선으로 짜요': x => { const e = FULL(x); return e ? 'Each day starts and ends in ' + e : null; },
    '{x} 숙소에서 출발': x => { const e = FULL(x); return e ? 'Leave from your stay in ' + e : null; },
  });
})();
/* 11/23 impeccable 영어 문구: 영어엔 가운뎃점(·)을 안 씀 → '&'·쉼표, 한국어 직역 다듬기 (자동 사전보다 손 사전이 이김) */
Object.assign(window.VZTR_EN, {
  '오사카·교토': 'Osaka & Kyoto', '현지 마트·시장 장보기': 'Browse local markets', '카페·디저트 투어': 'Cafés & desserts',
  '결과는 탑승권 한 장': 'Result = your boarding pass', '안 가 본 동네 골목 걷기': 'Wander a new neighborhood',
  '약 #시간': '~# h', '도착 #:# 예상': 'Arrives ~#:#',
  // E9: 자동 번역에 남은 ' / &' (빗금 찌꺼기)
  '오토나카도리와 나가타 탱크스지': 'Otonaka-dori & Nagata Tankusuji', '오토나카도리와 모토마치 깃사': 'Otonaka-dori & Motomachi Kissa', '오토나카도리와 칼라스 카페&갤러리': 'Otonaka-dori & Calas Cafe',
  '위 탑승권': 'see pass above',
  // E6: 시각 미정 안내 = 짧고 같은 말투로 (버튼 안에서 두 줄로 꺾이던 것)
  '가는 비행기 시각 미입력 · 넣으면 시간이 정해져요': 'Outbound flight time? Add it', '오는 비행기 시각 미입력 · 넣으면 시간이 정해져요': 'Return flight time? Add it',
  '가는 열차 시각 미입력 · 넣으면 시간이 정해져요': 'Outbound train time? Add it', '오는 열차 시각 미입력 · 넣으면 시간이 정해져요': 'Return train time? Add it',
  '시각 미입력 · 넣으면 시간이 정해져요': 'Time not set? Add it',
  '비행기 시각을 넣으면 그날 시간이 정해져요': 'Add the flight time to set this day', '열차 시각을 넣으면 그날 시간이 정해져요': 'Add the train time to set this day', '시각을 넣으면 그날 시간이 정해져요': 'Add a time to set this day',   // 'about 3 h 14 min'이 잘리던 것 → '~3 h 14 min'
  '로컬': 'Local', '핫플': 'Hotspot', '구경': 'Sightseeing', '즐기기': 'Experience', '알차게': 'Fast-paced', '여유롭게': 'Relaxed', '계획형': 'Organized', '즉흥형': 'Unscripted',   // 유형 4축 = 화면마다 같은 낱말 (글자 L·H·S·E·F·R 와 첫 글자 맞춤)
});

/* ===== 2026-11-24 동우님 피드백 20개: 새 한국어 문장 · 하루 제목 틀 · 쇼핑 테마 · 주의 줄(한 줄) ===== */
(function () {
  const I = () => window.VZTR_I18N || {}, HAN = /[가-힣]/;
  const FULL = s => { const e = I().tq ? I().tq(String(s).trim()) : String(s); return HAN.test(e) ? null : e; };
  /* 하루 제목은 엔진이 장소 이름을 줄여 씀(gen.js nmS·noC: 괄호·'본점' 빼고 도시 이름 빼고) → 같은 규칙으로 줄인 한국어 이름 ↔ 영어 이름 표를 한 번 만들어 둠. 동네 이름(2~6자)은 로마자 */
  let TT = null;
  let AREAS = null;
  const ttMap = () => { if (TT) return TT; const G = window.GABOJA_DATA, P = G && G.places, E = window.VZTR_EN_PLACES || {}; if (!P) return {}; TT = {}; AREAS = new Set(Object.values(G.clName || {}).flatMap(x => String(x).split(/[·\s]/)).concat(Object.values(P).map(p => String(p.area || '').split(/[·(\s]/)[0])).filter(Boolean));
    const nmS = x => String(x).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+(본점|본관|[^\s]{1,5}점)$/, '').replace(/\s+/g, ' ').trim();
    const enS = x => String(x).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+(Main Store|Main Branch|Honten|Branch|Store)$/i, '').replace(/\s+/g, ' ').trim();
    Object.keys(P).forEach(id => { const p = P[id], x = E[id], en = (x && (x.short || x.en)) || (I().placeEn && I().placeEn(p)); if (!en || HAN.test(en)) return;
      const cn = String(p.city || ''), ce = I().tq ? I().tq(cn) : cn; [p.sh, p.n].forEach(k => { if (!k) return; let ko = nmS(k), e = enS(en);
        TT[ko] = TT[ko] || e; if (cn && ko.indexOf(cn + ' ') === 0) { TT[ko.slice(cn.length + 1)] = TT[ko.slice(cn.length + 1)] || e.replace(new RegExp('^' + ce + '\\s+', 'i'), ''); } if (cn && ko.slice(-cn.length - 1) === ' ' + cn) TT[ko.slice(0, -cn.length - 1)] = TT[ko.slice(0, -cn.length - 1)] || e.replace(new RegExp('\\s+' + ce + '$', 'i'), ''); }); });
    return TT; };
  const LW = { 신궁: 'Shrine', 신사: 'Shrine', 공원: 'Park', 타워: 'Tower', 성: 'Castle', 미술관: 'Art Museum', 박물관: 'Museum', 해변: 'Beach', 해수욕장: 'Beach', 폭포: 'Falls', 온천: 'Hot Spring', 정원: 'Garden', 전망대: 'Observatory', 시계탑: 'Clock Tower', 동물원: 'Zoo', 수족관: 'Aquarium', 운하: 'Canal', 호수: 'Lake' };
  const PNM = s => { s = String(s).trim(); if (LW[s]) return LW[s]; const f = FULL(s); if (f) return f; const m = ttMap()[s]; if (m) return m; return /^[가-힣]{2,6}$/.test(s) && AREAS && AREAS.has(s) && I().roman ? I().roman(s) : null; };   // 로마자는 동네 이름일 때만
  const GEN = /\s+(Palace|Hanok Village|Hanok|Village|Market|Street|Park|Temple|Shrine|Tower|Station|Museum|Garden|Alleys?|Arcade|Store|Shop)$/i;
  const two = (a, b, f) => { const x = PNM(a), y = PNM(b); if (!x || !y) return null; const r = f(x, y); return r.length <= 26 ? r : f(x.replace(GEN, ''), y.replace(GEN, '')); };   // 제목 한 줄: 길면 'Palace'·'Market' 같은 꼬리말을 뺌
  const one = (a, f) => { const x = PNM(a); return x ? f(x) : null; };
  /* 11/24 동우님: 이동 문구(수단 이름 + 시간)를 영어로 — '공항버스 6200 약 1시간 30분' → 'Airport bus 6200 · ~1 h 30 min'. 한글이 남으면 null(다음 틀로) */
  const HANX = /[가-힣]/, TQ = x => { const r = window.VZTR_I18N && VZTR_I18N.t ? VZTR_I18N.t(x) : null; return r && !HANX.test(r) ? r : null; };   // (이 안의 TT는 장소 이름 표라 직접 부름)
  const MODE = [['공항리무진버스', 'Airport limousine bus'], ['공항리무진', 'Airport limousine'], ['리무진버스', 'Limousine bus'], ['리무진', 'Limousine'], ['공항버스', 'Airport bus'], ['공항철도', 'Airport Railroad'], ['대중교통', 'Transit'], ['지하철', 'Subway'], ['전철', 'Train'], ['시내버스', 'City bus'], ['고속버스', 'Express bus'], ['버스', 'Bus'], ['택시', 'Taxi'], ['기차', 'Train'], ['열차', 'Train'], ['차', 'Car'], ['걸어서', 'Walk'], ['도보', 'Walk']];
  const TRV = x => { const m = /^(.+?)\s*약\s*(?:(\d+)시간)?\s*(?:(\d+)분)?\s*(\((?:추정|가정)\))?$/.exec(String(x).trim()); if (!m || (!m[2] && !m[3])) return null;
    let md = m[1].trim(); MODE.forEach(([k, v]) => { md = md.split(k).join(v); }); if (HANX.test(md)) { const t = TQ(m[1].trim()); if (!t) return null; md = t; }
    return md + ' · ~' + (m[2] ? m[2] + ' h' + (m[3] ? ' ' + m[3] + ' min' : '') : m[3] + ' min') + (m[4] ? ' (est.)' : ''); };
  const RTE = x => { const m = /^(.+?)\s*→\s*(.+)$/.exec(String(x).trim()); if (!m) return null; const W = { 집: 'Home', 공항: 'airport', 숙소: 'your stay' }, f = W[m[1]] || PNM(m[1]), g = W[m[2]] || PNM(m[2]); return f && g ? f + ' → ' + g : null; };
  Object.assign(window.VZTR_EN, {
    // 하루 제목(gen.js themeTitle 11/24) — 장소 이름은 사전 영어 이름으로
    '{x}에서 {y}까지': (a, b) => two(a, b, (x, y) => x + ' to ' + y),
    '{x}과 {y}': (a, b) => two(a, b, (x, y) => x + ' & ' + y), '{x}와 {y}': (a, b) => two(a, b, (x, y) => x + ' & ' + y),
    '도착하자마자 {x}': a => one(a, x => 'Straight to ' + x), '{x}부터 시작': a => one(a, x => 'Start at ' + x),
    '마지막으로 {x}': a => one(a, x => 'Last stop: ' + x), '도착, {x}': a => one(a, x => 'Arrival: ' + x),
    '{x} 맛집 투어': a => one(a, x => x + ' food crawl'), '{x} 카페 산책': a => one(a, x => x + ' café hop'),
    '{x} 쇼핑 산책': a => one(a, x => 'Shopping in ' + x), '{x} 골목 산책': a => one(a, x => x + ' backstreets'),
    '{x} 명소 산책': a => one(a, x => x + ' highlights'),
    '{x}에서 내 취향 장소 고르기': a => one(a, x => 'Picking spots for you in ' + x),
    // 주의 줄(한 줄로 짧게)
    '{x} 빠짐 · {y}': (a, b) => two(a, b, (x, y) => x + ' left out · ' + y),
    '영업시간 밖': 'closed then', '시간 부족': 'no time left', '하루 식사 3번 넘음': '3 meals max', '하루 카페 2곳 넘음': '2 cafés max',
    '가는 비행기 시각을 넣으면 시간이 정해져요': 'Add your outbound flight time', '오는 비행기 시각을 넣으면 시간이 정해져요': 'Add your return flight time',
    '가는 열차 시각을 넣으면 시간이 정해져요': 'Add your outbound train time', '오는 열차 시각을 넣으면 시간이 정해져요': 'Add your return train time',
    '차 출발 #:#로 계산 · 차 카드에서 바꿔요': 'Leaving at #:# · edit on the car card', '돌아오는 차 #:# 출발로 계산': 'Driving back at #:#',
    '대중교통이면 {x}': a => { const t = TRV(a); return t ? 'By transit: ' + t : one(a, x => 'By transit: ' + x); },   // 11/24 동우님: '대중교통이면 공항버스 6200 약 1시간 30분'이 한글로 남던 것(장소 이름만 받던 틀)
    '{x} 대중교통이면 {y}': (a, b) => { const f = RTE(a), t = TRV(b); return f && t ? f + ': ' + t : null; /* 한 줄 칸이라 짧게 */ },
    // 11/24 동우님: 오늘 오전 전 엔진으로 만든 '저장된 일정'의 옛 주의 줄 → 영어판에서 한글로 남던 것
    '못 넣은 곳: {x}({y})': (a, b) => { const x = PNM(a) || TQ(a), y = TQ(b); return x && y ? 'Not added: ' + x + ' (' + y + ')' : null; },
    '짐 싸기 · 오늘 {x}로 숙소 옮기는 날': 'Pack up · moving to {x} today', 
    /* 11/25 영어판 한국 여러 도시(KTX) */
    '짐 싸기 · 오늘 {x}으로 숙소 옮기는 날': 'Pack up · moving to {x} today', '기상 · 짐 싸기 · 오늘 {x}로 숙소 옮기는 날': 'Wake up · moving to {x} today', '기상 · 짐 싸기 · 오늘 {x}으로 숙소 옮기는 날': 'Wake up · moving to {x} today', '택시': 'Taxi', '{x} {n}:{m} 문 열 때 맞춰 도착': (x, h, m) => { const e = VZTR_EN_FN.TT(x); return /[가-힣]/.test(e) ? null : 'Arrive when ' + e + ' opens at ' + h + ':' + m; }, '리무진 버스 + 긴테쓰': 'Limousine bus + Kintetsu', '걷기 + 전철': 'Walk + train', '걷기 + 전철 · 약 {n}분': 'Walk + train · ~{n} min', '고도': 'Godo', '{x} · 갈아타기': '{x} · Transfer', '갈아탈 열차 타는 곳 확인': 'Find the platform for your next train', '승차권 · 타는 곳 확인': 'Ticket · check the platform',
    '기차 시각은 대략 · 코레일에서 예매': 'Train times are approximate · book on Korail', 'KTX · {x} → {y}': 'KTX · {x} → {y}', 'ITX-새마을 · {x} → {y}': 'ITX-Saemaeul · {x} → {y}', '열차 · {x} → {y}': 'Train · {x} → {y}', 'ITX-새마을': 'ITX-Saemaeul', '열차': 'Train',
    '{x} 당일치기는 멀어서 뺐어요 · {y}에서 자는 밤을 넣어 주세요': '{x} is too far for a day trip · add a night there', '기차·버스 (대략)': 'Train or bus (approx.)', '전철 (대략)': 'Train (approx.)',
    '출국 공항': 'Departure airport', '도시 사이는 기차(KTX)로 이어서 짜요': 'We link the cities by KTX train', '여러 도시를 함께 고를 수 있어요 · 예: 서울 + 부산 + 대구': 'Pick several cities · e.g. Seoul + Busan + Daegu',
    '안 자는 도시는 당일치기로 다녀와요 · 도시를 옮기는 날은 KTX로 짐 들고 이동': 'Cities you don’t sleep in become day trips · on moving days, take the KTX with your bags',
    '안 자는 도시는 당일치기로 다녀와요': 'Cities you don’t sleep in are day trips',   // 11/25 #14 한 줄로
    '경주역': 'Gyeongju Station', '부전': 'Bujeon', '부전역': 'Bujeon Station', '용산': 'Yongsan', '용산역': 'Yongsan Station', '수원역': 'Suwon Station',   // 11/25 TAGO 기차(신경주역 → 경주역 2023-12-28 역명 변경)
    '열차 {x} 출발 · 기다리는 동안 역 근처 식사·카페 · 승차권 · 타는 곳 확인': 'Train leaves {x} · eat or grab a coffee near the station meanwhile · check ticket & platform', '열차 {x} 출발 · 기다리는 동안 역 근처 식사·카페 · 갈아탈 열차 타는 곳 확인': 'Train leaves {x} · eat or grab a coffee near the station meanwhile · find your connecting platform',
    '열차 시각 = 코레일 시간표 · 코레일에서 예매': 'Times from Korail timetable · book on Korail', '{x} 가는 막차 지남 · 코레일 확인': 'Last train to {x} gone · check Korail',   // 11/25 '주의' 칸 = 한 줄(최소 11px) → 짧게
    '짐 맡기고 산책': 'Stroll, bags stored', '{x} · 짐 맡기고 근처 산책': '{x} · leave your bags, stroll nearby', '숙소에 짐 맡기고 · 열차 시각에 맞춰 출발': 'Leave bags at the hotel · head out in time for the train',
    '{x} + 택시 (대략) · 약 {n}시간 {m}분': '{x} + taxi (approx.) · about {n} h {m} min', '{x} + 택시 (대략) · 약 {n}분': '{x} + taxi (approx.) · about {n} min', '{x} + 택시 (대략)': '{x} + taxi (approx.)',   // 11/25 공항 → 버스 터미널(공항철도 + 택시)
    '{x} + 걷기 · 약 {n}시간 {m}분': '{x} + walk · about {n} h {m} min', '{x} + 걷기 · 약 {n}분': '{x} + walk · about {n} min', '{x} + 걷기': '{x} + walk',
    '터미널 도착': 'At terminal', '고속버스': 'Express bus', '시외버스': 'Intercity bus', '고속버스 · {x} → {y}': 'Express bus · {x} → {y}', '시외버스 · {x} → {y}': 'Intercity bus · {x} → {y}', '버스 시각은 대략 · 터미널에서 예매': 'Bus times approx. · book at the terminal',   // 11/25 속초·통영 버스
    '서울고속버스터미널': 'Seoul Express Bus Terminal', '동서울터미널': 'Dong Seoul Terminal', '동서울': 'Dong Seoul', '속초고속버스터미널': 'Sokcho Express Terminal', '속초시외버스터미널': 'Sokcho Intercity Terminal', '강릉시외버스터미널': 'Gangneung Intercity Terminal', '통영종합버스터미널': 'Tongyeong Bus Terminal',
    '현지어': 'Local name', '명동': 'Myeongdong', '남산': 'Namsan', '동대문': 'Dongdaemun', '감천': 'Gamcheon', '구좌': 'Gujwa', '엑스포': 'Expo', '강정': 'Gangjeong', '소래': 'Sorae',   // 11/25 추가 카드 동네 앞 이름   // 11/25 왼쪽 칸 4.75rem — 'Local language' 넘침(칸 내용 = 현지어 이름)
    'KTX-이음': 'KTX-Eum', 'ITX-마음': 'ITX-Maeum', '누리로': 'Nuriro', '무궁화호': 'Mugunghwa', 'KTX-이음 · {x} → {y}': 'KTX-Eum · {x} → {y}', 'ITX-마음 · {x} → {y}': 'ITX-Maeum · {x} → {y}', '누리로 · {x} → {y}': 'Nuriro · {x} → {y}', '무궁화호 · {x} → {y}': 'Mugunghwa · {x} → {y}',
    '동대구': 'Dongdaegu', '신경주': 'Singyeongju', '청량리': 'Cheongnyangni', '여수엑스포': 'Yeosu Expo', '광주송정': 'Gwangju-Songjeong', '수서': 'Suseo', '대구 TAE': 'Daegu TAE', '대구공항': 'Daegu Airport', '대구공항 도착': 'Arrive at Daegu Airport', '{x} → {y} · 짐 들고 · 약 {n}분': '{x} → {y} · with luggage · ~{n} min',
    '못 넣은 곳: {x}': a => { const x = PNM(a) || TQ(a); return x ? 'Not added: ' + x : null; }, '대중교통': 'Transit', '대중교통 · 약 {n}분': 'Transit · ~{n} min',
    // 정보 화면
    '비워 두면 자동으로 붙어요': 'Leave blank to auto-name', '출발지는 #일, 나머지는 #년 뒤 지워요': 'Start area deleted in # days, the rest in # year',
    // 쇼핑 테마(일본)
    '빈티지·구제': 'Vintage', '명품·백화점': 'Luxury', '일본 브랜드': 'Japanese brands',
  });
})();
Object.assign(window.VZTR_EN, { '어느 나라에서 오든 도착 공항부터 짜요': 'Flying in from anywhere? We start at your arrival airport', '가까운 도시는 함께 고를 수 있어요 · 예: 오사카 + 교토 + 나라': 'Pick nearby cities together, e.g. Osaka + Kyoto + Nara', '준비 중': 'Coming soon', '어디로 가세요?': 'Where are you going?' });   // 11/24 영어판 해외 → 일본

/* 11/24 영어 원어민 검토 117개 (직역 → 자연스러운 앱 문구) — 표 = 문서/여행앱/2026-11-24_VZTR_영어문구_원어민검토_v1.md */
Object.assign(window.VZTR_EN, {
  "결과는 탑승권 한 장": "A boarding pass",
  "평점 좋은 카페에서 커피 한 잔": "Coffee at a top-rated cafe",
  "현지인 가는|시장에서 군것질": "Snacks at a|local market",
  "지도에 없는 골목 산책": "Wander off-map alleys",
  "도착 첫날, 짐 풀고 제일 먼저 할 일은?": "Day one, bags dropped. First move?",
  "가장 끌리는 걸 골라 주세요": "Pick what appeals most",
  "보고 걷는 게 좋은 편": "Sights on foot",
  "잘못 탄 버스에서 내려 산책": "Wrong bus? Stroll anyway",
  "이름 모를 골목에서 멈춤": "Stop in a nameless alley",
  "이 유형의 하루": "A day as this type",
  "이 성향이면 이렇게 짜 드려요": "How we plan for this type",
  "하루 #묶음 + 숙소에서 쉬는 시간": "# blocks a day + hotel rest",
  "가서 마음 가는 쪽으로 고르면 돼요": "Pick what feels right on the spot",
  "흘러가는 대로 vs 오픈 시간 계산": "Winging it vs. checking hours",
  "이 유형으로 내 여행 만들기": "Plan my trip with this type",
  "일정은 어떻게 받을까요?": "How do you want your plan?",
  "추천 받아서 내가 고를래요": "I'll pick from suggestions",
  "장소 추천 카드를 넘기며 고르기": "Swipe place cards to choose",
  "날짜별 빈 칸에 내가 장소 넣기": "Add your own places to each day",
  "하루 줄이기": "Remove a day",
  "하루 늘리기": "Add a day",
  "쉬는 시간 넉넉히": "Plenty of downtime",
  "같이 가는 사람도 테스트하면 결과 화면 ‘같이 가면’에서 궁합을 볼 수 있어요": "Have your mate take it too, then see your match in ‘If you go together’",
  "모르면 비워 두세요 · 나중에 ‘여행 정보 수정’에서 넣어도 돼요": "Not sure? Skip it and add later in ‘Edit trip info’",
  "이번 여행, 이것만은 꼭!": "My must-do for this trip",
  "동네 방랑자 유형에 맞춰 골라 뒀어요 · 최대 #개": "Picked for Side Questers, up to #",
  "전시·문화·역사": "Museums & history",
  "밤엔 술 한잔": "Evening drinks",
  "줄 서는 맛집": "Long lines",
  "고른 주제의 장소를 먼저 넣어요": "Your theme's places go in first",
  "숨은 곳 비율이 달라져요": "Sets the hidden-gem mix",
  "가이드북에 들어갈 이름": "Shown in your guidebook",
  "닉네임·받을 곳·여행 정보는 가이드북에만 써요": "Nickname, email and trip info are only used for your guidebook",
  "닉네임·이메일·여행 정보는 가이드북에만 써요": "Your details are used only for your guidebook",   // 11/24 동의 상자
  "해외(미국) 서버에 맡겨 보관해요": "Stored with our service providers in the US",
  "동의하지 않으면 신청할 수 없어요": "You can't sign up without agreeing",
  "개인정보처리방침 전문 보기": "Read the full privacy policy",
  "이용약관 보기": "Terms of use",
  "사진 · Google Maps": "Photo · Google Maps",
  "만 14세 이상이에요": "I'm 14 or older",
  "전체 동의": "Agree to all",   // 11/24 동의 묶음
  "필수 항목에 모두 동의해요": "Agree to all required items",
  "필수 항목과 선택 항목에 모두 동의해요": "Agree to all required and optional items",
  "[필수] 이용약관 동의": "[Required] Terms of Use",
  "[필수] 개인정보 수집·이용 동의": "[Required] Personal data collection and use",
  "[필수] 만 14세 이상입니다": "[Required] I am 14 or older",
  "[선택] 여행 소식·혜택 메일 받기": "[Optional] Travel news and offers by email",
  "동의하지 않아도 가이드북은 받을 수 있어요 · 2년마다 다시 여쭤봐요": "You'll get your guidebook either way · We'll ask again every 2 years",
  "보기": "View",
  "개인정보처리방침": "Privacy Policy",
  "이용약관": "Terms of Use",
  "문의": "Contact",
  "약관 동의": "Agreements",   // 11/25 동의 카드
  "이용약관 동의": "Terms of Use",
  "개인정보 수집·이용 동의": "Use of personal data",
  "만 14세 이상입니다": "I am 14 or older",
  "여행 소식·혜택 메일 받기": "Travel news and offers by email",
  "개인정보처리방침 보기": "View Privacy Policy",
  "오른쪽으로 밀면 ♥ · 왼쪽으로 밀면 패스예요": "Swipe right for ♥, left to pass",
  "이 날은 추천에 맡길게요": "Fill this day for me",
  "자연·산책 · 카페": "Nature & cafes",
  "입력하기": "Add",
  "숙소 정하기": "Add hotel",
  "신청을 못 보냈어요 (연결 실패)": "Couldn't send. Check your connection",
  "이 도시는 일정 자동 만들기 준비 중이에요. 가이드북은 아키가 만들어 보내 드리고, 지금은 오사카·교토 샘플 일정이 열려요.": "Auto-plans for this city are coming soon. We'll send you a guidebook; try the Osaka & Kyoto sample now.",
  "도착하자마자 @": "On arrival: @",
  "꾹 눌러 끌면 시간 이동": "Hold and drag to reschedule",
  "긴급 연락처 · 번호를 누르면 전화가 걸려요": "Emergency numbers, tap to call",
  "관광통역안내": "Travel helpline",
  "한국관광공사 · 24시간": "Korea Tourism Org., 24/7",
  "한국 외교부 공식 목록": "Korea MOFA official list",
  "출처 경찰청·한국관광공사": "Source: Korean National Police Agency, Korea Tourism Organization",
  "출발 전 · D-# · 첫 일정": "Pre-trip, D-#, first plan",
  "입국 심사 → 짐 찾기 → 공항철도(AREX) 표지판": "Immigration → baggage → AREX signs",
  "출발한 뒤에 쓸 수 있어요": "Available after departure",
  "공항철도 + 지하철 · 약 #시간 #분": "AREX + subway, about # h # min",
  "건너뛰기·빼기": "Skip / Remove",
  "#곳 예정 · #:# 마무리": "# planned, ends #:#",
  "명동·을지로 · 숙소에 짐 맡기기": "Myeongdong, Euljiro: drop bags",
  "JNTO · 24시간 · 영어·중국어·한국어": "JNTO, 24/7, EN/ZH/KO",
  "일본 외무성 공식 목록": "Japan MOFA official list",
  "짐 부치기 전 세관 먼저": "Customs first, then check bags",
  "팁 문화 없음": "No tipping",
  "출처 외교부·JNTO": "Source: MOFA, JNTO",
  "여권·지갑·충전기 확인": "Passport, wallet, charger",
  "네이버 지도는 앱이 있어야 열려요 · 없으면 카카오맵(웹)": "Naver Map needs its app. No app? Try KakaoMap",
  "지금은 가는 순서만 보여요": "Showing visit order only for now",
  "입국 심사 → 짐 찾기 → 경전철 표지판": "Immigration → baggage → Light Rail signs",
  "경전철·지하철 · 약 #분": "Light rail/subway, about # min",
  "전망대나|유명 명소 하나 더": "One more|view or sight",   // 11/25 #17 보기 2줄 안
  "소문난|디저트 가게나 스파": "Famed desserts|or a spa",
  "정답은 없어요. 끌리는 대로 골라 주세요.": "No wrong answers. Go with your gut.",
  "늦잠, 짐 싸고 동네 한 바퀴": "Sleep in, pack, stroll",   // 11/25 #17
  "늦잠 자고|미리 찜해 둔 브런치": "Sleep in,|booked brunch",   // 11/25 #17
  "“진짜 푹 쉬다 왔어”": "“I really rested up”",
  "“사진 속 거기,|진짜 가 봤어”": "“Finally saw it|for real”",   // 11/25 #17 한국어 3줄 → 2줄 (영어도 2줄 안)
  "“관광객 하나도 없는 동네 찾았어”": "“Found a no-tourist area”",   // 11/25 #17 (자동 사전 덮어씀)
  "미리 찾아 둔|플랜 B로 이동": "Go to the|prepped Plan B",
  "눈에 띄는 카페에서|멍때리기": "Zone out at|a random cafe",
  "근처 다른 곳|찾아서 바로 이동": "Go somewhere|nearby",
  "체크아웃 전까지|계획한 곳 하나 더": "One last|planned stop",
  "공항 가는 길에 들를 곳 찾기": "A stop on the way home",
  "다녀와서 몸이 가벼우면 그게 성공한 여행이에요": "Come home refreshed? That's a win",
  "가 봐야 할 곳은 직접 가 보는 분이시군요?": "So you see the must-sees in person?",
  "사진으로만 보던 곳 앞에 서는 순간이 최고예요": "Nothing beats seeing a place you only knew from photos",
  "로컬 맛집·시장·소품샵": "Local eats, markets, gift shops",
  "검증된 맛집·좋은 숙소": "Proven eats, great stays",
  "만드는 중": "Creating",
  "내 여행 가이드북 만드는 중": "Building your guidebook",
  "오사카·교토 · #박 #일 · 친구": "Osaka·Kyoto, # nights # days, friends",
  "집 문 앞에서 공항까지 시간 계산": "Calculating door-to-airport time",
  "영업시간·휴무일 맞춰 보기": "Checking hours and closures",
  "#일 동선 짜기": "Routing day #",
  "여행 중": "On the trip",
  "#곳 다녀옴 · #:# 마무리": "# visited, done #:#",
  "예: @ · 지도 링크": "e.g. @, map link",
  "이 시간에 갈 만한 곳 · 골라서 한 번에 추가": "Good for right now. Add several at once",
  "전국 첫 치이카와 파크 공식점": "Japan's first Chiikawa Park store",
  "돈키호테 도톤보리점": "Don Quijote Dotonbori",
  "호텔 뷰·디저트": "Hotel view, sweets",
  "처음 보는 골목·간판": "New alleys & signs",
  "랜드마크·야경": "Landmarks at night",
  "시장·소품샵에서 건진 것들": "Market & shop finds",
  "뷰 좋은 방·푹신한 침대": "Great view, soft bed",
  "주택가 골목 안, 동네 분위기": "Residential alley, local vibe",
  "걸어서 가는|시장과 단골 식당": "Walk to markets|& eats",   // 11/25 #17
  "명소까지|걸어서 가는 위치": "Walk to|the landmarks",
  "시간 단위로 정리 끝, 동선까지 확인": "Hourly plan, route set",
  "가고 싶은 곳만 잔뜩, 순서는 가서": "Long must-go list, order TBD",
  "하루 두세 곳만, 예약까지 완료": "2–3 stops a day, all booked",
  "항공·숙소만. 나머진 가서 생각": "Flights & hotel. Wing it",   // 11/25 #17
  "출발 전날 밤, 내 일정표는?": "The night before: what's your itinerary like?",
  "평소 내 모습에 가장 가까운 걸로": "Pick what's most like you",
  "숙소에서 쉬다가|예약한 저녁 먹으러": "Rest, then|dinner booking",   // 11/25 #17
  "지도 켜고 근처 한 곳 더": "Map out one more spot",
  "오후 #시, 오늘 갈 곳을 벌써 다 돌았다면?": "Done with today's list by # PM?",
  "우산 쓰고 일단 출발": "Umbrella up and go",   // 11/25 #17
  "준비해 둔|실내 코스로 그대로": "Switch to|your indoor plan",
  "오전은 숙소, 오후 일정만 살리기": "Hotel till noon, then plans",
  "아침에 일어났더니 비가 온다면?": "You wake up to rain?",
  "창밖을 본 순간 드는 생각은요?": "First thought when you look outside?",
  "기다린다.|시간 비워 뒀으니까": "Wait.|Time's set aside",   // 11/25 #17
  "예약해 둔|다른 식당으로 바로": "Off to my|backup booking",   // 11/25 #17
  "줄 서다 옆 가게가 끌리면 거기로": "Go next door instead",   // 11/25 #17
  "가고 싶던 식당에 줄이 #시간이라면?": "The place you want has a # h wait?",
  "라그탱 삿포로": "Ragtag Sapporo",
  "무인양품 삿포로 스텔라플레이스": "MUJI Sapporo Stellar Place",
  "MEGA 돈키호테 삿포로 다누키코지 본점": "Donki Tanukikoji"
});
/* 11/24 최종 검수(qa_lines 영어) 한 줄 맞추기 — 짧게 */
Object.assign(window.VZTR_EN, {
  '다음 · #:# 도착 예정': 'Next · #:#', '출발 전 · D-# · 첫 일정': 'D-# · first stop', '(가정)': '(est.)',
  '개인정보 수집·이용에 동의해요': 'I agree to data use', '신청을 못 보냈어요 (연결 실패)': 'Not sent. Check connection',
  '계획형과 즉흥형, 어느 쪽에 가까운지': 'Planner or spontaneous?',
  '내린 곳이 오늘의 **동네**': 'Explore wherever you **land**', '내리는 곳이 오늘 동네': 'Explore wherever you land',
  '쉬고 싶을 때 **카페**에서 쉬기': 'Take a **café** break', '돌아오는 길 우연한 가게': 'A random shop on the way', '먼저 넣는 곳:': 'First up:',
});

/* 11/24 일본 쇼핑 테마 장소 영어(이름·한 줄·조각) */
Object.assign(window.VZTR_EN, {
  "나카자키초 골목": "Nakazakicho alleys",
  "호리에 오렌지 스트리트": "Horie Orange Street",
  "아메리카무라": "Amerikamura",
  "마그네츠 아메리카무라점": "Magnets Amerikamura",
  "신사이바시스지 상점가": "Shinsaibashi-suji Arcade",
  "데라마치 · 신쿄고쿠 상점가": "Teramachi & Shinkyogoku",
  "긴자 이토야 본점": "Ginza Itoya",
  "긴자 거리": "Ginza Street",
  "시모키타자와 빈티지 골목": "Shimokitazawa vintage",
  "오모테산도 · 하라주쿠": "Omotesando & Harajuku",
  "다누키코지 상점가": "Tanukikoji Arcade",
  "한큐 백화점 우메다 본점": "Hankyu Dept Store Umeda",
  "고엔지 빈티지 거리": "Koenji vintage streets",
  "오모테산도 힐즈": "Omotesando Hills",
  "캣 스트리트": "Cat Street",
  "다이묘 골목": "Daimyo alleys",
  "후쿠오카 파르코": "Fukuoka Parco",
  "다이마루 후쿠오카 텐진점": "Daimaru Fukuoka Tenjin",
  "삿포로 스텔라플레이스": "Sapporo Stellar Place",
  "삿포로 다이마루": "Daimaru Sapporo",
  "아베노 하루카스 킨테쓰 본점": "Kintetsu Abeno Harukas",
  "기마구레야 아네 (이마이즈미 레트로 빈티지)": "Kimagureya Ane",
  "고베 하버랜드 우미에": "Kobe Harborland umie",
  "오토나카도리·사카에마치 레트로 빌딩가": "Otonaka-dori & Sakaemachi",
  "이세탄 신주쿠 본점": "Isetan Shinjuku",
  "긴자 식스": "GINZA SIX",
  "유니클로 긴자 (글로벌 플래그십)": "UNIQLO Ginza",
  "무인양품 긴자 (세계 플래그십)": "MUJI Ginza",
  "MEGA 돈키호테 시부야 본점": "MEGA Don Quijote Shibuya",
  "오니츠카타이거 오모테산도 옐로 콘셉트 스토어": "Onitsuka Tiger Omotesando",
  "라그탱 하라주쿠": "RAGTAG Harajuku",
  "다이마루 신사이바시점": "Daimaru Shinsaibashi",
  "다카시마야 오사카점": "Takashimaya Osaka",
  "한신 백화점 우메다 본점": "Hanshin Dept Store Umeda",
  "유니클로 오사카 (우메다 글로벌 플래그십)": "UNIQLO Osaka Chayamachi",
  "돈키호테 도톤보리점": "Don Quijote Dotonbori",
  "고착야 JAM 교토 산조점": "Furugiya JAM Kyoto Sanjo",
  "파시네이트 교토": "FASCINATE KYOTO",
  "다이마루 교토점": "Daimaru Kyoto",
  "교토 다카시마야": "Takashimaya Kyoto",
  "JR 교토 이세탄": "JR Kyoto Isetan",
  "유니클로 교토 (가와라마치 글로벌 플래그십)": "UNIQLO Kyoto Kawaramachi",
  "무인양품 교토 BAL": "MUJI Kyoto BAL",
  "라그탱 후쿠오카": "RAGTAG Fukuoka",
  "고잉 벨보": "Going Bellbo",
  "이와타야 본점": "Iwataya Main Store",
  "하카타 한큐": "Hakata Hankyu",
  "무인양품 텐진 다이묘": "MUJI Tenjin Daimyo",
  "유니클로 텐진": "UNIQLO Tenjin",
  "라그탱 삿포로": "RAGTAG Sapporo",
  "마루이이마이 삿포로 본점": "Marui Imai Sapporo",
  "무인양품 삿포로 스텔라플레이스": "MUJI Sapporo Stellar Place",
  "MEGA 돈키호테 삿포로 다누키코지 본점": "Donki Tanukikoji",
  "다이마루 고베점": "Daimaru Kobe",
  "목조 골목 카페·구제": "Wooden alley cafes & vintage",
  "생활용품·가구 거리": "Homewares & furniture street",
  "오사카 최대 구제 거리": "Osaka's top vintage district",
  "신사이바시 구제 옷가게": "Shinsaibashi vintage clothes",
  "신사이바시 상점가": "Shinsaibashi shopping arcade",
  "지붕 덮인 쇼핑 거리": "Covered shopping street",
  "잡화·소품 가게": "Stationery & small goods",
  "긴자 쇼핑 거리": "Ginza shopping street",
  "빈티지·카페 골목": "Vintage & cafe alleys",
  "옷·신발·카페 거리": "Fashion, shoes & cafes",
  "오도리 쇼핑 상점가": "Odori shopping arcade",
  "우메다 한큐 백화점": "Hankyu in Umeda",
  "빈티지 옷가게 거리": "Vintage clothing streets",
  "오모테산도 쇼핑 복합몰": "Omotesando shopping complex",
  "하라주쿠 옷·쇼핑 거리": "Harajuku fashion street",
  "개성 있는 가게·카페 골목": "Quirky shops & cafe alleys",
  "텐진 쇼핑·패션몰": "Tenjin fashion mall",
  "텐진 다이마루 백화점": "Daimaru in Tenjin",
  "삿포로역 삿포로 쇼핑몰": "Sapporo Station mall",
  "삿포로역 삿포로 백화점": "Department store at Sapporo Stn",
  "일본 최대급 매장 면적 백화점": "Japan's largest-class dept store",
  "60~70년대 일본 레트로 의류·잡화 빈티지숍": "Japanese retro vintage, 60s-70s",
  "바다 앞 쇼핑·식사 단지": "Waterfront shopping & dining",
  "옛 빌딩 개조 잡화·카페 골목": "Old buildings now shops & cafes",
  "신주쿠 대표 백화점": "Shinjuku's flagship dept store",
  "긴자 대형 명품 복합몰": "Ginza luxury complex",
  "1~12층 전부 유니클로": "UNIQLO on floors 1-12",
  "무지 최대급 플래그십": "One of MUJI's biggest flagships",
  "24시간 잡화 쇼핑": "24-hour general goods shopping",
  "일본 스니커 브랜드 대형 매장": "Big Japanese sneaker brand store",
  "브랜드 빈티지·중고 옷가게": "Brand vintage & secondhand",
  "신사이바시 대표 백화점": "Shinsaibashi's top dept store",
  "난바역 직결 백화점": "Dept store linked to Namba Stn",
  "한신 우메다역 직결 백화점": "Dept store at Hanshin Umeda Stn",
  "차야마치 대형 유니클로": "Large UNIQLO in Chayamachi",
  "관람차 옆 24시간 돈키": "Don Quijote by the wheel, 24 h",
  "가와라마치 빈티지 옷가게": "Kawaramachi vintage clothes",
  "고쇼초 골목 빈티지숍": "Vintage shop in Goshocho alley",
  "시조 가라스마 백화점": "Dept store at Shijo Karasuma",
  "시조 가와라마치 백화점": "Dept store at Shijo Kawaramachi",
  "교토역 직결 백화점": "Dept store linked to Kyoto Stn",
  "가와라마치 글로벌 플래그십": "Kawaramachi global flagship",
  "교토 BAL 5층 무지": "MUJI on 5F of Kyoto BAL",
  "다이묘 브랜드 빈티지숍": "Brand vintage in Daimyo",
  "다이묘 빈티지 옷가게": "Daimyo vintage clothes",
  "텐진 대표 백화점": "Tenjin's flagship dept store",
  "하카타역 직결 백화점": "Dept store linked to Hakata Stn",
  "큐슈 유일 단독 로드숍 무지": "Kyushu's only standalone MUJI",
  "큐슈 최대 규모 유니클로": "Kyushu's biggest UNIQLO",
  "삿포로 브랜드 빈티지숍": "Brand vintage in Sapporo",
  "삿포로 오도리 백화점": "Department store on Odori",
  "삿포로역 스텔라 6층 무지": "MUJI on 6F of Stellar Place",
  "다누키코지 24시간 돈키": "Tanukikoji Don Quijote, 24 h",
  "구거류지 입구 백화점": "Dept store at Old Settlement",
  "북쪽에 저녁에 여는 옛 대중목욕탕이 있어요": "An old public bath to the north opens in the evening",
  "아메리카무라보다 어른스러운 가게가 많아요": "More grown-up shops than Amerikamura",
  "삼각공원 중심으로 주말마다 젊은이가 모여요": "Young crowds gather around Triangle Park on weekends",
  "지붕 덮인 아케이드에 옷가게와 식당이 이어져요": "A covered arcade lined with clothes shops and eateries",
  "아케이드 거리라 쇼핑하기 즐거운 곳이에요": "A fun arcade street for shopping",
  "층마다 테마별로 문구가 나뉘어 있어요": "Each floor has its own stationery theme",
  "주말·공휴일엔 큰길이 보행자 거리가 돼요": "The main street is pedestrian-only on weekends & holidays",
  "중고 옷가게 말고도 음반·책방이 많아요": "Lots of record and book shops besides vintage",
  "가로수길 따라 브랜드 플래그십이 늘어서 있어요": "Brand flagships line the tree-lined avenue",
  "지붕이 있어 비나 눈에도 걸을 수 있어요": "Covered, so you can walk in rain or snow",
  "층마다 테마가 다른 매장이 있어요": "Each floor has a different theme",
  "빈티지 가게와 라이브하우스가 함께 있어요": "Vintage shops and live houses side by side",
  "나선형 경사로가 6층 아트리움을 감싸요": "A spiral ramp wraps around a 6-floor atrium",
  "하라주쿠에서 시부야로 이어지는 어른스러운 길이에요": "A grown-up street from Harajuku to Shibuya",
  "규슈 최대 상업지구 텐진을 대표하는 백화점이에요": "Tenjin's flagship, in Kyushu's biggest shopping area",
  "JR 삿포로역 직결, 화장품 매장이 도내 최대급이에요": "Linked to JR Sapporo Stn, with a huge cosmetics floor",
  "12~14층에 식당 44곳이 모여 있어요": "44 restaurants on floors 12-14",
  "구제 옷·중고 레코드": "Vintage clothes & used records",
  "약 380년 된 상점가": "A shopping street about 380 years old",
  "아케이드 상점가": "Covered arcade shops",
  "연필·색연필 1,300종": "1,300 kinds of pencils & colored pencils",
  "에도 은화 주조소 터": "Site of the Edo silver mint",
  "목욕탕 개조 빈티지숍": "Vintage shop in a former bathhouse",
  "도쿄의 샹젤리제": "Tokyo's Champs-Elysees",
  "여름 다누키 축제": "Summer Tanuki Festival",
  "펑크·라이브하우스": "Punk & live houses",
  "안도 다다오 설계": "Designed by Tadao Ando",
  "중고 옷가게·아웃도어": "Secondhand clothes & outdoor gear",
  "다이묘 가든 시티": "Daimyo Garden City",
  "역 직결 백화점": "Station-linked department store",
  "일본 최대 매장 면적 백화점": "Japan's largest dept store by floor area",
  "시모키타자와 빈티지 산책": "Shimokitazawa vintage walk",
  "하라주쿠 빈티지": "Harajuku vintage",
  "긴자 식스와 긴자 거리": "GINZA SIX & Ginza",
  "오모테산도 힐즈와 거리": "Omotesando Hills & avenue",
  "긴자 유니클로·무지·이토야": "Ginza UNIQLO, MUJI & Itoya",
  "오니츠카타이거와 캣 스트리트": "Onitsuka Tiger & Cat Street",
  "아메리카무라·호리에 빈티지": "Amerikamura & Horie vintage",
  "나카자키초 골목 구경": "Nakazakicho alley stroll",
  "한큐·한신 우메다 백화점": "Hankyu & Hanshin Umeda",
  "다이마루와 신사이바시스지": "Daimaru & Shinsaibashi-suji",
  "차야마치 유니클로·골목": "Chayamachi UNIQLO & alleys",
  "도톤보리 돈키호테 쇼핑": "Dotonbori Don Quijote run",
  "가와라마치 빈티지 두 곳": "Kawaramachi vintage x2",
  "시조 백화점 두 곳": "Two Shijo department stores",
  "가와라마치 유니클로·무지": "Kawaramachi UNIQLO & MUJI",
  "다이묘 빈티지 골목": "Daimyo vintage alleys",
  "텐진 다이마루·이와타야": "Tenjin Daimaru & Iwataya",
  "무지 텐진 다이묘와 파르코": "MUJI Tenjin Daimyo & Parco",
  "다누키코지 빈티지": "Tanukikoji vintage",
  "오도리 백화점 두 곳": "Two Odori department stores",
  "삿포로역 무지·다누키코지 돈키": "Sapporo MUJI & Don Quijote",
  "#~#년대 일본 레트로 의류·잡화 빈티지숍": "Japanese retro vintage, #s-#s",
  "#~#층 전부 유니클로": "UNIQLO on floors #-#",
  "#시간 잡화 쇼핑": "#-hour general goods shopping",
  "관람차 옆 #시간 돈키": "Don Quijote by the wheel, # h",
  "교토 BAL #층 무지": "MUJI on #F of Kyoto BAL",
  "삿포로역 스텔라 #층 무지": "MUJI on #F of Stellar Place",
  "다누키코지 #시간 돈키": "Tanukikoji Don Quijote, # h",
  "나선형 경사로가 #층 아트리움을 감싸요": "A spiral ramp wraps around a #-floor atrium",
  "#~#층에 식당 #곳이 모여 있어요": "# restaurants on floors #-#",
  "약 #년 된 상점가": "A shopping street about # years old",
  "연필·색연필 #,#종": "#,# kinds of pencils & colored pencils"
});
/* 11/24 일본 동네 이름(하루 제목 '긴자 골목 산책' 등) — 한국어 로마자 말고 일본어 표기 */
Object.assign(window.VZTR_EN, { '난바': 'Namba', '우메다': 'Umeda', '오사카성': 'Osaka Castle', '텐노지': 'Tennoji', '가와라마치': 'Kawaramachi', '교토역': 'Kyoto Station', '후시미': 'Fushimi', '아라시야마': 'Arashiyama', '금각사': 'Kinkaku-ji', '니조': 'Nijo', '사쿄': 'Sakyo', '우지': 'Uji', '신주쿠': 'Shinjuku', '시부야': 'Shibuya', '하라주쿠': 'Harajuku', '시모키타자와': 'Shimokitazawa', '기치조지': 'Kichijoji', '이케부쿠로': 'Ikebukuro', '긴자': 'Ginza', '도쿄역': 'Tokyo Station', '아사쿠사': 'Asakusa', '우에노': 'Ueno', '아키하바라': 'Akihabara', '오다이바': 'Odaiba', '시나가와': 'Shinagawa', '하카타역': 'Hakata Station', '나카스': 'Nakasu', '텐진': 'Tenjin', '오호리': 'Ohori', '모모치': 'Momochi', '다자이후': 'Dazaifu', '삿포로역': 'Sapporo Station', '오도리': 'Odori', '스스키노': 'Susukino', '마루야마': 'Maruyama', '모이와산': 'Mt. Moiwa', '미야노사와': 'Miyanosawa', '오타루': 'Otaru', '조잔케이': 'Jozankei', '나라공원': 'Nara Park', '나라마치': 'Naramachi', '니시노쿄': 'Nishinokyo', '호류지': 'Horyu-ji', '산노미야': 'Sannomiya', '모토마치': 'Motomachi', '난킨마치': 'Nankinmachi', '기타노': 'Kitano', '하버랜드': 'Harborland', '롯코산': 'Mt. Rokko', '아리마': 'Arima', '나가타 혼쇼켄 산노미야': 'Nagata Honshoken Sannomiya', '다카시마야': 'Takashimaya', '키타카로': 'Kitakaro', '가이유칸': 'Kaiyukan' });
Object.assign(window.VZTR_EN, { '먼저 넣는 곳: {x}': x => { const e = (window.VZTR_I18N || {}).tq ? VZTR_I18N.tq(x) : x; return /[가-힣]/.test(e) ? null : 'First up: ' + e; }, '앞 두 글자는 아직 바뀔 수 있어요': 'First 2 letters may still change' });   // 11/24 최종 검수
Object.assign(window.VZTR_EN, { '앞 두 글자는 아직 바뀔 수 있어요': 'Letters 1–2 may change' });
/* 11/25 UI 통일감 피드백(가이드북 세션): 4 비행기 시트 한 줄 안내 · 9 추천 없음 문구 */
Object.assign(window.VZTR_EN, { '날짜는 ‘여행 정보 수정’에서 · 도착이 빠르면 다음 날로': 'Dates: Edit trip info · Early arrival = next day', '날짜는 메뉴의 ‘여행 정보 수정’에서 바꿔요': 'Change dates in Edit trip info', '이 시간에 맞는 곳이 없어요 · 위에서 검색해 보세요': 'Nothing fits this time · Try the search above' });
/* 11/25 UI 규칙 v1(가이드북 세션): 장소 시트·다음 일정 카드 새 버튼 문구 · 고정 표시 · 영어판 크롤에서 잡힌 빠진 문장 */
Object.assign(window.VZTR_EN, { '추천 장소': 'Nearby', '고정': 'Fixed', '공항철도 + 택시': 'AREX + taxi', '한글로 보여 주기': 'In Korean' });   // 3칸 줄(103px)에 들어가게 짧게
Object.assign(window.VZTR_EN, { '안 자는 도시는 당일치기 · 옮기는 날은 짐 들고 이동': 'Day trips elsewhere · bags on moving days' });   // 11/25 #14 다시
/* 11/25 새 첫 페이지(landing.html) */
Object.assign(window.VZTR_EN, { '내 자리는 어디일까?': 'Which seat is yours?', '여행 성향들 둘러보기': 'Browse travel types', '내 유형 알아보기': 'Find your type', '언어': 'Language' });
/* 11/26 결과 카드 S2 공유 시트(start.html shareCard) */
Object.assign(window.VZTR_EN, { '내 카드 공유': 'Share my card', '스토리 9:16': 'Story 9:16', '정사각 1:1': 'Square 1:1', '이미지 저장': 'Save image', '링크 복사': 'Copy link', '카드를 만들지 못했어요': 'Couldn’t make the card' });
/* 11/26 16유형 이름·한 줄 소개 확정(동우님 보드 답) — 영어 이름·소개 */
Object.assign(window.VZTR_EN, { '골목 탐험대장': 'Alley Explorer', '지도에 없는 골목도 동선부터 짜 두고 걸어요': 'Maps out a route even through alleys no map shows', '프로 뚜벅이': 'Pro Walker', '계획 없이 걷다 보면 그 길이 곧 코스가 돼요': 'Walks without a plan and lets the street become the route', '느린 산책가': 'Slow Stroller', '동네 하나를 골라 정해 둔 골목만 천천히 걸어요': 'Picks one neighborhood and slowly walks the alleys already chosen', '동네 방랑자': 'Happy Wanderer', '버스를 잘못 타도 내린 동네가 오늘의 여행지예요': 'Takes the wrong bus and makes wherever it stops today’s destination', '맛집 큐레이터': 'Food Mapper', '저장해 둔 현지 맛집으로 끼니마다 계획을 세워요': 'Plans every meal around a saved list of local spots', '득템 요정': 'Shop Hopper', '눈에 띄는 가게는 일단 들어가서 올 때는 짐이 두 배예요': 'Walks into every shop that catches the eye and flies home with twice the luggage', '재방문 장인': 'The Regular', '마음에 든 가게는 또 가서 사장님과 얼굴을 익혀요': 'Goes back to favorite spots until the owner knows their face', '반쯤 현지인': 'Half-Local', '동네 마트·빵집·공원. 관광객인지 주민인지 헷갈림': 'Neighborhood marts, bakeries, parks. Tourist or local? Hard to tell', '명소 정복자': 'Bucket Lister', '꼭 가야 할 곳은 오픈 시간까지 계산해서 하나도 안 놓쳐요': 'Never misses a must-see, down to the opening hours', '웨이팅 장인': 'Hype Chaser', '요즘 뜨는 곳은 바로 가고, 줄 서는 것도 여행이라고 생각해요': 'Heads straight to what’s trending and counts the line as part of the trip', '인생샷 장인': 'Photo Perfectionist', '한 곳을 가도 노을 시간에 맞춰 제대로 담아요': 'Times even a single stop to sunset for the perfect shot', '전망 감상가': 'View Seeker', '전망 좋은 자리에 앉으면 일어날 생각이 없어요': 'Finds a seat with a view and has no plans to get up', '고독한 미식가': 'Captain Foodie', '그 도시 대표 메뉴는 하루 다섯 끼를 먹어서라도 다 먹어요': 'Eats every signature dish in town, even if it takes five meals a day', '쇼핑 중독자': 'Shopaholic', '쇼핑백을 숙소에 두고 다시 나가는 게 기본이에요': 'Drops the shopping bags at the hotel and heads right back out', '호캉스 여행자': 'Staycationer', '숙소가 곧 목적지라 체크인 시간에 맞춰 하루를 짜요': 'Treats the hotel as the destination and plans the day around check-in', '멍때리기 고수': 'Daydreamer', '창밖 풍경이면 충분하고, 밖에는 배고플 때만 나가요': 'Happy with a window view and only goes out when hungry' });
Object.assign(window.VZTR_EN, { '친구랑 궁합 보기': 'Travel match with a friend' });   // 11/26 2주차 궁합 S안
Object.assign(window.VZTR_EN, { '내 일정 이어보기 ›': 'Back to my trip ›' });   // 11/26 밤 첫 페이지: 일정 있는 기기
Object.assign(window.VZTR_EN, { '일정은 이 폰에 그대로 있어요 · 신청 기록만 못 보냈어요': 'Your plan is saved on this phone · only the request record didn’t go through' });   // 11/26 B: 신청 기록 실패 문구
/* 11/27 다국어 틀 검수: 신청 화면 동의 칸 '필수'가 코드 TX 밖 경로로 그려질 때 · 장소 영어 이름이 없던 탬버린즈 3곳(로마자 'Taembeorinjeu …'로 나와 길안내 칸 넘침) */
Object.assign(window.VZTR_EN, { '필수': 'Required', '탬버린즈 한남 플래그십': 'Tamburins Hannam', '탬버린즈 삼청 플래그십': 'Tamburins Samcheong', '탬버린즈 성수 플래그십': 'Tamburins Seongsu' });
// 11/26 C 외국인 필수 정보: '한국 여행 준비' 카드(kr-info.js) · 가까운 역 — 출처는 kr-info.js·kr-stn.js
Object.assign(window.VZTR_EN, {
  '한국 여행 준비': 'Korea travel essentials', '확인할 것 {n}': '{n} to check', '공식 사이트': 'Official site', '공식 안내': 'Official guide', '공항 안내': 'Airport guide', '대상 나라': 'Eligible countries',
  '도착 전': 'Before you arrive', '결제·교통': 'Payments & transit', '택시·지도': 'Taxis & maps', '도움이 필요할 때': 'If you need help',
  '2026-11-26 확인 · 바뀔 수 있어요, 가기 전 공식 안내를 한 번 더 보세요': 'Checked 2026-11-26 · Rules can change, so check the official guide before you go',
  '일본·대만·미국·영국 등 22개 나라는 2027년 12월 31일까지 면제 · 그 밖의 K-ETA 대상 나라는 출발 전 신청(10,000원) · 대상이 아니면 비자가 필요해요': "22 countries incl. Japan, Taiwan, the US and UK are exempt until Dec 31, 2027 · Other K-ETA-eligible countries apply before departure (KRW 10,000) · If yours isn't eligible, you need a visa",
  '전자입국신고서': 'e-Arrival Card', '도착 3일 전부터 무료로 제출 · 유효한 K-ETA가 있으면 안 해도 돼요': 'Free, submit from 3 days before arrival · Not needed with a valid K-ETA',
  'eSIM·유심': 'eSIM & SIM', '여행용 eSIM은 출발 전 온라인으로 · 인천공항 1터미널 도착층에 통신사 로밍센터(F 입국장 쪽은 24시간)': 'Buy a travel eSIM online before you fly · Carrier roaming centers in Incheon T1 arrivals (24h near Arrivals Hall F)',
  '환전': 'Currency exchange', '공항 환전소는 보통 06:00–22:00(일부 24시간) · 시내 은행은 평일 09:00–16:00': 'Airport exchange booths usually 06:00–22:00 (some 24h) · City banks weekdays 09:00–16:00',
  '교통카드 T-money': 'T-money transit card', '편의점(GS25·CU·세븐일레븐)에서 3,000–5,000원 · 지하철·버스·택시 · 충전은 현금으로': 'KRW 3,000–5,000 at convenience stores (GS25, CU, 7-Eleven) · Subway, bus, taxi · Top up with cash',
  '외국인용 선불카드 · 여권으로 발급 · 결제·환전·교통카드를 한 장에 · 호텔·역의 기기에서': 'Prepaid card for visitors · Issued with your passport · Pay, exchange and ride with one card · Kiosks at hotels and stations',
  '기후동행카드(서울)': 'Climate Card (Seoul)', '서울 지하철·버스 1·2·3·5·7일권 5,000–20,000원 + 카드 3,000원 · 현금으로 사요(해외 카드 안 됨) · 서울 안에서만': 'Unlimited Seoul subway & bus, 1/2/3/5/7 days KRW 5,000–20,000 + KRW 3,000 card · Buy with cash (no foreign cards) · Within Seoul only',
  '택시 앱 k.ride': 'Taxi app k.ride', '카카오T의 외국인용 · 카카오톡 가입 없이 해외 카드로 · 영어·일본어·중국어 · 택시는 현금·카드·교통카드 모두 돼요': 'Kakao T for visitors · No KakaoTalk account, pay with a foreign card · English, Japanese, Chinese · Taxis take cash, cards and transit cards',
  '서울 국제택시': 'Seoul International Taxi', '영어·일본어·중국어 기사 · 미리 예약': 'English, Japanese, Chinese-speaking drivers · Book ahead',
  '지도 앱': 'Map apps', '네이버 지도는 영어·일본어·중국어 화면 · 일정의 지도 버튼에서 바로 열려요': 'Naver Map works in English, Japanese and Chinese · Opens from the map button in your plan',
  '관광통역안내 1330': 'Korea Travel Hotline 1330', '영어·일본어·중국어 24시간 · 해외 폰은 +82-2-1330': 'English, Japanese, Chinese, 24h · From a foreign phone, +82-2-1330',
  '외국인종합안내 1345': 'Immigration Contact Center 1345', '비자·출입국 · 평일 09:00–22:00': 'Visas & immigration · Weekdays 09:00–22:00',
  '경찰·구급 신고도 통역으로 연결돼요': 'Police and ambulance calls can connect an interpreter',
  '가까운 역': 'Station', '걸어서 약 {n}분': '~{n} min walk'
});
/* 11/27 다국어 틀 검수: 신청 화면 동의 칸 '필수'가 코드 TX 밖 경로로 그려질 때 · 장소 영어 이름이 없던 탬버린즈 3곳(로마자 'Taembeorinjeu …'로 나와 길안내 칸 넘침) */
Object.assign(window.VZTR_EN, { '필수': 'Required', '탬버린즈 한남 플래그십': 'Tamburins Hannam', '탬버린즈 삼청 플래그십': 'Tamburins Samcheong', '탬버린즈 성수 플래그십': 'Tamburins Seongsu' });
Object.assign(window.VZTR_EN, { '라서 골랐어요': '’s pick', '이라서 골랐어요': '’s pick' });   // 11/27 최종 검수: 스와이프 이유 '«유형 이름»라서 골랐어요'의 이름 뒤 글자
Object.assign(window.VZTR_EN, { '삿포로시 관광사진 라이브러리 규약': 'Sapporo Tourism Photo Library terms' });   // 11/27 qa_run 작은 크롤(로마자 탐지): 사진 출처 라이선스 이름이 'Satporosi Gwangwangsajin…'로 나오던 것
Object.assign(window.VZTR_EN, {"장소 이름을 영어나 한글로 적어 주세요": "Please enter the place name in English or Korean"});   // 11/28 I: /addr hint ko
Object.assign(window.VZTR_EN, {"여행용 eSIM은 출발 전 온라인으로": "Buy a travel eSIM online before you fly", "김해공항 국제선 1·3층에 통신사 로밍센터(SKT·KT·LG U+)": "Carrier roaming centers (SKT, KT, LG U+) on floors 1 and 3 of Gimhae Airport's international terminal", "김포공항 국제선 1층에 SKT 로밍센터": "SKT roaming center on floor 1 of Gimpo Airport's international terminal", "제주공항 국제선 청사에 SKT 로밍센터": "SKT roaming center in Jeju Airport's international terminal", "운영 시간은 국제선 일정에 따라 달라요": "Opening hours depend on the international flight schedule", "제주 무사증": "Jeju visa-free entry", "제주로 바로 들어오면 비자 없이 입국하는 제도(제주 무사증)가 있어요": "Arriving directly in Jeju, there is a visa-free entry system (Jeju visa waiver)", "조건이 바뀔 수 있으니 출발 전 하이코리아·1345로 확인": "Conditions can change — check HiKorea or 1345 before you go", "하이코리아": "HiKorea"});   // 11/28 I15 kr-info 공항 맞춤 eSIM·제주 무사증
Object.assign(window.VZTR_EN, {"피함": "Avoid", "제목": "Title", "유형은 그대로 두고 여행 정보만 바꿔서 일정을 다시 짜요": "Your type stays the same · only the trip info changes and the itinerary is rebuilt", "여행 정보만 바꿔서 일정을 다시 짜요": "Change only the trip info and the itinerary is rebuilt", "{x} 바꾸기": "Change {x}", "내 일정 보기": "View my itinerary", "가이드북이 준비됐어요": "Your guidebook is ready", "메일로도 링크를 보냈어요": "We also emailed you the link", "닉네임을 적어 주세요": "Enter a nickname", "이메일 주소를 적어 주세요": "Enter your email address", "필수 항목에 동의해 주세요": "Please agree to the required items", "출발지 주소는 7일 뒤, 나머지는 1년 뒤 지워요": "Home address is deleted after 7 days, everything else after 1 year", "미국 업체(Cloudflare) 서버에 보관해요": "Stored on servers of a US provider (Cloudflare)", "곧 열려요": "Opening soon", "도시를 골라 주세요": "Pick a city", "도시만 고르면 동선은 알아서 짜 드려요": "Pick a city. We’ll plan the route.", "같이 가는 사람도 테스트하면 결과 화면 ‘친구랑 궁합 보기’로 궁합을 볼 수 있어요": "If your travel buddy takes the test too, tap ‘Travel match with a friend’ on the result screen to see your match", "시각을 직접 넣어 주세요": "Enter the time yourself", "그날 이 열차를 못 찾았어요": "Couldn’t find this train for that day", "동네 이름 (예: {x})": "Neighborhood (e.g. {x})", "호텔 이름을 영어나 한글로 적어 주세요": "Please type the hotel name in English or Korean", "찾는 곳이 없어요": "No results", "호텔 이름·도로명 주소를 적거나 구글 지도 링크를 넣어 주세요": "Enter a hotel name or street address, or paste a Google Maps link", "일본어 주소나 구글 지도 링크로 찾아요": "Search by a Japanese address or a Google Maps link", "호텔 이름 검색은 잠시 쉬어요": "Hotel name search is paused for now", "추천 장소로 하루 동선까지 완성해서 바로 받아요": "We build the full day-by-day route from recommended places, ready right away", "장소 카드를 넘기며 마음에 드는 것만 담아요": "Swipe through place cards and keep only the ones you like", "날짜별 빈 칸에 내가 가고 싶은 곳을 직접 채워요": "Fill each day’s empty slots with the places you want to go"});   // 11/28 S: 가상 베타 수정(S1~S23 문구)
/* 11/28 I1·I16: 사용자가 적은 이름(window.VZTR_UN, index.html이 등록)을 번역 틀이 그대로 받게 · '기상 · ○○ 숙소에서 출발'처럼 ' · '로 이어진 줄은 틀이 통째로 삼키지 않고 조각마다 옮기게(null → 조각 번역) */
(() => { const HAN = /[가-힣]/, I = () => window.VZTR_I18N, UNM = s => (window.VZTR_UN || []).indexOf(String(s).trim()) >= 0;
  const FULLU = s => { const t = String(s).trim(), e = I().tq ? I().tq(t) : t; return HAN.test(e) ? (UNM(t) ? t : null) : e; };
  const L = 'en', mk = f => x => (String(x).indexOf(' · ') >= 0 ? null : (e => e ? f(e) : null)(FULLU(x)));
  Object.assign(window.VZTR_EN, { '저녁 시간에 이동 · 공항·역에서 식사나 도시락': 'Travelling at dinner time · eat at the airport or station, or bring a boxed meal', '직통 열차가 없어 갈아타요 · 시간이 오래 걸려요': 'No direct train · you change trains, so it takes longer', '이른 시간 일정은 비행기·열차 시각 때문이에요': 'The early start is because of your flight or train time' });   // 11/28 G1·G10·G11 (gen.js 새 안내 한 줄 3개)
  Object.assign(window.VZTR_EN, { '월요일 휴무': 'Closed on Mondays', '@ 빠짐': '@ left out', '오송역': 'Osong Station', '{x} · 숙소 체크인': '{x} · Hotel check-in', '{x} · 체크아웃': '{x} · Check-out', '{x} · 숙소에 짐 맡기기': '{x} · Drop bags', '일몰 뒤 야외': 'Outdoor spot after sunset', '먹는 곳 간격 1시간 반 안': 'Too close to another meal stop' });   // 11/28 동네·역 이름이 앞에 붙는 숙소 카드 (G7)
  Object.assign(window.VZTR_EN, { '출발 전에 찾기': 'Pick them up before you leave', '짐 보관함': 'Luggage lockers' }); window.VZTR_EN['{x} · 짐 보관함에 맡기기'] = mk(e => 'Store bags in a locker at ' + e);   // 11/28 G8 역 보관함 카드
  window.VZTR_EN['{x} 숙소에서 출발'] = mk(e => L === 'en' ? 'Leave from your stay in ' + e : L === 'ja' ? e + 'の宿から出発' : L === 'zh-hans' ? '从' + e + '住宿出发' : '從' + e + '住宿出發');
})();
Object.assign(window.VZTR_EN, {"해외 업체 서버(Cloudflare 등)에 보관해요": "Stored on overseas providers’ servers (Cloudflare, etc.)", "자세한 건 처리방침": "See the Privacy Policy"});   // 11/28 S: 보관 문구(처리방침 국외 이전과 일치)
Object.assign(window.VZTR_EN, {"떠올려 보면 제일 많을 것 같은 사진은요?": "Picture it. What would you shoot the most?", "오후 #시, 오늘 갈 곳을 벌써 다 돌았다면?": "Finished everything on today's list by # PM?"});   // 11/28 S: 베타 B89·B95 문구
Object.assign(window.VZTR_EN, {"링크가 지워졌거나 잘못됐어요": "The link may have been deleted or is incorrect", "내 여행 만들기": "Create my trip", "시간 조정은 여행 당일에 켜져요": "Time adjustment turns on on the day of your trip", "비슷한 곳 보기": "See similar places", "일정에서 빼기": "Remove from plan", "‘{x}’ 건너뜀 · 보관함에 있어요": "‘{x}’ skipped · it’s in the Archive", "‘{x}’ 일정에서 뺐어요 · 보관함에 있어요": "‘{x}’ removed from the plan · it’s in the Archive", "‘{x}’ 복원 · DAY {n}": "‘{x}’ restored · DAY {n}", "‘{x}’ 복원 · DAY {n} {t}": "‘{x}’ restored · DAY {n} {t}", "‘{x}’ 추가 · 시각 미정이라 대략": "‘{x}’ added · time is approximate", "‘{x}’ 추가 · {t}": "‘{x}’ added · {t}", "{m}월 {d}일 확인": "Checked {m} {d}", "시각 미정이라 대략 이 순서로 들어가요": "Times aren’t set yet, so it goes in roughly this order", "시각 미정이라 대략": "time is approximate", "그날 영업": "Open that day", "언제든 갈 수 있어요": "Open any time"});   // 11/28 I1·I2·I3·I5·I7·I9·I10·I12 새 문구
/* 11/28 I17: 여행 전 상태 줄 '출발 12월 21일 월요일'(전엔 '오늘 …'이라 모든 날 머리에서 그날 날짜로 읽혔음) */
(() => { const L = 'en', I = () => window.VZTR_I18N, MONE = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], WKE = { '일요일': 'Sun', '월요일': 'Mon', '화요일': 'Tue', '수요일': 'Wed', '목요일': 'Thu', '금요일': 'Fri', '토요일': 'Sat' };
  window.VZTR_EN['출발 {n}월 {m}일 {x}'] = (m, d, w) => { if (L === 'en') return WKE[w] ? 'Departs · ' + WKE[w] + ', ' + MONE[m - 1] + ' ' + d : null;
    const wk = I().tq ? I().tq(w) : w; if (/[가-힣]/.test(wk)) return null; return L === 'ja' ? '出発 · ' + m + '月' + d + '日' + wk : L === 'zh-hans' ? '出发 · ' + m + '月' + d + '日' + wk : '出發 · ' + m + '月' + d + '日' + wk; };
})();
Object.assign(window.VZTR_EN, {"평년": "Typical", "평년 #°/#°": "Typical #°/#°", "링크를 복사했어요": "Link copied", "사진 · Wikimedia Commons": "Photo · Wikimedia Commons"});   // 11/28 I8·I14·I13 새 문구
Object.assign(window.VZTR_EN, {"해외 서버(Cloudflare 등)에 보관": "Stored on overseas servers (Cloudflare, etc.)", "처리방침 보기": "View Privacy Policy"});   // 11/28 S: 보관 문구 한 줄판(처리방침 국외 이전: Cloudflare·Resend·Google과 어긋나지 않게 '등')
/* 11/28 I19(B95): 영어 '1곳 추가' = 'Add 1 places' → 단수 */
if ('en' === 'en') window.VZTR_EN['{n}곳 추가'] = n => 'Add ' + n + (+n === 1 ? ' place' : ' places');
Object.assign(window.VZTR_EN, {"지금 것 유지": "Keep current"});   // 11/28 I19 문구
/* 11/28 I1(B29): 일정 맨 아래 주의 '숙소 ‘○○’ → 목록에 없는 동네라 이동 시간은 … 기준으로 계산'(○○ = 사용자가 적은 숙소 이름) — 이름은 그대로 두고 틀만 옮김 */
(() => { const L = 'en', HAN = /[가-힣]/, I = () => window.VZTR_I18N, UNM = s => { const t = String(s).trim(); return !!t && (window.VZTR_UN || []).some(u => u === t || u.indexOf(t) === 0); };
  const nm = s => { const t = String(s).trim(), e = I().tq ? I().tq(t) : t; return HAN.test(e) ? (UNM(t) ? t : (/^[^가-힣]*$/.test(t) ? t : null)) : e; };
  const T = { en: { c: 'each city’s central area', a: (x, y) => 'Stay ‘' + x + '’ isn’t on our list · travel times are based on ' + y, b: (x, y) => 'Second stay ‘' + x + '’ isn’t on our list · based on ' + y },
    ja: { c: '都市ごとの中心エリア', a: (x, y) => '宿「' + x + '」はリストにない地域のため、移動時間は' + y + 'を基準に計算', b: (x, y) => '2か所目の宿「' + x + '」はリストにない地域のため、' + y + 'を基準に計算' },
    'zh-hans': { c: '各城市的中心区域', a: (x, y) => '住宿“' + x + '”不在列表内，交通时间按' + y + '计算', b: (x, y) => '第二处住宿“' + x + '”不在列表内，按' + y + '计算' },
    'zh-hant': { c: '各城市的中心區域', a: (x, y) => '住宿「' + x + '」不在清單內，交通時間以' + y + '計算', b: (x, y) => '第二處住宿「' + x + '」不在清單內，以' + y + '計算' } }[L];
  const yy = y => y.trim() === '도시마다 중심 동네' ? T.c : nm(y);
  window.VZTR_EN['숙소 ‘{x}’ → 목록에 없는 동네라 이동 시간은 {y} 기준으로 계산'] = (x, y) => { const a = nm(x), b = yy(y); return a && b ? T.a(a, b) : null; };
  window.VZTR_EN['두 번째 숙소 ‘{x}’ → 목록에 없는 동네라 {y} 기준으로 계산'] = (x, y) => { const a = nm(x), b = yy(y); return a && b ? T.b(a, b) : null; };
})();
Object.assign(window.VZTR_EN, {"닉네임·이메일·여행 정보는 가이드북에만 써요": "Used only to make your guidebook", "출발지 주소는 7일 뒤, 나머지는 1년 뒤 지워요": "Home address: 7 days · rest: 1 year", "해외 서버(Cloudflare 등)에 보관": "Overseas servers (Cloudflare, etc.)", "‘삭제해 주세요’ 답장 한 번이면 바로 지워요": "Reply ‘delete’ and it’s erased", "처리방침 보기": "Privacy Policy"});   // 11/28 S: 신청 화면 안내 줄 한 줄로(12px)
Object.assign(window.VZTR_EN, {"비슷한 곳 보기": "Similar", "일정에서 빼기": "Remove", "시간 조정은 여행 당일에 켜져요": "Available on your trip day"});   // 11/28 I 줄임(qa_lines 글자잘림)
Object.assign(window.VZTR_EN, {"해외 서버(Cloudflare 등)에 보관": "Stored abroad (Cloudflare etc.)"});   // 11/28 S: 보관 안내 줄 더 짧게
Object.assign(window.VZTR_EN, {"처리방침 보기": "Privacy details"});   // 11/28 S: 보관 안내 줄 더 짧게(영어 링크)
Object.assign(window.VZTR_EN, {"처리방침 보기": "Details"});   // 11/28 S: 보관 안내 줄 더 짧게(영어 링크)
Object.assign(window.VZTR_EN, {"자동으로 지어요": "Auto-named", "날짜·몇 박을 골라 주세요": "Pick dates and nights", "안 정했어요": "Not decided", "고르지 않음": "None selected", "{x}에서 자는 날은 {y}에서 출발·복귀해요": "On nights in {x}, you start and return from {y}"});   // 11/28 S: 정보 수정 화면 빈 상태 문구
Object.assign(window.VZTR_EN, {"더 보기": "More", "접기": "Less", "운전": "Drive", "버스 승차권": "Bus ticket", "12월 25일 정식 오픈 알림 받기": "Get notified for the Dec 25 launch", "WhatsApp으로 공유": "Share on WhatsApp", "영업 확인 필요 {n}곳": "{n} places need an hours check"});   // 11/28 보드 답 D11·D12·D14·R4·R10 문구
Object.assign(window.VZTR_EN, {"함께하는 사람": "Who’s coming along", "여러 개 가능 · 안 골라도 돼요": "Pick any · optional", "아이 동반": "With kids", "어르신": "Seniors", "걷기 적게": "Less walking", "유모차": "Stroller", "호텔 이름 또는 동네 (예: {x})": "Hotel name or area (e.g. {x})", "호텔 이름 또는 동네": "Hotel name or area", "도시별 숙소": "Stay by city", "안 정한 도시는 나중에 가이드북에서 넣어도 돼요": "Undecided cities can be added later in the guidebook", "시각 직접 넣기": "Enter times"});   // 11/28 S: 보드 답 D1·D6·D7 문구
Object.assign(window.VZTR_EN, {"추천 장소로 하루 동선까지 완성해서 바로 받아요": "Full day-by-day route, ready right away", "장소 카드를 넘기며 마음에 드는 것만 담아요": "Swipe place cards, keep the ones you like", "날짜별 빈 칸에 내가 가고 싶은 곳을 직접 채워요": "Fill each day with places you pick"});   // 11/28 S: 일정 방식 설명 한 줄(영어 48자 이내, qa_lines)
Object.assign(window.VZTR_EN, {"교통카드 T-money": "T-money card", "외국인종합안내 1345": "Immigration 1345"});   // 11/28 전체검수: 영어 현지 정보 제목 줄임(SE-Verdana 두 줄)
Object.assign(window.VZTR_EN, {"#박": "# nights", "1박": "1 night"});   // 11/28 S: 도시별 숙소 줄 'N박'

Object.assign(window.VZTR_EN, {"영업 확인 필요 {n}곳": "Check hours: {n}"});   // 11/28 R10 영어 줄임
Object.assign(window.VZTR_EN, {"동의가 필요해요": "Consent is required", "신청 기록만 못 보냈어요": "Only the request record could not be sent"});   // 11/28 S: 신청 못 보냄 사유(조각 번역)
Object.assign(window.VZTR_EN, {"영업 확인 필요 {n}곳": "{n} to check"});   // 11/28 R10 영어 더 줄임
Object.assign(window.VZTR_EN, {"LINE으로 공유": "Share on LINE", "위챗으로 공유": "Share on WeChat", "링크를 복사해 위챗에 붙여 넣어요": "Copy the link and paste it in WeChat"});   // 11/28 정적 번역 검사: 가이드북 공유 문구
Object.assign(window.VZTR_EN, {"준비할 것 {n}개": "{n} to do"});   // 11/28 R10 뜻 바로잡음 · Q2: 'to prepare'는 SE-Verdana에서 옆 아이콘과 겹쳐 짧게
/* Q2: 영어 '1곳' = '1 places' → 단수(여행 요약 시트 '확인 필요 1곳') */
window.VZTR_EN['{n}곳'] = n => n + (+n === 1 ? ' place' : ' places');
Object.assign(window.VZTR_EN, {"신청 기록만 못 보냈어요": "Request not sent", "신청을 못 보냈어요": "Request not sent"});   // 11/28 S: 신청 실패 안내 짧게 · 정적 검사 빠진 말
Object.assign(window.VZTR_EN, {"일정은 이 폰에 그대로 있어요": "Your plan stays on this phone"});   // 11/28 S: 신청 실패 안내 문구
Object.assign(window.VZTR_EN, {"DAY {n} 완성": "DAY {n} done", "이 날은 추천으로": "Picked for you", "고른 {n}곳을 중심으로, 남은 시간은 가까운 곳으로 채울게요": "Built around your {n} picks · nearby spots fill the rest", "취향에 맞는 곳으로 알아서 채워 둘게요": "We’ll fill it with places that fit your taste", "가이드북 만들기 →": "Make my guidebook →", "DAY {n} · {x} 고르기 →": "DAY {n} · pick for {x} →", "방금 ♥한 [{x}]처럼 비슷한 곳을 먼저 보여 드려요": "Showing more places like the [{x}] you just ♥’d", "방금 패스한 [{x}] 대신 [{y}] 쪽으로 보여 드려요": "Passed on [{x}] · showing [{y}] next", "방금 패스한 [{x}] 같은 곳은 줄여서 보여 드려요": "Showing fewer places like the [{x}] you passed"});   // 11/28 P2: 장소 고르기 날 끝 도장·말풍선
Object.assign(window.VZTR_EN, {"지금까지 고른 것 반영: {x}": "Based on your picks so far: {x}", "{x} · 출발일": "{x} · start day", "{x} · 도착일": "{x} · end day", "{x} 카드 미리보기": "{x} card preview", "카드 모양": "Card shape", "구월": "Guwol", "대곡": "Daegok", "안덕": "Andeok", "연남": "Yeonnam", "오동도": "Odongdo", "을지로": "Euljiro", "초당": "Chodang", "한남": "Hannam", "한림": "Hallim", "함덕": "Hamdeok", "혜화": "Hyehwa"});   // 11/28 P2: 달력 읽기 글·동네 이름
Object.assign(window.VZTR_EN, {"오는 날을 눌러 주세요": "Tap your return day", "최대 {n}개까지 고를 수 있어요 · 하나를 먼저 해제해 주세요": "Up to {n} · deselect one first"});   // 11/28 P2: 날짜 둘째 탭 안내 · 고르기 한도 안내
Object.assign(window.VZTR_EN, {"공항철도 + 전철": "AREX + train", "같은 역 + 전철": "Same station + train"});   // 11/28 아키: 이동 줄 빠진 번역
Object.assign(window.VZTR_EN, {"그날 영업 · #:#–#:#(다음 날)": "Open that day · #:#–#:# (next day)", "영업시간 밖 · #:#–#:#(다음 날)": "Outside hours · #:#–#:# (next day)"});   // 11/28 qa 3차: 영업시간 칩 그날 영업·영업시간 밖 + 다음 날까지
Object.assign(window.VZTR_EN, {"‘{x}’ 밤에만 의미 있는 일정이라 {t}엔 못 둬요": "‘{x}’ only works at night, so it can’t go at {t}", "{t} 이후 (저녁·밤)": "After {t} (evening/night)", "‘{x}’ 아침에만 되는 일정이라 {t}엔 못 둬요": "‘{x}’ is only possible in the morning, so it can’t go at {t}", "‘{x}’ 영업시간({a}–{b}) 밖": "‘{x}’ is outside opening hours ({a}–{b})", "{a}–{b} 사이": "Between {a} and {b}", "‘{x}’ {o} 고정 → {s} · 확인 필요": "‘{x}’ is fixed at {o} → now {s} · check needed", "{x} · {y}에 옮겨 주세요": "{x} · Move it to: {y}", "{x} · {y}에 넣어 주세요": "{x} · Add it at: {y}", "‘{x}’ 옮김": "‘{x}’ moved", "{t} 시작": "Starts {t}", "‘{x}’ 시간 고정": "‘{x}’ has a fixed time", "‘{x}’ 영업 시작({t}) 전": "Before ‘{x}’ opens ({t})", "‘{x}’ 밤 일정(17:30 이후)": "‘{x}’ is a night plan (after 17:30)", "{x}만 당김": "Pulled forward just {x}", "‘{x}’ 완전 삭제": "‘{x}’ deleted permanently", "메모는 {n}개까지 적을 수 있어요": "You can write up to {n} notes", "‘{x}’ 조정 취소": "‘{x}’ adjustment cancelled", "{n}곳은 보관함으로": "{n} moved to the Archive", "줄이려면 {x}": "To trim time: {x}", "출발 {t}": "Depart {t}", "도착 {t}": "Arrive {t}", "머무는 시간 {x}": "Stay: {x}", "‘{x}’ → ‘{y}’ 바꿈": "‘{x}’ → ‘{y}’ swapped", "{n}곳 추가했어요": "{n} added", "{n}곳 제외": "{n} excluded", "간 곳 {n}곳": "{n} places visited", "이동 {x}": "Travel {x}", "걷기 약 {x}": "Walking about {x}", "DAY {n} 완료": "DAY {n} done", "가능한 시간 {x}": "Possible times: {x}", "출시 알림 받기": "Launch alert"});   // 11/28 P1: 알림(토스트)·도장 팝업·시간대 안내 틀 + 메뉴 '출시 알림 받기'
Object.assign(window.VZTR_EN, {"기록에 DAY {n} 저장": "Saved to Log as DAY {n}", "DAY {n} 미리 따라가기": "Preview DAY {n}"});   // 11/28 P1: 길안내 '오늘 일정 끝' 카드
Object.assign(window.VZTR_EN, {"처음 예정 #:#": "Originally #:#", "예정 #:# · #분 일찍": "Planned #:# · # min early", "예정 #:# · #시간 일찍": "Planned #:# · # h early", "예정 #:# · #시간 #분 일찍": "Planned #:# · # h # min early", "−#분": "−# min", "−#시간": "−# h", "−#시간 #분": "−# h # min"});   // 11/28 P1: 길안내 늦음·당김 칩
Object.assign(window.VZTR_EN, {"일본·대만·미국·영국 등 22개국은 2027.12.31까지 면제 · 그 밖의 대상국은 출발 전 신청(10,000원) · 대상 외는 비자 필요": "Exempt until 31 Dec 2027 for 22 countries incl. Japan, Taiwan, the US and UK · other eligible countries apply before departure (KRW 10,000) · otherwise a visa is needed", "도착 3일 전부터 무료 제출 · 유효한 K-ETA가 있으면 생략": "Submit free from 3 days before arrival · not needed with a valid K-ETA", "출발 전 온라인 eSIM · 인천 T1 도착층에 통신사 로밍센터(F 입국장 쪽 24시간)": "eSIM online before departure · carrier roaming centers on Incheon T1 arrivals level (24h on the F hall side)", "출발 전 온라인 eSIM · 김해공항 국제선 1·3층에 통신사 로밍센터(SKT·KT·LG U+)": "eSIM online before departure · carrier roaming centers on Gimhae international floors 1 and 3 (SKT, KT, LG U+)", "출발 전 온라인 eSIM · 김포공항 국제선 1층에 SKT 로밍센터": "eSIM online before departure · SKT roaming center on Gimpo international floor 1", "출발 전 온라인 eSIM · 제주공항 국제선 청사 SKT 로밍센터(운영 시간은 국제선 일정에 따라 달라요)": "eSIM online before departure · SKT roaming center in the Jeju international terminal (hours follow the international schedule)", "제주로 바로 입국하면 비자 없이 가능한 제도(제주 무사증) 있음 · 조건이 바뀔 수 있어 출발 전 하이코리아·1345에서 확인": "Entering directly via Jeju can be visa-free (Jeju visa-free entry) · conditions may change, so check HiKorea or 1345 before departure", "공항 환전소 보통 06:00–22:00(일부 24시간) · 시내 은행 평일 09:00–16:00": "Airport exchange usually 06:00–22:00 (some 24h) · city banks weekdays 09:00–16:00", "편의점(GS25·CU·세븐일레븐) 3,000–5,000원 · 지하철·버스·택시 · 충전은 현금": "Sold at convenience stores (GS25, CU, 7-Eleven) for KRW 3,000–5,000 · subway, bus, taxi · top up with cash", "외국인용 선불카드 · 여권으로 호텔·역 기기에서 발급 · 결제·환전·교통": "Prepaid card for visitors · issued with a passport at hotel/station kiosks · payment, exchange, transit", "서울 지하철·버스 1·2·3·5·7일권 5,000–20,000원 + 카드 3,000원 · 현금만 가능 · 서울 안에서만": "Seoul subway & bus 1/2/3/5/7-day pass KRW 5,000–20,000 + KRW 3,000 card · cash only · Seoul only", "카카오T 외국인용 · 카카오톡 없이 해외 카드로 · 영·일·중 · 택시 결제는 현금·카드·교통카드": "Kakao T for visitors · no KakaoTalk needed, foreign cards OK · English/Japanese/Chinese · pay taxis by cash, card or transit card", "영·일·중 24시간 · 해외 폰은 +82-2-1330": "English, Japanese, Chinese, 24h · from overseas phones +82-2-1330", "2026-11-26 확인 · 바뀔 수 있어요, 출발 전 공식 안내를 다시 확인하세요": "Checked 2026-11-26 · may change, so recheck official info before you go"});   // 11/28 P1: 한국 여행 준비(kinfo) 설명 줄임 — 사실·출처 그대로
Object.assign(window.VZTR_EN, {"일본·대만·미국·영국 등 22개국은 2027.12.31까지 면제 · 그 밖의 대상국은 출발 전 신청(10,000원) · 대상 외는 비자 필요": "K-ETA exempt to end-2027 for 22 countries incl. Japan, Taiwan, US, UK · others apply before travel (KRW 10,000) · else visa", "도착 3일 전부터 무료 제출 · 유효한 K-ETA가 있으면 생략": "Free, from 3 days before arrival · skip with a valid K-ETA", "출발 전 온라인 eSIM · 인천 T1 도착층에 통신사 로밍센터(F 입국장 쪽 24시간)": "eSIM online before departure · carrier roaming centers, Incheon T1 arrivals (24h on F-hall side)", "출발 전 온라인 eSIM · 김해공항 국제선 1·3층에 통신사 로밍센터(SKT·KT·LG U+)": "eSIM online before departure · carrier roaming centers, Gimhae intl. floors 1, 3 (SKT, KT, LG U+)", "출발 전 온라인 eSIM · 김포공항 국제선 1층에 SKT 로밍센터": "eSIM online before departure · SKT roaming center, Gimpo intl. floor 1", "출발 전 온라인 eSIM · 제주공항 국제선 청사 SKT 로밍센터(운영 시간은 국제선 일정에 따라 달라요)": "eSIM online before departure · SKT roaming center, Jeju intl. terminal (hours vary with flights)", "제주로 바로 입국하면 비자 없이 가능한 제도(제주 무사증) 있음 · 조건이 바뀔 수 있어 출발 전 하이코리아·1345에서 확인": "Direct entry via Jeju can be visa-free (Jeju visa-free entry) · rules may change, check HiKorea / 1345 first", "공항 환전소 보통 06:00–22:00(일부 24시간) · 시내 은행 평일 09:00–16:00": "Airport: usually 06:00–22:00 (some 24h) · Banks: weekdays 09:00–16:00", "편의점(GS25·CU·세븐일레븐) 3,000–5,000원 · 지하철·버스·택시 · 충전은 현금": "KRW 3,000–5,000 at convenience stores (GS25, CU, 7-Eleven) · subway, bus, taxi · top up with cash", "외국인용 선불카드 · 여권으로 호텔·역 기기에서 발급 · 결제·환전·교통": "Prepaid card for visitors · get it with a passport at hotel/station kiosks · pay, exchange, ride", "카카오T 외국인용 · 카카오톡 없이 해외 카드로 · 영·일·중 · 택시 결제는 현금·카드·교통카드": "Kakao T for visitors · no KakaoTalk, foreign cards OK · EN/JA/ZH · taxis take cash, card or transit card", "네이버 지도는 영어·일본어·중국어 화면 · 일정의 지도 버튼에서 바로 열려요": "Naver Map in English, Japanese, Chinese · opens from the map button in your plan"});   // 11/28 P1: kinfo 영어 줄 수 줄임(칸 폭 좁음)
Object.assign(window.VZTR_EN, {"시각이 겹쳐요": "Times overlap"});
Object.assign(window.VZTR_EN, {"♥한": "You ♥’d", "쪽이라 골랐어요": "type, so picked"});
