import React, {Component} from 'react';

import Img1 from "./assets/sprites.jpg";
import AdvancedSprite from "./components/advancedSprite";


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            style: {
                top: 100,
                left: 100,
                position: "absolute",
                transform: "rotate(45deg)"
            },
            style2: {
                top: 100,
                left: 150,
                position: "absolute",
            }
        };
    }

    render() {
        console.log(this.state.style);
        return (
            <div>
                <AdvancedSprite
                    x={100}
                    y={0}
                    rotation={0}
                    filename={Img1}
                    width={39}
                    height={39}
                    spritesheetX={39}
                    spritesheetY={39}
                />
                <AdvancedSprite
                    x={200}
                    y={100}
                    rotation={45}
                    filename={Img1}
                    width={39}
                    height={39}
                    spritesheetX={39}
                    spritesheetY={39}
                />
            </div>
        );
    }
}