import * as alt from 'alt-client';
import * as native from 'natives';

// Mehrere Job-Positionen hinzufügen
const jobPositions = [
    { x: 747.613, y: -1987.529, z: 29.178 },
    { x: 1024.345, y: -1505.987, z: 29.238 },
    { x: 1432.823, y: -318.265, z: 69.205 },
    // Weitere Positionen hier hinzufügen...
];
const activationRadius = 5.0;
let isNearJob = false;
let view = null;
let isAnimating = false;

alt.on('keydown', (key) => {
    if (key === 69 && isNearJob && !view) {
        alt.log('🚀 StartRepairJob wird gesendet!');
        alt.emitServer('startRepairJob');
    }
});

alt.everyTick(() => {
    const player = alt.Player.local;
    if (!player || !player.valid) return;

    isNearJob = false;

    // Überprüfe, ob der Spieler sich in der Nähe einer der Positionen befindet
    for (const jobPosition of jobPositions) {
        const distance = Math.sqrt(
            Math.pow(jobPosition.x - player.pos.x, 2) +
            Math.pow(jobPosition.y - player.pos.y, 2) +
            Math.pow(jobPosition.z - player.pos.z, 2)
        );

        if (distance < activationRadius) {
            isNearJob = true;
            // Positionen für die Textanzeige ändern
            native.beginTextCommandDisplayText("STRING");
            native.addTextComponentSubstringPlayerName("Drücke E um den Stromkasten zu reparieren");
            native.endTextCommandDisplayText(jobPosition.x, jobPosition.y, jobPosition.z + 1, 0);
            break; // Sobald eine Position gefunden wurde, keine weiteren Positionen überprüfen
        }
    }
});

alt.onServer('openMinigame', () => {
    if (view) {
        return;
    }

    // Die WebView erstellen
    view = new alt.WebView('http://resource/client/html/index.html');

    view.on('load', () => {
        alt.showCursor(true);  // Zeigt den Cursor an
        alt.toggleGameControls(false);  // Deaktiviert die Spielsteuerung
        view.focus();  // Fokussiert die WebView für Mausinteraktion
        console.log("✅ WebView geladen & Maus aktiviert!");
    });

    // Wenn das Minigame abgeschlossen wird (Erfolg/Misserfolg)
    view.on('minigameResult', (success) => {
        if (view) {
            // Warte 3 Sekunden, bevor das Minigame geschlossen wird
            setTimeout(() => {
                view.destroy();  // WebView zerstören
                view = null;  // Auf null setzen
                alt.showCursor(false);  // Maus verstecken
                alt.toggleGameControls(true);  // Steuerung wieder aktivieren

                // Stoppe die Animation, wenn der Job abgeschlossen ist
                stopRepairAnimation();

                if (success) {
                    alt.emitServer('repairSuccess');  // Erfolgreich
                } else {
                    alt.emitServer('repairFail');  // Fehler
                }
            }, 3000);  // 3 Sekunden warten (3000 ms)
        }
    });

    // Starte eine Reparatur-Animation
    startRepairAnimation();
});

// Funktion zum Starten der Reparatur-Animation
function startRepairAnimation() {
    const player = alt.Player.local;
    if (!player || !player.valid || isAnimating) return;

    isAnimating = true;

    // Animation-Dictionary und Name
    const animDict = 'amb@world_human_welding@male@base';
    const animName = 'base';

    // Lade das Animation-Dictionary
    native.requestAnimDict(animDict);

    // Warten, bis das Dictionary geladen ist
    const interval = setInterval(() => {
        if (native.hasAnimDictLoaded(animDict)) {
            clearInterval(interval);
            // Starte die Animation
            native.taskPlayAnim(player.scriptID, animDict, animName, 1.0, -1.0, -1, 1, 0, false, false, false);
        }
    }, 100);
}

// Funktion zum Stoppen der Reparatur-Animation
function stopRepairAnimation() {
    const player = alt.Player.local;
    if (isAnimating) {
        native.clearPedTasksImmediately(player.scriptID); // Stoppe alle Animationen
        isAnimating = false;
    }
}
