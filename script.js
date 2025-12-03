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
  if (!bgm || !muteToggle) return;
  bgm.volume = 0.2;   // ⭐ 音量在这里调（0 ~ 1）

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

const maxLength = 20;
const safeUsername = username ? username.substring(0, maxLength) : "";

if (username && questionText) {
  questionText.innerText = questionText.innerText + safeUsername;
}

// ========= 一些常量 =========
const DAY_LABEL = "这个周六";

// 阶段枚举
const STAGE = {
  FIRST: "first",          // xixi + 耶
  POPUPS: "popups",        // 弹窗雨
  QUIZ: "quiz",            // 问卷
  INTRO: "intro",          // 自我介绍
  TIME: "time",            // 选时间
  LOTTERY: "lottery",      // 抽卡
  FRIEND: "friend"         // 最终朋友卡
};

// 从哪几个阶段开始有左右箭头
const STAGES_WITH_NAV = new Set([
  STAGE.QUIZ,
  STAGE.INTRO,
  STAGE.TIME,
  STAGE.LOTTERY,
  STAGE.FRIEND
]);

// 抽奖图片（你后面补真文件就好）
const PRIZE_KEYS = [
  "prize_1", "prize_2", "prize_3",
  "prize_4", "prize_5", "prize_6",
  "prize_7", "prize_8", "prize_9"
];
const PRIZE_IMAGES = PRIZE_KEYS.map(k => `images/${k}.jpg`);
// 刮卡封面
const CARD_COVER_IMAGE = "images/card_cover_dummy.jpg";

// ======= 关键：这里填 ngrok 暴露出来的 HTTPS 地址 =======
const API_BASE = "https://supervoluminously-penicillate-malia.ngrok-free.dev";

// ======= 嘘寒问暖的弹窗内容 =======
const careMessages = [
  "有好好吃饭吗？",
  "要好好休息～",
  "记得多喝热水呀🥤",
  "外面有点冷",
  "不要熬夜啦👀",
  "遇到烦心事可以跟我说噢",
  "每天都开开心心的😊",
  "能和我多聊聊天吗？",
  "手机别玩太晚啦～",
  "心情会变好",
  "可以休息一下噢",
  "加班也不要饿着",
  "最近工作辛苦了",
  "每天都要元气满满",
  "你已经很棒啦！",
  "久坐不好呀～",
  "早点睡好不好💤",
  "梦想成真",
  "照顾好自己",
  "注意保暖别感冒啦～",
  "会好起来的"
];

// ========= 全局状态：一次完整流程的数据 =========
let loveId = null; // 对应 love 表里的 id

let appState = {
  name: safeUsername || null,
  day: DAY_LABEL,

  stage: null,          // 当前阶段

  // 问卷相关
  vibe: "",             // 氛围
  activity: "",         // 活动偏好
  role: "",             // 我的人设
  mood_level: null,     // 1~5
  mood_note: "",        // 对应的描述

  // 自我介绍文案（写给她看的）
  intro_text:
    "平时大部分时间在写代码，属于安静但聊天会慢慢打开的类型。\n" +
    "休息的时候会随便走走、乱拍路边的小动物和天空，也会去找一点好吃的。\n" +
    "整体算是慢热型，但熟了之后会比较话多。\n" +
    "第一次见面主要就是轻松地认识一下你，不会安排特别高压或社恐场景。",

  // 时间
  start_time: "",
  end_time: "",

  // 抽卡结果
  card_result: ""
};

function updateAppState(partial) {
  appState = { ...appState, ...partial };
}

// ========= 首页“不去”逻辑 =========
let clickCount = 0;        // 记录点击「不去」的次数

const noTexts = [
  "你认真的吗…😭",
  "要不再想想😱",
  "不许选这个！😫",
  "我伤心了🥹",
  "你这样我会难过哦😔",
  "再给我一次机会嘛🥺",
  "点左边那个好不好😀",
  "拒绝无效！只能同意😆",
];

