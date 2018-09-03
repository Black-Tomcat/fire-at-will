import GameComponent from "../gameComponent";
import PhysicsComponent from "../physicsComponent";
import RenderComponent from "../renderComponent";
import GameObject from "./gameObject";

export default class Bullet extends GameObject{
    static defaultComponents = {
        physicsComponent: PhysicsComponent,
        renderComponent: RenderComponent
    };

    constructor(
        gameCore,
        initialPos={x: 0, y: 0},
        vel,


        components
    ) {
        super();
        components = {...Bullet.defaultComponents, ...components};

        this.pos = initialPos;
        this.vel = vel;

        this.physicsComponent = new components.physicsComponent(this);
        this.renderComponent = new components.renderComponent(this, gameCore.pixiTextures["sprite_01"])

        for (let component of this.getComponents(Bullet.defaultComponents)) {
            gameCore.addComponent(component);
        }
    }

    toString() {
        return "Bullet"
    }
}

