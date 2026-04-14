import { createRoot } from 'react-dom/client';
import App from '../components/App';
import styles from './index.css?inline';

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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