noButton.addEventListener("click", function () {
  clickCount++;

  // 让「我同意」按钮越来越大
  const yesSize = 1 + clickCount * 0.6;
  yesButton.style.transform = `scale(${yesSize})`;

  // 把「不去」按钮不断往右挤
  const noOffset = clickCount * 40;
  noButton.style.transform = `translateX(${noOffset}px)`;

  // 图片和文字往上移动一点
  const moveUp = clickCount * 20;
  mainImage.style.transform = `translateY(-${moveUp}px)`;
  questionText.style.transform = `translateY(-${moveUp}px)`;

  // No 文案变化
  if (clickCount <= noTexts.length) {
    noButton.innerText = noTexts[clickCount - 1];
  } else {
    noButton.innerText = noTexts[noTexts.length - 1];
  }

  // 图片变化
  if (clickCount === 1) mainImage.src = "images/shocked.png";
  if (clickCount === 2) mainImage.src = "images/think.png";
  if (clickCount === 3) mainImage.src = "images/angry.png";
  if (clickCount >= 4) mainImage.src = "images/crying.png";
});

// ========= 后端：love 表接口 =========

// 新建一条 love 记录（只在刚点 YES 的时候调用一次）
function startLoveSession() {
  const payload = {
    name: appState.name,
    day: appState.day,
    stage: STAGE.FIRST
  };

  return fetch(`${API_BASE}/api/love/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => res.json())
    .then((data) => {
      if (data && data.id) {
        loveId = data.id;
        console.log("love session id =", loveId);
      }
    })
    .catch((err) => {
      console.error("startLoveSession error", err);
    });
}

// 更新 love 记录（某些字段 + 当前阶段）
function saveLove(extra = {}) {
  if (!loveId) return; // 还没拿到 id 就先不存

  const payload = {
    id: loveId,
    name: appState.name,
    day: appState.day,
    vibe: appState.vibe || null,
    activity: appState.activity || null,
    role: appState.role || null,
    mood_level: appState.mood_level || null,
    mood_note: appState.mood_note || null,
    intro_text: appState.intro_text || null,
    start_time: appState.start_time || null,
    end_time: appState.end_time || null,
    card_result: appState.card_result || null,
    stage: appState.stage || null,
    ...extra
  };

  fetch(`${API_BASE}/api/love/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch((err) => {
    console.error("saveLove error", err);
  });
}

// 切换阶段时统一调用
function gotoStage(newStage) {
  updateAppState({ stage: newStage });
  window.scrollTo(0, 0);
  saveLove({ stage: newStage });
  renderStage();
}

// ========= YES 按钮：开始整个流程 =========
let agreeStarted = false;

yesButton.addEventListener("click", function () {
  if (agreeStarted) return;
  agreeStarted = true;

  const container = document.querySelector(".container");

  const go = () => {
    startLoveSession().finally(() => {
      gotoStage(STAGE.FIRST);
    });
  };

  if (container) {
    container.classList.add("container-fade-out");
    setTimeout(go, 450);
  } else {
    go();
  }
});

// ========= 阶段渲染总调度 =========
function renderStage() {
  const stage = appState.stage;

  document.body.style.overflow = "auto"; // 默认可滚动

  switch (stage) {
    case STAGE.FIRST:
      showFirstScreen();
      break;
    case STAGE.POPUPS:
      showCarePopups();
      break;
    case STAGE.QUIZ:
      showQuestionnaire();
      break;
    case STAGE.INTRO:
      showIntroPage();
      break;
    case STAGE.TIME:
      showDateForm();
      break;
    case STAGE.LOTTERY:
      showLotteryPage();
      break;
    case STAGE.FRIEND:
      showFriendCardPage();
      break;
    default:
      break;
  }
}

// 通用：给当前页面加左右导航（从问卷开始才会出现）
function attachNavHandlers(options = {}) {
  if (!STAGES_WITH_NAV.has(appState.stage)) return;

  const prevAllowed = !!options.onPrev;
  const nextAllowed = !!options.onNext;

  const prevBtn = document.querySelector(".nav-arrow-left");
  const nextBtn = document.querySelector(".nav-arrow-right");

  if (prevBtn) {
    if (!prevAllowed) {
      prevBtn.classList.add("nav-disabled");
    } else {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        options.onPrev && options.onPrev();
      });
    }
  }

  if (nextBtn) {
    if (!nextAllowed) {
      nextBtn.classList.add("nav-disabled");
    } else {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        options.onNext && options.onNext();
      });
    }
  }
}

