// The app/scripts/app.js file, which defines our AngularJS app
define(['angular', 'controllers/controllers',
  'services/services', 'filters/filters',
  'directives/directives'], function (angular) {
  return angular.module('nodebook', ['controllers', 'services',
    'filters', 'directives', 'ui.bootstrap']);
});
