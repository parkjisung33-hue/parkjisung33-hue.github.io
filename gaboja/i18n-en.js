/* VZTR 영어 사전 (W5 1차 = 틀, 2026-11-20) — 키 = 화면에 보이는 한국어 문장 그대로 · 값 = 영어
   - '{n}'·'{m}' = 숫자, '{x}' = 아무 말(그 말도 사전에서 다시 찾음)
   - 1차는 뼈대(버튼·제목·단계)만. 문장 번역 본작업은 BI·문구 확정 뒤 → 빠진 문장 목록 = qa_sweep 영어판의 miss.txt
   - 장소 이름은 여기 말고 gen-data places[].en (없으면 i18n.js 로마자 자동) */
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
  '어디로': 'Where', '어디로 가세요?': 'Where are you going?', '가는 곳은 계속 늘려 갈게요': 'More cities coming soon',
  '언제': 'When', '언제 가세요?': 'When are you going?', '누구와': 'Who', '누구와 가세요?': 'Who are you traveling with?',
  '공항': 'Airport', '어느 공항에 도착하세요?': 'Which airport are you flying into?', '도착 공항에서 일정을 시작해요. 시각은 몰라도 돼요.': 'Your plan starts at the arrival airport. Times are optional.',
  '도착 공항': 'Arrival airport', '도착 비행기': 'Arriving flight', '출국 비행기': 'Departing flight', '도착': 'Arr.', '출발': 'Dep.',
  '편명 (예: KE902)': 'Flight no. (e.g. KE902)', '편명 (예: OZ221)': 'Flight no. (e.g. OZ221)',
  '숙소': 'Stay', '숙소 이름': 'Hotel name', '동네 이름 (예: 홍대)': 'Area (e.g. Hongdae)', '동네 이름 (예: 해운대)': 'Area (e.g. Haeundae)',
  '모르면 비워 두세요 · 나중에 앱에서 넣어도 돼요': 'Leave blank if unsure · You can add it later in the app',
  '받을 곳': 'Send to', '이메일': 'Email', '닉네임': 'Nickname', '여행 제목': 'Trip title',
  // 가이드북
  '요약': 'Summary', '상세': 'Detail', '메뉴 열기': 'Open menu', '보기 방식': 'View', '날짜 고르기': 'Pick a day',
  '오전': 'Morning', '오후': 'Afternoon', '저녁': 'Evening', '이동': 'Move', '장소': 'Place', '식사': 'Meal', '메모': 'Notes',
  '지도': 'Map', '길찾기': 'Directions', '네이버 지도': 'Naver Map', '카카오맵': 'KakaoMap', '구글 지도': 'Google Maps',
  '네이버 지도는 앱이 있어야 열려요 · 없으면 카카오맵(웹)': 'Naver Map needs its app · No app? Use KakaoMap (web)',
  '한글로 보여 주기': 'Show in Korean', '여기로 가 주세요': 'Please take me here',
  '출국 비행기': 'Departing flight', '출국': 'Departure', '공항철도': 'AREX Airport Railroad', '지하철': 'Subway', '경전철·지하철': 'Light rail · Subway',
  '돌아가는 날': 'Departure day', '도착하자마자': 'Right after arrival', '동네 산책': 'Neighborhood walk',
  '입국 심사 → 짐 찾기 → 공항철도(AREX) 표지판': 'Immigration → Baggage → follow AREX signs',
  '입국 심사 → 짐 찾기 → 지하철 표지판': 'Immigration → Baggage → follow Subway signs',
  '입국 심사 → 짐 찾기 → 경전철 표지판': 'Immigration → Baggage → follow Light Rail signs',
  '입국 심사·짐 찾기 약 1시간으로 잡았어요 · 붐비면 더 걸려요': 'We allow about 1 hour for immigration and baggage · Longer when busy',
  '세금 환급(택스 리펀드)은 출국 심사 전에': 'Get your tax refund before departure immigration',
  '체크인 전 짐만 보관': 'Drop bags before check-in',
  // 가이드북 뼈대(메뉴·탭·머리)
  '일정': 'Plan', '출발 전': 'Upcoming', '오늘': 'Today', '일정 요약 보기': 'Trip overview', '주의': 'Heads-up', '알아 두기': 'Good to know', '확인 필요': 'Check',
  '현지 정보': 'Local info', '경찰': 'Police', '구급·소방': 'Ambulance · Fire', '관광통역안내': 'Tourist interpretation', '한국관광공사 · 24시간': 'Korea Tourism Organization · 24h',
  '긴급 연락처 · 번호를 누르면 전화가 걸려요': 'Emergency numbers · Tap to call',
  '시간 조정': 'Adjust time', '지금대로': 'On time', '5분 일찍 끝났어요': 'Finished 5 min early', '5분 늦어지고 있어요': 'Running 5 min late', '빼기': 'Remove', '건너뛰기·빼기': 'Skip · Remove', '남음': 'left',
  '기록': 'Log', '여행 기록': 'Travel log', '기록 보기': 'View log', '하루가 끝나면 자동으로 저장돼요': 'Saved automatically at the end of each day',
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
  '예: name@gmail.com': 'e.g. name@gmail.com', '· 도착하는 날': '· Arrival day', '남산·서울역': 'Namsan · Seoul Station', '하루 완성': 'Day complete',
  // 요일·날짜 (틀)
  '일': 'Sun', '월': 'Mon', '화': 'Tue', '수': 'Wed', '목': 'Thu', '금': 'Fri', '토': 'Sat',
  '월요일': 'Monday', '화요일': 'Tuesday', '수요일': 'Wednesday', '목요일': 'Thursday', '금요일': 'Friday', '토요일': 'Saturday', '일요일': 'Sunday',
  '{n}년 {m}월': (y, m) => ['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1] + ' ' + y,
  '{n}년 {m}월 {d}일': (y, m, d) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1] + ' ' + d + ', ' + y,
  '오늘 {n}월 {m}일 {x}': (m, d, w) => 'Today · ' + w + ', ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1] + ' ' + d,
  '{n}.{m} {x}': (m, d, w) => w + ' ' + m + '/' + d, '{n}. {m} {x}': (m, d, w) => w + ' ' + m + '/' + d, '· {n}. {m} {x}': (m, d, w) => '· ' + w + ' ' + m + '/' + d,
  'DAY {n} 일정 보기': 'View DAY {n}', 'DAY {n} {m} / {d} 진행': 'DAY {n} · {m} of {d} done', '긴급 연락처 {n}': 'Emergency numbers {n}',
  '{n}곳': '{n} places', '{n}곳 예정': '{n} planned', '장소 {n}곳': '{n} places', '{n}곳 중 {m}곳': '{m} of {n}', '{n}번째': '#{n}', '선택 {n} / {m}': '{n} of {m} picked',
  '강수확률 {n}%': 'Rain {n}%', '날씨 {n}도 {m}도': 'Weather {n}° / {m}°', '{x}에서 {n}일': '{n} days in {x}', '{x} 지도': '{x} map',
  '걸어서 · 약 {n}분': 'Walk · about {n} min',
  // 틀(숫자)
  '{n}박 {m}일': '{n} nights · {m} days', '약 {n}분': 'about {n} min', '{n}분': '{n} min', '약 {n}시간 {m}분': 'about {n} h {m} min', '{n}시간 {m}분': '{n} h {m} min', '{n}시간': '{n} h',
  'DAY {n}': 'DAY {n}',
};
