/* 中文／日本語 切換（全站共用；後台 admin.html 不載入）
   做法：頁面原文維持中文；選日文時，由本檔把畫面上的中文文字節點與常用屬性（placeholder、title、alt、aria-label）
   依字典（i18n-ja.js、i18n-ja-data.js）換成日文，並持續監看畫面變動（頁面程式重新產生內容時也會即時換）。
   - 切回中文時會還原原文，不需重新整理，頁面上填到一半的資料不會被清掉。
   - 字典查不到的文字維持中文原樣（人名、社名、公司名、社友自己輸入的內容本來就不翻）。
   - 語言記在 localStorage('h15_lang')；網址加 ?lang=ja 或 ?lang=zh 可直接指定並記住；第一次來且瀏覽器語言為日文時預設日文。
   - alert／confirm／prompt 的提示文字也會一併翻譯。 */
(function(){
  'use strict';
  var KEY='h15_lang',ATTRS=['placeholder','title','alt','aria-label'];
  var CJK=/[　-〿㐀-鿿＀-￯]/;
  var D={ex:Object.create(null),rx:[],fns:[],gx:[]};
  var lang='zh',obs=null,T=new WeakMap(),A=new WeakMap(),cache=Object.create(null),filesLoaded=false,btn=null;
  var FILES=['i18n-ja.js?v=1','i18n-ja-ui.js?v=10','i18n-ja-sponsors.js?v=1','i18n-ja-data.js?v=4','i18n-ja-intro.js?v=6'];

  function detect(){
    var q='';try{q=new URLSearchParams(location.search).get('lang')||'';}catch(e){}
    if(q==='ja'||q==='zh'){try{localStorage.setItem(KEY,q);}catch(e){}return q;}
    try{var s=localStorage.getItem(KEY);if(s==='ja'||s==='zh')return s;}catch(e){}
    var nl='';try{nl=(navigator.languages&&navigator.languages[0])||navigator.language||'';}catch(e){}
    return /^ja/i.test(nl)?'ja':'zh';
  }

  /* ---------- 翻譯核心 ---------- */
  /* 分段符號由大到小：「・｜」→「、，,」→「/／」；每一段各自查字典，段內再往下一層切 */
  var SEPS=[/([・｜])/,/([、，,])/,/([\/／])/];
  function base(core){
    var r=D.ex[core];if(r!==undefined)return r;
    var i,x,m;
    for(i=0;i<D.rx.length;i++){x=D.rx[i];if(x[0].test(core)){x[0].lastIndex=0;return core.replace(x[0],x[1]);}x[0].lastIndex=0;}
    for(i=0;i<D.fns.length;i++){m=D.fns[i](core);if(m!==undefined&&m!==null&&m!==false)return m;}
    return undefined;
  }
  function lookup(core,lv){
    var r=base(core);if(r!==undefined)return r;
    var i,L=lv||0;
    for(;L<SEPS.length;L++){
      var parts=core.split(SEPS[L]);
      if(parts.length<2)continue;
      var hit=false;
      for(i=0;i<parts.length;i+=2){
        var p=parts[i],pm=p.match(/^(\s*)([\s\S]*?)(\s*)$/);
        if(pm[2]&&CJK.test(pm[2])){var t=lookup(pm[2],L+1);if(t!==undefined){parts[i]=pm[1]+t+pm[3];hit=true;}}
      }
      if(hit)return parts.join('');
      return undefined;
    }
    return undefined;
  }
  /* 全域小規則（例：「第15屆」→「第15期」），套在翻譯結果或原文上 */
  function gxApply(c,core){
    if(!D.gx.length)return c;
    var cur=(c===null?core:c),out=cur;
    for(var i=0;i<D.gx.length;i++){var g=D.gx[i];out=out.replace(g[0],g[1]);g[0].lastIndex=0;}
    return out===cur?c:out;
  }
  function tr(s){
    if(s==null)return s;s=String(s);
    if(!CJK.test(s))return s;
    var m=s.match(/^(\s*)([\s\S]*?)(\s*)$/),core=m[2].replace(/\s*\n\s*/g,' ');
    if(!core)return s;
    var key=core,c=cache[key];
    if(c===undefined){c=lookup(core,0);if(c===undefined||c===false)c=null;c=gxApply(c,core);cache[key]=c;}
    if(c===null)return s;
    return m[1]+c+m[3];
  }

  /* ---------- DOM 走訪 ---------- */
  function skip(n){var e=n.nodeType===1?n:n.parentNode;return !e||!e.closest||!!e.closest('script,style,noscript,textarea,[data-i18n-skip],[translate=no]');}
  function skipAttr(el){return !el||!el.closest||!!el.closest('script,style,noscript,[data-i18n-skip],[translate=no]');}
  function doText(n){
    if(skip(n))return;
    var v=n.nodeValue,rec=T.get(n);
    if(rec&&v===rec.j)return;
    var j=tr(v);
    if(j!==v){
      T.set(n,{z:v,j:j});n.nodeValue=j;
      var p=n.parentNode;
      if(p&&p.nodeName==='OPTION'&&!p.hasAttribute('value')){p.setAttribute('value',v.trim());}
    }else if(rec)T.delete(n);
  }
  function doAttr(el,a){
    if(!el.hasAttribute||!el.hasAttribute(a))return;
    if(skipAttr(el))return;
    var v=el.getAttribute(a),rec=A.get(el),k;
    if(rec&&rec[a]&&v===rec[a].j)return;
    var j=tr(v);
    if(j!==v){rec=rec||{};rec[a]={z:v,j:j};A.set(el,rec);el.setAttribute(a,j);}
    else if(rec&&rec[a]){delete rec[a];}
  }
  function doBtnValue(el){
    if(el.nodeName!=='INPUT')return;var t=(el.type||'').toLowerCase();
    if(t!=='button'&&t!=='submit'&&t!=='reset')return;
    doAttr(el,'value');
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===3){doText(root);return;}
    if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    var base=root.nodeType===9?root.documentElement:root;
    if(base&&base.nodeType===1){ATTRS.forEach(function(a){doAttr(base,a);});doBtnValue(base);}
    var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
    while((n=tw.nextNode()))list.push(n);
    list.forEach(doText);
    if(root.querySelectorAll){
      var sel='['+ATTRS.join('],[')+'],input[type=button],input[type=submit],input[type=reset]';
      var els=root.querySelectorAll(sel);
      for(var i=0;i<els.length;i++){ATTRS.forEach(function(a){doAttr(els[i],a);});doBtnValue(els[i]);}
    }
  }
  function restore(root){
    var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
    while((n=tw.nextNode()))list.push(n);
    list.forEach(function(n){var rec=T.get(n);if(rec&&n.nodeValue===rec.j){n.nodeValue=rec.z;}T.delete(n);});
    var els=root.querySelectorAll('*');
    for(var i=0;i<els.length;i++){var rec=A.get(els[i]);if(rec){for(var a in rec){if(els[i].getAttribute(a)===rec[a].j)els[i].setAttribute(a,rec[a].z);}A.delete(els[i]);}}
  }
  function onMut(list){
    if(lang!=='ja')return;
    for(var i=0;i<list.length;i++){
      var m=list[i];
      if(m.type==='childList'){for(var k=0;k<m.addedNodes.length;k++)walk(m.addedNodes[k]);}
      else if(m.type==='characterData'){doText(m.target);}
      else if(m.type==='attributes'){doAttr(m.target,m.attributeName);}
    }
    if(obs)obs.takeRecords();
  }
  function startObs(){
    if(obs||!window.MutationObserver)return;
    obs=new MutationObserver(onMut);
    obs.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  }
  function applyAll(){
    cache=Object.create(null);
    startObs();walk(document);
    if(obs)obs.takeRecords();
  }

  /* ---------- 字型與樣式 ---------- */
  function injectStyle(){
    if(document.getElementById('i18nCss'))return;
    var s=document.createElement('style');s.id='i18nCss';
    s.textContent='.langbtn{flex:none;min-height:34px;padding:0 13px;border-radius:999px;border:1.5px solid rgba(226,189,99,.8);background:rgba(255,255,255,.1);color:#F8E7B8;font:inherit;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;line-height:1;margin-left:auto}'
      +'.langbtn:hover{background:rgba(226,189,99,.25)}.langbtn:focus-visible{outline:3px solid #F3D58A;outline-offset:2px}'
      +'.nav .cta~.langbtn,.nav .cartlink~.langbtn{margin-left:8px}.nav .langbtn~.mbtn{margin-left:8px}[data-lang-slot] .langbtn{margin-left:0}'
      +'.langfloat{position:fixed;right:12px;top:10px;z-index:99}'
      +'html[lang=ja] body,html[lang=ja] button,html[lang=ja] input,html[lang=ja] select,html[lang=ja] textarea{font-family:"Noto Sans JP","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Meiryo",system-ui,sans-serif}'
      +'html[lang=ja] h1,html[lang=ja] h2,html[lang=ja] h3,html[lang=ja] .serif{font-family:"Noto Serif JP","Hiragino Mincho ProN","Yu Mincho",serif}'
      +'html[lang=ja] body{line-break:strict;overflow-wrap:anywhere}'
      +'html[lang=ja] .nav a{font-size:15px;padding-left:10px;padding-right:10px}'
      +'@media (max-width:720px){html .nav .nin{gap:6px}html .nav a.cta{padding:8px 11px!important;font-size:14px!important}html .nav .cartlink{font-size:14px!important;padding-left:8px!important;padding-right:8px!important}html .nav .langbtn{min-height:36px!important;padding:0 10px!important;font-size:13px!important}html .nav .mbtn{padding:0 12px!important;font-size:15px!important;min-height:40px!important}}@media (max-width:400px){html .nav .nin{gap:4px;padding:0 8px}html .nav a.cta{padding:7px 9px!important;font-size:13px!important}html .nav .langbtn{padding:0 8px!important;font-size:12px!important}html .nav .mbtn{padding:0 9px!important;font-size:14px!important}}';
    document.head.appendChild(s);
  }
  function injectFonts(){
    if(document.getElementById('i18nFont'))return;
    var l=document.createElement('link');l.id='i18nFont';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@600;700;900&display=swap';
    document.head.appendChild(l);
  }

  /* ---------- 切換鈕 ---------- */
  function mount(){
    if(btn&&document.body.contains(btn))return;
    btn=document.createElement('button');btn.type='button';btn.className='langbtn';btn.setAttribute('translate','no');btn.setAttribute('data-i18n-skip','');
    btn.onclick=function(){set(lang==='ja'?'zh':'ja',true);};
    paintBtn();
    var slot=document.querySelector('[data-lang-slot]'),nav=document.querySelector('.nav .nin');
    if(slot)slot.appendChild(btn);
    else if(nav){var mb=nav.querySelector('.mbtn');if(mb)nav.insertBefore(btn,mb);else nav.appendChild(btn);}
    else{btn.className+=' langfloat';document.body.appendChild(btn);}
  }
  function paintBtn(){
    if(!btn)return;
    btn.textContent=lang==='ja'?'中文':'日本語';
    btn.setAttribute('aria-label',lang==='ja'?'切換為中文（言語切替）':'日本語に切り替え（切換語言）');
  }

  /* ---------- 載入字典 ---------- */
  function loadFiles(cb){
    if(filesLoaded){cb&&cb();return;}
    var left=FILES.length,done=function(){if(--left===0){filesLoaded=true;cb&&cb();}};
    FILES.forEach(function(f){var s=document.createElement('script');s.async=false;s.src=f;s.onload=done;s.onerror=done;document.head.appendChild(s);});
  }

  function set(l,user){
    if(l!=='ja')l='zh';
    if(user){try{localStorage.setItem(KEY,l);}catch(e){}}
    var prev=lang;lang=l;
    document.documentElement.lang=l==='ja'?'ja':'zh-Hant';
    paintBtn();
    if(l==='ja'){
      injectFonts();
      loadFiles(function(){if(lang==='ja')applyAll();});
    }else if(prev==='ja'){
      if(obs)obs.takeRecords();
      restore(document);
      if(obs)obs.takeRecords();
      cache=Object.create(null);
    }
    try{document.dispatchEvent(new CustomEvent('i18n:change',{detail:{lang:l}}));}catch(e){}
  }

  /* alert / confirm / prompt 的提示文字 */
  ['alert','confirm','prompt'].forEach(function(n){
    var o=window[n];if(typeof o!=='function')return;
    window[n]=function(m){var a=[].slice.call(arguments);if(lang==='ja'&&a.length)a[0]=tr(a[0]);return o.apply(window,a);};
  });

  window.I18N={
    get lang(){return lang;},set:set,tr:tr,
    add:function(d){
      if(d.ex)for(var k in d.ex)D.ex[k]=d.ex[k];
      if(d.rx)d.rx.forEach(function(x){D.rx.push(x);});
      if(d.fns)d.fns.forEach(function(x){D.fns.push(x);});
      if(d.gx)d.gx.forEach(function(x){D.gx.push(x);});
      cache=Object.create(null);
    },
    /* 供頁面程式使用：I18N.t('中文','日文') 依目前語言回傳 */
    t:function(zh,ja){return lang==='ja'&&ja!==undefined?ja:zh;}
  };

  /* ---------- 啟動 ---------- */
  lang=detect();
  document.documentElement.lang=lang==='ja'?'ja':'zh-Hant';
  injectStyle();
  if(lang==='ja'){
    /* 同步載入字典，讓第一次畫面就是日文（避免先閃一下中文）；本檔須放在 <head> 內、不可加 defer／async */
    injectFonts();
    FILES.forEach(function(f){document.write('<script src="'+f+'"><\/script>');});
    filesLoaded=true;
    startObs();
  }
  function boot(){
    mount();
    if(lang==='ja'){injectFonts();applyAll();}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
