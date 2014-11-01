var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var http = require('http');

module.exports = {
  // example: http://localhost:1338/geojson/import?mapkey=custom/world-highres
  import: function (req, res, next) {

    // available mapkeys: http://code.highcharts.com/mapdata/

    var mapkey = req.param('mapkey'); // 'custom/world-highres' | 'de-all-all' | 'countries/de/de-hh-all-all'

    var url = 'http://code.highcharts.com/mapdata/'+mapkey+'.geo.json';

    http.get(url, function(resp) {
        var body = '';

        resp.on('data', function(chunk) {
            body += chunk;
        });

        resp.on('end', function() {
            var geoJsonResponse = JSON.parse(body)
            sails.log.debug("Got response: ", geoJsonResponse);
            geoJsonResponse.mapkey = mapkey;
            ModelService.updateOrCreate('Geojson', geoJsonResponse, {mapkey:mapkey}, function (err, result) {
              sails.log.debug(err, result);
              if (err) return res.serverError(err);
              res.json(result);
            });
        });
    }).on('error', function(err) {
        sails.log.error(err);
        return res.serverError(err);
    });
  }
  , destroyAll: function (req, res, next) {
    Geojson.destroy({}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.ok();
    });
  }
}
