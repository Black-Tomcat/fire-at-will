import _ from 'lodash';
import AIComponent from "../components/aiComponent";
import GameComponent, {ComponentsMap} from "../components/gameComponent";
import InputComponent from "../components/inputComponent";
import PhysicsComponent from "../components/physicsComponent";
import RenderComponent from "../components/renderComponent";
import WeaponsComponent from "../components/weaponsComponent";
import GameCore from "../core/gameCore";
import Bullet from "./bullet";
import Fleet from "./fleet";
import Spaceship from "./spaceship";


export interface GameObjectComponents {
    physicsComponent?: typeof PhysicsComponent;
    renderComponent?: typeof RenderComponent;
    aiComponent?: typeof AIComponent;
    inputComponent?: typeof InputComponent;
    weaponsComponent?: typeof WeaponsComponent;
}

export type ObjectName = "Spaceship" | "Bullet" | "Fleet"
export type GameObjects = {
    Spaceship: Spaceship[]
    Bullet: Bullet[]
    Fleet: Fleet[]
}

export const getComponentsMap = (items: GameComponent | GameComponent[]): Partial<ComponentsMap> => {
    if (!Array.isArray(items)) {
        items = [items];
    }

    return _.groupBy((items as GameComponent[]), (item: GameComponent) => item.name)
};


export default abstract class GameObject {
    public readonly name: ObjectName;

    protected constructor(gameCore: GameCore, name: ObjectName) {
        this.name = name;
    }

    abstract get components(): GameComponent[];

    abstract cleanUp(gameCore: GameCore): void
}