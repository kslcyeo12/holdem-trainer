(function(){
  function isPhoneLandscape(){
    return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches && window.matchMedia('(pointer:coarse)').matches;
  }

  const pref6={
    0:[[50,52],[42,50],[58,50]],
    1:[[72,42],[68,48],[76,50]],
    2:[[70,61],[64,64],[76,62]],
    3:[[50,68],[42,66],[58,66]],
    4:[[30,61],[36,64],[24,62]],
    5:[[28,42],[32,48],[24,50]]
  };
  const pref9={
    0:[[50,52],[43,50],[57,50]],
    1:[[66,39],[70,45],[62,46]],
    2:[[78,43],[74,49],[82,50]],
    3:[[74,59],[68,62],[80,60]],
    4:[[62,68],[56,65],[68,66]],
    5:[[38,68],[44,65],[32,66]],
    6:[[26,59],[32,62],[20,60]],
    7:[[22,43],[26,49],[18,50]],
    8:[[34,39],[30,45],[38,46]]
  };
  const generic6=[[50,63],[39,62],[61,62],[50,70]];
  const generic9=[[50,63],[40,62],[60,62],[32,64],[68,64]];

  function overlaps(a,b){return Math.abs(a[0]-b[0])<13 && Math.abs(a[1]-b[1])<12;}
  function blocked(p){return p[1]<37 && p[0]>31 && p[0]<69;}
  function choose(candidates,used){
    for(const p of candidates){
      if(blocked(p))continue;
      if(!used.some(u=>overlaps(u,p))){used.push(p);return p;}
    }
    for(const p of (N===9?generic9:generic6)){
      if(!used.some(u=>overlaps(u,p))){used.push(p);return p;}
    }
    const p=[50,70];used.push(p);return p;
  }

  function forceMobilePotAnchors(){
    if(!isPhoneLandscape())return;
    const piles=[...document.querySelectorAll('#potBank .potpile')];
    if(!piles.length)return;
    const anchors=typeof splitPotAnchors==='function'?splitPotAnchors():[];
    const prefs=N===9?pref9:pref6;
    const used=[];

    piles.forEach((el,pi)=>{
      const anchor=pi<anchors.length?anchors[pi]:null;
      const candidates=anchor&&prefs[anchor.i] ? prefs[anchor.i] : (N===9?generic9:generic6);
      const pos=choose(candidates,used);
      el.style.setProperty('left',pos[0]+'%','important');
      el.style.setProperty('top',pos[1]+'%','important');
      el.dataset.mobileAnchor=anchor?String(anchor.i):'center';
    });
  }

  if(typeof renderPotBank==='function'){
    const baseRenderPotBank=renderPotBank;
    renderPotBank=function(){
      const r=baseRenderPotBank.apply(this,arguments);
      forceMobilePotAnchors();
      return r;
    };
  }

  window.addEventListener('resize',()=>setTimeout(forceMobilePotAnchors,30));
  window.addEventListener('orientationchange',()=>setTimeout(forceMobilePotAnchors,220));
  window.forceMobilePotAnchors=forceMobilePotAnchors;
})();
