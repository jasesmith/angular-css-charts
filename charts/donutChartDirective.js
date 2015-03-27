angular.module('app')
    .directive('donutChart', [function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                config: '=?'
            },
            controller: ['$scope', function($scope){
                var defaultConfig = {
                    capacity: 500,
                    segments: [
                        {label: 'thing 1', value: 450, color: colors[0].name},
                        {label: 'thing 2', value: 768, color: colors[1].name},
                        {label: 'thing 3', value: 100, color: colors[2].name},
                        {label: 'thing 4', value: 130, color: colors[3].name},
                        {label: 'thing 5', value: 100, color: colors[4].name},
                        {label: 'thing 6', value: 107, color: colors[5].name},
                        {label: 'thing 7', value: 100, color: 'dark'}
                    ]
                };

                // pull in app's menu config or from MenuConfig provider
                $scope.config = $.extend(true, angular.copy(defaultConfig), $scope.config);

                var setDegree = function(value, total){
                    return (value/total * 360).toFixed(2);
                };

                var setPercent = function(value, total){
                    return (value/total * 100).toFixed(2);
                };

                var splitSegment = function(segment, index, segments){
                    if(segment._degrees > 180) {
                        var newSegment = angular.copy(segment);
                        newSegment._degrees = (segment._degrees - 180).toFixed(2) * 1;
                        segment._degrees = 180;
                        newSegment.label = segment.label + ' (cont)';
                        newSegment._percent = segment._percent;
                        newSegment._continued = true;
                        if(index) {
                            segments.splice(index + 1, 0, newSegment);
                        } else {
                            segments.push(segment, newSegment);
                        }
                    }
                };

                var fixSectorSizes = function(segments){
                    var l = segments.length;
                    var total = 0;
                    var actual = 0;
                    var overage = 0;
                    if($scope.config.capacity) {
                        total = $scope.config.capacity;
                        _.each(segments, function(s){
                            actual = actual + s.value;
                        });
                        if(actual > total) {
                            overage = actual-total;
                            total = actual;
                        }
                        window.console.log(total, overage);
                    } else {
                        _.each(segments, function(s){
                            total = total + s.value;
                        });
                    }
                    _.each(segments, function(segment, i){
                        // convert segment value into nº (degrees)
                        if(!segment._continued) {
                            segment._degrees = setDegree(segment.value, total);
                            segment._percent = setPercent(segment.value, total);

                            // more than 180º causes display failure
                            splitSegment(segment, i, segments);
                        }
                    });
                    var lastSegment = _.last(segments);
                    if(l < segments.length && !lastSegment._continued) {
                        lastSegment._degrees = setDegree(lastSegment.value, total);
                        lastSegment._percent = setPercent(lastSegment.value, total);
                    }
                    if(overage) {
                        var overageSegment = {
                            color: 'dark'
                        };
                        overageSegment._degrees = setDegree(overage, total);
                        overageSegment._percent = setPercent(overage, total);
                        overageSegment._overage = true;
                        splitSegment(overageSegment, false, segments);
                        window.console.log(overageSegment);
                    }
                    $scope.config._overage = overage;
                    $scope.config._total = total;
                    $scope.config._actual = actual;
                };

                fixSectorSizes($scope.config.segments);

                $scope.setSector = function(segment, index) {
                    if(segment) {
                        var d = segment._degrees * 1;
                        index = index || 0;

                        _.each($scope.config.segments, function(s, i){
                            if(i < index) {
                                d = d + s._degrees * 1;
                            }
                        });

                        var styles = {
                            transform: 'rotate('+d+'deg)'
                        };

                        if(segment._overage) {
                            if(segment._continued) {
                                styles.transform = 'rotate('+d+'deg)';
                            } else {
                                styles.opacity = 0.5;
                                styles.transform = 'rotate('+d+'deg) scale(.85)';
                            }
                        }
                        return styles;
                    }
                };
            }],

            template: '' +
                '<div class="chart" type="donut">' +
                    '<div ng-repeat="segment in config.segments" class="segment" title="{{segment.label}}: {{segment.value}} {{segment._percent}}% {{segment._degrees}}&deg;" ng-style="setSector(config.segments[$index - 1], $index-1)">' +
                        '<div class="wedge bg-{{segment.color}}" ng-style="setSector(segment)"></div>' +
                    '</div>' +
                    '<div class="center-label">' +
                        'cap: {{config.capacity}}<br />' +
                        'used: {{config._actual}}<br />' +
                        'over: {{config._overage}}<br />' +
                    '</div>' +
                '</div>' +
            '',

            link: function(scope, $element, $attrs) {
            }
        };
    }]);


    // <div class="donut-chart">
    //     <div id="porcion1" class="recorte"><div class="quesito ios" data-rel="21"></div></div>
    //     <div id="porcion2" class="recorte"><div class="quesito mac" data-rel="39"></div></div>
    //     <div id="porcion3" class="recorte"><div class="quesito win" data-rel="31"></div></div>
    //     <div id="porcionFin" class="recorte"><div class="quesito linux" data-rel="9"></div></div>
    //     <p class="center-date">JUNE<br><span class="scnd-font-color">2013</span></p>
    // </div>
