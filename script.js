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
  // Set current puzzle data based on level
  const currentPuzzle = puzzleData[(currentLevel - 1) % puzzleData.length];

  // Update UI
  levelElement.textContent = currentLevel;

  // Create tiles
  createTiles();

  // Reset game state
  moves = 0;
  movesElement.textContent = "0";
  clearInterval(timerInterval);
  timerElement.textContent = "00:00";

  // Show start message
  message.textContent = "Slide the tiles to complete the image!";
  message.style.borderColor = "var(--accent-color)";
}

// Create tiles based on current grid size
function createTiles() {
  puzzle.innerHTML = "";
  tiles = [];

  // Calculate tile size based on grid
  tileSize = 300 / gridSize;

  // Update puzzle container size
  puzzle.style.width = `${gridSize * tileSize}px`;
  puzzle.style.height = `${gridSize * tileSize}px`;

  // Get current puzzle data
  const currentPuzzle = puzzleData[(currentLevel - 1) % puzzleData.length];

  // Create grid of tiles
  for (let i = 0; i < gridSize * gridSize; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = i;

    // Set tile size
    tile.style.width = `${tileSize}px`;
    tile.style.height = `${tileSize}px`;

    // Last tile is empty
    if (i === gridSize * gridSize - 1) {
      tile.classList.add("empty");
    } else {
      // Set background image and position
      tile.style.backgroundImage = `url(${currentPuzzle.image})`;
      tile.style.backgroundSize = `${gridSize * tileSize}px ${gridSize * tileSize}px`;
      tile.style.backgroundPosition = `-${(i % gridSize) * tileSize}px -${Math.floor(i / gridSize) * tileSize}px`;
    }

    // Set initial position
    const col = i % gridSize;
    const row = Math.floor(i / gridSize);
    tile.style.transform = `translate(${col * tileSize}px, ${row * tileSize}px)`;

    puzzle.appendChild(tile);
    tiles.push(tile);
  }

  // Add event listeners
  addTileEvents();
}

// Add event listeners to tiles
function addTileEvents() {
  tiles.forEach((tile) => {
    // Click event for mobile-friendly interaction
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

    // Drag and drop events
    tile.setAttribute("draggable", !tile.classList.contains("empty"));

    tile.addEventListener("dragstart", (e) => {
      if (!gameActive || !startScreen.classList.contains("hidden")) return;

      if (!tile.classList.contains("empty")) {
        tile.classList.add("dragging");
        e.dataTransfer.setData("text", tile.dataset.index);
      }
    });

    tile.addEventListener("dragend", () => {
      tile.classList.remove("dragging");
    });

    tile.addEventListener("dragover", (e) => e.preventDefault());

    tile.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!gameActive || !startScreen.classList.contains("hidden")) return;

      if (tile.classList.contains("empty")) {
        const draggedIndex = e.dataTransfer.getData("text");
        const draggedTile = document.querySelector(`.tile[data-index="${draggedIndex}"]`);

        if (canMove(draggedTile, tile)) {
          swapTiles(draggedTile, tile);
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

  // Get positions
  const tileTransform = getTransformValues(tile);
  const emptyTransform = getTransformValues(emptyTile);

  // Check if adjacent (horizontally or vertically)
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
  // Play sound
  if (tileMoveSound) {
    tileMoveSound.currentTime = 0;
    tileMoveSound.play().catch((e) => console.log("Audio play failed:", e));
  }

  // Swap transform styles
  const tempTransform = tile1.style.transform;
  tile1.style.transform = tile2.style.transform;
  tile2.style.transform = tempTransform;

  // Update data indices
  const tile1Index = parseInt(tile1.dataset.index);
  const tile2Index = parseInt(tile2.dataset.index);

  // Update the tiles array
  const tempTile = tiles[tile1Index];
  tiles[tile1Index] = tiles[tile2Index];
  tiles[tile2Index] = tempTile;

  // Swap data-index attributes
  tile1.dataset.index = tile2Index;
  tile2.dataset.index = tile1Index;

  // Remove hint if showing
  if (showingHint) {
    clearHint();
  }
}

// Shuffle tiles
function shuffleTiles() {
  // Play button sound
  if (buttonClickSound) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
  }

  // Reset game state if already playing
  if (gameActive) {
    clearInterval(timerInterval);
    moves = 0;
    movesElement.textContent = "0";
  }

  // Make sure we have a valid puzzle before shuffling
  if (!puzzle || tiles.length === 0) {
    console.error("Puzzle not initialized");
    return;
  }

  // Get empty tile
  const emptyTile = document.querySelector(".tile.empty");
  if (!emptyTile) {
    console.error("Empty tile not found");
    return;
  }

  // Perform random valid moves to ensure solvable puzzle
  for (let i = 0; i < 100; i++) {
    // Find movable tiles (adjacent to empty)
    const movableTiles = [];

    tiles.forEach((tile) => {
      if (!tile.classList.contains("empty") && canMove(tile, emptyTile)) {
        movableTiles.push(tile);
      }
    });

    // Pick random movable tile
    if (movableTiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * movableTiles.length);
      const randomTile = movableTiles[randomIndex];
      swapTiles(randomTile, emptyTile);
    }
  }

  // Hide all tiles (remove revealed class)
  tiles.forEach((tile) => tile.classList.remove("revealed"));

  // Start game
  startGame();
}

// Start game
function startGame() {
  gameActive = true;
  startTime = Date.now();

  // Start timer
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  // Hide start screen
  startScreen.classList.add("hidden");

  // Update message
  message.textContent = "Slide the tiles to complete the image!";
  message.style.borderColor = "var(--accent-color)";

  // Reset moves
  moves = 0;
  movesElement.textContent = "0";
}

// Update timer
function updateTimer() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
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
  // Make sure we have a valid puzzle
  if (!puzzle || tiles.length === 0) return false;

  let isCorrect = true;

  // Check each tile position
  for (let i = 0; i < tiles.length; i++) {
    const tile = document.querySelector(`.tile[data-index="${i}"]`);
    if (!tile) continue;

    // Skip empty tile
    if (tile.classList.contains("empty")) continue;

    // Calculate correct position
    const col = i % gridSize;
    const row = Math.floor(i / gridSize);
    const correctTransform = `translate(${col * tileSize}px, ${row * tileSize}px)`;

    // Compare with current position
    if (tile.style.transform !== correctTransform) {
      isCorrect = false;
      break;
    }
  }

  if (isCorrect) {
    // Game won!
    gameActive = false;
    clearInterval(timerInterval);

    // Reveal all tiles
    tiles.forEach((tile) => tile.classList.add("revealed"));

    // Play win sound
    if (gameWinSound) {
      gameWinSound.currentTime = 0;
      gameWinSound.play().catch((e) => console.log("Audio play failed:", e));
    }

    // Update win screen
    winTimeElement.textContent = timerElement.textContent;
    winMovesElement.textContent = moves;

    // Update tech info
    const currentPuzzle = puzzleData[(currentLevel - 1) % puzzleData.length];
    techTermElement.textContent = currentPuzzle.term;
    techDefinitionElement.textContent = currentPuzzle.definition;

    // Show win screen after a short delay
    setTimeout(() => {
      winScreen.classList.remove("hidden");
    }, 1000);

    // Update message
    message.textContent = "Puzzle Solved! Great job!";
    message.style.borderColor = "var(--success-color)";
  }
}

