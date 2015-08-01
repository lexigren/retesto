//tabsCtrl.js

angular.module("app").controller("tabsCtrl", function ($scope,cart,Identity) {

    $scope.identity=Identity;
    $scope.cart=cart;
    
    
    $scope.authorize=function (role) {
        return Identity.isAuthorized(role);
    }

});