// config > passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
// 拿到user-model
const User = require("../models/user-model");
// 引入passport-local套件用於本地登入
const LocalStrategy = require("passport-local");
// bcrypt引入
const bcrypt = require("bcrypt");

// 執行下方兩個done 的時候，他就會自動執行
// 這邊就自己把serializeUser 實作出來
// 他需要一個參數，是cbFn，這個cbFn有兩個參數是user跟done，這個done 跟下方的done 是無關的
// 裡面這個user 他會帶入的值是在GoogleStrategy裡面所執行done 的時候的第二個參數(有可能是foundUser 也有可能是 savedUser)
passport.serializeUser((user, done) => {
  // Serialize是序列化的意思
  console.log("Serialize使用者。。。");
  console.log(user);
  // 這一個done 是從上面的參數來的，第一個參數是null，第二個參數就是要把某個id 存到session 裡面，要存的就是user._id
  // user._id就是foundUser 或saveUser都是在mongoDB 裡面的資料，這個資料裡面一定會有_id，也就是在mondoDB 裡面的ID
  done(null, user._id); // 將mongoDB的id，存在session
  // 並且將id簽名後，以Cookie的形式給使用者。。。使用者那邊就會有connet.id
});

// deserializeUser功能
passport.deserializeUser(async (_id, done) => {
  console.log(
    "Deserialize使用者。。。使用serializeUser儲存的id，去找到資料庫內的資料"
  );
  // 自動找到serializeUser 裡面所儲存的id
  let foundUser = await User.findOne({ _id });
  // 將req.user這個屬性(done()的第二個參數)設定為foundUser
  // 上面用findOne 所找到的使用者的資訊就可以被存到foundUser，然後取代下面的req.user這個屬性
  done(null, foundUser);
});

// 把google strategy 放到這裡面
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // 如果所有的驗證都完成了，
      // passport 會自動把clientID跟clientSecret去做OAuth，
      // 經過一連串的交換訊息後，最後就會拿到他的token
      // 以及與使用者相關的profile 的資訊，然後就會重新導向到這個url
      callbackURL: "http://localhost:8080/auth/google/redirect",
    },
    //這一個Fn 可以是一般Fn，也可以是箭頭函式，這裡用箭頭函式，因為給他一個名字沒意義
    // 做成非同步函式
    async (accessToken, refreshToken, profile, done) => {
      // 在這裡就可以選擇註冊使用者，如果是第一次登入系統的話
      console.log("進入Google Strategy的區域");
      // console.log(profile);
      // 下方的邏輯是，如果有註冊過使用者的話，就不用存進資料庫
      // 第一次註冊系統的使用者都要把資料存進去
      // console.log("======================");
      // 在做User.findOne 要找到的這個人我們要用的是他的ID，他的ID會在profile裡面的id 屬性，就把它直接拿來用就好
      // 根據profile.id去找有沒有googleID剛好符合profile.id的這個人
      // 這個foundUser 可能會有兩種結果，一個是null
      let foundUser = await User.findOne({ googleID: profile.id }).exec();
      if (foundUser) {
        console.log("使用者已經註冊過了。無須存入資料庫內。");
        done(null, foundUser);
      } else {
        console.log("偵測到新用戶。須將資料存入資料庫內");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          // 這個photo 本身是一個array，所以要去找到這個array 的第一個物件，也就是index[0]的位置，他有一個屬性是.value
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value,
        });
        // save()就會return 一個promise，然後存到saveUser 裡面
        let savedUser = await newUser.save();
        console.log("成功創建新用戶。");
        // 第一個參數是null，這是passport 規定的，第二個參數就可以把成功儲存的使用者貼過來
        done(null, savedUser);
      }
    }
  )
);

// ++本地登入的程式碼

passport.use(
  // 使用LocalStrategy，裡面為一個參數就是FN，這裡用箭頭函式
  // new LocalStrategy裡面的cbFn 要怎麼寫這是passport 留給我們自己去做的事情
  new LocalStrategy(async (username, password, done) => {
    // 上方有const User 了，所以這裡就用e-mail去找到資料庫裏面的username
    let foundUser = await User.findOne({ email: username });
    // 如果有找到使用者的話，再來驗證他給的密碼是不是有正確
    if (foundUser) {
      // 如果有找到使用者，就要做bcrypt
      // 比較明文密碼，與findUser找到的.password
      let result = await bcrypt.compare(password, foundUser.password);
      // 如果result 是true，就可以告訴localStrategy他登入成功了，就可以執行done
      if (result) {
        // 這個done 執行null,foundUser 的話，就會把foundUser帶到上面的passport.serializeUser裡面儲存他的id
        // 所以這裡也會執行serializeUser 跟 deserializeUser 的部分
        done(null, foundUser);
        // 如果密碼比對不正確
      } else {
        done(null, false);
      }
      // 如果沒有找到就要告訴passport 說是帳號或是密碼不正確
      //  告訴的方式就是執行done，這個done 是從第三個參數來的
      // 在done裡面設定第二個參數是false就代表沒有被LocalStrategy 驗證成功
    } else {
      done(null, false);
    }
  })
);
