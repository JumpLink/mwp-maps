
// server compatibility to angular functions
// TODO auslagern in eigene Library
var $filter = function(filtername) {
  switch (filtername) {
    case 'orderBy':
      return _.sortBy;
    break;
  }
}

// TODO testme
var sort = function(members) {
  return $filter('orderBy')(members, 'position');
}

module.exports = {
  sort: sort
}
