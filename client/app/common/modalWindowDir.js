//modalWindowDir.js

angular.module("app").directive('modalWindow',function($timeout){
    return {
        restrict: 'E',
        templateUrl:'/partials/common/modal-window',
        scope:{
          //прив’язка функції коллбеку, яка викликається в разі натискання кнопки підтвердження
          callback:"&"
        },
        link: function (scope,element,attrs) {
            scope.title=attrs.title;
            scope.confirm=attrs.confirm;

            //за значенням атрибуту class визначається тип модального вікна
            if(attrs.class.indexOf("modal-danger")>=0){
                //тип підтвердження дії - тіло вікна міститиме лише повідомлення
                scope.modalDanger=true;
                scope.message=attrs.message;
            }else if(attrs.class.indexOf("modal-input")>=0){
                //тип введення даних - тіло вікна міститиме список текстових полів
                scope.modalInput=true;
                scope.inputFields=JSON.parse(attrs.inputs);
                //в разі підтвердження в колбек надсилатимуться введені дані
                scope.input={};
            }


            //додаємо модальне вікно до сторінки і показуємо його
            $('body').append(element);
            $(element[0].children[0]).modal("show");

            //у випадку натискання кнопки відміни - видаляємо модальне вікно зі сторінки
            $(element[0].children[0]).on("hidden.bs.modal", function () {
                $(element).remove();
            });

            //після видалення елемента з DOM відбувається подія $destroy
            //дана функція має використовуватися як деструктор директиви:
            //для відключення спостерігачів, скасовування таймерів, тощо
            element.on('$destroy', function() {
                scope.$destroy();
            });
        }
    };
});