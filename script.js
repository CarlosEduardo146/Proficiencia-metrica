
const SUPABASE_URL = 'https://zchglmnohvvpdydmmptl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaGdsbW5vaHZ2cGR5ZG1tcHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjU2NDIsImV4cCI6MjA5NjAwMTY0Mn0.QhzwCQAhFHtMEe4VXlFGZlAD4auBqGAtxzxb673r8jA';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

if (!SUPABASE_URL.includes('SEU-PROJETO') && !SUPABASE_KEY.includes('SUA-ANON')) {
  document.getElementById('config-banner').classList.remove('show');
}

const NIVEL_ORDER  = ['Baixo','Médio-baixo','Médio-alto','Alto'];
const RACAS        = ['Branca','Preta','Parda','Amarela','Indígena'];
const SEXOS        = ['Feminino','Masculino'];
const ANOS         = ['2024','2025'];
const SERIES       = ['2º ano','5º ano','9º ano'];
const COMPONENTES  = ['Português','Matemática'];

let S = { user: null, charts: {}, escolas: [], registros: [], usuarios: [] };

function userEscola() { return S.user?.escola || null; }
function scopeRegistros(regs) {
  const esc = userEscola();
  if (!esc) return regs;
  return regs.filter(r => r.escola === esc);
}
function scopeEscolas() {
  const esc = userEscola();
  if (!esc) return S.escolas;
  return S.escolas.filter(e => e === esc);
}

const NAV_ADMIN = [
  {id:'home',    label:'Visão geral',    icon:'home'},
  {section:'Gerenciar'},
  {id:'dados',    label:'Inserir dados',  icon:'db'},
  {id:'escolas',  label:'Escolas',        icon:'school'},
  {id:'usuarios', label:'Usuários',       icon:'users'},
  {section:'Análise'},
  {id:'analytics',label:'Gráficos',       icon:'chart'},
];
const NAV_USER = [
  {id:'home',     label:'Visão geral',   icon:'home'},
  {section:'Análise'},
  {id:'analytics',label:'Gráficos',      icon:'chart'},
];

const IC = {
  home:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  db:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  school:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  chart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  plus:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  ar:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  al:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  warn:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  eye:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  lock:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  pdf:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  info:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  target:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  clip:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
};

function showLoading(msg = 'Carregando...') {
  document.getElementById('load-txt').textContent = msg;
  document.getElementById('loading-overlay').classList.add('show');
}
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('show');
}

function toast(msg, type = 'ok') {
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  const icoSvg = type === 'ok'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  t.className = `toast toast-${type}`;
  t.innerHTML = `<div class="toast-ico">${icoSvg}</div><div class="toast-msg">${msg}</div>`;
  container.appendChild(t);
  const remove = () => { t.classList.add('out'); setTimeout(() => t.remove(), 300); };
  const timer = setTimeout(remove, 3500);
  t.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.innerHTML = show ? IC.eyeOff : IC.eye;
}

async function loadAll() {
  const escFiltro = userEscola();
  let regQuery = sb.from('registros').select('*').order('created_at', { ascending: false });
  if (escFiltro) regQuery = regQuery.eq('escola', escFiltro);
  const [{ data: esc, error: e1 }, { data: reg, error: e2 }, { data: usr, error: e3 }] = await Promise.all([
    sb.from('escolas').select('nome').order('nome'),
    regQuery,
    sb.from('usuarios').select('id,nome,login,role,escola'),
  ]);
  if (e1 || e2 || e3) throw new Error((e1||e2||e3).message);
  S.escolas   = (esc  || []).map(e => e.nome);
  S.registros = (reg  || []).map(r => ({
    id: r.id, escola: r.escola, ano: r.ano, serie: r.serie,
    componente: r.componente || '',
    socio: r.socio, raca: r.raca, sexo: r.sexo,
    prof: parseFloat(r.prof), alunos: parseInt(r.alunos),
    alunos_previstos: parseInt(r.alunos_previstos) || 0,
    alunos_avaliados: parseInt(r.alunos_avaliados) || 0,
  }));
  S.usuarios  = usr || [];
}

