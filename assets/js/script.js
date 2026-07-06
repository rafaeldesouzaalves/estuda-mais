/* ================================================================
   ESTUDE MAIS — LÓGICA DA APLICAÇÃO (JavaScript)
   v4 — navegação no topo, nova paleta e funcionalidades adicionais:
   busca rápida de tarefas na Início, sinalizador de prioridade,
   gráfico de rosca (distribuição por matéria), broadcast de material,
   prioridade de avisos e seletor de tema de cor nas Configurações.
   ================================================================ */

/* ================================================================
   1. ESTADO GLOBAL & DADOS SIMULADOS (mock data)
   ================================================================ */
const state = {
  role: 'aluno',
  theme: 'light',
  accent: 'frances',
  dnd: false,
  page: 'inicio',
  userName: '',
  weekFocusHours: [1.5, 2, 0.5, 3, 2.5, 1, 0],
  monthOffset: 0,
  pomodoro: { running:false, seconds: 25*60, total: 25*60, mode:'foco', subject:'mat' },
  xp: 640, xpNext: 1000, level: 4, streak: 6,
  ambientSound: 'silencio',
};

const SUBJECTS = [
  { id:'mat', name:'Matemática', color:'#3E4B8E', icon:'sigma', progress:72, teacher:'Profa. Helena', mastery:78 },
  { id:'por', name:'Português', color:'#A5463C', icon:'book-open', progress:58, teacher:'Prof. Diego', mastery:54 },
  { id:'his', name:'História', color:'#A9782A', icon:'landmark', progress:40, teacher:'Profa. Ana', mastery:46 },
  { id:'cie', name:'Ciências', color:'#3E7A5B', icon:'flask-conical', progress:85, teacher:'Prof. Caio', mastery:88 },
  { id:'ing', name:'Inglês', color:'#4C7A9B', icon:'languages', progress:64, teacher:'Profa. Bia', mastery:61 },
  { id:'geo', name:'Geografia', color:'#7A5C99', icon:'globe', progress:30, teacher:'Prof. Rui', mastery:35 },
];

const MATERIALS = {
  mat:[{name:'Lista 4 — Equações do 2º grau.pdf', type:'pdf', size:'1.2 MB'},{name:'Slides — Funções.pdf', type:'pdf', size:'3.4 MB'}],
  por:[{name:'Redação modelo ENEM.docx', type:'doc', size:'0.4 MB'}],
  his:[{name:'Linha do tempo — Brasil Império.pdf', type:'pdf', size:'2.1 MB'}],
  cie:[{name:'Roteiro de laboratório.pdf', type:'pdf', size:'0.9 MB'}],
  ing:[], geo:[{name:'Mapa mundi atualizado.png', type:'img', size:'0.6 MB'}],
};

let TASKS = [
  { id:1, title:'Lista de exercícios — Equações', subject:'mat', due:'Hoje, 18:00', status:'andamento', done:false, posted:'2026-06-28', deadline:'2026-07-02', completedAt:null },
  { id:2, title:'Ler capítulo 3 — Machado de Assis', subject:'por', due:'Amanhã, 08:00', status:'pendente', done:false, posted:'2026-06-25', deadline:'2026-07-03', completedAt:null },
  { id:3, title:'Resumo — Era Vargas', subject:'his', due:'Sex, 23:59', status:'pendente', done:false, posted:'2026-06-20', deadline:'2026-07-04', completedAt:null },
  { id:4, title:'Relatório de experimento', subject:'cie', due:'Concluído ontem', status:'concluida', done:true, posted:'2026-06-18', deadline:'2026-07-01', completedAt:'2026-07-01' },
  { id:5, title:'Vocabulário — Unit 5', subject:'ing', due:'Qui, 20:00', status:'andamento', done:false, posted:'2026-06-27', deadline:'2026-07-02', completedAt:null },
];
let taskIdSeq = 6;

const NOTIFICATIONS = [
  { icon:'clock', color:'slate', text:'Tarefa de Matemática vence em 3 horas.', time:'há 12 min' },
  { icon:'file-text', color:'moss', text:'Prof. Diego enviou um novo material em Português.', time:'há 1 h' },
  { icon:'megaphone', color:'amber', text:'Aviso da turma: prova remarcada para sexta.', time:'há 3 h' },
];

const GRADES = [
  { subject:'Matemática', bimestre:'2º Bim.', grade:8.7, feedback:'Ótima evolução em funções, continue praticando geometria.', seen:true },
  { subject:'Português', bimestre:'2º Bim.', grade:6.4, feedback:'Atenção à coesão textual nas redações.', seen:false },
  { subject:'História', bimestre:'2º Bim.', grade:9.1, feedback:'Excelente participação e argumentação.', seen:false },
  { subject:'Ciências', bimestre:'2º Bim.', grade:7.8, feedback:'Bom domínio prático, revisar teoria de células.', seen:true },
];

const ACHIEVEMENTS = [
  { title:'Primeira tarefa', desc:'Concluiu 1 tarefa', icon:'check-circle-2', unlocked:true },
  { title:'Sequência de 5 dias', desc:'5 dias seguidos estudando', icon:'flame', unlocked:true },
  { title:'Madrugador', desc:'Estudou antes das 7h', icon:'sunrise', unlocked:true },
  { title:'Maratonista', desc:'4h de estudo em um dia', icon:'timer', unlocked:false },
  { title:'Nota máxima', desc:'Tirou 10 em uma prova', icon:'star', unlocked:false },
  { title:'Mente organizada', desc:'Zerou o quadro de pendentes', icon:'list-checks', unlocked:false },
];

const ANNOUNCEMENTS = [
  { author:'Profa. Helena', subject:'Matemática', text:'A prova de sexta-feira abordará os capítulos 4 e 5. Tragam calculadora.', time:'2h atrás', urgent:true },
  { author:'Prof. Diego', subject:'Português', text:'Entrega da redação prorrogada para segunda-feira.', time:'1 dia atrás', urgent:false },
];

const AI_TIPS = [
  "Tente a técnica Pomodoro: 25 min de foco total e 5 de pausa. Repita 4 vezes e faça uma pausa longa.",
  "Revisar o conteúdo 24h depois de aprender fixa muito mais que reler no mesmo dia.",
  "Divida tarefas grandes em blocos de 15-20 minutos — começar é a parte mais difícil.",
  "Explique o que você aprendeu em voz alta, como se estivesse ensinando alguém. É uma das formas mais eficazes de fixar conteúdo.",
  "Durma bem antes de provas: a memória se consolida durante o sono.",
  "Repetição espaçada funciona melhor que reler o mesmo texto várias vezes seguidas.",
  "Alterne entre matérias diferentes na mesma sessão de estudo — isso melhora a retenção a longo prazo."
];

let FLASHCARDS = {};

const QUIZ_BANK = {
  mat: [{ q:'Qual é a fórmula de Bhaskara usada para?', opts:['Resolver equações do 2º grau','Calcular área do círculo','Somar frações','Derivar funções'], correct:0 }],
  por: [{ q:'O que é coesão textual?', opts:['Rima entre versos','Conexão lógica entre as partes do texto','Tamanho do parágrafo','Uso de maiúsculas'], correct:1 }],
  his: [{ q:'A Era Vargas teve início em qual década?', opts:['1910','1930','1950','1970'], correct:1 }],
  cie: [{ q:'Qual estrutura é responsável pela respiração celular?', opts:['Núcleo','Ribossomo','Mitocôndria','Vacúolo'], correct:2 }],
  ing: [{ q:'Qual o passado simples do verbo "go"?', opts:['Goed','Gone','Went','Going'], correct:2 }],
  geo: [{ q:'O que caracteriza um clima tropical?', opts:['Temperaturas baixas o ano todo','Chuvas escassas e frio constante','Altas temperaturas e estações de seca/chuva','Neve frequente'], correct:2 }],
};

let SESSIONS = [
  { subject:'cie', minutes:25, when:'Ontem, 19:40' },
  { subject:'mat', minutes:25, when:'Ontem, 16:10' },
];

const HEATMAP_WEEKS = 14;
const STUDY_HEATMAP = Array.from({length: HEATMAP_WEEKS*7}, (_, i) => {
  const fromEnd = HEATMAP_WEEKS*7 - i;
  const base = Math.random();
  const boost = fromEnd <= 6 ? 0.4 : 0;
  const v = Math.min(1, base*0.75 + boost);
  return v < 0.18 ? 0 : v < 0.4 ? 1 : v < 0.6 ? 2 : v < 0.82 ? 3 : 4;
});

/* ================================================================
   2. UTILITÁRIOS
   ================================================================ */
function $(sel, ctx=document){ return ctx.querySelector(sel); }
function $all(sel, ctx=document){ return [...ctx.querySelectorAll(sel)]; }
function icon(name, extra=''){ return `<i data-lucide="${name}" ${extra}></i>`; }
function subjectById(id){ return SUBJECTS.find(s=>s.id===id); }
function refreshIcons(){ if(window.lucide) lucide.createIcons(); }

function toast(msg, ic='check-circle-2'){
  const wrap = $('#toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(ic)}<span>${msg}</span>`;
  wrap.appendChild(el);
  refreshIcons();
  setTimeout(()=>{ el.style.transition='opacity .3s'; el.style.opacity='0'; setTimeout(()=>el.remove(),300); }, 3200);
}

function initials(name){ return name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }

/* ================================================================
   3. TEMA (claro / escuro) & MODO NÃO PERTURBE
   ================================================================ */
function applyTheme(t){
  state.theme = t;
  document.body.setAttribute('data-theme', t);
  const ic = t === 'dark' ? 'sun' : 'moon';
  $('#theme-toggle-login-btn').innerHTML = icon(ic);
  $('#theme-toggle-app') && ($('#theme-toggle-app').innerHTML = icon(ic));
  refreshIcons();
}
$('#theme-toggle-login-btn').addEventListener('click', ()=> applyTheme(state.theme==='light'?'dark':'light'));
$('#theme-toggle-app').addEventListener('click', ()=> applyTheme(state.theme==='light'?'dark':'light'));

/* ---- seletor de acento de cor (Configurações) ---- */
const ACCENTS = {
  frances: { pen:'#3E4B8E', penDeep:'#2C376B', marker:'#F0CE86', markerInk:'#4A3612' },
  vinho:   { pen:'#7C3450', penDeep:'#5C2339', marker:'#E8CB84', markerInk:'#3F1521' },
  musgo:   { pen:'#3E7A5B', penDeep:'#2C5A42', marker:'#F0CE86', markerInk:'#4A3612' },
};
function applyAccent(id){
  state.accent = id;
  const a = ACCENTS[id] || ACCENTS.frances;
  document.documentElement.style.setProperty('--pen', a.pen);
  document.documentElement.style.setProperty('--pen-deep', a.penDeep);
  document.documentElement.style.setProperty('--marker', a.marker);
  document.documentElement.style.setProperty('--marker-ink', a.markerInk);
}

$('#dnd-switch').addEventListener('click', function(){
  state.dnd = !state.dnd;
  this.classList.toggle('on', state.dnd);
  toast(state.dnd ? 'Modo Não Perturbe ativado — outros apps silenciados.' : 'Modo Não Perturbe desativado.', state.dnd?'bell-off':'bell');
});

/* ================================================================
   4. LOGIN
   ================================================================ */
$all('.role-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    $all('.role-card').forEach(c=>c.classList.remove('active'));
    card.classList.add('active');
    state.role = card.dataset.role;
    $('#login-role-label').textContent = state.role === 'responsavel' ? 'responsável' : state.role;
  });
});

$('#login-form').addEventListener('submit', function(e){
  e.preventDefault();
  const btn = $('#login-submit');
  const email = $('#login-email').value || 'aluno@estudemais.com';
  btn.innerHTML = `<span class="spinner"></span> Entrando...`;
  btn.disabled = true;
  setTimeout(()=>{
    state.userName = email.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c=>c.toUpperCase());
    enterApp();
  }, 850);
});

function enterApp(){
  $('#login-screen').style.animation = 'fadeIn .3s ease reverse';
  setTimeout(()=>{
    $('#login-screen').classList.add('hidden');
    $('#app').classList.remove('hidden');
    $('#ai-assistant').classList.remove('hidden');
    buildNav();
    goTo(defaultPageFor(state.role));
    $('#sidebar-avatar').textContent = initials(state.userName || 'Aluno Estude');
    $('#sidebar-name').textContent = state.userName || 'Aluno Estude';
    $('#sidebar-role').textContent = state.role;
    renderNotifications();
    initAI();
    initCommandPalette();
    initKeyboardShortcuts();
    toast(`Bem-vindo(a), ${ (state.userName||'').split(' ')[0] || 'por aqui'}!`, 'sparkles');
  }, 280);
}

$('#logout-btn').addEventListener('click', ()=>{
  $('#app').classList.add('hidden');
  $('#ai-assistant').classList.add('hidden');
  $('#login-screen').classList.remove('hidden');
  $('#login-screen').style.animation = 'fadeIn .3s ease';
  $('#login-submit').disabled = false;
  $('#login-btn-text').innerHTML = `Entrar como <span id="login-role-label">${state.role}</span>`;
});

/* pré-visualização do mapa de calor na tela de login (decorativo, estático) */
(function renderLoginHeat(){
  const el = $('#login-heat'); if(!el) return;
  el.innerHTML = Array.from({length:64}, ()=>{
    const v = Math.random();
    const lvl = v<.3?0:v<.5?1:v<.7?2:v<.88?3:4;
    return `<div class="lh-cell" style="background:${lvl===0?'':'rgba(240,206,134,'+(lvl*0.28)+')'}"></div>`;
  }).join('');
})();

