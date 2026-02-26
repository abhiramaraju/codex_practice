const display = document.getElementById('display');
const keys = document.querySelector('.keys');

const MAX_LENGTH = 14;

const state = {
  current: '0',
  previous: null,
  operator: null,
  waitingForNextValue: false,
  lastOperator: null,
  lastOperand: null,
};

function clampLength(value) {
  return value.length > MAX_LENGTH ? value.slice(0, MAX_LENGTH) : value;
}

function normalizeZero(value) {
  return value === '-0' ? '0' : value;
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const rounded = Number.parseFloat(value.toPrecision(12)).toString();
  return clampLength(normalizeZero(rounded));
}

function toNumber(value) {
  return Number.parseFloat(value);
}

function render() {
  display.value = state.current;
}

function clearAll() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.waitingForNextValue = false;
  state.lastOperator = null;
  state.lastOperand = null;
}

function clearErrorIfNeeded() {
  if (state.current === 'Error') {
    clearAll();
  }
}

function applyOperator(operator, leftValue, rightValue) {
  switch (operator) {
    case '+':
      return leftValue + rightValue;
    case '-':
      return leftValue - rightValue;
    case '*':
      return leftValue * rightValue;
    case '/':
      return rightValue === 0 ? Number.NaN : leftValue / rightValue;
    default:
      return rightValue;
  }
}

function inputDigit(digit) {
  clearErrorIfNeeded();

  if (state.waitingForNextValue) {
    state.current = digit;
    state.waitingForNextValue = false;
    return;
  }

  if (state.current === '0') {
    state.current = digit;
    return;
  }

  state.current = clampLength(state.current + digit);
}

function inputDecimal() {
  clearErrorIfNeeded();

  if (state.waitingForNextValue) {
    state.current = '0.';
    state.waitingForNextValue = false;
    return;
  }

  if (!state.current.includes('.')) {
    state.current = clampLength(`${state.current}.`);
  }
}

function backspace() {
  clearErrorIfNeeded();

  if (state.waitingForNextValue) {
    return;
  }

  if (state.current.length === 1 || (state.current.length === 2 && state.current.startsWith('-'))) {
    state.current = '0';
    return;
  }

  state.current = state.current.slice(0, -1);
}

function toggleSign() {
  clearErrorIfNeeded();

  if (state.current === '0') {
    return;
  }

  state.current = state.current.startsWith('-') ? state.current.slice(1) : `-${state.current}`;
}

function percentage() {
  clearErrorIfNeeded();

  const currentNumber = toNumber(state.current);
  state.current = formatResult(currentNumber / 100);
}

function setOperator(nextOperator) {
  clearErrorIfNeeded();

  if (state.operator && !state.waitingForNextValue) {
    const result = applyOperator(state.operator, toNumber(state.previous), toNumber(state.current));
    state.current = formatResult(result);
    state.previous = state.current;
  } else if (!state.operator) {
    state.previous = state.current;
  }

  state.operator = nextOperator;
  state.waitingForNextValue = true;
}

function evaluate() {
  clearErrorIfNeeded();

  if (state.operator) {
    const left = toNumber(state.previous);
    const right = state.waitingForNextValue ? left : toNumber(state.current);
    const result = applyOperator(state.operator, left, right);

    state.current = formatResult(result);
    state.lastOperator = state.operator;
    state.lastOperand = right;

    state.operator = null;
    state.previous = null;
    state.waitingForNextValue = true;
    return;
  }

  if (state.lastOperator && state.lastOperand !== null) {
    const result = applyOperator(state.lastOperator, toNumber(state.current), state.lastOperand);
    state.current = formatResult(result);
    state.waitingForNextValue = true;
  }
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
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    handleAction('clear');
  } else if (key === 'Backspace') {
    handleAction('backspace');
  } else if (key === '%') {
    handleAction('percent');
  }
});

clearAll();
render();
