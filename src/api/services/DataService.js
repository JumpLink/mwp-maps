var indexOfProperty = function (array, propertyname, value, exportsOrImports) {
  var found = false;
  var index = -1;
  if(!array[exportsOrImports]) return index;
  for (var i = 0; i < array[exportsOrImports].length && index == -1; i++) {
    if(array[exportsOrImports][i][propertyname] === value) {
      index = i;
    }
  };
  return index;
}

var mergeData = function (a, b, exportsOrImports) {
  if(!a[exportsOrImports]) a[exportsOrImports] = [];
  if(!b[exportsOrImports]) b[exportsOrImports] = [];

  if(b[exportsOrImports].length !== 1) sails.log.error("mergeData: b["+exportsOrImports+"] must be an array with length 1");
  var index = indexOfProperty(a, 'nutscode', b[exportsOrImports][0].nutscode, exportsOrImports);

  // sails.log.debug("mergeData", "a", a, "b", b, "exportsOrImports", '"'+exportsOrImports+'"', "index", index);

  if(index !== -1) {
    // sails.log.debug("!a[exportsOrImports][index]", a[exportsOrImports][index]);
    if(!a[exportsOrImports][index].timeline) a[exportsOrImports][index].timeline = [];
    if(!b[exportsOrImports][0].timeline) b[exportsOrImports][0].timeline = [];
    // nutscode already in this array, so concat timeline
    a[exportsOrImports][index].timeline = a[exportsOrImports][index].timeline.concat(b[exportsOrImports][0].timeline);
  } else {
    a[exportsOrImports] = a[exportsOrImports].concat(b[exportsOrImports]);
  }
  return a;
}

var findAndSaveImports = function (callback) {
  sails.log.info("find and save imports..");
  var updateDatabase = function (data, callback) {

    var newVal = {
      nutscode: data.target,    // the export target is the import source of this result
      imports: [{
        nutscode: data.source,  // the export source is the imported nutscode / target of this result
        timeline: data.timeline
      }]
    };

    // search for the export target
    Data.find({nutscode: data.target}).exec(function found(err, found) {
      if (err) callback(err);
      if (found instanceof Array) found = found[0];
      if(found && found.id) {

        found = mergeData(found, newVal, 'imports');

        Data.update(found.id, found).exec(function updated (err, data) {
          if (err) return callback(err);
          if (data instanceof Array) data = data[0];
          Data.publishUpdate(found.id, found);
          callback(null, data);
        });
      } else {
        // sails.log.error("not found", result);
        Data.create(newVal).exec(function created (err, data) {
          if (err) return callback(err);
          Data.publishCreate(data);
          callback(null, data);
        });
      }
    });
  }

  var dataIterator = function (data, callback) {
    sails.log.debug("dataIterator", data);

    var exportsIterator = function (source, item, callback) {
      sails.log.debug("exportsIterator", "source", source, "item", item)
      var context = {
        source: source,           // export source
        target: item.nutscode,    // export target
        timeline: item.timeline
      }

      var exportsTimelineIterator = function (context, time, callback) {
        sails.log.debug("exportsTimelineIterator", "context", context, "item", item)
        context.year = time.year;
        context.value = time.value
        updateDatabase(context, callback);
      }.bind(null, context);

      async.mapSeries(context.timeline, exportsTimelineIterator, callback);
    }.bind(null, data.nutscode);

    if(data.exports) {
      async.mapSeries(data.exports, exportsIterator, callback);
    } else {
      sails.log.warn("No exports to iterate", data);
      callback(null, []);
    }

  }

  // Find All
  Data.find({}).exec(function found(err, data) {
    if (err) return callback(err);
    // sails.log.debug(data);
    async.map(data, dataIterator, callback);
  });
}

var generateSum = function (callback) {

}

module.exports = {
  findAndSaveImports:findAndSaveImports,
  generateSum: generateSum,
  indexOfProperty: indexOfProperty,
  mergeData: mergeData
}
