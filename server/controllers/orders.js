//orders.js
var Order=require("mongoose").model("Order");
var async=require("../utilities/async");
var Item=require("mongoose").model("Item");
var User=require("mongoose").model("User");
var mail=require("../utilities/mail");


//обробник запиту створення нового замовлення
exports.addOrder= function (req,res) {

    //функція створення масиву товарів
    function getItems(){
        var items=[];
        for(var i=0;i<req.body.items.length;i++){

            var existingItem=items.filter(function (item) {
                return req.body.items[i]._id==item.item;
            });

            if(!existingItem.length){
                items.push({
                   item:req.body.items[i]._id,
                   quantity:1
                });
            }else{
                existingItem[0].quantity++;
            }
        }
        return items;
    }

    //функція створення замовлення
    function createOrder() {
        Order.create(orderObject,
            function (err, order) {
                if(err){
                    res.status(500);
                    return res.send({success:false,reason:err.toString()});
                }else {
                    res.send({success: true,order:order});
                    //відсилаємо поштове повідомлення про замовлення
                    mail.sendOrderInfo(req.user,order._id,req.headers.host);
                    //зменшуємо кількість товарів на складі, доступних для продажу
                    for(var i=0;i<processedItems.length;i++){
                        processedItems[i].quantity-=order.items[i].quantity;
                        processedItems[i].save();
                    }
                }
            });
    }

    //оновлюємо адресу користувача
    function updateUserAddress(){
        var query = {"_id":req.user._id};
        var update = {address: req.body.address};
        var options = {new: true, runValidators:true};
        User.findOneAndUpdate(query, update, options, function(err, user) {
            if (err) {
                res.status(400);
                return res.send({success:false,reason:err.toString()});
            } else{
                orderObject.shippingAddress=user.address;
                createOrder();
            }
        });
    }

    //об’єкт замовлення
    var orderObject={
        date:new Date(),
        items:getItems(),
        customer:req.user._id,
        shippingPrice:50,
        totalPrice:50
    };

    var runAfterAllItemsChecked=new async.RunAfterLastCallback(function () {
        updateUserAddress();
    });
    var processedItems=[];

    //знаходимо кожен товар в базі даних, та перевіряємо, чи наявний він в достатній кількості
    for(var i=0;i<orderObject.items.length;i++){
        runAfterAllItemsChecked.add();

        Item.findOne({_id:orderObject.items[i].item}, function (index,err,item) {
            if(err){
                res.status(500);
                res.send({success:false,reason:err.toString()});
            }else{
                //якщо достатньої кількості товарів нема - повертаємо
                //користувачу повідомлення про помилку
                if(item.quantity<orderObject.items[index].quantity){
                    res.status(500);
                    res.send({success:false,reason:"Item "+item.name+" is not available in desired quantity!"});
                }else{
                    processedItems[index]=item;
                    orderObject.items[index].price=item.price;
                    orderObject.totalPrice+=parseFloat(item.price);
                    runAfterAllItemsChecked.runAnotherOne.call(runAfterAllItemsChecked);
                }
            }
        }.bind(null,i));
    }
};

//запит на отримання замовлень за статусом
exports.getOrders= function (req,res) {
    //здійснюємо популяцію об’єкту замовлення інформацією з об’єктів користувача і
    //товару, отриманих за відповідними id з об’єкту замовлення
    //першим параметром функція populate приймає назву таблиці для пошуку відповідного об’єкту
    //другим - список полів, які треба помістити в фінальний об’єкт замовлення
    //якщо пропустити другий параметр, об’єкт з таблиці буде повністю вставлений в замовлення
    Order.find({status:req.params.status}).populate("customer", "firstName lastName").populate("items.item", "name").exec(function (err,orders) {
        if(err){
            res.status(503);
            res.send({success:false,reason:"Database error!"});
        }else{
            res.send(orders);
        }
    });
};

//отримання замовлення за id
exports.getOrder= function (req,res) {
    Order.find({_id:req.params.orderId}).populate("customer", "firstName lastName").populate("items.item","name description").exec(function (err,orders) {
        if(err || !orders.length){
            res.status(503);
            res.send({success:false,reason:"Database error or no such order!"});
        }else{
                res.send(orders);
        }
    });
};

//отримання замовлення за користувачем
exports.getUserOrders= function (req,res) {
        Order.find({customer:req.params.id}).populate("customer", "firstName lastName").populate("items.item", "name").exec(function (err,orders) {
            if(err){
                res.status(503);
                res.send({success:false,reason:"Database error!"});
            }else{
                res.send(orders);
            }
        });
};


//оновлення замовлення
exports.updateOrder= function (req,res) {
    var query = {"_id":req.body._id};
    var update = {status: req.body.status};
    var options = {new: true, runValidators:true};
    Order.findOneAndUpdate(query, update, options, function(err, order) {
        if (err) {
            res.status(400);
            return res.send({success:false,reason:err.toString()});
        } else{
            res.send(order);
        }
    });
};