const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const messageElement = document.getElementById("message");
const progressBar = document.getElementById("progressBar"); // Progressbar-Element

canvas.width = 600;
canvas.height = 360;

const CELL_SIZE = 30;
const ROWS = Math.floor(canvas.height / CELL_SIZE);
const COLS = Math.floor(canvas.width / CELL_SIZE);

let wirePosition = { x: 1, y: 1 };
let wireTrail = [{ x: wirePosition.x, y: wirePosition.y }];
let isGoalReached = false;
let isGameOver = false;

// ⏳ Zeitlimit in Sekunden
const TIME_LIMIT = 13; // Beispiel: 20 Sekunden
let timeLeft = TIME_LIMIT;

// Initialisiere das Labyrinth
let maze = Array.from({ length: ROWS }, () => Array(COLS).fill(1));

// Richtungen für Maze-Generierung
const directions = [
    { dx: 0, dy: -2 }, // oben
    { dx: 0, dy: 2 },  // unten
    { dx: -2, dy: 0 }, // links
    { dx: 2, dy: 0 }   // rechts
];

function generateMaze() {
    maze = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    let walls = [];

    function addWalls(x, y) {
        if (x > 1 && maze[y][x - 2] === 1) walls.push({ x: x - 2, y, fromX: x, fromY: y });
        if (x < COLS - 2 && maze[y][x + 2] === 1) walls.push({ x: x + 2, y, fromX: x, fromY: y });
        if (y > 1 && maze[y - 2][x] === 1) walls.push({ x, y: y - 2, fromX: x, fromY: y });
        if (y < ROWS - 2 && maze[y + 2][x] === 1) walls.push({ x, y: y + 2, fromX: x, fromY: y });
    }

    let startX = 1;
    let startY = 1;
    maze[startY][startX] = 0;
    addWalls(startX, startY);

    while (walls.length > 0) {
        let randIndex = Math.floor(Math.random() * walls.length);
        let { x, y, fromX, fromY } = walls[randIndex];
        walls.splice(randIndex, 1);

        if (maze[y][x] === 1) {
            maze[y][x] = 0;
            maze[(y + fromY) / 2][(x + fromX) / 2] = 0;
            addWalls(x, y);
        }
    }

    maze[1][1] = 0;  
    maze[ROWS - 2][COLS - 2] = 0;
}

// Wand-Kollision prüfen
function isCollision(x, y) {
    return x < 0 || y < 0 || x >= COLS || y >= ROWS || maze[y][x] === 1;
}

// Spieler zeichnen
function drawWire() {
    ctx.fillStyle = isGameOver ? "#FF0000" : "#FF5733"; // Rot wenn verloren
    ctx.beginPath();
    ctx.arc(wirePosition.x * CELL_SIZE + CELL_SIZE / 2, wirePosition.y * CELL_SIZE + CELL_SIZE / 2, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Ziel zeichnen
function drawEnd() {
    ctx.fillStyle = "#00FF00";
    ctx.beginPath();
    ctx.arc((COLS - 2) * CELL_SIZE + CELL_SIZE / 2, (ROWS - 2) * CELL_SIZE + CELL_SIZE / 2, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Labyrinth zeichnen
function drawMaze() {
    ctx.fillStyle = "#444";
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (maze[row][col] === 1) {
                ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Game Over Zustand überprüfen
function checkForGameOver() {
    if (isCollision(wirePosition.x, wirePosition.y)) {
        endGame(false);
    }
}

// Bewegungshandling
function handleMovement(dx, dy) {
    if (isGameOver || isGoalReached) return; // Bewegung blockieren nach Game Over oder Sieg

    const newX = wirePosition.x + dx;
    const newY = wirePosition.y + dy;

    if (isCollision(newX, newY)) {
        endGame(false);
        return;
    }

    wirePosition.x = newX;
    wirePosition.y = newY;
    wireTrail.push({ x: wirePosition.x, y: wirePosition.y });

    checkForGoal();
}

// Gewinn überprüfen
function checkForGoal() {
    if (wirePosition.x === COLS - 2 && wirePosition.y === ROWS - 2) {
        endGame(true);
    }
}

// ⏳ Timer-Update
function updateTimer() {
    if (isGameOver || isGoalReached) return;

    timeLeft -= 1;
    progressBar.style.width = (timeLeft / TIME_LIMIT) * 100 + "%"; // Fortschrittsbalken aktualisieren

    if (timeLeft <= 0) {
        endGame(false);
    } else {
        setTimeout(updateTimer, 1000);
    }
}

// Spiel beenden (Sieg oder Niederlage)
function endGame(won) {
    isGameOver = true;
    isGoalReached = won;
    messageElement.innerText = won ? "Transformator repariert!" : "Reparatur fehlgeschlagen!";
    messageElement.classList.add("visible");
    alt.emit('minigameResult', won);
}

// Spiel zeichnen
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    wireTrail.forEach(point => {
        ctx.fillStyle = isGoalReached ? "#00FF00" : "#FF5733";
        ctx.beginPath();
        ctx.arc(point.x * CELL_SIZE + CELL_SIZE / 2, point.y * CELL_SIZE + CELL_SIZE / 2, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    drawEnd();
    drawWire();
}

// Tasteneingaben
window.addEventListener("keydown", (event) => {
    if (event.key === "w") handleMovement(0, -1);
    if (event.key === "a") handleMovement(-1, 0);
    if (event.key === "s") handleMovement(0, 1);
    if (event.key === "d") handleMovement(1, 0);
});

// Spiel starten
function initGame() {
    generateMaze();
    drawGame();
    updateTimer(); // Timer starten
}

// Animationsloop
function gameLoop() {
    if (!isGameOver) drawGame();
    requestAnimationFrame(gameLoop);
}

// Starte das Spiel
initGame();
gameLoop();
