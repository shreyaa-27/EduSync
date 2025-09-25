// Static SPA for EduSync with inline mock data (no extra files)
const DATA = {
  teachers: [
    { id: 't1', name: 'Dr. Rao', email: 'rao@example.com', subjects: ['CS101','CS201'] },
    { id: 't2', name: 'Ms. Mehta', email: 'mehta@example.com', subjects: ['CS102','CS202'] },
    { id: 't3', name: 'Mr. Singh', email: 'singh@example.com', subjects: ['CS103','CS203'] }
  ],
  students: [
    { id: 's1', name: 'Aditi', batchId: 'b1' },
    { id: 's2', name: 'Rohan', batchId: 'b1' }
  ],
  classrooms: [
    { id: 'r1', name: 'A-101', capacity: 60, type: 'lecture' },
    { id: 'r2', name: 'A-102', capacity: 60, type: 'lecture' },
    { id: 'r3', name: 'Lab-1', capacity: 40, type: 'lab' }
  ],
  subjects: [
    { id: 'CS101', name: 'DSA' },
    { id: 'CS102', name: 'DBMS' },
    { id: 'CS103', name: 'OS' },
    { id: 'CS201', name: 'Algorithms' },
    { id: 'CS202', name: 'Networks' },
    { id: 'CS203', name: 'AI Intro' }
  ],
  notifications: [
    { id: 'n1', title: 'Welcome', body: 'EduSync ready with your timetable.', createdAt: '2025-09-20T10:00:00Z', read: false }
  ],
  timetable: {
    weekOf: '2025-09-22',
    entries: [
      { id: 'e1', batchId: 'b1', subjectId: 'CS101', teacherId: 't1', roomId: 'r1', slotId: 'Mon-1' },
      { id: 'e2', batchId: 'b1', subjectId: 'CS102', teacherId: 't2', roomId: 'r1', slotId: 'Mon-2' },
      { id: 'e3', batchId: 'b1', subjectId: 'CS103', teacherId: 't3', roomId: 'r1', slotId: 'Mon-3' },
      { id: 'e4', batchId: 'b1', subjectId: 'CS201', teacherId: 't1', roomId: 'r2', slotId: 'Tue-1' },
      { id: 'e5', batchId: 'b1', subjectId: 'CS202', teacherId: 't2', roomId: 'r2', slotId: 'Tue-2' },
      { id: 'e6', batchId: 'b1', subjectId: 'CS203', teacherId: 't3', roomId: 'r2', slotId: 'Tue-3' },
      { id: 'e7', batchId: 'b1', subjectId: 'CS101', teacherId: 't1', roomId: 'r1', slotId: 'Wed-1' },
      { id: 'e8', batchId: 'b1', subjectId: 'CS102', teacherId: 't2', roomId: 'r1', slotId: 'Thu-2' },
      { id: 'e9', batchId: 'b1', subjectId: 'CS103', teacherId: 't3', roomId: 'r1', slotId: 'Fri-3' }
    ]
  }
};

