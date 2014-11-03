var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var http = require('http');

module.exports = {
  // example: http://localhost:1338/geojson/import?mapkey=custom/world-highres
  importMapkey: function (req, res, next) {

    // available mapkeys: http://code.highcharts.com/mapdata/

    var mapkey = req.param('mapkey'); // 'custom/world-highres' | 'de-all-all' | 'countries/de/de-hh-all-all'

    GeojsonService.importMapkey(mapkey, function (error, result) {
      if (err) return res.serverError(err);
      res.json(result);
    });
  }

  , importLevel0: function (req, res, next) {
    GeojsonService.importMapkey('custom/world-highres', function (error, result) {
      if (err) return res.serverError(err);
      res.json(result);
    });
  }

  , destroyAll: function (req, res, next) {
    Geojson.destroy({}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.ok();
    });
  }
}
