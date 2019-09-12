import GameCore from "./gameCore";
import {Vector} from "../components/physicsComponent";
import GameObject from "../objects/gameObject";

export default class PhysicsCore {
    private gameCore: GameCore;

    static GRIDSIZE = 100;
    private bulletsGrid: {
        [propName: string]: any
    };
    private objectsGrid: {
        [propName: string]: any
    };

    constructor(gameCore: GameCore) {
        this.gameCore = gameCore;

        this.bulletsGrid = {

        };

        this.objectsGrid = {

        };
    }

    detectCollisions = () => {
        for (let cell in this.objectsGrid) {
            for (let object of this.objectsGrid[cell]) {
                if (this.bulletsGrid[cell] === undefined) break;

                for (let bullet of this.bulletsGrid[cell]) {
                    // TODO resolve collisions
                }
            }
        }
    };

    removeObject = () => {

    };

    moveObject = () => {

    };


    addObject = (object: GameObject & {pos: Vector}) => {
        const gridNum = this.calculateGridNum(object.pos);

        if (object.toString().split("::")[0] === "bullet") {
            if (!this.bulletsGrid[gridNum].push(object) ) {
                this.bulletsGrid[gridNum] = [object]
            }
        } else {
            if (!this.objectsGrid[gridNum].push(object) ) {
                this.objectsGrid[gridNum] = [object]
            }
        }
    };

    calculateGridNum = (pos: Vector) => {
          return (Math.floor(pos.x / 100) * 100) + ", " + (Math.floor(pos.y / 100) * 100)
    };
}