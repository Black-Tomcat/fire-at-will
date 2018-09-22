import GameComponent from "../components/gameComponent";
import PhysicsComponent from "../components/physicsComponent";
import RenderComponent from "../components/renderComponent";
import GameObject from "./gameObject";

export default class Bullet extends GameObject{
    static defaultComponents = {
        physicsComponent: PhysicsComponent,
        renderComponent: RenderComponent
    };

    constructor(
        gameCore,
        initialPos,
        // TODO turn to rotation and |vel| to make it easier to program bullets.
        vel,

        components
    ) {
        components = {...Bullet.defaultComponents, ...components};
        super(gameCore);

        this.pos = initialPos;
        this.vel = vel;
        this.rotation = 45; // TODO change this so it fits.

        this.physicsComponent = new components.physicsComponent(this);
        this.renderComponent = new components.renderComponent(this, gameCore.pixiTextures["bullet"]);

        for (let component of this.getComponents(Bullet.defaultComponents)) {
            gameCore.addComponent(component);
        }
    }

    toString() {
        return "bullet"
    }
}

