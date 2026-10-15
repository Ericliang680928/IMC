#!/usr/bin/env python3
"""由 seat.html（活動排座匯出的座位查詢頁）產生 seatmap.json，供商品館下單表單
「填姓名自動帶出社別與會場桌號」使用。
座位有調整、重新匯出 seat.html 之後，請在本資料夾執行：python3 tools/make_seatmap.py
輸出格式：[{"n":姓名,"u":社別,"a":[午場狀態,桌次標示,桌名],"b":[晚宴狀態,桌次標示,桌名]}]
狀態：1＝已排座、2＝座位安排中、0＝不參加該場次。桌次標示與 seat.html 相同（有桌次→「第N桌」，沒有→桌名）。"""
import json,sys,os
here=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s=open(os.path.join(here,'seat.html'),encoding='utf-8').read()
D,_=json.JSONDecoder().raw_decode(s[s.index('const D=')+8:])
def cell(si,p):
    st,ti=p['s'][si]
    if st!=1 or ti<0: return [st,'','']
    t=D['sc'][['noon','night'][si]]['tables'][ti]
    return [1,('第%s桌'%t['no']) if t['no'] is not None else t['k'], t['k'] if t['no'] is not None else '']
out=[{'n':p['n'],'u':p.get('u',''),'a':cell(0,p),'b':cell(1,p)} for p in D['ps']]
json.dump(out,open(os.path.join(here,'seatmap.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('seatmap.json',len(out),'人，來源更新時間',D.get('upd'))
