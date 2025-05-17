// Game elements
const puzzle = document.getElementById("puzzle");
const shuffleBtn = document.getElementById("shuffle");
const hintBtn = document.getElementById("hint");
const message = document.getElementById("message");
const timerElement = document.getElementById("timer");
const movesElement = document.getElementById("moves");
const levelElement = document.getElementById("level");
const startScreen = document.getElementById("start-screen");
const winScreen = document.getElementById("win-screen");
const startGameBtn = document.getElementById("start-game");
const playAgainBtn = document.getElementById("play-again");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const winTimeElement = document.getElementById("win-time");
const winMovesElement = document.getElementById("win-moves");
const techTermElement = document.getElementById("tech-term");
const techDefinitionElement = document.getElementById("tech-definition");

// Audio elements
const tileMoveSound = document.getElementById("tile-move");
const gameWinSound = document.getElementById("game-win");
const buttonClickSound = document.getElementById("button-click");

// Game state
let tiles = [];
let gridSize = 3;
let tileSize = 100;
let moves = 0;
let timerInterval;
let startTime;
let gameActive = false;
let currentLevel = 1;
let showingHint = false;

// Tech puzzle data
const puzzleData = [
  {
    image: "26.jpg", // Router image
    term: "Router",
    definition: "A router connects devices to the internet and each other in a network.",
  },
  {
    image: "https://images.unsplash.com/photo-1620584455-8093dd47d1cc", // Server image
    term: "Server",
    definition: "A server is a computer that provides data to other computers.",
  },
  {
    image: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d", // Firewall image
    term: "Firewall",
    definition: "A firewall is a security system that monitors and controls network traffic.",
  },
];

// Initialize game
function initGame() {
  const currentPuzzle = puzzleData[(currentLevel - 1) % puzzleData.length];
  levelElement.textContent = currentLevel;
  createTiles();
  moves = 0;
  movesElement.textContent = "0";
  clearInterval(timerInterval);
  timerElement.textContent = "00:00";
  message.textContent = "Slide the tiles to complete the image!";
  message.style.borderColor = "var(--accent-color)";
}

// Create tiles based on current grid size
function createTiles() {
  puzzle.innerHTML = "";
  tiles = [];
  tileSize = 300 / gridSize;
  puzzle.style.width = `${gridSize * tileSize}px`;
  puzzle.style.height = `${gridSize * tileSize}px`;
  const currentPuzzle = puzzleData[(currentLevel - 1) % puzzleData.length];

  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = i;
    tile.style.width = `${tileSize}px`;
    tile.style.height = `${tileSize}px`;

    if (i === gridSize * gridSize - 1) {
      tile.classList.add("empty");
    } else {
      tile.style.backgroundImage = `url(${currentPuzzle.image})`;
      tile.style.backgroundSize = `${gridSize * tileSize}px ${gridSize * tileSize}px`;
      tile.style.backgroundPosition = `-${(i % gridSize) * tileSize}px -${Math.floor(i / gridSize) * tileSize}px`;
    }

    const col = i % gridSize;
    const row = Math.floor(i / gridSize);
    tile.style.transform = `translate(${col * tileSize}px, ${row * tileSize}px)`;

    puzzle.appendChild(tile);
    tiles.push(tile);
  }

  addTileEvents();
}

// Add event listeners to tiles
function addTileEvents() {
  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      if (!gameActive || !startScreen.classList.contains("hidden")) return;
      if (!tile.classList.contains("empty")) {
        const emptyTile = document.querySelector(".tile.empty");
        if (canMove(tile, emptyTile)) {
          swapTiles(tile, emptyTile);
          updateMoves();
          checkWin();
        }
      }
    });
  });
}

// Check if a tile can move (adjacent to empty tile)
function canMove(tile, emptyTile) {
  if (!tile || !emptyTile) return false;
  const tileTransform = getTransformValues(tile);
  const emptyTransform = getTransformValues(emptyTile);
  const horizontalAdjacent =
    Math.abs(tileTransform.x - emptyTransform.x) === tileSize && tileTransform.y === emptyTransform.y;
  const verticalAdjacent =
    Math.abs(tileTransform.y - emptyTransform.y) === tileSize && tileTransform.x === emptyTransform.x;
  return horizontalAdjacent || verticalAdjacent;
}

