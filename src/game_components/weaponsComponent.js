import GameComponent from "./gameComponent";

export default class WeaponsComponent extends GameComponent{
    constructor(parent) {
        super(parent);
    }

    update(delta) {
    }

    toString = () => {
        return "WeaponsComponent::ParentClassMaybe?"
    }
}