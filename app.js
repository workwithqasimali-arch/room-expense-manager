const KEY='room-expense-manager-v1';
let db = JSON.parse(localStorage.getItem(KEY) || 'null') || {
  roommates: [{id:crypto.randomUUID(),name:'Me',active:true},{id:crypto.randomUUID(),name:'Roommate 2',active:true}],
  expenses: [],
  audit: []
};
let viewMonth = new Date();
viewMonth.setDate(1);

function save(){localStorage.setItem(KEY,JSON.stringify(db));}
function id(){return crypto.randomUUID();}
function user(){return document.getElementById('currentUser').value || 'System';}
function monthKey(d){let x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`;}
function monthLabel(k){let [y,m]=k.split('-');return new Date(+y,+m-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});}
function currentKey(){return monthKey(viewMonth);}
function activeRoommates(){return db.roommates.filter(r=>r.active);}
function log(action,type,recordId,details){db.audit.unshift({id:id(),action,type,recordId,details,user:user(),at:new Date().toISOString()});save();}
function money(n){return Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})+' SAR';}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function renderUsers(){
  let opts=db.roommates.map(r=>`<option value="${r.name}">${esc(r.name)}${r.active?'':' (inactive)'}</option>`).join('');
  currentUser.innerHTML=opts;
  payer.innerHTML=activeRoommates().map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('');
}
function monthExpenses(k=currentKey()){return db.expenses.filter(e=>monthKey(e.date)===k);}
function calc(k=currentKey()){
  const rs=activeRoommates(), es=monthExpenses(k), total=es.reduce((s,e)=>s+Number(e.amount),0);
  const spent={};rs.forEach(r=>spent[r.id]=0);es.forEach(e=>spent[e.payerId]=(spent[e.payerId]||0)+Number(e.amount));
  const share=rs.length?total/rs.length:0;
  const balance=rs.map(r=>({id:r.id,name:r.name,spent:spent[r.id]||0,balance:(spent[r.id]||0)-share}));
  let creditors=balance.filter(x=>x.balance>0.005).map(x=>({...x,amount:x.balance}));
  let debtors=balance.filter(x=>x.balance<-0.005).map(x=>({...x,amount:-x.balance}));
  let settlements=[];
  creditors.forEach(c=>{debtors.forEach(d=>{if(c.amount>0.005&&d.amount>0.005){let a=Math.min(c.amount,d.amount);settlements.push({from:d.name,to:c.name,amount:a});c.amount-=a;d.amount-=a;}})});
  return {rs,es,total,spent,balance,share,settlements};
}
function renderDashboard(){
  const k=currentKey(), c=calc(k);
  monthTitle.textContent=monthLabel(k);
  expenseMonthTitle.textContent=monthLabel(k);
  summaryCards.innerHTML=[
    ['Total spent',money(c.total)],['Equal share',money(c.share)],['Expenses',c.es.length],['Roommates',c.rs.length]
  ].map(x=>`<div class="card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
  spendingTable.innerHTML=c.rs.length?`<table><tr><th>Roommate</th><th>Spent</th><th>Share</th><th>Difference</th></tr>${c.balance.map(x=>`<tr><td>${esc(x.name)}</td><td>${money(x.spent)}</td><td>${money(c.share)}</td><td class="${x.balance>=0?'positive':'negative'}">${x.balance>=0?'+':''}${money(x.balance)}</td></tr>`).join('')}</table>`:'<div class="empty">Add roommates first.</div>';
  settlementTable.innerHTML=c.settlements.length?`<table><tr><th>Who pays</th><th>Who receives</th><th>Amount</th></tr>${c.settlements.map(x=>`<tr><td>${esc(x.from)}</td><td>${esc(x.to)}</td><td>${money(x.amount)}</td></tr>`).join('')}</table>`:'<div class="empty">Everyone is settled.</div>';
  monthlyDetails.innerHTML=`<p><b>Month:</b> ${monthLabel(k)} — starts ${k}-01 and ends on the last calendar day.</p><p><b>Most spent:</b> ${c.balance.slice().sort((a,b)=>b.spent-a.spent)[0]?.name||'—'}</p><p><b>Highest amount:</b> ${money(Math.max(0,...c.es.map(e=>Number(e.amount))))}</p>`;
  renderExpenses();
}
function renderExpenses(){
  const es=monthExpenses();
  expenseList.innerHTML=es.length?`<table><tr><th>Date</th><th>Description</th><th>Paid by</th><th>Category</th><th>Amount</th><th></th></tr>${es.sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{let p=db.roommates.find(r=>r.id===e.payerId);return `<tr><td>${e.date}</td><td>${esc(e.description)}</td><td>${esc(p?.name||'Unknown')}</td><td><span class="tag">${esc(e.category||'Other')}</span></td><td>${money(e.amount)}</td><td class="row-actions"><button onclick="editExpense('${e.id}')">Edit</button><button class="danger" onclick="deleteExpense('${e.id}')">Delete</button></td></tr>`}).join('')}</table>`:'<div class="empty">No expenses in this month.</div>';
}
function renderRoommates(){
  roommateList.innerHTML=db.roommates.map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding:10px 0"><span>${esc(r.name)} ${r.active?'':'<span class="tag">inactive</span>'}</span><span class="row-actions"><button onclick="renameRoommate('${r.id}')">Rename</button><button onclick="toggleRoommate('${r.id}')">${r.active?'Deactivate':'Activate'}</button></span></div>`).join('');
}
function renderHistory(){
  let keys=[...new Set(db.expenses.map(e=>monthKey(e.date)))].sort().reverse();
  if(!keys.includes(currentKey())) keys.unshift(currentKey());
  historyList.innerHTML=keys.map(k=>{let c=calc(k);return `<div class="card" style="margin-bottom:10px"><b>${monthLabel(k)}</b><p>Total: ${money(c.total)} · Expenses: ${c.es.length} · Equal share: ${money(c.share)}</p><p>${c.balance.map(x=>`${esc(x.name)}: ${money(x.spent)}`).join(' · ')}</p><button onclick="jumpMonth('${k}')">Open month</button></div>`}).join('');
}
function renderAudit(){
  auditList.innerHTML=db.audit.length?`<table><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr>${db.audit.map(a=>`<tr><td>${new Date(a.at).toLocaleString()}</td><td>${esc(a.user)}</td><td>${esc(a.action)}</td><td>${esc(a.details)}</td></tr>`).join('')}</table>`:'<div class="empty">No changes recorded.</div>';
}
function render(){renderUsers();renderDashboard();renderRoommates();renderHistory();renderAudit();}

