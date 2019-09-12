import GameComponent from "./gameComponent";
import GameObject from "../objects/gameObject";

interface ParentType {
}

export default class InputComponent<Parent extends ParentType & GameObject = ParentType> extends GameComponent{
    // private isShowing: boolean;

    constructor(parent: Parent) {
        super(parent);
        // this.isShowing = false;
        // this.menuComponent = menuComponent;
    }

    update(delta: number) {
        // TODO basically a ShouldComponentUpdate and a response if appropriate
    }

    display() {
        // return (this.isShowing && this.menuComponent)
    }

    toString = () => {
        return "inputComponent::" + this.parent.toString().split("::")[0]
    }
}
