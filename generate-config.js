/**
 * 壁纸配置生成脚本
 * 
 * 使用方法：每次在 images/original 目录新增图片后，运行：
 *   node generate-config.js
 * 
 * 脚本会自动扫描目录并更新 wallpapers.json 配置文件
 */

const fs = require('fs');
const path = require('path');

const IMAGE_DIR = 'images/original';
const OUTPUT_FILE = 'data/wallpapers.json';

// 扫描图片目录
const files = fs.readdirSync(IMAGE_DIR)
  .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
  .sort((a, b) => {
    // 按数字排序
    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return numA - numB;
  });

// 生成壁纸配置
const wallpapers = files.map((file, index) => ({
  id: String(index + 1),
  name: `春节壁纸 ${String(index + 1).padStart(3, '0')}`,
  preview: `${IMAGE_DIR}/${file}`,
  original: `${IMAGE_DIR}/${file}`,
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
