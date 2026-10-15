/* 苗栗IMC 第15屆交接典禮 — 資料庫存取（Supabase REST） */
const DB_URL='https://ahrgjhlfbrsfznvbokkf.supabase.co/rest/v1/';
const DB_KEY='sb_publishable_e_YOmzczThrtX4YD2yC77Q_zHcUJcpI';
async function db(path,opt){
  opt=opt||{};
  const h={'apikey':DB_KEY,'Authorization':'Bearer '+DB_KEY,'Content-Type':'application/json','Prefer':opt.prefer||'return=representation'};
  const r=await fetch(DB_URL+path,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined});
  if(r.status===204)return [];
  const t=await r.text();
  let j=null;try{j=t?JSON.parse(t):null;}catch(e){j=t;}
  if(r.ok===false){const err=new Error((j&&j.message)||('HTTP '+r.status));err.detail=j;throw err;}
  return j;
}
const dbGet=(path)=>db(path);
const dbInsert=(table,row,prefer)=>db(table,{method:'POST',body:row,prefer:prefer||'return=representation'});
const dbUpsert=(table,row,onConflict)=>db(table+'?on_conflict='+onConflict,{method:'POST',body:row,prefer:'resolution=merge-duplicates,return=representation'});
const dbPatch=(table,filter,row)=>db(table+'?'+filter,{method:'PATCH',body:row});
const dbDelete=(table,filter)=>db(table+'?'+filter,{method:'DELETE',prefer:'return=minimal'});
