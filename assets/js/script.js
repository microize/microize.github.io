'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
if (modalCloseBtn) modalCloseBtn.addEventListener("click", testimonialsModalFunc);
if (overlay) overlay.addEventListener("click", testimonialsModalFunc);


// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select) select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
if (selectItems && selectValue && select) {
  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {

      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);

    });
  }
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {
    const itemCategory = filterItems[i].dataset.category;

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === itemCategory) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn && filterBtn.length > 0 ? filterBtn[0] : null;

if (filterBtn && filterBtn.length > 0) {
for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    if (lastClickedBtn) lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}
}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
if (form && formInputs && formBtn) {
  for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {

      // check form validation
      if (form.checkValidity()) {
        formBtn.removeAttribute("disabled");
      } else {
        formBtn.setAttribute("disabled", "");
      }

    });
  }
}



// Navigation from Blog page to Main page sections
const blogNavLinks = document.querySelectorAll('a[data-section]');
if (blogNavLinks.length > 0) {
  blogNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('data-section');
      // Navigate to main page with hash
      window.location.href = `/#${section}`;
    });
  });
}

// Blog Search and Filter Functionality
const blogSearch = document.getElementById('blogSearch');
const filterTags = document.querySelectorAll('.filter-tag');
const blogCards = document.querySelectorAll('.blog-card');

if (blogSearch && filterTags.length > 0 && blogCards.length > 0) {
  // Search functionality
  blogSearch.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterBlogPosts(searchTerm, getActiveFilter());
  });

  // Filter functionality
  filterTags.forEach(tag => {
    tag.addEventListener('click', function() {
      // Update active filter
      filterTags.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const filterValue = this.getAttribute('data-filter');
      const searchTerm = blogSearch.value.toLowerCase();
      filterBlogPosts(searchTerm, filterValue);
    });
  });

  function getActiveFilter() {
    const activeFilter = document.querySelector('.filter-tag.active');
    return activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
  }

  function filterBlogPosts(searchTerm, filterValue) {
    let visibleCount = 0;

    blogCards.forEach(card => {
      const title = card.querySelector('.blog-card-title a').textContent.toLowerCase();
      const tags = card.getAttribute('data-tags') || '';
      
      const matchesSearch = !searchTerm || 
        title.includes(searchTerm) || 
        tags.toLowerCase().includes(searchTerm);
      
      const matchesFilter = filterValue === 'all' || 
        tags.toLowerCase().includes(filterValue.toLowerCase());

      if (matchesSearch && matchesFilter) {
        card.closest('.blog-post-item').style.display = 'block';
        visibleCount++;
      } else {
        card.closest('.blog-post-item').style.display = 'none';
      }
    });

    // Show/hide empty state
    const emptyState = document.querySelector('.empty-state');
    const blogPostsList = document.querySelector('.blog-posts-list');
    
    if (visibleCount === 0 && emptyState) {
      emptyState.style.display = 'block';
      if (blogPostsList) blogPostsList.style.display = 'none';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (blogPostsList) blogPostsList.style.display = 'grid';
    }
  }
}

// Enhanced Scrolling Banner with Perfect Endless Loop
document.addEventListener('DOMContentLoaded', function() {
  const banner = document.querySelector('.scrolling-banner');
  const bannerText = document.getElementById('banner-text');
  
  if (banner && bannerText) {
    // Create perfect endless scroll by duplicating content
    const originalContent = bannerText.innerHTML;
    bannerText.innerHTML = originalContent + originalContent + originalContent;
    
    // Enhanced click to copy functionality
    banner.addEventListener('click', function() {
      const quotes = [
        "This site is more than a portfolio - it's a blueprint of how I think and build.",
        "I believe great products live at the intersection of design, data, and human behavior.",
        "I lead with systems thinking, design clarity, and an obsession with outcomes.",
        "I’ve scaled data platforms, mentored engineering teams, and delivered GenAI capability.",
        "My approach blends aesthetics with architecture - built to solve, not just impress.",
        "I'm here to create lasting impact through meaningful, intelligent work.",
        "Somewhere in this site, there’s an easter egg - because great design rewards those who explore."
              ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(randomQuote).then(() => {
          console.log('Quote copied to clipboard:', randomQuote);
        });
      }
    });
    
  }
});

