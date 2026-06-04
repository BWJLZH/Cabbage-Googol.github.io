/* ============================================================
   card.js — 李紫豪名片交互逻辑
   功能：
     1. 欢迎遮罩层点击淡出 + 背景音乐播放
     2. Canvas紫色星光粒子背景（随机闪烁、缓慢漂浮）
     3. 邮箱/Github/微信按钮 → 弹窗展示联系方式
     4. 弹窗关闭逻辑
   纯原生JS，无任何第三方依赖
   ============================================================ */

/* ============================================================
   工具函数：等待指定毫秒数
   用于动画延迟等场景
   ============================================================ */
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

/* ============================================================
   第1部分：欢迎遮罩层逻辑
   ============================================================ */

/* 获取欢迎遮罩层DOM元素 */
var welcomeOverlay = document.getElementById("welcome-overlay");
/* 获取背景音乐audio元素 */
var bgMusic = document.getElementById("bg-music");

/* 标记音乐是否已经播放过（避免重复播放） */
var musicStarted = false;

/**
 * 点击欢迎遮罩层后的处理函数
 * 流程：
 *   1. 为遮罩层添加 hidden class → CSS transition 触发淡出
 *   2. 淡出动画结束后尝试播放背景音乐
 *   3. 动画过程中显示名片主页面
 */
function handleWelcomeClick() {
  /* 防止重复点击触发 */
  if (welcomeOverlay.classList.contains("hidden")) {
    return;
  }

  /* 步骤1：添加 hidden class，触发CSS opacity淡出动画（0.8s） */
  welcomeOverlay.classList.add("hidden");

  /* 步骤2：等待淡出动画完成后，尝试播放背景音乐 */
  /* 由于点击事件是用户手势，此时调用 play() 符合手机浏览器播放规则 */
  sleep(800).then(function () {
    playBackgroundMusic();
  });

  /* 步骤3：移除遮罩层的点击事件监听（节省内存） */
  welcomeOverlay.removeEventListener("click", handleWelcomeClick);
  welcomeOverlay.removeEventListener("touchend", handleWelcomeTouch);
}

/**
 * 移动端触摸事件处理（微信浏览器兼容）
 * 使用 touchend 确保移动端也能正常触发
 */
function handleWelcomeTouch(e) {
  /* 阻止默认行为，防止双击缩放等问题 */
  e.preventDefault();
  handleWelcomeClick();
}

/* 绑定点击事件：同时绑定 click 和 touchend，兼容桌面和移动端 */
welcomeOverlay.addEventListener("click", handleWelcomeClick);
welcomeOverlay.addEventListener("touchend", handleWelcomeTouch);

/**
 * 播放背景音乐
 * 仅当用户已触发过欢迎层点击且音乐未播放时才执行
 * 修改音乐源：修改 HTML 中 <audio> 标签的 src 属性
 */
function playBackgroundMusic() {
  if (musicStarted) {
    return; /* 已播放过，不再重复 */
  }
  /* 检查音乐源是否已配置（src 不为空） */
  if (!bgMusic.src || bgMusic.src === window.location.href) {
    /* src为空或等于页面URL（默认值），表示未配置音乐源，静默跳过 */
    console.log("背景音乐未配置，跳过播放。请在HTML中<audio>标签的src属性填入MP3链接。");
    musicStarted = true;
    return;
  }
  /* 尝试播放音乐 */
  var playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise.then(function () {
      musicStarted = true;
      console.log("背景音乐开始播放");
    }).catch(function (error) {
      /* 播放失败（如浏览器策略限制），记录日志但不影响页面使用 */
      console.log("背景音乐播放失败（可能被浏览器拦截）:", error.message);
      musicStarted = true; /* 标记为已尝试，避免反复重试 */
    });
  }
}

/* ============================================================
   第2部分：Canvas紫色星光粒子背景
   ============================================================ */

/* 获取Canvas元素和2D绘图上下文 */
var canvas = document.getElementById("stars-canvas");
var ctx = canvas.getContext("2d");

