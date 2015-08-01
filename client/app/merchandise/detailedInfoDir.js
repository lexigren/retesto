//detailedInfoDir.js
angular.module("app").directive('detailedInfo',function(Identity,$http,Notifier,CRUDRequest){
        return {
            //тип директиви - Елемент
            restrict: 'E',
            //шаблон вмісту користувацького тегу
            templateUrl:'/partials/merchandise/detailed-info',
            link: function (scope,element,attrs) {
                //об’єкт відгуку
                scope.review={};
                //доступні оцінки товару
                scope.marks=[1,2,3,4,5];
                //визначення наявності поточного користувача
                scope.identity=Identity;
                //поточна вкладка
                scope.tab=1;
                //вибір вкладки
                scope.selectTab=function(tab){
                    scope.tab=tab;
                };
                //перевірка вибору вкладки
                scope.isSelected=function(tab){
                        return scope.tab==tab;
                };

                //додавання коментаря
                scope.addComment= function () {

                    //якщо навяний активний користувач встановлюємо його автором
                    if(Identity.currentUser) scope.review.author=scope.identity.currentUser.email;
                    //включаємо до запиту дані об’єкту, до якого додається відповідь
                    scope.review.parent=scope.item._id;

                    //виконуємо запит
                    CRUDRequest.request("comment").save(scope.review,
                        //успіх
                        function (response) {
                            //додаємо новостворену відповідь до масиву відповідей елементу
                            if(!scope.item.replies){
                                scope.item.replies=[];
                            }
                            scope.item.replies.push(response.reply);
                            scope.review={};
                        },
                        //фейл
                        function (reason) {
                            Notifier.error(reason.data.reason);
                        }
                    );
                };
            }
        };
    });