/* ================================================================
   5. NAVEGAÇÃO — itens diferem por perfil
   ================================================================ */
const NAV_BY_ROLE = {
  aluno: [
    { group:'Estudo', items:[
      {id:'inicio', label:'Início', ic:'layout-dashboard'},
      {id:'calendario', label:'Calendário', ic:'calendar-days'},
      {id:'eisenhower', label:'Prioridades', ic:'grid-2x2'},
      {id:'materias', label:'Matérias', ic:'book-open'},
      {id:'foco', label:'Foco', ic:'timer'},
    ]},
    { group:'Progresso', items:[
      {id:'graficos', label:'Desempenho', ic:'bar-chart-3'},
      {id:'notas', label:'Notas', ic:'graduation-cap'},
      {id:'conquistas', label:'Conquistas', ic:'trophy'},
    ]},
    { group:'Sistema', items:[
      {id:'avisos', label:'Mural', ic:'megaphone', badge:2},
      {id:'config', label:'Config.', ic:'settings'},
    ]},
  ],
  professor: [
    { group:'Turma', items:[
      {id:'inicio', label:'Painel', ic:'layout-dashboard'},
      {id:'materias', label:'Matérias', ic:'book-open'},
      {id:'calendario', label:'Calendário', ic:'calendar-days'},
      {id:'carga', label:'Carga horária', ic:'gauge'},
    ]},
    { group:'Avaliação', items:[
      {id:'notas', label:'Lançar notas', ic:'graduation-cap'},
      {id:'graficos', label:'Desempenho', ic:'bar-chart-3'},
      {id:'auditoria', label:'Auditoria', ic:'clipboard-list'},
      {id:'avisos', label:'Mural', ic:'megaphone'},
    ]},
    { group:'Sistema', items:[ {id:'config', label:'Config.', ic:'settings'} ]},
  ],
  responsavel: [
    { group:'Acompanhamento', items:[
      {id:'inicio', label:'Visão geral', ic:'layout-dashboard'},
      {id:'graficos', label:'Desempenho', ic:'bar-chart-3'},
      {id:'notas', label:'Boletim', ic:'graduation-cap'},
      {id:'auditoria', label:'Auditoria', ic:'clipboard-list'},
      {id:'calendario', label:'Calendário', ic:'calendar-days'},
    ]},
    { group:'Sistema', items:[
      {id:'avisos', label:'Mural', ic:'megaphone'},
      {id:'config', label:'Config.', ic:'settings'},
    ]},
  ],
};

function defaultPageFor(role){ return 'inicio'; }

function buildNav(){
  const groups = NAV_BY_ROLE[state.role];
  const navEl = $('#nav-links');
  const mobEl = $('#mobile-nav');
  navEl.innerHTML = ''; mobEl.innerHTML = '';
  groups.forEach((g,gi)=>{
    if(gi>0) navEl.innerHTML += `<span style="width:1px;align-self:stretch;background:var(--graphite-line);margin:6px 4px;flex-shrink:0;"></span>`;
    g.items.forEach(it=>{
      navEl.innerHTML += `<a class="nav-link" data-page="${it.id}" href="#" title="${g.group}">${icon(it.ic)}<span>${it.label}</span>${it.badge?`<span class="badge">${it.badge}</span>`:''}</a>`;
      mobEl.innerHTML += `<a class="nav-link" data-page="${it.id}" href="#">${icon(it.ic)}<span>${it.label}</span></a>`;
    });
  });
  $all('.nav-link').forEach(l=> l.addEventListener('click', e=>{ e.preventDefault(); goTo(l.dataset.page); }));
  refreshIcons();
}

const PAGE_TITLES = {
  inicio:'Início', calendario:'Calendário', materias:'Matérias', foco:'Foco',
  graficos:'Desempenho', notas:'Notas', conquistas:'Conquistas', avisos:'Mural de avisos', config:'Configurações',
  materia_detalhe:'Matéria',
  eisenhower:'Matriz de Eisenhower', carga:'Carga horária', auditoria:'Auditoria',
};

