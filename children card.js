(function () {
  'use strict';

  // ===== 伙伴数据 =====
  const friends = [
    {
      name: '阿明',
      emoji: '🧑',
      message: '十年了，从高中到各自奋斗，你一直是那个最靠谱的学习搭子。六一快乐，愿我们永远少年！'
    },
    {
      name: '阿强',
      emoji: '👦',
      message: '每次KTV你都是麦霸，聚餐必到！有你在的局从不冷场。六一快乐，兄弟！'
    },
    {
      name: '小杰',
      emoji: '🧒',
      message: '假期召集人非你莫属，游戏开黑、欢乐制造——有你在就有笑声。六一快乐！'
    },
    {
      name: '小雨',
      emoji: '👧',
      message: '四个人的友情里，你是温柔的那道光。十年见证，未来继续一起走下去。六一快乐！'
    }
  ];

  const momentMessages = {
    study: '📚 各自学校，认真上课从不逃课——这才是真·少年意气！',
    food: '🍜 火锅、烧烤、小馆子……哪顿聚餐不是满满的回忆？',
    ktv: '🎤 麦克风递过来，谁还不是个隐藏歌手！',
    game: '🎮 开黑、上分、笑到肚子疼——最佳队友就是你！'
  };

  // ===== DOM =====
  const blessingModal = document.getElementById('blessingModal');
  const friendModal = document.getElementById('friendModal');
  const toast = document.getElementById('toast');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');

  // ===== 初始化星星背景 =====
  function initStars() {
    const starField = document.getElementById('starField');
    const emojis = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < 18; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      star.style.fontSize = (8 + Math.random() * 10) + 'px';
      starField.appendChild(star);
    }
  }

  // ===== 气球 =====
  function createBalloon() {
    const container = document.getElementById('balloons');
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    const emojis = ['🎈', '🎀', '💛', '💚', '💙', '💜'];
    balloon.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    balloon.style.left = Math.random() * 90 + 5 + '%';
    balloon.style.animationDuration = (6 + Math.random() * 6) + 's';
    container.appendChild(balloon);
    setTimeout(() => balloon.remove(), 12000);
  }

  function launchBalloons(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(createBalloon, i * 200);
    }
  }

  // ===== 弹窗控制 =====
  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('openBlessing').addEventListener('click', () => {
    openModal(blessingModal);
    launchBalloons(5);
  });

  document.getElementById('closeModal').addEventListener('click', () => closeModal(blessingModal));
  document.getElementById('modalCelebrate').addEventListener('click', () => {
    closeModal(blessingModal);
    fireConfetti();
    showToast('祝福已收下，六一快乐！🎉');
  });

  blessingModal.addEventListener('click', (e) => {
    if (e.target === blessingModal) closeModal(blessingModal);
  });

  // ===== 伙伴卡片 =====
  document.querySelectorAll('.friend-card').forEach((card) => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.friend, 10);
      const friend = friends[index];
      card.classList.add('clicked');
      setTimeout(() => card.classList.remove('clicked'), 500);

      document.getElementById('friendModalEmoji').textContent = friend.emoji;
      document.getElementById('friendModalName').textContent = friend.name;
      document.getElementById('friendModalText').textContent = friend.message;
      openModal(friendModal);
    });
  });

  document.getElementById('closeFriendModal').addEventListener('click', () => closeModal(friendModal));
  friendModal.addEventListener('click', (e) => {
    if (e.target === friendModal) closeModal(friendModal);
  });

  // ===== 欢乐瞬间 =====
  document.querySelectorAll('.moment-card').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.moment;
      showToast(momentMessages[key] || '🎈 欢乐无限！');
      card.style.borderColor = 'var(--accent)';
      setTimeout(() => { card.style.borderColor = 'transparent'; }, 600);
    });
  });

  // ===== Toast =====
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ===== 时间线滚动动画 =====
  const timelineItems = document.querySelectorAll('.timeline-item[data-animate]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 120);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
  );
  timelineItems.forEach((item) => observer.observe(item));

  // ===== 撒花 =====
  let confettiPieces = [];
  let confettiAnimating = false;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function fireConfetti() {
    resizeCanvas();
    const colors = ['#f4a4b8', '#7c9cbf', '#86efac', '#fde68a', '#c4b5fd', '#fcd5e0'];
    confettiPieces = [];
    for (let i = 0; i < 120; i++) {
      confettiPieces.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 100,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }
    if (!confettiAnimating) {
      confettiAnimating = true;
      animateConfetti();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.rotation += p.vr;
      if (p.y > confettiCanvas.height + 20) return false;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      return true;
    });

    if (confettiPieces.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimating = false;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  document.getElementById('celebrateBtn').addEventListener('click', () => {
    fireConfetti();
    launchBalloons(8);
    showToast('🎊 十年友情，万岁！六一快乐！');
  });

  window.addEventListener('resize', resizeCanvas);

  // ===== 初始化 =====
  initStars();
  setInterval(() => {
    if (Math.random() > 0.7) createBalloon();
  }, 4000);

  // 页面加载完成后轻微延迟弹出提示
  setTimeout(() => {
    showToast('👋 欢迎来到我们的十年故事，点击探索吧！');
  }, 1500);
})();
