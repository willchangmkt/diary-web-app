
# Diary Website — 個人日記網站 Side Project

# 作品說明
這是一個日記網站的 Side Project
提供使用者記錄每天的生活、心情與想法。
支援本地帳號註冊/登入，或透過 Google OAuth 快速登入。
具備日記新增、編輯、刪除功能，並支援 RWD 響應式手機版操作。

## 功能
* 畫面左上角的圖示可回到首頁。
* 會員登入 - 本地登入或Google登入。
* 註冊會員 - 本地註冊，需要使用者的名稱、Email及密碼，成功註冊後導向登入頁面。
* 我的日記 - 登入後的個人頁面和已撰寫日記，並可進行日記修改和刪除。
* 寫新日記 - 張貼新的日記，可撰寫標題、日記日期、心情、天氣、日記內容，並自動帶入發布日期。
* 手機 RWD - 具備響應式設計（RWD）功能，方便在手機或小尺寸螢幕上流暢使用網站。

## 畫面說明
![DiaryWebsite1](https://i.meee.com.tw/ODeCFgv.jpg)
![DiaryWebsite2](https://i.meee.com.tw/qQh6w0U.jpg)
![DiaryWebsite3](https://i.meee.com.tw/Y0ws8QL.jpg)
![DiaryWebsite4](https://i.meee.com.tw/3BM03p9.jpg)

## 操作功能影片
[![IMAGE ALT TEXT HERE](https://meee.com.tw/rwwTAJg)](https://www.youtube.com/watch?v=6SwG60dgsgs)

## 安裝
- Node.js 版本建議為: v20.12.0 以上
- MongoDB 版本建議為: v7.0.9 以上
- Mongosh 版本建議為: v1.10.6 以上

### 安裝套件
npm install
- bcrypt@5.1.1
- connect-flash@0.1.1
- dotenv@16.4.5
- ejs@3.1.10
- express@4.19.2
- express-session@1.18.0
- method-override@3.0.0
- mongoose@8.4.4
- passport@0.7.0
- passport-google-oauth20@2.0.0
- passport-local@1.0.0
- session@0.1.0

### 環境變數設定
請在終端機輸入 `cp .env.example .env` 來複製 .env.example 檔案，並依據 `.env` 內容調整相關欄位。

### 運行專案
1. 確保您已安裝 Node.js
2. 在終端機中導航到專案目錄
3. 運行以下命令啟動應用程序: node index.js
4. 應用程序將開始運行。

### 開啟專案
專案運行後，在瀏覽器輸入以下網址，即可看到畫面。
http://localhost:8080/

### 環境變數說明

```env
GOOGLE_CLIENT_ID= #Google用戶端編號
GOOGLE_CLIENT_SECRET= #用戶端密鑰
SESSION_SECRET= #自定義session secret
```

### 資料夾說明
- config - 帳號驗證放置處
- models - 資料庫放置處
- modules - 模組放置處
- public - 靜態資源放置處
  - img - svg圖片放置處
  - js - 日期格式放置處
- routes - 網頁路徑放置處
- views - 畫面放置處

### 專案技術
- Node.js v20.12.0
- Bootstrap v5.3.3
- font-awesome v6.5.2

### 第三方服務
 - Google Cloud Platform（OAuth 2.0 驗證）

## 聯絡作者
您可以透過以下的方式與我聯繫，
我的信箱: yuan625@gmail.com
