import React, {Component} from 'react';
import {Sprite} from 'react-spritesheet'


export default class AdvancedSprite extends Component {
    static defaultProps = {
        x: 0,
        y: 0,
        rotation: 0,

        spritesheetX: 0,
        spritesheetY: 0
    };

    constructor(props) {
        super(props);
    }

    render() {
        // Custom Props
        const {y, x, rotation} = this.props;
        // Other props default to sprite.
        const {filename, width, height, spritesheetX, spritesheetY} = this.props;

        return (
            <div
                className="sprite"
                style = {{
                    // Subtract half width to align xy anchor to center.
                    top: y - (spritesheetY/2),
                    left: x - (spritesheetX/2),
                    // Rotation is from center, up being 0, clockwise from that.
                    transform: "rotate(" + rotation + "deg)"
                }}
            >
                <Sprite
                    filename={filename}
                    width={width}
                    height={height}
                    x={spritesheetX}
                    y={spritesheetY}
                />
            </div>)
    }
}