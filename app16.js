(function(){
  function phone(){return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches&&window.matchMedia('(pointer:coarse)').matches;}

  /* M13: compact pot badges in chip-clear side pockets. No observer/interval. */
  const pile6={
    0:[62,17],1:[90,42],2:[90,58],3:[62,78],4:[10,58],5:[10,42]
  };
  const pile9={
    0:[61,16],1:[77,19],2:[91,36],3:[89,57],4:[72,77],5:[28,77],6:[11,57],7:[9,36],8:[23,19]
  };
  const zone6={
    0:[63,21],1:[88,44],2:[88,53],3:[63,72],4:[12,53],5:[12,44]
  };
  const zone9={
    0:[62,20],1:[79,24],2:[90,42],3:[87,55],4:[72,72],5:[28,72],6:[13,55],7:[10,42],8:[21,24]
  };
  const fallbackPile6=[[38,17],[90,50],[62,78],[10,50],[38,78]];
  const fallbackPile9=[[39,16],[84,27],[92,48],[80,69],[61,79],[39,79],[20,69],[8,48],[16,27]];
  const fallbackZone6=[[37,21],[85,49],[63,69],[15,49],[37,69]];
  const fallbackZone9=[[38,20],[82,31],[89,48],[80,66],[61,71],[39,71],[20,66],[11,48],[18,31]];

  function anchors(){try{return typeof splitPotAnchors==='function'?splitPotAnchors():[]}catch(e){return[]}}
  function close(a,b){return Math.abs(a[0]-b[0])<10&&Math.abs(a[1]-b[1])<8}
  function pick(primary,fallbacks,used){
    const all=[];if(primary)all.push(primary);all.push(...fallbacks);
    for(const p of all){if(!used.some(u=>close(u,p))){used.push(p);return p}}
    const p=[50,70];used.push(p);return p;
  }
  function placePiles(){
    if(!phone())return;
    const a=anchors(),map=N===9?pile9:pile6,fb=N===9?fallbackPile9:fallbackPile6,used=[];
    document.querySelectorAll('#potBank .potpile').forEach((el,i)=>{
      const an=a[i],pos=pick(an&&map[an.i]?map[an.i]:null,fb,used);
      el.dataset.mobileAnchor=an?String(an.i):'center';
      el.classList.add('mobile-pot-clear');
      el.style.setProperty('left',pos[0]+'%','important');
      el.style.setProperty('top',pos[1]+'%','important');
      el.style.setProperty('transform','translate(-50%,-50%)','important');
      el.style.setProperty('transition','none','important');
      el.style.setProperty('animation','none','important');
    });
  }
  function placeZones(){
    if(!phone())return;
    const a=anchors(),map=N===9?zone9:zone6,fb=N===9?fallbackZone9:fallbackZone6,used=[];
    document.querySelectorAll('#dragPotLayer .dragpotzone').forEach((el,i)=>{
      const an=a[i],pos=pick(an&&map[an.i]?map[an.i]:null,fb,used);
      el.dataset.mobileAnchor=an?String(an.i):'center';
      el.classList.add('mobile-zone-clear');
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
    #potBank .potpile.mobile-pot-clear{
      min-width:60px!important;max-width:72px!important;padding:3px 5px!important;border-radius:8px!important;z-index:18!important;
      background:#07120ef2!important;box-shadow:0 4px 12px #0008!important;pointer-events:none!important;
    }
    #potBank .potpile.mobile-pot-clear .chipvisual{display:none!important}
    #potBank .potpile.mobile-pot-clear b{font-size:5.5px!important;line-height:1!important;margin:0!important}
    #potBank .potpile.mobile-pot-clear strong{font-size:12px!important;line-height:1!important;margin:2px 0 1px!important}
    #potBank .potpile.mobile-pot-clear small{display:block!important;font-size:4.5px!important;line-height:1!important;margin:0!important;white-space:nowrap!important;color:#9aaba2!important}
    #dragPotLayer .dragpotzone.mobile-zone-clear{
      width:74px!important;min-height:44px!important;padding:3px 4px!important;border-radius:8px!important;z-index:22!important;
      box-shadow:0 4px 14px #0008!important;
    }
    #dragPotLayer .dragpotzone.mobile-zone-clear b{font-size:5.5px!important;line-height:1!important}
    #dragPotLayer .dragpotzone.mobile-zone-clear strong{font-size:11px!important;line-height:1!important}
    #dragPotLayer .dragpotzone.mobile-zone-clear small,
    #dragPotLayer .dragpotzone.mobile-zone-clear .methodhint,
    #dragPotLayer .dragpotzone.mobile-zone-clear .methodbadge{font-size:4.5px!important;line-height:1!important}
  }`;
  document.head.appendChild(s);
})();
