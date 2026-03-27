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
}
