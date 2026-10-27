# 현장 일정 날씨판

오늘 현장 일정과 지역별 날씨를 한 화면에서 보고, 날씨 때문에 주의 · 중지를 검토할 일정을 표시합니다. (교육용 가상 데이터)

## 처음 준비 (Supabase, 한 번만)
1. supabase.com 에서 프로젝트 만들기
2. SQL Editor 에 `setup.sql` 내용을 붙여 넣고 Run → 표 `wx_tasks` 와 가상 일정 6건이 생김
3. Project Settings → API Keys 에서 프로젝트 주소와 **publishable(또는 anon) 공개용 키**를 복사해 `config.js` 두 줄에 넣기
   - secret · service_role 키는 절대 넣지 않습니다.

## 여는 법
- 내 PC : `index.html` 더블클릭 (일정은 Supabase 에서 읽음)
  - `config.js` 가 비어 있거나 인터넷이 안 되면 표에 '일정을 불러오지 못했습니다 (config.js 확인)'가 보임
- 인터넷 : (배포 후 Vercel 주소를 여기에 적기)

## 오늘 판단 md 저장
- '오늘 판단 md로 저장' 버튼을 누르면 지금 표가 `현장일정_판단_YYYY-MM-DD.md` 파일로 받아집니다. (맨 아래에 판단 기준 한 줄)

## 날씨 · 판단
- 열면 Open-Meteo(키 없음)에서 세종 · 대전 · 태안 · 보령의 오늘 최고 기온 · 최대 풍속 · 강수확률을 받아 일정마다 판단합니다.
- 인터넷이 안 되면 위 상자에 '날씨를 받지 못했습니다'가 나오고, 일정 목록은 '날씨 확인 전'으로 그대로 보입니다.

## 규칙 시험 (?test=wind)
- 주소 끝에 `?test=wind` 를 붙여 열면 모든 지역 풍속을 12 m/s 로 바꿔 강풍 규칙(R-02)을 시험합니다.
  - 예 : `file:///C:/Work/weather_board/index.html?test=wind`
- 고소 일정 2건(옥상 태양광 설비 점검 · 청사 외벽 간판 보수)이 '중지 검토 (강풍)'으로 바뀌면 정상입니다. (T-04)
- 위 날씨 상자에 '시험 모드: 풍속 12m/s'가 보입니다. 원래대로 보려면 `?test=wind` 를 지우고 다시 엽니다.

## 파일
| 파일 | 역할 |
|---|---|
| index.html | 화면 구조 |
| style.css | 디자인 |
| logic.js | 판단 규칙 |
| app.js | 화면 동작 |
| config.js | Supabase 주소 · 공개용 키 (두 줄) |
| setup.sql | Supabase 표 만들기 (SQL Editor 에서 실행) |
| PRD.md | 무엇을 · 왜 만드는지 |
| CLAUDE.md | AI가 지킬 작업 규칙 |
| .gitignore | GitHub에 올리지 않을 파일 목록 |
