import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import path from 'path';
import Storage from 'electron-json-storage';

import App from './app.js';
import Spaceship, {SpaceshipFactory} from "./game_components/objects/spaceship";
import InputComponent from "./game_components/inputComponent";
import PhysicsComponent from "./game_components/physicsComponent";
import AIComponent from "./game_components/aiComponent";
import RenderComponent from "./game_components/renderComponent";
import GameComponent from "./game_components/gameComponent";
import Fleet from "./game_components/objects/fleet";


// USED FOR SKIRMISHES?
class GameCore {
    static MS_PER_UPDATE = 1000/60;

    constructor(options={}) {
        // REACT RENDERING PROPS
        this.reactProps = {"foo": 100};

        // GAME LOOP FIELD
        this.previous = new Date().getTime();
        this.lag = 0.0;

        this.physicsComponents = [];
        this.aiComponents = [];
        this.inputComponents = [];
        this.renderComponents = [];

        // CONFIG OPTIONS
        this.config = {
            debug: false,
            ...options
        };

        //DEBUG CODE
        this.frames = 0;
        this.frames_time = 0.0;

        // GAME UTILITIES
        this.spaceshipFactory = new SpaceshipFactory(this);

        // GAME DATA
        this.shipTemplates = null;

        this.playerFleet = null;
        this.fleets = [];
    }

    start = () => {
        this.loadShipTemplate();
        this.setup();
        this.gameLoop();
    };

    setup = () => {
        // Create fleets
        this.playerFleet = new Fleet(true);
        this.fleets.push(new Fleet());

        // Add new spaceships to each fleet.
        this.playerFleet.addNewSpaceship(
            this.spaceshipFactory.newSpaceship(
                this.shipTemplates["shipTypeName"],
                InputComponent,
                null,
                200, 200
            )
        );
        this.fleets[0].addNewSpaceship(
            this.spaceshipFactory.newSpaceship(
                this.shipTemplates["shipTypeName"],
                null,
                AIComponent,
                100, 300
            )
        );
    };

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
            this.updateGameState(1);
        }

        this.renderGraphics();
        if (this.config.debug) {
            this.frames += 1;
            this.frames_time += elapsed;
            if (this.frames_time >= 1000) {
                this.frames_time -= 1000;
                console.log("frames: ", this.frames);
                this.frames = 0;
            }
        }
        setTimeout(this.gameLoop, 5) // TODO find appropriate numbers.
    };

    updateGameState = (delta) => {
        for (let physics in this.physicsComponents) {
            physics.update(delta);
        }

        for (let ai in this.aiComponents) {
            ai.update(delta);
        }
    };

    renderGraphics = () => {
        // TODO rip this out and trigger re-renders via state actions.
        ReactDOM.render(
            <App options={this.reactProps}/>,
            document.getElementById("react-entry")
        );
    };

    loadShipTemplate() {
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
                        this.shipTemplates = data;
                    }
                )
            }
        );
    }

    addComponent = (component) => {
        // TODO handle an array being passed in.
        if (!(component instanceof GameComponent)) {
            return;
        }

        if (component instanceof AIComponent) {
            this.aiComponents.push(component);
        } else if (component instanceof InputComponent) {
            this.inputComponents.push(component);
        } else if (component instanceof PhysicsComponent) {
            this.physicsComponents.push(component);
        } else if (component instanceof RenderComponent) {
            this.renderComponents.push(component);
        }
    };
}

const gameCore = new GameCore(
    {
        debug: true
    }
);
gameCore.start();
