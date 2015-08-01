//paginationDir.js

angular.module("app").directive('pagination',function(){
    return {
        restrict: 'E',
        require:'ngModel',
        //перелічення атрибутів директиви, значення яких вказує на поля з зовнішнього $scope, які будуть
        //зв’язані з полями внутрішнього scope директиви
        //в файлі detailed-info.jade ми встановили значенням атрибуту ng-model об’єкт page
        //отже, дана директива отримує можливість доступу та модифікації поля $scope.page
        //контроллеру ItemDetailsCtrl.js через власне поле ngModel
        scope:{
          ngModel:"="
        },
        templateUrl:'/partials/common/pagination',
        link: function (scope,element,attrs) {

                //кількість товарів на сторінку
                scope.itemsPerPage=parseInt(attrs.itemsperpage);
                //поточна сторінка
                scope.currentPage=0;

                //ініціалізація поля page об’єкту $scope з контроллеру ItemDetailsCtrl
                scope.ngModel={
                    size:scope.itemsPerPage,
                    current:scope.currentPage*scope.itemsPerPage
                };

                //обчислення необхідної кількості сторінок для вміщення коментарів
                scope.pagesNumber= function () {
                    if(attrs.data) return Math.ceil(attrs.data/scope.itemsPerPage);
                    else return 0;
                };

                //оскільки ng-repeat може ітерувати лише через масиви, кількість сторінок подається як масив відповідного розміру
                scope.pageList= function () {
                    return new Array(scope.pagesNumber());
                };

                //перехід за вказаною сторінкою
                scope.setPage= function (page) {
                    scope.currentPage=page;
                    scope.ngModel.current=scope.currentPage*scope.itemsPerPage;
                };
        }
    };
});