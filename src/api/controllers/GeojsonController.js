var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var http = require('http');

module.exports = {
  // example: http://localhost:1338/geojson/importMapkey?mapkey=custom/world-highres
  importMapkey: function (req, res, next) {

    // available mapkeys: http://code.highcharts.com/mapdata/

    var mapkey = req.param('mapkey'); // 'custom/world-highres' | 'de-all-all' | 'countries/de/de-hh-all-all'

    GeojsonService.importMapkey(mapkey, function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , importLevel0: function (req, res, next) {
    GeojsonService.importLevel0(function (error, results) {
      if (error) return res.serverError(error);
      res.json(results);
    });
  }

  , importLevel1: function (req, res, next) {
    GeojsonService.importLevel1(function (error, results) {
      if (error) return res.serverError(error);
      res.json(results);
    });
  }

  , importLevel2: function (req, res, next) {
    GeojsonService.importLevel2(function (error, results) {
      if (error) return res.serverError(error);
      res.json(results);
    });
  }

  , importLevel3: function (req, res, next) {
    GeojsonService.importLevel3(function (error, results) {
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
              sails.log.info("reimportall finish!");
              res.ok();
            });
          });
        });
      });
    });
  }

  , findAll: function (req, res, next) {
    Geojson.find({ limit:0 }).exec(function found (error, data) {
      if (error) return res.serverError(error);
      res.json(data);
    });
  }

  , mapkeys: function (req, res, next) {
    var mapkeys = GeojsonService.getMapkeys();
    res.json(mapkeys);
  }
  // example: http://localhost:1338/geojson/findbymapkey?mapkey=countries/de/de-all
  , findByMapkey: function (req, res, next) {
    var mapkey = req.param('mapkey');
    sails.log.debug("geojson/findbymapkey", mapkey);
    if(!mapkey) return res.serverError("missing mapkey: "+mapkey);
    Geojson.find({mapkey:mapkey}).exec(function (error, data) {
      if (error) return res.serverError(error);
      res.json(data);
    });
  }
}
