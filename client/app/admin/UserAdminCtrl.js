//UserAdminCtrl.js

//включимо в контроллер попередньо створений CRUD сервіс
angular.module("app").controller("UserAdminCtrl", function ($scope, CRUDRequest, Notifier) {

    //заповнюємо $scope масив users колекцією, що повертається функцією getUsers з контроллера users.js
    $scope.users=CRUDRequest.query("users");

    //елементи випадаючого списку редагування ролі користувача
    $scope.roles=["user","blocked","merchandiser","deliverer"];

    $scope.setActiveUser= function (user) {
      //ми не присвоюємо змінній "активний користувач" параметр user
      //бо таким чином вона містила би копію змінної з масива users
      //замість цього ми використовуємо стекову змінну user для знаходження
      //в масиві користувачів потрібного нам користувача та внесення посилання на нього
      //в reference змінну activeUser
      //таким чином, працюючи з нею, ми одночасно працюємо з даними масиву
      $scope.activeUser=$scope.users[$scope.users.indexOf(user)];
    };

    //запит оновлення ролі користувача
    $scope.update= function () {
        CRUDRequest.request("users").update($scope.activeUser,
            function (response) {
                //в разі успіху записуємо відповідь серверу в об’єкт редагованого користувача
                //оскільки reference змінна вказує на елемент масива всіх користувачів,
                //то вся їх таблиця буде автоматично оновлена
                angular.copy(response.user,$scope.activeUser);
            },
            function (reason) {
                Notifier.error(reason.data.reason);
            }
        );
    };

    //функція видалення користувача
    $scope.askDeleteConfirmation= function () {

        //запит видалення
        $scope.erase= function () {
            CRUDRequest.request("users").erase({_id:$scope.activeUser._id},
                function (response) {
                    Notifier.notify("User "+$scope.activeUser.firstName+" is no more. He's an ex-user now.");
                    //видалення редагованого користувача з масиву
                    $scope.users.splice($scope.users.indexOf($scope.activeUser),1);
                    $scope.activeUser=null;
                },
                function (reason) {
                    Notifier.error(reason.data.reason);
                }
            );
        };

        //створення модального вікна підтрвердження видалення
        Notifier.modalWindow($scope,{
            class:"modal-danger",
            title:"Delete user {{activeUser.firstName}} {{activeUser.lastName}}?",
            message:"WARNING: Operation is irreversible!",
            confirm:"Finish him!",
            callback: "erase()"
        });
    };

    $scope.cancel= function () {
      $scope.activeUser=null;
    };
});