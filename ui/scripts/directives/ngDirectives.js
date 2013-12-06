define(['directives/directives'], function(directives) {
  directives.directive('resize', function($window) {
    return function(scope, element) {
      var w = angular.element($window);
      scope.getWindowDimensions = function() {
        return {
          'h': w.height(),
          'w': w.width()
        };
      };
      scope.$watch(scope.getWindowDimensions, function(newValue, oldValue) {
        scope.windowHeight = newValue.h;
        scope.windowWidth = newValue.w;

        scope.style = function() {
          return {
            'height': (newValue.h - 100) + 'px',
            'width': (newValue.w - 100) + 'px'
          };
        };

        windowWidth = scope.windowWidth;
        windowHeight = scope.windowHeight;

        scope.$broadcast('resize', windowWidth, windowHeight);
        
      }, true);

      w.bind('resize', function() {
        scope.$apply();
      });
    }
  });
  directives.directive('ngEnter', function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter);
          });
          event.preventDefault();
        }
      });
    };
  });
  directives.directive('ngShift', function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if (event.which === 16) {
          scope.$apply(function() {
            scope.$eval(attrs.ngShift);
          });
          event.preventDefault();
        }
      });
    };
  });
});
