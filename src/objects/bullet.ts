import PhysicsComponent, {Vector} from "../components/physicsComponent";
import RenderComponent from "../components/renderComponent";
import GameObject, {ComponentsObject} from "./gameObject";
import GameCore from "../core/gameCore";

export default class Bullet extends GameObject {
    public pos: {x: number; y: number};
    public vel: {x: number; y: number};
    public rotation: number;

    private readonly physicsComponent: PhysicsComponent<Bullet>;
    private readonly renderComponent: RenderComponent<Bullet>;

    constructor(
        gameCore: GameCore,
        initialPos: Vector,
        // TODO turn to rotation and |vel| to make it easier to program bullets.
        vel: Vector,

    ) {
        super(gameCore);

        this.pos = initialPos;
        this.vel = vel;
        this.rotation = 45; // TODO change this so it fits.

        this.physicsComponent = new PhysicsComponent<Bullet>(this);
        // @ts-ignore
        this.renderComponent = new RenderComponent(this, gameCore.pixiTextures["bullet"]);

        for (let component of [this.physicsComponent, this.renderComponent]) {
            gameCore.addComponent(component);
        }
    }

    toString() {
        return "bullet"
    }
}

