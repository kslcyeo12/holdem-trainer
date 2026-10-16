(function(){
  function mobile(){return typeof isMobileLandscape==='function'&&isMobileLandscape()}
  function tableView(){if(mobile()&&typeof setMobilePanel==='function')setTimeout(()=>setMobilePanel('table'),20)}

  /* Starting or continuing a hand should immediately return to the table. */
  document.getElementById('startBtn')?.addEventListener('click',tableView);
  document.getElementById('continueBtn')?.addEventListener('click',tableView);
  document.getElementById('topContinueBtn')?.addEventListener('click',tableView);

  /* Add a dedicated manual NEXT button so mobile users do not reopen Settings every action. */
  const bar=document.getElementById('mobileBar');
  if(bar&&!document.getElementById('mobileNextBtn')){
    const b=document.createElement('button');b.id='mobileNextBtn';b.textContent='다음 ▶';
    const settings=document.getElementById('mobileSettingsBtn');bar.insertBefore(b,settings||null);
    b.onclick=()=>{
      if(!mobile())return;
      if(state.paused){if(typeof showJudgeToast==='function')showJudgeToast(false,'먼저 현재 문제를 확인하세요');return}
      const auto=document.getElementById('auto');if(auto)auto.checked=false;
      clearAuto();executeNext();setMobilePanel('table');
    };
  }

  /* Make it obvious when a question is waiting. */
  if(typeof pauseQuiz==='function'){
    const oldPause=pauseQuiz;
    pauseQuiz=function(cp){const r=oldPause.apply(this,arguments);const q=document.getElementById('mobileQuizBtn');if(q)q.textContent='문제/해설 ●';return r;};
  }
  if(typeof hideQuiz==='function'){
    const oldHide=hideQuiz;
    hideQuiz=function(){const r=oldHide.apply(this,arguments);const q=document.getElementById('mobileQuizBtn');if(q)q.textContent='문제/해설';return r;};
  }
})();
