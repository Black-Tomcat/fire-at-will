// ./src/components/objects/spaceship.js
// This contains the framework for the spaceship object and the relevant factory

import PhysicsComponent from "../components/physicsComponent";
import RenderComponent from "../components/renderComponent";
import InputComponent from "../components/inputComponent";
import AIComponent from "../components/aiComponent";
import GameObject from "./gameObject";
import WeaponsComponent from "../components/weaponsComponent";


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
        aiComponent: AIComponent,
        weaponsComponent: WeaponsComponent
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
        super(gameCore);
        const texture = gameCore.pixiTextures[type.sprite];

        // SPACESHIP DATA
        this.type = type; // This contains all the data for the ship's class/weapons/etc.

        this.type.firingPatterns = {};
        this.type.patternAmounts = new Object(this.type.patterns);
        delete this.type.patterns;
        for (let firingPattern in this.type.patternAmounts) {
            this.type.firingPatterns[firingPattern] = gameCore.firingPatternTemplates[firingPattern];
        }

        this.fleet = fleet; // The fleet the ship is associated with.

        // POSITION INFORMATION
        this.pos = pos; // This is where the ship is currently
        this.targetPos = null; // This is where the ship wants to head
        this.vel = vel; // Ships velocity
        this.rotation = 270; // All ships start facing down. (0 to 360], Clockwise from 9'oclock

        // WEAPONS INFORMATION
        this.targetShip = null; // The ship Object that is currently targeted.
        this.activePatterns = {}; // The name of the pattern, and how many are active. The actual pattern info is stored in the type object.
        for (let firingPattern in this.type.firingPatterns) {
            this.activePatterns[firingPattern] = [];
        }
        this.ammo = {}; // TODO implement an ammo system. Potentially throw all of this into shipTemplates.

        // SPACESHIP COMPONENTS
        // merges the default components with their overriding components.
        components = {...Spaceship.defaultComponents, ...components};

        this.physicsComponent = new components.physicsComponent(this);
        this.renderComponent = new components.renderComponent(this, texture);
        this.inputComponent = new components.inputComponent(this);
        this.aiComponent = new components.aiComponent(this);
        this.weaponsComponent = new components.weaponsComponent(this);

        for (let component of this.getComponents(Spaceship.defaultComponents)) {
            gameCore.addComponent(component);
        }
    }

    toString() {
        return "spaceship"
    }
}
