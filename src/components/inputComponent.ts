import GameCore from "../core/gameCore";
import GameComponent from "./gameComponent";
import GameObject from "../objects/gameObject";

interface ParentType extends GameObject{
}

export default class InputComponent<Parent extends ParentType = ParentType> extends GameComponent{
    // private isShowing: boolean;

    constructor(parent: Parent) {
        super(parent, "InputComponent");
        // this.isShowing = false;
        // this.menuComponent = menuComponent;
    }

    update(delta: number) {
        // TODO basically a ShouldComponentUpdate and a response if appropriate
    }

    display() {
        // return (this.isShowing && this.menuComponent)
    }

    cleanUp(gameCore: GameCore): void {}
}
