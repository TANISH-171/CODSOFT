import { Calculator } from './calculator.js';

const screen = document.getElementById('screen');
const trail  = document.getElementById('trail');
const keys   = document.getElementById('keys');
const themeToggle = document.getElementById('themeToggle');

const calc = new Calculator();

function render() {
  const { current } = calc.state;
  screen.textContent = current || '0';
  trail.textContent = calc.formatTrail();
}

function handleButton(btn) {
  const num = btn.getAttribute('data-num');
  const op = btn.getAttribute('data-op');
  const action = btn.getAttribute('data-action');

  if (num !== null) {
    calc.inputDigit(num);
  } else if (op !== null) {
    calc.chooseOperator(op);
  } else if (action) {
    switch (action) {
      case 'decimal': calc.inputDecimal(); break;
      case 'equals':  calc.equals(); break;
      case 'clear':   calc.clearAll(); break;
      case 'delete':  calc.deleteLast(); break;
      case 'negate':  calc.negate(); break;
    }
  }
  render();
}

/* Event delegation for clicks */
keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  btn.animate([{ transform: 'none' }, { transform: 'translateY(1px) scale(.995)' }, { transform: 'none' }],
              { duration: 120, easing: 'ease-out' });
  handleButton(btn);
});

/* Keyboard support */
window.addEventListener('keydown', (e) => {
  const k = e.key;

  if (/\d/.test(k)) { calc.inputDigit(k); return render(); }
  if (k === '.')    { calc.inputDecimal(); return render(); }
  if (k === 'Enter' || k === '=') { e.preventDefault(); calc.equals(); return render(); }
  if (k === 'Backspace') { calc.deleteLast(); return render(); }
  if (k === 'Escape' || k.toLowerCase() === 'c') { calc.clearAll(); return render(); }
  if (['+', '-', '*', '/', '%'].includes(k)) {
    const map = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };
    calc.chooseOperator(map[k]); return render();
  }
  if (k === 'n') { calc.negate(); return render(); } // quick negate shortcut
});

/* Theme toggle (persists) */
const LS_KEY = 'elegance-theme';
function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light') {
    root.classList.add('light');
    themeToggle.textContent = '☾';
  } else {
    root.classList.remove('light');
    themeToggle.textContent = '☀︎';
  }
}
applyTheme(localStorage.getItem(LS_KEY) || 'dark');

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  localStorage.setItem(LS_KEY, next);
  applyTheme(next);
});

/* Initial paint */
render();
