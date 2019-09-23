import GameComponent, {PhysicsComponent, XYObj} from "components";
import GameObject, {Bullet, Spaceship, FiringPattern, ShipType} from "objects";
import GameCore from "core/GameCore";


interface ParentType extends GameObject {
    type: ShipType
    targetShip?: Spaceship
    patterns: FiringPattern[]
    // ammo: string
    pos: XYObj
}

export default class WeaponsComponent<Parent extends ParentType = ParentType> extends GameComponent<Parent> {
    constructor(parent: Parent) {
        super(parent, "WeaponsComponent");
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

        let i = 0;
        for (let pattern of patterns.filter((item) => item.active !== undefined)) {
            this.__fireGun(pattern, i++, delta, gameCore)
        }
    }

    __fireGun(firingPattern: FiringPattern, iteration: number, delta: number, gameCore: GameCore) {
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
                y: (Math.sin(toTargetVector.y) * 300)
            };


            gameCore.addGameObject(
                // @ts-ignore
                new Bullet(gameCore, {...this.parent.pos, x: this.parent.pos.x - iteration * 5}, vel, this.parent as Spaceship)
            )
            //new Spaceship(gameCore, gameCore.shipTemplates["defensiveBullets"], {...this.parent.pos}, vel, gameCore.Fleet[0]);
        }
    }

    cleanUp(gameCore: GameCore): void {};
}