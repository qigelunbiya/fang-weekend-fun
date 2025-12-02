// ========= 基本 DOM =========
const appRoot = document.getElementById("appRoot");
let yesButton = document.getElementById("yes");
let noButton = document.getElementById("no");
let questionText = document.getElementById("question");
let mainImage = document.getElementById("mainImage");

// ========= BGM & 静音 =========
const bgm = document.getElementById("bgm");
const muteToggle = document.getElementById("muteToggle");
let isMuted = false;

function initBgm() {
  if (!bgm) return;
  bgm.volume = 0.6;

  // 先尝试自动播放；如果被拦截，就在第一次点击时再播
  const tryPlay = () => {
    bgm.play().catch(() => {});
  };
  bgm.play().catch(() => {
    const handler = () => {
      tryPlay();
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
    };
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true });
  });

  muteToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    bgm.muted = isMuted;
    muteToggle.textContent = isMuted ? "🔈" : "🔊";
  });
}

initBgm();

// ========= 名字拼在问题后面 =========
const params = new URLSearchParams(window.location.search);
let username = params.get("name");

// 限制用户名长度，避免页面样式崩坏
const maxLength = 20;
const safeUsername = username ? username.substring(0, maxLength) : "";

// 防止 null 变成字符串 "null"
if (username && questionText) {
  questionText.innerText = questionText.innerText + safeUsername;
}

// ========= 「不去」相关逻辑 =========
let clickCount = 0;        // 记录点击「不去」的次数
let escapeMode = false;    // 「不去」按钮是否进入逃跑模式
let finalNoClicks = 0;     // 在“拒绝无效！只能同意😘”状态下被点次数
const ESCAPE_AFTER_TIMES = 5;

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

const FINAL_NO_TEXT = "拒绝无效！只能同意😘";

// ======= 关键：这里填 ngrok 暴露出来的 HTTPS 地址 =======
const API_BASE = "https://supervoluminously-penicillate-malia.ngrok-free.dev";

// ======= 嘘寒问暖的弹窗内容 =======
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
  "你的心情对我来说很重要💖",
];

// ========= 「不去」按钮点击 =========
noButton.addEventListener("click", function (e) {
  // 已进入逃跑模式，禁止正常点击逻辑，只让它跑路
  if (escapeMode) {
    e.preventDefault();
    moveNoButton();
    return;
  }

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

  // 如果已经是“拒绝无效！只能同意😘”，开始计数
  if (noButton.innerText === FINAL_NO_TEXT) {
    finalNoClicks++;
    if (finalNoClicks >= ESCAPE_AFTER_TIMES) {
      enableEscapeMode();
    }
  }
});

// 开启逃跑模式（围绕「我同意」的小范围乱跑）
function enableEscapeMode() {
  if (escapeMode) return;
  escapeMode = true;

  noButton.style.position = "fixed";
  noButton.style.zIndex = "1000";
  noButton.classList.add("no-escape-mode");

  // 清掉原来的 translateX，只保留轻微放大
  noButton.style.transform = "scale(1.05)";

  // 鼠标靠近 / 手指点就跑路
  noButton.addEventListener("mouseenter", moveNoButton);
  noButton.addEventListener("touchstart", function (e) {
    e.preventDefault();
    moveNoButton();
  });
}

// 围绕「我同意」按钮附近，画一个小圆圈随机位置
function moveNoButton() {
  const yesRect = yesButton.getBoundingClientRect();
  const noRect = noButton.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const margin = 8;

  const yesCenterX = (yesRect.left + yesRect.right) / 2;
  const yesCenterY = (yesRect.top + yesRect.bottom) / 2;

  const baseRadius = Math.max(yesRect.width, yesRect.height) * 2.2;

  let top, left;
  let tries = 0;

  while (tries < 40) {
    const angle = Math.random() * Math.PI * 2;
    const radius = baseRadius * (0.8 + Math.random() * 0.6); // 半径有一点随机

    const centerX = yesCenterX + radius * Math.cos(angle);
    const centerY = yesCenterY + radius * Math.sin(angle);

    left = centerX - noRect.width / 2;
    top = centerY - noRect.height / 2;

    const proposed = {
      left,
      top,
      right: left + noRect.width,
      bottom: top + noRect.height,
    };

    // 保证在视口内
    if (
      proposed.left < margin ||
      proposed.top < margin ||
      proposed.right > vw - margin ||
      proposed.bottom > vh - margin
    ) {
      tries++;
      continue;
    }

    // 不和「我同意」重叠
    const overlapWithYes = !(
      proposed.right < yesRect.left - margin ||
      proposed.left > yesRect.right + margin ||
      proposed.bottom < yesRect.top - margin ||
      proposed.top > yesRect.bottom + margin
    );

    if (!overlapWithYes) break;
    tries++;
  }

  if (isNaN(top) || isNaN(left)) {
    top = yesRect.bottom + 20;
    left = yesRect.right + 20;
  }

  noButton.style.top = `${top}px`;
  noButton.style.left = `${left}px`;
}

