var path = require('path');
var fs = require('fs-extra'); // Node.js: extra methods for the fs object: https://github.com/jprichardson/node-fs-extra
var UPLOAD_FOLDER =  path.normalize(__dirname+'/../../.tmp/uploads');
var csv = require('csv');

module.exports = {
  update: function (req, res, next) {
    var id = req.param('id');
    var data = req.params.all();
    Data.update({id:id},data).exec(function update(err,updated){
      Data.publishUpdate(updated[0].id, updated[0]);
      res.json(updated);
    });
  }
  , upload: function (req, res) {
    sails.log.debug("map/upload",req.file);

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

      var saveToDatabaseIterator = function (column, callback) {
        ModelService.updateOrCreate('Data', column, column.id, function (err, result) {
          // sails.log.debug(err, result);
          callback(err, result);
        });
      }

      var convertFileIterator = function (file, callback) {
        file.uploadedAs = path.basename(file.fd);
        sails.log.debug(file);
        fs.readFile(file.fd, 'utf8', function(err, data) {
          if (err) return res.serverError(err);
          csv.parse(data, {'columns':true}, function(err, columns) {
            // sails.log.debug(data);
            async.map(columns, saveToDatabaseIterator, function(err, result){
              // sails.log.debug("toDatabaseSaved")
              callback(err, result);
            });
          });
        });
      }

      async.map(files, convertFileIterator, function(err, files){
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
