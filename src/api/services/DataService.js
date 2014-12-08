/*
 * Get index of "array" of objects with property "propertyname" that is equal to "value"
 * return: -1 if no index was found, otherwise the index
 */
var indexOfProperty = function (array, propertyname, value) {
  var found = false;
  var index = -1;
  if(!array) return index;
  for (var i = 0; i < array.length && index == -1; i++) {
    if(array[i][propertyname] === value) {
      index = i;
    }
  };
  return index;
}

/*
 * merged tow timelines
 * return: union of the years of a and b, a year occurs only once
 */
var mergeTimelines = function (a, b) {
  for (var i = 0; i < b.length; i++) {
    var index = indexOfProperty(a, 'year', b[i].year);
    // if index === -1: year from b is not in a, so we can add this year to a
    if(index === -1) {
      a.push(b[i]);
    } else {
      // Do nothing or replace year value?
    }
  };
  return a;
}

/*
 *  merge two objects with the properties "nutscode", "level", "timeline" and "exports" or "imports"
 */
var mergeData = function (a, b, exportsOrImports) {
  if(!a[exportsOrImports]) a[exportsOrImports] = [];
  if(!b[exportsOrImports]) b[exportsOrImports] = [];
  if(b[exportsOrImports].length !== 1) sails.log.error("mergeData: b["+exportsOrImports+"] must be an array with length 1");
  var index = indexOfProperty(a[exportsOrImports], 'nutscode', b[exportsOrImports][0].nutscode);
  if(index !== -1) {
    // sails.log.debug("!a[exportsOrImports][index]", a[exportsOrImports][index]);
    if(!a[exportsOrImports][index].timeline) a[exportsOrImports][index].timeline = [];
    if(!b[exportsOrImports][0].timeline) b[exportsOrImports][0].timeline = [];
    // nutscode already in this array, so merge timeline
    a[exportsOrImports][index].timeline = mergeTimelines(a[exportsOrImports][index].timeline, b[exportsOrImports][0].timeline)
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
