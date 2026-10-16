(function(){
  /* M15: practical training is mode #1 and the default mode. */
  function promotePracticalMode(){
    const bar=document.getElementById('modeBar');
    const calc=document.getElementById('modeCalc');
    const practical=document.getElementById('modePractical');
    if(bar&&calc&&practical){
      bar.insertBefore(practical,calc);
      practical.innerHTML='<b>① 실전 칩 정리</b><small>올인 기준으로 칩을 실제처럼 분리</small>';
      calc.innerHTML='<b>② 계산 훈련</b><small>MAIN / SIDE 금액 직접 계산</small>';
    }
    if(typeof setTrainingMode==='function')setTrainingMode('practical',false);
  }

  /* POT anchor rule: only a POT whose upper boundary is an actual ALL-IN gets a player anchor.
     If there is no next ALL-IN, the remaining SIDE POT is neutral/centered. */
  splitPotAnchors=function(){
    const contrib=state.players.map((p,i)=>({
      i,
      total:Math.round((p.total||0)*1000)/1000,
      allin:!!p.allin,
      folded:!!p.folded
    })).filter(x=>x.total>0);

    const levels=[...new Set(contrib.map(x=>x.total))].sort((a,b)=>a-b);
    let lower=0;
    const raw=[];
    for(const upper of levels){
      const involved=contrib.filter(x=>x.total>=upper-1e-9);
      const eligible=involved.filter(x=>!x.folded).map(x=>x.i);
      const key=eligible.join(',');
      if(upper-lower>1e-9)raw.push({upper,key});
      lower=upper;
    }

    const grouped=[];
    let lastKey=null,potIndex=-1;
    raw.forEach(layer=>{
      if(layer.key!==lastKey){
        potIndex++;
        grouped[potIndex]={upper:layer.upper,key:layer.key};
        lastKey=layer.key;
      }else grouped[potIndex].upper=layer.upper;
    });

    return grouped.map(group=>{
      const anchor=contrib.find(x=>x.allin&&!x.folded&&Math.abs(x.total-group.upper)<=1e-6);
      return anchor?{i:anchor.i,total:anchor.total}:null;
    });
  };

  promotePracticalMode();
})();
