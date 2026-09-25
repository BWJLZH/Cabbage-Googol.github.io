// 读 JPEG/PNG 文件头取真实像素尺寸，用于决定版式与 object-fit 策略。
// 不依赖任何第三方库。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function imageSize(file) {
  const b = fs.readFileSync(file);

  // PNG
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return { type: "png", width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  // JPEG：遍历标记段找 SOFn
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 1) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      i += 2;
      // 无长度字段的标记
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (marker === 0xd9) break;
      const len = b.readUInt16BE(i);
      // SOF0..SOF15（排除 DHT=c4, JPG=c8, DAC=cc）
      const isSOF = marker >= 0xc0 && marker <= 0xcf &&
                    marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) {
        return { type: "jpeg", height: b.readUInt16BE(i + 3), width: b.readUInt16BE(i + 5) };
      }
      i += len;
    }
  }
  throw new Error("无法识别的图片格式");
}

// 仅在被直接执行时才跑 CLI。
// 否则 check.mjs import 本模块时，它会把 check.mjs 的子命令参数当成文件名去读。
const invokedDirectly = process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly && process.argv[2]) {
  const s = imageSize(process.argv[2]);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const g = gcd(s.width, s.height);
  console.log(JSON.stringify({
    ...s,
    ratio: (s.height / s.width).toFixed(3) + ":1",
    simplified: `${s.width / g}:${s.height / g}`,
    megapixels: ((s.width * s.height) / 1e6).toFixed(2)
  }, null, 2));
}
