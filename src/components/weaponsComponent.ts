import GameComponent from "./gameComponent";
import PhysicsComponent, {Vector} from './physicsComponent';
import Bullet from "../objects/bullet";
import GameObject from "../objects/gameObject";
import GameCore from "../core/gameCore";
import Spaceship, {FiringPattern, ShipType} from "../objects/spaceship";


interface ParentType {
    type: ShipType
    targetShip?: Spaceship
    patterns: FiringPattern[]
    // ammo: string
    pos: Vector
}

export default class WeaponsComponent<Parent extends ParentType & GameObject = ParentType> extends GameComponent<Parent> {
    constructor(parent: Parent) {
        super(parent);
    }

    update(delta: number, gameCore: GameCore) {
        const {type, targetShip, patterns} = this.parent;
        // TODO multiple firing solutions on multiple targets, and at different speeds.

        for (const pattern of patterns) {
            pattern.timeSinceLastFired += delta
        }

        // If there's no target, stop firing all guns.
        if (targetShip == null) {
            for (const firingPattern of patterns) {
                firingPattern.active = undefined;
            }
            return;
        }
        // TODO fire guns.
        // Assign all guns on.
        for (let pattern of patterns) {
            pattern.active = targetShip;
        }

        for (let pattern of patterns.filter((item) => item.active !== undefined)) {
            this.__fireGun(pattern, delta, gameCore)
        }
    }

    __fireGun(firingPattern: FiringPattern, delta: number, gameCore: GameCore) {
        // TODO finish this method with some ammo.
        const {timeSinceLastFired: lastFired, active} = firingPattern;
        const {launcherAmount} = firingPattern.firingPatternType;

        firingPattern.timeSinceLastFired += delta;
        while (firingPattern.timeSinceLastFired > (1000 / firingPattern.firingPatternType.fireRate / launcherAmount)) {
            firingPattern.timeSinceLastFired -= (1000 / firingPattern.firingPatternType.fireRate / launcherAmount);
            let toTargetVector = PhysicsComponent.getTargetVector(this.parent.pos, (active as Spaceship).pos);

            // TODO If x and y are 0, then they will result in NaN.
            toTargetVector = {
                x: toTargetVector.x / Math.sqrt(toTargetVector.x ** 2 + toTargetVector.y ** 2),
                y: toTargetVector.y / Math.sqrt(toTargetVector.x ** 2 + toTargetVector.y ** 2)
            };

            let vel = {
                x: (Math.sin(toTargetVector.x) * 300),
                y: (Math.sin(toTargetVector.y) * 300)};


            new Bullet(gameCore, {...this.parent.pos}, vel);
            //new Spaceship(gameCore, gameCore.shipTemplates["defensiveBullets"], {...this.parent.pos}, vel, gameCore.fleets[0]);
        }
    }

    toString = () => {
        return "weaponsComponent::" + this.parent.toString().split("::")[0]
    }
}