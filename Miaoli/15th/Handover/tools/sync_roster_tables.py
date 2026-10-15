#!/usr/bin/env python3
"""依 seat.html（排座工具匯出）重新產生 roster.json 的午場／晚宴桌號（lunch／dinner），
讓「我的活動頁」(me.html) 與座位查詢頁 (seat.html) 的桌號一致。
seat.html 每次重新匯出後請執行：python3 tools/sync_roster_tables.py
規則：已排座＝桌次(t.no)；不參加＝0；座位安排中＝-1；資訊控台（無桌次）＝0。
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
n=0
for i,p in enumerate(D['ps']):
    x=r[i]
    uu=lambda u:'' if u in ('','未分類') else u
    if x['name']!=p['n'] or uu(x['unit'])!=uu(p['u']): sys.exit('第 %d 位姓名／社別不符：%s／%s vs %s／%s'%(i+1,x['name'],x['unit'],p['n'],p['u']))
    a,b=val('noon',p,0),val('night',p,1)
    if (x['lunch'],x['dinner'])!=(a,b): n+=1
    x['lunch'],x['dinner']=a,b
json.dump(r,open(rp,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('roster.json 桌號已與 seat.html 同步，更動',n,'人')
