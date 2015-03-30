angular.module('app')
.directive('scrollIn', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        scope: {
            delay: '@scrollDelay'
        },
        link: function(scope, $element, $attrs) {
            var delay = scope.delay ? scope.delay : 0;
            $element.on('click', function() { // $event
                $timeout(function(){
                    $($attrs.scrollIn).scrollTo($($attrs.to), 300);
                }, delay);
            });
        }
    };
}]);
