(function(){
  function phone(){return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches&&window.matchMedia('(pointer:coarse)').matches;}

  /* ---------- Mobile MAIN/SIDE anchoring ---------- */
  const pile6={0:[[50,50],[42,52]],1:[[72,42],[67,48]],2:[[70,62],[64,64]],3:[[50,70],[42,67]],4:[[30,62],[36,64]],5:[[28,42],[33,48]]};
  const pile9={0:[[50,50],[43,52]],1:[[66,39],[62,45]],2:[[78,44],[73,49]],3:[[74,60],[68,62]],4:[[62,70],[57,66]],5:[[38,70],[43,66]],6:[[26,60],[32,62]],7:[[22,44],[27,49]],8:[[34,39],[38,45]]};
  const zone6={0:[[50,46],[43,47]],1:[[68,41],[63,45]],2:[[68,56],[63,55]],3:[[50,61],[43,59]],4:[[32,56],[37,55]],5:[[32,41],[37,45]]};
  const zone9={0:[[50,45],[44,46]],1:[[64,37],[61,42]],2:[[75,43],[70,47]],3:[[72,57],[67,57]],4:[[61,62],[57,59]],5:[[39,62],[43,59]],6:[[28,57],[33,57]],7:[[25,43],[30,47]],8:[[36,37],[39,42]]};
  const genericPile6=[[50,64],[40,62],[60,62]],genericPile9=[[50,64],[40,62],[60,62],[32,64],[68,64]];
  const genericZone6=[[50,54],[40,53],[60,53]],genericZone9=[[50,54],[40,53],[60,53],[32,54],[68,54]];
  function collision(a,b){return Math.abs(a[0]-b[0])<12&&Math.abs(a[1]-b[1])<10;}
  function choose(list,generic,used){for(const p of [...list,...generic]){if(!used.some(u=>collision(u,p))){used.push(p);return p;}}const p=[50,66];used.push(p);return p;}
  function anchors(){try{return typeof splitPotAnchors==='function'?splitPotAnchors():[]}catch(e){return[]}}
  function anchorPiles(){
    if(!phone())return;
    const els=[...document.querySelectorAll('#potBank .potpile')];if(!els.length)return;
    const a=anchors(),map=N===9?pile9:pile6,generic=N===9?genericPile9:genericPile6,used=[];
    els.forEach((el,i)=>{const an=a[i],pos=choose(an&&map[an.i]?map[an.i]:[],generic,used);el.style.setProperty('left',pos[0]+'%','important');el.style.setProperty('top',pos[1]+'%','important');el.dataset.mobileAnchor=an?String(an.i):'center';});
  }
  function anchorZones(){
    if(!phone())return;
    const els=[...document.querySelectorAll('#dragPotLayer .dragpotzone')];if(!els.length)return;
    const a=anchors(),map=N===9?zone9:zone6,generic=N===9?genericZone9:genericZone6,used=[];
    els.forEach((el,i)=>{const an=a[i],pos=choose(an&&map[an.i]?map[an.i]:[],generic,used);el.style.setProperty('left',pos[0]+'%','important');el.style.setProperty('top',pos[1]+'%','important');el.style.setProperty('transform','translate(-50%,-50%)','important');el.dataset.mobileAnchor=an?String(an.i):'center';});
  }
  function anchorAll(){anchorPiles();anchorZones();}
  const mo=new MutationObserver(()=>{if(phone())requestAnimationFrame(anchorAll)});
  mo.observe(document.body,{subtree:true,childList:true});
  window.addEventListener('resize',()=>setTimeout(anchorAll,30));
  window.addEventListener('orientationchange',()=>setTimeout(anchorAll,220));
  setTimeout(anchorAll,100);

  /* ---------- In-app numeric keypad ---------- */
  const css=document.createElement('style');
  css.textContent=`
  #appKeypadBack{display:none;position:fixed;inset:0;z-index:20000;background:#000a;align-items:center;justify-content:center;padding:max(8px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));backdrop-filter:blur(4px)}
  #appKeypadBack.show{display:flex}#appKeypadBox{width:min(390px,72vw);max-height:92dvh;overflow:auto;background:#101820;border:1px solid #46596b;border-radius:16px;padding:10px;box-shadow:0 22px 70px #000d}
  #appKeypadTitle{text-align:center;font-size:13px;font-weight:900;color:#f0cf70}#appKeypadHint{text-align:center;font-size:8px;color:#98a6b2;margin:3px 0 7px}
  #appKeypadDisplay{height:46px;border:1px solid #53677a;border-radius:10px;background:#071018;color:#fff;display:flex;align-items:center;justify-content:flex-end;padding:0 13px;font-size:24px;font-weight:900;font-variant-numeric:tabular-nums;overflow:hidden}
  #appKeypadGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:7px}#appKeypadGrid button{min-height:39px;border:1px solid #3f5162;border-radius:9px;background:#1a2631;color:#fff;font-size:15px;font-weight:900;touch-action:manipulation}
  #appKeypadGrid button:active{transform:scale(.96);background:#2a3947}#appKeypadGrid .wide{grid-column:span 2}#appKeypadGrid .clear{color:#ffb3b7}#appKeypadGrid .ok{grid-column:span 2;background:linear-gradient(#e4c66e,#b89042);border:0;color:#171109}
  #dragModalBack.app-keypad-open .dragmodal{width:min(390px,72vw)!important}#dragModalBack.app-keypad-open #dragAmountInput{font-size:21px!important;text-align:right!important}
  #inlineDragKeypad{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}#inlineDragKeypad button{min-height:38px;border:1px solid #3f5162;border-radius:9px;background:#1a2631;color:#fff;font-size:14px;font-weight:900}#inlineDragKeypad .ok{grid-column:span 2;background:linear-gradient(#e4c66e,#b89042);border:0;color:#171109}#inlineDragKeypad .clear{color:#ffb3b7}
  @media(pointer:coarse) and (orientation:landscape){#appKeypadBox{width:min(360px,68vw);padding:9px}#appKeypadGrid button{min-height:37px}}
  `;document.head.appendChild(css);

  let target=null,buffer='';
  function pretty(v){if(!v)return '0';const n=Number(v);return Number.isFinite(n)?n.toLocaleString('ko-KR'):v;}
  function ensurePad(){
    let back=document.getElementById('appKeypadBack');if(back)return back;
    back=document.createElement('div');back.id='appKeypadBack';back.innerHTML=`<div id="appKeypadBox"><div id="appKeypadTitle">금액 입력</div><div id="appKeypadHint">화면 숫자패드로 입력하세요</div><div id="appKeypadDisplay">0</div><div id="appKeypadGrid"></div></div>`;document.body.appendChild(back);
    const grid=document.getElementById('appKeypadGrid');
    [['1','1'],['2','2'],['3','3'],['⌫','back'],['4','4'],['5','5'],['6','6'],['C','clear'],['7','7'],['8','8'],['9','9'],['000','000'],['00','00'],['0','0'],['취소','cancel'],['입력 완료','ok']].forEach(([txt,val])=>{const b=document.createElement('button');b.textContent=txt;b.dataset.key=val;if(val==='clear'||val==='cancel')b.classList.add('clear');if(val==='ok')b.classList.add('ok');grid.appendChild(b)});
    grid.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;key(b.dataset.key)});back.addEventListener('click',e=>{if(e.target===back)closePad()});return back;
  }
  function openPad(el,label){target=el;buffer=(el.value||'').replace(/[^0-9]/g,'');const back=ensurePad();document.getElementById('appKeypadTitle').textContent=label+' 금액 입력';document.getElementById('appKeypadDisplay').textContent=pretty(buffer);back.classList.add('show');}
  function closePad(){document.getElementById('appKeypadBack')?.classList.remove('show');target=null;buffer='';}
  function key(k){if(k==='cancel')return closePad();if(k==='clear')buffer='';else if(k==='back')buffer=buffer.slice(0,-1);else if(k==='ok'){if(!target||!buffer)return;target.value=buffer;target.dispatchEvent(new Event('input',{bubbles:true}));target.dispatchEvent(new Event('change',{bubbles:true}));return closePad();}else{if(buffer==='0')buffer='';buffer+=k}document.getElementById('appKeypadDisplay').textContent=pretty(buffer);}
  function answerLabel(id){return id==='mainAns'?'MAIN POT':id==='side1Ans'?'SIDE POT 1':id==='side2Ans'?'SIDE POT 2':'POT';}
  document.addEventListener('pointerdown',e=>{if(!phone())return;const el=e.target.closest?.('#mainAns,#side1Ans,#side2Ans,#totalAns');if(!el)return;e.preventDefault();e.stopImmediatePropagation();openPad(el,answerLabel(el.id));},true);
  document.addEventListener('click',e=>{if(!phone())return;const el=e.target.closest?.('#mainAns,#side1Ans,#side2Ans,#totalAns');if(!el)return;e.preventDefault();e.stopImmediatePropagation();},true);

  function buildInlinePad(){
    const modal=document.querySelector('#dragModalBack .dragmodal'),inp=document.getElementById('dragAmountInput');if(!modal||!inp)return;
    let pad=document.getElementById('inlineDragKeypad');if(!pad){pad=document.createElement('div');pad.id='inlineDragKeypad';modal.appendChild(pad);[['1','1'],['2','2'],['3','3'],['⌫','back'],['4','4'],['5','5'],['6','6'],['C','clear'],['7','7'],['8','8'],['9','9'],['000','000'],['00','00'],['0','0'],['취소','cancel'],['입력 완료','ok']].forEach(([txt,val])=>{const b=document.createElement('button');b.textContent=txt;b.dataset.key=val;if(val==='clear'||val==='cancel')b.classList.add('clear');if(val==='ok')b.classList.add('ok');pad.appendChild(b)});pad.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.key;if(k==='cancel'){document.getElementById('dragCancelBtn')?.click();return}if(k==='ok'){document.getElementById('dragConfirmBtn')?.click();return}let v=(inp.value||'').replace(/[^0-9]/g,'');if(k==='clear')v='';else if(k==='back')v=v.slice(0,-1);else{if(v==='0')v='';v+=k}inp.value=v;});}
    inp.readOnly=true;inp.blur();document.getElementById('dragModalBack')?.classList.add('app-keypad-open');
  }
  if(typeof openDragAmount==='function'){const old=openDragAmount;openDragAmount=function(){const inp=document.getElementById('dragAmountInput');if(inp)inp.readOnly=true;const r=old.apply(this,arguments);if(phone())setTimeout(buildInlinePad,0);return r;};}
  if(typeof openDirectPotAmount==='function'){const old=openDirectPotAmount;openDirectPotAmount=function(){const inp=document.getElementById('dragAmountInput');if(inp)inp.readOnly=true;const r=old.apply(this,arguments);if(phone())setTimeout(buildInlinePad,0);return r;};}
  document.getElementById('dragModalBack')?.addEventListener('transitionend',()=>{if(!document.getElementById('dragModalBack')?.classList.contains('show'))document.getElementById('dragModalBack')?.classList.remove('app-keypad-open')});
})();
