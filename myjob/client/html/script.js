const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const messageElement = document.getElementById("message");

canvas.width = 600;
canvas.height = 360;

let wirePosition = { x: 1, y: 1 };  // Drahtstartposition im Labyrinth
let wireTrail = [{ x: wirePosition.x, y: wirePosition.y }];  // Der Draht hinterlässt eine Spur
let isGoalReached = false;  // Variable, um zu verfolgen, ob das Ziel erreicht wurde

// Labyrinthstruktur (0 = Leer, 1 = Wand, 2 = Eingang, 3 = Ausgang)
const mazeStructure = [
    " ###################",
    "#  #         #    ##",
    "#  ##  #  ## #  ## #",
    "#  #  ##   #  #    #",
    "#  ##  ##  #  ##   #",
    "#   #  #  #     #   #",
    "   #  ##  #  #  ### ",
    "#  #  ##    ##     #",
    "#     #  #     #    ",
    "#  ##  ##   #   ### ",
    "#     #  #   #     #",
    "################## #"
];

// Labyrinth mit klaren Start- und Endpunkten definieren
mazeStructure[0] = mazeStructure[0].slice(0, 1) + " " + mazeStructure[0].slice(2); // Eingang auf (0,0)
mazeStructure[mazeStructure.length - 1] = mazeStructure[mazeStructure.length - 1].slice(0, mazeStructure[mazeStructure.length - 1].length - 1) + " "; // Ausgang auf (max x, max y)

// Funktion, um das Labyrinth zu erstellen
function createMaze() {
    maze = [];
    for (let row = 0; row < mazeStructure.length; row++) {
        let mazeRow = [];
        for (let col = 0; col < mazeStructure[row].length; col++) {
            if (mazeStructure[row][col] === "#") {
                mazeRow.push(1); // Wand
            } else if (mazeStructure[row][col] === " ") {
                mazeRow.push(0); // Leer
            }
        }
        maze.push(mazeRow);
    }
}

// Funktion, um das Labyrinth zu zeichnen
function drawMaze() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col] === 1) {
                ctx.fillStyle = "#444"; // Wandfarbe
                ctx.fillRect(col * 30, row * 30, 30, 30);
            }
        }
    }
}

// Funktion, um den Draht zu zeichnen
function drawWire() {
    const wireColor = isGoalReached ? "#00FF00" : "#FF5733";  // Draht wird grün, wenn das Ziel erreicht ist
    ctx.fillStyle = wireColor;
    ctx.beginPath();
    ctx.arc(wirePosition.x * 30 + 15, wirePosition.y * 30 + 15, 10, 0, Math.PI * 2);
    ctx.fill();
}

// Funktion, um das Ziel zu zeichnen (Sicherung)
function drawEnd() {
    ctx.fillStyle = "#00FF00";  // Ziel-Farbe
    ctx.beginPath();
    ctx.arc(maze[0].length * 30 - 15, maze.length * 30 - 15, 15, 0, Math.PI * 2);
    ctx.fill();
}

// Funktion, um das Gitter zu zeichnen
function drawGrid() {
    ctx.strokeStyle = "#999";  // Gitterfarbe
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}

// Überprüfen, ob der Draht mit einer Wand kollidiert
function isCollision(x, y) {
    if (x < 0 || y < 0 || x >= maze[0].length || y >= maze.length) {
        return true;  // Außerhalb des Labyrinths
    }
    return maze[y][x] === 1;  // Wenn eine Wand ist
}

// Funktion für die Steuerung mit WASD
function handleMovement(dx, dy) {
    const newX = wirePosition.x + dx;
    const newY = wirePosition.y + dy;

    if (!isCollision(newX, newY)) {
        wirePosition.x = newX;
        wirePosition.y = newY;
        wireTrail.push({ x: wirePosition.x, y: wirePosition.y });  // Draht hinterlässt Spur
    }
}

// Bei Erfolg des Spiels (Draht erreicht das Ziel)
function checkForGoal() {
    const goalX = maze[0].length - 1;
    const goalY = maze.length - 1;

    if (wirePosition.x === goalX && wirePosition.y === goalY) {
        isGoalReached = true;
        messageElement.innerText = " Du hast das Ziel erreicht!";  // Erfolgsmeldung
        alt.emit('minigameResult', true);  // Sende Erfolg an den Server
    }
}

// Bei Fehlschlag (Draht kollidiert mit einer Wand oder geht aus dem Labyrinth)
function checkForFailure() {
    const failureCondition = isCollision(wirePosition.x, wirePosition.y);
    if (failureCondition) {
        messageElement.innerText = " Du bist gescheitert!";  // Fehlermeldung
        alt.emit('minigameResult', false);  // Sende Fehlschlag an den Server
    }
}

// Überprüfe, ob das Ziel erreicht wurde oder der Draht gescheitert ist
function checkGameStatus() {
    checkForGoal();
    checkForFailure();
}


// Eventlistener für die Tasteneingabe
window.addEventListener("keydown", (event) => {
    if (event.key === "w") {
        handleMovement(0, -1);  // Nach oben
    } else if (event.key === "a") {
        handleMovement(-1, 0);  // Nach links
    } else if (event.key === "s") {
        handleMovement(0, 1);  // Nach unten
    } else if (event.key === "d") {
        handleMovement(1, 0);  // Nach rechts
    }
});

// Spiel zeichnen
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Canvas leeren
    drawGrid();  // Gitter zeichnen
    drawMaze();  // Labyrinth zeichnen

    // Draht und seine Spur zeichnen
    wireTrail.forEach((point, index) => {
        const wireColor = isGoalReached ? "#00FF00" : "#FF5733";  // Drahtfarbe ändern, wenn Ziel erreicht
        ctx.fillStyle = wireColor;
        ctx.beginPath();
        ctx.arc(point.x * 30 + 15, point.y * 30 + 15, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    drawEnd();  // Ziel (Sicherung) zeichnen
    checkForGoal();  // Überprüfen, ob das Ziel erreicht wurde
}

// Initiales Spiel starten
createMaze();
drawGame();

// Animations-Loop für das Spiel
function gameLoop() {
    drawGame();  // Zeichnet das Labyrinth, den Draht und das Ziel
    requestAnimationFrame(gameLoop);  // Wiederhole den Loop
}

// Startet die Animation
gameLoop();

document.getElementById('message').classList.add('visible');
