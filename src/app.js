import React, {Component} from 'react';


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