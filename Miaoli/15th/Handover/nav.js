/* 手機版選單：☰ 選單 展開／收合（全站導覽列共用） */
(function(){
  var n=document.querySelector('.nav'); if(!n) return;
  var b=n.querySelector('.mbtn'); if(!b) return;
  function set(o){n.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');b.textContent=o?'✕ 關閉':'☰ 選單';}
  b.addEventListener('click',function(e){e.stopPropagation();set(!n.classList.contains('open'));});
  n.querySelectorAll('.links a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
  document.addEventListener('click',function(e){if(!n.contains(e.target))set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
  addEventListener('resize',function(){if(innerWidth>720)set(false);});
})();
