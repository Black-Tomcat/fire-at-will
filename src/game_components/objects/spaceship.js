import PhysicsComponent from "../physicsComponent";
import RenderComponent from "../renderComponent";
import InputComponent from "../inputComponent";
import AIComponent from "../aiComponent";

export default class Spaceship {
    constructor(
        type,
        pos,
        vel,
        spriteTexture,

        physicsComponent,
        renderComponent,
        inputComponent = null,
        aiComponent = null
    ) {
        // SPACESHIP DATA
        this.type = type;
        this.pos = pos;
        this.vel = {
            x: 20,
            y: 0
        };

        // SPACESHIP COMPONENTS
        this.physicsComponent = new physicsComponent(this);
        this.renderComponent = new renderComponent(this, spriteTexture);
        this.inputComponent = (inputComponent != null) ?  new inputComponent(this) : null;
        this.aiComponent = (aiComponent != null) ?  new aiComponent(this) : null;
    }

    getComponents = () => {
        let components = [];
        for (let component of [
            this.physicsComponent,
            this.renderComponent,
            this.inputComponent,
            this.aiComponent
        ]) {
            if (component != null) {
                components.push(component);
            }
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
        pos = {x: 0, y: 0},
        vel = {x: 0, y: 0},
        physicsComponent = PhysicsComponent,
        renderComponent = RenderComponent,
    ) => {
        const texture = this.gameCore.pixiResources[type.sprite].texture;
        let spaceship = new Spaceship(
            type,
            pos,
            vel,
            texture,

            physicsComponent,
            renderComponent,
            inputComponent,
            aiComponent
        );

        for (let component of spaceship.getComponents()) {
            this.gameCore.addComponent(component);
        }

        return spaceship
    }
}