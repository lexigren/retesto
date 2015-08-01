//EditItemControllers.js

//контроллер редагування товару
function EditController($scope,$timeout){

    $scope.editMode=true;

    $scope.categories=["computers","connectivity","broadcast"];
    $scope.searchTypes=["range","select"];

    $scope.addSpec= function () {
        $scope.item.specifications.push({
            "specName":"Spec name",
            "specValue":"Spec value",
            "searchType":"select"
        });
    };

    $scope.removeSpec= function (spec) {
        $scope.item.specifications.splice($scope.item.specifications.indexOf(spec),1);
    };

    $scope.addTag= function () {
        $scope.item.tags.push("");
        $timeout(function() {
            $(".tagEdit").eq($scope.item.tags.length - 1).focus();
        });
    };

    $scope.removeTag= function (tag) {
        $scope.item.tags.splice($scope.item.tags.indexOf(tag),1);
    };

    $scope.blockItem=function(state){
        $scope.item.available=!state;
    };

    //функція керування створенням тегів
    $scope.$watchCollection('item.tags', function (newVal, oldVal) {
        if(newVal) for(var i=0;i<newVal.length;i++){
            //новий тег містить розрив тексту розбиваємо його на два теги і ставимо курсор
            //в новостворений тег
            if(newVal[i].match(/\s/g) || newVal[i].match(/\n/g)){
                newVal[i]=newVal[i].replace(/\n+/g," ");
                newVal[i]=newVal[i].replace(/\s\s+/g," ");

                var newTags=newVal[i].split(/\s/);
                $scope.item.tags[$scope.item.tags.indexOf(newVal[i])]=newTags[0];

                var lastNewEl=i;
                for(var newTag=1;newTag<newTags.length;newTag++){
                    lastNewEl++;
                    $scope.item.tags.splice(i+newTag,0,newTags[newTag]);
                }

                $timeout(function() {
                    $(".tagEdit").eq(lastNewEl).focus();
                });
            }
        }
    });

    //валідація числа
    $scope.validateNumber= function (value,type) {
        if(type=="range") {
            return !isNaN(value);
        }else return true;
    }
}

//контроллер створення товару
function CreateItemCtrl ($timeout,Notifier,$scope,$routeParams,CRUDRequest, $location) {

    //викликаємо батьківський конструктор
    EditController.call(this, $scope, $timeout);

    //шаблон нового товару
    function resetItem() {
        $scope.item = {
            "fullVersion": true,
            "available": true,
            "category": $routeParams.category.toLowerCase(),
            "description": "Item description",
            "images": 0,
            "name": "Item 101",
            "price": 1,
            "produced": new Date("1964-04-22"),
            "quantity": 1,
            "received": new Date(),
            "reviews": [],
            "views": 0,
            "replies": [],
            "tags": ["tag"],
            "specifications": [
                {
                    "specName": "Spec name",
                    "specValue": "Spec value",
                    "searchType": "select"
                }
            ]
        };
    }

    resetItem();

    $scope.askRemoveConfirmation= function () {
        $scope.images=[];
        resetItem();
    };

    //запит збереження товару
    $scope.askSaveConfirmation=function() {
        $scope.saveItem = function () {
            $scope.uploading = true;
            //створюємо об’єкт FormData і додаємо до нього модель товару, та всі файли
            var formData = new FormData();
            formData.append('model', JSON.stringify($scope.item));
            for (var i = 0; i < $scope.images.length; i++) {
                formData.append('image' + i, $scope.images[i].file);
            }

            CRUDRequest.request("items").upload(formData,
                //успіх
                function (response) {
                    Notifier.notify("Item created");
                    $timeout(function () {
                        $scope.item._id=response.id;
                        //додаємо новий товар до кешу
                        CRUDRequest.addToCache("category/"+$scope.item.category,$scope.item);
                        //та переходимо до його сторінки
                        $location.path("/items/" + response.id);
                    }, 500);
                },
                //фейл
                function (reason) {
                    console.log(reason);
                    Notifier.error(reason.data.reason);
                    $timeout(function () {
                        $scope.uploading = false;
                    }, 500);
                }
            );
        };

        //викликаємо модальне вікно підтвердження публікації товару
        Notifier.modalWindow($scope,{
            class:"modal-danger",
            title:"Add new item?",
            message:"You can still delete it later, but someone may see it before!",
            confirm:"Add!",
            callback: "saveItem()"
        });
    };
}

