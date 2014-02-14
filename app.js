var express = require('express'),
    restbus = require('restbus'),
    app = express();


app.enable('trust proxy');
app.set('view engine', 'jade');
app.locals({pretty: true});

app.use(express.logger('dev'));
app.use(express.compress());
//app.use(express.static(__dirname + '/public'));
app.use(app.router);
app.use(function(req, res, next) {
  res.send(404);
});
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500);
});

app.get('/', function(req, res) {
  res.render('index');
});


app.listen('3000', function() {
  console.log('restbus.info listening on port 3000');
  restbus.listen('3535', function() {
    console.log('restbus proxy listening on port 3535');
  });
});