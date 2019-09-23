import GameComponent from "components";
import GameObject from "objects";
import GameCore from "core/GameCore";


export interface XYObj {x: number; y: number}

interface ParentType extends GameObject {
    pos: XYObj,
    vel: XYObj
    rotation: number
    targetPos?: XYObj
}

export default class PhysicsComponent<Parent extends ParentType = ParentType> extends GameComponent<Parent>{
    static MAX_ACCELERATION = 100; // per second.
    static MAX_ROTATION = 20; // Degrees per second.
    static BOUNDING_BOX = 10;
    public readonly boundingBox: [number, number][];

    public readonly size: { w: number; h: number };
    constructor(parent: Parent, boundingBox: [number, number][], size: {w: number, h: number}) {
        super(parent, "PhysicsComponent");

        this.boundingBox = boundingBox;
        this.size = size;
    }

    static getTargetVector = (currentPos: XYObj, targetPos: XYObj) => {
        return {
            x: targetPos.x - currentPos.x,
            y: targetPos.y - currentPos.y
        }
    };

    update(delta: number, gameCore: GameCore) {
        let {pos, vel} = this.parent;

        if (this.parent.targetPos != undefined) {
            if (this.__moveToPosition(delta, this.parent.targetPos) === null) {
                this.parent.targetPos = undefined;
            }
        }

        this.parent.pos.x = pos.x + (vel.x * delta/1000);
        this.parent.pos.y = pos.y + (vel.y * delta/1000);
    }

    __moveToPosition = (delta: number, targetPos: XYObj): void | null =>  {
        let {pos, vel} = this.parent;
        const {BOUNDING_BOX} = PhysicsComponent;

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
        const percentageThrust = Math.max(Math.cos(this.__changeRotationToTarget(delta, targetPos) / 180 * Math.PI), 0);
        this.__changeVelocityToTarget(delta, percentageThrust, targetPos)
    };

    // TODO think more carefully about this, may cause some inconvenience with
    // ships already moving at an angle to the target. IE a ship moving to the west when target is south east.

    __changeVelocityToTarget = (delta: number, percentageThrust: number, targetPos: XYObj) => {
        let {pos} = this.parent;
        const {MAX_ACCELERATION} = PhysicsComponent;

        let toTargetVector = PhysicsComponent.getTargetVector(pos, targetPos);

        toTargetVector = {
            x: toTargetVector.x / Math.sqrt(toTargetVector.x ** 2 + toTargetVector.y ** 2),
            y: toTargetVector.y / Math.sqrt(toTargetVector.x ** 2 + toTargetVector.y ** 2)
        };

        // * 90 / 180 * Math.PI
        let xAccel = Math.sin(toTargetVector.x) * MAX_ACCELERATION * percentageThrust / 1000,
            yAccel = Math.sin(toTargetVector.y) * MAX_ACCELERATION * percentageThrust / 1000;

        // TODO update velocity according to match the percentages, no just blindly dumping more into one or the other.
        this.parent.vel.x += xAccel;
        this.parent.vel.y += yAccel;
    };
    __changeRotationToTarget = (delta: number, targetPos: XYObj) => {
        // Return amount of radians till facing target
        let {pos, rotation} = this.parent;
        const {MAX_ROTATION} = PhysicsComponent;

        let toTargetVector = PhysicsComponent.getTargetVector(pos, targetPos);

        // (-180 to 180]
        let angleDegrees = Math.atan2(toTargetVector.y, toTargetVector.x) * 180 / Math.PI;
        // (0 to 360], Clockwise from 9'oclock
        angleDegrees += 180;

        // Difference between the two rotations
        let rotationDifference = angleDegrees - rotation;

        // Check if turning in the other direction would be shorter.
        let newRotationDifference = rotationDifference > 0
            ? Math.min(rotationDifference, (rotationDifference - 360) * -1)
            : Math.max(rotationDifference, (rotationDifference + 360) * -1);

        // If it is, apply a transformation to reset it back to the 'other' direction
        if (newRotationDifference !== rotationDifference) {
            rotationDifference = newRotationDifference * -1;
        }

        // Rotate the parent object, either the amount it needs to be or the max rotational speed, whichever is smaller.
        this.parent.rotation +=
            rotationDifference > 0 ?
            Math.min(rotationDifference, MAX_ROTATION * delta/1000) :
            Math.max(rotationDifference, MAX_ROTATION * -1 * delta/1000);

        // Return the difference in degrees.
        return rotationDifference
    };

    cleanUp(gameCore: GameCore): void {}
}
