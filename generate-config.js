/**
 * 壁纸配置生成脚本
 * 
 * 使用方法：
 *   1. 将图片上传到 R2
 *   2. 在 images.txt 中添加图片文件名（每行一个）
 *   3. 运行：node generate-config.js
 */

const fs = require('fs');

const CDN_BASE = 'https://wallpaper-cdn.hepingfly.com';
const IMAGES_FILE = 'images.txt';
const OUTPUT_FILE = 'data/wallpapers.json';

// 读取图片列表
if (!fs.existsSync(IMAGES_FILE)) {
  console.log(`❌ 未找到 ${IMAGES_FILE} 文件`);
  console.log('请创建该文件，每行一个图片文件名，例如：');
  console.log('  2.png');
  console.log('  3.png');
  process.exit(1);
}

const files = fs.readFileSync(IMAGES_FILE, 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#')); // 过滤空行和注释

// 生成壁纸配置
const wallpapers = files.map((file, index) => ({
  id: String(index + 1),
  name: `春节壁纸 ${String(index + 1).padStart(3, '0')}`,
  // 预览图使用 Cloudflare Image Resizing 压缩
  preview: `${CDN_BASE}/cdn-cgi/image/width=400,quality=80,format=auto/${file}`,
  // 原图保持不变
  original: `${CDN_BASE}/${file}`,
  width: 1080,
  height: 1920
}));

// 写入配置文件
const config = {
  password: 'spring2026',
  siteName: '春节壁纸精选',
  wallpapers
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));

console.log(`✅ 配置文件已更新！`);
console.log(`   共找到 ${wallpapers.length} 张壁纸`);
