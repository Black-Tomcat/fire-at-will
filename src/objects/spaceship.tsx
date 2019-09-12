// ./src/components/objects/spaceship.js
// This contains the framework for the spaceship object and the relevant factory

import PhysicsComponent, {Vector} from "../components/physicsComponent";
import RenderComponent from "../components/renderComponent";
import InputComponent from "../components/inputComponent";
import AIComponent, {Stances} from "../components/aiComponent";
import GameObject, {ComponentsObject} from "./gameObject";
import WeaponsComponent from "../components/weaponsComponent";
import GameCore from "../core/gameCore";
import Fleet from "./fleet";


export interface ShipType {
    readonly aiType: Stances;
    readonly hitPoints: number;
    readonly maxVel: number;
    readonly sprite: string;
    readonly patterns: ReadonlyArray<[number, FiringPatternType]>;
}

export interface FiringPatternType {
    readonly ammoType: string;
    readonly fireRate: number;
    readonly launcherAmount: number;
}

export class FiringPattern {
    public readonly firingPatternType: FiringPatternType;
    public active?: Spaceship;
    public timeSinceLastFired: number;

    constructor(firingPatternType: FiringPatternType) {
        this.firingPatternType = firingPatternType;
        this.active = undefined;
        this.timeSinceLastFired = 0;
    }
}


export default class Spaceship extends GameObject {
    public pos: Vector;
    public vel: Vector;
    public targetPos?: Vector;
    public rotation: number;
    public type: ShipType;
    public fleet: Fleet;
    public targetShip?: Spaceship;
    public patterns: FiringPattern[];

    private readonly physicsComponent: PhysicsComponent<Spaceship>;
    private readonly renderComponent: RenderComponent<Spaceship>;
    private readonly inputComponent: InputComponent<Spaceship>;
    private readonly aiComponent: AIComponent<Spaceship>;
    private readonly weaponsComponent: WeaponsComponent<Spaceship>;

    constructor(
        gameCore: GameCore,
        type: ShipType,
        pos: Vector,
        vel: Vector,
        fleet: Fleet,
    ) {
        super(gameCore);
        // @ts-ignore
        const texture = gameCore.pixiTextures[type.sprite];

        // SPACESHIP DATA
        this.type = type; // This contains all the data for the ship's class/weapons/etc.

        this.fleet = fleet; // The fleet the ship is associated with.

        // POSITION INFORMATION
        this.pos = pos; // This is where the ship is currently
        this.targetPos = undefined; // This is where the ship wants to head
        this.vel = vel; // Ships velocity
        this.rotation = 270; // All ships start facing down. (0 to 360], Clockwise from 9'oclock

        // WEAPONS INFORMATION
        this.targetShip = undefined; // The ship Object that is currently targeted.
        this.patterns = []; // The name of the pattern, and how many are active. The actual pattern info is stored in the type object.

        for (const [amount, firingPattern] of this.type.patterns) {
            for (let i=0; i < amount; i++) {
                this.patterns.push(new FiringPattern(firingPattern));
            }
        }

        // SPACESHIP COMPONENTS
        // merges the default components with their overriding components.

        this.physicsComponent = new PhysicsComponent<Spaceship>(this);
        this.renderComponent = new RenderComponent<Spaceship>(this, texture);
        this.inputComponent = new InputComponent<Spaceship>(this);
        this.aiComponent = new AIComponent<Spaceship>(this);
        this.weaponsComponent = new WeaponsComponent<Spaceship>(this);

        for (let component of [
            this.physicsComponent,
            this.renderComponent,
            this.inputComponent,
            this.aiComponent,
            this.weaponsComponent
        ]) {
            gameCore.addComponent(component);
        }
    }

    toString() {
        return "spaceship"
    }
}
