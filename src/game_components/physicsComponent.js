import GameComponent from "./gameComponent";

export default class PhysicsComponent extends GameComponent{
    update(delta) {
        let {pos, vel} = this.parent;
        this.parent.pos.x = pos.x + (vel.x * delta/1000);
        this.parent.pos.y = pos.y + (vel.y * delta/1000)
    }
}
