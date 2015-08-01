//carouselDir.js

angular.module("app").directive('carousel',function($timeout){
    return {
        restrict: 'E',
        templateUrl:'/partials/main/carousel',
        link: function (scope,element,attrs) {
            //крок повороту однієї грані до іншої
            var step=0;
            //радіус барабану
            var radius=50;

            scope.$watch("items",function(newItems, oldItems) {

                if(!scope.items) return;

                //обчислюємо крок повороту
                step = 360 / scope.items.length;
                //кут повороту поточної грані
                var deg = 0;
                //ширина грані
                var width = $(document).width() / 4;
                //обчислюємо необхідний радіус барабану, враховуючи ширину однієї грані, і їх кількість
                radius += Math.round((width / 2) / Math.tan(Math.PI / scope.items.length));

                //чекаємо, доки ангуляр відмалює всі отримані елементи
                $timeout(function () {
                    //застосовуємо до них обчислені характеристики
                    $(".threeDimensionalSpace").css({
                        width: "" + width + "px"
                    });
                    //віддаляємо весь барабан від площини проекції на його радіус
                    $(".carouselContainer").css({
                        transform: "translateZ(-" + radius + "px)"
                    });
                    //повертаємо кожну грань на відповідний кут, та віддаляємо від центра на величину радіусу
                    $(".carouselTile").each(function (index) {
                        $(this).css({
                            transform: "rotateY(" + deg + "deg) translateZ(" + radius + "px)",
                            width: "" + width + "px",
                            height: "" + ($(window).height() / 1.5) + "px"
                        });

                        //в разу кліку по грані, обератаємо весь барабан на кут, обернений до її поточного кута
                        //таким чином відображаючи грань найближчою до користувача
                        $(this).on("click", function (deg) {
                            console.log(deg);
                            $(".carouselContainer").css({
                                transform: "translateZ(-"+radius+"px) rotateY("+(-deg)+"deg)"
                            });
                        }.bind(this,deg));

                        deg += step;
                    });


                });
            });
        }
    };
});