// ========= 第一幕：xixi.jpg + 耶！ =========
function showFirstScreen() {
  appRoot.innerHTML = `
    <div class="first-screen">
      <img src="images/xixi.jpg" alt="xixi" class="first-image">
      <div class="first-message-line">耶！</div>
      <div class="click-hint first-hint">点击画面继续……</div>
    </div>
  `;
  document.body.style.overflow = "hidden";

  const firstScreen = document.querySelector(".first-screen");
  firstScreen.addEventListener("click", function () {
    gotoStage(STAGE.POPUPS);
  });
}

// ========= 第二幕：弹窗雨 =========
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

  const POPUP_COUNT = 140;   // 弹窗数量
  const POPUP_INTERVAL = 35; // 弹出间隔，越小越快

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

    const top = 2 + Math.random() * 86;
    const left = 2 + Math.random() * 86;
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
  let isFadingOut = false;
  const appearDuration = POPUP_COUNT * POPUP_INTERVAL + 2500;

  setTimeout(() => {
    hint.classList.remove("hidden");
    canContinue = true;
  }, appearDuration);

  stage.addEventListener("click", function () {
    if (!canContinue || isFadingOut) return;
    isFadingOut = true;
    hint.classList.add("hidden");

    const boxes = Array.from(document.querySelectorAll(".popup-box"));
    const FADE_INTERVAL = 18;
    const FADE_DURATION = 250;

    boxes.forEach((box, index) => {
      setTimeout(() => {
        box.style.animation = "popupOut 0.3s ease forwards";
      }, index * FADE_INTERVAL);
    });

    const total = boxes.length * FADE_INTERVAL + FADE_DURATION + 150;

    setTimeout(() => {
      gotoStage(STAGE.QUIZ);
    }, total);
  });
}

