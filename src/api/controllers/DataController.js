var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var UPLOAD_FOLDER =  path.normalize(__dirname+'/../../.tmp/uploads');
var csv = require('csv');
var extend = require('node.extend');

module.exports = {

  /*
   * Remove all data from data database
   */
  destroyAll: function (req, res, next) {
    sails.log.info("destroy all data..");
    Data.destroy({}).exec(function destroyed (error, data) {
      if (error) return res.serverError(error);
      res.ok();
    });
  }

  /*
   * Update "data" with "id" on data database
   */
  , update: function (req, res, next) {
    var id = req.param('id');
    var data = req.params.all();
    Data.update({id:id},data).exec(function update(err,updated){
      Data.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
    });
  }

  , findByLevel: function (req, res) {
    var level = Number(req.param('level'));
    Data.find({level:level}).exec(function found(err, found) {
      if (err) return callback(err);
      else return res.json(found);
    });
  }

  , findAndSaveImports: function (req, res) {
    DataService.findAndSaveImports( function(error, data) {
      if (error) return res.serverError(error);
      else return res.json(data);
    });
  }

  /*
   * Function to upload a csv with "export_nuts3" "import_nuts3" "year" and "value".
   * After the upload the csv will be parsed, validated, transformed and saved to database.
   */
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

        if (typeof data.export_nuts3 !==  'undefined' && typeof data.export_nuts2 !== 'undefined' && typeof data.export_nuts1 !== 'undefined' && typeof data.export_nuts0 !== 'undefined' ) return callback("export_nutsX not set", data);
        if (typeof data.import_nuts3 !==  'undefined' && typeof data.import_nuts2 !== 'undefined' && typeof data.import_nuts1 !== 'undefined' && typeof data.import_nuts0 !== 'undefined' ) return callback("import_nutsX not set", data);
        if (!data.year) return callback("year not set");
        if (!data.value) return callback("value not set");

        if(typeof data.export_nuts3 !== 'undefined'  && typeof data.import_nuts3 !== 'undefined') {
          data.level = 3;
          data.nutscode = data.export_nuts3;
          delete data.export_nuts3;

          data.exports = [{
            nutscode: data.import_nuts3,
          }];
          delete data.import_nuts3;
        } else if(typeof data.export_nuts2 !== 'undefined' && typeof data.import_nuts2 !== 'undefined') {
          data.level = 2;
          data.nutscode = data.export_nuts2;
          delete data.export_nuts2;

          data.exports = [{
            nutscode: data.import_nuts2,
          }];
          delete data.import_nuts2;
        } else if(typeof data.export_nuts1 !== 'undefined' && typeof data.import_nuts1 !== 'undefined') {
          data.level = 1;
          data.nutscode = data.export_nuts1;
          delete data.export_nuts1;

          data.exports = [{
            nutscode: data.import_nuts1,
          }];
          delete data.import_nuts1;
        } else if(typeof data.export_nuts0 !== 'undefined' && typeof data.import_nuts0 !== 'undefined') {
          data.level = 0;
          data.nutscode = data.export_nuts0;
          delete data.export_nuts0;

          data.exports = [{
            nutscode: data.import_nuts0,
          }];
          delete data.import_nuts0;
        } else {
          return callback("export_nutsX and import_nutsX must be the same nutslevel")
        }

        data.exports[0].timeline = [{
          year: data.year,
          // transform german notation of number
          value: Number(data.value.replace(/\./g , '').replace(/ /g, '').replace(/,/g , '.'))
        }];
        delete data.year;
        delete data.value;

        sails.log.debug("validateAndTransform", data);

        callback(null, data);
      }

      var saveToDatabaseIterator = function (data, callback) {

        validateAndTransform(data, function (err, data) {
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
              // found = DataService.mergeDataDeprecated(found, data, 'exports');
              sails.log.debug("Found!", found, data);
              found = DataService.unionData(found, data);
              sails.log.debug("Found merged", found);
              Data.update(found.id, found).exec(function updated (err, data) {
                if (err) return callback(err);
                if (data instanceof Array) data = data[0];
                // sails.log.debug("update", err, data);

                Data.publishUpdate(found.id, found);
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
          csv.parse(data, {columns:true}, function(err, columns) {
            sails.log.debug(columns);
            async.mapSeries(columns, saveToDatabaseIterator, function(err, result){
              // sails.log.debug("toDatabaseSaved")
              callback(err, result);
            });
          });
        });
      }

      Data.destroy({}).exec(function destroyed (err, data) {
        if (err) return res.serverError(err);
        sails.log.info("destroy all data finish");
        async.map(files, convertFileIterator, function(err, files) {
          if (err) {
            sails.log.error(err, files);
            // process.exit(1);
            return res.serverError(err);
          }
          sails.log.info("convert files finish");
          DataService.findAndSaveImports( function(err, data) {
            // if (err) return res.serverError(err);
            sails.log.info("findAndSaveImports finish");
            // DataService.generateLevel2( function (err, data) {
              if (err) {
                sails.log.error(err, data);
                // process.exit(1);
                return res.serverError(err);
              }
              var result = {
                message: files.length + ' file(s) uploaded successfully!',
              };
              // sails.log.debug(result);
              return res.json(result);
            // });
          });
        });
      });
    });
  },

  /*
   * Generates the sum from nuts3 for nuts2
   */
  generateLevel2: function (req, res, next) {
    DataService.generateLevel2(function (err, result) {
      if (err) return res.serverError(err);
      else return res.json(result);
    });
  }

}
