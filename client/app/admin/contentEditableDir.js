//contentEditableDir.js
angular.module("app").directive("contenteditable", function () {
    return {
        //вимагаємо наявність атрибуту моделі
        require: "ngModel",
        scope:{
          //включаємо функцію валідації
          validate:"&"
        },
        link: function (scope, element, attrs, ngModel) {

            //функція виконання включеної функції валідації і підсвічування введених даних
            function validate(){
                if(scope.validate()){
                    element.addClass("text-success");
                    element.removeClass("text-danger");
                }else{
                    element.addClass("text-danger");
                    element.removeClass("text-success");
                }
            }

            //функція зчитування даних з редагованого елементу
            function read() {
                //якщо браузер підтримує .innerText, зчитуємо його - бо підтримує форматування
                if($(element)[0].innerText) ngModel.$setViewValue($(element)[0].innerText);
                //інакше беремо простий текст
                else ngModel.$setViewValue(element.text());
                //якщо включено зовнішню фунцію валідації виконуємо її
                if(angular.isDefined(attrs.validate)) validate();
            }

            //функція запису даних з моделі в елемент
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || "");
            };

            //додаємо до редагованого елементу події, після яких відбувається запуск зчитування
            //вмісту редагованого елементу в модель
            element.bind("blur keyup change", function () {
                //оскільки функція зчитування знаходиться поза дайджестом ангуляра,
                //маємо явно повідомити йому про зміну моделі
                scope.$apply(read);
            });

            //якщо наявний атрибут, забороняючий багаторядковий ввід - перехоплюємо
            //всі натискання клавіш, і відкижаємо клавішу ентер
            if(angular.isDefined(attrs.forbidnewline)) element.bind("keypress", function (e) {
                return e.which != 13;
            });
        }
    }
});