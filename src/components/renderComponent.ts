import GameComponent from "./gameComponent";
import {Sprite, Texture} from "pixi.js";
import GameObject from "../objects/gameObject";
import {XYObj} from "./physicsComponent";
import GameCore from "../core/gameCore";


interface ParentType extends GameObject{
    pos: XYObj;
    rotation: number;
}

export default class RenderComponent<Parent extends ParentType = ParentType> extends GameComponent<Parent> {
    private readonly sprite: PIXI.Sprite;
    private active: boolean;
    private visible: boolean;

    constructor(parent: Parent, spriteTexture: Texture){
        super(parent, "RenderComponent");
        this.sprite = new Sprite(spriteTexture);

        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.position.set(
            this.parent.pos.x,
            this.parent.pos.y
        );

        this.active = false;
        this.visible = true
    }

    update(delta: number, gameCore: GameCore) {
        this.sprite.position.set(
            this.parent.pos.x,
            this.parent.pos.y
        );
        this.sprite.rotation = (this.parent.rotation - 270) / 180 * Math.PI ;

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

    cleanUp(gameCore: GameCore): void {
        gameCore.pixiApp.stage.removeChild(this.sprite);
    }
}
