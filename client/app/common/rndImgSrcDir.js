//rndImgSrcDir.js

angular.module("app").directive("rndImgSrc", function () {
    return function(scope, element, attrs){
        //спостерігаємо за значенням атрибуту
        scope.$watch(function() {
            return attrs.rndImgSrc;
        }, function(newValue){
            //додаємо до посилання на зображення поточний час, для запобігання кешуванню
            var newSrc=attrs.rndImgSrc.match('blob:')?attrs.rndImgSrc:attrs.rndImgSrc+"?"+new Date().getTime();
            attrs.$set('src',newSrc);
        });
    };
});