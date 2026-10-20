# 玩中學 · 遊戲式學習機制實驗室

[開啟 GitHub Pages 網站](https://sean9112.github.io/fraction-pair-lab/)

保留原本單頁式遊戲式學習介紹網站與十種遊戲機制，只將第一項記憶配對替換成「分數配對實驗室」學習遊戲。其餘九項保留 Phaser Examples 官方範例。

## 十種機制與遊戲

| 機制 | 遊戲 |
| --- | --- |
| 記憶配對 | 分數配對實驗室，學習改編 |
| 視覺配對 | Emoji Match |
| 滑塊排序 | Sliding Puzzle |
| 路徑規劃 | Snake |
| 區域擴展 | Flood Fill |
| 線索推理 | Minesweeper |
| 反彈與角度 | Breakout |
| 跳躍收集 | First Game |
| 限時點擊 | Coin Clicker |
| 精準堆疊 | Stacker |

每個遊戲都直接內嵌在介紹頁面，提供重新載入、全螢幕與獨立開啟。官方範例另附原始碼與中文操作提示。網站使用 Bootstrap CDN、固定導覽列、捲軸佔位空間與左側內距補償。

## 替換的學習遊戲

[獨立開啟分數配對實驗室](https://sean9112.github.io/fraction-pair-lab/games/fraction/)

以翻牌比較圖形分數、等值分數與小數，共三關，每關四對卡牌。提供提示、配錯時的通分解釋與三題概念挑戰，不限時、不扣生命。支援滑鼠、觸控與牌號按鈕鍵盤操作。進度僅保留在當前頁面中。

## 本機開啟與部署

在本專案資料夾執行 `python3 -m http.server 8020`，瀏覽 `http://127.0.0.1:8020/`。無需 npm 或編譯，也不依賴電腦上其他資料夾。

GitHub Pages 使用 `main` 分支的根目錄，推送後自動重新發佈。

## 檔案與來源

* `index.html` 原本十種機制的單頁介紹
* `styles.css` 與 `app.js` 原版型與內嵌操作
* `games/fraction/` 替換的分數學習遊戲
* `player.html` 與 `player.js` 官方範例載入與相容處理
* `official/` 從 Phaser Examples 擷取的九款遊戲原始碼、必要素材與拼圖相容引擎
* `vendor/` 分數遊戲使用的 Phaser 3.90.0 與 MIT 授權

官方範例來自 [phaserjs/examples](https://github.com/phaserjs/examples)，下載版本為 `68140eca`。官方程式碼採 MIT 授權，素材有另外的限制，不可用於商業遊戲或帶廣告的遊戲，詳見 `official/UPSTREAM-README.md`。保留素材附帶的授權檔。本網站供機制展示與學習用途。

分數遊戲以 Card Memory 的翻牌機制為靈感重新製作，數學內容與圖形沒有使用該範例的美術資產。其餘遊戲保留原始玩法。遊戲表現不等同學習成效，請搭配解釋與討論。