// Show hint
function showHint() {
  // Play button sound
  if (buttonClickSound) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
  }

  if (!gameActive) return;

  // Clear any existing hint
  clearHint();

  // Find a tile that's not in the correct position
  let hintShown = false;

  for (let i = 0; i < gridSize * gridSize - 1; i++) {
    // Skip the empty tile
    const tile = document.querySelector(`.tile[data-index="${i}"]`);
    if (!tile || tile.classList.contains("empty")) continue;

    // Calculate correct position
    const correctCol = i % gridSize;
    const correctRow = Math.floor(i / gridSize);
    const correctTransform = `translate(${correctCol * tileSize}px, ${correctRow * tileSize}px)`;

    // Check if tile is in wrong position
    if (tile.style.transform !== correctTransform) {
      // This tile is not in the correct position
      tile.classList.add("hint");
      showingHint = true;
      hintShown = true;

      // Update message
      message.textContent = `Hint: This tile is out of place`;
      message.style.borderColor = "var(--accent-color)";

      // Clear hint after 3 seconds
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
  // Play button sound
  if (buttonClickSound) {
    buttonClickSound.currentTime = 0;
    buttonClickSound.play().catch((e) => console.log("Audio play failed:", e));
  }

  // Update active button
  difficultyButtons.forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.size) === size);
  });

  // Update grid size
  gridSize = size;

  // Reinitialize game
  initGame();

  // If game is active, shuffle
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

    // Hide win screen
    winScreen.classList.add("hidden");

    // Increase level
    currentLevel++;
    levelElement.textContent = currentLevel;

    // Initialize new level
    initGame();
    shuffleTiles();
  });
}

// Difficulty buttons
difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const size = parseInt(btn.dataset.size);
    changeDifficulty(size);
  });
});

// Initialize game when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initGame();

  // Add event listener for keyboard controls
  document.addEventListener("keydown", (e) => {
    if (!gameActive) return;

    const emptyTile = document.querySelector(".tile.empty");
    if (!emptyTile) return;

    const emptyPos = getTransformValues(emptyTile);
    let tileToMove = null;

    switch (e.key) {
      case "ArrowUp":
        // Move tile below empty space up
        tileToMove = getTileAtPosition(emptyPos.x, emptyPos.y + tileSize);
        break;
      case "ArrowDown":
        // Move tile above empty space down
        tileToMove = getTileAtPosition(emptyPos.x, emptyPos.y - tileSize);
        break;
      case "ArrowLeft":
        // Move tile to the right of empty space left
        tileToMove = getTileAtPosition(emptyPos.x + tileSize, emptyPos.y);
        break;
      case "ArrowRight":
        // Move tile to the left of empty space right
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