// MP3 Audio functionality for title-braun click
document.addEventListener('DOMContentLoaded', function() {
  const titleBraun = document.querySelector('.title-braun');
  let audio = null;
  let isPlaying = false;

  if (titleBraun) {
    titleBraun.addEventListener('click', function() {
      if (!isPlaying) {
        playMP3();
        this.style.background = 'var(--primary)';
        this.style.color = '#fff';
        this.textContent = 'Playing...';
      } else {
        stopMP3();
        this.style.background = 'var(--surface)';
        this.style.color = 'var(--text-secondary)';
        this.textContent = 'Senior Data Engineer';
      }
    });
  }

  function playMP3() {
    try {
      // Create audio element and play song_1.mp3
      audio = new Audio('/assets/audio/song_1.mp3');
      audio.volume = 0.7; // Set volume to 70%
      
      // Handle when song ends
      audio.addEventListener('ended', function() {
        stopMP3();
      });
      
      // Handle loading errors
      audio.addEventListener('error', function() {
        console.log('Audio file not found or failed to load');
        stopMP3();
      });
      
      audio.play();
      isPlaying = true;
      
    } catch (error) {
      console.log('Audio not supported');
      // Fallback visual feedback
      titleBraun.style.background = 'var(--primary)';
      titleBraun.style.color = '#fff';
      setTimeout(() => {
        titleBraun.style.background = 'var(--surface)';
        titleBraun.style.color = 'var(--text-secondary)';
        titleBraun.textContent = 'Senior Data Engineer';
      }, 2000);
    }
  }
  
  function stopMP3() {
    isPlaying = false;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    
    // Reset visual state
    titleBraun.style.background = 'var(--surface)';
    titleBraun.style.color = 'var(--text-secondary)';
    titleBraun.textContent = 'Senior Data Engineer';
  }
});

