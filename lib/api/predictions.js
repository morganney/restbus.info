var http = require('http'),
  utils = require('../utils'),
  NBXML_FEED = utils.c.NEXTBUS_XMLFEED,
  predictions = {};

predictions.get = function(req, res) {
  var p = req.params, a = p.agency, r = p.route, s = p.stop,
      path = [NBXML_FEED, '?command=predictions&a=', a, '&r=', r, '&s=', s].join('');

  http.get(utils.getOptionsWithPath(path), function(nbres) {
    utils.getJsFromXml(nbres, function(err, js) {
      var json = [], nberr = js.body.Error && js.body.Error[0];
      if(!err) {
        if(!nberr) {
          var predictions = js.body.predictions, t$ = predictions[0].$;

          if(typeof t$.dirTitleBecauseNoPredictions === 'undefined' || !t$.dirTitleBecauseNoPredictions) {

          } else {

          }

          res.json(200, js);
        } else utils.nbXmlError(nberr, res);
      } else utils.streamOrParseError(err, js, res);
    });
  }).on('error', function(e) { utils.nbRequestError(e, res); });
};

module.exports = predictions;
