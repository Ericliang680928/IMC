#!/usr/bin/env python3
"""seat.html 每次由排座工具重新匯出後，請執行：python3 tools/patch_seat_shuttle.py
把「高鐵接駁名單者查座位時顯示接駁提醒」補丁重新套回（可重複執行，已套用會略過）。
資料來源 shuttle.js（只有社別／姓名／車次，不含電話）；改名單請改 shuttle.js。"""
import os,sys
here=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p=os.path.join(here,'seat.html')
s=open(p,encoding='utf-8').read()
if 'SHUTTLE.find' in s:
    print('seat.html 已套用過接駁提醒，略過'); sys.exit(0)
def rep(a,b):
    global s
    if s.count(a)!=1: sys.exit('找不到唯一錨點：'+a[:60])
    s=s.replace(a,b)
# 1) 載入 shuttle.js
rep('<div class="sheet" id="sheet"><div class="sh" id="sh"></div></div>\n<script>\nconst D=',
    '<div class="sheet" id="sheet"><div class="sh" id="sh"></div></div>\n<script src="shuttle.js?v=1"></script>\n<script>\nconst D=')
# 2) 搜尋結果卡片小標籤
rep("""+'</div><div class="seats">'+seatBox(p,0)+seatBox(p,1)+'</div></button>';}""",
    """+((window.SHUTTLE&&SHUTTLE.find(p.n,p.u))?'<span style="color:#8A4B00;font-weight:700;font-size:12.5px">🚌 有登記高鐵接駁</span>':'')+'</div><div class="seats">'+seatBox(p,0)+seatBox(p,1)+'</div></button>';}""")
# 3) 點開本人座位後，最上方跳出接駁提醒
rep("""h+='<div class="tabs">'""","""h+=(window.SHUTTLE?SHUTTLE.note(SHUTTLE.find(p.n,p.u)):'');
 h+='<div class="tabs">'""")
open(p,'w',encoding='utf-8').write(s)
print('seat.html 接駁提醒補丁已套用')