// ========= 第三幕：问卷（花式问题 + 心情温度计） =========
function showQuestionnaire() {
  appRoot.innerHTML = `
    <div class="quiz-page">
      <div class="quiz-header-small">
        在见面之前，先简单对一下频道 ☁️
      </div>

      <h2 class="quiz-title">
        这些小问题没有标准答案，<br>
        只是想在见你之前，慢慢靠近你的节奏～
      </h2>

      <!-- Q1：氛围 -->
      <section class="quiz-card" data-q="vibe">
        <div class="quiz-q">Q1 第一次见面，你更想要什么氛围？</div>
        <div class="quiz-options">
          <button class="quiz-pill" data-q="vibe" data-value="安静咖啡角落">
            <span class="emoji">☕</span><span>安静找个小角落慢慢聊</span>
          </button>
          <button class="quiz-pill" data-q="vibe" data-value="城市慢慢散步">
            <span class="emoji">🚶‍♀️</span><span>在街上随便走走看看</span>
          </button>
          <button class="quiz-pill" data-q="vibe" data-value="人来人往的热闹一点">
            <span class="emoji">🏙</span><span>人来人往的地方，感受一下城市</span>
          </button>
        </div>
      </section>

      <!-- Q2：活动类型 -->
      <section class="quiz-card" data-q="activity">
        <div class="quiz-q">Q2 这一趟，你更想偏向哪种小活动？</div>
        <div class="quiz-options">
          <button class="quiz-pill" data-q="activity" data-value="探索好吃的">
            <span class="emoji">🍜</span><span>一起找点好吃的</span>
          </button>
          <button class="quiz-pill" data-q="activity" data-value="轻松走走看看">
            <span class="emoji">🌿</span><span>轻松走走看看就好</span>
          </button>
          <button class="quiz-pill" data-q="activity" data-value="简单安排一两个小任务">
            <span class="emoji">🗺</span><span>有一点小计划，但不太紧绷</span>
          </button>
        </div>
      </section>

      <!-- Q3：我的人设 -->
      <section class="quiz-card" data-q="role">
        <div class="quiz-q">Q3 那天你希望我大概是哪种“队友类型”？</div>
        <div class="quiz-options">
          <button class="quiz-pill" data-q="role" data-value="不会冷场担当">
            <span class="emoji">🤹‍♂️</span><span>负责搞笑，不让气氛尴尬</span>
          </button>
          <button class="quiz-pill" data-q="role" data-value="认真倾听型">
            <span class="emoji">👂</span><span>多听你说，偶尔补几句</span>
          </button>
          <button class="quiz-pill" data-q="role" data-value="分享故事型">
            <span class="emoji">📚</span><span>多分享见闻和有趣小故事</span>
          </button>
          <button class="quiz-pill" data-q="role" data-value="自由切换型">
            <span class="emoji">🌀</span><span>现场看你状态自由切换</span>
          </button>
        </div>
      </section>

      <!-- Q4：心情温度计 -->
      <section class="quiz-card" data-q="mood">
        <div class="quiz-q">Q4 那你现在的大概心情，在下面这根温度计的哪里？</div>
        <div class="mood-thermo">
          <div class="mood-slider-wrap">
            <div class="mood-slider-bg"></div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              class="mood-slider"
              id="moodSlider"
            />
          </div>
          <div class="mood-text" id="moodText"></div>
        </div>
      </section>

      <div class="quiz-next-wrap">
        <button class="quiz-next-btn" id="quizNextBtn">
          好～那我先简单自我介绍一下 →
        </button>
        <div class="quiz-note">
          怎么选都没关系，只是想在见面前多了解一点点你，
          <br>也方便我别把第一次见面弄得太尴尬～
        </div>
      </div>

      <button class="nav-arrow nav-arrow-left" type="button"></button>
      <button class="nav-arrow nav-arrow-right" type="button"></button>
    </div>
  `;

  document.body.style.overflow = "auto";

  // 恢复之前的选择（如果有的话）
  const pills = document.querySelectorAll(".quiz-pill");
  pills.forEach((pill) => {
    const q = pill.dataset.q;
    const value = pill.dataset.value;

    if (
      (q === "vibe" && appState.vibe === value) ||
      (q === "activity" && appState.activity === value) ||
      (q === "role" && appState.role === value)
    ) {
      pill.classList.add("active");
    }

    pill.addEventListener("click", () => {
      document
        .querySelectorAll(`.quiz-pill[data-q="${q}"]`)
        .forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");

      if (q === "vibe") updateAppState({ vibe: value });
      if (q === "activity") updateAppState({ activity: value });
      if (q === "role") updateAppState({ role: value });
    });
  });

  // 心情温度计
  const moodSlider = document.getElementById("moodSlider");
  const moodText = document.getElementById("moodText");

  const moodNotes = {
    1: "看样子最近事情不少，有点不开心，如果哪天想吐槽我可以当垃圾桶😔",
    2: "好像有点累，但还撑着。如果那天你只想轻松走走，我也完全 OK。",
    3: "整体还可以，在慢慢往上爬 🙂",
    4: "今天状态不错，感觉挺轻松的 😄",
    5: "好像最近还挺开心的，希望这小小的约见不要给你添烦恼 ✨"
  };

  function updateMoodUI(value) {
    const v = Number(value);
    const note = moodNotes[v] || "";
    moodText.textContent = note;
    updateAppState({ mood_level: v, mood_note: note });
  }

  // 默认值：之前选过就用之前的，没有就 3
  const initialMood = appState.mood_level || 3;
  moodSlider.value = initialMood;
  updateMoodUI(initialMood);

  moodSlider.addEventListener("input", () => {
    updateMoodUI(moodSlider.value);
  });

  const nextBtn = document.getElementById("quizNextBtn");
  const goNext = () => {
    // 如果你想强制三题都选完再继续，可以取消注释：
    // if (!appState.vibe || !appState.activity || !appState.role) {
    //   alert("前面三小题随便选一个就好，方便我别把第一次见面安排得不对劲～");
    //   return;
    // }
    gotoStage(STAGE.INTRO);
  };
  nextBtn.addEventListener("click", goNext);

  // 问卷页：只有“下一页”箭头可用，上一页禁用
  attachNavHandlers({
    onPrev: null,
    onNext: goNext
  });
}

