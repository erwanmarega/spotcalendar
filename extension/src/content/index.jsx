import { createRoot } from 'react-dom/client';
import App from '../components/App';
import styles from './index.css?inline';

function createNavButton() {
  const btn = document.createElement('button');
  btn.id = 'spotcalendar-nav-btn';
  btn.setAttribute('aria-label', 'Calendrier des sorties');
  btn.setAttribute('title', 'Calendrier des sorties');
  btn.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  `;
  btn.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #000000;
    border: none;
    cursor: pointer;
    color: white;
    flex-shrink: 0;
    transition: background-color 0.15s ease, color 0.15s ease;
    margin-left: 8px;
  `;

  btn.addEventListener('mouseenter', () => {
    if (btn.dataset.active !== 'true') btn.style.backgroundColor = '#1a1a1a';
  });
  btn.addEventListener('mouseleave', () => {
    if (btn.dataset.active !== 'true') btn.style.backgroundColor = '#000000';
  });
  btn.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('spotcalendar-toggle'));
  });

  document.addEventListener('spotcalendar-state', (e) => {
    btn.dataset.active = e.detail.open ? 'true' : 'false';
    if (e.detail.open) {
      btn.style.backgroundColor = '#1DB954';
      btn.style.color = '#000000';
    } else {
      btn.style.backgroundColor = '#000000';
      btn.style.color = '#ffffff';
    }
  });

  return btn;
}

function injectNavButton() {
  if (document.getElementById('spotcalendar-nav-btn')) return true;

  const topbar = document.getElementById('global-nav-bar');
  if (!topbar) return false;

  const searchForm = topbar.querySelector('[role="search"]');
  if (!searchForm) return false;

  // Remonter jusqu'au child direct de la topbar qui contient la searchbar
  let searchSection = searchForm;
  while (searchSection.parentElement && searchSection.parentElement !== topbar) {
    searchSection = searchSection.parentElement;
  }
  if (searchSection.parentElement !== topbar) return false;

  searchSection.insertAdjacentElement('afterend', createNavButton());
  return true;
}

function mount() {
  if (document.getElementById('spotcalendar-host')) return;

  const host = document.createElement('div');
  host.id = 'spotcalendar-host';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  const mountEl = document.createElement('div');
  shadow.appendChild(mountEl);

  createRoot(mountEl).render(<App />);

  if (!injectNavButton()) {
    const observer = new MutationObserver(() => {
      if (injectNavButton()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
