#!/usr/bin/env python3
"""把排座工具的專案檔（.seat.json）轉成網站用的座位資料，寫回 seat.html 的 `const D=`。
用法：python3 tools/import_seatjson.py <排座專案檔.seat.json> [--dry]
之後依序執行：python3 tools/patch_seat.py → python3 tools/make_seatmap.py → python3 tools/sync_roster_tables.py

規則（為了不弄亂既有編號與 Supabase 上以名單編號記的資料）：
  1) 既有 341 位的順序不動（編號＝索引＋1），姓名／社別／公司／職稱沿用 seat.html 現有值，只更新「座位」。
  2) 專案檔裡新增、而 seat.html 沒有的人（請假者除外）→ 依專案檔順序接在名單最後，roster.json 同步新增。
  3) 已在名單中、現在標為「請假」的人 → 保留在名單，兩場都顯示「不參加」；請假且本來就不在名單的人 → 不加入。
  4) 桌位（編號、桌名、座標、午晚桌名）全部以專案檔為準；平面圖沿用 seat.html 內建圖。
  5) 沒有桌位的人 → 「座位安排中」。僅午場／僅晚宴的人另一場 → 「不參加」。
  7) 承辦人當面指定的個別調整寫在 tools/seat_overrides.json，匯入時最後套用（優先於專案檔）。
  6) 沒有桌號的特設席位（如「資訊控台」）寫在 tools/special_stations.json，會放在桌位清單最前面；成員在專案檔沒排到正式桌次時就坐這裡（午場、晚宴都是）。
--dry 只印出差異，不寫檔。"""
import json,os,sys,re,datetime,collections
here=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args=[a for a in sys.argv[1:] if not a.startswith('--')]
DRY='--dry' in sys.argv
if not args: sys.exit(__doc__)
S=json.load(open(args[0],encoding='utf-8'))
sp=os.path.join(here,'seat.html');html=open(sp,encoding='utf-8').read()
i0=html.index('const D=')+8
D,n=json.JSONDecoder().raw_decode(html[i0:]);i1=i0+n
OLD=json.loads(json.dumps(D))
ALIAS={'顧問及來賓':'苗栗來賓寶眷'}   # seat.html 把「苗栗來賓寶眷」顯示成「顧問及來賓」
W,H=D['sc']['noon']['w'],D['sc']['noon']['h']
tid={t['id']:t for t in S['tables']}
STP=os.path.join(here,'tools','special_stations.json')
ST=json.load(open(STP,encoding='utf-8')).get('stations',[]) if os.path.exists(STP) else []
STN={(n,u):i for i,st in enumerate(ST) for n,u in st['members']}   # (姓名,社別) → 特設席位的桌位索引

# ── 1) 對應既有人員 ────────────────────────────────────────────
def clean_unit(q):
    # 手動新增時把「單位 職稱」打在一起的情形（如「台日貿易交流會 副會長」）拆開
    u=q['unit']
    if q['title'] and u.endswith(' '+q['title']): u=u[:-len(q['title'])-1].strip()
    return u
pool=collections.defaultdict(list)
for p in S['people']: pool[(p['name'],clean_unit(p))].append(p)
match=[]                                      # match[i] = 專案檔人員 或 None
for p in D['ps']:
    L=pool.get((p['n'],ALIAS.get(p['u'],p['u'])))
    match.append(L.pop(0) if L else None)
used={id(q) for q in match if q}
lost=[(i,p['n']) for i,p in enumerate(D['ps']) if match[i] is None]
if lost: print('⚠ 專案檔找不到這些既有人員（座位將設為「座位安排中」）：',lost)
fresh=[q for q in S['people'] if id(q) not in used and q['st']!='leave']
for q in fresh:
    u=clean_unit(q)
    D['ps'].append({'n':q['name'],'c':q['raw'].get('任職公司',''),'o':q['raw'].get('擔任職位',''),'u':u,'t':q['title'],'s':[[2,-1],[2,-1]],'a':-1,'b':''})
    match.append(q)

# ── 2) 桌位 ────────────────────────────────────────────────────
tabs=sorted(S['tables'],key=lambda t:t['no'])
def old_r(x,y):
    best=None
    for sc in ('noon','night'):
        for t in OLD['sc'][sc]['tables']:
            d=((t['x']-x)**2+(t['y']-y)**2)**.5
            if best is None or d<best[0]: best=(d,t['r'])
    return best[1] if best and best[0]<40 else 50
tindex={}
for si,sc in enumerate(('noon','night')):
    lst=[{'no':None,'k':st['k'],'x':st['x'],'y':st['y'],'r':st['r'],'m':[]} for st in ST]
    for k,t in enumerate(tabs,start=len(ST)):
        x,y=round(t['x']*W),round(t['y']*H)
        lst.append({'no':t['no'],'k':(t['name'] if si==0 else (t.get('nameN') or t['name'])),'x':x,'y':y,'r':old_r(x,y),'m':[]})
        tindex[(si,t['id'])]=k
    D['sc'][sc]['tables']=lst
