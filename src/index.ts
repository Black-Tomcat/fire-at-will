// ENTRY POINT TO PROGRAM
import GameCore from "core/GameCore";
import "augmented-ui/augmented.css";

let config = {
    debug: true
};

const gameCore = new GameCore(config);
gameCore.start();
