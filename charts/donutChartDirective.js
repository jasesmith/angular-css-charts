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

                $scope.config = $.extend(true, angular.copy(defaultConfig), $scope.config);

                $scope.totals = sectors.getTotals($scope.config.segments, $scope.config.capacity);

                $scope.config.segments = sectors.processSectors($scope.config.segments, $scope.config.capacity, $scope.totals);
            }],

            templateUrl: function(element, attr){
                window.console.log(element);
                return 'charts/template-' + attr.template + '.html';
            },
        };
    }]);
