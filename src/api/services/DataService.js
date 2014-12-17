/*
 * Get index of "array" of objects with property "propertyname" that is equal to "value"
 * return: -1 if no index was found, otherwise the index
 */
var indexOfProperty = function (array, propertyname, value) {
  if (!array || !(array instanceof Array) || array.length <= 0) {
    sails.log.warn('No array provided.', 'propertyname', propertyname, 'value', value);
    return -1;
  }
  if(typeof array[0][propertyname] === 'undefined') {
    sails.log.error('Array has no property "'+propertyname+'"');
    sails.log.error(array);
    return -1;
  }
  var index = -1;

  for (var i = 0; i < array.length && index === -1; i++) {
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
 * Find dublicate property "propertyname" in the same array "datas" and do somethin (e.g. merge) them with "doFunc"
 */
var findDuplicatePropertyDo = function (datas, propertyname, doFunc) {
  var result = [];
  for (var i = 0; i < datas.length; i++) {
    // check if propertyname already exists in result, if yes push this new value to result, otherwise merge the existing entry with the new one
    var index = indexOfProperty(result, propertyname, datas[i][propertyname]);
    if(index === -1) {
      // code occurs only once, accept the value
      result.push(datas[i]);
    } else {
      // merge founded duplicate
      sails.log.debug("merge founded duplicate property "+propertyname, result[index], datas[i]);
      result[index] = doFunc(result[index], datas[i]);
    }
  };
  return result;
}

/*
 * Merge two objects with the properties "nutscode", "level", "timeline" and "exports" or "imports"
 * Note: b.exports or b.imports must be an array with length 1
 */
var mergeDataDeprecated = function (a, b, exportsOrImports) {
  if(!a[exportsOrImports]) a[exportsOrImports] = [];
  if(!b[exportsOrImports]) b[exportsOrImports] = [];
  if(b[exportsOrImports].length !== 1) sails.log.error("mergeDataDeprecated: b["+exportsOrImports+"] must be an array with length 1");
  var index = indexOfProperty(a[exportsOrImports], 'nutscode', b[exportsOrImports][0].nutscode);
  if(index !== -1) {
    // sails.log.debug("!a[exportsOrImports][index]", a[exportsOrImports][index]);
    if(!a[exportsOrImports][index].timeline) a[exportsOrImports][index].timeline = [];
    if(!b[exportsOrImports][0].timeline) b[exportsOrImports][0].timeline = [];
    // nutscode already in this array, so merge timeline
    a[exportsOrImports][index].timeline = union(a[exportsOrImports][index].timeline, b[exportsOrImports][0].timeline, "timeline")
    // a[exportsOrImports][index].timeline = union(a[exportsOrImports][index], b[exportsOrImports][0], "timeline")
  } else {
    a[exportsOrImports] = a[exportsOrImports].concat(b[exportsOrImports]);
  }
  return a;
}

/*
 * trim nutscodes of data.nutscode, data.exports.nutscode.
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
 * type: if "union" unite export / import data (union set), if "sum" sum up,
 */
mergeTimeline = function (a, b, type) {
  if(a.year !== b.year) {
    a.error = "Merge timeline with different years not allowed";
    sails.log.error(a.error, a.year, b.year);
    return a;
  }

  switch (type) {
    case 'union':
      a.value += b.value;
    break;
    case 'sum':
      a.value += b.value;
    break;
  }

  return a;
}

sumTimeline = function (a, b) {
  return mergeTimeline(a, b, 'sum');
}

unionTimeline = function (a, b) {
  return mergeTimeline(a, b, 'union');
}

/*
 * Merge (union or sun up) data with properties "nutscode", "origins" and "timeline" if the nutscode is the same
 * type: if "union" unite export / import data (union set), if "sum" sum up, if "amount" ..
 */
mergeExportOrImport = function (a, b, type) {
  sails.log.debug("mergeExportOrImport", a, b);
  if(a.nutscode !== b.nutscode) {
    a.error = "Merge export or import with different nutscodes not allowed";
    sails.log.error(a.error, a.nutscode, b.nutscode);
    return a;
  }

  // if(a.nutscode === "DE12") {
  //   sails.log.warn("mergeExportOrImport DE12");
  //   sails.log.warn(a);
  //   sails.log.warn(b);
  // }

  a.timeline = a.timeline.concat(b.timeline);

  switch (type) {
    case 'union':
      // origins: do nothing, origins are the same on union set
      a.timeline = findDuplicatePropertyDo(a.timeline, 'year', unionTimeline);
    break;
    case 'sum':
       a.origins = a.origins.concat(b.origins);
       a.timeline = findDuplicatePropertyDo(a.timeline, 'year', sumTimeline);
    break;
  }

  // if(a.nutscode === "DE12") {
  //   sails.log.warn("RESULT mergeExportOrImport DE12");
  //   sails.log.warn(a);
  // }

  return a;
}

sumExportOrImport = function (a, b) {
  return mergeExportOrImport(a, b, 'sum');
}

unionExportOrImport = function (a, b) {
  return mergeExportOrImport(a, b, 'union');
}

/*
 * Sum data with properties "nutscode", "level", "exports" and "imports"
 * type: if "union" unite export / import data (union set), if "sum" sum up,
 */
mergeData = function (a, b, type) {
  if(a.nutscode !== b.nutscode) {
    a.error = "Merge data with different nutscodes not allowed";
    sails.log.error(a.error);
    return a;
  }
  if(a.level !== b.level) {
    a.error = "Merge data with levels nutscodes not allowed";
    sails.log.error(a.error);
    return a;
  }

  // if(a.nutscode === "DE30") {
  //   sails.log.warn("sumData DE30");
  //   sails.log.warn(a);
  //   sails.log.warn(b);
  // }

  // just merge origins if they exists
  if(a.id && !b.id) {
    if(!a.origins) a.origins = [];
    if(!b.origins) b.origins = [];
    a.origins = a.origins.concat(b.origins);
  }

  // just merge origins if they exists
  if(a.origins || b.origins) {
    if(!a.origins) a.origins = [];
    if(!b.origins) b.origins = [];
    a.origins = a.origins.concat(b.origins);
  }

  // EXPORTS
  if(!a.exports) a.exports = [];
  if(!b.exports) b.exports = [];
  a.exports = a.exports.concat(b.exports);

  // IMPORTS
  if(!a.imports) a.imports = [];
  if(!b.imports) b.imports = [];
  a.imports = a.imports.concat(b.imports);

  switch (type) {
    case 'union':
      a.exports = findDuplicatePropertyDo(a.exports, 'nutscode', unionExportOrImport);
      a.imports = findDuplicatePropertyDo(a.imports, 'nutscode', unionExportOrImport)
    break;
    case 'sum':
      a.exports = findDuplicatePropertyDo(a.exports, 'nutscode', sumExportOrImport);
      a.imports = findDuplicatePropertyDo(a.imports, 'nutscode', sumExportOrImport)
    break;
  }

  if(a.exports.length === 0) {
    delete a.exports;
  }

  if(a.imports.length === 0) {
    delete a.imports;
  }

  return a;
}

sumData = function (a, b) {
  return mergeData(a, b, 'sum');
}

unionData = function (a, b) {
  return mergeData(a, b, 'union');
}

/*
 * Update if nutscode is found in database, otherwise create a new entry with nutscode
 */
var updateOrCreate = function (item, callback) {
  // sails.log.debug("updateOrCreate", item);
  ModelService.updateOrCreate('Data', item, {nutscode:item.nutscode}, callback);
}

/*
 * Update each data in datas array
 */
var updateEach = function (datas, callback) {
  ModelService.updateEach('Data', datas, callback);
}

var updateOrCreateEach = function (datas, propertyName, callback, extendFound) {
  ModelService.updateOrCreateEach('Data', datas, propertyName, callback, extendFound);

  // if (!datas) {
  //   return callback('No data provided.');
  // }
  // if (!propertyName) {
  //   return callback('No property name provided.');
  // }

  // var iterator = function (data, callback) {
  //   var query = {};
  //   query[propertyName] = data[propertyName];
  //   updateOrCreate(modelName, data, query, callback, extendFound)
  // }

  // async.mapSeries(datas, iterator, callback);
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
            nutscode: foundDatas[i].exports[k].nutscode,            // import source / export target
            level: foundDatas[i].level,
            // exports: foundDatas[i].exports,                         // Do not remove / overwrite exports
            imports: [{
              nutscode: foundDatas[i].nutscode,                     // import target / export source
              timeline: foundDatas[i].exports[k].timeline
            }]
          };

          var index = indexOfProperty(newImports, 'nutscode', newImport.nutscode);
          if(index === -1) {
            newImports.push(newImport);
          } else {
            // newImports[index] = mergeDataDeprecated(newImports[index], newImport, 'imports');
            newImports[index] = unionData(newImports[index], newImport);
          }
        };
      }
    };
    updateOrCreateEach(newImports, 'nutscode', callback, true);
  });
}

