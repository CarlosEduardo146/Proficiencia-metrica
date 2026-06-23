// ══════════════════════════════════════════
//  Supabase
// ══════════════════════════════════════════
const SUPABASE_URL = 'https://zchglmnohvvpdydmmptl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjaGdsbW5vaHZ2cGR5ZG1tcHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjU2NDIsImV4cCI6MjA5NjAwMTY0Mn0.QhzwCQAhFHtMEe4VXlFGZlAD4auBqGAtxzxb673r8jA';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const NIVEL_ORDER = ['Baixo','Médio-baixo','Médio-alto','Alto'];
const RACAS       = ['Branca','Preta','Parda','Amarela','Indígena'];
const SEXOS       = ['Feminino','Masculino'];
const ANOS        = ['2024','2025'];
const SERIES      = ['2º ano','5º ano','9º ano'];
const COMPONENTES = ['Português','Matemática'];

let S = { user:null, charts:{}, escolas:[], registros:[], usuarios:[] };
function userEscola(){ return S.user?.escola || null; }
function scopeRegistros(regs){ const esc=userEscola(); if(!esc) return regs; return regs.filter(r=>r.escola===esc); }
function scopeEscolas(){ const esc=userEscola(); if(!esc) return S.escolas; return S.escolas.filter(e=>e===esc); }
function normComp(v){ if(v===null||v===undefined) return ''; return String(v).trim(); }

const NAV_ADMIN = [
  {id:'home',label:'Visão geral',icon:'home'},
  {id:'consulta',label:'Consulta',icon:'search'},
  {section:'Gerenciar'},
  {id:'dados',label:'Inserir dados',icon:'db'},
  {id:'escolas',label:'Escolas',icon:'school'},
  {id:'usuarios',label:'Usuários',icon:'users'},
  {section:'Análise'},
  {id:'analytics',label:'Gráficos',icon:'chart'}
];
const NAV_USER = [
  {id:'home',label:'Visão geral',icon:'home'},
  {id:'consulta',label:'Consulta',icon:'search'},
  {section:'Análise'},
  {id:'analytics',label:'Gráficos',icon:'chart'}
];

const IC = {
  home:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  db:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  school: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  users:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  chart:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  plus:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  check:  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  ar:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  al:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  warn:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  eye:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  lock:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  pdf:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  ppt:    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  info:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  target: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  clip:   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
};

// ── Utils ──
function showLoading(msg='Carregando...'){ document.getElementById('load-txt').textContent=msg; document.getElementById('loading-overlay').classList.add('show'); }
function hideLoading(){ document.getElementById('loading-overlay').classList.remove('show'); }

