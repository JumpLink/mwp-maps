var http = require('http');
var fs = require('fs');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();
var csv = require('csv');

/**
 * Ermittelt den hasc code zum jeweiligen nutscode auf level 0 Ebene
 * countries source: Pascal Garber
 * typ: see importerHascDeLevel3
 */
var importerHascLevel0 = function(callback) {
  var countries = [
    {
      'nutscode': 'DE',
      'hasc': 'DE',
      'country': 'Deutschland',
      'adminlevel': 1,
      'nutslevel': 1,
      'typ': 'c',               // typ c: Country; see below
    }
  ];

  var iterator = function (country, callback) {
    // sails.log.debug("importerHascLevel0", "iterator", country);
    Nuts.find({nutscode:country.nutscode}).exec(function found(err, found) {
      if (err) return callback(err);
      if (found instanceof Array) found = found[0];
      found.hasc = country.hasc;
      found.adminlevel = country.adminlevel; // nutslevel  entspricht admin level 0 in deutschland
      found.typ = country.typ;
      sails.log.info(found);
      Nuts.update(found.id, found).exec(function found(err, found) {
        if (err) return callback(err);
        callback(null, found);
      });
    });
  }

  async.mapSeries(countries, iterator, callback);
}

/*
 * Ermittelt den hasc code zum jeweiligen nutscode auf level 1 Ebene
 * Bundesländer Source: Pascal Garber
 * Entsprecht NUTS-1 Ebene für Deutschland / Nuts Level 1
 * Beispiel: http://localhost:1338/geojson?mapkey=countries/de/de-all:
 * agssubcode: Bundeslandkennziffer (für nuts level 1 die ersten beiden 2 Ziffern vom AGS) gemäß AGS see http://giswiki.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel#Bundesl.C3.A4nder
 * hc-key: Wie ihn Highmaps verwendet Gemäß ISO_3166-2:DE aber lowercase see http://de.wikipedia.org/wiki/ISO_3166-2:DE
 * nutscode: Gemäß NUTS:DE siehe http://de.wikipedia.org/wiki/NUTS:DE
 * nutslevel: Nuts-Code Level
 * adminlevel: Admin level gemäß hasc; ( alternativer admin level: http://wiki.openstreetmap.org/wiki/Key:admin_level#admin_level)
 * hasc: Hierarchical administrative subdivision codes see http://en.wikipedia.org/wiki/Hierarchical_administrative_subdivision_codes
 * typ: see importerHascDeLevel3
 *
 * Amtlicher Gemeindeschlüssel
 * Info:
 *  https://www.destatis.de/DE/ZahlenFakten/LaenderRegionen/Regionales/Gemeindeverzeichnis_ol.html
 *  https://www.destatis.de/DE/ZahlenFakten/LaenderRegionen/Regionales/Gemeindeverzeichnis/Administrativ/Aktuell/Zensus_Gemeinden.html
 *  http://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel
 */
