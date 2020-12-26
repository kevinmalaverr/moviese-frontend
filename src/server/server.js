/* eslint-disable global-require */
import express from 'express';
import dotenv from 'dotenv';
import webpack from 'webpack';
import React from 'react';
import helmet from 'helmet'
import { renderToString } from 'react-dom/server';
import { createBrowserHistory } from 'history';
import { StaticRouter } from 'react-router-dom';
import serverRoutes from '../frontend/routes/serverRoutes'
import { renderRoutes } from 'react-router-config'
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
import reducer from '../frontend/reducers';
import initialState from '../frontend/initialState';
import { render } from 'node-sass';

dotenv.config();

const { ENV, PORT } = process.env;

const app = express();

if (ENV === 'development') {
  console.log('Development config');
  const webpackConfig = require('../../webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  const { publicPath } = webpackConfig.output;
  const serverConfig = { serverSideRender: true, publicPath };

  app.use(webpackDevMiddleware(compiler, serverConfig));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use(express.static(`${__dirname}/public`))
  app.use(helmet())
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'sha256-fqAyYQw90BvHA2X8Dgsi3fckwxSvBr0kTnVVFxqUOls='"],
        'img-src': ["'self'", 'http://dummyimage.com'],
        'style-src-elem': ["'self'", 'https://fonts.googleapis.com'],
        'font-src': ['https://fonts.gstatic.com'],
        'media-src': ['*'],
      },
    }),
  );
  app.use(helmet.permittedCrossDomainPolicies());
}

const setResponse = (html, preloadedState) => {
  return (`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="assets/app.css" type="text/css">
        <title>Platzi Video</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
        </script>
        <script src="assets/app.js" type="text/javascript"></script>
      </body>
    </html>
  `)
}

const renderApp = (req, res) =>{
  const store = createStore(reducer, initialState);
  const preloadedState = store.getState()
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes)}
      </StaticRouter>
    </Provider>
  )
  res.send(setResponse(html, preloadedState))
}

app.get('*', renderApp);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server running on port ${PORT}`);
});
