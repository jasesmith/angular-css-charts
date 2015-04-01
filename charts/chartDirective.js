angular.module('app')
    .directive('chart', [function() {

        var setDegree = function(value, total){
            return (value/total * 360).toFixed(1) * 1;
        };

        var setPercent = function(value, total){
            return (value/total * 100).toFixed(1) * 1;
        };

        var getTotals = function(segments, capacity){
            var total = 0;
            var actual = 0;
            var overage = 0;
            var available = 0;

            _.each(segments, function(segment){
                actual = actual + (segment.value * 1);
            });

            total = actual;

            if(capacity) {
                total = capacity;
                if(actual > total) {
                    overage = actual - total;
                } else {
                    available = total - actual;
                }
            }

            return {
                total: { num: total, pct: setPercent(total, total)},
                actual: {num: actual, pct: setPercent(actual, total)},
                overage: {num: overage, pct: setPercent(overage, total)},
                available: {num: available, pct: setPercent(available, total)}
            };
        };

        var _previousSector = function(segments, index){
            return (index === 0 ? false : segments[index-1]);
        };

        // more than 180º causes display failure
        var _splitSector = function(segment, split){
            split = split || 180;
            var array = [];
            var times = Math.ceil(segment._degrees/split);

            _.times(times, function(index){
                var newSegment = _.clone(segment);

                newSegment._degrees = split;
                newSegment._continued = false;
                if(index > 0) {
                    newSegment._continued = true;
                    newSegment.label += '-' + index;
                }

                if(index + 1 === times) {
                    newSegment._degrees = segment._degrees - (split * index);
                }

                array.push(newSegment);
            });

            return array;
        };

        var processSectors = function(segments, capacity, calcs){
            // store some metrics
            calcs = calcs || getTotals(segments, capacity);
            var prev = 0;

            segments = _.map(segments, function(segment){
                segment._degrees = setDegree(segment.value, calcs.total.num);
                segment._percent = setPercent(segment.value, calcs.total.num);

                if(segment._degrees > 180) {
                    return _splitSector(segment);
                } else {
                    return [segment];
                }
            });

            segments = _.flatten(segments);

            segments = _.each(segments, function(segment, i){
                var previousSegment = _previousSector(segments, i);

                prev = prev + (previousSegment ? (segment._continued ? previousSegment._degrees : previousSegment._degrees + (previousSegment._split ? previousSegment._split : 0)) : 0);
                segment._degreeStart = prev.toFixed(1);
            });

            return segments;
        };

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

                $scope.config = $.extend(true, defaultConfig, $scope.config);

                $scope.totals = getTotals($scope.config.segments, $scope.config.capacity);

                $scope.config.segments = processSectors($scope.config.segments, $scope.config.capacity, $scope.totals);

                // $scope.$watch(function(){
                //     return $scope.config;
                //     }, function(newVal, oldVal){
                //         // window.console.log('dir watcher', newVal, oldVal);
                //         if(newVal !== oldVal) {
                //             $scope.config = $.extend(true, defaultConfig, $scope.config);
                //             $scope.totals = getTotals($scope.config.segments, $scope.config.capacity);
                //             $scope.config.segments = processSectors($scope.config.segments, $scope.config.capacity, $scope.totals);
                //         }
                //     },
                //     true
                // );
            }],

            templateUrl: function(element, attr){
                return 'charts/template-' + attr.template + '.html';
            }

        };
    }]);
