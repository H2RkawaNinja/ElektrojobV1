import * as alt from 'alt-server';

alt.onClient('startRepairJob', (player) => {
    alt.log(`${player.name} hat den Reparatur-Job gestartet`);
    alt.emitClient(player, 'openMinigame');
});

alt.onClient('repairSuccess', (player) => {
    alt.emitClient(player, 'notify', '✅ Erfolgreich repariert!');
    alt.log(`${player.name} hat den Reparatur-Job erfolgreich abgeschlossen.`);
});

alt.onClient('repairFail', (player) => {
    alt.emitClient(player, 'notify', '❌ Fehlgeschlagen, versuche es erneut!');
    alt.log(`${player.name} hat den Reparatur-Job nicht erfolgreich abgeschlossen.`);
});
