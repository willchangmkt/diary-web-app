// models >user-model.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 每一個user 都有自己的名稱，是一個string，設定最大長度與最小長度
  // name 也是唯一一個required 的值
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  // 如果是本地端登入就不會有google ID
  googleID: {
    type: String,
  },
  // Date 會自動處理，因為有Date.now，可以不用去管它
  date: {
    type: Date,
    default: Date.now,
  },
  //圖片，只有在google 登入的人會有圖片，如果是本地登入的就不會有
  thumbnail: {
    type: String,
  },
  // local login
  // 如果是用本地端登入的話就一定要拿到email 跟 password
  // 但如果不是本地端登入，就只會有email 而已
  // 無論是本地或是google登入都會有，這個就不用用required
  email: {
    type: String,
    minLength: 8,
    maxLength: 1024,
  },
  //   本地端登入才有
  password: {
    type: String,
    minLength: 8,
    maxLength: 1024,
  },
});

//最後再module.exports mongoose.model 這個 User 就好
module.exports = mongoose.model("User", userSchema);
