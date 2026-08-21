'use strict';

// ============================================================
// Profile avatar 3D mouse tracking (hero tilt)
// ============================================================
document.addEventListener('mousemove', (e) => {
  const avatars = document.querySelectorAll('.avatar-box');
  if (!avatars.length) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  avatars.forEach(avatar => {
    const rect = avatar.getBoundingClientRect();
    const avatarCenterX = rect.left + rect.width / 2;
    const avatarCenterY = rect.top + rect.height / 2;

    const deltaX = mouseX - avatarCenterX;
    const deltaY = mouseY - avatarCenterY;

    const rotateX = (deltaY / window.innerHeight) * -45;
    const rotateY = (deltaX / window.innerWidth) * 45;

    const clampX = Math.max(-25, Math.min(25, rotateX));
    const clampY = Math.max(-25, Math.min(25, rotateY));

    avatar.style.transform = `perspective(800px) rotateX(${clampX}deg) rotateY(${clampY}deg) scale3d(1.05, 1.05, 1.05)`;
  });
});

document.addEventListener('mouseleave', () => {
  const avatars = document.querySelectorAll('.avatar-box');
  avatars.forEach(avatar => {
    avatar.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
});



// ============================================================
// Marquee — click-to-copy a random tagline
// The seamless scroll loop itself is pure CSS (two rendered copies
// of the same content, see marquee-items.njk); this just adds the
// small click-to-copy easter egg the old scrolling banner had.
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  const marquee = document.querySelector('.marquee');
  if (!marquee) return;

  marquee.addEventListener('click', function () {
    const quotes = [
      "This site is more than a portfolio - it's a blueprint of how I think and build.",
      "I believe great products live at the intersection of design, data, and human behavior.",
      "I lead with systems thinking, design clarity, and an obsession with outcomes.",
      "I've scaled data platforms, mentored engineering teams, and delivered GenAI capability.",
      "My approach blends aesthetics with architecture - built to solve, not just impress.",
      "I'm here to create lasting impact through meaningful, intelligent work.",
      "Somewhere in this site, there's an easter egg - because great design rewards those who explore."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    if (navigator.clipboard) {
      navigator.clipboard.writeText(randomQuote).then(() => {
        console.log('Quote copied to clipboard:', randomQuote);
      });
    }
  });
});



// ============================================================
// Scroll to Top Button - Easter Egg Style (unrelated, untouched)
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  const scrollButton = document.createElement('div');
  scrollButton.className = 'scroll-to-top';
  scrollButton.innerHTML = '<i data-lucide="chevron-up" width="24" height="24" stroke-width="2"></i>';
  document.body.appendChild(scrollButton);
  if (window.lucide) window.lucide.createIcons();

  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
      scrollButton.classList.add('visible');
    } else {
      scrollButton.classList.remove('visible');
    }
  });

  scrollButton.addEventListener('click', function () {
    this.classList.add('clicked');

    setTimeout(() => {
      this.classList.remove('clicked');
    }, 600);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  scrollButton.addEventListener('mouseenter', function () {
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        // Silently fail if audio is not supported
      }
    }
  });
});



// ============================================================
// Konami Code Easter Egg - ↑↑↓↓←→←→BA (unrelated, untouched)
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  const konamiCode = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  let userInput = [];
  let konamiActivated = false;

  document.addEventListener('keydown', function (e) {
    userInput.push(e.code);

    if (userInput.length > konamiCode.length) {
      userInput = userInput.slice(-konamiCode.length);
    }

    if (userInput.length === konamiCode.length &&
      userInput.every((key, index) => key === konamiCode[index])) {

      if (!konamiActivated) {
        activateKonamiMode();
        konamiActivated = true;
      }
    }
  });

  function activateKonamiMode() {
    showKonamiNotification();
    document.body.classList.add('konami-activated');
    enableEnhancedAnimations();

    setTimeout(() => {
      showBraunSecrets();
    }, 2000);

    playKonamiSound();
  }

  function showKonamiNotification() {
    const notification = document.createElement('div');
    notification.className = 'konami-notification';
    notification.innerHTML = `
      <div class="konami-content">
        <h3>🎉 Design Mode Activated!</h3>
        <p>You've unlocked the secret Braun design experience</p>
        <div class="konami-subtitle">Dieter Rams would be proud</div>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 4000);
  }

  function enableEnhancedAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .konami-activated .project-card:hover {
        transform: translateY(-8px) scale(1.02) rotate(0.5deg);
      }

      .konami-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--surface);
        border: 2px solid #ff4a00;
        border-radius: var(--radius-lg);
        padding: 30px;
        box-shadow: 0 10px 40px rgba(255, 74, 0, 0.3);
        z-index: 10000;
        text-align: center;
        animation: konamiPop 4s ease forwards;
      }

      .konami-content h3 {
        color: #ff4a00;
        font-family: var(--ff-mono);
        margin-bottom: 10px;
      }

      .konami-content p {
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .konami-subtitle {
        font-style: italic;
        color: var(--text-secondary);
        font-size: var(--fs-7);
      }

      @keyframes konamiPop {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5) rotate(-5deg);
        }
        20% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.1) rotate(2deg);
        }
        40% {
          transform: translate(-50%, -50%) scale(0.95) rotate(-1deg);
        }
        60% {
          transform: translate(-50%, -50%) scale(1.02) rotate(0.5deg);
        }
        80% {
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
        90% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.8) rotate(0deg);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function showBraunSecrets() {
    const designQuotes = [
      "Good design is as little design as possible - Dieter Rams",
      "Less but better - Weniger aber besser",
      "Good design is innovative, useful, aesthetic, understandable, unobtrusive, honest, long-lasting, thorough, environmentally friendly, and as little design as possible",
      "A product is bought to be used. It has to serve a defined purpose"
    ];

    const randomQuote = designQuotes[Math.floor(Math.random() * designQuotes.length)];

    const quote = document.createElement('div');
    quote.className = 'floating-quote';
    quote.textContent = randomQuote;
    quote.style.cssText = `
      position: fixed;
      top: 20%;
      right: 20px;
      max-width: 300px;
      background: rgba(255, 74, 0, 0.95);
      color: white;
      padding: 15px;
      border-radius: var(--radius-md);
      font-family: var(--ff-mono);
      font-size: var(--fs-7);
      z-index: 9999;
      animation: floatIn 3s ease;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    `;

    const floatInKeyframes = `
      @keyframes floatIn {
        0% { opacity: 0; transform: translateX(100px) rotate(5deg); }
        100% { opacity: 1; transform: translateX(0) rotate(0deg); }
      }
    `;

    const style = document.createElement('style');
    style.textContent = floatInKeyframes;
    document.head.appendChild(style);

    document.body.appendChild(quote);

    setTimeout(() => {
      quote.remove();
    }, 5000);
  }

  function playKonamiSound() {
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale

        notes.forEach((freq, index) => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.15);
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0, audioCtx.currentTime + index * 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + index * 0.15 + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.15 + 0.3);

          oscillator.start(audioCtx.currentTime + index * 0.15);
          oscillator.stop(audioCtx.currentTime + index * 0.15 + 0.3);
        });
      } catch (e) {
        console.log('Audio not supported for Konami sound');
      }
    }
  }
});
