import GameComponent from "./gameComponent";

export default class PhysicsComponent extends GameComponent{
    static MAX_ACCELERATION = 10; // per second.
    static MAX_ROTATION = 20; // Degrees per second.
    static BOUNDING_BOX = 10;

    update(delta) {
        let {pos, vel} = this.parent;

        if (this.parent?.targetPos) {
            this.__moveToPosition(delta);
        }

        this.parent.pos.x = pos.x + (vel.x * delta/1000);
        this.parent.pos.y = pos.y + (vel.y * delta/1000);
    }

    __moveToPosition = (delta) => {
        let {pos, targetPos, vel} = this.parent;
        const {BOUNDING_BOX} = PhysicsComponent;

        // Once pos is close enough to target pos, delete target pos
        // this should only fire if the pos is within a 10x10 bounding box.
        if (
            targetPos.x - BOUNDING_BOX <= pos.x &&
            pos.x <= targetPos.x + BOUNDING_BOX &&
            targetPos.y - BOUNDING_BOX <= pos.y &&
            pos.y <= targetPos.y + BOUNDING_BOX
        ) {
            targetPos = null;
            return;
        }

        // percentageThrust is how much of main engines can be used to push the ship forwards.
        // Should be positive cosine only of the angle of the ship from the target.
        const percentageThrust = Math.max(Math.cos(this.__changeRotationToTarget(delta) / 180 * Math.PI), 0);
        this.__changeVelocityToTarget(delta, percentageThrust)
    };

    // TODO think more carefully about this, may cause some inconvenience with
    // ships already moving at an angle to the target. IE a ship moving to the west when target is south east.
    __changeVelocityToTarget = (delta, percentageThrust) => {

    };

    __changeRotationToTarget = (delta) => {
        // Return amount of radians till facing target
        let {pos, targetPos, rotation} = this.parent;
        const {MAX_ROTATION} = PhysicsComponent;

        let toTargetVector = {
            x: targetPos.x - pos.x,
            y: targetPos.y - pos.y
        };

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

    toString = () => {
        return "PhysicsComponent::ParentClassMaybe?"
    }
}