// Scroll to Top Button - Easter Egg Style
document.addEventListener('DOMContentLoaded', function() {
  // Create scroll to top button
  const scrollButton = document.createElement('div');
  scrollButton.className = 'scroll-to-top';
  scrollButton.innerHTML = '<ion-icon name="chevron-up-outline"></ion-icon>';
  document.body.appendChild(scrollButton);

  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollButton.classList.add('visible');
    } else {
      scrollButton.classList.remove('visible');
    }
  });

  // Easter egg click animation and scroll functionality
  scrollButton.addEventListener('click', function() {
    // Add easter egg animation
    this.classList.add('clicked');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      this.classList.remove('clicked');
    }, 600);

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Optional: Add a subtle hover sound effect (very quiet)
  scrollButton.addEventListener('mouseenter', function() {
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


// Reading Time Calculator
document.addEventListener('DOMContentLoaded', function() {
  const readingTimeElements = document.querySelectorAll('.reading-time');
  
  readingTimeElements.forEach(function(element) {
    const content = element.getAttribute('data-content');
    if (content) {
      const readingTime = calculateReadingTime(content);
      element.textContent = readingTime;
    } else {
      // For blog listing pages, calculate from the content on the page
      const blogContent = document.querySelector('.blog-content');
      if (blogContent) {
        const readingTime = calculateReadingTime(blogContent.textContent);
        element.textContent = readingTime;
      }
    }
  });
  
  function calculateReadingTime(text) {
    // Remove HTML tags and get plain text
    const plainText = text.replace(/<[^>]*>/g, '');
    
    // Count words (split by whitespace and filter empty strings)
    const words = plainText.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    if (minutes === 1) {
      return '1 min read';
    } else if (minutes < 1) {
      return '< 1 min read';
    } else {
      return `${minutes} min read`;
    }
  }
});

// Related Posts Functionality
document.addEventListener('DOMContentLoaded', function() {
  const relatedPostsGrid = document.querySelector('.related-posts-grid');
  
  if (relatedPostsGrid) {
    const currentTags = relatedPostsGrid.getAttribute('data-current-tags');
    const currentSlug = relatedPostsGrid.getAttribute('data-current-slug');
    
    // Your actual blog posts data
    const allPosts = [
      {
        title: 'Avoiding AI Bottlenecks: How I Fixed API Call Chaos on Azure and Boosted Generative AI Performance',
        slug: 'avoiding-ai-bottlenecks-azure-api-optimization',
        date: '2025-01-29',
        excerpt: 'Learn how to fix API call chaos and boost Generative AI performance through smarter API management and Azure optimization techniques.',
        tags: ['azure-openai', 'api-optimization', 'generative-ai', 'performance', 'cost-optimization']
      },
      {
        title: 'Breaking Boundaries: Stepping Out of My Comfort Zone',
        slug: 'breaking-boundaries-comfort-zone-hackathon',
        date: '2024-12-15',
        excerpt: 'My journey through a UI/UX hackathon where I embraced new challenges, learned Figma and React, and discovered the transformative power of stepping outside your comfort zone.',
        tags: ['hackathon', 'ui-ux-design', 'personal-growth', 'react', 'figma', 'comfort-zone']
      },
      {
        title: 'Branding: Redefining Trust and Reliability for Vaidya.ai',
        slug: 'branding-trust-reliability-vaidya-ai',
        date: '2024-12-15',
        excerpt: 'How our team created a trustworthy brand identity for Vaidya.ai through strategic design choices, clinical-grade aesthetics, and user-centered approach during the hackathon.',
        tags: ['branding', 'ui-ux-design', 'trust-design', 'medical-app', 'vaidya-ai', 'hackathon']
      }
    ];
    
    // Find related posts based on shared tags
    const currentTagsArray = currentTags ? currentTags.split(',') : [];
    const relatedPosts = findRelatedPosts(allPosts, currentTagsArray, currentSlug);
    
    // Display related posts
    displayRelatedPosts(relatedPosts, relatedPostsGrid);
  }
  
  function findRelatedPosts(posts, currentTags, currentSlug, maxResults = 2) {
    // Filter out current post first
    const otherPosts = posts.filter(post => post.slug !== currentSlug);
    
    // Score posts based on shared tags
    const scored = otherPosts.map(post => {
      const commonTags = post.tags.filter(tag => currentTags.includes(tag));
      return {
        ...post,
        score: commonTags.length
      };
    });
    
    // Sort by relevance (posts with shared tags first, then by date)
    scored.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Higher score first
      }
      return new Date(b.date) - new Date(a.date); // Newer posts first if same score
    });
    
    // Return up to maxResults posts (or all available if fewer)
    return scored.slice(0, Math.min(maxResults, scored.length));
  }
  
  function displayRelatedPosts(posts, container) {
    if (posts.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No related articles found.</p>';
      return;
    }
    
    const postsHTML = posts.map(post => `
      <a href="/blog/${post.slug}/" class="related-post-card">
        <h4 class="related-post-title">${post.title}</h4>
        <div class="related-post-meta">${formatDate(post.date)}</div>
        <p class="related-post-excerpt">${post.excerpt}</p>
        <div class="related-post-tags">
          ${post.tags.slice(0, 3).map(tag => `<span class="related-post-tag">${tag}</span>`).join('')}
        </div>
      </a>
    `).join('');
    
    container.innerHTML = postsHTML;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
});

