//ordersFiltrationFormDir.js
angular.module("app").directive('ordersFiltrationForm',function($routeParams){
    return {
        restrict: 'E',
        templateUrl:'/partials/admin/orders-filtration-form',
        link: function (scope,element,attrs) {
            scope.searchForm={};
            scope.clearSearch= function () {
                scope.searchForm={};
            };

        }
    };
});