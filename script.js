class Crossword {
  constructor() {
    this.gridSize = 10;
    this.words = [
      // MOTS COURTS adaptés à la grille 10x10
      {
        word: "CPU",
        clue: "Central Processing Unit - Le cerveau de l'ordinateur",
        x: 1,
        y: 0,
        direction: "down",
      },
      {
        word: "RAM",
        clue: "Random Access Memory - Mémoire vive",
        x: 0,
        y: 2,
        direction: "across",
      },
      {
        word: "SSD",
        clue: "Solid State Drive - Stockage rapide",
        x: 6,
        y: 0,
        direction: "down",
      },
      {
        word: "GPU",
        clue: "Graphics Processing Unit - Carte graphique",
        x: 3,
        y: 4,
        direction: "across",
      },
      {
        word: "HDD",
        clue: "Hard Disk Drive - Disque dur mécanique",
        x: 0,
        y: 6,
        direction: "across",
      },
      {
        word: "USB",
        clue: "Universal Serial Bus - Port de connexion",
        x: 5,
        y: 8,
        direction: "across",
      },
      {
        word: "BIOS",
        clue: "Basic Input Output System - Firmware de démarrage",
        x: 8,
        y: 3,
        direction: "down",
      },
      {
        word: "PCIe",
        clue: "Peripheral Component Interconnect Express - Slot d'extension",
        x: 2,
        y: 5,
        direction: "across",
      },
      {
        word: "SATA",
        clue: "Serial ATA - Interface pour disques",
        x: 4,
        y: 7,
        direction: "down",
      },
      {
        word: "DDR",
        clue: "Double Data Rate - Type de RAM",
        x: 7,
        y: 1,
        direction: "across",
      },
    ];

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
    this.createGrid();
    this.placeWords();
    this.renderGrid();
    this.setupEventListeners();
    this.updateProgress();
    this.startTimer();
  }

  createGrid() {
    this.grid = [];
    for (let y = 0; y < this.gridSize; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x] = {
          letter: "",
          blocked: true,
          number: null,
        };
      }
    }
  }

  placeWords() {
    // Réinitialiser toutes les cases
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.grid[y][x].blocked = true;
        this.grid[y][x].letter = "";
        this.grid[y][x].number = null;
      }
    }

    let wordNumber = 1;

    this.words.forEach((wordObj) => {
      const { word, x, y, direction } = wordObj;

      // Vérifier que le mot ne dépasse pas de la grille
      if (direction === "across" && x + word.length > this.gridSize) return;
      if (direction === "down" && y + word.length > this.gridSize) return;

      this.grid[y][x].number = wordNumber;

      for (let i = 0; i < word.length; i++) {
        const currentX = direction === "across" ? x + i : x;
        const currentY = direction === "down" ? y + i : y;

        this.grid[currentY][currentX].letter = word[i];
        this.grid[currentY][currentX].blocked = false;
      }

      wordNumber++;
    });
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
        } else {
          if (this.grid[y][x].number) {
            const number = document.createElement("div");
            number.className = "cell-number";
            number.textContent = this.grid[y][x].number;
            cell.appendChild(number);
          }

          const input = document.createElement("input");
          input.type = "text";
          input.maxLength = 1;

          const cellKey = `${x},${y}`;
          if (this.userInput[cellKey]) {
            input.value = this.userInput[cellKey];
          }

          input.addEventListener("input", (e) => {
            this.handleCellInput(x, y, e.target.value);
          });

          input.addEventListener("keydown", (e) => {
            this.handleKeyNavigation(e, x, y);
          });

          input.addEventListener("focus", () => {
            this.activeInput = { x, y };
            cell.classList.add("selected");
          });

          input.addEventListener("blur", () => {
            cell.classList.remove("selected");
          });

          cell.appendChild(input);

          this.updateCellAppearance(cell, x, y);
        }

        gridElement.appendChild(cell);
      }
    }
  }
}
