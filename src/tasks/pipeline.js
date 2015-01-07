/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  'styles/**/*.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [

  // Dependencies like sails.io.js, jQuery, or Angular
  // are brought in here

  //- es5-shim: ECMAScript 5 compatibility shims for legacy JavaScript engines: https://github.com/es-shims/es5-shim
  "/third-party/es5-shim/es5-shim.js",
  "/third-party/es5-shim/es5-sham.js",
  "/third-party/jquery/dist/jquery.js",
  "/third-party/jquery-bridget/jquery.bridget.js",

  //- angular-masonry
  // "/third-party/get-style-property/get-style-property.js",
  // "/third-party/get-size/get-size.js",
  // "/third-party/eventEmitter/EventEmitter.js",
  // "/third-party/eventie/eventie.js",
  // "/third-party/doc-ready/doc-ready.js",
  // "/third-party/matches-selector/matches-selector.js",
  // "/third-party/outlayer/item.js",
  // "/third-party/outlayer/outlayer.js",
  // "/third-party/masonry/masonry.js",
  // "/third-party/imagesloaded/imagesloaded.js",

  //- angular
  "/third-party/angular/angular.js",
  "/third-party/angular-i18n/angular-locale_de.js",
  "/third-party/moment/moment.js",
  "/third-party/angular-moment/angular-moment.js",
  "/third-party/moment/locale/de.js",
  "/third-party/angular-fullscreen/src/angular-fullscreen.js",
  "/third-party/webodf/webodf-debug.js",
  "/third-party/angular-animate/angular-animate.js",
  "/third-party/angular-ui-router/release/angular-ui-router.js",
  "/third-party/angular-sanitize/angular-sanitize.js",
  "/third-party/angular-touch/angular-touch.js",
  "/third-party/angular-strap/dist/angular-strap.js",
  "/third-party/angular-carousel/dist/angular-carousel.js",
  "/third-party/angular-fullscreen/src/angular-fullscreen.js",

  //- textAngular
  //- "/third-party/textAngular/dist/textAngular.min.js",

  //- angular-medium-editor
  "/third-party/medium-editor/dist/js/medium-editor.js",
  "/third-party/angular-medium-editor/dist/angular-medium-editor.js",

  //- angular-ui-ace
  "/third-party/ace-builds/src-noconflict/ace.js",
  "/third-party/angular-ui-ace/ui-ace.js",

  //- angular-masonry
  // "/third-party/angular-masonry/angular-masonry.js",

  //- html, css, javascript beautifier
  "/third-party/js-beautify/js/lib/beautify.js",
  "/third-party/js-beautify/js/lib/beautify-css.js",
  "/third-party/js-beautify/js/lib/beautify-html.js",

  //- angular-leaflet-directive: https://github.com/tombatossals/angular-leaflet-directive
  "/third-party/leaflet/dist/leaflet-src.js",
  "/third-party/Leaflet.label/dist/leaflet.label-src.js",
  "/third-party/angular-leaflet-directive/dist/angular-leaflet-directive.js",

  //- AngularJS-Toaster: https://github.com/jirikavi/AngularJS-Toaster: https://github.com/jirikavi/AngularJS-Toaster
  "/third-party/AngularJS-Toaster/toaster.js",

  //- async: https://github.com/caolan/async
  "/third-party/async/lib/async.js",

  //- generic angular filters: https://github.com/niemyjski/angular-filters
  "/third-party/ng-filters/dist/angular-filters.js",

  //- angular-file-upload: https://github.com/nervgh/angular-file-upload
  "/third-party/angular-file-upload/angular-file-upload.js",

  // angular-nouislider: https://github.com/vasyabigi/angular-nouislider
  "/third-party/nouislider/jquery.nouislider.js",
  "/third-party/nouislider/Link.js",
  "/third-party/angular-nouislider/src/nouislider.js",

  // HighchartsJS powered charts directives for Angular: https://github.com/gevgeny/ui-highcharts
  "/third-party/highcharts-release/highcharts.src.js",
  // FIXME "/third-party/highcharts-release/modules/canvas-tools.src.js",
  "/third-party/highcharts-release/modules/data.src.js",
  "/third-party/highcharts-release/modules/drilldown.src.js",
  "/third-party/highcharts-release/modules/exporting.src.js",
  "/third-party/highcharts-release/modules/funnel.src.js",
  "/third-party/highcharts-release/modules/heatmap.src.js",
  "/third-party/highcharts-release/modules/no-data-to-display.src.js",
  // FIXME "/third-party/highcharts-release/modules/solid-gauge.src.js",
  // FIXME "/third-party/highstock-release/highstock.src.js",
  "/third-party/highmaps-release/modules/map.src.js",
  "/third-party/ui-highcharts/dist/ui-highcharts.js",
  // Alternative directive
  "/third-party/highcharts-ng/src/highcharts-ng.js",

  // angular-load: Dynamically load scripts and css stylesheets in your Angular.JS app: https://github.com/urish/angular-load
  "/third-party/angular-load/angular-load.js",

  //- Bring in the socket.io client
  "/js/dependencies/sails.io.js",
  //- and for angular
  "/third-party/angularSails/dist/ngsails.io.js",

  "/js/app.js",
  "/js/bootstrap.js",
  "/js/translations.js",
  "/js/services.js",
  "/js/controllers.js",
  "/js/bootstrap/controllers.js",
  "/js/bootstrap/directives.js",
  "/js/directives/*.js",
];


// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  'templates/**/*.html'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
  return 'assets/' + path;
});
