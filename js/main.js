/**
 * 春节壁纸网站 - 落地页逻辑
 */

// ========================================
// 配置
// ========================================
const PREVIEW_COUNT = 8; // 精选预览数量

// ========================================
// 全局状态
// ========================================
const state = {
  wallpapers: []
};

// ========================================
// DOM 元素
// ========================================
const elements = {
  heroParticles: document.getElementById('heroParticles'),
  previewGrid: document.getElementById('previewGrid'),
  wallpaperCount: document.getElementById('wallpaperCount')
};

// ========================================
// 金色粒子动画系统
// ========================================
function createParticles() {
  if (!elements.heroParticles) return;

  const particleCount = 35;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // 随机位置和动画延迟
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = 6 + Math.random() * 4;
    const size = 2 + Math.random() * 5;

    particle.style.cssText = `
      left: ${left}%;
      bottom: -20px;
      width: ${size}px;
      height: ${size}px;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
    `;

    elements.heroParticles.appendChild(particle);
  }
}

// ========================================
// Hero 手机预览图片
// ========================================
function setupHeroPhones() {
  const phoneScreens = document.querySelectorAll('.phone-screen');
  if (!phoneScreens.length || !state.wallpapers.length) return;

  // 随机选择两张不同的壁纸
  const indices = [];
  while (indices.length < 2 && indices.length < state.wallpapers.length) {
    const idx = Math.floor(Math.random() * state.wallpapers.length);
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
  }

  phoneScreens.forEach((screen, i) => {
    if (indices[i] !== undefined) {
      screen.src = state.wallpapers[indices[i]].preview;
    }
  });
}

// ========================================
// 精选预览网格
// ========================================
function setupPreviewGrid() {
  if (!elements.previewGrid || !state.wallpapers.length) return;

  // 随机选择 8 张壁纸用于预览
  const shuffled = [...state.wallpapers].sort(() => Math.random() - 0.5);
  const previewItems = shuffled.slice(0, PREVIEW_COUNT);

  elements.previewGrid.innerHTML = previewItems.map(wallpaper => `
    <div class="preview-item">
      <img src="${wallpaper.preview}" alt="${wallpaper.name}" loading="lazy">
    </div>
  `).join('');
}

// ========================================
// FAQ 手风琴交互
// ========================================
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // 关闭所有其他 FAQ
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });

      // 切换当前 FAQ
      item.classList.toggle('active', !isActive);
      question.setAttribute('aria-expanded', !isActive);
    });
  });
}

// ========================================
// 平滑滚动导航
// ========================================
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);

      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ========================================
// 滚动触发动画
// ========================================
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 观察需要动画的元素
  document.querySelectorAll('.preview-item, .pricing-card, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// 添加动画类样式
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(animationStyle);

// ========================================
// 数据加载
// ========================================
async function loadWallpapers() {
  try {
    const response = await fetch('data/wallpapers.json');
    const data = await response.json();

    state.wallpapers = data.wallpapers;

    // 更新壁纸数量显示
    if (elements.wallpaperCount) {
      elements.wallpaperCount.textContent = state.wallpapers.length;
    }

    // 设置 Hero 手机预览
    setupHeroPhones();

    // 设置精选预览网格
    setupPreviewGrid();

    // 设置滚动动画（在内容加载后）
    setTimeout(setupScrollAnimations, 100);
  } catch (error) {
    console.error('加载壁纸数据失败:', error);
  }
}

// ========================================
// 初始化
// ========================================
function init() {
  // 创建金色粒子
  createParticles();

  // 设置 FAQ 交互
  setupFAQ();

  // 设置平滑滚动
  setupSmoothScroll();

  // 加载壁纸数据
  loadWallpapers();

  // 禁止拖拽图片
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
}

// 启动
init();
