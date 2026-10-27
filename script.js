
"use strict";

// ========================================
// ZAYYAN'S SCIENTIFIC CALCULATOR
// ========================================

// Main display elements
const display = document.getElementById("display");
const expression = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

// Buttons
const digitButtons = document.querySelectorAll("[data-digit]");
const clearBtn = document.getElementById("clearBtn");
const backspaceBtn = document.getElementById("backspaceBtn");
const negateBtn = document.getElementById("negateBtn");
const decimalBtn = document.getElementById("decimalBtn");
const equalsBtn = document.getElementById("equalsBtn");

const addBtn = document.getElementById("addBtn");
const subBtn = document.getElementById("subBtn");
const mulBtn = document.getElementById("mulBtn");
const divBtn = document.getElementById("divBtn");

const percentBtn = document.getElementById("percentBtn");
const squareBtn = document.getElementById("squareBtn");
const sqrtBtn = document.getElementById("sqrtBtn");
const powerBtn = document.getElementById("powerBtn");
const factorialBtn = document.getElementById("factorialBtn");

const sinBtn = document.getElementById("sinBtn");
const cosBtn = document.getElementById("cosBtn");
const tanBtn = document.getElementById("tanBtn");
const logBtn = document.getElementById("logBtn");
const lnBtn = document.getElementById("lnBtn");
const piBtn = document.getElementById("piBtn");
const eBtn = document.getElementById("eBtn");

const angleModeBtn = document.getElementById("angleModeBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Calculator state
const HISTORY_KEY = "zayyanCalculatorHistory";

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let startNewNumber = true;
let angleMode = "DEG";
let history = [];

// ========================================
// DISPLAY
// ========================================

function updateDisplay() {
    display.value = currentValue;
}

function showAnswer(calculation, answer) {
    const formattedAnswer = formatNumber(answer);

    currentValue = formattedAnswer;
    startNewNumber = true;
    updateDisplay();

    resultDisplay.textContent = `${calculation} = ${formattedAnswer}`;

    addToHistory(calculation, formattedAnswer);
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        throw new Error("The result is not a valid number.");
    }

    if (Object.is(number, -0)) {
        number = 0;
    }

    return String(Number(number.toPrecision(12)));
}

function getCurrentNumber() {
    const number = Number(currentValue);

    if (!Number.isFinite(number)) {
        throw new Error("Please enter a valid number.");
    }

    return number;
}

function showError(message) {
    resultDisplay.textContent = message;
    expression.textContent = "Error";
}

// ========================================
// NUMBER KEYS
// ========================================

function enterDigit(digit) {
    if (startNewNumber || currentValue === "0" || currentValue === "Error") {
        currentValue = digit;
        startNewNumber = false;
    } else {
        currentValue += digit;
    }

    updateDisplay();
}

digitButtons.forEach((button) => {
    button.addEventListener("click", () => {
        enterDigit(button.dataset.digit);
    });
});

// Decimal point
decimalBtn.addEventListener("click", () => {
    if (startNewNumber || currentValue === "Error") {
        currentValue = "0.";
        startNewNumber = false;
    } else if (!currentValue.includes(".")) {
        currentValue += ".";
    }

    updateDisplay();
});


 // Backspace
backspaceBtn.addEventListener("click", () => {
    if (currentValue === "Error") {
        currentValue = "0";
        startNewNumber = false;
    } else if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);

        if (currentValue === "-") {
            currentValue = "0";
        }
    } else {
        currentValue = "0";
    }

    updateDisplay();
});

 // Positive / negative toggle
negateBtn.addEventListener("click", () => {
    if (currentValue === "0" || currentValue === "Error") {
        return;
    }

    currentValue = currentValue.startsWith("-")
        ? currentValue.slice(1)
        : "-" + currentValue;

    startNewNumber = false;
    updateDisplay();
});

// ========================================
// CLEAR
// ========================================

clearBtn.addEventListener("click", () => {
    currentValue = "0";
    storedValue = null;
    pendingOperator = null;
    startNewNumber = true;

    expression.textContent = "";
    resultDisplay.textContent = "Your answer will appear here.";

    updateDisplay();
});

// ========================================
// BASIC ARITHMETIC
// ========================================

function calculateNumbers(first, second, operator) {
    switch (operator) {
        case "+":
            return first + second;

        case "-":
            return first - second;

        case "*":
            return first * second;

        case "/":
            if (second === 0) {
                throw new Error("Cannot divide by zero.");
            }
            return first / second;

        case "^":
            return Math.pow(first, second);

        default:
            throw new Error("Unknown operator.");
    }
}

