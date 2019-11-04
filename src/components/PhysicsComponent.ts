import { GameComponent, UpdateResponse } from "components";
import GameObject, { Bullet, Spaceship } from "objects";
import GameCore from "core/GameCore";

import { intersection } from "greiner-hormann";
import _ from "lodash";

export interface XYObj {
    x: number;
    y: number;
}

interface ParentType extends GameObject {
    hitPoints: number;
    pos: XYObj;
    vel: XYObj;
    rotation: number;
    targetPos?: XYObj;
}

export default class PhysicsComponent<Parent extends ParentType = ParentType> extends GameComponent<Parent> {
    static MAX_ACCELERATION = 100; // per second.
    static MAX_ROTATION = 20; // Degrees per second.
    static BOUNDING_BOX = 10;

    public readonly boundingBox: [number, number][];
    public readonly size: { w: number; h: number };

    private _currentTranslation?: [number, number][];
    private readonly collisionFilter: (item: PhysicsComponent) => boolean;

    constructor(parent: Parent, boundingBox: [number, number][], size: { w: number; h: number }) {
        super(parent, "PhysicsComponent");

        this.boundingBox = boundingBox.map(item => [item[0] - size.w / 2, item[1] - size.h / 2]);
        this.size = size;

        this.collisionFilter =
            this.parent instanceof Bullet
                ? (item: PhysicsComponent) =>
                      !(item.parent instanceof Bullet || item.parent === ((this.parent as unknown) as Bullet).spawner)
                : (item: PhysicsComponent) =>
                      !(
                          item.parent instanceof Bullet &&
                          ((this.parent as unknown) as Spaceship) === item.parent.spawner
                      );
    }

    static getTargetVector = (currentPos: XYObj, targetPos: XYObj) => {
        return {
            x: targetPos.x - currentPos.x,
            y: targetPos.y - currentPos.y
        };
    };

    get currentTranslation() {
        if (this._currentTranslation !== undefined) {
            return this._currentTranslation;
        }

        let rads = Math.round(((((this.parent.rotation + 90) / 180) * Math.PI) % (2 * Math.PI)) * 10) / 10;
        this._currentTranslation = this.boundingBox.map(item => [
            item[0] * Math.cos(rads) - item[1] * Math.sin(rads) + this.parent.pos.x,
            item[1] * Math.cos(rads) + item[0] * Math.sin(rads) + this.parent.pos.y
        ]);

        return this._currentTranslation;
    }

    update(delta: number, gameCore: GameCore) {
        this._currentTranslation = undefined;

        let { pos, vel } = this.parent;

        if (this.parent.targetPos != undefined) {
            if (this.__moveToPosition(delta, this.parent.targetPos) === null) {
                this.parent.targetPos = undefined;
            }
        }

        this.parent.pos.x = pos.x + (vel.x * delta) / 1000;
        this.parent.pos.y = pos.y + (vel.y * delta) / 1000;
    }

    private __moveToPosition(delta: number, targetPos: XYObj): void | null {
        let { pos, vel } = this.parent;
        const { BOUNDING_BOX } = PhysicsComponent;

        // Once pos is close enough to target pos, delete target pos
        // this should only fire if the pos is within a 10x10 bounding box.
        if (
            targetPos.x - BOUNDING_BOX <= pos.x &&
            pos.x <= targetPos.x + BOUNDING_BOX &&
            targetPos.y - BOUNDING_BOX <= pos.y &&
            pos.y <= targetPos.y + BOUNDING_BOX
        ) {
            return null;
        }

        // percentageThrust is how much of main engines can be used to push the ship forwards.
        // Should be positive cosine only of the angle of the ship from the target.
        const percentageThrust = Math.max(
            Math.cos((this.__changeRotationToTarget(delta, targetPos) / 180) * Math.PI),
            0
        );
        this.__changeVelocityToTarget(delta, percentageThrust, targetPos);
    }

    private __changeVelocityToTarget(delta: number, percentageThrust: number, targetPos: XYObj) {
        let { pos } = this.parent;
        const { MAX_ACCELERATION } = PhysicsComponent;

        let toTargetVector = PhysicsComponent.getTargetVector(pos, targetPos);

        toTargetVector = {
            x: toTargetVector.x / Math.sqrt(toTargetVector.x ** 2 + toTargetVector.y ** 2),
            y: toTargetVector.y / Math.sqrt(toTargetVector.x ** 2 + toTargetVector.y ** 2)
        };

        // * 90 / 180 * Math.PI
        let xAccel = (Math.sin(toTargetVector.x) * MAX_ACCELERATION * percentageThrust) / 1000,
            yAccel = (Math.sin(toTargetVector.y) * MAX_ACCELERATION * percentageThrust) / 1000;

        // TODO update velocity according to match the percentages, no just blindly dumping more into one or the other.
        this.parent.vel.x += xAccel;
        this.parent.vel.y += yAccel;
    }
    private __changeRotationToTarget(delta: number, targetPos: XYObj) {
        // Return amount of radians till facing target
        let { pos, rotation } = this.parent;
        const { MAX_ROTATION } = PhysicsComponent;

        let toTargetVector = PhysicsComponent.getTargetVector(pos, targetPos);

        // (-180 to 180]
        let angleDegrees = (Math.atan2(toTargetVector.y, toTargetVector.x) * 180) / Math.PI;
        // (0 to 360], Clockwise from 9'oclock
        angleDegrees += 180;

        // Difference between the two rotations
        let rotationDifference = angleDegrees - rotation;

        // Check if turning in the other direction would be shorter.
        let newRotationDifference =
            rotationDifference > 0
                ? Math.min(rotationDifference, (rotationDifference - 360) * -1)
                : Math.max(rotationDifference, (rotationDifference + 360) * -1);

        // If it is, apply a transformation to reset it back to the 'other' direction
        if (newRotationDifference !== rotationDifference) {
            rotationDifference = newRotationDifference * -1;
        }

        // Rotate the parent object, either the amount it needs to be or the max rotational speed, whichever is smaller.
        this.parent.rotation +=
            rotationDifference > 0
                ? Math.min(rotationDifference, (MAX_ROTATION * delta) / 1000)
                : Math.max(rotationDifference, (MAX_ROTATION * -1 * delta) / 1000);

        // Return the difference in degrees.
        return rotationDifference;
    }

    cleanUp(gameCore: GameCore): void {}

    handleCollisions(delta: number, gameCore: GameCore): UpdateResponse {
        // This will be executed immediately after all items are in their updated positions.
        // Collide into self, update state, return true if needs to delete at the end. C:
        let toDelete = false;

        // TODO optimize
        const others: PhysicsComponent[] = gameCore.components.PhysicsComponent.filter(this.collisionFilter);

        for (const other of others) {
            if (intersection(this.currentTranslation, other.currentTranslation)) {
                // There is a collision
                // Deal damage to self.
                if (this.parent instanceof Bullet) {
                    return { toDelete: true };
                } else {
                    this.parent.hitPoints -= 1;
                    if (this.parent.hitPoints == 0) {
                        toDelete = true;
                    }
                }
            }
        }

        return {
            toDelete
        };
    }
}
