// ./src/game_components/objects/spaceship.js
// This contains the framework for the spaceship object and the relevant factory

import PhysicsComponent from "../physicsComponent";
import RenderComponent from "../renderComponent";


export default class Spaceship {
    /* The spaceship object.
    This class is unique in the sense that it is only a container of data.
    There should be little to no functionality attached to this, as it should
    all be delegated through it's child components.

    For example, physicsComponent should handle the updating of it's location
    and checking for collisions, dealing damage, etc., while the AI handles all
    the changes to velocity/firing patterns, and so on.

    These components are then passed to the GameCore via the factory, where they
    are updated in a streamlined manner which allows for faster performance.
    The components have access to the parent's data due to the unique way they
    are initialized. */

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
        // Components are initialized by passing a class into the xComponent
        // parameter, which is then constructed to an instance saved in the class.

        // SPACESHIP DATA
        this.type = type;
        this.pos = pos;
        this.vel = vel;

        // SPACESHIP COMPONENTS
        this.physicsComponent = new physicsComponent(this);
        this.renderComponent = new renderComponent(this, spriteTexture);
        this.inputComponent = (inputComponent != null) ?  new inputComponent(this) : null;
        this.aiComponent = (aiComponent != null) ?  new aiComponent(this) : null;
    }

    getComponents = () => {
        // returns components to the spaceshipFactory
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
    // The factory handles the creation of the class, ensuring it recieves the
    // right components, and ensuring the gameCore also receives the components.
    constructor(gameCore) {
        this.gameCore = gameCore;
    }

    // TODO refactor signature
    // TODO make it so all spaceships recieve an AI component and a stats component.
    // TODO refractor so it just accepts a collection of components, rather than
    // each one individually.
    newSpaceship = (
        type,

        inputComponent = null,
        aiComponent = null,
        pos = {x: 0, y: 0},
        vel = {x: 0, y: 0},
        physicsComponent = PhysicsComponent,
        renderComponent = RenderComponent,
    ) => {
        const texture = this.gameCore.pixiTextures[type.sprite];

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