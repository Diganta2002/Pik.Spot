// ===== PikSpot Dashboard - Interactive Scripts =====

document.addEventListener('DOMContentLoaded', () => {
  initTimestamp();
  initWaveform();
  initNavigation();
  initSidebarTabs();
  initChart();
  initAnimations();
  initCameraNav();
  initVehicleCarousel();
  initTheme();
});

// ===== Live Timestamp =====
function initTimestamp() {
  const el = document.getElementById('live-time');
  if (!el) return;
  function update() {
    const now = new Date();
    const opts = { month: '2-digit', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    el.textContent = now.toLocaleString('en-US', opts);
  }
  update();
  setInterval(update, 1000);
}

// ===== Waveform Animation =====
function initWaveform() {
  const container = document.getElementById('waveform');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const bar = document.createElement('div');
    bar.className = 'bar';
    const h = Math.random() * 18 + 4;
    bar.style.height = h + 'px';
    bar.style.animationDelay = (Math.random() * 1.5) + 's';
    bar.style.animationDuration = (0.6 + Math.random() * 0.8) + 's';
    bar.style.opacity = 0.5 + Math.random() * 0.5;
    container.appendChild(bar);
  }
}

// ===== Navbar Navigation =====
function initNavigation() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  const links = nav.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// ===== Sidebar Tabs =====
function initSidebarTabs() {
  const tabs = document.getElementById('sidebar-tabs');
  if (!tabs) return;
  const btns = tabs.querySelectorAll('button');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ===== Chart (Canvas) =====
function initChart() {
  const canvas = document.getElementById('rental-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  const w = rect.width;
  const h = rect.height;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  // Data
  const data1 = [60, 45, 75, 50, 80, 55];
  const data2 = [40, 65, 35, 70, 45, 75];
  const maxVal = 100;

  function getPoint(index, value) {
    const x = padding.left + (index / (data1.length - 1)) * chartW;
    const y = padding.top + chartH - (value / maxVal) * chartH;
    return { x, y };
  }

  function drawLine(data, color, lineWidth) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    data.forEach((val, i) => {
      const { x, y } = getPoint(i, val);
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prev = getPoint(i - 1, data[i - 1]);
        const cpx1 = prev.x + (x - prev.x) * 0.4;
        const cpx2 = x - (x - prev.x) * 0.4;
        ctx.bezierCurveTo(cpx1, prev.y, cpx2, y, x, y);
      }
    });
    ctx.stroke();
  }

  function drawArea(data, color) {
    ctx.beginPath();
    data.forEach((val, i) => {
      const { x, y } = getPoint(i, val);
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prev = getPoint(i - 1, data[i - 1]);
        const cpx1 = prev.x + (x - prev.x) * 0.4;
        const cpx2 = x - (x - prev.x) * 0.4;
        ctx.bezierCurveTo(cpx1, prev.y, cpx2, y, x, y);
      }
    });
    const lastPt = getPoint(data.length - 1, data[data.length - 1]);
    const firstPt = getPoint(0, data[0]);
    ctx.lineTo(lastPt.x, padding.top + chartH);
    ctx.lineTo(firstPt.x, padding.top + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Read dynamic colors from CSS variables
  const computedStyle = getComputedStyle(document.documentElement);
  const chartGridColor = computedStyle.getPropertyValue('--chart-grid').trim() || 'rgba(0,0,0,0.06)';
  const chartLine2Color = computedStyle.getPropertyValue('--chart-line2').trim() || 'rgba(0,0,0,0.2)';

  // Grid lines
  for (let i = 0; i < 5; i++) {
    const y = padding.top + (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.strokeStyle = chartGridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw areas and lines
  drawArea(data1, 'rgba(139, 92, 246, 0.15)');
  drawArea(data2, 'rgba(236, 72, 153, 0.08)');
  drawLine(data1, '#8b5cf6', 2.5);
  drawLine(data2, chartLine2Color, 1.5);

  // Dots on line1
  data1.forEach((val, i) => {
    const { x, y } = getPoint(i, val);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
  });

  // Highlighted bar for Sep
  const sepX = padding.left + (2 / (data1.length - 1)) * chartW;
  const barW = 28;
  const grad2 = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  grad2.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
  grad2.addColorStop(1, 'rgba(139, 92, 246, 0.02)');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.roundRect(sepX - barW / 2, padding.top, barW, chartH, 6);
  ctx.fill();
}

// ===== Camera Slideshow with Auto-Scroll =====
function initCameraNav() {
  const slides = document.querySelectorAll('.slide-img');
  const dots = document.querySelectorAll('.surveillance-nav .dot-nav');
  const prevBtn = document.getElementById('cam-prev');
  const nextBtn = document.getElementById('cam-next');
  const counterEl = document.getElementById('current-slide-num');
  const surveillanceView = document.getElementById('surveillance-view');
  
  if (!slides.length) return;

  let current = 0;
  const totalSlides = slides.length;
  const autoScrollInterval = 5000; // 5 seconds per slide
  let autoTimer = null;
  let progressTimer = null;

  // Create progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'slide-progress';
  progressBar.style.width = '0%';
  surveillanceView.appendChild(progressBar);

  function goToSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    
    current = ((idx % totalSlides) + totalSlides) % totalSlides;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    
    if (counterEl) counterEl.textContent = current + 1;
    
    // Reset progress bar
    resetProgress();
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function prevSlide() {
    goToSlide(current - 1);
  }

  // Progress bar animation
  function resetProgress() {
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    
    // Force reflow
    progressBar.offsetHeight;
    
    progressBar.style.transition = `width ${autoScrollInterval}ms linear`;
    progressBar.style.width = '100%';
  }

  // Auto-scroll
  function startAutoScroll() {
    stopAutoScroll();
    resetProgress();
    autoTimer = setInterval(() => {
      nextSlide();
    }, autoScrollInterval);
  }

  function stopAutoScroll() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // Restart auto-scroll after manual interaction
  function manualNav(idx) {
    stopAutoScroll();
    goToSlide(idx);
    // Resume auto-scroll after 8 seconds of inactivity
    setTimeout(() => startAutoScroll(), 8000);
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => manualNav(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => manualNav(current + 1));
  
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => manualNav(i));
    dot.style.cursor = 'pointer';
  });

  // Pause auto-scroll on hover
  if (surveillanceView) {
    surveillanceView.addEventListener('mouseenter', () => {
      stopAutoScroll();
      progressBar.style.transition = 'none';
      // Keep current progress width
    });
    surveillanceView.addEventListener('mouseleave', () => {
      startAutoScroll();
    });
  }

  // Start auto-scroll
  startAutoScroll();
}

// ===== Vehicle Carousel =====
function initVehicleCarousel() {
  const slides = document.querySelectorAll('.vehicle-slide');
  const dots = document.querySelectorAll('.v-dot');
  const prevBtn = document.getElementById('car-prev');
  const nextBtn = document.getElementById('car-next');
  const nameEl = document.getElementById('vehicle-name');
  const seatEl = document.getElementById('spec-seat');
  const numberEl = document.getElementById('spec-number');
  const bodyEl = document.getElementById('spec-body');

  if (!slides.length) return;

  let current = 0;
  const total = slides.length;
  let autoTimer = null;

  function goToVehicle(idx) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    current = ((idx % total) + total) % total;
    const activeSlide = slides[current];
    activeSlide.classList.add('active');
    dots[current].classList.add('active');

    // Update specs with smooth fade
    const specEls = [nameEl, seatEl, numberEl, bodyEl];
    specEls.forEach(el => {
      if (el) {
        el.style.transition = 'opacity 0.3s ease';
        el.style.opacity = '0';
      }
    });

    setTimeout(() => {
      if (nameEl) nameEl.textContent = activeSlide.dataset.name;
      if (seatEl) seatEl.textContent = activeSlide.dataset.seat;
      if (numberEl) numberEl.textContent = activeSlide.dataset.number;
      if (bodyEl) bodyEl.textContent = activeSlide.dataset.body;
      specEls.forEach(el => {
        if (el) el.style.opacity = '1';
      });
    }, 300);
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goToVehicle(current + 1), 4000);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function manualGo(idx) {
    stopAuto();
    goToVehicle(idx);
    setTimeout(() => startAuto(), 8000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => manualGo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => manualGo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => manualGo(i)));

  startAuto();
}

// ===== Entrance Animations =====
function initAnimations() {
  const elements = document.querySelectorAll('.glass-card, .car-display, .car-specs, .owner-row, .chart-section, .alert-chip');
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 100 + i * 120);
  });
}

// ===== Theme Toggle =====
function initTheme() {
  const toggleBtn = document.getElementById('btn-theme-toggle');
  if (!toggleBtn) return;

  const updateIcon = (theme) => {
    const svg = toggleBtn.querySelector('svg');
    if (theme === 'light') {
      svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    } else {
      svg.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
  };

  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateIcon(savedTheme);

  toggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let targetTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    updateIcon(targetTheme);
    
    // Redraw the chart with new theme colors
    setTimeout(initChart, 50);
  });
}
