//LoginCtrl.js

angular.module("app").controller("LoginCtrl",function($scope,$http,$location,Auth,Notifier,Identity,$window,CRUDRequest){

    //додамо сервіс Identity до $scope, для можливості його використання в директивах angular
    $scope.identity=Identity;


    //функція запиту аутентифікації
    $scope.signin=function(email,password){
        //використаємо сервіс аутентифікації
        Auth.authenticateUser(email,password).then(function (response) {
            if(response.success){
                Notifier.notify("Nice to see you, "+Identity.currentUser.firstName+"!");

                //у випадку некористувацької ролі - перезавантажуємо сторінку для отримання
                //прихованих для користувача даних
                if(!Identity.isAuthorized("user")){
                    $window.location.reload();
                }
            }else{
                Notifier.error(response.reason);
            }
        });

    };


    //функція запиту виходу з системи
    $scope.signOut= function () {
        //виклик функції з сервісу аутентифікації Auth
        Auth.logoutUser().then(function () {
            //очистка форми аутентифікації
            $scope.username="";
            $scope.password="";

            Notifier.notify("See you later, alligator!");
            //перенаправлення браузеру на титульну сторінку сайту
            $location.path("/");
        });
    };


    //відображення форми реєстрації
    $("div.showSUcaption").click(function() {
        $("#signUpForm").removeClass("hidden");
        //приховування аутентифікації після відображення форми реєстрації
        $(this).closest(".dropdown-menu").prev().dropdown("toggle");
    });


});