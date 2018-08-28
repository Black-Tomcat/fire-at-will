import GameComponent from "./gameComponent";

export default class WeaponsComponent extends GameComponent{
    constructor(parent) {
        super(parent);
    }

    update(delta) {
        if (this.parent.targetShip == null) {
            // TODO stop firing all guns.
            return;
        }
        // TODO fire guns.
    }

    toString = () => {
        return "WeaponsComponent::ParentClassMaybe?"
    }
}