const state = { timetable: [], teachers: [], students: [], classrooms: [], subjects: [], notifications: [], emergency: false, theme: localStorage.getItem('theme')||'light', workloadMode:'balanced' };
const days=['Mon','Tue','Wed','Thu','Fri'];
function setTheme(m){ state.theme=m; document.documentElement.classList.toggle('dark', m==='dark'); localStorage.setItem('theme', m); }
async function loadData(){
  // Inline data; no network requests
  state.timetable = DATA.timetable.entries;
  state.teachers = DATA.teachers;
  state.students = DATA.students;
  state.subjects = DATA.subjects;
  state.classrooms = DATA.classrooms;
  state.notifications = DATA.notifications.slice();
}
function notify(title, body){ state.notifications.unshift({id:Date.now().toString(), title, body, createdAt:new Date().toISOString(), read:false}); updateNotifBadge(); }
function updateNotifBadge(){ const u=state.notifications.filter(n=>!n.read).length; const b=document.getElementById('notifBadge'); if(!b) return; if(u>0){ b.textContent=u; b.classList.remove('hidden'); } else b.classList.add('hidden'); }
function linkNavActive(){ const p=location.hash||'#/student'; document.querySelectorAll('.nav a').forEach(a=> a.getAttribute('href')===p ? a.classList.add('active') : a.classList.remove('active')); }
function generateTimetable(){ notify('Timetable Generated','New schedule created'); render(); }
function reschedule(teacherId){ state.timetable=state.timetable.map(e=> e.teacherId===teacherId?{...e, roomId:e.roomId==='r1'?'r2':'r1'}:e); notify('Rescheduled',`Updated schedule for ${teacherId}`); render(); }
function toggleEmergency(){ state.emergency=!state.emergency; state.timetable=state.timetable.map(e=> state.emergency?{...e, canceled:true, reason:'Holiday'}:{...e, canceled:false, reason:null}); notify('Emergency Mode', state.emergency?'Holiday declared':'Emergency ended'); render(); }
function h(tag, attrs={}, ...children){ const el=document.createElement(tag); Object.entries(attrs).forEach(([k,v])=>{ if(k.startsWith('on')&&typeof v==='function') el.addEventListener(k.slice(2).toLowerCase(), v); else if(k==='class') el.className=v; else el.setAttribute(k,v); }); children.flat().forEach(c=> el.appendChild(typeof c==='string'?document.createTextNode(c):c)); return el; }
function TimetableGrid(entries, title){ const c=h('div',{},h('h2',{},title)); const g=h('div',{class:'grid tt'}); g.appendChild(h('div',{class:'head card'},'Time')); days.forEach(d=> g.appendChild(h('div',{class:'head card', style:'text-align:center'},d))); const idx=['1','2','3','4','5']; const by={}; entries.forEach(e=>{ (by[e.slotId] ||= []).push(e); }); idx.forEach(i=>{ g.appendChild(h('div',{class:'card'},`Slot ${i}`)); days.forEach(d=>{ const key=`${d}-${i}`; const cell=by[key]||[]; const el=h('div',{class:'card'}); if(cell.length===0) el.appendChild(h('div',{class:'muted'},'Free')); cell.forEach(e=>{ const pill=h('div',{class:'pill'},`${e.subjectId} • ${e.teacherId} • ${e.roomId}`); if(e.canceled){ pill.style.textDecoration='line-through'; pill.style.background='#fee2e2'; pill.style.color='#991b1b'; } el.appendChild(pill); }); g.appendChild(el); }); }); c.appendChild(g); return c; }
function studentView(){ const next=state.timetable[0]; return h('div',{}, h('div',{class:'card'},h('div',{class:'muted'},'Next Class'), h('div',{}, next?`${next.subjectId} in ${next.roomId}`:'No upcoming classes')), TimetableGrid(state.timetable,'Batch Timetable')); }
function teacherView(){ const me=state.teachers[0]; const my=state.timetable.filter(e=> e.teacherId===me.id); return h('div',{}, h('div',{class:'row'}, h('div',{class:'card'}, h('h2',{},`Welcome, ${me.name}`), h('div',{class:'row'}, h('button',{class:'btn warn', onClick:()=>reschedule(me.id)},'Mark Absent (Mock Reschedule)'), h('button',{class:'btn ghost', onClick:()=>alert('Sync (Mock)')},'Sync with Calendar (Mock)')))), TimetableGrid(my,'Your Weekly Timetable')); }
function adminView(){ const controls=h('div',{class:'row'}, h('button',{class:'btn', onClick:generateTimetable},'Generate Timetable'), h('button',{class:'btn warn', onClick:()=>reschedule('t1')},'Reschedule (Mock t1)'), h('button',{class:'btn danger', onClick:toggleEmergency}, state.emergency?'Disable Emergency':'Declare Holiday'), h('button',{class:'btn ghost', onClick:()=>alert('Sync (Mock)')},'Sync with Calendar (Mock)'));
  const crud=h('div',{class:'card'}, h('h3',{},'Manage Teachers (Mock)'), h('form',{id:'tForm'}, h('input',{name:'name',placeholder:'Name',required:true}), h('input',{name:'email',placeholder:'Email',required:true}), h('input',{name:'subjects',placeholder:'Subjects (comma)'}), h('button',{class:'btn',type:'submit'},'Add Teacher')), h('table',{class:'table',id:'tTable'}, h('thead',{}, h('tr',{}, h('th',{},'Name'), h('th',{},'Email'), h('th',{},'Actions'))), h('tbody')));
  setTimeout(()=>{ const tbody=crud.querySelector('tbody'); tbody.innerHTML=''; state.teachers.forEach(t=>{ const tr=h('tr',{}, h('td',{},t.name), h('td',{},t.email), h('td',{}, h('button',{class:'btn ghost', onClick:()=>{ t.name+=' *'; render(); }},'Edit'), ' ', h('button',{class:'btn ghost', onClick:()=>{ state.teachers=state.teachers.filter(x=>x.id!==t.id); render(); }},'Delete'))); tbody.appendChild(tr); }); const form=crud.querySelector('#tForm'); form.onsubmit=(e)=>{ e.preventDefault(); const fd=new FormData(form); state.teachers.push({ id:'t'+Date.now(), name:fd.get('name'), email:fd.get('email'), subjects:(fd.get('subjects')||'').split(',').map(s=>s.trim()).filter(Boolean) }); render(); form.reset(); }; },0);
  const iot=h('div',{class:'card'}, h('h3',{},'IoT Energy Saving (Mock)'), h('div',{class:'row'}, ...state.classrooms.map(r=> h('div',{class:'card'}, h('div',{},r.name), h('div',{class:'muted'},`Capacity ${r.capacity} • ${r.type}`), h('div',{}, Math.random()>0.5?'In Use':'Free'), h('button',{class:'btn ghost', onClick:()=>alert('Toggle (Mock)')},'Toggle')))));
  const advisor=h('div',{class:'card'}, h('h3',{},'AI Advisor (Mock)'), h('ul',{}, h('li',{},'Suggested: Math in morning, PE after lunch'), h('li',{},'Try to reduce consecutive classes beyond 3')));
  return h('div',{}, controls, TimetableGrid(state.timetable,'Admin Timetable'), crud, iot, advisor);
}
function analyticsView(){ const loads=state.teachers.map(t=>({ name:t.name, classes: state.timetable.filter(e=>e.teacherId===t.id).length })); if(state.workloadMode==='unbalanced'&&loads[0]) loads[0].classes+=5; const chart=h('div',{class:'card'}, h('h3',{},'Teacher Load'), h('div',{style:'display:flex;gap:8px;align-items:flex-end;height:200px'}, ...loads.map(l=> h('div',{style:`background:var(--primary);width:40px;height:${(l.classes*20)||4}px`, title:`${l.name}: ${l.classes}` }))), h('div',{class:'muted'}, loads.map(l=>l.name).join(' | ')));
  const toggle=h('div',{}, 'Workload: ', h('select',{onchange:(e)=>{ state.workloadMode=e.target.value; render(); }}, h('option',{value:'balanced'},'Balanced'), h('option',{value:'unbalanced'},'Unbalanced (Mock)')));
  const daysArr=['Mon','Tue','Wed','Thu','Fri']; const matrix=Object.fromEntries(daysArr.map(d=>[d,[0,0,0,0,0]])); state.timetable.forEach(e=>{ const [d,i]=e.slotId.split('-'); const idx=Number(i)-1; if(matrix[d]&&idx>=0&&idx<5) matrix[d][idx]+=1; });
  const heat=h('div',{class:'card'}, h('h3',{},'Classroom Usage Heatmap'), h('div',{style:'display:grid;grid-template-columns:80px repeat(5,60px);gap:6px'}, h('div'), ...['S1','S2','S3','S4','S5'].map(s=>h('div',{class:'muted',style:'text-align:center'},s)), ...daysArr.map(d=> [h('div',{class:'muted'},d), ...matrix[d].map(v=>{ const c=Math.min(5,v); const colors=['#eef2ff','#c7d2fe','#a5b4fc','#818cf8','#6366f1','#4f46e5']; return h('div',{style:`height:36px;border-radius:6px;background:${colors[c]}`}); })]).flat()));
  const efficiency=Math.round((state.timetable.length/(5*5))*100); const eff=h('div',{class:'card'}, h('h3',{},'Efficiency Score'), h('div',{style:'font-size:28px;color:var(--primary);font-weight:700'}, efficiency+'%'));
  return h('div',{}, toggle, chart, heat, eff);
}
function render(){ const app=document.getElementById('app'); app.innerHTML=''; const route=(location.hash||'#/student').replace('#',''); linkNavActive(); if(route.startsWith('/student')) app.appendChild(studentView()); else if(route.startsWith('/teacher')) app.appendChild(teacherView()); else if(route.startsWith('/admin')) app.appendChild(adminView()); else if(route.startsWith('/analytics')) app.appendChild(analyticsView()); else app.appendChild(h('div',{},'404')); }
window.addEventListener('hashchange', render);
document.getElementById('themeToggle').addEventListener('click', ()=> setTheme(state.theme==='dark'?'light':'dark'));
document.getElementById('notifBtn').addEventListener('click', ()=>{ const existing=document.getElementById('notifDropdown'); if(existing){ existing.remove(); return; } const dd=document.createElement('div'); dd.id='notifDropdown'; dd.style.position='absolute'; dd.style.right='16px'; dd.style.top='56px'; dd.style.background='var(--bg)'; dd.style.border='1px solid #e5e7eb'; dd.style.borderRadius='8px'; dd.style.width='320px'; dd.style.maxHeight='320px'; dd.style.overflow='auto'; dd.appendChild(h('div',{class:'card'},'Notifications')); if(state.notifications.length===0) dd.appendChild(h('div',{class:'card'},'No notifications')); state.notifications.forEach(n=>{ const item=h('div',{class:'card'}, h('div',{style:'display:flex;justify-content:space-between'}, h('div',{style:'font-weight:600'},n.title), n.read?null:h('button',{class:'btn ghost', onClick:()=>{ n.read=true; updateNotifBadge(); render(); }},'Mark read')), h('div',{class:'muted'},n.body), h('div',{class:'muted'}, new Date(n.createdAt).toLocaleString())); dd.appendChild(item); }); document.body.appendChild(dd); });
(async function init(){ setTheme(state.theme); await loadData(); updateNotifBadge(); render(); })();
