// ./src/components/gameComponent.js
import GameObject from "../objects/gameObject";
import gameCore from "../core/gameCore";


export default abstract class GameComponent<Parent extends GameObject = GameObject> {
    /* The core of a game component is that each should have a reference to the
     * parent object (spaceship, etc.), and that is where they gather all of
     * their data from. They should also implement an update() method in which
     * the GameCore calls, and updates the state relative to that component for
     * the parent object. */
    protected parent: Parent ;

    constructor(parent: Parent) {
        this.parent = parent;
    }

    abstract update(delta: number, gameCore?: gameCore): void

    // abstract getComponentsName(): ComponentsName
}