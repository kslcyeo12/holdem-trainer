const $=id=>document.getElementById(id);
let N=6,names=['P1','P2','P3','P4','P5','P6'];
function setLearningStep(mode){
 const play=$('stepPlay'),split=$('stepSplit'),show=$('stepShow'),guide=$('guideText');
 if(!play||!split||!show||!guide)return;
 [play,split,show].forEach(el=>el.classList.remove('active','done'));
 if(mode==='split'){
   play.classList.add('done'); split.classList.add('active');
   guide.innerHTML='<b>지금 할 일</b><br>올인 기준 금액을 찾고 MAIN → SIDE 순서로 직접 나누세요.';
 }else if(mode==='show'){
   play.classList.add('done'); split.classList.add('done'); show.classList.add('active');
   guide.innerHTML='<b>지금 할 일</b><br>공개된 보드와 홀카드로 각 POT의 승자를 직접 판정하세요.';
 }else{
   play.classList.add('active');
   guide.innerHTML='<b>지금 할 일</b><br>액션과 좌석 앞 칩만 따라가세요. 일반 POT은 프로그램이 자동 계산합니다.';
 }
}
function setTrainingMode(mode, restart=false){
 state.trainingMode=mode;
 const calc=$('modeCalc'),prac=$('modePractical'),badge=$('modeBadge');
 if(calc)calc.classList.toggle('active',mode==='calc');
 if(prac)prac.classList.toggle('active',mode==='practical');
 if(badge){badge.textContent=mode==='calc'?'계산 훈련':'실전 칩 정리';badge.className='modebadge '+(mode==='calc'?'calc':'practical')}
 if($('quizSectionTitle')&&!state.showdown)$('quizSectionTitle').textContent=mode==='calc'?'MAIN / SIDE POT 계산':'실전 드래그 칩 정리';
 if($('guideText')&&!state.paused){$('guideText').innerHTML=mode==='calc'?'<b>지금 할 일</b><br>액션과 좌석 앞 칩을 따라가세요. 올인으로 팟이 갈라지면 MAIN/SIDE 금액을 직접 계산합니다.':'<b>지금 할 일</b><br>액션과 칩을 따라가세요. 올인이 나오면 플레이어 앞 칩을 MAIN/SIDE 영역으로 직접 드래그해서 정리합니다.'}
 if(restart&&state.hand>0){clearAuto();hideQuiz();startHand()}
}
function detailedPotLayers(){
 const contrib=state.players.map((p,i)=>({i,total:Math.round((p.total||0)*1000)/1000,prev:Math.round(((p.total||0)-(p.streetBet||0))*1000)/1000,folded:p.folded})).filter(x=>x.total>0);
 const levels=[...new Set(contrib.map(x=>x.total))].sort((a,b)=>a-b);
 let lower=0,raw=[];
 for(const upper of levels){
   const involved=contrib.filter(x=>x.total>=upper-1e-9);
   const eligible=involved.filter(x=>!x.folded).map(x=>x.i);
   const key=eligible.join(',');
   if(upper-lower>1e-9)raw.push({lower,upper,involved:involved.map(x=>x.i),eligible,key});
   lower=upper;
 }
 let lastKey=null,potIndex=-1;
 raw.forEach(l=>{if(l.key!==lastKey){potIndex++;lastKey=l.key}l.potIndex=potIndex});
 return raw;
}
function buildDragExpected(cp){
 const n=cp.pots.length,expected=Array.from({length:N},()=>Array(n).fill(0));
 const layers=detailedPotLayers();
 for(const l of layers){
   for(const i of l.involved){
     const p=player(i),prev=(p.total||0)-(p.streetBet||0),now=p.total||0;
     const overlap=Math.max(0,Math.min(now,l.upper)-Math.max(prev,l.lower));
     if(overlap>1e-9&&l.potIndex<n)expected[i][l.potIndex]+=overlap;
   }
 }
 return expected.map(row=>row.map(v=>Math.round(v*1000)/1000));
}
function dragBaseAmounts(cp,expected){return cp.pots.map((p,pi)=>Math.max(0,Math.round((p.amount-expected.reduce((s,row)=>s+(row[pi]||0),0))*1000)/1000));}
function initialPotMethods(cp){return cp.pots.map((_,pi)=>{const need=(state.dragExpected||[]).reduce((s,row)=>s+(row[pi]||0),0);return Math.abs(need)<=1e-9?'auto':null;});}
function ensureDragLayer(){let layer=$('dragPotLayer');if(!layer){layer=document.createElement('div');layer.id='dragPotLayer';layer.className='dragpotlayer';document.querySelector('.tablecard').appendChild(layer)}return layer;}
function clearDragUI(){
 document.querySelector('.tablecard')?.classList.remove('practical-split');
 const layer=$('dragPotLayer');if(layer){layer.innerHTML='';layer.className='dragpotlayer'};
 document.querySelectorAll('.betmarker').forEach(m=>{m.classList.remove('drag-ready','drag-empty');m.removeAttribute('draggable');m.ondragstart=null;m.ondragend=null});
 state.dragAlloc=null;state.dragMoves=[];state.dragSource=null;state.dragTarget=null;state.dragExpected=null;state.dragBase=[];state.directPotInputs=null;state.potMethods=null;state.dragModalMode=null;
 const h=$('dragMoveHistory');if(h)h.innerHTML='';
}
function showTopPracticalActions(stage='solve'){const dock=$('topPracticalActions');if(!dock)return;dock.classList.add('show');$('topResetBtn').style.display=stage==='solve'?'block':'none';$('topCheckBtn').style.display=stage==='solve'?'block':'none';$('topContinueBtn').style.display=stage==='continue'?'block':'none';}
function hideTopPracticalActions(){const dock=$('topPracticalActions');if(dock)dock.classList.remove('show')}
function setupPracticalQuiz(cp){
 $('quiz')?.classList.remove('practical-done');showTopPracticalActions('solve');document.querySelector('.tablecard')?.classList.add('practical-split');
 state.practicalCorrect=true;state.dragMoves=[];state.dragExpected=buildDragExpected(cp);state.dragBase=dragBaseAmounts(cp,state.dragExpected);state.dragAlloc=Array.from({length:N},()=>Array(cp.pots.length).fill(0));state.directPotInputs=Array(cp.pots.length).fill(null);state.potMethods=initialPotMethods(cp);state.dragModalMode=null;
 $('practicalResult').classList.add('hidden');$('practicalResult').innerHTML='';
 $('practicalHint').textContent='각 POT별 독립 선택 · 칩을 드롭한 POT은 정계산, POT 박스를 클릭한 곳은 역계산(추가 금액 입력)으로 풉니다.';
 const layer=ensureDragLayer();layer.innerHTML='';layer.className=`dragpotlayer pots-${Math.min(3,cp.pots.length)}`;const zoneClasses=['main','side1','side2'];
 for(let pi=0;pi<cp.pots.length;pi++){
   const z=document.createElement('div');z.className=`dragpotzone ${zoneClasses[pi]||'side2'}`;z.dataset.pot=pi;z.id='dragZone'+pi;
   z.ondragover=e=>{if(state.potMethods?.[pi]==='reverse'||state.potMethods?.[pi]==='auto')return;e.preventDefault();z.classList.add('over')};z.ondragleave=()=>z.classList.remove('over');
   z.ondrop=e=>{e.preventDefault();z.classList.remove('over');if(state.potMethods?.[pi]==='auto'){practicalFeedback(`${pi===0?'MAIN':`SIDE ${pi}`}은 이번 스트리트에서 추가할 칩이 없어 이미 정리 완료된 POT입니다.`);return}if(state.potMethods?.[pi]==='reverse'){practicalFeedback(`${pi===0?'MAIN':`SIDE ${pi}`}은 역계산으로 입력 중입니다. 이 POT만 정계산으로 바꾸려면 ‘처음부터 다시’ 후 해당 POT에 칩을 드롭하세요.`,true);return}const i=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(i)){state.potMethods[pi]='drag';openDragAmount(i,pi)}};
   z.onclick=e=>{if(e.target.closest('.methodbadge'))return;if(state.potMethods?.[pi]==='auto'){practicalFeedback(`${pi===0?'MAIN':`SIDE ${pi}`}은 이미 완성된 POT이라 이번 문제에서는 계산할 필요가 없습니다.`);return}const moved=state.dragAlloc?.reduce((sum,row)=>sum+(row[pi]||0),0)||0;if(state.potMethods?.[pi]==='drag'&&moved>1e-9){practicalFeedback(`${pi===0?'MAIN':`SIDE ${pi}`}에는 이미 칩을 옮겨 정계산 중입니다. 다른 POT은 별도로 역계산할 수 있습니다.`,true);return}state.potMethods[pi]='reverse';openDirectPotAmount(pi)};layer.appendChild(z);
 }
 document.querySelectorAll('.betmarker').forEach((m,i)=>{const p=player(i);if(!p||p.streetBet<=1e-9)return;m.classList.add('drag-ready');m.setAttribute('draggable','true');m.ondragstart=e=>{state.dragSource=i;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(i));renderDragState();};m.ondragend=()=>{};m.onpointerdown=e=>beginTouchChipDrag(i,e);});
 renderDragState(cp);
}
function playerDragUsed(i){return state.dragAlloc?.[i]?.reduce((a,b)=>a+b,0)||0}
function playerDragRemaining(i){return Math.max(0,(player(i)?.streetBet||0)-playerDragUsed(i))}
function potDragMoved(pi){return state.dragAlloc?.reduce((sum,row)=>sum+(row[pi]||0),0)||0}
function renderDragState(cp=state.checkpoint){
 if(!cp||!state.dragAlloc)return;const hasDragPot=(state.potMethods||[]).some(m=>m==='drag');
 for(let i=0;i<N;i++){const p=player(i),m=$('marker'+i);if(!p||!m)continue;const rem=playerDragRemaining(i);if(p.streetBet>1e-9){$('betamt'+i).textContent=fmt(rem);m.classList.toggle('drag-empty',hasDragPot&&rem<=1e-9);m.classList.toggle('drag-ready',rem>1e-9)}}
 for(let pi=0;pi<cp.pots.length;pi++){const z=$('dragZone'+pi);if(!z)continue;const moved=potDragMoved(pi),base=state.dragBase[pi]||0,label=pi===0?'MAIN POT':`SIDE POT ${pi}`,direct=state.directPotInputs?.[pi],method=state.potMethods?.[pi];z.classList.toggle('reverse-active',method==='reverse');if(method==='auto'){z.innerHTML=`<b>${label}</b><strong>${fmt(base)}</strong><small>이번 스트리트 추가 금액 0 · 이미 정리 완료</small><span class="methodbadge" style="border-color:#5d9b7480;color:#9fd8b8">자동 완료</span>`;}else if(method==='reverse'){z.innerHTML=`<b>${label}</b><strong class="reversevalue">${fmt(base + (direct||0))}</strong><small>${direct==null?`기존 ${fmt(base)} · 클릭해서 추가 금액 입력`:`기존 ${fmt(base)} + 역계산 입력 ${fmt(direct)}`}</small><span class="methodbadge reverse">역계산</span>`;}else{z.innerHTML=`<b>${label}</b><strong>${fmt(base+moved)}</strong><small>기존 ${fmt(base)} + <span class="moved">옮긴 칩 ${fmt(moved)}</span></small><span class="methodhint">드롭=정계산 · 클릭=역계산</span>${method==='drag'?'<span class="methodbadge forward">정계산</span>':''}`;}}
 const h=$('dragMoveHistory');if(h){const items=[];(state.potMethods||[]).forEach((m,pi)=>{if(m==='auto')items.push(`<div class="dragmove"><b>${pi===0?'MAIN':`SIDE ${pi}`}</b> · 기존 POT 그대로 · 추가 정리 없음</div>`)});(state.directPotInputs||[]).forEach((v,pi)=>{if(state.potMethods?.[pi]==='reverse'&&v!=null){const base=state.dragBase?.[pi]||0;items.push(`<div class="dragmove"><b>${pi===0?'MAIN':`SIDE ${pi}`}</b> · 역계산 +${fmt(v)} <span style="color:#7ba9c9">(총 ${fmt(base+v)})</span></div>`);}});state.dragMoves.slice().reverse().forEach(x=>items.push(`<div class="dragmove"><b>${names[x.i]}</b> → ${x.pi===0?'MAIN':`SIDE ${x.pi}`} · 정계산 ${fmt(x.amount)}</div>`));h.innerHTML=items.join('')||'<div class="dragmove">POT별로 드래그(정계산) 또는 클릭(역계산)을 선택하세요.</div>';}
 const btn=$('dragCheckBtn');if(btn)btn.textContent='팟 정리 정답 확인';
}
function openDragAmount(i,pi){$('practicalResult')?.classList.add('hidden');const rem=playerDragRemaining(i);if(rem<=1e-9)return;state.dragModalMode='drag';state.dragSource=i;state.dragTarget=pi;const label=pi===0?'MAIN POT':`SIDE POT ${pi}`;$('dragModalTitle').textContent=`${names[i]} → ${label} · 정계산`;$('dragModalDesc').textContent=`${names[i]} 앞에 남은 칩 ${fmt(rem)} 중에서 ${label}으로 얼마를 옮길까요?`;const inp=$('dragAmountInput');inp.max=rem;inp.value='';$('dragModalBack').classList.add('show');setTimeout(()=>inp.focus(),30);}
function openDirectPotAmount(pi){const cp=state.checkpoint;if(!cp||!cp.pots?.[pi])return;state.dragModalMode='direct';state.dragSource=null;state.dragTarget=pi;const label=pi===0?'MAIN POT':`SIDE POT ${pi}`;const base=state.dragBase?.[pi]||0;$('dragModalTitle').textContent=`${label} 추가 금액 입력 · 역계산`;$('dragModalDesc').textContent=`현재 ${label}은 ${fmt(base)}입니다. 여기에 추가로 넣을 금액을 입력하세요. 예: 90 입력 → 총 ${label} ${fmt(base+90)}`;const inp=$('dragAmountInput');inp.removeAttribute('max');inp.value=state.directPotInputs?.[pi]??'';$('dragModalBack').classList.add('show');setTimeout(()=>{inp.focus();inp.select()},30);}
function closeDragModal(){$('dragModalBack').classList.remove('show');state.dragSource=null;state.dragTarget=null;state.dragModalMode=null}