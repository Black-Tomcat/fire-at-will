// import GameComponent from "components/gameComponent";

import { XYObj } from "components";
import GameComponent from "components/GameComponent";
import { Fleet, GameObject, ShipType, Spaceship, Stance } from "objects";
import GameCore from "core/GameCore";

export type AIAction = "RAM" | "CIRCLE" | "RETREAT";

interface ParentType extends GameObject {
    type: ShipType;
    fleet: Fleet;
    targetPos?: XYObj;
    targetShip?: Spaceship;
    hitPoints: number;
}

export default class AIComponent<Parent extends ParentType = ParentType> extends GameComponent<Parent> {
    constructor(parent: Parent) {
        super(parent, "AIComponent");
    }

    update(delta: number, gameCore: GameCore) {
        const stance: Stance = this.updateStance();

        console.log(stance.conditions);
    }

    updateStance = (): Stance => {
        stancesLoop: for (const stance of this.parent.type.aiType) {
            if (stance.conditions === undefined) {
                return stance;
            }

            for (const [condition, value] of Object.entries(stance.conditions)) {
                console.log(condition, value);

                if (
                    !(
                        condition === "hitPoints" &&
                        (value as [number, number])[0] <= this.parent.hitPoints &&
                        (value as [number, number])[0] >= this.parent.hitPoints
                    )
                ) {
                    continue stancesLoop;
                }
            }

            return stance;
        }

        throw new Error("Stance sequencing has failed!");
    };

    cleanUp(gameCore: GameCore): void {}
}