/**
 * 星光粒子数组
 * 每个粒子包含以下属性：
 *   x, y      — 粒子坐标（相对于Canvas）
 *   radius    — 粒子半径（1~2.5px，保持小巧）
 *   opacity   — 当前透明度（0~1）
 *   twinkleSpeed — 闪烁速度（每帧透明度变化量，随机）
 *   twinkleDir   — 闪烁方向（1=变亮, -1=变暗）
 *   floatSpeedX  — 水平漂浮速度（像素/帧，极小值）
 *   floatSpeedY  — 垂直漂浮速度（像素/帧，极小值）
 *   color     — 粒子颜色（仅紫色系）
 */
var stars = [];

/**
 * 紫色系颜色池（仅紫色，不包含任何蓝/青/蓝绿色）
 * 每颗星创建时随机从中选取一种颜色
 * 修改方式：增删下方数组中的色值即可调整星光颜色范围
 */
var PURPLE_COLORS = [
  "124, 58, 237",   /* 基准紫 #7c3aed */
  "139, 92, 246",   /* 亮紫 #8b5cf6 */
  "167, 139, 250",  /* 柔和紫 #a78bfa */
  "192, 132, 252",  /* 浅紫 #c084fc */
  "109, 40, 217",   /* 中紫 #6d28d9 */
  "147, 51, 234",   /* 鲜紫 #9333ea */
  "216, 180, 254",  /* 淡紫 #d8b4fe */
  "233, 213, 255",  /* 极浅紫 #e9d5ff */
];

/**
 * 粒子总数
 * 根据屏幕大小动态计算，移动端约80颗，桌面端约150颗
 * 修改方式：调整下方两个数值
 */
var STAR_COUNT_MOBILE = 80;   /* 移动端粒子数量 */
var STAR_COUNT_DESKTOP = 150; /* 桌面端粒子数量 */

/**
 * 生成一个随机紫色粒子
 * @returns {Object} 粒子对象
 */
function createStar() {
  /* 随机选取一种紫色 */
  var colorIndex = Math.floor(Math.random() * PURPLE_COLORS.length);
  var color = PURPLE_COLORS[colorIndex];

  /* 初始透明度随机（0.2 ~ 0.8） */
  var initialOpacity = 0.2 + Math.random() * 0.6;

  return {
    /* 随机X坐标（0 ~ Canvas宽度） */
    x: Math.random() * canvas.width,
    /* 随机Y坐标（0 ~ Canvas高度） */
    y: Math.random() * canvas.height,
    /* 半径1~2.5px，保持小巧精致 */
    radius: 1 + Math.random() * 1.5,
    /* 当前透明度 */
    opacity: initialOpacity,
    /* 闪烁速度：每帧变化 0.002~0.008 */
    twinkleSpeed: 0.002 + Math.random() * 0.006,
    /* 闪烁方向：1=正在变亮，-1=正在变暗 */
    twinkleDir: Math.random() > 0.5 ? 1 : -1,
    /* 水平漂浮速度：每帧移动 -0.03~0.03 px */
    floatSpeedX: (Math.random() - 0.5) * 0.06,
    /* 垂直漂浮速度：每帧移动 -0.05~-0.01 px（轻微上浮趋势） */
    floatSpeedY: -(0.01 + Math.random() * 0.04),
    /* RGB颜色值（不含alpha，绘制时拼接rgba） */
    color: color,
    /* 透明度上下限（闪烁范围） */
    minOpacity: 0.15,
    maxOpacity: 0.75
  };
}

/**
 * 初始化/重置所有星光粒子
 * 在Canvas尺寸变化时调用
 */
function initStars() {
  /* 根据屏幕宽度决定粒子数量 */
  var count = window.innerWidth < 768 ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
  stars = []; /* 清空数组 */
  for (var i = 0; i < count; i++) {
    stars.push(createStar());
  }
}

/**
 * 调整Canvas尺寸至铺满窗口
 * 在窗口大小改变时调用
 */
