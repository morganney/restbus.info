var http = require('http'),
    utils = require('../utils'),
    NBXML_FEED = utils.c.NEXTBUS_XMLFEED,
    predictions = {};

predictions.get = function(req, res) {
  var p = req.params, a = p.agency, r = p.route, s = p.stop,
      path = [NBXML_FEED, '?command=predictions&a=', a, '&r=', r, '&s=', s].join('');

  http.get(utils.getOptionsWithPath(path), function(nbres) {
    utils.getJsFromXml(nbres, function(err, js) {
      var json = [], nberr = js.body.Error && js.body.Error[0], vs = [];
      if(!err) {
        if(!nberr) {
          var pred = js.body.predictions && js.body.predictions[0], messages = pred.message, $ = pred.$;

          if(typeof $.dirTitleBecauseNoPredictions === 'undefined' || !$.dirTitleBecauseNoPredictions) {
            pred.direction.forEach(function(direction) {
              direction.prediction.forEach(function(prediction) {
                var p$ = prediction.$, p = {};

                p.epochTime = parseInt(p$.epochTime, 10);
                p.seconds = parseInt(p$.seconds, 10);
                p.minutes = parseInt(p$.minutes, 10);
                p.vehicleId = p$.vehicle;
                p.direction = {
                  id: p$.dirTag,
                  title: direction.$.title
                };
                p.route = {
                  id: $.routeTag,
                  title: $.routeTitle
                };
                p.stop = {
                  id: $.stopTag,
                  title: $.stopTitle
                };
                p.messages = [];
                if(messages) messages.forEach(function(m) {
                  p.messages.push({ text: m.$.text, priority: m.$.priority });
                });
                json.push(p);
              });
            });
            json.sort(function(a, b) {return a.epochTime - b.epochTime;});
          } // else there are no predictions thus json === [empty]

          res.json(200, json);
        } else utils.nbXmlError(nberr, res);
      } else utils.streamOrParseError(err, js, res);
    });
  }).on('error', function(e) { utils.nbRequestError(e, res); });
};

module.exports = predictions;
