var _ = require('underscore');
var segments = [
    {label: 'apple', value: 210, color: '#fc1770'},
    {label: 'tangerine', value: 58, color: '#ff7f36'},
    // {label: 'banana', value: 50, color: '#fff261'},
    // {label: 'kiwi', value: 180, color: '#94ca3d'},
    // {label: 'sky', value: 25, color: '#15c5ec'},
    // {label: 'berry', value: 37, color: '#c657af'},
    // {label: 'plum', value: 65, color: '#7f3fa6'}
];

var setDegree = function(value, total){
    return (value/total * 360).toFixed(1) * 1;
};

var extendSegment = function(segment){
    var newSegment = _.clone(segment);

    newSegment._degrees = (segment._degrees - 180).toFixed(1) * 1;
    segment._degrees = 180;
    segment._split = newSegment._degrees;
    newSegment.label = segment.label + ' (cont)';
    newSegment._continued = true;

    return newSegment;
};

// more than 180º causes display failure
var _splitSector = function(segment){
    var arr = [];
    var times = Math.ceil(segment.value/180);

    _.times(times, function(i){
        var newSegment = _.clone(segment);

        newSegment.value = 180;

        console.log(times, i);
        if(times-1 === i) {
            newSegment.value = segment.value - (180*i);
        }

        arr.push(newSegment);
    });

    return arr;
};


var things = _.map(segments, function(segment){

    if(segment.value < 181) {
        return [segment];
    } else {
        return _splitSector(segment);
    }
});

var thing = _.flatten(things);

console.log(things);
console.log(thing);
