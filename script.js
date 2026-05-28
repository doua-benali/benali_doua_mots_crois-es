let gridSize = 10;
let grid = [];
let userInput = {};
let placedWords = [];
let gameCompleted = false;
let startTime = null;
let timerInterval = null;

const wordsList = [
  { word: "BIOS",   x: 7, y: 5, direction: "down" },
  { word: "USB",    x: 6, y: 8, direction: "across" },
  { word: "RAM",    x: 4, y: 2, direction: "down" },
  { word: "SSD",    x: 3, y: 0, direction: "down" },
  { word: "DDR",    x: 2, y: 2, direction: "across" },
  { word: "CPU",    x: 6, y: 6, direction: "down" },
  { word: "PCIe",   x: 5, y: 6, direction: "across" },
  { word: "HACKER", x: 3, y: 3, direction: "across" },
  { word: "STORAGE",x: 8, y: 0, direction: "down" }
];

function init() {
  createEmptyGrid();
  placeAllWords();
  assignNumbers();
  renderGrid();
  setupEventListeners();
  updateProgress();
  startTimer();
}

function createEmptyGrid() {
  grid = [];
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      grid[y][x] = { letter: "", blocked: true, number: null };
    }
  }
}

function canPlace(word, x, y, direction) {
  if (direction === "across") {
    if (x + word.length > gridSize) return false;
    for (let i = 0; i < word.length; i++) {
      const nx = x + i, ny = y;
      if (!grid[ny][nx].blocked && grid[ny][nx].letter !== word[i]) return false;
    }
  } else {
    if (y + word.length > gridSize) return false;
    for (let i = 0; i < word.length; i++) {
      const nx = x, ny = y + i;
      if (!grid[ny][nx].blocked && grid[ny][nx].letter !== word[i]) return false;
    }
  }
  return true;
}

function placeWordOnGrid(word, x, y, direction) {
  for (let i = 0; i < word.length; i++) {
    const nx = direction === "across" ? x + i : x;
    const ny = direction === "down" ? y + i : y;
    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
      grid[ny][nx].letter = word[i];
      grid[ny][nx].blocked = false;
    }
  }
  placedWords.push({ word, x, y, direction });
}

function placeAllWords() {
  for (let w of wordsList) {
    if (canPlace(w.word, w.x, w.y, w.direction)) {
      placeWordOnGrid(w.word, w.x, w.y, w.direction);
    } else {
      placeWordOnGrid(w.word, w.x, w.y, w.direction);
    }
  }
}

function assignNumbers() {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      grid[y][x].number = null;
    }
  }
  let idx = 1;
  for (let p of placedWords) {
    const { x, y } = p;
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      grid[y][x].number = idx++;
    }
  }
}

function renderGrid() {
  const gridElement = document.getElementById("crossword");
  if (!gridElement) return;
  gridElement.innerHTML = "";
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (grid[y][x].blocked) {
        cell.classList.add("blocked");
        gridElement.appendChild(cell);
        continue;
      }
      if (grid[y][x].number) {
        const numberSpan = document.createElement("div");
        numberSpan.className = "cell-number";
        numberSpan.textContent = grid[y][x].number;
        cell.appendChild(numberSpan);
      }
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      const cellKey = `${x},${y}`;
      if (userInput[cellKey]) input.value = userInput[cellKey];
      input.addEventListener("input", (e) => handleCellInput(x, y, e.target.value));
      input.addEventListener("keydown", (e) => handleKeyNavigation(e, x, y));
      input.addEventListener("focus", () => cell.classList.add("selected"));
      input.addEventListener("blur", () => cell.classList.remove("selected"));
      cell.appendChild(input);
      updateCellAppearance(cell, x, y);
      gridElement.appendChild(cell);
    }
  }
}

function updateCellAppearance(cell, x, y) {
  const cellKey = `${x},${y}`;
  cell.classList.remove("correct", "incorrect");
  if (userInput[cellKey]) {
    const expected = grid[y][x].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    // Returns "e\u0301"
    const user = userInput[cellKey].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    if (expected === user) cell.classList.add("correct");
    else cell.classList.add("incorrect");
  }
}

