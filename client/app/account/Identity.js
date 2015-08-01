//Identity.js
angular.module("app").factory("Identity",function($window,$localStorage){
    var currentUser;

    $storage = $localStorage;
    if($storage.firstRun===undefined) $storage.firstRun=true;

    //якщо глобальна змінна існує записуємо поточного користувача
    if(!!$window.bootstrappedUserObject) {
        currentUser=$window.bootstrappedUserObject;
    }

    //повертаємо об’єкт з методами перевірки аутентифікації та авторизації поточного користвувача
    return {
        currentUser: currentUser,
        isAuthenticated: function(){
            return !!this.currentUser;
        },
        //метод перевірки авторизації для заданої ролі
        isAuthorized: function (role) {
            //права користувачів надамо будь-кому аутентифікованому
            //if(role=="user") return this.isAuthenticated();
            //якщо список ролей аутентифікованого користувача містить необхідну роль - повертаємо true
            return this.isAuthenticated() && this.currentUser.roles.indexOf(role)>=0;
        },
        isFirstRun: function () {
            var runIs=$storage.firstRun;
            $storage.firstRun=false;
            return runIs;
        }
    }
});