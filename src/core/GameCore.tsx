// ./src/gameCore.js
// This is the core of the game. This consists of the gameloop, which handles
// all updates to the game system as well as the rendering.
import React from "react";
import ReactDOM from "react-dom";
import App from "../App";

import "../css/app.css";
import "semantic-ui-css/semantic.min.css";

import _ from "lodash";

import { Loader, LoaderResource, Spritesheet, Texture } from "pixi.js";
import spritesheetJSON from "../assets/sprites.json";
import sprites from "../assets/sprites.png";
import explosion from "../assets/explosion.png";
import explosionJSON from "../assets/explosion.json";

import { ComponentsMap, GameComponent, GameComponentName } from "components";
import GameObject, { Bullet, FiringPatternType, Fleet, getComponentsMap, ShipType, Spaceship } from "objects";
import RenderCore, { Asset, BoundedTexture } from "core/RenderCore";

interface GameCoreConfig {
    debug: boolean;
}

interface ShipTemplates {
    [propName: string]: ShipType;
}

interface FiringPatternTemplates {
    [propName: string]: FiringPatternType;
}

export default class GameCore {
    static MS_PER_UPDATE = 1000 / 60;

    public readonly objects: {
        Fleet: Fleet[];
        Spaceship: Spaceship[];
        Bullet: Bullet[];
    };
    public readonly components: ComponentsMap;
    public readonly renderCore: RenderCore;
    private previous: number | null;
    private lag: number;
    private config: GameCoreConfig;
    private frames: number;
    private frames_time: number;

    private readonly shipTemplates: null | ShipTemplates;
    private readonly firingPatternTemplates: null | FiringPatternTemplates;
    private toDeleteComponents: GameComponent[];

    constructor(options: GameCoreConfig) {
        // GAME LOOP FIELD
        this.previous = null;
        this.lag = 0.0;

        this.toDeleteComponents = [];

        this.components = {
            PhysicsComponent: [],
            AIComponent: [],
            InputComponent: [],
            RenderComponent: [],
            WeaponsComponent: []
        };

        this.renderCore = new RenderCore();

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
            patternName: {
                ammoType: "ammoName",
                fireRate: 5,
                launcherAmount: 1
            }
        };
        this.shipTemplates = {
            defensiveBullets: {
                aiType: [
                    {
                        conditions: {
                            hitPoints: [0, 0.5]
                        },
                        action: "RETREAT"
                    },
                    {
                        action: "CIRCLE"
                    }
                ],
                hitPoints: 50,
                maxVel: 50,
                sprite: "sprite_23",
                patterns: [[5, this.firingPatternTemplates["patternName"]]]
            },
            aggressiveRammer: {
                aiType: [
                    {
                        action: "RAM"
                    }
                ],
                hitPoints: 100,
                maxVel: 100,
                sprite: "sprite_19",
                patterns: [[1, this.firingPatternTemplates["patternName"]]]
            }
        };

