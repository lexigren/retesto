//OrderListCtrl.js

angular.module("app").controller("OrderListCtrl", function ($scope,CRUDRequest,Identity,$routeParams,Notifier,$location,$window) {

    $scope.orders=[];
    $scope.status=$routeParams.status;

    CRUDRequest.query("orders/"+$routeParams.status).$promise.then(function (result) {
        $scope.orders = result;
        $window.document.title = "Orders with "+$scope.status+" status";
    }, function (reason) {
        Notifier.error(reason.data.reason);
        $location.path("/");
    });

});