// ========= 第四幕：自我介绍页 =========
function showIntroPage() {
  appRoot.innerHTML = `
    <div class="intro-page">
      <div class="intro-card">
        <h2 class="intro-title">那我也简单自我介绍一下 🙂</h2>
        <p class="intro-subtitle">
          下面这三格先当作“占位”，等你真的想见我的那天，我再认真补上照片。
        </p>

        <div class="intro-photos">
          <div class="intro-photo-slot">
            <!-- 你之后可以放：<img src="images/intro_1.jpg"> -->
            生活随手拍位
          </div>
          <div class="intro-photo-slot">
            工作/学习状态位
          </div>
          <div class="intro-photo-slot">
            偶尔有点好笑位
          </div>
        </div>

        <div class="intro-text">
          <p>
            平时大部分时间在写代码，属于安静但聊天会慢慢打开的类型。
          </p>
          <p>
            偶尔会在城市里随便走走，看到好看的天空、路边的小动物，或者有趣的路人，
            就会忍不住拍几张照片。
          </p>
          <p>
            对第一次见面的期待很简单：轻松一点、真诚一点，
            不需要立刻变成很熟的关系，只是希望能多认识一个真实的你。
          </p>
        </div>

        <button class="quiz-next-btn intro-next-btn" id="introNextBtn">
          好啦～那我们约个时间吧 →
        </button>

        <button class="nav-arrow nav-arrow-left" type="button"></button>
        <button class="nav-arrow nav-arrow-right" type="button"></button>
      </div>
    </div>
  `;

  document.body.style.overflow = "auto";

  // intro_text 已经在 appState 里了，如果你以后想做成可编辑，这里加 textarea 就行

  const goPrev = () => {
    gotoStage(STAGE.QUIZ);
  };
  const goNext = () => {
    gotoStage(STAGE.TIME);
  };

  document.getElementById("introNextBtn").addEventListener("click", goNext);

  attachNavHandlers({
    onPrev: goPrev,
    onNext: goNext
  });
}

