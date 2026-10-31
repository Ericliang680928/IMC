const SB_URL='https://ahrgjhlfbrsfznvbokkf.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocmdqaGxmYnJzZnpudmJva2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNzM5NzIsImV4cCI6MjA5ODk0OTk3Mn0.432IX39nW0wdpCejwliAJ7CLs_xKJb2uP0S2e0LIB-Q';
async function rpc(fn,args){
  let r;
  try{
    r=await fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(args||{})});
  }catch(e){throw new Error('網路連線失敗，請稍後再試')}
  const txt=await r.text(); let j=null; try{j=txt?JSON.parse(txt):null}catch(e){}
  if(!r.ok){
    const m=(j&&(j.message||j.hint))||txt||('錯誤 '+r.status);
    if(/bad password/.test(m)) throw new Error('密碼不正確');
    throw new Error(m);
  }
  return j;
}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'NT$ '+Number(n||0).toLocaleString('en-US');
const todayTW=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'});
const fmtTime=t=>t?new Date(t).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false,month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';
