/**
 * admin level 0 entspricht dem nuts level 0 in allen Ländern
 * admin level 1 entspricht dem nuts level 1 in Deutschland
 * admin level 2 entspricht NICHT dem nuts level 2 in Deutschland TODO!
 * admin level 3 entspricht dem nuts level 3 in Deutschland
 */

var level0Mapkeys = [
  {
    mapkey: 'custom/world-highres',
    label: 'World',
    adminlevel: 0,
    nutslevel: 0,
  }
];

var level1Mapkeys = [
  // {
  //   mapkey: 'countries/af/af-all', // Afghanistan
  //   label: 'Afghanistan',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/al/al-all', // Albania
  //   label: 'Albania',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/dz/dz-all', // Algeria
  //   label: 'Algeria',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/as/as-all', // American Samoa
  //   label: ' American Samoa',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/ad/ad-all', // Andorra
  //   label: 'Andorra',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/ao/ao-all', // Angola
  //   label: 'Angola',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/ag/ag-all', // Antigua and Barbuda
  //   label: 'Antigua and Barbuda',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/ar/ar-all', // Argentina
  //   label: 'Argentina',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/am/am-all', // Armenia
  //   label: 'Armenia',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/au/au-all', // Australia
  //   label: 'Australia',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/at/at-all', // Austria
  //   label: 'Austria',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // {
  //   mapkey: 'countries/az/az-all', // Azerbaijan
  //   label: 'Azerbaijan',
  //   adminlevel: 1,
  //   nutslevel: 1,
  // },
  // ..

  // Deutschland mit allen Bundesländern
  {
    mapkey: 'countries/de/de-all', // Germany
    label: 'Germany',
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
    label: 'Baden-Württemberg',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-by-all',
    label: 'Bayern',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-be-all',
    label: 'Berlin',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-bb-all',
    label: 'Brandenburg',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-hb-all',
    label: 'Bremen',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-hh-all',
    label: 'Hamburg',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-he-all',
    label: 'Hessen',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-mv-all',
    label: 'Mecklenburg-Vorpommern',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-ni-all',
    label: 'Niedersachsen',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-nw-all',
    label: 'Nordrhein-Westfalen',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-rp-all',
    label: 'Rheinland-Pfalz',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-sl-all',
    label: 'Saarland',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-sn-all',
    label: 'Sachsen',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-st-all',
    label: 'Sachsen-Anhalt',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-sh-all',
    label: 'Schleswig-Holstein',
    adminlevel: 2,
  },
  {
    mapkey: 'countries/de/de-th-all',
    label: 'Thüringen',
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
  label: 'Germany',
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
    label: 'Baden-Württemberg',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-by-all-all',
    label: 'Bayern',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-be-all-all',
    label: 'Berlin',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-bb-all-all',
    label: 'Brandenburg',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-hb-all-all',
    label: 'Bremen',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-hh-all-all',
    label: 'Hamburg',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-he-all-all',
    label: 'Hessen',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-mv-all-all',
    label: 'Mecklenburg-Vorpommern',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-ni-all-all',
    label: 'Niedersachsen',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-nw-all-all',
    label: 'Nordrhein-Westfalen',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-rp-all-all',
    label: 'Rheinland-Pfalz',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-sl-all-all',
    label: 'Saarland',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-sn-all-all',
    label: 'Sachsen',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-st-all-all',
    label: 'Sachsen-Anhalt',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-sh-all-all',
    label: 'Schleswig-Holstein',
    adminlevel: 3,
    nutslevel: 3,
    nutscode0: 'DE',
  },
  {
    mapkey: 'countries/de/de-th-all-all',
    label: 'Thüringen',
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

var findByLevel = function (req, res, next) {
  var nutslevel = Number(req.param('nutslevel')); // TODO adminlevel
  Mapkey.find({nutslevel:nutslevel}).exec(function (error, data) {
    if (error) return res.serverError(error);
    res.json(data);
  });
};

module.exports = {
  level1Mapkeys: level1Mapkeys,
  level2Mapkeys: level2Mapkeys,
  nuts2Mapkeys: nuts2Mapkeys,
  level3Mapkeys: level3Mapkeys,
  setup: setup,
  findByLevel: findByLevel
}
