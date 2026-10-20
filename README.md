# 分數配對實驗室 Fraction Pair Lab

以翻牌配對為核心的 Phaser 遊戲式學習遊戲，將卡牌記憶轉化為分數概念的比較與提取。

## 線上遊玩

[開啟 GitHub Pages 遊戲](https://sean9112.github.io/fraction-pair-lab/)

## 三個學習關卡

| 關卡 | 配對方式 | 學習目標 |
| --- | --- | --- |
| 看見分數 | 分數與等分圖形 | 理解分子與分母 |
| 等值分數 | 分數與另一種等分圖形 | 理解同乘相同數，份量不變 |
| 連結小數 | 分數圖形與小數 | 連結分數與除法 |

每關四對牌。點擊兩張代表相同份量的卡牌即可配對。配錯會顯示通分說明，閱讀後按「繼續配對」。提示可以暫時揭開全部卡牌，收起後再繼續。遊戲不限時、不扣生命，完成三關後有三題概念挑戰。

支援滑鼠、觸控、Tab 與 Enter 鍵盤翻牌、全螢幕與 iframe 內嵌。牌號按鈕提供卡牌狀態的文字標籤，回饋使用即時報讀區域。進度與回答僅保留在當前頁面記憶體，重新整理會重設。

## 本機開啟

在專案資料夾執行 `python3 -m http.server 8020`，再用瀏覽器開啟 `http://127.0.0.1:8020/`。

無需 npm 或編譯。Phaser 3.90.0 隨專案提供，Bootstrap 5.3.8 透過 CDN 引入，自訂樣式保留主要畫面與操作。

## 網頁內嵌

iframe 指向 `https://sean9112.github.io/fraction-pair-lab/?embedded=1` 並設定 `allowfullscreen`。內嵌模式隱藏介紹與主導覽，保留遊戲與學習回饋。建議給予至少 760px 高度，可在 iframe 內捲動閱讀。

## 部署

GitHub Pages 使用 `main` 分支的根目錄，推送更新後由 GitHub 自動重新發佈。`.nojekyll` 表示直接提供靜態檔案。

## 檔案與來源

* `index.html` 頁面與學習說明
* `game.js` Phaser 畫面、分數判等、關卡流程與概念挑戰
* `styles.css` 響應式版型與內嵌模式
* `vendor/phaser.min.js` Phaser 3.90.0，MIT 授權見同資料夾授權檔

機制靈感來自 [Phaser Examples 的 Card Memory](https://github.com/phaserjs/examples/tree/master/public/src/games/card%20memory)。本遊戲程式、數學內容與圖形為重新製作，沒有複製該範例的美術資產，也不是官方原版。

適合已接觸基本分數概念的學習者。此原型協助練習與討論，三題挑戰並非標準化學習成效測驗。
