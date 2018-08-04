import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import path from 'path';
import Storage from 'electron-json-storage';

import App from './app.js';


class GameCore {
    static MS_PER_UPDATE = 1000/60;

    constructor() {
        this.playing = true;

        this.reactComponentOptions = {"foo": 100};
        this.previous = new Date().getTime();
        this.lag = 0.0;

        this.frames = 0;
        this.frames_time = 0.0
    }

    gameLoop = () => {
        let current = new Date().getTime();
        let elapsed = current - this.previous;
        this.previous = current;
        this.lag += elapsed;

        while (this.lag >= GameCore.MS_PER_UPDATE) {
            // TODO update by a set number of 'turns' to increase performace
            // elapsedTurns = Math.Floor(lag/GameCore.MS_PER_UPDATE) or somethign
            // this.updateGameState(elapsedTurns)
            this.lag -= GameCore.MS_PER_UPDATE;
            this.updateGameState();
        }

        this.renderGraphics();
        this.frames += 1;
        this.frames_time += elapsed;
        if (this.frames_time >= 1000) {
            this.frames_time -= 1000;
            console.log("frames: ", this.frames);
            this.frames = 0;
        }
        setTimeout(this.gameLoop, 1)
    };

    updateGameState = () => {
        this.reactComponentOptions["foo"] += 1;
    };

    renderGraphics = () => {
        ReactDOM.render(
            <App options={this.reactComponentOptions}/>,
            document.getElementById("react-entry")
        );
    };

    loadShipTemplate() {
        let shipTemplates;

        Storage.setDataPath(path.resolve("./game_data"));
        Storage.set(
            "shipTemplates",
            {foo: "bar"},
            err => {
                if (err) throw err;
                Storage.get(
                    "shipTemplates",
                    (err, data) => {
                        if (err) throw err;
                        shipTemplates = data;
                    }
                )
            }
        );
    }
}

ReactDOM.render(
    <App options={{}}/>,
    document.getElementById("react-entry")
);

const gameCore = new GameCore();
gameCore.gameLoop();
