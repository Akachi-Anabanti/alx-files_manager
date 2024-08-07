// entry point for routes
//
import AppController from '../controllers/AppController';

function routes(API){
  API.get('/status', AppController.getStatus);
  API.get('/stats', AppController.getStats);
}

export default routes;
