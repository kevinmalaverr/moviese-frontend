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
import { render } from 'node-sass';
import getManifest from './getManifest'
import cookieParser from 'cookie-parser';
import boom from '@hapi/boom'
import passport from 'passport'
import axios from 'axios'


dotenv.config();

const { ENV, PORT } = process.env;



require('./utils/auth/strategies/basic')

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())

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
  app.use((req, res, next)=>{
    if(!req.hashManifest) req.hashManifest = getManifest()
    next()
  })
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

const setResponse = (html, preloadedState, manifest) => {
  const mainStyles = manifest ? manifest['main.css'] : 'assets/app.css'
  const mainBuild = manifest ? manifest['main.js'] : 'assets/app.js'
  const vendorBuild = manifest ? manifest['vendors.js'] : 'assets/vendor.js'

  return (`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="${mainStyles}" type="text/css">
        <title>Platzi Video</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
        </script>
        <script src="${vendorBuild}" type="text/javascript"></script>
        <script src="${mainBuild}" type="text/javascript"></script>
      </body>
    </html>
  `)
}

const renderApp = async (req, res) =>{

  let initialState;
  const {token, email, name, id} = req.cookies;

  try {
    let movieList = await axios({
      url: `${process.env.API_URL}/api/movies`,
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    movieList = movieList.data.data

    initialState = {
      user: {
        id, name, email
      },
      myList: [],
      trends: movieList.filter(movie => movie.contentRating === 'PG' && movie._id),
      originals: movieList.filter(movie => movie.contentRating === 'G' && movie._id)
    }
  } catch (error) {
    initialState = {
      user: {},
      searchElement: [],
      myList: [],
      trends: [],
      originals: [],
    };
  }



  const store = createStore(reducer, initialState);
  const preloadedState = store.getState()
  const isLogged = initialState.user.id
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes(isLogged))}
      </StaticRouter>
    </Provider>
  )
  res.send(setResponse(html, preloadedState, req.hashManifest))
}

app.post("/auth/sign-in", async function(req, res, next) {
  passport.authenticate("basic", function(error, data) {
    try {
      if (error || !data) {
        next(boom.unauthorized());
      }

      req.login(data, { session: false }, async function(error) {
        if (error) {
          next(error);
        }

        const { token, ...user } = data;

        res.cookie("token", token, {
          httpOnly: !(ENV === 'development'),
          secure: !(ENV === 'development')
        });

        res.status(200).json(user);
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

app.post("/auth/sign-up", async function(req, res, next) {
  const { body: user } = req;

  try {
    const userData = await axios({
      url: `${process.env.API_URL}/api/auth/sign-up`,
      method: "post",
      data: {
        email: user.email,
        name: user.name,
        password: user.password
      }
    });

    res.status(201).json({
      name: req.body.name,
      email: req.body.email,
      id: userData.data.id
    });
  } catch (error) {
    next(error);
  }
});


app.get('*', renderApp);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server running on port ${PORT}`);
});
