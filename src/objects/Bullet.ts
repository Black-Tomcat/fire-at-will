import GameComponent, {PhysicsComponent, RenderComponent, XYObj} from 'components';
import GameObject, {GameObjectComponents, ObjectName, Spaceship} from "objects";
import GameCore from "core/GameCore";

export default class Bullet extends GameObject {
    public pos: {x: number; y: number};
    public vel: {x: number; y: number};
    public rotation: number;

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

        this.spawner = spawner;

        this.physicsComponent = new PhysicsComponent<Bullet>(
            this,
            (gameCore.pixiTextures as {[propName: string]: {boundingPoints: [number, number][]}})["bullet"].boundingPoints,
            // @ts-ignore
            (gameCore.pixiTextures as {[propName: string]: {boundingPoints: [number, number][]}})["bullet"].sourceSize
        );

        // @ts-ignore
        this.renderComponent = new RenderComponent(this, gameCore.pixiTextures["bullet"]);
    }


    get components(): GameComponent[] {
        return [this.physicsComponent, this.renderComponent];
    }

    cleanUp(gameCore: GameCore): void {}
}

