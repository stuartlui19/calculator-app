const display = document.querySelector("#display");
const keys = document.querySelector(".keys");

let displayValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let hasError = false;

function updateDisplay() {
  display.textContent = displayValue;
}

function clearCalculator() {
  displayValue = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  hasError = false;
  updateDisplay();
}

function enterDigit(digit) {
  // A new digit starts a fresh number after an operator or an error.
  if (hasError || waitingForOperand) {
    displayValue = digit;
    waitingForOperand = false;
    hasError = false;
  } else if (displayValue === "0") {
    displayValue = digit;
  } else {
    displayValue += digit;
  }
  updateDisplay();
}

function enterDecimal() {
  if (hasError || waitingForOperand) {
    displayValue = "0.";
    waitingForOperand = false;
    hasError = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  }
  updateDisplay();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+":
      return left + right;
    case "−":
      return left - right;
    case "×":
      return left * right;
    case "÷":
      return right === 0 ? null : left / right;
    default:
      return right;
  }
}

function showResult(result) {
  if (result === null || !Number.isFinite(result)) {
    displayValue = "Error";
    hasError = true;
  } else {
    // Limit floating-point noise while keeping useful decimal precision.
    displayValue = String(Number(result.toPrecision(12)));
  }
  updateDisplay();
}

function chooseOperator(operator) {
  if (hasError) return;

  const inputValue = Number(displayValue);

  if (pendingOperator && !waitingForOperand) {
    const result = calculate(storedValue, inputValue, pendingOperator);
    if (result === null || !Number.isFinite(result)) {
      showResult(result);
      storedValue = null;
      pendingOperator = null;
      return;
    }
    storedValue = result;
    displayValue = String(Number(result.toPrecision(12)));
    updateDisplay();
  } else if (storedValue === null) {
    storedValue = inputValue;
  }

  // Selecting another operator before entering a number replaces this one.
  pendingOperator = operator;
  waitingForOperand = true;
}

function showEquals() {
  if (hasError || !pendingOperator || waitingForOperand) return;

  const result = calculate(storedValue, Number(displayValue), pendingOperator);
  showResult(result);
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) {
    enterDigit(button.dataset.digit);
  } else if (button.dataset.action === "decimal") {
    enterDecimal();
  } else if (button.dataset.action === "clear") {
    clearCalculator();
  } else if (button.dataset.action === "equals") {
    showEquals();
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  }
});
