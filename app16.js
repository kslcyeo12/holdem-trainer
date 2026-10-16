(function(){
  function phone(){return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches&&window.matchMedia('(pointer:coarse)').matches;}

  /* M14: natural mobile pot pockets. Coordinates for pot piles are inside the felt.
     Each pot sits near its all-in player but diagonally away from that player's bet chips. */
  const pile6={
    0:[38,15],1:[83,35],2:[83,55],3:[63,76],4:[17,55],5:[17,35]
  };
  const pile9={
    0:[38,14],1:[82,20],2:[82,44],3:[81,53],4:[67,76],5:[34,76],6:[19,53],7:[19,44],8:[18,20]
  };

  /* Practical zones are children of the whole tablecard, so these use table coordinates. */
  const zone6={
    0:[39,27],1:[79,40],2:[79,53],3:[61,67],4:[21,53],5:[21,40]
  };
  const zone9={
    0:[39,27],1:[76,31],2:[76,46],3:[75,52],4:[64,66],5:[36,66],6:[25,52],7:[25,46],8:[24,31]
  };

  const fallbackPile6=[[50,67],[38,63],[62,63],[50,74]];
  const fallbackPile9=[[50,67],[38,63],[62,63],[30,61],[70,61]];
  const fallbackZone6=[[50,55],[40,52],[60,52]];
  const fallbackZone9=[[50,55],[40,52],[60,52],[32,52],[68,52]];

  function anchors(){try{return typeof splitPotAnchors==='function'?splitPotAnchors():[]}catch(e){return[]}}
  function close(a,b){return Math.abs(a[0]-b[0])<11&&Math.abs(a[1]-b[1])<9}
  function pick(primary,fallbacks,used){
    const all=[];if(primary)all.push(primary);all.push(...fallbacks);
    for(const p of all){if(!used.some(u=>close(u,p))){used.push(p);return p}}
    const p=[50,68];used.push(p);return p;
  }

  function placePiles(){
    if(!phone())return;
    const a=anchors(),map=N===9?pile9:pile6,fb=N===9?fallbackPile9:fallbackPile6,used=[];
    document.querySelectorAll('#potBank .potpile').forEach((el,i)=>{
      const an=a[i],pos=pick(an&&map[an.i]?map[an.i]:null,fb,used);
      el.dataset.mobileAnchor=an?String(an.i):'center';
      el.classList.add('mobile-pot-natural');
      el.style.setProperty('left',pos[0]+'%','important');
      el.style.setProperty('top',pos[1]+'%','important');
      el.style.setProperty('transform','translate(-50%,-50%)','important');
      el.style.setProperty('transition','none','important');
      el.style.setProperty('animation','none','important');

      const label=el.querySelector('b');
      if(label)label.textContent=i===0?'MAIN':`SIDE ${i}`;
      const note=el.querySelector('small');
      if(note)note.textContent=an?`${names[an.i]} 기준`:'';
    });
  }

  function placeZones(){
    if(!phone())return;
    const a=anchors(),map=N===9?zone9:zone6,fb=N===9?fallbackZone9:fallbackZone6,used=[];
    document.querySelectorAll('#dragPotLayer .dragpotzone').forEach((el,i)=>{
      const an=a[i],pos=pick(an&&map[an.i]?map[an.i]:null,fb,used);
      el.dataset.mobileAnchor=an?String(an.i):'center';
      el.classList.add('mobile-zone-natural');
      el.style.setProperty('left',pos[0]+'%','important');
      el.style.setProperty('top',pos[1]+'%','important');
      el.style.setProperty('transform','translate(-50%,-50%)','important');
      el.style.setProperty('transition','none','important');
      el.style.setProperty('animation','none','important');
    });
  }

  if(typeof renderPotBank==='function'){
    const base=renderPotBank;
    renderPotBank=function(){const r=base.apply(this,arguments);placePiles();return r;};
  }
  if(typeof setupPracticalQuiz==='function'){
    const base=setupPracticalQuiz;
    setupPracticalQuiz=function(){const r=base.apply(this,arguments);placeZones();return r;};
  }
  window.addEventListener('resize',()=>{placePiles();placeZones();});
  window.addEventListener('orientationchange',()=>setTimeout(()=>{placePiles();placeZones();},220));

  const s=document.createElement('style');
  s.textContent=`@media(pointer:coarse) and (orientation:landscape){
    /* Pot badges should read like table markers, not floating explanation cards. */
    #potBank .potpile.mobile-pot-natural{
      display:grid!important;
      grid-template-columns:auto auto!important;
      grid-template-areas:"label amount" "anchor anchor"!important;
      align-items:center!important;
      justify-content:center!important;
      column-gap:5px!important;
      row-gap:1px!important;
      min-width:62px!important;
      max-width:88px!important;
      padding:4px 7px!important;
      border-radius:10px!important;
      z-index:5!important;
      background:#07120ef0!important;
      box-shadow:0 3px 10px #0008!important;
      pointer-events:none!important;
      transition:none!important;
      animation:none!important;
    }
    #potBank .potpile.mobile-pot-natural .chipvisual{display:none!important}
    #potBank .potpile.mobile-pot-natural b{
      grid-area:label!important;
      display:block!important;
      font-size:5.5px!important;
      line-height:1!important;
      letter-spacing:.04em!important;
      margin:0!important;
      white-space:nowrap!important;
    }
    #potBank .potpile.mobile-pot-natural strong{
      grid-area:amount!important;
      display:block!important;
      font-size:12px!important;
      line-height:1!important;
      margin:0!important;
      white-space:nowrap!important;
    }
    #potBank .potpile.mobile-pot-natural small{
      grid-area:anchor!important;
      display:block!important;
      font-size:4.5px!important;
      line-height:1!important;
      margin:0!important;
      white-space:nowrap!important;
      color:#9aaba2!important;
    }

    /* Real bet chips always stay visually above pot markers. */
    .tablecard .betmarker,.tablecard.nine .betmarker{z-index:24!important}
    .tablecard .seat,.tablecard.nine .seat{z-index:26!important}

    /* Practical targets use the same diagonal pocket idea, but remain large enough to tap. */
    #dragPotLayer .dragpotzone.mobile-zone-natural{
      width:68px!important;
      min-height:38px!important;
      padding:4px 5px!important;
      border-radius:9px!important;
      z-index:18!important;
      box-shadow:0 3px 11px #0008!important;
      transition:none!important;
      animation:none!important;
    }
    #dragPotLayer .dragpotzone.mobile-zone-natural b{font-size:5.5px!important;line-height:1!important}
    #dragPotLayer .dragpotzone.mobile-zone-natural strong{font-size:11px!important;line-height:1!important}
    #dragPotLayer .dragpotzone.mobile-zone-natural small,
    #dragPotLayer .dragpotzone.mobile-zone-natural .methodhint{display:none!important}
    #dragPotLayer .dragpotzone.mobile-zone-natural .methodbadge{font-size:4.5px!important;line-height:1!important;margin-top:2px!important}

    /* Give the two bottom 9MAX seats a little breathing room above the nav bar. */
    .tablecard.nine #seats .seat:nth-child(5),
    .tablecard.nine #seats .seat:nth-child(6){transform:translateY(-5px)!important}
  }`;
  document.head.appendChild(s);
})();
