/* 座位查詢（seat.html）× 已記住的身分
   身分存在 localStorage 'imc15_me'（＝roster.json 的 id；seat.html 的人員索引 D.ps[i] 對應 id = i+1），
   「我的活動頁」「商務許願」「商品館下單」讀的是同一個，所以全站只要選一次。
   1) 已記住身分 → 搜尋欄正下方直接出現「我的座位」卡（含有幾位夥伴想和您交流），不必再輸入姓名
   2) 還沒記住 → 搜尋到自己、開啟個人頁後按「這是我」，其他頁面就不用再輸入
   3) 我的座位卡／本人頁 → 跳出「有 N 位夥伴想和您交流」，導引到商務許願與回覆邀請
   （「找人」頁是查別人，不帶入身分；座位查詢的搜尋欄也維持空白，可照常查別人的座位）
   本檔在 seat.html 主程式之後載入，沿用其全域的 D、$、esc、card、run、draw、openP。 */
(function(){
  var KEY='imc15_me';
  function getMe(){try{var v=Number(localStorage.getItem(KEY)||0);return(v>0&&D.ps[v-1])?v:0;}catch(e){return 0;}}
  function setMe(id){try{localStorage.setItem(KEY,String(id));}catch(e){}}
  function clearMe(){try{localStorage.removeItem(KEY);}catch(e){}}

  var css=document.createElement('style');
  css.textContent=
   '#mycard{margin-bottom:4px}.mebox{margin:12px 0 0;padding:12px 12px 14px;border:1.5px solid var(--gold);border-radius:18px;background:#fffffff0;box-shadow:0 2px 12px #c5a36630;display:flex;flex-direction:column;gap:10px}'
  +'.mebox .mh{display:flex;align-items:baseline;justify-content:space-between;gap:8px;font-size:15px;color:var(--ink)}'
  +'.mebox .mh b{font-size:17px;letter-spacing:.04em}'
  +'.mebox .mh a,.mebox .mh button{font:inherit;font-size:13px;color:var(--ink2);background:none;border:0;padding:6px 2px;text-decoration:underline;cursor:pointer}'
  +'.mebox .card{margin:0}'
  +'.mestat{border-radius:14px;background:linear-gradient(160deg,#FFF6DD,#F8E2B9aa);border:1.5px solid var(--gold);padding:12px 14px;display:flex;flex-direction:column;gap:6px}'
  +'.mestat .t{font-size:17px;font-weight:800;color:var(--ink);line-height:1.4}'
  +'.mestat .s{font-size:13.5px;color:var(--ink2);line-height:1.5}'
  +'.mestat .bt{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}'
  +'.mestat .bt a{flex:1 1 130px;text-align:center;text-decoration:none;font-weight:800;font-size:15.5px;border-radius:999px;padding:12px 14px;min-height:46px;display:flex;align-items:center;justify-content:center}'
  +'.mestat .b1{background:#C5A366;color:#2B1D0A;border:1.5px solid #C5A366}'
  +'.mestat .b2{background:#fff;color:#7A5A1C;border:1.5px solid #C5A366}'
  +'.mes-iam{font:inherit;font-size:16px;font-weight:800;border-radius:999px;border:1.5px solid #C5A366;background:#C5A366;color:#2B1D0A;padding:12px 16px;min-height:46px;cursor:pointer}'
  +'.mes-note{font-size:13px;color:var(--ink2);line-height:1.5}';
  document.head.appendChild(css);

  /* ---- 交流邀請統計（算法與「我的活動頁」的「想認識您的社友」相同）---- */
  var ST={id:0,state:'idle',pend:0,total:0,wish:null,at:0};
  function calc(id,rows){
    var inn=rows.filter(function(r){return r.to_id===id;}),out=rows.filter(function(r){return r.from_id===id;});
    var S=function(a,k,f){return new Set(a.filter(function(r){return r.kind===k;}).map(function(r){return r[f];}));};
    var myLikes=S(out,'like','to_id'),myAcc=S(out,'accept','to_id'),mySkip=S(out,'skip','to_id'),myInv=S(out,'invite','to_id');
    var thLikes=S(inn,'like','from_id'),thInv=S(inn,'invite','from_id'),thAcc=S(inn,'accept','from_id');
    var req=Array.from(new Set(Array.from(thInv).concat(Array.from(thLikes).filter(function(x){return myLikes.has(x);})))).filter(function(x){return!mySkip.has(x);});
    var match=new Set(req.filter(function(x){return myAcc.has(x)||(thLikes.has(x)&&myLikes.has(x));}).concat(Array.from(thAcc).filter(function(x){return myInv.has(x)||myLikes.has(x);})));
    return{total:req.length,pend:req.filter(function(x){return!match.has(x);}).length};
  }
  function load(force){
    var id=getMe();if(!id||typeof dbGet!=='function')return;
    if(!force&&ST.id===id&&(ST.state==='ok'||ST.state==='load')&&Date.now()-ST.at<20000)return;
    ST={id:id,state:'load',pend:0,total:0,wish:null,at:Date.now()};
    Promise.all([
      dbGet('h15_interests?or=(from_id.eq.'+id+',to_id.eq.'+id+')&select=from_id,to_id,kind'),
      dbGet('h15_wishes?person_id=eq.'+id+'&select=person_id').catch(function(){return null;})
    ]).then(function(res){
      if(getMe()!==id)return;
      var c=calc(id,res[0]||[]);ST={id:id,state:'ok',pend:c.pend,total:c.total,wish:res[1]?res[1].length>0:null,at:Date.now()};
      refresh();
    }).catch(function(){if(getMe()!==id)return;ST={id:id,state:'err',pend:0,total:0,wish:null,at:Date.now()};refresh();});
  }
  function statHtml(){
    var s=ST,t;
    if(s.state==='ok')t=s.total===0?'目前還沒有人邀請您交流':(s.pend>0?'有 '+s.pend+' 位夥伴想和您交流':'想和您交流的 '+s.total+' 位夥伴，您都回覆了');
    else if(s.state==='err')t='交流邀請暫時讀不到，請稍後到「我的活動頁」查看';
    else t='正在查看有幾位夥伴想和您交流…';
    var noWish=s.wish===false;
    return '<div class="mestat"><div class="t">'+esc(t)+'</div>'
      +'<div class="s">'+(noWish?'您還沒許願，寫下資源與需求，讓更多人找到您。':'到商務許願看看大家的許願，主動邀請想認識的人。')+'</div>'
      +'<div class="bt"><a class="b1" href="wish.html">'+(noWish?'前往商務許願 ›':'商務許願牆 ›')+'</a>'
      +(s.pend>0?'<a class="b2" href="me.html#meet">前往回覆 ›</a>':'')+'</div></div>';
  }

  /* 換人：已有許願／交流邀請時，先問要不要一併撤回（who.js）；全站共用同一個身分，換一次全站都換 */
  function swOut(){
    var id=getMe();if(!id)return;
    var p={id:id,name:D.ps[id-1].n},done=function(){ST={id:0,state:'idle',pend:0,total:0,wish:null,at:0};renderMy();decorate();};
    if(window.WHO)WHO.switchOut(p,done);else{clearMe();done();}
  }

  /* ---- 搜尋列下方的「我的座位」卡 ---- */
  var hint=$('#hint'),box=document.createElement('div');box.id='mycard';box.style.display='none';
  var sbx=$('#q').closest('.sb');(sbx&&sbx.parentNode?sbx.parentNode:hint.parentNode).insertBefore(box,sbx?sbx.nextSibling:hint);
  function renderMy(){
    var id=getMe();
    if(!id){box.innerHTML='';box.style.display='none';return;}
    var i=id-1,p=D.ps[i];
    box.innerHTML='<div class="mebox"><div class="mh"><span>您好，'+esc(p.n)+LV(p)+'</span><button type="button" id="notme">不是您？換人</button></div>'
      +card(i).replace('class="card"','class="card" id="mycardbtn"')+statHtml()+'</div>';
    $('#notme').onclick=swOut;
    $('#mycardbtn').onclick=function(){openP(i);};
    show();
  }
  function show(){box.style.display=(getMe()&&hint.style.display!=='none')?'block':'none';}

  /* ---- 個人頁：「這是我」／本人頁的交流人數 ---- */
  function decorate(){
    var sh=$('#sh');if(!sh)return;
    var old=sh.querySelector('#meblk');if(old)old.remove();
    var tabs=sh.querySelector('.tabs');if(!tabs)return;
    var me=getMe(),b=document.createElement('div');b.id='meblk';
    if(!me){
      b.className='mebox';
      b.innerHTML='<button type="button" class="mes-iam" id="iam">我就是 '+esc(D.ps[CUR].n)+LVT(D.ps[CUR])+'，記住我的身分</button><div class="mes-note">按一下，我的活動頁、商務許願、商品館就不用再輸入姓名，也能看到有幾位夥伴想和您交流。</div>';
      tabs.parentNode.insertBefore(b,tabs);
      $('#iam').onclick=function(){setMe(CUR+1);renderMy();decorate();load(true);};
    }else if(me===CUR+1){
      b.className='mebox';
      b.innerHTML='<div class="mh"><span>這是您的頁面</span><button type="button" id="notme2">不是您？換人</button></div>'+statHtml();
      tabs.parentNode.insertBefore(b,tabs);
      $('#notme2').onclick=swOut;
      load(false);
    }
  }
  function refresh(){renderMy();var b=$('#meblk');if(b&&getMe()===CUR+1&&$('#sheet').classList.contains('on'))decorate();}

  var _draw=draw;draw=function(){_draw.apply(this,arguments);decorate();};
  var _run=run;run=function(){_run.apply(this,arguments);show();};

  renderMy();load(false);
  window.addEventListener('pageshow',function(e){if(e.persisted){renderMy();load(true);}});
  window.addEventListener('storage',function(e){if(e.key===KEY){renderMy();load(true);}});
})();
