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
                    segments: [
                        {label: 'thing 1', value: 230, color: colors[0].name},
                        {label: 'thing 2', value: 1768, color: colors[1].name},
                        {label: 'thing 3', value: 100, color: colors[2].name},
                        {label: 'thing 4', value: 130, color: colors[3].name},
                        {label: 'thing 5', value: 100, color: colors[4].name},
                        {label: 'thing 6', value: 107, color: colors[5].name},
                        {label: 'thing 7', value: 100, color: 'dark'}
                    ]
                };

                // pull in app's menu config or from MenuConfig provider
                $scope.config = $.extend(true, angular.copy(defaultConfig), $scope.config);

                var fixSectorSizes = function(segments){
                    var l = segments.length;
                    var total = 0;
                    _.each(segments, function(s){
                        total = total + s.value;
                    });
                    _.each(segments, function(segment, i){
                        // convert segment value into nº (degrees)
                        if(!segment.isContinued) {
                            segment.value = (segment.value/total * 360).toFixed(2);
                            // more than 180º causes display failure
                            if(segment.value > 180) {
                                var newSegment = angular.copy(segment);
                                newSegment.value = (segment.value - 180 * 1).toFixed(2);
                                segment.value = 180 * 1;
                                newSegment.label = segment.label + ' (cont)';
                                newSegment.isContinued = true;
                                segments.splice(i+1, 0, newSegment);
                            }
                        }
                    });
                    if(l < segments.length) {
                        segments[segments.length-1].value = (segments[segments.length-1].value/total * 360).toFixed(2);
                    }
                };

                fixSectorSizes($scope.config.segments);

                $scope.setSector = function(segment, index) {
                    if(segment) {
                        var val = segment.value * 1;
                        index = index || 0;

                        // if(index > 0) {
                            _.each($scope.config.segments, function(s, i){
                                if(i < index) {
                                    val = val + s.value * 1;
                                }
                            });
                        // }

                        return {
                            transform: 'rotate('+val+'deg)'
                        };
                    }
                };
            }],

            template: '' +
                '<div class="chart" type="donut">' +
                    '<div ng-repeat="segment in config.segments" class="segment" ng-style="setSector(config.segments[$index - 1], $index-1)">' +
                        '<div class="wedge bg-{{segment.color}}" ng-style="setSector(segment)" title="{{segment.label}}: {{segment.value}}"></div>' +
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
