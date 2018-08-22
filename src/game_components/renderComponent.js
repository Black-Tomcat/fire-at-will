import GameComponent from "./gameComponent";
const PIXI = require("pixi.js");

export default class RenderComponent extends GameComponent{
    constructor(parent, spriteTexture){
        super(parent);
        this.sprite = new PIXI.Sprite(spriteTexture);
        this.sprite.position.set(
            this.parent.pos.x,
            this.parent.pos.y
        );
        this.active = false;
        this.visible = true
    }

    update(delta, gameCore) {
        this.sprite.position.set(
            this.parent.pos.x,
            this.parent.pos.y
        );

        if (this.visible && !this.active) {
            this.active = true;
            gameCore.pixiApp.stage.addChild(this.sprite)
        } else if (!this.visible && this.active) {
            this.active = false;
            gameCore.pixiApp.stage.removeChild(this.sprite)
        }
    }

    destroySprite = () => {
        this.visible = false;
    };

    toString = () => {
        return "RenderComponent::ParentClassMaybe?"
    }
}
