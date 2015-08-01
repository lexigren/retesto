//app.js

//оголошуємо модуль app, до якого додамо попередньо завантажені angular-resource і angular-route
angular.module('app',['ngResource',"ngRoute","ngAnimate","ngStorage"]);

//конфігуруємо наш модуль
angular.module('app').config(function($routeProvider,$locationProvider, $rootScopeProvider){

    //$rootScopeProvider.digestTtl(200);


    //функція, яка повертає resolver - функцію перевірки авторизації
    var routeRoleChecks=function(){
      var roles=arguments;
      return{
          //додаємо в залежності сервіс Auth
          auth: function (Auth) {
              var checkResult;
              //переглядаємо список ролей, яким дозволено авторизуватися і, якщо користувач
              //має одну з них - повертаємо істину
              for(var i=0;i<roles.length;i++){
                  checkResult=Auth.authorizeCurrentUserForRoute(roles[i]);
                  if(checkResult===true) return true;
              }
              return checkResult;
          }
      }
    };

    //за замовчуванням angular виконує навігацію за допомогою іменованого якоря, додаючи # перед
    //кожним шляхом, щоб позбутися цього, встановлюємо html5Mode
    //html5Mode вимагає наявності на сторінці тегу <base>, який ми додамо до layout.jade
    $locationProvider.html5Mode(true);
    //на шлях, що завантажує головну сторінку, навісимо контроллер mvMainCtrl
    //унікальний вміст головної сторінки збережемо в окремий файл
    $routeProvider
        .when('/',{
            templateUrl: '/partials/main/main',
            controller: 'MainCtrl'
        })
        .when('/admin/users',{
            //визначаємо partial, який буде повернуто при запиті
            templateUrl: '/partials/admin/user-admin',
            //визначаємо контроллер сторінки
            controller: 'UserAdminCtrl',
            //дозволимо перехід за результатами виконання перевірки на наявність ролі власника
            resolve:routeRoleChecks("owner")
        })
        .when('/profile',{
            templateUrl:'/partials/account/profile-form',
            controller: 'ProfileCtrl',
            //тепер резольвер має приймати список ролей, яким дозволено доступ до сторінки
            resolve: routeRoleChecks("user","owner","deliverer","merchandiser")
        })
        .when('/category/:category',{
            templateUrl:'/partials/merchandise/items',
            controller:'ItemsCtrl'
        })
        .when('/items/:id',{
            templateUrl:'/partials/merchandise/item-details',
            controller: 'ItemDetailsCtrl'
        }).when('/tag/:tag',{
            templateUrl:'/partials/merchandise/items',
            controller:'ItemsCtrl'
        }).when('/404',{
            templateUrl:'/partials/common/page404'
        }).when('/create/:category',{
            templateUrl:'/partials/merchandise/item-details',
            controller:'CreateItemCtrl',
            resolve: routeRoleChecks("merchandiser")
        }).when('/edit/:id',{
            templateUrl:'/partials/merchandise/item-details',
            controller:'UpdateItemCtrl',
            resolve: routeRoleChecks("merchandiser")
        }).when('/checkout',{
            templateUrl:'/partials/merchandise/shopping-cart',
            controller:'CartCtrl'
        }).when('/users/:id/orders',{
            templateUrl:'/partials/account/user-orders',
            controller:'UserOrdersCtrl',
            resolve:routeRoleChecks("deliverer","user")
        }).when('/users/:id/orders/:orderId',{
            templateUrl:'/partials/account/order-info',
            controller:'OrderInfoCtrl',
            resolve:routeRoleChecks("deliverer","user")
        }).when('/orders/:status',{
            templateUrl:'/partials/admin/order-list',
            controller:'OrderListCtrl',
            resolve:routeRoleChecks("deliverer")
        });
});

//додамо відловлювач route change error
//run виконується по завершенні конфігурації app
//$rootScope - глобальний scope, що вміщує в собі інші. Відслідковує всі зміни та надсилає повідомлення про події підписникам
angular.module("app").run(function ($rootScope, $location,$window) {
    //додаємо підписника до івенту routeChangeError
    $rootScope.$on("$routeChangeError",function(evt,current,previous,rejection){
        //якщо повідомлення відмови містить "not authorized" - перенаправляємо браузер на index
        if(rejection.match("Not authorized").length>0){
            console.log("%cERROR:\n"+rejection,"color:red");
            //перенаправлення
            $location.path("/");
        }
    });

    //зміна заголовку сторінки при переході до детального опису товару
    $rootScope.$on('$routeChangeSuccess', function(evt, current, previous) {
        $window.document.title="Retro tech store";
    });
});