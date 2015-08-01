//CRUDRequest.js

//сервіс типу factory - функціональна одиниця типу static singleton, яка виконує деяку задачу
//в даному випадку - ресурс CRUD запиту до серверу
angular.module("app").factory("CRUDRequest", function ($resource,$filter) {
    //виводимо зелене повідомлення в консоль браузеру
    console.log("%cCRUDRequest service started","color: green");

    //масив для зберігання відповідей на запити
    var cache=[];

    //повертаємо універсальний ресурс, який дозволяє робити запит до адреси path
    return{
        query: function (path) {
            //якщо відповідь на даний запит вже зберігається в пам’яті клієнту - повертаємо збережену копію
            if(cache[path]){
                return cache[path];
            //якщо ні - робимо запит до серверу і записуємо результат в пам’ять
            }else {
                var CRUDRequestResource = $resource("/api/" + path + "/:_id", {_id: "@id"});
                cache[path]=CRUDRequestResource.query();
                return cache[path];
            }
        },
        //повертаємо ресурс, який вміщує CRUD методи
        request:function(path){
            return $resource("/api/"+path+"/:_id",{_id:"@id"},
                {
                    //метод оновлення
                    update: {
                        method:"PUT",
                        isArray:false
                    },
                    //метод видалення
                    erase: {
                        method:"DELETE",
                        isArray:false
                    },
                    //метод завантаження файлів
                    //Content-Type необхідно встановити невизначеним, або false
                    //для завантаження multipart даних з коду, а не форми
                    upload: {
                        method:"POST",
                        headers: { 'Content-Type': undefined },
                        isArray:false
                    },
                    uploadUpdate: {
                        method:"PUT",
                        headers: { 'Content-Type': undefined },
                        isArray:false
                    }
                });
        },
        //очистка кешу
        clearCache: function () {
            cache=[];
        },
        //видалення елементу з кешу
        removeFromCache: function (path,itemId) {
            var found = $filter('filter')(cache[path], {_id: itemId}, true);
            if (found && found.length) {
                cache[path].splice(cache[path].indexOf(found[0]),1);
            }
        },
        //додавання елементу до кешу
        addToCache: function (path,item) {
            if(cache[path]) cache[path].push(item);
        },
        //оновлення запису
        updateCache: function (path,item) {
            var found = $filter('filter')(cache[path], {_id: item._id}, true);
            if (found && found.length) {
                cache[path][cache[path].indexOf(found[0])]=item;
            }
        }
    }
});
