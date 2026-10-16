(function(){
  function phone(){return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches && window.matchMedia('(pointer:coarse)').matches;}

  /* Do not auto-open Problem/Explanation when an ALL-IN question is created.
     Keep the table visible; the bottom button already gets the waiting dot. */
  if(typeof pauseQuiz==='function'){
    const oldPauseQuiz=pauseQuiz;
    pauseQuiz=function(cp){
      const r=oldPauseQuiz.apply(this,arguments);
      if(phone()&&typeof setMobilePanel==='function') setMobilePanel('table');
      return r;
    };
  }

  /* Shared mobile number-entry modal for MAIN/SIDE answer fields. */
  function ensureAmountModal(){
    let back=document.getElementById('mobileAmountBack');
    if(back)return back;
    const style=document.createElement('style');
    style.textContent=`
      #mobileAmountBack{display:none;position:fixed;inset:0;z-index:12000;background:#0009;align-items:flex-end;justify-content:center;padding:0 max(12px,env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));backdrop-filter:blur(3px)}
      #mobileAmountBack.show{display:flex}
      #mobileAmountBox{width:min(520px,96vw);background:#101820;border:1px solid #3d4d5e;border-radius:16px;padding:12px;box-shadow:0 18px 55px #000c}
      #mobileAmountTitle{font-size:13px;font-weight:900;color:#f3d57e;margin-bottom:4px}
      #mobileAmountDesc{font-size:9px;color:#9eabb6;margin-bottom:8px}
      #mobileAmountInput{width:100%;height:52px;border-radius:11px;border:1px solid #56697c;background:#071018;color:#fff;text-align:center;font-size:25px;font-weight:900;outline:none;font-variant-numeric:tabular-nums}
      #mobileAmountInput:focus{border-color:#dfbd5d;box-shadow:0 0 0 2px #dfbd5d33}
      #mobileAmountBtns{display:grid;grid-template-columns:1fr 1.35fr;gap:7px;margin-top:8px}
      #mobileAmountBtns button{min-height:42px;border-radius:10px;border:1px solid #425365;background:#202c38;color:#fff;font-size:11px;font-weight:900}
      #mobileAmountBtns .ok{border:0;background:linear-gradient(#e4c66e,#b89042);color:#171109}
      @media(pointer:coarse) and (orientation:landscape){#mobileAmountBox{margin-bottom:2px}}
    `;
    document.head.appendChild(style);
    back=document.createElement('div');back.id='mobileAmountBack';
    back.innerHTML=`<div id="mobileAmountBox"><div id="mobileAmountTitle">금액 입력</div><div id="mobileAmountDesc">칩 금액을 입력하세요.</div><input id="mobileAmountInput" type="text" inputmode="numeric" pattern="[0-9]*" enterkeyhint="done" autocomplete="off"><div id="mobileAmountBtns"><button id="mobileAmountCancel">취소</button><button class="ok" id="mobileAmountOk">입력 완료</button></div></div>`;
    document.body.appendChild(back);
    back.addEventListener('click',e=>{if(e.target===back)closeAmountModal();});
    document.getElementById('mobileAmountCancel').onclick=closeAmountModal;
    document.getElementById('mobileAmountOk').onclick=confirmAmountModal;
    document.getElementById('mobileAmountInput').addEventListener('keydown',e=>{if(e.key==='Enter')confirmAmountModal();if(e.key==='Escape')closeAmountModal();});
    return back;
  }
  let amountTarget=null;
  function labelFor(id){return id==='mainAns'?'MAIN POT':id==='side1Ans'?'SIDE POT 1':id==='side2Ans'?'SIDE POT 2':'POT';}
  function openAmountModal(target){
    if(!phone())return;
    amountTarget=target;
    const back=ensureAmountModal(),inp=document.getElementById('mobileAmountInput');
    document.getElementById('mobileAmountTitle').textContent=labelFor(target.id)+' 금액 입력';
    document.getElementById('mobileAmountDesc').textContent='숫자만 입력하면 원래 문제칸에 자동으로 들어갑니다.';
    inp.value=target.value||'';
    back.classList.add('show');
    inp.focus({preventScroll:true});
    try{inp.setSelectionRange(inp.value.length,inp.value.length)}catch(e){}
  }
  function closeAmountModal(){document.getElementById('mobileAmountBack')?.classList.remove('show');amountTarget=null;}
  function confirmAmountModal(){
    const inp=document.getElementById('mobileAmountInput');
    if(!amountTarget||!inp)return closeAmountModal();
    const raw=(inp.value||'').replace(/[^0-9]/g,'');
    if(raw===''){inp.focus({preventScroll:true});return;}
    amountTarget.value=raw;
    amountTarget.dispatchEvent(new Event('input',{bubbles:true}));
    amountTarget.dispatchEvent(new Event('change',{bubbles:true}));
    closeAmountModal();
  }

  function bindCalcInputs(){
    ['mainAns','side1Ans','side2Ans','totalAns'].forEach(id=>{
      const el=document.getElementById(id);if(!el)return;
      if(phone()){el.readOnly=true;el.setAttribute('inputmode','none');}
      else{el.readOnly=false;el.setAttribute('inputmode','decimal');}
      if(el.dataset.mobileAmountBound)return;
      el.dataset.mobileAmountBound='1';
      el.addEventListener('click',e=>{if(!phone())return;e.preventDefault();e.stopPropagation();openAmountModal(el);});
    });
  }
  bindCalcInputs();

  /* Existing practical forward/reverse amount modal: force numeric keypad immediately. */
  function prepareDragNumericInput(){
    const inp=document.getElementById('dragAmountInput');if(!inp)return;
    inp.setAttribute('type','text');inp.setAttribute('inputmode','numeric');inp.setAttribute('pattern','[0-9]*');inp.setAttribute('enterkeyhint','done');inp.setAttribute('autocomplete','off');
    if(phone()){
      inp.focus({preventScroll:true});
      try{inp.select()}catch(e){}
    }
  }
  if(typeof openDragAmount==='function'){
    const oldOpenDragAmount=openDragAmount;
    openDragAmount=function(){const r=oldOpenDragAmount.apply(this,arguments);prepareDragNumericInput();return r;};
  }
  if(typeof openDirectPotAmount==='function'){
    const oldOpenDirectPotAmount=openDirectPotAmount;
    openDirectPotAmount=function(){const r=oldOpenDirectPotAmount.apply(this,arguments);prepareDragNumericInput();return r;};
  }

  window.addEventListener('orientationchange',()=>setTimeout(bindCalcInputs,250));
  window.addEventListener('resize',()=>setTimeout(bindCalcInputs,80));
})();
