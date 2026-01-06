/**
 * 春节壁纸网站 - 主逻辑
 */

// ========================================
// 分页配置
// ========================================
const PAGE_SIZE = 16; // 每次加载的图片数量

// ========================================
// 全局状态
// ========================================
const state = {
  wallpapers: [],
  displayedCount: 0,  // 当前已显示的图片数量
  isLoadingMore: false, // 是否正在加载更多
  password: '',
  isUnlocked: false,
  currentWallpaper: null
};

// ========================================
// DOM 元素
// ========================================
const elements = {
  grid: document.getElementById('wallpaperGrid'),
  loading: document.getElementById('loading'),
  previewModal: document.getElementById('previewModal'),
  previewImage: document.getElementById('previewImage'),
  previewName: document.getElementById('previewName'),
  previewSize: document.getElementById('previewSize'),
  downloadBtn: document.getElementById('downloadBtn'),
  closePreview: document.getElementById('closePreview'),
  passwordModal: document.getElementById('passwordModal'),
  passwordInput: document.getElementById('passwordInput'),
  passwordError: document.getElementById('passwordError'),
  verifyBtn: document.getElementById('verifyBtn'),
  closePassword: document.getElementById('closePassword')
};

// ========================================
// 本地存储 - 记住解锁状态
// ========================================
const storage = {
  KEY: 'wallpaper_unlocked',
  
  isUnlocked() {
    return localStorage.getItem(this.KEY) === 'true';
  },
  
  setUnlocked() {
    localStorage.setItem(this.KEY, 'true');
  }
};

// ========================================
// 数据加载
// ========================================
async function loadWallpapers() {
  try {
    const response = await fetch('data/wallpapers.json');
    const data = await response.json();
    
    state.password = data.password;
    state.wallpapers = data.wallpapers;
    state.isUnlocked = storage.isUnlocked();
    state.displayedCount = 0;
    
    // 初次只加载第一批图片
    renderMoreWallpapers();
    elements.loading.classList.add('hidden');
    
    // 设置无限滚动监听
    setupInfiniteScroll();
  } catch (error) {
    console.error('加载壁纸数据失败:', error);
    elements.loading.innerHTML = '<p>加载失败，请刷新重试</p>';
  }
}

// ========================================
// 渲染更多壁纸（分页加载）
// ========================================
function renderMoreWallpapers() {
  const start = state.displayedCount;
  const end = Math.min(start + PAGE_SIZE, state.wallpapers.length);
  const batch = state.wallpapers.slice(start, end);
  
  if (batch.length === 0) return;
  
  const fragment = document.createDocumentFragment();
  
  batch.forEach(wallpaper => {
    const card = document.createElement('div');
    card.className = 'wallpaper-card';
    card.dataset.id = wallpaper.id;
    card.innerHTML = `
      <img 
        class="wallpaper-image" 
        src="${wallpaper.preview}" 
        alt="${wallpaper.name}"
        loading="lazy"
        onload="this.classList.add('loaded')"
        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>加载失败</text></svg>'"
      >
    `;
    card.addEventListener('click', () => openPreview(wallpaper));
    fragment.appendChild(card);
  });
  
  elements.grid.appendChild(fragment);
  state.displayedCount = end;
  
  // 更新加载状态指示器
  updateLoadingIndicator();
}

// ========================================
// 无限滚动
// ========================================
function setupInfiniteScroll() {
  // 使用 Intersection Observer 监听滚动到底部
  const sentinel = document.createElement('div');
  sentinel.id = 'scroll-sentinel';
  sentinel.style.height = '1px';
  elements.grid.after(sentinel);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !state.isLoadingMore) {
        loadMore();
      }
    });
  }, {
    rootMargin: '200px' // 提前 200px 开始加载
  });
  
  observer.observe(sentinel);
}

// ========================================
// 加载更多
// ========================================
function loadMore() {
  if (state.displayedCount >= state.wallpapers.length) return;
  if (state.isLoadingMore) return;
  
  state.isLoadingMore = true;
  showLoadingMore();
  
  // 模拟短暂延迟，让用户看到加载状态
  setTimeout(() => {
    renderMoreWallpapers();
    state.isLoadingMore = false;
    hideLoadingMore();
  }, 200);
}

