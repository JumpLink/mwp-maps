var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var http = require('http');

module.exports = {
  // example: http://localhost:1338/geojson/import?mapkey=custom/world-highres
  import: function (req, res, next) {
    NutsService.importer3(function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , importHasc: function (req, res, next) {
    NutsService.importerHasc(function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , insertChilds: function (req, res, next) {
    NutsService.insertChilds(function(error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , destroyAll: function (req, res, next) {
    Nuts.destroy({}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.ok();
    });
  }
}
