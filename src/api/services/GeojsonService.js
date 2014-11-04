var http = require('http');
var fs = require('fs');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();
var csv = require('csv');

var destroyAll = function (callback) {
  Geojson.destroy({}).exec(callback);
}

var importLevel0 = function (callback) {
  GeojsonService.importMapkey('custom/world-highres', callback);
}

var importLevel1 = function (callback) {
  //TODO more contries: http://code.highcharts.com/mapdata/
  var mapkeys = [
    'countries/af/af-all', // Afghanistan
    'countries/al/al-all', // Albania
    'countries/dz/dz-all', // Algeria
    'countries/as/as-all', // American Samoa
    'countries/ad/ad-all', // Andorra
    'countries/ao/ao-all', // Angola
    'countries/ag/ag-all', // Antigua and Barbuda
    'countries/ar/ar-all', // Argentina
    'countries/am/am-all', // Armenia
    'countries/au/au-all', // Australia
    'countries/at/at-all', // Austria
    'countries/az/az-all', // Azerbaijan
    // ..
    'countries/de/de-all', // Germany
    // ..
  ];

  var iterator = function (mapkey, callback) {
    GeojsonService.importMapkey(mapkey, callback);
  }

  async.map(mapkeys, iterator, callback);
}

var importLevel2 = function (callback) {
  //TODO more contries: http://code.highcharts.com/mapdata/
  var mapkeys = [
    'countries/de/de-bw-all',
    'countries/de/de-by-all',
    'countries/de/de-be-all',
    'countries/de/de-bb-all',
    'countries/de/de-hb-all',
    'countries/de/de-hh-all',
    'countries/de/de-he-all',
    'countries/de/de-mv-all',
    'countries/de/de-ni-all',
    'countries/de/de-nw-all',
    'countries/de/de-rp-all',
    'countries/de/de-sl-all',
    'countries/de/de-sn-all',
    'countries/de/de-st-all',
    'countries/de/de-sh-all',
    'countries/de/de-th-all',
  ];

  var iterator = function (mapkey, callback) {
    GeojsonService.importMapkey(mapkey, callback);
  }

  async.map(mapkeys, iterator, callback);
}

var importLevel3 = function (callback) {
  //TODO more contries: http://code.highcharts.com/mapdata/
  var mapkeys = [
    'countries/de/de-bw-all-all',
    'countries/de/de-by-all-all',
    'countries/de/de-be-all-all',
    'countries/de/de-bb-all-all',
    'countries/de/de-hb-all-all',
    'countries/de/de-hh-all-all',
    'countries/de/de-he-all-all',
    'countries/de/de-mv-all-all',
    'countries/de/de-ni-all-all',
    'countries/de/de-nw-all-all',
    'countries/de/de-rp-all-all',
    'countries/de/de-sl-all-all',
    'countries/de/de-sn-all-all',
    'countries/de/de-st-all-all',
    'countries/de/de-sh-all-all',
    'countries/de/de-th-all-all',
  ];

  var iterator = function (mapkey, callback) {
    GeojsonService.importMapkey(mapkey, callback);
  }

  async.map(mapkeys, iterator, callback);
}

