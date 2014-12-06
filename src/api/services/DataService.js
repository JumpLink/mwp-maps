var extend = require('node.extend');

async.objectMapSeries = function ( obj, drag, func, cb ) {
  if(!obj) return cb( null, {} );
  var i, arr = [], keys = Object.keys( obj );
  for ( i = 0; i < keys.length; i += 1 ) {
    var wrapper = {};
    wrapper[keys[i]] = obj[keys[i]];
    // wrapper = obj[keys[i]];
    wrapper.drag = drag;
    arr[i] = wrapper;
  }
  this.mapSeries( arr, func, function( err, data ) {
    if ( err ) { return cb( err ); }
    var res = {};
    for ( i = 0; i < data.length; i += 1 ) {
        res[keys[i]] = data[i];
    }
    return cb( err, res );
  });
}

async.objectMap = function ( obj, drag, func, cb ) {
  if(!obj) return cb( null, {} );
  var i, arr = [], keys = Object.keys( obj );
  for ( i = 0; i < keys.length; i += 1 ) {
    var wrapper = {};
    wrapper[keys[i]] = obj[keys[i]];
    // wrapper = obj[keys[i]];
    wrapper.drag = drag;
    arr[i] = wrapper;
  }
  this.map( arr, func, function( err, data ) {
    if ( err ) { return cb( err ); }
    var res = {};
    for ( i = 0; i < data.length; i += 1 ) {
        res[keys[i]] = data[i];
    }
    return cb( err, res );
  });
}

var findAndSaveImports = function (callback) {
  sails.log.info("find and save imports..");
  var updateDatabase = function (data, callback) {
    Data.find({nutscode: data.target}).exec(function found(err, found) {
      if (err) callback(err);
      if (found instanceof Array) found = found[0];

      var result = {
        nutscode: data.target,
        imports: {}
      }
      result.imports[data.source] = {};
      result.imports[data.source][data.year] = data.value;

      if(found) {
        extend(true, found, result);
        // sails.log.debug("found", found);
        Data.update(found.id, found).exec(function updated (err, data) {
          if (err) return callback(err);
          if (data instanceof Array) data = data[0];
          Data.publishUpdate(found.id, result);
          callback(null, data);
        });
      } else {
        // sails.log.error("not found", result);
        Data.create(result).exec(function created (err, data) {
          if (err) return callback(err);
          Data.publishCreate(data);
          callback(null, data);
        });
      }
    });
  }

  var exportsYearIterator = function (yearVal, callback) {
    var result = yearVal.drag;
    delete yearVal.drag;
    result.year = Object.keys(yearVal)[0];
    result.value = yearVal[result.year];
    // sails.log.debug("exportsYearIterator", result);
    updateDatabase(result, callback);
  }

  var exportsIterator = function (exportVal, callback) {
    // sails.log.debug("exportsIterator", exportVal);
    var result = {
      source: exportVal.drag,
      target: Object.keys(exportVal)[0]
    }
    // sails.log.debug(result.target, exportVal[result.target]);
    async.objectMapSeries(exportVal[result.target], result, exportsYearIterator, callback);
  }

  var dataIterator = function (data, callback) {
    // sails.log.debug("dataIterator", data);
    async.objectMapSeries(data.exports, data.nutscode, exportsIterator, callback);
  }

  // Find All
  Data.find({}).exec(function found(err, data) {
    if (err) return callback(err);
    // sails.log.debug(data);
    async.map(data, dataIterator, callback);
  });
}

module.exports = {
  findAndSaveImports:findAndSaveImports
}
