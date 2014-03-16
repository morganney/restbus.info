var express = require('express'),
    restbus = require('restbus'),
    app = express();

// Configuration
app.configure('development', function() {
  app.use(express.logger('dev'));
  app.locals({pretty: true});
});
app.configure('production', function() {
  app.use(express.logger());
});
app.configure('all', function() {
  app.enable('trust proxy');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(app.router);
  app.use(function(req, res, next) {
    res.status(404).render('notfound');
  });
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500);
  });
});

// Routing
app.get('/', function(req, res) {
  res.render('index');
});
app.get('/robots.txt', function(req, res) {
  res.set({
    'Content-Type': 'text/plain',
    'Expires': new Date("1/1/2050").toUTCString()
  });
  res.send(200, 'User-agent: *\nDisallow: ');
});
app.get('/_links/rel/full', function(req, res) {
  res.render('full');
});

// Get to work
app.listen('3000', function() {
  console.log('restbus.info listening on port 3000');
  restbus.listen('3535', function() {
    console.log('restbus proxy listening on port 3535');
  });
});