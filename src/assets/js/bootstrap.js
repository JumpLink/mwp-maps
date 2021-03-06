jumplink.cms = angular.module('jumplink.cms', [
  'ui.router'                 // AngularUI Router: https://github.com/angular-ui/ui-router
  , 'ngAnimate'               // ngAnimate: https://docs.angularjs.org/api/ngAnimate
  , 'ngSanitize'              // ngSanitize: https://docs.angularjs.org/api/ngSanitize
  , 'sails.io'                // angularSails: https://github.com/balderdashy/angularSails
  , 'webodf'                  // custom module
  , 'FBAngular'               // angular-fullscreen: https://github.com/fabiobiondi/angular-fullscreen
  , 'mgcrea.ngStrap'          // AngularJS 1.2+ native directives for Bootstrap 3: http://mgcrea.github.io/angular-strap/
  , 'angularMoment'           // Angular.JS directive and filters for Moment.JS: https://github.com/urish/angular-moment
  // , 'wu.masonry'              // A directive to use masonry with AngularJS: http://passy.github.io/angular-masonry/
  , 'angular-carousel'        // An AngularJS carousel implementation optimised for mobile devices: https://github.com/revolunet/angular-carousel
  // , 'textAngular'             // A radically powerful Text-Editor/Wysiwyg editor for Angular.js: https://github.com/fraywing/textAngular
  , 'angular-medium-editor'   // AngularJS directive for Medium.com editor clone: https://github.com/thijsw/angular-medium-editor
  , 'ui.ace'                  // This directive allows you to add ACE editor elements: https://github.com/angular-ui/ui-ace
  , 'leaflet-directive'       // AngularJS directive to embed an interact with maps managed by Leaflet library: https://github.com/tombatossals/angular-leaflet-directive
  , 'toaster'                 // AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
  , 'angularFileUpload'       // Angular File Upload is a module for the AngularJS framework: https://github.com/nervgh/angular-file-upload
  , 'angular-filters'         // Useful filters for AngularJS: https://github.com/niemyjski/angular-filters
  , 'nouislider'              // angular-nouislider - Simple angular directive for jquery nouislider plugin: https://github.com/vasyabigi/angular-nouislider
  , 'ui-highcharts'           // HighchartsJS powered charts directives for Angular: https://github.com/gevgeny/ui-highcharts
  , 'highcharts-ng'           // Alternative AngularJS directive for Highcharts: https://github.com/hanneskaeufler/highcharts-ng/tree/hk-highmaps
  , 'angularLoad'             // angular-load: Dynamically load scripts and css stylesheets in your Angular.JS app: https://github.com/urish/angular-load
]);

