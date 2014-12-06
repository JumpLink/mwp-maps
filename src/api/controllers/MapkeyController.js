/**
 * admin level 0 entspricht dem nuts level 0 in allen Ländern
 * admin level 1 entspricht dem nuts level 1 in Deutschland
 * admin level 2 entspricht NICHT dem nuts level 2 in Deutschland TODO!
 * admin level 3 entspricht dem nuts level 3 in Deutschland
 */

var level0Mapkeys = [
  {
    mapkey: 'custom/world-highres', // World
    adminlevel: 0,
    nutslevel: 0,
  }
];

var level1Mapkeys = [
  {
    mapkey: 'countries/af/af-all', // Afghanistan
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/al/al-all', // Albania
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/dz/dz-all', // Algeria
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/as/as-all', // American Samoa
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/ad/ad-all', // Andorra
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/ao/ao-all', // Angola
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/ag/ag-all', // Antigua and Barbuda
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/ar/ar-all', // Argentina
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/am/am-all', // Armenia
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/au/au-all', // Australia
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/at/at-all', // Austria
    adminlevel: 1,
    nutslevel: 1,
  },
  {
    mapkey: 'countries/az/az-all', // Azerbaijan
    adminlevel: 1,
    nutslevel: 1,
  },
  // ..

  // Deutschland mit allen Bundesländern
  {
    mapkey: 'countries/de/de-all', // Germany
    adminlevel: 1,
    nutslevel: 1,
    nutscode: 'DE', // primary nutscode for this nutslevel
  },

  // ..
];

/*
 * Bundesland mit allen (ehemaligen) Landkreisen bzw. kreisfreie Städte, siehe oben.
 */
var level2Mapkeys = [
  {
    mapkey: 'countries/de/de-bw-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-by-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-be-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-bb-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-hb-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-hh-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-he-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-mv-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-ni-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-nw-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-rp-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-sl-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-sn-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-st-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-sh-all',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-th-all',
    adminlevel: 2,
  },
];

/*
 * Deutschland mit allen Bundesländern mit allen (ehemaligen) Landkreisen bzw. kreisfreie Städte
 * Beispiel München: "hc-key": "de-by-09184000"
 * Entspricht dritte bis fünfte Ziffer im AGS (Amtlicher Gemeindeschlüssel) aka Kreisschlüssel, identifiziert den Landkreis bzw. die kreisfreie Stadt, dem die Gemeinde angehört
 */
var TODO = {
  mapkey: 'countries/de/de-all-all', // Germany
  adminlevel: 2,
  nutscode0: 'DE',
};

var nuts2Mapkeys = []; // TODO

/*
 * Bundesland mit allen Gemeinden, entspricht den letzten drei Ziffern im AGS
 */
var level3Mapkeys = [
  {
    mapkey: 'countries/de/de-bw-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-by-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-be-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-bb-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-hb-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-hh-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-he-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-mv-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-ni-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-nw-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-rp-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-sl-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-sn-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-st-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-sh-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-th-all-all',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
];

var setup = function (req, res, next) {
  var mapkeys = level1Mapkeys.concat(level2Mapkeys).concat(nuts2Mapkeys).concat(level3Mapkeys);
  sails.log.debug(mapkeys);
  ModelService.replace('Mapkey', mapkeys, function (err, result) {
    if (err) return res.error(err);
    return res.json(result);
  });
};

module.exports = {
  level1Mapkeys: level1Mapkeys,
  level2Mapkeys: level2Mapkeys,
  nuts2Mapkeys: nuts2Mapkeys,
  level3Mapkeys: level3Mapkeys,
  setup: setup
}