// Scroll-triggered Animations and Micro-interactions
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Add animation classes and make all elements visible immediately
  function initScrollAnimations() {
    // Portfolio items - show immediately without scroll trigger
    const portfolioItems = document.querySelectorAll('.project-item');
    portfolioItems.forEach((item, index) => {
      item.classList.add('fade-in-up', 'visible');
      item.style.transitionDelay = `${index * 0.1}s`;
    });

    // Blog cards - show immediately without scroll trigger
    const blogCards = document.querySelectorAll('.blog-card');
    blogCards.forEach((card, index) => {
      card.classList.add('fade-in-up', 'visible');
      card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Skills sections - show immediately without scroll trigger
    const skillSections = document.querySelectorAll('.skills-grid');
    skillSections.forEach((section, index) => {
      section.classList.add(index % 2 === 0 ? 'fade-in-left' : 'fade-in-right', 'visible');
    });

    // Timeline items - load all at once (scroll animation removed)
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });

    // Related posts - show immediately without scroll trigger
    const relatedPosts = document.querySelectorAll('.related-post-card');
    relatedPosts.forEach((post, index) => {
      post.classList.add('scale-in', 'visible');
      post.style.transitionDelay = `${index * 0.1}s`;
    });
  }

  // Enhanced image loading with fade-in effect and lazy loading
  function initImageLoading() {
    const images = document.querySelectorAll('img');
    
    // Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load the image if it has a data-src attribute
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Stop observing this image
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    images.forEach(img => {
      img.setAttribute('data-loaded', 'false');
      
      // Set up lazy loading for images not in viewport
      if (img.getBoundingClientRect().top > window.innerHeight) {
        img.dataset.src = img.src;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        imageObserver.observe(img);
      }
      
      if (img.complete) {
        img.setAttribute('data-loaded', 'true');
      } else {
        img.addEventListener('load', function() {
          this.setAttribute('data-loaded', 'true');
        });
      }
    });
  }

  // Enhanced button interactions
  function initButtonInteractions() {
    const buttons = document.querySelectorAll('button, .braun-button, .filter-tag');
    buttons.forEach(button => {
      button.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
      });
      
      button.addEventListener('mouseup', function() {
        this.style.transform = '';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  // Smooth scrolling for internal links
  function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Accessibility enhancements
  function initAccessibility() {
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      left: -9999px;
      z-index: 999999;
      padding: 8px 16px;
      background: var(--primary);
      color: white;
      text-decoration: none;
      font-family: var(--ff-mono);
    `;
    skipLink.addEventListener('focus', function() {
      this.style.left = '10px';
      this.style.top = '10px';
    });
    skipLink.addEventListener('blur', function() {
      this.style.left = '-9999px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content ID if it doesn't exist
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }

    // Enhanced focus management
    document.addEventListener('keydown', function(e) {
      // ESC key to close modals or overlays
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active, .overlay.active');
        if (activeModal) {
          activeModal.classList.remove('active');
        }
      }
    });

    // Add ARIA labels to interactive elements without them
    const interactiveElements = document.querySelectorAll('button:not([aria-label]), a:not([aria-label])');
    interactiveElements.forEach(el => {
      if (!el.textContent.trim() && !el.getAttribute('aria-label')) {
        // Try to get context from parent or nearby elements
        const context = el.closest('[data-section]')?.getAttribute('data-section') || 
                       el.className.split(' ')[0] || 
                       'Interactive element';
        el.setAttribute('aria-label', context);
      }
    });

    // Improve form accessibility
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
      const label = input.previousElementSibling;
      if (label && label.tagName === 'LABEL' && !input.id) {
        const id = 'input-' + Math.random().toString(36).substr(2, 9);
        input.id = id;
        label.setAttribute('for', id);
      }
    });
  }

  // Initialize all micro-interactions
  initScrollAnimations();
  initImageLoading();
  initButtonInteractions();
  initSmoothScrolling();
  initAccessibility();

  // Make new elements visible immediately when added (for dynamic content)
  const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const animatedElements = node.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in');
            animatedElements.forEach(element => {
              element.classList.add('visible');
            });
          }
        });
      }
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
});

// Konami Code Easter Egg - ↑↑↓↓←→←→BA
document.addEventListener('DOMContentLoaded', function() {
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  
  let userInput = [];
  let konamiActivated = false;

  document.addEventListener('keydown', function(e) {
    userInput.push(e.code);
    
    // Keep only the last 10 key presses
    if (userInput.length > konamiCode.length) {
      userInput = userInput.slice(-konamiCode.length);
    }
    
    // Check if the sequence matches
    if (userInput.length === konamiCode.length && 
        userInput.every((key, index) => key === konamiCode[index])) {
      
      if (!konamiActivated) {
        activateKonamiMode();
        konamiActivated = true;
      }
    }
  });

  function activateKonamiMode() {
    // Create magical notification
    showKonamiNotification();
    
    // Activate special design mode
    document.body.classList.add('konami-activated');
    
    // Enhanced animations
    enableEnhancedAnimations();
    
    // Secret Braun mode
    setTimeout(() => {
      showBraunSecrets();
    }, 2000);
    
    // Play special sound sequence
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

    // Remove after animation
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }

  function enableEnhancedAnimations() {
    // Add special CSS class for enhanced effects
    const style = document.createElement('style');
    style.textContent = `
      .konami-activated .project-item:hover {
        transform: translateY(-8px) scale(1.05) rotate(1deg);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .konami-activated .filter-item button:hover {
        transform: translateY(-3px) scale(1.1);
        box-shadow: 0 8px 20px rgba(255, 74, 0, 0.3);
      }
      
      .konami-activated .scrolling-banner {
        background: linear-gradient(45deg, #ff4a00, #e63900, #ff4a00, #e63900);
        background-size: 400% 400%;
        animation: gradientShift 3s ease infinite, scroll-banner 360s linear infinite;
      }
      
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      .konami-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--surface);
        border: 2px solid var(--primary);
        border-radius: var(--radius-lg);
        padding: 30px;
        box-shadow: 0 10px 40px rgba(255, 74, 0, 0.3);
        z-index: 10000;
        text-align: center;
        animation: konamiPop 4s ease forwards;
      }
      
      .konami-content h3 {
        color: var(--primary);
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
    // Add hidden design philosophy quotes
    const designQuotes = [
      "Good design is as little design as possible - Dieter Rams",
      "Less but better - Weniger aber besser",
      "Good design is innovative, useful, aesthetic, understandable, unobtrusive, honest, long-lasting, thorough, environmentally friendly, and as little design as possible",
      "A product is bought to be used. It has to serve a defined purpose"
    ];

    const randomQuote = designQuotes[Math.floor(Math.random() * designQuotes.length)];
    
    // Create floating quote
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
        
        // Play ascending major scale (celebration sound)
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

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
if (navigationLinks && pages) {
  
  // Function to show a specific page
  function showPage(pageName) {
    for (let j = 0; j < pages.length; j++) {
      if (pageName === pages[j].dataset.page) {
        pages[j].classList.add("active");
        // Find corresponding nav link and activate it
        for (let k = 0; k < navigationLinks.length; k++) {
          if (navigationLinks[k].innerHTML.toLowerCase() === pageName) {
            navigationLinks[k].classList.add("active");
          } else {
            navigationLinks[k].classList.remove("active");
          }
        }
        window.scrollTo(0, 0);
      } else {
        pages[j].classList.remove("active");
      }
    }
  }
  
  // Handle hash navigation on page load
  function handleHashNavigation() {
    const hash = window.location.hash.substring(1); // Remove #
    if (hash && hash !== '') {
      showPage(hash);
    }
  }
  
  // Check for hash on page load
  window.addEventListener('load', handleHashNavigation);
  window.addEventListener('hashchange', handleHashNavigation);
  
  // Handle initial hash if page is already loaded
  if (document.readyState === 'complete') {
    handleHashNavigation();
  }

  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      // Skip if this is the blog link (it has onclick handler)
      if (this.getAttribute('onclick')) {
        return;
      }

      const pageName = this.innerHTML.toLowerCase();
      showPage(pageName);
      
      // Update URL hash
      window.history.pushState(null, null, `#${pageName}`);

    });
  }
}

// ===== BRAUN PRODUCT SHOWCASE INTERACTIONS =====
document.addEventListener('DOMContentLoaded', function() {
  // Product card interactions
  const productCards = document.querySelectorAll('.product-card');
  const showMoreBtn = document.querySelector('.show-more-principles');
  const designPrinciples = document.querySelector('.design-principles');
  
  // Additional principles data (6-10)
  const additionalPrinciples = [
    { number: '06', text: 'Good design is honest' },
    { number: '07', text: 'Good design is long-lasting' },
    { number: '08', text: 'Good design is thorough down to the last detail' },
    { number: '09', text: 'Good design is environmentally-friendly' },
    { number: '10', text: 'Good design is as little design as possible' }
  ];
  
  // Product details for interactive tooltips
  const productDetails = {
    sk4: {
      name: 'SK 4 Record Player',
      year: '1956',
      designer: 'Dieter Rams & Hans Gugelot',
      significance: 'Revolutionary transparent design that earned the nickname "Snow White\'s Coffin". This was the first time a hi-fi component was designed to be beautiful enough to display openly.',
      influence: 'Inspired countless transparent electronics and the Apple design philosophy.'
    },
    t3: {
      name: 'T 3 Transistor Radio',
      year: '1958',
      designer: 'Dieter Rams',
      significance: 'One of the first truly portable radios with impeccable proportions and intuitive controls.',
      influence: 'Set the standard for portable electronics design and influenced the original iPod design.'
    },
    et66: {
      name: 'ET 66 Calculator',
      year: '1987',
      designer: 'Dietrich Lubs',
      significance: 'Embodied the principle "function drives form" with its clean button layout and clear hierarchy.',
      influence: 'Influenced calculator and numeric interface design across industries.'
    },
    l2: {
      name: 'L 2 Loudspeaker',
      year: '1958',
      designer: 'Dieter Rams',
      significance: 'Perfect geometric form with exceptional acoustic performance, proving that beauty and function are inseparable.',
      influence: 'Established the template for modern speaker design and influenced audio equipment aesthetics.'
    }
  };
  
  // Product cards are now display-only (no click handlers for cleaner experience)
  
  // Show more principles functionality
  if (showMoreBtn && designPrinciples) {
    showMoreBtn.addEventListener('click', function() {
      const isExpanded = designPrinciples.classList.contains('principles-expanded');
      
      if (!isExpanded) {
        // Add remaining principles
        const principlesGrid = document.querySelector('.principles-grid');
        
        additionalPrinciples.forEach(principle => {
          const principleItem = document.createElement('div');
          principleItem.className = 'principle-item principles-hidden';
          principleItem.setAttribute('data-principle', principle.number);
          
          principleItem.innerHTML = `
            <span class="principle-number">${principle.number}</span>
            <span class="principle-text">${principle.text}</span>
          `;
          
          principlesGrid.appendChild(principleItem);
          
          // Removed hover sound effect for cleaner experience
        });
        
        designPrinciples.classList.add('principles-expanded');
        this.querySelector('span').textContent = 'Show Less';
        
        // Animate in the new principles
        setTimeout(() => {
          document.querySelectorAll('.principles-hidden').forEach((item, index) => {
            setTimeout(() => {
              item.style.display = 'flex';
              item.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
            }, index * 100);
          });
        }, 50);
        
      } else {
        // Remove additional principles
        document.querySelectorAll('.principles-hidden').forEach(item => {
          item.remove();
        });
        
        designPrinciples.classList.remove('principles-expanded');
        this.querySelector('span').textContent = 'Show All Principles';
      }
      
      playSubtleClick();
    });
  }
  
  
  // Subtle audio feedback for Braun aesthetic
  function playSubtleClick() {
    if (window.AudioContext || window.webkitAudioContext) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Very subtle, high-frequency click (Braun-inspired)
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.05);
      } catch (e) {
        // Silently fail if audio not supported
      }
    }
  }
  
  // Add scroll-triggered animations for the showcase
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, index * 150);
        });
        
        // Add stagger animation to principles
        const principles = entry.target.querySelectorAll('.principle-item');
        principles.forEach((principle, index) => {
          setTimeout(() => {
            principle.style.opacity = '1';
            principle.style.transform = 'translateX(0)';
          }, 500 + index * 100);
        });
      }
    });
  }, { threshold: 0.2 });
  
  const showcase = document.querySelector('.braun-showcase');
  if (showcase) {
    // Set initial state for animation
    showcase.querySelectorAll('.product-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'all 0.6s ease';
    });
    
    showcase.querySelectorAll('.principle-item').forEach(principle => {
      principle.style.opacity = '0';
      principle.style.transform = 'translateX(-20px)';
      principle.style.transition = 'all 0.4s ease';
    });
    
    observer.observe(showcase);
  }
});