function goTo(page, extra){
  state.page = page;
  $('#topbar-title') && ($('#topbar-title').textContent = PAGE_TITLES[page] || 'Estude Mais');
  document.title = `${PAGE_TITLES[page]||'Estude Mais'} · Estude Mais`;
  $all('.nav-link').forEach(l=> l.classList.toggle('active', l.dataset.page===page));
  const renderFn = RENDERERS[page];
  $('#page-root').innerHTML = renderFn ? renderFn(extra) : '';
  refreshIcons();
  attachPageEvents(page, extra);
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ================================================================
   6. RENDERIZADORES DE PÁGINA
   ================================================================ */
const RENDERERS = {
  inicio: renderInicio,
  calendario: renderCalendario,
  materias: renderMaterias,
  materia_detalhe: renderMateriaDetalhe,
  foco: renderFoco,
  graficos: renderGraficos,
  notas: renderNotas,
  conquistas: renderConquistas,
  avisos: renderAvisos,
  config: renderConfig,
  eisenhower: renderEisenhower,
  carga: renderCarga,
  auditoria: renderAuditoria,
};

/* ---------------- INÍCIO ---------------- */
function renderInicio(){
  const isAluno = state.role==='aluno';
  const doneCount = TASKS.filter(t=>t.done).length;
  const pct = TASKS.length ? Math.round(doneCount/TASKS.length*100) : 0;

  const greetingName = (state.userName||'por aqui').split(' ')[0];
  const hero = isAluno ? `
    <div class="card hero-card reveal">
      <div class="hero-decor"></div>
      <span class="chip chip-amber" style="background:rgba(255,255,255,.1); color:#fff;">${todayLabel()}</span>
      <h2>Olá, <span class="marker">${greetingName}</span>. Vamos estudar hoje?</h2>
      <p>Você tem ${TASKS.filter(t=>!t.done).length} tarefas pendentes e uma sequência de ${state.streak} dias.</p>
      <div class="hero-stats">
        <div class="hero-stat"><b class="mono">${state.streak}</b><span>Dias seguidos</span></div>
        <div class="hero-stat"><b class="mono">${state.weekFocusHours.reduce((a,b)=>a+b,0).toFixed(1)}h</b><span>Foco esta semana</span></div>
        <div class="hero-stat"><b class="mono">Nv. ${state.level}</b><span>${state.xp}/${state.xpNext} XP</span></div>
      </div>
      <div class="hero-quickadd">
        <input id="quickadd-input" placeholder="Adicionar tarefa rápida... (ex: Revisar Cap. 5 de História)">
        <button class="btn btn-marker btn-sm" id="quickadd-btn">${icon('plus','style="width:14px;height:14px"')} Adicionar</button>
      </div>
    </div>` : isRoleProfessor() ? `
    <div class="card hero-card reveal">
      <div class="hero-decor"></div>
      <span class="chip chip-amber" style="background:rgba(255,255,255,.1); color:#fff;">${todayLabel()}</span>
      <h2>Bom trabalho, professor(a) <span class="marker">${greetingName}</span>!</h2>
      <p>Você tem 6 turmas ativas, 2 materiais pendentes de revisão e 1 aviso agendado.</p>
      <div class="hero-stats">
        <div class="hero-stat"><b class="mono">128</b><span>Alunos</span></div>
        <div class="hero-stat"><b class="mono">6</b><span>Turmas</span></div>
        <div class="hero-stat"><b class="mono">92%</b><span>Entregas em dia</span></div>
      </div>
    </div>` : `
    <div class="card hero-card reveal">
      <div class="hero-decor"></div>
      <span class="chip chip-amber" style="background:rgba(255,255,255,.1); color:#fff;">${todayLabel()}</span>
      <h2>Acompanhe o progresso do seu <span class="marker">filho(a)</span></h2>
      <p>Nas últimas 24h: 2 tarefas concluídas e ${state.weekFocusHours[5].toFixed(1)}h de estudo focado.</p>
      <div class="hero-stats">
        <div class="hero-stat"><b class="mono">${state.streak}</b><span>Dias de sequência</span></div>
        <div class="hero-stat"><b class="mono">${state.weekFocusHours.reduce((a,b)=>a+b,0).toFixed(1)}h</b><span>Estudo na semana</span></div>
        <div class="hero-stat"><b class="mono">7.9</b><span>Média geral</span></div>
      </div>
    </div>`;

  const ringCard = `
    <div class="card daily-ring-card reveal" style="animation-delay:.05s">
      <div class="ring-wrap">
        <svg viewBox="0 0 132 132" width="132" height="132">
          <circle class="ring-bg" cx="66" cy="66" r="55"></circle>
          <circle class="ring-fg" id="daily-ring" cx="66" cy="66" r="55"></circle>
        </svg>
        <div class="ring-center"><b class="mono">${pct}%</b><span>hoje</span></div>
      </div>
      <h3>Progresso diário</h3>
      <p>${doneCount} de ${TASKS.length} atividades concluídas</p>
    </div>`;

  const taskList = TASKS.slice(0,5).map(t=>{
    const sub = subjectById(t.subject);
    const urgent = !t.done && classifyEisenhower(t)==='urgimp';
    return `<div class="task-row">
      <div class="task-check ${t.done?'done':''}" data-id="${t.id}">${icon('check')}</div>
      <div class="task-info">
        <div class="t-title ${t.done?'done':''}">${t.title}</div>
        <div class="t-meta"><span class="dot-tag" style="background:${sub.color}"></span>${sub.name} · ${t.due}</div>
      </div>
      ${urgent ? `<span class="priority-flag chip chip-rose">${icon('flame','style="width:11px;height:11px"')} Urgente</span>` : ''}
    </div>`;
  }).join('');

  return `
    <div class="grid-2">
      ${hero}
      ${ringCard}
    </div>

    <div class="section-title"><h3>Tarefas mais próximas</h3><a class="link-more" data-goto="calendario">Ver tudo ${icon('arrow-right', 'style="width:14px;height:14px"')}</a></div>
    <div class="card reveal">${taskList || `<div class="empty-state">${icon('inbox')}<p>Nenhuma tarefa por aqui. Aproveite para revisar algo antigo!</p></div>`}</div>

    <div class="section-title"><h3>Mapa de estudo</h3><span style="font-size:.76rem;color:var(--ink-faint)">últimas ${HEATMAP_WEEKS} semanas</span></div>
    <div class="card heatmap-card reveal">${buildHeatmap()}</div>
  `;
}

function todayLabel(){
  const d = new Date();
  return d.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' });
}
function isRoleProfessor(){ return state.role==='professor'; }

/* mapa de calor de estudo — grade estilo "contribuições", 7 linhas x N semanas */
function buildHeatmap(){
  const today = new Date();
  const cells = STUDY_HEATMAP.map((lvl, i)=>{
    const fromEnd = STUDY_HEATMAP.length - 1 - i;
    const d = new Date(today); d.setDate(d.getDate() - fromEnd);
    const label = d.toLocaleDateString('pt-BR', {day:'2-digit', month:'short'});
    const hrs = (lvl*0.7).toFixed(1);
    return `<div class="hm-cell" data-level="${lvl}" data-tip="${label} · ${lvl===0?'sem estudo':hrs+'h'}"></div>`;
  }).join('');
  return `
    <div class="heatmap-grid">${cells}</div>
    <div class="heatmap-legend">
      <span>Menos</span>
      <div class="hm-cell" data-level="0"></div><div class="hm-cell" data-level="1"></div>
      <div class="hm-cell" data-level="2"></div><div class="hm-cell" data-level="3"></div><div class="hm-cell" data-level="4"></div>
      <span>Mais</span>
    </div>`;
}

/* ---------------- CALENDÁRIO ---------------- */
function renderCalendario(){
  const monthsHtml = [0,1].map(off => buildMiniMonth(state.monthOffset+off)).join('');
  const board = buildKanban();
  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Planejamento</p><h2 style="font-size:1.4rem;">Seus calendários</h2></div>
      <div class="month-nav">
        <button class="icon-btn" id="cal-prev">${icon('chevron-left')}</button>
        <button class="icon-btn" id="cal-next">${icon('chevron-right')}</button>
        <button class="btn btn-primary btn-sm" id="add-event-btn">${icon('plus', 'style="width:14px;height:14px"')} Novo evento</button>
      </div>
    </div>

    <div class="months-wrap reveal">${monthsHtml}</div>

    <div class="card week-card reveal">
      <div class="section-title" style="margin:0 0 4px;"><h3>Semana detalhada</h3><span style="font-size:.76rem;color:var(--ink-faint)">arraste eventos entre os dias</span></div>
      ${buildWeekGrid()}
    </div>

    <div class="section-title"><h3>Quadro de status</h3></div>
    ${board}
  `;
}

function buildMiniMonth(offset){
  const base = new Date(); base.setMonth(base.getMonth()+offset);
  const y = base.getFullYear(), m = base.getMonth();
  const monthName = base.toLocaleDateString('pt-BR', {month:'long', year:'numeric'});
  const firstDow = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const daysInPrev = new Date(y,m,0).getDate();
  const todayStr = new Date().toDateString();
  let cells = '';
  for(let i=0;i<firstDow;i++) cells += `<div class="cal-day out">${daysInPrev-firstDow+1+i}</div>`;
  for(let d=1; d<=daysInMonth; d++){
    const thisDate = new Date(y,m,d);
    const isToday = thisDate.toDateString()===todayStr;
    const hasEvent = (d % 4 === 0);
    const evColor = SUBJECTS[d % SUBJECTS.length].color;
    cells += `<div class="cal-day ${isToday?'today':''}">${d}${hasEvent?`<span class="ev-dot" style="background:${evColor}"></span>`:''}</div>`;
  }
  const dows = ['D','S','T','Q','Q','S','S'];
  return `<div class="card mini-cal">
    <b style="font-size:.88rem; text-transform:capitalize;">${monthName}</b>
    <div class="cal-grid">${dows.map(d=>`<div class="cal-dow">${d}</div>`).join('')}${cells}</div>
  </div>`;
}

function buildWeekGrid(){
  const dows = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const sample = [
    [{s:'mat',t:'Prova'}],
    [{s:'por',t:'Redação'}],
    [], [{s:'his',t:'Seminário'}, {s:'cie',t:'Lab'}],
    [{s:'ing',t:'Quiz'}], [], []
  ];
  return `<div class="week-grid">${dows.map((d,i)=>`
    <div class="week-col" data-day="${i}">
      <div class="wc-head">${d}</div>
      ${(sample[i]||[]).map(ev=>`<div class="week-ev" style="border-color:${subjectById(ev.s).color}" draggable="true">${ev.t}</div>`).join('') || '<div style="text-align:center;font-size:.65rem;color:var(--ink-faint);padding-top:14px;">—</div>'}
    </div>`).join('')}</div>`;
}

function buildKanban(){
  const cols = [
    {id:'pendente', label:'Pendentes', color:'amber'},
    {id:'andamento', label:'Em andamento', color:'sky'},
    {id:'concluida', label:'Concluídas', color:'sage'},
  ];
  return `<div class="status-board">${cols.map(c=>{
    const items = TASKS.filter(t=>t.status===c.id);
    return `<div class="status-col" data-status="${c.id}">
      <div class="sc-head"><b>${c.label}</b><span class="status-count">${items.length}</span></div>
      ${items.map(t=>`
        <div class="kanban-card" draggable="true" data-id="${t.id}">
          <div class="kc-title">${t.title}</div>
          <div class="kc-meta"><span class="dot-tag" style="background:${subjectById(t.subject).color}"></span>${subjectById(t.subject).name} · ${t.due}</div>
        </div>`).join('') || '<div style="font-size:.72rem;color:var(--ink-faint);text-align:center;padding:14px 0;">Sem itens</div>'}
    </div>`;
  }).join('')}</div>`;
}

/* ---------------- MATÉRIAS ---------------- */
function renderMaterias(){
  const cards = SUBJECTS.map(s=>`
    <div class="card subject-card reveal" data-subject="${s.id}">
      <div class="subject-top">
        <div class="subject-ic" style="background:${s.color}">${icon(s.icon)}</div>
        <div><b>${s.name}</b><br><span>${s.teacher}</span></div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%; background:${s.color}"></div></div>
      <div class="subject-mastery">${icon('brain','style="width:12px;height:12px"')} domínio ${s.mastery}% · ${(MATERIALS[s.id]||[]).length} materiais</div>
    </div>`).join('');
  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Central de disciplinas</p><h2 style="font-size:1.4rem;">Matérias</h2></div>
      ${state.role==='professor' ? `<button class="btn btn-primary btn-sm" id="new-subject-btn">${icon('plus','style="width:14px;height:14px"')} Nova turma</button>`:''}
    </div>
    <div class="grid-3">${cards}</div>
  `;
}

function renderMateriaDetalhe(subId){
  const s = subjectById(subId) || SUBJECTS[0];
  const mats = MATERIALS[s.id] || [];
  const canUpload = state.role==='professor';
  const isProf = state.role==='professor';
  return `
    <button class="btn btn-ghost btn-sm" id="back-materias" style="margin-bottom:16px;">${icon('arrow-left','style="width:14px;height:14px"')} Voltar</button>
    <div class="card subject-detail reveal">
      <div class="sd-head">
        <div class="subject-ic" style="background:${s.color}; width:48px;height:48px;">${icon(s.icon,'style="width:22px;height:22px"')}</div>
        <div><h2 style="font-size:1.2rem;">${s.name}</h2><span style="font-size:.78rem;color:var(--ink-faint)">${s.teacher} · ${s.progress}% do conteúdo concluído</span></div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" data-tab="conteudo">Conteúdo</button>
        <button class="tab-btn" data-tab="flash">Flashcards (SRS)</button>
        <button class="tab-btn" data-tab="quiz">Quiz rápido</button>
        <button class="tab-btn" data-tab="cornell">Notas Cornell</button>
        <button class="tab-btn" data-tab="anexos">Arquivos</button>
        ${isProf ? `<button class="tab-btn" data-tab="analytics">Analytics de leitura</button>` : ''}
      </div>

      <div id="tab-conteudo" class="tab-pane">
        <p style="font-size:.83rem;color:var(--ink-soft); margin-bottom:14px;">Trilha de conteúdos e atividades desta disciplina, organizados por unidade.</p>
        ${['Unidade 1 — Fundamentos','Unidade 2 — Aplicações','Unidade 3 — Revisão'].map((u,i)=>`
          <div class="task-row" style="padding:12px 0;">
            <div class="task-check ${i===0?'done':''}">${icon('check')}</div>
            <div class="task-info"><div class="t-title ${i===0?'done':''}">${u}</div><div class="t-meta">${i===0?'Concluído':'3 atividades'} </div></div>
          </div>`).join('')}
      </div>

      <div id="tab-flash" class="tab-pane hidden">
        <p style="font-size:.8rem;color:var(--ink-soft); margin-bottom:12px;">Algoritmo de repetição espaçada (SM-2 simplificado, estilo Anki): sem pontos nem prêmios — apenas o cálculo do melhor momento para revisar antes que o cérebro esqueça.</p>
        <div class="flash-grid" id="flash-grid">
          ${buildFlashcards(s).map(c=>flashcardHtml(c)).join('')}
        </div>
        <button class="btn btn-ghost btn-sm" id="add-flashcard-btn" style="margin-top:14px;">${icon('plus','style="width:14px;height:14px"')} Criar flashcard</button>
      </div>

      <div id="tab-quiz" class="tab-pane hidden">
        ${buildQuiz(s)}
      </div>

      <div id="tab-cornell" class="tab-pane hidden">
        ${buildCornell(s)}
      </div>

      <div id="tab-anexos" class="tab-pane hidden">
        ${canUpload ? `
        <div class="upload-broadcast">
          <span style="display:flex;align-items:center;gap:8px;">${icon('users','style="width:14px;height:14px"')} Enviar para todos os alunos da turma</span>
          <div class="switch on" id="broadcast-switch"></div>
        </div>
        <div class="upload-zone" id="upload-zone">
          ${icon('upload-cloud')}
          <p><b>Envie materiais para a turma</b><br>Clique para simular envio de PDFs e listas de exercícios</p>
          <div class="upload-progress hidden" id="upload-progress"><span id="upload-progress-fill"></span></div>
        </div>` : ''}
        <div id="materials-list">
          ${mats.length ? mats.map((m,i)=>materialRow(m,s.id,i)).join('') : `<div class="empty-state">${icon('folder-open')}<p>Nenhum material enviado ainda.</p></div>`}
        </div>
      </div>

      ${isProf ? `<div id="tab-analytics" class="tab-pane hidden">${buildReadingAnalytics(s)}</div>` : ''}
    </div>
  `;
}

function materialRow(m, subId, idx){
  const ic = m.type==='pdf' ? 'file-text' : m.type==='doc' ? 'file-type' : 'image';
  return `<div class="material-row">
    <div class="m-ic">${icon(ic)}</div>
    <div class="m-info"><b>${m.name}</b><span>${m.size}</span></div>
    <button class="icon-btn" style="width:32px;height:32px;" data-open-material="${subId}:${idx}">${icon('download','style="width:14px;height:14px"')}</button>
  </div>`;
}

/* ---- flashcards com repetição espaçada (SM-2 simplificado) ---- */
function buildFlashcards(s){
  if(FLASHCARDS[s.id]) return FLASHCARDS[s.id];
  const sample = [
    {q:`Defina um conceito-chave de ${s.name}`, a:'Resposta gerada pelo aluno ao estudar o tema.'},
    {q:'Cite um exemplo prático', a:'Exemplo relacionado ao conteúdo da unidade atual.'},
    {q:'Qual a principal fórmula/regra?', a:'Anote aqui a regra central estudada.'},
  ];
  const now = Date.now();
  FLASHCARDS[s.id] = sample.map((c,i)=>({
    id:`${s.id}-${i}`, q:c.q, a:c.a,
    interval: 1, ease: 2.5, reps: 0,
    due: now + (i===0 ? -1000 : i*36e5),
  }));
  return FLASHCARDS[s.id];
}

function flashcardHtml(c){
  const now = Date.now();
  const daysLeft = Math.ceil((c.due-now)/86400000);
  const dueClass = daysLeft<=0 ? 'due-today' : 'due-later';
  const dueLabel = daysLeft<=0 ? 'Revisar hoje' : `em ${daysLeft}d`;
  return `
    <div class="flashcard" data-id="${c.id}">
      <span class="flash-due ${dueClass}">${dueLabel}</span>
      <div class="flashcard-inner">
        <div class="flash-face front">${c.q}</div>
        <div class="flash-face back">
          <div>
            <div>${c.a}</div>
            <div class="flash-rate">
              <button class="btn-fail" data-rate="fail" data-id="${c.id}">Errei</button>
              <button class="btn-ok" data-rate="ok" data-id="${c.id}">Acertei</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function rateFlashcard(subId, cardId, rating){
  const list = FLASHCARDS[subId]; if(!list) return;
  const card = list.find(c=>c.id===cardId); if(!card) return;
  if(rating==='ok'){
    card.reps += 1;
    if(card.reps === 1) card.interval = 1;
    else if(card.reps === 2) card.interval = 6;
    else card.interval = Math.round(card.interval * card.ease);
    card.ease = Math.min(2.8, card.ease + 0.05);
    toast(`Próxima revisão em ${card.interval} dia(s) (SM-2).`, 'check-circle-2');
  } else {
    card.reps = 0;
    card.interval = 1;
    card.ease = Math.max(1.3, card.ease - 0.2);
    toast('Sem problema — este cartão volta amanhã.', 'rotate-ccw');
  }
  card.due = Date.now() + card.interval*86400000;
}

/* ---- quiz de recordação ativa ---- */
function buildQuiz(s){
  const questions = QUIZ_BANK[s.id] || [];
  if(!questions.length) return `<div class="empty-state">${icon('help-circle')}<p>Nenhuma pergunta cadastrada para esta matéria ainda.</p></div>`;
  const q = questions[0];
  return `
    <div class="quiz-box card" style="border:none; padding:0;">
      <p class="quiz-q">${q.q}</p>
      <div id="quiz-opts">
        ${q.opts.map((o,i)=>`<button class="quiz-opt" data-i="${i}" data-correct="${q.correct}">${o}</button>`).join('')}
      </div>
      <div class="quiz-score" style="margin-top:12px;">${icon('target','style="width:14px;height:14px"')} <span id="quiz-feedback">Selecione uma alternativa para testar seu conhecimento.</span></div>
    </div>`;
}

/* ---------------- FOCO / POMODORO + TIME-TRACKING ---------------- */
function renderFoco(){
  const pct = 1 - state.pomodoro.seconds/state.pomodoro.total;
  const circumference = 2*Math.PI*80;
  const ambientOptions = [
    {id:'silencio', label:'Silêncio', ic:'volume-x'},
    {id:'chuva', label:'Chuva', ic:'cloud-rain'},
    {id:'biblioteca', label:'Biblioteca', ic:'library'},
  ];
  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Gestão de foco</p><h2 style="font-size:1.4rem;">Modo Foco</h2></div>
      <div class="mode-tabs" id="focus-top-tabs">
        <button class="mode-tab active" data-fmode="pomodoro">Pomodoro</button>
        <button class="mode-tab" data-fmode="tracking">Cronômetro (carga horária)</button>
      </div>
    </div>

    <div id="focus-pomodoro-view">
    <div class="grid-2">
      <div class="card focus-card reveal">
        <div class="subject-picker" id="subject-picker">
          ${SUBJECTS.map(s=>`<button class="subject-pick ${state.pomodoro.subject===s.id?'active':''}" data-subject="${s.id}"><span class="sp-dot" style="background:${s.color}"></span>${s.name}</button>`).join('')}
        </div>
        <div class="mode-tabs">
          <button class="mode-tab active" data-mode="foco">Foco 25min</button>
          <button class="mode-tab" data-mode="pausa">Pausa 5min</button>
          <button class="mode-tab" data-mode="longa">Pausa longa</button>
        </div>
        <div class="pomodoro-ring">
          <svg viewBox="0 0 180 180" width="200" height="200">
            <circle cx="90" cy="90" r="80" fill="none" stroke="var(--line)" stroke-width="11"/>
            <circle id="pomo-circle" cx="90" cy="90" r="80" fill="none" stroke="var(--pen)" stroke-width="11" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${circumference*(1-pct)}" style="transition: stroke-dashoffset 1s linear"/>
          </svg>
          <div class="pomodoro-time" id="pomo-time">${fmtTime(state.pomodoro.seconds)}</div>
        </div>
        <p style="color:var(--ink-soft); font-size:.83rem; margin-bottom:6px;">O Modo Não Perturbe pode silenciar notificações automaticamente durante o foco.</p>
        <div class="pomodoro-controls">
          <button class="btn btn-marker" id="pomo-toggle">${icon('play','style="width:15px;height:15px"')} Iniciar</button>
          <button class="btn btn-ghost" id="pomo-reset">${icon('rotate-ccw','style="width:15px;height:15px"')} Reiniciar</button>
        </div>
        <div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--line);">
          <div class="dnd-toggle" style="border:none; padding:0; color:var(--ink-soft); justify-content:center; gap:14px;">
            <span style="display:flex; align-items:center; gap:8px; font-size:.85rem;">${icon('lock','style="width:16px;height:16px"')} Modo Foco rígido (bloqueio de distrações)</span>
            <div class="switch" id="focus-lock-switch"></div>
          </div>
          <p style="font-size:.72rem; color:var(--ink-faint); margin-top:8px; text-align:center;">
            Um navegador não tem permissão de sistema operacional para bloquear outros apps de verdade —
            por isso simulamos o bloqueio com uma tela de foco em tela cheia e registramos "tentativas de distração"
            (trocas de aba) durante a sessão.
          </p>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:14px;">
        <div class="card" style="padding:18px;">
          <div class="section-title" style="margin:0 0 10px;"><h3 style="font-size:.9rem;">Som ambiente</h3></div>
          <div class="ambient-row" id="ambient-row">
            ${ambientOptions.map(a=>`<button class="ambient-btn ${state.ambientSound===a.id?'active':''}" data-sound="${a.id}">${icon(a.ic)}${a.label}</button>`).join('')}
          </div>
        </div>
        <div class="card" style="padding:18px;">
          <div class="dnd-toggle" style="border:none; padding:0; color:var(--ink-soft);">
            <span style="display:flex; align-items:center; gap:8px; font-size:.86rem;">${icon('bell-off','style="width:16px;height:16px"')}Silenciar outros apps</span>
            <div class="switch ${state.dnd?'on':''}" id="dnd-switch-2"></div>
          </div>
        </div>
        <div class="card" style="padding:18px;">
          <div class="section-title" style="margin:0 0 10px;"><h3 style="font-size:.9rem;">Sessões recentes</h3></div>
          <div class="session-log" id="session-log">${buildSessionLog()}</div>
        </div>
        <div class="card" style="padding:18px;">
          <div class="section-title" style="margin:0 0 8px;"><h3 style="font-size:.9rem;">Dica do dia</h3></div>
          <p style="font-size:.8rem;color:var(--ink-soft);">${AI_TIPS[0]}</p>
        </div>
      </div>
    </div>
    </div>

    <div id="focus-tracking-view" class="hidden">
      ${buildTimeTrackingView()}
    </div>
  `;
}
function fmtTime(s){ const m=Math.floor(s/60), sec=s%60; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

function buildSessionLog(){
  if(!SESSIONS.length) return `<div class="empty-state" style="padding:16px 0;">${icon('inbox')}<p>Nenhuma sessão registrada ainda.</p></div>`;
  return SESSIONS.slice(0,6).map(s=>{
    const sub = subjectById(s.subject);
    return `<div class="session-item"><span class="si-dot" style="background:${sub.color}"></span>${sub.name} · ${s.minutes} min<span class="si-time">${s.when}</span></div>`;
  }).join('');
}

/* ---------------- GRÁFICOS ---------------- */
function renderGraficos(){
  const days = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const max = Math.max(...state.weekFocusHours, 1);
  const bars = state.weekFocusHours.map((v,i)=>`
    <div class="bar-col">
      <div class="bar-fill" data-h="${(v/max*100)}" style="height:0%"><span class="bar-val">${v}h</span></div>
      <span>${days[i]}</span>
    </div>`).join('');

  const isResp = state.role==='responsavel';

  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Análise</p><h2 style="font-size:1.4rem;">Desempenho</h2></div>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-ghost btn-sm active-range" data-range="semana">Semana</button>
        <button class="btn btn-ghost btn-sm" data-range="mes">Mês</button>
      </div>
    </div>

    <div class="grid-2">
      <div class="card chart-card reveal">
        <div class="section-title" style="margin:0;"><h3>Horas estudadas por dia</h3></div>
        <div class="bar-chart" id="bar-chart">${bars}</div>
      </div>
      <div class="card chart-card reveal">
        <div class="section-title" style="margin:0;"><h3>Distribuição do tempo por matéria</h3></div>
        ${buildDonut()}
      </div>
    </div>

    <div class="grid-2">
      <div class="card chart-card reveal">
        <div class="section-title" style="margin:0;"><h3>Domínio por matéria</h3></div>
        <div class="radar-wrap">${buildRadar()}</div>
      </div>
      <div class="card chart-card reveal" style="display:flex; flex-direction:column; justify-content:center;">
        <div class="section-title" style="margin:0;"><h3>Metas da semana</h3></div>
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
          <div class="goal-card" style="border:none; padding:0;"><div class="g-ic">${icon('target')}</div><div><b class="mono" style="font-size:1.05rem;">10.5h</b><br><span style="font-size:.73rem;color:var(--ink-faint)">de 12h planejadas</span></div></div>
          <div class="goal-card" style="border:none; padding:0;"><div class="g-ic">${icon('check-circle-2')}</div><div><b class="mono" style="font-size:1.05rem;">18</b><br><span style="font-size:.73rem;color:var(--ink-faint)">tarefas concluídas</span></div></div>
          <div class="goal-card" style="border:none; padding:0;"><div class="g-ic">${icon('trending-up')}</div><div><b class="mono" style="font-size:1.05rem;">+12%</b><br><span style="font-size:.73rem;color:var(--ink-faint)">vs. semana anterior</span></div></div>
        </div>
      </div>
    </div>

    ${isResp ? `
    <div class="section-title"><h3>Relatório de consistência (dados brutos)</h3></div>
    <div class="grid-2">
      <div class="card chart-card reveal">
        <div class="section-title" style="margin:0;"><h3>Dispersão: horas dedicadas × nota obtida</h3></div>
        <div class="scatter-wrap">${buildScatterChart()}</div>
        <p style="font-size:.72rem; color:var(--ink-faint); margin-top:8px;">Cada ponto é uma avaliação; eixo X = horas de estudo registradas no Time-Tracking, eixo Y = nota obtida.</p>
      </div>
      <div class="card chart-card reveal">
        <div class="section-title" style="margin:0;"><h3>Índice de procrastinação</h3></div>
        ${buildProcrastinationIndex()}
      </div>
    </div>` : ''}
  `;
}

/* rosca: distribuição do tempo de estudo por matéria (SESSIONS + histórico do cronômetro) */
function buildDonut(){
  const totals = {};
  SUBJECTS.forEach(s=> totals[s.id]=0);
  SESSIONS.forEach(s=> totals[s.subject] = (totals[s.subject]||0) + s.minutes);
  (typeof timeTracker !== 'undefined' ? timeTracker.log : []).forEach(l=> totals[l.subject] = (totals[l.subject]||0) + Math.round(l.seconds/60));
  const totalMin = Object.values(totals).reduce((a,b)=>a+b,0) || 1;
  const r = 70, cx=84, cy=84, circumference = 2*Math.PI*r;
  let offsetAcc = 0;
  const arcs = SUBJECTS.filter(s=>totals[s.id]>0).map(s=>{
    const frac = totals[s.id]/totalMin;
    const dash = frac*circumference;
    const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="20"
      stroke-dasharray="${dash} ${circumference-dash}" stroke-dashoffset="${-offsetAcc}"></circle>`;
    offsetAcc += dash;
    return arc;
  }).join('');
  const legend = SUBJECTS.filter(s=>totals[s.id]>0).map(s=>{
    const pct = Math.round(totals[s.id]/totalMin*100);
    return `<div class="legend-item"><span class="ldot" style="background:${s.color}"></span>${s.name}<b>${pct}%</b></div>`;
  }).join('') || `<div class="legend-item">${icon('info','style="width:13px;height:13px"')} Ainda sem sessões registradas.</div>`;
  return `<div class="donut-wrap">
    <svg viewBox="0 0 168 168" width="168" height="168">${arcs || `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="20"/>`}</svg>
    <div class="legend">${legend}</div>
  </div>`;
}

