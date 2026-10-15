/* 友社貴賓高鐵接駁（友惠遊覽車）名單與提醒——只放社別／姓名／車次，不含電話
   欄位：u 社別、n 姓名、sp 特邀(1)、g 去程車次(0=不需接駁)、gs 上車站、b 回程車次、bs 下車站
   去程 12:10 高鐵苗栗站 → 千八會館；回程 20:10 千八會館 → 高鐵苗栗站 */
(function(){
var T={
 '821':{d:'南港／桃園 → 苗栗',t:'11:57 抵達'},
 '818':{d:'台南／左營 → 苗栗',t:'11:54 抵達'},
 '854':{d:'苗栗 → 桃園／南港',t:'20:56 開車'},
 '857':{d:'苗栗 → 台南／左營',t:'20:58 開車'}
};
var L=[
 ['桃園社','蔡東嶽',0,'821','桃園站','854','桃園站'],
 ['台南社','劉棟堅',0,'818','台南站','857','台南站'],
 ['台南社','江慧瑜',0,'818','台南站','857','台南站'],
 ['台南社','韋氏蘭英',0,'818','台南站','857','台南站'],
 ['台南社','高艾雅',0,'818','台南站','857','台南站'],
 ['台南社','林信宏',0,'818','台南站','857','台南站'],
 ['台南社','李勳婷',1,'818','台南站','857','台南站'],
 ['南瀛社','翁志宜',0,'818','台南站','857','台南站'],
 ['南瀛社','鄭群亮',1,'818','台南站','857','台南站'],
 ['南瀛社','石嘉玫',1,'818','台南站','857','台南站'],
 ['南瀛社','張淑貞',0,'','','857','台南站'],
 ['高雄社','林秀英',0,'818','左營站','857','左營站'],
 ['高雄社','李國陽',0,'818','左營站','857','左營站'],
 ['高雄社','林慧英',0,'818','左營站','857','左營站'],
 ['高雄社','洪仙姬',0,'818','左營站','857','左營站'],
 ['高雄社','余昭慶',0,'818','左營站','857','左營站'],
 ['高雄社','蔡慧鈴',0,'818','左營站','857','左營站'],
 ['高雄社','楊珮青',0,'818','左營站','857','左營站'],
 ['高雄社','陳炎君',0,'818','左營站','857','左營站'],
 ['高雄社','葉家昇',0,'818','左營站','857','左營站'],
 ['高雄社','鄭良諶',0,'818','左營站','857','左營站'],
 ['高雄社','黃雅莉',0,'818','左營站','857','左營站'],
 ['屏東社','許富大',0,'818','左營站','857','左營站'],
 ['屏東社','周泯垣',0,'818','左營站','857','左營站'],
 ['屏東社','黃素卿',0,'818','左營站','857','左營站'],
 ['屏東社','鄭涵寧',0,'818','左營站','857','左營站']
].map(function(r){return {u:r[0],n:r[1],sp:r[2],g:r[3],gs:r[4],b:r[5],bs:r[6]};});
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function key(s){return String(s||'').normalize('NFKC').replace(/\s+/g,'').replace(/^\d+/,'');}
/* 依姓名＋社別找接駁資料（社別可省略，但同名時以社別為準） */
function find(name,unit){
  var n=key(name),u=key(unit);
  for(var i=0;i<L.length;i++){if(key(L[i].n)===n&&(!u||key(L[i].u)===u))return L[i];}
  return null;
}
/* 個人提醒（HTML 字串；樣式用行內，各頁面都能直接用） */
function note(p){
  if(!p)return '';
  var go=p.g?'<div style="margin-top:6px"><b>去程</b>　<span style="white-space:nowrap">12:10</span> 高鐵苗栗站 → 會場<br><span style="font-size:.88em;opacity:.85">搭高鐵 '+esc(p.g)+' 次（'+esc(p.gs)+'上車），'+esc(T[p.g].t)+'苗栗站後轉搭接駁車</span></div>'
    :'<div style="margin-top:6px"><b>去程</b>　不需接駁</div>';
  var bk='<div style="margin-top:8px"><b>回程</b>　<span style="white-space:nowrap">20:10</span> 會場 → 高鐵苗栗站<br><span style="font-size:.88em;opacity:.85">搭高鐵 '+esc(p.b)+' 次（'+esc(T[p.b].t.replace('開車','')+'苗栗開車')+'，'+esc(p.bs)+'下車）</span></div>';
  return '<div class="shnote" style="margin:12px 0;padding:12px 14px;border-radius:14px;background:#FFF3D6;border:1px solid #E0B65A;color:#5B3B00;line-height:1.55;font-size:15px">'
    +'<div style="font-weight:800">🚌 您有登記高鐵接駁（友惠遊覽車）</div>'+go+bk
    +'<div style="margin-top:8px;font-size:.88em">遊覽車準時發車，請提早到集合點；活動主頁會在發車前提醒，也可加入手機行事曆。<br>如需協助請洽現場服務台。</div></div>';
}
/* 名單視窗內容：dir='go' 去程、'back' 回程；依社別分組，只列社別／姓名 */
function listHTML(dir){
  var rows=L.filter(function(p){return dir==='go'?!!p.g:!!p.b;});
  var order=[],by={};
  rows.forEach(function(p){if(!by[p.u]){by[p.u]=[];order.push(p.u);}by[p.u].push(p);});
  var h='<div style="color:#6B5424;font-size:14px;margin-bottom:10px">'+(dir==='go'?'去程　12:10 高鐵苗栗站 → 會場':'回程　20:10 會場 → 高鐵苗栗站')+'・共 '+rows.length+' 位</div><div style="color:#8b6b2c;font-size:13.5px;font-weight:700;margin:-4px 0 6px">點選姓名，可查看桌次與詳細資訊</div>';
  order.forEach(function(u){
    h+='<div style="margin:10px 0 4px;font-weight:800;color:#1C2C60">'+esc(u)+'<span style="font-weight:600;color:#8b6b2c;font-size:.85em">　'+by[u].length+' 位</span></div><div style="display:flex;flex-wrap:wrap;gap:6px">'
      +by[u].map(function(p){return '<button type="button" data-n="'+esc(p.n)+'" data-u="'+esc(p.u)+'" style="background:#FAF4E6;border:1px solid #E5D3A6;border-radius:999px;padding:7px 14px;min-height:40px;font:inherit;font-size:16px;color:#2B1D0A;cursor:pointer">'+esc(p.n)+(p.sp?'<small style="color:#8b6b2c">（特邀）</small>':'')+'</button>';}).join('')+'</div>';
  });
  return h;
}
/* ── 點姓名看桌次：名冊（roster.json）第一次點才載入，之後沿用 ── */
var R=null,RP=null,curDir='go';
function loadR(){
  if(R)return Promise.resolve(R);
  if(!RP)RP=fetch('roster.json?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(d){R=d;return d;}).catch(function(e){RP=null;throw e;});
  return RP;
}
function pick(ref){
  if(!R)return null;
  var i,n=key(ref.n),u=key(ref.u),hit=null;
  if(ref.id!=null){for(i=0;i<R.length;i++)if(String(R[i].id)===String(ref.id))return R[i];return null;}
  for(i=0;i<R.length;i++){if(key(R[i].name)===n){if(!u||key(R[i].unit)===u)return R[i];hit=hit||R[i];}}
  return hit;
}
function sess(label,t){
  t=Number(t);var ok=t>0;
  return '<div style="flex:1;min-width:0;text-align:center;border-radius:14px;padding:10px 8px;background:'+(ok?'#FFF8E7':'#F4F1EA')+';border:1px solid '+(ok?'#E5C97A':'#E2DCCB')+'">'
    +'<div style="font-size:13px;color:#8b6b2c;font-weight:700">'+label+'</div>'
    +'<div style="margin-top:2px;line-height:1.3;font-weight:800;color:#2B1D0A;font-size:'+(ok?'26':'17')+'px">'+(ok?'第 '+t+' 桌':(t<0?'座位安排中':'不參加此場'))+'</div>'
    +(t<0?'<div style="font-size:12px;color:#7a6a4a;margin-top:2px">請洽現場服務台</div>':'')+'</div>';
}
function mates(p,k){var t=Number(p[k]);if(!(t>0))return [];return R.filter(function(q){return q.id!==p.id&&Number(q[k])===t;});}
function mchip(q){return '<button type="button" data-id="'+esc(q.id)+'" style="background:#FAF4E6;border:1px solid #E5D3A6;border-radius:999px;padding:5px 12px;min-height:36px;font:inherit;font-size:15px;color:#2B1D0A;cursor:pointer">'+esc(q.name)+'<small style="margin-left:6px;color:#8b6b2c">'+esc(q.unit)+'</small></button>';}
function mblock(title,list){
  if(!list.length)return '';
  return '<div style="margin:14px 0 6px;font-weight:800;color:#1C2C60;font-size:15px">'+title+'</div><div style="display:flex;flex-wrap:wrap;gap:6px">'+list.map(mchip).join('')+'</div>';
}
function personHTML(p){
  var sh=find(p.name,p.unit),sp=sh&&sh.sp;
  var lu=mates(p,'lunch'),di=mates(p,'dinner');
  var same=Number(p.lunch)===Number(p.dinner)&&lu.length===di.length&&lu.every(function(q,i){return q.id===di[i].id;});
  var mt=same?mblock('同桌賓客',lu)
    :mblock('<span>午場</span><span style="margin-left:6px">同桌賓客</span>',lu)+mblock('<span>晚宴</span><span style="margin-left:6px">同桌賓客</span>',di);
  var cj=[];if(p.company)cj.push('<span>'+esc(p.company)+'</span>');if(p.job)cj.push('<span>'+esc(p.job)+'</span>');
  return '<button type="button" id="shuttleReturn" style="border:0;background:none;padding:6px 0;margin:2px 0 6px;font:inherit;font-size:15px;font-weight:700;color:#8b6b2c;cursor:pointer">‹ 返回名單</button>'
    +'<div style="font-size:24px;font-weight:800;color:#2B1D0A;line-height:1.3">'+esc(p.name)+'</div>'
    +'<div style="margin-top:2px;color:#1C2C60;font-weight:700">'+esc(p.unit)+(sp?'<small style="color:#8b6b2c;font-weight:600">（特邀）</small>':'')+'</div>'
    +(cj.length?'<div style="margin-top:4px;font-size:15px;color:#5B4A28;line-height:1.5">'+cj.join('<span style="margin:0 6px;opacity:.5">／</span>')+'</div>':'')
    +'<div style="display:flex;gap:10px;margin-top:14px">'+sess('午場 13:00',p.lunch)+sess('晚宴 18:00',p.dinner)+'</div>'
    +(sh?note(sh):'')
    +mt
    +'<a href="seat.html?p='+(Number(p.id)-1)+'" style="display:flex;align-items:center;justify-content:center;min-height:46px;margin-top:16px;border-radius:999px;background:#C5A366;color:#fff;font-weight:800;text-decoration:none">在座位圖上查看 ›</a>';
}
function failHTML(ref){
  return '<button type="button" id="shuttleReturn" style="border:0;background:none;padding:6px 0;font:inherit;font-size:15px;font-weight:700;color:#8b6b2c;cursor:pointer">‹ 返回名單</button>'
    +'<div style="margin:10px 0;line-height:1.6">桌次資料暫時載入失敗，請稍後再試，或到座位查詢頁輸入姓名查詢。</div>'
    +'<a href="seat.html?q='+encodeURIComponent(ref.n||'')+'" style="display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:999px;background:#C5A366;color:#fff;font-weight:800;text-decoration:none">在座位圖上查看 ›</a>';
}
function bindList(){
  [].forEach.call(document.querySelectorAll('#shuttleBody button[data-n]'),function(b){b.onclick=function(){showPerson({n:b.getAttribute('data-n'),u:b.getAttribute('data-u')});};});
}
function showPerson(ref){
  var body=document.getElementById('shuttleBody'),tabs=document.getElementById('shuttleTabs'),box=document.getElementById('shuttleBox');
  if(!body)return;
  tabs.style.display='none';
  body.innerHTML='<div style="padding:28px 0;text-align:center;color:#8b6b2c">資料載入中…</div>';
  function done(html){
    if(!document.getElementById('shuttleBody'))return;
    body.innerHTML=html;box.scrollTop=0;
    var bk=document.getElementById('shuttleReturn');if(bk){bk.onclick=function(){paint(curDir);};}
    [].forEach.call(body.querySelectorAll('button[data-id]'),function(b){b.onclick=function(){showPerson({id:b.getAttribute('data-id')});};});
  }
  loadR().then(function(){var p=pick(ref);done(p?personHTML(p):failHTML(ref));}).catch(function(){done(failHTML(ref));});
}
function paint(d){
  curDir=d;
  var tabs=document.getElementById('shuttleTabs'),box=document.getElementById('shuttleBox');
  tabs.style.display='flex';
  document.getElementById('shuttleBody').innerHTML=listHTML(d);
  tabs.innerHTML=[['go','去程 12:10'],['back','回程 20:10']].map(function(t){
    var on=t[0]===d;return '<button type="button" data-d="'+t[0]+'" style="flex:1;min-height:42px;border-radius:999px;font-size:15px;font-weight:700;cursor:pointer;border:1px solid #C5A366;'+(on?'background:#C5A366;color:#fff':'background:#fff;color:#5B3B00')+'">'+t[1]+'</button>';}).join('');
  [].forEach.call(tabs.querySelectorAll('button'),function(b){b.onclick=function(){paint(b.getAttribute('data-d'));};});
  bindList();
  if(box)box.scrollTop=0;
}
/* 開啟視窗（任何頁面都可呼叫；自行建立遮罩） */
function open(dir){
  close();
  var m=document.createElement('div');m.id='shuttleModal';
  m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','友社貴賓高鐵接送名單');
  m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(20,16,8,.55);display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML='<div id="shuttleBox" style="background:#fff;border-radius:18px;max-width:520px;width:100%;max-height:86vh;overflow:auto;padding:18px 18px 16px;box-shadow:0 12px 40px rgba(0,0,0,.35)">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div style="font-size:19px;font-weight:800">🚌 友社貴賓高鐵接送名單</div>'
    +'<button type="button" id="shuttleX" aria-label="關閉" style="border:0;background:#f1ece0;border-radius:999px;width:36px;height:36px;font-size:18px;cursor:pointer">✕</button></div>'
    +'<div id="shuttleTabs" style="display:flex;gap:8px;margin:12px 0 4px"></div><div id="shuttleBody"></div>'
    +'<div style="margin-top:14px;font-size:12.5px;color:#7a6a4a">僅供本次活動接送使用，請勿轉發。名單如有異動，以承辦團隊通知為準。</div></div>';
  document.body.appendChild(m);
  paint(dir==='back'?'back':'go');
  loadR().catch(function(){});
  document.getElementById('shuttleX').onclick=close;
  m.addEventListener('click',function(e){if(e.target===m)close();});
  document.addEventListener('keydown',esc_);
  document.getElementById('shuttleX').focus();
}
function esc_(e){if(e.key==='Escape')close();}
function close(){var m=document.getElementById('shuttleModal');if(m)m.remove();document.removeEventListener('keydown',esc_);}
window.SHUTTLE={list:L,trains:T,find:find,note:note,open:open,close:close};
})();
