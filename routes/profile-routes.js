// routes > profile-routes.js

const router = require("express").Router();
// 引入post 模板
const Post = require("../models/post-model");

//格式化mongoDB日期的函式
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

//isAuthenticated() 是如果有執行passport.serializeUser()就會設定設定req.isAuthenticated()為true
const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    // 沒有登入過的話重新導向到"/auth/login"
    return res.redirect("/auth/login");
  }
};


//在profile頁面get所post的日記(find日記)
router.get("/", authCheck, async (req, res) => {
  try {
    // 這裡拿到的格式是Mongoose 文件
    let postFound = await Post.find({ author: req.user._id });

    // 重新格式化每個日記
    // 把每一筆從資料庫拿到的 Mongoose 文件（post），轉換成乾淨的 JavaScript 物件，
    // 並額外加上一個格式化日期的欄位，組成一個新的陣列 formattedPosts。
    const formattedPosts = postFound.map((post) => ({
      ...post.toObject(),
      formattedDate: formatDate(post.date),
    }));

    // 這裡把從伺服器拿到的日記資料丟到對應的 profile.ejs中渲染成 HTML
    // 並把 user、posts 傳進去
    return res.render("profile", {
      user: req.user,
      posts: formattedPosts,
    }); //deSerializeUser()
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).render("error", { message: "無法獲取數據" });
  }
});

// 製作post貼文功能的route
// 這一個route 也要做authCheck
router.get("/post", authCheck, (req, res) => {
  // render post.ejs
  return res.render("post", { user: req.user });
});

// 提交post的route
router.post("/post", authCheck, async (req, res) => {
  // 確認post.ejs裡面input 的name的值 {title, content}
  let { title, mood, day, weather, content } = req.body;
  // 製作新的post，並記錄這個post 的作者是誰，因為我們有登入，所以就可以知道目前登入的人是誰
  // 所以id 的值就可以拿來當作author 的string，把他在mongoDB 裡面的id拿來用
  let newPost = new Post({
    title,
    day,
    mood,
    weather,
    content,
    author: req.user._id,
  });
  try {
    await newPost.save();
    // 如果貼文成功就要導向/profile，且要顯示出貼文
    return res.redirect("/profile");
  } catch (e) {
    // 在post-model，標題跟內容都是required true
    req.flash("error_msg", "標題與內容都需要填寫。");
    // 重新導回post 的route
    return res.redirect("/profile/post");
  }
});

// 修改日記頁面：取得單筆日記並渲染 update 頁面
router.get("/:_id/update", authCheck, async (req, res) => {
  // 從網址中取得日記 ID
  let { _id } = req.params;

  try {
    // 根據 ID 從資料庫中查找日記
    let foundPost = await Post.findOne({ _id }).exec();

    // 若找到日記，渲染 update 頁面並傳入日記與使用者資訊
    if (foundPost != null) {
      return res.render("update", { foundPost, user: req.user });
    } else {
      // 找不到資料，回傳錯誤
      return res.status(400).send("Post not found");
    }
  } catch (e) {
    // 查詢失敗，回傳錯誤訊息
    return res.status(400).send(e);
  }
});

// 成功修改日記：接收 PATCH 請求並更新資料
router.patch("/:_id", authCheck, async (req, res) => {
  try {
    // 從網址參數中取得日記 ID
    let { _id } = req.params;

    // 更新日記資料（回傳更新後的結果）
    // 使用 Mongoose 的 findByIdAndUpdate
    let updatedPost = await Post.findByIdAndUpdate(_id, req.body, {
      new: true, // 回傳新的資料
      runValidators: true, // 執行欄位驗證
    });

    // 若找不到該筆日記，回傳 404
    if (!updatedPost) {
      return res.status(404).send("找不到該日記");
    }

    // 更新成功，渲染成功畫面
    return res.render("update-success", {
      user: req.user,
    });
  } catch (e) {
    // 若發生錯誤，回傳錯誤訊息
    return res.status(400).send(e.message);
  }
});

// 確認刪除日記頁面：顯示刪除前確認畫面
router.get("/:_id/deleteCheck", authCheck, async (req, res) => {
  console.log("資料刪除確認");

  // 從網址中取得日記 ID
  let { _id } = req.params;

  try {
    // 從資料庫找出這筆日記
    let deletePost = await Post.findOne({ _id }).exec();

    // 若找到該筆日記，渲染刪除確認頁面
    if (deletePost != null) {
      return res.render("delete-check", {
        deletePost,
        user: req.user,
      });
    } else {
      // 若找不到該筆資料，轉向錯誤頁面
      return res.status(400).render("error-page");
    }
  } catch (e) {
    // 發生錯誤也轉向錯誤頁面
    return res.status(400).render("error-page");
  }
});

// 刪除日記：根據 _id 從資料庫移除日記紀錄
router.delete("/:_id/delete", authCheck, async (req, res) => {
  console.log("正在刪除資料");

  // 從網址參數取得日記 ID
  let { _id } = req.params;

  try {
    // 執行刪除操作，使用 Mongoose 的 deleteOne() 方法來刪除指定 _id 的資料
    let deleteResult = await Post.deleteOne({ _id }).exec();

    // 渲染刪除成功頁面，傳入刪除結果與使用者資料
    return res.render("delete-success", {
      deleteResult,
      user: req.user,
    });
  } catch (e) {
    // 若發生錯誤，回傳 500 並顯示錯誤訊息
    return res.status(500).send(e.message);
  }
});

module.exports = router;
