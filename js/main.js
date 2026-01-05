/**
 * 春节壁纸网站 - 主逻辑
 */

// ========================================
// 全局状态
// ========================================
const state = {
  wallpapers: [],
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
    
    renderWallpapers();
    elements.loading.classList.add('hidden');
  } catch (error) {
    console.error('加载壁纸数据失败:', error);
    elements.loading.innerHTML = '<p>加载失败，请刷新重试</p>';
  }
}

// ========================================
// 渲染壁纸网格
// ========================================
function renderWallpapers() {
  elements.grid.innerHTML = state.wallpapers.map(wallpaper => `
    <div class="wallpaper-card" data-id="${wallpaper.id}">
      <img 
        class="wallpaper-image" 
        src="${wallpaper.preview}" 
        alt="${wallpaper.name}"
        loading="lazy"
        onload="this.classList.add('loaded')"
        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2212%22>加载失败</text></svg>'"
      >
    </div>
  `).join('');
  
  // 绑定点击事件
  elements.grid.querySelectorAll('.wallpaper-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const wallpaper = state.wallpapers.find(w => w.id === id);
      if (wallpaper) openPreview(wallpaper);
    });
  });
}

// ========================================
// 预览弹窗
// ========================================
function openPreview(wallpaper) {
  state.currentWallpaper = wallpaper;
  
  elements.previewImage.src = wallpaper.preview;
  elements.previewName.textContent = wallpaper.name;
  elements.previewSize.textContent = `${wallpaper.width} × ${wallpaper.height}`;
  
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
