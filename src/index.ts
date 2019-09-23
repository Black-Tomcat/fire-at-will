// ENTRY POINT TO PROGRAM
import GameCore from 'core/GameCore';

let config = {
    debug: true
};

const gameCore = new GameCore(config);
gameCore.start();