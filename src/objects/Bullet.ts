import GameComponent, { PhysicsComponent, RenderComponent, XYObj } from "components";
import GameObject, { GameObjectComponents, ObjectName, Spaceship } from "objects";
import GameCore from "core/GameCore";
import { BoundedTexture } from "../core/RenderCore";

export default class Bullet extends GameObject {
    public pos: { x: number; y: number };
    public vel: { x: number; y: number };
    public rotation: number;
    public hitPoints: number;

    public readonly spawner: Spaceship;

    private readonly physicsComponent: PhysicsComponent<Bullet>;
    private readonly renderComponent: RenderComponent<Bullet>;

    constructor(
        gameCore: GameCore,
        initialPos: XYObj,
        // TODO turn to rotation and |vel| to make it easier to program Bullet.
        vel: XYObj,
        spawner: Spaceship
    ) {
        super(gameCore, "Bullet");

        this.pos = initialPos;
        this.vel = vel;
        this.rotation = 45; // TODO change this so it fits.

        this.hitPoints = 1;

        this.spawner = spawner;

        let texture = gameCore.renderCore.textures["bullet"] as BoundedTexture;
        this.physicsComponent = new PhysicsComponent<Bullet>(this, texture.boundingPoints, texture.sourceSize);

        this.renderComponent = new RenderComponent(
            this,
            (gameCore.renderCore.textures["bullet"] as BoundedTexture).texture
        );
    }

    get components(): GameComponent[] {
        return [this.physicsComponent, this.renderComponent];
    }

    cleanUp(gameCore: GameCore): void {}
}
