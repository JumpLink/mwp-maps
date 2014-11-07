module.exports = {
  // example: http://localhost:1338/feature/import
  import: function (req, res, next) {
    var importIterator = function (feature, callback) {
      sails.log.debug("importIterator", feature);
      ModelService.updateOrCreate('Feature', feature, {id:feature.id}, callback);
    };
    var featureIterator = function (geojson, callback) {
      // sails.log.debug("featureIterator", geojson);
      async.mapSeries(geojson.features, importIterator, callback);
    };
    var mapGeojsons = function (geojsons, callback) {
      // sails.log.debug("mapGeojson", geojsons);
      async.mapSeries(geojsons, featureIterator, callback);
    };
    Geojson.find({}).exec(function found (error, geojsons) {
      // sails.log.debug("Geojson.find({})", error, geojsons);
      if (error) return res.serverError(error);
      mapGeojsons(geojsons, function(error, result) {
        if (error) return res.serverError(error);
        res.ok();
      });
    });
    sails.log.debug("feature/import");
  }
  // example: http://localhost:1338/feature/findbyhasc
  , findByHasc: function (req, res, next) {
    var hasc = req.param('hasc');
    sails.log.debug("feature/findByHasc", hasc);
    if(!hasc) return res.serverError("wrong hasc: "+hasc);
    Feature.find({ where: {'properties.hasc':hasc}}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.json(data);
    });
    // Feature.native(function(err, collection) {
    //   // Handle Errors
    //   collection.find({'properties.hasc':hasc}).done(function(error, docs) {
    //     // Handle Errors
    //     // Do mongo-y things to your docs here
    //   });
    // });
  }
  , findAll: function (req, res, next) {
    sails.log.debug('feature/findAll');
    Feature.find({ limit:0 }).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.json(data);
    });
  }
}