function chooseOperator(operator) {
    try {
        const number = getCurrentNumber();

        // Allow chained calculations such as 2 + 3 + 4
        if (pendingOperator !== null && !startNewNumber) {
            const answer = calculateNumbers(
                storedValue,
                number,
                pendingOperator
            );

            storedValue = answer;
            currentValue = formatNumber(answer);
            updateDisplay();
        } else {
            storedValue = number;
        }

        pendingOperator = operator;
        startNewNumber = true;

        expression.textContent =
            `${formatNumber(storedValue)} ${operator}`;

        resultDisplay.textContent = "Enter the next number.";
    } catch (error) {
        showError(error.message);
    }
}

addBtn.addEventListener("click", () => chooseOperator("+"));
subBtn.addEventListener("click", () => chooseOperator("-"));
mulBtn.addEventListener("click", () => chooseOperator("*"));
divBtn.addEventListener("click", () => chooseOperator("/"));

// Equals
equalsBtn.addEventListener("click", () => {
    if (pendingOperator === null || storedValue === null) {
        return;
    }

    try {
        const secondValue = getCurrentNumber();
        const firstValue = storedValue;
        const operator = pendingOperator;

        const symbols = {
            "+": "+",
            "-": "−",
            "*": "×",
            "/": "÷",
            "^": "^"
        };

        const calculation =
            `${formatNumber(firstValue)} ${symbols[operator]} ${formatNumber(secondValue)}`;

        const answer = calculateNumbers(
            firstValue,
            secondValue,
            operator
        );

        storedValue = null;
        pendingOperator = null;

        expression.textContent = calculation;
        showAnswer(calculation, answer);
    } catch (error) {
        showError(error.message);
        currentValue = "0";
        storedValue = null;
        pendingOperator = null;
        startNewNumber = true;
        updateDisplay();
    }
});

// ========================================
// SCIENTIFIC FUNCTIONS
// ========================================

function runUnaryFunction(label, calculationFunction) {
    try {
        const number = getCurrentNumber();
        const answer = calculationFunction(number);

        const calculation = `${label}(${formatNumber(number)})`;

        expression.textContent = calculation;
        storedValue = null;
        pendingOperator = null;

        showAnswer(calculation, answer);
    } catch (error) {
        showError(error.message);
    }
}

// Square: x²
squareBtn.addEventListener("click", () => {
    runUnaryFunction("square", (number) => number * number);
});

// Square root: √x
sqrtBtn.addEventListener("click", () => {
    runUnaryFunction("√", (number) => {
        if (number < 0) {
            throw new Error("Cannot find the real square root of a negative number.");
        }

        return Math.sqrt(number);
    });
});

// Percentage: current number divided by 100
percentBtn.addEventListener("click", () => {
    runUnaryFunction("%", (number) => number / 100);
});

// Power: xʸ
powerBtn.addEventListener("click", () => chooseOperator("^"));

// Sine
sinBtn.addEventListener("click", () => {
    runUnaryFunction("sin", (number) => {
        const radians = angleMode === "DEG"
            ? number * Math.PI / 180
            : number;

        return Math.sin(radians);
    });
});

// Cosine
cosBtn.addEventListener("click", () => {
    runUnaryFunction("cos", (number) => {
        const radians = angleMode === "DEG"
            ? number * Math.PI / 180
            : number;

        return Math.cos(radians);
    });
});

// Tangent
tanBtn.addEventListener("click", () => {
    runUnaryFunction("tan", (number) => {
        const radians = angleMode === "DEG"
            ? number * Math.PI / 180
            : number;

        if (Math.abs(Math.cos(radians)) < 1e-12) {
            throw new Error("Tangent is undefined at this angle.");
        }

        return Math.tan(radians);
    });
});

// Common logarithm: log base 10
logBtn.addEventListener("click", () => {
    runUnaryFunction("log", (number) => {
        if (number <= 0) {
            throw new Error("Logarithm requires a number greater than zero.");
        }

        return Math.log10(number);
    });
});

// Natural logarithm
lnBtn.addEventListener("click", () => {
    runUnaryFunction("ln", (number) => {
        if (number <= 0) {
            throw new Error("Natural logarithm requires a number greater than zero.");
        }

        return Math.log(number);
    });
});

