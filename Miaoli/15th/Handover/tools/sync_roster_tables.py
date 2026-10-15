#!/usr/bin/env python3
"""依 seat.html（排座工具匯出）重新產生 roster.json 的午場／晚宴桌號（lunch／dinner），
讓「我的活動頁」(me.html) 與座位查詢頁 (seat.html) 的桌號一致。
seat.html 每次重新匯出後請執行：python3 tools/sync_roster_tables.py
規則：已排座＝桌次(t.no)；不參加＝0；座位安排中＝-1；資訊控台等無桌次席位＝0，另寫入 stn（['午場席位名','晚宴席位名']，沒有則省略）讓網頁顯示席位名稱。
roster.json 與 seat.html 以相同順序對應（第 i 位 ↔ id=i+1），姓名／社別不符會中止。"""
import json,os,sys
here=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=open(os.path.join(here,'seat.html'),encoding='utf-8').read()
D,_=json.JSONDecoder().raw_decode(s[s.index('const D=')+8:])
rp=os.path.join(here,'roster.json');r=json.load(open(rp,encoding='utf-8'))
if len(r)!=len(D['ps']): sys.exit('人數不同：roster %d、seat %d'%(len(r),len(D['ps'])))
def val(sc,p,si):
    st,ti=p['s'][si]
    if st==2: return -1
    if st!=1: return 0
    t=D['sc'][sc]['tables'][ti]
    return t['no'] if t['no'] is not None else 0
def stn(sc,p,si):
    st,ti=p['s'][si]
    if st!=1: return ''
    t=D['sc'][sc]['tables'][ti]
    return t['k'] if t['no'] is None else ''
n=0
for i,p in enumerate(D['ps']):
    x=r[i]
    uu=lambda u:'' if u in ('','未分類') else u
    if x['name']!=p['n'] or uu(x['unit'])!=uu(p['u']): sys.exit('第 %d 位姓名／社別不符：%s／%s vs %s／%s'%(i+1,x['name'],x['unit'],p['n'],p['u']))
    a,b=val('noon',p,0),val('night',p,1)
    sn=[stn(sc,p,si) for si,sc in ((0,'noon'),(1,'night'))]
    if (x['lunch'],x['dinner'],x.get('stn'))!=(a,b,(sn if any(sn) else None)): n+=1
    x['lunch'],x['dinner']=a,b
    if any(sn): x['stn']=sn
    else: x.pop('stn',None)
json.dump(r,open(rp,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('roster.json 桌號已與 seat.html 同步，更動',n,'人')
