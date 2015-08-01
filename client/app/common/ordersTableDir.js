//ordersTableDir.js

angular.module("app").directive('ordersTable',function($timeout){
    return {
        restrict: 'E',
        templateUrl:'/partials/common/orders-table',
        link: function (scope,element,attrs) {

            //отримання сумарної ціни
            scope.getAllOrdersPrice= function () {
                if(!scope.orders) return 0;
                var price=0;
                for(var i=0;i<scope.orders.length;i++){
                    price+=scope.orders[i].totalPrice;
                }
                return price;
            };

        }
    };
});