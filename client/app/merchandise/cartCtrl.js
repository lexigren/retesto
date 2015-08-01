//cartCtrl.js

angular.module("app").controller("CartCtrl", function ($scope,cart,Identity,Notifier,CRUDRequest,$location) {

    $scope.shippingCost=50;

    $scope.identity=Identity;

    $scope.$watch("identity.currentUser", function (newVal,oldVal) {
        if(newVal) $scope.shippingAddress=newVal.address;
    });

    $scope.getCart= function () {
        return cart.get();
    };

    //отримання загальної вартості замовлення
    $scope.totalInCart= function () {
        return cart.total()+$scope.shippingCost;
    };

    $scope.removeFromCart= function (item) {
        cart.remove(item);
    };

    //перевірка заповненості всіх необхідних полів
    $scope.orderFilled= function () {
        return !cart.isEmpty() && $scope.shippingAddress!==undefined && Identity.currentUser;
    };

    //запит підтвердження замовлення
    $scope.askOrderConfirmation= function () {

        //відсилання запиту на збереження замовлення
        $scope.proceedOrder= function () {
          CRUDRequest.request("users/"+Identity.currentUser._id+"/orders").save({
              items:cart.get(),
              address:$scope.shippingAddress
          },
              function (response) {
                  Notifier.notify("Your order is awaiting verification!");
                  cart.clear();
                  CRUDRequest.addToCache("users/"+Identity.currentUser._id+"/orders",response.order);
                  $location.path("/");
              },
              function (reason) {
                  Notifier.error(reason.data.reason);
              });
        };


        Notifier.modalWindow($scope,{
            class:"modal-danger",
            title:"Confirm your order!",
            message:"Are you sure, you want to order this item(s)?",
            confirm:"Order!",
            callback: "proceedOrder()"
        });
    }

});