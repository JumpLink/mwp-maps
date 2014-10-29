jumplink.cms.controller('AppController', function($rootScope, $scope, $state, $window, $timeout, Fullscreen, toaster, $sailsSocket, $location, $anchorScroll, $log) {

  // fix scroll to top on route change
  $scope.$on("$stateChangeSuccess", function () {
    $anchorScroll();
  });

  //AngularJS Toaster - AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
  $rootScope.pop = function(type, title, body, timeout, bodyOutputType, clickHandler) {
    toaster.pop(type, title, body, timeout, bodyOutputType, clickHandler);
  };

  var generalSubscribes = function () {

    $sailsSocket.post('/session/subscribe', {}).success(function(data, status, headers, config){

      // react to subscripe from server: http://sailsjs.org/#/documentation/reference/websockets/sails.io.js/io.socket.on.html
      $sailsSocket.subscribe('connect', function(msg){
        $log.debug('socket.io is connected');
      });

      $sailsSocket.subscribe('disconnect', function(msg){
        $rootScope.pop('error', 'Verbindung zum Server verloren', "");
        $rootScope.authenticated = false;
      });

      $sailsSocket.subscribe('reconnect', function(msg){
        $rootScope.pop('info', 'Sie sind wieder mit dem Server verbunden', "");
      });

    });

  }

  var adminSubscribes = function() {
    // subscripe on server
    $sailsSocket.post('/session/subscribe', {}).success(function(data, status, headers, config){

      // called on any sended email from server
      $sailsSocket.subscribe('email', function(email){

        var body = ''
          +'<dl>'
            +'<dt>Absender</dt>'
            +'<dd><a href="mailto:'+email.from+'">'+email.from+'</a></dd>'
            +'<dt>Betreff</dt>'
            +'<dd>'+email.subject+'</dd>';
            if(email.attachments) {
              body += ''
              +'<dt>Anhänge</dt>'
              +'<dd>'+email.attachments.length+'</dd>';
            }
            body += ''
          +'</dl>';

        $rootScope.pop('info', 'Eine E-Mail wurde versendet.', body, null, 'trustedHtml');
      });

      // admin room
      $sailsSocket.subscribe('admins', function(msg){
        $log.debug(msg);
      });

    });
  }

  // http://stackoverflow.com/questions/18608161/angularjs-variable-set-in-ng-init-undefined-in-scope
  $rootScope.$watch('authenticated', function () {
    $log.debug("authenticated: "+$rootScope.authenticated);
    if($rootScope.authenticated) {
      $rootScope.mainStyle = {'padding-bottom':'50px'};
      $rootScope.toasterPositionClass = 'toast-bottom-right-with-toolbar';
      adminSubscribes();
    } else {
      $rootScope.mainStyle = {'padding-bottom':'0px'};
      $rootScope.toasterPositionClass = 'toast-bottom-right';
    }
  });
  generalSubscribes();

  $rootScope.fullscreenIsSupported = Fullscreen.isSupported();
  $rootScope.isFullscreen = false;
  Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled){
    $rootScope.isFullscreen = isFullscreenEnabled == true;
    $rootScope.$apply();
  });

  $rootScope.toggleFullscreen = function () {
    if (Fullscreen.isEnabled()) {
      Fullscreen.cancel();
    } else {
      Fullscreen.all();
    }
  };

  // TODO loading animation on $stateChangeStart
    $rootScope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams){
     $rootScope.loadclass = 'loading';
  });

  // on new url
  $rootScope.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    $rootScope.loadclass = 'finish';
    switch(toState.name) {
      case "bootstrap-layout.home":
        $rootScope.bodyclass = 'home';
      break;
      case "bootstrap-layout.gallery":
        $rootScope.bodyclass = 'gallery';
      break;
      case "bootstrap-layout.gallery-slider":
        $rootScope.bodyclass = 'gallery-slider';
      break;
      default:
        $rootScope.bodyclass = toState.name;
      break;
    }
  });

  $rootScope.getWindowDimensions = function () {
    return { 'height': angular.element($window).height(), 'width': angular.element($window).width() };
  };

  angular.element($window).bind('resize', function () {
    // $timeout(function(){
    //   $rootScope.$apply();
    // });
    // $rootScope.$apply();
  });

  // http://stackoverflow.com/questions/641857/javascript-window-resize-event
  if(angular.element($window).onresize) { // if jQuery is used
    angular.element($window).onresize = function(event) {
      $timeout(function(){
        $rootScope.$apply();
      });
    };
  }

  // http://stackoverflow.com/questions/22991481/window-orientationchange-event-in-angular
  angular.element($window).bind('orientationchange', function () {
    $timeout(function(){
      $rootScope.$apply();
    });
  });

  angular.element($window).bind('deviceorientation', function () {
    $timeout(function(){
      $rootScope.$apply();
    });
  });

  $rootScope.$watch($rootScope.getWindowDimensions, function (newValue, oldValue) {
    $rootScope.windowHeight = newValue.height;
    $rootScope.windowWidth = newValue.width;
    $timeout(function(){
      $rootScope.$apply();
    });
  }, true);

  $rootScope.logout = function() {
    $sailsSocket.post("/session/destroy", {}).success(function(data, status, headers, config) {
      $rootScope.authenticated = false;
      $rootScope.pop('success', 'Erfolgreich abgemeldet', "");
    });
  }

  $scope.adminSettingDropdown = [
    {
      "text": "<i class=\"fa fa-list\"></i>&nbsp;Übersicht",
      "click": "goToState('bootstrap-layout.administration')"
    },
    {
      "text": "<i class=\"fa fa-users\"></i>&nbsp;Benutzer",
      "click": "goToState('bootstrap-layout.users')"
    },
    {
      "text": "<i class=\"fa fa-sign-out\"></i>&nbsp;Abmelden",
      "click": "$root.logout()"
    }
  ];

  $scope.goToState = function (to, params, options) {
    $state.go(to, params, options)
  }

});

