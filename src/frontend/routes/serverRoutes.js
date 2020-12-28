import Home from '../containers/Home';
import Login from '../containers/Login';
import Register from '../containers/Register';
import NotFound from '../containers/NotFound';
import Player from '../containers/Player';

const serverRoutes = (isLogged) => {
 return [
  {
    exac: true,
    path: '/',
    component: isLogged ? Home : Login,
  },
  {
    exac: true,
    path: '/login',
    component: Login,
  },
  {
    exac: true,
    path: '/register',
    component: Register,
  },
  {
    exac: true,
    path: '/player/:id',
    component: isLogged ? Player : Login,
  },
  {
    name: 'NotFound',
    component: NotFound
  }
]
}

export default serverRoutes