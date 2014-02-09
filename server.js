var express = require('express'),
    api = require('./lib/api'),
    utils = require('./lib/utils'),
    proxy = express();

// Middleware
proxy.use(express.logger('dev'));
proxy.use(function(req, res, next) {
  res.set({// No client caching
    'Expires': 'Sat, 01 Jan 2000 08:00:00 GMT',
    'Last-Modified': new Date().toUTCString(),
    'Cache-Control': 'max-age=0, no-cache, must-revalidate, proxy-revalidate'
  });
  next();
});
proxy.use(proxy.router);
proxy.use(function(req, res, next) {
  res.json(404, utils.errors.get(404, 'The requested URI can not be found on this server.'))
});
proxy.use(function(err, req, res, next) {
  console.error(err.stack);
  res.json(500, utils.errors.get(500, 'The server encountered an unexpected condition: ' + err.message));
});

// Routing
proxy.get('/agencies', api.agencies.list);
proxy.get('/agencies/:agency', api.agencies.get);
proxy.get('/agencies/:agency/routes', api.routes.list);
proxy.get('/agencies/:agency/routes/:route', api.routes.get);
//proxy.get('/agencies/:agency/routes/:route/stop/:stop/predictions', api.predictions.get);
//proxy.get('/agencies/:agency/stop/:code/predictions', api.predictions.forCode);
//proxy.get('/agencies/:agency/tuples/:tuples/predictions', api.predictions.list);
//proxy.get('/location/:latlng/predictions', api.predictions.byLoc);

// Start server
proxy.listen('3535');