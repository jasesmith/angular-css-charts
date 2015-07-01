angular.module('app', ['jamfu'])
    .controller('AppController', ['$scope', function($scope) {

        $scope.headline = 'CSS Charts';
        $scope.icon = 'pie-chart';
        $scope.spacecat = false;
        $scope.newSegment = {
            label: '',
            class: '',
            color: '',
            value: '0'
        };

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
                {label: 'apple', value: 210, xclass: 'fg-apple', color: '#fc1770'},
                {label: 'tangerine', value: 158, xclass: 'fg-tangerine', color: '#ff7f36'},
                {label: 'banana', value: 50, xclass: 'fg-banana', color: '#fff261'},
                {label: 'kiwi', value: 180, xclass: 'fg-kiwi', color: '#94ca3d'},
                {label: 'sky', value: 251, xclass: 'fg-sky', color: '#15c5ec'},
                {label: 'berry', value: 307, xclass: 'fg-berry', color: '#c657af'},
                {label: 'plum', value: 555, xclass: 'fg-plum', color: '#7f3fa6'}
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

        $scope.removeSector = function($index){
            $scope.chart1.segments.splice($index, 1);
            initialSegments = angular.copy($scope.chart1.segments);
        };


    }]);
