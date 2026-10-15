# 苗栗IMC 第14、15屆社長交接暨理監事就職典禮 活動網頁

2026/10/17（六）千八會館・竹南婚宴餐廳

- index.html 活動主頁（即時流程）
- seat.html 座位查詢（活動排座匯出）
- shuttle.js 友社貴賓高鐵接駁名單（只有社別／姓名／車次，不含電話）；活動主頁「完整流程」與接駁卡片的「查看接送名單」視窗、座位查詢頁／商品館「找到您了」的接駁提醒都讀這個檔。座位頁（seat.html）每次重新匯出後，除了 `make_seatmap.py` 之外也要再執行 `python3 tools/patch_seat_shuttle.py`，把接駁提醒補丁套回
- 商品館冷藏／冷凍：商品設定 `temp:'冷藏'`（頁面內商品）；後台上架的商品在名稱或介紹加「【冷藏】」「【冷凍】」即自動識別。購物車會把常溫與低溫商品拆成兩張訂單分開送出，低溫單的訂單編號尾碼加 `-C`，後台訂單品項會標 ❄冷藏／冷凍
- seatmap.json 商品館「填姓名自動帶出社別／桌號」用的名單；seat.html 每次重新匯出後，執行 `python3 tools/make_seatmap.py` 重新產生
- me.html 我的活動頁（手機）
- wish.html 商務交流許願牆
- shop.html 社友商品館
- sponsors.html 年會贊助資訊（特刊廣告＋贊助感謝名單）
- admin.html 承辦後台（勿公開）
- roster.json 的午場／晚宴桌號（me.html「我的活動頁」用）要與 seat.html 一致：seat.html 重新匯出後，除了 `make_seatmap.py`，也要執行 `python3 tools/sync_roster_tables.py`