// ========= 第五幕：自定义弹窗时间选择器（兼容手机 + 状态保存） =========
function showDateForm() {
  appRoot.innerHTML = `
    <div class="date-page">
      <p class="date-tip">
        第一次见面时间就定在 <strong>${DAY_LABEL}</strong> 吧
      </p>
      <p class="date-subtip">
        你选一个自己舒服的时间段，我只负责准时出现 🌱
      </p>

      <div class="time-input-row">
        <div class="time-card">
          <div class="time-label">开始时间</div>
          <button type="button" class="time-display" data-target="start">点击选择时间</button>
        </div>

        <div class="time-card">
          <div class="time-label">结束时间</div>
          <button type="button" class="time-display" data-target="end">点击选择时间</button>
        </div>
      </div>

      <input type="hidden" id="startTime">
      <input type="hidden" id="endTime">

      <button id="submitDate" class="submit-btn">锁定这个时间</button>
      <p class="form-hint-bottom">
        这段时间以后，会变成我心里“和你有关的一段小小纪念时间”🕒
      </p>

      <div class="time-picker-overlay">
        <div class="time-picker">
          <div class="tp-title">选择时间</div>
          <div class="tp-columns">
            <div class="tp-col tp-hours"></div>
            <div class="tp-col tp-mins"></div>
          </div>
          <div class="tp-actions">
            <button type="button" class="tp-btn tp-cancel">算啦</button>
            <button type="button" class="tp-btn tp-ok">就这个</button>
          </div>
        </div>
      </div>

      <button class="nav-arrow nav-arrow-left" type="button"></button>
      <button class="nav-arrow nav-arrow-right" type="button"></button>
    </div>
  `;

  document.body.style.overflow = "auto";

  const submitBtn = document.getElementById("submitDate");
  const startHidden = document.getElementById("startTime");
  const endHidden = document.getElementById("endTime");
  const displays = document.querySelectorAll(".time-display");

  const overlay = document.querySelector(".time-picker-overlay");
  const hoursCol = document.querySelector(".tp-hours");
  const minsCol = document.querySelector(".tp-mins");
  const btnCancel = document.querySelector(".tp-cancel");
  const btnOk = document.querySelector(".tp-ok");

  // 构建时间选项
  function buildTimeOptions() {
    hoursCol.innerHTML = "";
    minsCol.innerHTML = "";

    for (let h = 0; h < 24; h++) {
      const span = document.createElement("div");
      span.className = "tp-item tp-hour";
      span.dataset.value = h.toString().padStart(2, "0");
      span.textContent = span.dataset.value;
      hoursCol.appendChild(span);
    }

    for (let m = 0; m < 60; m++) {
      const span = document.createElement("div");
      span.className = "tp-item tp-min";
      span.dataset.value = m.toString().padStart(2, "0");
      span.textContent = span.dataset.value;
      minsCol.appendChild(span);
    }
  }

  buildTimeOptions();

  let activeTarget = null;      // 'start' or 'end'
  let selectedHour = "19";
  let selectedMinute = "00";

  function markSelected() {
    document.querySelectorAll(".tp-hour").forEach((el) => {
      el.classList.toggle("selected", el.dataset.value === selectedHour);
    });
    document.querySelectorAll(".tp-min").forEach((el) => {
      el.classList.toggle("selected", el.dataset.value === selectedMinute);
    });
  }

  function openPicker(target) {
    activeTarget = target;
    const currentValue =
      target === "start" ? startHidden.value : endHidden.value;

    if (currentValue && currentValue.includes(":")) {
      const [h, m] = currentValue.split(":");
      selectedHour = h;
      selectedMinute = m;
    } else {
      selectedHour = "19";
      selectedMinute = "00";
    }
    markSelected();
    overlay.classList.add("show");
  }

  function closePicker() {
    overlay.classList.remove("show");
  }

  hoursCol.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("tp-hour")) {
      selectedHour = target.dataset.value;
      markSelected();
    }
  });

  minsCol.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("tp-min")) {
      selectedMinute = target.dataset.value;
      markSelected();
    }
  });

  displays.forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = btn.dataset.target; // 'start' or 'end'
      openPicker(t);
    });
  });

  btnCancel.addEventListener("click", () => {
    closePicker();
  });

  btnOk.addEventListener("click", () => {
    if (!activeTarget) return;
    const value = `${selectedHour}:${selectedMinute}`;

    if (activeTarget === "start") {
      startHidden.value = value;
      const btn = document.querySelector('.time-display[data-target="start"]');
      btn.textContent = value;
      btn.classList.add("has-value");
    } else {
      endHidden.value = value;
      const btn = document.querySelector('.time-display[data-target="end"]');
      btn.textContent = value;
      btn.classList.add("has-value");
    }
    closePicker();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closePicker();
    }
  });

  // 如果之前已经选过，恢复
  if (appState.start_time) {
    startHidden.value = appState.start_time;
    const btn = document.querySelector('.time-display[data-target="start"]');
    btn.textContent = appState.start_time;
    btn.classList.add("has-value");
  }
  if (appState.end_time) {
    endHidden.value = appState.end_time;
    const btn = document.querySelector('.time-display[data-target="end"]');
    btn.textContent = appState.end_time;
    btn.classList.add("has-value");
  }

  const handleSubmit = () => {
    const startTime = startHidden.value;
    const endTime = endHidden.value;

    if (!startTime || !endTime) {
      alert("先选好开始和结束时间嘛～");
      return;
    }

    if (endTime <= startTime) {
      alert("结束时间要晚于开始时间哦，再看一眼～");
      return;
    }

    updateAppState({
      start_time: startTime,
      end_time: endTime
    });

    saveLove({
      start_time: startTime,
      end_time: endTime
    });

    gotoStage(STAGE.LOTTERY);
  };

  submitBtn.addEventListener("click", handleSubmit);

  // 导航：上一页回自我介绍，下一页等同于“锁定这个时间”
  const goPrev = () => {
    gotoStage(STAGE.INTRO);
  };

  attachNavHandlers({
    onPrev: goPrev,
    onNext: handleSubmit
  });
}

