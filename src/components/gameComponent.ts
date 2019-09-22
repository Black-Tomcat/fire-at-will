// ./src/components/gameComponent.js
import GameCore from "../core/gameCore";
import gameCore from "../core/gameCore";
import GameObject from "../objects/gameObject";
import AIComponent from "./aiComponent";
import InputComponent from "./inputComponent";
import PhysicsComponent from "./physicsComponent";
import RenderComponent from "./renderComponent";
import WeaponsComponent from "./weaponsComponent";


export type GameComponentName = "PhysicsComponent" | "AIComponent" | "InputComponent" | "RenderComponent" | "WeaponsComponent"

export interface ComponentsMap {
    PhysicsComponent: PhysicsComponent[];
    AIComponent: AIComponent[];
    InputComponent: InputComponent[],
    RenderComponent: RenderComponent[],
    WeaponsComponent: WeaponsComponent[]
}

export default abstract class GameComponent<Parent extends GameObject = GameObject> {
    /* The core of a game component is that each should have a reference to the
     * parent object (spaceship, etc.), and that is where they gather all of
     * their data from. They should also implement an update() method in which
     * the GameCore calls, and updates the state relative to that component for
     * the parent object. */
    public readonly parent: Parent ;
    public readonly name: (GameComponentName);

    protected constructor(parent: Parent, name: GameComponentName) {
        this.parent = parent;
        this.name = name
    };

    abstract update(delta: number, gameCore?: gameCore): void;

    abstract cleanUp(gameCore: GameCore): void;
}
