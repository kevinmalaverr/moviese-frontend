import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router';
import { Provider } from 'react-redux';
import { createStore, compose, applyMiddleware } from 'redux';
import reducer from './reducers';
import App from './routes/App';
import thunk from 'redux-thunk'

const history = createBrowserHistory();
const preloadedState = window.__PRELOADED_STATE__
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, preloadedState, composeEnhancers(applyMiddleware(thunk)));

delete window.__PRELOADED_STATE__

ReactDOM.hydrate(
  <Provider store={store}>
    <Router history={history}>
      <App isLogged={preloadedState.user.id}/>
    </Router>
  </Provider>,
  document.getElementById('app')
);