/* radar de domínio: um eixo por matéria, valor 0-100 */
function buildRadar(){
  const cx=110, cy=110, r=84;
  const n = SUBJECTS.length;
  const angle = i => (Math.PI*2*i/n) - Math.PI/2;
  const point = (i, val) => {
    const rr = r*(val/100);
    return [cx + rr*Math.cos(angle(i)), cy + rr*Math.sin(angle(i))];
  };
  const rings = [25,50,75,100].map(pctv=>{
    const pts = SUBJECTS.map((s,i)=> point(i,pctv).join(',')).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="var(--line)" stroke-width="1"/>`;
  }).join('');
  const axes = SUBJECTS.map((s,i)=>{
    const [x,y] = point(i,100);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;
  }).join('');
  const dataPts = SUBJECTS.map((s,i)=> point(i,s.mastery).join(',')).join(' ');
  const labels = SUBJECTS.map((s,i)=>{
    const [x,y] = point(i,124);
    return `<text x="${x}" y="${y}" font-size="9.5" fill="var(--ink-faint)" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-body)">${s.name.slice(0,3)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 220 220" width="220" height="220">
    ${rings}${axes}
    <polygon points="${dataPts}" fill="var(--pen)" fill-opacity="0.18" stroke="var(--pen)" stroke-width="2"/>
    ${labels}
  </svg>`;
}

/* ---------------- NOTAS ---------------- */
function renderNotas(){
  const canEdit = state.role==='professor';
  const canSign = state.role==='responsavel';
  const rows = GRADES.map((g,i)=>{
    const cls = g.grade>=8 ? 'high' : g.grade>=6 ? 'mid' : 'low';
    return `<tr>
      <td><b>${g.subject}</b></td>
      <td>${g.bimestre}</td>
      <td>${canEdit ? `<input type="number" min="0" max="10" step="0.1" value="${g.grade}" style="width:58px;border:1px solid var(--line);border-radius:8px;padding:4px 8px;" data-grade-input="${i}">` : `<span class="grade-pill ${cls}">${g.grade.toFixed(1)}</span>`}</td>
      <td style="max-width:260px; font-size:.78rem; color:var(--ink-soft);">${canEdit ? `<input value="${g.feedback}" style="width:100%;border:1px solid var(--line);border-radius:8px;padding:6px 8px;font-size:.76rem;" data-feedback-input="${i}">` : g.feedback}</td>
      <td>${canSign ? `<button class="seen-btn ${g.seen?'seen':''}" data-seen="${i}">${icon('eye','style="width:14px;height:14px"')} ${g.seen?'Visto':'Marcar visto'}</button>` : (g.seen ? `<span class="chip chip-sage">${icon('check','style="width:11px;height:11px"')} Visto</span>` : `<span class="chip chip-amber">Pendente</span>`)}</td>
    </tr>`;
  }).join('');

  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Histórico</p><h2 style="font-size:1.4rem;">${canEdit?'Lançar notas':'Boletim & Notas'}</h2></div>
      <div style="display:flex; gap:8px;">
        ${canEdit ? `<button class="btn btn-primary btn-sm" id="save-grades-btn">${icon('save','style="width:14px;height:14px"')} Salvar alterações</button>` : ''}
        <button class="btn btn-ghost btn-sm" id="export-report-btn">${icon('file-down','style="width:14px;height:14px"')} Exportar relatório PDF</button>
      </div>
    </div>
    <div class="card reveal" style="overflow:auto;">
      <table class="grade-table">
        <thead><tr><th>Matéria</th><th>Período</th><th>Nota</th><th>Feedback do professor</th><th>${canSign?'Assinatura':'Status'}</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="card reveal" style="margin-top:16px; padding:20px;">
      <div class="section-title" style="margin:0 0 10px;"><h3 style="font-size:.92rem;">Média geral</h3></div>
      <div class="progress-track" style="height:8px;"><div class="progress-fill" style="width:${(GRADES.reduce((a,g)=>a+g.grade,0)/GRADES.length/10*100)}%"></div></div>
      <p style="margin-top:8px; font-size:.83rem; color:var(--ink-soft);">Média atual: <b class="mono">${(GRADES.reduce((a,g)=>a+g.grade,0)/GRADES.length).toFixed(1)}</b></p>
    </div>

    ${canEdit ? `
    <div class="section-title"><h3>Feedback diagnóstico — competências BNCC</h3></div>
    <div class="card reveal" style="padding:18px;">
      <p style="font-size:.78rem; color:var(--ink-soft); margin-bottom:8px;">Exemplo aplicado à Redação (Português). Ajuste as competências avaliadas e salve junto com a nota.</p>
      ${buildBnccPanel()}
    </div>` : ''}
  `;
}

/* ---------------- CONQUISTAS ---------------- */
function renderConquistas(){
  const cards = ACHIEVEMENTS.map(a=>`
    <div class="card achv-card reveal ${a.unlocked?'':'locked'}">
      <div class="a-ic">${icon(a.icon)}</div>
      <b>${a.title}</b><span>${a.desc}</span>
    </div>`).join('');
  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Gamificação</p><h2 style="font-size:1.4rem;">Conquistas</h2></div>
    </div>
    <div class="card level-card reveal">
      <div class="level-badge">${state.level}</div>
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><b style="font-size:.88rem;">${state.xp} / ${state.xpNext} XP</b><span class="streak-flame">${icon('flame','style="width:14px;height:14px"')} ${state.streak} dias</span></div>
        <div class="progress-track xp-track"><div class="progress-fill" style="width:${state.xp/state.xpNext*100}%"></div></div>
        <p style="font-size:.74rem; color:var(--ink-faint); margin-top:6px;">Faltam ${state.xpNext-state.xp} XP para o próximo nível</p>
      </div>
    </div>
    <div class="section-title"><h3>Selos conquistados</h3></div>
    <div class="grid-4">${cards}</div>
  `;
}

/* ---------------- MURAL DE AVISOS (corporativo) ---------------- */
function renderAvisos(){
  const canPost = state.role==='professor';
  const sorted = [...ANNOUNCEMENTS].sort((a,b)=> (b.ts||0)-(a.ts||0));
  const list = sorted.map((a,i)=>`
    <div class="mural-item ${a.urgent?'urgent':''}">
      <div class="mu-ic">${icon(a.urgent?'alert-triangle':'megaphone')}</div>
      <div style="flex:1;">
        <div style="font-size:.83rem;"><b>${a.author}</b> <span style="color:var(--ink-faint); font-weight:400;">· ${a.subject} · ${a.time}</span> ${a.urgent?'<span class="chip chip-rose" style="margin-left:6px;">Urgente</span>':''}</div>
        <p style="font-size:.83rem; color:var(--ink-soft); margin-top:3px;">${a.text}</p>
      </div>
      ${!canPost ? `<button class="btn btn-sm mural-read-btn ${a.read?'btn-ghost':'btn-primary'}" data-mural-read="${i}">${a.read? icon('check','style="width:13px;height:13px"')+' Lido e ciente' : 'Marcar como lido'}</button>` : ''}
    </div>`).join('');

  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Comunicação oficial</p><h2 style="font-size:1.4rem;">Mural de avisos</h2></div>
    </div>
    ${canPost ? `
      <div class="card compose-card reveal">
        <label style="font-size:.78rem; font-weight:600; color:var(--ink-soft); display:block; margin-bottom:8px;">Novo comunicado oficial para a turma</label>
        <textarea id="announce-text" placeholder="Escreva um aviso importante sobre a aula, prova ou material..."></textarea>
        <div class="compose-row">
          <div class="compose-priority" id="compose-priority">
            <button data-priority="normal" class="active">Normal</button>
            <button data-priority="urgente">Urgente</button>
          </div>
          <button class="btn btn-primary btn-sm" id="post-announce-btn">${icon('send','style="width:14px;height:14px"')} Publicar</button>
        </div>
      </div>` : ''}
    <div class="card reveal" style="padding: 6px 18px;">${list || `<div class="empty-state">${icon('inbox')}<p>Nenhum aviso publicado ainda.</p></div>`}</div>
  `;
}

/* ---------------- CONFIGURAÇÕES ---------------- */
function renderConfig(){
  const accents = [
    {id:'frances', label:'Azul-francês', color:'#3E4B8E'},
    {id:'vinho', label:'Vinho vintage', color:'#7C3450'},
    {id:'musgo', label:'Musgo', color:'#3E7A5B'},
  ];
  return `
    <div class="page-head"><div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Preferências</p><h2 style="font-size:1.4rem;">Configurações</h2></div></div>
    <div class="card reveal" style="padding: 6px 20px;">
      <div class="settings-row"><div class="s-info"><b>Tema escuro</b><span>Alterna entre modo claro e escuro</span></div><div class="switch ${state.theme==='dark'?'on':''}" id="settings-theme-switch"></div></div>
      <div class="settings-row"><div class="s-info"><b>Cor de destaque</b><span>Escolha a tinta e o marca-texto do app</span>
        <div class="palette-row" id="palette-row">${accents.map(a=>`<div class="palette-dot ${state.accent===a.id?'active':''}" data-accent="${a.id}" style="background:${a.color}" title="${a.label}"></div>`).join('')}</div>
      </div></div>
      <div class="settings-row"><div class="s-info"><b>Modo Não Perturbe</b><span>Silencia outros aplicativos durante o foco</span></div><div class="switch ${state.dnd?'on':''}" id="settings-dnd-switch"></div></div>
      <div class="settings-row"><div class="s-info"><b>Notificações de prazos</b><span>Avisos de tarefas próximas do vencimento</span></div><div class="switch on" id="settings-notif-switch"></div></div>
      <div class="settings-row"><div class="s-info"><b>Lembretes de estudo</b><span>Sugestões diárias baseadas no seu calendário</span></div><div class="switch on" id="settings-reminder-switch"></div></div>
      <div class="settings-row"><div class="s-info"><b>Idioma</b><span>Português (Brasil)</span></div><span class="chip chip-sky">PT-BR</span></div>
      <div class="settings-row"><div class="s-info"><b>Perfil atual</b><span style="text-transform:capitalize;">${state.role}</span></div><button class="btn btn-ghost btn-sm" id="logout-settings-btn">Sair da conta</button></div>
    </div>
  `;
}

/* ================================================================
   16. DADOS SIMULADOS DAS FUNCIONALIDADES ESTENDIDAS
   ================================================================ */

const WORKLOAD = {
  mat: { estimateHours: 2.0, activities: 3 },
  por: { estimateHours: 1.5, activities: 2 },
  his: { estimateHours: 1.0, activities: 2 },
  cie: { estimateHours: 2.5, activities: 2 },
  ing: { estimateHours: 1.0, activities: 3 },
  geo: { estimateHours: 1.5, activities: 1 },
};
const WORKLOAD_TARGET_WEEKLY = 6;

const CORNELL_DATA = {};
function cornellFor(subId){
  if(!CORNELL_DATA[subId]) CORNELL_DATA[subId] = { cues:'', notes:'', summary:'' };
  return CORNELL_DATA[subId];
}

const READING_ANALYTICS = {
  mat: { opened:88, readToEnd:61 },
  por: { opened:74, readToEnd:40 },
  his: { opened:65, readToEnd:52 },
  cie: { opened:91, readToEnd:77 },
  ing: { opened:58, readToEnd:33 },
  geo: { opened:70, readToEnd:44 },
};

const SCATTER_DATA = [
  {hours:1.2, grade:5.0, subject:'por'}, {hours:2.5, grade:6.8, subject:'mat'},
  {hours:3.0, grade:7.5, subject:'cie'}, {hours:4.2, grade:8.7, subject:'mat'},
  {hours:0.8, grade:4.2, subject:'geo'}, {hours:5.0, grade:9.1, subject:'his'},
  {hours:2.0, grade:6.0, subject:'ing'}, {hours:3.6, grade:7.9, subject:'cie'},
  {hours:1.5, grade:5.5, subject:'por'}, {hours:4.8, grade:8.9, subject:'mat'},
];

let AUDIT_LOG = [
  { date:'28/06/2026', type:'atraso', subject:'por', detail:'Redação entregue 2 dias após o prazo.', signed:false },
  { date:'22/06/2026', type:'falta', subject:'his', detail:'Ausência não justificada na aula de seminário.', signed:true },
  { date:'15/06/2026', type:'atraso', subject:'ing', detail:'Lista de vocabulário entregue com 1 dia de atraso.', signed:false },
];

const timeTracker = {
  running:false, subject:'mat', startedAt:null, elapsed:0, interval:null,
  log: [
    { subject:'mat', seconds: 3*3600+10*60 }, { subject:'cie', seconds: 2*3600+40*60 },
    { subject:'por', seconds: 1*3600+20*60 }, { subject:'his', seconds: 45*60 },
  ],
};

const focusLock = { active:false, distractions:0, seconds:0, interval:null };

/* ================================================================
   17. FUNÇÕES CONSTRUTORAS (builders) DAS FUNCIONALIDADES ESTENDIDAS
   ================================================================ */

function classifyEisenhower(t){
  const today = new Date('2026-07-02');
  const deadline = new Date(t.deadline);
  const daysLeft = Math.ceil((deadline-today)/86400000);
  const urgent = daysLeft <= 2;
  const important = /prova|trabalho|relat[oó]rio|resumo/i.test(t.title) || t.subject==='mat' || t.subject==='his';
  if(urgent && important) return 'urgimp';
  if(!urgent && important) return 'imponly';
  if(urgent && !important) return 'urgonly';
  return 'neither';
}
function renderEisenhower(){
  const quads = [
    { key:'urgimp', cls:'q-urgimp', title:'Urgente e Importante', sub:'Provas e entregas de peso — faça agora', ic:'flame' },
    { key:'imponly', cls:'q-imponly', title:'Importante, não urgente', sub:'Trabalhos a longo prazo — agende', ic:'calendar-clock' },
    { key:'urgonly', cls:'q-urgonly', title:'Urgente, não importante', sub:'Avisos cotidianos — delegue/resolva rápido', ic:'bell' },
    { key:'neither', cls:'q-neither', title:'Nem urgente nem importante', sub:'Baixa prioridade — elimine ou adie', ic:'archive' },
  ];
  const grouped = {urgimp:[], imponly:[], urgonly:[], neither:[]};
  TASKS.filter(t=>!t.done).forEach(t=> grouped[classifyEisenhower(t)].push(t));

  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Priorização automática</p><h2 style="font-size:1.4rem;">Matriz de Eisenhower</h2></div>
      <span class="chip chip-sky">Gerada a partir dos dados enviados pelos professores</span>
    </div>
    <div class="eisen-grid">
      ${quads.map(q=>`
        <div class="card eisen-quad ${q.cls} reveal">
          <div class="eq-head">
            <div><b>${icon(q.ic,'style="width:14px;height:14px;vertical-align:-2px;margin-right:6px;"')}${q.title}</b><span class="eq-sub">${q.sub}</span></div>
            <span class="status-count">${grouped[q.key].length}</span>
          </div>
          ${grouped[q.key].length ? grouped[q.key].map(t=>{
            const sub = subjectById(t.subject);
            return `<div class="eisen-item"><span class="dot-tag" style="background:${sub.color}"></span><span>${t.title}</span><span style="margin-left:auto;color:var(--ink-faint);font-size:.7rem;">${t.due}</span></div>`;
          }).join('') : `<div style="font-size:.74rem;color:var(--ink-faint);padding:8px 0;">Nenhuma tarefa neste quadrante.</div>`}
        </div>`).join('')}
    </div>
  `;
}

function buildTimeTrackingView(){
  const totalBySubject = {};
  timeTracker.log.forEach(l=> totalBySubject[l.subject] = (totalBySubject[l.subject]||0) + l.seconds);
  const rows = SUBJECTS.map(s=>{
    const secs = totalBySubject[s.id]||0;
    const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60);
    return `<tr><td><span class="dot-tag" style="background:${s.color}"></span> ${s.name}</td><td class="mono">${h}h ${m}min</td></tr>`;
  }).join('');
  return `
    <div class="grid-2">
      <div class="card focus-card reveal">
        <div class="subject-picker" id="tt-subject-picker">
          ${SUBJECTS.map(s=>`<button class="subject-pick ${timeTracker.subject===s.id?'active':''}" data-tt-subject="${s.id}"><span class="sp-dot" style="background:${s.color}"></span>${s.name}</button>`).join('')}
        </div>
        <p style="font-size:.78rem;color:var(--ink-soft); margin-bottom:6px;">Cronômetro de carga horária: mede o tempo líquido real dedicado à matéria selecionada (dados puros de esforço, sem estimativas).</p>
        <div class="tt-timer mono" id="tt-timer">${fmtTimeLong(timeTracker.elapsed)}</div>
        <div class="tt-controls">
          <button class="btn btn-marker" id="tt-toggle">${icon(timeTracker.running?'pause':'play','style="width:15px;height:15px"')} ${timeTracker.running?'Pausar':'Iniciar'}</button>
          <button class="btn btn-ghost" id="tt-stop">${icon('square','style="width:15px;height:15px"')} Encerrar e registrar</button>
        </div>
      </div>
      <div class="card" style="padding:18px;">
        <div class="section-title" style="margin:0 0 10px;"><h3 style="font-size:.9rem;">Tempo líquido acumulado (semana)</h3></div>
        <table class="tt-table"><thead><tr><th>Matéria</th><th>Tempo</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
    </div>`;
}
function fmtTimeLong(totalSeconds){
  const h = Math.floor(totalSeconds/3600);
  const m = Math.floor((totalSeconds%3600)/60);
  const s = totalSeconds%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function buildCornell(s){
  const data = cornellFor(s.id);
  return `
    <p style="font-size:.8rem;color:var(--ink-soft); margin-bottom:12px;">Método Cornell digitalizado: use "Dicas" para palavras-chave e perguntas, "Anotações" para o conteúdo do material enviado pelo professor, e "Resumo" para condensar tudo em poucas frases ao final do estudo.</p>
    <div class="cornell-wrap">
      <div class="cornell-cues"><label>Dicas / Palavras-chave</label><textarea id="cornell-cues" data-subject="${s.id}" placeholder="Perguntas e termos-chave...">${data.cues}</textarea></div>
      <div class="cornell-notes"><label>Anotações</label><textarea id="cornell-notes" data-subject="${s.id}" placeholder="Anote aqui enquanto lê o material...">${data.notes}</textarea></div>
      <div class="cornell-summary"><label>Resumo</label><textarea id="cornell-summary" data-subject="${s.id}" placeholder="Resuma o conteúdo em suas próprias palavras...">${data.summary}</textarea></div>
    </div>
    <button class="btn btn-primary btn-sm" id="cornell-save-btn" style="margin-top:12px;">${icon('save','style="width:14px;height:14px"')} Salvar notas</button>
  `;
}

function buildReadingAnalytics(s){
  const d = READING_ANALYTICS[s.id] || {opened:0, readToEnd:0};
  return `
    <p style="font-size:.8rem;color:var(--ink-soft); margin-bottom:14px;">Métrica de retenção de leitura dos materiais desta disciplina — ajuda a identificar se o conteúdo está denso demais.</p>
    <div class="saturation-row"><span class="sat-label">Abriram o PDF</span><div class="saturation-track"><div class="saturation-fill" style="width:${d.opened}%; background:var(--slate);"></div></div><span class="sat-val">${d.opened}%</span></div>
    <div class="saturation-row"><span class="sat-label">Leram até o fim</span><div class="saturation-track"><div class="saturation-fill" style="width:${d.readToEnd}%; background:var(--moss);"></div></div><span class="sat-val">${d.readToEnd}%</span></div>
    <p style="font-size:.72rem;color:var(--ink-faint); margin-top:12px;">${d.readToEnd < 50 ? 'Retenção baixa — considere dividir o material em partes menores.' : 'Boa retenção de leitura para esta turma.'}</p>
  `;
}

function buildScatterChart(){
  const w=280, h=200, pad=30;
  const maxH = Math.max(...SCATTER_DATA.map(d=>d.hours))*1.15;
  const pts = SCATTER_DATA.map(d=>{
    const x = pad + (d.hours/maxH)*(w-pad*1.4);
    const y = h-pad - (d.grade/10)*(h-pad*1.6);
    const sub = subjectById(d.subject);
    return `<circle class="scatter-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${sub.color}" fill-opacity=".8"><title>${sub.name}: ${d.hours}h · nota ${d.grade}</title></circle>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="200">
    <line x1="${pad}" y1="${h-pad}" x2="${w-8}" y2="${h-pad}" stroke="var(--line-strong)"/>
    <line x1="${pad}" y1="8" x2="${pad}" y2="${h-pad}" stroke="var(--line-strong)"/>
    <text x="${pad}" y="${h-8}" font-size="9" fill="var(--ink-faint)">0h</text>
    <text x="${w-30}" y="${h-8}" font-size="9" fill="var(--ink-faint)">${maxH.toFixed(1)}h</text>
    <text x="4" y="16" font-size="9" fill="var(--ink-faint)">10</text>
    <text x="4" y="${h-pad}" font-size="9" fill="var(--ink-faint)">0</text>
    ${pts}
  </svg>`;
}

function computeProcrastinationIndex(){
  const done = TASKS.filter(t=>t.completedAt);
  if(!done.length) return 0;
  let lastMinuteCount = 0;
  done.forEach(t=>{
    const posted = new Date(t.posted), deadline = new Date(t.deadline), completed = new Date(t.completedAt);
    const totalWindow = (deadline-posted)/86400000;
    const usedWindow = (completed-posted)/86400000;
    if(totalWindow>0 && (usedWindow/totalWindow) > 0.85) lastMinuteCount++;
  });
  return Math.round((lastMinuteCount/done.length)*100);
}
function buildProcrastinationIndex(){
  const idx = computeProcrastinationIndex() || 62;
  const circumference = 2*Math.PI*38;
  const color = idx>=60 ? 'var(--clay)' : idx>=30 ? 'var(--amber)' : 'var(--moss)';
  const label = idx>=60 ? 'Tendência de deixar para a última hora' : idx>=30 ? 'Procrastinação moderada' : 'Boa distribuição ao longo do prazo';
  return `
    <div class="procrast-meter">
      <div class="procrast-ring">
        <svg viewBox="0 0 88 88" width="88" height="88">
          <circle cx="44" cy="44" r="38" fill="none" stroke="var(--line)" stroke-width="8"/>
          <circle cx="44" cy="44" r="38" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${circumference}" stroke-dashoffset="${circumference*(1-idx/100)}"/>
        </svg>
        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-weight:700;">${idx}%</div>
      </div>
      <div><p style="font-size:.82rem; font-weight:600;">${label}</p><p style="font-size:.74rem; color:var(--ink-faint); margin-top:4px;">% de tarefas concluídas no último dia disponível antes do prazo.</p></div>
    </div>`;
}

function renderCarga(){
  const rows = SUBJECTS.map(s=>{
    const w = WORKLOAD[s.id];
    const weekly = w.estimateHours * w.activities;
    const pct = Math.min(100, Math.round(weekly/WORKLOAD_TARGET_WEEKLY*100));
    const color = pct>90 ? 'var(--clay)' : pct>65 ? 'var(--amber)' : 'var(--moss)';
    return `<div class="saturation-row"><span class="sat-label"><span class="dot-tag" style="background:${s.color}"></span> ${s.name}</span><div class="saturation-track"><div class="saturation-fill" style="width:${pct}%; background:${color};"></div></div><span class="sat-val">${weekly.toFixed(1)}h</span></div>`;
  }).join('');
  const totalWeekly = SUBJECTS.reduce((a,s)=> a + WORKLOAD[s.id].estimateHours*WORKLOAD[s.id].activities, 0);
  const overload = totalWeekly > WORKLOAD_TARGET_WEEKLY*SUBJECTS.length*0.75;

  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Planejamento coordenado</p><h2 style="font-size:1.4rem;">Carga horária da turma</h2></div>
      <button class="btn btn-primary btn-sm" id="add-workload-btn">${icon('plus','style="width:14px;height:14px"')} Nova atividade com estimativa</button>
    </div>
    <p style="font-size:.83rem; color:var(--ink-soft); margin-bottom:16px; max-width:640px;">
      Ao lançar uma atividade, você informa o tempo estimado de dedicação. O app soma as estimativas de todas as
      matérias e mostra a saturação da semana para coordenação e demais professores, ajudando a evitar sobrecarga dos alunos.
    </p>
    <div class="card reveal" style="padding:18px 20px;">
      <div class="section-title" style="margin:0 0 6px;"><h3 style="font-size:.9rem;">Gráfico de saturação semanal por matéria</h3></div>
      ${rows}
    </div>
    <div class="card reveal" style="margin-top:16px; padding:18px 20px; ${overload?'border-color:var(--clay);':''}">
      <div style="display:flex; align-items:center; gap:10px;">
        ${icon(overload?'alert-triangle':'check-circle-2', `style="width:18px;height:18px;color:${overload?'var(--clay)':'var(--moss)'}"`)}
        <div><b style="font-size:.86rem;">Carga total estimada: ${totalWeekly.toFixed(1)}h/semana</b><br>
        <span style="font-size:.76rem;color:var(--ink-faint);">${overload ? 'Acima do recomendado — considere redistribuir atividades entre as semanas.' : 'Dentro da faixa recomendada para evitar o burnout dos alunos.'}</span></div>
      </div>
    </div>
  `;
}

function renderAuditoria(){
  const canSign = state.role==='responsavel';
  const rows = AUDIT_LOG.map((a,i)=>{
    const sub = subjectById(a.subject);
    return `<tr>
      <td class="mono">${a.date}</td>
      <td><span class="audit-type ${a.type}">${a.type==='atraso'?'Atraso':'Falta'}</span></td>
      <td><span class="dot-tag" style="background:${sub.color}"></span> ${sub.name}</td>
      <td style="max-width:280px;">${a.detail}</td>
      <td>${canSign ? `<button class="seen-btn ${a.signed?'seen':''}" data-audit-sign="${i}">${icon('pen-line','style="width:13px;height:13px"')} ${a.signed?'Assinado':'Assinar'}</button>` : (a.signed?`<span class="chip chip-sage">Assinado</span>`:`<span class="chip chip-amber">Pendente</span>`)}</td>
    </tr>`;
  }).join('');
  return `
    <div class="page-head">
      <div><p style="margin:0;color:var(--ink-faint);font-size:.8rem;">Livro de ocorrências digital</p><h2 style="font-size:1.4rem;">Auditoria de faltas e entregas</h2></div>
      ${state.role==='professor' ? `<button class="btn btn-primary btn-sm" id="add-audit-btn">${icon('plus','style="width:14px;height:14px"')} Registrar ocorrência</button>` : ''}
    </div>
    <div class="card reveal" style="overflow:auto;">
      <table class="audit-table">
        <thead><tr><th>Data</th><th>Tipo</th><th>Matéria</th><th>Detalhe</th><th>${canSign?'Assinatura':'Status'}</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--ink-faint);">Nenhuma ocorrência registrada.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

const BNCC_COMPETENCIES = [
  { id:'norma', label:'Domínio da norma culta', value:8 },
  { id:'coerencia', label:'Coerência e coesão textual', value:6 },
  { id:'genero', label:'Adequação ao gênero textual', value:7 },
  { id:'intervencao', label:'Proposta de intervenção', value:5 },
  { id:'repertorio', label:'Uso de repertório sociocultural', value:7 },
];
function buildBnccPanel(){
  return BNCC_COMPETENCIES.map(c=>`
    <div class="bncc-row">
      <span class="bncc-label">${c.label}</span>
      <input type="range" min="0" max="10" step="1" value="${c.value}" data-bncc="${c.id}">
      <span class="bncc-val mono" id="bncc-val-${c.id}">${c.value}/10</span>
    </div>`).join('');
}


/* ================================================================
   7. EVENTOS ESPECÍFICOS POR PÁGINA
 ================================================================*/
function attachPageEvents(page, extra){
  $all('[data-goto]').forEach(el=> el.addEventListener('click', e=>{ e.preventDefault(); goTo(el.dataset.goto); }));

  if(page==='inicio'){
    animateRing('#daily-ring', TASKS.length ? TASKS.filter(t=>t.done).length/TASKS.length : 0);
    $all('.task-check').forEach(chk=> chk.addEventListener('click', ()=>{
      const id = +chk.dataset.id;
      const t = TASKS.find(x=>x.id===id);
      t.done = !t.done; t.status = t.done ? 'concluida':'andamento';
      t.completedAt = t.done ? '2026-07-02' : null;
      goTo('inicio');
      if(t.done) toast('Tarefa concluída! +15 XP', 'sparkles');
    }));
    const qaBtn = $('#quickadd-btn'), qaInput = $('#quickadd-input');
    const addQuickTask = ()=>{
      const val = qaInput.value.trim(); if(!val) return;
      TASKS.unshift({ id:taskIdSeq++, title:val, subject:SUBJECTS[0].id, due:'Sem prazo definido', status:'pendente', done:false, posted:'2026-07-02', deadline:'2026-07-09', completedAt:null });
      goTo('inicio');
      toast('Tarefa adicionada à sua lista.', 'plus-circle');
    };
    qaBtn && qaBtn.addEventListener('click', addQuickTask);
    qaInput && qaInput.addEventListener('keydown', e=>{ if(e.key==='Enter') addQuickTask(); });
  }

  if(page==='calendario'){
    $('#cal-prev').addEventListener('click', ()=>{ state.monthOffset--; goTo('calendario'); });
    $('#cal-next').addEventListener('click', ()=>{ state.monthOffset++; goTo('calendario'); });
    $('#add-event-btn').addEventListener('click', ()=> openModal('Novo evento',
      `<div class="field"><label>Título</label><div class="input-wrap" style="padding-left:0;"><input style="padding-left:14px;" placeholder="Ex: Prova de Matemática" id="modal-ev-title"></div></div>
       <div class="field"><label>Data</label><div class="input-wrap" style="padding-left:0;"><input type="date" style="padding-left:14px;" id="modal-ev-date"></div></div>`,
      ()=> toast('Evento adicionado ao calendário!', 'calendar-check')));
    setupKanbanDrag();
  }

  if(page==='eisenhower'){ /* somente leitura */ }

  if(page==='carga'){
    $('#add-workload-btn') && $('#add-workload-btn').addEventListener('click', ()=> openModal('Nova atividade com estimativa',
      `<div class="field"><label>Matéria</label><div class="input-wrap" style="padding-left:0;"><select style="padding-left:14px;width:100%;border:1.5px solid var(--line);border-radius:10px;padding:12px 14px;" id="modal-wl-subject">${SUBJECTS.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select></div></div>
       <div class="field"><label>Tempo estimado (horas)</label><div class="input-wrap" style="padding-left:0;"><input type="number" min="0.5" step="0.5" value="2" style="padding-left:14px;" id="modal-wl-hours"></div></div>`,
      ()=>{
        const subj = $('#modal-wl-subject').value; const hrs = parseFloat($('#modal-wl-hours').value)||1;
        WORKLOAD[subj].activities += 1; WORKLOAD[subj].estimateHours = ((WORKLOAD[subj].estimateHours*  (WORKLOAD[subj].activities-1)) + hrs)/WORKLOAD[subj].activities;
        goTo('carga'); toast('Estimativa registrada e somada à saturação da semana.', 'gauge');
      }));
  }

  if(page==='auditoria'){
    $all('[data-audit-sign]').forEach(btn=> btn.addEventListener('click', ()=>{
      AUDIT_LOG[+btn.dataset.auditSign].signed = true; goTo('auditoria');
      toast('Ocorrência assinada digitalmente pelo responsável.', 'pen-line');
    }));
    $('#add-audit-btn') && $('#add-audit-btn').addEventListener('click', ()=> openModal('Registrar ocorrência',
      `<div class="field"><label>Tipo</label><div class="input-wrap" style="padding-left:0;"><select id="modal-audit-type" style="padding-left:14px;width:100%;border:1.5px solid var(--line);border-radius:10px;padding:12px 14px;"><option value="atraso">Atraso na entrega</option><option value="falta">Falta</option></select></div></div>
       <div class="field"><label>Detalhe</label><div class="input-wrap" style="padding-left:0;"><input style="padding-left:14px;" id="modal-audit-detail" placeholder="Descreva a ocorrência"></div></div>`,
      ()=>{
        AUDIT_LOG.unshift({ date:'02/07/2026', type:$('#modal-audit-type').value, subject:SUBJECTS[0].id, detail:$('#modal-audit-detail').value||'Ocorrência registrada.', signed:false });
        goTo('auditoria'); toast('Ocorrência adicionada — aguardando assinatura dos responsáveis.', 'clipboard-list');
      }));
  }

  if(page==='materias'){
    $all('.subject-card').forEach(c=> c.addEventListener('click', ()=> goTo('materia_detalhe', c.dataset.subject)));
    $('#new-subject-btn') && $('#new-subject-btn').addEventListener('click', ()=> toast('Nova turma criada com sucesso.', 'plus-circle'));
  }

  if(page==='materia_detalhe'){
    $('#back-materias').addEventListener('click', ()=> goTo('materias'));
    $all('.tab-btn').forEach(tb=> tb.addEventListener('click', ()=>{
      $all('.tab-btn').forEach(x=>x.classList.remove('active'));
      tb.classList.add('active');
      $all('.tab-pane').forEach(p=>p.classList.add('hidden'));
      $('#tab-'+tb.dataset.tab).classList.remove('hidden');
    }));
    $all('.flashcard').forEach(f=> f.addEventListener('click', (e)=>{
      if(e.target.closest('.flash-rate')) return;
      f.classList.toggle('flipped');
    }));
    $all('[data-rate]').forEach(btn=> btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      rateFlashcard(extra, btn.dataset.id, btn.dataset.rate);
      const grid = $('#flash-grid');
      if(grid) grid.innerHTML = buildFlashcards(subjectById(extra)).map(c=>flashcardHtml(c)).join('');
      refreshIcons();
    }));
    $('#add-flashcard-btn') && $('#add-flashcard-btn').addEventListener('click', ()=> toast('Flashcard criado!', 'layers'));
    const uz = $('#upload-zone');
    if(uz){
      uz.addEventListener('click', ()=>{
        const bar = $('#upload-progress'), fill = $('#upload-progress-fill');
        if(bar){ bar.classList.remove('hidden'); fill.style.width='0%'; let p=0;
          const iv = setInterval(()=>{ p+=20; fill.style.width=p+'%'; if(p>=100){ clearInterval(iv);
            const broadcast = $('#broadcast-switch') && $('#broadcast-switch').classList.contains('on');
            toast(broadcast ? 'Arquivo enviado para todos os alunos da turma.' : 'Arquivo enviado para a pasta da disciplina.', 'upload-cloud');
            setTimeout(()=> bar.classList.add('hidden'), 600);
          } }, 140);
        }
      });
    }
    const bcast = $('#broadcast-switch');
    if(bcast) bcast.addEventListener('click', function(){ this.classList.toggle('on'); });
    $all('[data-open-material]').forEach(btn=> btn.addEventListener('click', ()=>{
      const subId = btn.dataset.openMaterial.split(':')[0];
      if(READING_ANALYTICS[subId]) READING_ANALYTICS[subId].opened = Math.min(100, READING_ANALYTICS[subId].opened+1);
      toast('Material baixado — leitura registrada para o professor.', 'file-check-2');
    }));
    $('#cornell-save-btn') && $('#cornell-save-btn').addEventListener('click', ()=>{
      const data = cornellFor(extra);
      data.cues = $('#cornell-cues').value; data.notes = $('#cornell-notes').value; data.summary = $('#cornell-summary').value;
      toast('Notas Cornell salvas para esta matéria.', 'save');
    });
    setupQuiz(extra);
  }

  if(page==='foco'){ setupPomodoro(); setupTimeTracking(); }

  if(page==='graficos'){
    setTimeout(()=>{
      $all('#bar-chart .bar-fill').forEach(b=>{ b.style.height = b.dataset.h + '%'; });
    }, 80);
    $all('[data-range]').forEach(btn=> btn.addEventListener('click', ()=>{
      $all('[data-range]').forEach(b=>b.classList.remove('active-range'));
      btn.classList.add('active-range');
      toast('Período atualizado.', 'refresh-cw');
    }));
  }

  if(page==='notas'){
    $all('[data-seen]').forEach(btn=> btn.addEventListener('click', ()=>{
      const i = +btn.dataset.seen; GRADES[i].seen = true; goTo('notas');
      toast('Boletim assinado digitalmente.', 'badge-check');
    }));
    $('#save-grades-btn') && $('#save-grades-btn').addEventListener('click', ()=>{
      $all('[data-grade-input]').forEach(inp=> GRADES[+inp.dataset.gradeInput].grade = parseFloat(inp.value)||0);
      $all('[data-feedback-input]').forEach(inp=> GRADES[+inp.dataset.feedbackInput].feedback = inp.value);
      toast('Notas e diagnóstico BNCC salvos e enviados aos responsáveis.', 'save');
    });
    $all('[data-bncc]').forEach(range=> range.addEventListener('input', ()=>{
      const comp = BNCC_COMPETENCIES.find(c=>c.id===range.dataset.bncc);
      comp.value = +range.value;
      $('#bncc-val-'+comp.id).textContent = comp.value+'/10';
    }));
    $('#export-report-btn') && $('#export-report-btn').addEventListener('click', exportGradeReport);
  }

  if(page==='avisos'){
    let priority = 'normal';
    $all('#compose-priority button').forEach(btn=> btn.addEventListener('click', ()=>{
      $all('#compose-priority button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); priority = btn.dataset.priority;
    }));
    $('#post-announce-btn') && $('#post-announce-btn').addEventListener('click', ()=>{
      const val = $('#announce-text').value.trim();
      if(!val) return;
      ANNOUNCEMENTS.unshift({author: state.userName||'Professor(a)', subject: SUBJECTS[0].name, text: val, time:'agora', ts: Date.now(), read:false, urgent: priority==='urgente'});
      goTo('avisos');
      toast('Comunicado publicado no mural oficial da turma.', 'megaphone');
    });
    $all('[data-mural-read]').forEach(btn=> btn.addEventListener('click', ()=>{
      const sorted = [...ANNOUNCEMENTS].sort((a,b)=> (b.ts||0)-(a.ts||0));
      sorted[+btn.dataset.muralRead].read = true;
      goTo('avisos'); toast('Marcado como lido e ciente.', 'check-circle-2');
    }));
  }

  if(page==='config'){
    $('#settings-theme-switch').addEventListener('click', function(){ applyTheme(state.theme==='light'?'dark':'light'); this.classList.toggle('on'); });
    $all('[data-accent]').forEach(dot=> dot.addEventListener('click', ()=>{
      applyAccent(dot.dataset.accent);
      $all('[data-accent]').forEach(d=>d.classList.remove('active'));
      dot.classList.add('active');
      toast('Cor de destaque atualizada.', 'palette');
    }));
    $('#settings-dnd-switch').addEventListener('click', function(){ state.dnd=!state.dnd; this.classList.toggle('on'); $('#dnd-switch').classList.toggle('on', state.dnd); });
    $('#settings-notif-switch').addEventListener('click', function(){ this.classList.toggle('on'); });
    $('#settings-reminder-switch').addEventListener('click', function(){ this.classList.toggle('on'); });
    $('#logout-settings-btn').addEventListener('click', ()=> $('#logout-btn').click());
  }
}

function animateRing(sel, frac){
  const el = $(sel); if(!el) return;
  const circumference = 2*Math.PI*55;
  requestAnimationFrame(()=>{ el.style.strokeDashoffset = circumference*(1-frac); });
}

/* --- quiz de recordação ativa: eventos --- */
function setupQuiz(subId){
  const s = subjectById(subId) || SUBJECTS[0];
  $all('.quiz-opt').forEach(btn=> btn.addEventListener('click', ()=>{
    if(btn.parentElement.querySelector('.correct, .wrong')) return;
    const correct = +btn.dataset.correct;
    const i = +btn.dataset.i;
    $all('.quiz-opt').forEach((b,bi)=>{ if(bi===correct) b.classList.add('correct'); });
    if(i!==correct) btn.classList.add('wrong');
    const fb = $('#quiz-feedback');
    if(i===correct){
      fb.textContent = 'Acertou! Domínio da matéria +2%.';
      s.mastery = Math.min(100, s.mastery+2);
      toast('Resposta correta! +10 XP', 'sparkles');
    } else {
      fb.textContent = 'Quase — revise este tópico nos flashcards.';
    }
  }));
}

/* --- drag and drop no quadro kanban --- */
function setupKanbanDrag(){
  let draggedId = null;
  $all('.kanban-card').forEach(card=>{
    card.addEventListener('dragstart', ()=>{ draggedId = +card.dataset.id; card.style.opacity='.5'; });
    card.addEventListener('dragend', ()=>{ card.style.opacity='1'; });
  });
  $all('.status-col').forEach(col=>{
    col.addEventListener('dragover', e=>{ e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', ()=> col.classList.remove('drag-over'));
    col.addEventListener('drop', ()=>{
      col.classList.remove('drag-over');
      const t = TASKS.find(x=>x.id===draggedId);
      if(t){
        t.status = col.dataset.status; t.done = col.dataset.status==='concluida';
        t.completedAt = t.done ? '2026-07-02' : null;
        goTo('calendario'); toast('Status da tarefa atualizado.', 'move');
      }
    });
  });
}

/* --- pomodoro timer --- */
let pomodoroInterval = null;
function setupPomodoro(){
  const pomoView = $('#focus-pomodoro-view'), trackView = $('#focus-tracking-view');
  $all('#focus-top-tabs .mode-tab').forEach(tab=> tab.addEventListener('click', ()=>{
    $all('#focus-top-tabs .mode-tab').forEach(t=>t.classList.remove('active')); tab.classList.add('active');
    if(tab.dataset.fmode==='pomodoro'){ pomoView.classList.remove('hidden'); trackView.classList.add('hidden'); }
    else { pomoView.classList.add('hidden'); trackView.classList.remove('hidden'); }
  }));

  $all('.mode-tab[data-mode]').forEach(tab=> tab.addEventListener('click', ()=>{
    $all('.mode-tab[data-mode]').forEach(t=>t.classList.remove('active')); tab.classList.add('active');
    const durations = { foco:25*60, pausa:5*60, longa:15*60 };
    clearInterval(pomodoroInterval); state.pomodoro.running=false;
    state.pomodoro.mode = tab.dataset.mode;
    state.pomodoro.total = durations[tab.dataset.mode];
    state.pomodoro.seconds = durations[tab.dataset.mode];
    goTo('foco');
  }));
  $all('.subject-pick[data-subject]').forEach(btn=> btn.addEventListener('click', ()=>{
    state.pomodoro.subject = btn.dataset.subject;
    $all('.subject-pick[data-subject]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }));
  $all('.ambient-btn').forEach(btn=> btn.addEventListener('click', ()=>{
    setAmbientSound(btn.dataset.sound);
    $all('.ambient-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }));
  $('#pomo-toggle').addEventListener('click', function(){
    state.pomodoro.running = !state.pomodoro.running;
    this.innerHTML = state.pomodoro.running ? `${icon('pause','style="width:15px;height:15px"')} Pausar` : `${icon('play','style="width:15px;height:15px"')} Continuar`;
    refreshIcons();
    if(state.pomodoro.running){
      pomodoroInterval = setInterval(()=>{
        state.pomodoro.seconds--;
        if(state.pomodoro.seconds<=0){
          clearInterval(pomodoroInterval); state.pomodoro.running=false;
          if(state.pomodoro.mode==='foco'){
            logSession(state.pomodoro.subject, Math.round(state.pomodoro.total/60));
            state.xp += 25;
            toast('Sessão concluída! Registrada no seu histórico. +25 XP', 'bell-ring');
          } else {
            toast('Pausa concluída! Hora de voltar ao foco.', 'bell-ring');
          }
          goTo('foco'); return;
        }
        updatePomodoroUI();
      }, 1000);
    } else { clearInterval(pomodoroInterval); }
  });
  $('#pomo-reset').addEventListener('click', ()=>{
    clearInterval(pomodoroInterval); state.pomodoro.running=false; state.pomodoro.seconds = state.pomodoro.total; goTo('foco');
  });
  const dnd2 = $('#dnd-switch-2');
  if(dnd2) dnd2.addEventListener('click', function(){ state.dnd=!state.dnd; this.classList.toggle('on', state.dnd); $('#dnd-switch').classList.toggle('on', state.dnd); });

  const lockSwitch = $('#focus-lock-switch');
  if(lockSwitch) lockSwitch.addEventListener('click', function(){ toggleFocusLock(); this.classList.toggle('on', focusLock.active); });
}
function updatePomodoroUI(){
  const timeEl = $('#pomo-time'); if(!timeEl) return;
  timeEl.textContent = fmtTime(state.pomodoro.seconds);
  const circumference = 2*Math.PI*80;
  const pct = 1 - state.pomodoro.seconds/state.pomodoro.total;
  $('#pomo-circle').style.strokeDashoffset = circumference*(1-pct);
}

function logSession(subjectId, minutes){
  SESSIONS.unshift({ subject: subjectId, minutes, when:'agora' });
  const el = $('#session-log');
  if(el) el.innerHTML = buildSessionLog();
}

/* --- cronômetro de carga horária (time-tracking) --- */
let ttInterval = null;
function setupTimeTracking(){
  $all('[data-tt-subject]').forEach(btn=> btn.addEventListener('click', ()=>{
    timeTracker.subject = btn.dataset.ttSubject;
    $all('[data-tt-subject]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }));
  const toggle = $('#tt-toggle');
  if(toggle) toggle.addEventListener('click', function(){
    timeTracker.running = !timeTracker.running;
    this.innerHTML = `${icon(timeTracker.running?'pause':'play','style="width:15px;height:15px"')} ${timeTracker.running?'Pausar':'Iniciar'}`;
    refreshIcons();
    if(timeTracker.running){
      ttInterval = setInterval(()=>{
        timeTracker.elapsed++;
        const el = $('#tt-timer'); if(el) el.textContent = fmtTimeLong(timeTracker.elapsed);
      }, 1000);
    } else clearInterval(ttInterval);
  });
  const stop = $('#tt-stop');
  if(stop) stop.addEventListener('click', ()=>{
    clearInterval(ttInterval); timeTracker.running=false;
    if(timeTracker.elapsed>0){
      const existing = timeTracker.log.find(l=>l.subject===timeTracker.subject);
      if(existing) existing.seconds += timeTracker.elapsed; else timeTracker.log.push({subject:timeTracker.subject, seconds:timeTracker.elapsed});
      logSession(timeTracker.subject, Math.round(timeTracker.elapsed/60));
      toast(`Registrado: ${fmtTimeLong(timeTracker.elapsed)} de estudo líquido.`, 'square');
    }
    timeTracker.elapsed = 0;
    goTo('foco');
  });
}

/* --- modo foco rígido: overlay de tela cheia + contador de distrações --- */
function toggleFocusLock(){
  focusLock.active = !focusLock.active;
  if(focusLock.active){
    focusLock.distractions = 0; focusLock.seconds = state.pomodoro.seconds;
    const overlay = $('#focus-lock-overlay');
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div>${icon('lock', 'style="width:34px;height:34px;color:var(--marker);margin-bottom:14px;"')}</div>
      <h2>Modo Foco rígido ativo</h2>
      <p>Fique nesta tela até o cronômetro terminar. Trocar de aba conta como uma distração registrada no seu histórico.</p>
      <div class="fl-timer" id="fl-timer">${fmtTime(focusLock.seconds)}</div>
      <button class="btn btn-marker" id="fl-exit">${icon('x','style="width:14px;height:14px"')} Encerrar Foco rígido</button>
      <div class="distraction-log" id="fl-distraction">0 tentativas de distração</div>`;
    refreshIcons();
    focusLock.interval = setInterval(()=>{
      focusLock.seconds--;
      const t = $('#fl-timer'); if(t) t.textContent = fmtTime(Math.max(0,focusLock.seconds));
      if(focusLock.seconds<=0){ toggleFocusLock(); toast('Sessão em Foco rígido concluída!', 'sparkles'); }
    }, 1000);
    document.addEventListener('visibilitychange', onFocusLockVisibility);
    $('#fl-exit').addEventListener('click', ()=>{ toggleFocusLock(); });
  } else {
    clearInterval(focusLock.interval);
    $('#focus-lock-overlay').classList.add('hidden');
    document.removeEventListener('visibilitychange', onFocusLockVisibility);
  }
}
function onFocusLockVisibility(){
  if(document.hidden && focusLock.active){
    focusLock.distractions++;
    const d = $('#fl-distraction'); if(d) d.textContent = `${focusLock.distractions} tentativa(s) de distração`;
  }
}

/* ================================================================
   8. NOTIFICAÇÕES (painel do sino) + MENU DO USUÁRIO
   ================================================================ */
function renderNotifications(){
  const colors = {slate:'--slate', moss:'--moss', amber:'--amber'};
  const bgs = {slate:'--slate-bg', moss:'--moss-bg', amber:'--amber-bg'};
  $('#notif-panel').innerHTML = NOTIFICATIONS.map(n=>`
    <div class="notif-item">
      <div class="n-ic" style="background:var(${bgs[n.color]}); color:var(${colors[n.color]})">${icon(n.icon)}</div>
      <div class="n-text">${n.text}<div class="n-time">${n.time}</div></div>
    </div>`).join('');
  refreshIcons();
}
$('#notif-btn').addEventListener('click', (e)=>{ e.stopPropagation(); $('#notif-panel').classList.toggle('hidden'); $('#user-panel').classList.add('hidden'); });
$('#user-mini-btn').addEventListener('click', (e)=>{ e.stopPropagation(); $('#user-panel').classList.toggle('hidden'); $('#notif-panel').classList.add('hidden'); });
document.addEventListener('click', (e)=>{
  if(!$('#notif-panel').contains(e.target) && e.target!==$('#notif-btn') && !$('#notif-btn').contains(e.target)) $('#notif-panel').classList.add('hidden');
  if(!$('#user-panel').contains(e.target) && e.target!==$('#user-mini-btn') && !$('#user-mini-btn').contains(e.target)) $('#user-panel').classList.add('hidden');
});

/* ================================================================
   9. MODAL GENÉRICO
   ================================================================ */
function openModal(title, bodyHtml, onConfirm){
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `<div class="modal-box">
    <h3>${title}</h3>
    <div>${bodyHtml}</div>
    <div class="modal-actions">
      <button class="btn btn-ghost btn-sm" id="modal-cancel">Cancelar</button>
      <button class="btn btn-primary btn-sm" id="modal-confirm">Confirmar</button>
    </div>
  </div>`;
  document.body.appendChild(wrap);
  wrap.addEventListener('click', e=>{ if(e.target===wrap) wrap.remove(); });
  wrap.querySelector('#modal-cancel').addEventListener('click', ()=> wrap.remove());
  wrap.querySelector('#modal-confirm').addEventListener('click', ()=>{ onConfirm && onConfirm(); wrap.remove(); });
}

/* ================================================================
   10. ASSISTENTE IA (mentor de estudos — respostas simuladas)
   ================================================================ */
function initAI(){
  $('#ai-body').innerHTML = `<div class="ai-msg bot">Olá! Sou seu mentor de estudos. Posso sugerir técnicas de foco, ajudar a planejar sua semana ou tirar dúvidas rápidas. Como posso ajudar?</div>`;
  const suggestions = ['Como me organizar melhor?','Dica de foco','Como fixar conteúdo?'];
  $('#ai-suggestions').innerHTML = suggestions.map(s=>`<button class="ai-chip">${s}</button>`).join('');
  $all('.ai-chip').forEach(c=> c.addEventListener('click', ()=> sendAIMessage(c.textContent)));
}
$('#ai-fab-btn').addEventListener('click', ()=> $('#ai-panel').classList.toggle('hidden'));
$('#ai-send-btn').addEventListener('click', ()=> sendAIMessage($('#ai-input-field').value));
$('#ai-input-field').addEventListener('keydown', e=>{ if(e.key==='Enter') sendAIMessage(e.target.value); });

function sendAIMessage(text){
  if(!text || !text.trim()) return;
  const body = $('#ai-body');
  body.innerHTML += `<div class="ai-msg me">${text}</div>`;
  $('#ai-input-field').value = '';
  body.scrollTop = body.scrollHeight;
  setTimeout(()=>{
    const reply = AI_TIPS[Math.floor(Math.random()*AI_TIPS.length)];
    body.innerHTML += `<div class="ai-msg bot">${reply}</div>`;
    body.scrollTop = body.scrollHeight;
  }, 500);
}

/* ================================================================
   11. INICIALIZAÇÃO
   ================================================================ */
refreshIcons();
window.addEventListener('load', refreshIcons);

/* ================================================================
   12. PALETA DE COMANDOS (Ctrl/Cmd+K)
   ================================================================ */
const CMDK_ACTIONS = [
  { label:'Ir para Início', ic:'layout-dashboard', run:()=> goTo('inicio') },
  { label:'Ir para Calendário', ic:'calendar-days', run:()=> goTo('calendario') },
  { label:'Ir para Matriz de Eisenhower', ic:'grid-2x2', run:()=> goTo('eisenhower') },
  { label:'Ir para Matérias', ic:'book-open', run:()=> goTo('materias') },
  { label:'Ir para Modo Foco', ic:'timer', run:()=> goTo('foco') },
  { label:'Ir para Desempenho', ic:'bar-chart-3', run:()=> goTo('graficos') },
  { label:'Ir para Notas', ic:'graduation-cap', run:()=> goTo('notas') },
  { label:'Ir para Conquistas', ic:'trophy', run:()=> goTo('conquistas') },
  { label:'Ir para Mural de avisos', ic:'megaphone', run:()=> goTo('avisos') },
  { label:'Ir para Carga horária', ic:'gauge', run:()=> goTo('carga') },
  { label:'Ir para Auditoria', ic:'clipboard-list', run:()=> goTo('auditoria') },
  { label:'Ir para Configurações', ic:'settings', run:()=> goTo('config') },
  { label:'Alternar tema claro/escuro', ic:'moon', run:()=> applyTheme(state.theme==='light'?'dark':'light') },
  { label:'Ativar/desativar Não Perturbe', ic:'bell-off', run:()=>{ state.dnd=!state.dnd; $('#dnd-switch').classList.toggle('on', state.dnd); toast(state.dnd?'Não Perturbe ativado.':'Não Perturbe desativado.'); } },
  { label:'Abrir Mentor IA', ic:'sparkles', run:()=> $('#ai-panel').classList.remove('hidden') },
];

function initCommandPalette(){
  const root = $('#cmdk-root');
  if(!root || root.dataset.ready) return;
  root.dataset.ready = '1';
  $('#search-box-trigger').addEventListener('click', openCommandPalette);
}

function openCommandPalette(){
  const root = $('#cmdk-root');
  root.innerHTML = `
    <div class="cmdk-backdrop" id="cmdk-backdrop">
      <div class="cmdk-box">
        <div class="cmdk-input-row">${icon('search')}<input id="cmdk-input" placeholder="Digite um comando ou página..." autocomplete="off"></div>
        <div class="cmdk-list" id="cmdk-list"></div>
      </div>
    </div>`;
  const backdrop = $('#cmdk-backdrop');
  const input = $('#cmdk-input');
  let activeIndex = 0;
  let filtered = CMDK_ACTIONS;

  function renderList(){
    const list = $('#cmdk-list');
    if(!filtered.length){ list.innerHTML = `<div class="cmdk-empty">Nenhum resultado encontrado.</div>`; return; }
    list.innerHTML = filtered.map((a,i)=>`<div class="cmdk-item ${i===activeIndex?'active':''}" data-i="${i}">${icon(a.ic)}<span>${a.label}</span></div>`).join('');
    refreshIcons();
    $all('.cmdk-item').forEach(el=> el.addEventListener('click', ()=> runCmd(+el.dataset.i)));
  }
  function runCmd(i){
    const action = filtered[i]; if(!action) return;
    closeCommandPalette();
    action.run();
  }
  input.addEventListener('input', ()=>{
    const term = input.value.toLowerCase();
    filtered = CMDK_ACTIONS.filter(a=> a.label.toLowerCase().includes(term));
    activeIndex = 0;
    renderList();
  });
  input.addEventListener('keydown', e=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, filtered.length-1); renderList(); }
    if(e.key==='ArrowUp'){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); renderList(); }
    if(e.key==='Enter'){ e.preventDefault(); runCmd(activeIndex); }
    if(e.key==='Escape'){ closeCommandPalette(); }
  });
  backdrop.addEventListener('click', e=>{ if(e.target===backdrop) closeCommandPalette(); });
  renderList();
  input.focus();
}
function closeCommandPalette(){ $('#cmdk-root').innerHTML = ''; }

