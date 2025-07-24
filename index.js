// index.js

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const methodOverride = require("method-override");
const app = express();
const mongoose = require("mongoose");
//導入/routes/auth-routes檔案
const authRoutes = require("./routes/auth-routes");
// 導入./routes/profile-routes檔案
const profileRoutes = require("./routes/profile-routes");
// 執行在passport.js文件裡面所寫的程式碼
// 之前有學過只要require 的話就會自動執行這裡面的程式碼
require("./config/passport");
const session = require("express-session");
const passport = require("passport");
// +導入connect-flash套件
const flash = require("connect-flash");


// 連結MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/GoogleDB")
  .then(() => {
    console.log("Connecting to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

// 設定Middlewares以及排版引擎
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
// 讓passport 運行認證功能
app.use(passport.initialize());
// 上面設定好了session 之後，讓passport 可以設定session
app.use(passport.session());
// +使用connect-flash 套件
app.use(flash());

// +設定一個middleware
app.use((req, res, next) => {
  // +locals 是res 裡面的一個屬性
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  // 把控制權往下交
  next();
});
// Express 靜態資源的設置，少了這行無法載入public 資源
app.use(express.static("public"));
// 讓表單可以用 POST 偽裝成 PUT 或 DELETE 方法
app.use(methodOverride("_method"));

//設定routes
//在到下方的/之前，先經過middleware
//只要任何跟/auth有關的route都要使用authRoutes
app.use("/auth", authRoutes);
// 所有跟profile 有關的都要經過這裡
app.use("/profile", profileRoutes);

//render 資源包裡面的index.ejs
app.get("/", (req, res) => {
  // ++這裡也要寫有一個user 的屬性是.user
  return res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
