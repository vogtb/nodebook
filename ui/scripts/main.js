// the app/scripts/main.js file, which defines our RequireJS config
require.config({
  paths: {
    baseURL: '/',
    angular: 'vendor/angular.min',
    jquery: 'vendor/jquery',
    scrollTo: 'vendor/jquery.scrollTo.min',
    domReady: 'vendor/domReady',
    twitter: 'vendor/ui-bootstrap.min',
    moment: 'vendor/moment.min',
    arbor: 'vendor/arbor'
  },
  shim: {
    arbor: {
      deps: ['jquery'],
      exports: 'arbor'
    },
    scrollTo: {
      deps: ['jquery'],
      exports: 'scrollTo'
    },
    angular: {
      deps: ['jquery', 'scrollTo', 'arbor'],
      exports: 'angular'
    },
    twitter: {
      deps: ['jquery', 'angular'],
      exports: 'twitter'
    }
  }
});
require([
  'angular',
  'app',
  'domReady',
  'services/globalService',
  'services/nodeService',
  'services/graphService',
  'controllers/modalControllers',
  'controllers/rootController',
  'directives/ngDirectives',
  'twitter',
  'scrollTo',
  'moment',
  'arbor'
],
  function (angular, app, domReady) {
    'use strict';
    app.config(['$routeProvider',
      function($routeProvider) {
        //Define routes here.
      }
    ]);
    domReady(function() {
      angular.bootstrap(document, ['nodebook']);
      $('html').addClass('ng-app: nodebook');
    });
  }
);
