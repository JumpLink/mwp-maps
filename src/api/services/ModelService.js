// warn this creates each time a new id
var updateOrCreateResponse = function (modelName, findBy, req, res, next) {

  // Locate and validate name parameter
  var id = req.param(findBy);
  var data = req.params.all();
  if (!name) {
    return res.badRequest('No id provided.', findBy, name);
  }

  updateOrCreate(modelName, data, id, function (err, result) {
     if (err) return res.serverError(err);
     res.status(201);
     return res.json(result.toJson());
  });

}

// warn this creates each time a new id
var updateOrCreate = function (modelName, data, id, callback) {
  // sails.log.debug("updateOrCreate", modelName, data, id);
  // sails.log.debug("global[modelName]", global[modelName]);

  if (typeof id == 'undefined') {
    return callback('No id provided.');
  }
  if (!data) {
    return callback('No data provided.');
  }

  // Otherwise, find and destroy the global[modelName] in question
  global[modelName].find(id).exec(function found(err, found) {
    if (err) return callback(err);
    // sails.log.debug("found", err, found);
    // not found
    if (!found || found.length <= 0)
      global[modelName].create(data).exec(function created (err, data) {
        if (err) return callback(err);
        // sails.log.debug("created", err, data);
        global[modelName].publishCreate(data);
        return callback(null, data);
      });
    else {
      global[modelName].update(found.id, data).exec(function updated (err, data) {
        if (err) return callback(err);
        // sails.log.debug("update", err, data);
        global[modelName].publishUpdate(data.id, data);
        return callback(null, data);
      });
    }
  });
}

module.exports = {
  updateOrCreate: updateOrCreate,
  updateOrCreateResponse: updateOrCreateResponse
}
