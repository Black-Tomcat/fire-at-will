import React, {Component} from 'react';
import PropTypes from 'prop-types'


export default class Spaceship extends Component {
    static propTypes = {
        // renderComponent is responsible for rendering the ship in the correct position
        // This will eventually include things such as zoom fixing
        renderComponent: PropTypes.object.isRequired,
        physicsComponent: PropTypes.object.isRequired,
        inputComponent: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
    }

    update = () => {
        const {renderComponent, physicsComponent, inputComponent} = this.props;
        inputComponent.update();
        physicsComponent.update();
        renderComponent.update();
    };

    render() {
        return <div>
            {this.props.renderComponent}
            {this.props.inputComponent}
        </div>
    }
}