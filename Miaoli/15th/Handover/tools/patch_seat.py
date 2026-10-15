#!/usr/bin/env python3
"""seat.html 每次由排座工具重新匯出後，請執行：python3 tools/patch_seat.py
把網站需要的補丁一次套回（可重複執行；已套用的項目會自動略過）：
  1) 活動網站導覽列（sitebar：我的活動頁／活動主頁／商務許願／社友商品館）
  2) 「產業別、建議交流名單由 AI 判斷，可能有誤」的說明文字
  3) 高鐵接駁提醒（資料來源 shuttle.js；改名單請改 shuttle.js）
  4) 中文／日本語 切換（載入 i18n.js、導覽列放切換鈕）
  5) 手機版底部分頁列（載入 tabbar.js）
  （另有 4b 手機橫向溢出修正、4c 個人頁避開導覽列）
排座工具重新匯出會把以上全部洗掉，所以匯出後一定要跑這支，再跑 make_seatmap.py、sync_roster_tables.py。"""
import os,sys
here=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p=os.path.join(here,'seat.html')
s=open(p,encoding='utf-8').read()
done=[]
def rep(a,b,name,optional=False):
    global s
    n=s.count(a)
    if n!=1:
        if optional: return False
        sys.exit('找不到唯一錨點（%s）：%s'%(name,a[:70]))
    s=s.replace(a,b); done.append(name); return True

# 1) 導覽列 -----------------------------------------------------------
SITEBAR=('<div id="sitebar" style="position:sticky;top:0;z-index:50;background:#2B1D0Af2;border-bottom:2px solid #C9A24A;padding:0 14px">'
 '<div style="max-width:720px;margin:0 auto;display:flex;align-items:center;gap:6px;height:48px;overflow-x:auto;white-space:nowrap">'
 '<a href="me.html" style="color:#F8E7B8;text-decoration:none;font-weight:700;padding:8px 10px">‹ 我的活動頁</a>'
 '<a href="index.html" style="color:#F3D58A;text-decoration:none;padding:8px 10px">活動主頁</a>'
 '<a href="wish.html" style="color:#F3D58A;text-decoration:none;padding:8px 10px">商務許願</a>'
 '<a href="shop.html" style="color:#F3D58A;text-decoration:none;padding:8px 10px">社友商品館</a>'
 '<span data-lang-slot style="position:sticky;right:0;margin-left:auto;display:inline-flex;background:#2B1D0A;padding-left:6px"></span>'
 '</div></div>\n')
if 'id="sitebar"' not in s:
    rep('</style></head><body>\n','</style></head><body>\n'+SITEBAR,'導覽列')
elif 'data-lang-slot' not in s:
    rep('>社友商品館</a></div></div>','>社友商品館</a><span data-lang-slot style="position:sticky;right:0;margin-left:auto;display:inline-flex;background:#2B1D0A;padding-left:6px"></span></div></div>','導覽列語言鈕位置')

# 2) AI 判斷說明 ------------------------------------------------------
OLD='產業別與建議交流名單僅供參考：產業別依公司營業項目推估，約半數依公司名稱推估，部分社友可能被歸錯類，仍待社務人員審閱確認。'
NEW='產業別與建議交流名單由 AI 依公司名稱判斷，可能有誤，請見諒。'
if OLD in s: rep(OLD,NEW,'AI 判斷說明（建議名單）',True)
TAG="+esc(D.ind[p.a]||'')+'</span></div>':'');"
TAG2="+esc(D.ind[p.a]||'')+'</span><div style=\"font-size:11.5px;color:var(--ink2);margin-top:4px\">由 AI 依公司名稱判斷，可能有誤，請見諒。</div></div>':'');"
if TAG2 not in s: rep(TAG,TAG2,'AI 判斷說明（產業別）',True)

# 2b) 建議交流名單可帶自訂理由（r 的第 3 欄；沒有則用產業互補預設文字） --------------
WHY_OLD="<div class=\"why\">'+esc(recWhy(p,q))+'</div>"
WHY_NEW="<div class=\"why\">'+esc(r[2]||recWhy(p,q))+'</div>"
if WHY_NEW not in s: rep(WHY_OLD,WHY_NEW,'建議名單自訂理由',True)

# 3) 高鐵接駁提醒 -----------------------------------------------------
if 'SHUTTLE.find' not in s:
    rep('<div class="sheet" id="sheet"><div class="sh" id="sh"></div></div>\n<script>\nconst D=',
        '<div class="sheet" id="sheet"><div class="sh" id="sh"></div></div>\n<script src="shuttle.js?v=3"></script>\n<script>\nconst D=','接駁：載入 shuttle.js')
    rep("""+'</div><div class="seats">'+seatBox(p,0)+seatBox(p,1)+'</div></button>';}""",
        """+((window.SHUTTLE&&SHUTTLE.find(p.n,p.u))?'<span style="color:#8A4B00;font-weight:700;font-size:12.5px">🚌 有登記高鐵接駁</span>':'')+'</div><div class="seats">'+seatBox(p,0)+seatBox(p,1)+'</div></button>';}""",'接駁：卡片標籤')
    rep("""h+='<div class="tabs">'""","""h+=(window.SHUTTLE?SHUTTLE.note(SHUTTLE.find(p.n,p.u)):'');
 h+='<div class="tabs">'""",'接駁：本人提醒')

# 4) 日文切換 ---------------------------------------------------------
if 'i18n.js' not in s:
    rep('<title>座位查詢｜苗栗IMC 第15屆</title>\n','<title>座位查詢｜苗栗IMC 第15屆</title>\n<script src="i18n.js?v=12"></script>\n','日文切換：載入 i18n.js')

# 4b) 手機版橫向溢出修正：標題光暈（.hero::before 寬 520px）會把頁面撐寬，手機上整頁被縮小 ---------
WRAP_OLD=".wrap{max-width:720px;margin:0 auto;padding:max(18px,env(safe-area-inset-top)) 16px 40px}"
WRAP_NEW=".wrap{max-width:720px;margin:0 auto;padding:max(18px,env(safe-area-inset-top)) 16px 40px;overflow-x:hidden;overflow-x:clip}"
if WRAP_NEW not in s: rep(WRAP_OLD,WRAP_NEW,'手機橫向溢出修正',True)

# 4c) 個人頁（.sheet，層級 20）會被頂端導覽列（sitebar，層級 50）蓋住左上角「‹ 返回」鍵：讓個人頁從導覽列下方開始 ---------
SH_OLD=".sheet{position:fixed;inset:0;z-index:20;"
SH_NEW=".sheet{position:fixed;inset:50px 0 0 0;z-index:20;"
if SH_NEW not in s: rep(SH_OLD,SH_NEW,'個人頁避開導覽列',True)

# 5) 手機版底部分頁列（tabbar.js） ------------------------------------
if 'tabbar.js' not in s:
    rep('</script></body></html>','</script><script src="tabbar.js?v=2"></script></body></html>','手機底部分頁列')

open(p,'w',encoding='utf-8').write(s)
print('已套用：'+('、'.join(done) if done else '（全部已套用過，無變更）'))