function resizeCanvas() {
  /* 获取设备像素比，保证在高DPI屏幕上清晰 */
  var dpr = window.devicePixelRatio || 1;
  var width = window.innerWidth;
  var height = window.innerHeight;

  /* 设置Canvas实际像素尺寸（乘以dpr保证清晰度） */
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  /* 设置Canvas CSS显示尺寸 */
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  /* 缩放绘图上下文以匹配dpr */
  ctx.setTransform(1, 0, 0, 1, 0, 0); /* 先重置变换 */
  ctx.scale(dpr, dpr);

  /* Canvas尺寸变化后，重新初始化粒子 */
  initStars();
}

/**
 * 更新单颗星的状态（透明度闪烁 + 位置漂浮）
 * @param {Object} star - 粒子对象
 */
function updateStar(star) {
  /* ---- 透明度闪烁逻辑 ---- */
  star.opacity += star.twinkleSpeed * star.twinkleDir;

  /* 达到最大透明度时转为变暗 */
  if (star.opacity >= star.maxOpacity) {
    star.opacity = star.maxOpacity;
    star.twinkleDir = -1;
  }
  /* 达到最小透明度时转为变亮 */
  if (star.opacity <= star.minOpacity) {
    star.opacity = star.minOpacity;
    star.twinkleDir = 1;
  }

  /* ---- 位置漂浮逻辑 ---- */
  star.x += star.floatSpeedX;
  star.y += star.floatSpeedY;

  /* 超出边界时重置到对面边缘（循环漂浮） */
  if (star.x < -10) {
    star.x = window.innerWidth + 10;
  }
  if (star.x > window.innerWidth + 10) {
    star.x = -10;
  }
  if (star.y < -10) {
    star.y = window.innerHeight + 10;
  }
  if (star.y > window.innerHeight + 10) {
    star.y = -10;
  }
}

/**
 * 绘制所有星光粒子到Canvas
 * 使用 requestAnimationFrame 循环调用，实现60fps动画
 */
function drawStars() {
  /* 清空整个Canvas */
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  /* 遍历绘制每一颗星 */
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];

    /* 先更新粒子状态 */
    updateStar(star);

    /* 绘制发光光晕（柔和的径向渐变） */
    var gradient = ctx.createRadialGradient(
      star.x, star.y, 0,          /* 内圆圆心和半径 */
      star.x, star.y, star.radius * 3 /* 外圆圆心和半径（3倍粒子半径） */
    );
    /* 渐变从中心亮紫渐变到边缘透明 */
    gradient.addColorStop(0, "rgba(" + star.color + ", " + star.opacity + ")");
    gradient.addColorStop(1, "rgba(" + star.color + ", 0)");

    ctx.beginPath();
    ctx.fillStyle = gradient;
    /* 绘制光晕圆（3倍粒子半径） */
    ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    /* 绘制核心亮点（纯色小圆） */
    ctx.beginPath();
    ctx.fillStyle = "rgba(" + star.color + ", " + Math.min(1, star.opacity + 0.2) + ")";
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  /* 继续下一帧动画 */
  requestAnimationFrame(drawStars);
}

/* 监听窗口大小变化，重新调整Canvas */
window.addEventListener("resize", function () {
  resizeCanvas();
});

/* 监听屏幕旋转（移动端），重新调整Canvas */
window.addEventListener("orientationchange", function () {
  /* 延迟200ms等待浏览器完成旋转布局 */
  setTimeout(function () {
    resizeCanvas();
  }, 200);
});

/* ============================================================
   第3部分：联系信息弹窗逻辑
   ============================================================ */

/* 获取弹窗相关DOM元素 */
var modalOverlay = document.getElementById("modal-overlay");
var modalTitle = document.getElementById("modal-title");
var modalContent = document.getElementById("modal-content");
var modalCloseBtn = document.getElementById("modal-close");

/* 获取所有联系按钮 */
var contactButtons = document.querySelectorAll(".contact-btn");