var importerHascDeLevel1 = function(callback) {
  var bundeslaender = [
    {
      'agssubcode': '01',
      'federalstate': 'Schleswig-Holstein',
      'nutscode': 'DEF',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.SH',
    },
    {
      'agssubcode': '02',
      'federalstate': 'Freie und Hansestadt Hamburg',
      'nutscode': 'DE6',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.HH',
    },
    {
      'agssubcode': '03',
      'federalstate': 'Niedersachsen',
      'nutscode': 'DE9',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.NI',
    },
    {
      'agssubcode': '04',
      'federalstate': 'Freie Hansestadt Bremen',
      'nutscode': 'DE5',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.HB',
    },
    {
      'agssubcode': '05',
      'federalstate': 'Nordrhein-Westfalen',
      'nutscode': 'DEA',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.NW',
    },
    {
      'agssubcode': '06',
      'federalstate': 'Hessen',
      'nutscode': 'DE7',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.HE',
    },
    {
      'agssubcode': '07',
      'federalstate': 'Rheinland-Pfalz',
      'nutscode': 'DEB',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.RP',
    },
    {
      'agssubcode': '08',
      'federalstate': 'Baden-Württemberg',
      'nutscode': 'DE1',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.BW',
    },
    {
      'agssubcode': '09',
      'federalstate': 'Bayern',
      'nutscode': 'DE2',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.BY',
    },
    {
      'agssubcode': '10',
      'federalstate': 'Saarland',
      'nutscode': 'DEC',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.SL',
    },
    {
      'agssubcode': '11',
      'federalstate': 'Berlin',
      'nutscode': 'DE3',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.BE',
    },
    {
      'agssubcode': '12',
      'federalstate': 'Brandenburg',
      'nutscode': 'DE4',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.BB',
    },
    {
      'agssubcode': '13',
      'federalstate': 'Mecklenburg-Vorpommern',
      'nutscode': 'DE8',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.MV',
    },
    {
      'agssubcode': '14',
      'federalstate': 'Freistaat Sachsen|Sachsen',
      'nutscode': 'DED',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.SN',
    },
    {
      'agssubcode': '15',
      'federalstate': 'Sachsen-Anhalt',
      'nutscode': 'DEE',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.ST',
    },
    {
      'agssubcode': '16',
      'federalstate': 'Thüringen',
      'nutscode': 'DEG',
      'adminlevel': 1,
      'nutslevel': 1,
      'hasc': 'DE.TH',
    },
  ];

  var iterator = function (item, callback) {
    // sails.log.debug(item);
    Nuts.find({nutscode:item.nutscode}).exec(function found(err, found) {
      if (err) return callback(err);
      if (found instanceof Array) found = found[0];
      // sails.log.debug(found);
      found.hasc = item.hasc;
      found.agssubcode = item.agssubcode;
      found.adminlevel = item.adminlevel; // nutslevel 1 entspricht admin level 1 in deutschland
      found.federalstate = item.federalstate;
      found.typ = 'b'; // typ b: Federal state see below
      sails.log.info(found);
      // callback(null, found);
      Nuts.update(found.id, found).exec(function found(err, found) {
        if (err) return callback(err);
        callback(null, found);
      });
    });
  }

  async.mapSeries(bundeslaender, iterator, callback);
}

var importerHascDeLevel3 = function(callback) {

  /*
   * source: www.statoids.com/yde.html
   *
   * typ: See list of subdivision types below.
   * #  Name                                        Translation         Source
   * --------------------------------------------------------------------------
   * b  Federal state                               Bundesland          statoids
   * d  District                                    Kreis               statoids
   * g  Group of regions                            Regionalverband     statoids
   * l  Rural district                              Landkreis           statoids
   * s  Town/city that is not part of a district    Kreisfreie Stadt    statoids
   * u  Urban district                              Stadtkreis          statoids
   * c  Country                                     Land                Ṕascal Garber
   *
   * hasc: Hierarchical administrative subdivision codes.
   * nutscode: Codes from Nomenclature for Statistical Territorial Units (European standard).
   * population: 2011-05-09 census
   * area: km.² Source: German Wikipedia.
   * rb: Arbitrary code for the Regierungsbe  zirk as of ~1999 (see list below).
   */
  var iterator = function (item, callback) {
    // sails.log.debug(item);
    Nuts.find({nutscode:item.nutscode}).exec(function found(err, found) {
      if (err) return callback(err);
      if (found instanceof Array) found = found[0];
      // sails.log.debug(found);
      found.typ = item.typ;
      found.hasc = item.hasc;
      found.rb = item.rb;
      found.district = item.district;
      found.capital = item.capital;
      found.adminlevel = 3; // nutslevel 3 entspricht admin level 3 in deutschland
      sails.log.info(found);
      // callback(null, found);
      Nuts.update(found.id, found).exec(function found(err, found) {
        if (err) return callback(err);
        callback(null, found);
      });
    });
  }

  fs.readFile(__dirname + '/../../import/nuts-hasc-de.csv', 'utf8', function(err, data) {
    if (err) return res.serverError(err);
    csv.parse(data, {'columns':true}, function(err, columns) {
      // sails.log.debug(data);
      async.mapSeries(columns, iterator, callback);
    });
  });

}

var importNutsItemTterator = function (item, callback) {
  ModelService.updateOrCreate('Nuts', item, {nutscode:item.nutscode}, function (err, result) {
    sails.log.debug(err, result);
    if (err) callback(err);
    else callback(null, result);
  });
}

