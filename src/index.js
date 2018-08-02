import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Storage from 'electron-json-storage';

// REDUX
import {createStore, combineReducers, applyMiddleware} from 'redux'
import {Provider} from 'react-redux';
// MIDDLEWARE
import ReduxLogger from 'redux-logger'
// REDUCERS
import gameReducer from './reducers/gameReducer'

import App from './app'
import './css/app.sass'


const store = createStore(
    combineReducers({
        Game: gameReducer
    }),
    applyMiddleware(ReduxLogger)
);


// Load in player save data here, pass to app or store as required.
// TODO load directly into reducers
let shipTemplates;
Storage.set(
    "shipTemplates",
    {foo: "bar"},
    err => {
        if (err) throw err;
        Storage.get(
            "shipTemplates",
            (err, data) => {
                if (err) throw err;
                shipTemplates = data;
            }
        )
    }
);


ReactDOM.render(
    <Provider store={store}>
        <App
            shipTemplates={shipTemplates}
        />
    </Provider>,
    document.getElementById("react-entry")
);