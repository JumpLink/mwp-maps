var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var http = require('http');

module.exports = {
  // example: http://localhost:1338/geojson/import?mapkey=custom/world-highres
  importMapkey: function (req, res, next) {

    // available mapkeys: http://code.highcharts.com/mapdata/

    var mapkey = req.param('mapkey'); // 'custom/world-highres' | 'de-all-all' | 'countries/de/de-hh-all-all'

    GeojsonService.importMapkey(mapkey, function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , importLevel0: function (req, res, next) {
    GeojsonService.importMapkey('custom/world-highres', function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }


  , importLevel1: function (req, res, next) {
    //TODO more contries: http://code.highcharts.com/mapdata/
    var mapkeys = [
      'countries/af/af-all', // Afghanistan
      'countries/al/al-all', // Albania
      'countries/dz/dz-all', // Algeria
      'countries/as/as-all', // American Samoa
      'countries/ad/ad-all', // Andorra
      'countries/ao/ao-all', // Angola
      'countries/ag/ag-all', // Antigua and Barbuda
      'countries/ar/ar-all', // Argentina
      'countries/am/am-all', // Armenia
      'countries/au/au-all', // Australia
      'countries/at/at-all', // Austria
      'countries/az/az-all', // Azerbaijan
      // ..
      'countries/de/de-all', // Germany
      // ..
    ];

    var iterator = function (mapkey, callback) {
      GeojsonService.importMapkey(mapkey, callback);
    }

    async.map(mapkeys, iterator, function (error, results) {
      if (error) return res.serverError(error);
      res.json(results);
    });

  }

  , importLevel2: function (req, res, next) {
    //TODO more contries: http://code.highcharts.com/mapdata/
    var mapkeys = [
      'countries/de/de-bw-all',
      'countries/de/de-by-all',
      'countries/de/de-be-all',
      'countries/de/de-bb-all',
      'countries/de/de-hb-all',
      'countries/de/de-hh-all',
      'countries/de/de-he-all',
      'countries/de/de-mv-all',
      'countries/de/de-ni-all',
      'countries/de/de-nw-all',
      'countries/de/de-rp-all',
      'countries/de/de-sl-all',
      'countries/de/de-sn-all',
      'countries/de/de-st-all',
      'countries/de/de-sh-all',
      'countries/de/de-th-all',
    ];

    var iterator = function (mapkey, callback) {
      GeojsonService.importMapkey(mapkey, callback);
    }

    async.map(mapkeys, iterator, function (error, results) {
      if (error) return res.serverError(error);
      res.json(results);
    });

  }

  , importLevel3: function (req, res, next) {
    //TODO more contries: http://code.highcharts.com/mapdata/
    var mapkeys = [
      'countries/de/de-bw-all-all',
      'countries/de/de-by-all-all',
      'countries/de/de-be-all-all',
      'countries/de/de-bb-all-all',
      'countries/de/de-hb-all-all',
      'countries/de/de-hh-all-all',
      'countries/de/de-he-all-all',
      'countries/de/de-mv-all-all',
      'countries/de/de-ni-all-all',
      'countries/de/de-nw-all-all',
      'countries/de/de-rp-all-all',
      'countries/de/de-sl-all-all',
      'countries/de/de-sn-all-all',
      'countries/de/de-st-all-all',
      'countries/de/de-sh-all-all',
      'countries/de/de-th-all-all',
    ];

    var iterator = function (mapkey, callback) {
      GeojsonService.importMapkey(mapkey, callback);
    }

    async.map(mapkeys, iterator, function (error, results) {
      if (error) return res.serverError(error);
      res.json(results);
    });

  }

  , destroyAll: function (req, res, next) {
    Geojson.destroy({}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.ok();
    });
  }

  , reimportall: function (req, res, next) {
    GeojsonService.destroyAll(function destroyed (error, data) {
      if (error) return res.serverError(error);
      GeojsonService.importLevel0(function destroyed (error, data) {
        if (error) return res.serverError(error);
        GeojsonService.importLevel1(function destroyed (error, data) {
          if (error) return res.serverError(error);
          GeojsonService.importLevel2(function destroyed (error, data) {
            if (error) return res.serverError(error);
            GeojsonService.importLevel3(function destroyed (error, data) {
              if (error) return res.serverError(error);
              res.ok();
            });
          });
        });
      });
    });
  }
}
