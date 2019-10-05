import React, { useState } from "react";

import { GameComponent } from "components";
import GameObject from "objects";
import GameCore from "core/GameCore";

interface ParentType extends GameObject {}

export default class InputComponent<Parent extends ParentType = ParentType> extends GameComponent<Parent> {
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

    cleanUp(gameCore: GameCore): void {}

    getRenderComponent(): React.ReactElement {
        return <BaseComponent />;
    }
}

const BaseComponent: React.FC = (props: {}) => {
    const [hidden, setHidden] = useState(false);

    return (
        <div
            className={"demo"}
            style={{
                // height: 100,
                // width: 100,
                visibility: hidden ? "hidden" : "visible"
            }}
            augmented-ui="tl-clip br-clip exe"
        >
            <p style={{ color: "#FFF", fontFamily: "consolas" }}>This is an emergency! Send help!</p>
        </div>
    );
};