// Get x and y values from transform style
function getTransformValues(element) {
  const transform = element.style.transform;
  const match = transform.match(/translate\((-?\d*\.?\d+)px,\s*(-?\d*\.?\d+)px\)/);
  if (match) {
    return {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    };
  }
  return { x: 0, y: 0 };
}

// Swap two tiles
function swapTiles(tile1, tile2) {
  if (tileMoveSound) {
    tileMoveSound.currentTime = 0;
    tileMoveSound.play().catch((e) => console.log("Audio play failed:", e));
  }
  const tempTransform = tile1.style.transform;
  tile1.style.transform = tile2.style.transform;
  tile2.style.transform = tempTransform;
  const tile1Index = parseInt(tile1.dataset.index);
  const tile2Index = parseInt(tile2.dataset.index);
  const tempTile = tiles[tile1Index];
  tiles[tile1Index] = tiles[tile2Index];
  tiles[tile2Index] = tempTile;
  tile1.dataset.index = tile2Index;
  tile2.dataset.index = tile1Index;
  if (showingHint) {
    clearHint();
  }
}

// Shuffle tiles
function shuffleTiles() {
  if (buttonClickSound) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
  }
  if (gameActive) {
    clearInterval(timerInterval);
    moves = 0;
    movesElement.textContent = "0";
  }
  if (!puzzle || tiles.length === 0 || !document.querySelector(".tile.empty")) {
    console.error("Puzzle not initialized or empty tile missing");
    return;
  }
  const emptyTile = document.querySelector(".tile.empty");
  for (let i = 0; i < 100; i++) {
    const movableTiles = tiles.filter(
      (tile) => !tile.classList.contains("empty") && canMove(tile, emptyTile)
    );
    if (movableTiles.length > 0) {
      const randomTile = movableTiles[Math.floor(Math.random() * movableTiles.length)];
      swapTiles(randomTile, emptyTile);
    }
  }
  tiles.forEach((tile) => tile.classList.remove("revealed"));
  startGame();
}

// Start game
function startGame() {
  gameActive = true;
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  startScreen.classList.add("hidden");
  message.textContent = "Slide the tiles to complete the image!";
  message.style.borderColor = "var(--accent-color)";
  moves = 0;
  movesElement.textContent = "0";
}

// Update timer
function updateTimer() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
  const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
  timerElement.textContent = `${minutes}:${seconds}`;
}

// Update moves counter
function updateMoves() {
  moves++;
  movesElement.textContent = moves;
}

// Check if puzzle is solved
function checkWin() {
  if (!puzzle || tiles.length === 0) return false;
  let isCorrect = true;
  for (let i = 0; i < tiles.length; i++) {
    const tile = document.querySelector(`.tile[data-index="${i}"]`);
    if (!tile || tile.classList.contains("empty")) continue;
    const currentPos = getTransformValues(tile);
    const col = i % gridSize;
    const row = Math.floor(i / gridSize);
    const correctX = col * tileSize;
    const correctY = row * tileSize;
    if (Math.abs(currentPos.x - correctX) > 1 || Math.abs(currentPos.y - correctY) > 1) {
      isCorrect = false;
      break;
    }
  }
  if (isCorrect) {
    gameActive = false;
    clearInterval(timerInterval);
    tiles.forEach((tile) => tile.classList.add("revealed"));
    if (gameWinSound) {
      gameWinSound.currentTime = 0;
      gameWinSound.play().catch((e) => console.log("Audio play failed:", e));
    }
    winTimeElement.textContent = timerElement.textContent;
    winMovesElement.textContent = moves;
    const currentPuzzle = puzzleData[(currentLevel - 1) % puzzleData.length];
    techTermElement.textContent = currentPuzzle.term;
    techDefinitionElement.textContent = currentPuzzle.definition;
    setTimeout(() => {
      winScreen.classList.remove("hidden");
    }, 1000);
    message.textContent = "Puzzle Solved! Great job!";
    message.style.borderColor = "var(--success-color)";
  }
}

