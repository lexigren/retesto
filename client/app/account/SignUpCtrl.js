//SignUpCtrl.js

angular.module("app").controller("SignUpCtrl",function($scope,Notifier,Auth,Identity){


    //дані потрібні для спорожнення форми
    var defaultFormState={
        email:"",
        password:"",
        password2:"",
        fname:"",
        lname:""
    };

    $scope.signup=function(){

        //перевірка на співпадіння паролів
        if($scope.user.password!=$scope.user.password2){
            Notifier.error("Error: passwords must match!");
            return;
        }

        //блок даних з вірно заповненної форми
        var newUserData={
            email: $scope.user.email,
            hashedPassword: $scope.user.password,
            firstName:$scope.user.fname,
            lastName: $scope.user.lname,
            //необхідно для проходження попередньої валідації, на сервері замінюється
            salt:"salt"
        };


        //звернення до функції створення користувача сервісу авторизації/аутентифікації
        Auth.createUser(newUserData).then(
            //обробник успіху
            function () {
                Notifier.notify("Welcome to the Retesto, "+Identity.currentUser.firstName);
                //спорожнення та приховування форми
                $scope.signUpForm.$setPristine();
                $scope.user=angular.copy(defaultFormState);
                $("#signUpForm").addClass("hidden");
            },
            //невдача
            function (reason) {
                Notifier.error(reason);
            }
        );

    };

    $scope.cancel=function(){
        //спорожнення та приховування форми
        $scope.signUpForm.$setPristine();
        $scope.user=angular.copy(defaultFormState);
        $("#signUpForm").addClass("hidden");
    }

});