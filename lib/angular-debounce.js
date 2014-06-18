'use strict';

/*
Original version at https://github.com/shahata/angular-debounce

Modification by Lucas Garron:
`func` triggers immediately, and then once more after the bouncing is over.

This means you get immediate feedback in case of a single action,
but additional actions are debounced until the last one.
*/


angular.module('debounce', [])
  .service('debounce', ['$timeout', function ($timeout) {
    return function (func, wait, callback) {
      callback = callback || function(){};
      var timeout, args, context, result;
      function debounce() {
        /* jshint validthis:true */
        context = this;
        args = arguments;
        var later = function () {
          timeout = null;
          result = func.apply(context, args);
          callback("later");
        };
        var callNow = !timeout;
        if (timeout) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          callback("now");
        }
        else {
          callback("delayed");
        }
        return result;
      }
      debounce.cancel = function () {
        $timeout.cancel(timeout);
        timeout = null;
        callback("cancel");
      };
      return debounce;
    };
  }])
  .directive('debounce', ['debounce', function (debounce) {
    return {
      require: 'ngModel',
      priority: 999,
      scope: {
        debounce: '@',
        debounceCallback: '@'
      },
      link: function ($scope, $element, $attrs, ngModelController) {
        var debouncedValue, pass;
        var prevRender = ngModelController.$render.bind(ngModelController);
        var commitSoon = debounce(function (viewValue) {
          pass = true;
          ngModelController.$setViewValue(viewValue);
          pass = false;
        }, parseInt($scope.debounce), $element.scope()[$scope.debounceCallback]);
        ngModelController.$render = function () {
          prevRender();
          commitSoon.cancel();
          //we must be first parser for this to work properly,
          //so we have priority 999 so that we unshift into parsers last
          debouncedValue = this.$viewValue;
        };
        ngModelController.$parsers.unshift(function (value) {
          if (pass) {
            debouncedValue = value;
            return value;
          } else {
            commitSoon(ngModelController.$viewValue);
            return debouncedValue;
          }
        });
      }
    };
  }]);
