// ./src/gameCore.js
// This is the core of the game. This consists of the gameloop, which handles
// all updates to the game system as well as the rendering.
import React from "react";
import ReactDOM from "react-dom";
import App from "../App";

import "../css/app.css";
import "semantic-ui-css/semantic.min.css";

import { Application, Loader, LoaderResource, Spritesheet, Texture, AnimatedSprite } from "pixi.js";
import spritesheetJSON from "../assets/sprites.json";
import sprites from "../assets/sprites.png";
import explosion from "../assets/explosion.png";
import explosionJSON from "../assets/explosion.json";

import GameComponent, { ComponentsMap, GameComponentName, PhysicsComponent } from "components";
import GameObject, { getComponentsMap, Bullet, Fleet, Spaceship, FiringPatternType, ShipType } from "objects";
import PhysicsCore from "core/PhysicsCore";

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

    public pixiTextures: { [propName: string]: Texture & { boundingPoints: [number, number][] } } | null;
    public pixiApp: Application;
    public explo?: (x: number, y: number) => void;

    public readonly objects: {
        Fleet: Fleet[];
        Spaceship: Spaceship[];
        Bullet: Bullet[];
    };
    private previous: number | null;
    private lag: number;
    private readonly components: ComponentsMap;
    private physicsCore: PhysicsCore;
    private config: GameCoreConfig;
    private frames: number;
    private frames_time: number;
    private readonly shipTemplates: null | ShipTemplates;
    private readonly firingPatternTemplates: null | FiringPatternTemplates;

    constructor(options: GameCoreConfig) {
        // GAME LOOP FIELD
        this.previous = null;
        this.lag = 0.0;

        this.components = {
            PhysicsComponent: [],
            AIComponent: [],
            InputComponent: [],
            RenderComponent: [],
            WeaponsComponent: []
        };
        this.physicsCore = new PhysicsCore();

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
            patternName: {
                ammoType: "ammoName",
                fireRate: 5,
                launcherAmount: 1
            }
        };
        this.shipTemplates = {
            defensiveBullets: {
                aiType: "DEFENSIVE",
                hitPoints: 50,
                maxVel: 50,
                sprite: "sprite_23",
                patterns: [[5, this.firingPatternTemplates["patternName"]]]
            },
            aggressiveRammer: {
                aiType: "AGGRESSIVE",
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

    start = async () => {
        // Initialize a game, currently done statically
        // TODO change this so it fits with a dynamic, potentially file loaded system.

        const gameCallback = () => {
            this.setupDummyGame();
            this.previous = new Date().getTime();
            this.gameLoop();
        };

        const spriteCallback = () => {
            this.createStage(gameCallback);
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

        window.addEventListener("resize", () => {
            this.pixiApp.renderer.resize(window.innerWidth, window.innerHeight);
        });

        // Loading the sprites into the PIXI loader, then allowing access to
        // them at a class wide scope.
        this.pixiApp.loader
            .add("sprites", sprites)
            .add("explosion", explosion)
            .load((loader: Loader, resources) => {
                const spritesheet = new Spritesheet(
                    (resources["sprites"] as LoaderResource).texture.baseTexture,
                    spritesheetJSON
                );

                spritesheet.parse(sprites => {
                    this.pixiTextures = {};
                    for (let frame in spritesheetJSON.frames) {
                        this.pixiTextures[frame] = {
                            ...sprites[frame],
                            ...((spritesheetJSON.frames as unknown) as any)[frame]
                        };
                    }
                });

                const explosionSheet = new Spritesheet(
                    // @ts-ignore
                    resources.explosion.texture.baseTexture,
                    explosionJSON
                );
                explosionSheet.parse(() => {});

                this.explo = (x: number, y: number) => {
                    const animatedExplosion = new AnimatedSprite(explosionSheet.animations.explosion);
                    animatedExplosion.position.x = x - 100;
                    animatedExplosion.position.y = y - 100;
                    animatedExplosion.animationSpeed = 0.2;
                    // animatedExplosion.visible = false;
                    animatedExplosion.loop = false;
                    animatedExplosion.onComplete = () => {
                        this.pixiApp.stage.removeChild(animatedExplosion);
                    };
                    this.pixiApp.stage.addChild(animatedExplosion);
                    animatedExplosion.play();
                };

                loadedCallback();
            });

        // Attaching the stage to the main app so rendering can be performed.
        document.body.appendChild(this.pixiApp.view);
    };

    setupDummyGame = () => {
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
            this.renderGraphics(this.lag);

            const toDelete: GameObject[] = this.physicsCore.detectCollisions(
                this.components.PhysicsComponent.filter((item: PhysicsComponent) => !(item.parent instanceof Bullet)),
                this.components.PhysicsComponent.filter((item: PhysicsComponent) => item.parent instanceof Bullet)
            );

            for (const [type, items] of Object.entries(
                getComponentsMap(toDelete.map(item => item.components).flat())
            )) {
                // @ts-ignore
                const removedComponents: GameComponent[] = _.remove(this.components[type], item =>
                    (items as GameComponent[]).includes(item)
                );
                for (const removedComponent of removedComponents) {
                    removedComponent.cleanUp(this);
                }
            }

            for (const gameObject of toDelete) {
                gameObject.cleanUp(this);
            }
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

    updateGameState = (delta: number) => {
        for (let physics of this.components.PhysicsComponent) {
            physics.update(delta, this);
        }

        for (let ai of this.components.AIComponent) {
            ai.update(delta, this);
        }

        for (let weapons of this.components.WeaponsComponent) {
            weapons.update(delta, this);
        }
    };

    renderGraphics = (delta: number) => {
        for (let render of this.components.RenderComponent) {
            render.update(delta, this);
        }
    };

    addGameObject = (object: GameObject) => {
        // @ts-ignore Since object can't be specified further
        this.objects[object.name].push(object);
        for (const [type, items] of Object.entries(getComponentsMap(object.components))) {
            // @ts-ignore since sub child type can't be specified.
            this.components[type as GameComponentName].push(...items);
        }
    };
}
