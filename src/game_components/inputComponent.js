import React, {Component} from 'react';
import ReactDOM from 'react-dom';


export default class InputComponent extends Component {
    render() {
        let menu = <div>Hey there gary, it's me</div>;
        return ReactDOM.createPortal(
            menu,
            // INFO potentially change this.
            document.getElementById("react-entry")
        )
    }
}