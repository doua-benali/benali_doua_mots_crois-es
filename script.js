(function(){
  const wordsList = [
    { word: "BIOS",   x: 7, y: 5, direction: "down",    clue: "Basic Input Output System - Firmware" },
    { word: "USB",    x: 6, y: 8, direction: "across",  clue: "Universal Serial Bus - Port (croise BIOS en S)" },
    { word: "RAM",    x: 4, y: 2, direction: "down",    clue: "Random Access Memory - Mémoire vive" },
    { word: "SSD",    x: 3, y: 0, direction: "down",    clue: "Solid State Drive - Stockage rapide" },
    { word: "DDR",    x: 2, y: 2, direction: "across",  clue: "Double Data Rate - Type de RAM" },
    { word: "CPU",    x: 6, y: 6, direction: "down",    clue: "Central Processing Unit (croise PCIe en C)" },
    { word: "PCIe",   x: 5, y: 6, direction: "across",  clue: "Peripheral Component Interconnect Express (croise CPU en C)" },
    { word: "HACKER", x: 3, y: 3, direction: "across",  clue: "Expert en cybersécurité (croise RAM en A)" },
    { word: "STORAGE",x: 8, y: 0, direction: "down",    clue: "Espace de stockage (SSD, HDD, etc.) - croise HACKER en R et PCIe en e" }
  ];
  
  class Crossword {
    constructor() {
      this.gridSize = 10;
      this.placedWords = [];
      this.grid = [];
      this.userInput = {};
      this.activeInput = null;
      this.startTime = null;
      this.timerInterval = null;
      this.elapsedTime = 0;
      this.gameCompleted = false;
      this.init();
    }
    
    init() {
      this.createEmptyGrid();
      this.placeAllWords();
      this.assignNumbers();
      this.renderGrid();
      this.setupEventListeners();
      this.updateProgress();
      this.startTimer();
      console.log("Grille initialisée avec", this.placedWords.length, "mots");
    }
    
    createEmptyGrid() {
      this.grid = [];
      for (let y = 0; y < this.gridSize; y++) {
        this.grid[y] = [];
        for (let x = 0; x < this.gridSize; x++) {
          this.grid[y][x] = { letter: "", blocked: true, number: null };
        }
      }
    }
    
    canPlace(word, x, y, direction) {
      if (direction === "across") {
        if (x + word.length > this.gridSize) return false;
        for (let i = 0; i < word.length; i++) {
          const nx = x + i, ny = y;
          if (!this.grid[ny][nx].blocked && this.grid[ny][nx].letter !== word[i]) return false;
        }
      } else {
        if (y + word.length > this.gridSize) return false;
        for (let i = 0; i < word.length; i++) {
          const nx = x, ny = y + i;
          if (!this.grid[ny][nx].blocked && this.grid[ny][nx].letter !== word[i]) return false;
        }
      }
      return true;
    }
    
    placeWordOnGrid(word, x, y, direction) {
      for (let i = 0; i < word.length; i++) {
        const nx = direction === "across" ? x + i : x;
        const ny = direction === "down" ? y + i : y;
        if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
          this.grid[ny][nx].letter = word[i];
          this.grid[ny][nx].blocked = false;
        }
      }
      this.placedWords.push({ word, x, y, direction });
    }
    
    placeAllWords() {
      for (let w of wordsList) {
        if (this.canPlace(w.word, w.x, w.y, w.direction)) {
          this.placeWordOnGrid(w.word, w.x, w.y, w.direction);
        } else {
          console.warn(`Conflit pour ${w.word} à (${w.x},${w.y}) ${w.direction} – placement forcé`);
          this.placeWordOnGrid(w.word, w.x, w.y, w.direction);
        }
      }
    }
    
    assignNumbers() {
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          this.grid[y][x].number = null;
        }
      }
      let idx = 1;
      for (let p of this.placedWords) {
        const { x, y } = p;
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
          this.grid[y][x].number = idx++;
        }
      }
    }
    
    renderGrid() {
      const gridElement = document.getElementById("crossword");
      if (!gridElement) return;
      gridElement.innerHTML = "";
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const cell = document.createElement("div");
          cell.className = "cell";
          if (this.grid[y][x].blocked) {
            cell.classList.add("blocked");
            gridElement.appendChild(cell);
            continue;
          }
          if (this.grid[y][x].number) {
            const numberSpan = document.createElement("div");
            numberSpan.className = "cell-number";
            numberSpan.textContent = this.grid[y][x].number;
            cell.appendChild(numberSpan);
          }
          const input = document.createElement("input");
          input.type = "text";
          input.maxLength = 1;
          const cellKey = `${x},${y}`;
          if (this.userInput[cellKey]) input.value = this.userInput[cellKey];
          input.addEventListener("input", (e) => this.handleCellInput(x, y, e.target.value));
          input.addEventListener("keydown", (e) => this.handleKeyNavigation(e, x, y));
          input.addEventListener("focus", () => {
            this.activeInput = { x, y };
            cell.classList.add("selected");
          });
          input.addEventListener("blur", () => cell.classList.remove("selected"));
          cell.appendChild(input);
          this.updateCellAppearance(cell, x, y);
          gridElement.appendChild(cell);
        }
      }
    }
    
    updateCellAppearance(cell, x, y) {
      const cellKey = `${x},${y}`;
      cell.classList.remove("correct", "incorrect");
      if (this.userInput[cellKey]) {
        const expected = this.grid[y][x].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const user = this.userInput[cellKey].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        if (expected === user) cell.classList.add("correct");
        else cell.classList.add("incorrect");
      }
    }
    
    handleCellInput(x, y, value) {
      const cellKey = `${x},${y}`;
      if (value) {
        value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().slice(0,1);
        this.userInput[cellKey] = value;
      } else {
        delete this.userInput[cellKey];
      }
      this.renderGrid();
      this.updateProgress();
      setTimeout(() => this.focusNextCell(x, y), 10);
    }
    
    focusNextCell(x, y) {
      const dir = this.getCurrentWordDirection(x, y);
      if (dir === "across") this.moveFocus(x+1, y);
      else if (dir === "down") this.moveFocus(x, y+1);
      else this.moveFocus(x+1, y);
    }
    
    getCurrentWordDirection(x, y) {
      for (let p of this.placedWords) {
        const { word, x: sx, y: sy, direction } = p;
        if (direction === "across" && y === sy && x >= sx && x < sx + word.length) return "across";
        if (direction === "down" && x === sx && y >= sy && y < sy + word.length) return "down";
      }
      return null;
    }
    
    moveFocus(x, y) {
      if (x < 0 || y < 0 || x >= this.gridSize || y >= this.gridSize) return;
      if (this.grid[y][x].blocked) {
        if (x+1 < this.gridSize) this.moveFocus(x+1, y);
        else if (y+1 < this.gridSize) this.moveFocus(0, y+1);
        return;
      }
      const gridEl = document.querySelector("#crossword");
      const index = y * this.gridSize + x;
      const cell = gridEl.children[index];
      const input = cell?.querySelector("input");
      if (input) setTimeout(() => input.focus(), 10);
    }
    
    handleKeyNavigation(e, x, y) {
      const key = e.key;
      if (key === "ArrowRight") { e.preventDefault(); this.moveFocus(x+1, y); }
      else if (key === "ArrowLeft") { e.preventDefault(); this.moveFocus(x-1, y); }
      else if (key === "ArrowUp") { e.preventDefault(); this.moveFocus(x, y-1); }
      else if (key === "ArrowDown") { e.preventDefault(); this.moveFocus(x, y+1); }
      else if (key === "Backspace") {
        if (this.userInput[`${x},${y}`]) {
          delete this.userInput[`${x},${y}`];
          this.renderGrid();
          this.updateProgress();
        } else {
          this.moveFocus(x-1, y);
        }
      }
    }
    
    updateProgress() {
      let total = 0, correct = 0;
      let wordsFound = 0;
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (!this.grid[y][x].blocked) {
            total++;
            const key = `${x},${y}`;
            const expected = this.grid[y][x].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            const user = this.userInput[key]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            if (expected === user) correct++;
          }
        }
      }
      for (let p of this.placedWords) {
        let full = true;
        for (let i = 0; i < p.word.length; i++) {
          const cx = p.direction === "across" ? p.x + i : p.x;
          const cy = p.direction === "down" ? p.y + i : p.y;
          const key = `${cx},${cy}`;
          const expected = this.grid[cy][cx].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
          const user = this.userInput[key]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
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
      if (statusEl) statusEl.textContent = `Composants trouvés : ${wordsFound} / ${this.placedWords.length}`;
      if (wordsFound === this.placedWords.length && !this.gameCompleted) {
        this.gameCompleted = true;
        setTimeout(() => alert("🎉 FÉLICITATIONS! Vous avez assemblé tous les composants!"), 50);
      }
    }
    
    revealSolution() {
      if (confirm("⚠️ Afficher la solution ?")) {
        for (let y = 0; y < this.gridSize; y++) {
          for (let x = 0; x < this.gridSize; x++) {
            if (!this.grid[y][x].blocked) this.userInput[`${x},${y}`] = this.grid[y][x].letter;
          }
        }
        this.renderGrid();
        this.updateProgress();
      }
    }
    
    reset() {
      if (confirm("🔄 Réinitialiser la grille ?")) {
        this.userInput = {};
        this.gameCompleted = false;
        clearInterval(this.timerInterval);
        this.startTime = new Date();
        this.elapsedTime = 0;
        const timerEl = document.getElementById("timer");
        if (timerEl) timerEl.textContent = "00:00";
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.renderGrid();
        this.updateProgress();
      }
    }
    
    startTimer() {
      this.startTime = new Date();
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }
    
    updateTimer() {
      if (this.gameCompleted) return;
      const now = new Date();
      this.elapsedTime = Math.floor((now - this.startTime) / 1000);
      const minutes = Math.floor(this.elapsedTime / 60);
      const seconds = this.elapsedTime % 60;
      const timerEl = document.getElementById("timer");
      if (timerEl) timerEl.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    
    setupEventListeners() {
      const revealBtn = document.getElementById("reveal");
      const resetBtn = document.getElementById("reset");
      if (revealBtn) revealBtn.addEventListener("click", () => this.revealSolution());
      if (resetBtn) resetBtn.addEventListener("click", () => this.reset());
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => new Crossword());
})();