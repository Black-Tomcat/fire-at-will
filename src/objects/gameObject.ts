import GameCore from "../core/gameCore";
import physicsComponent from "../components/physicsComponent";
import PhysicsComponent from "../components/physicsComponent";
import renderComponent from "../components/renderComponent";
import RenderComponent from "../components/renderComponent";
import AIComponent from "../components/aiComponent";
import InputComponent from "../components/inputComponent";
import WeaponsComponent from "../components/weaponsComponent";
import GameComponent from "../components/gameComponent";


export interface ComponentsObject {
    physicsComponent?: typeof PhysicsComponent;
    renderComponent?: typeof RenderComponent;
    aiComponent?: typeof AIComponent;
    inputComponent?: typeof InputComponent;
    weaponsComponent?: typeof WeaponsComponent;
}

export default abstract class GameObject {
    constructor(gameCore: GameCore) {
        gameCore.addGameObject(this);
    }

    // abstract getComponents(defaultComponents: ComponentsObject): GameComponent[];
}