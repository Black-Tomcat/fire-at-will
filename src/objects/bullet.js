import GameComponent from "../game_components/gameComponent";
import PhysicsComponent from "../game_components/physicsComponent";
import RenderComponent from "../game_components/renderComponent";
import GameObject from "./gameObject";

export default class Bullet extends GameObject{
    static defaultComponents = {
        physicsComponent: PhysicsComponent,
        renderComponent: RenderComponent
    };

    constructor(
        gameCore,
        initialPos,
        vel,


        components
    ) {
        super();
        components = {...Bullet.defaultComponents, ...components};

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
        return "Bullet"
    }
}

