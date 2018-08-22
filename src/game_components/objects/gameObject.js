export default class GameObject {
    static defaultComponents = {

    };

    getComponents = (defaultComponents) => {
        let components = [];

        for (let component of Object.keys(defaultComponents)) {
            components.push(this[component])
        }
        console.log(components);
        return components;
    }
}