function confirmDragAmount(){
 const pi=state.dragTarget;if(!Number.isInteger(pi)){closeDragModal();return}
 if(state.dragModalMode==='direct'){
   const amount=Number($('dragAmountInput').value);if(!Number.isFinite(amount)||amount<0){$('dragModalDesc').textContent='0 이상의 추가 칩 금액을 숫자로 입력하세요.';return}
   if(!state.directPotInputs)state.directPotInputs=Array(state.checkpoint?.pots?.length||0).fill(null);state.potMethods[pi]='reverse';state.directPotInputs[pi]=amount;const base=state.dragBase?.[pi]||0;closeDragModal();renderDragState();practicalFeedback(`✍️ ${pi===0?'MAIN':`SIDE ${pi}`} 역계산: 기존 ${fmt(base)} + 추가 ${fmt(amount)} = 총 ${fmt(base+amount)}`);return;
 }
 const i=state.dragSource;if(!Number.isInteger(i)){closeDragModal();return}
 const rem=playerDragRemaining(i),amount=Number($('dragAmountInput').value);if(!Number.isFinite(amount)||amount<=0||amount>rem+1e-9){$('dragModalDesc').textContent=`0보다 크고 ${fmt(rem)} 이하로 입력하세요.`;return}
 state.potMethods[pi]='drag';state.dragAlloc[i][pi]+=amount;state.dragMoves.push({i,pi,amount});closeDragModal();renderDragState();practicalFeedback(`✅ ${names[i]}에서 ${pi===0?'MAIN':`SIDE ${pi}`}으로 ${fmt(amount)} 이동했습니다. 이 POT만 정계산으로 처리됩니다.`);
}
function resetDragAllocation(){if(!state.checkpoint||!state.dragExpected)return;state.dragAlloc=Array.from({length:N},()=>Array(state.checkpoint.pots.length).fill(0));state.dragMoves=[];state.directPotInputs=Array(state.checkpoint.pots.length).fill(null);state.potMethods=initialPotMethods(state.checkpoint);state.dragModalMode=null;renderDragState();practicalFeedback('처음 상태로 되돌렸습니다. 각 POT별로 정계산/역계산을 다시 선택하세요.');}
function practicalFeedback(text,bad=false){const r=$('practicalResult');r.classList.remove('hidden');r.style.borderColor=bad?'#78424b':'#315544';r.style.background=bad?'#351e23':'#0d1a16';r.innerHTML=text}
function checkDragPractical(){
 if(!state.paused||!state.checkpoint||state.checkpoint.type==='showdown'||!state.dragExpected)return;const cp=state.checkpoint;const methods=state.potMethods||[];
 for(let pi=0;pi<cp.pots.length;pi++){if(!methods[pi]){practicalFeedback(`${pi===0?'MAIN POT':`SIDE POT ${pi}`}의 계산방법을 선택하세요. 칩 드롭=정계산 / 박스 클릭=역계산`,true);return}}
 const bad=[];
 for(let pi=0;pi<cp.pots.length;pi++){
   if(methods[pi]==='reverse'){
     const v=state.directPotInputs?.[pi];if(v==null){practicalFeedback(`${pi===0?'MAIN POT':`SIDE POT ${pi}`}에 추가할 역계산 금액을 입력하세요.`,true);return}
     const base=state.dragBase?.[pi]||0; if(Math.abs((base+Number(v))-cp.pots[pi].amount)>1e-6)bad.push(`${pi===0?'MAIN':`SIDE ${pi}`} 역계산`);
   }else{
     for(let i=0;i<N;i++){const a=state.dragAlloc[i][pi]||0,e=state.dragExpected[i][pi]||0;if(Math.abs(a-e)>1e-6){bad.push(`${names[i]}→${pi===0?'MAIN':`SIDE${pi}`}`)}}
   }
 }
 if(bad.length){state.practicalCorrect=false;practicalFeedback(`❌ 아직 맞지 않습니다.${practicalWrongExplain(cp,methods)}`,true);return}
 finishPracticalQuiz(cp);
}
function finishPracticalQuiz(cp){
 const ans=cp.pots.map(p=>p.amount);const methods=state.potMethods||[];const methodText=methods.map((m,i)=>`${i===0?'MAIN':`SIDE ${i}`} ${m==='reverse'?'역계산':m==='auto'?'자동 완료':'정계산'}`).join(' · ');
 grade(true,`혼합 계산 완료 · ${ans.map((v,i)=>`${i===0?'MAIN':`SIDE ${i}`} ${fmt(v)}`).join(' / ')}<br><span style="color:#9fb0bc">${methodText}</span><div class="explain">${splitExplain(cp)}</div>`,'각 POT별로 선택한 계산법과 팟 금액이 모두 맞았습니다.');
 $('quiz')?.classList.add('practical-done');
 state.pendingPots=cp.pots.map(p=>({...p}));state.pendingSplit=true;state.splitQuizLevel=Math.max(state.splitQuizLevel,cp.pots.length);document.querySelectorAll('.betmarker').forEach(m=>m.classList.remove('drag-ready'));$('continueBtn').textContent='칩 정리 후 계속 ▶';$('continueBtn').style.display='none';showTopPracticalActions('continue');
}
function handlePracticalAction(){checkDragPractical()}
function isMobileLandscape(){return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches}
function setMobilePanel(mode){const side=$('sidePanel'),bar=$('mobileBar'); if(!side||!bar)return;['mobileTableBtn','mobileSettingsBtn','mobileQuizBtn'].forEach(id=>$(id)?.classList.remove('active'));side.classList.remove('mobile-open','mobile-settings','mobile-quiz');if(mode==='settings'){side.classList.add('mobile-open','mobile-settings');$('mobileSettingsBtn')?.classList.add('active')}else if(mode==='quiz'){side.classList.add('mobile-open','mobile-quiz');$('mobileQuizBtn')?.classList.add('active')}else $('mobileTableBtn')?.classList.add('active');}
let touchDragCleanup=null;
function beginTouchChipDrag(i,e){if(!isMobileLandscape()||e.pointerType==='mouse')return;const p=player(i); if(!p||playerDragRemaining(i)<=1e-9)return;e.preventDefault(); const ghost=$('touchGhost'); if(!ghost)return;ghost.textContent=`${names[i]} 칩 ${fmt(playerDragRemaining(i))}`; ghost.style.display='block'; ghost.style.left=e.clientX+'px'; ghost.style.top=e.clientY+'px';const move=ev=>{ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px'};const up=ev=>{document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',up,true);ghost.style.display='none';const under=document.elementFromPoint(ev.clientX,ev.clientY); const zone=under?.closest?.('.dragpotzone');if(zone){const pi=Number(zone.dataset.pot);if(Number.isInteger(pi)){if(state.potMethods?.[pi]==='reverse'){practicalFeedback(`${pi===0?'MAIN':`SIDE ${pi}`}은 역계산으로 입력 중입니다.`,true)}else{state.potMethods[pi]='drag';openDragAmount(i,pi)}}}};document.addEventListener('pointermove',move,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',up,true);}
const seatPos6=[[50,7],[83,27],[83,61],[50,72],[17,61],[17,27]];
const betPos6=[[50,23],[72,34],[72,55],[50,64],[28,55],[28,34]];
const seatPos9=[[50,7],[77,15],[91,37],[86,62],[64,77],[36,77],[14,62],[9,37],[23,15]];
const betPos9=[[50,23],[68,28],[78,40],[74,55],[60,65],[40,65],[26,55],[22,40],[32,28]];
function currentSeatPos(){return N===9?seatPos9:seatPos6}
function currentBetPos(){return N===9?betPos9:betPos6}
function prePositionKeys(){return N===9?['UTG','UTG1','MP','LJ','HJ','CO','BTN','SB','BB']:['UTG','HJ','CO','BTN','SB','BB']}
function postPositionKeys(){return N===9?['SB','BB','UTG','UTG1','MP','LJ','HJ','CO','BTN']:['SB','BB','UTG','HJ','CO','BTN']}
function preOrderFor(pm){return prePositionKeys().map(k=>pm[k])}
function postOrderFor(pm){return postPositionKeys().map(k=>pm[k])}
function displayPos(k){return k==='UTG1'?'UTG+1':k}
function configurePlayerCount(count){N=count===9?9:6;names=Array.from({length:N},(_,i)=>`P${i+1}`);const tc=document.querySelector('.tablecard');if(tc)tc.classList.toggle('nine',N===9);}
const potAnchorPos=[[50,12],[80,38],[75,67],[50,73],[25,67],[20,38]];
const centerSidePos=[[50,58],[32,63],[68,63]];
const ranks=['A','K','Q','J','10','9','8','7','6','5','4','3','2'],suits=['♠','♥','♦','♣'];
const rankValue={2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,J:11,Q:12,K:13,A:14};
const state={hand:0,dealer:0,sb:1,bb:2,players:[],deck:[],board:[],burn:[],script:[],idx:0,street:'READY',paused:false,checkpoint:null,autoTimer:null,quizTimer:null,quizStart:0,correct:0,answered:0,streak:0,totalTime:0,log:[],positions:null,confirmedPots:[],confirmedSplit:false,pendingPots:null,pendingSplit:false,hadAllIn:false,showdown:false,showdownData:null,splitQuizLevel:1,forcedChop:false,trainingMode:'calc',practicalStage:0,practicalCorrect:true,dragAlloc:null,dragMoves:[],dragSource:null,dragTarget:null,dragBase:[],dragExpected:null,directPotInputs:null,potMethods:null,dragModalMode:null};
function fmt(n){const v=Math.round(Number(n)*10)/10;return Number.isFinite(v)?v.toLocaleString('ko-KR',{maximumFractionDigits:1}):'0'}
function posMap(d){const keys=N===9?['BTN','SB','BB','UTG','UTG1','MP','LJ','HJ','CO']:['BTN','SB','BB','UTG','HJ','CO'];const r={};keys.forEach((k,off)=>r[k]=(d+off)%N);return r}
function reversePos(pm){const r={};Object.entries(pm).forEach(([k,v])=>r[v]=k);return r}
function shuffledDeck(){const d=[];for(const r of ranks)for(const s of suits)d.push(r+s);for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d}
function player(i){return state.players[i]}
function pay(i,amount){const p=player(i),x=Math.min(amount,p.stack);p.stack-=x;p.streetBet+=x;p.total+=x;if(p.stack<=0.0001){p.stack=0;p.allin=true;state.hadAllIn=true}return x}
function toAmount(i,target){return pay(i,Math.max(0,target-player(i).streetBet))}
function potTotal(){return state.players.reduce((s,p)=>s+p.total,0)}
function resetStreetBets(){state.players.forEach(p=>p.streetBet=0)}
function addAct(street,pos,type,to=null){state.script.push({kind:'action',street,pos,type,to})}
function endStreet(street){state.script.push({kind:'streetEnd',street})}
function reveal(street,count){state.script.push({kind:'reveal',street,count})}
function showdown(){state.script.push({kind:'showdown'})}
function cardParts(c){return{r:c.slice(0,-1),s:c.slice(-1)}}
function makeSeats(){const rp=reversePos(state.positions),seatPos=currentSeatPos(),betPos=currentBetPos(),seatHalf=N===9?53:71,seatTop=N===9?34:44;$('seats').innerHTML='';$('betmarkers').innerHTML='';for(let i=0;i<N;i++){const s=document.createElement('div');s.className='seat';s.dataset.i=i;s.style.left=`calc(${seatPos[i][0]}% - ${seatHalf}px)`;s.style.top=`calc(${seatPos[i][1]}% - ${seatTop}px)`;s.innerHTML=`<div class="seathead"><span class="seatname">${names[i]}</span><span class="pos">${displayPos(rp[i]||'')}</span></div><div class="holecards"><span class="hole" id="hole${i}a"></span><span class="hole" id="hole${i}b"></span></div><div class="stack">STACK <b id="stack${i}">0</b></div><div class="cumline" id="cum${i}"></div><div class="rankline" id="rank${i}"></div><div class="act" id="act${i}"></div>`;$('seats').appendChild(s);const m=document.createElement('div');m.className='betmarker';m.id='marker'+i;m.style.left=`calc(${betPos[i][0]}% - 40px)`;m.style.top=`calc(${betPos[i][1]}% - 18px)`;m.innerHTML=`<span class="betstack"><i></i><i></i><i></i></span><span class="betamt" id="betamt${i}">0</span>`;$('betmarkers').appendChild(m)}}
function renderBoard(){const revealCount=state.street==='PREFLOP'||state.street==='READY'?0:state.street==='FLOP'?3:state.street==='TURN'?4:5;$('board').innerHTML='';for(let i=0;i<5;i++){const d=document.createElement('div'),c=state.board[i];const shown=i<revealCount&&c;d.className='boardcard '+(shown?(/[♥♦]/.test(c)?'red':''):'back');d.textContent=shown?c:'◆';$('board').appendChild(d)}}
function splitPotAnchors(){const allins=state.players.map((p,i)=>({i,total:Math.round((p.total||0)*1000)/1000,allin:p.allin,folded:p.folded})).filter(x=>x.allin&&!x.folded&&x.total>0).sort((a,b)=>a.total-b.total||a.i-b.i);const uniq=[];for(const x of allins){if(!uniq.length||Math.abs(uniq[uniq.length-1].total-x.total)>1e-6)uniq.push(x)}return uniq;}