/* ================================================================
   13. ATALHOS DE TECLADO
   ================================================================ */
function initKeyboardShortcuts(){
  document.addEventListener('keydown', e=>{
    const inField = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
    if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); openCommandPalette(); return; }
    if(inField) return;
    if(e.key==='?'){ showShortcutsModal(); }
  });
  $('#shortcuts-btn').addEventListener('click', showShortcutsModal);
}
function showShortcutsModal(){
  openModal('Atalhos de teclado', `
    <div style="display:flex; flex-direction:column; gap:10px; font-size:.84rem;">
      <div style="display:flex; justify-content:space-between;"><span>Abrir paleta de comandos</span><span><kbd>Ctrl</kbd> + <kbd>K</kbd></span></div>
      <div style="display:flex; justify-content:space-between;"><span>Mostrar estes atalhos</span><span><kbd>?</kbd></span></div>
      <div style="display:flex; justify-content:space-between;"><span>Navegar na paleta</span><span><kbd>↑</kbd> <kbd>↓</kbd></span></div>
      <div style="display:flex; justify-content:space-between;"><span>Selecionar item</span><span><kbd>Enter</kbd></span></div>
      <div style="display:flex; justify-content:space-between;"><span>Fechar paleta/modal</span><span><kbd>Esc</kbd></span></div>
    </div>`, null);
  $('#modal-confirm').textContent = 'Entendi';
}

