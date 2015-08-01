//ProfileCtrl.js

angular.module("app").controller("ProfileCtrl",function($scope, Auth, Identity, Notifier, $location){

    //заповнюємо форму даними поточного користувача
    $scope.email=Identity.currentUser.email;
    $scope.fname=Identity.currentUser.firstName;
    $scope.lname=Identity.currentUser.lastName;


    //оновлення профілю
    $scope.update= function () {

        //вимагає введення паролю, перед відправкою запита
        if(!$scope.password){
            Notifier.error("Enter password!");
            return;
        }

        //дані для відправки на сервер
        var updatedUserData={
            //id додається для ідентифікації користувача для оновлення
            //в даному випадку оновлюється поточний
            _id:Identity.currentUser._id,
            email:$scope.email,
            firstName:$scope.fname,
            lastName:$scope.lname,
            password:$scope.password,
            newPassword:$scope.password2
        };


        //звернення до функції оновлення користувача з сервісу Auth
        Auth.updateCurrentUser(updatedUserData).then(function () {
            Notifier.notify("Account has been updated!");
        }, function (reason) {
            Notifier.error(reason);
        });
    };

    //скасування перенавправляє на головну сторінку
    $scope.cancel= function () {
        $location.path("/");
    };

});