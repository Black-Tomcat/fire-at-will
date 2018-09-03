import GameComponent from "./gameComponent";
import PhysicsComponent from './physicsComponent';
import Bullet from "../objects/bullet";
import Spaceship from "../objects/spaceship";

export default class WeaponsComponent extends GameComponent{
    constructor(parent) {
        super(parent);
    }

    update(delta, gameCore) {
        const {type, targetShip, activePatterns, ammo} = this.parent;
        // TODO multiple firing solutions on multiple targets, and at different speeds.

        // If there's no target, stop firing all guns.
        // TODO shift so that only guns with targets stop firing.
        if (targetShip == null) {
            for (let patternName in type.patternAmounts) {
                this.parent.activePatterns[patternName] = [];
            }
            return;
        }
        // TODO fire guns.
        // Assign all guns on.

        if (targetShip === this.parent) {
            throw new Error("WHY IS THIS HAPPENING?")
        }

        for (let patternName in type.patternAmounts) {
            while (activePatterns[patternName].length < type.patternAmounts[patternName]){
                let pattern = new Object(this.parent.type.firingPatterns[patternName]);
                pattern.lastFired = 0;
                pattern.targetShip = targetShip;

                this.parent.activePatterns[patternName].push(pattern)
            }
        }

        for (let patternName in activePatterns) {
            for (let i = 0; i < activePatterns[patternName].length; i++) {
                this.__fireGun(activePatterns[patternName][i], delta, gameCore)
            }
        }
    }

    __fireGun(firingPattern, delta, gameCore) {
        // TODO finish this method with some ammo.
        const {pos, targetShip} = this.parent;
        const {fireRate, launcherAmount} = firingPattern;

        firingPattern.lastFired += delta;
        while (firingPattern.lastFired > (1000 / fireRate / launcherAmount)) {
            firingPattern.lastFired -= (1000 / fireRate / launcherAmount);
            let toTargetVector = PhysicsComponent.getTargetVector(pos, targetShip.pos);

            // TODO If x and y are 0, then they will result in nan.
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
        return "WeaponsComponent::" + this.parent.toString().split("::")[0]
    }
}