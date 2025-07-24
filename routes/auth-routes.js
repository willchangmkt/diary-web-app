// routes >auth-routes.js

// const express = require("express");
// const router = express.Router();
// 由上面兩行簡寫化一行
const router = require("express").Router();
const passport = require("passport");
// 拿到models 裡面的user-model
const User = require("../models/user-model");
// 拿到bcrypt套件
const bcrypt = require("bcrypt");


//登入route
//指的是nav bar裡面的/auth/login
router.get("/login", (req, res) => {
  // render views 裡面的 login.ejs
  //  { user: req.user }
  // 將 req.user 傳給樣板中的 user 變數
  return res.render("login", { user: req.user });
});

//登出route
// 登出功能
router.get("/logout", (req, res) => {
  // return .logOut() 裡面要一個cbFn，這裡就寫箭頭函式
  req.logOut((err) => {
    // 這裡也可以不處理err，寫next(err)
    if (err) return res.send(err);
    // 如果沒有錯誤就重新導向到首頁
    return res.redirect("/");
  });
});

//註冊route
// 註冊本地會員的功能
router.get("/signup", (req, res) => {
  // 同樣要讓他知道使用者的狀態，所以要填{ user: req.user }
  return res.render("signup", { user: req.user });
});

//get Google驗證後的個人資料
// 處理按下google 登入按鈕的route(按下之後顯示google 的登入頁面)
// 如果GET 到 /google 的route 的話，就要直接執行後面的passport.authenticate
// 要直接執行passport.authenticate是因為他本身是一個middleware
router.get(
  "/google",
  // passport.authenticate 就是require("passport")之後所得到的物件
  // 然後執行authenticate()的method
  // 參數1 就是告訴她要用google 的authenticate(認證)
  // 參數2 要給物件，要先設定一個scope屬性，設定要放什麼樣的資料(要從google server 拿什麼資料)
  // profile 是拿到個人資料
  passport.authenticate("google", {
    scope: ["profile", "email"],
    // 讓使用者每次到網站都可以選擇要用哪一個帳號登入
    prompt: "select_account",
  })
);

//送出註冊資料，如果資料有誤，會有Flash彈窗
router.post("/signup", async (req, res) => {
  // 如果有人要註冊的話，就是從req.body拿到這些資訊
  let { name, email, password } = req.body;
  // 告訴使用者密碼長度過短，避免使用者是用POSTman 之類的發送請求
  // 這裡就要用connect flash 套件
  if (password.length < 8) {
    // 這裡設定error_msg的值就要等於後面的部分
    req.flash("error_msg", "密碼長度過短，至少需要8個數字或英文字。");
    // 如果有錯誤就重新導回
    return res.redirect("/auth/signup");
  }


  // 確認信箱是否被註冊過
  // 用從上面的req.body拿到的信箱確認是否有人用過
  const foundEmail = await User.findOne({ email }).exec();
  if (foundEmail) {
    req.flash(
      "error_msg",
      "信箱已經被註冊。請使用另一個信箱，或者嘗試使用此信箱登入系統"
    );
    return res.redirect("/auth/signup");
  }

  // 如果信箱沒有被註冊過的話 我們要儲存使用者
  // 儲存的第一件事是要把上面"/signup"的password 做hash 所以要npm install bcrypt
  // hash() 第一個參數就是req.body拿到的還沒被加密的密碼，第二個是saltRound
  let hashedPassword = await bcrypt.hash(password, 12);
  let newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  req.flash("success_msg", "恭喜註冊成功! 現在可以登入系統了!");
  return res.redirect("/auth/login");
});

//本地驗證，輸入帳號密碼
// 製作本地端登入
// 在/login 的後面使用passport.authenticate的middleware
router.post(
  "/login",
  // local string 的後面要再加上一個物件
  passport.authenticate("local", {
    // +這個屬性所相對應到的值，代表如果登入失敗要導向哪裡
    failureRedirect: "/auth/login",
    // +驗證失敗時給的message，這一個值會套在index.js 裡面的res.locals.error = req.flash("error");
    failureFlash: "登入失敗。帳號或密碼不正確。",
  }),
  // +如果登入成功的話，重新導向到profile
  (req, res) => {
    return res.redirect("/profile");
  }
);

//要先做這一個"/google/redirect"的route才能看到access token 跟 protected resource
//要使用 passport.authenticate("google") 這一個middleware 是因為 "/google/redirect" 是要在你已經通過驗證之後才能拿到的route
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  console.log("進入redirect區域");
  //重新導向"/profile"這一個route，這個route 還不存在 但先不去管它，反正現在只是為了先handle "/google/redirect"這個route就可以了
  return res.redirect("/profile");
});

//導出這個檔案讓index.js 可以使用
module.exports = router;
