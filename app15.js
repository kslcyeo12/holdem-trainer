(function(){
  function phone(){return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches&&window.matchMedia('(pointer:coarse)').matches;}

  /* ---------- MOBILE POT RENDER: final position from the first frame ---------- */
  const desktopRenderPotBank=renderPotBank;
  const pile6={0:[50,16],1:[84,31],2:[84,66],3:[50,82],4:[16,66],5:[16,31]};
  const pile9={0:[50,15],1:[70,22],2:[86,37],3:[82,63],4:[66,80],5:[34,80],6:[18,63],7:[14,37],8:[30,22]};
  const generic6=[[50,66],[40,63],[60,63]],generic9=[[50,66],[40,63],[60,63],[31,61],[69,61]];
  function collision(a,b){return Math.abs(a[0]-b[0])<11&&Math.abs(a[1]-b[1])<9;}
  function choose(primary,generic,used){
    const list=[];if(primary)list.push(primary);list.push(...generic);
    for(const p of list){if(!used.some(u=>collision(u,p))){used.push(p);return p;}}
    const p=[50,68];used.push(p);return p;
  }
  renderPotBank=function(){
    if(!phone())return desktopRenderPotBank.apply(this,arguments);
    const bank=$('potBank');bank.innerHTML='';
    const pots=state.confirmedPots||[];
    const collectedTotal=pots.reduce((sum,p)=>sum+(Number(p.amount)||0),0);
    const askingSplit=!!(state.paused&&state.checkpoint&&state.checkpoint.split&&state.checkpoint.type!=='showdown');
    if(!state.confirmedSplit){
      const d=document.createElement('div');d.className='currentpot'+(askingSplit?' quizpot':'');
      d.innerHTML=`<small>${askingSplit?'기존 중앙 POT':'중앙 POT'}</small><strong>${fmt(collectedTotal)}</strong><span>${askingSplit?'좌석 앞 칩은 아직 미포함':'현재 스트리트 칩은 좌석 앞에 유지'}</span>`;
      bank.appendChild(d);
      if(askingSplit){const n=document.createElement('div');n.className='splitnotice';n.textContent='ALL-IN 발생 · 좌석 앞 칩 + 누적 투입액으로 MAIN / SIDE 계산';bank.appendChild(n)}
      return;
    }
    if(askingSplit){const n=document.createElement('div');n.className='splitnotice';n.textContent='새 ALL-IN 발생 · 기존 POT은 그대로, 좌석 앞 칩을 반영해 다시 분리';bank.appendChild(n)}
    const anchors=splitPotAnchors(),map=N===9?pile9:pile6,generic=N===9?generic9:generic6,used=[];
    pots.forEach((p,i)=>{
      const anchor=i<anchors.length?anchors[i]:null;
      const pos=choose(anchor&&map[anchor.i]?map[anchor.i]:null,generic,used);
      const d=document.createElement('div');d.className='potpile '+(i===0?'mainpot':i===1?'side1':'side2');
      d.dataset.mobileAnchor=anchor?String(anchor.i):'center';
      d.style.setProperty('left',pos[0]+'%','important');
      d.style.setProperty('top',pos[1]+'%','important');
      d.style.setProperty('transform','translate(-50%,-50%)','important');
      d.style.setProperty('transition','none','important');
      d.style.setProperty('animation','none','important');
      const label=i===0?'MAIN POT':`SIDE POT ${i}`;
      const note=anchor?`${names[anchor.i]} 올인 기준`:(i===0?'MAIN POT':'남은 플레이어 진행 SIDE');
      d.innerHTML=`<div class="chipvisual"><i></i><i></i><i></i></div><b>${label}</b><strong>${fmt(p.amount)}</strong><small>${note}</small>`;
      bank.appendChild(d);
    });
  };

  /* ---------- Practical MAIN/SIDE zones: place once, no observer / no loop ---------- */
  const zone6={0:[50,28],1:[68,35],2:[68,57],3:[50,65],4:[32,57],5:[32,35]};
  const zone9={0:[50,27],1:[63,30],2:[73,40],3:[70,56],4:[60,64],5:[40,64],6:[30,56],7:[27,40],8:[37,30]};
  const gz6=[[50,54],[40,52],[60,52]],gz9=[[50,54],[40,52],[60,52],[32,52],[68,52]];
  function placeZonesOnce(){
    if(!phone())return;
    const els=[...document.querySelectorAll('#dragPotLayer .dragpotzone')];if(!els.length)return;
    const anchors=splitPotAnchors(),map=N===9?zone9:zone6,generic=N===9?gz9:gz6,used=[];
    els.forEach((el,i)=>{
      const a=i<anchors.length?anchors[i]:null,pos=choose(a&&map[a.i]?map[a.i]:null,generic,used);
      el.dataset.mobileAnchor=a?String(a.i):'center';
      el.style.setProperty('left',pos[0]+'%','important');
      el.style.setProperty('top',pos[1]+'%','important');
      el.style.setProperty('transform','translate(-50%,-50%)','important');
      el.style.setProperty('transition','none','important');
      el.style.setProperty('animation','none','important');
    });
  }
  const baseSetupPracticalQuiz=setupPracticalQuiz;
  setupPracticalQuiz=function(){const r=baseSetupPracticalQuiz.apply(this,arguments);placeZonesOnce();return r;};

  /* Never auto-open the problem sheet on ALL-IN. */
  const basePauseQuiz=pauseQuiz;
  pauseQuiz=function(cp){const r=basePauseQuiz.apply(this,arguments);if(phone())setMobilePanel('table');return r;};

  /* ---------- Stable mobile styling ---------- */
  const style=document.createElement('style');
  style.textContent=`@media(pointer:coarse) and (orientation:landscape){
    #potBank .potpile{transition:none!important;animation:none!important}
    #potBank .potpile[data-mobile-anchor]{min-width:72px!important;max-width:84px!important;padding:4px 5px!important;border-radius:9px!important;z-index:20!important}
    #potBank .potpile[data-mobile-anchor] .chipvisual{height:15px!important;margin:0!important}
    #potBank .potpile[data-mobile-anchor] .chipvisual i{width:15px!important;height:15px!important;border-width:2px!important}
    #potBank .potpile[data-mobile-anchor] b{font-size:6px!important;line-height:1!important}
    #potBank .potpile[data-mobile-anchor] strong{font-size:13px!important;line-height:1!important;margin-top:2px!important}
    #potBank .potpile[data-mobile-anchor] small{display:none!important}
    #dragPotLayer .dragpotzone{transition:none!important;animation:none!important}
    #dragPotLayer .dragpotzone[data-mobile-anchor]{z-index:24!important;width:82px!important;min-height:50px!important}
    #appKeypadBack{display:none;position:fixed;inset:0;z-index:20000;background:#000a;align-items:center;justify-content:center;padding:max(8px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));backdrop-filter:blur(4px)}
    #appKeypadBack.show{display:flex}#appKeypadBox{width:min(360px,68vw);background:#101820;border:1px solid #46596b;border-radius:16px;padding:9px;box-shadow:0 22px 70px #000d}
    #appKeypadTitle{text-align:center;font-size:13px;font-weight:900;color:#f0cf70}#appKeypadHint{text-align:center;font-size:8px;color:#98a6b2;margin:3px 0 7px}
    #appKeypadDisplay{height:46px;border:1px solid #53677a;border-radius:10px;background:#071018;color:#fff;display:flex;align-items:center;justify-content:flex-end;padding:0 13px;font-size:24px;font-weight:900;font-variant-numeric:tabular-nums;overflow:hidden}
    #appKeypadGrid,#inlineDragKeypad{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:7px}
    #appKeypadGrid button,#inlineDragKeypad button{min-height:37px;border:1px solid #3f5162;border-radius:9px;background:#1a2631;color:#fff;font-size:14px;font-weight:900;touch-action:manipulation}
    #appKeypadGrid .clear,#inlineDragKeypad .clear{color:#ffb3b7}#appKeypadGrid .ok,#inlineDragKeypad .ok{grid-column:span 2;background:linear-gradient(#e4c66e,#b89042);border:0;color:#171109}
    #dragModalBack.app-keypad-open .dragmodal{width:min(390px,72vw)!important}
  }`;
  document.head.appendChild(style);

  /* ---------- In-app keypad ---------- */
  let target=null,buffer='';
  const keys=[['1','1'],['2','2'],['3','3'],['⌫','back'],['4','4'],['5','5'],['6','6'],['C','clear'],['7','7'],['8','8'],['9','9'],['000','000'],['00','00'],['0','0'],['취소','cancel'],['입력 완료','ok']];
  function pretty(v){if(!v)return '0';const n=Number(v);return Number.isFinite(n)?n.toLocaleString('ko-KR'):v;}
  function ensurePad(){
    let back=document.getElementById('appKeypadBack');if(back)return back;
    back=document.createElement('div');back.id='appKeypadBack';back.innerHTML='<div id="appKeypadBox"><div id="appKeypadTitle">금액 입력</div><div id="appKeypadHint">화면 숫자패드로 입력하세요</div><div id="appKeypadDisplay">0</div><div id="appKeypadGrid"></div></div>';document.body.appendChild(back);
    const grid=document.getElementById('appKeypadGrid');keys.forEach(([txt,val])=>{const b=document.createElement('button');b.textContent=txt;b.dataset.key=val;if(val==='clear'||val==='cancel')b.classList.add('clear');if(val==='ok')b.classList.add('ok');grid.appendChild(b)});
    grid.addEventListener('click',e=>{const b=e.target.closest('button');if(b)press(b.dataset.key)});back.addEventListener('click',e=>{if(e.target===back)closePad()});return back;
  }
  function openPad(el,label){target=el;buffer=(el.value||'').replace(/[^0-9]/g,'');const back=ensurePad();document.getElementById('appKeypadTitle').textContent=label+' 금액 입력';document.getElementById('appKeypadDisplay').textContent=pretty(buffer);back.classList.add('show');}
  function closePad(){document.getElementById('appKeypadBack')?.classList.remove('show');target=null;buffer='';}
  function press(k){if(k==='cancel')return closePad();if(k==='clear')buffer='';else if(k==='back')buffer=buffer.slice(0,-1);else if(k==='ok'){if(!target||!buffer)return;target.value=buffer;target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}));return closePad();}else{if(buffer==='0')buffer='';buffer+=k}document.getElementById('appKeypadDisplay').textContent=pretty(buffer);}
  function answerLabel(id){return id==='mainAns'?'MAIN POT':id==='side1Ans'?'SIDE POT 1':id==='side2Ans'?'SIDE POT 2':'POT';}
  document.addEventListener('pointerdown',e=>{if(!phone())return;const el=e.target.closest?.('#mainAns,#side1Ans,#side2Ans,#totalAns');if(!el)return;e.preventDefault();e.stopImmediatePropagation();openPad(el,answerLabel(el.id));},true);
  document.addEventListener('click',e=>{if(!phone())return;const el=e.target.closest?.('#mainAns,#side1Ans,#side2Ans,#totalAns');if(el){e.preventDefault();e.stopImmediatePropagation();}},true);
  function buildInlinePad(){
    if(!phone())return;const modal=document.querySelector('#dragModalBack .dragmodal'),inp=document.getElementById('dragAmountInput');if(!modal||!inp)return;
    inp.readOnly=true;inp.blur();document.getElementById('dragModalBack')?.classList.add('app-keypad-open');
    let pad=document.getElementById('inlineDragKeypad');if(!pad){pad=document.createElement('div');pad.id='inlineDragKeypad';modal.appendChild(pad);keys.forEach(([txt,val])=>{const b=document.createElement('button');b.textContent=txt;b.dataset.key=val;if(val==='clear'||val==='cancel')b.classList.add('clear');if(val==='ok')b.classList.add('ok');pad.appendChild(b)});pad.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.key;if(k==='cancel'){document.getElementById('dragCancelBtn')?.click();return}if(k==='ok'){document.getElementById('dragConfirmBtn')?.click();return}let v=(inp.value||'').replace(/[^0-9]/g,'');if(k==='clear')v='';else if(k==='back')v=v.slice(0,-1);else{if(v==='0')v='';v+=k}inp.value=v;});}
  }
  const baseOpenDragAmount=openDragAmount;openDragAmount=function(){if(phone())$('dragAmountInput').readOnly=true;const r=baseOpenDragAmount.apply(this,arguments);if(phone())buildInlinePad();return r;};
  const baseOpenDirectPotAmount=openDirectPotAmount;openDirectPotAmount=function(){if(phone())$('dragAmountInput').readOnly=true;const r=baseOpenDirectPotAmount.apply(this,arguments);if(phone())buildInlinePad();return r;};

  /* ---------- PWA update ---------- */
  if('serviceWorker' in navigator){let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload();});async function checkUpdate(){try{const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});await reg.update();}catch(e){}}window.addEventListener('load',()=>setTimeout(checkUpdate,700));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(checkUpdate,300);});setInterval(checkUpdate,60000);}
})();
