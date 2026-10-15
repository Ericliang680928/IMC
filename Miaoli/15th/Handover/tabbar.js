/* 底部分頁列：主頁／我的／找人／交流／商品。
   手機上每個頁面都顯示（寬度 720px 以下；電腦版不受影響）。深色底＋金色大字＋圖示，目前所在分頁以金色塊標示。
   「我的活動頁」（me.html）自帶這排，這個檔案只負責共用的外觀與圖示；其他頁面則由這個檔案直接加上這排。 */
(function(){
  var page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(page==='admin.html')return;
  var IC={
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5.5h4V20"/>',
    me:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.6-4.2 3.5-6.5 7.5-6.5s6.9 2.3 7.5 6.5"/>',
    find:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5.5 5.5"/>',
    meet:'<path d="M20.5 12a8 8 0 0 1-8 8H4l2.2-3A8 8 0 1 1 20.5 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    shop:'<path d="M5 8.5h14l-1 12H6z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>'
  };
  function svg(k){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+IC[k]+'</svg>';}
  var css=document.createElement('style');
  css.textContent=
   '.imc-tabbar{background:#2B1D0A;border-top:2px solid #C9A24A;display:flex;gap:4px;padding:6px 6px calc(6px + env(safe-area-inset-bottom));box-sizing:border-box;box-shadow:0 -6px 18px rgba(43,29,10,.28)}'
  +'.imc-tabbar .imc-tab{flex:1;min-width:0;min-height:60px;border:0;background:none;border-radius:14px;margin:0;padding:0;font-family:inherit;font-size:16px;font-weight:700;line-height:1.1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}'
  +'.imc-tabbar .imc-tab,.imc-tabbar .imc-tab:hover,.imc-tabbar .imc-tab:visited{color:#EBDAAE}'
  +'.imc-tabbar .imc-tab.on,.imc-tabbar .imc-tab.on:hover{background:#C9A24A;color:#2B1D0A}'
  +'.imc-tabbar .imc-tab svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}'
  +'#imcTabbar{display:none}'
  +'@media (max-width:720px){'
  +'#imcTabbar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:18}'
  +'body.has-imc-tabbar{padding-bottom:calc(82px + env(safe-area-inset-bottom))!important}'
  +'.fab{bottom:calc(94px + env(safe-area-inset-bottom))!important}.toast{bottom:calc(168px + env(safe-area-inset-bottom))!important}'
  +'}';
  document.head.appendChild(css);
  if(page==='me.html'){   // 自帶這排：只補圖示
    document.querySelectorAll('#tabbar .imc-tab[data-ic]').forEach(function(a){a.insertAdjacentHTML('afterbegin',svg(a.getAttribute('data-ic')));});
    return;
  }
  if(document.getElementById('imcTabbar'))return;
  var CUR={'index.html':'home','shop.html':'shop','sponsors.html':'shop','wish.html':'meet','seat.html':'me'}[page]||'';
  var ITEMS=[['home','主頁','index.html'],['me','我的','me.html#me'],['find','找人','me.html#find'],['meet','交流','me.html#meet'],['shop','商品','shop.html']];
  var nav=document.createElement('nav');nav.id='imcTabbar';nav.className='imc-tabbar';nav.setAttribute('aria-label','主要分頁');
  nav.innerHTML=ITEMS.map(function(i){return '<a class="imc-tab'+(i[0]===CUR?' on':'')+'" href="'+i[2]+'"'+(i[0]===CUR?' aria-current="page"':'')+'>'+svg(i[0])+i[1]+'</a>';}).join('');
  document.body.appendChild(nav);
  document.body.classList.add('has-imc-tabbar');
})();