// Factorial
factorialBtn.addEventListener("click", () => {
    runUnaryFunction("factorial", (number) => {
        if (!Number.isInteger(number) || number < 0) {
            throw new Error("Factorial requires a non-negative whole number.");
        }

        if (number > 170) {
            throw new Error("The maximum supported factorial is 170!.");
        }

        let answer = 1;

        for (let i = 2; i <= number; i++) {
            answer *= i;
        }

        return answer;
    });
});

// Pi constant
piBtn.addEventListener("click", () => {
    currentValue = formatNumber(Math.PI);
    startNewNumber = true;
    storedValue = null;
    pendingOperator = null;

    updateDisplay();
    expression.textContent = "π";
});

// Euler's number
eBtn.addEventListener("click", () => {
    currentValue = formatNumber(Math.E);
    startNewNumber = true;
    storedValue = null;
    pendingOperator = null;

    updateDisplay();
    expression.textContent = "e";
});

// ========================================
// DEG / RAD MODE
// ========================================

angleModeBtn.addEventListener("click", () => {
    angleMode = angleMode === "DEG" ? "RAD" : "DEG";
    angleModeBtn.textContent = angleMode;
});

// ========================================
// CALCULATION HISTORY
// ========================================

function loadHistory() {
    try {
        const savedHistory = localStorage.getItem(HISTORY_KEY);

        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);

            if (Array.isArray(parsedHistory)) {
                history = parsedHistory
                    .filter((item) =>
                        item &&
                        typeof item.calculation === "string" &&
                        typeof item.answer === "string"
                    )
                    .slice(0, 50);
            }
        }
    } catch (error) {
        history = [];
    }

    renderHistory();
}

function saveHistory() {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        // The calculator remains usable if browser storage is unavailable.
    }
}

function addToHistory(calculation, answer) {
    history.unshift({
        calculation,
        answer,
        time: new Date().toLocaleString()
    });

    history = history.slice(0, 50);

    saveHistory();
    renderHistory();
}

function renderHistory() {
    historyList.replaceChildren();

    if (history.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-history";
        emptyItem.textContent = "Your calculations will appear here.";
        historyList.appendChild(emptyItem);
        return;
    }

    history.forEach((item) => {
        const listItem = document.createElement("li");
        const calculationText = document.createElement("div");
        const answerText = document.createElement("strong");

        calculationText.textContent = item.calculation;
        answerText.textContent = `= ${item.answer}`;

        listItem.appendChild(calculationText);
        listItem.appendChild(answerText);

        historyList.appendChild(listItem);
    });
}

clearHistoryBtn.addEventListener("click", () => {
    history = [];
    saveHistory();
    renderHistory();
});

// Load saved history and initialise the display.
loadHistory();
updateDisplay();

document.addEventListener("keydown", function (event) {
    const key = event.key;

    // Ignore keyboard shortcuts using Ctrl, Alt, or Meta
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    // Avoid triggering calculator keys while typing in an input
    if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
    ) {
        return;
    }

    // Numbers
    if (/^[0-9]$/.test(key)) {
        document.querySelector(`[data-digit="${key}"]`)?.click();
        return;
    }

    // Decimal point
    if (key === ".") {
        document.getElementById("decimalBtn")?.click();
        return;
    }

    // Arithmetic operators
    const operatorButtons = {
        "+": "addBtn",
        "-": "subBtn",
        "*": "mulBtn",
        "/": "divBtn",
        "^": "powerBtn"
    };

    if (operatorButtons[key]) {
        event.preventDefault();
        document.getElementById(operatorButtons[key])?.click();
        return;
    }

    // Calculate
    if (key === "Enter" || key === "=") {
        event.preventDefault();
        document.getElementById("equalsBtn")?.click();
        return;
    }

    // Delete last character
    if (key === "Backspace") {
        event.preventDefault();
        document.getElementById("backspaceBtn")?.click();
        return;
    }

    // Clear calculator
    if (key === "Escape") {
        document.getElementById("clearBtn")?.click();
    }
    // Scientific function keyboard shortcuts
const scientificKeys = {
    s: "sinBtn",
    c: "cosBtn",
    t: "tanBtn",
    l: "logBtn",
    n: "lnBtn",
    r: "sqrtBtn",
    p: "piBtn",
    e: "eBtn",
    x: "squareBtn",
    f: "factorialBtn"
};

const shortcut = scientificKeys[key.toLowerCase()];

if (shortcut) {
    document.getElementById(shortcut)?.click();
}
});
