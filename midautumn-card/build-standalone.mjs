// 生成「单文件版」standalone.html：把 hero.jpg 以 base64 内嵌进 HTML。
//
// 为什么要这个：把页面发给别人时，多一个图片文件就容易漏发或路径失效。
// 单文件版双击即开、丢给谁都能跑。
//
// 体积控制：index.html 里图片只在 <img src> 出现一次（环境层用 JS 克隆复用），
// 所以内嵌后数据只存一份。另外必须删掉 <link rel="preload">，
// 否则那个 href 里会再塞一份完整的 base64，体积直接翻倍。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "./measure-image.mjs";

// 目录从脚本自身位置推导，不要写死。
// 教训：这个脚本是从别的项目复制过来的，写死路径会导致
// 「读 A 项目的 index.html，把 standalone.html 写进 A 项目目录」，
// 而自己这个项目根本没生成文件，还静默覆盖了别人的产物。
const DIR = path.dirname(fileURLToPath(import.meta.url)).replace(/\\/g, "/");
let html = fs.readFileSync(`${DIR}/index.html`, "utf8");
const jpg = fs.readFileSync(`${DIR}/hero.jpg`);
const b64 = jpg.toString("base64");
const dataUri = `data:image/jpeg;base64,${b64}`;

const before = Buffer.byteLength(html, "utf8");

// 1) 删掉 preload：data URI 放进 href 等于把图片数据再写一遍
const preloadRe = /[ \t]*<link rel="preload" as="image" href="hero\.jpg">\r?\n/;
if (!preloadRe.test(html)) throw new Error("没找到 preload 标签，结构可能已变");
html = html.replace(preloadRe, "");

// 2) 主图换成内嵌数据
const srcRe = /src="hero\.jpg"/;
if (!srcRe.test(html)) throw new Error("没找到 <img src=\"hero.jpg\">");
html = html.replace(srcRe, `src="${dataUri}"`);

// 3) 确认没有残留对 hero.jpg 的引用（否则单文件版会缺图）
const leftovers = (html.match(/hero\.jpg/g) || []).length;
if (leftovers > 0) throw new Error(`仍有 ${leftovers} 处 hero.jpg 引用未替换`);

// 4) 加上单文件版标记，便于区分。
// 用正则匹配 title 而不是写死标题文字，避免换个项目就静默失效。
const titleRe = /(<title>[\s\S]*?<\/title>)/;
if (!titleRe.test(html)) throw new Error("没找到 <title>");
html = html.replace(titleRe, "$1\n<!-- 单文件版：背景图已内嵌为 base64，可单独发送 -->");

const out = `${DIR}/standalone.html`;
fs.writeFileSync(out, html, "utf8");

const finalSize = fs.statSync(out).size;
const img = imageSize(`${DIR}/hero.jpg`);

console.log("已生成 standalone.html");
console.log(`  源 index.html : ${(before / 1024).toFixed(1)} KB`);
console.log(`  背景图        : ${(jpg.length / 1024).toFixed(1)} KB（${img.width}×${img.height}）`);
console.log(`  单文件版      : ${(finalSize / 1024).toFixed(1)} KB`);
console.log(`  数据只内嵌了一份：${leftovers === 0 ? "是" : "否"}`);
console.log(`  文件里 base64 出现次数：${(html.match(/data:image\/jpeg;base64/g) || []).length}`);
