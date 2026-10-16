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

  if(typeof grade==='function'){
    const originalGrade=grade;
    grade=function(ok,detail,afterText){
      const r=originalGrade(ok,detail,afterText);
      showJudgeToast(ok,ok?'맞았습니다':'다시 확인해보세요');
      return r;
    };
  }

  if(typeof checkDragPractical==='function'){
    const originalCheckDragPractical=checkDragPractical;
    checkDragPractical=function(){
      const beforeAnswered=(window.state&&state.answered)||0;
      const r=originalCheckDragPractical.apply(this,arguments);
      setTimeout(()=>{
        const nowAnswered=(window.state&&state.answered)||0;
        if(nowAnswered>beforeAnswered) return;
        const pr=document.getElementById('practicalResult');
        if(pr&&!pr.classList.contains('hidden')){
          const txt=(pr.textContent||'').trim();
          if(txt.includes('❌')||txt.includes('아직 맞지')||txt.includes('선택하세요')) showJudgeToast(false,'칩 분리를 다시 확인해보세요');
        }
      },0);
      return r;
    };
  }
})();
