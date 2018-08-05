import PhysicsComponent from "../physicsComponent";
import RenderComponent from "../renderComponent";
import InputComponent from "../inputComponent";
import AIComponent from "../aiComponent";

export default class Spaceship {
    constructor(
        type,
        x,
        y,
        vel,

        physicsComponent,
        renderComponent,
        inputComponent = null,
        aiComponent = null
    ) {
        // SPACESHIP DATA
        this.type = type;
        this.pos = {
            x: x,
            y: y
        };
        this.vel = vel;

        // SPACESHIP COMPONENTS
        this.physicsComponent = new physicsComponent(this);
        this.renderComponent = new renderComponent(this);
        this.inputComponent = (inputComponent != null) ?  new inputComponent(this) : null;
        this.aiComponent = (aiComponent != null) ?  new aiComponent(this) : null;
    }

    getComponents = () => {
        let components = [];
        components.push(this.physicsComponent);
        components.push(this.renderComponent);
        if (this.inputComponent != null) {
            components.push(this.inputComponent);
        }
        if (this.aiComponent != null) {
            components.push(this.aiComponent);
        }
        return components;
    }
}

export class SpaceshipFactory {
    constructor(gameCore) {
        this.gameCore = gameCore;
    }

    // TODO refactor signature
    newSpaceship = (
        type,

        inputComponent = null,
        aiComponent = null,
        x = 0,
        y = 0,
        vel = 0,
        physicsComponent = PhysicsComponent,
        renderComponent = RenderComponent,
    ) => {
        let spaceship = new Spaceship(
            type,
            x,
            y,
            vel,

            physicsComponent,
            renderComponent,
            inputComponent,
            aiComponent
        );

        for (let component in spaceship.getComponents()) {
            this.gameCore.addComponent(component);
        }

        return spaceship
    }
}