# 苗栗IMC 第14、15屆社長交接暨理監事就職典禮 活動網頁

2026/10/17（六）千八會館・竹南婚宴餐廳

- index.html 活動主頁（即時流程）
- seat.html 座位查詢（活動排座匯出）
- shuttle.js 友社貴賓高鐵接駁名單（只有社別／姓名／車次，不含電話）；活動主頁「完整流程」與接駁卡片的「查看接送名單」視窗、座位查詢頁／商品館「找到您了」的接駁提醒都讀這個檔。；名單內姓名可點，會用 roster.json 顯示該位的午場／晚宴桌次、同桌賓客與座位圖連結（seat.html?p=名冊id-1）
- 商品館冷藏／冷凍：商品設定 `temp:'冷藏'`（頁面內商品）；後台上架的商品在名稱或介紹加「【冷藏】」「【冷凍】」即自動識別。購物車會把常溫與低溫商品拆成兩張訂單分開送出，低溫單的訂單編號尾碼加 `-C`，後台訂單品項會標 ❄冷藏／冷凍
- seatmap.json 商品館「填姓名自動帶出社別／桌號」用的名單；seat.html 每次重新匯出後，執行 `python3 tools/make_seatmap.py` 重新產生
- me.html 我的活動頁（手機）
- wish.html 商務交流許願牆
- shop.html 社友商品館
- sponsors.html 年會贊助資訊（特刊廣告＋贊助感謝名單）
- admin.html 承辦後台（勿公開）：兩種通關碼——管理者（全功能，含刪除訂單、改訂單狀態、看訂購者電話地址）／上架者（只能登錄、上下架商品與 EDM；訂單僅供檢視，電話地址遮蔽，無法刪除或改狀態）。碼設在 admin.html 開頭的 `ADMIN`、`LISTER`；僅前端限制，真正的刪除保護見 tools/admin_lock.sql
- roster.json 的午場／晚宴桌號（me.html「我的活動頁」用）要與 seat.html 一致：seat.html 重新匯出後，除了 `make_seatmap.py`，也要執行 `python3 tools/sync_roster_tables.py`
- tabbar.js 手機版底部分頁列（主頁／我的／找人／交流／商品）：index、shop、wish、sponsors、seat 在手機（寬度 720px 以下）自動顯示，me.html 自帶同一排（外觀與圖示共用 tabbar.js）；新增頁面時在 </body> 前加 `<script src="tabbar.js?v=2"></script>`；seat.html 重新匯出後 patch_seat.py 會自動補回
- **排座工具改存「專案檔」（.seat.json）時**，先執行 `python3 tools/import_seatjson.py <檔案.seat.json> [--dry]`（加 --dry 只看差異不寫檔）：既有名單順序與編號不動、只更新座位與桌位，新增的人接在名單最後（roster.json 同步新增），再接著跑下面三步。
- **seat.html 每次從排座工具重新匯出後**，依序執行（缺一不可）：`python3 tools/patch_seat.py`（把導覽列、語言切換鈕、接駁提醒、AI 免責字樣等補丁套回；可重複執行）→ `python3 tools/make_seatmap.py` → `python3 tools/sync_roster_tables.py`
- **日文版（所有頁面除 admin.html）**：頁面原文維持中文，右上角「日本語／中文」鈕切換（網址加 `?lang=ja` 或 `?lang=zh` 可直接指定；第一次來且瀏覽器語言為日文時預設日文，選擇會記在瀏覽器）。做法是執行時把畫面上的中文文字依字典換成日文，頁面重新產生內容時也會即時換，切回中文會還原。
  - `i18n.js` 切換引擎（各頁 `<head>` 內載入；日文模式才會載入下列字典）
  - `i18n-ja.js` 共用詞彙＋活動主頁／接駁／商品館／許願牆；`i18n-ja-ui.js` 我的活動頁／座位查詢；`i18n-ja-sponsors.js` 贊助頁；`i18n-ja-data.js` 社團職稱、公司職稱、產業別、桌名、配對理由、營業項目；`i18n-ja-intro.js` 公司簡介
  - 新增或修改中文文字後，若日文模式沒翻到，就在對應字典補一條（`ex` 為整句對照，`rx` 為含數字的句型）；姓名、社名、公司名、社友自己輸入的內容不翻
  - 日文為 AI 翻譯，建議請日文母語者校閱；會場平面圖圖片內的文字無法翻譯
