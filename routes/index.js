// entry point for routes
//
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

function routes(API) {
  API.get('/status', AppController.getStatus);
  API.get('/stats', AppController.getStats);

  API.post('/users', UsersController.postNew);
  API.get('/users/me', UsersController.getMe);

  API.get('/connect', AuthController.getConnect);
  API.get('/disconnect', AuthController.getDisconnect);
}

export default routes;