function toast(msg, type='ok'){
  const container = document.getElementById('toast-container');
  const t = document.createElement('div');
  const ico = type==='ok'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  t.className = `toast toast-${type}`;
  t.innerHTML = `<div class="toast-ico">${ico}</div><div class="toast-msg">${msg}</div>`;
  container.appendChild(t);
  const remove = () => { t.classList.add('out'); setTimeout(()=>t.remove(), 300); };
  const timer = setTimeout(remove, 3500);
  t.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

function togglePw(inputId, btn){
  const input = document.getElementById(inputId); if(!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.innerHTML = show ? IC.eyeOff : IC.eye;
}

function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ── Data loading ──
async function loadAll(){
  const escFiltro = userEscola();
  async function fetchAllRegistros(){
    const PAGE=1000; let all=[]; let from=0;
    while(true){
      let q = sb.from('registros').select('*').order('created_at',{ascending:false}).range(from,from+PAGE-1);
      if(escFiltro) q = q.eq('escola',escFiltro);
      const {data,error} = await q;
      if(error) throw new Error(error.message);
      if(!data||data.length===0) break;
      all = all.concat(data);
      if(data.length<PAGE) break;
      from += PAGE;
    }
    return all;
  }
  const [{data:esc,error:e1},{data:usr,error:e3},reg] = await Promise.all([
    sb.from('escolas').select('nome').order('nome'),
    sb.from('usuarios').select('id,nome,login,role,escola,senha'),
    fetchAllRegistros(),
  ]);
  if(e1||e3) throw new Error((e1||e3).message);
  S.escolas   = (esc||[]).map(e=>e.nome);
  S.registros = reg.map(r=>({
    id:r.id, escola:r.escola, ano:r.ano, serie:r.serie,
    componente:normComp(r.componente),
    socio:r.socio, raca:r.raca, sexo:r.sexo,
    prof:parseFloat(r.prof), alunos:parseInt(r.alunos),
    alunos_previstos:parseInt(r.alunos_previstos)||0,
    alunos_avaliados:parseInt(r.alunos_avaliados)||0
  }));
  S.usuarios = usr||[];
}

// ── Auth / Navigation ──
function showLogin(){
  document.getElementById('login-modal-bg').classList.add('show');
  setTimeout(()=>{ const el=document.getElementById('l-user'); if(el) el.focus(); }, 150);
}

function backToLanding(){
  document.getElementById('login-modal-bg').classList.remove('show');
  const u=document.getElementById('l-user'), p=document.getElementById('l-pass');
  if(u) u.value='';
  if(p) p.value='';
  document.getElementById('login-error').classList.remove('show');
}

// Close modal when clicking backdrop
document.getElementById('login-modal-bg').addEventListener('click', function(e){
  if(e.target === this) backToLanding();
});

async function doLogin(){
  const uEl = document.getElementById('l-user');
  const pEl = document.getElementById('l-pass');
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('login-error');
  const errMsg = document.getElementById('login-error-msg');

  const u = uEl.value.trim();
  const p = pEl.value;

  err.classList.remove('show');
  if(!u||!p){ errMsg.textContent='Preencha login e senha.'; err.classList.add('show'); return; }
  btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Verificando...`;
  try{
    const {data,error} = await sb.from('usuarios').select('*').eq('login',u).eq('senha',p).single();
    if(error||!data){ errMsg.textContent='Login ou senha incorretos.'; err.classList.add('show'); }
    else { S.user=data; await initApp(); }
  } catch(e){ errMsg.textContent='Erro de conexão.'; err.classList.add('show'); }
  finally { btn.disabled=false; btn.innerHTML='Entrar →'; }
}

function doLogout(){
  Object.values(S.charts).forEach(c=>{ try{c.destroy();}catch(_){} });
  S = {user:null,charts:{},escolas:[],registros:[],usuarios:[]};
  document.getElementById('app-screen').classList.remove('show');
  document.getElementById('app-screen').style.display='none';
  document.getElementById('login-modal-bg').classList.remove('show');
  document.getElementById('landing-screen').style.display='flex';
  renderLandingData();
}

async function initApp(){
  showLoading('Carregando dados...');
  try{ await loadAll(); } catch(e){ hideLoading(); toast('Erro ao carregar: '+e.message,'err'); return; }
  hideLoading();
  document.getElementById('login-modal-bg').classList.remove('show');
  document.getElementById('landing-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';

  const u = S.user;
  document.getElementById('user-av').textContent = u.nome[0].toUpperCase();
  document.getElementById('user-nm').textContent = u.nome;
  document.getElementById('user-rl').textContent = u.role==='admin'
    ? 'Administrador'
    : u.escola ? `Usuário — ${u.escola}` : 'Usuário — Secretaria';
  const rc = document.getElementById('role-chip');
  rc.textContent = u.role==='admin' ? 'Admin' : u.role==='guest' ? 'Visitante' : 'Usuário';
  rc.className   = 'chip chip-'+(u.role==='admin'?'admin':u.role==='guest'?'guest':'user');

  const banner = document.getElementById('scope-banner');
  if(u.escola && u.role!=='admin'){
    document.getElementById('scope-banner-txt').textContent=`Acesso restrito à escola: ${u.escola}`;
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
  }
  buildNav(); navigate('home');
}

function buildNav(){
  const nav = S.user.role==='admin' ? NAV_ADMIN : NAV_USER;
  document.getElementById('sb-nav').innerHTML = nav.map(item=>{
    if(item.section) return `<div class="nav-sect">${item.section}</div>`;
    return `<button class="nav-btn" id="nav-${item.id}" onclick="navigate('${item.id}')">${IC[item.icon]||''}${item.label}</button>`;
  }).join('');
}

const TITLES = {home:'Visão geral',consulta:'Consulta',dados:'Inserir dados',escolas:'Gerenciar escolas',usuarios:'Gerenciar usuários',analytics:'Análise comparativa'};

function navigate(id){
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nb = document.getElementById('nav-'+id); if(nb) nb.classList.add('active');
  document.getElementById('tb-title').textContent = TITLES[id]||id;
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('scr-'+id).classList.add('active');
  closeSidebar();
  const fn = {home:renderHome,consulta:renderConsulta,dados:renderDados,escolas:renderEscolas,usuarios:renderUsuarios,analytics:renderAnalytics};
  if(fn[id]) fn[id]();
}

function openSidebar(){ document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').classList.add('show'); }
function closeSidebar(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

// ── Math helpers ──
function mediaP(regs){ if(!regs.length) return null; const tot=regs.reduce((s,r)=>s+r.alunos,0); return tot?regs.reduce((s,r)=>s+r.prof*r.alunos,0)/tot:null; }
function totalAlunosAvaliados(regs){ const g=new Map(); regs.forEach(r=>{const k=`${r.escola}||${r.ano}||${r.serie}`; if(!g.has(k)) g.set(k,r.alunos_avaliados||0);}); return Array.from(g.values()).reduce((s,v)=>s+v,0); }
function totalAlunosPrevistos(regs){ const g=new Map(); regs.forEach(r=>{const k=`${r.escola}||${r.ano}||${r.serie}`; if(!g.has(k)) g.set(k,r.alunos_previstos||0);}); return Array.from(g.values()).reduce((s,v)=>s+v,0); }
function diffTag(d){ if(d===null) return ''; const v=parseFloat(d); return `<div class="stat-d ${v>0?'up':v<0?'dn':'eq'}">${v>0?'▲ +':'▼ '}${d}</div>`; }

function calcMedia(campo, escolaSel, serieSel, anoSel, componenteSel){
  const cats = campo==='socio'?NIVEL_ORDER:campo==='raca'?RACAS:SEXOS;
  const anos = anoSel ? [anoSel] : ANOS;
  const regsScope = scopeRegistros(S.registros);
  const compNorm  = normComp(componenteSel);
  const fil = r => (!escolaSel||r.escola===escolaSel) && (!serieSel||r.serie===serieSel) && (!compNorm||normComp(r.componente)===compNorm);
  const d={}, alunosD={};
  anos.forEach(a=>{
    d[a]      = cats.map(cat=>{ const sub=regsScope.filter(r=>fil(r)&&r[campo]===cat&&r.ano===a); return mediaP(sub); });
    alunosD[a]= cats.map(cat=>{ const sub=regsScope.filter(r=>fil(r)&&r[campo]===cat&&r.ano===a); return sub.reduce((s,r)=>s+r.alunos,0); });
  });
  const idx = cats.map((_,i)=>i);
  return {
    cats,
    ant:      ANOS[0] ? idx.map(i=>d[ANOS[0]]?.[i]??null) : idx.map(()=>null),
    atu:      ANOS[1] ? idx.map(i=>d[ANOS[1]]?.[i]??null) : idx.map(()=>null),
    alunosAnt:ANOS[0] ? idx.map(i=>alunosD[ANOS[0]]?.[i]??0) : idx.map(()=>0),
    alunosAtu:ANOS[1] ? idx.map(i=>alunosD[ANOS[1]]?.[i]??0) : idx.map(()=>0),
  };
}

// ── Chart ──
if(window.Chart && window.ChartDataLabels){ Chart.register(ChartDataLabels); }
const CHART_CFG = {
  responsive:true, maintainAspectRatio:false,
  plugins:{
    legend:{display:true,position:'top',align:'start',labels:{usePointStyle:true,pointStyle:'rectRounded',boxWidth:10,boxHeight:10,padding:14,color:'#7a7265',font:{family:"'Syne',sans-serif",size:10,weight:'600'}}},
    tooltip:{backgroundColor:'#1a1612',titleColor:'#faf8f4',bodyColor:'#a09485',padding:11,cornerRadius:8,
      titleFont:{family:"'Syne',sans-serif",size:10,weight:'700'},bodyFont:{family:"'DM Sans',sans-serif",size:12},
      callbacks:{label:c=>{ const v=c.parsed.y; const d=(v!==null&&v!==undefined&&v!==0)?v.toFixed(1):'—'; return `  ${c.dataset.label}: ${d}`; }}},
      datalabels:{
        anchor:'end',
        align:'top',
        offset:2,
        color: ctx => ctx.dataset.borderColor,
        font:{family:"'Syne',sans-serif", size:10, weight:'700'},
        formatter: v => (v && v>0) ? v.toFixed(1) : ''
      }
    },
    scales:{
      y:{beginAtZero:true, grace:'12%', grid:{color:'rgba(26,22,18,.05)',drawBorder:false},border:{display:false},ticks:{color:'#a09485',font:{family:"'Syne',sans-serif",size:10},maxTicksLimit:5}},
      x:{grid:{display:false},border:{display:false},ticks:{color:'#7a7265',font:{family:"'DM Sans',sans-serif",size:11},autoSkip:false,maxRotation:30}}
    },
    layout:{padding:{top:4,bottom:0}},
    animation:{duration:500,easing:'easeOutQuart'}
  };
  
function mkChart(id, cats, ant, atu){
  if(S.charts[id]){ S.charts[id].destroy(); delete S.charts[id]; }
  const ctx = document.getElementById(id); if(!ctx) return;
  const hasData = cats.length > 0;
  const toBar = v => v!==null ? v : 0;
  S.charts[id] = new Chart(ctx, {
    type:'bar',
    data:{
      labels: hasData ? cats : ['(sem dados)'],
      datasets:[
        {label:'2024', data:hasData?ant.map(toBar):[0], backgroundColor:'rgba(193,123,63,.18)', borderColor:'#c17b3f', borderWidth:2, borderRadius:6, borderSkipped:false},
        {label:'2025', data:hasData?atu.map(toBar):[0], backgroundColor:'rgba(58,122,92,.22)',  borderColor:'#3a7a5c', borderWidth:2, borderRadius:6, borderSkipped:false}
      ]
    },
    options: CHART_CFG
  });
}

function renderStudentSummary(containerId, cats, alunosAnt, alunosAtu){
  const el = document.getElementById(containerId); if(!el) return;
  const totalAnt=alunosAnt.reduce((s,v)=>s+v,0), totalAtu=alunosAtu.reduce((s,v)=>s+v,0);
  if(totalAnt===0&&totalAtu===0){ el.innerHTML='<span style="font-size:11px;color:var(--muted2);">Sem dados de estudantes para os filtros selecionados.</span>'; return; }
  const c24='#c17b3f', c25='#3a7a5c';
  el.innerHTML = cats.map((cat,i)=>{
    const a=alunosAnt[i]||0, b=alunosAtu[i]||0;
    const pA=totalAnt>0?Math.round(a/totalAnt*100):0, pB=totalAtu>0?Math.round(b/totalAtu*100):0;
    const partes=[];
    if(a>0) partes.push(`<span style="color:${c24};font-weight:700;">${a.toLocaleString('pt-BR')}</span><span style="color:var(--muted2);font-size:10px;"> (${pA}%) 2024</span>`);
    if(b>0) partes.push(`<span style="color:${c25};font-weight:700;">${b.toLocaleString('pt-BR')}</span><span style="color:var(--muted2);font-size:10px;"> (${pB}%) 2025</span>`);
    if(!partes.length) return '';
    return `<div class="chart-stu-item"><div class="chart-stu-name" style="margin-right:4px;">${escHtml(cat)}:</div>${partes.join('<span style="color:var(--cream3);margin:0 4px;">·</span>')}</div>`;
  }).filter(Boolean).join('');
}

// ── Screens ──
function renderHome(){
  const regsScope = scopeRegistros(S.registros);
  const r24=regsScope.filter(r=>r.ano==='2024'), r25=regsScope.filter(r=>r.ano==='2025');
  const ma=mediaP(r24), mb=mediaP(r25);
  const diff = ma&&mb ? (mb-ma).toFixed(1) : null;
  const totalAvaliados = totalAlunosAvaliados(regsScope);
  const escsVis = scopeEscolas();
  const escs = escsVis.map(e=>{
    const ea=regsScope.filter(r=>r.escola===e&&r.ano==='2024'), eb=regsScope.filter(r=>r.escola===e&&r.ano==='2025');
    const pa=mediaP(ea), pb=mediaP(eb), d=pa&&pb?pb-pa:null;
    const tot=totalAlunosAvaliados(regsScope.filter(r=>r.escola===e));
    return {nome:e,pa,pb,d,tot};
  }).sort((a,b)=>(b.pb||0)-(a.pb||0));
  const maxP = Math.max(...escs.map(e=>e.pb||0), 1);
  const alerta = userEscola()&&S.user.role!=='admin' ? `<div class="scope-alert">${IC.lock}<span>Exibindo dados de <strong>${escHtml(userEscola())}</strong>.</span></div>` : '';
  document.getElementById('scr-home').innerHTML = `
    ${alerta}
    <div class="hero-wrap">
      <h2>Olá, ${escHtml(S.user.nome.split(' ')[0])}. <em>Bem-vindo.</em></h2>
      <p>Acompanhe a proficiência dos estudantes por escola, segmentando por nível socioeconômico, cor/raça e sexo.</p>
      <div class="hero-btns">
        ${S.user.role==='admin'?`<button class="btn hero-btn-p" onclick="navigate('dados')">${IC.plus} Inserir dados</button>`:''}
        <button class="btn hero-btn-g" onclick="navigate('consulta')">${IC.search} Consultar dados</button>
        <button class="btn hero-btn-g" onclick="navigate('analytics')">${IC.chart} Ver gráficos</button>
      </div>
    </div>
    <div class="card">
      <div class="card-hd">${IC.school} ${escsVis.length===1?'Dados da escola — 2025':'Ranking de escolas — 2025'}</div>
      ${escs.length ? escs.map((e,i)=>`
        <div class="rank-row">
          <div class="rank-n" style="${i===0?'background:#fdf0e0;color:var(--accent);':i===1?'background:#e8f5ee;color:var(--green);':i===2?'background:#e6eefa;color:var(--sky);':''}">${i+1}</div>
          <div class="rank-nm" title="${escHtml(e.nome)}">${escHtml(e.nome)}</div>
          <div style="font-size:11px;color:var(--muted2);width:70px;text-align:right;flex-shrink:0">${e.tot.toLocaleString('pt-BR')} aval.</div>
          <div class="pbar-wrap">
            <div class="pbar-bg"><div class="pbar-fill" style="width:${Math.round((e.pb||0)/maxP*100)}%;background:${i===0?'var(--accent)':i===1?'var(--green2)':'var(--sky2)'}"></div></div>
            <div style="font-size:11px;color:var(--muted);margin-top:3px;text-align:right">${e.pb?e.pb.toFixed(1):'—'}</div>
          </div>
          ${e.d!==null?`<div class="stat-d ${e.d>0?'up':e.d<0?'dn':'eq'}" style="width:52px;text-align:right;flex-shrink:0;font-size:11px">${e.d>0?'▲ +':'▼ '}${e.d.toFixed(1)}</div>`:'<div style="width:52px"></div>'}
        </div>`).join('') : '<div class="empty"><div class="empty-ico">📊</div><p>Nenhum dado disponível</p></div>'}
    </div>`;
}

function renderConsulta(){
  const escs = scopeEscolas();
  document.getElementById('scr-consulta').innerHTML = `
    <div class="page-hd"><h2>Consulta de registros</h2><p>Localize registros por escola, ano, série, componente e dimensões.</p></div>
    <div class="query-panel">
      <div class="query-panel-hd">${IC.search} Consulta de dados</div>
      <div class="query-row">
        <div class="query-field"><label>Escola</label><select class="query-input" id="q-escola"><option value="">Todas</option>${escs.map(e=>`<option>${escHtml(e)}</option>`).join('')}</select></div>
        <div class="query-field"><label>Série</label><select class="query-input" id="q-serie"><option value="">Todas</option>${SERIES.map(s=>`<option>${s}</option>`).join('')}</select></div>
        <div class="query-field"><label>Componente</label><select class="query-input" id="q-componente"><option value="">Todos</option>${COMPONENTES.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div class="query-field"><label>Ano</label><select class="query-input" id="q-ano"><option value="">Todos</option>${ANOS.map(a=>`<option>${a}</option>`).join('')}</select></div>
        <div class="query-field"><label>Dimensão</label><select class="query-input" id="q-dimensao"><option value="">Todas</option><option value="socio">Nível socioeconômico</option><option value="raca">Cor / raça</option><option value="sexo">Sexo</option></select></div>
        <div style="display:flex;gap:8px;align-items:flex-end;flex-shrink:0;">
          <button class="query-btn" onclick="runQuery()">${IC.search} Consultar</button>
          <button class="query-clear" onclick="clearQuery()">Limpar</button>
        </div>
      </div>
      <div class="query-result-bar" id="q-result-bar">${IC.check}<span id="q-result-txt"></span></div>
      <div class="query-table-wrap" id="q-table-wrap"></div>
    </div>`;
}

function buildDimTable(campo, cats){
  const rows = cats.map((cat,i)=>`
    <div class="dim-row">
      <span class="dim-row-label">${escHtml(cat)}</span>
      <input class="dim-input" type="number" min="0" max="1000" step="0.1" placeholder="—" id="${campo}-prof-${i}"/>
      <input class="dim-input" type="number" min="1" placeholder="—" id="${campo}-alunos-${i}"/>
    </div>`).join('');
  return `<div class="dim-table"><div class="dim-table-head"><span>Categoria</span><span>Profic. média</span><span>Avaliados</span></div>${rows}</div>`;
}

let fStep = 1;
function renderDados(){
  const escsDisp = scopeEscolas(), regsScope = scopeRegistros(S.registros);
  const totalRegistros=regsScope.length, totalPrevistos=totalAlunosPrevistos(regsScope), totalAvaliados=totalAlunosAvaliados(regsScope);
  const cobGeral = totalPrevistos>0 ? Math.round(totalAvaliados/totalPrevistos*100) : null;
  const cobCls   = cobGeral===null?'':cobGeral>=80?'c-emerald':cobGeral>=60?'c-amber':'c-violet';
  document.getElementById('scr-dados').innerHTML = `
    <div class="page-hd"><h2>Inserir proficiências</h2><p>Registre os indicadores por escola, dimensão e período</p></div>
    <div class="stats-row">
      <div class="stat c-azure"><div class="stat-ico">${IC.clip}</div><div class="stat-v">${totalRegistros.toLocaleString('pt-BR')}</div><div class="stat-l">Registros salvos</div></div>
      <div class="stat c-sky"><div class="stat-ico">${IC.users}</div><div class="stat-v">${totalPrevistos.toLocaleString('pt-BR')}</div><div class="stat-l">Alunos previstos</div></div>
      <div class="stat c-emerald"><div class="stat-ico">${IC.check}</div><div class="stat-v">${totalAvaliados.toLocaleString('pt-BR')}</div><div class="stat-l">Alunos avaliados</div></div>
      <div class="stat ${cobCls}"><div class="stat-ico">${IC.target}</div><div class="stat-v">${cobGeral!==null?cobGeral+'%':'—'}</div><div class="stat-l">Cobertura geral</div></div>
    </div>
    <div class="card">
      <div class="card-hd">${IC.plus} Novo registro</div>
      <div class="stepper" id="stepper">
        <div class="stp active">1. Escola, ano e turma</div>
        <div class="stp">2. Distribuição por dimensão</div>
      </div>
      <div id="fs1">
        <div class="fgrid">
          <div><label class="flabel">Escola</label><select class="fsel" id="f-escola"><option value="">Selecione...</option>${escsDisp.map(e=>`<option>${escHtml(e)}</option>`).join('')}</select></div>
          <div><label class="flabel">Ano</label><select class="fsel" id="f-ano"><option value="2024">2024</option><option value="2025">2025</option></select></div>
          <div><label class="flabel">Série</label><select class="fsel" id="f-serie-1"><option value="">Selecione...</option>${SERIES.map(s=>`<option>${s}</option>`).join('')}</select></div>
          <div><label class="flabel">Componente</label><select class="fsel" id="f-componente"><option value="">Selecione...</option>${COMPONENTES.map(c=>`<option>${c}</option>`).join('')}</select></div>
        </div>
        <div class="info-box">${IC.info}<span>Informe o total de estudantes da turma. Os campos das dimensões representam a distribuição dos avaliados.</span></div>
        <div class="fgrid">
          <div><label class="flabel">Estudantes previstos</label><input class="finput" type="number" id="f-previstos" min="1" placeholder="Total matriculados"/></div>
          <div><label class="flabel">Estudantes avaliados</label><input class="finput" type="number" id="f-avaliados" min="1" placeholder="Total avaliado"/></div>
        </div>
        <button class="btn btn-primary" onclick="fNext()">${IC.ar} Próximo</button>
      </div>
      <div id="fs2" style="display:none">
        <div class="dims-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
          <div><div class="flabel" style="margin-bottom:7px;">Nível socioeconômico</div>${buildDimTable('socio',NIVEL_ORDER)}</div>
          <div><div class="flabel" style="margin-bottom:7px;">Cor / raça</div>${buildDimTable('raca',RACAS)}</div>
          <div style="grid-column:1/-1;max-width:420px;"><div class="flabel" style="margin-bottom:7px;">Sexo</div>${buildDimTable('sexo',SEXOS)}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost" onclick="fBack()">${IC.al} Voltar</button>
          <button class="btn btn-success" id="btn-salvar" onclick="salvarReg()">${IC.check} Salvar registros</button>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-hd">${IC.db} Registros salvos
        <div class="card-hd-right">
          <select class="frow-sel" id="fil-reg" onchange="atualizarTabReg()">
            <option value="">Todas as escolas</option>${escsDisp.map(e=>`<option>${escHtml(e)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="tab-reg"></div>
    </div>`;
  fStep=1; atualizarTabReg();
}

function fNext(){
  const escola=document.getElementById('f-escola').value, serie=document.getElementById('f-serie-1').value;
  if(!escola){ toast('Selecione uma escola.','err'); return; }
  if(!serie){ document.getElementById('f-serie-1').classList.add('err'); toast('Selecione a série.','err'); return; }
  document.getElementById('f-serie-1').classList.remove('err');
  const componente=document.getElementById('f-componente').value;
  if(!componente){ document.getElementById('f-componente').classList.add('err'); toast('Selecione o componente.','err'); return; }
  document.getElementById('f-componente').classList.remove('err');
  fStep=2; setStepper(2); document.getElementById('fs1').style.display='none'; document.getElementById('fs2').style.display='block';
}
function fBack(){ fStep=1; setStepper(1); document.getElementById('fs1').style.display='block'; document.getElementById('fs2').style.display='none'; }
function setStepper(n){ document.querySelectorAll('#stepper .stp').forEach((s,i)=>{ s.classList.toggle('active',i===n-1); s.classList.toggle('done',i<n-1); }); }

async function salvarReg(){
  const escola=document.getElementById('f-escola').value, ano=document.getElementById('f-ano').value;
  const serie=document.getElementById('f-serie-1').value, componente=normComp(document.getElementById('f-componente').value);
  const previstos=parseInt(document.getElementById('f-previstos').value)||0, avaliados=parseInt(document.getElementById('f-avaliados').value)||0;
  if(!serie){ toast('Série não encontrada. Volte.','err'); return; }
  const regs=[];
  NIVEL_ORDER.forEach((cat,i)=>{ const prof=parseFloat(document.getElementById(`socio-prof-${i}`)?.value), alunos=parseInt(document.getElementById(`socio-alunos-${i}`)?.value); if(!isNaN(prof)&&!isNaN(alunos)&&alunos>=1) regs.push({escola,ano,serie,componente,socio:cat,prof,alunos,alunos_previstos:previstos,alunos_avaliados:avaliados}); });
  RACAS.forEach((cat,i)=>{ const prof=parseFloat(document.getElementById(`raca-prof-${i}`)?.value), alunos=parseInt(document.getElementById(`raca-alunos-${i}`)?.value); if(!isNaN(prof)&&!isNaN(alunos)&&alunos>=1) regs.push({escola,ano,serie,componente,raca:cat,prof,alunos,alunos_previstos:previstos,alunos_avaliados:avaliados}); });
  SEXOS.forEach((cat,i)=>{ const prof=parseFloat(document.getElementById(`sexo-prof-${i}`)?.value), alunos=parseInt(document.getElementById(`sexo-alunos-${i}`)?.value); if(!isNaN(prof)&&!isNaN(alunos)&&alunos>=1) regs.push({escola,ano,serie,componente,sexo:cat,prof,alunos,alunos_previstos:previstos,alunos_avaliados:avaliados}); });
  if(!regs.length){ toast('Preencha ao menos uma linha.','err'); return; }
  const btn=document.getElementById('btn-salvar'); btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Salvando...`;
  const {data,error} = await sb.from('registros').insert(regs).select();
  btn.disabled=false; btn.innerHTML=IC.check+' Salvar registros';
  if(error){ toast('Erro: '+error.message,'err'); return; }
  (data||[]).forEach(r=>S.registros.unshift({id:r.id,escola:r.escola,ano:r.ano,serie:r.serie,componente:normComp(r.componente),socio:r.socio,raca:r.raca,sexo:r.sexo,prof:parseFloat(r.prof),alunos:parseInt(r.alunos),alunos_previstos:parseInt(r.alunos_previstos)||0,alunos_avaliados:parseInt(r.alunos_avaliados)||0}));
  toast(`${regs.length} registro(s) salvo(s)!`,'ok');
  fStep=1; setStepper(1); document.getElementById('fs1').style.display='block'; document.getElementById('fs2').style.display='none';
  ['f-escola','f-previstos','f-avaliados','f-serie-1','f-componente'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  renderDados();
}

function atualizarTabReg(){
  const fil=document.getElementById('fil-reg')?.value||'';
  const regsAll=scopeRegistros(S.registros).filter(r=>!fil||r.escola===fil);
  const gruposMap=new Map();
  regsAll.forEach(r=>{ const comp=normComp(r.componente), key=`${r.escola}||${r.ano}||${r.serie}||${comp}`; if(!gruposMap.has(key)) gruposMap.set(key,{escola:r.escola,ano:r.ano,serie:r.serie,componente:comp,alunos_previstos:r.alunos_previstos,alunos_avaliados:r.alunos_avaliados,ids:[],count:0}); const g=gruposMap.get(key); g.ids.push(r.id); g.count++; });
  const el=document.getElementById('tab-reg'); if(!el) return;
  if(!gruposMap.size){ el.innerHTML='<div class="empty"><div class="empty-ico">📭</div><p>Nenhum registro encontrado</p></div>'; return; }
  const grupos=Array.from(gruposMap.values());
  el.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Escola</th><th>Ano</th><th>Série</th><th>Componente</th><th>Previstos</th><th>Avaliados</th><th>Cobertura</th><th>Dimensões</th><th></th></tr></thead><tbody>${grupos.map((g,idx)=>{ const prev=g.alunos_previstos||0, aval=g.alunos_avaliados||0, pct=prev>0?Math.round(aval/prev*100):null, cls=pct===null?'':pct>=80?'cob-high':pct>=60?'cob-mid':'cob-low'; return `<tr><td class="td-b" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(g.escola)}</td><td><span class="badge b-${g.ano}">${g.ano}</span></td><td>${escHtml(g.serie||'—')}</td><td>${g.componente?`<span class="badge b-componente">${escHtml(g.componente)}</span>`:'<span style="color:var(--muted2);font-size:11px">—</span>'}</td><td>${prev?prev.toLocaleString('pt-BR'):'<span style="color:var(--muted2)">—</span>'}</td><td class="td-b">${aval?aval.toLocaleString('pt-BR'):'<span style="color:var(--muted2)">—</span>'}</td><td>${pct!==null?`<span class="cob-badge ${cls}">${pct}%</span>`:'<span style="color:var(--muted2);font-size:11px">—</span>'}</td><td><span style="font-size:11px;color:var(--muted2)">${g.count} linha(s)</span></td><td><button class="btn btn-sm btn-danger del-grupo-btn" data-idx="${idx}">${IC.trash}</button></td></tr>`; }).join('')}</tbody></table></div>`;
  el.querySelectorAll('.del-grupo-btn').forEach(btn=>{ btn.addEventListener('click',()=>{ const g=grupos[parseInt(btn.dataset.idx)]; confirmarDelGrupo(g.ids,g.escola,g.ano,g.serie,g.componente); }); });
}

function confirmarDelGrupo(ids, escola, ano, serie, componente){
  const compLabel = componente ? ` — ${componente}` : '';
  openConfirmModal('Excluir grupo?',`Remover todos os registros de <strong>${escHtml(escola)}</strong> — ${ano}, ${serie}${escHtml(compLabel)}?`,`⚠ Isso excluirá ${ids.length} linha(s).`, async()=>{
    const btn=document.getElementById('cm-confirm-btn'); btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Excluindo...`;
    const {error} = await sb.from('registros').delete().in('id',ids);
    btn.disabled=false; btn.textContent='Excluir'; closeConfirmModal();
    if(error){ toast('Erro: '+error.message,'err'); return; }
    S.registros=S.registros.filter(r=>!ids.includes(r.id)); toast('Grupo excluído.','ok'); renderDados();
  });
}

function renderEscolas(){
  document.getElementById('scr-escolas').innerHTML=`
    <div class="page-hd"><h2>Gerenciar escolas</h2><p>Adicione e remova escolas do sistema</p></div>
    <div class="card">
      <div class="card-hd">${IC.plus} Adicionar escola</div>
      <div class="fgrid"><div><label class="flabel">Nome da escola</label><input class="finput" id="e-nome" placeholder="Ex: E.M. João XXIII" onkeydown="if(event.key==='Enter')addEscola()"/></div></div>
      <button class="btn btn-primary" id="btn-add-escola" onclick="addEscola()">${IC.plus} Adicionar</button>
    </div>
    <div class="card">
      <div class="card-hd">${IC.school} Escolas cadastradas <span style="margin-left:auto;font-size:11px;color:var(--muted2);font-weight:400;">${S.escolas.length} escola(s)</span></div>
      ${S.escolas.length?`<div class="table-wrap"><table><thead><tr><th>Escola</th><th>Previstos</th><th>Avaliados</th><th>Cobertura</th><th>Usuários</th><th></th></tr></thead><tbody>${S.escolas.map(e=>{ const regsE=S.registros.filter(r=>r.escola===e), prev=totalAlunosPrevistos(regsE), aval=totalAlunosAvaliados(regsE), pct=prev>0?Math.round(aval/prev*100):null, cls=pct===null?'':pct>=80?'cob-high':pct>=60?'cob-mid':'cob-low', usrsVinc=S.usuarios.filter(u=>u.escola===e).length; return `<tr><td class="td-b">${escHtml(e)}</td><td>${prev?prev.toLocaleString('pt-BR'):'—'}</td><td>${aval?aval.toLocaleString('pt-BR'):'—'}</td><td>${pct!==null?`<span class="cob-badge ${cls}">${pct}%</span>`:'—'}</td><td>${usrsVinc>0?`<span class="badge b-escola">${usrsVinc} usuário(s)</span>`:'nenhum'}</td><td><button class="btn btn-sm btn-danger" data-nome="${escHtml(e)}" onclick="confirmarDelEscola(this.dataset.nome)">${IC.trash}</button></td></tr>`; }).join('')}</tbody></table></div>`:'<div class="empty"><div class="empty-ico">🏫</div><p>Nenhuma escola</p></div>'}
    </div>`;
}

function confirmarDelEscola(nome){
  const regs=S.registros.filter(r=>r.escola===nome), usrsVinc=S.usuarios.filter(u=>u.escola===nome).length;
  let warn=''; if(regs.length>0) warn+=`⚠ ${regs.length} registro(s) vinculado(s). `; if(usrsVinc>0) warn+=`⚠ ${usrsVinc} usuário(s) perderá acesso.`;
  openConfirmModal('Excluir escola?',`Excluir <strong>"${escHtml(nome)}"</strong>? Esta ação não pode ser desfeita.`,warn||null,()=>delEscola(nome));
}
async function delEscola(nome){
  const btn=document.getElementById('cm-confirm-btn'); btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Excluindo...`;
  const {error}=await sb.from('escolas').delete().eq('nome',nome);
  btn.disabled=false; btn.textContent='Excluir'; closeConfirmModal();
  if(error){ toast('Erro: '+error.message,'err'); return; }
  S.escolas=S.escolas.filter(e=>e!==nome); S.registros=S.registros.filter(r=>r.escola!==nome);
  toast(`Escola "${nome}" excluída.`,'ok'); renderEscolas();
}
async function addEscola(){
  const n=document.getElementById('e-nome').value.trim(), inp=document.getElementById('e-nome');
  if(!n){ inp.classList.add('err'); toast('Informe o nome.','err'); return; }
  if(S.escolas.includes(n)){ inp.classList.add('err'); toast('Escola já cadastrada.','err'); return; }
  inp.classList.remove('err');
  const btn=document.getElementById('btn-add-escola'); btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Adicionando...`;
  const {error}=await sb.from('escolas').insert([{nome:n}]);
  btn.disabled=false; btn.innerHTML=IC.plus+' Adicionar';
  if(error){ toast('Erro: '+error.message,'err'); return; }
  S.escolas.push(n); S.escolas.sort((a,b)=>a.localeCompare(b)); inp.value='';
  toast('Escola adicionada!','ok'); renderEscolas();
}

function renderUsuarios(){
  const totalUsr=S.usuarios.length, totalAdmin=S.usuarios.filter(u=>u.role==='admin').length;
  const totalEscola=S.usuarios.filter(u=>u.role!=='admin'&&u.escola).length, totalSec=S.usuarios.filter(u=>u.role!=='admin'&&!u.escola).length;
  document.getElementById('scr-usuarios').innerHTML=`
    <div class="page-hd"><h2>Gerenciar usuários</h2><p>Crie e gerencie acessos</p></div>
    <div class="stats-row">
      <div class="stat c-azure"><div class="stat-ico">${IC.users}</div><div class="stat-v">${totalUsr}</div><div class="stat-l">Total</div></div>
      <div class="stat c-violet"><div class="stat-ico">${IC.lock}</div><div class="stat-v">${totalAdmin}</div><div class="stat-l">Admins</div></div>
      <div class="stat c-emerald"><div class="stat-ico">${IC.school}</div><div class="stat-v">${totalEscola}</div><div class="stat-l">Por escola</div></div>
      <div class="stat c-sky"><div class="stat-ico">${IC.db}</div><div class="stat-v">${totalSec}</div><div class="stat-l">Secretaria</div></div>
    </div>
    <div class="card">
      <div class="card-hd">${IC.plus} Novo usuário</div>
      <div class="fgrid">
        <div><label class="flabel">Nome</label><input class="finput" id="u-nome" placeholder="Nome completo"/></div>
        <div><label class="flabel">Login</label><input class="finput" id="u-login" placeholder="login" autocomplete="off"/></div>
        <div><label class="flabel">Senha</label><div class="pw-wrap"><input class="finput" id="u-senha" type="password" placeholder="Mínimo 4 caracteres" autocomplete="new-password"/><button class="pw-toggle" type="button" onclick="togglePw('u-senha',this)">${IC.eye}</button></div></div>
        <div><label class="flabel">Perfil</label><select class="fsel" id="u-role" onchange="toggleEscolaField()"><option value="user">Usuário</option><option value="admin">Administrador</option></select></div>
      </div>
      <div id="u-escola-wrap" class="fgrid" style="margin-top:-4px;">
        <div><label class="flabel">Escola vinculada</label><select class="fsel" id="u-escola"><option value="">— Secretaria —</option>${S.escolas.map(e=>`<option value="${escHtml(e)}">${escHtml(e)}</option>`).join('')}</select></div>
      </div>
      <button class="btn btn-primary" id="btn-add-usr" style="margin-top:14px;" onclick="addUsuario()">${IC.plus} Adicionar</button>
    </div>
    <div class="card">
      <div class="card-hd">
        ${IC.users} Usuários
        <div class="card-hd-right" style="display:flex;gap:7px;">
          <button class="btn btn-ghost btn-sm" onclick="exportUsuariosXLSX()">${IC.db} Excel</button>
          <button class="btn btn-ghost btn-sm" id="btn-export-usr-pdf" onclick="exportUsuariosPDF()">${IC.pdf} PDF</button>
        </div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Login</th><th>Senha</th><th>Perfil</th><th>Acesso</th><th></th></tr></thead><tbody>${S.usuarios.map(u=>`
        <tr>
          <td class="td-b">${escHtml(u.nome)}</td>
          <td>${escHtml(u.login)}</td>
          <td>${escHtml(u.senha || '—')}</td>
          <td><span class="badge ${u.role==='admin'?'b-admin':'b-user'}">${u.role==='admin'?'Admin':'Usuário'}</span></td>
          <td>${u.role==='admin'?`<span class="badge b-secretaria">Todas as escolas</span>`:u.escola?`<span class="badge b-escola">${escHtml(u.escola)}</span>`:`<span class="badge b-secretaria">Secretaria</span>`}</td>
          <td>${u.login!=='admin'?`<button class="btn btn-sm btn-danger" onclick="confirmarDelUsuario('${escHtml(u.login)}')">${IC.trash}</button>`:`<span style="font-size:11px;color:var(--muted2)">protegido</span>`}</td>
        </tr>`).join('')}</tbody></table></div>
    </div>`;
  toggleEscolaField();
}
function toggleEscolaField(){ const role=document.getElementById('u-role')?.value, wrap=document.getElementById('u-escola-wrap'); if(!wrap) return; wrap.style.display=role==='admin'?'none':'grid'; }
function confirmarDelUsuario(login){ const u=S.usuarios.find(x=>x.login===login); if(!u) return; openConfirmModal('Excluir usuário?',`Excluir <strong>${escHtml(u.nome)}</strong>?`,null,()=>delUsuario(login)); }
async function delUsuario(login){
  const btn=document.getElementById('cm-confirm-btn'); btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Excluindo...`;
  const {error}=await sb.from('usuarios').delete().eq('login',login);
  btn.disabled=false; btn.textContent='Excluir'; closeConfirmModal();
  if(error){ toast('Erro: '+error.message,'err'); return; }
  S.usuarios=S.usuarios.filter(u=>u.login!==login); toast('Usuário excluído.','ok'); renderUsuarios();
}
async function addUsuario(){
  const n=document.getElementById('u-nome').value.trim(), l=document.getElementById('u-login').value.trim().toLowerCase();
  const s=document.getElementById('u-senha').value, r=document.getElementById('u-role').value;
  const e=r==='admin'?null:(document.getElementById('u-escola')?.value||null);
  if(!n||!l||s.length<4){ toast('Preencha nome, login e senha (mín. 4 chars).','err'); return; }
  if(S.usuarios.find(u=>u.login===l)){ toast('Login já em uso.','err'); return; }
  const btn=document.getElementById('btn-add-usr'); btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Adicionando...`;
  const {data,error}=await sb.from('usuarios').insert([{nome:n,login:l,senha:s,role:r,escola:e||null}]).select('id,nome,login,role,escola').single();
  btn.disabled=false; btn.innerHTML=IC.plus+' Adicionar';
  if(error){ toast('Erro: '+error.message,'err'); return; }
  S.usuarios.push(data);
  ['u-nome','u-login','u-senha'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  if(document.getElementById('u-escola')) document.getElementById('u-escola').value='';
  document.getElementById('u-role').value='user'; toggleEscolaField();
  toast(`Usuário "${n}" adicionado!`,'ok'); renderUsuarios();
}

function renderAnalytics(){
  const escsDisp=scopeEscolas();
  const alerta=userEscola()&&S.user.role!=='admin'?`<div class="scope-alert">${IC.lock}<span>Análise restrita à escola <strong>${escHtml(userEscola())}</strong>.</span></div>`:'';
  document.getElementById('scr-analytics').innerHTML=`
    <div class="page-hd"><h2>Análise comparativa</h2><p>Proficiência por nível socioeconômico, cor/raça e sexo — 2024 vs 2025.</p></div>
    ${alerta}
    <div class="card" style="padding:12px 20px;margin-bottom:28px;">
      <div class="filter-bar">
        <div class="filter-bar-item"><label>Escola</label><select class="frow-sel" id="a-escola" onchange="updateAllCharts()" ${escsDisp.length===1?'disabled':''}>${escsDisp.length===1?`<option value="${escHtml(escsDisp[0])}">${escHtml(escsDisp[0])}</option>`:`<option value="">Todas</option>${escsDisp.map(e=>`<option>${escHtml(e)}</option>`).join('')}`}</select></div>
        <div class="filter-bar-item"><label>Série</label><select class="frow-sel" id="a-serie" onchange="updateAllCharts()"><option value="">Todas</option>${SERIES.map(s=>`<option>${s}</option>`).join('')}</select></div>
        <div class="filter-bar-item"><label>Componente</label><select class="frow-sel" id="a-componente" onchange="updateAllCharts()"><option value="">Todos</option>${COMPONENTES.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div class="filter-bar-item"><label>Ano</label><select class="frow-sel" id="a-ano" onchange="updateAllCharts()"><option value="">2024 e 2025</option>${ANOS.map(a=>`<option>${a}</option>`).join('')}</select></div>
        <div style="margin-left:auto;display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:4px 0;">
          <div class="ch-leg-item"><div class="ch-leg-swatch" style="background:#c17b3f;"></div>2024</div>
          <div class="ch-leg-item"><div class="ch-leg-swatch" style="background:#3a7a5c;"></div>2025</div>
          <button id="btn-export-pdf" class="btn btn-ghost btn-sm" onclick="exportPDF()">${IC.pdf} PDF</button>
          <button id="btn-export-ppt" class="btn btn-ghost btn-sm" onclick="exportPPT()">${IC.ppt} PPTX</button>
          <button id="btn-export-xlsx" class="btn btn-ghost btn-sm" onclick="exportXLSX()">${IC.db} Excel</button>
        </div>
      </div>
    </div>
    <div class="print-header"><h1>EduMétricas — Análise Comparativa</h1></div>
    <div class="charts-grid">${[{campo:'socio',id:'ch-socio',stuId:'stu-socio',mets:'mets-socio',label:'Nível socioeconômico'},{campo:'raca',id:'ch-raca',stuId:'stu-raca',mets:'mets-raca',label:'Cor / raça'},{campo:'sexo',id:'ch-sexo',stuId:'stu-sexo',mets:'mets-sexo',label:'Sexo'}].map(c=>`<div class="chart-card"><div class="chart-card-header"><div class="chart-card-title">${IC.chart} ${c.label}</div></div><div id="${c.mets}" class="mets"></div><div class="chart-wrap"><canvas id="${c.id}"></canvas></div><div class="chart-student-summary" id="${c.stuId}"></div></div>`).join('')}</div>`;
  if(escsDisp.length===1){ updateAllCharts(escsDisp[0]); } else { updateAllCharts(); }
}

function updateAllCharts(forceEscola){
  const escola = forceEscola!==undefined ? forceEscola : (document.getElementById('a-escola')?.value||'');
  const serie=document.getElementById('a-serie')?.value||'', componente=normComp(document.getElementById('a-componente')?.value||''), ano=document.getElementById('a-ano')?.value||'';
  [{campo:'socio',chartId:'ch-socio',metsId:'mets-socio',stuId:'stu-socio'},{campo:'raca',chartId:'ch-raca',metsId:'mets-raca',stuId:'stu-raca'},{campo:'sexo',chartId:'ch-sexo',metsId:'mets-sexo',stuId:'stu-sexo'}].forEach(({campo,chartId,metsId,stuId})=>{
    const {cats,ant,atu,alunosAnt,alunosAtu}=calcMedia(campo,escola,serie,ano,componente);
    const totalAlunosAtu=alunosAtu.reduce((s,v)=>s+v,0);
    const mel=document.getElementById(metsId);
    if(mel) mel.innerHTML=cats.length?cats.map((cat,i)=>{ const va=ant[i], vb=atu[i], d=va!=null&&vb!=null?(vb-va).toFixed(1):null; const pctAtu=totalAlunosAtu>0&&alunosAtu[i]>0?Math.round(alunosAtu[i]/totalAlunosAtu*100):null; return `<div class="met"><div class="met-v">${vb!=null?vb.toFixed(1):'—'}</div><div class="met-l">${escHtml(cat)}</div>${pctAtu!==null?`<div class="met-pct">${pctAtu}% alunos</div>`:''} ${alunosAtu[i]>0?`<div class="met-alunos">${alunosAtu[i].toLocaleString('pt-BR')} est.</div>`:''} ${d!==null?`<div class="met-d ${parseFloat(d)>0?'up':parseFloat(d)<0?'dn':'eq'}">${parseFloat(d)>0?'▲ +':'▼ '}${d}</div>`:''}</div>`; }).join(''):'<div class="empty" style="grid-column:1/-1"><p>Sem dados para os filtros.</p></div>';
    mkChart(chartId,cats,ant,atu); renderStudentSummary(stuId,cats,alunosAnt,alunosAtu);
  });
}

function runQuery(){
  const escola=document.getElementById('q-escola')?.value||'', serie=document.getElementById('q-serie')?.value||'';
  const componente=normComp(document.getElementById('q-componente')?.value||''), ano=document.getElementById('q-ano')?.value||'';
  const dimensao=document.getElementById('q-dimensao')?.value||'';
  let regs=scopeRegistros(S.registros);
  if(escola) regs=regs.filter(r=>r.escola===escola);
  if(serie)  regs=regs.filter(r=>r.serie===serie);
  if(componente) regs=regs.filter(r=>normComp(r.componente)===componente);
  if(ano)    regs=regs.filter(r=>r.ano===ano);
  if(dimensao==='socio') regs=regs.filter(r=>r.socio);
  if(dimensao==='raca')  regs=regs.filter(r=>r.raca);
  if(dimensao==='sexo')  regs=regs.filter(r=>r.sexo);
  const bar=document.getElementById('q-result-bar'), txt=document.getElementById('q-result-txt'), wrap=document.getElementById('q-table-wrap');
  if(!regs.length){
    bar.className='query-result-bar show'; bar.style.cssText='background:#fce8e8;border-color:#f0c4c4;color:var(--rose)';
    txt.textContent='Nenhum registro encontrado.'; wrap.classList.remove('show'); wrap.innerHTML=''; return;
  }
  bar.className='query-result-bar show'; bar.style.cssText='background:#e8f5ee;border-color:#c4e5d4;color:var(--green)';
  txt.textContent=`${regs.length} linha(s) encontrada(s) — ${regs.reduce((s,r)=>s+r.alunos,0).toLocaleString('pt-BR')} estudantes.`;
  const agg=new Map();
  regs.forEach(r=>{ const cat=r.socio||r.raca||r.sexo||'—', dim=r.socio?'socio':r.raca?'raca':r.sexo?'sexo':'?'; const key=`${r.escola}||${r.ano}||${r.serie}||${normComp(r.componente)}||${dim}||${cat}`; if(!agg.has(key)) agg.set(key,{escola:r.escola,ano:r.ano,serie:r.serie,componente:normComp(r.componente),dim,cat,alunos:0,profSum:0}); const g=agg.get(key); g.alunos+=r.alunos; g.profSum+=r.prof*r.alunos; });
  const rows=Array.from(agg.values()).sort((a,b)=>b.alunos-a.alunos), totalAlunos=rows.reduce((s,r)=>s+r.alunos,0);
  const dimLabel={socio:'Nível socioecon.',raca:'Cor/raça',sexo:'Sexo'};
  wrap.classList.add('show');
  wrap.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Escola</th><th>Ano</th><th>Série</th><th>Componente</th><th>Dimensão</th><th>Categoria</th><th>Estudantes</th><th>% total</th><th>Profic.</th></tr></thead><tbody>${rows.map(r=>{ const profMedia=r.alunos>0?(r.profSum/r.alunos).toFixed(1):'—', pct=totalAlunos>0?(r.alunos/totalAlunos*100).toFixed(1):'0'; return `<tr><td class="td-b">${escHtml(r.escola)}</td><td><span class="badge b-${r.ano}">${r.ano}</span></td><td>${escHtml(r.serie||'—')}</td><td>${r.componente?`<span class="badge b-componente">${escHtml(r.componente)}</span>`:'—'}</td><td>${dimLabel[r.dim]||r.dim}</td><td class="td-b">${escHtml(r.cat)}</td><td class="td-b">${r.alunos.toLocaleString('pt-BR')}</td><td><span style="font-size:11px;font-weight:700;color:var(--accent);">${pct}%</span></td><td class="td-b">${profMedia}</td></tr>`; }).join('')}</tbody></table></div>`;
}
function clearQuery(){
  ['q-escola','q-serie','q-componente','q-ano','q-dimensao'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  const bar=document.getElementById('q-result-bar'); if(bar) bar.classList.remove('show');
  const wrap=document.getElementById('q-table-wrap'); if(wrap){ wrap.classList.remove('show'); wrap.innerHTML=''; }
}

// ── Exports ──
async function exportPDF(){
  const btn=document.getElementById('btn-export-pdf');
  btn.disabled=true; btn.innerHTML=`<div class="spinner spinner-dark"></div> Gerando PDF...`;
  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const W=297,H=210;
    const HEADER_H=14,FOOTER_H=8,MARGIN=6,GAP=4;

    const escolaSel   = document.getElementById('a-escola')?.value||'';
    const serieSel    = document.getElementById('a-serie')?.value||'';
    const compSel     = normComp(document.getElementById('a-componente')?.value||'');
    const anoSel      = document.getElementById('a-ano')?.value||'';
    const escolaLabel = escolaSel||'Todas as escolas';
    const subtitulo   = [serieSel,compSel,anoSel].filter(Boolean).join(' · ')||'Todos os filtros';

    const regsScope = scopeRegistros(S.registros).filter(r=>
      (!escolaSel||r.escola===escolaSel)&&(!serieSel||r.serie===serieSel)&&
      (!compSel||normComp(r.componente)===compSel)&&(!anoSel||r.ano===anoSel));
    const totalPrevistos = totalAlunosPrevistos(regsScope);
    const totalAvaliados = totalAlunosAvaliados(regsScope);
    const cobPct = totalPrevistos>0 ? Math.round(totalAvaliados/totalPrevistos*100) : null;

    const chartCards = Array.from(document.querySelectorAll('.chart-card'));
    const captures = [];
    for(let i=0;i<3;i++){
      const card = chartCards[i];
      if(!card){ captures.push(null); continue; }
      const canvas = await html2canvas(card,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false});
      captures.push(canvas);
    }

    doc.setFillColor(250,248,244); doc.rect(0,0,W,H,'F');
    doc.setFillColor(244,240,232); doc.rect(0,0,W,HEADER_H,'F');
    doc.setFillColor(193,123,63);  doc.rect(0,0,3,HEADER_H,'F');

    doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(160,148,133);
    doc.text('EduMétricas',7,5);
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(26,22,18);
    doc.text(escolaLabel,7,11);
    doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(160,148,133);
    doc.text(subtitulo, W-MARGIN, 11, {align:'right'});

    if(cobPct!==null){
      const r=cobPct>=80?58:cobPct>=60?160:140, g=cobPct>=80?122:cobPct>=60?100:80, b=cobPct>=80?92:60;
      doc.setTextColor(r,g,b); doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
      doc.text(`Cobertura: ${totalAvaliados.toLocaleString('pt-BR')} / ${totalPrevistos.toLocaleString('pt-BR')} alunos (${cobPct}%)`,W/2, 11, {align:'center'});
    }

    doc.setFillColor(244,240,232); doc.rect(0,H-FOOTER_H,W,FOOTER_H,'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(6); doc.setTextColor(160,148,133);
    doc.text(new Date().toLocaleDateString('pt-BR',{year:'numeric',month:'long',day:'numeric'}),W-MARGIN, H-3, {align:'right'});

    const CONTENT_Y = HEADER_H+2;
    const CONTENT_H = H-HEADER_H-FOOTER_H-3;
    const slotW     = (W - MARGIN*2 - GAP*2) / 3;

    for(let si=0;si<3;si++){
      const canvas = captures[si];
      if(!canvas) continue;
      const slotX = MARGIN + si*(slotW+GAP);
      doc.setFillColor(255,255,255);
      doc.roundedRect(slotX, CONTENT_Y, slotW, CONTENT_H, 3,3,'F');
      const imgAreaX = slotX+2, imgAreaY = CONTENT_Y+2;
      const imgAreaW = slotW-4, imgAreaH = CONTENT_H-4;
      const ratio = Math.min(imgAreaW/canvas.width, imgAreaH/canvas.height);
      const fW = canvas.width*ratio, fH = canvas.height*ratio;
      doc.addImage(canvas.toDataURL('image/png'),'PNG',imgAreaX+(imgAreaW-fW)/2,imgAreaY+(imgAreaH-fH)/2,fW,fH);
    }

    doc.save(`EduMetricas-${new Date().toISOString().slice(0,10)}.pdf`);
    toast('PDF exportado!','ok');
  } catch(e){ toast('Erro PDF: '+e.message,'err'); }
  finally { btn.disabled=false; btn.innerHTML=IC.pdf+' PDF'; }
}

async function exportPPT(){
  const btn=document.getElementById('btn-export-ppt');
  btn.disabled=true; btn.innerHTML=`<div class="spinner spinner-dark"></div> Gerando PPTX...`;
  let PptxClass=window.PptxGenJS||window.PptxGen||window.pptxgen;
  if(PptxClass&&typeof PptxClass!=='function'&&PptxClass.PptxGenJS) PptxClass=PptxClass.PptxGenJS;
  if(!PptxClass){ btn.disabled=false; btn.innerHTML=IC.ppt+' PPTX'; toast('Biblioteca PPTX não carregada.','err'); return; }
  const pptx=new PptxClass(); const rectType=pptx.ShapeType?.rect||'rect';
  const cover=pptx.addSlide();
  cover.addShape(rectType,{x:0,y:0,w:'100%',h:'100%',fill:{color:'1a1612'},line:{color:'1a1612'}});
  cover.addText('EduMétricas — Análise Comparativa',{x:0.5,y:1.1,w:'90%',fontSize:32,bold:true,color:'faf8f4',fontFace:'Arial'});
  cover.addText('Proficiência 2024 vs 2025',{x:0.5,y:2.0,w:'90%',fontSize:13,color:'c17b3f',fontFace:'Arial'});
  const graficos=[{id:'ch-socio',label:'Nível socioeconômico'},{id:'ch-raca',label:'Cor / raça'},{id:'ch-sexo',label:'Sexo'}];
  for(const g of graficos){
    const canvas=document.getElementById(g.id); if(!canvas) continue;
    const slide=pptx.addSlide();
    slide.addShape(rectType,{x:0,y:0,w:'100%',h:'100%',fill:{color:'faf8f4'},line:{color:'faf8f4'}});
    slide.addText(g.label,{x:0.4,y:0.5,w:'90%',fontSize:20,bold:true,color:'1a1612',fontFace:'Arial'});
    slide.addImage({data:canvas.toDataURL('image/png'),x:0.4,y:1.5,w:9.2,h:4.0});
  }
  try{ await pptx.writeFile({fileName:`EduMetricas-${new Date().toISOString().slice(0,10)}.pptx`}); toast('PPTX exportado!','ok'); }
  catch(e){ toast('Erro PPTX: '+(e.message||e),'err'); }
  finally { btn.disabled=false; btn.innerHTML=IC.ppt+' PPTX'; }
}

function exportXLSX(){
  if(!window.XLSX){ toast('Biblioteca Excel não carregada.','err'); return; }
  const escola=document.getElementById('a-escola')?.value||'', serie=document.getElementById('a-serie')?.value||'';
  const componente=normComp(document.getElementById('a-componente')?.value||''), ano=document.getElementById('a-ano')?.value||'';
  let regs=scopeRegistros(S.registros);
  if(escola) regs=regs.filter(r=>r.escola===escola);
  if(serie)  regs=regs.filter(r=>r.serie===serie);
  if(componente) regs=regs.filter(r=>normComp(r.componente)===componente);
  if(ano)    regs=regs.filter(r=>r.ano===ano);
  if(!regs.length){ toast('Nenhum dado para exportar.','err'); return; }
  const wb=XLSX.utils.book_new();
  const brutos=regs.map(r=>({'Escola':r.escola,'Ano':r.ano,'Série':r.serie,'Componente':r.componente||'—','Nível Socioeconômico':r.socio||'—','Cor/Raça':r.raca||'—','Sexo':r.sexo||'—','Proficiência':r.prof,'Alunos Aval.':r.alunos,'Previstos':r.alunos_previstos,'Avaliados':r.alunos_avaliados}));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(brutos),'Dados Brutos');
  XLSX.writeFile(wb,`EduMetricas-${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('Excel exportado!','ok');
}

// ── Exportar Usuários XLSX ──
function exportUsuariosXLSX() {
  if (!window.XLSX) { toast('Biblioteca Excel não carregada.', 'err'); return; }
  if (!S.usuarios.length) { toast('Nenhum usuário para exportar.', 'err'); return; }
  const wb = XLSX.utils.book_new();
  const dados = S.usuarios.map(u => ({
    'Nome':   u.nome,
    'Login':  u.login,
    'Senha':  u.senha || '—',
    'Perfil': u.role === 'admin' ? 'Administrador' : 'Usuário',
    'Acesso': u.role === 'admin' ? 'Todas as escolas' : (u.escola || 'Secretaria')
  }));
  const ws = XLSX.utils.json_to_sheet(dados);
  XLSX.utils.book_append_sheet(wb, ws, 'Usuários');
  XLSX.writeFile(wb, `EduMetricas-Usuarios-${new Date().toISOString().slice(0, 10)}.xlsx`);
  toast('Excel de usuários exportado!', 'ok');
}

// ── Exportar Usuários PDF ──
async function exportUsuariosPDF() {
  const btn = document.getElementById('btn-export-usr-pdf');
  if (btn) { btn.disabled = true; btn.innerHTML = `<div class="spinner spinner-dark"></div> Gerando...`; }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = 297, MARGIN = 14;

    // ── Cabeçalho ──
    doc.setFillColor(26, 22, 18);
    doc.rect(0, 0, W, 22, 'F');
    doc.setFillColor(193, 123, 63);
    doc.rect(0, 0, 3, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(250, 248, 244);
    doc.text('EduMétricas — Usuários Cadastrados', MARGIN, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 148, 133);
    doc.text(new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }), W - MARGIN, 14, { align: 'right' });

    // ── Resumo ──
    const totalAdmin  = S.usuarios.filter(u => u.role === 'admin').length;
    const totalEscola = S.usuarios.filter(u => u.role !== 'admin' && u.escola).length;
    const totalSec    = S.usuarios.filter(u => u.role !== 'admin' && !u.escola).length;
    doc.setFillColor(244, 240, 232);
    doc.rect(MARGIN, 27, W - MARGIN * 2, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(26, 22, 18);
    doc.text(`Total: ${S.usuarios.length}`, MARGIN + 4, 35);
    doc.setTextColor(90, 74, 154);
    doc.text(`Admins: ${totalAdmin}`, MARGIN + 38, 35);
    doc.setTextColor(58, 122, 92);
    doc.text(`Por escola: ${totalEscola}`, MARGIN + 72, 35);
    doc.setTextColor(74, 127, 168);
    doc.text(`Secretaria: ${totalSec}`, MARGIN + 118, 35);

    // ── Colunas ──
    let y = 48;
    const COL = {
      nome:   { x: MARGIN,       w: 80 },
      login:  { x: MARGIN + 82,  w: 46 },
      senha:  { x: MARGIN + 130, w: 40 },
      perfil: { x: MARGIN + 172, w: 28 },
      acesso: { x: MARGIN + 202, w: 67 }
    };

    // Cabeçalho da tabela
    doc.setFillColor(237, 232, 221);
    doc.rect(MARGIN, y, W - MARGIN * 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(122, 114, 101);
    doc.text('NOME',   COL.nome.x   + 2, y + 5.5);
    doc.text('LOGIN',  COL.login.x  + 2, y + 5.5);
    doc.text('SENHA',  COL.senha.x  + 2, y + 5.5);
    doc.text('PERFIL', COL.perfil.x + 2, y + 5.5);
    doc.text('ACESSO', COL.acesso.x + 2, y + 5.5);
    y += 8;

    // ── Linhas ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const PAGE_H = 197, ROW_H = 7.5;

    S.usuarios.forEach((u, i) => {
      if (y + ROW_H > PAGE_H) {
        doc.addPage();
        y = 18;
        doc.setFillColor(237, 232, 221);
        doc.rect(MARGIN, y, W - MARGIN * 2, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(122, 114, 101);
        doc.text('NOME',   COL.nome.x   + 2, y + 5.5);
        doc.text('LOGIN',  COL.login.x  + 2, y + 5.5);
        doc.text('SENHA',  COL.senha.x  + 2, y + 5.5);
        doc.text('PERFIL', COL.perfil.x + 2, y + 5.5);
        doc.text('ACESSO', COL.acesso.x + 2, y + 5.5);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }

      if (i % 2 === 0) {
        doc.setFillColor(250, 248, 244);
        doc.rect(MARGIN, y, W - MARGIN * 2, ROW_H, 'F');
      }

      const perfil = u.role === 'admin' ? 'Admin' : 'Usuário';
      const acesso = u.role === 'admin' ? 'Todas as escolas' : (u.escola || 'Secretaria');

      // Badge de perfil
      if (u.role === 'admin') {
        doc.setFillColor(237, 232, 247); doc.setDrawColor(216, 207, 238);
        doc.roundedRect(COL.perfil.x + 1, y + 1.5, 18, 4.5, 2, 2, 'FD');
        doc.setTextColor(90, 74, 154);
      } else {
        doc.setFillColor(232, 245, 238); doc.setDrawColor(196, 229, 212);
        doc.roundedRect(COL.perfil.x + 1, y + 1.5, 18, 4.5, 2, 2, 'FD');
        doc.setTextColor(58, 122, 92);
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(perfil, COL.perfil.x + 10, y + 5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(26, 22, 18);
      const nomeStr = u.nome.length > 40 ? u.nome.slice(0, 38) + '…' : u.nome;
      doc.text(nomeStr, COL.nome.x + 2, y + 5.2);

      doc.setTextColor(122, 114, 101);
      doc.text(u.login, COL.login.x + 2, y + 5.2);

      doc.setTextColor(160, 100, 60);
      doc.text(u.senha || '—', COL.senha.x + 2, y + 5.2);

      doc.setTextColor(74, 127, 168);
      const acessoStr = acesso.length > 32 ? acesso.slice(0, 30) + '…' : acesso;
      doc.text(acessoStr, COL.acesso.x + 2, y + 5.2);

      doc.setDrawColor(237, 232, 221);
      doc.line(MARGIN, y + ROW_H, W - MARGIN, y + ROW_H);
      y += ROW_H;
    });

    // ── Rodapé ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(244, 240, 232);
      doc.rect(0, 290, W, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(160, 148, 133);
      doc.text(`Página ${p} de ${totalPages}`, W / 2, 294.5, { align: 'center' });
      doc.text('EduMétricas', MARGIN, 294.5);
    }

    doc.save(`EduMetricas-Usuarios-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast('PDF de usuários exportado!', 'ok');
  } catch (e) {
    toast('Erro PDF: ' + e.message, 'err');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = IC.pdf + ' PDF'; }
  }
}

// ── Confirm Modal ──
function openConfirmModal(title, desc, warn, onConfirm){
  document.getElementById('cm-title').textContent=title;
  document.getElementById('cm-desc').innerHTML=desc;
  const wEl=document.getElementById('cm-warn');
  if(warn){ wEl.textContent=warn; wEl.classList.add('show'); } else { wEl.classList.remove('show'); }
  const btn=document.getElementById('cm-confirm-btn'); btn.textContent='Excluir'; btn.onclick=onConfirm;
  document.getElementById('confirm-modal-bg').classList.add('show');
}
function closeConfirmModal(){ document.getElementById('confirm-modal-bg').classList.remove('show'); }
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeConfirmModal(); });
document.getElementById('confirm-modal-bg').addEventListener('click', e=>{ if(e.target===document.getElementById('confirm-modal-bg')) closeConfirmModal(); });

// ── Landing stats ──
async function renderLandingData(){
  try{
    const [{data:esc},{data:reg}] = await Promise.all([
      sb.from('escolas').select('nome'),
      sb.from('registros').select('prof,alunos,alunos_previstos,alunos_avaliados,escola,ano,serie')
    ]);
    const escolas=(esc||[]).map(e=>e.nome);
    const registros=(reg||[]).map(r=>({...r,alunos_previstos:parseInt(r.alunos_previstos)||0,alunos_avaliados:parseInt(r.alunos_avaliados)||0}));
    const gruposPrev=new Map();
    registros.forEach(r=>{ const k=`${r.escola}||${r.ano}||${r.serie}`; if(!gruposPrev.has(k)) gruposPrev.set(k,r.alunos_previstos); });
    const totalPrevistos=Array.from(gruposPrev.values()).reduce((s,v)=>s+v,0);
    const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
    set('ls-escolas', escolas.length||'—');
    set('ls-alunos',  totalPrevistos?totalPrevistos.toLocaleString('pt-BR'):'—');
    const tot=registros.reduce((s,r)=>s+parseInt(r.alunos),0);
    const mp=tot?registros.reduce((s,r)=>s+parseFloat(r.prof)*parseInt(r.alunos),0)/tot:null;
    set('ls-prof', mp?Math.round(mp):'—');
  } catch(e){ console.warn('Landing data error:',e); }
}

// Init landing stats on page load
renderLandingData();