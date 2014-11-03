var http = require('http');
var fs = require('fs');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();
var csv = require('csv');

// mapkey e.g.: 'custom/world-highres' | 'de-all-all' | 'countries/de/de-hh-all-all'
// available mapkeys: http://code.highcharts.com/mapdata/
var importMapkey = function (mapkey, callback) {
  var adminLevel = null; // highmaps-property for that is 'hc-group'
  var nutscode0 = null;
  var nutslevel = null;
  switch(mapkey) {
    case 'custom/world-highres':
      adminLevel = 0;
    break;
    // Deutschland mit allen Bundesländern
    case 'countries/de/de-all':
      adminLevel = 1;
      nutscode0 = 'DE';
    break;
    /*
     * Deutschland mit allen Bundesländern mit allen (ehemaligen) Landkreisen bzw. kreisfreie Städte
     * Beispiel München: "hc-key": "de-by-09184000"
     * Entspricht dritte bis fünfte Ziffer im AGS (Amtlicher Gemeindeschlüssel) aka Kreisschlüssel, identifiziert den Landkreis bzw. die kreisfreie Stadt, dem die Gemeinde angehör
     */
    case 'countries/de/de-all-all':
      adminLevel = 2;
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
      adminLevel = 2;
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
      adminLevel = 3;
      nutscode0 = 'DE';
    break;
  }

  switch (nutscode0) {
    case 'DE':
      switch (adminLevel) {
        case 1:
          nutslevel = 1; // admin level 1 entspricht dem nuts level 1 in Deutschland
          nutscode = 'DE';
        case 2:
          // admin level 2 entspricht NICHT dem nuts level 2 in Deutschland TODO!
        break;
        case 3:
          nutslevel = 3; // admin level 3 entspricht dem nuts level 3 in Deutschland
        break;
      }
    break;
    default:
      switch (adminLevel) {
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
          if(adminLevel != null) {
            geoJsonResponse.adminLevel = adminLevel;
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
          ModelService.updateOrCreate('Geojson', geoJsonResponse, {mapkey:mapkey}, function (err, result) {
            sails.log.debug(err, result);
            if (err) return callback(err);
            callback(null, result);
          });
      });
  }).on('error', function(err) {
      sails.log.error(err);
      return callback(err);
  });
}


module.exports = {
  importMapkey: importMapkey
}