//встановлюємо наслідування контроллеру створення від базового контроллера редагування
CreateItemCtrl.prototype = Object.create(EditController.prototype);
//CreateItemCtrl.prototype=new EditController();
angular.module("app").controller("CreateItemCtrl", CreateItemCtrl);



//контроллер оновлення товару
function UpdateItemCtrl ($timeout,Notifier,$scope,$routeParams,CRUDRequest, $location, $window,$http) {

    EditController.call(this, $scope, $timeout);

    $scope.item={
        replies:[]
    };


    //запит товару за id
    CRUDRequest.query("items/"+$routeParams.id).$promise.then(function (result) {
        result[0].produced=new Date(result[0].produced);
        result[0].received=new Date(result[0].received);
        //використовуємо копію об’єкту з кешу, для того, щоб кешований об’єкт
        //залишився без змін, у випадку відміни модифікації
        $scope.cachedItem=result[0];
        angular.copy(result[0],$scope.item);

        //формуємо масив зображень для попереднього перегляду
        //а також масив з вихідними зображеннями для порівняння і оновлення на сервері
        $scope.initialImages=[];
        $scope.images=[];
        for(var i=0;i<$scope.item.images;i++){
            $scope.images[i]=$scope.initialImages[i]={
                src:"/res/img/"+$scope.item._id+"/"+i+".jpg"
            }
        }
        //встановлення заголовку сторінки
        $window.document.title ="Now editing: "+$scope.item.name;
        //якщо сервер не повернув товар відсилаємо на 404
    }, function (reason) {
        $location.path("/404");
    });

    //функція видалення товару
    $scope.askRemoveConfirmation= function () {

        $scope.removeItem= function () {
            var config = {
                method: "DELETE",
                url:"/api/items/"+$scope.item._id,
                data:{
                    comment:$scope.item
                },
                headers: {"Content-Type": "application/json;charset=utf-8"}
            };
            $http(config).then(
                //успіх
                function (response) {
                    Notifier.notify("Item was successfully removed!");
                    //видаляємо товар з кешу
                    CRUDRequest.removeFromCache("category/"+$scope.item.category,$scope.item._id);
                    $location.path("/category/"+$scope.item.category);
                },
                function (reason) {
                    Notifier.error(reason.data.reason);
                }
            );
        };

        //модальне вікно підтвердження видалення товару
        Notifier.modalWindow($scope,{
            class:"modal-danger",
            title:"Remove item from Retesto?",
            message:"WARNING: Operation is irreversible!",
            confirm:"Remove!",
            callback: "removeItem()"
        });
    };

    //збереження товару
    $scope.askSaveConfirmation=function() {
        $scope.saveItem = function () {
            $scope.uploading = true;
            var formData = new FormData();
            formData.append('model', JSON.stringify($scope.item));
            //додаємо початкові та кінцеві зображення, для порівняння на сервері
            formData.append('initialImages',JSON.stringify($scope.initialImages));
            formData.append('endingImages',JSON.stringify($scope.images));
            for (var i = 0; i < $scope.images.length; i++) {
                if($scope.images[i].file) formData.append('image:' + i, $scope.images[i].file);
            }

            CRUDRequest.request("items").uploadUpdate(formData,
                //успіх
                function (response) {
                    Notifier.notify("Item updated!");
                    if($scope.item!==$scope.cachedItem) {
                        //оновлюємо кеш
                        if($scope.item.category!==$scope.cachedItem.category){
                            CRUDRequest.removeFromCache("category/"+$scope.cachedItem.category,$scope.cachedItem._id);
                            CRUDRequest.addToCache("category/"+$scope.item.category,$scope.item);
                        }else{
                            CRUDRequest.updateCache("category/"+$scope.item.category,$scope.item);
                        }
                        angular.copy($scope.item,$scope.cachedItem);
                    }
                    $timeout(function () {
                        $location.path("/items/" + $scope.item._id);
                    }, 500);
                },
                //фейл
                function (reason) {
                    console.log(reason);
                    Notifier.error(reason.data.reason);
                    $timeout(function () {
                        $scope.uploading = false;
                    }, 500);
                }
            );
        };

        //вікно підтвердження збереження товару
        Notifier.modalWindow($scope,{
            class:"modal-danger",
            title:"Update item?",
            message:"You won't be able to reverse changes!",
            confirm:"Update!",
            callback: "saveItem()"
        });
    };
}

UpdateItemCtrl.prototype = Object.create(EditController.prototype);
angular.module("app").controller("UpdateItemCtrl", UpdateItemCtrl);
