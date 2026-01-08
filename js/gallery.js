/**
 * 壁纸画廊页面 - 专用逻辑
 */

// ========================================
// 分页配置
// ========================================
const PAGE_SIZE = 16;

// ========================================
// 全局状态
// ========================================
const state = {
  wallpapers: [],
  displayedCount: 0,
  isLoadingMore: false,
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
  totalCount: document.getElementById('totalCount'),
  unlockStatus: document.getElementById('unlockStatus'),
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
// 本地存储
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
// 更新解锁状态显示
// ========================================
function updateUnlockStatus() {
  if (elements.unlockStatus) {
    if (state.isUnlocked) {
      elements.unlockStatus.innerHTML = `
        <span class="lock-icon">🔓</span>
        <span class="status-text">已解锁</span>
      `;
      elements.unlockStatus.classList.add('unlocked');
    } else {
      elements.unlockStatus.innerHTML = `
        <span class="lock-icon">🔒</span>
        <span class="status-text">未解锁</span>
      `;
      elements.unlockStatus.classList.remove('unlocked');
    }
  }
}

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

    // 更新壁纸数量
    if (elements.totalCount) {
      elements.totalCount.textContent = state.wallpapers.length;
    }

    // 更新解锁状态
    updateUnlockStatus();

    // 渲染壁纸
    renderMoreWallpapers();
    elements.loading.classList.add('hidden');

    // 设置无限滚动
    setupInfiniteScroll();
  } catch (error) {
    console.error('加载壁纸数据失败:', error);
    elements.loading.innerHTML = '<p>加载失败，请刷新重试</p>';
  }
}

// ========================================
// 渲染壁纸
// ========================================
function renderMoreWallpapers() {
  const start = state.displayedCount;
  const end = Math.min(start + PAGE_SIZE, state.wallpapers.length);
  const batch = state.wallpapers.slice(start, end);

  if (batch.length === 0) return;

  const fragment = document.createDocumentFragment();

  batch.forEach(wallpaper => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
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

  updateLoadingIndicator();
}

// ========================================
// 无限滚动
// ========================================
function setupInfiniteScroll() {
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
    rootMargin: '200px'
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

  setTimeout(() => {
    renderMoreWallpapers();
    state.isLoadingMore = false;
    hideLoadingMore();
  }, 200);
}

// ========================================
// 加载指示器
// ========================================
function showLoadingMore() {
  const indicator = document.getElementById('loadMoreIndicator');
  if (indicator) {
    indicator.innerHTML = `
      <div class="loading-spinner small"></div>
      <span>加载中...</span>
    `;
    indicator.classList.add('visible');
  }
}

function hideLoadingMore() {
  const indicator = document.getElementById('loadMoreIndicator');
  if (indicator) {
    indicator.classList.remove('visible');
  }
}

function updateLoadingIndicator() {
  const remaining = state.wallpapers.length - state.displayedCount;
  const indicator = document.getElementById('loadMoreIndicator');

  if (remaining <= 0 && indicator) {
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
// 密码验证
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
    updateUnlockStatus();
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
  window.open(state.currentWallpaper.original, '_blank');
}

// ========================================
// 事件绑定
// ========================================
function bindEvents() {
  elements.downloadBtn.addEventListener('click', handleDownload);

  elements.closePreview.addEventListener('click', closePreview);
  elements.previewModal.querySelector('.modal-overlay').addEventListener('click', closePreview);

  elements.closePassword.addEventListener('click', closePasswordModal);
  elements.passwordModal.querySelector('.modal-overlay').addEventListener('click', closePasswordModal);

  elements.verifyBtn.addEventListener('click', verifyPassword);
  elements.passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyPassword();
  });

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

  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
}

init();
