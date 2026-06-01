// 创建粒子效果
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#FF6B6B', '#FFB347', '#FFD93D', '#6BCB77', '#4D96FF', '#FF69B4', '#9B59B6'];
  const emojis = ['🎈', '🎁', '🍭', '🌈', '⭐', '🎉', '🎊'];

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    if (Math.random() > 0.5) {
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.width = '20px';
      particle.style.height = '20px';
    } else {
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    }
    
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (6 + Math.random() * 4) + 's';
    
    container.appendChild(particle);
  }
}

// 点击交互逻辑
function setupInteraction() {
  const card = document.getElementById('card');
  const messageSection = document.getElementById('messageSection');
  const tapHint = document.getElementById('tapHint');
  let isExpanded = false;

  card.addEventListener('click', function(e) {
    e.stopPropagation();
    isExpanded = !isExpanded;
    
    if (isExpanded) {
      messageSection.classList.add('show');
      tapHint.textContent = '👆 点击收起';
    } else {
      messageSection.classList.remove('show');
      tapHint.textContent = '👆 点击查看寄语';
    }
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  setupInteraction();
});

// 微信环境兼容处理
document.addEventListener('WeixinJSBridgeReady', function() {
  console.log('Running in WeChat');
});