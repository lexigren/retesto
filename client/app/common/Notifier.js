//Notifier.js

angular.module("app").value("Toastr",toastr);

angular.module("app").factory("Notifier",function(Toastr,$compile,$timeout){
    return{
        notify: function(msg){
            Toastr.success(msg);
            console.log("%c"+msg,"color:green");
        },
        error:function(msg){
            Toastr.error(msg);
            console.log("%c"+msg,"color:red");
        },
        modalWindow: function (scope,options) {
            var modal = jQuery('<modal-window/>');
            $(modal).attr(options);
            //для динамічного внесення елементів angular в DOM використовується сервіс $compile
            $compile(modal)(scope);
        }
    }
});