// Easter Egg Philosophy Modal
document.addEventListener('DOMContentLoaded', function() {
  const trigger = document.getElementById('philosophy-trigger');
  const modal = document.getElementById('design-philosophy-modal');
  const closeBtn = document.getElementById('close-philosophy-modal');
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  
  // Function to show/hide easter egg based on active page
  function updateEasterEggVisibility() {
    const contactPage = document.querySelector('[data-page="contact"]');
    if (contactPage && contactPage.classList.contains('active')) {
      trigger.classList.add('visible');
    } else {
      trigger.classList.remove('visible');
    }
  }
  
  if (trigger && modal) {
    console.log('Easter egg elements found:', trigger, modal); // Debug log
    // Initial visibility check
    updateEasterEggVisibility();
    
    // Watch for page changes
    navigationLinks.forEach(link => {
      link.addEventListener('click', function() {
        setTimeout(updateEasterEggVisibility, 100); // Small delay to ensure page change completes
      });
    });
    
    // Open modal
    trigger.addEventListener('click', function() {
      console.log('Easter egg clicked!'); // Debug log
      console.log('Modal element:', modal);
      console.log('Modal computed style:', window.getComputedStyle(modal));
      modal.style.display = 'flex';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Force visibility for debugging
      modal.style.visibility = 'visible';
      modal.style.zIndex = '99999';
    });
    
    // Close modal
    function closeModal() {
      console.log('Closing modal'); // Debug log
      modal.classList.remove('active');  
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }
});
