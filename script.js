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

// ======= 关键：这里填 ngrok 暴露出来的 HTTPS 地址 =======
const API_BASE = "https://supervoluminously-penicillate-malia.ngrok-free.dev";

// ======= 嘘寒问暖的弹窗内容（可以继续自己加） =======
const careMessages = [
  "今天有好好吃饭吗？",
  "最近有没有好好休息～",
  "记得多喝热水呀🥤",
  "外面有点冷，出门要穿外套！",
  "不要熬夜啦，对皮肤不好👀",
  "遇到烦心事可以跟我说噢",
  "希望你每天都开开心心的😊",
  "比起天气，我更关心你的心情",
  "路上小心点哦～",
  "喝奶茶记得少糖一点嘿嘿",
  "手机别玩太晚啦～",
  "多喝水多睡觉，心情会变好",
  "你累了的话可以休息一下",
  "记得按时吃饭，不要只喝咖啡☕",
  "最近工作辛苦了吗？要奖励一下自己～",
  "不开心的时候我可以立刻出现🙋‍♂️",
  "别对自己太严格，你已经很棒啦！",
  "记得多走走动动，久坐不好呀～",
  "如果今天很累，就早点睡好不好💤",
  "我会一直站在你这边💗",
  "希望你每天醒来都能看到好天气～",
  "路上记得看红绿灯🚦",
  "注意保暖别感冒啦～",
  "看到这个小弹窗就当我在摸摸你的头～",
  "希望你每一餐都有好吃的东西🍜",
  "记得多笑笑，笑起来超可爱✨",
  "遇到小情绪也没关系，我在呢",
  "今天也要温柔对待自己呀",
  "如果世界对你偏见，我就站在你这边",
  "你的心情对我来说很重要💖"
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

// ================== 点击「我同意😊」后的新版流程 ==================

yesButton.addEventListener("click", function () {
  // 防止连点
  yesButton.disabled = true;
  noButton.disabled = true;

  const container = document.querySelector(".container");
  if (container) {
    // 先让原页面淡出
    container.classList.add("container-fade-out");

    setTimeout(() => {
      container.remove();      // 把原来的内容干掉
      showCarePopups();        // 再开始出现弹窗
    }, 450); // 对应 CSS 动画时间
  } else {
    showCarePopups();
  }
});

// 1）先弹一堆嘘寒问暖的小弹窗
function showCarePopups() {
  document.body.style.overflow = "hidden";

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  document.body.appendChild(overlay);

  const POPUP_COUNT = 80;      // 超级加倍：想再夸张可以调大
  const POPUP_INTERVAL = 40;   // 每个弹出间隔（毫秒）

  const pastelColors = [
    "#ffe4e1", // 浅粉
    "#fff5c4", // 浅黄
    "#e0f7fa", // 浅青
    "#f3e5f5", /* 浅紫 */
    "#e8f5e9", // 浅绿
    "#ffdce5", // 粉红
    "#fef3e7"  // 奶油橙
  ];

  for (let i = 0; i < POPUP_COUNT; i++) {
    const msg = careMessages[i % careMessages.length];

    const box = document.createElement("div");
    box.className = "popup-box";
    box.textContent = msg;

    // 随机位置（尽量铺满页面）
    const top = 5 + Math.random() * 80;   // 5% - 85% 之间
    const left = 3 + Math.random() * 80;  // 3% - 83% 之间
    box.style.top = top + "vh";
    box.style.left = left + "vw";

    // 随机柔和背景色
    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    box.style.backgroundColor = color;

    // 微小随机旋转角度，可爱一点
    const rotate = (Math.random() * 10 - 5).toFixed(1); // -5° ~ 5°
    box.style.transform = `scale(0.6) translateY(20px) rotate(${rotate}deg)`;

    // 逐个出现的延迟
    const delay = i * POPUP_INTERVAL + Math.random() * 120;
    box.style.animationDelay = `${delay}ms`;

    overlay.appendChild(box);
  }

  // 大概等所有弹窗都出现后，再统一淡出 + 进入填写时间页面
  const appearDuration = POPUP_COUNT * POPUP_INTERVAL + 2500; // 粗略总时间

  setTimeout(() => {
    overlay.classList.add("popup-overlay-hide");

    // 等淡出动画结束后移除 overlay，并进入选时间页面
    setTimeout(() => {
      overlay.remove();
      showDateForm();
    }, 650); // 对应 CSS 里 overlayFadeOut 的时间
  }, appearDuration);
}

// 2）弹窗结束后，进入填写时间页面
function showDateForm() {
  // 替换成约会时间选择页面（自由选择时间段）
  document.body.innerHTML = `
    <div class="date-container">
      <h1>耶！你同意跟我出去啦💕</h1>
      <p class="date-tip">
        第一次见面就定在 <strong>这个周六</strong> 吧，由你来选一个时间段～
      </p>

      <div class="form-group">
        <label for="startTime" class="form-label">开始时间：</label>
        <input type="time" id="startTime" class="form-input">
      </div>

      <div class="form-group">
        <label for="endTime" class="form-label">结束时间：</label>
        <input type="time" id="endTime" class="form-input">
      </div>

      <button id="submitDate" class="submit-btn">提交</button>
      <p class="form-hint-bottom">你的选择会悄悄保存到我的小本本里，只有我能看到～</p>
    </div>
  `;

  document.body.classList.add("fade-in");
  document.body.style.overflow = "hidden";

  const submitBtn = document.getElementById("submitDate");

  submitBtn.addEventListener("click", function () {
    const startTimeInput = document.getElementById("startTime");
    const endTimeInput = document.getElementById("endTime");

    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (!startTime || !endTime) {
      alert("要先选好开始和结束时间哦～");
      return;
    }

    if (endTime <= startTime) {
      alert("结束时间要晚于开始时间嘛，再检查一下～");
      return;
    }

    // 要发给后端的数据
    const payload = {
      name: safeUsername || null,
      day: "这个周六",
      start_time: startTime,
      end_time: endTime,
    };

    fetch(`${API_BASE}/api/save-date`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("网络返回非 2xx");
        }
        return res.json();
      })
      .then(() => {
        // 成功后再切换成一个“记录成功”页面
        document.body.innerHTML = `
          <div class="yes-screen">
            <h1 class="yes-text">我记下啦！周六见～ ✨</h1>
            <img src="images/hug.png" alt="拥抱" class="yes-image">
          </div>
        `;
      })
      .catch((err) => {
        console.error(err);
        alert("提交失败了 T_T 可能是我这边小服务器没开，稍后再试试～");
      });
  });
}
