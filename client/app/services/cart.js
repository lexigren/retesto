//cart.js
angular.module("app").factory("cart", function ($rootScope,$localStorage,Notifier) {

    //ініціалізуємо локальне сховище порожнім масивом кошику
    $storage = $localStorage;
    if($storage.cart===undefined) $storage.cart=[];

    return{
        //додати товар до кошику
        add: function (item) {
            //якщо товарів певного типу в кошику стільки ж, скільки їх загалом
            if($storage.cart.filter(function(arrayItem){
                return arrayItem._id === item._id;
            }).length==item.quantity){
                //повідомляємо про помилку
                Notifier.error("You've already added all "+item.name+" items we have here!")
            }else {
                //інакше додаємо товар до кошику
                $storage.cart.push(item);
                //відсилаємо сигнал додавання товару
                $rootScope.$broadcast('itemAddedToCart');
                Notifier.notify(item.name + " added to cart");
            }
        },
        get: function () {
            return $storage.cart;
        },
        isEmpty: function () {
            return !$storage.cart.length;
        },
        remove: function (item) {
            var deletedItemIndex=$storage.cart.indexOf(item);
            $storage.cart.splice(deletedItemIndex,1);
        },
        clear: function () {
            $storage.cart=[];
        },
        total: function () {
            var total=0;
            for(var i=0;i<$storage.cart.length;i++){
                total+=$storage.cart[i].price;
            }
            return total;
        }

    }
});