jumplink.cms.controller('LayoutController', function($scope) {


});

jumplink.cms.controller('ToolbarController', function($scope) {


});

jumplink.cms.controller('FooterController', function($scope) {

});

jumplink.cms.controller('HomeContentController', function($scope, $rootScope, $sailsSocket, $location, $anchorScroll, $timeout, $window, about, goals, $log) {

  $scope.about = about;
  $scope.goals = goals;

  // WORKAROUND wait until image is loaded to fix bs-sidebar
  // angular.element($window).imagesLoaded(function() {
  //   angular.element($window).triggerHandler('resize');
  // });

  $scope.goTo = function (hash) {
    $location.hash(hash);
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $sailsSocket.put('/content/replace', {name: 'about', content: $scope.about}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        $log.debug (data);
      } else {
        $log.debug ("Can't save site");
      }
    });

    $sailsSocket.put('/content/replace', {name: 'goals', content: $scope.goals}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        $log.debug (data);
      } else {
        $log.debug ("Can't save site");
      }
    });
  }

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'about':
            $scope.about = msg.data.content;;
            if($rootScope.authenticated) {
              $rootScope.pop('success', '"Wir über uns" wurde aktualisiert', "");
            }
          break;
          case 'goals':
            $scope.goals = msg.data.content;;
            if($rootScope.authenticated) {
              $rootScope.pop('success', '"Ziele" wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

});


jumplink.cms.controller('MapController', function($rootScope, $scope, $sailsSocket, angularLoad, $filter, $modal, FileUploader, $log) {
  $scope.uploader = new FileUploader({url: 'map/upload', removeAfterUpload: true});
  $scope.uploader.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/, options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });
  var editMemberModal = $modal({scope: $scope, title: 'Person bearbeiten', uploader: $scope.uploader, template: 'bootstrap/map/editmembermodal', show: false});



  $sailsSocket.subscribe('map', function(msg){
    $log.debug(msg);

    switch(msg.verb) {
      case 'updated':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde aktualisiert', msg.data.name);
      break;
      case 'created':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde erstellt', msg.data.name);
      break;
      case 'removedFrom':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde entfernt', msg.id);
      break;
      case 'destroyed':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde gelöscht', msg.id);
      break;
      case 'addedTo':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Eine Person wurde hinzugefügt', msg.data.name);
      break;
    }
  });
  $scope.data = [{
    name : 'Rainfall',
    type : 'column',
    yAxis : 1,
    data : [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
  }, {
    name : 'Temperature',
    type : 'spline',
    data : [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
  }, {
    name : 'Sunshine',
    type : 'pie',
    data : [{
      y : 2020,
      name : 'Sunshine hours',
      sliced : true
    }, {
      y : 6740,
      name : 'Non sunshine hours (including night)',
      dataLabels: { enabled: false }
    }],
    center : [70, 45],
    size : 80
  }];

  $scope.options = {
    chart: {
      spacing: 40,
      height: 360
    },
    legend : {
      enabled : false
    },
    xAxis : [{
      categories : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }]
  };

  // Prepare demo data
  var data = [{
      'hc-key': 'us',
      value: 3
  }, {
      'hc-key': 'ca',
      value: 5
  }, {
      'hc-key': 'mx',
      value: 20
  }];

  $scope.mapOptions = {
    mapNavigation: {
        enabled: false,
        buttonOptions: {
            verticalAlign: 'bottom'
        }
    },

    colorAxis: {
        min: 0
    }
  }

    // script(type="text/javascript", charset="utf-8", src="http://code.highcharts.com/mapdata/custom/world.js")
    // script(type="text/javascript", charset="utf-8", src="")

  angularLoad.loadScript('http://code.highcharts.com/mapdata/custom/north-america-no-central.js').then(function() {

    $scope.mapSeries = [{
      data: data,
      mapData: Highcharts.maps['custom/north-america-no-central'],
      joinBy: 'hc-key',
      allAreas: false,
      name: 'Random data',
      states: {
          hover: {
              color: '#BADA55'
          }
      },
      dataLabels: {
          enabled: true,
          format: '{point.name}'
      }
    }];

  }).catch(function() {
    $log.error("can't load http://code.highcharts.com/mapdata/custom/north-america-no-central.js");
  });

  $scope.slider = {from:0, to:100, single: 50};

});

