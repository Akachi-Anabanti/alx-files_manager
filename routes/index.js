// entry point for routes


function routes(API){
  API.get('/status', AppController.getStatus);
  API.get('/stats', AppController.getStats);
}
