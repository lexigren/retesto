///recursiveOutputDir.js
angular.module("app").directive('recursiveOutput',function(Identity, CRUDRequest, Notifier,$http,$timeout){
    return {
        //тип директиви - Елемент
        restrict: 'E',
        templateUrl:'/partials/common/recursive-output',
        scope:{
            //прив’язуємо до scope директиви масив відгуків одного рівня
            data:"="
        },
        link: function (scope,element,attrs) {
            scope.identity=Identity;

            //функція запиту підтвердження видалення коментаря
            scope.askDeleteConfirmation= function (comment) {
                //видалення коментаря
                scope.deleteComment= function () {
                    //Для того, щоб не використовувати рекурсивний пошук всіх відповідей до коментаря в БД,
                    //які також треба видалити, надішлемо серверу весь коментар, разом з дочірніми елементами.
                    //Оскільки, для повного видалення коментаря, нам необхідно більше інформації, ніж його id,
                    //а angular ресурси не дозволяють надсилати тіло разом з запитом видалення,
                    //використовуємо сервіс $http
                    var config = {
                        method: "DELETE",
                        url:"/api/comment/"+comment._id,
                        data:{
                            comment:comment
                        },
                        headers: {"Content-Type": "application/json;charset=utf-8"}
                    };
                    $http(config).then(
                        function (response) {
                            Notifier.notify("Ungood comment has been unposted.");
                            //видаляємо видалений коментар з масиву даних
                            var deletedItemIndex=scope.data.indexOf(comment);
                            scope.data.splice(deletedItemIndex,1);
                        },
                        function (reason) {
                            Notifier.error(reason.data.reason);
                        }
                    );
                };

                //викликаємо модальне вікно підтвердження видалення коментаря
                Notifier.modalWindow(scope,{
                    class:"modal-danger",
                    title:"Unpost malquoted misreview by "+comment.author+"?",
                    message:"WARNING: Operation is irreversible!",
                    confirm:"Unpost it!",
                    callback: "deleteComment()"
                });
            };

            //функція відповіді на коментар
            scope.showReplyWindow=function (comment) {

                //відправка запиту додавання відповіді до коментаря
                scope.postReply= function (replyData) {
                    //якщо наявний активний користувач встановлюємо його автором
                    if(Identity.currentUser) replyData.author=Identity.currentUser.email;
                    //включаємо до запиту дані коментаря, до якого додається відповідь
                    replyData.parent=comment._id;

                    //виконуємо запит
                    CRUDRequest.request("comment").save(replyData,
                        //успіх
                        function (response) {
                            //додаємо новостворену відповідь до масиву відповідей коментаря
                            if(!scope.data[scope.data.indexOf(comment)].replies){
                                scope.data[scope.data.indexOf(comment)].replies=[];
                            }
                            scope.data[scope.data.indexOf(comment)].replies.push(response.reply);
                        },
                        //фейл
                        function (reason) {
                            Notifier.error(reason.data.reason);
                        }
                    );

                };

                //виклик модального вікна запиту інформації
                var inputs={comment:"Your reply:"};
                if(!Identity.currentUser){
                    inputs.author="Your name:";
                }

                Notifier.modalWindow(scope,{
                    class:"modal-input",
                    title:"Reply to "+comment.author+":",
                    inputs:JSON.stringify(inputs),
                    confirm:"Reply",
                    callback: "postReply"
                });
            }
        }
    };
}).directive('continueRecursion',function($compile){
    return {
        //тип директиви - Атрибут
        restrict: 'A',
        //прив’язуємо елемент масиву коментарів верхнього рівня до scope директиви
        scope:{
            continueRecursion:"="
        },
        link: function (scope,element,attrs) {

            //за замовчуванням вважаємо, що елемент не містить відповідей, а тому створення нової гілки не потрібне
            scope.branch=false;

            //функція створення нової гілки відповідей
            function addChild(){
                //якщо елемент гілки вже створено - повертаємось
                if(scope.branch) return;
                scope.branch=true;
                //додаємо до DOM HTML елемент в який виводитимуться елементи масиву відповідей
                var child = jQuery('<recursive-output/>');
                $(child).attr({"data":"continueRecursion.replies"});
                $compile(child)(scope);
                $(element).append(child);
            }

            //якщо коментар містить відповіді створюємо для них гілку
            if(scope.continueRecursion.replies && scope.continueRecursion.replies.length>0){
                addChild();
            }

            //Додаємо спостерігача за списком відповідей до коментаря.
            //Якщо під час першого проходу дерева, HTML елемент для відображення його гілки створено не було,
            //то навіть якщо елементи в ній з’являться в майбутньому, відображені вони не будуть.
            //тому додамо вотчер, який слідкуватиме за гілкою, і створюватиме елемент для її відображення,
            //якщо в ній з’явилися відповіді.
            scope.$watch(
                function(scope) {
                    if(scope.continueRecursion.replies) return scope.continueRecursion.replies.length;
                    return scope.continueRecursion.replies;
                },
                function(newReplies, oldReplies) {
                    //якщо кількість відповідей змінилася викликаємо функцію додавання,
                    //у випадку появи першої відподі, гілки для їх відображення
                    if(oldReplies!=newReplies){
                        addChild();
                    }
                }
            );
        }
    };
});