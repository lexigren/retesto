//searchFormDir.js

angular.module("app").directive("completeEvt", function () {
    //директива відслідковує завантажання останнього елементу і відсилає сигнал підігнати розмір форми пошуку під таблицю з товарами
    return function(scope, element, attrs) {
        //якщо успішно завантажено останній елемент - форма пошуку підганяється під розмір списку товарів
        //в angular є дві команди відсилання сигналу події: emit - якщо сигнал відсилається вверх по дереву scope
        //і broadcast - якщо вниз
        //scope завантаженого рядка таблиці є найнижчим, тому надсилаємо сигнал вверх
        if (scope.$last){
            scope.$emit('adjust');
        }
    };
}).directive("deleteEvt", function ($timeout) {
    //директива додає відслідковування видалення елементів з таблиці товарів
    //така подія відбувається під час фільтрації і вилучення зайвих елементів
    return function (scope,element,attrs) {
        element.on('DOMNodeRemoved', function (e) {
            scope.$broadcast('adjust');
        });

        $timeout(function () {
            scope.$broadcast('adjust');
        });
    }
}).directive('scrollEvt', function($window) {
    //відсідковування прокручування у вікні документу
    return function(scope,element,attrs) {
            angular.element($window).on('scroll', function(e) {
                scope.$broadcast('adjust');
            });
        };
}).directive('adjustEvt', function () {
    //директива, яка безпосередньо керує виглядом форми пошуку
    //відслідковує всі події зміни розміру і положення таблиці товарів і виконує
    //відповідне налаштування форми фільтрації
    return function (scope,element,attrs) {
        scope.$on('adjust', function() {
            var standardTop = 130;
            var noHeaderTop=50;

            //робимо розмір форми відповідним або до розміру вікна, якщо список товарів більший за нього, або до списку, якщо він менший
            //в другому випадку враховуємо видимий розмір списку товарів
            $(element).css("height", Math.min($(window).height() - 210, $(".itemsList").height() - $(window).scrollTop() - 100 + (standardTop - $(element).position().top)));

            //припіднімаємо форму, якщо заголовок списка товарів не заважає
            if($(window).scrollTop()>=75){
                $(element).css("top", noHeaderTop);
            }else{
                $(element).css("top",standardTop);
            }
        });
    };
});