jumplink.cms.controller('AdminController', function($scope) {

});

jumplink.cms.controller('UsersController', function($scope, $rootScope, $sailsSocket, users, $log, userService) {
  $scope.users = users;

  $scope.remove = function(user) {
    userService.remove($scope.users, user);
  }

  userService.subscribe();

});

jumplink.cms.controller('UserController', function($scope, userService, user, $state, $log) {
  $scope.user = user;
  $scope.save = function(user) {
    if(angular.isUndefined(user))
      user = $scope.user;
    userService.save(user, function(data) {
      // $scope.user = data;
      $state.go('bootstrap-layout.users');
    });
  }

  userService.subscribe();
});

jumplink.cms.controller('UserNewController', function($scope, userService, $state, $log) {
  $scope.user = {};
  $scope.save = function(user) {
    if(angular.isUndefined(user))
      user = $scope.user;
    userService.save(user, function(data) {
      // $scope.user = data;
      $state.go('bootstrap-layout.users');
    });
  }

  userService.subscribe();
});

jumplink.cms.controller('ImprintController', function($rootScope, $scope, $sailsSocket, imprint, $location, $anchorScroll, $log) {
  $scope.imprint = imprint;

  $scope.email = {
    from: null
    , name: null
    , subject: null
    , content: null
  }

  $scope.goTo = function (hash) {
    $location.hash(hash);
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $sailsSocket.put("/content/replace", {name: 'imprint', content: $scope.imprint}, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        $log.debug (response);
      } else {
        $log.debug ("Can't save site");
      }
    });
  }

  $scope.sendMail = function() {

    var html = ''
    +'<dl>'
      +'<dt>Absender</dt>'
      +'<dd><a href="mailto:'+$scope.email.from+'">'+$scope.email.from+'</a></dd>'
      +'<dt>Betreff</dt>'
      +'<dd>'+$scope.email.subject+'</dd>'
    +'</dl>'
    +'<br>'
    +$scope.email.content;

    var text = String(html).replace(/<[^>]+>/gm, '');

    $sailsSocket.post('/email/send', {from: $scope.email.from, to: $scope.email.from+',info@jumplink.eu', subject:'Kontaktanfrage von '+$scope.email.name+': '+$scope.email.subject, text: text, html: html}).success(function(data, status, headers, config){
      if(!$rootScope.authenticated) {
        $rootScope.pop('success', 'E-Mail wurde versendet.');
      }
      $log.debug(data);
    });
  }

  angular.extend($scope, {
    nvc: {
      lat: 53.86411893791266,
      lng: 8.70941162109375,
      zoom: 14
    },
    markers: {
      main_marker: {
        lat: 53.86682040225137,
        lng: 8.706825971603394,
        focus: true,
        //message: "Hey, drag me if you want",
        title: "Nautischer Verein Cuxhaven e.V.",
        draggable: true,
        label: {
          message: "<a target='_blank' title='Anfahrt' href='https://www.google.de/maps/dir//Kapit%C3%A4n-Alexander-Stra%C3%9Fe+40,+27472+Cuxhaven/@53.8668035,8.7066221,17z/data=!4m13!1m4!3m3!1s0x47b4040e075eaf1f:0xfaba82b12994a2e!2sKapit%C3%A4n-Alexander-Stra%C3%9Fe+40,+27472+Cuxhaven!3b1!4m7!1m0!1m5!1m1!1s0x47b4040e075eaf1f:0xfaba82b12994a2e!2m2!1d8.7066221!2d53.8668035?hl=de'>Nautischer Verein Cuxhaven e.V.<br>Kapitän­-Alexander­-Str. 40<br>27472 Cuxhaven</a>",
          options: {
            noHide: true
          }
        }
      }
    }
  });

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'imprint':
            $scope.imprint = msg.data.content;;
            if($rootScope.authenticated) {
              $rootScope.pop('success', 'Impressums-Text wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

});