/**
 * 打开弹窗，展示对应联系方式
 * @param {string} type     - 联系类型（email / github / wechat）
 * @param {string} contact  - 联系方式内容
 * @param {string} label    - 弹窗标题
 */
function openModal(type, contact, label) {
  /* 设置弹窗标题 */
  modalTitle.textContent = label;

  /* 根据类型设置弹窗内容 */
  /* 修改联系方式：直接修改下方各 case 中的内容即可 */
  switch (type) {
    case "email":
      /* 邮箱弹窗内容 */
      /* 修改邮箱地址：修改下方 contact 变量对应的HTML data-contact 属性 */
      modalContent.innerHTML = "📧 邮箱地址：<br><br>" +
        "<span style='color:#c084fc;'>" + contact + "</span>" +
        "<br><br><span style='font-size:12px;color:#6d28d9;'>（长按上方文字即可复制邮箱地址）</span>";
      break;

    case "github":
      /* Github弹窗内容 */
      /* 修改Github地址：修改下方 contact 变量对应的HTML data-contact 属性 */
      modalContent.innerHTML = "🐙 Github主页：<br><br>" +
        "<span style='color:#c084fc;'>" + contact + "</span>" +
        "<br><br><span style='font-size:12px;color:#6d28d9;'>（长按上方链接即可复制）</span>";
      break;

    case "wechat":
      /* 微信弹窗内容 */
      /* 修改微信号：修改下方 contact 变量对应的HTML data-contact 属性 */
      modalContent.innerHTML = "💬 微信号：<br><br>" +
        "<span style='color:#c084fc;'>" + contact + "</span>" +
        "<br><br><span style='font-size:12px;color:#6d28d9;'>（长按上方微信号即可复制）</span>";
      break;

    default:
      modalContent.textContent = contact;
      break;
  }

  /* 显示弹窗（添加 active class） */
  modalOverlay.classList.add("active");
}

/**
 * 关闭弹窗
 */
function closeModal() {
  modalOverlay.classList.remove("active");
}

/**
 * 按钮点击事件处理函数
 * 从按钮的 data-* 属性中读取联系方式信息，然后打开弹窗
 */
function handleContactBtnClick(e) {
  /* 获取当前点击的按钮 */
  var btn = e.currentTarget;
  /* 读取 data-type 属性（email/github/wechat） */
  var type = btn.getAttribute("data-type");
  /* 读取 data-contact 属性（联系方式内容） */
  var contact = btn.getAttribute("data-contact");
  /* 读取 data-label 属性（弹窗标题） */
  var label = btn.getAttribute("data-label");

  /* 打开弹窗 */
  openModal(type, contact, label);
}

/* 为每个联系按钮绑定点击事件 */
for (var i = 0; i < contactButtons.length; i++) {
  contactButtons[i].addEventListener("click", handleContactBtnClick);
}

/**
 * 弹窗关闭按钮点击事件
 */
modalCloseBtn.addEventListener("click", function (e) {
  /* 阻止事件冒泡，防止触发遮罩层关闭 */
  e.stopPropagation();
  closeModal();
});

/**
 * 点击弹窗遮罩层（弹窗外部区域）关闭弹窗
 */
modalOverlay.addEventListener("click", function (e) {
  /* 只有点击遮罩层本身（而非弹窗内部）时才关闭 */
  if (e.target === modalOverlay) {
    closeModal();
  }
});

/* 阻止弹窗内部点击事件冒泡到遮罩层 */
var modalBox = document.querySelector(".modal-box");
modalBox.addEventListener("click", function (e) {
  e.stopPropagation();
});

/* ============================================================
   第4部分：页面初始化
   ============================================================ */

/**
 * 页面加载完成后执行初始化
 */
function init() {
  /* 1. 初始化Canvas尺寸并生成星光粒子 */
  resizeCanvas();

  /* 2. 启动星光动画循环 */
  drawStars();

  /* 3. 显示欢迎遮罩（确保可见） */
  welcomeOverlay.classList.remove("hidden");
}

/* 当DOM加载完成后执行初始化 */
document.addEventListener("DOMContentLoaded", init);
