// 中秋毛玻璃卡片页 · 验证工具
//
//   node check.mjs static   → 静态自检（语法、红线、关键实现、层级顺序）
//   node check.mjs gen      → 生成真机视口脚手架 _harness.html
//   node check.mjs parse    → 解析 Edge 回写的 _result.txt 并给判定
//   node check.mjs shots    → 生成单张截图脚手架 _shot.html
//
// 为什么用 iframe：Edge 无头模式有最小窗口宽度（约 500px），
// 直接 --window-size=390,844 拿到的是 504px 视口，等于没测到手机宽度。
import fs from "node:fs";
import vm from "node:vm";
import { imageSize } from "./measure-image.mjs";

const DIR = "D:/DeepseekApp/by Deepseek/midautumn-glass";
const html = fs.readFileSync(`${DIR}/index.html`, "utf8");
const mode = process.argv[2] || "static";

/* ============================ 静态自检 ============================ */
if (mode === "static") {
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!script) { console.log("FAIL 找不到 <script>"); process.exit(1); }

  let syntax = "OK";
  try { new vm.Script(script[1], { filename: "glass.js" }); }
  catch (e) { syntax = "ERROR: " + e.message; }

  // 精确取出某条 CSS 规则块的内容
  const ruleOf = (sel) => {
    const i = html.indexOf(sel + " {");
    if (i < 0) return "";
    return html.slice(i, html.indexOf("}", i));
  };
  const zOf = (sel) => {
    const m = ruleOf(sel).match(/z-index:\s*(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  };

  const declared = parseFloat((html.match(/--art-ratio:\s*([\d.]+)/) || [])[1]);
  const img = imageSize(`${DIR}/hero.jpg`);
  const ratioDelta = Math.abs(declared - (img.width / img.height));

  const glassZ = zOf(".glass");
  const skyZ = zOf("#sky");
  const moonZ = zOf(".moon-hotspot");

  const em = (html.match(/\u2014/g) || []).length;
  const en = (html.match(/\u2013/g) || []).length;

  // 用户实际能看到的文字：剥掉注释、脚本、样式和标签。
  // 之前拿整个文件去匹配「粒子」会命中我自己的代码注释，是假阳性。
  const visible = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script>[\s\S]*?<\/script>/g, "")
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const checks = [
    ["JS 语法", syntax === "OK", syntax],
    ["背景图存在", fs.existsSync(`${DIR}/hero.jpg`), "hero.jpg"],
    ["--art-ratio 与图片真实比例一致", ratioDelta < 0.0005,
      `声明 ${declared} / 实际 ${(img.width / img.height).toFixed(5)}`],
    ["主图用 contain（竖版海报不能被裁）",
      /object-fit:\s*contain/.test(ruleOf(".artwork img")) &&
      !/object-fit:\s*cover/.test(ruleOf(".artwork img")), "ok"],
    ["环境层用 cover 填留白", /object-fit:\s*cover/.test(ruleOf(".ambient img")), "ok"],
    ["环境层复用主图（单文件内嵌不翻倍）", /cloneNode\(false\)/.test(html), "ok"],

    // 层级：粒子必须画在卡片之上，否则卡片上点击的粒子会被盖住
    ["#sky 层级高于 .glass（粒子不被卡片遮住）",
      glassZ !== null && skyZ !== null && skyZ > glassZ, `sky=${skyZ} glass=${glassZ}`],
    ["月亮热区在卡片之下（卡片优先响应）",
      moonZ !== null && glassZ !== null && moonZ < glassZ, `moon=${moonZ} glass=${glassZ}`],
    ["canvas 不挡点击", /pointer-events:\s*none/.test(ruleOf("#sky")), "ok"],

    ["磨砂玻璃 backdrop-filter", /backdrop-filter:\s*blur\(/.test(ruleOf(".glass")), "ok"],
    ["不支持毛玻璃时有实底兜底", /@supports not/.test(html), "ok"],
    ["文字有微光阴影", /text-shadow:/.test(ruleOf(".glass-bless")), "ok"],
    ["国风书法字体栈含楷体类，并有宋体回落",
      /Kaiti SC/.test(html) && /STKaiti/.test(html) && /Noto Serif SC/.test(html), "ok"],

    ["月亮热区是 button 且带 aria-expanded", /<button class="moon-hotspot"[^>]*aria-expanded=/.test(html), "ok"],
    ["月亮热区带 aria-controls 指向卡片", /aria-controls="glass"/.test(html), "ok"],
    ["按钮无可访问名称时不会静默（有 aria-label）", /aria-label="显示或隐藏祝福卡片"/.test(html), "ok"],
    ["卡片有 role 与 aria-label", /class="glass" id="glass" role="region"/.test(html), "ok"],
    ["卡片淡出用 visibility 移出 tab 顺序", /visibility:\s*hidden/.test(html), "ok"],

    ["四种粒子字形齐备（月饼/玉兔/桂花/星光）",
      /1F95E/.test(html) && /1F407/.test(html) && /1F342/.test(html) && /2728/.test(html), "ok"],
    ["粒子用 emoji 字体栈绘制", /Segoe UI Emoji/.test(html) && /fillText/.test(html), "ok"],
    ["点击用 pointerdown（手机更跟手）", /pointerdown/.test(html), "ok"],
    ["粒子有数量上限防掉帧", /MAX_BURST/.test(html), "ok"],
    ["没有写任何提示点击粒子特效的文字（只看用户可见文字）",
      !/(粒子|特效|彩蛋|点一下试试|试试点击)/.test(visible), "ok"],
    ["可见文字里不含调试残留",
      !/(TODO|FIXME|undefined|NaN|Lorem)/.test(visible), "ok"],

    ["源码里无字面 emoji（粒子用转义写法，正文干净）",
      (html.match(/[\u{1F300}-\u{1FAFF}\u{2728}]/gu) || []).length === 0, "ok"],
    ["em-dash 为 0", em === 0, String(em)],
    ["en-dash 为 0", en === 0, String(en)],
    ["无外部依赖", !/https?:\/\/(?!www\.w3\.org)/.test(html), "ok"],
    ["devicePixelRatio 上限 2", /Math\.min\(window\.devicePixelRatio \|\| 1,\s*2\)/.test(html), "ok"],
    ["prefers-reduced-motion（并停用粒子）",
      html.includes("prefers-reduced-motion") && /if \(!entered \|\| reduceMotion\) return;/.test(html), "ok"],
    ["触摸设备不挂指针视差", html.includes("(hover: hover) and (pointer: fine)"), "ok"],
    ["visibilitychange 暂停", html.includes("visibilitychange"), "ok"],
    ["pagehide 清理（含 pointerdown 解绑）",
      html.includes("pagehide") && /removeEventListener\("pointerdown"/.test(html), "ok"],
    ["底部安全区", html.includes("env(safe-area-inset-bottom") || html.includes("100dvh"), "ok"],
    ["viewport-fit=cover", html.includes("viewport-fit=cover"), "ok"],
    ["月亮位置是可换算的比例而非写死像素",
      /MOON_CX\s*=\s*0\.47/.test(html) && /drawnRect\(\)/.test(html), "ok"],
    ["名字位已标注为可改", /改文案 2／4/.test(html), "ok"],

    // ---- 开屏 → 点击进入主页面 ----
    ["开屏存在且是真实 button", /<button class="splash-hit"[^>]*aria-label=/.test(html), "ok"],
    ["开屏整屏可点（按钮占满全屏）",
      /\.splash-hit\s*\{[\s\S]{0,400}?height:\s*100%/.test(html), "ok"],
    ["开屏点击后移出 tab 顺序",
      /body\.entered \.splash\s*\{[\s\S]{0,300}?visibility:\s*hidden/.test(html), "ok"],
    ["月亮热区开屏期间不可点、不可 Tab",
      /\.moon-hotspot\s*\{[\s\S]{0,500}?visibility:\s*hidden/.test(html), "ok"],
    ["海报/卡片/粒子都在 entered 后才浮现",
      /body\.entered \.artwork/.test(html) && /body\.entered \.glass/.test(html) &&
      /body\.entered #sky/.test(html), "ok"],
    ["开屏期间不放粒子", /if \(!entered \|\| reduceMotion\) return;/.test(html), "ok"],
    ["#open 深链可跳过开屏", /location\.hash === "#open"/.test(html), "ok"]
  ];

  let failed = 0;
  for (const [name, pass, detail] of checks) {
    if (!pass) failed++;
    console.log(`${pass ? "PASS" : "FAIL"}  ${name}${pass ? "" : "  -> " + detail}`);
  }
  console.log("");
  console.log(`背景图: ${img.width} × ${img.height}`);
  console.log(`内联脚本: ${script[1].split("\n").length} 行`);
  console.log(`文件大小: ${Buffer.byteLength(html, "utf8")} 字节`);
  console.log("");
  console.log(`用户能看到的全部文字（共 ${visible.replace(/ /g, "").length} 字）：`);
  console.log("  " + visible);
  console.log("");
  console.log(failed === 0 ? "全部通过" : `${failed} 项失败`);
  process.exit(failed === 0 ? 0 : 1);
}

/* ============================ 生成脚手架 ============================ */
if (mode === "gen") {
  const probe = `
<script>
window.addEventListener("load", function () {
  setTimeout(function () {
    var out = { vw: window.innerWidth, vh: window.innerHeight };

    /* ---- 先量开屏：内容是否放得下 ---- */
    var hit = document.querySelector(".splash-hit");
    var kids = hit.children;
    var first = kids[0].getBoundingClientRect();
    var lastKid = kids[kids.length - 1].getBoundingClientRect();
    out.splashContentH = Math.round(lastKid.bottom - first.top);
    out.splashTopGap = Math.round(first.top);
    out.splashBottomGap = Math.round(window.innerHeight - lastKid.bottom);
    out.splashFits = out.splashTopGap >= 0 && out.splashBottomGap >= 0;
    out.splashVisibleBefore = getComputedStyle(document.getElementById("splash")).visibility;
    out.moonHiddenBefore = getComputedStyle(document.getElementById("moon")).visibility;

    /* ---- 关掉过渡后点开屏，进入主页面 ---- */
    var st = document.createElement("style");
    st.textContent = "*{transition:none !important;animation:none !important}";
    document.head.appendChild(st);

    hit.click();
    void document.body.offsetHeight;                 // 强制回流，让 entered 立即生效
    out.enteredAfterClick = document.body.classList.contains("entered");
    out.splashHiddenAfter = getComputedStyle(document.getElementById("splash")).visibility;
    out.moonVisibleAfter = getComputedStyle(document.getElementById("moon")).visibility;
    out.cardOpacityAfter = getComputedStyle(document.getElementById("glass")).opacity;

    /* ---- 几何 ---- */
    var img = document.querySelector(".artwork img");
    var r = img.getBoundingClientRect();
    var nw = img.naturalWidth, nh = img.naturalHeight;
    var boxRatio = r.width / r.height, imgRatio = nw / nh;
    var dw, dh;
    if (imgRatio > boxRatio) { dw = r.width; dh = r.width / imgRatio; }
    else { dh = r.height; dw = r.height * imgRatio; }
    var dl = r.left + (r.width - dw) / 2;
    var dt = r.top + (r.height - dh) / 2;

    out.imgNatural = nw + "x" + nh;
    out.drawnW = Math.round(dw);
    out.drawnH = Math.round(dh);
    out.posterClipped = dl < -1 || dt < -1 ||
      (dl + dw) > window.innerWidth + 1 || (dt + dh) > window.innerHeight + 1;
    out.drawnRatioOk = Math.abs((dw / dh) - imgRatio) < 0.01;

    /* ---- 卡片是否放得下（矮屏最容易被切） ---- */
    var glass = document.getElementById("glass");
    var gr = glass.getBoundingClientRect();
    out.cardTop = Math.round(gr.top);
    out.cardBottom = Math.round(gr.bottom);
    out.cardH = Math.round(gr.height);
    out.cardW = Math.round(gr.width);
    out.cardFits = gr.top >= -0.5 && gr.bottom <= window.innerHeight + 0.5;
    out.cardOverflows = !out.cardFits;

    /* ---- 月亮热区：是否真的盖在月亮上，且有多少没被卡片压住 ---- */
    var mk = document.getElementById("moon");
    var mr = mk.getBoundingClientRect();
    var mcx = dl + 0.47 * dw, mcy = dt + 0.31 * dh, mrad = 0.375 * dw;
    out.moonCenter = [Math.round(mcx), Math.round(mcy), Math.round(mrad)];
    out.hotspotRect = [Math.round(mr.left), Math.round(mr.top), Math.round(mr.right), Math.round(mr.bottom)];
    // 热区中心与月亮圆心是否重合（误差 2px 内算准）
    out.hotspotCentered = Math.abs((mr.left + mr.right) / 2 - mcx) < 2 &&
                          Math.abs((mr.top + mr.bottom) / 2 - mcy) < 2;
    // 月亮圆心是否被卡片盖住
    out.moonCenterCovered = mcx > gr.left && mcx < gr.right && mcy > gr.top && mcy < gr.bottom;
    // 月亮圆的可点比例：把圆按网格采样，统计落在卡片外的比例
    var total = 0, free = 0;
    for (var a = 0; a < 360; a += 6) {
      for (var rr = 0.15; rr <= 1.0; rr += 0.2) {
        var sx = mcx + Math.cos(a * Math.PI / 180) * mrad * rr;
        var sy = mcy + Math.sin(a * Math.PI / 180) * mrad * rr;
        if (sx < 0 || sy < 0 || sx > window.innerWidth || sy > window.innerHeight) continue;
        total++;
        if (!(sx > gr.left && sx < gr.right && sy > gr.top && sy < gr.bottom)) free++;
      }
    }
    out.moonFreeRatio = total ? +(free / total).toFixed(3) : 0;

    /* ---- 卡片是否压住海报里已有的国潮细节 ---- */
    // 海报内已有文字的位置由读图测得（百分比）：
    //   巨型书法「中秋」 x 17~70%, y 27~78%
    //   张九龄诗句       x 40~76%, y 88~100%
    // 卡片下移后最容易压到的是下方那两句诗，所以重点看它。
    var cardBox = { l: gr.left, t: gr.top, r: gr.right, b: gr.bottom };
    function ov(box, x0, y0, x1, y1) {
      var a = { l: dl + x0 * dw, t: dt + y0 * dh, r: dl + x1 * dw, b: dt + y1 * dh };
      var w = Math.max(0, Math.min(cardBox.r, a.r) - Math.max(cardBox.l, a.l));
      var h = Math.max(0, Math.min(cardBox.b, a.b) - Math.max(cardBox.t, a.t));
      return Math.round(w * h);
    }
    out.overPoem = ov(null, 0.40, 0.88, 0.76, 1.00);
    out.overCalligraphy = ov(null, 0.17, 0.27, 0.70, 0.78);

    /* ---- 供外部测文字对比度用 ---- */
    var bless = document.querySelector(".glass-bless").getBoundingClientRect();
    out.blessRect = [Math.round(bless.left), Math.round(bless.top),
                     Math.round(bless.width), Math.round(bless.height)];
    out.cardRect = [Math.round(gr.left), Math.round(gr.top),
                    Math.round(gr.width), Math.round(gr.height)];

    out.scrollH = document.body.scrollHeight;
    out.noScroll = out.scrollH <= window.innerHeight + 1;

    /* ---- 功能测试 1：点月亮是否切换卡片 ---- */
    out.cardHiddenBefore = document.body.classList.contains("card-hidden");
    out.ariaExpandedBefore = mk.getAttribute("aria-expanded");
    mk.click();
    out.cardHiddenAfterClick = document.body.classList.contains("card-hidden");
    out.ariaExpandedAfterClick = mk.getAttribute("aria-expanded");
    out.toggleWorks = out.cardHiddenBefore !== out.cardHiddenAfterClick;
    mk.click();                                  // 切回来，别影响后面的粒子测试

    /* ---- 功能测试 2：点击是否真的画出粒子 ----
       派发真实 pointerdown，等几帧后回读 canvas 像素。
       这是唯一能证明「粒子确实渲染出来了」的办法。 */
    var cvs = document.getElementById("sky");
    var c2 = cvs.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cx = Math.round(window.innerWidth * 0.5);
    var cy = Math.round(window.innerHeight * 0.1);      // 靠上，避开卡片

    function countInk() {
      var s = 90 * dpr;
      var x0 = Math.max(0, Math.round(cx * dpr - s));
      var y0 = Math.max(0, Math.round(cy * dpr - s));
      var w = Math.min(cvs.width - x0, Math.round(s * 2));
      var h = Math.min(cvs.height - y0, Math.round(s * 2));
      if (w <= 0 || h <= 0) return -1;
      var d = c2.getImageData(x0, y0, w, h).data;
      var ink = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] > 10) ink++;
      return ink;
    }

    out.inkBeforeClick = countInk();
    out.clickPoint = [cx, cy];

    var posted = false;
    function finish() {
      if (posted) return;
      posted = true;
      out.burstRendered = out.inkAfterClick > out.inkBeforeClick + 50;
      parent.postMessage({ tag: "GLASS", data: out }, "*");
    }

    window.dispatchEvent(new PointerEvent("pointerdown", {
      clientX: cx, clientY: cy, bubbles: true, cancelable: true
    }));

    // 主判据：同步读。
    // 页面在按下时会同步补画一帧，所以事件返回时粒子已经在画布上了，
    // 完全不依赖 rAF 调度 —— 这很关键，因为 --virtual-time-budget 下
    // 定时器会飞快前进而 rAF 帧几乎不被服务，靠等帧测会得到假阴性。
    out.inkSync = countInk();
    out.inkAfterClick = out.inkSync;
    if (out.inkSync > out.inkBeforeClick + 50) {
      out.framesToBurst = 0;
      finish();
    } else {
      // 兜底：万一以后取消了同步绘制，再等几帧试试
      var tries = 0;
      (function step() {
        tries++;
        var ink = countInk();
        if (ink > out.inkAfterClick) out.inkAfterClick = ink;
        if (out.inkAfterClick > out.inkBeforeClick + 50) { out.framesToBurst = tries; finish(); return; }
        if (tries >= 40) { if (out.framesToBurst === undefined) out.framesToBurst = -1; finish(); return; }
        window.requestAnimationFrame(step);
      })();
      setTimeout(function () { if (out.framesToBurst === undefined) out.framesToBurst = -2; finish(); }, 3000);
    }
  }, 350);
});
</script>
</body>`;

  if (!html.includes("</body>")) throw new Error("no </body>");
  fs.writeFileSync(`${DIR}/_probe.html`, html.replace("</body>", probe), "utf8");

  if (fs.existsSync(`${DIR}/standalone.html`)) {
    const sh = fs.readFileSync(`${DIR}/standalone.html`, "utf8");
    if (sh.includes("</body>")) fs.writeFileSync(`${DIR}/_probe-standalone.html`, sh.replace("</body>", probe), "utf8");
  }

  const sizes = [
    [360, 640], [375, 667], [390, 844], [414, 896], [430, 932],
    [1024, 768], [1366, 768], [1440, 900], [1920, 1080]
  ];

  const harness = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>WAITING</title><style>
  body { margin: 0; background: #101018; }
  iframe { position: absolute; border: 1px solid #2f6bff; }
</style></head><body>
<script>
var sizes = ${JSON.stringify(sizes)};
var got = [];
sizes.forEach(function (s, i) {
  var f = document.createElement("iframe");
  f.style.left = (i % 5) * 2000 + "px";
  f.style.top = Math.floor(i / 5) * 1200 + "px";
  f.style.width = s[0] + "px";
  f.style.height = s[1] + "px";
  f.setAttribute("width", s[0]);
  f.setAttribute("height", s[1]);
  f.src = "_probe.html";
  document.body.appendChild(f);
});
window.addEventListener("message", function (e) {
  if (!e.data || e.data.tag !== "GLASS") return;
  got.push(e.data.data);
  document.title = got.length === sizes.length ? "GLASS" + JSON.stringify(got) : "PARTIAL" + got.length;
});
setTimeout(function () {
  if (String(document.title).indexOf("GLASS") !== 0) document.title = "TIMEOUT got=" + got.length + "/" + sizes.length;
}, 12000);
</script>
</body></html>`;
  fs.writeFileSync(`${DIR}/_harness.html`, harness, "utf8");
  console.log(`已生成脚手架，用例：${sizes.map(s => s.join("x")).join(", ")}`);
  process.exit(0);
}

/* ============================ 单张截图脚手架 ============================ */
if (mode === "shots") {
  const page = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>shot</title><style>
  html, body { margin: 0; padding: 0; background: #140f2e; overflow: hidden; }
  iframe { position: absolute; left: 0; top: 0; border: 0; display: block; }
</style></head><body>
<script>
var q = new URLSearchParams(location.search);
var w = q.get("w") || "390", h = q.get("h") || "844";
var f = document.createElement("iframe");
f.style.width = w + "px"; f.style.height = h + "px";
f.width = w; f.height = h;
f.src = q.get("src") || "index.html";
document.body.appendChild(f);
</script>
</body></html>`;
  fs.writeFileSync(`${DIR}/_shot.html`, page, "utf8");

  // 注意两件事：
  // 1. 不能由父页去点 iframe 里的按钮。file:// 的 iframe 是不透明源，
  //    父页拿到的 contentDocument 是 null，那样写会静默失效
  //    （我第一版就这么踩过，截出来两张图一模一样）。所以注入到 iframe 自己的文档里。
  // 2. 加了开屏之后，截图前必须先「进入」，否则截到的都是开屏，
  //    而且 CSS 过渡在 --virtual-time-budget 下不推进，必须先把过渡关掉。
  const mk = (source, extra, name) => {
    const out = source.replace("</body>", `
<script>
window.addEventListener("load", function () {
  setTimeout(function () {
    var st = document.createElement("style");
    st.textContent = "*{transition:none !important;animation:none !important}";
    document.head.appendChild(st);
    var enter = document.getElementById("enter");
    if (enter) enter.click();                 // 开屏 → 进入主页面
    ${extra}
  }, 300);
});
</script>
</body>`);
    fs.writeFileSync(`${DIR}/${name}`, out, "utf8");
  };

  mk(html, "", "_probe-entered.html");
  mk(html, 'document.getElementById("moon").click();', "_probe-hidden.html");
  if (fs.existsSync(`${DIR}/standalone.html`)) {
    mk(fs.readFileSync(`${DIR}/standalone.html`, "utf8"), "", "_probe-standalone.html");
  }

  console.log("已生成 _shot.html 与截图用探测页：_probe-entered / _probe-hidden / _probe-standalone");
  process.exit(0);
}

/* ============================ 单项：粒子功能 ============================ */
// 只开一个 iframe，把虚拟时间预算全给它。
// 9 个 iframe 同跑时 rAF 会被饿死，测出来的「没粒子」是假阴性。
if (mode === "gen-one") {
  const page = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>WAITING</title><style>
  body { margin: 0; background: #101018; }
  iframe { position: absolute; left: 0; top: 0; border: 0; }
</style></head><body>
<iframe id="f" src="_probe.html" width="390" height="844"
        style="width:390px;height:844px"></iframe>
<script>
window.addEventListener("message", function (e) {
  if (!e.data || e.data.tag !== "GLASS") return;
  document.title = "ONE" + JSON.stringify(e.data.data);
});
setTimeout(function () {
  if (String(document.title).indexOf("ONE") !== 0) document.title = "TIMEOUT";
}, 14000);
</script>
</body></html>`;
  fs.writeFileSync(`${DIR}/_harness1.html`, page, "utf8");
  console.log("已生成 _harness1.html（单 iframe 390x844，专测点击粒子）");
  process.exit(0);
}

if (mode === "parse-one") {
  const raw = fs.readFileSync(`${DIR}/_result1.txt`, "utf8");
  const m = raw.match(/<title>([\s\S]*?)<\/title>/);
  if (!m) { console.log("找不到 title"); process.exit(1); }
  const title = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  if (!title.startsWith("ONE")) { console.log("未收到探测数据: " + title.slice(0, 160)); process.exit(1); }

  const r = JSON.parse(title.slice(3));
  console.log("【点击粒子专项实测 · 单 iframe，虚拟时间预算独占】");
  console.log(`  视口      : ${r.vw} x ${r.vh}`);
  console.log(`  点击点    : (${r.clickPoint.join(", ")})`);
  console.log(`  点击前墨迹: ${r.inkBeforeClick}`);
  console.log(`  点击后墨迹: ${r.inkAfterClick}`);
  console.log(`  检出帧号  : ${r.framesToBurst}`);
  console.log(`  祝福语区域: x=${r.blessRect[0]} y=${r.blessRect[1]} w=${r.blessRect[2]} h=${r.blessRect[3]}`);
  console.log(`  卡片区域  : x=${r.cardRect[0]} y=${r.cardRect[1]} w=${r.cardRect[2]} h=${r.cardRect[3]}`);
  console.log("");
  console.log("  拿上面这行「祝福语区域」去测文字对比度：");
  console.log(`  python text_contrast.py <截图.png> ${r.blessRect.join(" ")}`);
  console.log("");
  if (r.burstRendered) {
    console.log(`  判定: 粒子渲染成功（墨迹增长 ${r.inkAfterClick - r.inkBeforeClick}，第 ${r.framesToBurst} 帧检出）`);
    process.exit(0);
  }
  console.log(`  判定: 未检出粒子 <-- 需要排查`);
  console.log(`  帧号为 -2 说明 4 秒兜底先触发；-1 说明 60 帧内始终没出现。`);
  process.exit(1);
}

/* ============================ 解析结果 ============================ */
if (mode === "parse") {
  const raw = fs.readFileSync(`${DIR}/_result.txt`, "utf8");
  const m = raw.match(/<title>([\s\S]*?)<\/title>/);
  if (!m) { console.log("找不到 title"); process.exit(1); }
  const title = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  if (!title.startsWith("GLASS")) { console.log("脚手架未收集齐: " + title.slice(0, 180)); process.exit(1); }

  const rows = JSON.parse(title.slice(5));
  const pad = (s, n) => String(s).padEnd(n);
  let bad = 0;

  console.log("【开屏 → 点击进入主页面】");
  console.log(pad("视口", 11) + pad("开屏内容高", 12) + pad("上下留白", 13) +
              pad("开屏放得下", 11) + pad("点击后 entered", 15) +
              pad("开屏已隐藏", 11) + pad("月亮热区", 10) + "卡片不透明度");
  console.log("-".repeat(92));
  for (const r of rows) {
    const ok = r.splashFits && r.enteredAfterClick && r.splashHiddenAfter === "hidden" &&
               r.moonVisibleAfter === "visible" && parseFloat(r.cardOpacityAfter) > 0.99;
    if (!ok) bad++;
    console.log(
      pad(`${r.vw}x${r.vh}`, 11) +
      pad(r.splashContentH, 12) +
      pad(`${r.splashTopGap} / ${r.splashBottomGap}`, 13) +
      pad(r.splashFits ? "是" : "否", 11) +
      pad(r.enteredAfterClick ? "是" : "否", 15) +
      pad(r.splashHiddenAfter === "hidden" ? "是" : "否（" + r.splashHiddenAfter + "）", 11) +
      pad(r.moonVisibleAfter === "visible" ? "已启用" : "仍是 " + r.moonVisibleAfter, 10) +
      r.cardOpacityAfter +
      (ok ? "" : "   <-- 有问题")
    );
  }

  console.log("");
  console.log("【版式与交互总表】");
  console.log(pad("视口", 11) + pad("海报绘制区", 13) + pad("裁切", 6) +
              pad("卡片 y", 13) + pad("卡片高", 7) + pad("放得下", 7) +
              pad("月亮可点", 9) + pad("压诗(px²)", 10) + pad("压书法(px²)", 11) +
              pad("切卡片", 7) + pad("粒子", 6) + "无滚动");
  console.log("-".repeat(120));

  for (const r of rows) {
    const issues = [];
    if (r.posterClipped) issues.push("海报被裁");
    if (!r.drawnRatioOk) issues.push("比例失真");
    if (!r.cardFits) issues.push("卡片被切");
    if (!r.moonFreeRatio || r.moonFreeRatio < 0.85) issues.push("月亮可点区不足");
    if (r.moonCenterCovered) issues.push("月亮圆心被卡片盖住");
    if (r.overPoem > 200) issues.push("压住海报诗句");
    if (!r.toggleWorks) issues.push("点月亮没切换卡片");
    if (!r.noScroll) issues.push("出现滚动");
    if (issues.length) bad++;

    console.log(
      pad(`${r.vw}x${r.vh}`, 11) +
      pad(`${r.drawnW}x${r.drawnH}`, 13) +
      pad(r.posterClipped ? "是" : "否", 6) +
      pad(`${r.cardTop}~${r.cardBottom}`, 13) +
      pad(r.cardH, 7) +
      pad(r.cardFits ? "是" : "否", 7) +
      pad((r.moonFreeRatio * 100).toFixed(0) + "%", 9) +
      pad(r.overPoem, 10) +
      pad(r.overCalligraphy, 11) +
      pad(r.toggleWorks ? "正常" : "失效", 7) +
      pad(r.burstRendered ? "有" : "无", 6) +
      (r.noScroll ? "是" : "否") +
      (issues.length ? "   <-- " + issues.join("、") : "")
    );
  }

  console.log("");
  console.log("【点击粒子功能实测（派发真实 pointerdown 后回读 canvas 像素）】");
  for (const r of rows) {
    console.log(`  ${pad(r.vw + "x" + r.vh, 11)}点击点 ${pad("(" + r.clickPoint.join(",") + ")", 12)}` +
      `墨迹 ${pad(r.inkBeforeClick, 6)} → ${pad(r.inkAfterClick, 6)}` +
      `帧#${pad(r.framesToBurst, 4)} ${r.burstRendered ? "粒子渲染成功" : "未检出 <--"}`);
  }
  console.log("  帧#: 第几帧检出粒子；-1 = 60 帧内都没出现；-2 = 4 秒兜底触发（多半是虚拟时间预算被抢光）");
  console.log("  注：9 个 iframe 同跑会争抢虚拟时间，rAF 可能被饿死。");
  console.log("      粒子这一项以单开一次的 `node check.mjs gen-one` 结果为准。");

  console.log("");
  console.log(bad === 0 ? `全部 ${rows.length} 个视口通过` : `${bad} / ${rows.length} 个视口存在问题`);
  process.exit(bad === 0 ? 0 : 1);
}
