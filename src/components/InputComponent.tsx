import React from "react";

import GameComponent from "components";
import GameObject from "objects";
import GameCore from "core/GameCore";

interface ParentType extends GameObject {
}

export default class InputComponent<Parent extends ParentType = ParentType> extends GameComponent {
    // private isShowing: boolean;

    constructor(parent: Parent) {
        super(parent, "InputComponent");
        // this.isShowing = false;
        // this.menuComponent = menuComponent;
    }

    update(delta: number) {
        // TODO basically a ShouldComponentUpdate and a response if appropriate
    }

    display() {
        // return (this.isShowing && this.menuComponent)
    }

    cleanUp(gameCore: GameCore): void {
    }

    getRenderComponent(): React.ReactElement {
        return <p style={{color: "#FFF"}}>text</p>;
    }
}
