import _ from 'lodash';

import GameComponent, {ComponentsMap, AIComponent, InputComponent, PhysicsComponent, RenderComponent, WeaponsComponent} from "components";
import {Bullet, Fleet, Spaceship} from "objects";
import GameCore from "core/GameCore";


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