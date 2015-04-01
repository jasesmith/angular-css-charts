angular.module('app', ['ui.sortable'])
    .controller('AppController', ['$scope', function($scope) {

        $scope.headline = 'CSS Charts';
        $scope.icon = 'pie-chart';
        $scope.template = 'donut';
        $scope.spacecat = false;
        $scope.chart1 = {
            capacity: 1850,
            segments: [
                {label: 'apple', value: 210, color: '#fc1770'},
                {label: 'tangerine', value: 158, color: '#ff7f36'},
                {label: 'banana', value: 50, color: '#fff261'},
                {label: 'kiwi', value: 180, color: '#94ca3d'},
                {label: 'sky', value: 251, color: '#15c5ec'},
                {label: 'berry', value: 307, color: '#c657af'},
                {label: 'plum', value: 555, color: '#7f3fa6'},
                // {label: 'dark', value: 655, color: '#232629'},
            ]
        };

        $scope.dragControlListeners = {
            accept: function () {
                return true; //override to determine drag is allowed or not. default is true.
            },
            dragEnd: function(item){
                if(item.source.index !== item.dest.index) {
                    var navs = angular.copy($scope.navs);
                    navs.move(navs[item.source.index], navs[item.dest.index]);
                }
            },
            containment: '.omni-nav-grid'
        };

    }]);
