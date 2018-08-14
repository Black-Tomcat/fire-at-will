// ./src/index.js
// This is the core of the game. This consists of the gameloop, which handles
// all updates to the game system as well as the rendering.

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

import 'semantic-ui-css/semantic.min.css';
import {Button} from 'semantic-ui-react';



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
        // Initialize a game, currently done statically
        // TODO change this so it fits with a dynamic, potentially file loaded
        // system.

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
        // Loads all the game.json data into the game dynamically.
        // Also allows for saving the game data, which wouldn't be possible with
        // the 'import ... from ...' notation.

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
        // Creates a PIXI application that allows for the rendering of sprites.
        // Also handles the generation of sprites, and frees the resource to be
        // Used by the spaceship factory.

        this.pixiApp = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight
        });
        const renderer = this.pixiApp.renderer;

        renderer.autoResize = true;
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";

        // Loading the sprites into the PIXI loader, then allowing access to
        // them at a classwide scope.
        PIXI.loader.add(
            "galaca", sprites
        ).load( () => {
            this.pixiResources = PIXI.loader.resources;
            loadedCallback();
        });

        // Attaching the stage to the main app so rendering can be performed.
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
    };

    gameLoop = () => {
        // The game loop. Exactly what it says it is.
        // Timing mechanism updates the game state once every 1/60th of a second
        // and in the meantime, renders the rest of the game as fast as possible.

        // Calculate lag (how much time has passed since the last game update.
        let current = new Date().getTime();
        let elapsed = current - this.previous;
        this.previous = current;
        this.lag += elapsed;

        // If lag is greater than the 1/60th of a second, update the game.
        // Continue to do this while the lag is higher than that.
        while (this.lag >= GameCore.MS_PER_UPDATE) {
            // TODO update by a set number of 'turns' to increase performace
            // elapsedTurns = Math.Floor(lag/GameCore.MS_PER_UPDATE) or somethign
            // this.updateGameState(elapsedTurns)
            this.lag -= GameCore.MS_PER_UPDATE;
            this.updateGameState(GameCore.MS_PER_UPDATE);
        }

        // Render the graphics with an idea of how much time has passed.
        // Passing in the lag helps better simulate the motion of projectiles and
        // other fast moving sprites on the game field.
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

        // recall the game loop, and free up resources for Electron/PIXI
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
        // Handles adding a specific component to the game core, in order for it
        // to be updated by it's relevant methods (renderGraphics or updateGameState)
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