function showLogin() {
  document.getElementById('home-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  setTimeout(() => document.getElementById('l-user').focus(), 150);
}
function backToLanding() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('home-screen').style.display = 'flex';
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
  document.getElementById('login-error').classList.remove('show');
}
function guestAccess() {
  S.user = { nome: 'Visitante', login: 'guest', role: 'guest', escola: null };
  initApp();
}
async function doLogin() {
  const u   = document.getElementById('l-user').value.trim();
  const p   = document.getElementById('l-pass').value;
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('login-error');
  err.classList.remove('show');
  if (!u || !p) {
    document.getElementById('login-error-msg').textContent = 'Preencha login e senha.';
    err.classList.add('show'); return;
  }
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Verificando...`;
  try {
    const { data, error } = await sb.from('usuarios').select('*').eq('login', u).eq('senha', p).single();
    if (error || !data) {
      document.getElementById('login-error-msg').textContent = 'Login ou senha incorretos.';
      err.classList.add('show');
    } else {
      S.user = data; initApp();
    }
  } catch (e) {
    document.getElementById('login-error-msg').textContent = 'Erro de conexão. Tente novamente.';
    err.classList.add('show');
  } finally {
    btn.disabled = false; btn.textContent = 'Entrar →';
  }
}
function doLogout() {
  Object.values(S.charts).forEach(c => { try { c.destroy(); } catch(_) {} });
  S = { user: null, charts: {}, escolas: [], registros: [], usuarios: [] };
  document.getElementById('app-screen').style.display  = 'none';
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('home-screen').style.display  = 'flex';
  renderLandingData();
}

async function initApp() {
  showLoading('Carregando dados...');
  try { await loadAll(); } catch (e) { hideLoading(); toast('Erro ao carregar dados: ' + e.message, 'err'); return; }
  hideLoading();
  document.getElementById('login-screen').style.display  = 'none';
  document.getElementById('home-screen').style.display   = 'none';
  document.getElementById('app-screen').style.display    = 'flex';
  const u = S.user;
  document.getElementById('user-av').textContent  = u.nome[0].toUpperCase();
  document.getElementById('user-nm').textContent  = u.nome;
  document.getElementById('user-rl').textContent  = u.role === 'admin' ? 'Administrador' : u.role === 'guest' ? 'Visitante' : u.escola ? `Usuário — ${u.escola}` : 'Usuário — Secretaria';
  const rc = document.getElementById('role-chip');
  rc.textContent = u.role === 'admin' ? 'Admin' : u.role === 'guest' ? 'Visitante' : 'Usuário';
  rc.className   = 'chip chip-' + (u.role === 'admin' ? 'admin' : u.role === 'guest' ? 'guest' : 'user');
  const banner = document.getElementById('scope-banner');
  if (u.escola && u.role !== 'admin') {
    document.getElementById('scope-banner-txt').textContent = `Acesso restrito à escola: ${u.escola}`;
    banner.classList.add('show');
  } else { banner.classList.remove('show'); }
  buildNav(); navigate('home');
}

function buildNav() {
  const nav = S.user.role === 'admin' ? NAV_ADMIN : NAV_USER;
  document.getElementById('sb-nav').innerHTML = nav.map(item => {
    if (item.section) return `<div class="nav-sect">${item.section}</div>`;
    return `<button class="nav-btn" id="nav-${item.id}" onclick="navigate('${item.id}')">${IC[item.icon] || ''}${item.label}</button>`;
  }).join('');
}

const TITLES = {
  home: 'Visão geral', dados: 'Inserir dados',
  escolas: 'Gerenciar escolas', usuarios: 'Gerenciar usuários', analytics: 'Análise comparativa',
};
function navigate(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('nav-' + id);
  if (nb) nb.classList.add('active');
  document.getElementById('tb-title').textContent = TITLES[id] || id;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('scr-' + id).classList.add('active');
  closeSidebar();
  const fn = { home: renderHome, dados: renderDados, escolas: renderEscolas, usuarios: renderUsuarios, analytics: renderAnalytics };
  if (fn[id]) fn[id]();
}
function openSidebar()  { document.getElementById('sidebar').classList.add('open');    document.getElementById('overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

function mediaP(regs) {
  if (!regs.length) return null;
  const tot = regs.reduce((s, r) => s + r.alunos, 0);
  return tot ? regs.reduce((s, r) => s + r.prof * r.alunos, 0) / tot : null;
}

function totalAlunosAvaliados(regs) {
  const grupos = new Map();
  regs.forEach(r => {
    const key = `${r.escola}||${r.ano}||${r.serie}`;
    if (!grupos.has(key)) grupos.set(key, r.alunos_avaliados || 0);
  });
  return Array.from(grupos.values()).reduce((s, v) => s + v, 0);
}
function totalAlunosPrevistos(regs) {
  const grupos = new Map();
  regs.forEach(r => {
    const key = `${r.escola}||${r.ano}||${r.serie}`;
    if (!grupos.has(key)) grupos.set(key, r.alunos_previstos || 0);
  });
  return Array.from(grupos.values()).reduce((s, v) => s + v, 0);
}

function diffTag(d) {
  if (d === null) return '';
  const v = parseFloat(d);
  return `<div class="stat-d ${v > 0 ? 'up' : v < 0 ? 'dn' : 'eq'}">${v > 0 ? '▲ +' : '▼ '}${d}</div>`;
}

function calcMedia(campo, escolaSel, serieSel, anoSel, componenteSel) {
  const cats = campo === 'socio' ? NIVEL_ORDER : campo === 'raca' ? RACAS : SEXOS;
  const anos = anoSel ? [anoSel] : ANOS;
  const regsEscopados = scopeRegistros(S.registros);
  const fil  = r => (!escolaSel || r.escola === escolaSel) && (!serieSel || r.serie === serieSel) && (!componenteSel || r.componente === componenteSel);
  const d    = {};
  anos.forEach(a => {
    d[a] = cats.map(cat => {
      const sub = regsEscopados.filter(r => fil(r) && r[campo] === cat && r.ano === a);
      return mediaP(sub);
    });
  });
  const idx = cats.map((_, i) => anos.some(a => d[a][i] !== null) ? i : -1).filter(i => i >= 0);
  return {
    cats: idx.map(i => cats[i]),
    ant:  ANOS[0] ? idx.map(i => d[ANOS[0]]?.[i] ?? null) : idx.map(() => null),
    atu:  ANOS[1] ? idx.map(i => d[ANOS[1]]?.[i] ?? null) : idx.map(() => null),
  };
}

const CHART_CFG = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'start',
      labels: {
        usePointStyle: true,
        pointStyle: 'rectRounded',
        boxWidth: 10,
        boxHeight: 10,
        padding: 16,
        color: '#7a7265',
        font: { family: "'Syne',sans-serif", size: 11, weight: '600' },
      },
    },
    tooltip: {
      backgroundColor: '#1a1612', titleColor: '#faf8f4', bodyColor: '#a09485',
      padding: 12, cornerRadius: 8,
      titleFont: { family: "'Syne',sans-serif", size: 11, weight: '700' },
      bodyFont:  { family: "'DM Sans',sans-serif", size: 12 },
      callbacks: { label: c => `  ${c.dataset.label}: ${c.parsed.y != null ? c.parsed.y.toFixed(1) : '—'}` },
    },
  },
  scales: {
    y: { beginAtZero: false, grid: { color: 'rgba(26,22,18,0.05)', drawBorder: false }, border: { display: false }, ticks: { color: '#a09485', font: { family: "'Syne',sans-serif", size: 10 }, maxTicksLimit: 5 } },
    x: { grid: { display: false }, border: { display: false }, ticks: { color: '#7a7265', font: { family: "'DM Sans',sans-serif", size: 11 }, autoSkip: false, maxRotation: 30 } },
  },
  layout: { padding: { top: 4, bottom: 0 } },
  animation: { duration: 500, easing: 'easeOutQuart' },
};
function mkChart(id, cats, ant, atu) {
  if (S.charts[id]) { S.charts[id].destroy(); delete S.charts[id]; }
  const ctx = document.getElementById(id); if (!ctx) return;
  const hasData = cats.length > 0;
  S.charts[id] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hasData ? cats : ['(sem dados)'],
      datasets: [
        { label: '2024', data: hasData ? ant : [null], backgroundColor: 'rgba(193,123,63,0.18)', borderColor: '#c17b3f', borderWidth: 2, borderRadius: 6, borderSkipped: false },
        { label: '2025', data: hasData ? atu : [null], backgroundColor: 'rgba(58,122,92,0.22)',  borderColor: '#3a7a5c', borderWidth: 2, borderRadius: 6, borderSkipped: false },
      ],
    },
    options: CHART_CFG,
  });
}

function cobBadge(prev, aval) {
  if (!prev) return '';
  const pct = Math.round(aval / prev * 100);
  const cls = pct >= 80 ? 'cob-high' : pct >= 60 ? 'cob-mid' : 'cob-low';
  return `<span class="cob-badge ${cls}">${pct}% cobertura</span>`;
}

function renderHome() {
  const regsScope = scopeRegistros(S.registros);
  const r2024 = regsScope.filter(r => r.ano === '2024');
  const r2025 = regsScope.filter(r => r.ano === '2025');
  const ma = mediaP(r2024), mb = mediaP(r2025);
  const diff = ma && mb ? (mb - ma).toFixed(1) : null;
  const totalAvaliados = totalAlunosAvaliados(regsScope);
  const escsVisiveis = scopeEscolas();
  const escs = escsVisiveis.map(e => {
    const ea = regsScope.filter(r => r.escola === e && r.ano === '2024');
    const eb = regsScope.filter(r => r.escola === e && r.ano === '2025');
    const pa = mediaP(ea), pb = mediaP(eb);
    const d  = pa && pb ? pb - pa : null;
    const tot = totalAlunosAvaliados(regsScope.filter(r => r.escola === e));
    return { nome: e, pa, pb, d, tot };
  }).sort((a, b) => (b.pb || 0) - (a.pb || 0));
  const maxP = Math.max(...escs.map(e => e.pb || 0), 1);
  const escoAlerta = userEscola() && S.user.role !== 'admin'
    ? `<div class="scope-alert">${IC.lock}<span>Exibindo dados de <strong>${escHtml(userEscola())}</strong> — seu acesso é restrito a esta escola.</span></div>`
    : '';
  document.getElementById('scr-home').innerHTML = `
  ${escoAlerta}
  <div class="hero-wrap">
    <h2 class="serif">Olá, ${escHtml(S.user.nome.split(' ')[0])}. <em>Bem-vindo.</em></h2>
    <p>Acompanhe a proficiência dos estudantes por escola, segmentando por nível socioeconômico, cor/raça e sexo.</p>
    <div class="hero-btns">
      ${S.user.role === 'admin' ? `<button class="btn hero-btn-p" onclick="navigate('dados')">${IC.plus} Inserir dados</button>` : ''}
      <button class="btn hero-btn-g" onclick="navigate('analytics')">${IC.chart} Ver gráficos</button>
    </div>
  </div>
  <div class="stats-row">
    <div class="stat c-azure"><div class="stat-ico">${IC.school}</div><div class="stat-v">${escsVisiveis.length}</div><div class="stat-l">Escolas</div></div>
    <div class="stat c-emerald"><div class="stat-ico">${IC.users}</div><div class="stat-v">${totalAvaliados.toLocaleString('pt-BR')}</div><div class="stat-l">Estudantes avaliados</div></div>
    <div class="stat c-violet"><div class="stat-ico">${IC.chart}</div><div class="stat-v">${r2024.length && ma !== null ? ma.toFixed(1) : '—'}</div><div class="stat-l">Profic. 2024</div></div>
    <div class="stat c-sky"><div class="stat-ico">${IC.chart}</div><div class="stat-v">${r2025.length && mb !== null ? mb.toFixed(1) : '—'}</div><div class="stat-l">Profic. 2025</div>${diffTag(diff)}</div>
  </div>
  <div class="card">
    <div class="card-hd">${IC.school} ${escsVisiveis.length === 1 ? 'Dados da escola — 2025' : 'Ranking de escolas — 2025'}</div>
    ${escs.length ? escs.map((e, i) => `
    <div class="rank-row">
      <div class="rank-n" style="${i === 0 ? 'background:#fdf0e0;color:var(--accent);' : i === 1 ? 'background:#e8f5ee;color:var(--green);' : i === 2 ? 'background:#e6eefa;color:var(--sky);' : ''}">${i + 1}</div>
      <div class="rank-nm" title="${escHtml(e.nome)}">${escHtml(e.nome)}</div>
      <div style="font-size:11px;color:var(--muted2);width:70px;text-align:right;flex-shrink:0">${e.tot.toLocaleString('pt-BR')} aval.</div>
      <div class="pbar-wrap">
        <div class="pbar-bg"><div class="pbar-fill" style="width:${Math.round((e.pb || 0) / maxP * 100)}%;background:${i === 0 ? 'var(--accent)' : i === 1 ? 'var(--green2)' : 'var(--sky2)'}"></div></div>
        <div style="font-size:11px;color:var(--muted);margin-top:3px;text-align:right">${e.pb ? e.pb.toFixed(1) : '—'}</div>
      </div>
      ${e.d !== null ? `<div class="stat-d ${e.d > 0 ? 'up' : e.d < 0 ? 'dn' : 'eq'}" style="width:52px;text-align:right;flex-shrink:0;font-size:11px">${e.d > 0 ? '▲ +' : '▼ '}${e.d.toFixed(1)}</div>` : '<div style="width:52px"></div>'}
    </div>`).join('') : `<div class="empty"><div class="empty-ico">📊</div><p>Nenhum dado disponível</p></div>`}
  </div>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════
//  DADOS — formulário com tabelas inline
// ═══════════════════════════════════════════════
let fStep = 1;

function buildDimTable(campo, cats) {
  const rows = cats.map((cat, i) => `
    <div class="dim-row">
      <span class="dim-row-label">${escHtml(cat)}</span>
      <input class="dim-input" type="number" min="0" max="1000" step="0.1"
             placeholder="—" id="${campo}-prof-${i}"
             title="Proficiência média de ${escHtml(cat)}" />
      <input class="dim-input" type="number" min="1"
             placeholder="—" id="${campo}-alunos-${i}"
             title="Avaliados — ${escHtml(cat)}" />
    </div>`).join('');
  return `
    <div class="dim-table">
      <div class="dim-table-head">
        <span>Categoria</span>
        <span>Profic. média</span>
        <span>Avaliados</span>
      </div>
      ${rows}
    </div>`;
}

function renderDados() {
  const escsDisp = scopeEscolas();
  const regsScope = scopeRegistros(S.registros);

  const totalRegistros  = regsScope.length;
  const totalPrevistos  = totalAlunosPrevistos(regsScope);
  const totalAvaliados  = totalAlunosAvaliados(regsScope);
  const cobGeral        = totalPrevistos > 0 ? Math.round(totalAvaliados / totalPrevistos * 100) : null;
  const cobCls          = cobGeral === null ? '' : cobGeral >= 80 ? 'c-emerald' : cobGeral >= 60 ? 'c-amber' : 'c-violet';

  document.getElementById('scr-dados').innerHTML = `
  <div class="page-hd"><h2 class="serif">Inserir proficiências</h2><p>Registre os indicadores por escola, dimensão e período</p></div>

  <div class="stats-row">
    <div class="stat c-azure">
      <div class="stat-ico">${IC.clip}</div>
      <div class="stat-v">${totalRegistros.toLocaleString('pt-BR')}</div>
      <div class="stat-l">Registros salvos</div>
    </div>
    <div class="stat c-sky">
      <div class="stat-ico">${IC.users}</div>
      <div class="stat-v">${totalPrevistos.toLocaleString('pt-BR')}</div>
      <div class="stat-l">Alunos previstos</div>
    </div>
    <div class="stat c-emerald">
      <div class="stat-ico">${IC.check}</div>
      <div class="stat-v">${totalAvaliados.toLocaleString('pt-BR')}</div>
      <div class="stat-l">Alunos avaliados</div>
    </div>
    <div class="stat ${cobCls}">
      <div class="stat-ico">${IC.target}</div>
      <div class="stat-v">${cobGeral !== null ? cobGeral + '%' : '—'}</div>
      <div class="stat-l">Cobertura geral</div>
      ${cobGeral !== null ? `<div class="stat-d ${cobGeral >= 80 ? 'up' : cobGeral >= 60 ? 'eq' : 'dn'}">${cobGeral >= 80 ? '▲ Meta atingida' : cobGeral >= 60 ? '~ Parcial' : '▼ Abaixo da meta'}</div>` : ''}
    </div>
  </div>

  <div class="card">
    <div class="card-hd">${IC.plus} Novo registro</div>
    <div class="stepper" id="stepper">
      <div class="stp active">1. Escola, ano e turma</div>
      <div class="stp">2. Distribuição por dimensão</div>
    </div>

    <!-- PASSO 1 -->
    <div id="fs1">
      <div class="fgrid">
        <div>
          <label class="flabel" for="f-escola">Escola</label>
          <select class="fsel" id="f-escola">
            <option value="">Selecione...</option>
            ${escsDisp.map(e => `<option>${escHtml(e)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="flabel" for="f-ano">Ano de referência</label>
          <select class="fsel" id="f-ano">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
        <div>
          <label class="flabel" for="f-serie-1">Série</label>
          <select class="fsel" id="f-serie-1">
            <option value="">Selecione a série...</option>
            ${SERIES.map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="flabel" for="f-componente">Componente curricular</label>
          <select class="fsel" id="f-componente">
            <option value="">Selecione...</option>
            ${COMPONENTES.map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="info-box">
        ${IC.info}
        <span>Informe o total de estudantes da turma selecionada. Os campos das dimensões abaixo representam a <strong>distribuição dos avaliados</strong> por categoria — a soma pode ser diferente do total avaliado, pois um aluno pode aparecer em várias dimensões.</span>
      </div>
      <div class="fgrid">
        <div>
          <label class="flabel" for="f-previstos">Estudantes previstos</label>
          <input class="finput" type="number" id="f-previstos" min="1" placeholder="Total matriculados na turma" />
        </div>
        <div>
          <label class="flabel" for="f-avaliados">Estudantes avaliados</label>
          <input class="finput" type="number" id="f-avaliados" min="1" placeholder="Total que realizou a avaliação" />
        </div>
      </div>

      <button class="btn btn-primary" onclick="fNext()">${IC.ar} Próximo: distribuição</button>
    </div>

    <!-- PASSO 2 -->
    <div id="fs2" style="display:none">
      <div style="font-size:11px;color:var(--muted2);font-family:'Syne',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:16px;">
        Distribuição dos avaliados — linhas em branco serão ignoradas
      </div>

      <div class="dims-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">

        <div>
          <div class="flabel" style="margin-bottom:8px;">Nível socioeconômico</div>
          ${buildDimTable('socio', NIVEL_ORDER)}
        </div>

        <div>
          <div class="flabel" style="margin-bottom:8px;">Cor / raça</div>
          ${buildDimTable('raca', RACAS)}
        </div>

        <div style="grid-column:1/-1;max-width:420px;">
          <div class="flabel" style="margin-bottom:8px;">Sexo</div>
          ${buildDimTable('sexo', SEXOS)}
        </div>

      </div>

      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" onclick="fBack()">${IC.al} Voltar</button>
        <button class="btn btn-success" id="btn-salvar" onclick="salvarReg()">${IC.check} Salvar registros</button>
      </div>
    </div>
  </div>

  <!-- TABELA DE REGISTROS -->
  <div class="card">
    <div class="card-hd">${IC.db} Registros salvos
      <div class="card-hd-right">
        <select class="frow-sel" id="fil-reg" onchange="atualizarTabReg()">
          <option value="">Todas as escolas</option>
          ${escsDisp.map(e => `<option>${escHtml(e)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="tab-reg"></div>
  </div>`;

  fStep = 1;
  atualizarTabReg();
}

function fNext() {
  const escola = document.getElementById('f-escola').value;
  const serie  = document.getElementById('f-serie-1').value;
  if (!escola) { toast('Selecione uma escola.', 'err'); return; }
  if (!serie)  {
    document.getElementById('f-serie-1').classList.add('err');
    toast('Selecione a série.', 'err'); return;
  }
  document.getElementById('f-serie-1').classList.remove('err');
  const componente = document.getElementById('f-componente').value;
  if (!componente) {
    document.getElementById('f-componente').classList.add('err');
    toast('Selecione o componente curricular.', 'err'); return;
  }
  document.getElementById('f-componente').classList.remove('err');
  fStep = 2; setStepper(2);
  document.getElementById('fs1').style.display = 'none';
  document.getElementById('fs2').style.display = 'block';
}

function fBack() {
  fStep = 1; setStepper(1);
  document.getElementById('fs1').style.display = 'block';
  document.getElementById('fs2').style.display = 'none';
}

function setStepper(n) {
  document.querySelectorAll('#stepper .stp').forEach((s, i) => {
    s.classList.toggle('active', i === n - 1);
    s.classList.toggle('done',   i < n - 1);
  });
}

async function salvarReg() {
  const escola     = document.getElementById('f-escola').value;
  const ano        = document.getElementById('f-ano').value;
  const serie      = document.getElementById('f-serie-1').value;
  const componente = document.getElementById('f-componente').value || '';
  const previstos  = parseInt(document.getElementById('f-previstos').value) || 0;
  const avaliados  = parseInt(document.getElementById('f-avaliados').value) || 0;

  if (!serie) {
    toast('Série não encontrada. Volte ao passo anterior.', 'err'); return;
  }

  const regs = [];

  // Nível socioeconômico
  NIVEL_ORDER.forEach((cat, i) => {
    const prof   = parseFloat(document.getElementById(`socio-prof-${i}`)?.value);
    const alunos = parseInt(document.getElementById(`socio-alunos-${i}`)?.value);
    if (!isNaN(prof) && !isNaN(alunos) && alunos >= 1) {
      regs.push({ escola, ano, serie, componente, socio: cat,
                  prof, alunos, alunos_previstos: previstos, alunos_avaliados: avaliados });
    }
  });

  // Cor / raça
  RACAS.forEach((cat, i) => {
    const prof   = parseFloat(document.getElementById(`raca-prof-${i}`)?.value);
    const alunos = parseInt(document.getElementById(`raca-alunos-${i}`)?.value);
    if (!isNaN(prof) && !isNaN(alunos) && alunos >= 1) {
      regs.push({ escola, ano, serie, componente, raca: cat,
                  prof, alunos, alunos_previstos: previstos, alunos_avaliados: avaliados });
    }
  });

  // Sexo
  SEXOS.forEach((cat, i) => {
    const prof   = parseFloat(document.getElementById(`sexo-prof-${i}`)?.value);
    const alunos = parseInt(document.getElementById(`sexo-alunos-${i}`)?.value);
    if (!isNaN(prof) && !isNaN(alunos) && alunos >= 1) {
      regs.push({ escola, ano, serie, componente, sexo: cat,
                  prof, alunos, alunos_previstos: previstos, alunos_avaliados: avaliados });
    }
  });

  if (!regs.length) {
    toast('Preencha ao menos uma linha com proficiência e número de alunos.', 'err'); return;
  }

  const btn = document.getElementById('btn-salvar');
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Salvando ${regs.length} registro${regs.length !== 1 ? 's' : ''}...`;

  const { data, error } = await sb.from('registros').insert(regs).select();
  btn.disabled = false;
  btn.innerHTML = IC.check + ' Salvar registros';

  if (error) { toast('Erro ao salvar: ' + error.message, 'err'); return; }

  (data || []).forEach(r => S.registros.unshift({
    id: r.id, escola: r.escola, ano: r.ano, serie: r.serie,
    componente: r.componente || '',
    socio: r.socio, raca: r.raca, sexo: r.sexo,
    prof: parseFloat(r.prof), alunos: parseInt(r.alunos),
    alunos_previstos: parseInt(r.alunos_previstos) || 0,
    alunos_avaliados: parseInt(r.alunos_avaliados) || 0,
  }));

  toast(`${regs.length} registro${regs.length !== 1 ? 's' : ''} salvo${regs.length !== 1 ? 's' : ''} com sucesso!`, 'ok');

  fStep = 1; setStepper(1);
  document.getElementById('fs1').style.display = 'block';
  document.getElementById('fs2').style.display = 'none';
  document.getElementById('f-escola').value      = '';
  document.getElementById('f-previstos').value   = '';
  document.getElementById('f-avaliados').value   = '';
  document.getElementById('f-serie-1').value     = '';
  document.getElementById('f-componente').value  = '';
  renderDados();
}

function atualizarTabReg() {
  const fil = document.getElementById('fil-reg')?.value || '';
  const regsAll = scopeRegistros(S.registros).filter(r => !fil || r.escola === fil);

  const gruposMap = new Map();
  regsAll.forEach(r => {
    const key = `${r.escola}||${r.ano}||${r.serie}||${r.componente}`;
    if (!gruposMap.has(key)) {
      gruposMap.set(key, {
        escola: r.escola, ano: r.ano, serie: r.serie, componente: r.componente || '',
        alunos_previstos: r.alunos_previstos, alunos_avaliados: r.alunos_avaliados,
        ids: [], count: 0,
      });
    }
    const g = gruposMap.get(key);
    g.ids.push(r.id);
    g.count++;
  });

  const el = document.getElementById('tab-reg'); if (!el) return;
  if (!gruposMap.size) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">📭</div><p>Nenhum registro encontrado</p></div>';
    return;
  }

  const grupos = Array.from(gruposMap.values());
  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr>
      <th>Escola</th><th>Ano</th><th>Série</th><th>Componente</th>
      <th>Previstos</th><th>Avaliados</th><th>Cobertura</th>
      <th>Dimensões</th><th></th>
    </tr></thead>
    <tbody>${grupos.map((g, idx) => {
      const prev = g.alunos_previstos || 0;
      const aval = g.alunos_avaliados || 0;
      const pct  = prev > 0 ? Math.round(aval / prev * 100) : null;
      const cls  = pct === null ? '' : pct >= 80 ? 'cob-high' : pct >= 60 ? 'cob-mid' : 'cob-low';
      return `<tr>
        <td class="td-b" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(g.escola)}">${escHtml(g.escola)}</td>
        <td><span class="badge b-${g.ano}">${g.ano}</span></td>
        <td>${escHtml(g.serie || '—')}</td>
        <td>${g.componente ? `<span class="badge b-componente">${escHtml(g.componente)}</span>` : '<span style="color:var(--muted2);font-size:11px">—</span>'}</td>
        <td>${prev ? prev.toLocaleString('pt-BR') : '<span style="color:var(--muted2)">—</span>'}</td>
        <td class="td-b">${aval ? aval.toLocaleString('pt-BR') : '<span style="color:var(--muted2)">—</span>'}</td>
        <td>${pct !== null ? `<span class="cob-badge ${cls}">${pct}%</span>` : '<span style="color:var(--muted2);font-size:11px">—</span>'}</td>
        <td><span style="font-size:11px;color:var(--muted2)">${g.count} linha${g.count !== 1 ? 's' : ''}</span></td>
        <td><button class="btn btn-sm btn-danger del-grupo-btn" data-idx="${idx}" title="Excluir grupo">${IC.trash}</button></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;

  el.querySelectorAll('.del-grupo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = grupos[parseInt(btn.dataset.idx)];
      confirmarDelGrupo(g.ids, g.escola, g.ano, g.serie, g.componente);
    });
  });
}

function confirmarDelGrupo(ids, escola, ano, serie, componente) {
  const compLabel = componente ? ` — ${componente}` : '';
  openConfirmModal(
    'Excluir grupo de registros?',
    `Remover todos os registros de <strong>${escHtml(escola)}</strong> — ${ano}, ${serie}${escHtml(compLabel)}?`,
    `⚠ Isso excluirá ${ids.length} linha${ids.length !== 1 ? 's' : ''} de dimensões vinculadas.`,
    async () => {
      const btn = document.getElementById('cm-confirm-btn');
      btn.disabled = true; btn.innerHTML = `<div class="spinner"></div> Excluindo...`;
      const { error } = await sb.from('registros').delete().in('id', ids);
      btn.disabled = false; btn.textContent = 'Excluir';
      closeConfirmModal();
      if (error) { toast('Erro ao excluir: ' + error.message, 'err'); return; }
      S.registros = S.registros.filter(r => !ids.includes(r.id));
      toast('Grupo de registros excluído.', 'ok');
      renderDados();
    }
  );
}

function confirmarDelReg(id) {
  const reg = S.registros.find(r => r.id === id);
  if (!reg) return;
  openConfirmModal(
    'Excluir registro?',
    `Remover o registro de <strong>${escHtml(reg.escola)}</strong> — ${reg.ano}, ${reg.serie}, ${reg.socio}?`,
    null,
    async () => {
      const { error } = await sb.from('registros').delete().eq('id', id);
      if (error) { toast('Erro ao excluir: ' + error.message, 'err'); return; }
      S.registros = S.registros.filter(r => r.id !== id);
      toast('Registro excluído.', 'ok');
      atualizarTabReg();
    }
  );
}

// ── ESCOLAS ──
function renderEscolas() {
  document.getElementById('scr-escolas').innerHTML = `
  <div class="page-hd"><h2 class="serif">Gerenciar escolas</h2><p>Adicione e remova escolas do sistema</p></div>
  <div class="card">
    <div class="card-hd">${IC.plus} Adicionar escola</div>
    <div class="fgrid">
      <div>
        <label class="flabel" for="e-nome">Nome da escola</label>
        <input class="finput" id="e-nome" placeholder="Ex: E.M. João XXIII" onkeydown="if(event.key==='Enter')addEscola()" />
      </div>
    </div>
    <button class="btn btn-primary" id="btn-add-escola" onclick="addEscola()">${IC.plus} Adicionar</button>
  </div>
  <div class="card">
    <div class="card-hd">${IC.school} Escolas cadastradas
      <span style="margin-left:auto;font-size:11px;color:var(--muted2);font-weight:400;">${S.escolas.length} escola${S.escolas.length !== 1 ? 's' : ''}</span>
    </div>
    ${S.escolas.length
      ? `<div class="table-wrap"><table>
          <thead><tr><th>Escola</th><th>Previstos</th><th>Avaliados</th><th>Cobertura</th><th>Usuários</th><th></th></tr></thead>
          <tbody>${S.escolas.map(e => {
            const regsE   = S.registros.filter(r => r.escola === e);
            const prev    = totalAlunosPrevistos(regsE);
            const aval    = totalAlunosAvaliados(regsE);
            const pct     = prev > 0 ? Math.round(aval / prev * 100) : null;
            const cls     = pct === null ? '' : pct >= 80 ? 'cob-high' : pct >= 60 ? 'cob-mid' : 'cob-low';
            const usrsVinc = S.usuarios.filter(u => u.escola === e).length;
            return `<tr>
              <td class="td-b">${escHtml(e)}</td>
              <td>${prev ? prev.toLocaleString('pt-BR') : '<span style="color:var(--muted2)">—</span>'}</td>
              <td>${aval ? aval.toLocaleString('pt-BR') : '<span style="color:var(--muted2)">—</span>'}</td>
              <td>${pct !== null ? `<span class="cob-badge ${cls}">${pct}%</span>` : '<span style="color:var(--muted2);font-size:11px">—</span>'}</td>
              <td>${usrsVinc > 0 ? `<span class="badge b-escola">${usrsVinc} usuário${usrsVinc !== 1 ? 's' : ''}</span>` : '<span style="color:var(--muted2);font-size:11px;">nenhum</span>'}</td>
              <td><button class="btn btn-sm btn-danger" data-nome="${escHtml(e)}" onclick="confirmarDelEscola(this.dataset.nome)" title="Excluir escola">${IC.trash}</button></td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>`
      : '<div class="empty"><div class="empty-ico">🏫</div><p>Nenhuma escola cadastrada</p></div>'
    }
  </div>`;
}

function confirmarDelEscola(nome) {
  const regs   = S.registros.filter(r => r.escola === nome);
  const usrsVinc = S.usuarios.filter(u => u.escola === nome).length;
  let warn = '';
  if (regs.length > 0) warn += `⚠ Possui ${regs.length} registro${regs.length !== 1 ? 's' : ''} vinculado${regs.length !== 1 ? 's' : ''}. `;
  if (usrsVinc > 0)    warn += `⚠ ${usrsVinc} usuário${usrsVinc !== 1 ? 's' : ''} vinculado${usrsVinc !== 1 ? 's' : ''} perderá${usrsVinc !== 1 ? 'ão' : ''} acesso específico a esta escola.`;
  openConfirmModal(
    'Excluir escola?',
    `Tem certeza que deseja excluir <strong>"${escHtml(nome)}"</strong>? Esta ação não pode ser desfeita.`,
    warn || null,
    () => delEscola(nome)
  );
}
async function delEscola(nome) {
  const btn = document.getElementById('cm-confirm-btn');
  btn.disabled = true; btn.innerHTML = `<div class="spinner"></div> Excluindo...`;
  const { error } = await sb.from('escolas').delete().eq('nome', nome);
  btn.disabled = false; btn.textContent = 'Excluir';
  closeConfirmModal();
  if (error) { toast('Erro ao excluir: ' + error.message, 'err'); return; }
  S.escolas   = S.escolas.filter(e => e !== nome);
  S.registros = S.registros.filter(r => r.escola !== nome);
  toast(`Escola "${nome}" excluída.`, 'ok');
  renderEscolas();
}
async function addEscola() {
  const n   = document.getElementById('e-nome').value.trim();
  const inp = document.getElementById('e-nome');
  if (!n) { inp.classList.add('err'); toast('Informe o nome da escola.', 'err'); return; }
  if (S.escolas.includes(n)) { inp.classList.add('err'); toast('Escola já cadastrada.', 'err'); return; }
  inp.classList.remove('err');
  const btn = document.getElementById('btn-add-escola');
  btn.disabled = true; btn.innerHTML = `<div class="spinner"></div> Adicionando...`;
  const { error } = await sb.from('escolas').insert([{ nome: n }]);
  btn.disabled = false; btn.innerHTML = IC.plus + ' Adicionar';
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  S.escolas.push(n); S.escolas.sort((a, b) => a.localeCompare(b));
  inp.value = '';
  toast('Escola adicionada!', 'ok');
  renderEscolas();
}

// ── USUÁRIOS ──
function renderUsuarios() {
  const totalUsr    = S.usuarios.length;
  const totalAdmin  = S.usuarios.filter(u => u.role === 'admin').length;
  const totalEscola = S.usuarios.filter(u => u.role !== 'admin' && u.escola).length;
  const totalSec    = S.usuarios.filter(u => u.role !== 'admin' && !u.escola).length;
  document.getElementById('scr-usuarios').innerHTML = `
  <div class="page-hd"><h2 class="serif">Gerenciar usuários</h2><p>Crie e gerencie acessos ao sistema</p></div>
  <div class="stats-row" style="margin-bottom:22px;">
    <div class="stat c-azure"><div class="stat-ico">${IC.users}</div><div class="stat-v">${totalUsr}</div><div class="stat-l">Total de usuários</div></div>
    <div class="stat c-violet"><div class="stat-ico">${IC.lock}</div><div class="stat-v">${totalAdmin}</div><div class="stat-l">Administradores</div></div>
    <div class="stat c-emerald"><div class="stat-ico">${IC.school}</div><div class="stat-v">${totalEscola}</div><div class="stat-l">Vinculados a escola</div></div>
    <div class="stat c-sky"><div class="stat-ico">${IC.db}</div><div class="stat-v">${totalSec}</div><div class="stat-l">Acesso secretaria</div></div>
  </div>
  <div class="card">
    <div class="card-hd">${IC.plus} Novo usuário</div>
    <div class="fgrid">
      <div><label class="flabel" for="u-nome">Nome completo</label><input class="finput" id="u-nome" placeholder="Ex: João da Silva" /></div>
      <div><label class="flabel" for="u-login">Login</label><input class="finput" id="u-login" placeholder="joao.silva" autocomplete="off" /></div>
      <div>
        <label class="flabel" for="u-senha">Senha</label>
        <div class="pw-wrap">
          <input class="finput" id="u-senha" type="password" placeholder="Mínimo 4 caracteres" autocomplete="new-password" />
          <button class="pw-toggle" type="button" onclick="togglePw('u-senha',this)" tabindex="-1">${IC.eye}</button>
        </div>
      </div>
      <div><label class="flabel" for="u-role">Perfil</label><select class="fsel" id="u-role" onchange="toggleEscolaField()"><option value="user">Usuário</option><option value="admin">Administrador</option></select></div>
    </div>
    <div id="u-escola-wrap" class="fgrid" style="margin-top:-4px;">
      <div>
        <label class="flabel" for="u-escola">Escola vinculada</label>
        <select class="fsel" id="u-escola">
          <option value="">— Secretaria (acesso a todas as escolas) —</option>
          ${S.escolas.map(e => `<option value="${escHtml(e)}">${escHtml(e)}</option>`).join('')}
        </select>
        <div style="font-size:11px;color:var(--muted2);margin-top:5px;">Deixe em branco para acesso total (secretaria) · Selecione uma escola para restringir o acesso.</div>
      </div>
    </div>
    <button class="btn btn-primary" id="btn-add-usr" style="margin-top:14px;" onclick="addUsuario()">${IC.plus} Adicionar</button>
  </div>
  <div class="card">
    <div class="card-hd">${IC.users} Usuários cadastrados
      <span style="margin-left:auto;font-size:11px;color:var(--muted2);font-weight:400;">${S.usuarios.length} usuário${S.usuarios.length !== 1 ? 's' : ''}</span>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Acesso</th><th></th></tr></thead>
      <tbody>${S.usuarios.map(u => `<tr>
        <td class="td-b">${escHtml(u.nome)}</td>
        <td>${escHtml(u.login)}</td>
        <td><span class="badge ${u.role === 'admin' ? 'b-admin' : 'b-user'}">${u.role === 'admin' ? 'Admin' : 'Usuário'}</span></td>
        <td>${u.role === 'admin' ? `<span class="badge b-secretaria">Todas as escolas</span>` : u.escola ? `<span class="badge b-escola" title="${escHtml(u.escola)}">${escHtml(u.escola)}</span>` : `<span class="badge b-secretaria">Secretaria — todas</span>`}</td>
        <td>${u.login !== 'admin' ? `<button class="btn btn-sm btn-danger" onclick="confirmarDelUsuario('${escHtml(u.login)}')" title="Excluir usuário">${IC.trash}</button>` : `<span style="font-size:11px;color:var(--muted2)">protegido</span>`}</td>
      </tr>`).join('')}
      </tbody>
    </table></div>
  </div>`;
  toggleEscolaField();
}
function toggleEscolaField() {
  const role = document.getElementById('u-role')?.value;
  const wrap = document.getElementById('u-escola-wrap');
  if (!wrap) return;
  wrap.style.display = role === 'admin' ? 'none' : 'grid';
}
function confirmarDelUsuario(login) {
  const u = S.usuarios.find(x => x.login === login);
  if (!u) return;
  openConfirmModal('Excluir usuário?', `Tem certeza que deseja excluir <strong>${escHtml(u.nome)}</strong> (${escHtml(login)})?`, null, () => delUsuario(login));
}
async function delUsuario(login) {
  const btn = document.getElementById('cm-confirm-btn');
  btn.disabled = true; btn.innerHTML = `<div class="spinner"></div> Excluindo...`;
  const { error } = await sb.from('usuarios').delete().eq('login', login);
  btn.disabled = false; btn.textContent = 'Excluir';
  closeConfirmModal();
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  S.usuarios = S.usuarios.filter(u => u.login !== login);
  toast('Usuário excluído.', 'ok'); renderUsuarios();
}
async function addUsuario() {
  const n = document.getElementById('u-nome').value.trim();
  const l = document.getElementById('u-login').value.trim().toLowerCase();
  const s = document.getElementById('u-senha').value;
  const r = document.getElementById('u-role').value;
  const e = r === 'admin' ? null : (document.getElementById('u-escola')?.value || null);
  const erros = [];
  if (!n) erros.push('Nome');
  if (!l) erros.push('Login');
  if (s.length < 4) erros.push('Senha (mínimo 4 caracteres)');
  if (erros.length) { toast('Preencha: ' + erros.join(', ') + '.', 'err'); return; }
  if (S.usuarios.find(u => u.login === l)) { toast('Login já em uso.', 'err'); return; }
  if (!/^[a-z0-9._-]+$/.test(l)) { toast('Login deve conter apenas letras, números, ponto, _ ou -.', 'err'); return; }
  const btn = document.getElementById('btn-add-usr');
  btn.disabled = true; btn.innerHTML = `<div class="spinner"></div> Adicionando...`;
  const payload = { nome: n, login: l, senha: s, role: r, escola: e || null };
  const { data, error } = await sb.from('usuarios').insert([payload]).select('id,nome,login,role,escola').single();
  btn.disabled = false; btn.innerHTML = IC.plus + ' Adicionar';
  if (error) { toast('Erro: ' + error.message, 'err'); return; }
  S.usuarios.push(data);
  ['u-nome','u-login','u-senha'].forEach(id => document.getElementById(id).value = '');
  if (document.getElementById('u-escola')) document.getElementById('u-escola').value = '';
  document.getElementById('u-role').value = 'user';
  toggleEscolaField();
  toast(`Usuário "${n}" adicionado${e ? ` (escola: ${e})` : ' (acesso à secretaria)'}!`, 'ok');
  renderUsuarios();
}

// ── ANALYTICS ──
function renderAnalytics() {
  const sub = 'Proficiência média ponderada por nº de alunos';
  const escsDisp = scopeEscolas();
  const escoAlerta = userEscola() && S.user.role !== 'admin'
    ? `<div class="scope-alert">${IC.lock}<span>Análise restrita à escola <strong>${escHtml(userEscola())}</strong>.</span></div>`
    : '';
  document.getElementById('scr-analytics').innerHTML = `
  <div class="page-hd"><h2 class="serif">Análise comparativa</h2><p>Proficiência por nível socioeconômico, cor/raça e sexo — comparando 2024 e 2025.</p></div>
  ${escoAlerta}
  <div class="card" style="padding:14px 22px;margin-bottom:22px;">
    <div class="filter-bar">
      <div class="filter-bar-item">
        <label for="a-escola">Escola</label>
        <select class="frow-sel" id="a-escola" onchange="updateAllCharts()" ${escsDisp.length === 1 ? 'disabled' : ''}>
          ${escsDisp.length === 1
            ? `<option value="${escHtml(escsDisp[0])}">${escHtml(escsDisp[0])}</option>`
            : `<option value="">Todas as escolas</option>${escsDisp.map(e => `<option>${escHtml(e)}</option>`).join('')}`
          }
        </select>
      </div>
      <div class="filter-bar-item">
        <label for="a-serie">Série</label>
        <select class="frow-sel" id="a-serie" onchange="updateAllCharts()">
          <option value="">Todas as séries</option>${SERIES.map(s => `<option>${s}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar-item">
        <label for="a-componente">Componente</label>
        <select class="frow-sel" id="a-componente" onchange="updateAllCharts()">
          <option value="">Todos</option>${COMPONENTES.map(c => `<option>${c}</option>`).join('')}
        </select>
      </div>
      <div class="filter-bar-item">
        <label for="a-ano">Ano</label>
        <select class="frow-sel" id="a-ano" onchange="updateAllCharts()">
          <option value="">2024 e 2025</option>${ANOS.map(a => `<option>${a}</option>`).join('')}
        </select>
      </div>
      <div style="margin-left:auto;display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
        <div class="ch-leg-item"><div class="ch-leg-swatch" style="background:#c17b3f;"></div>2024</div>
        <div class="ch-leg-item"><div class="ch-leg-swatch" style="background:#3a7a5c;"></div>2025</div>
        <button id="btn-export-pdf" class="btn btn-ghost btn-sm" onclick="exportPDF()" style="display:flex;align-items:center;gap:6px;margin-left:4px;">${IC.pdf} Exportar PDF</button>
      </div>
    </div>
  </div>
  <div class="print-header">
    <h1>EduMetrics — Análise Comparativa</h1>
    <p id="print-subtitle">Proficiência por nível socioeconômico, cor/raça e sexo — 2024 vs 2025</p>
  </div>
  <div class="charts-grid">
    ${[
      {campo:'socio', id:'ch-socio', mets:'mets-socio', label:'Nível socioeconômico'},
      {campo:'raca',  id:'ch-raca',  mets:'mets-raca',  label:'Cor / raça'},
      {campo:'sexo',  id:'ch-sexo',  mets:'mets-sexo',  label:'Sexo'},
    ].map(c => `
    <div class="chart-card">
      <div class="chart-card-header"><div class="chart-card-title">${IC.chart} ${c.label}</div><div class="chart-card-sub">${sub}</div></div>
      <div id="${c.mets}" class="mets"></div>
      <div class="chart-wrap"><canvas id="${c.id}"></canvas></div>
    </div>`).join('')}
  </div>`;
  if (escsDisp.length === 1) { updateAllCharts(escsDisp[0]); } else { updateAllCharts(); }
}

function updateAllCharts(forceEscola) {
  const escola     = forceEscola !== undefined ? forceEscola : (document.getElementById('a-escola')?.value || '');
  const serie      = document.getElementById('a-serie')?.value      || '';
  const componente = document.getElementById('a-componente')?.value || '';
  const ano        = document.getElementById('a-ano')?.value        || '';
  [
    { campo: 'socio', chartId: 'ch-socio', metsId: 'mets-socio' },
    { campo: 'raca',  chartId: 'ch-raca',  metsId: 'mets-raca'  },
    { campo: 'sexo',  chartId: 'ch-sexo',  metsId: 'mets-sexo'  },
  ].forEach(({ campo, chartId, metsId }) => {
    const { cats, ant, atu } = calcMedia(campo, escola, serie, ano, componente);
    const mel = document.getElementById(metsId);
    if (mel) {
      mel.innerHTML = cats.length
        ? cats.map((cat, i) => {
            const va = ant[i], vb = atu[i];
            const d  = va != null && vb != null ? (vb - va).toFixed(1) : null;
            return `<div class="met">
              <div class="met-v">${vb != null ? vb.toFixed(1) : '—'}</div>
              <div class="met-l">${escHtml(cat)}</div>
              ${d !== null ? `<div class="met-d ${parseFloat(d) > 0 ? 'up' : parseFloat(d) < 0 ? 'dn' : 'eq'}">${parseFloat(d) > 0 ? '▲ +' : '▼ '}${d}</div>` : ''}
            </div>`;
          }).join('')
        : '<div class="empty" style="grid-column:1/-1"><p>Sem dados para os filtros selecionados.</p></div>';
    }
    mkChart(chartId, cats, ant, atu);
  });
}

function exportPDF() {
  const escola     = document.getElementById('a-escola')?.value     || '';
  const serie      = document.getElementById('a-serie')?.value      || '';
  const componente = document.getElementById('a-componente')?.value || '';
  const ano        = document.getElementById('a-ano')?.value        || '';
  const parts  = [];
  if (escola)     parts.push('Escola: ' + escola);
  if (serie)      parts.push('Série: ' + serie);
  if (componente) parts.push('Componente: ' + componente);
  if (ano)        parts.push('Ano: ' + ano);
  const sub = document.getElementById('print-subtitle');
  if (sub) sub.textContent = 'Proficiência por nível socioeconômico, cor/raça e sexo' + (parts.length ? ' — ' + parts.join(' · ') : ' — 2024 vs 2025');
  window.print();
}

function openConfirmModal(title, desc, warn, onConfirm) {
  document.getElementById('cm-title').textContent = title;
  document.getElementById('cm-desc').innerHTML    = desc;
  const wEl = document.getElementById('cm-warn');
  if (warn) { wEl.textContent = warn; wEl.classList.add('show'); }
  else       { wEl.classList.remove('show'); }
  const btn = document.getElementById('cm-confirm-btn');
  btn.textContent = 'Excluir';
  btn.onclick = onConfirm;
  document.getElementById('confirm-modal-bg').classList.add('show');
}
function closeConfirmModal() {
  document.getElementById('confirm-modal-bg').classList.remove('show');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeConfirmModal(); });
document.getElementById('confirm-modal-bg').addEventListener('click', e => {
  if (e.target === document.getElementById('confirm-modal-bg')) closeConfirmModal();
});

async function renderLandingData() {
  try {
    const [{ data: esc }, { data: reg }] = await Promise.all([
      sb.from('escolas').select('nome'),
      sb.from('registros').select('prof,alunos,alunos_previstos,alunos_avaliados,escola,ano,serie'),
    ]);
    const escolas   = esc || [];
    const registros = (reg || []).map(r => ({
      ...r,
      alunos_previstos: parseInt(r.alunos_previstos) || 0,
      alunos_avaliados: parseInt(r.alunos_avaliados) || 0,
    }));

    const gruposPrev = new Map();
    const gruposAval = new Map();
    registros.forEach(r => {
      const key = `${r.escola}||${r.ano}||${r.serie}`;
      if (!gruposPrev.has(key)) { gruposPrev.set(key, r.alunos_previstos); gruposAval.set(key, r.alunos_avaliados); }
    });
    const totalPrevistos = Array.from(gruposPrev.values()).reduce((s, v) => s + v, 0);
    const totalAvaliados = Array.from(gruposAval.values()).reduce((s, v) => s + v, 0);

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('ls-escolas', escolas.length);
    set('ls-alunos',  totalPrevistos.toLocaleString('pt-BR'));
    set('ls-regs',    registros.length);
    set('lm-alunos',  totalAvaliados.toLocaleString('pt-BR'));
    const tot = registros.reduce((s, r) => s + parseInt(r.alunos), 0);
    const mp  = tot ? registros.reduce((s, r) => s + parseFloat(r.prof) * parseInt(r.alunos), 0) / tot : null;
    set('ls-prof', mp ? mp.toFixed(0) : '—');
    const ta = document.getElementById('trust-txt');
    if (ta) ta.innerHTML = `Dados de <strong>${escolas.length} escola${escolas.length !== 1 ? 's' : ''}</strong> disponíve${escolas.length !== 1 ? 'is' : 'l'}`;
    const av = document.getElementById('trust-ava');
    if (av) {
      const initials = ['JA','DP','AT'];
      const colors   = ['background:#fdf0e0;color:var(--accent)','background:#e8f5ee;color:var(--green)','background:#e6eefa;color:var(--sky)'];
      av.innerHTML   = escolas.slice(0, 3).map((_, i) => `<span style="${colors[i]}">${initials[i] || '?'}</span>`).join('');
    }
    const prog = document.getElementById('ls-prog');
    if (prog) {
      const top3 = escolas.slice(0, 3);
      const vals = top3.map(e => {
        const sub = registros.filter(r => r.escola === e.nome);
        const t2  = sub.reduce((s, r) => s + parseInt(r.alunos), 0);
        return t2 ? sub.reduce((s, r) => s + parseFloat(r.prof) * parseInt(r.alunos), 0) / t2 : 0;
      });
      const maxV = Math.max(...vals, 1);
      const colors2 = ['var(--accent)','var(--green2)','var(--sky2)'];
      prog.innerHTML = top3.map((e, i) => `
        <div class="land-prog-row"><span title="${escHtml(e.nome)}">${escHtml(e.nome)}</span><strong>${vals[i].toFixed(0) || '—'}</strong></div>
        <div class="land-pbar" ${i === top3.length - 1 ? 'style="margin-bottom:0"' : ''}>
          <div class="land-pbar-fill" style="width:${Math.round(vals[i] / maxV * 100)}%;background:${colors2[i]}"></div>
        </div>
      `).join('');
    }
  } catch (e) { console.warn('Erro ao carregar landing data:', e); }
}

renderLandingData();
