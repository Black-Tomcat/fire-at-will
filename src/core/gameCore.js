// ./src/gameCore.js
// This is the core of the game. This consists of the gameloop, which handles
// all updates to the game system as well as the rendering.

import React from 'react';
import ReactDOM from 'react-dom';
const PIXI = require("pixi.js");

import '../css/app.sass';
import sprites from "../assets/sprites.png";
import spritesheetJSON from '../assets/sprites.json';

import path from 'path';
import Storage from 'electron-json-storage';

import App from '../app.js';

import Spaceship from "../objects/spaceship";
import Fleet from "../objects/fleet";

import GameComponent from "../components/gameComponent";

import 'semantic-ui-css/semantic.min.css';
import GameObject from "../objects/gameObject";
import PhysicsCore from "./physicsCore";


export default class GameCore {
    static MS_PER_UPDATE = 1000/60;

    constructor(options={}) {
        // REACT RENDERING PROPS
        this.reactProps = {"foo": 100};

        // GAME LOOP FIELD
        this.previous = null;
        this.lag = 0.0;

        this.components = {
            physicsComponents: [],
            aiComponents: [],
            inputComponents: [],
            renderComponents: [],
            weaponsComponents: []
        };

        this.pixiApp = null;
        this.pixiTextures = null;

        // CONFIG OPTIONS
        this.config = {
            debug: false,
            ...options
        };

        //DEBUG CODE
        this.frames = 0;
        this.frames_time = 0.0;

        // GAME DATA
        this.shipTemplates = null;
        this.firingPatternTemplates = null;

        this.objects = {
            fleets: [],
            spaceships: [],
            bullets: [],
        }
    }

    start() {
        // Initialize a game, currently done statically
        // TODO change this so it fits with a dynamic, potentially file loaded
        // system.

        const gameCallback = () => {
            this.setupDummyGame();
            this.previous = new Date().getTime();
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
        Storage.has("shipTemplates", (err, hasKey) => {
            if (err) throw err;

            if (!hasKey) {
                Storage.get("exampleTemplates", (err, data) => {
                    if (err) throw err;

                    Storage.set("shipTemplates", data, (err) => {
                        if (err) throw err;
                    });
                    this.shipTemplates = data["ships"];
                    this.firingPatternTemplates = data["firingPatterns"];
                    loadedCallback();
                });
            } else {
                Storage.get("shipTemplates", (err, data) => {
                    if (err) throw err;

                    this.shipTemplates = data["ships"];
                    this.firingPatternTemplates = data["firingPatterns"];
                    loadedCallback();
                })
            }
        });
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
            "sprites", sprites
        ).load( (loader, resources) => {
            const spritesheet = new PIXI.Spritesheet(resources["sprites"].texture.baseTexture, spritesheetJSON);

            spritesheet.parse((sprites) => {
                this.pixiTextures = {};
                for (let frame in spritesheetJSON.frames) {
                    this.pixiTextures[frame] = {
                        ...sprites[frame],
                        boundingPoints: spritesheetJSON.frames[frame].boundingPoints
                    }
                }
            });

            loadedCallback();
        });

        // Attaching the stage to the main app so rendering can be performed.
        document.body.appendChild(this.pixiApp.view);
    };

    setupDummyGame = () => {
        // Create fleets
        new Fleet(this, true);
        new Fleet(this);

        // Add new spaceships to each fleet.
        this.objects.fleets[0].addNewSpaceship(
            new Spaceship(
                this,
                this.shipTemplates["aggressiveRammer"],
                {x: 100, y: 100},
                {x: 0, y:0}, // Approx. Bullet speed == 300
                this.objects.fleets[0]
            )
        );

        this.objects.fleets[1].addNewSpaceship(
            new Spaceship(
                this,
                this.shipTemplates["defensiveBullets"],
                {x:400, y:400},
                {x:0, y:-10},
                this.objects.fleets[1],
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
        for (let physics of this.components.physicsComponents) {physics.update(delta, this);}

        for (let ai of this.components.aiComponents) {ai.update(delta, this);}

        for (let weapons of this.components.weaponsComponents) {weapons.update(delta, this)}
    };

    renderGraphics = (delta) => {
        for (let render of this.components.renderComponents) {render.update(delta, this)}

        // TODO rip this out and trigger re-renders via state actions.
        ReactDOM.render(
            <App options={this.reactProps}>
                {this.components.inputComponents.map(el => el.display())}
            </App>,
            document.getElementById("react-entry")
        );
    };

    addComponent = (component) => {
        // Handles adding a specific component to the game core, in order for it
        // to be updated by it's relevant methods (renderGraphics or updateGameState)
        // TODO handle an array being passed in.
        if (!(component instanceof GameComponent)) {
            throw new Error("GameComponent not detected!");
        }

        this.components[component.toString().split("::")[0] + "s"].push(component);
    };

    addGameObject = (object) => {
        if (!(object instanceof GameObject)) {
            throw new Error("GameObject not detected!")
        }

        this.objects[object.toString().split("::")[0] + "s"].push(object)
    }
}
