// ./src/gameCore.js
// This is the core of the game. This consists of the gameloop, which handles
// all updates to the game system as well as the rendering.

import React from 'react';
import ReactDOM from 'react-dom';
import {Application, Spritesheet, Texture, BaseTexture, Loader, LoaderResource} from "pixi.js";

import '../css/app.css';
import sprites from "../assets/sprites.png";
import spritesheetJSON from '../assets/sprites.json';

import path from 'path';
import App from '../App';

import Spaceship, {FiringPatternType, ShipType} from "../objects/spaceship";

import Fleet from "../objects/fleet";
import GameComponent from "../components/gameComponent";

import 'semantic-ui-css/semantic.min.css';

import GameObject from "../objects/gameObject";
import PhysicsCore from "./physicsCore";
import PhysicsComponent, {Vector} from "../components/physicsComponent";
import AIComponent from "../components/aiComponent";
import InputComponent from "../components/inputComponent";
import RenderComponent from "../components/renderComponent";
import WeaponsComponent from "../components/weaponsComponent";
import Bullet from "../objects/bullet";

// const Storage = window.require('electron-json-storage');


interface GameCoreConfig {
    debug: boolean;
}


interface ShipTemplates {
    [propName: string]: ShipType
}

interface FiringPatternTemplates {
    [propName: string]: FiringPatternType;
}

type Components = "physicsComponents" | "aiComponents" | "inputComponents" | "renderComponents" | "weaponsComponents"

export default class GameCore {
    static MS_PER_UPDATE = 1000 / 60;

    public pixiTextures: { [propName: string]: Texture } | null;
    public pixiApp: Application;
    public readonly objects: {
        fleets: Fleet[];
        spaceships: Spaceship[];
        bullets: Bullet[];
    };
    private previous: number | null;
    private lag: number;
    private components: {
        physicsComponents: PhysicsComponent[];
        aiComponents: AIComponent[];
        inputComponents: InputComponent[],
        renderComponents: RenderComponent[],
        weaponsComponents: WeaponsComponent[]
    };
    private physicsCore: PhysicsCore;
    private config: GameCoreConfig;
    private frames: number;
    private frames_time: number;
    private readonly shipTemplates: null | ShipTemplates;
    private firingPatternTemplates: null | FiringPatternTemplates;

    constructor(options: GameCoreConfig) {
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
        this.physicsCore = new PhysicsCore(this);

        this.pixiApp = new Application({
            width: window.innerWidth,
            height: window.innerHeight
        });
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
        this.firingPatternTemplates = {
            "patternName": {
                "ammoType": "ammoName",
                "fireRate": 5,
                "launcherAmount": 1
            }
        };
        this.shipTemplates = {
            "defensiveBullets": {
                aiType: "DEFENSIVE",
                hitPoints: 50,
                maxVel: 50,
                sprite: "sprite_23",
                patterns: [[5, this.firingPatternTemplates['patternName']]]
            },
            "aggressiveRammer": {
                aiType: "AGGRESSIVE",
                hitPoints: 100,
                maxVel: 100,
                sprite: "sprite_19",
                patterns: [
                    [1, this.firingPatternTemplates['patternName']]
                ]
            }
        };

        this.objects = {
            fleets: [],
            spaceships: [],
            bullets: [],
        }
    }

    start = async () => {
        // Initialize a game, currently done statically
        // TODO change this so it fits with a dynamic, potentially file loaded system.


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

        spriteCallback();
    };


    createStage = (loadedCallback: () => void) => {
        // Creates a PIXI application that allows for the rendering of sprites.
        // Also handles the generation of sprites, and frees the resource to be
        // Used by the spaceship factory.
        const renderer = this.pixiApp.renderer;

        renderer.autoResize = true;
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";

        // Loading the sprites into the PIXI loader, then allowing access to
        // them at a classwide scope.
        this.pixiApp.loader.add(
            "sprites", sprites
        ).load((loader: Loader, resources) => {
            const spritesheet = new Spritesheet((resources["sprites"] as LoaderResource).texture.baseTexture, spritesheetJSON);

            spritesheet.parse((sprites) => {
                this.pixiTextures = {};
                for (let frame in spritesheetJSON.frames) {
                    this.pixiTextures[frame] = {
                        ...sprites[frame],
                        // @ts-ignore
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
                (this.shipTemplates as ShipTemplates)["aggressiveRammer"],
                {x: 100, y: 100},
                {x: 0, y: 0}, // Approx. Bullet speed == 300
                this.objects.fleets[0]
            )
        );

        this.objects.fleets[1].addNewSpaceship(
            new Spaceship(
                this,
                (this.shipTemplates as ShipTemplates)["defensiveBullets"],
                {x: 400, y: 400},
                {x: 0, y: -10},
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
        let elapsed = current - (this.previous ? this.previous : 0);
        this.previous = current;
        this.lag += elapsed;

        // If lag is greater than the 1/60th of a second, update the game.
        // Continue to do this while the lag is higher than that.
        while (this.lag >= GameCore.MS_PER_UPDATE) {
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

    updateGameState = (delta: number) => {
        for (let physics of this.components.physicsComponents) {
            physics.update(delta, this);
        }

        for (let ai of this.components.aiComponents) {
            ai.update(delta, this);
        }

        for (let weapons of this.components.weaponsComponents) {
            weapons.update(delta, this)
        }
    };

    renderGraphics = (delta: number) => {
        for (let render of this.components.renderComponents) {
            render.update(delta, this)
        }

        // TODO rip this out and trigger re-renders via state actions.
        ReactDOM.render(
            <App>
                {this.components.inputComponents.map(el => el.display())}
            </App>,
            document.getElementById("react-entry")
        );
    };

    // TODO Merge addComponent and addGameObject
    addComponent = (component: GameComponent) => {
        // Handles adding a specific component to the game core, in order for it
        // to be updated by it's relevant methods (renderGraphics or updateGameState)
        // TODO handle an array being passed in.
        const componentName = (component.toString().split("::")[0] + "s");
        // @ts-ignore
        this.components[componentName].push(component);
    };

    addGameObject = (object: GameObject) => {
        const objectName = object.toString().split("::")[0] + "s";
        // @ts-ignore
        this.objects[objectName].push(object);
        if (objectName in [
            "spaceships",
        ]) {
            // @ts-ignore
            this.physicsCore.addGameObject(object)
        }
    }
}