function handleCellInput(x, y, value) {
  const cellKey = `${x},${y}`;
  if (value) {
    value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0,1);
    userInput[cellKey] = value;
   // userInput = { "3,2": "R", "4,5": "A", "7,5": "B" }

  } else {
    delete userInput[cellKey];
  }
  renderGrid();
  updateProgress();
  setTimeout(() => focusNextCell(x, y), 10);
}

function focusNextCell(x, y) {
  const dir = getCurrentWordDirection(x, y);
  if (dir === "across") moveFocus(x+1, y);
  else if (dir === "down") moveFocus(x, y+1);
  else moveFocus(x+1, y);
}

function getCurrentWordDirection(x, y) {
  for (let p of placedWords) {
    const { word, x: sx, y: sy, direction } = p;
    if (direction === "across" && y === sy && x >= sx && x < sx + word.length) return "across";
    if (direction === "down" && x === sx && y >= sy && y < sy + word.length) return "down";
  }
  return null;
}

function moveFocus(x, y) {
  if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return;
  if (grid[y][x].blocked) {
    if (x+1 < gridSize) moveFocus(x+1, y);
    else if (y+1 < gridSize) moveFocus(0, y+1);
    return;
  }
  const gridEl = document.querySelector("#crossword");
  const index = y * gridSize + x;
  const cell = gridEl.children[index];
  const input = cell?.querySelector("input");
  if (input) setTimeout(() => input.focus(), 10);
}

function handleKeyNavigation(e, x, y) {
  const key = e.key;
  if (key === "ArrowRight") { e.preventDefault(); moveFocus(x+1, y); }
  else if (key === "ArrowLeft") { e.preventDefault(); moveFocus(x-1, y); }
  else if (key === "ArrowUp") { e.preventDefault(); moveFocus(x, y-1); }
  else if (key === "ArrowDown") { e.preventDefault(); moveFocus(x, y+1); }
  else if (key === "Backspace") {
    if (userInput[`${x},${y}`]) {
      delete userInput[`${x},${y}`];
      renderGrid();
      updateProgress();
    } else {
      moveFocus(x-1, y);
    }
  }
}

function updateProgress() {
  let total = 0, correct = 0;
  let wordsFound = 0;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!grid[y][x].blocked) {
        total++;
        const key = `${x},${y}`;
        const expected = grid[y][x].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const user = userInput[key]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        if (expected === user) correct++;
      }
    }
  }
  for (let p of placedWords) {
    let full = true;
    for (let i = 0; i < p.word.length; i++) {
      const cx = p.direction === "across" ? p.x + i : p.x;
      const cy = p.direction === "down" ? p.y + i : p.y;
      const key = `${cx},${cy}`;
      const expected = grid[cy][cx].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
      const user = userInput[key]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
      if (expected !== user) { full = false; break; }
    }
    if (full) wordsFound++;
  }
  const percent = total ? (correct / total) * 100 : 0;
  const percentEl = document.getElementById("percent");
  const barEl = document.getElementById("bar");
  const statusEl = document.getElementById("status");
  if (percentEl) percentEl.textContent = `${Math.round(percent)}%`;
  if (barEl) barEl.style.width = `${percent}%`;
  if (statusEl) statusEl.textContent = `Composants trouvés : ${wordsFound} / ${placedWords.length}`;
  if (wordsFound === placedWords.length && !gameCompleted) {
    gameCompleted = true;
    setTimeout(() => alert("🎉 FÉLICITATIONS! Vous avez assemblé tous les composants!"), 50);
  }
}

function revealSolution() {
  if (confirm("Afficher la solution ?")) {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!grid[y][x].blocked) userInput[`${x},${y}`] = grid[y][x].letter;
      }
    }
    renderGrid();
    updateProgress();
  }
}

function reset() {
  if (confirm("Réinitialiser la grille ?")) {
    userInput = {};
    gameCompleted = false;
    clearInterval(timerInterval);
    startTime = new Date();
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = "00:00";
    timerInterval = setInterval(updateTimer, 1000);
    renderGrid();
    updateProgress();
  }
}

function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (gameCompleted) return;
  const now = new Date();
  const elapsedTime = Math.floor((now - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function setupEventListeners() {
  const revealBtn = document.getElementById("reveal");
  const resetBtn = document.getElementById("reset");
  if (revealBtn) revealBtn.addEventListener("click", revealSolution);
  if (resetBtn) resetBtn.addEventListener("click", reset);
}

document.addEventListener("DOMContentLoaded", init);
