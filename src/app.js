import React, {Component} from 'react';

import Img1 from "./assets/sprites.jpg";
import AdvancedSprite from "./components/advancedSprite";
import Spaceship from "./game_components/objects/spaceship";

import InputComponent from "./game_components/inputComponent";
import PhysicsComponent from './game_components/physicsComponent';
import RenderComponent from "./game_components/renderComponent";


export default class App extends Component {
    constructor(props) {
        super(props);

    }

    updateState = (options) => {
        this.setState({
            ...options
        })
    };

    render() {
        return <div>{this.props.options["foo"]}</div>
    }
}