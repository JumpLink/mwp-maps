var http = require('http');
var fs = require('fs');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();

/*
 * http://localhost:1338/geojson?mapkey=countries/de/de-all:
 * Entsprecht NUTS-1 Ebene / Nuts Level 1
 * agssubkey: Bundeslandkennziffer (für nuts level 1 die ersten beiden 2 Ziffern vom AGS) gemäß AGS see http://giswiki.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel#Bundesl.C3.A4nder
 * hc-key: Wie ihn Highmaps verwendet Gemäß ISO_3166-2:DE aber lowercase see http://de.wikipedia.org/wiki/ISO_3166-2:DE
 * nutscode: Gemäß NUTS:DE siehe http://de.wikipedia.org/wiki/NUTS:DE
 * level: Nuts-Code Level
 * hasc: Hierarchical administrative subdivision codes see http://en.wikipedia.org/wiki/Hierarchical_administrative_subdivision_codes
 *
 * Amtlicher Gemeindeschlüssel
 * Info:
 *  https://www.destatis.de/DE/ZahlenFakten/LaenderRegionen/Regionales/Gemeindeverzeichnis_ol.html
 *  https://www.destatis.de/DE/ZahlenFakten/LaenderRegionen/Regionales/Gemeindeverzeichnis/Administrativ/Aktuell/Zensus_Gemeinden.html
 *  http://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel
 */
var germany = {
  {
    'agssubkey': '01',
    'name': 'Schleswig-Holstein',
    'nutscode': 'DEF',
    'level': 1,
    'hc-key': 'DE-SH'
  },
  {
    'agssubkey': '02',
    'name': 'Freie und Hansestadt Hamburg',
    'nutscode': 'DE6',
    'level': 1,
  },
  {
    'agssubkey': '03',
    'name': 'Niedersachsen',
    'nutscode': 'DE9',
    'level': 1,
  },
  {
    'agssubkey': '04',
    'name': 'Freie Hansestadt Bremen',
    'nutscode': 'DE5',
    'level': 1,
  },
  {
    'agssubkey': '05',
    'name': 'Nordrhein-Westfalen',
    'nutscode': 'DEA',
    'level': 1,
  },
  {
    'agssubkey': '06',
    'name': 'Hessen',
    'nutscode': 'DE7',
    'level': 1,
  },
  {
    'agssubkey': '07',
    'name': 'Rheinland-Pfalz',
    'nutscode': 'DEB',
    'level': 1,
  },
  {
    'agssubkey': '08',
    'name': 'Baden-Württemberg',
    'nutscode': 'DE1',
    'level': 1,
  },
  {
    'agssubkey': '09',
    'name': 'Bayern',
    'nutscode': 'DE2',
    'level': 1,
  },
  {
    'agssubkey': '10',
    'name': 'Saarland',
    'nutscode': 'DEC',
    'level': 1,
    'level': 1,
  },
  {
    'agssubkey': '11',
    'name': 'Berlin',
    'nutscode': 'DE3',
    'level': 1,
  },
  {
    'agssubkey': '12',
    'name': 'Brandenburg',
    'nutscode': 'DE4',
    'level': 1,
  },
  {
    'agssubkey': '13',
    'name': 'Mecklenburg-Vorpommern',
    'nutscode': 'DE8',
    'level': 1,
  },
  {
    'agssubkey': '14',
    'name': 'Freistaat Sachsen|Sachsen',
    'nutscode': 'DED',
    'level': 1,
  },
  {
    'agssubkey': '15',
    'name': 'Sachsen-Anhalt',
    'nutscode': 'DEE',
    'level': 1,
  },
  {
    'agssubkey': '16',
    'name': 'Thüringen',
    'nutscode': 'DEG',
    'level': 1,
  },
];

var importNutsItemTterator = function (item, callback) {
  ModelService.updateOrCreate('Nuts', item, {nutscode:item.nutscode}, function (err, result) {
    sails.log.debug(err, result);
    if (err) callback(err);
    else callback(null, result);
  });
}

var transfromXmlResultNutsItemTterator = function (item, callback) {
  var result = {};

  // xml transformation
  result.nutscode = item.regionCode[0];
  result.name = item.name[0];
  result.label = item['rdfs:label'][0];
  result.level = Number(item['level'][0]['_']);
  if(item['hasParentRegion'])
    result.parent = item['hasParentRegion'][0]['rdf:Description'][0]['$']['rdf:about'];

  // generel transformation
  if(result.level >= 1) {
    result.levelcode = result.nutscode.substr(result.parent.length)
  }

  importNutsItemTterator(result, callback);
  // callback(null, result);
}

// import level 0 - 3
var importer3 = function(callback) {
  // import from http://ec.europa.eu/
  // download xml from: 'http://ec.europa.eu/eurostat/ramon/rdfdata/nuts2008/';

  fs.readFile(__dirname + '/nuts2008.rdf', function(err, data) {
    if (err) callback(err);
    xmlParser.parseString(data, function (err, xml) {
      // sails.log.debug(err, xml['rdf:RDF']['NUTSRegion']);
      if (err) callback(err);
      async.mapSeries(xml['rdf:RDF']['NUTSRegion'], transfromXmlResultNutsItemTterator, callback);
    });
  });
}

// import level 0 - 2
var importer2 = function(callback) {
  // import from http://www.eea.europa.eu/data-and-maps/daviz/sds/nuts-regions-level-0-to-2/@@view

  var url = 'http://www.eea.europa.eu/data-and-maps/daviz/sds/nuts-regions-level-0-to-2/daviz.json';

  var importNutsItemTterator = function (item, callback) {
    ModelService.updateOrCreate('Geojson', item, {label:item.label}, function (err, result) {
      sails.log.debug(err, result);
      if (err) callback(err);
      else callback(null, result);
    });
  }

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
    Nuts.find({level:level}).exec(function found(err, found) {
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
  insertChilds: insertChilds,
}
