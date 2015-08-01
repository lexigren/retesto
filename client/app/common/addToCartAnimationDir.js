//addToCartAnimationDir.js
angular.module("app").directive("addToCartAnimation", function ($timeout) {
    return function(scope, element, attrs) {
        //обробник сигналу
        scope.$on('itemAddedToCart', function() {

            var supportedFlag = $.keyframe.isSupported();
            //створюємо копію елементу, позначеного директивою
            var flier=$(element).clone();

            //розміщуємо копію елементу точно над елементом
            $(flier).css({
                position:"absolute",
                top:""+$(element).offset().top+"px",
                left:""+$(element).offset().left+"px"
            });

            //чекаємо, доки ангуляр перемалює інтерфейс з активованою вкладкою кошику
            $timeout(function() {
                //додаємо копію елементу до сторінки
                $('body').append(flier);
                //визначаємо вкладку кошику ціллю нашого "польоту"
                var destination = $(".cartTab");

                //визначаємо нову анімацію
                $.keyframe.define([{
                    name: 'add2CartAnim',
                    //стартовим положенням анімації визнааємо поточне положення
                    '0%': {
                        top: $(element).offset().top,
                        left: $(element).offset().left
                    },
                    //кінцевим - поточні координати вкладки Кошик
                    '100%': {
                        top: "" + $(destination).offset().top + "px",
                        left: "" + $(destination).offset().left + "px",
                        //під час анімації зображення має прозорішати
                        opacity:0.3,
                        //та зменшуватися, точкою відкліку трансформації встановлюємо верхній лівий кут
                        "transform-origin": "top left",
                        transform: "scale(0.3,0.3)"
                    }
                }]);

                //запускаємо анімацію
                $(flier).playKeyframe({
                    name: 'add2CartAnim',
                    duration: '0.3s',
                    timingFunction: 'linear',
                    //по завершенні анімації видаляємо "літаючий" елемент
                    complete: function(){
                        $(flier).remove();
                    }
                });
            });


        });
    };
});