// ========================================
// 加载状态指示器
// ========================================
function showLoadingMore() {
  let indicator = document.getElementById('loadMoreIndicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'loadMoreIndicator';
    indicator.className = 'load-more-indicator';
    indicator.innerHTML = `
      <div class="loading-spinner small"></div>
      <span>加载中...</span>
    `;
    document.querySelector('.main .container').appendChild(indicator);
  }
  indicator.classList.add('visible');
}

function hideLoadingMore() {
  const indicator = document.getElementById('loadMoreIndicator');
  if (indicator) {
    indicator.classList.remove('visible');
  }
}

function updateLoadingIndicator() {
  const remaining = state.wallpapers.length - state.displayedCount;
  let indicator = document.getElementById('loadMoreIndicator');
  
  if (remaining <= 0) {
    // 全部加载完毕
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'loadMoreIndicator';
      indicator.className = 'load-more-indicator';
      document.querySelector('.main .container').appendChild(indicator);
    }
    indicator.innerHTML = `<span class="all-loaded">✨ 全部 ${state.wallpapers.length} 张壁纸已加载</span>`;
    indicator.classList.add('visible');
  }
}

// ========================================
// 预览弹窗
// ========================================
function openPreview(wallpaper) {
  state.currentWallpaper = wallpaper;
  
  elements.previewImage.src = wallpaper.preview;
  elements.previewName.textContent = wallpaper.name;
  elements.previewSize.textContent = `${wallpaper.width} × ${wallpaper.height}`;

  // 动态设置按钮文案
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMobile) {
    elements.downloadBtn.innerHTML = '<span class="btn-icon">📱</span> 查看原图（长按保存）';
  } else {
    elements.downloadBtn.innerHTML = '<span class="btn-icon">⬇</span> 查看高清原图';
  }
  
  elements.previewModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  elements.previewModal.classList.remove('active');
  document.body.style.overflow = '';
}

// ========================================
// 密码验证弹窗
// ========================================
function openPasswordModal() {
  elements.passwordInput.value = '';
  elements.passwordError.textContent = '';
  elements.passwordModal.classList.add('active');
  elements.passwordInput.focus();
}

function closePasswordModal() {
  elements.passwordModal.classList.remove('active');
}

function verifyPassword() {
  const input = elements.passwordInput.value.trim();
  
  if (!input) {
    elements.passwordError.textContent = '请输入密码';
    return;
  }
  
  if (input === state.password) {
    state.isUnlocked = true;
    storage.setUnlocked();
    closePasswordModal();
    downloadCurrentWallpaper();
  } else {
    elements.passwordError.textContent = '密码错误，请重试';
    elements.passwordInput.select();
  }
}

// ========================================
// 下载功能
// ========================================
function handleDownload() {
  if (state.isUnlocked) {
    downloadCurrentWallpaper();
  } else {
    openPasswordModal();
  }
}

function downloadCurrentWallpaper() {
  if (!state.currentWallpaper) return;
  
  const url = state.currentWallpaper.original;
  
  // 直接在新标签页打开图片，用户可以右键/长按保存
  window.open(url, '_blank');
}

// ========================================
// 事件绑定
// ========================================
function bindEvents() {
  // 下载按钮
  elements.downloadBtn.addEventListener('click', handleDownload);
  
  // 关闭预览
  elements.closePreview.addEventListener('click', closePreview);
  elements.previewModal.querySelector('.modal-overlay').addEventListener('click', closePreview);
  
  // 关闭密码弹窗
  elements.closePassword.addEventListener('click', closePasswordModal);
  elements.passwordModal.querySelector('.modal-overlay').addEventListener('click', closePasswordModal);
  
  // 验证密码
  elements.verifyBtn.addEventListener('click', verifyPassword);
  elements.passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPassword();
  });
  
  // ESC 关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePreview();
      closePasswordModal();
    }
  });
}

// ========================================
// 初始化
// ========================================
function init() {
  bindEvents();
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