/*
 * Generate nuts2 data from nuts3 data. sum up imports and exports as long as nessesary
 */
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
          // sumed data
          var sumedData = findDuplicatePropertyDo(trimedData, 'nutscode', sumData);
          sails.log.debug("sumedData", sumedData);
          callback(null, sumedData)
        },
        function(mergedData, callback){
          async.map(mergedData, updateOrCreate, callback);
        }
    ], callback);
  });
}

/*
 * Insert for imformation for the nuts, e.g. hasc, parents, childs and so on..
 */
var insertInfos = function (callback) {

  var updateNut = function (item, callback) {
    Nuts.find({nutscode: item.nutscode}).exec(function found(err, found) {
      if (err) return callback(err);
      if (found instanceof Array) found = found[0];
      if (!found) {
        sails.log.warn("not found", item, found)
        return callback();
      }

      if (found.hasc) item.hasc = found.hasc;
      if (found.countrycode) item.countrycode = found.countrycode;
      if (found.parent) item.parent = found.parent;
      if (found.childs) item.childs = found.childs;

      Data.update(item.id, item).exec(function updated (err, data) {
        if (err) return callback(err);
        if (data instanceof Array) data = data[0];
        Data.publishUpdate(data.id, data);
        return callback(null, data);
      });

    });
  }

  Data.find({}).exec(function found(err, foundDatas) {
    if (err) return callback(err);
    async.map(foundDatas, updateNut, callback);
  });
}

