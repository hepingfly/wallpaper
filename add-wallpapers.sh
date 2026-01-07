#!/bin/bash

# ========================================
# 壁纸自动化添加脚本
# ========================================
# 功能：
#   1. 扫描 new-images/ 文件夹中的 PNG 图片
#   2. 自动编号并重命名
#   3. 更新 images.txt
#   4. 生成配置文件
#   5. 上传到 Cloudflare R2
#   6. Git commit 和 push
# ========================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
NEW_IMAGES_DIR="new-images"
IMAGES_TXT="images.txt"
R2_REMOTE="cloudflarer2:wallpaper"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}壁纸自动化添加脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 检查 new-images 文件夹是否存在
if [ ! -d "$NEW_IMAGES_DIR" ]; then
    echo -e "${YELLOW}📁 创建 $NEW_IMAGES_DIR 文件夹...${NC}"
    mkdir -p "$NEW_IMAGES_DIR"
fi

# 2. 检查是否有新图片
shopt -s nullglob  # 如果没有匹配的文件，返回空数组
NEW_IMAGES=("$NEW_IMAGES_DIR"/*.png)
shopt -u nullglob

if [ ${#NEW_IMAGES[@]} -eq 0 ]; then
    echo -e "${RED}❌ $NEW_IMAGES_DIR 文件夹中没有找到 PNG 图片${NC}"
    echo -e "${YELLOW}请将新图片放入 $NEW_IMAGES_DIR 文件夹后再运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 找到 ${#NEW_IMAGES[@]} 张新图片${NC}"

# 3. 找到当前最大编号
echo -e "${YELLOW}🔍 查找当前最大编号...${NC}"

# 从 images.txt 中提取所有数字编号
MAX_NUM=0
while IFS= read -r line; do
    # 跳过空行和注释
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    
    # 提取文件名中的数字部分
    if [[ "$line" =~ ^([0-9]+)\.png$ ]]; then
        NUM="${BASH_REMATCH[1]}"
        if [ "$NUM" -gt "$MAX_NUM" ]; then
            MAX_NUM=$NUM
        fi
    fi
done < "$IMAGES_TXT"

NEXT_NUM=$((MAX_NUM + 1))
echo -e "${GREEN}📊 当前最大编号: $MAX_NUM, 新图片将从 $NEXT_NUM 开始编号${NC}"

# 4. 重命名图片并记录
echo -e "${YELLOW}🔄 重命名图片...${NC}"

RENAMED_FILES=()
CURRENT_NUM=$NEXT_NUM

for img in "${NEW_IMAGES[@]}"; do
    NEW_NAME="${CURRENT_NUM}.png"
    NEW_PATH="$NEW_IMAGES_DIR/$NEW_NAME"
    
    mv "$img" "$NEW_PATH"
    RENAMED_FILES+=("$NEW_NAME")
    
    echo -e "  ${GREEN}✓${NC} $(basename "$img") → $NEW_NAME"
    CURRENT_NUM=$((CURRENT_NUM + 1))
done

# 5. 更新 images.txt
echo -e "${YELLOW}📝 更新 $IMAGES_TXT...${NC}"

for file in "${RENAMED_FILES[@]}"; do
    echo "$file" >> "$IMAGES_TXT"
    echo -e "  ${GREEN}✓${NC} 添加 $file"
done

# 6. 生成配置文件
echo -e "${YELLOW}⚙️  生成配置文件...${NC}"
node generate-config.js

# 7. 上传到 Cloudflare R2
echo -e "${YELLOW}☁️  上传图片到 Cloudflare R2...${NC}"

for file in "${RENAMED_FILES[@]}"; do
    echo -e "  ${YELLOW}↗${NC} 上传 $file..."
    rclone copy "$NEW_IMAGES_DIR/$file" "$R2_REMOTE/" --progress
    echo -e "  ${GREEN}✓${NC} $file 上传成功"
done

# 8. Git commit 和 push
echo -e "${YELLOW}📦 提交到 Git...${NC}"

# 构建 commit message
if [ ${#RENAMED_FILES[@]} -eq 1 ]; then
    COMMIT_MSG="添加了 ${RENAMED_FILES[0]} 等${#RENAMED_FILES[@]}张壁纸"
elif [ ${#RENAMED_FILES[@]} -eq 2 ]; then
    COMMIT_MSG="添加了 ${RENAMED_FILES[0]}、${RENAMED_FILES[1]} 等${#RENAMED_FILES[@]}张壁纸"
else
    # 超过2张，只列出前两张
    COMMIT_MSG="添加了 ${RENAMED_FILES[0]}、${RENAMED_FILES[1]} 等${#RENAMED_FILES[@]}张壁纸"
fi

git add .
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓ Commit: $COMMIT_MSG${NC}"

echo -e "${YELLOW}🚀 推送到远程仓库...${NC}"
if ! git push 2>/dev/null; then
    echo -e "${YELLOW}⚠️  首次推送，设置上游分支...${NC}"
    git push --set-upstream origin main
fi
echo -e "${GREEN}✓ Push 成功${NC}"

# 9. 清空 new-images 文件夹
echo -e "${YELLOW}🧹 清空 $NEW_IMAGES_DIR 文件夹...${NC}"
rm -f "$NEW_IMAGES_DIR"/*.png
echo -e "${GREEN}✓ 已清空${NC}"

# 完成
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ 全部完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "新增壁纸数量: ${#RENAMED_FILES[@]}"
echo -e "壁纸编号: $NEXT_NUM - $((CURRENT_NUM - 1))"
echo -e "已上传到 R2 并推送到 Git"
echo ""
