//tabsDir.js

angular.module("app").directive("tabActivator", function ($location) {
    //директива виділення вкладки активної категорії товарів
    return function(scope, element, attrs) {
        //відслідковуємо подію успішної зміни локації
        scope.$on("$routeChangeSuccess", function (event, current, previous) {
            //якщо активний шлях еквівалентний посиланню, на яке вказує вкладка - віділяємо її
            if($location.path()==element.children()[0].getAttribute("href")){
                element.addClass("activeTab");
            }else{
                //інакше - виділення знімається
                element.removeClass("activeTab");
            }
        });
    };
});