// ========= 第六幕：九宫格抽卡页 =========
function showLotteryPage() {
  // 如果已经抽过卡了，就直接展示单张结果
  if (appState.card_result) {
    const imgSrc = getPrizeImageByKey(appState.card_result);
    renderSingleCardResult(imgSrc);
    return;
  }

  appRoot.innerHTML = `
    <div class="lottery-page">
      <div class="lottery-title">可凭此券兑换奖品</div>
      <div class="lottery-subtitle">
        下面 9 张小卡片里藏着一张今天专属于你的效果图，<br>随便点一张试试运气～
      </div>

      <div class="lottery-grid">
        ${Array.from({ length: 9 })
          .map(
            (_, idx) => `
            <div class="lottery-card" data-index="${idx}">
              <img src="${CARD_COVER_IMAGE}" alt="刮卡封面">
            </div>
          `
          )
          .join("")}
      </div>

      <div class="lottery-tip">
        选中一张后，其它卡片会悄悄离场，留下今天的“朋友小奖品”。
        <br>完成抽卡后，点卡片外的区域会进入下一页。
      </div>

      <button class="nav-arrow nav-arrow-left" type="button"></button>
      <button class="nav-arrow nav-arrow-right" type="button"></button>
    </div>
  `;

  document.body.style.overflow = "auto";

  const grid = document.querySelector(".lottery-grid");
  const cards = grid.querySelectorAll(".lottery-card");
  const page = document.querySelector(".lottery-page");
  let hasDrawn = false;
  let chosenImgSrc = null;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (hasDrawn) return;
      hasDrawn = true;

      // 随机选一个奖品图片
      const randomIndex = Math.floor(Math.random() * PRIZE_IMAGES.length);
      chosenImgSrc = PRIZE_IMAGES[randomIndex];
      const chosenKey = PRIZE_KEYS[randomIndex];

      updateAppState({ card_result: chosenKey });
      saveLove({ card_result: chosenKey });

      // 其他卡片淡出，当前卡片保留
      cards.forEach((c) => {
        if (c !== card) {
          c.classList.add("fade-out");
        }
      });

      // 切成单卡展示 + 切换图片
      setTimeout(() => {
        renderSingleCardResult(chosenImgSrc);
      }, 350);
    });
  });

  const goPrev = () => {
    gotoStage(STAGE.TIME);
  };

  // 右侧箭头：如果已经抽完，就进入下一页；否则不生效
  const goNext = () => {
    if (!appState.card_result) return;
    gotoStage(STAGE.FRIEND);
  };

  attachNavHandlers({
    onPrev: goPrev,
    onNext: goNext
  });

  // 点击卡片外区域 -> 进入下一页（前提是已经有结果）
  page.addEventListener("click", (e) => {
    if (!appState.card_result) return;
    const cardEl = e.target.closest(".lottery-card");
    const isNav = e.target.closest(".nav-arrow");
    if (cardEl || isNav) return;
    gotoStage(STAGE.FRIEND);
  });
}

function getPrizeImageByKey(key) {
  const idx = PRIZE_KEYS.indexOf(key);
  if (idx === -1) return PRIZE_IMAGES[0] || "";
  return PRIZE_IMAGES[idx];
}

// 抽卡后的单卡展示（支持下载带水印）
function renderSingleCardResult(imgSrc) {
  appRoot.innerHTML = `
    <div class="lottery-page lottery-single">
      <div class="lottery-title">可凭此券兑换奖品</div>
      <div class="lottery-subtitle">
        这是今天的“朋友小奖品”，如果你喜欢，可以存起来当个小纪念。
      </div>

      <div class="lottery-grid">
        <div class="lottery-card">
          <img src="${imgSrc}" alt="抽到的卡片" id="lotteryResultImg">
          <button class="lottery-download-btn" type="button">保存到本地</button>
        </div>
      </div>

      <div class="lottery-tip">
        点卡片外的区域，会进入下一页的“朋友卡”。<br>
        如果只是想看看，也可以停在这里不动～
      </div>

      <button class="nav-arrow nav-arrow-left" type="button"></button>
      <button class="nav-arrow nav-arrow-right" type="button"></button>
    </div>
  `;

  const page = document.querySelector(".lottery-page");
  const downloadBtn = document.querySelector(".lottery-download-btn");
  const imgEl = document.getElementById("lotteryResultImg");

  const goPrev = () => {
    // 回去仍然是抽卡页，但因为有 card_result，会直接展示单卡
    gotoStage(STAGE.LOTTERY);
  };
  const goNext = () => {
    gotoStage(STAGE.FRIEND);
  };

  attachNavHandlers({
    onPrev: goPrev,
    onNext: goNext
  });

  // 点击卡片外区域 -> 下一页
  page.addEventListener("click", (e) => {
    const cardEl = e.target.closest(".lottery-card");
    const isNav = e.target.closest(".nav-arrow");
    if (cardEl || isNav) return;
    gotoStage(STAGE.FRIEND);
  });

  // 下载带 @fdd 水印
  downloadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!imgEl) return;
    downloadWithWatermark(imgEl.src, "@fdd");
  });
}

