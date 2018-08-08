import GameComponent from "./gameComponent";
const PIXI = require("pixi.js");

export default class RenderComponent extends GameComponent{
    constructor(parent, spriteTexture){
        super(parent);
        this.sprite = new PIXI.Sprite(spriteTexture);
        this.sprite.position.set(
            this.parent.pos.x,
            this.parent.pos.y
        )
    }

    update(delta) {
        this.sprite.position.set(
            this.parent.pos.x,
            this.parent.pos.y
        )
    }
}
