var express = require('express'),
    compression = require('compression'),
    errorhandler = require('errorhandler'),
    logger = require('morgan'),
    restbus = require('restbus'),
    app = express();

// Configuration
if (app.get('env') === 'development') {
  app.use(logger('dev'));
  app.use(errorhandler({showStack: true, dumpExceptions: true}));
  app.use(express.static('.'))
  app.locals.pretty = true;
} else {
  app.use(logger('combined'))
}

app.enable('trust proxy');
app.set('view engine', 'pug');
app.use(compression());

// Routing
app.get('/', function(req, res) {
  res.render('index');
});
app.get('/robots.txt', function(req, res) {
  res.set({
    'Content-Type': 'text/plain',
    'Expires': new Date("1/1/2050").toUTCString()
  });
  res.status(200).send('User-agent: *\nDisallow: ');
});
app.get('/_links/rel/full', function(req, res) {
  res.render('full');
});
app.use('/api', restbus.middleware())

// Error Handling
app.use(function(req, res, next) {
  res.status(404).render('notfound');
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
});

// Start server
app.listen('3000', function() {
  console.log('restbus.info listening on port 3000');
});
