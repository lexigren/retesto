//page404Dir.js
angular.module("app").directive("moveGlare", function () {
    return function(scope, element, attrs) {
        //додавання відслідковувача руху курсору на поверхні елементу
        $(element).mousemove(function (e) {
            //обрахування координат курсору відносно елементу
            var x=e.pageX-parseInt($(this).offset().left);
            var y=e.pageY-parseInt($(this).offset().top);

            //встановлення координат відблиску на поверхні "екрану"
            $(this).css({
                backgroundImage: "radial-gradient(at "+x+"px "+y+"px, rgba(255,255,255,0.95) 9%, rgba(114,140,107,0.8) 50%, rgba(73,102,68,0.9) 67%, #0a381f 100%)"
            });
        });
    };
}).directive("tvTurn", function () {
    return function(scope, element, attrs) {
        var on=true;
        //додавання відслідковувача натискання кнопки живлення
        $(element).click(function (e) {
            on=!on;
            //якщо екран увімкненно - додаємо анімацію увімкнення і нескінченне мерехтіння
            if(on){
                $(".TVPicture").css({
                    "-webkit-animation": "turnOn 4s, flickering 0.15s infinite",
                    opacity:1
                });
            //інакше показуємо анімацію вимкнення і робимо зображення прозорим
            }else{
                $(".TVPicture").css({
                    "-webkit-animation": "turnOff 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
                    opacity:0
                });
            }
        });
    };
});