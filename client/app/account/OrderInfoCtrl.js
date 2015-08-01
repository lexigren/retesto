//OrderInfoCtrl.js

angular.module("app").controller("OrderInfoCtrl", function ($scope,CRUDRequest,Identity,$routeParams,$window,$location,Notifier,$timeout) {

    $scope.order={
        items:[]
    };

    CRUDRequest.query("users/"+$routeParams.id+"/orders/"+$routeParams.orderId).$promise.then(function (result) {
        $scope.cachedOrder=result[0];
        angular.copy(result[0],$scope.order);
        $window.document.title = "Order info";
    }, function (reason) {
        Notifier.error(reason.data.reason);
        $location.path("/");
    });

    //якщо поточний користувач є доставником
    if(Identity.isAuthorized("deliverer")){
        $scope.editMode=true;
        //доступні статуси замовлення
        $scope.states=["queuing","shipping","delivered","rejected"];

        $scope.update= function () {
            //запит оновлення замовлення
            CRUDRequest.request("users/"+$routeParams.id+"/orders").update($scope.order,
               function (result) {
                    //оновлення кешу
                    if($scope.order.status!==$scope.cachedOrder.status){
                        CRUDRequest.removeFromCache("orders/"+$scope.cachedOrder.status,$scope.cachedOrder._id);
                        CRUDRequest.addToCache("orders/"+$scope.order.status,$scope.order);
                        angular.copy($scope.order,$scope.cachedOrder);
                    }
                    Notifier.notify("Order updated");
            }, function (reason) {
                    Notifier.error(reason.data.reason);
            });
        };

        //друк замовлення
        $scope.print= function () {
            $scope.printing=true;
            $timeout(function () {
                window.print();
                $scope.printing=false;
            });
        };

    }

});