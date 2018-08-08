import React, {Component} from 'react';
import ReactDOM from 'react-dom';
const PIXI = require("pixi.js");

import './css/app.sass';
import sprites from "./assets/sprites.png";

import path from 'path';
import Storage from 'electron-json-storage';

import App from './app.js';
import {SpaceshipFactory} from "./game_components/objects/spaceship";
import Fleet from "./game_components/objects/fleet";

import InputComponent from "./game_components/inputComponent";
import PhysicsComponent from "./game_components/physicsComponent";
import AIComponent from "./game_components/aiComponent";
import RenderComponent from "./game_components/renderComponent";
import GameComponent from "./game_components/gameComponent";



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

        this.pixiApp = null;
        this.pixiResources = null;

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

    start() {
        const gameCallback = () => {
            this.setupDummyGame();
            this.gameLoop();
        };

        const spriteCallback = () => {
            this.createStage(
                gameCallback
            );
        };

        this.loadGameData(
            spriteCallback
        );
    };

    loadGameData(loadedCallback) {
        Storage.setDataPath(path.resolve("./game_data"));
        // TODO Learn more about the async nature about this function.
        Storage.get(
            "shipTemplates",
            (err, data) => {
                if (err) throw err;
                this.shipTemplates = data;
                loadedCallback();
            }
        )
    }

    createStage = (loadedCallback) => {
        this.pixiApp = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight
        });
        const renderer = this.pixiApp.renderer;

        renderer.autoResize = true;
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";

        PIXI.loader.add(
            "galaca", sprites
        ).load( () => {
            this.pixiResources = PIXI.loader.resources;
            loadedCallback();
        });

        document.body.appendChild(this.pixiApp.view);
    };

    setupDummyGame = () => {
        // Create fleets
        this.playerFleet = new Fleet(true);
        this.fleets.push(new Fleet());

        // Add new spaceships to each fleet.
        this.playerFleet.addNewSpaceship(
            this.spaceshipFactory.newSpaceship(
                this.shipTemplates["ships"]["shipTypeName"],
                InputComponent,
                null,
                {x:200, y:200}
            )
        );
        this.fleets[0].addNewSpaceship(
            this.spaceshipFactory.newSpaceship(
                this.shipTemplates["ships"]["shipTypeName"],
                null,
                AIComponent,
                {x:0, y:0}
            )
        );

        // Let the game run
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
            this.updateGameState(GameCore.MS_PER_UPDATE);
        }

        this.renderGraphics(this.lag);

        if (this.config.debug) {
            this.frames += 1;
            this.frames_time += elapsed;
            if (this.frames_time >= 1000) {
                this.frames_time -= 1000;
                console.log("frames: ", this.frames);
                this.frames = 0;
            }
        }

        requestAnimationFrame(this.gameLoop) // TODO find appropriate numbers.
    };

    updateGameState = (delta) => {
        for (let physics of this.physicsComponents) {physics.update(delta);}

        for (let ai of this.aiComponents) {ai.update(delta);}
    };

    renderGraphics = (delta) => {
        for (let render of this.renderComponents) {render.update(delta)}

        // TODO rip this out and trigger re-renders via state actions.
        ReactDOM.render(
            <App options={this.reactProps}/>,
            document.getElementById("react-entry")
        );
    };

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
            this.pixiApp.stage.addChild(component.sprite);
        } else {
            throw new Error("HEEY, PUT THE COMPONENT IN.")
        }
    };
}

const gameCore = new GameCore(
    {
        debug: true
    }
);
gameCore.start();
