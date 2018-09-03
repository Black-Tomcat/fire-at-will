// ./src/game_components/gameComponent.js

export default class GameComponent {
    /* The core of a game component is that each should have a reference to the
     * parent object (spaceship, etc.), and that is where they gather all of
     * their data from. They should also implement an update() method in which
     * the GameCore calls, and updates the state relative to that component for
     * the parent object. */
    constructor(parent, requiredFields) {
        this.parent = parent;
        this.checkFields(requiredFields);
    }

    checkFields (requiredFields) {
        for (let field of requiredFields) {
            if (!this.parent.hasOwnProperty(field)) {
                throw new Error(
                    "a '" + this.parent.toString().split("::")[0] + "' has no required field: '" + field + "'"
                )
            }
        }
    }

    update(delta) {
        throw new Error("Must implement update() for any game component.")
    }
}