// ================== 点击「我同意😊」后的三幕 ==================
let agreeStarted = false;

yesButton.addEventListener("click", function () {
  if (agreeStarted) return;
  agreeStarted = true;

  const container = document.querySelector(".container");
  if (container) {
    container.classList.add("container-fade-out");
    setTimeout(() => {
      // 第一幕
      showFirstScreen();
    }, 450);
  } else {
    showFirstScreen();
  }
});

// 第一幕：中央大字 + 小号提示
function showFirstScreen() {
  appRoot.innerHTML = `
    <div class="first-screen">
      <div class="first-message">耶！你同意跟我出去啦💕</div>
      <div class="click-hint first-hint">点击画面继续……</div>
    </div>
  `;
  document.body.style.overflow = "hidden";

  const firstScreen = document.querySelector(".first-screen");
  firstScreen.addEventListener("click", function () {
    showCarePopups();
  });
}

// 第二幕：超多可爱弹窗雨 + 小号提示
function showCarePopups() {
  appRoot.innerHTML = `
    <div class="popup-stage">
      <div class="popup-overlay"></div>
      <div class="click-hint second-hint hidden">点击画面继续……</div>
    </div>
  `;
  document.body.style.overflow = "hidden";

  const overlay = document.querySelector(".popup-overlay");
  const hint = document.querySelector(".second-hint");
  const stage = document.querySelector(".popup-stage");

  // ====== 你可以自己调这两个参数 ======
  const POPUP_COUNT = 140;  // 弹窗越多越密
  const POPUP_INTERVAL = 35; // 每个弹出间隔（毫秒），越小越快

  const pastelColors = [
    "#ffe4e1",
    "#fff5c4",
    "#e0f7fa",
    "#f3e5f5",
    "#e8f5e9",
    "#ffdce5",
    "#fef3e7",
  ];

  for (let i = 0; i < POPUP_COUNT; i++) {
    const msg = careMessages[i % careMessages.length];

    const box = document.createElement("div");
    box.className = "popup-box";
    box.textContent = msg;

    // 随机位置，尽量铺满屏幕
    const top = 2 + Math.random() * 86;   // 2%-88%
    const left = 2 + Math.random() * 86;  // 2%-88%
    box.style.top = top + "vh";
    box.style.left = left + "vw";

    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    box.style.backgroundColor = color;

    const rotate = (Math.random() * 10 - 5).toFixed(1);
    box.style.transform = `scale(0.6) translateY(20px) rotate(${rotate}deg)`;

    const delay = i * POPUP_INTERVAL + Math.random() * 100;
    box.style.animationDelay = `${delay}ms`;

    overlay.appendChild(box);
  }

  let canContinue = false;
  const appearDuration = POPUP_COUNT * POPUP_INTERVAL + 2500;

  setTimeout(() => {
    hint.classList.remove("hidden");
    canContinue = true;
  }, appearDuration);

  stage.addEventListener("click", function () {
    if (!canContinue) return;
    showDateForm();
  });
}

// 第三幕：填写时间（增加可爱快捷选项）
// 第三幕：仅自由选择时间（更可爱 UI）
function showDateForm() {
  appRoot.innerHTML = `
    <div class="date-page">
      <p class="date-tip">
        第一次见面就定在 <strong>这个周六</strong> 吧
      </p>
      <p class="date-subtip">
        下面两个时间都可以自由选，选一个你方便的时间段
      </p>

      <div class="time-input-row">
        <div class="time-card">
          <div class="time-label">开始时间</div>
          <div class="time-input-wrap">
            <input type="time" id="startTime" class="time-input">
            <span class="time-icon">⏰</span>
          </div>
        </div>

        <div class="time-card">
          <div class="time-label">结束时间</div>
          <div class="time-input-wrap">
            <input type="time" id="endTime" class="time-input">
            <span class="time-icon">🌙</span>
          </div>
        </div>
      </div>

      <button id="submitDate" class="submit-btn">锁定这个时间</button>
      <p class="form-hint-bottom">已经把时间记小本本，绝无泄密风险</p>
    </div>
  `;

  document.body.style.overflow = "hidden";
  document.body.classList.add("fade-in");

  const submitBtn = document.getElementById("submitDate");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");

  submitBtn.addEventListener("click", function () {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (!startTime || !endTime) {
      alert("先选好开始和结束时间嘛～");
      return;
    }

    if (endTime <= startTime) {
      alert("结束时间要晚于开始时间哦，再看一眼～");
      return;
    }

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
        appRoot.innerHTML = `
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

