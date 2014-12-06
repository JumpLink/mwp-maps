var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var UPLOAD_FOLDER =  path.normalize(__dirname+'/../../.tmp/uploads');
var csv = require('csv');
var extend = require('node.extend');

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
    DataService.findAndSaveImports( function(error, data) {
      if (error) return res.error(error);
      else return res.json(data);
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

      var validateAndTransform = function (data, callback) {

        if (!data.export_nuts3) callback("export_nuts3 not set");
        if (!data.import_nuts3) callback("import_nuts3 not set");
        if (!data.year) callback("year not set");
        if (!data.value) callback("value not set");

        data.nutscode = data.export_nuts3;

        if(!data.exports) data.exports = {};
        if(!data.exports[data.import_nuts3]) data.exports[data.import_nuts3] = {};
        if(!data.exports[data.import_nuts3][data.year]) data.exports[data.import_nuts3][data.year] = Number(data.value.replace(/ /g, '').replace(/,/g , '.'));

        delete data.export_nuts3;
        delete data.import_nuts3;
        delete data.year;
        delete data.value;

        callback(null, data);
      }

      var saveToDatabaseIterator = function (data, callback) {

        validateAndTransform(data, function (error, data) {
          if (err) return callback(err);
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
        });
      }

      var convertFileIterator = function (file, callback) {
        file.uploadedAs = path.basename(file.fd);
        // sails.log.debug(file);
        fs.readFile(file.fd, 'utf8', function(err, data) {
          if (err) return res.serverError(err);
          csv.parse(data, {'columns':true}, function(err, columns) {
            // sails.log.debug(data);
            async.mapSeries(columns, saveToDatabaseIterator, function(err, result){
              // sails.log.debug("toDatabaseSaved")
              callback(err, result);
            });
          });
        });
      }

      async.map(files, convertFileIterator, function(err, files) {
        if (err) return res.error(err);
        DataService.findAndSaveImports( function(error, data) {
          if (err) return res.error(err);
          var result = {
            message: files.length + ' file(s) uploaded successfully!',
            findAndSaveImports: data
          };
          // sails.log.debug(result);
          return res.json(result);
        });
      });
    });
  }
}
