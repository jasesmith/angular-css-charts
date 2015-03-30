angular.module('app')
    .factory('sectors', [function(){

        var setDegree = function(value, total){
            return (value/total * 360).toFixed(2) * 1;
        };

        var setPercent = function(value, total){
            return (value/total * 100).toFixed(2) * 1;
        };

        var getTotals = function(segments, capacity){
            var total = 0;
            var actual = 0;
            var overage = 0;
            var available = 0;

            _.each(segments, function(segment){
                actual = actual + segment.value;
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
        var _splitSector = function(segment, index, segments){
            var newSegment = angular.copy(segment);
            newSegment._degrees = (segment._degrees - 180).toFixed(2) * 1;
            segment._degrees = 180;
            segment._split = newSegment._degrees;
            newSegment.label = segment.label + ' (cont)';
            newSegment._continued = true;
            segments.splice(index + 1, 0, newSegment);
            // return;
        };

        var processSectors = function(segments, capacity, calcs){
            // store some metrics
            calcs = calcs || getTotals(segments, capacity);
            var l = segments.length;
            var prev = 0;

            // convert segment value from n (raw number) into meaningful values
            // in context of our charts: nº (degrees) and n% (percent)
            _.each(segments, function(segment, i){
                if(!segment._continued) { // but only for origin segments, not split-off continuations
                    segment._degrees = setDegree(segment.value, calcs.total.num);
                    segment._percent = setPercent(segment.value, calcs.total.num);
                    if(segment._degrees > 180) {
                        _splitSector(segment, i, segments);
                    }
                }
            });

            // in the event of a split segment that is not a continuation, we
            // need to manually process the last segment cause the split shifted
            // the index pointer without the 'each()' knowing about it.
            var lastSegment = _.last(segments);
            if(l < segments.length && !lastSegment._continued) {
                lastSegment._degrees = setDegree(lastSegment.value, calcs.total.num);
                lastSegment._percent = setPercent(lastSegment.value, calcs.total.num);
                if(lastSegment._degrees > 180) {
                    _splitSector(lastSegment, segments.length, segments);
                    segments[segments.length-1]._degreeStart = (prev + lastSegment._degrees).toFixed(2);
                }
            }

            _.each(segments, function(segment, i){
                var previousSegment = _previousSector(segments, i);

                prev = prev + (previousSegment ? (segment._continued ? previousSegment._degrees : previousSegment._degrees + (previousSegment._split ? previousSegment._split : 0)) : 0);
                segment._degreeStart = prev.toFixed(2);
                window.console.log(segments[i].label, segment._degrees, segment._split, segment._degreeStart);
            });

            // if capacity is set and an overage exists, treat it like a new
            // segment and build it, and possibly split it (that's a huge overage!)
            // if(calcs.overage.num) {
            //     segments.push({
            //         label: 'Overage',
            //         value: calcs.overage.num,
            //         class: 'overage',
            //         _overage: true,
            //         _degrees: setDegree(calcs.overage.num, calcs.total.num),
            //         _percent: setPercent(calcs.overage.num, calcs.total.num),
            //         _degreeStart: (lastSegment._degrees + lastSegment._degreeStart * 1)
            //     });
            //     _splitSector(_.last(segments), false, segments);
            // }
            window.console.log(segments);
        };

        // =================== depricated ===================
        // var setRotation = function(segment, index, segments) {
        //     if(segment) {
        //         index = index || 0;
        //
        //         // insurance that we have a number, not a string: 10 vs. "10"
        //         var d = segment._degrees * 1;
        //
        //         // determine the rotation degrees to apply to the start of each sector
        //         // based on the accumulation of degrees for each previous sector
        //         _.each(segments, function(s, i){
        //             if(i < index) {
        //                 window.console.log('loop setRotation', s.label, i, index);
        //                 d = d + s._degrees * 1;
        //             }
        //         });
        //
        //         // default styles object to return
        //         var styles = {
        //             opacity: 0.95,
        //             transform: 'rotate('+d+'deg)'
        //         };
        //
        //         // if(d > 360) {
        //         //     styles.transform = 'rotate('+d+'deg) scale(.9)';
        //         // }
        //
        //         // handle overage and split segments
        //         if(segment._overage) {
        //             if(segment._continued) {
        //                 styles.transform = 'rotate('+d+'deg)';
        //             } else {
        //                 styles.opacity = 0.5;
        //                 styles.transform = 'rotate('+d+'deg) scale(.9)';
        //             }
        //         }
        //
        //         return styles;
        //     }
        // };

        return {
            setDegree: setDegree,
            setPercent: setPercent,
            // splitSegment: splitSegment,
            // setRotation: setRotation,
            getTotals: getTotals,
            processSectors: processSectors
        };
    }]);
