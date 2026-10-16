(function(){
  function phone(){return window.matchMedia('(max-width:900px) and (orientation:landscape)').matches&&window.matchMedia('(pointer:coarse)').matches;}

  /* M10 · Put MAIN/SIDE much closer to the all-in player's seat. */
  const pile6={
    0:[[50,9],[38,11],[62,11]],
    1:[[92,27],[86,31],[82,36]],
    2:[[92,70],[86,67],[82,62]],
    3:[[50,91],[38,87],[62,87]],
    4:[[8,70],[14,67],[18,62]],
    5:[[8,27],[14,31],[18,36]]
  };
  const pile9={
    0:[[50,9],[40,11],[60,11]],
    1:[[72,14],[68,19],[74,22]],
    2:[[94,34],[88,37],[84,41]],
    3:[[94,66],[88,63],[84,59]],
    4:[[70,89],[65,84],[60,80]],
    5:[[30,89],[35,84],[40,80]],
    6:[[6,66],[12,63],[16,59]],
    7:[[6,34],[12,37],[16,41]],
    8:[[28,14],[32,19],[26,22]]
  };
  /* drag zones are relative to the whole tablecard, so place them just inside each player's chips */
  const zone6={
    0:[[50,34],[43,33]],
    1:[[65,34],[61,39]],
    2:[[65,54],[61,50]],
    3:[[50,62],[43,60]],
    4:[[35,54],[39,50]],
    5:[[35,34],[39,39]]
  };
  const zone9={
    0:[[50,32],[44,32]],
    1:[[62,30],[59,34]],
    2:[[72,38],[68,41]],
    3:[[69,54],[65,52]],
    4:[[59,61],[55,58]],
    5:[[41,61],[45,58]],
    6:[[31,54],[35,52]],
    7:[[28,38],[32,41]],
    8:[[38,30],[41,34]]
  };
  const gp6=[[50,66],[40,63],[60,63]],gp9=[[50,66],[40,63],[60,63],[31,61],[69,61]];
  const gz6=[[50,54],[40,52],[60,52]],gz9=[[50,54],[40,52],[60,52],[32,52],[68,52]];
  function hit(a,b,dx=11,dy=9){return Math.abs(a[0]-b[0])<dx&&Math.abs(a[1]-b[1])<dy;}
  function choose(primary,generic,used){
    for(const p of [...primary,...generic]){if(!used.some(u=>hit(u,p))){used.push(p);return p;}}
    const p=[50,68];used.push(p);return p;
  }
  function getAnchors(){try{return typeof splitPotAnchors==='function'?splitPotAnchors():[]}catch(e){return[]}}
  function placeClose(){
    if(!phone())return;
    const a=getAnchors();
    const pmap=N===9?pile9:pile6,zmap=N===9?zone9:zone6;
    const pg=N===9?gp9:gp6,zg=N===9?gz9:gz6;
    const pu=[],zu=[];
    document.querySelectorAll('#potBank .potpile').forEach((el,i)=>{
      const an=a[i],pos=choose(an&&pmap[an.i]?pmap[an.i]:[],pg,pu);
      el.style.setProperty('left',pos[0]+'%','important');
      el.style.setProperty('top',pos[1]+'%','important');
      el.style.setProperty('transform','translate(-50%,-50%)','important');
      el.dataset.mobileAnchor=an?String(an.i):'center';
    });
    document.querySelectorAll('#dragPotLayer .dragpotzone').forEach((el,i)=>{
      const an=a[i],pos=choose(an&&zmap[an.i]?zmap[an.i]:[],zg,zu);
      el.style.setProperty('left',pos[0]+'%','important');
      el.style.setProperty('top',pos[1]+'%','important');
      el.style.setProperty('transform','translate(-50%,-50%)','important');
      el.dataset.mobileAnchor=an?String(an.i):'center';
    });
  }
  const s=document.createElement('style');
  s.textContent=`@media(pointer:coarse) and (orientation:landscape){
    #potBank .potpile[data-mobile-anchor]{min-width:70px!important;max-width:82px!important;padding:3px 5px!important;border-radius:8px!important;z-index:20!important}
    #potBank .potpile[data-mobile-anchor] .chipvisual{height:14px!important;margin:0!important}
    #potBank .potpile[data-mobile-anchor] .chipvisual i{width:14px!important;height:14px!important;border-width:2px!important}
    #potBank .potpile[data-mobile-anchor] b{font-size:6px!important;line-height:1!important}
    #potBank .potpile[data-mobile-anchor] strong{font-size:13px!important;line-height:1!important;margin-top:2px!important}
    #potBank .potpile[data-mobile-anchor] small{display:none!important}
    #dragPotLayer .dragpotzone[data-mobile-anchor]{z-index:24!important;width:80px!important;min-height:50px!important}
  }`;
  document.head.appendChild(s);

  const mo=new MutationObserver(()=>{if(!phone())return;requestAnimationFrame(()=>requestAnimationFrame(placeClose));});
  mo.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>setTimeout(placeClose,50));
  window.addEventListener('orientationchange',()=>setTimeout(placeClose,250));
  setTimeout(placeClose,160);
  setInterval(()=>{if(phone()&&(document.querySelector('#potBank .potpile')||document.querySelector('#dragPotLayer .dragpotzone')))placeClose();},1200);

  /* PWA auto-update: check the service worker whenever the app opens/returns, and every minute. */
  if('serviceWorker' in navigator){
    let controlled=!!navigator.serviceWorker.controller;
    let refreshing=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(!controlled){controlled=true;return;}
      if(refreshing)return;
      refreshing=true;
      location.reload();
    });
    async function checkUpdate(){
      try{
        const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
        await reg.update();
      }catch(e){}
    }
    window.addEventListener('load',()=>setTimeout(checkUpdate,700));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(checkUpdate,300);});
    setInterval(checkUpdate,60000);
  }
})();
