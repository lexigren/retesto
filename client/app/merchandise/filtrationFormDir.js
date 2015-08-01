//filtrationFormDir.js
angular.module("app").directive('filtrationForm',function($routeParams){
    return {
        //тип директиви - Елемент
        restrict: 'E',
        //шаблон вмісту користувацького тегу
        templateUrl:'/partials/merchandise/filtration-form',
        link: function (scope,element,attrs) {

            //створення об’єкту, до якого буде прив’язана форма з контрольними елементами фільтрації характеристик
            scope.searchForm={};

            //створення об’єкту зі списком характеристик товарів в даній категорії
            scope.customSearchParams={};
            //об’єкт не створюється, якщо переглядаються товари за тегом
            if($routeParams.category) {
                scope.items.$promise.then(function (response) {

                    //переглядаються товари в категорії
                    angular.forEach(response, function (item) {
                        //переглядаються характеристики в товарі
                        angular.forEach(item.specifications, function (spec) {
                            //якщо в об’єкт характеристик ще не додано дану характеристику
                            if (!scope.customSearchParams[spec.specName]) {
                                //створюється поле об’єкту customSearchParams -об’єкт названий іменем характеристики
                                scope.customSearchParams[spec.specName] = {};
                                //встановлюється тип характеристики
                                scope.customSearchParams[spec.specName].type = spec.searchType;
                                //назва характеристики
                                scope.customSearchParams[spec.specName].name = spec.specName;
                                //створюється об’єкт для зберігання можливих значень характеристики
                                scope.customSearchParams[spec.specName].values = {};
                            }
                            //якщо дана характеристика є значенням, яке можна вибрати зі списку
                            //в середині характеристики формується список усіх можливих значень, для відображення їх в випадаючому списку
                            if (spec.searchType == "select") {
                                //якщо можливе значення ще не включено до характеристики
                                if (!scope.customSearchParams[spec.specName].values[spec.specValue]) {
                                    //створюється поле назване значенням характеристики та ініціалізується нулем
                                    //це робиться для підрахунку кількості товарів з певною характеристикою, для відображення в інтерфейсі
                                    scope.customSearchParams[spec.specName].values[spec.specValue] = 0;
                                }
                                //збільшується лічильник кількості товарів, що відповідають даній характеристиці
                                scope.customSearchParams[spec.specName].values[spec.specValue]++;
                            }
                        });
                    });
                });
            }

            //якщо елементи редагування форми фільтрації були змінені, в об’єкті searchForm
            //з’являються поля. Для очищення всієї форми переініціалізовуємо форму порожнім об’єктом
            scope.clearSearch= function () {
                scope.searchForm={};
            };

        }
    };
});