/* ================================================================
   14. SOM AMBIENTE (WebAudio — ruído gerado localmente, sem arquivos)
   ================================================================ */
let audioCtx = null, ambientNode = null, ambientGain = null;
function setAmbientSound(id){
  state.ambientSound = id;
  stopAmbient();
  if(id==='silencio') return;
  try{
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const bufferSize = 2*audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for(let i=0;i<bufferSize;i++){
      const white = Math.random()*2-1;
      lastOut = (lastOut + (0.02*white)) / 1.02;
      data[i] = lastOut * (id==='chuva' ? 6 : 3.2);
    }
    ambientNode = audioCtx.createBufferSource();
    ambientNode.buffer = buffer; ambientNode.loop = true;
    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = id==='chuva' ? 0.06 : 0.03;
    ambientNode.connect(ambientGain).connect(audioCtx.destination);
    ambientNode.start();
    toast(`Som ambiente: ${id==='chuva'?'Chuva':'Biblioteca'} ativado.`, 'volume-2');
  }catch(err){ /* áudio indisponível neste navegador — falha silenciosa */ }
}
function stopAmbient(){
  if(ambientNode){ try{ ambientNode.stop(); }catch(e){} ambientNode.disconnect(); ambientNode=null; }
}

/* ================================================================
   15. EXPORTAÇÃO DE RELATÓRIO (impressão do boletim)
   ================================================================ */
function exportGradeReport(){
  toast('Preparando relatório para impressão/PDF...', 'file-down');
  setTimeout(()=> window.print(), 400);
}
