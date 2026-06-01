(function () {
  'use strict';

  const members = [
    {
      name: '李紫豪',
      msg: '谢谢你们做我十年里最安心的港湾。写这封信的我，也想对你们说——有你们，我才能一直年少。六一快乐！'
    },
    {
      name: '修伟鑫',
      msg: '从初中到大学，异地再远，假期回家第一个想约的人里一定有你在。下一个十年，继续一起开黑、一起疯！'
    },
    {
      name: '李佳烁',
      msg: '稳重靠谱的你，是我们聚会的定心丸。感谢你对雯惠、也对我们这份友情的守护。老伙计，六一快乐！'
    },
    {
      name: '李泽森',
      msg: '有你在的地方就不缺笑声。那些 KTV 跑调、游戏翻车的瞬间，都是最珍贵的青春纪念。'
    },
    {
      name: '张雯惠',
      msg: '我们四个男生里唯一的公主，温柔又通透。谢谢你见证并参与了这十年的每一个重要时刻。'
    }
  ];

  const pageTitle = document.getElementById('pageTitle');
  const pages = document.querySelectorAll('.page');
  const tabs = document.querySelectorAll('.tab');
  const toast = document.getElementById('toast');
  const blessSheet = document.getElementById('blessSheet');
  const memberSheet = document.getElementById('memberSheet');
  const envelope = document.getElementById('envelope');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');
  const avatarScroll = document.getElementById('avatarScroll');
  const dots = document.querySelectorAll('#scrollDots .dot');

  let toastTimer;
  let confettiPieces = [];
  let confettiRunning = false;
  let petalsRunning = false;

  function addTapEvent(element, handler) {
    if (!element) return;
    let isTouching = false;
    element.addEventListener('touchstart', function() {
      isTouching = true;
    }, { passive: true });
    element.addEventListener('touchend', function(e) {
      e.preventDefault();
      if (isTouching) {
        handler.call(this, e);
        isTouching = false;
      }
    }, { passive: false });
    element.addEventListener('click', function(e) {
      if (!isTouching) {
        handler.call(this, e);
      }
    });
  }

  // ===== Tab 切换 =====
  function goPage(name) {
    pages.forEach((p) => p.classList.toggle('active', p.id === 'page-' + name));
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.page === name));
    const active = document.getElementById('page-' + name);
    if (active) pageTitle.textContent = active.dataset.title || '十年老友';
    if (name === 'story') showTimeline();
  }

  tabs.forEach((tab) => addTapEvent(tab, () => goPage(tab.dataset.page)));

  // ===== Sheet =====
  function openSheet(sheet) {
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet(sheet) {
    sheet.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.sheet-mask').forEach((mask) => {
    mask.addEventListener('click', () => closeSheet(mask.closest('.sheet')));
  });

  // ===== 信封 =====
  addTapEvent(envelope, function() {
    if (!envelope.classList.contains('open')) {
      envelope.classList.add('open');
      spawnPetals(12);
    }
  });

  addTapEvent(document.getElementById('readMore'), function(e) {
    e.stopPropagation();
    openSheet(blessSheet);
  });

  addTapEvent(document.getElementById('acceptBless'), function() {
    closeSheet(blessSheet);
    fireConfetti();
    showToast('心意已收下，六一快乐！🎈');
  });

  // ===== 成员卡片 =====
  document.querySelectorAll('.member-card').forEach((card) => {
    addTapEvent(card, function() {
      const id = parseInt(card.dataset.id, 10);
      const member = members[id];
      const avatarEl = card.querySelector('.anime-avatar').cloneNode(true);
      const container = document.getElementById('sheetAvatar');
      container.innerHTML = '';
      container.appendChild(avatarEl);
      document.getElementById('sheetName').textContent = member.name;
      document.getElementById('sheetMsg').textContent = member.msg;
      openSheet(memberSheet);
    });
  });

  if (avatarScroll) {
    avatarScroll.addEventListener('scroll', () => {
      const card = avatarScroll.querySelector('.member-card');
      if (!card) return;
      const idx = Math.round(avatarScroll.scrollLeft / (card.offsetWidth + 14));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, { passive: true });
  }

  // ===== 回忆卡片 =====
  document.querySelectorAll('.memory-card').forEach((card) => {
    addTapEvent(card, function() {
      showToast(card.dataset.msg);
      spawnPetals(6);
    });
  });

  function celebrate() {
    fireConfetti();
    spawnPetals(20);
    showToast('🎊 十年友情，万岁！六一快乐，老伙计们！');
  }

  addTapEvent(document.getElementById('homeCelebrate'), celebrate);
  addTapEvent(document.getElementById('blessBtn'), function() {
    openSheet(blessSheet);
    spawnPetals(10);
  });

  // ===== Sheet 遮罩点击关闭 =====
  document.querySelectorAll('.sheet-mask').forEach((mask) => {
    addTapEvent(mask, function() {
      closeSheet(mask.closest('.sheet'));
    });
  });

  // ===== 时间线动画 =====
  function showTimeline() {
    document.querySelectorAll('.tl-item[data-animate]').forEach((item, i) => {
      setTimeout(() => item.classList.add('show'), i * 120);
    });
  }

  // ===== Toast =====
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ===== 飘落彩片 =====
  const petalChars = ['🌸', '✨', '💛', '💙', '💗', '🍃', '⭐'];

  function spawnPetals(count) {
    const container = document.getElementById('petals');
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('span');
        el.className = 'petal';
        el.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
        el.style.left = Math.random() * 95 + 2.5 + '%';
        el.style.fontSize = (10 + Math.random() * 14) + 'px';
        el.style.animationDuration = (4 + Math.random() * 4) + 's';
        container.appendChild(el);
        setTimeout(() => el.remove(), 9000);
      }, i * 80);
    }
  }

  function startAmbientPetals() {
    if (petalsRunning) return;
    petalsRunning = true;
    setInterval(() => {
      if (Math.random() > 0.6) spawnPetals(2);
    }, 3000);
  }

  // ===== 撒花 Canvas =====
  function resizeCanvas() {
    const shell = document.querySelector('.phone-shell');
    confettiCanvas.width = shell ? Math.min(shell.offsetWidth, 430) : window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function fireConfetti() {
    resizeCanvas();
    const colors = ['#f4a4b8', '#7ba7d8', '#8ecfaa', '#f5d78e', '#c4b5fd', '#fce4ec'];
    confettiPieces = [];
    for (let i = 0; i < 110; i++) {
      confettiPieces.push({
        x: Math.random() * confettiCanvas.width,
        y: -15 - Math.random() * 80,
        w: 5 + Math.random() * 7,
        h: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 8
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      animateConfetti();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces = confettiPieces.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07;
      p.rot += p.vr;
      if (p.y > confettiCanvas.height + 20) return false;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      return true;
    });
    if (confettiPieces.length) {
      requestAnimationFrame(animateConfetti);
    } else {
      confettiRunning = false;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  window.addEventListener('resize', resizeCanvas);

  // ===== 初始化 =====
  startAmbientPetals();
  setTimeout(() => showToast('👋 轻触信封拆开贺卡，祝老伙计们六一快乐！'), 1400);
})();
