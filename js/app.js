angular.module('app', ['jamfu'])
    .controller('AppController', ['$scope', function($scope) {

        $scope.headline = 'CSS Charts';
        $scope.icon = 'pie-chart';
        $scope.spacecat = false;
        $scope.newSegment = {};

        $scope.sizeUnits = [
            'vmin',
            'vmax',
            'vw',
            'vh',
            'rem',
            'em',
            'px',
            'pt'
        ];

        $scope.unit = 'vmin';

        $scope.chart1 = {
            // settings: {
            //     type: 'donut',
            //     template: 'examples/template-%type%.html'
            // },
            capacity: 1850,
            segments: [
                {label: 'apple', value: 210, class: 'fg-apple', xcolor: '#fc1770'},
                {label: 'tangerine', value: 158, class: 'fg-tangerine', xcolor: '#ff7f36'},
                {label: 'banana', value: 50, class: 'fg-banana', xcolor: '#fff261'},
                {label: 'kiwi', value: 180, class: 'fg-kiwi', xcolor: '#94ca3d'},
                {label: 'sky', value: 251, class: 'fg-sky', xcolor: '#15c5ec'},
                {label: 'berry', value: 307, class: 'fg-berry', xcolor: '#c657af'},
                {label: 'plum', value: 555, class: 'fg-plum', xcolor: '#7f3fa6'}
            ]
        };

        var initialCapacity = angular.copy($scope.chart1.capacity);
        var initialSegments = angular.copy($scope.chart1.segments);

        $scope.autoCapacity = false;
        $scope.chartMax = initialCapacity;
        $scope.chartSize = 35;

        $scope.$watch('autoCapacity', function(n){
            $scope.chart1.capacity = n ? ($scope.chart1.settings.type === 'bars' ? 100 : 0) : initialCapacity;
            $scope.chartMax = n ? 100 : initialCapacity;
            if(n) {
                _.each($scope.chart1.segments, function(segment){
                    segment.value = (segment.value / initialCapacity * 100).toFixed(1) * 1;
                });
            } else {
                _.each($scope.chart1.segments, function(segment, i){
                    segment.value = initialSegments[i].value;
                });
            }
        });

        $scope.addSector = function(){
            $scope.chart1.segments.push($scope.newSegment);
            initialSegments = angular.copy($scope.chart1.segments);
            $scope.newSegment = {};
        };

    }]);
