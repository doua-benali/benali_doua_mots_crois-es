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
  updateCellAppearance(cell, x, y) {
    const cellKey = `${x},${y}`;
    cell.classList.remove("correct", "incorrect");

    if (this.userInput[cellKey]) {
      const expected = this.grid[y][x].letter
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
      const user = this.userInput[cellKey]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

      if (expected === user) {
        cell.classList.add("correct");
      } else {
        cell.classList.add("incorrect");
      }
    }
  }

  handleCellInput(x, y, value) {
    const cellKey = `${x},${y}`;

    if (value) {
      value = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .slice(0, 1);
      this.userInput[cellKey] = value;
    } else {
      delete this.userInput[cellKey];
    }

    this.renderGrid();
    this.updateProgress();

    setTimeout(() => {
      this.focusNextCell(x, y);
    }, 10);
  }
   handleKeyNavigation(e, x, y) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      this.moveFocus(x + 1, y);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.moveFocus(x - 1, y);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      this.moveFocus(x, y - 1);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.moveFocus(x, y + 1);
    }

    if (e.key === "Backspace") {
      if (this.userInput[`${x},${y}`]) {
        delete this.userInput[`${x},${y}`];
        this.renderGrid();
        this.updateProgress();
      } else {
        this.moveFocus(x - 1, y);
      }
    }
  }
  focusNextCell(x, y) {
    // Trouver la direction du mot actuel
    const direction = this.getCurrentWordDirection(x, y);
    
    if (direction === "across") {
      // Se déplacer vers la droite (sur la même ligne)
      this.moveFocus(x + 1, y);
    } else if (direction === "down") {
      // Se déplacer vers le bas (même colonne)
      this.moveFocus(x, y + 1);
    } else {
      // Par défaut : se déplacer vers la droite
      this.moveFocus(x + 1, y);
    }
  }

  getCurrentWordDirection(x, y) {
    // Vérifier à quel mot appartient cette case
    for (let wordObj of this.words) {
      const { word, x: startX, y: startY, direction } = wordObj;
      
      if (direction === "across") {
        // Vérifier si la case est sur cette ligne horizontale
        if (y === startY && x >= startX && x < startX + word.length) {
          return "across";
        }
      } else if (direction === "down") {
        // Vérifier si la case est sur cette colonne verticale
        if (x === startX && y >= startY && y < startY + word.length) {
          return "down";
        }
      }
    }
    return null;
  }

  moveFocus(x, y) {
    if (x < 0 || y < 0 || x >= this.gridSize || y >= this.gridSize) return;
    if (this.grid[y][x].blocked) {
      // Si case bloquée, essayer la suivante
      if (x + 1 < this.gridSize) {
        this.moveFocus(x + 1, y);
      } else if (y + 1 < this.gridSize) {
        this.moveFocus(0, y + 1);
      }
      return;
    }

    const gridElement = document.querySelector("#crossword");
    const index = y * this.gridSize + x;
    const cell = gridElement.children[index];
    const input = cell.querySelector("input");

    if (input) {
      setTimeout(() => input.focus(), 10);
    }
  }

}
