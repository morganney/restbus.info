var http = require('http'),
    utils = require('../utils'),
    NBXML_FEED = utils.c.NEXTBUS_XMLFEED,
    predictions = {};

predictions.get = function(req, res) {
  var p = req.params, a = p.agency, r = p.route, s = p.stop,
      path = p.path || [NBXML_FEED, '?command=predictions&a=', a, '&r=', r, '&s=', s].join('');

  http.get(utils.getOptionsWithPath(path), function(nbres) {
    utils.getJsFromXml(nbres, function(err, js) {
      var json = [], nberr;

      if(!err) {
        nberr = js.body.Error && js.body.Error[0];
        if(!nberr) {
          // Predictions for each route (if they exist).
          js.body.predictions.forEach(function(pred) {
            var $ = pred.$, messages = pred.message, p = {};

            if(!$.dirTitleBecauseNoPredictions) {
              p.agencyTitle = $.agencyTitle;
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

              p.values = [];
              // Prediction values for each route direction
              pred.direction.forEach(function(direction) {
                direction.prediction.forEach(function(prediction) {
                  var $$ = prediction.$, v = {};

                  v.epochTime = parseInt($$.epochTime, 10);
                  v.seconds = parseInt($$.seconds, 10);
                  v.minutes = parseInt($$.minutes, 10);
                  v.branch = !$$.branch ? null : $$.branch;
                  v.isDeparture = !!($$.isDeparture === 'true');
                  v.affectedByLayover = !$$.affectedByLayover ? false : true;
                  v.isScheduleBased = !$$.isScheduleBased ? false : true;
                  v.vehicle = {
                    id: $$.vehicle,
                    block: $$.block,
                    trip: !$$.tripTag ? null : $$.tripTag
                  };
                  v.direction = {
                    id: $$.dirTag,
                    title: direction.$.title
                  };

                  p.values.push(v);
                });
              });

              // Sort the prediction values in ascending order
              p.values.sort(function(a, b) {return a.epochTime - b.epochTime;});

              json.push(p);
            } // else there are no predictions thus json === [empty].
          });

          res.json(200, json);
        } else utils.nbXmlError(nberr, res);
      } else utils.streamOrParseError(err, js, res);
    });
  }).on('error', function(e) { utils.nbRequestError(e, res); });
};

/**
 * Method for returning predictions for every route passing through a stop. Uses the stopId (code) property
 * for a stop from the NextBus XML feed. Wrapper of predictions.get() but doesn't require a route id.
 *
 * @uri /agencies/:agency/stops/:code/predictions
 *
 * @param {Object:req} The node native http.ClientRequest object.
 * @param {Object:res} The node native http.ClientResponse object.
 */
predictions.list = function(req, res) {
  var p = req.params;

  p.path = [NBXML_FEED, '?command=predictions&a=', p.agency, '&stopId=', p.code].join('');
  predictions.get(req, res);
};

/**
 * Tuples <====> F:5650 (route-id:stop-id)
 * @uri /agencies/:agency/tuples/:tuples/predictions e.g. /agencies/sf-muni/tuples/F:5650,N:6997/predictions
 *
 * @param req
 * @param res
 */

predictions.tuples = function(req, res) {
  var p = req.params, tuples = p.tuples, q = '';

  tuples.split(',').forEach(function(tuple) { q += ['&', 'stops=', tuple.replace(':', '|')].join(''); });
  p.path = [NBXML_FEED, '?command=predictionsForMultiStops&a=', p.agency, q].join('');
  predictions.get(req, res);
};

predictions.location = function(req, res) {
  
};

module.exports = predictions;