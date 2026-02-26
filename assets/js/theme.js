const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleWrapper = document.getElementById('theme-toggle-wrapper');

// This script aims to prevent FOUC by setting theme early
// See HTML head for the initial script

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleWrapper?.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggleWrapper?.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

// Initial setup from inline script in head
if (document.documentElement.getAttribute('data-theme') === 'dark') {
    themeToggleWrapper?.classList.add('dark');
}

// Handle toggle click
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  });
}
