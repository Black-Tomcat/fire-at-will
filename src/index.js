import React, {Component} from 'react';
import ReactDOM from 'react-dom';


class Index extends Component {
    render() {
        return <p>Sample text.</p>
    }
}

ReactDOM.render(
    <Index/>,
    document.getElementById("react-entry")
);