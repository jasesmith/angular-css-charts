angular.module('app')
    .directive('chart', ['sectors', function(sectors) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                config: '=?'
            },
            controller: ['$scope', function($scope){
                var defaultConfig = {
                    capacity: 0,
                    segments: []
                };

                // pull in app's menu config or from MenuConfig provider
                $scope.config = $.extend(true, angular.copy(defaultConfig), $scope.config);

                $scope.totals = sectors.getTotals($scope.config.segments, $scope.config.capacity);

                sectors.processSectors($scope.config.segments, $scope.config.capacity, $scope.totals);

                // sets dynamic inline style controls for transforms
                // this makes the sectors work
                // $scope.rotateSegment = function(segment, index, segments) {
                //     segments = segments || $scope.config.segments;
                //     window.console.log('\n\n');
                //     return sectors.setRotation(segment, index, segments);
                // };
            }],

            templateUrl: function(element, attr){
                return 'charts/template-' + attr.template + '.html';
            }
        };
    }]);
