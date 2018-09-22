import GameCore from './core/gameCore';

let config = {
    debug: true
};

const gameCore = new GameCore(config);
gameCore.start();