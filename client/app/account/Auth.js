//Auth.js

angular.module("app").factory("Auth",function($http,Identity,$q,CRUDRequest,$localStorage){
    return{
        //виконання запиту аутентифікації
        authenticateUser: function(email,password){
            //сервіс відтермінованого виклику callback, здійнюваного по отриманні відповіді сервера на запит
            var dfd = $q.defer();
            //робимо POST запит надсилаючи json об’єкт з логіном та паролем
            //додаємо callback-и успіху і фейлу, які отримають відповідь серверу
            $http.post("/login",{email:email, password:password}).then(function(response){
                    //у випадку відповіді серверу про успіх - записуємо користувача як поточного
                    Identity.currentUser=response.data.user;
                    //викликаємо callback з контроллеру LoginCtrl
                    dfd.resolve({success:true});
            }, function (reason) {
                //якщо отримали повідомлення про фейл надсилаємо контроллеру логіну причину
                dfd.resolve({success:false,reason:reason.data.reason});
            });
            //повертаємо об’єкт, який приймає callback функцію функцією .then(), та викликає його функцією dfd.resolve()
            return dfd.promise;
        },
        //виконання запиту виходу з системи
        logoutUser: function () {
            var dfd=$q.defer();
            //для виходу з системи використовується запит post, з яким, зазвичай, надсилаються певні дані
            //які, у даному випадку, взагалі не потрібні на сервері
            //причиною використання методу post замість get є те, що сучасні браузери стали занадто
            //розумні і виконують обхід всіх get запитів на сторінці для
            //пришвидшення переходів за посиланнями, в тому числі і get запит logout
            //таким чином аутентифікований юзер буде викинутий з системи поза власним бажанням
            //відсилаємо post без тіла
            $http.post("/logout").then(function(){
                //встановлюємо поточного користувача невизначеним
                Identity.currentUser=undefined;
                //очистка кешу
                CRUDRequest.clearCache();
                //очистка локального сховища
                $localStorage.$reset({
                    cart:[],
                    firstRun:true
                });

                dfd.resolve({success:true});
            });
            return dfd.promise;
        },

        //перевірка авторизації за допомогою сервісу Identity
        authorizeCurrentUserForRoute: function (role) {
            if(Identity.isAuthorized(role)){
                return true;
            }else{
                //якщо користувач не авторизований для заданої ролі - повертаємо route change error з поясненням
                return $q.reject("Not authorized access attempt.");
            }
        },
        //створення користувача
        createUser: function (newUserData) {
            var dfd=$q.defer();
            //використовуємо сервіс CRUDRequest для отримання ресурсу запиту до /api/users і робимо post запит
            //надсилаючи newUserData, та 2 handler-и: для успіху і провалу
            CRUDRequest.request("users").save(newUserData,
                //успіх
                function (response) {
                    //встановлюємо поточного користувача
                    Identity.currentUser=response.user;
                    //викликаємо перший коллбек з SignUpCtrl
                    dfd.resolve();
                },
                //фейл
                function (reason) {
                    //викликаємо другий коллбек з SignUpCtrl з вказанням причини
                    dfd.reject(reason.data.reason);
                }
            );
            //повертаємо проміс з методом then
            return dfd.promise;
        },
        //оновлення поточного користувача
        updateCurrentUser: function (updatedUserData) {
            var dfd= $q.defer();

            //робимо PUT запит update до /api/users
            CRUDRequest.request("users").update(updatedUserData,
                function (response) {
                    Identity.currentUser=response.user;
                    dfd.resolve();
                },
                function (reason) {
                    dfd.reject(reason.data.reason);
                }
            );

            return dfd.promise;
        }

    }
});