var validateNuts = function (item) {

  if(typeof item.level != 'undefined') {
    item.level = Number(item.level);
  }

  if(item.level > 0) {
    if(!item.parent) {
      item.parent = item.nutscode.substr(0, item.nutscode.length - 1);
    }

    if(!item.nutssubcode) {
      item.nutssubcode = item.nutscode.substr(item.parent.length)
    }
  }

  return item;
}

/**
 * Current Importer
 * import level 0 - 3
 * source: https://github.com/GeoKnow/GeoStats/tree/master/data/nuts
 * Nuts Version 2010
 */
var importer2010 = function(callback) {
  var iterator = function (item, callback) {
    delete item['countries sorting order'];
    delete item.order;

    item = validateNuts(item);

    importNutsItemTterator(item, callback);
  }

  fs.readFile(__dirname + '/../../import/NUTS_2010.csv', function(err, data) {
    if (err) callback(err);
    csv.parse(data, {'columns':true}, function(err, columns) {
      // sails.log.debug(data);
      async.mapSeries(columns, iterator, callback);
    });
  });
}


/**
 * Old Importer
 * import level 0 - 3
 * import from http://ec.europa.eu/
 * download xml from: 'http://ec.europa.eu/eurostat/ramon/rdfdata/nuts2008/';
 */
var importer3 = function(callback) {
  var transfromXmlResultNutsItemTterator = function (item, callback) {
    var result = {};

    // xml transformation
    result.nutscode = item.regionCode[0];
    result.name = item.name[0];
    result.label = item['rdfs:label'][0];
    result.level = item['level'][0]['_'];
    if(item['hasParentRegion'])
      result.parent = item['hasParentRegion'][0]['rdf:Description'][0]['$']['rdf:about'];

    item = validateNuts(item);

    importNutsItemTterator(result, callback);
    // callback(null, result);
  }

  fs.readFile(__dirname + '/../../import/nuts2008.rdf', function(err, data) {
    if (err) callback(err);
    xmlParser.parseString(data, function (err, xml) {
      // sails.log.debug(err, xml['rdf:RDF']['NUTSRegion']);
      if (err) callback(err);
      async.mapSeries(xml['rdf:RDF']['NUTSRegion'], transfromXmlResultNutsItemTterator, callback);
    });
  });
}

/**
 * Old Importer
 * import level 0 - 2
 * import from http://www.eea.europa.eu/data-and-maps/daviz/sds/nuts-regions-level-0-to-2/@@view
 */
var importer2 = function(callback) {
  //

  var url = 'http://www.eea.europa.eu/data-and-maps/daviz/sds/nuts-regions-level-0-to-2/daviz.json';

  http.get(url, function(resp) {
      var body = '';

      resp.on('data', function(chunk) {
          body += chunk;
      });

      resp.on('end', function() {
          var jsonResponse = JSON.parse(body)
          // sails.log.debug("Got response: ", jsonResponse);
          async.mapSeries(jsonResponse.items, importNutsItemTterator, callback);
      });
  }).on('error', function(err) {
      sails.log.error(err);
      return callback(err);
  });
}


var insertChilds = function(callback) {

  // extract the nutscode property
  var childIterator = function (item, callback) {
    callback(null, item.nutscode);
  }

  var parentIterator = function (parent, callback) {
    Nuts.find({parent:parent.nutscode}).exec(function found(err, childObjects) {
      sails.log.debug(err, childObjects);
      if (err) return callback(err);
      async.mapSeries(childObjects, childIterator, function(err, childs){
        parent.childs = childs;
        Nuts.update(parent.id, parent).exec(callback);
      });
    });
  }

  var levelIterator = function (level, callback) {
    Nuts.find({'level':level}).exec(function found(err, found) {
      sails.log.debug(err, found);
      if (err) return callback(err);
      async.mapSeries(found, parentIterator, callback);
    });
  }

  async.mapSeries([0,1,2], levelIterator, callback);

}


module.exports = {
  importer3: importer3,
  importer2: importer2,
  importer2010: importer2010,
  importerHascLevel0: importerHascLevel0,
  importerHascDeLevel3: importerHascDeLevel3,
  importerHascDeLevel1: importerHascDeLevel1,
  insertChilds: insertChilds,
}
