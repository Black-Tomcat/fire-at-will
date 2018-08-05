export default class GameComponent {
    constructor(parent) {
        this.parent = parent;
    }

    update(delta) {
        throw new Error("Must implement update() for any game component.")
    }
}