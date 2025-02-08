import * as alt from 'alt-client';
import * as native from 'natives';

// Mehrere Job-Positionen hinzufügen
const jobPositions = [
    { x: 741.521, y: -1987.134, z: 29.179 },
    { x: 740.426, y: -1999.226, z: 29.179 },
    { x: 746.558, y: -1999.793, z: 29.179 },
    { x: 742.510, y: -1974.976, z: 29.179 },
    { x: 748.695, y: -1975.490, z: 29.179 },
    { x: 748.747, y: -1937.314, z: 29.179 },
    { x: 754.840, y: -1937.776, z: 29.179 },
    { x: 755.908, y: -1925.736, z: 29.179 },
    { x: 749.789, y: -1925.235, z: 29.179 },
    { x: 722.927, y: -1940.980, z: 29.179 },
    { x: 728.532, y: -1909.873, z: 29.179 },
    { x: 692.532, y: 142.734, z: 80.925 },
    { x: 686.743, y: 144.738, z: 80.925 },
    { x: 692.097, y: 160.207, z: 80.925 },
    { x: 697.938, y: 158.229, z: 80.925 },
    { x: 679.714, y: 171.112, z: 80.941 },
    { x: 685.609, y: 169.095, z: 80.941 },
    { x: 680.044, y: 153.613, z: 80.925 },
    { x: 674.268, y: 155.736, z: 80.925 },
    { x: 670.259, y: 128.163, z: 80.941 },
    { x: 664.404, y: 130.207, z: 80.941 },
    { x: 658.932, y: 114.791, z: 80.908 },
    { x: 664.708, y: 112.747, z: 80.908 },
    { x: 676.760, y: 119.301, z: 80.925 },
    { x: 682.563, y: 117.284, z: 80.925 },
    { x: 703.213, y: 119.829, z: 80.941 },
    { x: 708.949, y: 117.547, z: 80.941 },
    { x: 703.371, y: 102.316, z: 80.739 },
    { x: 697.530, y: 104.242, z: 80.925 }
];//füge hier weitere Positionen hinzu

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
            Math.pow(jobPosition.x - player.pos.x, 1) +
            Math.pow(jobPosition.y - player.pos.y, 1) +
            Math.pow(jobPosition.z - player.pos.z, 1)
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
