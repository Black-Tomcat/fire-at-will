export default class GameObject {
    static defaultComponents = {

    };

    constructor(gameCore) {
        gameCore.addGameObject(this);
    }

    getComponents = (defaultComponents) => {
        let components = [];

        for (let component of Object.keys(defaultComponents)) {
            components.push(this[component])
        }
        return components;
    }
}