/*
 * Generate new property for each level that represents the amount of all exports/imports for the current nutscode
 */
var sumExportImport = function (callback) {

  var sumPorts = function (ports) {
    // sails.log.debug("sumPorts", ports)
    var result = {};
    for (var i = 0; i < ports.length; i++) {
      var port = ports[i];
      for (var k = 0; k < port.timeline.length; k++) {
        var portOnTime = port.timeline[k];
        if(typeof result[portOnTime.year] === 'undefined') {
          result[portOnTime.year] = 0;
        }
        result[portOnTime.year] += Number(portOnTime.value);
        result[portOnTime.year] = Number(parseFloat(result[portOnTime.year]).toFixed(2)); // Round to at most 2 decimal places
      };
    };
    return result;
  }

  var updateNut = function (item, callback) {

    // sails.log.debug("updateNut", item.nutscode);

    if(item && item.imports && item.imports instanceof Array && item.imports.length > 0) {
      item.importamount = sumPorts(item.imports);
    }

    if(item && item.exports && item.exports instanceof Array && item.exports.length > 0) {
      item.exportamount = sumPorts(item.exports);
    }

    Data.update(item.id, item).exec(function updated (err, data) {
      if (err) return callback(err);
      if (data instanceof Array) data = data[0];
      // sails.log.debug("updated", data);
      Data.publishUpdate(data.id, data);
      return callback(null, data);
    });
  }

  Data.find({}).exec(function found(err, foundDatas) {
    if (err) return callback(err);
    async.map(foundDatas, updateNut, callback);
  });
}

module.exports = {
  findAndSaveImports:findAndSaveImports,
  generateLevel2: generateLevel2,
  indexOfProperty: indexOfProperty,
  mergeDataDeprecated: mergeDataDeprecated,
  sumData: sumData,
  unionData: unionData,
  updateOrCreate: updateOrCreate,
  updateEach: updateEach,
  insertInfos: insertInfos,
  sumExportImport: sumExportImport
}
