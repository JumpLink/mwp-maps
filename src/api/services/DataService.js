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
 * union tow arrays with same property "propertyname".
 * Note: Multiple entries are NOT summed, multiple propertynames will be discarded.
 * return: union of the years of a and b, a year occurs only once
 */
var union = function (a, b, propertyname) {
  for (var i = 0; i < b.length; i++) {
    var index = indexOfProperty(a, propertyname, b[i][propertyname]);
    // if index === -1: year from b is not in a, so we can add this year to a
    if(index === -1) {
      a.push(b[i]);
    } else {
      // Do nothing or replace year value?
    }
  };
  return a;
}

var trimLastChar = function (str) {
  return str.substring(0, str.length - 1);
}

/*
 *  Find dublicate property "propertyname" in the same array "datas" and merge tham with "mergeFunc"
 */
var findDuplicatePropertyAndMerge = function (datas, propertyname, mergeFunc) {
  var result = [];
  for (var i = 0; i < datas.length; i++) {
    var index = indexOfProperty(result, propertyname, datas[i][propertyname]);
    if(index === -1) {
      // code occurs only once, accept the value
      result.push(datas[i]);
    } else {
      // merge founded duplicate
      result[index] = mergeFunc(result[index], datas[i]);
    }
  };
  return result;
}

/*
 * Merge two objects with the properties "nutscode", "level", "timeline" and "exports" or "imports"
 * Note: b.exports or b.imports must be an array with length 1
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
    a[exportsOrImports][index].timeline = union(a[exportsOrImports][index].timeline, b[exportsOrImports][0].timeline, "timeline")
  } else {
    a[exportsOrImports] = a[exportsOrImports].concat(b[exportsOrImports]);
  }
  return a;
}

/*
 * trim nutcodes of data.nutscode, data.exports.nutscode.
 * result may contain the same code multiple times, so these need to be summed next step.
 */
var trimDataIterator = function (data, callback) {
  data.origins = [data.nutscode];  // Ursprung
  data.nutscode = trimLastChar(data.nutscode);
  data.level--;
  delete data.id;

  if(data.exports) {
    for (var i = 0; i < data.exports.length; i++) {
      data.exports[i].origins = [data.exports[i].nutscode];
      data.exports[i].nutscode = trimLastChar(data.exports[i].nutscode);
    };
  }
  if(data.imports) {
    for (var i = 0; i < data.imports.length; i++) {
      data.imports[i].origins = [data.imports[i].nutscode];
      data.imports[i].nutscode = trimLastChar(data.imports[i].nutscode);
    };
  }

  callback(null, data);
}

/*
 * Merge data with properties "year" and "value"
 */
sumTimeline = function (a, b) {
  if(a.year !== b.year) {
    a.error = "Merge timeline with different years not allowed";
    sails.log.error(a.error, a.year, b.year);
    return a;
  }

  a.value += b.value;

  return a;
}

/*
 * Merge data with properties "nutscode" and "timeline"
 */
sumExportOrImport = function (a, b) {
  if(a.nutscode !== b.nutscode) {
    a.error = "Merge export or import with different nutcodes not allowed";
    sails.log.error(a.error, a.nutscode, b.nutscode);
    return a;
  }
  a.origins = a.origins.concat(b.origins);
  a.timeline = a.timeline.concat(b.timeline);
  a.timeline = findDuplicatePropertyAndMerge(a.timeline, 'year', sumTimeline);
  return a;
}

/*
 * Sum data with properties "nutscode", "level", "exports" and "imports"
 */
sumData = function (a, b) {
  if(a.nutscode !== b.nutscode) {
    a.error = "Merge data with different nutcodes not allowed";
    sails.log.error(a.error);
    return a;
  }
  if(a.level !== b.level) {
    a.error = "Merge data with levels nutcodes not allowed";
    sails.log.error(a.error);
    return a;
  }

  a.origins = a.origins.concat(b.origins);

  if(!a.exports) a.exports = [];
  if(!b.exports) b.exports = [];
  a.exports = a.exports.concat(b.exports);
  a.exports = findDuplicatePropertyAndMerge(a.exports, 'nutscode', sumExportOrImport);

  if(!a.imports) a.imports = [];
  if(!b.imports) b.imports = [];
  a.imports = a.imports.concat(b.imports);
  a.imports = findDuplicatePropertyAndMerge(a.imports, 'nutscode', sumExportOrImport)

  return a;
}

/*
 * Update if nutscode is found in database, otherwise create a new entry with nutscode
 */
var updateOrCreate = function (item, callback) {
  sails.log.debug("updateOrCreate", item);
  ModelService.updateOrCreate('Data', item, {nutscode:item.nutscode}, callback);
}

/*
 * Update each data in datas array
 */
var updateEach = function (datas, callback) {
  ModelService.updateEach('Data', datas, callback);
}

var updateOrCreateEach = function (datas, query, callback) {
  ModelService.updateOrCreateEach('Data', datas, query, callback);
}

/*
 * generate imports data from the exports data information and update the database with the new generated imports data.
 */
var findAndSaveImports = function (callback) {

  var newImports = [];
  // Find All
  Data.find({}).exec(function found(err, foundDatas) {
    if (err) return callback(err);
    for (var i = 0; i < foundDatas.length; i++) {
      // sails.log.debug(foundDatas[i]);
      if(foundDatas[i].exports) {
        for (var k = 0; k < foundDatas[i].exports.length; k++) {
          // sails.log.debug("foundDatas["+i+"].exports["+k+"]", foundDatas[i].exports[k]);
          var newImport = {
            nutscode: foundDatas[i].exports[k].nutscode,        // import source / export target
            level: 3,
            imports: [{
              nutscode: foundDatas[i].nutscode,                    // import target / export source
              timeline: foundDatas[i].exports[k].timeline
            }]
          };
          var index = indexOfProperty(newImports, 'nutscode', newImport.nutscode);
          if(index === -1) {
            newImports.push(newImport);
          } else {
            newImports[index] = mergeData(newImports[index], newImport, 'imports');
          }
        };
      }
    };
    updateOrCreateEach(newImports, 'nutscode', callback);
  });
}

var generateLevel2 = function (callback) {
  // Find All
  Data.find({level: 3}).exec(function found(err, data) {
    if (err) return callback(err);
    // sails.log.debug(data);

    async.waterfall([
        function trim (callback){
          async.map(data, trimDataIterator, callback);
        },
        function sum (trimedData, callback) {
          sails.log.debug("trimedData", trimedData);
          // merge data
          var mergedData = findDuplicatePropertyAndMerge(trimedData, 'nutscode', sumData);
          sails.log.debug("mergedData", mergedData);
          callback(null, mergedData)
        },
        function(mergedData, callback){
          async.map(mergedData, updateOrCreate, callback);
        }
    ], callback);
  });
}

module.exports = {
  findAndSaveImports:findAndSaveImports,
  generateLevel2: generateLevel2,
  indexOfProperty: indexOfProperty,
  mergeData: mergeData,
  updateOrCreate: updateOrCreate,
  updateEach: updateEach
}
