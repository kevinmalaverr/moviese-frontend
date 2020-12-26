import Home from '../containers/Home';
import Login from '../containers/Login';
import Register from '../containers/Register';
import NotFound from '../containers/NotFound';
import Player from '../containers/Player';

const routes = [
  {
    exac: true,
    path: '/',
    component: Home,
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
    component: Player,
  },
  {
    name: 'NotFound',
    component: NotFound
  }
]

export default routes