// mapkey e.g.: 'custom/world-highres' | 'de-all-all' | 'countries/de/de-hh-all-all'
// available mapkeys: http://code.highcharts.com/mapdata/
var importMapkey = function (mapkey, callback) {

  validateFeature = function (feature, callback) {
    if(feature.properties['hc-group']) {
      switch (feature.properties['hc-group']) {
        case 'admin3':
          feature.properties.adminlevel = 3;
          feature.properties.nutslevel = 3; // TODO check this for other countries
        break;
        case 'admin2':
          feature.properties.adminlevel = 2;
          // nutslevel is NOT the same
        break;
        case 'admin1':
          feature.properties.adminlevel = 1;
          feature.properties.nutslevel = 1; // TODO check this for other countries
        break;
        case 'admin0':
          feature.properties.adminlevel = 0;
          feature.properties.nutslevel = 0;
        break;
      }
    }

    if(feature.properties['hc-key']) {


      feature.properties['hasc0'] = feature.properties['hc-key'].substring(0, 2).toUpperCase(); // die ersten beiden levelcodes im hc-key entsprechen dem von hasc

      if(feature.properties.adminlevel >= 1) {
        feature.properties['hasc1'] = feature.properties['hc-key'].substring(3, 5).toUpperCase();
      }

      switch(feature.properties.adminlevel) {
        case 0:
          if(feature.properties['hc-a2'])
            feature.properties['hasc0'] = feature.properties['hc-a2'];
          if(!feature.properties['hasc'])
            feature.properties['hasc'] = feature.properties['hasc0'];
        break;
        case 1:
          if(feature.properties['hc-a2'])
            feature.properties['hasc1'] = feature.properties['hc-a2'];
          if(!feature.properties['hasc'])
            feature.properties['hasc'] = feature.properties['hasc0'] + "." +feature.properties['hasc1'];
        break;
        case 2:
          if(feature.properties['hc-a2'])
            feature.properties['hasc2'] = feature.properties['hc-a2'];
          if(!feature.properties['hasc'])
            feature.properties['hasc'] = feature.properties['hasc0'] + "." +feature.properties['hasc1'] + "." + feature.properties['hasc2'];
        break;
        case 3:
          if(feature.properties['hc-a2'])
            feature.properties['hasc3'] = feature.properties['hc-a2'];
          if(!feature.properties['hasc'])
            feature.properties['hasc'] = feature.properties['hasc0'] + "." +feature.properties['hasc1'] + "." + feature.properties['hasc2']  + "." + feature.properties['hasc3'];;
        break;
      }
    }

    callback(null, feature);
  }

  var adminlevel = null; // highmaps-property for that is 'hc-group'
  var nutscode0 = null;
  var nutslevel = null;
  var nutscode = null;

  switch(mapkey) {
    case 'custom/world-highres':
      adminlevel = 0;
    break;
    // Deutschland mit allen Bundesländern
    case 'countries/de/de-all':
      adminlevel = 1;
      nutscode0 = 'DE';
    break;
    /*
     * Deutschland mit allen Bundesländern mit allen (ehemaligen) Landkreisen bzw. kreisfreie Städte
     * Beispiel München: "hc-key": "de-by-09184000"
     * Entspricht dritte bis fünfte Ziffer im AGS (Amtlicher Gemeindeschlüssel) aka Kreisschlüssel, identifiziert den Landkreis bzw. die kreisfreie Stadt, dem die Gemeinde angehör
     */
    case 'countries/de/de-all-all':
      adminlevel = 2;
      nutscode0 = 'DE';
    break;
    /*
     * Bundesland mit allen (ehemaligen) Landkreisen bzw. kreisfreie Städte, siehe oben.
     */
    case 'countries/de/de-bw-all':
    case 'countries/de/de-by-all':
    case 'countries/de/de-be-all':
    case 'countries/de/de-bb-all':
    case 'countries/de/de-hb-all':
    case 'countries/de/de-hh-all':
    case 'countries/de/de-he-all':
    case 'countries/de/de-mv-all':
    case 'countries/de/de-ni-all':
    case 'countries/de/de-nw-all':
    case 'countries/de/de-rp-all':
    case 'countries/de/de-sl-all':
    case 'countries/de/de-sn-all':
    case 'countries/de/de-st-all':
    case 'countries/de/de-sh-all':
    case 'countries/de/de-th-all':
      adminlevel = 2;
      nutscode0 = 'DE';
    break;
    /*
     * Bundesland mit allen Gemeinden, entspricht den letzten drei Ziffern im AGS
     */
    case 'countries/de/de-bw-all-all':
    case 'countries/de/de-by-all-all':
    case 'countries/de/de-be-all-all':
    case 'countries/de/de-bb-all-all':
    case 'countries/de/de-hb-all-all':
    case 'countries/de/de-hh-all-all':
    case 'countries/de/de-he-all-all':
    case 'countries/de/de-mv-all-all':
    case 'countries/de/de-ni-all-all':
    case 'countries/de/de-nw-all-all':
    case 'countries/de/de-rp-all-all':
    case 'countries/de/de-sl-all-all':
    case 'countries/de/de-sn-all-all':
    case 'countries/de/de-st-all-all':
    case 'countries/de/de-sh-all-all':
    case 'countries/de/de-th-all-all':
      adminlevel = 3;
      nutscode0 = 'DE';
    break;
  }

  switch (nutscode0) {
    case 'DE':
      switch (adminlevel) {
        case 1:
          nutslevel = 1; // admin level 1 entspricht dem nuts level 1 in Deutschland
          nutscode = 'DE'; // primary nutscode for this nutslevel
        case 2:
          // admin level 2 entspricht NICHT dem nuts level 2 in Deutschland TODO!
        break;
        case 3:
          nutslevel = 3; // admin level 3 entspricht dem nuts level 3 in Deutschland
        break;
      }
    break;
    default:
      switch (adminlevel) {
        case 0:
          nutslevel = 0; // admin level 0 entspricht dem nuts level 0 in allen Ländern
        break;
      }
    break;
  }

  var url = 'http://code.highcharts.com/mapdata/'+mapkey+'.geo.json';

  http.get(url, function(resp) {
      var body = '';

      resp.on('data', function(chunk) {
          body += chunk;
      });

      resp.on('end', function() {
          var geoJsonResponse = JSON.parse(body)
          sails.log.debug("Got response: ", geoJsonResponse);
          geoJsonResponse.mapkey = mapkey;
          if(adminlevel != null) {
            geoJsonResponse.adminlevel = adminlevel;
          }
          if(nutslevel != null) {
            geoJsonResponse.nutslevel = nutslevel;
          }
          if(nutscode0 != null) {
            geoJsonResponse.nutscode0 = nutscode0;
          }
          if(nutscode != null) {
            geoJsonResponse.nutscode = nutscode;
          }

          async.map(geoJsonResponse.features, validateFeature, function (error, features) {
            if (error) return callback(error);
            geoJsonResponse.features = features;

            ModelService.updateOrCreate('Geojson', geoJsonResponse, {mapkey:mapkey}, function (err, result) {
              sails.log.debug(err, result);
              if (err) return callback(err);
              callback(null, result);
            });

          });

      });
  }).on('error', function(err) {
      sails.log.error(err);
      return callback(err);
  });
}


module.exports = {
  destroyAll: destroyAll,
  importMapkey: importMapkey,
  importLevel0: importLevel0,
  importLevel1: importLevel1,
  importLevel2: importLevel2,
  importLevel3: importLevel3,
}
