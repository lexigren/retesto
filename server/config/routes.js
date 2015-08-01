//routes.js

//включимо модуль авторизації/аутентифікації
var auth=require("./auth");
//var mongoose=require("mongoose");
//var User=mongoose.model("User");
//включаємо контроллер користувачів
var usersCtrl=require("../controllers/users");
//контроллер товарів
var itemsCtrl=require("../controllers/items");
//контроллер замовлень
var ordersCtrl=require("../controllers/orders");


module.exports = function(app) {

    //запит зчитування користувачів
    app.get("/api/users",auth.requiresRole("owner"),usersCtrl.getUsers);
    //запит додавання нового користувача
    app.post("/api/users",usersCtrl.createUser);
    //запит редагування користувача, використовує chain фукцію перевірки аутентифікації
    app.put("/api/users",auth.requiresApiLogin,usersCtrl.updateUser);
    //запит видалення користувача
    app.delete("/api/users/:id",auth.requiresRole("owner"),usersCtrl.deleteUser);

    //запит на зчитування замовлень користувача
    app.get("/api/users/:id/orders",auth.currentUserOr("deliverer"),ordersCtrl.getUserOrders);
    //запит на додавання замовлення
    app.post("/api/users/:id/orders/",auth.requiresRole("user"),ordersCtrl.addOrder);
    //запит на отримання замовлення за id
    app.get("/api/users/:id/orders/:orderId",auth.currentUserOr("deliverer"),ordersCtrl.getOrder);
    //запит оновлення замовлення
    app.put("/api/users/:id/orders",auth.requiresRole("deliverer"),ordersCtrl.updateOrder);

    //запит на отримання всіх замовлень за типом
    app.get("/api/orders/:status",auth.requiresRole("deliverer"),ordersCtrl.getOrders);



    //запит отримання всіх товарів певної категорії
    app.get("/api/category/:category",itemsCtrl.getCategory);
    //запит отримання товарів за тегом
    app.get("/api/tag/:tag",itemsCtrl.getByTag);

    //запит на отримання одного товару за його id
    app.get("/api/items/:id",itemsCtrl.getItem);
    //запит на створення нового товару
    app.post("/api/items",auth.requiresRole("merchandiser"),itemsCtrl.createItem);
    //запит на оновлення товару
    app.put("/api/items",auth.requiresRole("merchandiser"),itemsCtrl.updateItem);
    //запит на видалення товару
    //складається з двох фаз: видалення самого товару, та видалення коментарів до нього
    //використовуючи раніше створений обробник
    app.delete("/api/items/:id",auth.requiresRole("merchandiser"),itemsCtrl.deleteItem,itemsCtrl.deleteComment);

    //запит на отримання нових товарів
    app.get("/api/latest",itemsCtrl.getLatestItems);

    //запит на додавання коментарів
    app.post("/api/comment/",itemsCtrl.addComment);
    //запит на видалення коментаря до товару
    app.delete("/api/comment/:id",auth.requiresRole("merchandiser"),itemsCtrl.deleteComment);


    //субдиректорія та ім’я partial файлу передаються у вигляді параметрів
    //доступних як поля об’єкту req.params
    app.get("/partials/:partialSubPath/:partialFile",function(req,res){
        res.render("partials/"+req.params.partialSubPath+"/"+req.params.partialFile);
    });

    //при POST запиті на адресу login, викликаємо функцію аутентифікації
    app.post("/login",auth.authenticate);

    //запит виходу з системи
    app.post("/logout", function (req,res) {
        //метод logout додається passport
        req.logout();
        //завершуємо запит
        res.end();
    });///

    //app.all("/api/*", function (req,res) {
    //    res.send(404);
    //});

    //за допомогою express встановлюємо відловлення всіх запитів (маска *), на які навішуємо функцію
    //функція приймає два параметри: req містить в собі інформацію про http запит
    //res використовується для відповіді
    app.get("*",function(req,res){
        //відображаємо представлення index, та надсилаємо клієнту збереженого в сесії користувача
        res.render("index",{bootstrappedUser:req.user});
    });
};