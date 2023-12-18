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
app.use('/api', (req, res, next) => {
  const demo = [
    '/agencies',
    '/agencies/omnitrans',
    '/agencies/omnitrans/routes',
    '/agencies/omnitrans/routes/1',
    '/agencies/omnitrans/vehicles',
    '/agencies/omnitrans/routes/1/vehicles',
    '/agencies/omnitrans/vehicles/1347',
    '/agencies/omnitrans/routes/1/stops/5303/predictions',
    '/agencies/omnitrans/tuples/1:5303,2:5423/predictions',
    '/agencies/omnitrans/stops/5303/predictions',
    '/locations/37.784825,-122.395592/predictions'
  ]

  if (demo.includes(req.url)) {
    return next()
  }

  return res.status(403).json({ message: 'Forbidden by Restbus Demo.' })
}, restbus.middleware());

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
