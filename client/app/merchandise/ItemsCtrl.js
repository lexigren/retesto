//ItemsCtrl.js

//із $routeParams беремо значення url параметру "category"
angular.module("app").controller("ItemsCtrl", function ($scope,$routeParams,CRUDRequest,Identity) {

    $scope.identity=Identity;

    //встановлюємо тип сторінки - товари за категорією/тегом
    var page = $routeParams.category?{type:"category",name:$routeParams.category}:{type:"tag",name:$routeParams.tag};

        //робимо першу букву назви категорії прописною
        $scope.category = page.name.charAt(0).toUpperCase() + page.name.slice(1);
        //робимо запит всіх товарів в категорії
        $scope.items = CRUDRequest.query(page.type + "/" + page.name);


    //встановлення опцій сортування за полями для випадаючого списку
    //+/- означає прямий/зворотній напрямок
    $scope.sortReverse=false;
    $scope.sortOptions=
        [
            {value:"+name",    text:"Sort by name A-Z"},
            {value:"-name",    text:"Sort by name Z-A"},
            {value:"+received",text:"Sort by date from stale to fresh"},
            {value:"-received",text:"Sort by date from fresh to stale"},
            {value:"+produced",text:"Sort by production date from old to new"},
            {value:"-produced",text:"Sort by production date from new to old"},
            {value:"+price",   text:"Sort by price from cheap to expensive"},
            {value:"-price",   text:"Sort by price from expensive to cheap"}
        ];

    //за замовчуванням сортуємо за іменем
    $scope.sortOrder=$scope.sortOptions[0].value;

    //коли вибирається сортування з випадаючого списку, на випадок, якщо було використано сортування за заголовками стовпців,
    //яка виконується зміною $scope.sortReverse на true/false, для досягнення правильного результату зворотній напрямок скасовується
    $scope.order= function () {
        $scope.sortReverse=false;
    };

});