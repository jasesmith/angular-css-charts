angular.module('app')
    .directive('cssChart', [function() {
        var me = this;

        me._setDegree = function(value, total){
            if (total === 0) {
                return 0;
            } else {
                return parseFloat(value / total * 360);
            }
        };

        me._setPercent = function(value, total){
            if (total === 0) {
                return 0;
            } else {
                return parseFloat(value / total * 100);
            }
        };

        me._previousSector = function(segments, index){
            return (index === 0 ? false : segments[index-1]);
        };

        // more than 180º causes display failure
        me._splitSector = function(segment, split){
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

        me.getTotals = function(segments, capacity){
            var total = 0;
            var actual = 0;
            var overage = 0;
            var available = 0;

            _.each(segments, function(segment){
                actual = actual + parseFloat(segment.value);
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
                total: { num: total, pct: me._setPercent(total, total)},
                actual: {num: actual, pct: me._setPercent(actual, total)},
                overage: {num: overage, pct: me._setPercent(overage, total)},
                available: {num: available, pct: me._setPercent(available, total)}
            };
        };

        me.processSectors = function(format, segments, capacity, calcs){
            // store some metrics
            calcs = calcs || me.getTotals(segments, capacity);
            var prev = 0;

            segments = _.map(segments, function(segment){
                segment._degrees = me._setDegree(segment.value, calcs.total.num);
                segment._percent = me._setPercent(segment.value, calcs.total.num);
                segment._percentCap = me._setPercent(segment.value, capacity);

                if(segment._degrees > 180 && format === 'radial') {
                    return me._splitSector(segment);
                } else {
                    return [segment];
                }
            });

            segments = _.flatten(segments);

            segments = _.each(segments, function(segment, i){
                var previousSegment = me._previousSector(segments, i);

                prev = prev + (previousSegment ? (segment._continued ? previousSegment._degrees : previousSegment._degrees + (previousSegment._split ? previousSegment._split : 0)) : 0);
                segment._degreeStart = parseFloat(prev);
            });

            return segments;
        };

        me.chartTemplateUrl = function(templateUrl, chartType){
            return templateUrl.replace('%type%', chartType);
        };

        me.chartFormat = function(type){
            return (type === 'donut' || type === 'pie' ? 'radial' : 'block');
        };

        return {
            restrict: 'E',

            replace: true,

            scope: {
                config: '=?'
            },

            template: '<div ng-include="templateUrl" class="chart-wrapper" format="{{format}}" type="{{type}}" ng-class="{\'animate\': config.preferences.animate}"></div>',

            link: function(scope){

                var defaultConfig = {
                    capacity: 0,
                    segments: [],
                    settings: {
                        type: 'donut',
                        template: 'charts/template-%type%.html'
                    },
                    preferences: {
                        animate: true,
                        precision: 1
                    }
                };

                scope.config = $.extend(true, angular.copy(defaultConfig), scope.config);

                scope.type = scope.config.settings.type;
                scope.template = scope.config.settings.template;
                scope.format = me.chartFormat(scope.type);
                scope.templateUrl = me.chartTemplateUrl(scope.template, scope.type);

                scope.$watch('config', function(n, o) {
                    scope.config = $.extend(true, angular.copy(defaultConfig), scope.config);

                    if(n.settings.type !== o.settings.type || n.settings.template !== o.settings.template) {
                        scope.type = n.settings.type;
                        scope.template = n.settings.template;
                        scope.format = me.chartFormat(scope.type);
                        if(!scope.template.length) {
                            scope.template = defaultConfig.settings.template;
                        }
                        scope.templateUrl = me.chartTemplateUrl(scope.template, scope.type);
                    }

                    var _segments = angular.copy(scope.config.segments);

                    scope.capacity = angular.copy(scope.config.capacity);

                    scope.totals = me.getTotals(_segments, scope.capacity);
                    scope.segments = me.processSectors(scope.format, _segments, scope.capacity, scope.totals);
                }, true);

            }
        };
    }])
    .directive('cssChartObject', ['$compile', function($compile) {
        var me = this;

        me.styleMe = function(forWhat){
            var style = [];

            // manage browser vendor styles for chart pieces
            switch(forWhat) {
                case 'radial-segment':
                    style.push('transform: rotate({{segment._degreeStart}}deg) scale(1)');
                    break;
                case 'radial-wedge':
                    style.push('transform: rotate({{segment._degrees}}deg)');
                    break;
                case 'radial-label':
                    style.push('transform: rotate(-{{(segment._degreeStart*1) + (segment._degrees*1)}}deg)');
                    break;
                case 'stacked-segment':
                    style.push('flex-basis: {{segment._percent}}%');
                    break;
            }

            return style.join(';');
        };

        return {
            restrict: 'A',

            replace: true,

            link: function (scope, element) {

                var template = '';

                switch(scope.type) {
                    case 'donut':
                    case 'pie':
                        template = '' +
                            '<div ng-repeat="segment in segments track by $index" class="segment" data-title="{{segment.label}}" style="' + me.styleMe('radial-segment') +'">' +
                                '<div class="wedge {{segment.class}}" ng-class="{\'continued\': segment._continued}" ng-style="{\'color\': (segment.class ? \'\' : segment.color)}" style="' + me.styleMe('radial-wedge') +'">' +
                                    '<div class="label"><span style="' + me.styleMe('radial-label') +'">{{segment.label}} {{segment._percent | number: config.preferences.precision}}%</span></div>' +
                                '</div>' +
                            '</div>';
                        break;

                    case 'bars':
                        template = '' +
                            '<div ng-repeat="segment in segments track by $index" ng-if="!segment._continued" percent="{{segment._percentCap}}" class="segment" data-title="{{segment.label}}" style="height: {{segment._percentCap}}%">' +
                                '<div class="value {{segment.class}}" ng-style="{\'color\': (segment.class ? \'\' : segment.color)}">' +
                                    '<div class="label"><span>{{segment.label}}: {{segment._percentCap | number: config.preferences.precision}}%</span></div>' +
                                '</div>' +
                            '</div>';
                        break;

                    case 'stacked':
                        template = '' +
                            '<div ng-repeat="segment in segments track by $index" class="segment" ng-if="!segment._continued && segment.value > 0" percent="{{segment._percent}}" data-title="{{segment.label}}" style="' + me.styleMe('stacked-segment') +'">' +
                                '<div class="value {{segment.class}}" ng-style="{\'color\': (segment.class ? \'\' : segment.color)}">' +
                                    '<div class="label"><span>{{segment.label}}: {{segment._percent | number: config.preferences.precision}}%</span></div>' +
                                '</div>' +
                            '</div>';

                        break;
                }

                var renderTemplate = function(element, template){
                    element.append(template);
                    var compiled = $compile(element.contents());
                    compiled(scope);
                };

                renderTemplate(element, template);
            }
        };
    }]);
