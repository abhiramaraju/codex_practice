const display = document.getElementById('display');
const keys = document.querySelector('.keys');

const state = {
  current: '0',
  previous: null,
  operator: null,
  resetOnNextDigit: false,
};

const MAX_LENGTH = 14;

function render() {
  display.value = state.current;
}

function clampLength(value) {
  return value.length > MAX_LENGTH ? value.slice(0, MAX_LENGTH) : value;
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const rounded = Number.parseFloat(value.toFixed(10)).toString();
  return clampLength(rounded);
}

function compute() {
  const prev = Number.parseFloat(state.previous);
  const curr = Number.parseFloat(state.current);

  switch (state.operator) {
    case '+':
      return prev + curr;
    case '-':
      return prev - curr;
    case '*':
      return prev * curr;
    case '/':
      return curr === 0 ? Number.NaN : prev / curr;
    default:
      return curr;
  }
}

function inputDigit(digit) {
  if (state.current === 'Error') {
    state.current = '0';
  }

  if (state.resetOnNextDigit) {
    state.current = digit;
    state.resetOnNextDigit = false;
  } else {
    state.current = state.current === '0' ? digit : clampLength(state.current + digit);
  }
}

function inputDecimal() {
  if (state.resetOnNextDigit) {
    state.current = '0.';
    state.resetOnNextDigit = false;
    return;
  }

  if (!state.current.includes('.')) {
    state.current += '.';
  }
}

function clearAll() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.resetOnNextDigit = false;
}

function backspace() {
  if (state.resetOnNextDigit) {
    return;
  }

  if (state.current.length <= 1 || state.current === 'Error') {
    state.current = '0';
  } else {
    state.current = state.current.slice(0, -1);
  }
}

function toggleSign() {
  if (state.current === '0' || state.current === 'Error') {
    return;
  }

  state.current = state.current.startsWith('-') ? state.current.slice(1) : `-${state.current}`;
}

function percentage() {
  if (state.current === 'Error') {
    return;
  }

  const currentNumber = Number.parseFloat(state.current);
  state.current = formatResult(currentNumber / 100);
}

function setOperator(nextOperator) {
  if (state.current === 'Error') {
    return;
  }

  if (state.operator && !state.resetOnNextDigit) {
    state.current = formatResult(compute());
  }

  state.previous = state.current;
  state.operator = nextOperator;
  state.resetOnNextDigit = true;
}

function evaluate() {
  if (!state.operator || state.previous === null || state.current === 'Error') {
    return;
  }

  state.current = formatResult(compute());
  state.previous = null;
  state.operator = null;
  state.resetOnNextDigit = true;
}

function handleAction(action, value) {
  switch (action) {
    case 'digit':
      inputDigit(value);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'operator':
      setOperator(value);
      break;
    case 'equals':
      evaluate();
      break;
    case 'clear':
      clearAll();
      break;
    case 'backspace':
      backspace();
      break;
    case 'sign':
      toggleSign();
      break;
    case 'percent':
      percentage();
      break;
    default:
      break;
  }

  render();
}

keys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (/^\d$/.test(key)) {
    handleAction('digit', key);
  } else if (key === '.') {
    handleAction('decimal');
  } else if (['+', '-', '*', '/'].includes(key)) {
    handleAction('operator', key);
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleAction('equals');
  } else if (key === 'Escape') {
    handleAction('clear');
  } else if (key === 'Backspace') {
    handleAction('backspace');
  } else if (key === '%') {
    handleAction('percent');
  }
});

render();
