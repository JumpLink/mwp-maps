var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var http = require('http');

module.exports = {
  // example: http://localhost:1338/nuts/import
  import: function (req, res, next) {
    NutsService.importer2010(function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , reimportAll: function (req, res, next) {
    Nuts.destroy({}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      NutsService.importer2010(function (error, result) {
        if (error) return res.serverError(error);
        NutsService.insertChilds(function(error, result) {
          if (error) return res.serverError(error);
          NutsService.importerHascDeLevel3(function (error, result) {
            if (error) return res.serverError(error);
            NutsService.importerHascDeLevel1(function (error, result) {
              if (error) return res.serverError(error);
              NutsService.importerHascLevel0(function (error, result) {
                if (error) return res.serverError(error);
                res.ok();
              });
            });
          });
        });
      });
    });
  }

  // example: http://localhost:1338/nuts/importerHascLevel0
  , importerHascLevel0: function (req, res, next) {
    NutsService.importerHascLevel0(function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , importerHascDeLevel1: function (req, res, next) {
    NutsService.importerHascDeLevel1(function (error, result) {
      if (error) return res.serverError(error);
      res.json(result);
    });
  }

  , importerHascDeLevel3: function (req, res, next) {
    NutsService.importerHascDeLevel3(function (error, result) {
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

  , findByLevel: function (req, res, next) {
    var level = Number(req.param('level'));
    sails.log.debug("findByLevel", level);
    if(level < 0 || level > 3)
      return res.serverError("wrong level: "+level);
    Nuts.find({level:level}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.json(data);
    });
  }
  // example: http://localhost:1338/nuts/findbycode?code=DE
  , findByCode: function (req, res, next) {
    var code = req.param('code');
    sails.log.debug("findByCode", code);
    if(!code) return res.serverError("wrong code: "+code);
    Nuts.find({nutscode:code}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.json(data);
    });
  }
}
