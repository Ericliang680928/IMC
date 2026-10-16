/* 全站共用：已記住的身分（localStorage 'imc15_me'＝roster.json 的 id）
   「我的活動頁」「座位查詢」「商務許願」「商品館下單」都讀這一個，所以全站只要選一次；
   選錯了，在任何一頁按「不是我？換人」，換一次全站都換。
   WHO.get / set / clear   讀寫身分
   WHO.confirm(box,p,yes,no) 點名字後先問「您是這一位嗎？」（顯示社別、職稱、公司、桌號），避免點錯或同名選錯
   WHO.switchOut(p,done)   換人：若這個身分已有許願／交流邀請紀錄，詢問要不要一併撤回（選錯人時用），再清除身分並呼叫 done
   需先載入 db.js（撤回紀錄用）。 */
(function(){
  var KEY='imc15_me';
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  /* 自帶樣式（seat.html 沒載入 style.css，每頁都能用） */
  if(!document.getElementById('whoCss')){var st=document.createElement('style');st.id='whoCss';st.textContent='.pk-confirm{display:flex;flex-direction:column;gap:10px;border:3px solid #C9A24A;background:#fff;border-radius:18px;padding:16px}.pk-q{font-weight:800;font-size:18px;color:#2B1D0A}.pk-who{display:flex;flex-direction:column;gap:4px;background:#FBF2DD;border-radius:12px;padding:12px 14px}.pk-who b{font-size:26px;color:#2B1D0A}.pk-who span{font-size:15px;color:#6B5A3C;line-height:1.4}.pk-yes,.pk-no{font:inherit;font-size:18px;font-weight:800;border-radius:999px;min-height:56px;cursor:pointer;border:2px solid #C9A24A}.pk-yes{background:#C9A24A;color:#2B1D0A}.pk-no{background:#fff;color:#6B5A3C}.who-modal{position:fixed;inset:0;z-index:200;background:rgba(43,29,10,.62);display:flex;align-items:center;justify-content:center;padding:20px}.who-card{width:100%;max-width:420px;background:#fff;border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:10px;box-shadow:0 12px 40px rgba(0,0,0,.35)}.who-card .wm-t{font-weight:800;font-size:22px;color:#2B1D0A}.who-card .wm-s{font-size:15.5px;line-height:1.6;color:#4A3A22}.who-card ul{margin:0;padding-left:22px;font-size:16px;font-weight:700;color:#2B1D0A;line-height:1.7}.who-card .wm-err{background:#FBEAE3;color:#8A3B1F;border-radius:10px;padding:10px 12px;font-weight:700}.who-card button{font:inherit;font-size:17px;font-weight:800;border-radius:999px;min-height:52px;cursor:pointer;border:2px solid #C9A24A;background:#fff;color:#5E4210}.who-card .wm-keep{background:#C9A24A;color:#2B1D0A}.who-card .wm-del{border-color:#B4472A;color:#B4472A}.who-card button:disabled{opacity:.5}'.replace(/\|\|/g,'\n');(document.head||document.documentElement).appendChild(st);}
  var W=window.WHO={};
  W.get=function(){try{return Number(localStorage.getItem(KEY)||0)||0;}catch(e){return 0;}};
  W.set=function(id){try{localStorage.setItem(KEY,String(id));}catch(e){}};
  W.clear=function(){try{localStorage.removeItem(KEY);}catch(e){}};

  W.confirm=function(box,p,yes,no){
    var sub=[p.unit,p.title||p.role].filter(Boolean).join('・');
    box.innerHTML='<div class="pk-confirm"><div class="pk-q">您是這一位嗎？</div><div class="pk-who"><b>'+esc(p.name)+'</b>'
      +'<span>'+esc(sub)+'</span>'+(p.company?'<span>'+esc(p.company)+'</span>':'')
      +(p.lunch>0?'<span>午場 第 '+p.lunch+' 桌</span>':'')+(p.dinner>0?'<span>晚宴 第 '+p.dinner+' 桌</span>':'')+'</div>'
      +'<button type="button" class="pk-yes">對，就是我 ›</button><button type="button" class="pk-no">不是，重新找</button></div>';
    box.querySelector('.pk-yes').onclick=function(){yes(p);};
    box.querySelector('.pk-no').onclick=no;
    try{box.scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}
  };

  function modal(p,nw,ni,go){
    var old=document.getElementById('whoModal');if(old)old.remove();
    var m=document.createElement('div');m.id='whoModal';m.className='who-modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');
    m.innerHTML='<div class="who-card"><div class="wm-t">要換人嗎？</div>'
      +'<div class="wm-s">「'+esc(p.name)+'」已經有這些紀錄：</div><ul>'+(nw?'<li>許願 '+nw+' 則</li>':'')+(ni?'<li>交流邀請／回覆 '+ni+' 筆</li>':'')+'</ul>'
      +'<div class="wm-s">如果選錯人（'+esc(p.name)+'不是您本人），可以一併撤回，避免您的資料掛在他名下。</div>'
      +'<div class="wm-err" style="display:none">撤回失敗，請再按一次</div>'
      +'<button type="button" class="wm-keep">只換人，保留紀錄</button><button type="button" class="wm-del">撤回這些紀錄並換人</button><button type="button" class="wm-no">取消</button></div>';
    document.body.appendChild(m);
    var close=function(){m.remove();};
    m.querySelector('.wm-no').onclick=close;
    m.querySelector('.wm-keep').onclick=function(){close();go();};
    m.querySelector('.wm-del').onclick=function(){
      var b=this;b.disabled=true;
      Promise.all([dbDelete('h15_wishes','person_id=eq.'+p.id),dbDelete('h15_interests','from_id=eq.'+p.id)])
        .then(function(){close();go();})
        .catch(function(){b.disabled=false;m.querySelector('.wm-err').style.display='block';});
    };
  }
  W.switchOut=function(p,done){
    var go=function(){W.clear();if(done)done();};
    if(!p||typeof dbGet!=='function'){go();return;}
    Promise.all([dbGet('h15_wishes?person_id=eq.'+p.id+'&select=person_id'),dbGet('h15_interests?from_id=eq.'+p.id+'&select=to_id')]).then(function(r){
      var nw=(r[0]||[]).length,ni=(r[1]||[]).length;
      if(!nw&&!ni){go();return;}
      modal(p,nw,ni,go);
    }).catch(go);
  };
})();