// 简单的 canvas 加水印下载
function downloadWithWatermark(src, watermarkText) {
  const img = new Image();
  img.crossOrigin = "anonymous"; // 同域不影响，跨域看图片服务器配置
  img.src = src;

  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const fontSize = Math.floor(canvas.width * 0.05);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";

    const x = canvas.width - 20;
    const y = canvas.height - 20;

    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 3;
    ctx.strokeText(watermarkText, x, y);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(watermarkText, x, y);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `card_${loveId || "friend"}.png`;
    a.click();
  };

  img.onerror = function () {
    alert("图片好像加载失败了，稍后再试试～");
  };
}

// ========= 第七幕：朋友卡（用你原来的朋友卡布局） =========
function showFriendCardPage() {
  const displayName = appState.name || "你";
  const startTime = appState.start_time || "--:--";
  const endTime = appState.end_time || "--:--";

  const vibeText = appState.vibe || "你觉得舒服的氛围";
  const activityText = appState.activity || "随缘安排一两个小活动";
  const roleText = appState.role || "现场看你状态自由切换";
  const moodNote = appState.mood_note || "";

  appRoot.innerHTML = `
    <div class="friend-card-screen">
      <div class="friend-card">
        <div class="friend-card-header">
          <span class="friend-card-title">「认识你的一小步」朋友卡</span>
          <span class="friend-card-icon">📘</span>
        </div>

        <div class="friend-card-meta">
          <div><span class="fc-meta-label">见面对象：</span><span>${displayName}</span></div>
          <div><span class="fc-meta-label">见面日：</span><span>${DAY_LABEL}</span></div>
          <div><span class="fc-meta-label">时间段：</span><span>${startTime} ~ ${endTime}</span></div>
        </div>

        <div class="friend-card-divider"></div>

        <div class="friend-card-row">
          <span class="fc-label">你想要的氛围：</span>
          <span class="fc-text">${vibeText}</span>
        </div>

        <div class="friend-card-row">
          <span class="fc-label">小小期待的安排：</span>
          <span class="fc-text">${activityText}</span>
        </div>

        <div class="friend-card-row">
          <span class="fc-label">我当天的出场人设：</span>
          <span class="fc-text">${roleText}</span>
        </div>

        ${
          moodNote
            ? `<div class="friend-card-row">
                 <span class="fc-label">你现在的心情备注：</span>
                 <span class="fc-text">${moodNote}</span>
               </div>`
            : ""
        }

        <p class="friend-card-paragraph">
          见面这件事，我会当成一件认真又轻松的小事来对待。<br>
          希望那天你是放松的，不需要勉强自己。
        </p>

        <p class="friend-card-paragraph friend-card-soft">
          如果那天你临时不太想见，也没关系。<br>
          提前跟我说一声就好，我会真心祝你那天也过得顺顺利利又开心 ✨
        </p>

        <div class="friend-card-img-wrap">
          <img src="images/hug.png" alt="可爱拥抱" class="friend-card-img">
        </div>

        <button class="nav-arrow nav-arrow-left" type="button"></button>
        <button class="nav-arrow nav-arrow-right" type="button"></button>
      </div>
    </div>
  `;

  document.body.style.overflow = "auto";

  const goPrev = () => {
    gotoStage(STAGE.LOTTERY);
  };

  // 最后一页就不开“下一页”了
  attachNavHandlers({
    onPrev: goPrev,
    onNext: null
  });
}
