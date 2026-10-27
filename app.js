// app.js – 화면 동작 (목록 그리기, 일정 추가)

// 04 단원 : 일정은 Supabase 표 wx_tasks 에서 읽고, 추가도 거기에 저장 (연결 정보는 config.js)
let tasks = [];
let loadFailed = false;     // Supabase 연결 실패 (config.js 비어 있음 · 인터넷 끊김 등)
let weatherByRegion = {};   // 03 단원에서 지역별 날씨를 넣음

let db = null;
try {
  db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (err) {
  console.error('Supabase 연결 준비 실패', err);
}

async function loadTasks() {
  try {
    if (!db) throw new Error('config.js 비어 있음');
    const { data, error } = await db.from('wx_tasks')
      .select('title, region, kind, owner')
      .order('id');
    if (error) throw error;
    tasks = data;
    loadFailed = false;
  } catch (err) {
    console.error('일정 불러오기 실패', err);
    tasks = [];
    loadFailed = true;
  }
}

function renderTasks() {
  const body = document.getElementById('taskList');
  body.innerHTML = '';
  if (loadFailed) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.className = 'stop';
    td.textContent = '일정을 불러오지 못했습니다 (config.js 확인)';
    tr.appendChild(td);
    body.appendChild(tr);
  }
  for (const t of tasks) {
    const w = weatherByRegion[t.region];
    const r = judge(t.kind, w);
    const tr = document.createElement('tr');
    for (const v of [t.title, t.region, t.kind, t.owner, weatherText(w)]) {
      const td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    }
    const td = document.createElement('td');
    td.textContent = r.text;
    td.className = r.level;
    tr.appendChild(td);
    body.appendChild(tr);
  }
}

async function addTask(e) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('msgBox');
  const t = {
    title: document.getElementById('titleInput').value.trim(),
    region: document.getElementById('regionInput').value,
    kind: document.getElementById('kindInput').value,
    owner: document.getElementById('ownerInput').value.trim(),
  };
  if (!t.title || !t.owner) return;
  msg.textContent = '';
  try {
    if (!db) throw new Error('config.js 비어 있음');
    const { error } = await db.from('wx_tasks').insert(t);
    if (error) throw error;
  } catch (err) {
    msg.textContent = '저장하지 못했습니다 (' + err.message + ')';
    return;
  }
  form.reset();
  await loadTasks();
  renderTasks();
}

// 제목 아래에 오늘 날짜(YYYY-MM-DD) 표시
function showToday() {
  document.getElementById('todayDate').textContent = formatDate(new Date());
}

// 04 단원 : 지금 표를 md 파일(현장일정_판단_YYYY-MM-DD.md)로 내려받기
function saveJudgeMd() {
  const dateStr = formatDate(new Date());
  const md = buildJudgeMarkdown(tasks, weatherByRegion, dateStr);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '현장일정_판단_' + dateStr + '.md';
  a.click();
  URL.revokeObjectURL(a.href);
}

// 03 단원 : Open-Meteo 에서 지역별 오늘 날씨를 받아 표를 다시 그림 (실패해도 목록은 그대로)
async function loadWeather() {
  const box = document.getElementById('weatherBox');
  box.textContent = '날씨 받는 중…';
  try {
    const res = await fetch(buildWeatherUrl());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    weatherByRegion = parseWeather(await res.json());
    let msg = 'Open-Meteo 오늘 날씨 (' + new Date().toLocaleTimeString('ko-KR') + ' 기준)';
    // ?test=wind : 모든 지역 풍속을 12 m/s 로 바꿔 R-02 시험
    if (new URLSearchParams(location.search).get('test') === 'wind') {
      for (const r in weatherByRegion) weatherByRegion[r].windMax = 12;
      msg += ' · 시험 모드: 풍속 12m/s';
    }
    box.textContent = msg;
    renderTasks();
  } catch (err) {
    box.textContent = '날씨를 받지 못했습니다 (' + err.message + ')';
  }
}

document.getElementById('taskForm').addEventListener('submit', addTask);
document.getElementById('saveMdBtn').addEventListener('click', saveJudgeMd);
showToday();
loadTasks().then(() => {
  renderTasks();
  loadWeather();
});
