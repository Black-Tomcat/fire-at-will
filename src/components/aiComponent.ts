import GameComponent from "./gameComponent";
import GameObject from "../objects/gameObject";
import Spaceship, {ShipType} from "../objects/spaceship";
import GameCore from "../core/gameCore";
import Fleet from "../objects/fleet";
import {Vector} from "./physicsComponent";


export type Stances = "AGGRESSIVE" | "DEFENSIVE" | "RETREATING";

interface ParentType {
    type: ShipType;
    fleet: Fleet;
    targetPos?: Vector
    targetShip?: Spaceship
}

export default class AIComponent<Parent extends ParentType & GameObject = ParentType> extends GameComponent<Parent> {
    private readonly stance: "AGGRESSIVE" | "DEFENSIVE" | "RETREATING";
    private readonly aiMap: {
        AGGRESSIVE: (gameCore: GameCore) => void
        DEFENSIVE: (gameCore: GameCore) => void;
        RETREATING: (gameCore: GameCore) => void;
    };
    constructor(parent: Parent) {
        super(parent);

        this.stance = parent.type.aiType;

        this.aiMap = {
            AGGRESSIVE: this.aggressiveUpdate,
            DEFENSIVE: this.defensiveUpdate,
            RETREATING: this.retreatingUpdate
        };
    }

    aggressiveUpdate = (gameCore: GameCore) => {
        // Ramming only method c:
        const {objects} = gameCore;
        const {fleets} = objects;

        let newFleets = [...fleets];
        newFleets.splice(newFleets.indexOf(this.parent.fleet), 1);

        // TODO check for the 'best' ship to target.
        // Select an enemy ship to target.
        let enemyShip;
        if (newFleets[0] && newFleets[0].spaceships[0]) {
            enemyShip = newFleets[0].spaceships[0];
        }

        if (enemyShip) {
            this.parent.targetPos = enemyShip.pos;
        }
    };

    defensiveUpdate = (gameCore: GameCore) => {
        const {objects} = gameCore;
        const {fleets} = objects;

        let newFleets = [...fleets];
        newFleets.splice(newFleets.indexOf(this.parent.fleet), 1);

        let enemyShip;
        if (newFleets[0] && newFleets[0].spaceships[0]) {
             enemyShip = newFleets[0].spaceships[0];
        }

        if (enemyShip) {
            this.parent.targetShip = enemyShip;
        } else {
            this.parent.targetShip = undefined;
        }
    };

    retreatingUpdate = (gameCore: GameCore) => {

    };

    update(delta: number, gameCore: GameCore) {
        // figure out stance. (Aggressive, Defensive, Passive?, Retreating)
        // Now, dependant on stance, update state of AI.
        this.updateStance();

        // Run that states update method
        this.aiMap[this.stance](gameCore);
    }

    updateStance = () => {

    };

    toString = () => {
        return "aiComponent::" + this.parent.toString().split("::")[0]
    }
}