expenseForm.onsubmit=e=>{e.preventDefault();let eid=expenseId.value;let rawAmount=amount.value.trim();if(rawAmount===''||Number(rawAmount)<=0){alert('Please enter an amount.');return;}let obj={id:eid||id(),description:description.value.trim(),amount:Number(rawAmount),payerId:payer.value,date:expenseDate.value,category:category.value.trim(),notes:notes.value.trim()};if(eid){let i=db.expenses.findIndex(x=>x.id===eid);db.expenses[i]=obj;log('Edited expense','expense',eid,`Changed ${obj.description||'Expense'} (${money(obj.amount)})`)}else{db.expenses.push(obj);log('Added expense','expense',obj.id,`Added ${obj.description||'Expense'} (${money(obj.amount)})`)};resetExpense();render();};
function resetExpense(){expenseForm.reset();expenseId.value='';expenseDate.value=new Date().toISOString().slice(0,10);renderUsers();}
cancelEdit.onclick=resetExpense;
window.editExpense=function(eid){let e=db.expenses.find(x=>x.id===eid);if(!e)return;expenseId.value=e.id;description.value=e.description;amount.value=e.amount;payer.value=e.payerId;expenseDate.value=e.date;category.value=e.category;notes.value=e.notes;document.querySelector('[data-tab="expenses"]').click();}
window.deleteExpense=function(eid){let e=db.expenses.find(x=>x.id===eid);if(!e)return;if(confirm('Delete this expense?')){db.expenses=db.expenses.filter(x=>x.id!==eid);log('Deleted expense','expense',eid,`Deleted ${e.description} (${money(e.amount)})`);render();}}
roommateForm.onsubmit=e=>{e.preventDefault();let name=roommateName.value.trim();if(!name)return;let r={id:id(),name,active:true};db.roommates.push(r);log('Added roommate','roommate',r.id,`Added ${name}`);roommateName.value='';render();}
window.renameRoommate=function(rid){let r=db.roommates.find(x=>x.id===rid);if(!r)return;let n=prompt('New name',r.name);if(n&&n.trim()){let old=r.name;r.name=n.trim();log('Renamed roommate','roommate',rid,`${old} → ${r.name}`);render();}}
window.toggleRoommate=function(rid){let r=db.roommates.find(x=>x.id===rid);if(!r)return;r.active=!r.active;log(r.active?'Activated roommate':'Deactivated roommate','roommate',rid,`${r.name} is now ${r.active?'active':'inactive'}`);render();}
function jumpMonth(k){let [y,m]=k.split('-');viewMonth=new Date(+y,+m-1,1);render();document.querySelector('[data-tab="dashboard"]').click();}
prevMonth.onclick=()=>{viewMonth.setMonth(viewMonth.getMonth()-1);render();}
nextMonth.onclick=()=>{viewMonth.setMonth(viewMonth.getMonth()+1);render();}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.tab).classList.add('active');});
exportBtn.onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='room-expenses-backup.json';a.click();URL.revokeObjectURL(a.href);}
importFile.onchange=e=>{let f=e.target.files[0];if(!f)return;let reader=new FileReader();reader.onload=()=>{try{let x=JSON.parse(reader.result);if(!x.roommates||!x.expenses||!x.audit)throw Error();db=x;save();render();alert('Backup imported.')}catch(err){alert('Invalid backup file.')}};reader.readAsText(f);}
resetBtn.onclick=()=>{if(confirm('This deletes all local app data. Continue?')){localStorage.removeItem(KEY);location.reload();}}
expenseDate.value=new Date().toISOString().slice(0,10);
render();
