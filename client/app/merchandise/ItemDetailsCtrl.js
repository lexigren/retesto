//ItemDetailsCtrl.js

angular.module("app").controller("ItemDetailsCtrl", function ($scope,$routeParams,CRUDRequest, $window, $location, Identity, cart, Notifier) {

    $scope.identity=Identity;

    $scope.item={
      replies:[]
    };

    //запит товару за id
    CRUDRequest.query("items/"+$routeParams.id).$promise.then(function (result) {
        $scope.item=result[0];
        //встановлення заголовку сторінки
        $window.document.title = $scope.item.name;
    //якщо сервер не повернув товар відсилаємо на 404
    }, function (reason) {
        $location.path("/404");
    });

    //відкриття слайдеру
    $scope.openImageSlider= function () {
        $scope.sliderActive=true;
        $scope.$broadcast('loadSliderData');
    };

    $scope.addToCart= function () {
        cart.add($scope.item);
    }

});