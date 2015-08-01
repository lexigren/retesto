//UserOrdersCtrl.js

angular.module("app").controller("UserOrdersCtrl", function ($scope,CRUDRequest,Identity,$routeParams,Notifier,$location,$window) {

    $scope.orders=[];

    CRUDRequest.query("users/"+$routeParams.id+"/orders").$promise.then(function (result) {

        if(!result.length){
            Notifier.error("User has no orders yet");
            $location.path("/");
        }else {
            $scope.orders = result;
            $scope.username = "" + $scope.orders[0].customer.firstName + " " + $scope.orders[0].customer.lastName;
        }
    }, function (reason) {
        Notifier.error(reason.data.reason);
        $location.path("/");
    });

});