// Show hint
function showHint() {
  if (buttonClickSound) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
  }
  if (!gameActive) return;
  clearHint();
  let hintShown = false;
  for (let i = 0; i < gridSize * gridSize - 1; i++) {
    const tile = document.querySelector(`.tile[data-index="${i}"]`);
    if (!tile || tile.classList.contains("empty")) continue;
    const currentPos = getTransformValues(tile);
    const correctX = (i % gridSize) * tileSize;
    const correctY = Math.floor(i / gridSize) * tileSize;
    if (Math.abs(currentPos.x - correctX) > 1 || Math.abs(currentPos.y - correctY) > 1) {
      tile.classList.add("hint");
      showingHint = true;
      hintShown = true;
      message.textContent = `Hint: This tile is out of place`;
      message.style.borderColor = "var(--accent-color)";
      setTimeout(clearHint, 3000);
      break;
    }
  }
  if (!hintShown) {
    message.textContent = "All tiles are in correct positions!";
    message.style.borderColor = "var(--success-color)";
    setTimeout(() => {
      message.textContent = "Slide the tiles to complete the image!";
      message.style.borderColor = "var(--accent-color)";
    }, 3000);
  }
}

// Clear hint
function clearHint() {
  const hintTiles = document.querySelectorAll(".tile.hint");
  hintTiles.forEach((tile) => tile.classList.remove("hint"));
  showingHint = false;
}

// Change difficulty
function changeDifficulty(size) {
  if (buttonClickSound) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
  }
  difficultyButtons.forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.size) === size);
  });
  gridSize = size;
  initGame();
  if (gameActive) {
    shuffleTiles();
  }
}

// Event listeners
if (shuffleBtn) {
  shuffleBtn.addEventListener("click", shuffleTiles);
}
if (hintBtn) {
  hintBtn.addEventListener("click", showHint);
}
if (startGameBtn) {
  startGameBtn.addEventListener("click", () => {
    if (buttonClickSound) {
      buttonClickSound.currentTime = 0;
      buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
    }
    shuffleTiles();
  });
}
if (playAgainBtn) {
  playAgainBtn.addEventListener("click", () => {
    if (buttonClickSound) {
      buttonClickSound.currentTime = 0;
      buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
    }
    winScreen.classList.add("hidden");
    currentLevel++;
    levelElement.textContent = currentLevel;
    initGame();
    shuffleTiles();
  });
}
difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const size = parseInt(btn.dataset.size);
    changeDifficulty(size);
  });
});

// Initialize game when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initGame();
  document.addEventListener("keydown", (e) => {
    if (!gameActive) return;
    const emptyTile = document.querySelector(".tile.empty");
    if (!emptyTile) return;
    const emptyPos = getTransformValues(emptyTile);
    let tileToMove = null;
    switch (e.key) {
      case "ArrowUp":
        tileToMove = getTileAtPosition(emptyPos.x, emptyPos.y + tileSize);
        break;
      case "ArrowDown":
        tileToMove = getTileAtPosition(emptyPos.x, emptyPos.y - tileSize);
        break;
      case "ArrowLeft":
        tileToMove = getTileAtPosition(emptyPos.x + tileSize, emptyPos.y);
        break;
      case "ArrowRight":
        tileToMove = getTileAtPosition(emptyPos.x - tileSize, emptyPos.y);
        break;
    }
    if (tileToMove) {
      swapTiles(tileToMove, emptyTile);
      updateMoves();
      checkWin();
    }
  });
});

// Helper function to get tile at specific position
function getTileAtPosition(x, y) {
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const pos = getTransformValues(tile);
    if (Math.abs(pos.x - x) < 1 && Math.abs(pos.y - y) < 1) {
      return tile;
    }
  }
  return null;
}

// Initialize game
initGame();