jumplink.cms.config( function($stateProvider, $urlRouterProvider, $locationProvider) {

  // use the HTML5 History API
  $locationProvider.html5Mode(false);

  $urlRouterProvider.otherwise('/home');

  $stateProvider
  // LAYOUT
  .state('bootstrap-layout', {
    abstract: true
    , templateUrl: "bootstrap/layout"
    , controller: 'LayoutController'
  })
  // HOME
  .state('bootstrap-layout.home', {
    url: '/home'
    , resolve:{
      about: function($sailsSocket) {
        return $sailsSocket.get('/content?name=about', {name: 'about'}).then (function (data) {
          return html_beautify(data.data[0].content);
        });
      }
      , goals: function($sailsSocket, $timeout) {
        return $sailsSocket.get('/content?name=goals', {name: 'goals'}).then (function (data) {
          return html_beautify(data.data[0].content);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/home/content'
        , controller: 'HomeContentController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // map
  .state('bootstrap-layout.map', {
    url: '/map/:level/:admintype/:mapkey1/:mapkey2/:mapkey3/:join/:type/:year'
    // NOT WORKING
    // , resolve: {

    //   data: function($sailsSocket, $stateParams, $log) {
    //     var level = $stateParams.level;
    //     var admintype = $stateParams.admintype; // nuts TODO
    //     var type = 'exportamount'; // TODO
    //     var join = 'hasc'; // TODO

    //     $log.debug("bootstrap-layout.map resolve data", level, admintype, type, join);

    //     return $sailsSocket.post('/data/forhighmap', {level:level, year:year, type:type, join:join}).then (function (data) {
    //       console.log("/data/forhighmap", data);
    //       return data.data;
    //     });
    //   }

    //   , geojson: function($stateParams, $log) {
    //     $log.debug("bootstrap-layout.map resolve geojson");

    //     var mapkey = $stateParams.mapkey1;
    //     if($stateParams.mapkey2)
    //         mapkey += "/"+$stateParams.mapkey2;
    //     if($stateParams.mapkey3)
    //         mapkey += "/"+$stateParams.mapkey3;

    //     $log.debug("mapkey", mapkey);

    //     return $sailsSocket.post('/geojson/findByMapkey', {mapkey:mapkey}).then (function (data) {
    //       console.log('/geojson/findByMapkey', data);
    //       return data.data;
    //     });
    //   }
    // }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/map/content'
        , controller: 'MapController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // database
  .state('bootstrap-layout.database-data', {
    url: '/database/data'
    , resolve:{
      data: function($sailsSocket, $log) {
        return $sailsSocket.get('/data?limit=0', {}).then (function (data) {
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/data/content'
        , controller: 'DatabaseDataController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.database-geojson-mapkey', {
    url: '/database/geojson-mapkey/:mapkey1/:mapkey2/:mapkey3'
    , resolve:{
      geojson: function($sailsSocket, $stateParams, $log) {
        // WORKAROUND
        var mapkey = $stateParams.mapkey1;
        if($stateParams.mapkey2)
            mapkey += "/"+$stateParams.mapkey2;
        if($stateParams.mapkey3)
            mapkey += "/"+$stateParams.mapkey3;
        $log.debug('bootstrap-layout.database-geojson-mapkey', mapkey);
        return $sailsSocket.post('/geojson/findByMapkey', {mapkey:mapkey}).then (function (data) {
          $log.debug(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/geojson/content'
        , controller: 'DatabaseGeojsonController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.database-geojson-all', {
    url: '/database/geojson'
    , resolve:{
      geojson: function($sailsSocket, $log) {
        return $sailsSocket.get('/geojson/findAll', {}).then (function (data) {
          $log.debug(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/geojson/content'
        , controller: 'DatabaseGeojsonController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.database-mapkey', {
    url: '/database/mapkey'
    , resolve:{
      mapkeys: function($sailsSocket, $log) {
        return $sailsSocket.get('/mapkey?limit=0', {}).then (function (data) {
          $log.debug(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/mapkey/content'
        , controller: 'DatabaseMapkeyController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.database-nuts-level', {
    url: '/database/nuts/level/:level'
    , resolve:{
      nuts: function($sailsSocket, $log, $stateParams) {
        return $sailsSocket.post('/nuts/findByLevel', {level: $stateParams.level}).then (function (data) {
          $log.debug(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/nuts/content'
        , controller: 'DatabaseNutsController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.database-nuts-code', {
    url: '/database/nuts/code/:code'
    , resolve:{
      nuts: function($sailsSocket, $log, $stateParams) {
        return $sailsSocket.post('/nuts/findByCode', {code: $stateParams.code}).then (function (data) {
          $log.debug(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/nuts/content'
        , controller: 'DatabaseNutsController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.database-feature', {
    url: '/database/feature'
    , resolve:{
      features: function($sailsSocket, $log, $stateParams) {
        return $sailsSocket.post('/feature/findAll', {}).then (function (data) {
          $log.debug(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/feature/content'
        , controller: 'DatabaseFeatureController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.database-feature-hasc', {
    url: '/database/feature/hasc/:hasc'
    , resolve:{
      features: function($sailsSocket, $log, $stateParams) {
        return $sailsSocket.post('/feature/findByHasc', {hasc: $stateParams.hasc}).then (function (data) {
          $log.debug(data);
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/database/feature/content'
        , controller: 'DatabaseFeatureController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // imprint
  .state('bootstrap-layout.imprint', {
    url: '/imprint'
    , resolve:{
      imprint: function($sailsSocket) {
        return $sailsSocket.post('/content?name=imprint', {name: 'imprint'}).then (function (data) {
          return html_beautify(data.data[0].content);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/imprint/content'
        , controller: 'ImprintController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
      // , 'footer' : {
      //   templateUrl: 'bootstrap/footer'
      //   , controller: 'FooterController'
      // }
    }
  })
  // administration
  .state('bootstrap-layout.administration', {
    url: '/admin'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/administration/settings'
        , controller: 'AdminController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.users', {
    url: '/users'
    , resolve:{
      users: function($sailsSocket) {
        return $sailsSocket.get('/user').then (function (data) {
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/administration/users'
        , controller: 'UsersController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.user', {
    url: '/user/:index'
    , resolve:{
      user: function($sailsSocket, $stateParams) {
        return $sailsSocket.get('/user'+'/'+$stateParams.index).then (function (data) {
          delete data.data.password;
          return data.data;
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'bootstrap/administration/user'
        , controller: 'UserController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('bootstrap-layout.new-user', {
    url: '/new/user'
    , views: {
      'content' : {
        templateUrl: 'bootstrap/administration/user'
        , controller: 'UserNewController'
      }
      , 'toolbar' : {
        templateUrl: 'bootstrap/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  ;
});
