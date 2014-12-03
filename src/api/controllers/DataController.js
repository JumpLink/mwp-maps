var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var UPLOAD_FOLDER =  path.normalize(__dirname+'/../../.tmp/uploads');
var csv = require('csv');
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

// // http://stackoverflow.com/questions/7440001/iterate-over-object-keys-in-node-js
// async.forEach = function(o, cb) {
//   var counter = 0,
//     keys = Object.keys(o),
//     len = keys.length;
//   var next = function() {
//     if (counter < len) cb(o[keys[counter++]], next);
//   };
//   next();
// };

module.exports = {

  destroyAll: function (req, res, next) {
    sails.log.info("destroy all data..");
    Data.destroy({}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.ok();
    });
  }

  , update: function (req, res, next) {
    var id = req.param('id');
    var data = req.params.all();
    Data.update({id:id},data).exec(function update(err,updated){
      Data.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
    });
  }

  , findAndSaveImports: function (req, res) {
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
      if (err) return res.error(err);
      // sails.log.debug(data);
      async.map(data, dataIterator, function(err, data) {
        if (err) return res.error(err);
        return res.json(data);
      });

    });



  }

  , upload: function (req, res) {
    sails.log.debug("data/upload",req._fileparser.form);

    // WORKAROUND for BUG https://github.com/balderdashy/skipper/issues/36
    if(req._fileparser.form.bytesExpected > 10000000) {
      sails.log.error('File exceeds maxSize. Aborting.');
      req.connection.destroy();
      return res.end('File exceeds maxSize. Aborting.'); // This doesn't actually get sent, so you can skip this line.
    }

    req.file("file").upload(function (err, files) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      }

      var validateAndTransform = function (data) {

        data.nutscode = data.export_nuts3;

        if( !data.exports ) data.exports = {};

        if( !data.exports[data.import_nuts3] ) data.exports[data.import_nuts3] = {};

        if( !data.exports[data.import_nuts3][data.year] ) data.exports[data.import_nuts3][data.year] = Number(data.value.replace(/ /g, '').replace(/,/g , '.'));

        delete data.export_nuts3;
        delete data.import_nuts3;
        delete data.year;
        delete data.value;

        return data;
      }

      var saveToDatabaseIterator = function (data, callback) {

        data = validateAndTransform(data);

        var query = {
          nutscode: data.nutscode
        };

        Data.find(query).exec(function found(err, found) {
          if (err) return callback(err);
          if (found instanceof Array) found = found[0];

          // not found
          if (!found || found.length <= 0) {

            sails.log.debug("Not found!", found, data);

            Data.create(data).exec(function created (err, data) {
              if (err) return callback(err);
              // sails.log.debug("created", err, data);
              Data.publishCreate(data);
              return callback(null, data);
            });
          // found
          } else {

            // extend found result with new data
            extend(true, found, data);

            sails.log.debug("Found!", found, data);

            Data.update(found.id, found).exec(function updated (err, data) {
              if (err) return callback(err);
              if (data instanceof Array) data = data[0];
              // sails.log.debug("update", err, data);

              Data.publishUpdate(data.id, data);
              // sails.log.debug("publishUpdate", data.id, data);

              return callback(null, data);
            });
          }
        });
      }

      var convertFileIterator = function (file, callback) {
        file.uploadedAs = path.basename(file.fd);
        // sails.log.debug(file);
        fs.readFile(file.fd, 'utf8', function(err, data) {
          if (err) return res.serverError(err);
          csv.parse(data, {'columns':true}, function(err, columns) {
            sails.log.debug(data);
            async.mapSeries(columns, saveToDatabaseIterator, function(err, result){
              // sails.log.debug("toDatabaseSaved")
              callback(err, result);
            });
          });
        });
      }

      async.map(files, convertFileIterator, function(err, files) {
        var result = {
          message: files.length + ' file(s) uploaded successfully!',
          // files: files
        };
        sails.log.debug(result);
        return res.json(result);
      });

    });
  }
}
