// ./src/game_components/objects/spaceship.js
// This contains the framework for the spaceship object and the relevant factory

import PhysicsComponent from "../physicsComponent";
import RenderComponent from "../renderComponent";
import InputComponent from "../inputComponent";
import aiComponent from "../aiComponent";
import GameObject from "./gameObject";


export default class Spaceship extends GameObject {
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
    static defaultComponents = {
        physicsComponent: PhysicsComponent,
        renderComponent: RenderComponent,
        inputComponent: InputComponent,
        aiComponent: aiComponent,
    };

    // Components are initialized by passing a collection of classes to the
    // components parameter, and then defaults are added to that.
    constructor(
        gameCore,
        type,
        pos,
        vel,
        fleet,
        components = {}
    ) {
        super();
        const texture = gameCore.pixiTextures[type.sprite];

        // SPACESHIP DATA
        this.type = type;
        this.pos = pos;
        this.vel = vel;

        // FLEET INFORMATION
        this.fleet = fleet;

        // SPACESHIP COMPONENTS
        // merges the default components with their overriding components.
        components = {...Spaceship.defaultComponents, ...components};

        this.physicsComponent = new components.physicsComponent(this);
        this.renderComponent = new components.renderComponent(this, texture);
        this.inputComponent = new components.inputComponent(this);
        this.aiComponent = new components.aiComponent(this);

        for (let component of this.getComponents(Spaceship.defaultComponents)) {
            gameCore.addComponent(component);
        }
    }
}
