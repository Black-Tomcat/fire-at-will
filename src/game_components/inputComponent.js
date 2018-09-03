import GameComponent from "./gameComponent";

export default class InputComponent extends GameComponent{
    constructor(parent, menuComponent) {
        super(parent);
        this.isShowing = false;
        this.menuComponent = menuComponent;
    }

    update(delta) {
        // TODO basically a ShouldComponentUpdate and a response if appropriate
    }

    display() {
        return (this.isShowing && this.menuComponent)
    }

    toString = () => {
        return "InputComponent::" + this.parent.toString().split("::")[0]
    }
}