        this.objects = {
            Fleet: [],
            Spaceship: [],
            Bullet: []
        };
    }

    public async start() {
        // Initialize a game, currently done statically
        // TODO change this so it fits with a dynamic, potentially file loaded system.

        // Load the game. This is async as of now, since maybe in the future we would want to load from many unique sources at once.
        // Ie. a file save system, loading textures, sounds, etc.
        await this.createStage();
        await this.setupDummyGame();

        this.previous = new Date().getTime();
        this.gameLoop();
    }

    public addGameObject(object: GameObject) {
        // @ts-ignore Since object can't be specified further
        this.objects[object.name].push(object);
        for (const [type, items] of Object.entries(getComponentsMap(object.components))) {
            // @ts-ignore since sub child type can't be specified.
            this.components[type as GameComponentName].push(...items);
        }
    }

    public deleteComponent = (component: GameComponent) => {
        component.cleanUp(this);
        this.toDeleteComponents.push(component);
    };

    private async createStage() {
        const spaceshipSprites: Asset = {
            name: "spaceshipSprites",
            resourceName: sprites,
            load: (resources: Partial<Record<string, LoaderResource>>, loader: Loader) => {
                const textures: Record<string, BoundedTexture> = {};

                const spritesheet = new Spritesheet(
                    (resources["spaceshipSprites"] as LoaderResource).texture.baseTexture,
                    spritesheetJSON
                );

                spritesheet.parse((spritesheetTextures: { [propName: string]: Texture }) => {
                    for (const textureName in spritesheetTextures) {
                        console.log(textureName, spritesheet.data[textureName]);
                        textures[textureName] = new BoundedTexture(
                            spritesheetTextures[textureName],
                            spritesheet.data.frames[textureName].boundingPoints,
                            spritesheet.data.frames[textureName].sourceSize
                        );
                    }
                });

                return { textures };
            }
        };

        const explosionAnimation: Asset = {
            name: "explosionSprites",
            resourceName: explosion,
            load: (resources: Partial<Record<string, LoaderResource>>, loader: Loader) => {
                const explosionSheet = new Spritesheet(
                    (resources["explosionSprites"] as LoaderResource).texture.baseTexture,
                    explosionJSON
                );
                explosionSheet.parse(() => {});

                return {
                    textures: explosionSheet.textures,
                    animations: explosionSheet.animations
                };
            }
        };

        await this.renderCore.initialize([spaceshipSprites, explosionAnimation]);
    }

    private setupDummyGame() {
        // Create Fleet
        this.addGameObject(new Fleet(this, true));
        this.addGameObject(new Fleet(this));

        // Add new Spaceship to each fleet.
        let enemy = new Spaceship(
            this,
            (this.shipTemplates as ShipTemplates)["aggressiveRammer"],
            { x: 200, y: 200 },
            { x: 0, y: 0 }, // Approx. Bullet speed == 300
            this.objects.Fleet[0]
        );
        this.addGameObject(enemy);
        this.objects.Fleet[0].addNewSpaceship(enemy);

        let friendlySpaceship = new Spaceship(
            this,
            (this.shipTemplates as ShipTemplates)["defensiveBullets"],
            { x: 400, y: 400 },
            { x: 0, y: -10 },
            this.objects.Fleet[1]
        );
        this.addGameObject(friendlySpaceship);
        this.objects.Fleet[1].addNewSpaceship(friendlySpaceship);
    }

    private gameLoop = () => {
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
            this.renderGraphics(this.lag);
        }

        // Render the graphics with an idea of how much time has passed.
        // Passing in the lag helps better simulate the motion of projectiles and
        // other fast moving sprites on the game field.
        this.renderGraphics(this.lag);
        ReactDOM.render(
            <App>{this.components.InputComponent.map(item => item.getRenderComponent())}</App>,
            document.getElementById("react-entry")
        );

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
        requestAnimationFrame(this.gameLoop); // TODO find appropriate numbers.
    };

    private updateGameState(delta: number) {
        for (let physics of this.components.PhysicsComponent) {
            physics.update(delta, this);
        }

        const toDelete: GameObject[] = [];

        for (let physics of this.components.PhysicsComponent) {
            const res = physics.handleCollisions(delta, this);
            if (res.toDelete) {
                toDelete.push(physics.parent);
            }
        }

        for (const object of toDelete) {
            object.cleanUp(this, this.deleteComponent);
        }

        const toDeleteComponentsMap = getComponentsMap(this.toDeleteComponents);

        for (const key in toDeleteComponentsMap) {
            const removed = _.remove(this.components[key as GameComponentName] as GameComponent[], item =>
                (toDeleteComponentsMap[key as GameComponentName] as GameComponent[]).includes(item)
            );
        }

        this.toDeleteComponents = [];

        for (let ai of this.components.AIComponent) {
            ai.update(delta, this);
        }

        for (let weapons of this.components.WeaponsComponent) {
            weapons.update(delta, this);
        }
    }

    private renderGraphics(delta: number) {
        for (let render of this.components.RenderComponent) {
            render.update(delta, this);
        }
    }
}
