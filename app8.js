(function(){
  function ensureJudgeToast(){
    let el=document.getElementById('judgeToast');
    if(!el){el=document.createElement('div');el.id='judgeToast';el.className='judgetoast';document.body.appendChild(el)}
    return el;
  }
  window.showJudgeToast=function(ok,text=''){
    const el=ensureJudgeToast();
    el.className='judgetoast show '+(ok?'ok':'bad');
    el.innerHTML='<b>'+(ok?'✅ 정답':'❌ 오답')+'</b>'+(text?'<span>'+text+'</span>':'');
    clearTimeout(window.__judgeToastTimer);
    window.__judgeToastTimer=setTimeout(()=>el.classList.remove('show'),1800);
  };
  function showMobileHint(text){
    const el=ensureJudgeToast();
    el.className='judgetoast show hint';
    el.innerHTML='<b>'+text+'</b>';
    clearTimeout(window.__judgeToastTimer);
    window.__judgeToastTimer=setTimeout(()=>el.classList.remove('show'),1500);
  }

  if(typeof grade==='function'){
    const originalGrade=grade;
    grade=function(ok,detail,afterText){
      const r=originalGrade(ok,detail,afterText);
      showJudgeToast(ok,ok?'맞았습니다':'해설에서 틀린 부분을 확인하세요');
      return r;
    };
  }

  if(typeof checkDragPractical==='function'){
    const originalCheckDragPractical=checkDragPractical;
    checkDragPractical=function(){
      const before=state.answered||0;
      const r=originalCheckDragPractical.apply(this,arguments);
      setTimeout(()=>{
        if((state.answered||0)>before)return;
        const pr=document.getElementById('practicalResult');
        if(pr&&!pr.classList.contains('hidden')){
          const txt=(pr.textContent||'').trim();
          if(txt.includes('❌')||txt.includes('아직 맞지')||txt.includes('선택하세요'))showJudgeToast(false,'칩 분리를 다시 확인해보세요');
        }
      },0);
      return r;
    };
  }

  /* Mobile confirmed POT placement: keep each MAIN/SIDE beside its all-in anchor. */
  function placeMobileConfirmedPots(){
    if(typeof isMobileLandscape!=='function'||!isMobileLandscape()||!state.confirmedSplit)return;
    const nodes=[...document.querySelectorAll('#potBank .potpile')];
    if(!nodes.length)return;
    const anchors=typeof splitPotAnchors==='function'?splitPotAnchors():[];
    const pref6=[
      [[50,55],[43,57],[57,57]],
      [[76,40],[70,44],[79,49]],
      [[76,64],[69,62],[80,57]],
      [[50,76],[42,72],[58,72]],
      [[24,64],[31,62],[20,57]],
      [[24,40],[30,44],[21,49]]
    ];
    const pref9=[
      [[50,54],[44,56],[56,56]],
      [[67,39],[62,43],[71,45]],
      [[79,47],[74,48],[78,55]],
      [[77,63],[71,61],[74,69]],
      [[63,73],[58,69],[67,68]],
      [[37,73],[42,69],[33,68]],
      [[23,63],[29,61],[26,69]],
      [[21,47],[26,48],[22,55]],
      [[33,39],[38,43],[29,45]]
    ];
    const prefs=N===9?pref9:pref6;
    const generic=N===9?[[50,69],[42,66],[58,66],[50,78]]:[[50,68],[40,68],[60,68],[50,78]];
    const used=[];
    const collides=(a,b)=>Math.abs(a[0]-b[0])<12&&Math.abs(a[1]-b[1])<11;
    const pick=(anchorIndex)=>{
      const candidates=[];
      if(Number.isInteger(anchorIndex)&&prefs[anchorIndex])candidates.push(...prefs[anchorIndex]);
      candidates.push(...generic);
      for(const p of candidates){if(!used.some(u=>collides(u,p))){used.push(p);return p}}
      const p=[35+(used.length%3)*15,76];used.push(p);return p;
    };
    nodes.forEach((node,pi)=>{
      const anchor=pi<anchors.length?anchors[pi]:null;
      const p=pick(anchor?.i);
      node.dataset.anchor=anchor?String(anchor.i):'none';
      node.style.setProperty('left',p[0]+'%','important');
      node.style.setProperty('top',p[1]+'%','important');
      const note=node.querySelector('small');
      if(note&&anchor)note.textContent=names[anchor.i]+' 올인 기준';
    });
  }
  if(typeof renderPotBank==='function'){
    const originalRenderPotBank=renderPotBank;
    renderPotBank=function(){const r=originalRenderPotBank.apply(this,arguments);placeMobileConfirmedPots();return r;};
  }

  function clearMobileChipSelection(){
    state.mobileSelectedChip=null;
    document.querySelectorAll('.betmarker.mobile-selected').forEach(x=>x.classList.remove('mobile-selected'));
    document.querySelectorAll('.dragpotzone.mobile-target').forEach(x=>x.classList.remove('mobile-target'));
  }
  function selectMobileChip(i){
    if(state.mobileSelectedChip===i){clearMobileChipSelection();showMobileHint('칩 선택 취소');return}
    clearMobileChipSelection();state.mobileSelectedChip=i;
    document.getElementById('marker'+i)?.classList.add('mobile-selected');
    document.querySelectorAll('.dragpotzone').forEach(z=>z.classList.add('mobile-target'));
    showMobileHint(names[i]+' 칩 선택 → 넣을 MAIN/SIDE를 터치');
  }
  function sendMobileChipToPot(i,pi){
    if(!Number.isInteger(i)||!Number.isInteger(pi))return;
    if(state.potMethods?.[pi]==='auto'){showMobileHint('이 POT은 추가 칩이 없어 자동 완료입니다');clearMobileChipSelection();return}
    if(state.potMethods?.[pi]==='reverse'){showMobileHint('이 POT은 역계산 중입니다');clearMobileChipSelection();return}
    state.potMethods[pi]='drag';clearMobileChipSelection();openDragAmount(i,pi);
  }
  function installMobilePracticalControls(){
    if(typeof isMobileLandscape!=='function'||!isMobileLandscape())return;
    state.mobileSelectedChip=null;
    const hint=document.getElementById('practicalHint');
    if(hint)hint.innerHTML='<b>모바일 조작</b> · 칩을 한 번 터치 → 넣을 MAIN/SIDE 터치 → 금액 입력<br><span style="color:#8293a0">그대로 끌어다 놓는 드래그도 사용할 수 있습니다. POT 박스만 바로 터치하면 역계산입니다.</span>';

    document.querySelectorAll('.dragpotzone').forEach(z=>{
      const oldClick=z.onclick;
      z.onclick=function(e){
        if(Number.isInteger(state.mobileSelectedChip)){
          e.preventDefault();e.stopPropagation();sendMobileChipToPot(state.mobileSelectedChip,Number(z.dataset.pot));return;
        }
        if(oldClick)oldClick.call(z,e);
      };
    });

    document.querySelectorAll('.betmarker').forEach((m,i)=>{
      const p=player(i);if(!p||p.streetBet<=1e-9)return;
      m.onpointerdown=function(e){
        if(e.pointerType==='mouse'||!isMobileLandscape()){beginTouchChipDrag(i,e);return}
        e.preventDefault();e.stopPropagation();
        const sx=e.clientX,sy=e.clientY;let moving=false;
        const ghost=document.getElementById('touchGhost');
        const move=ev=>{
          if(!moving&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>12){moving=true;if(ghost){ghost.textContent=names[i]+' 칩 '+fmt(playerDragRemaining(i));ghost.style.display='block'}}
          if(moving&&ghost){ghost.style.left=ev.clientX+'px';ghost.style.top=ev.clientY+'px'}
        };
        const finish=ev=>{
          document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',finish,true);document.removeEventListener('pointercancel',finish,true);
          if(ghost)ghost.style.display='none';
          if(!moving){selectMobileChip(i);return}
          const zone=document.elementFromPoint(ev.clientX,ev.clientY)?.closest?.('.dragpotzone');
          if(zone)sendMobileChipToPot(i,Number(zone.dataset.pot));
        };
        document.addEventListener('pointermove',move,true);document.addEventListener('pointerup',finish,true);document.addEventListener('pointercancel',finish,true);
      };
    });
  }
  if(typeof setupPracticalQuiz==='function'){
    const originalSetupPracticalQuiz=setupPracticalQuiz;
    setupPracticalQuiz=function(cp){const r=originalSetupPracticalQuiz.apply(this,arguments);installMobilePracticalControls();return r;};
  }
  if(typeof clearDragUI==='function'){
    const originalClearDragUI=clearDragUI;
    clearDragUI=function(){clearMobileChipSelection();return originalClearDragUI.apply(this,arguments);};
  }

  /* Slower mobile autoplay makes actions readable without changing desktop speed. */
  if(typeof scheduleAuto==='function'){
    scheduleAuto=function(){
      clearAuto();
      if(!$('auto').checked||state.paused||state.idx>=state.script.length)return;
      state.autoTimer=setTimeout(executeNext,(typeof isMobileLandscape==='function'&&isMobileLandscape())?1250:950);
    };
  }
})();