def seat_of(q,si):
    sc=['noon','night'][si]
    if q['st']=='leave' or (q.get('sc') and q['sc']!=sc): return [0,-1]
    tb=q.get('tblN') if (si==1 and q.get('tblN')) else q.get('tbl')
    if tb in tid: return [1,tindex[(si,tb)]]
    if (q['name'],clean_unit(q)) in STN: return [1,STN[(q['name'],clean_unit(q))]]
    return [2,-1]
for i,(p,q) in enumerate(zip(D['ps'],match)):
    p['s']=[seat_of(q,0),seat_of(q,1)] if q else [[2,-1],[2,-1]]
# 承辦人指定的個別調整（tools/seat_overrides.json）
OVP=os.path.join(here,'tools','seat_overrides.json')
for ov in (json.load(open(OVP,encoding='utf-8')).get('people',[]) if os.path.exists(OVP) else []):
    hit=[i for i,p in enumerate(D['ps']) if p['n']==ov['name'] and (ov['unit'] in (p.get('u',''),ALIAS.get(p.get('u',''),p.get('u',''))))]
    if len(hit)!=1: print('⚠ seat_overrides 找不到唯一的人：',ov['name'],ov['unit'],hit); continue
    for si,sc in ((0,'noon'),(1,'night')):
        k='noon' if si==0 else 'night'
        if ov.get(k) is None: continue
        ti=[j for j,t in enumerate(D['sc'][sc]['tables']) if t['no']==ov[k]]
        if len(ti)!=1: print('⚠ seat_overrides 找不到桌次',ov[k]); continue
        D['ps'][hit[0]]['s'][si]=[1,ti[0]]
# 同桌名單依專案檔的桌內順序（ord）
order={}
for i,q in enumerate(match):
    if q: order[i]=(q.get('ord') or 0,i)
for si,sc in enumerate(('noon','night')):
    tl=D['sc'][sc]['tables']
    for i,p in enumerate(D['ps']):
        st,ti=p['s'][si]
        if st==1: tl[ti]['m'].append(i)
    for t in tl: t['m'].sort(key=lambda j:order.get(j,(0,j)))
last=max(e['t'] for e in S['log']) if S.get('log') else None
if last: D['upd']=datetime.datetime.fromtimestamp(last/1000,datetime.timezone(datetime.timedelta(hours=8))).strftime('%Y/%m/%d %H:%M:%S')

# ── 3) 差異報告 ───────────────────────────────────────────────
def label(Dx,p,si):
    st,ti=p['s'][si]
    if st==0: return '不參加'
    if st==2: return '座位安排中'
    t=Dx['sc'][['noon','night'][si]]['tables'][ti]
    return '第%d桌'%t['no'] if t['no'] is not None else t['k']
# 舊桌號→新桌號對照（取多數決，用來辨識「單純重新編號」與「真的換桌」）
vote=collections.defaultdict(collections.Counter)
for i,p in enumerate(OLD['ps']):
    for si in (0,1):
        a,b=label(OLD,p,si),label(D,D['ps'][i],si)
        if a.startswith('第') and b.startswith('第'): vote[a][b]+=1
remap={a:c.most_common(1)[0][0] for a,c in vote.items()}
moved=[];renum=0
for i,p in enumerate(OLD['ps']):
    q=D['ps'][i]
    for si,nm in ((0,'午場'),(1,'晚宴')):
        a,b=label(OLD,p,si),label(D,q,si)
        if a==b: continue
        if remap.get(a)==b: renum+=1; continue
        moved.append((p['n'],p.get('u',''),nm,a,b))
print('既有 %d 人；僅因桌次重新編號而號碼不同（不算換桌）：%d 筆'%(len(OLD['ps']),renum))
print('實際換桌／狀態變更：')
for m in moved: print('  %s（%s）%s：%s → %s'%m)
print('新增（接在名單最後）：',[(p['n'],p['u'],p['t'],label(D,p,0),label(D,p,1)) for p in D['ps'][len(OLD['ps']):]])
print('目前「座位安排中」：',[p['n'] for p in D['ps'] if 2 in (p['s'][0][0],p['s'][1][0])])
print('桌數 %d（午、晚都沒人的空桌：%s）'%(len(tabs),[t['no'] for t,u in zip(D['sc']['noon']['tables'],D['sc']['night']['tables']) if not t['m'] and not u['m']]))
print('座位資料更新時間：',D.get('upd'))
if DRY: sys.exit(0)
new=json.dumps(D,ensure_ascii=False,separators=(',',':'))
open(sp,'w',encoding='utf-8').write(html[:i0]+new+html[i1:])
# ── 4) roster.json 新增的人 ─────────────────────────────────────
rp=os.path.join(here,'roster.json');r=json.load(open(rp,encoding='utf-8'))
for p in D['ps'][len(r):]:
    r.append({'id':len(r)+1,'name':p['n'],'unit':p['u'] or '未分類','ind':'','grp':'','lunch':0,'dinner':0,
              'title':p['t'],'role':p['t'],'company':p['c'],'job':p['o'],'rec':[]})
json.dump(r,open(rp,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('已寫入 seat.html（%d 人）與 roster.json（%d 人）。請接著執行 patch_seat.py → make_seatmap.py → sync_roster_tables.py'%(len(D['ps']),len(r)))
