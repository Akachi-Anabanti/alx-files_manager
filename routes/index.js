// entry point for routes
//
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

function routes(API) {
  API.get('/status', AppController.getStatus);
  API.get('/stats', AppController.getStats);

  API.post('/users', UsersController.postNew);
  API.get('/users/me', UsersController.getMe);

  API.get('/connect', AuthController.getConnect);
  API.get('/disconnect', AuthController.getDisconnect);

  API.post('/files', FilesController.postUpload);
  API.get('/files/:id', FilesController.getShow);
  API.get('/files', FilesController.getIndex);
  API.put('/files/:id/publish', FilesController.putPublish);
  API.put('/files/:id/unpublish', FilesController.putUnpublish);
  API.get('/files/:id/data', FilesController.getFile);
}

export default routes;
