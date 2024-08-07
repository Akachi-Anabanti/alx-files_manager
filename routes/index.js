// entry point for routes
//
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

function routes(API) {
  API.get('/status', AppController.getStatus);
  API.get('/stats', AppController.getStats);

  API.post('/users', UsersController.postNew);

}

export default routes;
