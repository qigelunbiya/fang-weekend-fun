let yesButton = document.getElementById("yes");
let noButton = document.getElementById("no");
let questionText = document.getElementById("question");
let mainImage = document.getElementById("mainImage");

// 可选：从 URL 里拿 name 拼在问题后面，例如 index.html?name=小美
const params = new URLSearchParams(window.location.search);
let username = params.get("name");

// 限制用户名长度，避免页面样式崩坏
const maxLength = 20;
const safeUsername = username ? username.substring(0, maxLength) : "";

// 防止 `null` 变成 `"null"`
if (username) {
  questionText.innerText = questionText.innerText + safeUsername;
}

let clickCount = 0; // 记录点击「不去」的次数

// 「哼，不去😤」按钮的文字变化（带 emoji）
const noTexts = [
  "你认真的吗…😭",
  "要不再想想😱",
  "不许选这个！😫",
  "我伤心了🥹",
  "你这样我会难过哦😔",
  "再给我一次机会嘛🥺",
  "点上面那个好不好❤️",
  "拒绝无效！只能同意😘",
];

// 点击「哼，不去😤」
noButton.addEventListener("click", function () {
  clickCount++;

  // 让「我同意」按钮越来越大
  let yesSize = 1 + clickCount * 0.6;
  yesButton.style.transform = `scale(${yesSize})`;

  // 把「不去」按钮不断往右挤
  let noOffset = clickCount * 40;
  noButton.style.transform = `translateX(${noOffset}px)`;

  // 图片和文字往上移动一点
  let moveUp = clickCount * 20;
  mainImage.style.transform = `translateY(-${moveUp}px)`;
  questionText.style.transform = `translateY(-${moveUp}px)`;

  // No 文案变化
  if (clickCount <= noTexts.length) {
    noButton.innerText = noTexts[clickCount - 1];
  } else {
    noButton.innerText = noTexts[noTexts.length - 1];
  }

  // 图片变化
  if (clickCount === 1) mainImage.src = "images/shocked.png"; // 震惊
  if (clickCount === 2) mainImage.src = "images/think.png";   // 思考
  if (clickCount === 3) mainImage.src = "images/angry.png";   // 生气
  if (clickCount >= 4) mainImage.src = "images/crying.png";   // 一直哭
});

// 点击「我同意😊」
yesButton.addEventListener("click", function () {
  // 先给当前页面一个淡出的动画
  document.body.classList.add("fade-out");

  setTimeout(() => {
    // 替换成约会信息页面
    document.body.innerHTML = `
      <div class="date-container">
        <h1>耶！你同意跟我出去啦💕</h1>
        <p class="date-tip">先选一个你比较方便的时间：</p>

        <div class="date-options">
          <label class="date-option">
            <input type="radio" name="dateOption" value="这个周六下午（14:00-18:00）">
            这个周六下午（14:00-18:00）
          </label>
          <label class="date-option">
            <input type="radio" name="dateOption" value="这个周六晚上（18:00-22:00）">
            这个周六晚上（18:00-22:00）
          </label>
          <label class="date-option">
            <input type="radio" name="dateOption" value="这个周日下午（14:00-18:00）">
            这个周日下午（14:00-18:00）
          </label>
          <label class="date-option">
            <input type="radio" name="dateOption" value="这个周日晚上（18:00-22:00）">
            这个周日晚上（18:00-22:00）
          </label>
          <label class="date-option">
            <input type="radio" name="dateOption" value="下个周末你方便的时间">
            下个周末你方便的时间
          </label>
        </div>

        <div class="form-group">
          <label for="phone" class="form-label">你的手机号码：</label>
          <input type="tel" id="phone" class="form-input" placeholder="请输入你的手机号">
          <p class="form-hint">务必填写哦（后续有作用），信息严格保密，坚决不能泄露</p>
        </div>

        <button id="submitDate" class="submit-btn">提交</button>
        <p class="form-hint-bottom">点击提交后，会自动帮你写好短信给我，你只要点发送就好啦～</p>
      </div>
    `;

    // 再给新页面一个淡入动画
    document.body.classList.remove("fade-out");
    document.body.classList.add("fade-in");

    document.body.style.overflow = "hidden";

    const submitBtn = document.getElementById("submitDate");

    submitBtn.addEventListener("click", function () {
      const selected = document.querySelector('input[name="dateOption"]:checked');
      const phoneInput = document.getElementById("phone");
      const phone = phoneInput.value.trim();

      if (!selected) {
        alert("先选一个约会时间嘛～");
        return;
      }

      if (!phone) {
        alert("手机号码要填哦，不然我联系不到你～");
        phoneInput.focus();
        return;
      }

      const dateText = selected.value;

      // 要发给你的短信内容
      const message = `她已经同意和你约会啦！\n约会时间：${dateText}\n她的手机号：${phone}`;

      // 使用 sms: 协议，打开对你手机号的短信窗口并填好内容
      // 号码：15992657365
      const smsUrl = `sms:15992657365?body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;
    });
  }, 400); // 和 CSS 动画时间对上
});
