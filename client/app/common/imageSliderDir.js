//imageSliderDir.js

angular.module("app").directive('imageSlider',function($timeout){
    return {
        restrict: 'E',
        scope:{
            images:"=",
            //в даному випадку ми використовуємо ізольований scope
            //тому необхідно явно прив’язати умову показу слайдеру до $scope верхнього рівня
            ngShow:"=",
            item:"="
        },
        templateUrl:'/partials/common/image-slider',
        link: function (scope,element,attrs) {

            //поле необхідне для визначення напрямку анімації гортання
            scope.moveNext=true;

            //поточне зображення
            scope.currentImage=0;

            //створення списку ілюстрацій по отриманню сигналу про відкриття слайдеру
            scope.$on('loadSliderData', function() {
                scope.imageList = new Array(scope.images);
            });

            //закриття слайдеру
            scope.hide = function () {
                scope.ngShow = false;
            };

            //перехід на наступну сторінку, якщо вона існує
            scope.next=function(){
                if(scope.currentImage<scope.images-1){
                    scope.moveNext=true;
                    //таймаут без інтервалу використовується для того, щоб angular встиг змінити анімацію на відповідну напрямку руху
                    //функція, що передається $timeout, виконуються після завершення всіх інших процедур
                    $timeout(function () {
                    scope.currentImage++;
                    });
                }
            };

            //перехід на попередню сторінку
            scope.previous=function(){
                if(scope.currentImage>0){
                    scope.moveNext=false;
                    $timeout(function () {
                        scope.currentImage--;
                    });
                }
            };
        }
    };
});