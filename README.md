# 春节壁纸精选 🧧

极简高质量春节壁纸下载站，一次付费终身下载。

## 功能特性

- 📱 响应式设计，完美适配手机和电脑
- 🖼️ 壁纸瀑布流展示（无限滚动加载）
- � Cloudflare 图片自动压缩与优化
- �🔍 点击预览大图
- 🔐 密码保护下载

## 快速开始

### 本地预览

```bash
# 方式1：使用 serve（推荐）
npx serve .

# 方式2：使用 Python
python3 -m http.server 8000
```

然后访问 http://localhost:3000 或 http://localhost:3000

### 添加壁纸

**方式 1：自动化脚本（推荐）**

只需 2 步即可完成所有操作：

1. 将新壁纸（PNG 格式）放入 `new-images/` 文件夹
2. 运行脚本：

```bash
./add-wallpapers.sh
```

脚本会自动完成：

- ✅ 自动编号重命名（从当前最大编号+1 开始）
- ✅ 更新 `images.txt`
- ✅ 生成配置文件
- ✅ 上传到 Cloudflare R2
- ✅ Git commit 和 push

**方式 2：手动操作**

如果需要手动添加：

1. 将图片上传到 Cloudflare R2 存储桶
2. 在 `images.txt` 末尾添加新图片的文件名
3. 运行脚本自动生成配置（包含 CDN 优化参数）：

```bash
node generate-config.js
```

4. 提交并推送到 GitHub：

```bash
git add .
git commit -m "新增壁纸"
git push origin main
```

### 修改密码

编辑 `data/wallpapers.json` 中的 `password` 字段：

```json
{
  "password": "你的新密码",
  ...
}
```

## 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 上传所有文件
3. 进入仓库 Settings → Pages
4. Source 选择 "Deploy from a branch"
5. Branch 选择 main，文件夹选择 / (root)
6. 保存后等待部署完成

## 项目结构

```
wallpaper/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式
├── js/
│   └── main.js         # 逻辑
├── images/
│   ├── preview/        # 预览图
│   └── original/       # 原图
└── data/
    └── wallpapers.json # 壁纸数据
```

## 小红书运营建议

- 定价：9.9-19.9 元
- 文案重点：精选、高清、无水印
- 用户购买后私信发送密码

---

© 2026 春节壁纸精选
