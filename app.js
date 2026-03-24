const statusEl = document.getElementById('status');
const button = document.getElementById('action-btn');

statusEl.textContent = 'Ready! This is a 100% static frontend.';

button.addEventListener('click', () => {
  const now = new Date().toLocaleTimeString();
  statusEl.textContent = `Button clicked at ${now}`;
});
